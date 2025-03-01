import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
    scenarios: {
        peak_load: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10s', target: 5 }, // 서서히 증가
                { duration: '10s', target: 50 }, // 급격히 증가 (peak)
                { duration: '10s', target: 10 }, // 정상화
                { duration: '10s', target: 0 }, // 종료
            ],
        },
    },
};

// VU별 시작 userId 설정
const getUserIdRange = (vuId) => {
    return (vuId % 10) + 1;
};

let vuUserIds = new Map();

export default function () {
    if (!vuUserIds.has(__VU)) {
        vuUserIds.set(__VU, getUserIdRange(__VU));
    }

    let currentUserId = vuUserIds.get(__VU);
    vuUserIds.set(__VU, currentUserId + 1);

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const body = JSON.stringify({
        user_id: currentUserId,
        order_items: [
            {
                product_id: 1,
                quantity: 1,
            },
            {
                product_id: 2,
                quantity: 1,
            },
        ],
    });

    let res = http.post('http://127.0.0.1:3010/orders', body, params);

    check(res, {
        'status is 201': (r) => r.status === 201,
    });
    sleep(1);
}
