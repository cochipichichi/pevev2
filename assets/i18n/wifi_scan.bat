@echo off
:loop
cls
echo Escaneando redes WiFi disponibles...
netsh wlan show networks
timeout /t 5 >nul
goto loop
