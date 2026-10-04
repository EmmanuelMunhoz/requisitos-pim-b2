# PIM II 2026/2 - ADS UNIP

Site estático de apoio ao Projeto Integrado Multidisciplinar (PIM II), organizado a partir do documento oficial fornecido pela faculdade.

## Abrir localmente

Você pode simplesmente abrir `index.html` no navegador.

Para simular um servidor local:

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`.
6. Salve e aguarde o endereço do GitHub Pages ser publicado.

Não há dependências, build, npm ou framework. É HTML + CSS + JavaScript puro.

## Recursos do site

- Design responsivo para desktop e celular.
- Navegação superior com destaque da seção atual e menu adaptado ao celular.
- Checklist interativo com progresso salvo no `localStorage`.
- Filtros por tipo de requisito.
- Busca rápida por requisitos.
- Disciplinas organizadas em blocos expansíveis.
- Especificação do sistema em C, entregáveis mínimos e riscos críticos.
- Link para o PDF oficial dentro da própria pasta `docs/`.
- Acesso ao PDF oficial pelo header e pelo card final.
- Botões para copiar pendências e o link da página.

## Estrutura

```text
pim-unip-site/
├── index.html
├── styles.css
├── script.js
├── README.md
├── assets/
│   ├── favicon.svg
│   └── unip-logo-dourado.png
└── docs/
    └── PIM-II-oficial-2026-2.pdf
```

## Observação

Este é um site acadêmico de apoio aos alunos e não um portal institucional oficial da UNIP. O PDF da pasta `docs/` é a fonte dos requisitos acadêmicos. O limite de oito integrantes exibido no portal segue orientação posterior da coordenação; o PDF original menciona seis.
