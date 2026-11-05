-- BevSupply — MySQL schema
-- Run with:  mysql -u root -p < src/db/schema.sql

CREATE DATABASE IF NOT EXISTS bevsupply
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bevsupply;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Users & auth
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255),
  role            ENUM('guest','customer','sales_agent','warehouse_manager',
                       'delivery_driver','supplier','finance','super_admin')
                  NOT NULL DEFAULT 'customer',
  phone           VARCHAR(40),
  google_id       VARCHAR(190),
  email_verified  TINYINT(1) NOT NULL DEFAULT 0,
  two_factor      TINYINT(1) NOT NULL DEFAULT 0,
  reward_points   INT NOT NULL DEFAULT 0,
  credit_limit    DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
);

CREATE TABLE refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token       VARCHAR(512) NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_user (user_id)
);

CREATE TABLE addresses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  label       VARCHAR(80),
  line1       VARCHAR(190) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  postal_code VARCHAR(30),
  zone        VARCHAR(30),
  is_default  TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(60) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  icon          VARCHAR(16),
  color         VARCHAR(16)
);

CREATE TABLE suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  category      VARCHAR(100),
  rating        DECIMAL(2,1) DEFAULT 0,
  contact_email VARCHAR(190),
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  slug              VARCHAR(190) NOT NULL UNIQUE,
  name              VARCHAR(190) NOT NULL,
  brand             VARCHAR(100),
  category_id       INT,
  supplier_id       INT,
  sku               VARCHAR(40) NOT NULL UNIQUE,
  barcode           VARCHAR(40),
  description       TEXT,
  ingredients       TEXT,
  volume            VARCHAR(40),
  package_size      VARCHAR(40),
  weight_kg         DECIMAL(6,2),
  country_of_origin VARCHAR(80),
  expiry_date       DATE,
  retail_price      DECIMAL(10,2) NOT NULL,
  wholesale_price   DECIMAL(10,2) NOT NULL,
  discount_percent  INT NOT NULL DEFAULT 0,
  currency          VARCHAR(8) NOT NULL DEFAULT 'USD',
  stock             INT NOT NULL DEFAULT 0,
  min_order_qty     INT NOT NULL DEFAULT 1,
  max_order_qty     INT NOT NULL DEFAULT 5000,
  rating            DECIMAL(2,1) DEFAULT 0,
  review_count      INT NOT NULL DEFAULT 0,
  featured          TINYINT(1) NOT NULL DEFAULT 0,
  tags              VARCHAR(190),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  INDEX idx_products_category (category_id),
  INDEX idx_products_featured (featured),
  FULLTEXT KEY ft_products (name, brand, description)
);

CREATE TABLE product_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  url         VARCHAR(400) NOT NULL,
  position    INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT NOT NULL,
  warehouse     VARCHAR(80) NOT NULL DEFAULT 'Main',
  batch_no      VARCHAR(60),
  quantity      INT NOT NULL DEFAULT 0,
  expiry_date   DATE,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Promotions
-- ---------------------------------------------------------------------------
CREATE TABLE coupons (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(40) NOT NULL UNIQUE,
  percent_off    INT NOT NULL,
  min_subtotal   DECIMAL(10,2) NOT NULL DEFAULT 0,
  active         TINYINT(1) NOT NULL DEFAULT 1,
  expires_at     DATE
);

-- ---------------------------------------------------------------------------
-- Cart
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  cart_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_product (cart_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  reference           VARCHAR(30) NOT NULL UNIQUE,
  user_id             INT NOT NULL,
  status              ENUM('pending','confirmed','packed','ready_for_dispatch',
                           'out_for_delivery','delivered','cancelled','returned','refunded')
                      NOT NULL DEFAULT 'pending',
  subtotal            DECIMAL(12,2) NOT NULL,
  tax                 DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount            DECIMAL(12,2) NOT NULL DEFAULT 0,
  total               DECIMAL(12,2) NOT NULL,
  payment_method      VARCHAR(40),
  payment_status      ENUM('pending','paid','refunded') NOT NULL DEFAULT 'pending',
  stripe_session_id   VARCHAR(255),
  paid_at             DATETIME,
  fulfilment          ENUM('delivery','pickup') NOT NULL DEFAULT 'delivery',
  delivery_address    VARCHAR(255),
  delivery_date       DATE,
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_stripe_session (stripe_session_id)
);

CREATE TABLE order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT,
  product_name  VARCHAR(190) NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL,
  quantity      INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE deliveries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  driver_id     INT,
  status        VARCHAR(40) NOT NULL DEFAULT 'scheduled',
  scheduled_for DATETIME,
  proof_url     VARCHAR(400),
  signature_url VARCHAR(400),
  gps_lat       DECIMAL(9,6),
  gps_lng       DECIMAL(9,6),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Reviews & audit
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  user_id     INT NOT NULL,
  rating      TINYINT NOT NULL,
  title       VARCHAR(150),
  body        TEXT,
  verified    TINYINT(1) NOT NULL DEFAULT 0,
  helpful     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(60),
  entity_id   VARCHAR(60),
  metadata    JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity (entity, entity_id)
);
