@echo off
chcp 65001 >nul
echo ========================================
echo Iniciando Samawe DEVELOPMENT
echo ========================================
echo.

:: CONFIGURACION DEVELOPMENT
set DOCKER_PORT=5434
set DB_PORT=5434
set DB_CONTAINER=samawe-postgres-dev
set DB_VOLUME=samawe_data_dev
set DB_NAME=samawe_db_dev

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
    echo Creando nuevo contenedor PostgreSQL DEV...
    docker run --name %DB_CONTAINER% ^
      -e POSTGRES_USER=samawe ^
      -e POSTGRES_PASSWORD=samawe123 ^
      -e POSTGRES_DB=%DB_NAME% ^
      -p %DOCKER_PORT%:5432 ^
      -v %DB_VOLUME%:/var/lib/postgresql/data ^
      -d postgres:13 -c ssl=off
)

echo Esperando inicializacion de PostgreSQL (15 segundos)...
timeout /t 15 >nul

:: Verificar PostgreSQL
echo Verificando conexion a PostgreSQL DEV...
docker exec %DB_CONTAINER% psql -U samawe -d %DB_NAME% -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL DEV no responde.
    docker logs %DB_CONTAINER%
    pause
    exit /b 1
)
echo PostgreSQL DEV funcionando correctamente.

:: BACKEND DEV
echo.
echo Configurando backend DEV...
cd backend-samawe

if not exist "node_modules" (
    echo Instalando dependencias backend...
    call npm install
)

echo Ejecutando migraciones DEV...
call npm run migration:run

echo Iniciando backend DEV...
start "Backend Samawe DEV" cmd /k "npm run start:dev"

cd ..

:: FRONTEND DEV
echo.
echo Configurando frontend DEV...
cd frontend-samawe

if not exist "node_modules" (
    echo Instalando dependencias frontend...
    call npm install
)

echo Iniciando frontend DEV...
start "Frontend Samawe DEV" cmd /k "npm start"

cd ..

:: Final
echo.
echo ========================================
echo DEVELOPMENT INICIADO
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