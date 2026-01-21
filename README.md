# Táqui Generator

O **Táqui Generator** é uma aplicação web construída com **React Router (framework)** + **Vite** + **Tailwind CSS**, que permite gerar imagens com texto personalizado no estilo "Tá aqui", com base em uma imagem de fundo. Basta inserir o texto desejado, clicar em "Gerar" e copiar a imagem para compartilhar.

## Funcionalidades

- **Inserção de Texto Personalizado**: Digite o texto que você deseja exibir na imagem.
- **Geração de Imagem**: Clique no botão "Gerar" para criar a imagem com o texto inserido.
- **Cópia Fácil**: Use o botão "Copiar" para copiar a imagem gerada para a área de transferência.

## Páginas do monorepo

- `/` e `/hub`: Hub central com botões para todas as frentes.
- `/generator`: Gerador oficial de imagens Táqui.
- `/ip`: Página que mostra seu IP público e gera a arte Táqui com ele.
- `/link`: Encurtador simples que usa o backend existente.
- `/textao`: Contador de caracteres/palavras/linhas.
- `/roleta`: Roleta com edição de lista e SFX.
- `/geladeira`: Shop/controle de itens da geladeira.

### Estrutura para compartilhamento

- `app/components`: Componentes de layout reutilizáveis (ex: PageShell, GlassPanel).
- `app/features/*`: Cada página isolada em sua própria pasta.
- `app/routes/<pagina>/`: Rotas finas que carregam as features e mantêm o estilo compartilhado.

## Captura de Tela

![Táqui Generator Screenshot](./screenshot.png)

## Como Usar

1. Clone o repositório:
    ```bash
    git clone https://github.com/seuusuario/taqui-generator.git
    cd taqui-generator
    ```
2. Instale as dependências usando Bun:
    ```bash
    bun install
    ```
3. Inicie o servidor de desenvolvimento:
    ```bash
    bun run dev
    ```
4. Abra o navegador e acesse a URL exibida no terminal (geralmente `http://localhost:5173`).

## Build e Produção

```bash
bun run build
bun run start
```

## Geladeira (config no servidor)

- Crie `config/geladeira.json` no servidor (base: `config/geladeira.example.json`).
- Defina `GELADEIRA_CONFIG_PATH` se o arquivo não estiver no caminho padrão.
- Defina `SESSION_SECRET` em produção (cookie de login).
- Em produção com HTTPS, defina `GELADEIRA_COOKIE_SECURE=true`.
- Os dados (DB, imagens, qrcodes) ficam em `data/geladeira/` por padrão e estão no `.gitignore`.

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório.
2. Crie uma nova branch com sua feature (`git checkout -b minha-feature`).
3. Commit suas alterações (`git commit -am 'Adicionei uma nova feature'`).
4. Envie suas alterações para a branch (`git push origin minha-feature`).
5. Crie um Pull Request.
