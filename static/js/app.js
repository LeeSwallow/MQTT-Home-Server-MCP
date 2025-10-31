// API Base URL
const API_BASE = window.location.origin;

// State
let currentDevice = null;
let currentDeviceData = null;
let actuators = [];
let sensors = [];
let editTarget = null; // { type: 'device'|'actuator'|'sensor', id: number|string }
let currentPage = 0; // API는 0부터 시작
let pageSize = 6;
let totalPages = 0;

// DOM Elements
const deviceListPage = document.getElementById('device-list-page');
const deviceListGrid = document.getElementById('device-list-grid');
const devicePagination = document.getElementById('device-pagination');
const pageInfoText = document.getElementById('page-info-text');
const dashboard = document.getElementById('dashboard');
const actuatorsGrid = document.getElementById('actuators-grid');
const sensorsGrid = document.getElementById('sensors-grid');
const actuatorCount = document.getElementById('actuator-count');
const sensorCount = document.getElementById('sensor-count');
const toast = document.getElementById('toast');
const backBtn = document.getElementById('back-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check if there's a device in URL
    const urlParams = new URLSearchParams(window.location.search);
    const deviceCode = urlParams.get('device');
    
    if (deviceCode) {
        await showDeviceDetail(deviceCode);
    } else {
        await loadDeviceList(currentPage);
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const deviceCode = urlParams.get('device');
        
        if (deviceCode) {
            showDeviceDetail(deviceCode);
        } else {
            loadDeviceList(currentPage);
        }
    });
});

// Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// API Calls
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showToast('API 호출 실패: ' + error.message, 'error');
        throw error;
    }
}

// Load Device List with Pagination
async function loadDeviceList(page = 0) {
    try {
        currentPage = page;
        const data = await apiCall(`${API_BASE}/api/v1/devices/pagination?page=${page}&size=${pageSize}`);
        
        totalPages = data.total_pages;
        
        // Update page info (display as 1-based for users)
        pageInfoText.textContent = `총 ${data.total_items}개 기기 (${page + 1} / ${totalPages} 페이지)`;
        
        // Render device cards
        if (data.contents.length === 0) {
            deviceListGrid.innerHTML = '<div class="empty-state"><p>등록된 기기가 없습니다</p></div>';
        } else {
            deviceListGrid.innerHTML = '';
            data.contents.forEach(device => {
                const card = createDeviceCard(device);
                deviceListGrid.appendChild(card);
            });
        }
        
        // Render pagination
        renderPagination();
        
        // Show device list, hide dashboard
        deviceListPage.style.display = 'block';
        dashboard.style.display = 'none';
        backBtn.style.display = 'none';
        
        // Update URL
        window.history.pushState({}, '', '/');
        
    } catch (error) {
        showToast('기기 목록을 불러오는데 실패했습니다', 'error');
    }
}

// Create Device Card
function createDeviceCard(device) {
    const card = document.createElement('div');
    card.className = 'device-card';
    card.onclick = () => showDeviceDetail(device.device_code);
    
    card.innerHTML = `
        <div class="device-card-header">
            <div>
                <div class="device-card-title">${device.name || '이름 없음'}</div>
                <div class="device-card-code">${device.device_code}</div>
            </div>
        </div>
        <div class="device-card-description">
            ${device.description || '설명이 없습니다'}
        </div>
    `;
    
    return card;
}

// Render Pagination
function renderPagination() {
    if (totalPages <= 1) {
        devicePagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button class="pagination-btn" onclick="loadDeviceList(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>
        ◀ 이전
    </button>`;
    
    // Page numbers (0-based internally, 1-based display)
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    if (startPage > 0) {
        html += `<button class="pagination-btn" onclick="loadDeviceList(0)">1</button>`;
        if (startPage > 1) {
            html += `<span class="pagination-info">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadDeviceList(${i})">${i + 1}</button>`;
    }
    
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            html += `<span class="pagination-info">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="loadDeviceList(${totalPages - 1})">${totalPages}</button>`;
    }
    
    // Next button
    html += `<button class="pagination-btn" onclick="loadDeviceList(${currentPage + 1})" ${currentPage === totalPages - 1 ? 'disabled' : ''}>
        다음 ▶
    </button>`;
    
    devicePagination.innerHTML = html;
}

// Show Device Detail
async function showDeviceDetail(deviceCode) {
    currentDevice = deviceCode;
    
    // Hide device list, show dashboard
    deviceListPage.style.display = 'none';
    dashboard.style.display = 'flex';
    backBtn.style.display = 'flex';
    
    // Update URL
    window.history.pushState({}, '', `/?device=${deviceCode}`);
    
    await loadDeviceData(deviceCode);
}

// Go back to device list
function goToDeviceList() {
    loadDeviceList(currentPage);
}

// Load Device Data
async function loadDeviceData(deviceCode) {
    try {
        // Load device info, actuators and sensors in parallel
        const [deviceData, actuatorsData, sensorsData] = await Promise.all([
            apiCall(`${API_BASE}/api/v1/devices/${deviceCode}`),
            apiCall(`${API_BASE}/api/v1/devices/${deviceCode}/actuators/`),
            apiCall(`${API_BASE}/api/v1/devices/${deviceCode}/sensors/`)
        ]);
        
        currentDeviceData = deviceData;
        actuators = actuatorsData;
        sensors = sensorsData;
        
        renderDeviceInfo();
        renderActuators();
        renderSensors();
        
        showToast('기기 데이터를 불러왔습니다', 'success');
    } catch (error) {
        showToast('기기 데이터를 불러오는데 실패했습니다', 'error');
    }
}

// Render Device Info
function renderDeviceInfo() {
    if (!currentDeviceData) return;
    
    document.getElementById('device-name').textContent = currentDeviceData.name || '이름 없음';
    document.getElementById('device-code').textContent = currentDeviceData.device_code || '-';
    document.getElementById('device-description').textContent = currentDeviceData.description || '설명 없음';
}

// Render Actuators
function renderActuators() {
    actuatorCount.textContent = actuators.length;
    
    if (actuators.length === 0) {
        actuatorsGrid.innerHTML = '<div class="empty-state"><p>액추에이터가 없습니다</p></div>';
        return;
    }
    
    actuatorsGrid.innerHTML = '';
    
    actuators.forEach(actuator => {
        const card = createActuatorCard(actuator);
        actuatorsGrid.appendChild(card);
    });
}

// Create Actuator Card
function createActuatorCard(actuator) {
    const card = document.createElement('div');
    card.className = 'card';
    const maxValue = actuator.level - 1;
    card.innerHTML = `
        <div class="card-header">
            <div style="flex: 1;">
                <div class="card-title">${actuator.name}</div>
                <div class="card-subtitle">${actuator.description || '설명 없음'}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="edit-btn" onclick="openEditModal('actuator', ${actuator.id})" title="편집">
                    ✏️
                </button>
                <div class="card-id">ID: ${actuator.id}</div>
            </div>
        </div>
        <div class="actuator-controls">
            <div class="state-display">
                <span class="state-label">현재 상태</span>
                <span class="state-value" id="state-${actuator.id}">${actuator.state}</span>
            </div>
            <div class="slider-container">
                <div class="slider-labels">
                    <span>최소: 0</span>
                    <span>최대: ${maxValue}</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="${maxValue}" 
                    value="${actuator.state}" 
                    id="slider-${actuator.id}"
                    data-actuator-id="${actuator.id}"
                >
            </div>
            <div class="button-group">
                <button class="btn btn-danger" onclick="setActuatorState(${actuator.id}, 0)">
                    ⚫ OFF
                </button>
                <button class="btn btn-primary" onclick="applySliderValue(${actuator.id})">
                    ✓ 적용
                </button>
                <button class="btn btn-success" onclick="setActuatorState(${actuator.id}, ${maxValue})">
                    ⚪ MAX
                </button>
            </div>
        </div>
    `;
    
    // Add slider event listener
    const slider = card.querySelector(`#slider-${actuator.id}`);
    const stateValue = card.querySelector(`#state-${actuator.id}`);
    
    slider.addEventListener('input', (e) => {
        stateValue.textContent = e.target.value;
    });
    
    return card;
}

// Apply Slider Value
async function applySliderValue(actuatorId) {
    const slider = document.getElementById(`slider-${actuatorId}`);
    const state = parseInt(slider.value);
    await setActuatorState(actuatorId, state);
}

// Set Actuator State
async function setActuatorState(actuatorId, state) {
    if (!currentDevice) {
        showToast('기기가 선택되지 않았습니다', 'error');
        return;
    }
    
    try {
        await apiCall(
            `${API_BASE}/api/v1/devices/${currentDevice}/actuators/${actuatorId}/action`,
            {
                method: 'POST',
                body: JSON.stringify({ state })
            }
        );
        
        // Update UI
        const stateValue = document.getElementById(`state-${actuatorId}`);
        const slider = document.getElementById(`slider-${actuatorId}`);
        
        if (stateValue) stateValue.textContent = state;
        if (slider) slider.value = state;
        
        // Update local state
        const actuator = actuators.find(a => a.id === actuatorId);
        if (actuator) actuator.state = state;
        
        showToast(`액추에이터 상태를 ${state}(으)로 변경했습니다`, 'success');
    } catch (error) {
        showToast('액추에이터 상태 변경에 실패했습니다', 'error');
    }
}

// Render Sensors
function renderSensors() {
    sensorCount.textContent = sensors.length;
    
    if (sensors.length === 0) {
        sensorsGrid.innerHTML = '<div class="empty-state"><p>센서가 없습니다</p></div>';
        return;
    }
    
    sensorsGrid.innerHTML = '';
    
    sensors.forEach(sensor => {
        const card = createSensorCard(sensor);
        sensorsGrid.appendChild(card);
    });
}

// Create Sensor Card
function createSensorCard(sensor) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <div style="flex: 1;">
                <div class="card-title">${sensor.name}</div>
                <div class="card-subtitle">${sensor.description || '설명 없음'}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="edit-btn" onclick="openEditModal('sensor', ${sensor.id})" title="편집">
                    ✏️
                </button>
                <div class="card-id">ID: ${sensor.id}</div>
            </div>
        </div>
        <div class="sensor-info">
            <div class="sensor-value">
                <span class="state-label">현재 값</span>
                <span class="sensor-reading" id="sensor-${sensor.id}">${sensor.state || 0}</span>
            </div>
            <div class="sensor-range">
                타입: ${sensor.sensor_type || 'N/A'}
            </div>
        </div>
    `;
    
    return card;
}

// Auto-refresh sensor data every 5 seconds
setInterval(async () => {
    if (currentDevice) {
        try {
            const sensorsData = await apiCall(`${API_BASE}/api/v1/devices/${currentDevice}/sensors/`);
            
            sensorsData.forEach(sensor => {
                const sensorElement = document.getElementById(`sensor-${sensor.id}`);
                if (sensorElement) {
                    sensorElement.textContent = sensor.state || 0;
                }
            });
            
            sensors = sensorsData;
        } catch (error) {
            console.error('Failed to refresh sensor data:', error);
        }
    }
}, 5000);

// Edit Modal Functions
function openEditModal(type, id) {
    editTarget = { type, id };
    
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const nameInput = document.getElementById('edit-name');
    const descInput = document.getElementById('edit-description');
    
    let item;
    if (type === 'device') {
        item = currentDeviceData;
        modalTitle.textContent = '기기 정보 수정';
    } else if (type === 'actuator') {
        item = actuators.find(a => a.id === id);
        modalTitle.textContent = '액추에이터 정보 수정';
    } else if (type === 'sensor') {
        item = sensors.find(s => s.id === id);
        modalTitle.textContent = '센서 정보 수정';
    }
    
    if (item) {
        nameInput.value = item.name || '';
        descInput.value = item.description || '';
        modal.classList.add('show');
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('show');
    editTarget = null;
    
    // Clear form
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-description').value = '';
}

async function handleEditSubmit(event) {
    event.preventDefault();
    
    if (!editTarget) {
        showToast('편집 대상이 없습니다', 'error');
        return;
    }
    
    const nameInput = document.getElementById('edit-name');
    const descInput = document.getElementById('edit-description');
    
    const data = {
        name: nameInput.value.trim() || null,
        description: descInput.value.trim() || null
    };
    
    try {
        let url;
        if (editTarget.type === 'device') {
            url = `${API_BASE}/api/v1/devices/${currentDevice}`;
        } else if (editTarget.type === 'actuator') {
            url = `${API_BASE}/api/v1/devices/${currentDevice}/actuators/${editTarget.id}`;
        } else if (editTarget.type === 'sensor') {
            url = `${API_BASE}/api/v1/devices/${currentDevice}/sensors/${editTarget.id}`;
        }
        
        await apiCall(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        showToast('정보가 수정되었습니다', 'success');
        closeEditModal();
        
        // Reload data
        await loadDeviceData(currentDevice);
        
    } catch (error) {
        showToast('정보 수정에 실패했습니다', 'error');
    }
}

// Make functions globally available
window.setActuatorState = setActuatorState;
window.applySliderValue = applySliderValue;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.handleEditSubmit = handleEditSubmit;
window.loadDeviceList = loadDeviceList;
window.goToDeviceList = goToDeviceList;

