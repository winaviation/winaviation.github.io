@echo off
git add .
git commit -m "commited via apply.bat"
git push origin main
timeout 3 /NOBREAK >NUL
exit /b