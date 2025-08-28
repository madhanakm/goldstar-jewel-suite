@echo off
echo Updating vulnerable packages...

echo Installing updated packages...
npm install jspdf@3.0.2 vite@6.2.3 @eslint/js@9.15.0

echo Updating package-lock.json...
npm audit fix --force

echo Dependencies updated successfully!
echo Please restart your development server.
pause