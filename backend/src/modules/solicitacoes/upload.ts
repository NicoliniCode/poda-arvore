import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import multer from 'multer';
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { env } from '../../config/env';

const tempDir = path.join(env.uploadDir, 'tmp');

fs.mkdirSync(tempDir, { recursive: true });

const sanitizeFilename = (filename: string): string =>
  filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, tempDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitizeFilename(base) || 'arquivo';
    const random = Math.round(Math.random() * 1e9);

    callback(null, `${Date.now()}-${random}-${safeBase}${ext.toLowerCase()}`);
  }
});

export const uploadSolicitacaoAnexos = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeBytes,
    files: 8
  }
}).array('anexos', 8);

const classifyFile = (file: Express.Multer.File): 'FOTO' | 'DOCUMENTO' | 'OUTRO' => {
  if (file.mimetype.startsWith('image/')) {
    return 'FOTO';
  }

  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.includes('word') ||
    file.mimetype.includes('document')
  ) {
    return 'DOCUMENTO';
  }

  return 'OUTRO';
};

export const persistSolicitacaoFiles = async (
  connection: PoolConnection,
  idSolicitacao: number,
  files: Express.Multer.File[]
): Promise<void> => {
  if (files.length === 0) {
    return;
  }

  const targetDir = path.join(env.uploadDir, String(idSolicitacao));
  await fsp.mkdir(targetDir, { recursive: true });

  for (const file of files) {
    const targetPath = path.join(targetDir, file.filename);
    await fsp.rename(file.path, targetPath);

    await connection.execute<ResultSetHeader>(
      `INSERT INTO solicitacao_anexo
              (id_solicitacao, tipo, nome_arquivo, caminho_arquivo)
       VALUES (?, ?, ?, ?)`,
      [
        idSolicitacao,
        classifyFile(file),
        sanitizeFilename(file.originalname) || file.filename,
        `/uploads/${idSolicitacao}/${file.filename}`
      ]
    );
  }
};

export const cleanupUploadedTempFiles = async (files: Express.Multer.File[]): Promise<void> => {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fsp.unlink(file.path);
      } catch {
        // File may already have been moved into its final request folder.
      }
    })
  );
};
