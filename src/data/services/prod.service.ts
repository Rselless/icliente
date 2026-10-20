import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class ProdService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      logging: false,
      dropSchema: false,
      ssl: {
        rejectUnauthorized: false,
      },
      // Em produção o schema só é sincronizado se DB_SYNCHRONIZE=true.
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      autoLoadEntities: true,
    };
  }
}
