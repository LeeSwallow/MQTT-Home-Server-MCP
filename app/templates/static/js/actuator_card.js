// Actuator Card 관련 JavaScript 함수들

/**
 * 슬라이더 값 업데이트 (실시간 표시만)
 */
function updateSliderValue(actuatorId, value) {
    const stateElement = document.getElementById(`state-${actuatorId}`);
    if (stateElement) {
        stateElement.textContent = value;
    }
}

/**
 * 슬라이더 값을 적용하여 액추에이터 상태 변경
 */
async function applySliderValue(deviceCode, actuatorId) {
    const slider = document.getElementById(`slider-${actuatorId}`);
    if (!slider) {
        if (typeof showToast === 'function') {
            showToast('슬라이더를 찾을 수 없습니다', 'error');
        } else {
            console.error('슬라이더를 찾을 수 없습니다');
        }
        return;
    }
    
    const state = parseInt(slider.value);
    await setActuatorState(deviceCode, actuatorId, state);
}

/**
 * 액추에이터 상태 설정
 */
async function setActuatorState(deviceCode, actuatorId, state) {
    if (!deviceCode) {
        if (typeof showToast === 'function') {
            showToast('기기 코드가 없습니다', 'error');
        } else {
            console.error('기기 코드가 없습니다');
        }
        return;
    }
    
    try {
        const response = await fetch(
            `${window.location.origin}/api/v1/devices/${deviceCode}/actuators/${actuatorId}/action`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state })
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Update UI
        const stateValue = document.getElementById(`state-${actuatorId}`);
        const slider = document.getElementById(`slider-${actuatorId}`);
        
        if (stateValue) stateValue.textContent = state;
        if (slider) slider.value = state;
        
        if (typeof showToast === 'function') {
            showToast(`액추에이터 상태를 ${state}(으)로 변경했습니다`, 'success');
        }
    } catch (error) {
        console.error('액추에이터 상태 변경 실패:', error);
        if (typeof showToast === 'function') {
            showToast('액추에이터 상태 변경에 실패했습니다', 'error');
        }
    }
}

// 전역 함수로 등록
if (typeof window !== 'undefined') {
    window.updateSliderValue = updateSliderValue;
    window.applySliderValue = applySliderValue;
    window.setActuatorState = setActuatorState;
}

