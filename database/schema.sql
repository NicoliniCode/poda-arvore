-- ============================================================
-- SCRIPT COMPLETO - SISTEMA DE SOLICITAÇÃO DE PODA DE ÁRVORE
-- Banco de dados: poda_arvores
-- MySQL 8+
--
-- ATENÇÃO:
-- Este script recria o banco do zero.
-- Execute somente em ambiente de teste/desenvolvimento ou após backup.
--
-- Fluxo principal:
-- 1) Solicitante cria e acompanha somente suas solicitações.
-- 2) Administrador visualiza todas as solicitações e encaminha ao fiscal.
-- 3) Fiscal visualiza somente solicitações encaminhadas para ele.
-- 4) Fiscal registra vistoria e aprova/reprova a solicitação.
--
-- Observação sobre senha:
-- O campo usuario.senha_hash deve receber hash gerado pelo backend
-- usando bcrypt ou argon2. Não grave senha em texto puro.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS `poda_arvores`;
CREATE DATABASE IF NOT EXISTS `poda_arvores`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `poda_arvores`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. PERFIS DE USUÁRIO
-- ============================================================

CREATE TABLE `perfil` (
  `id_perfil` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(40) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_perfil`),
  UNIQUE KEY `uq_perfil_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `perfil` (`id_perfil`, `nome`, `descricao`) VALUES
(1, 'SOLICITANTE',  'Usuário que pode logar, solicitar poda e acompanhar somente suas próprias solicitações.'),
(2, 'ADMINISTRADOR', 'Usuário administrativo que visualiza todas as solicitações e encaminha para o fiscal.'),
(3, 'FISCAL',       'Usuário fiscal que visualiza somente as solicitações encaminhadas para ele e registra vistoria.');

-- ============================================================
-- 2. PERMISSÕES FUNCIONAIS
-- ============================================================

CREATE TABLE `permissao` (
  `id_permissao` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(80) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_permissao`),
  UNIQUE KEY `uq_permissao_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `permissao` (`id_permissao`, `codigo`, `descricao`) VALUES
(1, 'SOLICITACAO_CRIAR',              'Criar solicitação de poda.'),
(2, 'SOLICITACAO_VER_PROPRIA',        'Visualizar somente as próprias solicitações.'),
(3, 'SOLICITACAO_VER_TODAS',          'Visualizar todas as solicitações.'),
(4, 'SOLICITACAO_ENCAMINHAR_FISCAL',  'Encaminhar solicitação para fiscal.'),
(5, 'SOLICITACAO_VER_ENCAMINHADA',    'Visualizar somente solicitações encaminhadas ao fiscal logado.'),
(6, 'VISTORIA_REGISTRAR',             'Registrar vistoria técnica.'),
(7, 'SOLICITACAO_APROVAR_REPROVAR',   'Aprovar ou reprovar solicitação de poda.'),
(8, 'USUARIO_GERENCIAR',              'Cadastrar, editar, ativar e inativar usuários do sistema.');

CREATE TABLE `perfil_permissao` (
  `id_perfil` int NOT NULL,
  `id_permissao` int NOT NULL,
  PRIMARY KEY (`id_perfil`, `id_permissao`),
  CONSTRAINT `fk_pp_perfil`
    FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`) ON DELETE CASCADE,
  CONSTRAINT `fk_pp_permissao`
    FOREIGN KEY (`id_permissao`) REFERENCES `permissao` (`id_permissao`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Permissões do solicitante
INSERT INTO `perfil_permissao` (`id_perfil`, `id_permissao`) VALUES
(1, 1), -- SOLICITACAO_CRIAR
(1, 2); -- SOLICITACAO_VER_PROPRIA

-- Permissões do administrador
INSERT INTO `perfil_permissao` (`id_perfil`, `id_permissao`) VALUES
(2, 3), -- SOLICITACAO_VER_TODAS
(2, 4), -- SOLICITACAO_ENCAMINHAR_FISCAL
(2, 8); -- USUARIO_GERENCIAR

-- Permissões do fiscal
INSERT INTO `perfil_permissao` (`id_perfil`, `id_permissao`) VALUES
(3, 5), -- SOLICITACAO_VER_ENCAMINHADA
(3, 6), -- VISTORIA_REGISTRAR
(3, 7); -- SOLICITACAO_APROVAR_REPROVAR

-- ============================================================
-- 3. USUÁRIOS DO SISTEMA / LOGIN
-- ============================================================

CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_perfil` int NOT NULL,
  `nome` varchar(120) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `email` varchar(120) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `ativo` char(1) NOT NULL DEFAULT 'S',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `ultimo_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  UNIQUE KEY `uq_usuario_cpf` (`cpf`),
  KEY `idx_usuario_perfil` (`id_perfil`),
  KEY `idx_usuario_ativo` (`ativo`),
  CONSTRAINT `fk_usuario_perfil`
    FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`),
  CONSTRAINT `ck_usuario_ativo`
    CHECK (`ativo` IN ('S', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Usuários de exemplo.
-- IMPORTANTE: substitua os valores de senha_hash por hashes reais gerados pelo backend.
-- Exemplo de senha para testes no backend: 123456, porém grave sempre o hash, nunca o texto puro.
INSERT INTO `usuario` (`id_usuario`, `id_perfil`, `nome`, `cpf`, `email`, `telefone`, `senha_hash`, `ativo`) VALUES
(1, 2, 'Administrador do Sistema', NULL, 'admin@poda.local', NULL, '$2b$10$lY7pJz9ueK2sAZJqJI1xw.7N4hxGuvdZzwDZ79rmd9XfC5crnnkKy', 'S'),
(2, 3, 'Fiscal Municipal', NULL, 'fiscal@poda.local', NULL, '$2b$10$lY7pJz9ueK2sAZJqJI1xw.7N4hxGuvdZzwDZ79rmd9XfC5crnnkKy', 'S'),
(3, 1, 'João Silva', '123.456.789-00', 'joao.silva@email.com', '(18) 99999-1111', '$2b$10$lY7pJz9ueK2sAZJqJI1xw.7N4hxGuvdZzwDZ79rmd9XfC5crnnkKy', 'S'),
(4, 1, 'Maria Santos', '987.654.321-00', 'maria.santos@email.com', '(18) 98888-2222', '$2b$10$lY7pJz9ueK2sAZJqJI1xw.7N4hxGuvdZzwDZ79rmd9XfC5crnnkKy', 'S'),
(5, 1, 'Carlos Lima', '321.654.987-00', 'carlos.lima@email.com', '(18) 97777-3333', '$2b$10$lY7pJz9ueK2sAZJqJI1xw.7N4hxGuvdZzwDZ79rmd9XfC5crnnkKy', 'S');

-- Registro opcional de tentativas de login.
-- Útil para auditoria e segurança.
CREATE TABLE `usuario_login_historico` (
  `id_login_historico` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `email_informado` varchar(120) DEFAULT NULL,
  `sucesso` char(1) NOT NULL,
  `ip_origem` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `mensagem` varchar(255) DEFAULT NULL,
  `data_tentativa` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_login_historico`),
  KEY `idx_login_usuario` (`id_usuario`),
  KEY `idx_login_email` (`email_informado`),
  KEY `idx_login_data` (`data_tentativa`),
  CONSTRAINT `fk_login_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `ck_login_sucesso`
    CHECK (`sucesso` IN ('S', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 4. SOLICITAÇÃO DE PODA
-- ============================================================

CREATE TABLE `solicitacao_poda` (
  `id_solicitacao` int NOT NULL AUTO_INCREMENT,
  `id_usuario_solicitante` int NOT NULL,
  `id_admin_responsavel` int DEFAULT NULL,
  `id_fiscal_responsavel` int DEFAULT NULL,

  -- Local da árvore / ocorrência
  `endereco` varchar(200) NOT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `bairro` varchar(80) DEFAULT NULL,
  `cidade` varchar(80) NOT NULL DEFAULT 'Araçatuba',
  `uf` char(2) NOT NULL DEFAULT 'SP',
  `ponto_referencia` varchar(160) DEFAULT NULL,

  -- Dados da solicitação
  `motivo` varchar(200) NOT NULL,
  `observacao` text,
  `status` varchar(30) NOT NULL DEFAULT 'ABERTA',

  -- Datas do fluxo
  `data_solicitacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_encaminhamento_fiscal` datetime DEFAULT NULL,
  `data_decisao` datetime DEFAULT NULL,
  `data_atualizacao` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_solicitacao`),
  KEY `idx_sol_solicitante` (`id_usuario_solicitante`),
  KEY `idx_sol_admin` (`id_admin_responsavel`),
  KEY `idx_sol_fiscal` (`id_fiscal_responsavel`),
  KEY `idx_sol_status` (`status`),
  KEY `idx_sol_data` (`data_solicitacao`),

  CONSTRAINT `fk_sol_solicitante`
    FOREIGN KEY (`id_usuario_solicitante`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `fk_sol_admin`
    FOREIGN KEY (`id_admin_responsavel`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `fk_sol_fiscal`
    FOREIGN KEY (`id_fiscal_responsavel`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `ck_sol_status`
    CHECK (`status` IN (
      'ABERTA',
      'EM_ANALISE',
      'ENCAMINHADA_FISCAL',
      'EM_VISTORIA',
      'APROVADA',
      'REPROVADA',
      'CANCELADA'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `solicitacao_poda` (
  `id_solicitacao`,
  `id_usuario_solicitante`,
  `id_admin_responsavel`,
  `id_fiscal_responsavel`,
  `endereco`,
  `numero`,
  `bairro`,
  `cidade`,
  `uf`,
  `ponto_referencia`,
  `motivo`,
  `observacao`,
  `status`,
  `data_solicitacao`,
  `data_encaminhamento_fiscal`,
  `data_decisao`
) VALUES
(1, 3, 1, 2, 'Avenida da Saudade', '120', 'Iporã', 'Araçatuba', 'SP', 'Próximo ao poste de energia', 'Galhos próximos à rede elétrica', 'Árvore inclinada após ventos fortes', 'ENCAMINHADA_FISCAL', '2026-01-02 09:25:24', '2026-01-02 14:00:00', NULL),
(2, 4, 1, 2, 'Rua Chile', '345', 'Icaray', 'Araçatuba', 'SP', 'Em frente à residência', 'Risco de queda sobre a calçada', 'Tronco com sinais de cupim', 'APROVADA', '2026-01-12 08:29:34', '2026-01-12 10:00:00', '2026-01-13 11:05:33'),
(3, 5, 1, 2, 'Rua José Guerra', '89', 'Jardim Moreira', 'Araçatuba', 'SP', 'Próximo à esquina', 'Poda para liberar passagem de pedestres', 'Poda leve solicitada', 'REPROVADA', '2026-01-19 14:10:55', '2026-01-19 15:00:00', '2026-01-19 17:00:00');

-- ============================================================
-- 5. ANEXOS DA SOLICITAÇÃO
-- ============================================================

CREATE TABLE `solicitacao_anexo` (
  `id_anexo` int NOT NULL AUTO_INCREMENT,
  `id_solicitacao` int NOT NULL,
  `tipo` varchar(30) NOT NULL,
  `nome_arquivo` varchar(160) NOT NULL,
  `caminho_arquivo` varchar(255) DEFAULT NULL,
  `data_upload` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_anexo`),
  KEY `idx_anexo_solicitacao` (`id_solicitacao`),
  CONSTRAINT `fk_anexo_solicitacao`
    FOREIGN KEY (`id_solicitacao`) REFERENCES `solicitacao_poda` (`id_solicitacao`) ON DELETE CASCADE,
  CONSTRAINT `ck_anexo_tipo`
    CHECK (`tipo` IN ('FOTO', 'DOCUMENTO', 'OUTRO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `solicitacao_anexo` (`id_anexo`, `id_solicitacao`, `tipo`, `nome_arquivo`, `caminho_arquivo`, `data_upload`) VALUES
(1, 1, 'FOTO', 'arvore_rede_eletrica.jpg', '/uploads/1/arvore_rede_eletrica.jpg', '2026-01-02 14:25:25'),
(2, 2, 'FOTO', 'tronco_cupim.jpg', '/uploads/2/tronco_cupim.jpg', '2026-01-13 09:45:40'),
(3, 2, 'DOCUMENTO', 'autorizacao_poda.pdf', '/uploads/2/autorizacao_poda.pdf', '2026-01-13 10:01:05'),
(4, 3, 'FOTO', 'calcada_pedestres.jpg', '/uploads/3/calcada_pedestres.jpg', '2026-01-19 16:11:00');

-- ============================================================
-- 6. ENCAMINHAMENTO AO FISCAL
-- ============================================================

CREATE TABLE `solicitacao_encaminhamento` (
  `id_encaminhamento` int NOT NULL AUTO_INCREMENT,
  `id_solicitacao` int NOT NULL,
  `id_admin` int NOT NULL,
  `id_fiscal` int NOT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `data_encaminhamento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_encaminhamento`),
  KEY `idx_enc_solicitacao` (`id_solicitacao`),
  KEY `idx_enc_admin` (`id_admin`),
  KEY `idx_enc_fiscal` (`id_fiscal`),
  CONSTRAINT `fk_enc_solicitacao`
    FOREIGN KEY (`id_solicitacao`) REFERENCES `solicitacao_poda` (`id_solicitacao`) ON DELETE CASCADE,
  CONSTRAINT `fk_enc_admin`
    FOREIGN KEY (`id_admin`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `fk_enc_fiscal`
    FOREIGN KEY (`id_fiscal`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `solicitacao_encaminhamento` (`id_encaminhamento`, `id_solicitacao`, `id_admin`, `id_fiscal`, `observacao`, `data_encaminhamento`) VALUES
(1, 1, 1, 2, 'Encaminhado para vistoria técnica por risco próximo à rede elétrica.', '2026-01-02 14:00:00'),
(2, 2, 1, 2, 'Encaminhado para vistoria técnica por risco de queda.', '2026-01-12 10:00:00'),
(3, 3, 1, 2, 'Encaminhado para avaliar necessidade de poda em calçada.', '2026-01-19 15:00:00');

-- ============================================================
-- 7. VISTORIA REALIZADA PELO FISCAL
-- ============================================================

CREATE TABLE `vistoria_poda` (
  `id_vistoria` int NOT NULL AUTO_INCREMENT,
  `id_solicitacao` int NOT NULL,
  `id_fiscal` int NOT NULL,
  `data_vistoria` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `parecer_tecnico` text NOT NULL,
  `resultado` varchar(20) NOT NULL,
  `observacao` text,
  PRIMARY KEY (`id_vistoria`),
  KEY `idx_vistoria_solicitacao` (`id_solicitacao`),
  KEY `idx_vistoria_fiscal` (`id_fiscal`),
  KEY `idx_vistoria_resultado` (`resultado`),
  CONSTRAINT `fk_vistoria_solicitacao`
    FOREIGN KEY (`id_solicitacao`) REFERENCES `solicitacao_poda` (`id_solicitacao`) ON DELETE CASCADE,
  CONSTRAINT `fk_vistoria_fiscal`
    FOREIGN KEY (`id_fiscal`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `ck_vistoria_resultado`
    CHECK (`resultado` IN ('APROVADA', 'REPROVADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `vistoria_poda` (`id_vistoria`, `id_solicitacao`, `id_fiscal`, `data_vistoria`, `parecer_tecnico`, `resultado`, `observacao`) VALUES
(1, 2, 2, '2026-01-13 09:15:40', 'Foi identificado comprometimento do tronco e risco de queda sobre a calçada.', 'APROVADA', 'Recomendada poda/remoção conforme avaliação técnica.'),
(2, 3, 2, '2026-01-19 16:30:00', 'A árvore não apresenta risco imediato e não obstrui significativamente a passagem.', 'REPROVADA', 'Solicitação não se enquadra nos critérios técnicos definidos.');

-- ============================================================
-- 8. HISTÓRICO DE STATUS DA SOLICITAÇÃO
-- ============================================================

CREATE TABLE `solicitacao_status_historico` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `id_solicitacao` int NOT NULL,
  `id_usuario_responsavel` int DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `data_evento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historico`),
  KEY `idx_hist_solicitacao` (`id_solicitacao`),
  KEY `idx_hist_usuario` (`id_usuario_responsavel`),
  KEY `idx_hist_status` (`status`),
  KEY `idx_hist_data` (`data_evento`),
  CONSTRAINT `fk_hist_solicitacao`
    FOREIGN KEY (`id_solicitacao`) REFERENCES `solicitacao_poda` (`id_solicitacao`) ON DELETE CASCADE,
  CONSTRAINT `fk_hist_usuario`
    FOREIGN KEY (`id_usuario_responsavel`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `ck_hist_status`
    CHECK (`status` IN (
      'ABERTA',
      'EM_ANALISE',
      'ENCAMINHADA_FISCAL',
      'EM_VISTORIA',
      'APROVADA',
      'REPROVADA',
      'CANCELADA'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `solicitacao_status_historico` (`id_historico`, `id_solicitacao`, `id_usuario_responsavel`, `status`, `observacao`, `data_evento`) VALUES
(1, 1, 3, 'ABERTA', 'Solicitação cadastrada pelo cidadão.', '2026-01-02 09:25:24'),
(2, 1, 1, 'EM_ANALISE', 'Administrador iniciou análise da solicitação.', '2026-01-02 10:00:00'),
(3, 1, 1, 'ENCAMINHADA_FISCAL', 'Solicitação encaminhada ao fiscal municipal.', '2026-01-02 14:00:00'),

(4, 2, 4, 'ABERTA', 'Solicitação cadastrada pelo cidadão.', '2026-01-12 08:29:34'),
(5, 2, 1, 'EM_ANALISE', 'Administrador iniciou análise da solicitação.', '2026-01-12 09:00:00'),
(6, 2, 1, 'ENCAMINHADA_FISCAL', 'Solicitação encaminhada ao fiscal municipal.', '2026-01-12 10:00:00'),
(7, 2, 2, 'EM_VISTORIA', 'Fiscal realizou vistoria no local.', '2026-01-13 09:15:40'),
(8, 2, 2, 'APROVADA', 'Poda aprovada após vistoria técnica.', '2026-01-13 11:05:33'),

(9, 3, 5, 'ABERTA', 'Solicitação cadastrada pelo cidadão.', '2026-01-19 14:10:55'),
(10, 3, 1, 'EM_ANALISE', 'Administrador iniciou análise da solicitação.', '2026-01-19 14:30:00'),
(11, 3, 1, 'ENCAMINHADA_FISCAL', 'Solicitação encaminhada ao fiscal municipal.', '2026-01-19 15:00:00'),
(12, 3, 2, 'EM_VISTORIA', 'Fiscal realizou vistoria no local.', '2026-01-19 16:30:00'),
(13, 3, 2, 'REPROVADA', 'Solicitação reprovada após vistoria técnica.', '2026-01-19 17:00:00');

-- ============================================================
-- 9. VIEW PARA CONSULTA DETALHADA
-- ============================================================

CREATE OR REPLACE VIEW `vw_solicitacao_poda_detalhada` AS
SELECT sp.id_solicitacao,
       sp.status,
       sp.data_solicitacao,
       sp.data_encaminhamento_fiscal,
       sp.data_decisao,
       sp.endereco,
       sp.numero,
       sp.bairro,
       sp.cidade,
       sp.uf,
       sp.ponto_referencia,
       sp.motivo,
       sp.observacao,
       solicitante.id_usuario AS id_usuario_solicitante,
       solicitante.nome       AS nome_solicitante,
       solicitante.cpf        AS cpf_solicitante,
       solicitante.email      AS email_solicitante,
       solicitante.telefone   AS telefone_solicitante,
       admin.id_usuario       AS id_admin_responsavel,
       admin.nome             AS nome_admin_responsavel,
       fiscal.id_usuario      AS id_fiscal_responsavel,
       fiscal.nome            AS nome_fiscal_responsavel
FROM solicitacao_poda sp
JOIN usuario solicitante
  ON solicitante.id_usuario = sp.id_usuario_solicitante
LEFT JOIN usuario admin
  ON admin.id_usuario = sp.id_admin_responsavel
LEFT JOIN usuario fiscal
  ON fiscal.id_usuario = sp.id_fiscal_responsavel;

-- ============================================================
-- 10. CONSULTAS DE CONTROLE DE ACESSO PARA USAR NO BACKEND
-- ============================================================

-- Solicitante: vê somente as próprias solicitações.
-- Troque :id_usuario_logado pelo ID do usuário autenticado no backend.
-- SELECT *
-- FROM vw_solicitacao_poda_detalhada
-- WHERE id_usuario_solicitante = :id_usuario_logado;

-- Administrador: vê todas as solicitações.
-- SELECT *
-- FROM vw_solicitacao_poda_detalhada;

-- Fiscal: vê somente as solicitações encaminhadas para ele.
-- SELECT *
-- FROM vw_solicitacao_poda_detalhada
-- WHERE id_fiscal_responsavel = :id_usuario_logado;

-- Permissões do usuário logado.
-- SELECT u.id_usuario,
--        u.nome,
--        p.nome AS perfil,
--        pe.codigo AS permissao
-- FROM usuario u
-- JOIN perfil p
--   ON p.id_perfil = u.id_perfil
-- JOIN perfil_permissao pp
--   ON pp.id_perfil = p.id_perfil
-- JOIN permissao pe
--   ON pe.id_permissao = pp.id_permissao
-- WHERE u.id_usuario = :id_usuario_logado
-- AND   u.ativo = 'S';

COMMIT;
