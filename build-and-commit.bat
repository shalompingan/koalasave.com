@echo off
REM Double-click this file to rebuild dist/ from your source files.
REM It does NOT commit, push, or deploy anything by itself.
cd /d "%~dp0"
echo Running build.js...
node build.js
echo.
echo Done. dist/ is now in sync with your source files.
echo Go review your changes and commit/push/deploy as usual.
pause
