// Variáveis de ambiente usadas pelos testes e2e.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'segredo-somente-para-testes';
