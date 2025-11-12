// ============================================
// 공통 JavaScript 함수들
// ============================================

// API Base URL
const API_BASE = window.location.origin;

// State
let editTarget = null; // { type: 'device'|'actuator'|'sensor', id: number|string, deviceCode?: string }

// Bootstrap Toast 초기화
let toastInstance = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap Toast 초기화
    const toastElement = document.getElementById('toast');
    if (toastElement) {
        toastInstance = new bootstrap.Toast(toastElement);
    }
});

// Toast Notification (Bootstrap)
function showToast(message, type = 'info') {
    const toastElement = document.getElementById('toast');
    const toastBody = document.getElementById('toast-body');
    
    if (!toastElement || !toastBody) return;
    
    // Toast 타입에 따른 클래스 설정
    const toastHeader = toastElement.querySelector('.toast-header');
    if (toastHeader) {
        toastHeader.className = 'toast-header';
        if (type === 'success') {
            toastHeader.classList.add('bg-success', 'text-white');
        } else if (type === 'error') {
            toastHeader.classList.add('bg-danger', 'text-white');
        } else {
            toastHeader.classList.add('bg-primary', 'text-white');
        }
    }
    
    toastBody.textContent = message;
    
    if (toastInstance) {
        toastInstance.show();
    }
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
            const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showToast('API 호출 실패: ' + error.message, 'error');
        throw error;
    }
}

// Fetch Actuator Info
async function fetchActuatorInfo(deviceCode, actuatorId) {
    try {
        const response = await fetch(`${API_BASE}/api/v1/devices/${deviceCode}/actuators/${actuatorId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('액추에이터 정보 가져오기 실패:', error);
    }
    return null;
}

// Fetch Sensor Info
async function fetchSensorInfo(deviceCode, sensorId) {
    try {
        const response = await fetch(`${API_BASE}/api/v1/devices/${deviceCode}/sensors/${sensorId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('센서 정보 가져오기 실패:', error);
    }
    return null;
}

// Edit Modal Functions
function openEditModal(type, id) {
    editTarget = { type, id };
    
    const modalElement = document.getElementById('editModal');
    const modalTitle = document.getElementById('editModalLabel');
    const nameInput = document.getElementById('edit-name');
    const descInput = document.getElementById('edit-description');
    
    if (!modalElement || !modalTitle || !nameInput || !descInput) {
        showToast('모달 요소를 찾을 수 없습니다', 'error');
        return;
    }
    
    let item;
    let deviceCode = null;
    
    // 현재 페이지에서 device_code 가져오기
    if (typeof CURRENT_DEVICE_CODE !== 'undefined') {
        deviceCode = CURRENT_DEVICE_CODE;
    } else {
        // URL에서 가져오기
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 2 && pathParts[1] === 'device') {
            deviceCode = pathParts[2];
        }
    }
    
    if (type === 'device') {
        // 기기 정보는 페이지에서 직접 가져오기
        const deviceName = document.getElementById('device-name');
        const deviceDesc = document.getElementById('device-description');
        
        if (deviceName && deviceDesc) {
            item = {
                name: deviceName.textContent.trim(),
                description: deviceDesc.textContent.trim()
            };
        }
        modalTitle.textContent = '기기 정보 수정';
        editTarget.deviceCode = deviceCode;
    } else if (type === 'actuator') {
        // 액추에이터 정보는 서버에서 가져오기
        if (deviceCode) {
            fetchActuatorInfo(deviceCode, id).then(actuator => {
                if (actuator) {
                    item = actuator;
                    nameInput.value = item.name || '';
                    descInput.value = item.description || '';
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    showToast('액추에이터 정보를 가져올 수 없습니다', 'error');
                }
            });
            return;
        } else {
            showToast('기기 코드를 찾을 수 없습니다', 'error');
            return;
        }
    } else if (type === 'sensor') {
        // 센서 정보는 서버에서 가져오기
        if (deviceCode) {
            fetchSensorInfo(deviceCode, id).then(sensor => {
                if (sensor) {
                    item = sensor;
                    nameInput.value = item.name || '';
                    descInput.value = item.description || '';
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    showToast('센서 정보를 가져올 수 없습니다', 'error');
                }
            });
            return;
        } else {
            showToast('기기 코드를 찾을 수 없습니다', 'error');
            return;
        }
    }
    
    if (item) {
        nameInput.value = item.name || '';
        descInput.value = item.description || '';
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        showToast('편집할 항목을 찾을 수 없습니다', 'error');
    }
}

function closeEditModal() {
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    editTarget = null;
    
    // Clear form
    const nameInput = document.getElementById('edit-name');
    const descInput = document.getElementById('edit-description');
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
}

async function handleEditSubmit(event) {
    event.preventDefault();
    
    if (!editTarget) {
        showToast('편집 대상이 없습니다', 'error');
        return;
    }
    
    const nameInput = document.getElementById('edit-name');
    const descInput = document.getElementById('edit-description');
    
    if (!nameInput || !descInput) {
        showToast('입력 필드를 찾을 수 없습니다', 'error');
        return;
    }
    
    const data = {
        name: nameInput.value.trim() || null,
        description: descInput.value.trim() || null
    };
    
    try {
        let url;
        if (editTarget.type === 'device') {
            if (!editTarget.deviceCode) {
                // URL에서 가져오기
                const pathParts = window.location.pathname.split('/');
                if (pathParts.length > 2 && pathParts[1] === 'device') {
                    editTarget.deviceCode = pathParts[2];
                }
            }
            if (!editTarget.deviceCode) {
                showToast('기기 코드를 찾을 수 없습니다', 'error');
                return;
            }
            url = `${API_BASE}/api/v1/devices/${editTarget.deviceCode}`;
        } else if (editTarget.type === 'actuator') {
            const deviceCode = typeof CURRENT_DEVICE_CODE !== 'undefined' 
                ? CURRENT_DEVICE_CODE 
                : window.location.pathname.split('/')[2];
            if (!deviceCode) {
                showToast('기기 코드를 찾을 수 없습니다', 'error');
                return;
            }
            url = `${API_BASE}/api/v1/devices/${deviceCode}/actuators/${editTarget.id}`;
        } else if (editTarget.type === 'sensor') {
            const deviceCode = typeof CURRENT_DEVICE_CODE !== 'undefined' 
                ? CURRENT_DEVICE_CODE 
                : window.location.pathname.split('/')[2];
            if (!deviceCode) {
                showToast('기기 코드를 찾을 수 없습니다', 'error');
                return;
            }
            url = `${API_BASE}/api/v1/devices/${deviceCode}/sensors/${editTarget.id}`;
        }
        
        await apiCall(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        showToast('정보가 수정되었습니다', 'success');
        closeEditModal();
        
        // 페이지 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        showToast('정보 수정에 실패했습니다', 'error');
    }
}

// 전역 함수로 등록
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.apiCall = apiCall;
    window.openEditModal = openEditModal;
    window.closeEditModal = closeEditModal;
    window.handleEditSubmit = handleEditSubmit;
}

