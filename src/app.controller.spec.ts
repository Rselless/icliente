import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('deve redirecionar a raiz para o Swagger', async () => {
    const resposta = { redirect: jest.fn() };

    await appController.redirect(resposta);

    expect(resposta.redirect).toHaveBeenCalledWith('/swagger');
  });
});
