import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
    scenarios: {
        constant_load: {
            executor: 'constant-vus',
            vus: 10,
            duration: '10s',
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
        userId: currentUserId,
        amount: 100,
    });
    console.log(currentUserId);
    let res = http.post(`http://127.0.0.1:3010/users/${currentUserId}/points/charge`, body, params);
    check(res, {
        'status is 201': (r) => r.status === 201,
    });
    sleep(1);
}
