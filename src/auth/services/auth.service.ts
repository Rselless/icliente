import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from './../../usuario/services/usuario.service';
import { Injectable } from '@nestjs/common';
import { Bcrypt } from '../bcrypt/bcrypt';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
  ) {}

  // Retorna null tanto para e-mail inexistente quanto para senha errada,
  // para não revelar quais e-mails estão cadastrados.
  async validateUser(
    username: string,
    password: string,
  ): Promise<Usuario | null> {
    const buscaUsuario = await this.usuarioService.findByUsuario(username);
    if (!buscaUsuario) return null;

    const matchPassword = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    return matchPassword ? buscaUsuario : null;
  }

  login(usuario: Usuario) {
    const payload = { sub: usuario.id, usuario: usuario.usuario };

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      senha: '',
      foto: usuario.foto,
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}
