/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var isEmail = require('isemail'),
	restify = require('restify'),
	db      = require('../db'),
	users   = db.define('users', {
		email: {type: 'text', size: 250, required: true, unique: true},

		// link to table keys - current active encryption key
		//keyId: {type: 'integer', unsigned: true},

		// creation time
		createTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

		// master password hash salt
		passSalt: {type: 'text', size: 128},

		// master password sha512 hash
		passHash: {type: 'text', size: 128},

		// master password update time
		passTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

		// tags encrypted data
		tagsData: {type: 'text', big: true},

		// sha512 hash of tags data before encryption
		tagsHash: {type: 'text', size: 128},

		// amount of user tags in tags encrypted data
		tagsAmount: {type: 'integer', unsigned: true, defaultValue: 0},

		// tags modification time
		tagsTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0}
	});


/**
 * Get user or create if missing.
 *
 * @param {string} email user email
 * @param {Function} callback error/success handler
 */
users.getByEmail = function ( email, callback ) {
	// correct incoming params
	if ( email && isEmail(email) ) {
		// try to insert
		users.create({email: email, createTime: +new Date()}, function ( error, user ) {
			if ( error ) {
				// can't insert - already exists
				users.one({email: email}, function ( error, user ) {
					if ( error || !user ) {
						console.log(error);
						callback(new restify.errors.NotFoundError('user was not found'));
					} else {
						callback(null, user);
					}
				});
			} else {
				// inserted
				callback(null, user);
			}
		});
	} else {
		callback(new restify.errors.BadRequestError('empty or invalid email address'));
	}
};


/**
 * Get user public key by email.
 *
 * @param {string} email user email
 * @param {Function} callback error/success handler
 */
users.getKey = function ( email, callback ) {
	users.one({email: email}, function ( error, user ) {
		if ( error ) {
			return callback(new restify.errors.BadRequestError('empty or invalid email address'));
		}

		if ( user && user.keyId ) {
			// user is valid and has key
			db.models.keys.get(user.keyId, function ( error, key ) {
				if ( error ) {
					return callback(new restify.errors.BadRequestError('no key'));
				}

				// ok
				callback(null, {key: key.pub});
			});
		} else {
			return callback(new restify.errors.BadRequestError('no key'));
		}
	});
};


/**
 * Receive user encrypted tags.
 *
 * @param {string} token user session token
 * @param {Function} callback error/success handler
 */
users.getTags = function ( token, callback ) {
	// is user authorized
	db.models.sessions.check(token, function ( error, session ) {
		if ( error ) {
			return callback(error);
		}

		// get user data
		users.find({id: session.userId}).only('tagsData', 'tagsHash', 'tagsTime').run(function ( error, data ) {
			if ( error ) {
				console.log(error);
				return callback(new restify.errors.InternalServerError('tags search failure'));
			}

			callback(null, {
				data: data[0].tagsData,
				hash: data[0].tagsHash,
				time: data[0].tagsTime
			});
		});
	});
};


/**
 * Save user encrypted tags.
 *
 * @param {string} token user session token
 * @param {Object} tags data to save
 * @param {string} tags.data tags encrypted data
 * @param {string} tags.hash hash of tags data before encryption
 * @param {number} tags.amount amount of user tags in tags encrypted data
 * @param {Function} callback error/success handler
 */
users.setTags = function ( token, tags, callback ) {
	// correct incoming params
	if ( tags.data && tags.hash ) {
		// is user authorized
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// get the necessary user
			users.get(session.userId, function ( error, user ) {
				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('tags receiving failure'));
				}

				// sanitize
				tags.amount = parseInt(tags.amount, 10) || 0;
				// update
				user.save({tagsData: tags.data, tagsHash: tags.hash, tagsAmount: tags.amount, tagsTime: +new Date()}, function ( error ) {
					if ( error ) {
						console.log(error);
						return callback(new restify.errors.InternalServerError('tags saving failure'));
					}

					callback(null, true);
				});
			});
		});
	} else {
		callback(new restify.errors.BadRequestError('invalid tags data or hash'));
	}
};
