const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = null;
    }

    // Inicializar a base de dados
    async initialize() {
        const SQL = await initSqlJs();

        const userDataPath = app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'promosender.db');

        // Carregar base de dados existente ou criar nova
        if (fs.existsSync(this.dbPath)) {
            const fileBuffer = fs.readFileSync(this.dbPath);
            this.db = new SQL.Database(fileBuffer);
        } else {
            this.db = new SQL.Database();
        }

        this.createTables();
        this.insertDefaultData();
        this.saveDatabase();

        console.log('Base de dados inicializada em:', this.dbPath);
    }

    // Guardar base de dados no disco
    saveDatabase() {
        if (this.db && this.dbPath) {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(this.dbPath, buffer);
        }
    }

    // Executar query e retornar resultados como array de objetos
    queryAll(sql, params = []) {
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    // Executar query e retornar primeiro resultado
    queryOne(sql, params = []) {
        const results = this.queryAll(sql, params);
        return results.length > 0 ? results[0] : null;
    }

    // Executar statement (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        this.db.run(sql, params);
        this.saveDatabase();
    }

    // Criar tabelas
    createTables() {
        // Tabela de contactos
        this.db.run(`
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
        this.db.run(`
            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                channel TEXT NOT NULL,
                subject TEXT,
                content TEXT NOT NULL,
                html_content TEXT,
                image_path TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migrar tabela templates se necessario (adicionar coluna image_path)
        try {
            this.db.run('ALTER TABLE templates ADD COLUMN image_path TEXT');
        } catch (e) {
            // Coluna ja existe, ignorar
        }

        // Tabela de logs de envio
        this.db.run(`
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
        this.db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);

        // Tabela de grupos
        this.db.run(`
            CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT DEFAULT '#667eea',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de relacao grupos-contactos (muitos para muitos)
        this.db.run(`
            CREATE TABLE IF NOT EXISTS group_contacts (
                group_id TEXT NOT NULL,
                contact_id TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (group_id, contact_id),
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
            )
        `);

        // Indices para melhor performance
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_logs_channel ON send_logs(channel)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_logs_status ON send_logs(status)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_logs_sent_at ON send_logs(sent_at)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_group_contacts_group ON group_contacts(group_id)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_group_contacts_contact ON group_contacts(contact_id)`);
    }

    // Inserir dados por defeito
    insertDefaultData() {
        // Verificar se ja existem configuracoes
        const settingsCount = this.queryOne('SELECT COUNT(*) as count FROM settings');

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

            for (const [key, value] of Object.entries(defaultSettings)) {
                this.db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
            }
        }

        // Inserir templates de exemplo se nao existirem
        const templatesCount = this.queryOne('SELECT COUNT(*) as count FROM templates');

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

            for (const template of defaultTemplates) {
                this.db.run(
                    `INSERT INTO templates (id, name, channel, subject, content, html_content) VALUES (?, ?, ?, ?, ?, ?)`,
                    [template.id, template.name, template.channel, template.subject, template.content, template.html_content]
                );
            }
        }

        this.saveDatabase();
    }

    // ==================== CRUD CONTACTOS ====================

    getAllContacts() {
        return this.queryAll('SELECT * FROM contacts ORDER BY name');
    }

    getContactById(id) {
        return this.queryOne('SELECT * FROM contacts WHERE id = ?', [id]);
    }

    createContact(contact) {
        const id = uuidv4();
        this.run(
            `INSERT INTO contacts (id, name, email, phone, wechat_id, company, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, contact.name, contact.email || null, contact.phone || null, contact.wechat_id || null, contact.company || null, contact.notes || null, contact.tags || null]
        );
        return id;
    }

    updateContact(id, contact) {
        this.run(
            `UPDATE contacts SET name = ?, email = ?, phone = ?, wechat_id = ?, company = ?, notes = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [contact.name, contact.email || null, contact.phone || null, contact.wechat_id || null, contact.company || null, contact.notes || null, contact.tags || null, id]
        );
    }

    deleteContact(id) {
        this.run('DELETE FROM contacts WHERE id = ?', [id]);
    }

    searchContacts(query) {
        const searchQuery = `%${query}%`;
        return this.queryAll(
            `SELECT * FROM contacts WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR tags LIKE ? ORDER BY name`,
            [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
        );
    }

    getContactsByIds(ids) {
        if (ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        return this.queryAll(`SELECT * FROM contacts WHERE id IN (${placeholders})`, ids);
    }

    // ==================== CRUD GRUPOS ====================

    getAllGroups() {
        const groups = this.queryAll('SELECT * FROM groups ORDER BY name');
        // Adicionar contagem de contactos para cada grupo
        for (const group of groups) {
            const count = this.queryOne('SELECT COUNT(*) as count FROM group_contacts WHERE group_id = ?', [group.id]);
            group.contact_count = count ? count.count : 0;
        }
        return groups;
    }

    getGroupById(id) {
        const group = this.queryOne('SELECT * FROM groups WHERE id = ?', [id]);
        if (group) {
            const count = this.queryOne('SELECT COUNT(*) as count FROM group_contacts WHERE group_id = ?', [id]);
            group.contact_count = count ? count.count : 0;
        }
        return group;
    }

    createGroup(group) {
        const id = uuidv4();
        this.run(
            `INSERT INTO groups (id, name, description, color) VALUES (?, ?, ?, ?)`,
            [id, group.name, group.description || null, group.color || '#667eea']
        );
        return id;
    }

    updateGroup(id, group) {
        this.run(
            `UPDATE groups SET name = ?, description = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [group.name, group.description || null, group.color || '#667eea', id]
        );
    }

    deleteGroup(id) {
        // Primeiro remove as relacoes
        this.run('DELETE FROM group_contacts WHERE group_id = ?', [id]);
        // Depois remove o grupo
        this.run('DELETE FROM groups WHERE id = ?', [id]);
    }

    // Obter contactos de um grupo
    getGroupContacts(groupId) {
        return this.queryAll(`
            SELECT c.* FROM contacts c
            INNER JOIN group_contacts gc ON c.id = gc.contact_id
            WHERE gc.group_id = ?
            ORDER BY c.name
        `, [groupId]);
    }

    // Obter IDs dos contactos de um grupo
    getGroupContactIds(groupId) {
        const rows = this.queryAll('SELECT contact_id FROM group_contacts WHERE group_id = ?', [groupId]);
        return rows.map(r => r.contact_id);
    }

    // Adicionar contacto a um grupo
    addContactToGroup(groupId, contactId) {
        try {
            this.run(
                'INSERT OR IGNORE INTO group_contacts (group_id, contact_id) VALUES (?, ?)',
                [groupId, contactId]
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    // Remover contacto de um grupo
    removeContactFromGroup(groupId, contactId) {
        this.run('DELETE FROM group_contacts WHERE group_id = ? AND contact_id = ?', [groupId, contactId]);
    }

    // Adicionar multiplos contactos a um grupo
    addContactsToGroup(groupId, contactIds) {
        for (const contactId of contactIds) {
            this.addContactToGroup(groupId, contactId);
        }
    }

    // Definir contactos de um grupo (substitui todos)
    setGroupContacts(groupId, contactIds) {
        // Remover todos os contactos actuais
        this.run('DELETE FROM group_contacts WHERE group_id = ?', [groupId]);
        // Adicionar novos contactos
        for (const contactId of contactIds) {
            this.db.run('INSERT INTO group_contacts (group_id, contact_id) VALUES (?, ?)', [groupId, contactId]);
        }
        this.saveDatabase();
    }

    // Obter grupos de um contacto
    getContactGroups(contactId) {
        return this.queryAll(`
            SELECT g.* FROM groups g
            INNER JOIN group_contacts gc ON g.id = gc.group_id
            WHERE gc.contact_id = ?
            ORDER BY g.name
        `, [contactId]);
    }

    // ==================== CRUD TEMPLATES ====================

    getAllTemplates() {
        return this.queryAll('SELECT * FROM templates ORDER BY name');
    }

    getTemplateById(id) {
        return this.queryOne('SELECT * FROM templates WHERE id = ?', [id]);
    }

    getTemplatesByChannel(channel) {
        return this.queryAll('SELECT * FROM templates WHERE channel = ? ORDER BY name', [channel]);
    }

    createTemplate(template) {
        const id = uuidv4();
        this.run(
            `INSERT INTO templates (id, name, channel, subject, content, html_content, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, template.name, template.channel, template.subject || null, template.content, template.html_content || null, template.image_path || null]
        );
        return id;
    }

    updateTemplate(id, template) {
        this.run(
            `UPDATE templates SET name = ?, channel = ?, subject = ?, content = ?, html_content = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [template.name, template.channel, template.subject || null, template.content, template.html_content || null, template.image_path || null, id]
        );
    }

    deleteTemplate(id) {
        this.run('DELETE FROM templates WHERE id = ?', [id]);
    }

    // ==================== LOGS ====================

    createLog(log) {
        const id = uuidv4();
        this.run(
            `INSERT INTO send_logs (id, contact_id, template_id, channel, status, error_message) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, log.contact_id, log.template_id || null, log.channel, log.status, log.error_message || null]
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

        return this.queryAll(query, params);
    }

    getLogStats() {
        const stats = {};

        // Total por canal
        stats.byChannel = this.queryAll(`
            SELECT channel, COUNT(*) as total,
                   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                   SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
            FROM send_logs
            GROUP BY channel
        `);

        // Total hoje
        stats.today = this.queryOne(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                   SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
            FROM send_logs
            WHERE date(sent_at) = date('now')
        `);

        // Total geral
        stats.total = this.queryOne(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                   SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
            FROM send_logs
        `);

        return stats;
    }

    clearLogs() {
        this.run('DELETE FROM send_logs');
    }

    // ==================== CONFIGURACOES ====================

    getSettings() {
        const settings = {};
        const rows = this.queryAll('SELECT key, value FROM settings');
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        return settings;
    }

    getSetting(key) {
        const row = this.queryOne('SELECT value FROM settings WHERE key = ?', [key]);
        return row ? row.value : null;
    }

    updateSettings(settings) {
        for (const [key, value] of Object.entries(settings)) {
            this.db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
        }
        this.saveDatabase();
    }

    // Fechar conexao
    close() {
        if (this.db) {
            this.saveDatabase();
            this.db.close();
            console.log('Base de dados fechada');
        }
    }
}

module.exports = DatabaseManager;
