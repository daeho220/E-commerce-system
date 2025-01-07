CREATE TABLE `user` (
  `id` int PRIMARY KEY,
  `user_name` varchar(255),
  `point` int,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `point_history` (
  `id` int PRIMARY KEY,
  `user_id` int,
  `amount` int,
  `change_type` varchar(255),
  `created_at` datetime
);

CREATE TABLE `product` (
  `id` int PRIMARY KEY,
  `product_name` varchar(255),
  `price` int,
  `status` boolean,
  `stock` int,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `product_sales_stat` (
  `id` int PRIMARY KEY,
  `product_id` int,
  `date` date,
  `order_count` int,
  `sales_quantity` int,
  `sales_amount` int,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `cart_items` (
  `id` int PRIMARY KEY,
  `user_id` int,
  `product_id` int,
  `quantity` int,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `order` (
  `id` int PRIMARY KEY,
  `user_id` int,
  `user_coupon_id` int,
  `original_price` int,
  `discount_price` int,
  `total_price` int,
  `status` varchar(255),
  `created_at` datetime
);

CREATE TABLE `order_detail` (
  `id` int PRIMARY KEY,
  `order_id` int,
  `product_id` int,
  `quantity` int,
  `price_at_purchase` int
);

CREATE TABLE `coupon` (
  `id` int PRIMARY KEY,
  `code` varchar(255),
  `discount_amount` int,
  `discount_type` varchar(255),
  `expiration_type` varchar(255),
  `expiration_days` int,
  `absolute_expiration_date` datetime,
  `issue_start_date` datetime,
  `issue_end_date` datetime,
  `current_count` int,
  `max_count` int,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `user_coupon` (
  `id` int PRIMARY KEY,
  `user_id` int,
  `coupon_id` int,
  `issue_date` datetime,
  `expiration_date` datetime,
  `status` varchar(255)
);

CREATE TABLE `payment` (
  `id` int PRIMARY KEY,
  `order_id` int,
  `user_id` int,
  `payment_method` varchar(255),
  `status` varchar(255),
  `created_at` datetime
);

CREATE UNIQUE INDEX `product_sales_stat_index_0` ON `product_sales_stat` (`product_id`, `date`);

CREATE INDEX `product_sales_stat_index_1` ON `product_sales_stat` (`date`);