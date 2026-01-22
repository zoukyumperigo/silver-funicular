const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const Database = require('./database/database');
const EmailService = require('./services/emailService');
const WhatsAppService = require('./services/whatsappService');
const WeChatService = require('./services/wechatService');
const TemplateService = require('./services/templateService');

let mainWindow;
let db;
let emailService;
let whatsappService;
let wechatService;
let templateService;

// Configuracao da janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/images/icon.png'),
        title: 'PromoSender - Envio de Promocoes Multicanal'
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

    // Menu personalizado
    const menuTemplate = [
        {
            label: 'Ficheiro',
            submenu: [
                {
                    label: 'Importar Contactos (CSV)',
                    click: () => mainWindow.webContents.send('menu-import-contacts')
                },
                {
                    label: 'Exportar Contactos (CSV)',
                    click: () => mainWindow.webContents.send('menu-export-contacts')
                },
                { type: 'separator' },
                {
                    label: 'Configuracoes',
                    click: () => mainWindow.webContents.send('menu-settings')
                },
                { type: 'separator' },
                { label: 'Sair', role: 'quit' }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Desfazer', role: 'undo' },
                { label: 'Refazer', role: 'redo' },
                { type: 'separator' },
                { label: 'Cortar', role: 'cut' },
                { label: 'Copiar', role: 'copy' },
                { label: 'Colar', role: 'paste' },
                { label: 'Selecionar Tudo', role: 'selectAll' }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { label: 'Recarregar', role: 'reload' },
                { label: 'Ferramentas de Desenvolvimento', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Zoom +', role: 'zoomIn' },
                { label: 'Zoom -', role: 'zoomOut' },
                { label: 'Zoom Normal', role: 'resetZoom' }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Sobre',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Sobre PromoSender',
                            message: 'PromoSender v1.0.0',
                            detail: 'Aplicacao gratuita para envio de promocoes multicanal.\n\nCanais suportados:\n- Email (Gmail SMTP)\n- WhatsApp Web\n- WeChat Web\n\nDesenvolvido com Electron + SQLite'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Inicializacao dos servicos
async function initializeServices() {
    try {
        // Inicializar base de dados
        db = new Database();
        await db.initialize();
        console.log('Base de dados inicializada com sucesso');

        // Inicializar servicos
        emailService = new EmailService(db);
        whatsappService = new WhatsAppService(db);
        wechatService = new WeChatService(db);
        templateService = new TemplateService(db);

        console.log('Todos os servicos inicializados');
    } catch (error) {
        console.error('Erro ao inicializar servicos:', error);
        dialog.showErrorBox('Erro de Inicializacao',
            'Ocorreu um erro ao inicializar a aplicacao. Por favor reinicie.');
    }
}

// Eventos do Electron
app.whenReady().then(async () => {
    await initializeServices();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Fechar servicos
    if (whatsappService) whatsappService.close();
    if (wechatService) wechatService.close();
    if (db) db.close();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ==================== IPC HANDLERS - CONTACTOS ====================

ipcMain.handle('contacts:getAll', async () => {
    try {
        return { success: true, data: db.getAllContacts() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:getById', async (event, id) => {
    try {
        return { success: true, data: db.getContactById(id) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:create', async (event, contact) => {
    try {
        const id = db.createContact(contact);
        return { success: true, data: { id } };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:update', async (event, id, contact) => {
    try {
        db.updateContact(id, contact);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:delete', async (event, id) => {
    try {
        db.deleteContact(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:search', async (event, query) => {
    try {
        return { success: true, data: db.searchContacts(query) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:import', async (event, contacts) => {
    try {
        let imported = 0;
        for (const contact of contacts) {
            db.createContact(contact);
            imported++;
        }
        return { success: true, data: { imported } };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('contacts:export', async () => {
    try {
        return { success: true, data: db.getAllContacts() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - TEMPLATES ====================

ipcMain.handle('templates:getAll', async () => {
    try {
        return { success: true, data: db.getAllTemplates() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('templates:getById', async (event, id) => {
    try {
        return { success: true, data: db.getTemplateById(id) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('templates:create', async (event, template) => {
    try {
        const id = db.createTemplate(template);
        return { success: true, data: { id } };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('templates:update', async (event, id, template) => {
    try {
        db.updateTemplate(id, template);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('templates:delete', async (event, id) => {
    try {
        db.deleteTemplate(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('templates:preview', async (event, templateId, contactId) => {
    try {
        const preview = templateService.previewTemplate(templateId, contactId);
        return { success: true, data: preview };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - CONFIGURACOES ====================

ipcMain.handle('settings:get', async () => {
    try {
        return { success: true, data: db.getSettings() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('settings:update', async (event, settings) => {
    try {
        db.updateSettings(settings);
        // Reconfigurar servico de email se necessario
        if (settings.smtp_host || settings.smtp_user || settings.smtp_password) {
            emailService.configure(db.getSettings());
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - ENVIO ====================

ipcMain.handle('send:email', async (event, { contactIds, templateId, subject }) => {
    try {
        const results = await emailService.sendBatch(contactIds, templateId, subject);
        return { success: true, data: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('send:whatsapp', async (event, { contactIds, templateId }) => {
    try {
        const results = await whatsappService.sendBatch(contactIds, templateId);
        return { success: true, data: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('send:wechat', async (event, { contactIds, templateId }) => {
    try {
        const results = await wechatService.sendBatch(contactIds, templateId);
        return { success: true, data: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('send:test-email', async (event, { email, subject, content }) => {
    try {
        const result = await emailService.sendTestEmail(email, subject, content);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - WHATSAPP ====================

ipcMain.handle('whatsapp:getStatus', async () => {
    try {
        return { success: true, data: whatsappService.getStatus() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('whatsapp:connect', async () => {
    try {
        await whatsappService.connect();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('whatsapp:disconnect', async () => {
    try {
        await whatsappService.disconnect();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - WECHAT ====================

ipcMain.handle('wechat:getStatus', async () => {
    try {
        return { success: true, data: wechatService.getStatus() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('wechat:connect', async () => {
    try {
        await wechatService.connect();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('wechat:disconnect', async () => {
    try {
        await wechatService.disconnect();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - LOGS ====================

ipcMain.handle('logs:getAll', async (event, filters) => {
    try {
        return { success: true, data: db.getLogs(filters) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('logs:getStats', async () => {
    try {
        return { success: true, data: db.getLogStats() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('logs:clear', async () => {
    try {
        db.clearLogs();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ==================== IPC HANDLERS - DIALOGS ====================

ipcMain.handle('dialog:openFile', async (event, options) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, options);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('dialog:saveFile', async (event, options) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, options);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

console.log('PromoSender iniciado');
