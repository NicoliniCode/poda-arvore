import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../../config/db';
import { authenticate, requirePermissions } from '../../middleware/auth';
import { asyncHandler, AppError } from '../../utils/http';

const router = Router();

type UsuarioRow = RowDataPacket & {
  id_usuario: number;
  id_perfil: number;
  perfil: string;
  nome: string;
  cpf: string | null;
  email: string;
  telefone: string | null;
  ativo: 'S' | 'N';
  data_cadastro: Date;
  ultimo_login: Date | null;
};

type PerfilRow = RowDataPacket & {
  id_perfil: number;
  nome: string;
  descricao: string | null;
};

const emptyToNull = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  return value;
};

const usuarioCreateSchema = z.object({
  nome: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(120),
  senha: z.string().min(6).max(80),
  idPerfil: z.coerce.number().int().positive(),
  cpf: z.preprocess(emptyToNull, z.string().trim().max(14).nullable().optional()),
  telefone: z.preprocess(emptyToNull, z.string().trim().max(20).nullable().optional())
});

const usuarioUpdateSchema = z.object({
  nome: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(120),
  senha: z.string().min(6).max(80).optional().or(z.literal('')),
  idPerfil: z.coerce.number().int().positive(),
  cpf: z.preprocess(emptyToNull, z.string().trim().max(14).nullable().optional()),
  telefone: z.preprocess(emptyToNull, z.string().trim().max(20).nullable().optional()),
  ativo: z.enum(['S', 'N'])
});

type SqlParam = string | number | null;

const getIdParam = (value: unknown): number => {
  const routeParam = Array.isArray(value) ? value[0] : value;
  const parsed = Number(routeParam);

  if (typeof routeParam !== 'string' || !Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, 'Identificador invalido.');
  }

  return parsed;
};

router.use(authenticate);

router.get(
  '/perfis',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.execute<PerfilRow[]>(
      `SELECT id_perfil, nome, descricao
         FROM perfil
        ORDER BY id_perfil`
    );

    res.json({ data: rows });
  })
);

router.get(
  '/usuarios',
  requirePermissions('USUARIO_GERENCIAR'),
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.execute<UsuarioRow[]>(
      `SELECT u.id_usuario,
              u.id_perfil,
              p.nome AS perfil,
              u.nome,
              u.cpf,
              u.email,
              u.telefone,
              u.ativo,
              u.data_cadastro,
              u.ultimo_login
         FROM usuario u
         JOIN perfil p ON p.id_perfil = u.id_perfil
        ORDER BY u.nome`
    );

    res.json({ data: rows });
  })
);

router.get(
  '/usuarios/fiscais',
  requirePermissions('SOLICITACAO_ENCAMINHAR_FISCAL'),
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.execute<UsuarioRow[]>(
      `SELECT u.id_usuario,
              u.id_perfil,
              p.nome AS perfil,
              u.nome,
              u.cpf,
              u.email,
              u.telefone,
              u.ativo,
              u.data_cadastro,
              u.ultimo_login
         FROM usuario u
         JOIN perfil p ON p.id_perfil = u.id_perfil
        WHERE p.nome = 'FISCAL'
          AND u.ativo = 'S'
        ORDER BY u.nome`
    );

    res.json({ data: rows });
  })
);

router.post(
  '/usuarios',
  requirePermissions('USUARIO_GERENCIAR'),
  asyncHandler(async (req, res) => {
    const data = usuarioCreateSchema.parse(req.body);
    const senhaHash = await bcrypt.hash(data.senha, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO usuario
              (id_perfil, nome, cpf, email, telefone, senha_hash, ativo)
       VALUES (?, ?, ?, ?, ?, ?, 'S')`,
      [
        data.idPerfil,
        data.nome,
        data.cpf ?? null,
        data.email,
        data.telefone ?? null,
        senhaHash
      ]
    );

    res.status(201).json({ idUsuario: result.insertId });
  })
);

router.put(
  '/usuarios/:id',
  requirePermissions('USUARIO_GERENCIAR'),
  asyncHandler(async (req, res) => {
    const idUsuario = getIdParam(req.params.id);
    const data = usuarioUpdateSchema.parse(req.body);
    const params: SqlParam[] = [
      data.idPerfil,
      data.nome,
      data.cpf ?? null,
      data.email,
      data.telefone ?? null,
      data.ativo
    ];

    let passwordSql = '';

    if (data.senha) {
      const senhaHash = await bcrypt.hash(data.senha, 10);
      passwordSql = ', senha_hash = ?';
      params.push(senhaHash);
    }

    params.push(idUsuario);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE usuario
          SET id_perfil = ?,
              nome = ?,
              cpf = ?,
              email = ?,
              telefone = ?,
              ativo = ?
              ${passwordSql}
        WHERE id_usuario = ?`,
      params
    );

    if (result.affectedRows === 0) {
      throw new AppError(404, 'Usuario nao encontrado.');
    }

    res.json({ message: 'Usuario atualizado.' });
  })
);

export default router;
