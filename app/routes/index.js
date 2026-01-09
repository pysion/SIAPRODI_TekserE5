// TODO: Definisikan semua jalur (Route) aplikasi kalian disini (GET, POST, PUT, DELETE)

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// middleware login
function isLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
}

// HOME / LOGIN PAGE
router.get('/', (req, res) => {
  res.render('index');
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email=? AND pw=?',
    [email, password],
    (err, result) => {
      if (result.length > 0) {
        req.session.user = {
          id: result[0].user_id,
          role: result[0].role
        };

        if (result[0].role === 'admin') {
          res.redirect('/admin');
        } else {
          res.redirect('/dashboard');
        }
      } else {
        res.send('Login gagal');
      }
    }
  );
});

// DASHBOARD USER
router.get('/dashboard', isLogin, (req, res) => {
  const userId = req.session.user.id;

  db.query(
    'SELECT * FROM aspirasi_pengaduan WHERE user_id=?',
    [userId],
    (err, data) => {
      res.json(data); // nanti frontend ganti ke ejs
    }
  );
});

// CREATE ASPIRASI (USER)
router.post('/aspirasi', isLogin, (req, res) => {
  const { kategori, deskripsi, lampiran } = req.body;

  db.query(
    `INSERT INTO aspirasi_pengaduan
    (kategori, deskripsi, lampiran, status, tanggal_kirim, user_id)
    VALUES (?, ?, ?, 'baru', NOW(), ?)`,
    [kategori, deskripsi, lampiran, req.session.user.id],
    () => res.redirect('/dashboard')
  );
});

// UPDATE ASPIRASI (USER, BELUM DIPROSES)
router.post('/aspirasi/update/:id', isLogin, (req, res) => {
  db.query(
    `UPDATE aspirasi_pengaduan
     SET kategori=?, deskripsi=?
     WHERE id_aspirasi=? AND user_id=? AND status='baru'`,
    [
      req.body.kategori,
      req.body.deskripsi,
      req.params.id,
      req.session.user.id
    ],
    () => res.redirect('/dashboard')
  );
});

// DELETE ASPIRASI (USER)
router.get('/aspirasi/delete/:id', isLogin, (req, res) => {
  db.query(
    `DELETE FROM aspirasi_pengaduan
     WHERE id_aspirasi=? AND user_id=? AND status='baru'`,
    [req.params.id, req.session.user.id],
    () => res.redirect('/dashboard')
  );
});

// ADMIN VIEW
router.get('/admin', isLogin, (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.send('Akses ditolak');
  }

  db.query(
    'SELECT * FROM aspirasi_pengaduan',
    (err, data) => {
      res.json(data);
    }
  );
});

// ADMIN UPDATE STATUS
router.post('/admin/status/:id', isLogin, (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.send('Akses ditolak');
  }

  db.query(
    'UPDATE aspirasi_pengaduan SET status=? WHERE id_aspirasi=?',
    [req.body.status, req.params.id],
    () => res.redirect('/admin')
  );
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
