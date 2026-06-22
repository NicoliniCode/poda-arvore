import { Router } from 'express';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';
import { pool, withTransaction } from '../../config/db';
import { authenticate, requirePermissions, requireProfile } from '../../middleware/auth';
import type { AuthUser } from '../../types/auth';
import { asyncHandler, AppError } from '../../utils/http';
import {
  cleanupUploadedTempFiles,
  persistSolicitacaoFiles,
  uploadSolicitacaoAnexos
} from './upload';

const router = Router();

type StatusSolicitacao =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'ENCAMINHADA_FISCAL'
  | 'EM_VISTORIA'
  | 'APROVADA'
  | 'REPROVADA'
  | 'CANCELADA';

type SolicitationRow = RowDataPacket & {
  id_solicitacao: number;
  status: StatusSolicitacao;
  data_solicitacao: Date;
  data_encaminhamento_fiscal: Date | null;
  data_decisao: Date | null;
  endereco: string;
  numero: string | null;
  bairro: string | null;
  cidade: string;
  uf: string;
  ponto_referencia: string | null;
  motivo: string;
  observacao: string | null;
  id_usuario_solicitante: number;
  nome_solicitante: string;
  cpf_solicitante: string | null;
  email_solicitante: string;
  telefone_solicitante: string | null;
  id_admin_responsavel: number | null;
  nome_admin_responsavel: string | null;
  id_fiscal_responsavel: number | null;
  nome_fiscal_responsavel: string | null;
};

type AnexoRow = RowDataPacket & {
  id_anexo: number;
  id_solicitacao: number;
  tipo: string;
  nome_arquivo: string;
  caminho_arquivo: string | null;
  data_upload: Date;
};

type HistoricoRow = RowDataPacket & {
  id_historico: number;
  id_solicitacao: number;
  id_usuario_responsavel: number | null;
  status: StatusSolicitacao;
  observacao: string | null;
  data_evento: Date;
  nome_responsavel: string | null;
};

type VistoriaRow = RowDataPacket & {
  id_vistoria: number;
  id_solicitacao: number;
  id_fiscal: number;
  nome_fiscal: string;
  data_vistoria: Date;
  parecer_tecnico: string;
  resultado: 'APROVADA' | 'REPROVADA';
  observacao: string | null;
};

type SolicitacaoLockRow = RowDataPacket & {
  id_solicitacao: number;
  status: StatusSolicitacao;
  id_fiscal_responsavel: number | null;
  id_usuario_solicitante: number;
};

type UsuarioPerfilRow = RowDataPacket & {
  id_usuario: number;
};

const finalStatuses: StatusSolicitacao[] = ['APROVADA', 'REPROVADA', 'CANCELADA'];

const emptyToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
};

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const createSolicitacaoSchema = z.object({
  endereco: z.string().trim().min(3).max(200),
  numero: optionalText(20),
  bairro: optionalText(80),
  cidade: optionalText(80).default('Aracatuba'),
  uf: z.preprocess(emptyToUndefined, z.string().trim().length(2).optional().default('SP')),
  pontoReferencia: optionalText(160),
  motivo: z.string().trim().min(5).max(200),
  observacao: optionalText(2000)
});

const encaminharSchema = z.object({
  idFiscal: z.coerce.number().int().positive(),
  observacao: optionalText(255)
});

const vistoriaSchema = z.object({
  parecerTecnico: z.string().trim().min(10).max(4000),
  resultado: z.enum(['APROVADA', 'REPROVADA']),
  observacao: optionalText(2000)
});

type SqlParam = string | number | null | Date;

const getIdParam = (value: unknown): number => {
  const routeParam = Array.isArray(value) ? value[0] : value;
  const parsed = Number(routeParam);

  if (typeof routeParam !== 'string' || !Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, 'Identificador invalido.');
  }

  return parsed;
};

const accessConditionForUser = (user: AuthUser): { sql: string; params: SqlParam[] } => {
  if (user.perfil === 'ADMINISTRADOR') {
    return { sql: '1 = 1', params: [] };
  }

  if (user.perfil === 'FISCAL') {
    return { sql: 'id_fiscal_responsavel = ?', params: [user.id] };
  }

  return { sql: 'id_usuario_solicitante = ?', params: [user.id] };
};

const fetchSolicitacaoForUser = async (
  idSolicitacao: number,
  user: AuthUser
): Promise<SolicitationRow> => {
  const access = accessConditionForUser(user);
  const [rows] = await pool.execute<SolicitationRow[]>(
    `SELECT *
       FROM vw_solicitacao_poda_detalhada
      WHERE id_solicitacao = ?
        AND ${access.sql}`,
    [idSolicitacao, ...access.params]
  );

  const solicitacao = rows[0];

  if (!solicitacao) {
    throw new AppError(404, 'Solicitacao nao encontrada.');
  }

  return solicitacao;
};

const fetchSolicitacaoDetails = async (idSolicitacao: number, user: AuthUser) => {
  const solicitacao = await fetchSolicitacaoForUser(idSolicitacao, user);

  const [anexos] = await pool.execute<AnexoRow[]>(
    `SELECT id_anexo,
            id_solicitacao,
            tipo,
            nome_arquivo,
            caminho_arquivo,
            data_upload
       FROM solicitacao_anexo
      WHERE id_solicitacao = ?
      ORDER BY data_upload`,
    [idSolicitacao]
  );

  const [historico] = await pool.execute<HistoricoRow[]>(
    `SELECT h.id_historico,
            h.id_solicitacao,
            h.id_usuario_responsavel,
            h.status,
            h.observacao,
            h.data_evento,
            u.nome AS nome_responsavel
       FROM solicitacao_status_historico h
       LEFT JOIN usuario u ON u.id_usuario = h.id_usuario_responsavel
      WHERE h.id_solicitacao = ?
      ORDER BY h.data_evento, h.id_historico`,
    [idSolicitacao]
  );

  const [vistorias] = await pool.execute<VistoriaRow[]>(
    `SELECT v.id_vistoria,
            v.id_solicitacao,
            v.id_fiscal,
            u.nome AS nome_fiscal,
            v.data_vistoria,
            v.parecer_tecnico,
            v.resultado,
            v.observacao
       FROM vistoria_poda v
       JOIN usuario u ON u.id_usuario = v.id_fiscal
      WHERE v.id_solicitacao = ?
      ORDER BY v.data_vistoria`,
    [idSolicitacao]
  );

  return {
    solicitacao,
    anexos,
    historico,
    vistorias
  };
};

const insertHistorico = async (
  connection: PoolConnection,
  params: {
    idSolicitacao: number;
    idUsuarioResponsavel: number;
    status: StatusSolicitacao;
    observacao: string;
  }
): Promise<void> => {
  await connection.execute<ResultSetHeader>(
    `INSERT INTO solicitacao_status_historico
            (id_solicitacao, id_usuario_responsavel, status, observacao)
     VALUES (?, ?, ?, ?)`,
    [
      params.idSolicitacao,
      params.idUsuarioResponsavel,
      params.status,
      params.observacao
    ]
  );
};

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const access = accessConditionForUser(user);
    const [rows] = await pool.execute<SolicitationRow[]>(
      `SELECT *
         FROM vw_solicitacao_poda_detalhada
        WHERE ${access.sql}
        ORDER BY data_solicitacao DESC, id_solicitacao DESC`,
      access.params
    );

    res.json({ data: rows });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const idSolicitacao = getIdParam(req.params.id);
    const details = await fetchSolicitacaoDetails(idSolicitacao, req.user!);

    res.json(details);
  })
);

router.post(
  '/',
  requirePermissions('SOLICITACAO_CRIAR'),
  uploadSolicitacaoAnexos,
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    try {
      const data = createSolicitacaoSchema.parse(req.body);
      const idSolicitacao = await withTransaction(async (connection) => {
        const [result] = await connection.execute<ResultSetHeader>(
          `INSERT INTO solicitacao_poda
                  (id_usuario_solicitante,
                   endereco,
                   numero,
                   bairro,
                   cidade,
                   uf,
                   ponto_referencia,
                   motivo,
                   observacao,
                   status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ABERTA')`,
          [
            req.user!.id,
            data.endereco,
            data.numero ?? null,
            data.bairro ?? null,
            data.cidade,
            data.uf.toUpperCase(),
            data.pontoReferencia ?? null,
            data.motivo,
            data.observacao ?? null
          ]
        );

        const id = result.insertId;

        await insertHistorico(connection, {
          idSolicitacao: id,
          idUsuarioResponsavel: req.user!.id,
          status: 'ABERTA',
          observacao: 'Solicitacao cadastrada pelo solicitante.'
        });

        await persistSolicitacaoFiles(connection, id, files);

        return id;
      });

      const details = await fetchSolicitacaoDetails(idSolicitacao, req.user!);
      res.status(201).json(details);
    } catch (error) {
      await cleanupUploadedTempFiles(files);
      throw error;
    }
  })
);

router.post(
  '/:id/encaminhar',
  requirePermissions('SOLICITACAO_ENCAMINHAR_FISCAL'),
  asyncHandler(async (req, res) => {
    const idSolicitacao = getIdParam(req.params.id);
    const data = encaminharSchema.parse(req.body);

    await withTransaction(async (connection) => {
      const [solicitacoes] = await connection.execute<SolicitacaoLockRow[]>(
        `SELECT id_solicitacao, status, id_fiscal_responsavel
           FROM solicitacao_poda
          WHERE id_solicitacao = ?
          FOR UPDATE`,
        [idSolicitacao]
      );

      const solicitacao = solicitacoes[0];

      if (!solicitacao) {
        throw new AppError(404, 'Solicitacao nao encontrada.');
      }

      if (finalStatuses.includes(solicitacao.status)) {
        throw new AppError(409, 'Solicitacao ja esta encerrada.');
      }

      const [fiscais] = await connection.execute<UsuarioPerfilRow[]>(
        `SELECT u.id_usuario
           FROM usuario u
           JOIN perfil p ON p.id_perfil = u.id_perfil
          WHERE u.id_usuario = ?
            AND p.nome = 'FISCAL'
            AND u.ativo = 'S'`,
        [data.idFiscal]
      );

      if (!fiscais[0]) {
        throw new AppError(400, 'Fiscal ativo nao encontrado.');
      }

      await connection.execute<ResultSetHeader>(
        `UPDATE solicitacao_poda
            SET id_admin_responsavel = ?,
                id_fiscal_responsavel = ?,
                status = 'ENCAMINHADA_FISCAL',
                data_encaminhamento_fiscal = NOW()
          WHERE id_solicitacao = ?`,
        [req.user!.id, data.idFiscal, idSolicitacao]
      );

      if (solicitacao.status === 'ABERTA') {
        await insertHistorico(connection, {
          idSolicitacao,
          idUsuarioResponsavel: req.user!.id,
          status: 'EM_ANALISE',
          observacao: 'Administrador iniciou analise da solicitacao.'
        });
      }

      await connection.execute<ResultSetHeader>(
        `INSERT INTO solicitacao_encaminhamento
                (id_solicitacao, id_admin, id_fiscal, observacao)
         VALUES (?, ?, ?, ?)`,
        [
          idSolicitacao,
          req.user!.id,
          data.idFiscal,
          data.observacao ?? 'Solicitacao encaminhada para vistoria tecnica.'
        ]
      );

      await insertHistorico(connection, {
        idSolicitacao,
        idUsuarioResponsavel: req.user!.id,
        status: 'ENCAMINHADA_FISCAL',
        observacao: data.observacao ?? 'Solicitacao encaminhada ao fiscal.'
      });
    });

    const details = await fetchSolicitacaoDetails(idSolicitacao, req.user!);
    res.json(details);
  })
);

router.post(
  '/:id/vistoria',
  requirePermissions('VISTORIA_REGISTRAR', 'SOLICITACAO_APROVAR_REPROVAR'),
  asyncHandler(async (req, res) => {
    const idSolicitacao = getIdParam(req.params.id);
    const data = vistoriaSchema.parse(req.body);

    await withTransaction(async (connection) => {
      const [solicitacoes] = await connection.execute<SolicitacaoLockRow[]>(
        `SELECT id_solicitacao, status, id_fiscal_responsavel
           FROM solicitacao_poda
          WHERE id_solicitacao = ?
          FOR UPDATE`,
        [idSolicitacao]
      );

      const solicitacao = solicitacoes[0];

      if (!solicitacao) {
        throw new AppError(404, 'Solicitacao nao encontrada.');
      }

      if (solicitacao.id_fiscal_responsavel !== req.user!.id) {
        throw new AppError(403, 'Solicitacao nao esta encaminhada para este fiscal.');
      }

      if (finalStatuses.includes(solicitacao.status)) {
        throw new AppError(409, 'Solicitacao ja esta encerrada.');
      }

      await connection.execute<ResultSetHeader>(
        `INSERT INTO vistoria_poda
                (id_solicitacao, id_fiscal, parecer_tecnico, resultado, observacao)
         VALUES (?, ?, ?, ?, ?)`,
        [
          idSolicitacao,
          req.user!.id,
          data.parecerTecnico,
          data.resultado,
          data.observacao ?? null
        ]
      );

      await insertHistorico(connection, {
        idSolicitacao,
        idUsuarioResponsavel: req.user!.id,
        status: 'EM_VISTORIA',
        observacao: 'Fiscal realizou vistoria tecnica.'
      });

      await connection.execute<ResultSetHeader>(
        `UPDATE solicitacao_poda
            SET status = ?,
                data_decisao = NOW()
          WHERE id_solicitacao = ?`,
        [data.resultado, idSolicitacao]
      );

      await insertHistorico(connection, {
        idSolicitacao,
        idUsuarioResponsavel: req.user!.id,
        status: data.resultado,
        observacao:
          data.resultado === 'APROVADA'
            ? 'Solicitacao aprovada apos vistoria tecnica.'
            : 'Solicitacao reprovada apos vistoria tecnica.'
      });
    });

    const details = await fetchSolicitacaoDetails(idSolicitacao, req.user!);
    res.json(details);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idSolicitacao = getIdParam(req.params.id);
    const user = req.user!;
    const data = createSolicitacaoSchema.parse(req.body);

    await withTransaction(async (connection) => {
      const [rows] = await connection.execute<SolicitacaoLockRow[]>(
        `SELECT id_solicitacao, status, id_usuario_solicitante, id_fiscal_responsavel
           FROM solicitacao_poda
          WHERE id_solicitacao = ?
          FOR UPDATE`,
        [idSolicitacao]
      );

      const solicitacao = rows[0];

      if (!solicitacao) {
        throw new AppError(404, 'Solicitacao nao encontrada.');
      }

      if (finalStatuses.includes(solicitacao.status)) {
        throw new AppError(409, 'Solicitacao encerrada nao pode ser editada.');
      }

      if (user.perfil === 'FISCAL') {
        throw new AppError(403, 'Fiscal nao pode editar dados da solicitacao.');
      }

      if (user.perfil === 'SOLICITANTE') {
        if (solicitacao.id_usuario_solicitante !== user.id) {
          throw new AppError(403, 'Sem permissao para editar esta solicitacao.');
        }
        if (solicitacao.status !== 'ABERTA') {
          throw new AppError(409, 'Solicitacao so pode ser editada quando estiver aberta.');
        }
      }

      await connection.execute<ResultSetHeader>(
        `UPDATE solicitacao_poda
            SET endereco = ?,
                numero = ?,
                bairro = ?,
                cidade = ?,
                uf = ?,
                ponto_referencia = ?,
                motivo = ?,
                observacao = ?
          WHERE id_solicitacao = ?`,
        [
          data.endereco,
          data.numero ?? null,
          data.bairro ?? null,
          data.cidade,
          data.uf.toUpperCase(),
          data.pontoReferencia ?? null,
          data.motivo,
          data.observacao ?? null,
          idSolicitacao
        ]
      );

      if (user.perfil === 'ADMINISTRADOR') {
        await insertHistorico(connection, {
          idSolicitacao,
          idUsuarioResponsavel: user.id,
          status: solicitacao.status,
          observacao: 'Administrador editou dados da solicitacao.'
        });
      }
    });

    const details = await fetchSolicitacaoDetails(idSolicitacao, user);
    res.json(details);
  })
);

router.post(
  '/:id/cancelar',
  asyncHandler(async (req, res) => {
    const idSolicitacao = getIdParam(req.params.id);
    const user = req.user!;

    if (user.perfil === 'FISCAL') {
      throw new AppError(403, 'Fiscal nao pode cancelar solicitacoes.');
    }

    await withTransaction(async (connection) => {
      const [rows] = await connection.execute<SolicitacaoLockRow[]>(
        `SELECT id_solicitacao, status, id_usuario_solicitante, id_fiscal_responsavel
           FROM solicitacao_poda
          WHERE id_solicitacao = ?
          FOR UPDATE`,
        [idSolicitacao]
      );

      const solicitacao = rows[0];

      if (!solicitacao) {
        throw new AppError(404, 'Solicitacao nao encontrada.');
      }

      if (user.perfil === 'SOLICITANTE') {
        if (solicitacao.id_usuario_solicitante !== user.id) {
          throw new AppError(403, 'Sem permissao para cancelar esta solicitacao.');
        }
        if (solicitacao.status !== 'ABERTA') {
          throw new AppError(409, 'Solicitacao so pode ser cancelada quando estiver aberta.');
        }
      }

      if (user.perfil === 'ADMINISTRADOR') {
        if (!(['ABERTA', 'ENCAMINHADA_FISCAL'] as StatusSolicitacao[]).includes(solicitacao.status)) {
          throw new AppError(409, 'Solicitacao nao pode ser cancelada neste status.');
        }
      }

      await connection.execute<ResultSetHeader>(
        `UPDATE solicitacao_poda
            SET status = 'CANCELADA'
          WHERE id_solicitacao = ?`,
        [idSolicitacao]
      );

      const observacao = user.perfil === 'ADMINISTRADOR'
        ? 'Solicitacao cancelada pelo administrador.'
        : 'Solicitacao cancelada pelo solicitante.';

      await insertHistorico(connection, {
        idSolicitacao,
        idUsuarioResponsavel: user.id,
        status: 'CANCELADA',
        observacao
      });
    });

    res.json({ message: 'Solicitacao cancelada.' });
  })
);

export default router;
