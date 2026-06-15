import type { ErrorRequestHandler, RequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/http';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Rota nao encontrada.' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Dados invalidos.',
      details: error.issues
    });
    return;
  }

  if (error instanceof MulterError) {
    res.status(400).json({
      message: 'Falha no upload do arquivo.',
      details: error.message
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
};
