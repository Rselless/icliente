import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { UsuarioLogin } from './../entities/usuariologin.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Usuario } from '../../usuario/entities/usuario.entity';

@ApiTags('Login Usuário')
@Controller('/usuarios')
export class AuthController {
  constructor(private authService: AuthService) {}

  // O LocalAuthGuard valida usuario/senha do corpo e coloca o usuário em req.user.
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logar')
  @ApiBody({ type: UsuarioLogin })
  login(@Request() req: { user: Usuario }) {
    return this.authService.login(req.user);
  }
}
