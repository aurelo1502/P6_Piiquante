const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// recuperation du modele user 
const User = require('../models/user');

// declaration de dotenv pour la recuperation des donnees 'token' du fichier .env
require('dotenv').config();

// creation d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    User.findOne({email: req.body.email})// Vérification de la présence de l'utilisateur dans la base de donnée
        .then(user => {
            if (user) { 
                return res.status(401).json({message: "Utilisateur déjà inscrit"}) 
            } 
            bcrypt.hash(req.body.password, 10)
                    .then(hash => {//hashage du mot de passe
                        const user = new User({// Création du nouvel utilisateur
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(() => res.status(201).json({message: "Utilisateur créé !"}))
                            .catch(error => res.status(400).json({ message: error.message }))
                    })
        })
        .catch(error => res.status(500).json({ message: error.message}))
};
// connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }
            bcrypt.compare(req.body.password, user.password)         // bcrypt compare le password de l'utilisateur avec le password stocke dans la bdd
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Mot de passe Incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id },
                            process.env.TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ message: error.message}));
        })
        .catch(error => res.status(500).json({ message: error.message }));
};