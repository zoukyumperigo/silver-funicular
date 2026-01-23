const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class WhatsAppService {
    constructor(db) {
        this.db = db;
        this.browser = null;
        this.page = null;
        this.isConnected = false;
        this.isReady = false;
        this.userDataDir = null;
    }

    // Obter status da conexao
    getStatus() {
        return {
            isConnected: this.isConnected,
            isReady: this.isReady
        };
    }

    // Obter pasta para guardar sessao do WhatsApp
    getUserDataDir() {
        if (!this.userDataDir) {
            const userDataPath = app.getPath('userData');
            this.userDataDir = path.join(userDataPath, 'whatsapp-session');

            // Criar pasta se nao existir
            if (!fs.existsSync(this.userDataDir)) {
                fs.mkdirSync(this.userDataDir, { recursive: true });
            }
        }
        return this.userDataDir;
    }

    // Encontrar executavel do Chrome
    getChromePath() {
        const platform = process.platform;

        if (platform === 'win32') {
            const paths = [
                process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
            ];

            for (const p of paths) {
                try {
                    if (p && fs.existsSync(p)) {
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
                    if (fs.existsSync(p)) {
                        return p;
                    }
                } catch (e) {}
            }
        } else {
            const paths = [
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium'
            ];
            for (const p of paths) {
                try {
                    if (fs.existsSync(p)) {
                        return p;
                    }
                } catch (e) {}
            }
        }

        return null;
    }

    // Conectar ao WhatsApp Web
    async connect() {
        try {
            // Se ja esta conectado, retornar
            if (this.browser && this.isConnected) {
                console.log('WhatsApp Web ja esta conectado');
                return { success: true };
            }

            console.log('A iniciar WhatsApp Web...');

            const chromePath = this.getChromePath();
            const userDataDir = this.getUserDataDir();

            const launchOptions = {
                headless: false,
                defaultViewport: null,
                userDataDir: userDataDir, // Guarda sessao para nao pedir QR sempre
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1200,800'
                ],
                ignoreDefaultArgs: ['--enable-automation']
            };

            // Usar Chrome do sistema se encontrado
            if (chromePath) {
                launchOptions.executablePath = chromePath;
                console.log('A usar browser:', chromePath);
            } else {
                console.log('A usar Chromium do Puppeteer');
            }

            this.browser = await puppeteer.launch(launchOptions);

            // Lidar com fecho do browser
            this.browser.on('disconnected', () => {
                console.log('Browser WhatsApp foi fechado');
                this.isConnected = false;
                this.isReady = false;
                this.browser = null;
                this.page = null;
            });

            const pages = await this.browser.pages();
            this.page = pages[0] || await this.browser.newPage();

            // Esconder que e automacao
            await this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['pt-PT', 'pt', 'en'] });
            });

            console.log('A abrir WhatsApp Web...');

            await this.page.goto('https://web.whatsapp.com', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            this.isConnected = true;
            console.log('WhatsApp Web aberto. Faca scan do QR code se necessario...');

            // Verificar login em background
            this.checkLoginStatus();

            return { success: true };
        } catch (error) {
            console.error('Erro ao conectar WhatsApp:', error.message);
            this.isConnected = false;
            this.isReady = false;
            throw error;
        }
    }

    // Verificar status de login periodicamente
    async checkLoginStatus() {
        const maxAttempts = 60; // 2 minutos (2s x 60)
        let attempts = 0;

        while (attempts < maxAttempts && this.isConnected && this.page) {
            try {
                const isLoggedIn = await this.page.evaluate(() => {
                    // Verificar se existe a lista de chats (indica login completo)
                    const chatList = document.querySelector('#pane-side') ||
                                    document.querySelector('[data-testid="chat-list"]') ||
                                    document.querySelector('[aria-label="Chat list"]');
                    return chatList !== null;
                });

                if (isLoggedIn) {
                    this.isReady = true;
                    console.log('WhatsApp Web conectado e pronto!');
                    return;
                }
            } catch (e) {
                // Pagina pode ter sido fechada
                if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
                    console.log('Sessao WhatsApp foi fechada');
                    this.isConnected = false;
                    this.isReady = false;
                    return;
                }
            }

            attempts++;
            await this.delay(2000);
        }

        console.log('Timeout aguardando login. Pode continuar a usar apos fazer scan do QR.');
    }

    // Verificar se esta pronto
    async checkReady() {
        if (!this.page || !this.isConnected) return false;

        try {
            const ready = await this.page.evaluate(() => {
                const chatList = document.querySelector('#pane-side') ||
                                document.querySelector('[data-testid="chat-list"]');
                return chatList !== null;
            });
            this.isReady = ready;
            return ready;
        } catch (e) {
            this.isReady = false;
            return false;
        }
    }

    // Desconectar
    async disconnect() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
        } catch (e) {
            console.log('Erro ao fechar browser:', e.message);
        }

        this.browser = null;
        this.page = null;
        this.isConnected = false;
        this.isReady = false;
        console.log('WhatsApp Web desconectado');
        return { success: true };
    }

    // Fechar
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
            throw new Error('WhatsApp Web nao esta conectado. Clique em Conectar primeiro.');
        }

        // Verificar se esta pronto
        const ready = await this.checkReady();
        if (!ready) {
            throw new Error('WhatsApp Web nao esta pronto. Faca scan do QR code primeiro.');
        }

        if (!contact.phone) {
            throw new Error('Contacto nao tem numero de telefone');
        }

        // Formatar numero
        let phone = contact.phone.replace(/[\s\-\(\)\.]/g, '');
        if (!phone.startsWith('+')) {
            phone = '+' + phone;
        }
        // Remover o + para a URL
        const phoneNumber = phone.replace('+', '');

        try {
            console.log('A enviar mensagem para:', phone);

            // Usar URL direta do WhatsApp
            const url = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

            await this.page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Aguardar pagina carregar
            await this.delay(3000);

            // Verificar se numero e valido
            const hasError = await this.page.evaluate(() => {
                const errorModal = document.querySelector('[data-testid="popup-contents"]');
                const bodyText = document.body.innerText.toLowerCase();
                return errorModal !== null || bodyText.includes('invalid') || bodyText.includes('invalido');
            });

            if (hasError) {
                throw new Error('Numero de telefone invalido ou nao encontrado no WhatsApp');
            }

            // Aguardar botao de enviar aparecer
            await this.delay(2000);

            // Tentar encontrar e clicar no botao enviar
            const sent = await this.page.evaluate(() => {
                // Procurar botao de enviar
                const sendButton = document.querySelector('[data-testid="send"]') ||
                                   document.querySelector('[data-icon="send"]') ||
                                   document.querySelector('span[data-icon="send"]');

                if (sendButton) {
                    sendButton.click();
                    return true;
                }

                // Tentar encontrar o botao pelo aria-label
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.getAttribute('aria-label')?.toLowerCase().includes('send') ||
                        btn.getAttribute('aria-label')?.toLowerCase().includes('enviar')) {
                        btn.click();
                        return true;
                    }
                }

                return false;
            });

            if (!sent) {
                // Tentar pressionar Enter como fallback
                await this.page.keyboard.press('Enter');
            }

            // Aguardar mensagem ser enviada
            await this.delay(2000);

            console.log('Mensagem enviada com sucesso para:', phone);

            // Registar log
            this.db.createLog({
                contact_id: contact.id,
                template_id: null,
                channel: 'whatsapp',
                status: 'success',
                error_message: null
            });

            return { success: true };

        } catch (error) {
            console.error('Erro ao enviar para', phone, ':', error.message);

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
