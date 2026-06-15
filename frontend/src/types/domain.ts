export type PerfilNome = 'SOLICITANTE' | 'ADMINISTRADOR' | 'FISCAL';

export type StatusSolicitacao =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'ENCAMINHADA_FISCAL'
  | 'EM_VISTORIA'
  | 'APROVADA'
  | 'REPROVADA'
  | 'CANCELADA';

export type AuthUser = {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilNome;
  permissoes: string[];
};

export type Perfil = {
  id_perfil: number;
  nome: PerfilNome;
  descricao: string | null;
};

export type Usuario = {
  id_usuario: number;
  id_perfil: number;
  perfil: PerfilNome;
  nome: string;
  cpf: string | null;
  email: string;
  telefone: string | null;
  ativo: 'S' | 'N';
  data_cadastro: string;
  ultimo_login: string | null;
};

export type Solicitacao = {
  id_solicitacao: number;
  status: StatusSolicitacao;
  data_solicitacao: string;
  data_encaminhamento_fiscal: string | null;
  data_decisao: string | null;
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

export type Anexo = {
  id_anexo: number;
  id_solicitacao: number;
  tipo: 'FOTO' | 'DOCUMENTO' | 'OUTRO';
  nome_arquivo: string;
  caminho_arquivo: string | null;
  data_upload: string;
};

export type Historico = {
  id_historico: number;
  id_solicitacao: number;
  id_usuario_responsavel: number | null;
  status: StatusSolicitacao;
  observacao: string | null;
  data_evento: string;
  nome_responsavel: string | null;
};

export type Vistoria = {
  id_vistoria: number;
  id_solicitacao: number;
  id_fiscal: number;
  nome_fiscal: string;
  data_vistoria: string;
  parecer_tecnico: string;
  resultado: 'APROVADA' | 'REPROVADA';
  observacao: string | null;
};

export type SolicitacaoDetails = {
  solicitacao: Solicitacao;
  anexos: Anexo[];
  historico: Historico[];
  vistorias: Vistoria[];
};
