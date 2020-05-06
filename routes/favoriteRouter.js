const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user._id })
			.populate('user')
			.populate('dishes')
			.then(
				(favorites) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user._id })
			.then((favorites) => {
				if (favorites == null) {
					favorites = new Favorites({ user: req.user._id, dishes: [] });
				}
				req.body.forEach((fav) => {
					if (favorites.dishes.indexOf(fav._id) === -1) {
						favorites.dishes.push(fav._id);
					}
				});
				favorites.save().then(
					(favorite) => {
						Favorites.findById(favorite._id).populate('user').populate('dishes').then((fav) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(fav);
						});
					},
					(err) => next(err)
				);
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /favorites');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOneAndRemove({ user: req.user._id })
			.then(
				(resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

favoriteRouter
	.route('/:dishId')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('GET operation not supported on /favorites/' + req.params.dishId);
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user._id })
			.then((favorite) => {
				if (favorite == null) {
					favorite = new Favorites({ user: req.user._id, dishes: [] });
				}
				if (favorite.dishes.indexOf(req.params.dishId) === -1) {
					favorite.dishes.push(req.params.dishId);
				}
				favorite.save().then(
					(favorite) => {
						Favorites.findById(favorite._id).populate('user').populate('dishes').then((fav) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(fav);
						});
					},
					(err) => next(err)
				);
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /favorites/' + req.params.dishId);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
        .then((favorites) => {  
                if(favorites === null){
                    favorites = new Favorites({user: req.user._id, dishes: []});
                }
                const index = favorites.dishes.indexOf(req.params.dishId)
                if(index !== -1){
                    favorites.dishes.splice(index, 1);
                }
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })            
                }, (err) => next(err));
            
        }, (err) => next(err))
        .catch((err) => next(err));
    });

module.exports = favoriteRouter;
