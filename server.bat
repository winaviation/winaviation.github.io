@echo off
cd /d "%~dp0"
cd ..
start py -m http.server 1337 --bind 192.168.1.45
start py -m http.server 1337
cd winaviation