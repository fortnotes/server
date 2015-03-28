/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var isEmail = require('isemail');


module.exports = function ( db ) {
	var users = db.define('users', {
		email: {type: 'text', size: 512, required: true, unique: true},

		// inactive till at least one session is confirmed
		active: {type: 'boolean', defaultValue: false},

		// user password sha512 hash for validation
		passHash: {type: 'text', size: 128},

		// creation time
		ctime: {type: 'integer', unsigned: true, defaultValue: 0}
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
					users.one({email: email}, callback);
				} else {
					// inserted
					callback(null, user);
				}
			});
		} else {
			callback({error: 'empty or invalid email address'});
		}
	};
};
