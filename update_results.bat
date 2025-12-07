@echo off
echo ==========================================
echo      USA SPEED SKATING TRACKER UPDATE
echo ==========================================
echo.
echo 1. Generating latest data from PDFs and ISU...
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
git commit -m "Update results via batch script"
git push

echo.
echo ==========================================
echo      ✅ DONE! SITE UPDATING NOW
echo ==========================================
echo.
echo The live site will be updated in about 1-2 minutes.
echo Press any key to close this window.
pause >nul
