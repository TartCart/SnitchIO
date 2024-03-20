@echo off
sc stop snitchIO
timeout /t 3
sc delete snitchIO