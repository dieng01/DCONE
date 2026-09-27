@echo off
REM Script để copy code mới nhất vào project local
REM Chạy script này trên Windows

echo ========================================
echo  Update Code - Market Monitor Dashboard
echo ========================================
echo.

REM Kiểm tra xem có đang trong thư mục project không
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [1/6] Backing up current files...
if not exist "backup_%date:~-4%%date:~3,2%%date:~0,2%" mkdir "backup_%date:~-4%%date:~3,2%%date:~0,2%"
if exist "src" xcopy /E /I /Y "src" "backup_%date:~-4%%date:~3,2%%date:~0,2%\src" >nul 2>&1
if exist "package.json" copy "package.json" "backup_%date:~-4%%date:~3,2%%date:~0,2%\" >nul 2>&1
if exist "Dockerfile" copy "Dockerfile" "backup_%date:~-4%%date:~3,2%%date:~0,2%\" >nul 2>&1
if exist "docker-compose.yml" copy "docker-compose.yml" "backup_%date:~-4%%date:~3,2%%date:~0,2%\" >nul 2>&1
echo Backup created in: backup_%date:~-4%%date:~3,2%%date:~0,2%
echo.

echo [2/6] Cleaning old files...
if exist "node_modules" rmdir /S /Q "node_modules"
if exist "package-lock.json" del /F /Q "package-lock.json"
if exist "dist" rmdir /S /Q "dist"
echo.

echo [3/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [4/6] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [5/6] Building Docker images...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo WARNING: Docker build failed, but frontend build succeeded.
    echo You can still run the frontend with: npm run preview
) else (
    echo Docker images built successfully.
)
echo.

echo [6/6] Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo WARNING: Docker services failed to start.
    echo You can still run the frontend with: npm run dev
) else (
    echo Services started successfully.
)
echo.

echo ========================================
echo  Update Complete!
echo ========================================
echo.
echo  Access URLs:
echo  - Frontend: http://localhost:3000
echo  - REST API: http://localhost:8080
echo  - MQTT WS:  ws://localhost:8884/mqtt
echo.
echo  Backup saved in: backup_%date:~-4%%date:~3,2%%date:~0,2%
echo.
echo  To view logs: docker-compose logs -f
echo  To stop:      docker-compose down
echo.

pause
