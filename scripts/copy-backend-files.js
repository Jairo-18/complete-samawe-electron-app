// scripts/copy-backend-files.js
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend-samawe');
const backendDistDir = path.join(backendDir, 'dist');

// Función para copiar recursivamente
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Asegurar que existe el directorio dist
if (!fs.existsSync(backendDistDir)) {
  console.error('Error: El directorio dist del backend no existe. Ejecuta npm run build en backend-samawe primero.');
  process.exit(1);
}

// Copiar typeorm.config.js a la raíz de dist si no está ahí
const typeormConfigSrc = path.join(backendDir, 'typeorm.config.ts');
const typeormConfigDist = path.join(backendDistDir, 'typeorm.config.js');

if (fs.existsSync(typeormConfigSrc) && !fs.existsSync(typeormConfigDist)) {
  console.log('Nota: typeorm.config.js no encontrado en dist. Asegúrate de que se compile correctamente.');
}

// Crear script de migración si no existe
const migrationScriptPath = path.join(backendDistDir, 'run-migrations.js');
if (!fs.existsSync(migrationScriptPath)) {
  const migrationScript = `
const { DataSource } = require('typeorm');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

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
  logging: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

dataSource.initialize()
  .then(() => {
    console.log('Conexión establecida con la base de datos');
    return dataSource.runMigrations();
  })
  .then((migrations) => {
    console.log(\`Migraciones ejecutadas: \${migrations.length}\`);
    migrations.forEach((migration) => {
      console.log(\`- \${migration.name}\`);
    });
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error ejecutando migraciones:', err);
    process.exit(1);
  });
`;

  fs.writeFileSync(migrationScriptPath, migrationScript);
  console.log('Script de migración creado en:', migrationScriptPath);
}

console.log('Archivos del backend preparados correctamente.');
