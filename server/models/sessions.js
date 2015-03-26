/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var crypto = require('crypto'),
	config = require('../config/main');


module.exports = function ( db ) {
	var sessions = db.define('sessions', {
		// link to the table users - owner of the session
		userId: {type: 'integer', unsigned: true, required: true, index: true},

		// active till termination
		active: {type: 'boolean', defaultValue: true},

		// confirmation code validation flag
		confirmed: {type: 'boolean', defaultValue: false},

		// generated session unique token
		token: {type: 'text', size: 128, required: true, unique: true},

		// generated confirmation code to activate the session
		code: {type: 'text', size: 32, required: true},

		// amount of attempts to activate the session (default maximum is 3)
		attempts: {type: 'integer', unsigned: true, defaultValue: 0},

		// creation time
		ctime: {type: 'integer', unsigned: true, defaultValue: 0},

		// activation time
		atime: {type: 'integer', unsigned: true, defaultValue: 0},

		// termination time
		ttime: {type: 'integer', unsigned: true, defaultValue: 0}
	});


	/**
	 * Create active not confirmed session with token.
	 *
	 * @param {string} email user email
	 * @param {Function} callback error/success handler
	 */
	sessions.request = function ( email, callback ) {
		// generate session token
		crypto.randomBytes(config.session.tokenSize + config.session.confirmCodeSize, function ( error, data ) {
			var token, code;

			if ( error ) {
				// RNG failure
				callback(error);
			} else {
				// prepare
				token = data.slice(0, config.session.tokenSize).toString('base64');
				code  = data.slice(config.session.tokenSize).toString('base64');

				// get user or create if missing
				db.models.users.getByEmail(email, function ( error, user ) {
					if ( error ) {
						// wrong user
						callback(error);
					} else {
						// insert
						sessions.create({userId: user.id, token: token, code: code, ctime: +new Date()}, callback);
					}
				});
			}
		});
	};


	/**
	 * Validate confirmation code and set session confirmed.
	 *
	 * @param {number} id user session id
	 * @param {string} code confirmation code
	 * @param {Function} callback error/success handler
	 */
	sessions.confirm = function ( id, code, callback ) {
		// validate
		if ( id && code ) {
			// find by id
			sessions.get(id, function ( error, session ) {
				if ( error ) {
					// wrong id
					callback(error);
				} else {
					session.attempts++;
					// allow to confirm
					if ( session && session.active && session.code === code && session.attempts < config.session.confirmAttempts ) {
						session.confirmed = true;
						session.atime     = +new Date();
						session.save(callback);
					} else {
						session.save();
						callback({error: 'invalid session id or confirmation code'});
					}
				}
			});
		} else {
			callback({error: 'invalid session id or confirmation code'});
		}
	};


	/**
	 * Make sure user has a valid confirmed token.
	 *
	 * @param {string} token user session token
	 * @param {Function} callback error/success handler
	 */
	sessions.check = function ( token, callback ) {
		// validate
		if ( token ) {
			sessions.one({token: token}, function ( error, session ) {
				if ( error ) {
					callback(error);
				} else {
					// exists and valid
					if ( session && session.active && session.confirmed ) {
						callback(null, session);
					} else {
						callback({error: 'invalid session'});
					}
				}
			});
		} else {
			callback({error: 'no session token'});
		}
	};


	/**
	 * Terminate the given user session by id.
	 *
	 * @param {string} token user session token
	 * @param {number} id user session id
	 * @param {Function} callback error/success handler
	 */
	sessions.terminate = function ( token, id, callback ) {
		// authenticate
		sessions.check(token, function ( error, currentSession ) {
			var data = {active: false, ttime: +new Date()};

			if ( error ) {
				callback(error);
			} else {
				if ( currentSession.id === id ) {
					// kill the current session
					currentSession.save(data, callback);
				} else {
					// find by id
					sessions.get(id, function ( error, session ) {
						if ( error ) {
							callback(error);
						} else {
							// does the user own the given session?
							if ( currentSession.userId === session.userId ) {
								session.save(data, callback);
							} else {
								callback({error: 'invalid session'});
							}
						}
					});
				}
			}
		});
	};
};
