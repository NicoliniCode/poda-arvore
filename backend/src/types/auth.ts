export type PerfilNome = 'SOLICITANTE' | 'ADMINISTRADOR' | 'FISCAL';

export type AuthUser = {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilNome;
  permissoes: string[];
};

export type LoginUser = AuthUser & {
  senhaHash: string;
};
