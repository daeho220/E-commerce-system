# E-commerce-system

## ERD

### Database Design Overview

-   사용 Tool : DB diagram io
-   사용 DB: MySQL 8.0

### 테이블 설계

-   User : 유저 정보
-   PointHistory : 포인트 충전/사용 이력
-   Product : 상품 정보
-   ProductHistory : 상품 정보 변경 이력 (재고, 가격 변동)
-   CartItems : 장바구니 아이템 정보
-   Order : 주문 정보
-   OrderDetail : 주문 상세 정보
-   Coupon : 쿠폰 정보
-   userCoupon : 유저가 발급한 쿠폰 정보
-   Payment : 결제 정보

### ERD

![image](https://github.com/user-attachments/assets/0e8ade1e-720c-4655-b5ec-7aada116271e)

```dbml
Table User {
  user_id int [pk]
  user_name varchar
  point int
  created_at datetime
  updated_at datetime
}

Table PointHistory {
  history_id int [pk]
  user_id int [ref: > User.user_id]
  amount int
  change_type varchar // "CHARGE" | "USE"
  created_at datetime
}

Table Product {
  product_id int [pk]
  product_name VARCHAR
  price int
  stock int
  status boolean
  created_at datetime
  updated_at datetime
}

Table ProductHistory {
  history_id int [pk]
  product_id int [ref: > Product.product_id]
  before_price int
  after_price int
  before_stock int
  after_stock int
  created_at datetime
}

Table CartItems {
  cart_items_id int [pk]
  user_id int [ref: > User.user_id]
  product_id int [ref: > Product.product_id]
  quantity int
  created_at datetime
  updated_at datetime
}

Table Order {
  order_id int [pk]
  user_id int [ref: > User.user_id]
  created_at datetime
  total_price int
  discount_price int
  status varchar // 결제 상태 (예: 'PENDING': 결제 중 , 'PAID': 결제 완료, 'CANCELLED': 주문 취소, 'FAILED': 결제 실패)
}

Table OrderDetail {
  order_detail_id int [pk]
  order_id int [ref: > Order.order_id]
  product_id int [ref: > Product.product_id]
  quantity int
  price_at_purchase int
}

Table Coupon {
  coupon_id int [pk]
  code varchar // 쿠폰 코드
  discount_amount int // 할인 금액 또는 비율
  discount_type varchar // 할인 유형 ('percentage', 'amount')
  expiration_type varchar // 만료 유형 ('relative', 'absolute')
  expiration_days int // 만료 유형이 relative인 경우, 발급일로부터 사용 가능 일수
  absolute_expiration_date  datetime // 만료 유형이 absolute인 경우, 절대적인 날짜 기준 만료일
  issue_start_date datetime // 쿠폰 발행 시작일
  issue_end_date datetime // 쿠폰 발행 종료일
  current_count int
  max_count int
  created_at datetime
  updated_at datetime
}

Table userCoupon {
  user_coupon_id int [pk]
  user_id int [ref: > User.user_id]
  coupon_id int [ref: > Coupon.coupon_id]
  issue_date datetime // 쿠폰 발행일
  expiration_date datetime
  used boolean // 사용 여부
}

Table Payment {
  payment_id int [pk]
  order_id int [ref: > Order.order_id]
  user_id int [ref: > User.user_id]
  payment_method varchar // 결제 방법 (예: 'POINT')
  status varchar // (예: 'PENDING': 결제 중 , 'PAID': 결제 완료, 'FAILED': 결제 실패)
  created_at datetime
}
```
