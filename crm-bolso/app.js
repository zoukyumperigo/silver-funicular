/* ================================
   CRM de Bolso - App Logic
   ================================ */

// Estado da aplicação
let clients = [];
let currentFilter = 'all';
let editingId = null;

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
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const toast = document.getElementById('toast');

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
        // Filtro por estado
        if (currentFilter !== 'all' && client.status !== currentFilter) {
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

    // Ordenar: mais recentes primeiro
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    if (filtered.length === 0) {
        clientList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <p>${searchTerm ? 'Nenhum resultado encontrado' : 'Ainda não tens clientes'}</p>
                <p style="margin-top: 8px; font-size: 0.9rem;">Carrega no + para adicionar</p>
            </div>
        `;
        return;
    }

    clientList.innerHTML = filtered.map(client => `
        <div class="client-card ${client.status}" data-id="${client.id}">
            <div class="name">${escapeHtml(client.name)}</div>
            ${client.phone ? `<div class="phone">${escapeHtml(client.phone)}</div>` : ''}
            <span class="status-badge ${client.status}">${getStatusLabel(client.status)}</span>
            ${client.notes ? `<div class="notes-preview">${escapeHtml(client.notes)}</div>` : ''}
            ${client.phone ? `<button class="call-btn" data-phone="${escapeHtml(client.phone)}" aria-label="Ligar">📞</button>` : ''}
        </div>
    `).join('');

    // Event listeners nos cards
    document.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('call-btn')) {
                e.stopPropagation();
                const phone = e.target.dataset.phone.replace(/\s/g, '');
                window.location.href = `tel:${phone}`;
                return;
            }
            openEditModal(card.dataset.id);
        });
    });
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
// Modal e Formulário
// ================================

function openNewModal() {
    editingId = null;
    modalTitle.textContent = 'Novo Cliente';
    form.reset();
    deleteBtn.classList.add('hidden');
    historySection.style.display = 'none';

    // Reset status buttons
    statusBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === 'novo');
    });

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
                updatedAt: now
            };

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

// Demo data se vazio
if (clients.length === 0) {
    // Adicionar alguns clientes de exemplo
    clients = [
        {
            id: generateId(),
            name: 'Maria Silva',
            phone: '912 345 678',
            notes: 'Interessada no serviço premium',
            status: 'novo',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            history: []
        },
        {
            id: generateId(),
            name: 'João Santos',
            phone: '963 852 741',
            notes: 'Ligou ontem, enviar proposta',
            status: 'contacto',
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 3600000,
            history: [{
                date: Date.now() - 3600000,
                text: 'Estado: Novo → Em contacto | Nota: Ligou ontem, enviar proposta'
            }]
        },
        {
            id: generateId(),
            name: 'Ana Costa',
            phone: '939 147 258',
            notes: 'Fechou pacote básico',
            status: 'fechado',
            createdAt: Date.now() - 172800000,
            updatedAt: Date.now() - 86400000,
            history: [{
                date: Date.now() - 86400000,
                text: 'Estado: Em contacto → Fechado | Nota: Fechou pacote básico'
            }]
        }
    ];
    saveClients();
    renderClients();
}
