@echo off
echo ==========================================
echo      LS ENABLER - System Verification
echo ==========================================
echo.

:: Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo [X] Git is not installed
    set MISSING_DEPS=1
) else (
    for /f "tokens=*" %%i in ('git --version') do echo [✓] Git: %%i
)

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python is not installed
    set MISSING_DEPS=1
) else (
    for /f "tokens=*" %%i in ('python --version') do echo [✓] Python: %%i
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js is not installed
    set MISSING_DEPS=1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [✓] Node.js: %%i
)

:: Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [X] npm is not installed
    set MISSING_DEPS=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo [✓] npm: v%%i
)

echo.
echo Checking project structure...
echo.

:: Check project structure
if exist "backend" (
    echo [✓] Backend directory exists
    
    if exist "backend\main.py" (
        echo [✓] Backend main.py found
    ) else (
        echo [X] Backend main.py not found
    )
    
    if exist "backend\requirements.txt" (
        echo [✓] Backend requirements.txt found
    ) else (
        echo [X] Backend requirements.txt not found
    )
    
    if exist "backend\venv" (
        echo [✓] Python virtual environment exists
    ) else (
        echo [!] Python virtual environment not found ^(run setup first^)
    )
) else (
    echo [X] Backend directory not found
)

if exist "frontend" (
    echo [✓] Frontend directory exists
    
    if exist "frontend\package.json" (
        echo [✓] Frontend package.json found
    ) else (
        echo [X] Frontend package.json not found
    )
    
    if exist "frontend\node_modules" (
        echo [✓] Node.js dependencies installed
    ) else (
        echo [!] Node.js dependencies not found ^(run setup first^)
    )
) else (
    echo [X] Frontend directory not found
)

echo.

:: Summary
if not defined MISSING_DEPS (
    echo ==========================================
    echo            System Ready! ✓
    echo ==========================================
    echo.
    echo You can now run the setup script:
    echo   .\setup-windows.bat
    echo.
) else (
    echo ==========================================
    echo        Missing Dependencies!
    echo ==========================================
    echo.
    echo Please install the missing dependencies and run this script again.
    echo.
)

pause