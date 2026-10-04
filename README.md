# Prepara Cursos Penha

Navegador desktop desenvolvido com Electron, HTML, CSS e JavaScript.

## Instalação

npm install

## Executar

npm start

## Gerar instalador

npm run dist

O instalador será gerado em `dist/`.

## Funcionalidades

- Abas múltiplas
- Navegação (voltar, avançar, recarregar, parar)
- Barra de endereço com pesquisa integrada
- Página inicial personalizada com logo da Prepara Cursos Penha
- Suporte a fullscreen real
- Downloads
- Links em novas abas
- Segurança com contextIsolation e preload

## Personalização

- Para trocar o mecanismo de pesquisa, edite a função `searchWeb` em `preload.js`.
- Para trocar a logo, altere o `src` da imagem em `src/index.html`.

## Futuras funções

- Prepara Search
- Favoritos
- Histórico
- Bloqueador de anúncios
- Sincronização
- Login
