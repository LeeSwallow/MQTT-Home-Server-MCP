// Sensor Card 관련 JavaScript 함수들

/**
 * 센서 데이터 자동 새로고침
 * @param {string} deviceCode - 기기 코드
 * @param {number} interval - 새로고침 간격 (밀리초, 기본값: 5000)
 */
function startSensorAutoRefresh(deviceCode, interval = 5000) {
    if (!deviceCode) {
        console.warn('센서 자동 새로고침: 기기 코드가 없습니다');
        return;
    }
    
    const refreshInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/v1/devices/${deviceCode}/sensors/`);
            if (response.ok) {
                const sensors = await response.json();
                sensors.forEach(sensor => {
                    const element = document.getElementById(`sensor-${sensor.id}`);
                    if (element) {
                        element.textContent = sensor.state || 0;
                    }
                });
            }
        } catch (error) {
            console.error('센서 데이터 새로고침 실패:', error);
        }
    }, interval);
    
    // 페이지 언로드 시 인터벌 정리
    window.addEventListener('beforeunload', () => {
        clearInterval(refreshInterval);
    });
    
    return refreshInterval;
}

// 전역 함수로 등록
if (typeof window !== 'undefined') {
    window.startSensorAutoRefresh = startSensorAutoRefresh;
}

