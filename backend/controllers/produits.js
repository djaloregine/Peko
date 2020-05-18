const Sauce = require('../models/sauces');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() =>
            res.status(201).json({
                message: "traratata"
            }))
        .catch((error) => res.status(400).json({
            error
        }));
};

exports.getOneSauce = (req, res) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then((sauce) => {
            res.status(200).json(
                sauce
            )
        })
        .catch((error) => {
            res.status(404).json({
                error
            })
        });
};

// Attention WILL commence ici par créer un nouvel objet ! 
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageURL: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    };
    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...sauceObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'sauce modifiée'
        }))
        .catch((error) => res.status(404).json({
            error
        }));
};


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        }).then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({
                        message: 'au revoir la sauce'
                    }))
                    .catch((error) => res.status(400).json({
                        error
                    }));
            })
        })
        .catch((error) => res.status(500).json({
            error
        }));
};


exports.getAllSauce = (req, res) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(404).json({
            message: " les sauces n'ont pas été trouvées "
        }));
};



exports.likeSauce = (req, res) => {
    // on prend l'id de la sauce pour incrémenter ou décrémenter le compteur  
    const action = req.body.action;

    const usersLiked = req.body.usersLiked;
    const usersDisLiked = req.body.usersDisLiked;

    const disLikes = req.body.dislikes;

    Sauce.findOne({
            _id: req.params.id,
            userId: req.body.userId,
            likes: req.body.like
        }).then((userId) => {
            if (!usersLiked.indexOf(userId) && !usersDisLiked.indexOf(userId)) {
                Sauce.updateOne({
                    _id: req.params.id
                }, {
                    ...req.body,
                    _id: req.params.id
                }).then((likes) => {
                    if (action === 1) {
                        usersLiked.push('userId');
                        return likes;
                    } else {
                        const place = usersLiked.indexOf('userId');
                        usersLiked.splice(place, 1);
                        return likes;
                    }
                })
            }
        })
        .catch((error) => res.status(500).json({
            message: 'tu es sur la bonne erreur'
        }));
}




// trouver une sauce pour en modifier le body 
// trouver un user pour savoir s'il a déjà liker sur cette sauce ou pas 
// liker ou disliker, enlever le like ou le dislike  
// if (likes === 1) {le userId est ajouté au tableau de ceux qui aiment} // le tableau du userID est mis à jour // le nombre de like est augmenté de 1
// else if (likes === 0) {le _userId est enlevé soit au tableau de ceux qui aiment, soit au tableau de ceux qu n'aiment pas} //  le tableau du userID est mis à jour // le nombre de like ou dislike est diminué de 1 // 
// else càd -1, le _userId est ajouté au tableau de ceux qui n'aiment pas // le tableau du userID est mis à jour // le nombre de dislike est augmenté de 1
// le _userId ne doit avoir la possibilité d'utiliser sa voix qu'une seule fois sur une sauce 



// https://gist.github.com/aerrity/fd393e5511106420fba0c9602cc05d35


//https://stackoverrun.com/fr/q/12273165