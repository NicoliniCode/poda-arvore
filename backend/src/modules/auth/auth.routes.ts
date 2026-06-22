import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { asyncHandler, AppError } from '../../utils/http';
import {
  findLoginUserByEmail,
  recordLoginAttempt,
  updateLastLogin
} from './auth.repository';

type PerfilRow = RowDataPacket & { id_perfil: number };
type UsuarioIdRow = RowDataPacket & { id_usuario: number };

const emptyToNull = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const registrarSchema = z.object({
  nome: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(120),
  senha: z.string().min(6).max(80),
  cpf: z.preprocess(emptyToNull, z.string().trim().max(14).nullable().optional()),
  telefone: z.preprocess(emptyToNull, z.string().trim().max(20).nullable().optional())
});

const redefinirSenhaSchema = z.object({
  email: z.string().trim().email(),
  cpf: z.string().trim().min(1),
  novaSenha: z.string().min(6).max(80)
});

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  senha: z.string().min(1)
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const credentials = loginSchema.parse(req.body);
    const loginUser = await findLoginUserByEmail(credentials.email);
    const passwordMatches = loginUser
      ? await bcrypt.compare(credentials.senha, loginUser.senhaHash)
      : false;

    await recordLoginAttempt({
      idUsuario: loginUser?.id,
      email: credentials.email,
      sucesso: passwordMatches,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      mensagem: passwordMatches ? 'Login realizado.' : 'Credenciais invalidas.'
    });

    if (!loginUser || !passwordMatches) {
      throw new AppError(401, 'Email ou senha invalidos.');
    }

    await updateLastLogin(loginUser.id);

    const { senhaHash: _senhaHash, ...user } = loginUser;
    const token = jwt.sign(
      {
        perfil: user.perfil
      },
      env.jwtSecret,
      {
        subject: String(user.id),
        expiresIn: '8h'
      }
    );

    res.json({ token, user });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

router.post(
  '/registrar',
  asyncHandler(async (req, res) => {
    const data = registrarSchema.parse(req.body);

    const [perfis] = await pool.execute<PerfilRow[]>(
      `SELECT id_perfil FROM perfil WHERE nome = 'SOLICITANTE' LIMIT 1`
    );

    const perfil = perfis[0];
    if (!perfil) {
      throw new AppError(500, 'Perfil solicitante nao configurado no sistema.');
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO usuario (id_perfil, nome, cpf, email, telefone, senha_hash, ativo)
         VALUES (?, ?, ?, ?, ?, ?, 'S')`,
        [perfil.id_perfil, data.nome, data.cpf ?? null, data.email, data.telefone ?? null, senhaHash]
      );

      res.status(201).json({ idUsuario: result.insertId });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'ER_DUP_ENTRY') {
        throw new AppError(409, 'Email ou CPF ja cadastrado.');
      }
      throw error;
    }
  })
);

router.post(
  '/redefinir-senha',
  asyncHandler(async (req, res) => {
    const data = redefinirSenhaSchema.parse(req.body);

    const [rows] = await pool.execute<UsuarioIdRow[]>(
      `SELECT id_usuario FROM usuario WHERE email = ? AND cpf = ? AND ativo = 'S' LIMIT 1`,
      [data.email, data.cpf]
    );

    if (!rows[0]) {
      throw new AppError(400, 'Dados nao conferem. Verifique email e CPF informados.');
    }

    const senhaHash = await bcrypt.hash(data.novaSenha, 10);

    await pool.execute<ResultSetHeader>(
      `UPDATE usuario SET senha_hash = ? WHERE id_usuario = ?`,
      [senhaHash, rows[0].id_usuario]
    );

    res.json({ message: 'Senha redefinida com sucesso.' });
  })
);

export default router;
