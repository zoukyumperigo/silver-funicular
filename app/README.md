# PromoSender - Aplicacao de Envio de Promocoes Multicanal

Aplicacao desktop **100% gratuita** para envio de promocoes via Email, WhatsApp e WeChat.

## Funcionalidades

- **Gestao de Contactos**: CRUD completo com pesquisa e filtros
- **Templates Personalizados**: Crie modelos para cada canal com variaveis dinamicas
- **Envio Multicanal**:
  - Email via Gmail SMTP (gratuito ate 500 emails/dia)
  - WhatsApp via WhatsApp Web
  - WeChat via WeChat Web
- **Logs de Envio**: Registo completo de todos os envios
- **Interface Moderna**: Design limpo e intuitivo

## Requisitos do Sistema

- Node.js 18+ (recomendado: Node.js 20 LTS)
- npm ou yarn
- Google Chrome (para WhatsApp/WeChat Web)
- Conta Gmail (para envio de emails)

## Instalacao

### 1. Navegar para a pasta do projeto

```bash
cd app
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar a Aplicacao

```bash
npm start
```

**Nota:** Esta versao usa `sql.js` (SQLite em WebAssembly), que nao requer compilacao nativa. A instalacao deve funcionar sem problemas em Windows, macOS e Linux.

## Configuracao Inicial

### Configurar Email (Gmail)

1. Aceda a sua **Conta Google** > **Seguranca**
2. Ative a **Verificacao em 2 passos** (se ainda nao estiver ativa)
3. Va a **Senhas de app** e crie uma nova senha para "Correio"
4. Na aplicacao, va a **Definicoes** e preencha:
   - Servidor SMTP: `smtp.gmail.com`
   - Porta: `587`
   - Email: `seu.email@gmail.com`
   - Senha: (a senha de app que criou, NAO a senha normal)

### Configurar WhatsApp

1. Na aplicacao, va a **Definicoes** > **WhatsApp Web**
2. Clique em **Conectar**
3. Sera aberta uma janela do WhatsApp Web
4. Faca scan do QR code com o seu telemovel
5. Aguarde a conexao ser estabelecida

### Configurar WeChat

1. Na aplicacao, va a **Definicoes** > **WeChat Web**
2. Clique em **Conectar**
3. Sera aberta uma janela do WeChat Web
4. Faca scan do QR code com a app WeChat
5. Aguarde a conexao ser estabelecida

## Como Usar

### 1. Adicionar Contactos

- Va a seccao **Contactos**
- Clique em **+ Novo Contacto**
- Preencha os dados (nome obrigatorio, outros campos opcionais)
- Pode importar contactos via CSV

### 2. Criar Templates

- Va a seccao **Templates**
- Clique em **+ Novo Template**
- Escolha o canal (Email, WhatsApp ou WeChat)
- Escreva o conteudo usando variaveis:
  - `{{name}}` - Nome do contacto
  - `{{email}}` - Email do contacto
  - `{{phone}}` - Telefone do contacto
  - `{{company}}` - Empresa do contacto
  - `{{wechat_id}}` - WeChat ID do contacto

### 3. Enviar Promocoes

- Va a seccao **Enviar**
- Selecione o canal de envio
- Escolha um template
- Selecione os contactos destinatarios
- Clique em **Enviar Promocao**

## Limitacoes da Versao Gratuita

| Canal | Limite | Notas |
|-------|--------|-------|
| Email (Gmail) | 500/dia | Limite do Gmail gratuito |
| WhatsApp | Ilimitado* | Requer sessao ativa |
| WeChat | Ilimitado* | Requer sessao ativa |

*Sujeito aos termos de uso das plataformas

## Estrutura do Projeto

```
app/
├── main.js              # Processo principal Electron
├── preload.js           # Bridge seguro para o renderer
├── package.json         # Dependencias e scripts
├── database/
│   └── database.js      # Gestao SQLite
├── services/
│   ├── emailService.js  # Envio de emails
│   ├── whatsappService.js # Automacao WhatsApp
│   ├── wechatService.js # Automacao WeChat
│   └── templateService.js # Gestao de templates
├── renderer/
│   ├── index.html       # Interface principal
│   └── renderer.js      # Logica do frontend
└── assets/
    └── css/
        └── styles.css   # Estilos da aplicacao
```

## Troubleshooting

### Erro: "Servico de email nao configurado"

- Verifique se preencheu todos os campos SMTP nas Definicoes
- Certifique-se de usar uma **Senha de App** do Gmail, nao a senha normal
- Teste a conexao clicando em "Testar Email"

### WhatsApp/WeChat nao conecta

- Certifique-se de ter o Google Chrome instalado
- Tente fechar e reabrir a conexao
- Verifique se ja nao tem outra sessao do WhatsApp/WeChat Web aberta

### Erro ao instalar dependencias

A aplicacao usa `sql.js` que nao requer compilacao. Se tiver erros:

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

Se o erro persistir, verifique se tem uma versao compativel do Node.js (18+).

### Mensagens nao estao a ser enviadas

- Verifique os **Logs** para ver erros especificos
- Para WhatsApp/WeChat, confirme que a sessao esta ativa
- Aumente o delay entre mensagens nas Definicoes para evitar bloqueios

## Desenvolvimento

### Modo de Desenvolvimento

```bash
npm run dev
```

### Criar Executavel

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Tecnologias Utilizadas

- **Electron** - Framework desktop
- **sql.js** - SQLite em WebAssembly (sem compilacao nativa)
- **Nodemailer** - Envio de emails
- **Puppeteer** - Automacao de browser
- **HTML/CSS/JS** - Interface (sem frameworks)

## Aviso Legal

Esta aplicacao destina-se a uso legitimo de marketing. O utilizador e responsavel por:

- Obter consentimento dos destinatarios
- Cumprir as leis de protecao de dados (RGPD)
- Respeitar os termos de uso do Gmail, WhatsApp e WeChat
- Nao enviar spam ou conteudo indesejado

## Licenca

MIT License - Uso livre para fins pessoais e comerciais.

---

Desenvolvido com Electron + SQLite | 100% Gratuito e Open Source
