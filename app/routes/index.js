const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware Cek Login
const isAuth = (req, res, next) => {
    if (req.session && req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
};

// --- DASHBOARD UTAMA ---
router.get('/', isAuth, async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.session.user.role === 'admin') {
            query = `SELECT ap.*, u.nama FROM aspirasi_pengaduan ap 
                     JOIN users u ON ap.user_id = u.user_id 
                     ORDER BY ap.tanggal_kirim DESC`;
        } else {
            query = `SELECT * FROM aspirasi_pengaduan WHERE user_id = ? 
                     ORDER BY tanggal_kirim DESC`;
            params = [req.session.user.user_id];
        }

        const [rows] = await db.query(query, params);
        res.render('index', { aspirasi: rows, user: req.session.user });
    } catch (err) {
        res.status(500).send("Gagal memuat data");
    }
});

// ==========================================
// --- FITUR EDIT (UPDATE) ---
// ==========================================

// 1. Tampilkan Halaman Edit
router.get('/edit/:id', isAuth, async (req, res) => {
    const id_laporan = req.params.id;
    try {
        // Ambil data lama berdasarkan ID
        const [rows] = await db.query('SELECT * FROM aspirasi_pengaduan WHERE id_aspirasi = ?', [id_laporan]);
        
        if (rows.length > 0) {
            // Render file edit.ejs dan kirimkan datanya
            res.render('edit', { data: rows[0], user: req.session.user });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.status(500).send("Gagal memuat halaman edit");
    }
});

// 2. Proses Update Data
router.post('/update/:id', isAuth, async (req, res) => {
    const id_laporan = req.params.id;
    const { kategori, deskripsi } = req.body;
    try {
        // Update kategori dan deskripsi di database
        await db.query(
            'UPDATE aspirasi_pengaduan SET kategori = ?, deskripsi = ? WHERE id_aspirasi = ?',
            [kategori, deskripsi, id_laporan]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal memperbarui laporan");
    }
});

// --- FITUR ADMIN: UPDATE STATUS ---
router.get('/update-status/:id/:statusbaru', isAuth, async (req, res) => {
    if (req.session.user.role !== 'admin') return res.redirect('/');
    
    const { id, statusbaru } = req.params;
    try {
        await db.query('UPDATE aspirasi_pengaduan SET status = ? WHERE id_aspirasi = ?', [statusbaru, id]);
        res.redirect('/');
    } catch (err) {
        res.send("Gagal update status");
    }
});

// --- LOGIN & LOGOUT ---
router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
        req.session.loggedin = true;
        req.session.user = rows[0];
        res.redirect('/');
    } else {
        res.send("<script>alert('Salah!'); window.location='/login';</script>");
    }
});
router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

// --- TAMBAH LAPORAN (MAHASISWA) ---
router.post('/tambah', isAuth, async (req, res) => {
    const { kategori, deskripsi } = req.body;
    await db.query('INSERT INTO aspirasi_pengaduan (user_id, kategori, deskripsi) VALUES (?, ?, ?)', 
                  [req.session.user.user_id, kategori, deskripsi]);
    res.redirect('/');
});

// --- HAPUS LAPORAN ---
router.get('/delete/:id', isAuth, async (req, res) => {
    const id_laporan = req.params.id;
    try {
        await db.query('DELETE FROM aspirasi_pengaduan WHERE id_aspirasi = ?', [id_laporan]);
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Gagal menghapus laporan");
    }
});

module.exports = router;