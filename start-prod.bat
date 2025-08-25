@echo off
chcp 65001 >nul
echo ========================================
echo Iniciando Samawe PRODUCTION
echo ========================================
echo.

:: CONFIGURACION PRODUCTION
set DOCKER_PORT=5451
set DB_PORT=5451
set DB_CONTAINER=samawe-postgres-prod
set DB_VOLUME=samawe_data_prod
set DB_NAME=samawe_db_prod

:: Verificar Docker
echo Verificando Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta funcionando.
    pause
    exit /b 1
)

:: Gestionar contenedor PostgreSQL
echo Verificando contenedor %DB_CONTAINER%...
docker ps -a | findstr "%DB_CONTAINER%" >nul 2>&1
if %errorlevel% equ 0 (
    echo Contenedor existente encontrado.
    docker ps | findstr "%DB_CONTAINER%" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Iniciando contenedor existente...
        docker start %DB_CONTAINER%
    ) else (
        echo Contenedor ya esta ejecutandose.
    )
) else (
    echo Creando nuevo contenedor PostgreSQL PROD...
    docker run --name %DB_CONTAINER% ^
      -e POSTGRES_USER=samawe ^
      -e POSTGRES_PASSWORD=samawe123 ^
      -e POSTGRES_DB=%DB_NAME% ^
      -p %DOCKER_PORT%:5432 ^
      -v %DB_VOLUME%:/var/lib/postgresql/data ^
      -d postgres:13 -c ssl=off
)

echo Esperando inicializacion de PostgreSQL (20 segundos)...
timeout /t 20 >nul

:: Verificar PostgreSQL
echo Verificando conexion a PostgreSQL PROD...
docker exec %DB_CONTAINER% psql -U samawe -d %DB_NAME% -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL PROD no responde.
    docker logs %DB_CONTAINER%
    pause
    exit /b 1
)
echo PostgreSQL PROD funcionando correctamente.

:: BACKEND PROD
echo.
echo Configurando backend PROD...
cd backend-samawe

if not exist "node_modules" (
    echo Instalando dependencias backend...
    call npm install
)

echo Compilando backend para produccion...
call npm run build

echo Ejecutando migraciones PROD...
call npm run migration:run:prod
if %errorlevel% neq 0 (
    echo ADVERTENCIA: Las migraciones pueden ya estar ejecutadas
)

echo Iniciando backend PROD...
start "Backend Samawe PROD" cmd /k "npm run start:prod"

cd ..

:: FRONTEND PROD
echo.
echo Configurando frontend PROD...
cd frontend-samawe

if not exist "node_modules" (
    echo Instalando dependencias frontend...
    call npm install
)

echo Iniciando frontend PROD...
start "Frontend Samawe PROD" cmd /k "npm start"

cd ..

:: Final
echo.
echo ========================================
echo PRODUCTION INICIADO
echo ========================================
echo PostgreSQL: localhost:%DB_PORT%
echo Backend: http://localhost:3001
echo Frontend: http://localhost:4200
echo ========================================
echo.
timeout /t 3 >nul
start http://localhost:4200
echo Presiona cualquier tecla para salir...
pause