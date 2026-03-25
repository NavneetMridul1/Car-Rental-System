CREATE DATABASE IF NOT EXISTS car_rental_system;
USE car_rental_system;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'AGENCY') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agency_id INT NOT NULL,
  vehicle_model VARCHAR(120) NOT NULL,
  vehicle_number VARCHAR(80) NOT NULL UNIQUE,
  car_image_url VARCHAR(500) NULL,
  seating_capacity INT NOT NULL CHECK (seating_capacity > 0),
  rent_per_day DECIMAL(10, 2) NOT NULL CHECK (rent_per_day > 0),
  CONSTRAINT fk_cars_agency FOREIGN KEY (agency_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @car_image_col_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'cars'
    AND column_name = 'car_image_url'
);
SET @add_car_image_col_sql := IF(
  @car_image_col_exists = 0,
  'ALTER TABLE cars ADD COLUMN car_image_url VARCHAR(500) NULL',
  'SELECT "Column car_image_url already exists"'
);
PREPARE stmt_col FROM @add_car_image_col_sql;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  car_id INT NOT NULL,
  customer_id INT NOT NULL,
  start_date DATE NOT NULL,
  number_of_days INT NOT NULL CHECK (number_of_days > 0),
  total_cost DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @index_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'bookings'
    AND index_name = 'idx_bookings_car_dates'
);
SET @create_index_sql := IF(
  @index_exists = 0,
  'CREATE INDEX idx_bookings_car_dates ON bookings(car_id, start_date)',
  'SELECT "Index idx_bookings_car_dates already exists"'
);
PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;