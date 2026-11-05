@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ================================================
echo       SpeechCare - Gemini API Key Setup
echo ================================================
echo.
echo Paste your NEW Gemini API key below.
echo It will be written to www\gemini-config.js
set /p "KEY=Gemini API key: "
if not defined KEY (
  echo ERROR: No key entered.
  pause
  exit /b 1
)

>"%TEMP%\speechcare_gemini_key.txt" echo(!KEY!
powershell -NoProfile -ExecutionPolicy Bypass -Command "$k=(Get-Content -Raw -LiteralPath ([Environment]::ExpandEnvironmentVariables('%TEMP%\speechcare_gemini_key.txt'))).Trim(); if($k.Length -lt 20){throw 'Key is too short.'}; if($k -match '\s'){throw 'Key contains whitespace.'}; $js='// SpeechCare Gemini configuration - PRIVATE PROTOTYPE`r`nwindow.SPEECHCARE_GEMINI_API_KEY="'+$k.Replace('"','\"')+'";`r`nwindow.SPEECHCARE_GEMINI_MODEL="gemini-2.5-flash";`r`n'; Set-Content -LiteralPath 'www\gemini-config.js' -Value $js -Encoding UTF8; Write-Host ('Saved. Key length: '+$k.Length+' characters. Key value was not printed.')"
if errorlevel 1 (
  del /q "%TEMP%\speechcare_gemini_key.txt" >nul 2>&1
  echo ERROR: Could not save/validate the key.
  pause
  exit /b 1
)
del /q "%TEMP%\speechcare_gemini_key.txt" >nul 2>&1
node scripts\validate-gemini.js
if errorlevel 1 (
  echo ERROR: Validation failed.
  pause
  exit /b 1
)
echo.
echo SUCCESS. Gemini key is configured.
echo Next: push this PRIVATE repository and run GitHub Actions ^> Build Android APK.
echo.
pause
