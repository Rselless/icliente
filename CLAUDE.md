# iCliente: orquestração no Claude Code

O contexto do projeto (stack, comandos, regras) está em AGENTS.md.

## Papéis
- Sessão principal (Sonnet): coordena e implementa.
- `search` (Haiku): mapeia o repositório.
- `grep` (Haiku): encontra pontos de uso.
- `audit` (Haiku, worktree isolada): aplica o patch e roda build, lint e testes.
- `architect` (Opus): revisa o patch final antes da aprovação.

## Regra de contexto
Delegue toda busca no repositório e toda execução de testes aos subagentes
Haiku (`search`, `grep`, `audit`). A sessão principal recebe só resumos:
nada de buscas amplas, logs de teste ou leitura de arquivos que não vai editar.

## Fluxo de uma mudança
1. Localizar com `search` / `grep`.
2. Implementar.
3. Gerar o patch:
   `mkdir -p .claude/review && git add -N . && git diff master --binary > .claude/review/ultimo.patch`
4. Chamar `audit` com o caminho absoluto do patch e da cópia principal.
5. Chamar `architect` com o mesmo patch e o objetivo da mudança.
6. Apresentar o resultado ao Rafael e esperar o pedido de commit.

## Git
- Commit só quando o Rafael pedir. Mensagens em inglês, no padrão do
  histórico (`fix: :bug: ...`, `test: :white_check_mark: ...`), sem coautor
  do Claude.
- Nunca faça push sem consultar o Rafael.
- Subagentes nunca commitam nem fazem push.
