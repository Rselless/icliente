import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Segredo que ficou exposto no histórico do repositório público.
const SEGREDO_VAZADO =
  '30ucS/KorOWUfZUt5Tm+owEoJYKczu0I9kMNbP4OCM0yog5/d+/lUT78fJNZNG+Zv';

interface Sessao {
  id: number;
  token: string;
}

describe('Segurança (e2e)', () => {
  let app: INestApplication<App>;
  let ana: Sessao;
  let bruno: Sessao;
  let categoriaId: number;
  let produtoId: number;

  async function cadastrarELogar(nome: string, email: string): Promise<Sessao> {
    const cadastro = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({ nome, usuario: email, senha: 'senhaforte123', foto: '-' })
      .expect(201);

    expect(cadastro.body).not.toHaveProperty('senha');

    const login = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({ usuario: email, senha: 'senhaforte123' })
      .expect(200);

    return { id: cadastro.body.id, token: login.body.token };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    ana = await cadastrarELogar('Ana', 'ana@icliente.com');
    bruno = await cadastrarELogar('Bruno', 'bruno@icliente.com');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autenticação', () => {
    it('recusa token assinado com o segredo antigo que vazou', async () => {
      const tokenForjado = new JwtService({ secret: SEGREDO_VAZADO }).sign({
        sub: ana.id,
        usuario: 'ana@icliente.com',
      });

      await request(app.getHttpServer())
        .get('/produtos')
        .set('Authorization', `Bearer ${tokenForjado}`)
        .expect(401);
    });

    it('responde 401 genérico para e-mail inexistente', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/usuarios/logar')
        .send({ usuario: 'ninguem@icliente.com', senha: 'qualquercoisa' })
        .expect(401);

      expect(resposta.body.message).toBe('Usuário e/ou senha incorretos!');
    });

    it('responde 401 genérico para senha errada', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/usuarios/logar')
        .send({ usuario: 'ana@icliente.com', senha: 'senhaerrada' })
        .expect(401);

      expect(resposta.body.message).toBe('Usuário e/ou senha incorretos!');
    });
  });

  describe('Usuários', () => {
    it('não devolve a senha na listagem', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/usuarios/all')
        .set('Authorization', ana.token)
        .expect(200);

      expect(resposta.body.length).toBeGreaterThan(0);
      for (const usuario of resposta.body) {
        expect(usuario).not.toHaveProperty('senha');
      }
    });

    it('não devolve a senha na busca por id', async () => {
      const resposta = await request(app.getHttpServer())
        .get(`/usuarios/${bruno.id}`)
        .set('Authorization', ana.token)
        .expect(200);

      expect(resposta.body).not.toHaveProperty('senha');
    });

    it('impede um usuário de alterar outro', async () => {
      await request(app.getHttpServer())
        .put('/usuarios/atualizar')
        .set('Authorization', bruno.token)
        .send({
          id: ana.id,
          nome: 'Ana Invadida',
          usuario: 'invasor@icliente.com',
          senha: 'senhadoinvasor',
          foto: '-',
        })
        .expect(403);

      const ana_ = await request(app.getHttpServer())
        .get(`/usuarios/${ana.id}`)
        .set('Authorization', ana.token)
        .expect(200);

      expect(ana_.body.nome).toBe('Ana');
    });
  });

  describe('Produtos', () => {
    beforeAll(async () => {
      const categoria = await request(app.getHttpServer())
        .post('/categorias')
        .set('Authorization', ana.token)
        .send({ descricao: 'Squad Vendas' })
        .expect(201);
      categoriaId = categoria.body.id;
    });

    it('define o dono pelo token, ignorando o usuário enviado no corpo', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/produtos')
        .set('Authorization', ana.token)
        .send({
          nome: 'Projeto Ana',
          descricao: 'Projeto da Ana',
          preco: 100,
          categoria: { id: categoriaId },
          usuario: { id: bruno.id },
        })
        .expect(201);

      produtoId = resposta.body.id;
      expect(resposta.body.usuario.id).toBe(ana.id);
      expect(resposta.body.usuario).not.toHaveProperty('senha');
    });

    it('impede outro usuário de alterar o produto', async () => {
      await request(app.getHttpServer())
        .put('/produtos')
        .set('Authorization', bruno.token)
        .send({
          id: produtoId,
          nome: 'Alterado pelo Bruno',
          descricao: 'x',
          preco: 1,
          categoria: { id: categoriaId },
        })
        .expect(403);
    });

    it('impede outro usuário de apagar o produto', async () => {
      await request(app.getHttpServer())
        .delete(`/produtos/${produtoId}`)
        .set('Authorization', bruno.token)
        .expect(403);
    });

    it('permite ao dono alterar o produto', async () => {
      const resposta = await request(app.getHttpServer())
        .put('/produtos')
        .set('Authorization', ana.token)
        .send({
          id: produtoId,
          nome: 'Projeto Ana v2',
          descricao: 'Projeto da Ana',
          preco: 150,
          categoria: { id: categoriaId },
        })
        .expect(200);

      expect(resposta.body.nome).toBe('Projeto Ana v2');
    });
  });

  describe('Categorias', () => {
    it('não apaga categoria que ainda tem produtos', async () => {
      await request(app.getHttpServer())
        .delete(`/categorias/${categoriaId}`)
        .set('Authorization', bruno.token)
        .expect(409);

      await request(app.getHttpServer())
        .get(`/produtos/${produtoId}`)
        .set('Authorization', ana.token)
        .expect(200);
    });

    it('permite ao dono apagar o produto', async () => {
      await request(app.getHttpServer())
        .delete(`/produtos/${produtoId}`)
        .set('Authorization', ana.token)
        .expect(204);
    });

    it('apaga categoria vazia', async () => {
      await request(app.getHttpServer())
        .delete(`/categorias/${categoriaId}`)
        .set('Authorization', bruno.token)
        .expect(204);
    });
  });
});
