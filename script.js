// Selezioniamo gli elementi del DOM che ci serviranno
const dataForm = document.getElementById('dataForm');
const itemIdInput = document.getElementById('itemId');
const itemNameInput = document.getElementById('itemName');
const itemValueInput = document.getElementById('itemValue');
const phoneNumberInput = document.getElementById('phoneNumber');
const submitButton = document.getElementById('submitButton');
const cancelButton = document.getElementById('cancelEditButton');
const tableBody = document.getElementById('tableBody');
const formTitle = document.getElementById('form-title');

// Elementi della modale di conferma
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteButton = document.getElementById('confirmDelete');
const cancelDeleteButton = document.getElementById('cancelDelete');

let items = []; // Array che conterrà tutti i nostri dati
let editingItemId = null; // Variabile per tenere traccia dell'ID dell'elemento in modifica
let itemToDeleteId = null; // Variabile per tenere traccia dell'ID dell'elemento da eliminare

// --- Funzioni per la gestione dei dati ---

/**
 * Carica i dati dal localStorage o inizializza un array vuoto.
 */
function loadItems() {
    const storedItems = localStorage.getItem('dashboardItems');
    if (storedItems) {
        items = JSON.parse(storedItems); // Convertiamo la stringa JSON in un array JavaScript
    } else {
        // Dati di esempio se il localStorage è vuoto
        items = [
            { id: Date.now() + 1, name: 'Elemento A', value: 100, phone: '3331234567' },
            { id: Date.now() + 2, name: 'Elemento B', value: 250, phone: '3339876543' },
            { id: Date.now() + 3, name: 'Elemento C', value: 75, phone: '3335555555' }
        ];
    }
    renderTable(); // Una volta caricati, visualizziamo i dati nella tabella
}

/**
 * Salva l'array 'items' nel localStorage.
 */
function saveItems() {
    localStorage.setItem('dashboardItems', JSON.stringify(items)); // Convertiamo l'array in stringa JSON
}

/**
 * Renderizza (disegna) la tabella con i dati attuali.
 */
function renderTable() {
    tableBody.innerHTML = ''; // Puliamo il corpo della tabella prima di riempirlo

    if (items.length === 0) {
        // Mostra un messaggio se non ci sono elementi
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `
            <td colspan="5" class="py-3 px-6 text-center">Nessun dato disponibile. Aggiungi un elemento!</td>
        `;
        tableBody.appendChild(noDataRow);
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-hover-bg-color', 'transition-colors', 'duration-200');

        row.innerHTML = `
            <td class="py-3 px-6">${item.id}</td>
            <td class="py-3 px-6">${item.name}</td>
            <td class="py-3 px-6">${item.value}</td>
            <td class="py-3 px-6">${item.phone || 'N/D'}</td>
            <td class="py-3 px-6 text-center">
                <button data-id="${item.id}" class="gradient-button edit-btn">
                    Modifica
                </button>
                <button data-id="${item.id}" class="gradient-button delete-btn ml-2">
                    Elimina
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function validatePhoneNumber(phone) {
    // Rimuove spazi e caratteri non numerici
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
}

function showError(message) {
    const tempAlertContainer = document.createElement('div');
    tempAlertContainer.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background-color: #fecaca; color: #991b1b; padding: 1rem; border-radius: 0.375rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index:1001;';
    tempAlertContainer.textContent = message;
    document.body.appendChild(tempAlertContainer);
    setTimeout(() => tempAlertContainer.remove(), 3000);
}

/**
 * Gestisce l'invio del form (aggiunta o modifica di un elemento).
 * @param {Event} event - L'evento di submit del form.
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const name = itemNameInput.value.trim();
    const value = parseFloat(itemValueInput.value);
    const phone = phoneNumberInput.value.trim();

    // Validazione migliorata
    if (!name) {
        showError('Il nome è obbligatorio.');
        itemNameInput.focus();
        return;
    }

    if (isNaN(value) || value < 0) {
        showError('Inserisci un valore numerico valido.');
        itemValueInput.focus();
        return;
    }

    if (!validatePhoneNumber(phone)) {
        showError('Inserisci un numero di telefono valido di 10 cifre.');
        phoneNumberInput.focus();
        return;
    }

    // Formatta il numero di telefono
    const formattedPhone = phone.replace(/\D/g, '');

    if (editingItemId) {
        const itemIndex = items.findIndex(item => item.id === editingItemId);
        if (itemIndex !== -1) {
            items[itemIndex] = {
                ...items[itemIndex],
                name: name,
                value: value,
                phone: formattedPhone
            };
        }
        editingItemId = null;
        submitButton.textContent = 'Aggiungi Elemento';
        formTitle.textContent = 'Aggiungi Nuovo Elemento';
        cancelButton.classList.add('hidden');
    } else {
        const newItem = {
            id: Date.now(),
            name: name,
            value: value,
            phone: formattedPhone
        };
        items.push(newItem);
    }

    saveItems();
    renderTable();
    dataForm.reset();
}

/**
 * Prepara il form per la modifica di un elemento.
 * @param {number} id - L'ID dell'elemento da modificare.
 */
function editItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        itemIdInput.value = item.id; // Anche se nascosto, può essere utile
        itemNameInput.value = item.name;
        itemValueInput.value = item.value;
        phoneNumberInput.value = item.phone || '';
        editingItemId = item.id; // Impostiamo l'ID dell'elemento in modifica

        submitButton.textContent = 'Salva Modifiche'; // Cambiamo il testo del bottone
        formTitle.textContent = 'Modifica Elemento'; // Cambiamo il titolo del form
        cancelButton.classList.remove('hidden'); // Mostriamo il bottone Annulla
        itemNameInput.focus(); // Porta il focus al primo campo per comodità
    }
}

/**
 * Mostra la modale di conferma per l'eliminazione.
 * @param {number} id - L'ID dell'elemento da eliminare.
 */
function confirmDeleteItem(id) {
    itemToDeleteId = id;
    confirmModal.classList.remove('hidden'); // Mostra la modale
}

/**
 * Elimina un elemento dall'array e aggiorna la tabella.
 */
function deleteItem() {
    if (itemToDeleteId !== null) {
        items = items.filter(item => item.id !== itemToDeleteId);
        saveItems();
        renderTable();
        itemToDeleteId = null; // Resetta l'ID dell'elemento da eliminare
    }
    confirmModal.classList.add('hidden'); // Nasconde la modale
}

/**
 * Annulla la modifica e resetta il form.
 */
function cancelEdit() {
    editingItemId = null;
    dataForm.reset();
    submitButton.textContent = 'Aggiungi Elemento';
    formTitle.textContent = 'Aggiungi Nuovo Elemento';
    cancelButton.classList.add('hidden');
}

// --- Gestione degli Eventi ---

// Event listener per il submit del form
dataForm.addEventListener('submit', handleFormSubmit);

// Event listener per il click sui bottoni "Modifica" ed "Elimina" nella tabella
// Usiamo l'event delegation per gestire i click su bottoni che vengono aggiunti dinamicamente
tableBody.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('edit-btn')) {
        const id = parseInt(target.dataset.id);
        editItem(id);
    } else if (target.classList.contains('delete-btn')) {
        const id = parseInt(target.dataset.id);
        confirmDeleteItem(id);
    }
});

// Event listener per il bottone "Annulla Modifica"
cancelButton.addEventListener('click', cancelEdit);

// Event listener per i bottoni della modale di conferma
confirmDeleteButton.addEventListener('click', deleteItem);
cancelDeleteButton.addEventListener('click', () => {
    confirmModal.classList.add('hidden'); // Nasconde la modale
    itemToDeleteId = null; // Resetta l'ID
});

// --- Inizializzazione ---

// Carichiamo i dati all'avvio dell'applicazione
document.addEventListener('DOMContentLoaded', loadItems);

