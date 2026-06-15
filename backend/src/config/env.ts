import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const developmentCorsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const toList = (value: string | undefined): string[] =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV || 'development';
const configuredCorsOrigins = toList(process.env.CORS_ORIGIN);
const corsOrigins =
  nodeEnv === 'development'
    ? Array.from(new Set([...configuredCorsOrigins, ...developmentCorsOrigins]))
    : configuredCorsOrigins;

export const env = {
  nodeEnv,
  port: toNumber(process.env.PORT, 3000),
  corsOrigins: corsOrigins.length > 0 ? corsOrigins : developmentCorsOrigins,
  jwtSecret: process.env.JWT_SECRET || 'chave_secreta_dev',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),
  maxFileSizeBytes: toNumber(process.env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 3308),
    user: process.env.DB_USER || 'poda_user',
    password: process.env.DB_PASSWORD || 'poda_pass',
    database: process.env.DB_NAME || 'poda_arvores'
  }
};
