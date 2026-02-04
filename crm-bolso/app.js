/* ================================
   CRM de Bolso v2 - App Logic
   Novas funcionalidades:
   - Ações rápidas (WhatsApp, SMS)
   - Lembretes simples
   - Favoritos
   - Exportação CSV
   ================================ */

// Estado da aplicação
let clients = [];
let currentFilter = 'all';
let editingId = null;
let selectedReminder = 'none';

// Elementos DOM
const clientList = document.getElementById('client-list');
const searchInput = document.getElementById('search');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const form = document.getElementById('client-form');
const addBtn = document.getElementById('add-btn');
const closeModalBtn = document.getElementById('close-modal');
const deleteBtn = document.getElementById('delete-btn');
const filterBtns = document.querySelectorAll('.filter');
const statusBtns = document.querySelectorAll('.status-btn');
const reminderBtns = document.querySelectorAll('.reminder-btn');
const reminderInfo = document.getElementById('reminder-info');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const toast = document.getElementById('toast');
const exportBtn = document.getElementById('export-btn');

// ================================
// LocalStorage
// ================================

function loadClients() {
    const saved = localStorage.getItem('crm-clients');
    if (saved) {
        clients = JSON.parse(saved);
    }
}

function saveClients() {
    localStorage.setItem('crm-clients', JSON.stringify(clients));
}

// ================================
// Renderização
// ================================

function renderClients() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    let filtered = clients.filter(client => {
        // Filtro por favoritos
        if (currentFilter === 'favoritos' && !client.favorite) {
            return false;
        }
        // Filtro por lembretes pendentes
        if (currentFilter === 'pendentes') {
            if (!client.reminder || client.reminder <= Date.now()) {
                // Mostrar se tem lembrete vencido ou próximo (próximas 24h)
                const hasActiveReminder = client.reminder && client.reminder > 0;
                if (!hasActiveReminder) return false;
            }
        }
        // Filtro por estado
        if (['novo', 'contacto', 'fechado'].includes(currentFilter) && client.status !== currentFilter) {
            return false;
        }
        // Filtro por pesquisa
        if (searchTerm) {
            const searchFields = [
                client.name,
                client.phone,
                client.notes
            ].join(' ').toLowerCase();
            return searchFields.includes(searchTerm);
        }
        return true;
    });

    // Ordenar: favoritos primeiro, depois por data de atualização
    filtered.sort((a, b) => {
        // Favoritos primeiro
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        // Lembretes urgentes
        if (a.reminder && b.reminder) {
            if (a.reminder < b.reminder) return -1;
            if (a.reminder > b.reminder) return 1;
        }
        if (a.reminder && !b.reminder) return -1;
        if (!a.reminder && b.reminder) return 1;
        // Mais recentes
        return b.updatedAt - a.updatedAt;
    });

    if (filtered.length === 0) {
        const emptyMessages = {
            'all': 'Ainda não tens clientes',
            'favoritos': 'Sem clientes favoritos',
            'pendentes': 'Sem lembretes pendentes',
            'novo': 'Sem clientes novos',
            'contacto': 'Sem clientes em contacto',
            'fechado': 'Sem clientes fechados'
        };
        clientList.innerHTML = `
            <div class="empty-state">
                <div class="icon">${currentFilter === 'favoritos' ? '⭐' : currentFilter === 'pendentes' ? '🔔' : '📋'}</div>
                <p>${searchTerm ? 'Nenhum resultado encontrado' : emptyMessages[currentFilter]}</p>
                <p style="margin-top: 8px; font-size: 0.9rem;">Carrega no + para adicionar</p>
            </div>
        `;
        return;
    }

    clientList.innerHTML = filtered.map(client => {
        const reminderBadge = getReminderBadge(client);
        const phone = client.phone ? client.phone.replace(/\s/g, '') : '';

        return `
        <div class="client-card ${client.status} ${client.favorite ? 'is-favorite' : ''}" data-id="${client.id}">
            <span class="favorite-star ${client.favorite ? 'active' : ''}" data-id="${client.id}">⭐</span>
            <div class="name">${escapeHtml(client.name)}${reminderBadge}</div>
            ${client.phone ? `<div class="phone">${escapeHtml(client.phone)}</div>` : ''}
            <span class="status-badge ${client.status}">${getStatusLabel(client.status)}</span>
            ${client.notes ? `<div class="notes-preview">${escapeHtml(client.notes)}</div>` : ''}
            ${phone ? `
            <div class="quick-actions">
                <button class="action-btn call" data-action="call" data-phone="${phone}" aria-label="Ligar">📞</button>
                <button class="action-btn whatsapp" data-action="whatsapp" data-phone="${phone}" aria-label="WhatsApp">💬</button>
                <button class="action-btn sms" data-action="sms" data-phone="${phone}" aria-label="SMS">✉️</button>
            </div>
            ` : ''}
        </div>
    `}).join('');

    // Event listeners nos cards
    document.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Ações rápidas
            if (e.target.classList.contains('action-btn')) {
                e.stopPropagation();
                handleQuickAction(e.target);
                return;
            }
            // Toggle favorito
            if (e.target.classList.contains('favorite-star')) {
                e.stopPropagation();
                toggleFavorite(e.target.dataset.id);
                return;
            }
            openEditModal(card.dataset.id);
        });
    });
}

function getReminderBadge(client) {
    if (!client.reminder) return '';

    const now = Date.now();
    const isOverdue = client.reminder < now;
    const timeLeft = client.reminder - now;

    let text = '';
    if (isOverdue) {
        text = 'Atrasado!';
    } else if (timeLeft < 3600000) { // < 1 hora
        text = 'Em breve';
    } else if (timeLeft < 86400000) { // < 24 horas
        const hours = Math.floor(timeLeft / 3600000);
        text = `${hours}h`;
    } else {
        const days = Math.floor(timeLeft / 86400000);
        text = `${days}d`;
    }

    return `<span class="reminder-badge ${isOverdue ? 'overdue' : ''}">🔔 ${text}</span>`;
}

function handleQuickAction(btn) {
    const action = btn.dataset.action;
    const phone = btn.dataset.phone;

    switch(action) {
        case 'call':
            window.location.href = `tel:${phone}`;
            showToast('A ligar...');
            break;
        case 'whatsapp':
            // Remove o + se existir para o link do WhatsApp
            const waPhone = phone.replace('+', '');
            window.open(`https://wa.me/${waPhone}`, '_blank');
            showToast('A abrir WhatsApp...');
            break;
        case 'sms':
            window.location.href = `sms:${phone}`;
            showToast('A abrir SMS...');
            break;
    }
}

function toggleFavorite(id) {
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
        clients[index].favorite = !clients[index].favorite;
        clients[index].updatedAt = Date.now();
        saveClients();
        renderClients();
        showToast(clients[index].favorite ? '⭐ Adicionado aos favoritos' : 'Removido dos favoritos');
    }
}

function getStatusLabel(status) {
    const labels = {
        'novo': 'Novo',
        'contacto': 'Em contacto',
        'fechado': 'Fechado'
    };
    return labels[status] || status;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================================
// Lembretes
// ================================

function calculateReminderTime(option) {
    const now = new Date();

    switch(option) {
        case 'today':
            // Hoje às 18h
            const today18 = new Date(now);
            today18.setHours(18, 0, 0, 0);
            if (today18 <= now) {
                today18.setDate(today18.getDate() + 1);
            }
            return today18.getTime();

        case 'tomorrow':
            // Amanhã às 9h
            const tomorrow9 = new Date(now);
            tomorrow9.setDate(tomorrow9.getDate() + 1);
            tomorrow9.setHours(9, 0, 0, 0);
            return tomorrow9.getTime();

        case '3days':
            // Daqui a 3 dias às 9h
            const in3days = new Date(now);
            in3days.setDate(in3days.getDate() + 3);
            in3days.setHours(9, 0, 0, 0);
            return in3days.getTime();

        case 'week':
            // Daqui a 1 semana às 9h
            const inWeek = new Date(now);
            inWeek.setDate(inWeek.getDate() + 7);
            inWeek.setHours(9, 0, 0, 0);
            return inWeek.getTime();

        default:
            return null;
    }
}

function formatReminderDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('pt-PT', options);
}

function updateReminderInfo() {
    if (selectedReminder === 'none') {
        reminderInfo.classList.add('hidden');
        return;
    }

    const time = calculateReminderTime(selectedReminder);
    if (time) {
        reminderInfo.textContent = `🔔 Lembrete: ${formatReminderDate(time)}`;
        reminderInfo.classList.remove('hidden');
    }
}

// ================================
// Modal e Formulário
// ================================

function openNewModal() {
    editingId = null;
    modalTitle.textContent = 'Novo Cliente';
    form.reset();
    deleteBtn.classList.add('hidden');
    historySection.style.display = 'none';
    selectedReminder = 'none';

    // Reset status buttons
    statusBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === 'novo');
    });

    // Reset reminder buttons
    reminderBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.reminder === 'none');
    });
    reminderInfo.classList.add('hidden');

    modal.classList.remove('hidden');
    document.getElementById('name').focus();
}

function openEditModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    editingId = id;
    modalTitle.textContent = 'Editar Cliente';
    deleteBtn.classList.remove('hidden');

    // Preencher formulário
    document.getElementById('client-id').value = client.id;
    document.getElementById('name').value = client.name;
    document.getElementById('phone').value = client.phone || '';
    document.getElementById('notes').value = client.notes || '';

    // Status buttons
    statusBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === client.status);
    });

    // Reminder buttons
    selectedReminder = 'none';
    if (client.reminder && client.reminder > Date.now()) {
        // Tentar descobrir qual era a opção original (aproximado)
        selectedReminder = 'custom';
        reminderInfo.textContent = `🔔 Lembrete: ${formatReminderDate(client.reminder)}`;
        reminderInfo.classList.remove('hidden');
    } else {
        reminderInfo.classList.add('hidden');
    }
    reminderBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (selectedReminder === 'none' || selectedReminder === 'custom') {
        document.querySelector('.reminder-btn[data-reminder="none"]').classList.add('active');
    }

    // Histórico
    if (client.history && client.history.length > 0) {
        historySection.style.display = 'block';
        historyList.innerHTML = client.history.map(h => `
            <div class="history-item">
                <div class="date">${formatDate(h.date)}</div>
                <div>${escapeHtml(h.text)}</div>
            </div>
        `).join('');
    } else {
        historySection.style.display = 'none';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    editingId = null;
}

function getSelectedStatus() {
    const activeBtn = document.querySelector('.status-btn.active');
    return activeBtn ? activeBtn.dataset.status : 'novo';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ================================
// CRUD Operations
// ================================

function saveClient(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const status = getSelectedStatus();
    const reminder = selectedReminder !== 'none' ? calculateReminderTime(selectedReminder) : null;

    if (!name) {
        showToast('Nome é obrigatório');
        return;
    }

    const now = Date.now();

    if (editingId) {
        // Editar existente
        const index = clients.findIndex(c => c.id === editingId);
        if (index !== -1) {
            const oldClient = clients[index];
            const changes = [];

            if (oldClient.status !== status) {
                changes.push(`Estado: ${getStatusLabel(oldClient.status)} → ${getStatusLabel(status)}`);
            }
            if (oldClient.notes !== notes && notes) {
                changes.push(`Nota: ${notes}`);
            }
            if (reminder && (!oldClient.reminder || oldClient.reminder !== reminder)) {
                changes.push(`Lembrete: ${formatReminderDate(reminder)}`);
            }

            // Adicionar ao histórico se houve mudanças
            if (changes.length > 0) {
                if (!clients[index].history) {
                    clients[index].history = [];
                }
                clients[index].history.unshift({
                    date: now,
                    text: changes.join(' | ')
                });
                // Limitar histórico a 20 entradas
                clients[index].history = clients[index].history.slice(0, 20);
            }

            clients[index] = {
                ...clients[index],
                name,
                phone,
                notes,
                status,
                reminder: reminder || clients[index].reminder,
                updatedAt: now
            };

            // Se selecionou "none", remover lembrete
            if (selectedReminder === 'none') {
                delete clients[index].reminder;
            }

            showToast('Cliente atualizado');
        }
    } else {
        // Novo cliente
        const newClient = {
            id: generateId(),
            name,
            phone,
            notes,
            status,
            reminder,
            favorite: false,
            createdAt: now,
            updatedAt: now,
            history: []
        };
        clients.unshift(newClient);
        showToast('Cliente adicionado');
    }

    saveClients();
    renderClients();
    closeModal();
}

function deleteClient() {
    if (!editingId) return;

    if (confirm('Eliminar este cliente?')) {
        clients = clients.filter(c => c.id !== editingId);
        saveClients();
        renderClients();
        closeModal();
        showToast('Cliente eliminado');
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ================================
// Exportação CSV
// ================================

function exportToCSV() {
    if (clients.length === 0) {
        showToast('Sem clientes para exportar');
        return;
    }

    const headers = ['Nome', 'Telefone', 'Estado', 'Notas', 'Favorito', 'Lembrete', 'Criado em'];
    const rows = clients.map(c => [
        c.name,
        c.phone || '',
        getStatusLabel(c.status),
        c.notes || '',
        c.favorite ? 'Sim' : 'Não',
        c.reminder ? formatReminderDate(c.reminder) : '',
        formatDate(c.createdAt)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `crm-bolso-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`${clients.length} clientes exportados`);
}

// ================================
// Filtros
// ================================

function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderClients();
}

// ================================
// Toast
// ================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2000);
}

// ================================
// Notificações de Lembretes
// ================================

function checkReminders() {
    const now = Date.now();
    const upcoming = clients.filter(c =>
        c.reminder &&
        c.reminder > now &&
        c.reminder - now < 3600000 // próxima hora
    );

    if (upcoming.length > 0 && Notification.permission === 'granted') {
        upcoming.forEach(client => {
            // Verificar se já notificamos (usar localStorage)
            const notifiedKey = `notified-${client.id}-${client.reminder}`;
            if (!localStorage.getItem(notifiedKey)) {
                new Notification('CRM de Bolso', {
                    body: `Lembrete: ${client.name}`,
                    icon: 'icon.svg',
                    tag: client.id
                });
                localStorage.setItem(notifiedKey, 'true');
            }
        });
    }
}

// Pedir permissão para notificações
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ================================
// Event Listeners
// ================================

// Adicionar cliente
addBtn.addEventListener('click', openNewModal);

// Fechar modal
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Guardar cliente
form.addEventListener('submit', saveClient);

// Eliminar cliente
deleteBtn.addEventListener('click', deleteClient);

// Exportar
exportBtn.addEventListener('click', exportToCSV);

// Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Status buttons no modal
statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        statusBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Reminder buttons no modal
reminderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        reminderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedReminder = btn.dataset.reminder;
        updateReminderInfo();
    });
});

// Pesquisa com debounce
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderClients, 200);
});

// Keyboard: ESC fecha modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// ================================
// Service Worker (PWA)
// ================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('SW registered'))
        .catch(err => console.log('SW error:', err));
}

// ================================
// Init
// ================================

loadClients();
renderClients();
requestNotificationPermission();

// Verificar lembretes a cada minuto
setInterval(checkReminders, 60000);
checkReminders();

// Demo data se vazio
if (clients.length === 0) {
    const now = Date.now();
    clients = [
        {
            id: generateId(),
            name: 'Maria Silva',
            phone: '912 345 678',
            notes: 'Interessada no serviço premium',
            status: 'novo',
            favorite: true,
            reminder: now + 3600000, // 1 hora
            createdAt: now,
            updatedAt: now,
            history: []
        },
        {
            id: generateId(),
            name: 'João Santos',
            phone: '963 852 741',
            notes: 'Ligou ontem, enviar proposta',
            status: 'contacto',
            favorite: false,
            reminder: now + 86400000, // amanhã
            createdAt: now - 86400000,
            updatedAt: now - 3600000,
            history: [{
                date: now - 3600000,
                text: 'Estado: Novo → Em contacto | Nota: Ligou ontem, enviar proposta'
            }]
        },
        {
            id: generateId(),
            name: 'Ana Costa',
            phone: '939 147 258',
            notes: 'Fechou pacote básico',
            status: 'fechado',
            favorite: false,
            createdAt: now - 172800000,
            updatedAt: now - 86400000,
            history: [{
                date: now - 86400000,
                text: 'Estado: Em contacto → Fechado | Nota: Fechou pacote básico'
            }]
        }
    ];
    saveClients();
    renderClients();
}
