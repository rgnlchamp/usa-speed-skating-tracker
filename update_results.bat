@echo off
echo ==========================================
echo      USA SPEED SKATING TRACKER UPDATE
echo      (with AI-powered PDF parsing)
echo ==========================================
echo.

REM Check for API key
if "%GEMINI_API_KEY%"=="" (
    echo.
    echo ⚠️  GEMINI_API_KEY not set!
    echo.
    echo To use AI parsing, set your API key:
    echo   set GEMINI_API_KEY=your_api_key_here
    echo.
    echo Continuing with standard parser...
    echo.
)

echo 1. Generating latest data from PDFs...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error generating data. Please check the logs above.
    echo Press any key to exit...
    pause >nul
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Data generated successfully!
echo.
echo 3. Pushing to GitHub/Vercel...
git add .
git commit -m "Update results with AI-parsed PDFs"
git push

echo.
echo ==========================================
echo      ✅ DONE! SITE UPDATING NOW
echo ==========================================
echo.
echo The live site will be updated in about 1-2 minutes.
echo Press any key to close this window.
pause >nul
