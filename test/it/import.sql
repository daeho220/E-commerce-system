-- User 테이블 샘플 데이터
INSERT INTO `user` (`id`, `user_name`, `point`, `created_at`, `updated_at`) VALUES
(1, 'Alice', 100, NOW(), NOW()),
(2, 'Bob', 200, NOW(), NOW()),
(3, 'Charlie', 300, NOW(), NOW()),
(4, 'David', 400, NOW(), NOW()),
(5, 'Eve', 500, NOW(), NOW()),
(6, 'Frank', 600, NOW(), NOW()),
(7, 'Grace', 700, NOW(), NOW()),
(8, 'Hannah', 800, NOW(), NOW()),
(9, 'Ivy', 900, NOW(), NOW()),
(10, 'Jack', 1000, NOW(), NOW());

-- PointHistory 테이블 샘플 데이터
INSERT INTO `point_history` (`id`, `user_id`, `amount`, `change_type`, `created_at`) VALUES
(1, 1, 50, 'CHARGE', NOW()),
(2, 2, 30, 'USE', NOW()),
(3, 3, 20, 'CHARGE', NOW()),
(4, 4, 40, 'USE', NOW()),
(5, 5, 60, 'CHARGE', NOW()),
(6, 6, 70, 'USE', NOW()),
(7, 7, 80, 'CHARGE', NOW()),
(8, 8, 90, 'USE', NOW()),
(9, 9, 100, 'CHARGE', NOW()),
(10, 10, 110, 'USE', NOW());

-- Product 테이블 샘플 데이터
INSERT INTO `product` (`id`, `product_name`, `price`, `status`, `stock`, `created_at`, `updated_at`) VALUES
(1, 'Product A', 1000, TRUE, 50, NOW(), NOW()),
(2, 'Product B', 2000, FALSE, 60, NOW(), NOW()),
(3, 'Product C', 3000, TRUE, 70, NOW(), NOW()),
(4, 'Product D', 4000, FALSE, 80, NOW(), NOW()),
(5, 'Product E', 5000, TRUE, 90, NOW(), NOW()),
(6, 'Product F', 6000, FALSE, 100, NOW(), NOW()),
(7, 'Product G', 7000, TRUE, 110, NOW(), NOW()),
(8, 'Product H', 8000, FALSE, 120, NOW(), NOW()),
(9, 'Product I', 9000, TRUE, 130, NOW(), NOW()),
(10, 'Product J', 10000, FALSE, 140, NOW(), NOW());

-- ProductSalesStat 테이블 샘플 데이터
INSERT INTO `product_sales_stat` (`id`, `product_id`, `date`, `order_count`, `sales_quantity`, `sales_amount`, `created_at`, `updated_at`) VALUES
(1, 1, '2023-10-01', 10, 100, 1000, NOW(), NOW()),
(2, 2, '2023-10-02', 20, 200, 2000, NOW(), NOW()),
(3, 3, '2023-10-03', 30, 300, 3000, NOW(), NOW()),
(4, 4, '2023-10-04', 40, 400, 4000, NOW(), NOW()),
(5, 5, '2023-10-05', 50, 500, 5000, NOW(), NOW()),
(6, 6, '2023-10-06', 60, 600, 6000, NOW(), NOW()),
(7, 7, '2023-10-07', 70, 700, 7000, NOW(), NOW()),
(8, 8, '2023-10-08', 80, 800, 8000, NOW(), NOW()),
(9, 9, '2023-10-09', 90, 900, 9000, NOW(), NOW()),
(10, 10, '2023-10-10', 100, 1000, 10000, NOW(), NOW());

-- CartItems 테이블 샘플 데이터
INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, NOW(), NOW()),
(2, 2, 2, 2, NOW(), NOW()),
(3, 3, 3, 3, NOW(), NOW()),
(4, 4, 4, 4, NOW(), NOW()),
(5, 5, 5, 5, NOW(), NOW()),
(6, 6, 6, 6, NOW(), NOW()),
(7, 7, 7, 7, NOW(), NOW()),
(8, 8, 8, 8, NOW(), NOW()),
(9, 9, 9, 9, NOW(), NOW()),
(10, 10, 10, 10, NOW(), NOW());

-- Order 테이블 샘플 데이터
INSERT INTO `order` (`id`, `user_id`, `user_coupon_id`, `original_price`, `discount_price`, `total_price`, `status`, `created_at`) VALUES
(1, 1, NULL, 1000, 100, 900, 'PAID', NOW()),
(2, 2, NULL, 2000, 200, 1800, 'PENDING', NOW()),
(3, 3, NULL, 3000, 300, 2700, 'CANCELLED', NOW()),
(4, 4, NULL, 4000, 400, 3600, 'FAILED', NOW()),
(5, 5, NULL, 5000, 500, 4500, 'PAID', NOW()),
(6, 6, NULL, 6000, 600, 5400, 'PENDING', NOW()),
(7, 7, NULL, 7000, 700, 6300, 'CANCELLED', NOW()),
(8, 8, NULL, 8000, 800, 7200, 'FAILED', NOW()),
(9, 9, NULL, 9000, 900, 8100, 'PAID', NOW()),
(10, 10, NULL, 10000, 1000, 9000, 'PENDING', NOW());

-- OrderDetail 테이블 샘플 데이터
INSERT INTO `order_detail` (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`) VALUES
(1, 1, 1, 1, 1000),
(2, 2, 2, 2, 2000),
(3, 3, 3, 3, 3000),
(4, 4, 4, 4, 4000),
(5, 5, 5, 5, 5000),
(6, 6, 6, 6, 6000),
(7, 7, 7, 7, 7000),
(8, 8, 8, 8, 8000),
(9, 9, 9, 9, 9000),
(10, 10, 10, 10, 10000);

-- Coupon 테이블 샘플 데이터
INSERT INTO `coupon` (`id`, `code`, `discount_amount`, `discount_type`, `expiration_type`, `expiration_days`, `absolute_expiration_date`, `issue_start_date`, `issue_end_date`, `current_count`, `max_count`, `created_at`, `updated_at`) VALUES
(1, 'COUPON1', 10, 'PERCENTAGE', 'ABSOLUTE', NULL, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 100, NOW(), NOW()),
(2, 'COUPON2', 20, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(3, 'COUPON3', 30, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(4, 'COUPON4', 40, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(5, 'COUPON5', 50, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(6, 'COUPON6', 60, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(7, 'COUPON7', 70, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(8, 'COUPON8', 80, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(9, 'COUPON9', 90, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(10, 'COUPON10', 100, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW());

-- UserCoupon 테이블 샘플 데이터
INSERT INTO `user_coupon` (`id`, `user_id`, `coupon_id`, `issue_date`, `expiration_date`, `status`) VALUES
(1, 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(2, 2, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'USED'),
(3, 3, 3, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'EXPIRED'),
(4, 4, 4, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(5, 5, 5, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'USED'),
(6, 6, 6, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'EXPIRED'),
(7, 7, 7, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(8, 8, 8, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'USED'),
(9, 9, 9, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'EXPIRED'),
(10, 10, 10, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE');

-- Payment 테이블 샘플 데이터
INSERT INTO `payment` (`id`, `order_id`, `user_id`, `payment_method`, `status`, `created_at`) VALUES
(1, 1, 1, 'POINT', 'PAID', NOW()),
(2, 2, 2, 'POINT', 'PENDING', NOW()),
(3, 3, 3, 'POINT', 'FAILED', NOW()),
(4, 4, 4, 'POINT', 'PAID', NOW()),
(5, 5, 5, 'POINT', 'PENDING', NOW()),
(6, 6, 6, 'POINT', 'FAILED', NOW()),
(7, 7, 7, 'POINT', 'PAID', NOW()),
(8, 8, 8, 'POINT', 'PENDING', NOW()),
(9, 9, 9, 'POINT', 'FAILED', NOW()),
(10, 10, 10, 'POINT', 'PAID', NOW());