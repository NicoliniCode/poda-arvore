import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import type { AuthUser, LoginUser, PerfilNome } from '../../types/auth';

type UserPermissionRow = RowDataPacket & {
  id_usuario: number;
  nome: string;
  email: string;
  perfil: PerfilNome;
  senha_hash?: string;
  permissao: string | null;
};

const mapAuthUser = (rows: UserPermissionRow[]): AuthUser | null => {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  return {
    id: firstRow.id_usuario,
    nome: firstRow.nome,
    email: firstRow.email,
    perfil: firstRow.perfil,
    permissoes: rows
      .map((row) => row.permissao)
      .filter((permissao): permissao is string => Boolean(permissao))
  };
};

export const findAuthUserById = async (idUsuario: number): Promise<AuthUser | null> => {
  const [rows] = await pool.execute<UserPermissionRow[]>(
    `SELECT u.id_usuario,
            u.nome,
            u.email,
            p.nome AS perfil,
            pe.codigo AS permissao
       FROM usuario u
       JOIN perfil p ON p.id_perfil = u.id_perfil
       LEFT JOIN perfil_permissao pp ON pp.id_perfil = p.id_perfil
       LEFT JOIN permissao pe ON pe.id_permissao = pp.id_permissao
      WHERE u.id_usuario = ?
        AND u.ativo = 'S'`,
    [idUsuario]
  );

  return mapAuthUser(rows);
};

export const findLoginUserByEmail = async (email: string): Promise<LoginUser | null> => {
  const [rows] = await pool.execute<UserPermissionRow[]>(
    `SELECT u.id_usuario,
            u.nome,
            u.email,
            u.senha_hash,
            p.nome AS perfil,
            pe.codigo AS permissao
       FROM usuario u
       JOIN perfil p ON p.id_perfil = u.id_perfil
       LEFT JOIN perfil_permissao pp ON pp.id_perfil = p.id_perfil
       LEFT JOIN permissao pe ON pe.id_permissao = pp.id_permissao
      WHERE u.email = ?
        AND u.ativo = 'S'`,
    [email]
  );

  const user = mapAuthUser(rows);
  const firstRow = rows[0];

  if (!user || !firstRow?.senha_hash) {
    return null;
  }

  return {
    ...user,
    senhaHash: firstRow.senha_hash
  };
};

export const updateLastLogin = async (idUsuario: number): Promise<void> => {
  await pool.execute<ResultSetHeader>(
    `UPDATE usuario
        SET ultimo_login = NOW()
      WHERE id_usuario = ?`,
    [idUsuario]
  );
};

export const recordLoginAttempt = async (params: {
  idUsuario?: number;
  email: string;
  sucesso: boolean;
  ip?: string;
  userAgent?: string;
  mensagem: string;
}): Promise<void> => {
  await pool.execute<ResultSetHeader>(
    `INSERT INTO usuario_login_historico
            (id_usuario, email_informado, sucesso, ip_origem, user_agent, mensagem)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.idUsuario ?? null,
      params.email,
      params.sucesso ? 'S' : 'N',
      params.ip ?? null,
      params.userAgent?.slice(0, 255) ?? null,
      params.mensagem
    ]
  );
};
