# iCliente: API

CRM em construção. Hoje o domínio ainda é Usuário/Categoria/Produto. A meta é
remodelar para Cliente/Lead, Oportunidade (funil) e Interação.

## Stack
NestJS 11, TypeORM 0.3, autenticação JWT (passport), Swagger em /swagger.
Banco: Postgres quando há DATABASE_URL, MySQL local em dev, sqlite em
memória nos testes (NODE_ENV=test).

## Comandos
- `npm ci`: instala dependências
- `npm run start:dev`: sobe a API (exige .env com JWT_SECRET; ver .env.example)
- `npm test` / `npm run test:e2e`: testes unitários / e2e
- `npm run build` / `npm run lint`

## Estrutura
`src/<modulo>/{controllers,services,entities}`, `src/auth/` e
`src/data/services/` (configuração do banco).

## Regras que não podem quebrar
- O dono de um registro vem sempre do token (`req.user.id`), nunca do corpo.
- A senha nunca sai em respostas (`@Exclude` + ClassSerializerInterceptor global).
- Segredos só via variáveis de ambiente.
- `test/seguranca.e2e-spec.ts` deve continuar passando.
- O front (iCliente-Frontend) depende do formato do login:
  `{ id, nome, usuario, senha: '', foto, token }`.

## Convenções
Código e mensagens de erro em português; mensagens de commit em inglês.
