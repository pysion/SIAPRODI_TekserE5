const express = require('express');
const app = express();
const path = require('path');

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// Middleware agar bisa baca input dari form
app.use(express.urlencoded({ extended: true }));

// Route utama
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.listen(3000, () => {
    console.log('SIAPPRODI running on port 3000');
});