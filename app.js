const express = require('express');
const app = express();
app.use(express.json()); // body parser deprecated
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');     // prevention contre les attaques XSS dans les HTTP headers

const sauceRoute = require('./routes/sauceRoute');
const userRoute = require('./routes/userRoute');


// // connexion au fichier d'environnement
require('dotenv').config();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// connexion MongoDB
mongoose.connect('mongodb+srv://aurelo1502:an9p7WkPcYWwhSj@cluster0.hbgrz.mongodb.net/piiquante?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static('uploads'));
app.use('/api/sauces', sauceRoute);
app.use('/api/auth', userRoute);

app.use(helmet());

module.exports = app;