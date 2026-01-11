const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session'); // Wajib diimport

// 1. Inisialisasi Environment Variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 2. Konfigurasi Middleware Dasar
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 3. Konfigurasi Session (HARUS sebelum rute/routes)
app.use(session({
    secret: 'siapprodi_secret_key_99', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // Session aktif selama 1 jam
}));

// 4. Import Database
const db = require('./config/database');

// 5. Cek Koneksi Database
db.query('SELECT 1')
    .then(() => {
        console.log('✅ DATABASE: Terhubung ke MySQL (XAMPP)');
    })
    .catch(err => {
        console.error('❌ DATABASE: Gagal terhubung!', err.message);
    });

// 6. Pengaturan View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// 7. Route Index (Dipanggil setelah session siap)
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// 8. Menjalankan Server
app.listen(port, () => {
    console.log(`==========================================`);
    console.log(`🚀 SERVER: Berjalan di http://localhost:${port}`);
    console.log(`==========================================`);
});