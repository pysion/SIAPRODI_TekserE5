CREATE DATABASE IF NOT EXISTS siapprodi;
USE siapprodi;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('mahasiswa', 'admin') DEFAULT 'mahasiswa'
);

CREATE TABLE aspirasi_pengaduan (
    id_aspirasi INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    kategori ENUM('aspirasi', 'pengaduan') NOT NULL,
    deskripsi TEXT NOT NULL,
    status ENUM('pending', 'diproses', 'selesai') DEFAULT 'pending',
    tanggal_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Data Dummy
INSERT INTO users (nama, email, password, role) VALUES 
('Admin Prodi', 'admin@prodi.ac.id', 'admin123', 'admin'),
('Budi Mahasiswa', 'budi@mhs.ac.id', 'mhs123', 'mahasiswa');