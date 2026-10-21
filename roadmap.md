# Roadmap — Gerenciador de Projeto

## Pedido atual — acompanhamento de coleção
- [ ] Tela compacta com 19 colunas, busca, cadastro e edição sem exemplos.
- [ ] Cliente isolado para a tabela externa existente, sem modificar o Cloud.
- [ ] Verificar interface e testes; documentar credenciais/RLS pendentes.

## Escopo anterior (fora do pedido atual)

- [x] Ativar Lovable Cloud (banco, login, armazenamento)
- [ ] Design system + layout com sidebar (Visão geral, Demandas, Acompanhamento de coleção, Equipe, Relatórios, Histórico, Configurações)
- [ ] Login (admin/colaborador) com perfis e papéis em tabela separada
- [ ] Banco: demandas, coleção (com imagens), fechamentos semanais imutáveis, auditoria + RLS
- [ ] CRUD de demandas (responsável, prioridade, status, progresso 0–100, prazo, observações)
- [ ] Acompanhamento de coleção com upload de várias imagens
- [ ] Fechamento semanal (seg–sex) com snapshot imutável e histórico
- [ ] Relatórios PDF (demandas por colaborador, coleção)
- [ ] Dados de exemplo identificados, estados de carregamento/erro/vazio
- [ ] README com setup e testes
