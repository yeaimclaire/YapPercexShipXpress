CREATE DATABASE IF NOT EXISTS user_service_db;
USE user_service_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    password VARCHAR(255) NOT NULL
);

