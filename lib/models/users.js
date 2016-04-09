/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var isEmail = require('isemail').validate,
	restify = require('restify'),
	debug   = require('debug')('db:model:users'),
	config  = require('../../config'),
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
 * @param {function} callback error/success handler
 */
users.getByEmail = function ( email, callback ) {
	// correct incoming params
	if ( email && isEmail(email) ) {
		// address size is correct
		if ( email.length <= config.hashSize ) {
			// try to insert
			users.create({email: email, createTime: +new Date()}, function ( error, user ) {
				if ( error ) {
					// can't insert - already exists
					users.one({email: email}, function ( error, user ) {
						if ( error || !user ) {
							debug(error);
							callback(new restify.errors.NotFoundError('resource was not found'));
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
			callback(new restify.errors.InvalidContentError('content data is too big'));
		}
	} else {
		callback(new restify.errors.BadRequestError('empty or invalid email address'));
	}
};


/**
 * Get user public key by email.
 *
 * @param {string} email user email
 * @param {function} callback error/success handler
 */
users.getKey = function ( email, callback ) {
	// correct incoming params
	if ( email && isEmail(email) ) {
		users.one({email: email}, function ( error, user ) {
			if ( error ) {
				return callback(new restify.errors.InternalServerError('data search failure'));
			}

			if ( user && user.keyId ) {
				// user is valid and has key
				db.models.keys.get(user.keyId, function ( error, key ) {
					if ( error ) {
						return callback(new restify.errors.NotFoundError('resource was not found'));
					}

					// ok
					callback(null, {key: key.pub});
				});
			} else {
				return callback(new restify.errors.BadRequestError('no key'));
			}
		});
	} else {
		callback(new restify.errors.BadRequestError('empty or invalid email address'));
	}
};


/**
 * Receive user master password data.
 *
 * @param {string} token user session token
 * @param {function} callback error/success handler
 */
users.getPass = function ( token, callback ) {
	// is user authorized
	db.models.sessions.check(token, function ( error, session ) {
		if ( error ) {
			return callback(error);
		}

		// get user data
		users.find({id: session.userId}).only('passSalt', 'passHash', 'passTime').run(function ( error, data ) {
			if ( error ) {
				debug(error);
				return callback(new restify.errors.InternalServerError('data search failure'));
			}

			callback(null, {
				salt: data[0].passSalt,
				hash: data[0].passHash,
				time: data[0].passTime
			});
		});
	});
};


/**
 * Save user master password data.
 *
 * @param {string} token user session token
 * @param {Object} params data to save
 * @param {string} params.salt master password salt
 * @param {string} params.hash master password sha512 hash
 * @param {function} callback error/success handler
 */
users.setPass = function ( token, params, callback ) {
	// incoming params are given
	if ( params.salt && params.hash ) {
		// data/hash size is correct
		if ( params.salt.length <= config.hashSize && params.hash.length <= config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				if ( error ) {
					return callback(error);
				}

				// get the necessary user
				users.get(session.userId, function ( error, user ) {
					if ( error ) {
						debug(error);
						return callback(new restify.errors.NotFoundError('resource was not found'));
					}

					// update
					user.save({passSalt: params.salt, passHash: params.hash, passTime: +new Date()}, function ( error ) {
						if ( error ) {
							debug(error);
							return callback(new restify.errors.InternalServerError('data saving failure'));
						}

						callback(null, true);
					});
				});
			});
		} else {
			callback(new restify.errors.InvalidContentError('content data is too big'));
		}
	} else {
		callback(new restify.errors.MissingParameterError('empty pass salt or hash'));
	}
};


/**
 * Receive user encrypted tags.
 *
 * @param {string} token user session token
 * @param {function} callback error/success handler
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
				debug(error);
				return callback(new restify.errors.InternalServerError('data search failure'));
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
 * @param {Object} params data to save
 * @param {string} params.data tags encrypted data
 * @param {string} params.hash hash of tags data before encryption
 * @param {number} params.amount amount of user tags in tags encrypted data
 * @param {function} callback error/success handler
 */
users.setTags = function ( token, params, callback ) {
	// incoming params are given
	if ( params.data && params.hash ) {
		// data/hash size is correct
		if ( params.data.length <= config.dataSize && params.hash.length <= config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				if ( error ) {
					return callback(error);
				}

				// get the necessary user
				users.get(session.userId, function ( error, user ) {
					if ( error ) {
						debug(error);
						return callback(new restify.errors.NotFoundError('resource was not found'));
					}

					// sanitize
					params.amount = Number(params.amount) || 0;
					// update
					user.save({tagsData: params.data, tagsHash: params.hash, tagsAmount: params.amount, tagsTime: +new Date()}, function ( error ) {
						if ( error ) {
							debug(error);
							return callback(new restify.errors.InternalServerError('data saving failure'));
						}

						callback(null, true);
					});
				});
			});
		} else {
			callback(new restify.errors.InvalidContentError('content data is too big'));
		}
	} else {
		callback(new restify.errors.MissingParameterError('empty tags data or hash'));
	}
};


debug('loaded');
