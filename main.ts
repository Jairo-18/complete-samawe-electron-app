import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import * as path from 'path';
import { app, BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as http from 'http';

// Variables globales
let mainWindow: InstanceType<typeof BrowserWindow> | null = null;
let backendProcess: any = null;
let backendPort: number = 3001;

// Simular __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../assets/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    autoHideMenuBar: true,
  });

  const angularPath = path.join(__dirname, '../frontend-samawe/dist/frontend-samawe/browser/index.html');

  mainWindow.loadFile(angularPath).catch((err) => console.error('Error cargando frontend:', err));

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ----------------------------
// Health check del backend
// ----------------------------
function checkBackendHealth(port: number = backendPort, timeout: number = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const options = { hostname: 'localhost', port, path: '/health', method: 'GET', timeout };
    const req = http.request(options, (res) => resolve(res.statusCode === 200));
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// ----------------------------
// Esperar logs del backend
// ----------------------------
function waitForBackendByLogs(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!backendProcess) return resolve(false);

    const timeout = setTimeout(() => resolve(false), 30000);

    const checkLog = (data: Buffer) => {
      const logMessage = data.toString();
      console.log('[Backend]', logMessage);
      if (logMessage.includes('Application is running on') || logMessage.includes('Nest application successfully started') || logMessage.includes('server started on') || logMessage.includes('App corriendo en el puerto')) {
        clearTimeout(timeout);
        backendProcess.stdout?.off('data', checkLog);
        backendProcess.stderr?.off('data', checkLog);
        resolve(true);
      }
    };

    backendProcess.stdout?.on('data', checkLog);
    backendProcess.stderr?.on('data', checkLog);
  });
}

// ----------------------------
// Copiar archivos de configuración
// ----------------------------
function copyConfigFiles(): void {
  if (app.isPackaged) {
    try {
      const resourcePath = process.resourcesPath;
      const backendResourcePath = path.join(resourcePath, 'backend-samawe');

      // Copiar archivos .env
      const envFiles = ['.env.production', '.env.development'];
      const sourceBasePath = path.join(__dirname, '../backend-samawe');

      for (const envFile of envFiles) {
        const sourcePath = path.join(sourceBasePath, envFile);
        const destPath = path.join(backendResourcePath, envFile);

        if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copiado ${envFile} a recursos`);
        }
      }

      // Copiar typeorm.config.js si existe
      const typeormSource = path.join(sourceBasePath, 'dist/typeorm.config.js');
      const typeormDest = path.join(backendResourcePath, 'typeorm.config.js');

      if (fs.existsSync(typeormSource) && !fs.existsSync(typeormDest)) {
        fs.copyFileSync(typeormSource, typeormDest);
        console.log('Copiado typeorm.config.js a recursos');
      }
    } catch (err) {
      console.error('Error copiando archivos de configuración:', err);
    }
  }
}

// ----------------------------
// Ejecutar migraciones
// ----------------------------
async function runMigrations(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const isPackaged = app.isPackaged;
      const backendDir = isPackaged ? path.join(process.resourcesPath, 'backend-samawe') : path.join(__dirname, '../backend-samawe');

      // Cargar variables de entorno
      const envFileName = isPackaged ? '.env.production' : '.env.development';
      const envPath = path.join(backendDir, envFileName);

      let envVars: Record<string, string> = { ...process.env } as Record<string, string>;
      if (fs.existsSync(envPath)) {
        envVars = { ...envVars, ...dotenv.parse(fs.readFileSync(envPath)) };
      }

      console.log('Ejecutando migraciones desde:', backendDir);
      console.log('Base de datos:', envVars.DB_DATABASE);

      // En producción, ejecutar directamente el typeorm CLI
      if (isPackaged) {
        const nodeExePath = process.execPath;
        const typeormCliPath = path.join(backendDir, 'node_modules/typeorm/cli.js');
        const configPath = path.join(backendDir, 'typeorm.config.js');

        // Verificar que existan los archivos necesarios
        if (!fs.existsSync(typeormCliPath)) {
          console.error('No se encontró typeorm CLI en:', typeormCliPath);
          // Intentar con ruta alternativa
          const altCliPath = path.join(backendDir, 'node_modules/.bin/typeorm');
          if (fs.existsSync(altCliPath)) {
            console.log('Usando ruta alternativa de typeorm');
          }
        }

        const migrationEnv = {
          ...envVars,
          NODE_ENV: 'production',
          DB_HOST: String(envVars.DB_HOST || 'localhost'),
          DB_PORT: String(envVars.DB_PORT || '5432'),
          DB_USERNAME: String(envVars.DB_USERNAME || 'samawe'),
          DB_PASSWORD: String(envVars.DB_PASSWORD || 'samawe123'),
          DB_DATABASE: String(envVars.DB_DATABASE || 'samawe_db_prod'),
        };

        // Usar el ejecutable de backend con comando de migración
        const backendExe = path.join(backendDir, 'backend.exe');
        const migrate = spawn(backendExe, ['--migrations'], {
          cwd: backendDir,
          env: migrationEnv,
          stdio: 'inherit',
        });

        migrate.on('exit', (code) => {
          if (code === 0) {
            console.log('Migraciones ejecutadas exitosamente');
            resolve(true);
          } else {
            console.error('Error en migraciones, código:', code);
            resolve(false);
          }
        });

        migrate.on('error', (err) => {
          console.error('Error ejecutando migraciones:', err);
          // Intentar método alternativo
          runMigrationsAlternative(backendDir, migrationEnv).then(resolve);
        });
      } else {
        // En desarrollo, usar npm
        const migrate = spawn('npm', ['run', 'migration:run'], {
          cwd: backendDir,
          shell: true,
          stdio: 'inherit',
          env: envVars,
        });

        migrate.on('exit', (code) => {
          resolve(code === 0);
        });

        migrate.on('error', (err) => {
          console.error('Error en migraciones desarrollo:', err);
          resolve(false);
        });
      }
    } catch (err) {
      console.error('Error general en migraciones:', err);
      resolve(false);
    }
  });
}

// Método alternativo para ejecutar migraciones
async function runMigrationsAlternative(backendDir: string, envVars: Record<string, string>): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Intentar ejecutar con node directamente
      const nodeExe = process.execPath;
      const typeormScript = path.join(backendDir, 'dist/run-migrations.js');

      // Crear un script temporal para ejecutar migraciones si no existe
      if (!fs.existsSync(typeormScript)) {
        const migrationScript = `
const { DataSource } = require('typeorm');
const path = require('path');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'samawe',
  password: process.env.DB_PASSWORD || 'samawe123',
  database: process.env.DB_DATABASE || 'samawe_db_prod',
  entities: [path.join(__dirname, 'entities/**/*.js')],
  migrations: [path.join(__dirname, 'migrations/*.js')],
  synchronize: false,
  logging: true
});

dataSource.initialize()
  .then(() => {
    console.log('Conexión establecida');
    return dataSource.runMigrations();
  })
  .then((migrations) => {
    console.log('Migraciones ejecutadas:', migrations.length);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
`;
        fs.writeFileSync(typeormScript, migrationScript);
      }

      const migrate = spawn(nodeExe, [typeormScript], {
        cwd: backendDir,
        env: envVars,
        stdio: 'inherit',
      });

      migrate.on('exit', (code) => {
        resolve(code === 0);
      });

      migrate.on('error', () => {
        resolve(false);
      });
    } catch (err) {
      console.error('Error en método alternativo:', err);
      resolve(false);
    }
  });
}

// ----------------------------
// Iniciar backend
// ----------------------------
function startBackend(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const backendPath = app.isPackaged ? path.join(process.resourcesPath, 'backend-samawe', 'backend.exe') : path.join(__dirname, '../backend-samawe/dist/src/main.js');

      const backendCwd = app.isPackaged ? path.join(process.resourcesPath, 'backend-samawe') : path.join(__dirname, '../backend-samawe');

      const envFileName = app.isPackaged ? '.env.production' : '.env.development';
      const envPath = path.join(backendCwd, envFileName);

      let envVars: Record<string, string> = { ...process.env } as Record<string, string>;
      if (fs.existsSync(envPath)) {
        envVars = { ...envVars, ...dotenv.parse(fs.readFileSync(envPath)) };
      }

      const backendEnv = {
        ...envVars,
        NODE_ENV: app.isPackaged ? 'production' : 'development',
        APP_PORT: String(envVars.APP_PORT || '3001'),
        DB_HOST: String(envVars.DB_HOST || 'localhost'),
        DB_PORT: String(envVars.DB_PORT || '5432'),
        DB_USERNAME: String(envVars.DB_USERNAME || 'samawe'),
        DB_PASSWORD: String(envVars.DB_PASSWORD || 'samawe123'),
        DB_DATABASE: String(envVars.DB_DATABASE || 'samawe_db_prod'),
      };

      backendPort = parseInt(backendEnv.APP_PORT) || 3001;

      console.log('Iniciando backend con configuración:');
      console.log('- Ruta:', backendPath);
      console.log('- Base de datos:', backendEnv.DB_DATABASE);
      console.log('- Puerto:', backendPort);

      const nodeExec = app.isPackaged ? backendPath : 'node';
      const args = app.isPackaged ? [] : [backendPath];

      backendProcess = spawn(nodeExec, args, {
        cwd: backendCwd,
        env: backendEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
        detached: false,
      });

      backendProcess.stdout.on('data', (data: any) => console.log('[Backend]', data.toString()));
      backendProcess.stderr.on('data', (data: any) => console.error('[Backend Error]', data.toString()));

      backendProcess.on('exit', (code: any) => {
        console.error('Backend exited with code:', code);
        resolve(false);
      });

      backendProcess.on('error', (err: any) => {
        console.error('Backend error:', err);
        resolve(false);
      });

      waitForBackendByLogs().then(resolve);
    } catch (err) {
      console.error('Error iniciando backend:', err);
      resolve(false);
    }
  });
}

// ----------------------------
// Inicializar app
// ----------------------------
async function initializeApp(): Promise<void> {
  // Copiar archivos de configuración si es necesario
  copyConfigFiles();

  // Ejecutar migraciones
  console.log('Ejecutando migraciones...');
  const migrationsOk = await runMigrations();

  if (!migrationsOk) {
    console.error('Advertencia: Las migraciones no se ejecutaron correctamente');
    // Mostrar diálogo de error pero continuar
    if (app.isPackaged) {
      dialog.showMessageBoxSync({
        type: 'warning',
        title: 'Advertencia de Base de Datos',
        message: 'No se pudieron ejecutar las migraciones de la base de datos. La aplicación podría no funcionar correctamente.',
        buttons: ['Continuar'],
      });
    }
  }

  // Esperar un poco después de las migraciones
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Iniciar backend
  console.log('Iniciando backend...');
  const backendReady = await startBackend();

  if (!backendReady) {
    console.error('El backend no inició correctamente');
    dialog.showErrorBox('Error', 'No se pudo iniciar el servidor. Por favor, verifica la configuración.');
    app.quit();
    return;
  }

  // Esperar y verificar salud del backend
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const healthOk = await checkBackendHealth();
  console.log('Backend health check:', healthOk);

  // Crear ventana principal
  createWindow();
}

// ----------------------------
// Eventos de la app
// ----------------------------
app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
