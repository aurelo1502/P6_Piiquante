// recuperation du modele sauce 
const sauce = require('../models/sauce');
const multer = require('../middleware/multer-config');

// declaration de 'fs' pour la gestion des fichiers image des sauces
const fs = require('fs');

// creation sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = (req.body.sauce);
  delete sauceObject._id;        // on enleve le champs id genere du corps de la requete
  const SauceData = new sauce({
    ...sauceObject,
    // ...sauceObject premet de recuperer l'integralite du corps de la requete
  });
  SauceData.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !!' }))
    .catch(error => { res.status(403).json({ error: error.message }) });
};

// recuperer toutes les sauces
exports.getAllSauces = (req, res, next) => {
  sauce.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(403).json({ error: error.message }));
};

// recuperer une sauce
exports.getOneSauce = (req, res, next) => {
  sauce.findOne({ _id: req.params.id })  // on recupere l'id correspondant à la demande et on verifie que celui-ci correspond à l'objet demandé
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(403).json({ error: error.message}));
};

// modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?                                // on verifie si l'image existe ou non
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch(error => res.status(403).json({ error: error.message }));

  sauce.findOne({ _id: req.params.id, userId: req.auth.userId })
    .then(sauce => {
      if (!sauce) {
        res.status(404).json({ error: new Error('Sauce non trouvée !') });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({error: 'Vous n\êtes pas autorisés'});
      }
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

// effacer une sauce
exports.deleteSauce = (req, res, next) => {
  sauce.findOne({ _id: req.params.id, userId: req.auth.userId })
    .then(sauce => {
      if (!sauce) {
        res.status(404).json({ error: 'La sauce n\'existe pas' });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({ error: 'Vous n\êtes pas autorisés'});
      }
      const filename = sauce.imageUrl.split('/images')[1];
      fs.unlink(`images/${filename}`, () => {                // une fois que le fichier est supprimé on supprime la sauce
        sauce.deleteOne({ _id: req.params.id })
          .then(() => { res.status(200).json({ message: 'Votre sauce a été supprimée' }) })
          .catch((error) => { res.status(403).json({ error: error.message}) });
      });
    })
    .catch(error => res.status(500).json({ errror: error.message }));
};

// user like dislike
exports.userLikeSauce = (req, res, next) => {

  let like = req.body.like //Initialiser le statut Like
  let userId = req.body.userId //Recuperation de userId
  let sauceId = req.params.id //Récupération de la sauce
  //Si l'utilisateur like
  if (like === 1) {
    sauce.updateOne(
      { _id: sauceId },
      {
        $push: { usersLiked: userId },
        $inc: { likes: 1 }
      })

      .then(() => res.status(200).json({ message: 'Vous aimez cette sauce !!!' }))
      .catch(error => res.status(403).json({ error: error.message }));
  }
  //Si l'utilisateur Dislike
  if (like === -1) {
    sauce.updateOne(
      { _id: sauceId },
      {
        $push: { usersDisliked: userId },
        $inc: { dislikes: 1 }
      })

      .then(() => res.status(200).json({ message: 'Vous n\'aimez pas cette sauce !!!' }))
      .catch(error => res.status(403).json({ error: error.message }));
  }
  //Annulation d'un like ou dislike
  if (like === 0) {
          sauce.updateOne(
            { _id: sauceId },
            {
              $pull: { usersLiked: userId },
              $inc: { likes: -1 }
            })

            .then(() => res.status(200).json({ message: 'Votre avis a été annulé' }))
            .catch(error => res.status(403).json({ error: error.message }));
        }
};
