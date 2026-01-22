const puppeteer = require('puppeteer');

class WeChatService {
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

    // Conectar ao WeChat Web
    async connect() {
        try {
            console.log('A iniciar WeChat Web...');

            this.browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1200,800'
                ]
            });

            this.page = await this.browser.newPage();
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await this.page.goto('https://web.wechat.com', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            this.isConnected = true;
            console.log('WeChat Web aberto. Aguarde o scan do QR code...');

            // Aguardar login (QR code scan)
            await this.waitForLogin();

            return { success: true };
        } catch (error) {
            console.error('Erro ao conectar WeChat:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    // Aguardar login via QR code
    async waitForLogin() {
        try {
            // Aguardar elemento que indica login completo
            // O WeChat Web tem uma estrutura diferente do WhatsApp
            await this.page.waitForSelector('.chat_list, .web_wechat_nologin', {
                timeout: 120000
            });

            // Verificar se fez login ou ainda esta na tela de QR
            const chatList = await this.page.$('.chat_list');
            if (chatList) {
                this.isReady = true;
                console.log('WeChat Web conectado e pronto!');
            } else {
                console.log('Aguardando scan do QR code do WeChat...');
            }
        } catch (error) {
            console.log('Timeout aguardando login WeChat. Utilizador pode ainda nao ter feito scan do QR.');
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
            console.log('WeChat Web desconectado');
            return { success: true };
        } catch (error) {
            console.error('Erro ao desconectar WeChat:', error.message);
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

    // Pesquisar contacto no WeChat
    async searchContact(wechatId) {
        try {
            // Clicar na caixa de pesquisa
            const searchBox = await this.page.$('.search_bar input, #search_bar input');
            if (!searchBox) {
                throw new Error('Caixa de pesquisa nao encontrada');
            }

            await searchBox.click();
            await this.delay(500);

            // Limpar e digitar o ID
            await searchBox.evaluate(el => el.value = '');
            await searchBox.type(wechatId, { delay: 100 });
            await this.delay(1500);

            // Clicar no primeiro resultado
            const searchResult = await this.page.$('.search_list .contact_item, .search_list li');
            if (searchResult) {
                await searchResult.click();
                await this.delay(1000);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro ao pesquisar contacto WeChat:', error.message);
            return false;
        }
    }

    // Enviar mensagem para um contacto
    async sendMessage(contact, message) {
        if (!this.isConnected || !this.page) {
            throw new Error('WeChat Web nao esta conectado');
        }

        if (!contact.wechat_id) {
            throw new Error('Contacto nao tem WeChat ID definido');
        }

        try {
            // Pesquisar o contacto
            const found = await this.searchContact(contact.wechat_id);
            if (!found) {
                throw new Error('Contacto nao encontrado no WeChat');
            }

            // Encontrar caixa de mensagem
            const messageBox = await this.page.$('.input_box textarea, #editArea');
            if (!messageBox) {
                throw new Error('Caixa de mensagem nao encontrada');
            }

            // Digitar mensagem
            await messageBox.click();
            await this.delay(300);
            await messageBox.type(message, { delay: 50 });
            await this.delay(500);

            // Enviar (Enter ou botao)
            await this.page.keyboard.press('Enter');
            await this.delay(1000);

            console.log('Mensagem WeChat enviada para:', contact.wechat_id);

            // Registar log de sucesso
            this.db.createLog({
                contact_id: contact.id,
                template_id: null,
                channel: 'wechat',
                status: 'success',
                error_message: null
            });

            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar WeChat para:', contact.wechat_id, error.message);

            // Registar log de erro
            this.db.createLog({
                contact_id: contact.id,
                template_id: null,
                channel: 'wechat',
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
        const delayMs = parseInt(settings.wechat_delay_ms) || 5000;

        const results = {
            total: contacts.length,
            success: 0,
            error: 0,
            details: []
        };

        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];

            // Verificar se tem WeChat ID
            if (!contact.wechat_id) {
                results.error++;
                results.details.push({
                    contact: contact.name,
                    success: false,
                    error: 'Sem WeChat ID definido'
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
                        wechat_id: contact.wechat_id,
                        success: true
                    });
                } else {
                    results.error++;
                    results.details.push({
                        contact: contact.name,
                        wechat_id: contact.wechat_id,
                        success: false,
                        error: result.error
                    });
                }
            } catch (error) {
                results.error++;
                results.details.push({
                    contact: contact.name,
                    wechat_id: contact.wechat_id,
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

module.exports = WeChatService;
