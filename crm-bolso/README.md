# CRM de Bolso

O CRM mais simples do mundo para telemóvel.

## Como Usar

### Opção 1: Local (Desenvolvimento)
```bash
cd crm-bolso
python3 -m http.server 8000
# ou
npx serve .
```
Abre `http://localhost:8000` no browser.

### Opção 2: Hospedagem Gratuita

**Netlify (recomendado):**
1. Vai a [netlify.com](https://netlify.com)
2. Arrasta a pasta `crm-bolso` para o site
3. Tens URL público em segundos

**GitHub Pages:**
1. Cria repositório no GitHub
2. Vai a Settings → Pages
3. Seleciona branch main

**Vercel:**
1. Vai a [vercel.com](https://vercel.com)
2. Importa o projeto
3. Deploy automático

### Opção 3: Instalar no Telemóvel (PWA)

Depois de hospedado:
1. Abre o site no Chrome/Safari
2. Clica em "Adicionar ao ecrã inicial"
3. Funciona como app nativa

## Funcionalidades

- Adicionar clientes (nome, telefone, notas)
- Estados: Novo → Em contacto → Fechado
- Cores por estado
- Pesquisa rápida
- Histórico automático
- Funciona offline
- Dados guardados localmente

## Stack

- HTML + CSS + JavaScript puro
- LocalStorage para dados
- PWA para instalação
- Zero dependências

## Estrutura

```
crm-bolso/
├── index.html      # Estrutura
├── style.css       # Estilos mobile-first
├── app.js          # Lógica
├── manifest.json   # PWA config
├── sw.js           # Service Worker (offline)
└── icon.svg        # Ícone
```
