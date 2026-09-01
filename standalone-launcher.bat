@echo off
setlocal
cd /d "%~dp0"
set PORT=8973

where python >nul 2>nul
if %errorlevel% equ 0 goto :haspython

where py >nul 2>nul
if %errorlevel% equ 0 goto :haspy

where npx >nul 2>nul
if %errorlevel% equ 0 goto :hasnpx

echo Could not find Python or Node.js on this computer.
echo Install Python from python.org or Node.js from nodejs.org, then double-click this file again.
pause
exit /b 1

:haspython
start "Hearth Server - close this window to stop" /min cmd /c "python -m http.server %PORT%"
goto :openbrowser

:haspy
start "Hearth Server - close this window to stop" /min cmd /c "py -m http.server %PORT%"
goto :openbrowser

:hasnpx
start "Hearth Server - close this window to stop" /min cmd /c "npx --yes serve -l %PORT% ."
goto :openbrowser

:openbrowser
timeout /t 1 /nobreak >nul
start "" http://localhost:%PORT%/hearth-full.html
