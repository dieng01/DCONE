@echo off
REM Script để fix Docker port conflict trên Windows
REM Chạy script này khi gặp lỗi "ports are not available"

echo ========================================
echo  Fix Docker Port Conflict on Windows
echo ========================================
echo.

REM 1. Dừng containers cũ
echo [1/5] Stopping old containers...
docker-compose down 2>nul
if %errorlevel% neq 0 (
    echo Warning: docker-compose down failed, continuing...
)
echo.

REM 2. Reset Windows NAT
echo [2/5] Resetting Windows NAT service...
echo This requires Administrator privileges.
net stop winnat 2>nul
if %errorlevel% neq 0 (
    echo Warning: Could not stop winnat. Try running as Administrator.
) else (
    timeout /t 2 /nobreak >nul
    net start winnat 2>nul
    if %errorlevel% neq 0 (
        echo Warning: Could not start winnat.
    ) else (
        echo WinNAT service reset successfully.
    )
)
echo.

REM 3. Kiểm tra port availability
echo [3/5] Checking port availability...
echo.
echo Checking port 1884 (MQTT TCP)...
netstat -ano | findstr :1884 >nul
if %errorlevel% equ 0 (
    echo   WARNING: Port 1884 is already in use!
    echo   Please change the port in docker-compose.yml
) else (
    echo   OK: Port 1884 is available
)

echo Checking port 8884 (MQTT WebSocket)...
netstat -ano | findstr :8884 >nul
if %errorlevel% equ 0 (
    echo   WARNING: Port 8884 is already in use!
    echo   Please change the port in docker-compose.yml
) else (
    echo   OK: Port 8884 is available
)

echo Checking port 3000 (Frontend)...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo   WARNING: Port 3000 is already in use!
    echo   Please change the port in docker-compose.yml
) else (
    echo   OK: Port 3000 is available
)

echo Checking port 8080 (REST API)...
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo   WARNING: Port 8080 is already in use!
    echo   Please change the port in docker-compose.yml
) else (
    echo   OK: Port 8080 is available
)
echo.

REM 4. Build Docker images
echo [4/5] Building Docker images (this may take a few minutes)...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Docker build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo.

REM 5. Start services
echo [5/5] Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not start services!
    echo Please check docker-compose logs.
    pause
    exit /b 1
)
echo.

REM 6. Show status
echo ========================================
echo  Services Status
echo ========================================
docker-compose ps
echo.

echo ========================================
echo  Access URLs
echo ========================================
echo.
echo  Frontend Dashboard:  http://localhost:3000
echo  REST API:            http://localhost:8080
echo  MQTT TCP:            localhost:1884
echo  MQTT WebSocket:      ws://localhost:8884/mqtt
echo  MongoDB:             localhost:27017
echo.
echo ========================================
echo  Done! Open http://localhost:3000 in your browser
echo ========================================
echo.

pause
