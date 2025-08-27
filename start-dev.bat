@echo off
chcp 65001 >nul
echo ========================================
echo Iniciando Samawe DEVELOPMENT con Docker
echo ========================================
echo.

:: ==============================
:: CONFIGURACION DEVELOPMENT
:: ==============================
set DB_CONTAINER=samawe-postgres-dev
set DB_VOLUME=samawe_data_dev
set DB_NAME=samawe_db_dev
set DB_PORT=5434
set DB_USER=samawe
set DB_PASS=samawe123

:: ==============================
:: VERIFICAR DOCKER
:: ==============================
echo Verificando Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta funcionando.
    pause
    exit /b 1
)

:: ==============================
:: BASE DE DATOS
:: ==============================
echo Verificando contenedor %DB_CONTAINER%...
docker ps -a | findstr "%DB_CONTAINER%" >nul 2>&1
if %errorlevel% equ 0 (
    echo Contenedor DB existente encontrado.
    docker start %DB_CONTAINER% >nul
) else (
    echo Creando nuevo contenedor PostgreSQL DEV...
    docker run --name %DB_CONTAINER% ^
      -e POSTGRES_USER=%DB_USER% ^
      -e POSTGRES_PASSWORD=%DB_PASS% ^
      -e POSTGRES_DB=%DB_NAME% ^
      -p %DB_PORT%:5432 ^
      -v %DB_VOLUME%:/var/lib/postgresql/data ^
      -d postgres:13 -c ssl=off
)

:: Esperar hasta que PostgreSQL responda
echo Esperando a que PostgreSQL se inicie...
:WAIT_FOR_DB
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL aun no esta listo, esperando 5 segundos...
    timeout /t 5 >nul
    goto WAIT_FOR_DB
)
echo PostgreSQL DEV funcionando correctamente.
echo.

:: ==============================
:: BACKEND (en host)
:: ==============================
cd backend-samawe

if not exist "node_modules" (
    echo Instalando dependencias backend...
    call pnpm install
)

echo Iniciando backend DEV en nueva terminal...
start "Backend Samawe DEV" cmd /k "pnpm run migration:run && pnpm run start:dev"

cd ..
echo Backend levantado en http://localhost:3001
echo.

:: ==============================
:: FRONTEND (en host)
:: ==============================
cd frontend-samawe

if not exist "node_modules" (
    echo Instalando dependencias frontend...
    call npm install --legacy-peer-deps
)

echo Iniciando frontend DEV en nueva terminal...
start "Frontend Samawe DEV" cmd /k "ng s"

cd ..
echo Frontend levantado en http://localhost:4200
echo.

:: ==============================
:: FINAL
:: ==============================
echo ========================================
echo DEVELOPMENT INICIADO
echo ========================================
echo PostgreSQL: localhost:%DB_PORT%
echo Backend:   http://localhost:3001
echo Frontend:  http://localhost:4200
echo ========================================
echo.
timeout /t 3 >nul
start http://localhost:4200
pause
