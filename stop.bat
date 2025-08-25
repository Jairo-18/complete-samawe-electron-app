@echo off
chcp 65001 >nul
echo ========================================
echo Deteniendo contenedores Samawe
echo ========================================
echo.

echo Deteniendo contenedores...
docker stop samawe-postgres-dev 2>nul
docker stop samawe-postgres-prod 2>nul

echo Contenedores detenidos.
pause