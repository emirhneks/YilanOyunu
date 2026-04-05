@echo off
cd /d "%~dp0"
echo Bagimliliklar kontrol ediliyor...
call npm install
if errorlevel 1 (
  echo.
  echo npm install sirasinda hata olustu.
  pause
  exit /b 1
)
echo.
echo Proje baslatiliyor...
call npm run start
if errorlevel 1 (
  echo.
  echo Proje baslatilirken hata olustu.
  pause
  exit /b 1
)
