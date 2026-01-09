// TODO: Ini adalah titik masuk aplikasi, setup Express, Middleware, dan Server Listener disini

const express = require('express');
const session = require('express-session');
require('dotenv').config();

const app = express();
const routes = require('./routes/index');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './view');

app.use(
  session({
    secret: 'siapprodi-secret',
    resave: false,
    saveUninitialized: true
  })
);

// routes
app.use('/', routes);

app.listen(3000, () => {
  console.log('SIAPPRODI running on port 3000');
});
