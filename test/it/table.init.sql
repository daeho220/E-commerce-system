CREATE TABLE `user` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL,
  `point` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime
);

CREATE TABLE `point_history` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` int NOT NULL,
  `change_type` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `product` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `product_name` varchar(255) NOT NULL,
  `price` int NOT NULL,
  `status` boolean NOT NULL DEFAULT true,
  `stock` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime
);

CREATE TABLE `product_sales_stat` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `date` date DEFAULT (CURRENT_DATE),
  `order_count` int NOT NULL DEFAULT 0,
  `sales_quantity` int NOT NULL DEFAULT 0,
  `sales_amount` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime
);

CREATE TABLE `cart_items` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime
);

CREATE TABLE `order` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_coupon_id` int,
  `original_price` int NOT NULL,
  `discount_price` int NOT NULL DEFAULT 0,
  `total_price` int NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `order_detail` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_purchase` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `coupon` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `discount_amount` int NOT NULL,
  `discount_type` varchar(255) NOT NULL,
  `expiration_type` varchar(255) NOT NULL,
  `expiration_days` int,
  `absolute_expiration_date` datetime,
  `issue_start_date` datetime NOT NULL,
  `issue_end_date` datetime NOT NULL,
  `current_count` int NOT NULL DEFAULT 0,
  `max_count` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime
);

CREATE TABLE `user_coupon` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `coupon_id` int NOT NULL,
  `issue_date` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `expiration_date` datetime NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE `payment` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX `product_sales_stat_index_0` ON `product_sales_stat` (`product_id`, `date`);

CREATE INDEX `product_sales_stat_index_1` ON `product_sales_stat` (`date`);

CREATE UNIQUE INDEX `payment_index_2` ON `payment` (`order_id`, `user_id`);