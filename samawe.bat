@echo off
chcp 65001 >nul
echo ========================================
echo Iniciando Samawe PRODUCTION con PostgreSQL Local
echo ========================================
echo.

:: ==============================
:: CONFIGURACION PRODUCTION
:: ==============================
set DB_NAME=samawe_db_prod
set DB_PORT=5432
set DB_USER=samawe
set DB_PASS=samawe123
set DB_HOST=localhost

:: ==============================
:: VERIFICAR POSTGRESQL LOCAL
:: ==============================
echo Verificando PostgreSQL local...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL no esta instalado o no esta en PATH.
    echo Instala PostgreSQL desde: https://www.postgresql.org/download/
    pause
    exit /b 1
)

:: Verificar si el servicio esta corriendo
sc query postgresql-x64-13 | findstr "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo Intentando iniciar servicio PostgreSQL...
    net start postgresql-x64-13 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: No se pudo iniciar PostgreSQL. Verifica el servicio manualmente.
        pause
        exit /b 1
    )
)

:: ==============================
:: CONFIGURAR BASE DE DATOS
:: ==============================
echo Configurando base de datos PROD...

:: Crear usuario si no existe (usando usuario postgres por defecto)
echo Creando usuario %DB_USER%...
psql -U postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASS%';" 2>nul
psql -U postgres -c "ALTER USER %DB_USER% CREATEDB;" 2>nul

:: Crear base de datos si no existe
echo Creando base de datos %DB_NAME%...
psql -U postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;" 2>nul

echo PostgreSQL PROD configurado correctamente.
echo.

:: ==============================
:: ACTUALIZAR CODIGO DESDE GIT
:: ==============================
echo Actualizando codigo desde GitHub...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No es un repositorio Git o Git no esta instalado.
    pause
    exit /b 1
)

echo Cambiando a branch main...
git checkout main
if %errorlevel% neq 0 (
    echo ERROR: No se pudo cambiar a branch main.
    pause
    exit /b 1
)

echo Descargando ultimos cambios...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron descargar los cambios de main.
    pause
    exit /b 1
)

echo Codigo actualizado correctamente.
echo.

:: ==============================
:: BACKEND (en host)
:: ==============================
cd backend-samawe

if not exist "node_modules" (
    echo Instalando dependencias backend...
    call pnpm install
)

:: Configurar variables de entorno para PostgreSQL local
echo Configurando variables de entorno para DB local...
set DATABASE_HOST=%DB_HOST%
set DATABASE_PORT=%DB_PORT%
set DATABASE_USERNAME=%DB_USER%
set DATABASE_PASSWORD=%DB_PASS%
set DATABASE_NAME=%DB_NAME%

echo Iniciando backend PROD en nueva terminal...
start "Backend Samawe PROD" cmd /k "set DATABASE_HOST=%DB_HOST% && set DATABASE_PORT=%DB_PORT% && set DATABASE_USERNAME=%DB_USER% && set DATABASE_PASSWORD=%DB_PASS% && set DATABASE_NAME=%DB_NAME% && pnpm run build && pnpm run migration:run:prod && pnpm run start:prod"

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

echo Iniciando frontend PROD en nueva terminal...
start "Frontend Samawe PROD" cmd /k "ng s"

cd ..
echo Frontend levantado en http://localhost:4200
echo.

:: ==============================
:: FINAL
:: ==============================
echo ========================================
echo PRODUCTION INICIADO
echo ========================================
echo PostgreSQL: %DB_HOST%:%DB_PORT%
echo Database:  %DB_NAME%
echo Backend:   http://localhost:3001
echo Frontend:  http://localhost:4200
echo ========================================
echo.
echo NOTA: Asegurate de tener un archivo .env en backend-samawe
echo con la configuracion de la base de datos local.
echo.
timeout /t 3 >nul
start http://localhost:4200
pause