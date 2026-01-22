const puppeteer = require('puppeteer');

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

    // Conectar ao WhatsApp Web
    async connect() {
        try {
            console.log('A iniciar WhatsApp Web...');

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

            await this.page.goto('https://web.whatsapp.com', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            this.isConnected = true;
            console.log('WhatsApp Web aberto. Aguarde o scan do QR code...');

            // Aguardar login (QR code scan)
            await this.waitForLogin();

            return { success: true };
        } catch (error) {
            console.error('Erro ao conectar WhatsApp:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    // Aguardar login via QR code
    async waitForLogin() {
        try {
            // Aguardar elemento que indica login completo
            await this.page.waitForSelector('[data-icon="chat"]', {
                timeout: 120000 // 2 minutos para fazer login
            });

            this.isReady = true;
            console.log('WhatsApp Web conectado e pronto!');
        } catch (error) {
            console.log('Timeout aguardando login. Utilizador pode ainda nao ter feito scan do QR.');
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

        if (!contact.phone) {
            throw new Error('Contacto nao tem numero de telefone');
        }

        // Formatar numero (remover espacos e caracteres especiais)
        const phone = contact.phone.replace(/[\s\-\(\)\.]/g, '');

        try {
            // Navegar para o chat usando URL direta
            const chatUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
            await this.page.goto(chatUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Aguardar caixa de mensagem
            await this.page.waitForSelector('[data-action="compose-box"]', { timeout: 30000 });

            // Aguardar um pouco para a pagina estabilizar
            await this.delay(2000);

            // Clicar no botao enviar
            const sendButton = await this.page.$('[data-icon="send"]');
            if (sendButton) {
                await sendButton.click();
                await this.delay(1000);

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
            } else {
                throw new Error('Botao de envio nao encontrado');
            }
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
