import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProdutoModule } from './produto/produto.module';
import { DevService } from './data/services/dev.service';
import { ProdService } from './data/services/prod.service';
import { TestService } from './data/services/test.service';

// Testes usam sqlite em memória; com DATABASE_URL usa o Postgres de
// produção; sem ela, o MySQL local de desenvolvimento.
function databaseConfig() {
  if (process.env.NODE_ENV === 'test') return TestService;
  if (process.env.DATABASE_URL) return ProdService;
  return DevService;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: databaseConfig(),
      imports: [ConfigModule],
    }),
    CategoriaModule,
    AuthModule,
    UsuarioModule,
    ProdutoModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ transform: true }) },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
