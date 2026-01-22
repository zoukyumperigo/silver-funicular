const nodemailer = require('nodemailer');

class EmailService {
    constructor(db) {
        this.db = db;
        this.transporter = null;
        this.configure(db.getSettings());
    }

    // Configurar o transporter SMTP
    configure(settings) {
        if (settings.smtp_user && settings.smtp_password) {
            this.transporter = nodemailer.createTransport({
                host: settings.smtp_host || 'smtp.gmail.com',
                port: parseInt(settings.smtp_port) || 587,
                secure: false,
                auth: {
                    user: settings.smtp_user,
                    pass: settings.smtp_password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            console.log('Email service configurado para:', settings.smtp_host);
        } else {
            console.log('Email service: credenciais nao configuradas');
        }
    }

    // Verificar se o servico esta configurado
    isConfigured() {
        return this.transporter !== null;
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

    // Enviar email individual
    async sendEmail(contact, template, subject) {
        if (!this.isConfigured()) {
            throw new Error('Servico de email nao configurado. Configure as credenciais SMTP nas definicoes.');
        }

        if (!contact.email) {
            throw new Error('Contacto nao tem email definido');
        }

        const settings = this.db.getSettings();
        const fromName = settings.smtp_from_name || 'PromoSender';
        const fromEmail = settings.smtp_user;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: contact.email,
            subject: this.replaceVariables(subject || template.subject, contact),
            text: this.replaceVariables(template.content, contact)
        };

        // Adicionar versao HTML se existir
        if (template.html_content) {
            mailOptions.html = this.replaceVariables(template.html_content, contact);
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado para:', contact.email, 'ID:', info.messageId);

            // Registar log de sucesso
            this.db.createLog({
                contact_id: contact.id,
                template_id: template.id,
                channel: 'email',
                status: 'success',
                error_message: null
            });

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erro ao enviar email para:', contact.email, error.message);

            // Registar log de erro
            this.db.createLog({
                contact_id: contact.id,
                template_id: template.id,
                channel: 'email',
                status: 'error',
                error_message: error.message
            });

            return { success: false, error: error.message };
        }
    }

    // Enviar emails em batch
    async sendBatch(contactIds, templateId, subject) {
        const template = this.db.getTemplateById(templateId);
        if (!template) {
            throw new Error('Template nao encontrado');
        }

        const contacts = this.db.getContactsByIds(contactIds);
        const settings = this.db.getSettings();
        const delayMs = parseInt(settings.email_delay_ms) || 2000;

        const results = {
            total: contacts.length,
            success: 0,
            error: 0,
            details: []
        };

        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];

            // Verificar se tem email
            if (!contact.email) {
                results.error++;
                results.details.push({
                    contact: contact.name,
                    success: false,
                    error: 'Sem email definido'
                });
                continue;
            }

            try {
                const result = await this.sendEmail(contact, template, subject);
                if (result.success) {
                    results.success++;
                    results.details.push({
                        contact: contact.name,
                        email: contact.email,
                        success: true
                    });
                } else {
                    results.error++;
                    results.details.push({
                        contact: contact.name,
                        email: contact.email,
                        success: false,
                        error: result.error
                    });
                }
            } catch (error) {
                results.error++;
                results.details.push({
                    contact: contact.name,
                    email: contact.email,
                    success: false,
                    error: error.message
                });
            }

            // Delay entre envios para evitar rate limiting
            if (i < contacts.length - 1) {
                await this.delay(delayMs);
            }
        }

        return results;
    }

    // Enviar email de teste
    async sendTestEmail(email, subject, content) {
        if (!this.isConfigured()) {
            throw new Error('Servico de email nao configurado. Configure as credenciais SMTP nas definicoes.');
        }

        const settings = this.db.getSettings();
        const fromName = settings.smtp_from_name || 'PromoSender';
        const fromEmail = settings.smtp_user;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: subject || 'Email de Teste - PromoSender',
            text: content || 'Este e um email de teste do PromoSender.',
            html: content ? `<p>${content}</p>` : '<p>Este e um email de teste do PromoSender.</p>'
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Verificar conexao SMTP
    async verifyConnection() {
        if (!this.isConfigured()) {
            return { success: false, error: 'Servico nao configurado' };
        }

        try {
            await this.transporter.verify();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Helper para delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = EmailService;
