import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ICliente')
    .setDescription('Projeto Integrador 3 - ICliente')
    .setContact(
      'Grupo 07',
      'https://github.com/Grupo-1-JS07/icliente',
      'g1projetointegrador@gmail.com',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);

  process.env.TZ = '-03:00';

  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
