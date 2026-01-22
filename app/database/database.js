const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

class DatabaseManager {
    constructor() {
        this.db = null;
    }

    // Inicializar a base de dados
    async initialize() {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'promosender.db');

        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');

        this.createTables();
        this.insertDefaultData();

        console.log('Base de dados inicializada em:', dbPath);
    }

    // Criar tabelas
    createTables() {
        // Tabela de contactos
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                wechat_id TEXT,
                company TEXT,
                notes TEXT,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de templates
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                channel TEXT NOT NULL,
                subject TEXT,
                content TEXT NOT NULL,
                html_content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de logs de envio
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS send_logs (
                id TEXT PRIMARY KEY,
                contact_id TEXT,
                template_id TEXT,
                channel TEXT NOT NULL,
                status TEXT NOT NULL,
                error_message TEXT,
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES contacts(id),
                FOREIGN KEY (template_id) REFERENCES templates(id)
            )
        `);

        // Tabela de configuracoes
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);

        // Indices para melhor performance
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
            CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
            CREATE INDEX IF NOT EXISTS idx_logs_channel ON send_logs(channel);
            CREATE INDEX IF NOT EXISTS idx_logs_status ON send_logs(status);
            CREATE INDEX IF NOT EXISTS idx_logs_sent_at ON send_logs(sent_at);
        `);
    }

    // Inserir dados por defeito
    insertDefaultData() {
        // Verificar se ja existem configuracoes
        const settingsCount = this.db.prepare('SELECT COUNT(*) as count FROM settings').get();

        if (settingsCount.count === 0) {
            const defaultSettings = {
                smtp_host: 'smtp.gmail.com',
                smtp_port: '587',
                smtp_user: '',
                smtp_password: '',
                smtp_from_name: 'PromoSender',
                email_delay_ms: '2000',
                whatsapp_delay_ms: '5000',
                wechat_delay_ms: '5000',
                batch_size: '10'
            };

            const insertSetting = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
            for (const [key, value] of Object.entries(defaultSettings)) {
                insertSetting.run(key, value);
            }
        }

        // Inserir templates de exemplo se nao existirem
        const templatesCount = this.db.prepare('SELECT COUNT(*) as count FROM templates').get();

        if (templatesCount.count === 0) {
            const defaultTemplates = [
                {
                    id: uuidv4(),
                    name: 'Promocao de Boas-Vindas',
                    channel: 'email',
                    subject: 'Bem-vindo(a) {{name}}! Oferta Especial para Si',
                    content: 'Ola {{name}},\n\nBem-vindo(a) a nossa loja!\n\nComo agradecimento, oferecemos-lhe 10% de desconto na sua primeira compra.\n\nUse o codigo: BEMVINDO10\n\nAte breve!',
                    html_content: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .code { background: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo(a), {{name}}!</h1>
        </div>
        <div class="content">
            <p>Obrigado por se juntar a nos!</p>
            <p>Como agradecimento especial, oferecemos-lhe <strong>10% de desconto</strong> na sua primeira compra.</p>
            <div class="code">BEMVINDO10</div>
            <p>Use este codigo no checkout para aproveitar a sua oferta.</p>
        </div>
        <div class="footer">
            <p>Esta oferta e valida por 30 dias.</p>
        </div>
    </div>
</body>
</html>`
                },
                {
                    id: uuidv4(),
                    name: 'Promocao WhatsApp',
                    channel: 'whatsapp',
                    subject: '',
                    content: 'Ola {{name}}! Temos uma oferta especial para si: 20% de desconto em todos os produtos esta semana! Visite a nossa loja ou responda a esta mensagem para saber mais.',
                    html_content: ''
                },
                {
                    id: uuidv4(),
                    name: 'Mensagem WeChat',
                    channel: 'wechat',
                    subject: '',
                    content: 'Ola {{name}}! Aproveite a nossa promocao exclusiva. Desconto de 15% usando o codigo WECHAT15.',
                    html_content: ''
                }
            ];

            const insertTemplate = this.db.prepare(`
                INSERT INTO templates (id, name, channel, subject, content, html_content)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const template of defaultTemplates) {
                insertTemplate.run(
                    template.id,
                    template.name,
                    template.channel,
                    template.subject,
                    template.content,
                    template.html_content
                );
            }
        }
    }

    // ==================== CRUD CONTACTOS ====================

    getAllContacts() {
        return this.db.prepare('SELECT * FROM contacts ORDER BY name').all();
    }

    getContactById(id) {
        return this.db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    }

    createContact(contact) {
        const id = uuidv4();
        const stmt = this.db.prepare(`
            INSERT INTO contacts (id, name, email, phone, wechat_id, company, notes, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            id,
            contact.name,
            contact.email || null,
            contact.phone || null,
            contact.wechat_id || null,
            contact.company || null,
            contact.notes || null,
            contact.tags || null
        );
        return id;
    }

    updateContact(id, contact) {
        const stmt = this.db.prepare(`
            UPDATE contacts
            SET name = ?, email = ?, phone = ?, wechat_id = ?, company = ?, notes = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(
            contact.name,
            contact.email || null,
            contact.phone || null,
            contact.wechat_id || null,
            contact.company || null,
            contact.notes || null,
            contact.tags || null,
            id
        );
    }

    deleteContact(id) {
        this.db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    }

    searchContacts(query) {
        const searchQuery = `%${query}%`;
        return this.db.prepare(`
            SELECT * FROM contacts
            WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR tags LIKE ?
            ORDER BY name
        `).all(searchQuery, searchQuery, searchQuery, searchQuery, searchQuery);
    }

    getContactsByIds(ids) {
        const placeholders = ids.map(() => '?').join(',');
        return this.db.prepare(`SELECT * FROM contacts WHERE id IN (${placeholders})`).all(...ids);
    }

    // ==================== CRUD TEMPLATES ====================

    getAllTemplates() {
        return this.db.prepare('SELECT * FROM templates ORDER BY name').all();
    }

    getTemplateById(id) {
        return this.db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    }

    getTemplatesByChannel(channel) {
        return this.db.prepare('SELECT * FROM templates WHERE channel = ? ORDER BY name').all(channel);
    }

    createTemplate(template) {
        const id = uuidv4();
        const stmt = this.db.prepare(`
            INSERT INTO templates (id, name, channel, subject, content, html_content)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            id,
            template.name,
            template.channel,
            template.subject || null,
            template.content,
            template.html_content || null
        );
        return id;
    }

    updateTemplate(id, template) {
        const stmt = this.db.prepare(`
            UPDATE templates
            SET name = ?, channel = ?, subject = ?, content = ?, html_content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(
            template.name,
            template.channel,
            template.subject || null,
            template.content,
            template.html_content || null,
            id
        );
    }

    deleteTemplate(id) {
        this.db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    }

    // ==================== LOGS ====================

    createLog(log) {
        const id = uuidv4();
        const stmt = this.db.prepare(`
            INSERT INTO send_logs (id, contact_id, template_id, channel, status, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            id,
            log.contact_id,
            log.template_id || null,
            log.channel,
            log.status,
            log.error_message || null
        );
        return id;
    }

    getLogs(filters = {}) {
        let query = `
            SELECT l.*, c.name as contact_name, c.email as contact_email, t.name as template_name
            FROM send_logs l
            LEFT JOIN contacts c ON l.contact_id = c.id
            LEFT JOIN templates t ON l.template_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.channel) {
            query += ' AND l.channel = ?';
            params.push(filters.channel);
        }

        if (filters.status) {
            query += ' AND l.status = ?';
            params.push(filters.status);
        }

        if (filters.startDate) {
            query += ' AND l.sent_at >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND l.sent_at <= ?';
            params.push(filters.endDate);
        }

        query += ' ORDER BY l.sent_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        return this.db.prepare(query).all(...params);
    }

    getLogStats() {
        const stats = {};

        // Total por canal
        stats.byChannel = this.db.prepare(`
            SELECT channel, COUNT(*) as total,
                   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                   SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
            FROM send_logs
            GROUP BY channel
        `).all();

        // Total hoje
        stats.today = this.db.prepare(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                   SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
            FROM send_logs
            WHERE date(sent_at) = date('now')
        `).get();

        // Total geral
        stats.total = this.db.prepare(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                   SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
            FROM send_logs
        `).get();

        return stats;
    }

    clearLogs() {
        this.db.prepare('DELETE FROM send_logs').run();
    }

    // ==================== CONFIGURACOES ====================

    getSettings() {
        const settings = {};
        const rows = this.db.prepare('SELECT key, value FROM settings').all();
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        return settings;
    }

    getSetting(key) {
        const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
        return row ? row.value : null;
    }

    updateSettings(settings) {
        const stmt = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, value);
        }
    }

    // Fechar conexao
    close() {
        if (this.db) {
            this.db.close();
            console.log('Base de dados fechada');
        }
    }
}

module.exports = DatabaseManager;
