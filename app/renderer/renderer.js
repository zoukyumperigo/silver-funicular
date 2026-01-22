// ==================== STATE ====================
let contacts = [];
let templates = [];
let selectedChannel = 'email';
let selectedContacts = new Set();

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Setup navigation
    setupNavigation();

    // Setup modals
    setupModals();

    // Setup event listeners
    setupEventListeners();

    // Load initial data
    await loadDashboard();
    await loadContacts();
    await loadTemplates();
    await loadSettings();
    await checkConnectionStatus();

    // Setup menu listeners
    setupMenuListeners();
});

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Refresh data based on section
    switch (sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'templates':
            loadTemplates();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'send':
            loadSendSection();
            break;
    }
}

// ==================== MODALS ====================
function setupModals() {
    // Close modal buttons
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal || btn.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '&#10004;',
        error: '&#10008;',
        warning: '&#9888;'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        // Load stats
        const statsResult = await window.api.logs.getStats();
        if (statsResult.success) {
            const stats = statsResult.data;

            // Update channel stats
            let emailCount = 0, whatsappCount = 0, wechatCount = 0;
            if (stats.byChannel) {
                stats.byChannel.forEach(ch => {
                    if (ch.channel === 'email') emailCount = ch.success || 0;
                    if (ch.channel === 'whatsapp') whatsappCount = ch.success || 0;
                    if (ch.channel === 'wechat') wechatCount = ch.success || 0;
                });
            }

            document.getElementById('stat-email').textContent = emailCount;
            document.getElementById('stat-whatsapp').textContent = whatsappCount;
            document.getElementById('stat-wechat').textContent = wechatCount;
        }

        // Load contacts count
        const contactsResult = await window.api.contacts.getAll();
        if (contactsResult.success) {
            document.getElementById('stat-contacts').textContent = contactsResult.data.length;
        }

        // Load recent sends
        const logsResult = await window.api.logs.getAll({ limit: 10 });
        if (logsResult.success) {
            const recentList = document.getElementById('recent-sends');
            if (logsResult.data.length === 0) {
                recentList.innerHTML = '<div class="empty-state"><p>Nenhum envio realizado ainda</p></div>';
            } else {
                recentList.innerHTML = logsResult.data.map(log => `
                    <div class="recent-item">
                        <div>
                            <strong>${log.contact_name || 'Desconhecido'}</strong>
                            <span style="color: var(--text-secondary);"> - ${log.channel}</span>
                        </div>
                        <span class="status-badge ${log.status}">${log.status === 'success' ? 'Sucesso' : 'Erro'}</span>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// ==================== CONTACTS ====================
async function loadContacts() {
    try {
        const result = await window.api.contacts.getAll();
        if (result.success) {
            contacts = result.data;
            renderContactsTable();
        }
    } catch (error) {
        console.error('Erro ao carregar contactos:', error);
        showToast('Erro ao carregar contactos', 'error');
    }
}

function renderContactsTable() {
    const tbody = document.getElementById('contacts-tbody');

    if (contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128101;</div>
                        <h4>Nenhum contacto encontrado</h4>
                        <p>Clique em "Novo Contacto" para adicionar</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td><input type="checkbox" class="contact-checkbox" data-id="${contact.id}"></td>
            <td>${escapeHtml(contact.name)}</td>
            <td>${escapeHtml(contact.email || '-')}</td>
            <td>${escapeHtml(contact.phone || '-')}</td>
            <td>${escapeHtml(contact.wechat_id || '-')}</td>
            <td>${escapeHtml(contact.company || '-')}</td>
            <td>
                <button class="action-btn edit" onclick="editContact('${contact.id}')">Editar</button>
                <button class="action-btn delete" onclick="deleteContact('${contact.id}')">Apagar</button>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Contact form
    document.getElementById('btn-add-contact').addEventListener('click', () => {
        document.getElementById('contact-modal-title').textContent = 'Novo Contacto';
        document.getElementById('contact-form').reset();
        document.getElementById('contact-id').value = '';
        openModal('contact-modal');
    });

    document.getElementById('btn-save-contact').addEventListener('click', saveContact);

    // Contact search
    document.getElementById('contact-search').addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length > 0) {
            const result = await window.api.contacts.search(query);
            if (result.success) {
                contacts = result.data;
                renderContactsTable();
            }
        } else {
            loadContacts();
        }
    });

    // Template form
    document.getElementById('btn-add-template').addEventListener('click', () => {
        document.getElementById('template-modal-title').textContent = 'Novo Template';
        document.getElementById('template-form').reset();
        document.getElementById('template-id').value = '';
        openModal('template-modal');
    });

    document.getElementById('btn-save-template').addEventListener('click', saveTemplate);

    // Template channel toggle
    document.getElementById('template-channel').addEventListener('change', (e) => {
        const isEmail = e.target.value === 'email';
        document.getElementById('template-subject-group').style.display = isEmail ? 'block' : 'none';
        document.getElementById('template-html-group').style.display = isEmail ? 'block' : 'none';
    });

    // Send section - channel selector
    document.querySelectorAll('.channel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.channel-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedChannel = btn.dataset.channel;

            // Show/hide email subject
            document.getElementById('email-subject-group').style.display =
                selectedChannel === 'email' ? 'block' : 'none';

            // Reload templates for this channel
            loadTemplatesForChannel(selectedChannel);
        });
    });

    // Send template change
    document.getElementById('send-template').addEventListener('change', updatePreview);

    // Send contact search
    document.getElementById('send-contact-search').addEventListener('input', (e) => {
        filterSendContacts(e.target.value);
    });

    // Send button
    document.getElementById('btn-send').addEventListener('click', sendPromotion);

    // Settings
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-test-email').addEventListener('click', testEmailConnection);

    // WhatsApp/WeChat connections
    document.getElementById('btn-connect-whatsapp').addEventListener('click', connectWhatsApp);
    document.getElementById('btn-disconnect-whatsapp').addEventListener('click', disconnectWhatsApp);
    document.getElementById('btn-connect-wechat').addEventListener('click', connectWeChat);
    document.getElementById('btn-disconnect-wechat').addEventListener('click', disconnectWeChat);

    // Logs
    document.getElementById('log-filter-channel').addEventListener('change', loadLogs);
    document.getElementById('log-filter-status').addEventListener('change', loadLogs);
    document.getElementById('btn-clear-logs').addEventListener('click', clearLogs);

    // Import/Export
    document.getElementById('btn-import-contacts').addEventListener('click', importContacts);

    // Progress modal close
    document.getElementById('btn-close-progress').addEventListener('click', () => {
        closeModal('progress-modal');
    });

    // Select all contacts
    document.getElementById('select-all-contacts').addEventListener('change', (e) => {
        document.querySelectorAll('.contact-checkbox').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });
}

async function saveContact() {
    const id = document.getElementById('contact-id').value;
    const contact = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        wechat_id: document.getElementById('contact-wechat').value,
        company: document.getElementById('contact-company').value,
        tags: document.getElementById('contact-tags').value,
        notes: document.getElementById('contact-notes').value
    };

    if (!contact.name) {
        showToast('Nome e obrigatorio', 'error');
        return;
    }

    try {
        let result;
        if (id) {
            result = await window.api.contacts.update(id, contact);
        } else {
            result = await window.api.contacts.create(contact);
        }

        if (result.success) {
            showToast(id ? 'Contacto atualizado' : 'Contacto criado', 'success');
            closeModal('contact-modal');
            loadContacts();
        } else {
            showToast(result.error || 'Erro ao guardar', 'error');
        }
    } catch (error) {
        showToast('Erro ao guardar contacto', 'error');
    }
}

window.editContact = async function(id) {
    const result = await window.api.contacts.getById(id);
    if (result.success && result.data) {
        const contact = result.data;
        document.getElementById('contact-modal-title').textContent = 'Editar Contacto';
        document.getElementById('contact-id').value = contact.id;
        document.getElementById('contact-name').value = contact.name || '';
        document.getElementById('contact-email').value = contact.email || '';
        document.getElementById('contact-phone').value = contact.phone || '';
        document.getElementById('contact-wechat').value = contact.wechat_id || '';
        document.getElementById('contact-company').value = contact.company || '';
        document.getElementById('contact-tags').value = contact.tags || '';
        document.getElementById('contact-notes').value = contact.notes || '';
        openModal('contact-modal');
    }
};

window.deleteContact = async function(id) {
    if (confirm('Tem a certeza que deseja apagar este contacto?')) {
        const result = await window.api.contacts.delete(id);
        if (result.success) {
            showToast('Contacto apagado', 'success');
            loadContacts();
        } else {
            showToast('Erro ao apagar contacto', 'error');
        }
    }
};

async function importContacts() {
    try {
        const result = await window.api.dialog.openFile({
            filters: [{ name: 'CSV', extensions: ['csv'] }],
            properties: ['openFile']
        });

        if (result.success && !result.data.canceled && result.data.filePaths.length > 0) {
            // Read file content would need additional implementation
            showToast('Funcao de importacao CSV em desenvolvimento', 'warning');
        }
    } catch (error) {
        showToast('Erro ao importar ficheiro', 'error');
    }
}

// ==================== TEMPLATES ====================
async function loadTemplates() {
    try {
        const result = await window.api.templates.getAll();
        if (result.success) {
            templates = result.data;
            renderTemplatesGrid();
        }
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
    }
}

function renderTemplatesGrid() {
    const grid = document.getElementById('templates-grid');

    if (templates.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#128196;</div>
                <h4>Nenhum template encontrado</h4>
                <p>Clique em "Novo Template" para criar</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = templates.map(template => `
        <div class="template-card">
            <div class="template-card-header">
                <h4>${escapeHtml(template.name)}</h4>
                <span class="template-channel ${template.channel}">${template.channel}</span>
            </div>
            <div class="template-preview">${escapeHtml(template.content.substring(0, 150))}...</div>
            <div class="template-actions">
                <button class="btn btn-secondary" onclick="editTemplate('${template.id}')">Editar</button>
                <button class="btn btn-danger" onclick="deleteTemplate('${template.id}')">Apagar</button>
            </div>
        </div>
    `).join('');
}

async function saveTemplate() {
    const id = document.getElementById('template-id').value;
    const template = {
        name: document.getElementById('template-name').value,
        channel: document.getElementById('template-channel').value,
        subject: document.getElementById('template-subject').value,
        content: document.getElementById('template-content').value,
        html_content: document.getElementById('template-html').value
    };

    if (!template.name || !template.content) {
        showToast('Nome e conteudo sao obrigatorios', 'error');
        return;
    }

    try {
        let result;
        if (id) {
            result = await window.api.templates.update(id, template);
        } else {
            result = await window.api.templates.create(template);
        }

        if (result.success) {
            showToast(id ? 'Template atualizado' : 'Template criado', 'success');
            closeModal('template-modal');
            loadTemplates();
        } else {
            showToast(result.error || 'Erro ao guardar', 'error');
        }
    } catch (error) {
        showToast('Erro ao guardar template', 'error');
    }
}

window.editTemplate = async function(id) {
    const result = await window.api.templates.getById(id);
    if (result.success && result.data) {
        const template = result.data;
        document.getElementById('template-modal-title').textContent = 'Editar Template';
        document.getElementById('template-id').value = template.id;
        document.getElementById('template-name').value = template.name || '';
        document.getElementById('template-channel').value = template.channel || 'email';
        document.getElementById('template-subject').value = template.subject || '';
        document.getElementById('template-content').value = template.content || '';
        document.getElementById('template-html').value = template.html_content || '';

        // Show/hide email fields
        const isEmail = template.channel === 'email';
        document.getElementById('template-subject-group').style.display = isEmail ? 'block' : 'none';
        document.getElementById('template-html-group').style.display = isEmail ? 'block' : 'none';

        openModal('template-modal');
    }
};

window.deleteTemplate = async function(id) {
    if (confirm('Tem a certeza que deseja apagar este template?')) {
        const result = await window.api.templates.delete(id);
        if (result.success) {
            showToast('Template apagado', 'success');
            loadTemplates();
        } else {
            showToast('Erro ao apagar template', 'error');
        }
    }
};

// ==================== SEND SECTION ====================
async function loadSendSection() {
    await loadTemplatesForChannel(selectedChannel);
    await loadContactsForSend();
}

async function loadTemplatesForChannel(channel) {
    const select = document.getElementById('send-template');
    const filtered = templates.filter(t => t.channel === channel);

    select.innerHTML = '<option value="">Selecione um template</option>';
    filtered.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
}

async function loadContactsForSend() {
    const list = document.getElementById('send-contacts-list');
    list.innerHTML = contacts.map(contact => `
        <div class="contact-item" onclick="toggleContactSelection('${contact.id}', this)">
            <input type="checkbox" class="send-contact-cb" data-id="${contact.id}">
            <div class="contact-item-info">
                <div class="contact-item-name">${escapeHtml(contact.name)}</div>
                <div class="contact-item-detail">
                    ${contact.email || ''} ${contact.phone ? '| ' + contact.phone : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function filterSendContacts(query) {
    const items = document.querySelectorAll('#send-contacts-list .contact-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const name = item.querySelector('.contact-item-name').textContent.toLowerCase();
        const detail = item.querySelector('.contact-item-detail').textContent.toLowerCase();
        const matches = name.includes(lowerQuery) || detail.includes(lowerQuery);
        item.style.display = matches ? 'flex' : 'none';
    });
}

window.toggleContactSelection = function(id, element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        selectedContacts.add(id);
    } else {
        selectedContacts.delete(id);
    }
};

async function updatePreview() {
    const templateId = document.getElementById('send-template').value;
    const previewBox = document.getElementById('send-preview');

    if (!templateId) {
        previewBox.innerHTML = '<p style="color: var(--text-secondary);">Selecione um template para ver o preview</p>';
        return;
    }

    // Update subject from template
    const template = templates.find(t => t.id === templateId);
    if (template && template.subject) {
        document.getElementById('send-subject').value = template.subject;
    }

    const result = await window.api.templates.preview(templateId, null);
    if (result.success) {
        previewBox.innerHTML = result.data.html_content || `<pre>${escapeHtml(result.data.content)}</pre>`;
    }
}

async function sendPromotion() {
    const templateId = document.getElementById('send-template').value;
    const subject = document.getElementById('send-subject').value;

    // Get selected contacts
    const contactIds = [];
    document.querySelectorAll('.send-contact-cb:checked').forEach(cb => {
        contactIds.push(cb.dataset.id);
    });

    if (!templateId) {
        showToast('Selecione um template', 'error');
        return;
    }

    if (contactIds.length === 0) {
        showToast('Selecione pelo menos um contacto', 'error');
        return;
    }

    // Show progress modal
    openModal('progress-modal');
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = 'A preparar envio...';
    document.getElementById('progress-results').innerHTML = '';
    document.getElementById('btn-close-progress').style.display = 'none';

    try {
        let result;
        switch (selectedChannel) {
            case 'email':
                result = await window.api.send.email({ contactIds, templateId, subject });
                break;
            case 'whatsapp':
                result = await window.api.send.whatsapp({ contactIds, templateId });
                break;
            case 'wechat':
                result = await window.api.send.wechat({ contactIds, templateId });
                break;
        }

        if (result.success) {
            const data = result.data;
            document.getElementById('progress-fill').style.width = '100%';
            document.getElementById('progress-text').textContent =
                `Concluido: ${data.success} de ${data.total} enviados com sucesso`;

            // Show results
            const resultsDiv = document.getElementById('progress-results');
            resultsDiv.innerHTML = data.details.map(d => `
                <div class="result-item ${d.success ? 'success' : 'error'}">
                    <span>${d.contact}</span>
                    <span>${d.success ? 'Enviado' : d.error}</span>
                </div>
            `).join('');

            showToast(`${data.success} mensagens enviadas com sucesso`, 'success');
        } else {
            document.getElementById('progress-text').textContent = 'Erro: ' + result.error;
            showToast(result.error || 'Erro no envio', 'error');
        }
    } catch (error) {
        document.getElementById('progress-text').textContent = 'Erro: ' + error.message;
        showToast('Erro ao enviar promocao', 'error');
    }

    document.getElementById('btn-close-progress').style.display = 'block';
}

// ==================== LOGS ====================
async function loadLogs() {
    const channel = document.getElementById('log-filter-channel').value;
    const status = document.getElementById('log-filter-status').value;

    const filters = { limit: 100 };
    if (channel) filters.channel = channel;
    if (status) filters.status = status;

    try {
        const result = await window.api.logs.getAll(filters);
        if (result.success) {
            renderLogsTable(result.data);
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
}

function renderLogsTable(logs) {
    const tbody = document.getElementById('logs-tbody');

    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128202;</div>
                        <h4>Nenhum log encontrado</h4>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${formatDate(log.sent_at)}</td>
            <td><span class="template-channel ${log.channel}">${log.channel}</span></td>
            <td>${escapeHtml(log.contact_name || '-')}</td>
            <td>${escapeHtml(log.template_name || '-')}</td>
            <td><span class="status-badge ${log.status}">${log.status === 'success' ? 'Sucesso' : 'Erro'}</span></td>
            <td>${escapeHtml(log.error_message || '-')}</td>
        </tr>
    `).join('');
}

async function clearLogs() {
    if (confirm('Tem a certeza que deseja limpar todos os logs?')) {
        const result = await window.api.logs.clear();
        if (result.success) {
            showToast('Logs limpos', 'success');
            loadLogs();
            loadDashboard();
        }
    }
}

// ==================== SETTINGS ====================
async function loadSettings() {
    try {
        const result = await window.api.settings.get();
        if (result.success) {
            const settings = result.data;
            document.getElementById('smtp-host').value = settings.smtp_host || 'smtp.gmail.com';
            document.getElementById('smtp-port').value = settings.smtp_port || '587';
            document.getElementById('smtp-user').value = settings.smtp_user || '';
            document.getElementById('smtp-password').value = settings.smtp_password || '';
            document.getElementById('smtp-from-name').value = settings.smtp_from_name || 'PromoSender';
            document.getElementById('email-delay').value = settings.email_delay_ms || '2000';
            document.getElementById('whatsapp-delay').value = settings.whatsapp_delay_ms || '5000';
            document.getElementById('wechat-delay').value = settings.wechat_delay_ms || '5000';
        }
    } catch (error) {
        console.error('Erro ao carregar definicoes:', error);
    }
}

async function saveSettings() {
    const settings = {
        smtp_host: document.getElementById('smtp-host').value,
        smtp_port: document.getElementById('smtp-port').value,
        smtp_user: document.getElementById('smtp-user').value,
        smtp_password: document.getElementById('smtp-password').value,
        smtp_from_name: document.getElementById('smtp-from-name').value,
        email_delay_ms: document.getElementById('email-delay').value,
        whatsapp_delay_ms: document.getElementById('whatsapp-delay').value,
        wechat_delay_ms: document.getElementById('wechat-delay').value
    };

    try {
        const result = await window.api.settings.update(settings);
        if (result.success) {
            showToast('Definicoes guardadas', 'success');
        } else {
            showToast('Erro ao guardar definicoes', 'error');
        }
    } catch (error) {
        showToast('Erro ao guardar definicoes', 'error');
    }
}

async function testEmailConnection() {
    const email = document.getElementById('smtp-user').value;
    if (!email) {
        showToast('Configure o email primeiro', 'error');
        return;
    }

    showToast('A enviar email de teste...', 'warning');

    const result = await window.api.send.testEmail({
        email: email,
        subject: 'Teste PromoSender',
        content: 'Este e um email de teste do PromoSender. Se voce recebeu, a configuracao esta correta!'
    });

    if (result.success) {
        showToast('Email de teste enviado com sucesso!', 'success');
    } else {
        showToast('Erro: ' + (result.error || 'Falha ao enviar'), 'error');
    }
}

// ==================== CONNECTIONS ====================
async function checkConnectionStatus() {
    // WhatsApp
    const waResult = await window.api.whatsapp.getStatus();
    if (waResult.success) {
        updateWhatsAppStatus(waResult.data);
    }

    // WeChat
    const wcResult = await window.api.wechat.getStatus();
    if (wcResult.success) {
        updateWeChatStatus(wcResult.data);
    }
}

function updateWhatsAppStatus(status) {
    const dot = document.getElementById('whatsapp-status');
    const text = document.getElementById('whatsapp-status-text');
    const connectBtn = document.getElementById('btn-connect-whatsapp');
    const disconnectBtn = document.getElementById('btn-disconnect-whatsapp');

    if (status.isConnected) {
        dot.classList.add('connected');
        text.textContent = status.isReady ? 'Conectado' : 'Aguardando QR Code';
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
        dot.classList.remove('connected');
        text.textContent = 'Desconectado';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
    }
}

function updateWeChatStatus(status) {
    const dot = document.getElementById('wechat-status');
    const text = document.getElementById('wechat-status-text');
    const connectBtn = document.getElementById('btn-connect-wechat');
    const disconnectBtn = document.getElementById('btn-disconnect-wechat');

    if (status.isConnected) {
        dot.classList.add('connected');
        text.textContent = status.isReady ? 'Conectado' : 'Aguardando QR Code';
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
        dot.classList.remove('connected');
        text.textContent = 'Desconectado';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
    }
}

async function connectWhatsApp() {
    showToast('A abrir WhatsApp Web...', 'warning');
    const result = await window.api.whatsapp.connect();
    if (result.success) {
        showToast('WhatsApp Web aberto. Faca scan do QR code.', 'success');
    } else {
        showToast('Erro ao conectar: ' + result.error, 'error');
    }
    checkConnectionStatus();
}

async function disconnectWhatsApp() {
    const result = await window.api.whatsapp.disconnect();
    if (result.success) {
        showToast('WhatsApp desconectado', 'success');
    }
    checkConnectionStatus();
}

async function connectWeChat() {
    showToast('A abrir WeChat Web...', 'warning');
    const result = await window.api.wechat.connect();
    if (result.success) {
        showToast('WeChat Web aberto. Faca scan do QR code.', 'success');
    } else {
        showToast('Erro ao conectar: ' + result.error, 'error');
    }
    checkConnectionStatus();
}

async function disconnectWeChat() {
    const result = await window.api.wechat.disconnect();
    if (result.success) {
        showToast('WeChat desconectado', 'success');
    }
    checkConnectionStatus();
}

// ==================== MENU LISTENERS ====================
function setupMenuListeners() {
    window.api.onMenuImportContacts(() => {
        importContacts();
    });

    window.api.onMenuExportContacts(async () => {
        const result = await window.api.contacts.export();
        if (result.success) {
            // Convert to CSV
            const data = result.data;
            if (data.length === 0) {
                showToast('Nenhum contacto para exportar', 'warning');
                return;
            }

            const headers = ['name', 'email', 'phone', 'wechat_id', 'company', 'tags'];
            let csv = headers.join(',') + '\n';
            data.forEach(contact => {
                csv += headers.map(h => `"${(contact[h] || '').replace(/"/g, '""')}"`).join(',') + '\n';
            });

            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contactos.csv';
            a.click();
            URL.revokeObjectURL(url);

            showToast('Contactos exportados', 'success');
        }
    });

    window.api.onMenuSettings(() => {
        showSection('settings');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-section="settings"]').classList.add('active');
    });
}

// ==================== UTILITIES ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
