use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use rand::{distributions::Alphanumeric, Rng, RngCore};
use sha2::{Digest, Sha256};
use tauri_plugin_opener::OpenerExt;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct GoogleTokens {
    id_token: String,
    access_token: String,
}

#[derive(serde::Deserialize)]
struct TokenResponse {
    id_token: String,
    access_token: String,
}

fn generate_code_verifier() -> String {
    let mut bytes = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

fn code_challenge_s256(verifier: &str) -> String {
    let hash = Sha256::digest(verifier.as_bytes());
    URL_SAFE_NO_PAD.encode(hash)
}

fn generate_state() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(24)
        .map(char::from)
        .collect()
}

// Waits for exactly one loopback HTTP request (Google's OAuth redirect),
// answers it with a plain "you can close this tab" page, and returns the
// authorization code + state it carried.
async fn accept_callback(listener: TcpListener) -> Result<(String, String), String> {
    let (mut socket, _) = listener.accept().await.map_err(|e| e.to_string())?;
    let mut buf = vec![0u8; 8192];
    let n = socket.read(&mut buf).await.map_err(|e| e.to_string())?;
    let request = String::from_utf8_lossy(&buf[..n]);

    let first_line = request.lines().next().ok_or("Empty request from browser.")?;
    let path = first_line
        .split_whitespace()
        .nth(1)
        .ok_or("Malformed request from browser.")?;
    let query = path.splitn(2, '?').nth(1).unwrap_or("");
    let params: std::collections::HashMap<String, String> =
        url::form_urlencoded::parse(query.as_bytes()).into_owned().collect();

    let ok = params.contains_key("code");
    let body = if ok {
        "<html><body style=\"font-family:sans-serif;text-align:center;padding-top:80px;\"><h2>Signed in to Hearth</h2><p>You can close this tab and return to the app.</p></body></html>"
    } else {
        "<html><body style=\"font-family:sans-serif;text-align:center;padding-top:80px;\"><h2>Sign-in didn't complete</h2><p>You can close this tab and try again in the app.</p></body></html>"
    };
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        body.len(),
        body
    );
    let _ = socket.write_all(response.as_bytes()).await;

    let code = params
        .get("code")
        .cloned()
        .ok_or_else(|| params.get("error").cloned().unwrap_or_else(|| "No code returned by Google.".to_string()))?;
    let state = params.get("state").cloned().unwrap_or_default();
    Ok((code, state))
}

#[tauri::command]
async fn google_sign_in(app: tauri::AppHandle) -> Result<GoogleTokens, String> {
    // Baked in at compile time by build.rs from src-tauri/.env — not read
    // at runtime, so the built exe needs no companion file to run.
    let client_id = option_env!("GOOGLE_DESKTOP_CLIENT_ID")
        .filter(|s| !s.is_empty())
        .ok_or("Google sign-in isn't configured for the desktop app — add GOOGLE_DESKTOP_CLIENT_ID to src-tauri/.env and rebuild.")?
        .to_string();
    let client_secret = option_env!("GOOGLE_DESKTOP_CLIENT_SECRET").filter(|s| !s.is_empty());

    let verifier = generate_code_verifier();
    let challenge = code_challenge_s256(&verifier);
    let state = generate_state();

    let listener = TcpListener::bind("127.0.0.1:0").await.map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    let redirect_uri = format!("http://127.0.0.1:{port}/callback");

    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope={}&code_challenge={}&code_challenge_method=S256&state={}&prompt=select_account",
        urlencoding_encode(&client_id),
        urlencoding_encode(&redirect_uri),
        urlencoding_encode("openid email profile"),
        urlencoding_encode(&challenge),
        urlencoding_encode(&state),
    );

    app.opener()
        .open_url(auth_url, None::<&str>)
        .map_err(|e| format!("Couldn't open your browser: {e}"))?;

    let (code, returned_state) = tokio::time::timeout(std::time::Duration::from_secs(300), accept_callback(listener))
        .await
        .map_err(|_| "Sign-in timed out — try again.".to_string())??;

    if returned_state != state {
        return Err("Sign-in response didn't match this request — aborting for safety.".to_string());
    }

    let client = reqwest::Client::new();
    let mut params = vec![
        ("client_id", client_id.as_str()),
        ("code", code.as_str()),
        ("code_verifier", verifier.as_str()),
        ("grant_type", "authorization_code"),
        ("redirect_uri", redirect_uri.as_str()),
    ];
    if let Some(secret) = client_secret {
        params.push(("client_secret", secret));
    }

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(format!("Google rejected the sign-in: {body}"));
    }

    let tokens: TokenResponse = resp.json().await.map_err(|e| e.to_string())?;
    Ok(GoogleTokens {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
    })
}

fn urlencoding_encode(s: &str) -> String {
    url::form_urlencoded::byte_serialize(s.as_bytes()).collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![google_sign_in])
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
