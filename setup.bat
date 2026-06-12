@echo off
REM Flash Token System - Setup Script for Windows

echo 🚀 Flash Token System - Setup
echo ==============================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ %NODE_VERSION% found
echo.

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)
echo ✅ Root dependencies installed
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend dependencies installed
echo.

REM Compile contracts
echo 🔨 Compiling smart contracts...
call npm run compile
if %errorlevel% neq 0 (
    echo ❌ Failed to compile contracts
    pause
    exit /b 1
)
echo ✅ Contracts compiled
echo.

REM Create .env if doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✅ .env created (update with your keys)
)

if not exist frontend\.env (
    echo 📝 Creating frontend\.env file...
    (
        echo VITE_FLASH_TOKEN_ADDRESS=
    ) > frontend\.env
    echo ✅ frontend\.env created
)

echo.
echo ==============================
echo ✅ Setup Complete!
echo ==============================
echo.
echo Next steps:
echo 1. Start local network:    npm run dev:contracts
echo 2. Deploy contract:        npm run deploy:ethereum
echo 3. Start frontend:         npm run dev:frontend
echo.
echo See QUICKSTART.md for detailed instructions
echo.
pause
