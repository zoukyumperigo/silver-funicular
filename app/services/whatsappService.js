const puppeteer = require('puppeteer');
const path = require('path');

class WhatsAppService {
    constructor(db) {
        this.db = db;
        this.browser = null;
        this.page = null;
        this.isConnected = false;
        this.isReady = false;
    }

    // Obter status da conexao
    getStatus() {
        return {
            isConnected: this.isConnected,
            isReady: this.isReady
        };
    }

    // Encontrar executavel do Chrome
    getChromePath() {
        const platform = process.platform;

        if (platform === 'win32') {
            const paths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
            ];

            for (const p of paths) {
                try {
                    if (require('fs').existsSync(p)) {
                        return p;
                    }
                } catch (e) {}
            }
        } else if (platform === 'darwin') {
            const paths = [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
            ];
            for (const p of paths) {
                try {
                    if (require('fs').existsSync(p)) {
                        return p;
                    }
                } catch (e) {}
            }
        } else {
            const paths = [
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/snap/bin/chromium'
            ];
            for (const p of paths) {
                try {
                    if (require('fs').existsSync(p)) {
                        return p;
                    }
                } catch (e) {}
            }
        }

        return null; // Usa o Chromium do Puppeteer
    }

    // Conectar ao WhatsApp Web
    async connect() {
        try {
            console.log('A iniciar WhatsApp Web...');

            const chromePath = this.getChromePath();

            const launchOptions = {
                headless: false,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1200,800',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ]
            };

            // Usar Chrome do sistema se encontrado
            if (chromePath) {
                launchOptions.executablePath = chromePath;
                console.log('A usar browser:', chromePath);
            } else {
                console.log('A usar Chromium do Puppeteer');
            }

            this.browser = await puppeteer.launch(launchOptions);

            this.page = await this.browser.newPage();

            // User agent mais recente
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

            // Permitir notificacoes
            const context = this.browser.defaultBrowserContext();
            await context.overridePermissions('https://web.whatsapp.com', ['notifications']);

            console.log('A abrir WhatsApp Web...');

            await this.page.goto('https://web.whatsapp.com', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            this.isConnected = true;
            console.log('WhatsApp Web aberto. Faca scan do QR code...');

            // Aguardar login (QR code scan) em background
            this.waitForLogin();

            return { success: true };
        } catch (error) {
            console.error('Erro ao conectar WhatsApp:', error.message);
            this.isConnected = false;
            this.isReady = false;
            throw error;
        }
    }

    // Aguardar login via QR code
    async waitForLogin() {
        try {
            // Seletores atualizados para detetar login
            const loginSelectors = [
                'div[data-testid="chat-list"]',
                '[data-icon="chat"]',
                'div[aria-label="Chat list"]',
                '#pane-side'
            ];

            // Tentar cada seletor
            for (const selector of loginSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    this.isReady = true;
                    console.log('WhatsApp Web conectado e pronto!');
                    return;
                } catch (e) {
                    // Continuar para proximo seletor
                }
            }

            // Se nenhum seletor funcionou, aguardar mais tempo
            console.log('A aguardar scan do QR code (2 minutos)...');

            await this.page.waitForFunction(() => {
                // Verifica se existe algum elemento que indica login
                return document.querySelector('#pane-side') !== null ||
                       document.querySelector('[data-icon="chat"]') !== null ||
                       document.querySelector('[data-testid="chat-list"]') !== null;
            }, { timeout: 120000 });

            this.isReady = true;
            console.log('WhatsApp Web conectado e pronto!');
        } catch (error) {
            console.log('Timeout aguardando login. Pode continuar a usar apos fazer scan do QR.');
            // Nao marcamos como erro, pois o utilizador pode ainda fazer login
        }
    }

    // Verificar se esta pronto (verificacao mais robusta)
    async checkReady() {
        if (!this.page || !this.isConnected) return false;

        try {
            const ready = await this.page.evaluate(() => {
                return document.querySelector('#pane-side') !== null ||
                       document.querySelector('[data-icon="chat"]') !== null;
            });
            this.isReady = ready;
            return ready;
        } catch (e) {
            return false;
        }
    }

    // Desconectar
    async disconnect() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
            this.browser = null;
            this.page = null;
            this.isConnected = false;
            this.isReady = false;
            console.log('WhatsApp Web desconectado');
            return { success: true };
        } catch (error) {
            console.error('Erro ao desconectar WhatsApp:', error.message);
            throw error;
        }
    }

    // Fechar (alias para disconnect)
    async close() {
        return this.disconnect();
    }

    // Substituir variaveis no template
    replaceVariables(text, contact) {
        if (!text) return '';
        return text
            .replace(/\{\{name\}\}/g, contact.name || '')
            .replace(/\{\{email\}\}/g, contact.email || '')
            .replace(/\{\{phone\}\}/g, contact.phone || '')
            .replace(/\{\{company\}\}/g, contact.company || '')
            .replace(/\{\{wechat_id\}\}/g, contact.wechat_id || '');
    }

    // Enviar mensagem para um contacto
    async sendMessage(contact, message) {
        if (!this.isConnected || !this.page) {
            throw new Error('WhatsApp Web nao esta conectado');
        }

        // Verificar se esta pronto
        await this.checkReady();
        if (!this.isReady) {
            throw new Error('WhatsApp Web nao esta pronto. Faca scan do QR code primeiro.');
        }

        if (!contact.phone) {
            throw new Error('Contacto nao tem numero de telefone');
        }

        // Formatar numero (remover espacos e caracteres especiais, manter + inicial)
        let phone = contact.phone.replace(/[\s\-\(\)\.]/g, '');
        if (!phone.startsWith('+')) {
            phone = '+' + phone;
        }

        try {
            // Navegar para o chat usando URL direta
            const chatUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`;

            console.log('A abrir chat com:', phone);
            await this.page.goto(chatUrl, { waitUntil: 'networkidle2', timeout: 45000 });

            // Aguardar caixa de mensagem (varios seletores possiveis)
            const inputSelectors = [
                'div[data-testid="conversation-compose-box-input"]',
                '[data-action="compose-box"]',
                'div[contenteditable="true"][data-tab="10"]',
                'footer div[contenteditable="true"]'
            ];

            let inputFound = false;
            for (const selector of inputSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 10000 });
                    inputFound = true;
                    break;
                } catch (e) {}
            }

            if (!inputFound) {
                // Verificar se ha erro de numero invalido
                const invalidNumber = await this.page.evaluate(() => {
                    const text = document.body.innerText;
                    return text.includes('invalid') || text.includes('Phone number shared via url is invalid');
                });

                if (invalidNumber) {
                    throw new Error('Numero de telefone invalido');
                }

                throw new Error('Caixa de mensagem nao encontrada');
            }

            // Aguardar um pouco para a pagina estabilizar
            await this.delay(2000);

            // Clicar no botao enviar (varios seletores possiveis)
            const sendSelectors = [
                'button[data-testid="compose-btn-send"]',
                '[data-icon="send"]',
                'span[data-icon="send"]',
                'button[aria-label="Send"]'
            ];

            let sent = false;
            for (const selector of sendSelectors) {
                try {
                    const sendButton = await this.page.$(selector);
                    if (sendButton) {
                        await sendButton.click();
                        sent = true;
                        break;
                    }
                } catch (e) {}
            }

            if (!sent) {
                // Tentar pressionar Enter
                await this.page.keyboard.press('Enter');
            }

            await this.delay(1500);

            console.log('Mensagem WhatsApp enviada para:', phone);

            // Registar log de sucesso
            this.db.createLog({
                contact_id: contact.id,
                template_id: null,
                channel: 'whatsapp',
                status: 'success',
                error_message: null
            });

            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar WhatsApp para:', phone, error.message);

            // Registar log de erro
            this.db.createLog({
                contact_id: contact.id,
                template_id: null,
                channel: 'whatsapp',
                status: 'error',
                error_message: error.message
            });

            return { success: false, error: error.message };
        }
    }

    // Enviar mensagens em batch
    async sendBatch(contactIds, templateId) {
        const template = this.db.getTemplateById(templateId);
        if (!template) {
            throw new Error('Template nao encontrado');
        }

        const contacts = this.db.getContactsByIds(contactIds);
        const settings = this.db.getSettings();
        const delayMs = parseInt(settings.whatsapp_delay_ms) || 5000;

        const results = {
            total: contacts.length,
            success: 0,
            error: 0,
            details: []
        };

        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];

            // Verificar se tem telefone
            if (!contact.phone) {
                results.error++;
                results.details.push({
                    contact: contact.name,
                    success: false,
                    error: 'Sem telefone definido'
                });

                this.db.createLog({
                    contact_id: contact.id,
                    template_id: templateId,
                    channel: 'whatsapp',
                    status: 'error',
                    error_message: 'Sem telefone definido'
                });
                continue;
            }

            const message = this.replaceVariables(template.content, contact);

            try {
                const result = await this.sendMessage(contact, message);
                if (result.success) {
                    results.success++;
                    results.details.push({
                        contact: contact.name,
                        phone: contact.phone,
                        success: true
                    });
                } else {
                    results.error++;
                    results.details.push({
                        contact: contact.name,
                        phone: contact.phone,
                        success: false,
                        error: result.error
                    });
                }
            } catch (error) {
                results.error++;
                results.details.push({
                    contact: contact.name,
                    phone: contact.phone,
                    success: false,
                    error: error.message
                });
            }

            // Delay entre envios
            if (i < contacts.length - 1) {
                await this.delay(delayMs);
            }
        }

        return results;
    }

    // Helper para delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = WhatsAppService;
