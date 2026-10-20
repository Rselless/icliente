import { Request } from 'express';

// Dados do usuário extraídos do token JWT válido.
export interface UsuarioAutenticado {
  id: number;
  usuario: string;
}

export interface RequisicaoAutenticada extends Request {
  user: UsuarioAutenticado;
}
