import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findAuthUserById } from '../modules/auth/auth.repository';
import type { PerfilNome } from '../types/auth';
import { AppError } from '../utils/http';

type JwtPayload = {
  sub?: string;
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null;

    if (!token) {
      throw new AppError(401, 'Token de autenticacao ausente.');
    }

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const idUsuario = Number(payload.sub);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      throw new AppError(401, 'Token de autenticacao invalido.');
    }

    const user = await findAuthUserById(idUsuario);

    if (!user) {
      throw new AppError(401, 'Usuario inativo ou inexistente.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError(401, 'Token de autenticacao invalido.'));
  }
};

export const requirePermissions =
  (...requiredPermissions: string[]): RequestHandler =>
  (req, _res, next) => {
    const user = req.user;

    if (!user) {
      next(new AppError(401, 'Usuario nao autenticado.'));
      return;
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.permissoes.includes(permission)
    );

    if (!hasPermission) {
      next(new AppError(403, 'Permissao insuficiente para esta operacao.'));
      return;
    }

    next();
  };

export const requireProfile =
  (...profiles: PerfilNome[]): RequestHandler =>
  (req, _res, next) => {
    const user = req.user;

    if (!user) {
      next(new AppError(401, 'Usuario nao autenticado.'));
      return;
    }

    if (!profiles.includes(user.perfil)) {
      next(new AppError(403, 'Perfil sem acesso a esta operacao.'));
      return;
    }

    next();
  };
