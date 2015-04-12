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
 * @param {function} callback error/success handler
 */
users.getByEmail = function ( email, callback ) {
	// correct incoming params
	if ( email && isEmail(email) ) {
		// address size is correct
		if ( email.length <= global.config.hashSize ) {
			// try to insert
			users.create({email: email, createTime: +new Date()}, function ( error, user ) {
				if ( error ) {
					// can't insert - already exists
					users.one({email: email}, function ( error, user ) {
						if ( error || !user ) {
							console.log(error);
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
				console.log(error);
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
 * @param {Object} passData data to save
 * @param {string} passData.salt master password salt
 * @param {string} passData.hash master password sha512 hash
 * @param {function} callback error/success handler
 */
users.setPass = function ( token, passData, callback ) {
	// incoming params are given
	if ( passData.salt && passData.hash ) {
		// data/hash size is correct
		if ( passData.salt.length <= global.config.hashSize && passData.hash.length <= global.config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				if ( error ) {
					return callback(error);
				}

				// get the necessary user
				users.get(session.userId, function ( error, user ) {
					if ( error ) {
						console.log(error);
						return callback(new restify.errors.NotFoundError('resource was not found'));
					}

					// update
					user.save({passSalt: passData.salt, passHash: passData.hash, passTime: +new Date()}, function ( error ) {
						if ( error ) {
							console.log(error);
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
				console.log(error);
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
 * @param {Object} tagsData data to save
 * @param {string} tagsData.data tags encrypted data
 * @param {string} tagsData.hash hash of tags data before encryption
 * @param {number} tagsData.amount amount of user tags in tags encrypted data
 * @param {function} callback error/success handler
 */
users.setTags = function ( token, tagsData, callback ) {
	// incoming params are given
	if ( tagsData.data && tagsData.hash ) {
		// data/hash size is correct
		if ( tagsData.data.length <= global.config.dataSize && tagsData.hash.length <= global.config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				if ( error ) {
					return callback(error);
				}

				// get the necessary user
				users.get(session.userId, function ( error, user ) {
					if ( error ) {
						console.log(error);
						return callback(new restify.errors.NotFoundError('resource was not found'));
					}

					// sanitize
					tagsData.amount = parseInt(tagsData.amount, 10) || 0;
					// update
					user.save({tagsData: tagsData.data, tagsHash: tagsData.hash, tagsAmount: tagsData.amount, tagsTime: +new Date()}, function ( error ) {
						if ( error ) {
							console.log(error);
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
