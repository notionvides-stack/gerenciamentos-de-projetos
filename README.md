# Gerenciamentos de Projetos 

## Acompanhamento de coleção

Tela em `/`, com tabela de 19 colunas, pesquisa, cadastro e edição. Não há dados de exemplo, novas tabelas ou migrações.

### Conexão externa pendente

A configuração existente é do Lovable Cloud, não do projeto externo solicitado. O novo cliente é isolado e não usa as credenciais ou sessões do Cloud.

Configure a variável pública `VITE_COLLECTION_SUPABASE_PUBLISHABLE_KEY` com a chave **anon/publishable do projeto externo** (localmente, `.env.local`, sem sobrescrever a configuração gerenciada). Reinicie apenas o ambiente local após alterar variáveis. No Lovable, forneça somente a chave pública anon/publishable para que seja adicionada à configuração pública do cliente; não há confirmação de uma tela para variáveis VITE personalizadas, e Project Settings → Secrets não deve ser usado como substituto para configuração do navegador. Essa chave é pública por definição; **nunca use service_role, sb_secret_ ou senha**. Nenhuma chave externa foi fornecida ou inventada.

O cliente acessa somente a tabela existente `public."Acompanhamento de coleção"`. A aplicação não altera dados em montagem e não cria schema. Leitura é paginada para evitar limitar a pesquisa aos primeiros registros.

O projeto externo precisa autorizar `SELECT`, `INSERT` e `UPDATE` para o papel/sessão que usa o app, com GRANTs e políticas RLS adequadas. INSERT/UPDATE também precisam de SELECT para retornar o registro salvo. **Não desative RLS**. Se as políticas exigirem usuário autenticado, será necessário conectar o login desse projeto externo; o login do Cloud não concede acesso ao projeto externo. Uma resposta vazia pode significar ausência de registros ou filtro RLS, e não comprova acesso a todos os dados.

Não há catálogo de opções definido, portanto os campos são de texto livre. Foto aceita URL HTTP/HTTPS e exibe miniatura ou link quando a imagem falha. Não foi implementado upload para outro armazenamento.

### Testes

```sh
bun install
bun run dev
bunx vitest run src/test/collection.test.ts src/test/app-routing.test.tsx
```

Testes cobrem destino externo, datas brasileiras, preservação de campos, ausência de valores fictícios, pesquisa e segurança das URLs. Sem a chave pública externa e acesso RLS autorizado, leitura/criação/edição reais não podem ser verificadas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3818a7be-3d1f-48cf-acca-ebb1538b6510).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
