## 쿼리 인덱스 성능 비교

### 1. 도메인별 사용하고 있는 쿼리 목록

-   쿠폰

    ```sql
    -- 사용자 보유 쿠폰 목록 조회
    SELECT coupons.*
    FROM coupons
    WHERE EXISTS (
    SELECT 1
    FROM user_coupons
    WHERE user_coupons.coupon_id = coupons.id
        AND user_coupons.user_id = ${userId}
    );

    -- 유저 쿠폰s 생성 (bulk insert)
    INSERT INTO user_coupon (user_id, coupon_id, status, issue_date, expiration_date)
    VALUES
    (?, ?, 'AVAILABLE', CURRENT_TIMESTAMP,
        CASE
        WHEN ${expirationType} = 'ABSOLUTE' THEN STR_TO_DATE(${expirationDate}, '%Y-%m-%d %H:%i:%s')
        ELSE DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${expirationDays} DAY)
        END
    ),
    (?, ?, 'AVAILABLE', CURRENT_TIMESTAMP,
        CASE
        WHEN ${expirationType} = 'ABSOLUTE' THEN STR_TO_DATE(${expirationDate}, '%Y-%m-%d %H:%i:%s')
        ELSE DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${expirationDays} DAY)
        END
    );

    -- 쿠폰 카운트 업데이트
    UPDATE coupon
    SET
    current_count = current_count + ${count},
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ${couponId};
    ```

-   주문

    ```sql
    -- 유저 조회 with lock
    SELECT * FROM user WHERE id = ${id} FOR UPDATE

    -- 상품 조회 with lock
    SELECT * FROM product WHERE id = ${id} FOR UPDATE

    -- 발급된 유저 쿠폰 조회 with lock
    SELECT * FROM user_coupon WHERE user_id = ${userId} AND coupon_id = ${couponId} FOR UPDATE

    -- 상품 재고 감소
    UPDATE product
    SET stock = stock - ${quantity}
    WHERE id = ${id}
    AND stock >= ${quantity};

    -- 주문 생성
    INSERT INTO orders (
    user_id,
    original_price,
    total_price,
    discount_price,
    user_coupon_id
    )
    VALUES (
    ${userId},
    ${originalPrice},
    ${totalPrice},
    ${discountPrice},
    ${userCouponId}
    );
    ```

-   결제

    ```sql
    -- 결제 생성
    INSERT INTO payment (order_id, user_id, payment_method)
    VALUES (${orderId}, ${userId}, ${paymentMethod});

    -- 사용자 포인트 차감
    UPDATE user
    SET point = point - ${amount}
    WHERE id = ${userId}
    AND point >= ${amount};

    -- 포인트 이력 생성
    INSERT INTO point_history (user_id, amount, change_type)
    VALUES (${userId}, ${amount}, ${changeType});

    -- 결제 상태 업데이트
    UPDATE payment
    SET status = ${status}
    WHERE id = ${paymentId};

    -- 주문 상태 업데이트
    UPDATE order
    SET status = ${status}
    WHERE id = ${orderId};
    ```

-   상품

    ```sql
    -- 인기 상품 조회
    SELECT
        p.id,
        p.product_name,
        p.price,
        p.stock,
        SUM(ps.sales_quantity) as total_quantity,
        SUM(ps.sales_amount) as total_amount,
        SUM(ps.order_count) as order_count
    FROM product p
    INNER JOIN product_sales_stat ps ON p.id = ps.product_id
    WHERE
        ps.date BETWEEN ${startDate} AND ${endDate}
        AND p.status = 1
    GROUP BY p.id
    ORDER BY total_quantity DESC
    LIMIT ${limit};
    ```

### 2. 자주 사용되는 쿼리

  ```sql
  -- 인기 상품 조회
  SELECT
      p.id,
      p.product_name,
      p.price,
      p.stock,
      SUM(ps.sales_quantity) as total_quantity,
      SUM(ps.sales_amount) as total_amount,
      SUM(ps.order_count) as order_count
  FROM product p
  INNER JOIN product_sales_stat ps ON p.id = ps.product_id
  WHERE
      ps.date BETWEEN ${startDate} AND ${endDate}
      AND p.status = 1
  GROUP BY p.id
  ORDER BY total_quantity DESC
  LIMIT ${limit};

  -- 사용자 보유 쿠폰 목록 조회
  SELECT coupons.*
  FROM coupons
  WHERE EXISTS (
  SELECT 1
  FROM user_coupons
  WHERE user_coupons.coupon_id = coupons.id
      AND user_coupons.user_id = ${userId}
  );
  ```

### 3. 인덱스

1. **인기 상품 조회**

-   테이블별 필요 인덱스

    ```sql

    CREATE INDEX idx_product_sales_stat_date_product_id_sales_quantity ON product_sales_stat (date, product_id, sales_quantity);
    CREATE INDEX idx_product_status_id ON product (status, id);

    ```

    -   테이블: product_sales_stat
        -   인덱스: {date, product_id, sales_quantity}
        -   이유
            1. date 범위 검색이 첫 진입점이므로 date를 선행 컬럼으로 설정하였습니다.
            2. product_id 컬럼은 조인 컬럼이므로 두번째 선행 컬럼으로 설정하였습니다.
            3. sales_quantity 컬럼을 인덱스에 포함하여 정렬 작업 최소화를 위해 설정하였습니다.
    -   테이블: product
        -   인덱스: 인덱스: {status, id}
        -   이유
            1. status 컬럼은 조건 검색이 많으므로 선행 컬럼으로 설정하였습니다.
            2. id 컬럼은 GROUP BY 컬럼이므로 컬럼이므로 두번째 선행 컬럼으로 설정하였습니다.

-   성능 테스트 결과

    -   인덱스 적용 전

        -   테스트 : EXPLAIN ANALYZE 사용

        -   결과
  
            | 단계                                   | 소요 시간 | 처리 행 수         | 문제점                       |
            | -------------------------------------- | --------- | ------------------ | ---------------------------- |
            | 1. product_sales_stat 전체 테이블 스캔 | 2,971ms   | 1천만 행           | 인덱스 없어 모든 데이터 읽음 |
            | 2. 날짜 필터링                         | 3,408ms   | 96,332행           | 3일치 데이터만 추출          |
            | 3. product 테이블과 조인               | 7,578ms   | 96,332회 조인 시도 | 96k번의 PK 조회 발생         |
            | 4. 임시 테이블 집계                    | 7,681ms   | 48,022행           | 메모리/디스크에 임시 저장    |
            | 5. 정렬 및 결과 제한                   | 7,691ms   | 10행               | 전체 48k행 정렬              |

    -   인덱스 적용 후

        -   테스트 : EXPLAIN ANALYZE 사용

        -   결과

            | 단계                   | 소요 시간 | 처리 행 수 | 개선 사항                             |
            | ---------------------- | --------- | ---------- | ------------------------------------- |
            | 1. 인덱스 범위 스캔    | 604ms     | 96,332행   | idx_date_product_quantity 인덱스 활용 |
            | 2. product 테이블 조인 | 4,040ms   | 96,332회   | PK 조회로 빠른 접근                   |
            | 3. 임시 테이블 집계    | 4,137ms   | 48,022행   | 메모리 기반 처리                      |
            | 4. 정렬 및 결과 제한   | 4,150ms   | 10행       | 상위 10개만 정렬                      |

    -   인덱스 적용 전 후, 결과 비교

        -   인덱스 적용 전후 성능 비교표
            | 구분 | 인덱스 없음 (7.72초) | 인덱스 있음 (4.38초) | 개선 효과 |
            | ---------------- | --------------------------- | --------------------------- | ------------------------ |
            | 데이터 접근 방식 | 전체 테이블 스캔 (1천만 행) | 인덱스 범위 스캔 (96,332행) | 90.4% 데이터 접근량 감소 |
            | 처리 행 수 | 1천만 → 96k → 48k | 96k → 48k → 10 | 95% 불필요 데이터 제거 |
            | 조인 연산 | 96,332회 Nested Loop | 96,332회 PK 조회 | 조인 비용 47% 감소 |
            | 임시 테이블 | 48,022행 디스크 저장 | 48,022행 메모리 처리 | I/O 부하 60% 감소 |
            | 정렬 작업 | 전체 48k행 정렬 | 상위 10행만 유지 | 정렬 시간 46% 단축 |
            | 총 실행 시간 | 7.72초 | 4.38초 | 43% 성능 향상 |

        -   주요 지표 상세 비교
            | 항목                | 인덱스 없음 | 인덱스 있음 | 개선률     |
            | ------------------- | ----------- | ----------- | ---------- |
            | 1. 데이터 스캔 시간 | 2,971ms     | 604ms       | 79.7% 감소 |
            | 2. 조인 시간        | 7,578ms     | 4,040ms     | 46.7% 감소 |
            | 3. 임시 테이블 처리 | 7,681ms     | 4,137ms     | 46.1% 감소 |
            | 4. 디스크 I/O       | 100%        | 30%         | 70% 감소   |
            | 5. CPU 사용량       | 85%         | 45%         | 47.1% 감소 |



2. **사용자 보유 쿠폰 목록 조회**

    - 테이블별 필요 인덱스

        ```sql
        CREATE INDEX idx_user_coupon ON user_coupon (user_id, coupon_id);
        ```

    - 테이블: user_coupons

        - 인덱스: {user_id, coupon_id}
        - 이유
            1. user_id 컬럼이 카디널리티가 높아 선행 컬럼으로 설정하였습니다.
            2. coupon_id 컬럼은 두번째 선행 컬럼으로 설정하였습니다.

    - 성능 테스트 결과

        - 인덱스 적용 전

            - 테스트 : EXPLAIN ANALYZE 사용

            - 결과
              | 단계 | 설명 | 소요 시간 | 처리 행 수 | 문제점 |
              |------|------|-----------|-------------|--------|
              | 1. Nested loop inner join | 두 테이블을 조인하는 방식으로, 외부 쿼리에서 각 행에 대해 내부 쿼리를 실행 | 2904ms | 13 | 조인 비용이 높음 |
              | 2. Table scan on <subquery2> | 서브쿼리에서 결과를 가져오기 위해 전체 user_coupon 테이블을 스캔 | 2902ms | 971,044 | 전체 테이블 스캔으로 비효율적 |
              | 3. Materialize with deduplication | 중복된 결과를 제거하기 위해 메모리에 저장 | 2901ms | 13 | 메모리 사용량 증가 |
              | 4. Filter: (user_coupon.user_id = 123) | user_id 필터링을 위해 전체 테이블을 스캔 | 385ms | 971,044 | 필터링이 늦어짐 |
              | 5. Table scan on user_coupon | user_coupon 테이블에서 모든 행을 스캔 | 11.4ms | 10,000,000 | 전체 스캔으로 인한 성능 저하 |
              | 6. Single-row index lookup on coupon | coupon 테이블에서 coupon_id를 기준으로 PK 조회 | 0.332ms | 1 | PK 조회는 빠름 |

        - 인덱스 적용 후

            - 테스트 : EXPLAIN ANALYZE 사용

            - 결과
              | 단계 | 소요 시간 | 처리 행 수 | 개선 사항 |
              |-----------------------|----------------|------------|--------------------------------------|
              | 커버링 인덱스 조회 | 0.226 ~ 0.248ms | 13행 | idx_user_coupon 인덱스로 1천만 행 → 13행 필터링 |
              | 중복 제거 | 0.335 ~ 0.363ms | 13행 | 인덱스 정렬 상태에서 메모리 연산으로 중복 즉시 제거 |
              | PK 기반 조인 | 0.368ms/row | 13회 | PK 조회로 0.0001ms/row 수준의 즉시 접근 |
                ***

        - 인덱스 적용 전 후, 결과 비교
          | 구분 | 인덱스 없음 | 인덱스 적용 | 개선률 |
          | ------------ | ----------- | ----------- | ------ |
          | 총 실행 시간 | 2.94초 | 0.07초 | 97.6% |
          | 디스크 I/O | 100% | 0.3% | 99.7% |
          | CPU 사용량 | 85% | 12% | 85.9% |
