const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras ao renderer process
contextBridge.exposeInMainWorld('api', {
    // ==================== CONTACTOS ====================
    contacts: {
        getAll: () => ipcRenderer.invoke('contacts:getAll'),
        getById: (id) => ipcRenderer.invoke('contacts:getById', id),
        create: (contact) => ipcRenderer.invoke('contacts:create', contact),
        update: (id, contact) => ipcRenderer.invoke('contacts:update', id, contact),
        delete: (id) => ipcRenderer.invoke('contacts:delete', id),
        search: (query) => ipcRenderer.invoke('contacts:search', query),
        import: (contacts) => ipcRenderer.invoke('contacts:import', contacts),
        export: () => ipcRenderer.invoke('contacts:export'),
        getGroups: (contactId) => ipcRenderer.invoke('contacts:getGroups', contactId)
    },

    // ==================== GRUPOS ====================
    groups: {
        getAll: () => ipcRenderer.invoke('groups:getAll'),
        getById: (id) => ipcRenderer.invoke('groups:getById', id),
        create: (group) => ipcRenderer.invoke('groups:create', group),
        update: (id, group) => ipcRenderer.invoke('groups:update', id, group),
        delete: (id) => ipcRenderer.invoke('groups:delete', id),
        getContacts: (groupId) => ipcRenderer.invoke('groups:getContacts', groupId),
        getContactIds: (groupId) => ipcRenderer.invoke('groups:getContactIds', groupId),
        addContact: (groupId, contactId) => ipcRenderer.invoke('groups:addContact', groupId, contactId),
        removeContact: (groupId, contactId) => ipcRenderer.invoke('groups:removeContact', groupId, contactId),
        setContacts: (groupId, contactIds) => ipcRenderer.invoke('groups:setContacts', groupId, contactIds)
    },

    // ==================== TEMPLATES ====================
    templates: {
        getAll: () => ipcRenderer.invoke('templates:getAll'),
        getById: (id) => ipcRenderer.invoke('templates:getById', id),
        create: (template) => ipcRenderer.invoke('templates:create', template),
        update: (id, template) => ipcRenderer.invoke('templates:update', id, template),
        delete: (id) => ipcRenderer.invoke('templates:delete', id),
        preview: (templateId, contactId) => ipcRenderer.invoke('templates:preview', templateId, contactId)
    },

    // ==================== CONFIGURACOES ====================
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        update: (settings) => ipcRenderer.invoke('settings:update', settings)
    },

    // ==================== ENVIO ====================
    send: {
        email: (data) => ipcRenderer.invoke('send:email', data),
        whatsapp: (data) => ipcRenderer.invoke('send:whatsapp', data),
        wechat: (data) => ipcRenderer.invoke('send:wechat', data),
        testEmail: (data) => ipcRenderer.invoke('send:test-email', data)
    },

    // ==================== WHATSAPP ====================
    whatsapp: {
        getStatus: () => ipcRenderer.invoke('whatsapp:getStatus'),
        connect: () => ipcRenderer.invoke('whatsapp:connect'),
        disconnect: () => ipcRenderer.invoke('whatsapp:disconnect')
    },

    // ==================== WECHAT ====================
    wechat: {
        getStatus: () => ipcRenderer.invoke('wechat:getStatus'),
        connect: () => ipcRenderer.invoke('wechat:connect'),
        disconnect: () => ipcRenderer.invoke('wechat:disconnect')
    },

    // ==================== LOGS ====================
    logs: {
        getAll: (filters) => ipcRenderer.invoke('logs:getAll', filters),
        getStats: () => ipcRenderer.invoke('logs:getStats'),
        clear: () => ipcRenderer.invoke('logs:clear')
    },

    // ==================== DIALOGS ====================
    dialog: {
        openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
        saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options)
    },

    // ==================== EVENTOS DO MENU ====================
    onMenuImportContacts: (callback) => {
        ipcRenderer.on('menu-import-contacts', callback);
    },
    onMenuExportContacts: (callback) => {
        ipcRenderer.on('menu-export-contacts', callback);
    },
    onMenuSettings: (callback) => {
        ipcRenderer.on('menu-settings', callback);
    }
});
