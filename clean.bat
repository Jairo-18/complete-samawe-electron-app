@echo off
chcp 65001 >nul
echo ========================================
echo Limpiando contenedores y volúmenes Samawe
echo ========================================
echo.

echo Deteniendo y eliminando contenedores...
docker stop samawe-postgres-dev 2>nul
docker stop samawe-postgres-prod 2>nul
docker rm samawe-postgres-dev 2>nul
docker rm samawe-postgres-prod 2>nul

echo Eliminando volúmenes...
docker volume rm samawe_data_dev 2>nul
docker volume rm samawe_data_prod 2>nul

echo Limpieza completada.
pause