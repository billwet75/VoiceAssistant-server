@echo off
setlocal
cd /d "%~dp0"

set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB%" (
  echo Не найден Android Debug Bridge: %ADB%
  pause
  exit /b 1
)

"%ADB%" start-server >nul
"%ADB%" reverse tcp:8787 tcp:8787
if errorlevel 1 (
  echo Подключите телефон по USB и разрешите отладку.
  pause
  exit /b 1
)

start "VoiceAssistant server" /min node server.mjs
echo VoiceAssistant готов. Можно вызвать помощника на телефоне.
timeout /t 3 >nul

