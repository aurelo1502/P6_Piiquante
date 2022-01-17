const jwt = require('jsonwebtoken');

// declaration de dotenv pour la recuperation des donnees 'token' du fichier .env
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token)
        console.log(process.env.TOKEN)
        const decodedToken = jwt.verify(token, process.env.TOKEN);
        const userId = decodedToken.userId;

        req.auth = { userId };
        next();
    } catch {
        res.status(401).json({
            message: ('Vous n\êtes pas autorisés!!')
        });
    }
};
