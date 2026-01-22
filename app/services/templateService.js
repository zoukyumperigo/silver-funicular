class TemplateService {
    constructor(db) {
        this.db = db;
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

    // Fazer preview do template com dados de um contacto
    previewTemplate(templateId, contactId) {
        const template = this.db.getTemplateById(templateId);
        if (!template) {
            throw new Error('Template nao encontrado');
        }

        let contact = null;
        if (contactId) {
            contact = this.db.getContactById(contactId);
        }

        // Se nao houver contacto, usar dados de exemplo
        if (!contact) {
            contact = {
                name: 'Joao Silva',
                email: 'joao.silva@exemplo.com',
                phone: '+351912345678',
                company: 'Empresa Exemplo',
                wechat_id: 'joaosilva_wx'
            };
        }

        return {
            subject: this.replaceVariables(template.subject, contact),
            content: this.replaceVariables(template.content, contact),
            html_content: this.replaceVariables(template.html_content, contact)
        };
    }

    // Validar template (verificar variaveis)
    validateTemplate(content) {
        const validVariables = ['{{name}}', '{{email}}', '{{phone}}', '{{company}}', '{{wechat_id}}'];
        const foundVariables = content.match(/\{\{[^}]+\}\}/g) || [];

        const invalidVariables = foundVariables.filter(v => !validVariables.includes(v));

        return {
            isValid: invalidVariables.length === 0,
            invalidVariables: invalidVariables,
            validVariables: validVariables
        };
    }

    // Obter lista de variaveis disponiveis
    getAvailableVariables() {
        return [
            { variable: '{{name}}', description: 'Nome do contacto' },
            { variable: '{{email}}', description: 'Email do contacto' },
            { variable: '{{phone}}', description: 'Telefone do contacto' },
            { variable: '{{company}}', description: 'Empresa do contacto' },
            { variable: '{{wechat_id}}', description: 'WeChat ID do contacto' }
        ];
    }
}

module.exports = TemplateService;
