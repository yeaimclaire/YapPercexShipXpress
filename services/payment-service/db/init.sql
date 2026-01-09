CREATE DATABASE IF NOT EXISTS payment_service_db;
USE payment_service_db;

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Berhasil', 'Tertunda', 'Gagal') NOT NULL
);

