use std::fs;

fn main() {
    // Bake the desktop OAuth client ID/secret into the binary at compile
    // time (read from src-tauri/.env if present) so the built exe doesn't
    // need a companion .env file to run — required for handing a single
    // portable exe to someone else.
    if let Ok(contents) = fs::read_to_string(".env") {
        for line in contents.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((key, value)) = line.split_once('=') {
                println!("cargo:rustc-env={}={}", key.trim(), value.trim());
            }
        }
    }
    println!("cargo:rerun-if-changed=.env");

    tauri_build::build()
}
