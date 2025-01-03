### 📋 목차
### 1. 🗿 Milestone
### 2. ✍️ api별 요구사항분석
### 3. 🎨 시퀀스 다이어그램
### 4. 🔀 플로우 차트

---

# 🗿 Milestone

## 3주간의 마일스톤 (총 18MD)

### 1주차: 설계 및 Mock API 개발 (6MD)

-   **UML 설계 (3MD)**

    -   ERD
    -   시퀀스 다이어그램
    -   플로우 차트

-   **API 명세서 작성 (1MD)**

    -   잔액 충전 / 조회
    -   상품 조회
    -   주문 / 결제
    -   인기 판매 상품 조회

-   **Mock API 개발 (2MD)**
    -   각 API의 기본적인 엔드포인트 구현
    -   데이터베이스 스키마 설정

### 2주차: TDD 기반 개발 (6MD)

-   **잔액 충전 / 조회 기능 (1MD)**

    -   **도메인 구현**
        -   잔액 관리 도메인 모델 설계 및 구현
    -   **인프라 구현**
        -   데이터베이스 연동 및 레포지토리 구현
    -   **테스트**
        -   단위 테스트 작성 및 실행

-   **상품 조회 기능 (1MD)**

    -   **도메인 구현**
        -   상품 도메인 모델 설계 및 구현
    -   **인프라 구현**
        -   데이터베이스 연동 및 레포지토리 구현
    -   **테스트**

        -   단위 테스트 작성 및 실행

-   **선착순 쿠폰 기능 (1MD)**

    -   **도메인 구현**
        -   상품 도메인 모델 설계 및 구현
    -   **인프라 구현**
        -   데이터베이스 연동 및 레포지토리 구현
    -   **테스트**
        -   단위 테스트 작성 및 실행

-   **주문 / 결제 기능 (1MD)**

    -   **도메인 구현**
        -   주문 및 결제 도메인 모델 설계 및 구현
    -   **인프라 구현**
        -   데이터베이스 연동 및 레포지토리 구현
    -   **테스트**
        -   단위 테스트 작성 및 실행

-   **인기 판매 상품 조회 기능 (1MD)**

    -   **도메인 구현**
        -   판매량 분석 및 추천 도메인 모델 설계 및 구현
    -   **인프라 구현**
        -   데이터베이스 연동 및 레포지토리 구현
    -   **테스트**
        -   단위 테스트 작성 및 실행

-   **장바구니 기능 (1MD)**

    -   **도메인 구현**
        -   장바구니 도메인 모델 설계 및 구현
    -   **인프라 구현**
        -   데이터베이스 연동 및 레포지토리 구현
    -   **테스트**
        -   단위 테스트 작성 및 실행

### 3주차: 최적화 및 배포 준비 (6MD)

-   **코드 최적화 및 리팩토링 (4MD)**

    -   코드 리뷰 및 리팩토링
    -   성능 최적화

-   **최종 테스트 및 PR (2MD)**
    -   통합 테스트
    -   PR 문서 작성

---

# ✍️ api별 요구사항 분석

## Points

### 잔액 조회 api

-   api: [GET] /points/:userId
-   기능: 사용자 식별자를 받아, 잔액을 조회합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
-   동작 흐름:
    1.  사용자 식별자를 통해 현재 잔액 조회
-   테스트 케이스
    -   성공 케이스
        -   잔액 조회 성공: 유효한 사용자 식별자로 잔액을 조회했을 때 정확한 잔액이 반환된다.
    -   실패 케이스
        -   잔액 조회 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 잔액 조회 요청 시 오류가 발생한다.

### 잔액 충전 api

-   api: [POST] /points/charge
-   기능: 사용자 식별자와 충전할 금액을 받아, 잔액을 충전하고 사용자 식별자를 통해 잔액을 조회합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   충전할 금액 (amount)
-   동작 흐름:
    1.  사용자 식별자를 통해 현재 잔액 조회
    1.  입력받은 금액을 사용자의 현재 잔액에 추가
    1.  포인트 충전 / 사용 내역에 저장
    1.  사용자 식별자를 통해 현재 잔액 조회
-   테스트 케이스
    -   성공 케이스
        -   충전 성공: 유효한 사용자 식별자와 금액을 입력했을 때 잔액이 정상적으로 충전된다.
    -   실패 케이스
        -   충전 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 충전 요청 시 오류가 발생한다.
        -   충전 실패 - 잘못된 금액: 음수 또는 0의 금액으로 충전 요청 시 오류가 발생한다.

## Payments

### 잔액 사용 (결제) api

-   api: [POST] /payments
-   기능: 주문서를 입력받아 결제를 수행합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   주문 식별자(orderId)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  주문 식별자를 통해 주문 조회
    1.  주문 금액(수량, 가격이 포함되어 계산되어있음.)을 사용자의 현재 잔액에서 감소
    1.  포인트 사용 내역에 저장
-   테스트 케이스
    -   성공 케이스
        -   결제 성공: 유효한 사용자 식별자와 주문서를 입력했을 때 결제가 정상적으로 수행된다.
    -   실패 케이스
        -   결제 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 결제 요청 시 오류가 발생한다.
        -   결제 실패 - 잘못된 주문서: 주문서가 유효하지 않을 경우 오류가 발생한다.
        -   결제 실패 - 잔액 부족: 사용자 잔액이 주문 금액보다 적을 때 오류가 발생한다.


## Products

### 상품 조회 api

-   api: [GET] /products/:productId
-   기능: 상품의 id, 이름, 가격, 잔여수량을 조회합니다.
-   필요 데이터:
    -   상품 id (productId)
-   동작 흐름:
    1.  상품 id를 통해 상품 조회
    1.  상품 정보 (예:productId, productName, price, stock) 반환
-   테스트 케이스
    -   성공 케이스
        -   상품 조회 성공: 유효한 상품 ID로 조회했을 때 상품의 ID, 이름, 가격, 잔여수량이 정확히 반환된다.
    -   실패 케이스
        -   상품 조회 실패 - 잘못된 상품 ID: 존재하지 않는 상품 ID로 조회 요청 시 오류가 발생한다.

### 상품 주문 api

-   api: [POST] /products/order
-   기능: 사용자 식별자와 상품 ID, 수량을 입력받아 주문 및 결제를 수행합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   상품 ID (productId)
    -   수량 (quantity)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  상품 ID와 수량을 통해 주문 생성
    1.  주문 생성
    1.  주문 결과 반환 (예: 주문 ID, 총 금액, 결제 상태)
    1.  데이터 분석을 위해 결제 성공 시에 실시간으로 주문 정보를 데이터 플랫폼에 전송
-   테스트 케이스
    -   성공 케이스
        -   주문 성공: 유효한 사용자 식별자와 상품 ID, 수량을 입력했을 때 주문이 정상적으로 생성된다.
    -   실패 케이스
        -   주문 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 주문 요청 시 오류가 발생한다.
        -   주문 실패 - 잘못된 상품 ID: 존재하지 않는 상품 ID로 주문 요청 시 오류가 발생한다.
        -   주문 실패 - 잘못된 수량: 음수 또는 0의 수량으로 주문 요청 시 오류가 발생한다.
        -   주문 실패 - 재고 부족: 주문 수량이 상품 재고보다 많을 때 오류가 발생한다.
        -   주문 실패 - 잔액 부족: 사용자 잔액이 주문 금액보다 적을 때 오류가 발생한다.

### 상위 상품 조회 api

-   api: [GET] /products/top5items/last3days
-   기능: 최근 3일간 가장 많이 팔린 상위 5개 상품 정보를 제공합니다.
-   필요 데이터:
    -   판매 기록 (예: 상품 id, 판매 일자, 판매 수량)
-   동작 흐름:
    1.  최근 3일간 판매 기록 조회
    1.  판매 수량이 많은 순으로 상위 5개 상품 조회
    1.  상품 정보 (예: productId, productName, price, stock) 반환
-   테스트 케이스
    -   성공 케이스
        -   상위 상품 조회 성공: 최근 3일간 판매 기록을 조회하여 판매 수량이 많은 순으로 상위 5개 상품이 정확히 반환된다.
    -   실패 케이스
        -   상위 상품 조회 실패 - 판매 기록 없음: 최근 3일간 판매 기록이 없을 때 오류가 발생한다.

## Coupons

### 선착순 쿠폰 발급 api

-   api: [POST] /coupons/issue
-   기능: 사용자에게 선착순 할인 쿠폰을 발급합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   쿠폰 식별자 (couponId)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  쿠폰 발급 가능 여부 확인 (예: 쿠폰 수량 확인)
    1.  사용자에게 쿠폰 발급
    1.  발급된 쿠폰 정보 저장
-   테스트 케이스
    -   성공 케이스
        -   쿠폰 발급 성공: 유효한 사용자 식별자로 쿠폰 발급 요청 시 쿠폰이 정상적으로 발급된다.
    -   실패 케이스
        -   쿠폰 발급 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 쿠폰 발급 요청 시 오류가 발생한다.
        -   쿠폰 발급 실패 - 쿠폰 수량 부족: 쿠폰 수량이 부족해 쿠폰 발급 요청 시 오류가 발생한다.

### 보유 쿠폰 목록 조회 api

-   api: [GET] /coupons/user/:userId
-   기능: 사용자가 보유한 쿠폰 목록을 조회합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  사용자가 보유한 쿠폰 목록 조회
    1.  쿠폰 목록 반환 (예: couponId, discountAmount, expirationDate, issueDate)
-   테스트 케이스
    -   성공 케이스
        -   쿠폰 목록 조회 성공: 유효한 사용자 식별자로 쿠폰 목록 조회 요청 시 사용자가 보유한 쿠폰 목록이 정확히 반환된다.
    -   실패 케이스
        -   쿠폰 목록 조회 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 쿠폰 목록 조회 요청 시 오류가 발생한다.

## Carts

### 장바구니 조회 api

-   api: [GET] /carts/:userId
-   기능: 사용자 식별자를 입력받아 장바구니에 담긴 상품 목록을 조회합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  사용자가 보유한 장바구니 조회
    1.  장바구니 상품 목록 반환 (예: productId, quantity, price)
-   테스트 케이스
    -   성공 케이스
        -   장바구니 조회 성공: 유효한 사용자 식별자로 장바구니 조회 요청 시 장바구니에 담긴 상품 목록이 정확히 반환된다.

### 장바구니 내 상품 추가 api

-   api: [POST] /carts/add
-   기능: 사용자 식별자와 상품 ID, 수량을 입력받아 장바구니에 상품을 추가합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   상품 ID (productId)
    -   수량 (quantity)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  상품 ID를 통해 상품 조회
    1.  상품 재고 확인
    1.  장바구니 상품 정보 저장
-   테스트 케이스
    -   성공 케이스
        -   장바구니 추가 성공: 유효한 사용자 식별자와 상품 ID, 수량을 입력했을 때 장바구니에 상품이 정상적으로 추가된다.
    -   실패 케이스
        -   장바구니 추가 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 장바구니 추가 요청 시 오류가 발생한다.
        -   장바구니 추가 실패 - 잘못된 상품 ID: 존재하지 않는 상품 ID로 장바구니 추가 요청 시 오류가 발생한다.
        -   장바구니 추가 실패 - 잘못된 수량: 음수 또는 0의 수량으로 장바구니 추가 요청 시 오류가 발생한다.
        -   장바구니 추가 실패 - 재고 부족: 주문 수량이 상품 재고보다 많을 때 오류가 발생한다.

### 장바구니 내 상품 삭제 api

-   api: [DELETE] /carts/remove
-   기능: 사용자 식별자와 상품 ID를 입력받아 장바구니에서 상품을 삭제합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   상품 ID (productIds) - Array
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  장바구니에서 해당 상품 삭제
-   테스트 케이스
    -   성공 케이스
        -   장바구니 내 상품 삭제 성공: 유효한 사용자 식별자와 상품 ID를 입력했을 때 장바구니에서 상품이 정상적으로 삭제된다.
    -   실패 케이스
        -   장바구니 내 상품 삭제 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 장바구니 내 상품 삭제 요청 시 오류가 발생한다.
        -   장바구니 내 상품 삭제 실패 - 잘못된 상품 ID: 장바구니 내 해당 상품 ID가 존재하지 않을 때 오류가 발생한다.

### 장바구니 내 상품 수량 변경 api

-   api: [PATCH] /carts/quantity/update
-   기능: 사용자 식별자와 상품 ID, 수량을 입력받아 장바구니에서 상품의 수량을 변경합니다.
-   필요 데이터:
    -   사용자 식별자 (userId)
    -   상품 ID (productId)
    -   수량 (quantity)
-   동작 흐름:
    1.  사용자 식별자를 통해 사용자 조회
    1.  상품 ID를 통해 상품 조회
    1.  상품 재고 확인
    1.  장바구니 상품 정보 저장
-   테스트 케이스
    -   성공 케이스
        -   장바구니 내 상품 수량 변경 성공: 유효한 사용자 식별자와 상품 ID, 수량을 입력했을 때 장바구니에서 상품의 수량이 정상적으로 변경된다.
    -   실패 케이스
        -   장바구니 내 상품 수량 변경 실패 - 잘못된 사용자 식별자: 존재하지 않는 사용자 식별자로 장바구니 내 상품 수량 변경 요청 시 오류가 발생한다.
        -   장바구니 내 상품 수량 변경 실패 - 잘못된 상품 ID: 장바구니 내 해당 상품 ID가 존재하지 않을 때 오류가 발생한다.
        -   장바구니 내 상품 수량 변경 실패 - 잘못된 수량: 음수 또는 0의 수량으로 장바구니 내 상품 수량 변경 요청 시 오류가 발생한다.

---

# 🎨 시퀀스 다이어그램

## Products
### `상품 조회`
<img width="189" alt="image" src="https://github.com/user-attachments/assets/6dfcba2f-3d7f-41b5-902a-e707ed11c689" />

### `상품 주문`
<img width="311" alt="image" src="https://github.com/user-attachments/assets/10a2e61c-80b8-4877-a074-e0103c2069a4" />

### `상위 상품 조회`
<img width="221" alt="image" src="https://github.com/user-attachments/assets/fd348161-eef1-435f-8da0-a83cd497ffc8" />

## Points

### `잔액 조회`
<img width="230" alt="image" src="https://github.com/user-attachments/assets/39d454d6-4cb0-423e-9606-511b8d7d1e69" />

### `잔액 충전`
<img width="331" alt="image" src="https://github.com/user-attachments/assets/ff493f4d-717a-4a00-8821-9212437fbf38" />

## Payments

### `잔액 사용 (결제)`
<img width="356" alt="image" src="https://github.com/user-attachments/assets/9d909cd5-070a-4207-b45e-ca91a3f454b8" />

## Coupons
### `선착순 쿠폰 발급`
<img width="287" alt="image" src="https://github.com/user-attachments/assets/b930d41e-c147-4e50-8b9e-77ee1f143ba7" />

### `보유 쿠폰 조회`
<img width="248" alt="image" src="https://github.com/user-attachments/assets/5fe8592d-6c1d-4107-8379-15c622e8b644" />

## Carts
### `장바구니 조회`
<img width="222" alt="image" src="https://github.com/user-attachments/assets/6b93f753-8c5a-486b-ae40-8bc506aa4a61" />

### `장바구니 내 상품 추가`
<img width="327" alt="image" src="https://github.com/user-attachments/assets/b7283a72-0bf2-4c03-903e-1df1d5000b72" />

### `장바구니 내 상품 수량 변경`
<img width="474" alt="image" src="https://github.com/user-attachments/assets/fade3d39-a68f-4137-9c03-3b86a58ee780" />

### `장바구니 내 상품 삭제`
<img width="399" alt="image" src="https://github.com/user-attachments/assets/c3ab401d-5476-4c7a-9775-b7f58b373b46" />


# 🔀 플로우 차트

## Products
### `상품 조회`
<img width="214" alt="image" src="https://github.com/user-attachments/assets/ea48a3be-a1f6-457d-bdb2-82083a6e3992" />

### `상품 주문`
<img width="273" alt="image" src="https://github.com/user-attachments/assets/cd04fc54-b635-4783-bec1-51734ce10b15" />

### `상위 상품 조회`
<img width="235" alt="image" src="https://github.com/user-attachments/assets/3c3a3e90-1246-4a5e-8157-be138de6ce80" />

## Points
### `잔액 조회`
<img width="249" alt="image" src="https://github.com/user-attachments/assets/ba51dea9-b984-4a9a-a7be-d03dd3d14b8f" />

### `잔액 충전`
<img width="305" alt="image" src="https://github.com/user-attachments/assets/4f74163b-c011-4c9c-9e4c-7fdef1c6094f" />

## Payments
### `잔액 사용 (결제)`
<img width="226" alt="image" src="https://github.com/user-attachments/assets/2f037bcc-7ab5-48e9-841e-02d2609bb8c4" />

## Coupons
### `선착순 쿠폰 발급`
<img width="336" alt="image" src="https://github.com/user-attachments/assets/e2831389-024c-457a-9cbe-ebcd68e4b7ca" />

### `보유 쿠폰 조회`
<img width="341" alt="image" src="https://github.com/user-attachments/assets/ce3faf6b-0ed2-42ad-92df-84b34f6b68a2" />

## Carts
### `장바구니 조회`
<img width="326" alt="image" src="https://github.com/user-attachments/assets/cb57e952-239a-4651-a94a-d5588cd42d0b" />

### `장바구니 내 상품 추가`
<img width="340" alt="image" src="https://github.com/user-attachments/assets/bb936f80-e0fd-4c20-b841-b9427e7cae26" />

### `장바구니 내 상품 수량 변경`
<img width="333" alt="image" src="https://github.com/user-attachments/assets/2124f073-f25f-4eb0-a80a-dc058e0d9fb8" />

### `장바구니 내 상품 삭제`
<img width="413" alt="image" src="https://github.com/user-attachments/assets/36d2679e-fe46-4911-ab3f-b2f7714ed502" />




