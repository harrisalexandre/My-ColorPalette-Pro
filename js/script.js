// ColorPalette Pro - Script Completo Atualizado
let editingIndex = -1;
let showAllRecent = false;
const MAX_RECENT_COLORS = 5;

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    renderTable();
    setupEventListeners();
});

// Configura listeners
function setupEventListeners() {
    // Evento de toque para mobile
    if (isMobile()) {
        document.addEventListener('click', function(e) {
            if (!e.target.closest('tr') || e.target.closest('.row-actions')) {
                document.querySelectorAll('tr').forEach(row => {
                    row.classList.remove('show-actions');
                });
            }
        });
    }
    
    // Enter nos campos do formulário
    document.getElementById('colorName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addOrUpdateColor();
    });
    document.getElementById('brand').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addOrUpdateColor();
    });
    document.getElementById('hexCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addOrUpdateColor();
    });
}

// Função de ordenação aprimorada
function sortColors(colorsArray) {
    return [...colorsArray].sort((a, b) => {
        const numA = extractLeadingNumber(a.name);
        const numB = extractLeadingNumber(b.name);
        
        // Ambos têm números
        if (numA !== null && numB !== null) return numA - numB;
        
        // Apenas A tem número
        if (numA !== null) return -1;
        
        // Apenas B tem número
        if (numB !== null) return 1;
        
        // Nenhum tem número - ordena alfabeticamente
        return a.name.localeCompare(b.name);
    });
}

// Extrai número do início do nome
function extractLeadingNumber(str) {
    const match = str.match(/^\d+/);
    return match ? parseInt(match[0]) : null;
}

// Encontra posição correta para nova cor
function findInsertPosition(newColor) {
    const newColorNum = extractLeadingNumber(newColor.name);
    
    for (let i = 0; i < colors.length; i++) {
        const currentNum = extractLeadingNumber(colors[i].name);
        
        if (newColorNum !== null && currentNum !== null) {
            if (newColorNum < currentNum) return i;
        } 
        else if (newColorNum !== null) {
            return i;
        } 
        else if (currentNum === null) {
            if (newColor.name.localeCompare(colors[i].name) < 0) return i;
        }
    }
    
    return colors.length;
}

// Renderiza a tabela
function renderTable() {
    const tableBody = document.getElementById("colorTable");
    tableBody.innerHTML = "";

    // Mantém a lista ordenada
    const sortedColors = sortColors(colors);

    sortedColors.forEach((color, index) => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td><div class="color-box" style="background:${color.hex || '#fff'}; border-color: ${getContrastColor(color.hex)}"></div></td>
            <td>${color.name}</td>
            <td>${color.brand}</td>
            <td>${color.hex || "-"}</td>
            <td class="row-actions">
                <button class="edit-btn" data-index="${index}">Editar</button>
                <button class="delete-btn" data-index="${index}">Excluir</button>
            </td>
        `;
        
        if (isMobile()) {
            row.addEventListener('click', function(e) {
                if (!e.target.closest('.row-actions')) {
                    document.querySelectorAll('tr').forEach(r => r.classList.remove('show-actions'));
                    this.classList.add('show-actions');
                }
            });
        }
        
        tableBody.appendChild(row);
    });

    addButtonEvents();
    updateColorCounter();
    renderRecentColors();
}

// Adiciona eventos aos botões
function addButtonEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            editColor(parseInt(this.getAttribute('data-index')));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteColor(parseInt(this.getAttribute('data-index')));
        });
    });
}

// Atualiza o contador
function updateColorCounter() {
    const counter = document.getElementById("colorCounter");
    if (counter) {
        const count = colors.length;
        counter.textContent = `Que legal! Já temos ${count} ${count === 1 ? 'cor' : 'cores'} cadastradas!`;
    }
}

// Renderiza cores recentes
function renderRecentColors() {
    const recentColorsList = document.getElementById("recentColorsList");
    if (!recentColorsList) return;
    
    recentColorsList.innerHTML = "";
    const recentColors = [...colors].reverse().slice(0, showAllRecent ? colors.length : MAX_RECENT_COLORS);

    recentColors.forEach(color => {
        const item = document.createElement("div");
        item.className = "recent-color-item";
        item.innerHTML = `
            <div class="recent-color-swatch" style="background:${color.hex || '#fff'}; border-color: ${getContrastColor(color.hex)}"></div>
            <span class="recent-color-name">${color.name}</span>
        `;
        item.addEventListener('click', () => {
            document.getElementById('colorName').value = color.name;
            document.getElementById('brand').value = color.brand;
            document.getElementById('hexCode').value = color.hex || '';
            if (!document.querySelector('.form-content').classList.contains('open')) {
                toggleForm();
            }
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        });
        recentColorsList.appendChild(item);
    });
}

// Alterna mostrar todas as cores recentes
function toggleAllColors() {
    showAllRecent = !showAllRecent;
    renderRecentColors();
    const btn = document.getElementById("viewAllBtn");
    if (btn) {
        btn.textContent = showAllRecent ? "Ver menos" : "Ver todas";
    }
}

// Alterna o formulário
function toggleForm() {
    const formContent = document.querySelector(".form-content");
    formContent.classList.toggle("open");
    
    const toggleIcon = document.querySelector(".form-toggle span:last-child");
    toggleIcon.textContent = formContent.classList.contains("open") ? "▲" : "▼";
}

// Adiciona/edita cor
function addOrUpdateColor() {
    const name = document.getElementById("colorName").value.trim();
    const brand = document.getElementById("brand").value.trim();
    let hex = document.getElementById("hexCode").value.trim();

    if (!name || !brand) {
        alert("Nome e marca da cor são obrigatórios.");
        return;
    }

    if (hex && !hex.startsWith("#")) {
        hex = `#${hex}`;
    }

    const colorEntry = { name, brand, hex: hex || undefined };

    if (editingIndex >= 0) {
        colors[editingIndex] = colorEntry;
        editingIndex = -1;
    } else {
        const insertAt = findInsertPosition(colorEntry);
        colors.splice(insertAt, 0, colorEntry);
    }

    document.getElementById("colorName").value = "";
    document.getElementById("brand").value = "";
    document.getElementById("hexCode").value = "";
    
    renderTable();
}

// Edita cor
function editColor(index) {
    const color = colors[index];
    document.getElementById("colorName").value = color.name;
    document.getElementById("brand").value = color.brand;
    document.getElementById("hexCode").value = color.hex || "";
    editingIndex = index;
    
    if (!document.querySelector(".form-content").classList.contains("open")) {
        toggleForm();
    }
    
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Remove cor
function deleteColor(index) {
    if (confirm("Tem certeza de que deseja excluir esta cor?")) {
        colors.splice(index, 1);
        renderTable();
    }
}

// Calcula cor de contraste para borda
function getContrastColor(hex) {
    if (!hex) return '#ccc';
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)';
}

// Verifica se é mobile
function isMobile() {
    return window.innerWidth <= 768;
}