-- User 테이블 샘플 데이터
INSERT INTO `user` (`id`, `user_name`, `point`, `created_at`, `updated_at`) VALUES
(1, 'Alice', 100, NOW(), NOW()),
(2, 'Bob', 20000, NOW(), NOW()),
(3, 'Charlie', 30000, NOW(), NOW()),
(4, 'David', 40000, NOW(), NOW()),
(5, 'Eve', 500, NOW(), NOW()),
(6, 'Frank', 600, NOW(), NOW()),
(7, 'Grace', 700, NOW(), NOW()),
(8, 'Hannah', 800, NOW(), NOW()),
(9, 'Ivy', 900, NOW(), NOW()),
(10, 'Jack', 1000, NOW(), NOW()),
(11, 'Kyle', 1000, NOW(), NOW()),
(12, 'Liam', 10000, NOW(), NOW()),
(13, 'Mia', 0, NOW(), NOW()),
(14, 'Noah', 0, NOW(), NOW()),
(15, 'Olivia', 0, NOW(), NOW()),
(16, 'William', 0, NOW(), NOW()),
(17, 'Joice', 0, NOW(), NOW()),
(18, 'Joe', 0, NOW(), NOW()),
(19, 'Jenny', 0, NOW(), NOW()),
(20, 'Jony', 0, NOW(), NOW()),
(21, 'Kyle', 10000, NOW(), NOW()),
(22, 'Liam', 10000, NOW(), NOW()),
(23, 'Mia', 10000, NOW(), NOW()),
(24, 'Noah', 10000, NOW(), NOW()),
(25, 'Olivia', 10000, NOW(), NOW()),
(26, 'William', 10000, NOW(), NOW()),
(27, 'Joice', 10000, NOW(), NOW()),
(28, 'Joe', 10000, NOW(), NOW()),
(29, 'Jenny', 10000, NOW(), NOW()),
(30, 'Jony', 10000, NOW(), NOW()),
(31, 'Kyle', 10000, NOW(), NOW()),
(32, 'Liam', 10000, NOW(), NOW()),
(33, 'Mia', 10000, NOW(), NOW()),
(34, 'Miaaa', 10000, NOW(), NOW());

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
(2, 'Product B', 2000, TRUE, 60, NOW(), NOW()),
(3, 'Product C', 3000, TRUE, 70, NOW(), NOW()),
(4, 'Product D', 4000, FALSE, 80, NOW(), NOW()),
(5, 'Product E', 5000, TRUE, 90, NOW(), NOW()),
(6, 'Product F', 6000, FALSE, 100, NOW(), NOW()),
(7, 'Product G', 7000, TRUE, 110, NOW(), NOW()),
(8, 'Product H', 8000, FALSE, 120, NOW(), NOW()),
(9, 'Product I', 9000, TRUE, 100, NOW(), NOW()),
(10, 'Product J', 10000, TRUE, 100, NOW(), NOW()),
(11, 'Product K', 11000, TRUE, 100, NOW(), NOW()),
(12, 'Product L', 12000, TRUE, 100, NOW(), NOW()),
(13, 'Product M', 13000, TRUE, 100, NOW(), NOW()),
(14, 'Product N', 14000, TRUE, 100, NOW(), NOW()),
(15, 'Product O', 15000, TRUE, 100, NOW(), NOW()),
(16, 'Product P', 16000, TRUE, 100, NOW(), NOW()),
(17, 'Product Q', 17000, TRUE, 100, NOW(), NOW()),
(18, 'Product R', 18000, TRUE, 100, NOW(), NOW()),
(19, 'Product S', 19000, TRUE, 100, NOW(), NOW()),
(20, 'Product T', 20000, TRUE, 100, NOW(), NOW()),
(21, 'Product U', 1000, TRUE, 4, NOW(), NOW()),
(22, 'Product V', 1000, TRUE, 100, NOW(), NOW()),
(23, 'Product W', 1000, TRUE, 4, NOW(), NOW()),
(24, 'Product X', 1000, TRUE, 4, NOW(), NOW());


-- ProductSalesStat 테이블 샘플 데이터
INSERT INTO `product_sales_stat` (`id`, `product_id`, `date`, `order_count`, `sales_quantity`, `sales_amount`, `created_at`, `updated_at`) VALUES
(1, 1, NOW(), 10, 100, 1000, NOW(), NOW()),
(2, 2, NOW(), 20, 200, 2000, NOW(), NOW()),
(3, 3, NOW(), 30, 300, 3000, NOW(), NOW()),
(4, 4, NOW(), 40, 400, 4000, NOW(), NOW()),
(5, 5, NOW(), 50, 500, 5000, NOW(), NOW()),
(6, 6, NOW(), 60, 600, 6000, NOW(), NOW()),
(7, 7, NOW(), 70, 700, 7000, NOW(), NOW()),
(8, 8, NOW(), 80, 800, 8000, NOW(), NOW()),
(9, 9, NOW(), 90, 900, 9000, NOW(), NOW()),
(10, 10, NOW(), 100, 1000, 10000, NOW(), NOW());

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
(3, 3, NULL, 3000, 300, 2700, 'PENDING', NOW()),
(4, 4, NULL, 4000, 400, 3600, 'FAILED', NOW()),
(5, 5, NULL, 5000, 500, 4500, 'PAID', NOW()),
(6, 6, NULL, 6000, 600, 5400, 'PENDING', NOW()),
(7, 7, NULL, 7000, 700, 6300, 'CANCELLED', NOW()),
(8, 8, NULL, 8000, 800, 7200, 'FAILED', NOW()),
(9, 9, NULL, 9000, 900, 8100, 'PAID', NOW()),
(10, 10, NULL, 1000, 100, 900, 'PENDING', NOW()),
(11, 11, NULL, 1000, 100, 900, 'PENDING', NOW()),
(12, 12, NULL, 1000, 100, 900, 'PENDING', NOW()),
(13, 13, NULL, 1000, 100, 900, 'PENDING', NOW()),
(14, 32, NULL, 1000, 100, 900, 'PENDING', NOW()),
(15, 34, NULL, 1000, 100, 900, 'PENDING', NOW());

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
(2, 'COUPON2', 20, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(3, 'COUPON3', 30, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(4, 'COUPON4', 40, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 100, NOW(), NOW()),
(5, 'COUPON5', 50, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(6, 'COUPON6', 60, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(7, 'COUPON7', 20, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(8, 'COUPON8', 80, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(9, 'COUPON9', 90, 'PERCENTAGE', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(10, 'COUPON10', 100, 'AMOUNT', 'RELATIVE', 30, NULL, NOW(), NOW(), 0, 100, NOW(), NOW()),
(11, 'COUPON11', 100, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 100, NOW(), NOW()),
(12, 'COUPON12', 100, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 30, NOW(), NOW()),
(13, 'COUPON13', 100, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 30, NOW(), NOW()),
(14, 'COUPON14', 100, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 30, NOW(), NOW()),
(15, 'COUPON15', 100, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 30, NOW(), NOW()),
(16, 'COUPON16', 100, 'AMOUNT', 'RELATIVE', 30, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 10, 30, NOW(), NOW());


-- UserCoupon 테이블 샘플 데이터
INSERT INTO `user_coupon` (`id`, `user_id`, `coupon_id`, `issue_date`, `expiration_date`, `status`) VALUES
(1, 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(2, 2, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(3, 3, 3, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(4, 4, 4, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(5, 5, 5, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'USED'),
(6, 6, 6, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'EXPIRED'),
(7, 7, 7, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(8, 8, 8, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'USED'),
(9, 9, 9, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'EXPIRED'),
(10, 10, 10, DATE_ADD(NOW(), INTERVAL -31 DAY), DATE_ADD(NOW(), INTERVAL -30 DAY), 'AVAILABLE'),
(11, 1, 3, DATE_ADD(NOW(), INTERVAL -31 DAY), DATE_ADD(NOW(), INTERVAL -30 DAY), 'AVAILABLE'),
(12, 19, 15, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE'),
(13, 20, 15, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AVAILABLE');
