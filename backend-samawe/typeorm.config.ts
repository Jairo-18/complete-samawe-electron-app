import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Cargar variables de entorno según el NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

config({ path: envFile });

console.log(`🔧 Cargando configuración desde: ${envFile}`);
console.log(
  `📊 Base de datos: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
);

// Configuración SSL
const sslEnabled = process.env.DB_SSL === 'true';

const dataSourceConfig: any = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [`${__dirname}/src/**/*.entity.{ts,js}`],
  migrations: [`${__dirname}/src/migrations/*.{ts,js}`],
  synchronize: false, // Siempre false en producción
  logging: process.env.NODE_ENV === 'development', // Solo logs en desarrollo
  extra: {
    max: 10, // Máximo de conexiones
    keepAlive: true,
  },
};

// Configurar SSL solo si está habilitado
if (sslEnabled) {
  dataSourceConfig.ssl = {
    rejectUnauthorized: false, // Para Neon y otros servicios cloud
  };
  console.log('🔒 SSL habilitado');
} else {
  console.log('🔓 SSL deshabilitado (conexión local)');
}

export default new DataSource(dataSourceConfig);
