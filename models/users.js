/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var isEmail = require('isemail'),
	restify = require('restify');


module.exports = function ( db ) {
	var users = db.define('users', {
		email: {type: 'text', size: 512, required: true, unique: true},

		// inactive till at least one session is confirmed
		active: {type: 'boolean', defaultValue: false},

		// link to table keys - current active encryption key
		keyId: {type: 'integer', unsigned: true},

		// master password hash salt
		salt: {type: 'text', size: 128},

		// master password sha512 hash
		hash: {type: 'text', size: 128},

		// creation time
		ctime: {type: 'integer', unsigned: true, defaultValue: 0},

		// master password update time
		ptime: {type: 'integer', unsigned: true, defaultValue: 0}
	});


	/**
	 * Get user or create if missing.
	 *
	 * @param {string} email user email
	 * @param {Function} callback error/success handler
	 */
	users.getByEmail = function ( email, callback ) {
		// validate
		if ( email && isEmail(email) ) {
			// try to insert
			users.create({email: email, ctime: +new Date()}, function ( error, user ) {
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
};
