// Device Card 관련 JavaScript 함수들
// 현재는 특별한 기능이 없지만, 향후 확장을 위해 준비

/**
 * 기기 카드 클릭 핸들러 (필요시 사용)
 */
function handleDeviceCardClick(deviceCode) {
    if (deviceCode) {
        window.location.href = `/device/${deviceCode}`;
    }
}

// 전역 함수로 등록
if (typeof window !== 'undefined') {
    window.handleDeviceCardClick = handleDeviceCardClick;
}

