const multer = require('multer');
const express = require('express');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {                                // on modifie le nom du fichier pour eviter les nom de fichiers identiques  
        const name = file.originalname.split(' ').join('_');            // on supprime les espaces dans les noms originaux des fichiers pour les remplacer par des underscore
        const extension = MIME_TYPES[file.mimetype];                    // on cree l'extension du fichier en fonction du mime type
        callback(null, name + Date.now() + '.' + extension);            // date.now permet de creer un nom de fichier unique
    }
});

const upload = multer({
    storage: storage
}).single('image');

module.exports = multer({ storage }).single('image');