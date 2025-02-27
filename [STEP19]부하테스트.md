## 부하 테스트

### 개요

- 특가 이벤트, 블랙프라이데이 등을 진행할 때, 순간적으로 피크 부하가 예상되어 해당 부하를 견딜 수 있는지 부하 테스트를 진행한다.

### 환경세팅

1. k6 설치
    
    ```sql
      git clone https://github.com/grafana/k6 && cd k6
    ```
    
2. 서브모듈 설치 : Grafana, influxdb 포함
    
    ```sql
      git submodule update --init
    ```
    
3. 도커 실행
    
    ```sql
      docker-compose up -d influxdb grafana
    ```
    

### 부하 테스트 대상

- **상품 주문**
    - 시나리오: 인기가 아주 많은 한정판 상품 판매 상황
        - 테스트 종류: `Peak test`
            - 트래픽이 순간적으로 치솟기 때문에 해당 테스트가 적합하다고 생각
    - 테스트 스크립트
        
        ```sql
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
        
        ```
        
    - k6 테스트 결과
        
        ```sql
             ✗ status is 201
              ↳  89% — ✓ 51 / ✗ 6
        
             checks.........................: 89.47% 51 out of 57
             data_received..................: 20 kB  986 B/s
             data_sent......................: 13 kB  630 B/s
             http_req_blocked...............: avg=26.75µs  min=1µs     med=4µs     max=289µs  p(90)=15.8µs p(95)=243.79µs
             http_req_connecting............: avg=19.7µs   min=0s      med=0s      max=256µs  p(90)=0s     p(95)=214.79µs
             http_req_duration..............: avg=456.97ms min=2.21ms  med=24.92ms max=3.29s  p(90)=2.45s  p(95)=2.69s   
               { expected_response:true }...: avg=452.5ms  min=13.58ms med=25.59ms max=3.29s  p(90)=2.45s  p(95)=2.59s   
             http_req_failed................: 10.52% 6 out of 57
             http_req_receiving.............: avg=66.75µs  min=27µs    med=47µs    max=1.08ms p(90)=64µs   p(95)=79.99µs 
             http_req_sending...............: avg=25.66µs  min=7µs     med=18µs    max=165µs  p(90)=42.4µs p(95)=53.4µs  
             http_req_tls_handshaking.......: avg=0s       min=0s      med=0s      max=0s     p(90)=0s     p(95)=0s      
             http_req_waiting...............: avg=456.87ms min=2.16ms  med=24.86ms max=3.29s  p(90)=2.45s  p(95)=2.69s   
             http_reqs......................: 57     2.758444/s
             iteration_duration.............: avg=1.45s    min=1s      med=1.02s   max=4.29s  p(90)=3.45s  p(95)=3.7s    
             iterations.....................: 57     2.758444/s
             vus............................: 1      min=1        max=5
             vus_max........................: 5      min=5        max=5
        
        running (20.7s), 0/5 VUs, 57 complete and 0 interrupted iterations
        peak_load ✓ [======================================] 0/5 VUs  20s
        ```
        
    - Grafana
        
        ![image](https://github.com/user-attachments/assets/f7717986-69b0-41c9-bc22-49c4fef659df)

        ![image](https://github.com/user-attachments/assets/02ea7709-9119-42a9-b087-e742d6bc47e2)

        
- **포인트 충전**
    - 시나리오: 동시 충전 요청 처리 검증
        - 테스트 종류: `Load test`
            - 일반적인 부하 테스트
    - 테스트 스크립트
        
        ```tsx
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
        
        ```
        
    - k6 테스트 결과
        
        ```sql
             ✓ status is 201
        
             checks.........................: 100.00% 100 out of 100
             data_received..................: 28 kB   2.7 kB/s
             data_sent......................: 18 kB   1.7 kB/s
             http_req_blocked...............: avg=42.3µs  min=1µs     med=3µs     max=511µs    p(90)=44µs     p(95)=373.69µs
             http_req_connecting............: avg=36.41µs min=0s      med=0s      max=457µs    p(90)=30.8µs   p(95)=355.39µs
             http_req_duration..............: avg=52.69ms min=18.07ms med=43.72ms max=129.67ms p(90)=101.69ms p(95)=113.63ms
               { expected_response:true }...: avg=52.69ms min=18.07ms med=43.72ms max=129.67ms p(90)=101.69ms p(95)=113.63ms
             http_req_failed................: 0.00%   0 out of 100
             http_req_receiving.............: avg=33.62µs min=7µs     med=23µs    max=308µs    p(90)=57.2µs   p(95)=71.04µs 
             http_req_sending...............: avg=49.77µs min=3µs     med=13µs    max=3.21ms   p(90)=32.1µs   p(95)=45.39µs 
             http_req_tls_handshaking.......: avg=0s      min=0s      med=0s      max=0s       p(90)=0s       p(95)=0s      
             http_req_waiting...............: avg=52.6ms  min=18.03ms med=43.68ms max=129.62ms p(90)=101.66ms p(95)=113.59ms
             http_reqs......................: 100     9.489226/s
             iteration_duration.............: avg=1.05s   min=1.01s   med=1.04s   max=1.13s    p(90)=1.1s     p(95)=1.11s   
             iterations.....................: 100     9.489226/s
             vus............................: 10      min=10         max=10
             vus_max........................: 10      min=10         max=10
        
        running (10.5s), 00/10 VUs, 100 complete and 0 interrupted iterations
        constant_load ✓ [======================================] 10 VUs  10s
        ```
        
    - Grafana
      ![image](https://github.com/user-attachments/assets/9eca75bd-9ff8-4393-9baa-e94ca5716fee)
