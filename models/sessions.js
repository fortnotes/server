/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var crypto  = require('crypto'),
	restify = require('restify');


// public
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
		crypto.randomBytes(global.config.session.tokenSize + global.config.session.confirmCodeSize, function ( error, data ) {
			var token, code;

			if ( error ) {
				// RNG failure
				console.log(error);
				return callback(new restify.errors.InternalServerError('RNG failure'));
			}

			// prepare
			token = data.slice(0, global.config.session.tokenSize).toString('base64');
			code  = data.slice(global.config.session.tokenSize).toString('base64');

			// get user or create if missing
			db.models.users.getByEmail(email, function ( error, user ) {
				if ( error ) {
					return callback(error);
				}

				// insert
				sessions.create({userId: user.id, token: token, code: code, ctime: +new Date()}, function ( error, session ) {
					if ( error ) {
						console.log(error);
						return callback(new restify.errors.InternalServerError('session creation failure'));
					}

					callback(null, session);
				});
			});
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
		// correct incoming params
		if ( id && code ) {
			// find by id
			sessions.get(id, function ( error, session ) {
				if ( error ) {
					return callback(new restify.errors.NotFoundError('session was not found'));
				}

				session.attempts++;

				// allow to confirm
				if ( session && session.active && session.code === code && session.attempts < global.config.session.confirmAttempts ) {
					session.confirmed = true;
					session.atime     = +new Date();
					session.save(function ( error, session ) {
						if ( error ) {
							console.log(error);
							return callback(new restify.errors.InternalServerError('session saving failure'));
						}

						callback(null, session);
					});
				} else {
					session.save();
					callback(new restify.errors.BadRequestError('invalid session or confirmation code'));
				}
			});
		} else {
			callback(new restify.errors.BadRequestError('invalid session id or confirmation code'));
		}
	};


	/**
	 * Make sure user has a valid confirmed token.
	 *
	 * @param {string} token user session token
	 * @param {Function} callback error/success handler
	 */
	sessions.check = function ( token, callback ) {
		// correct incoming params
		if ( token ) {
			sessions.one({token: token}, function ( error, session ) {
				if ( error ) {
					console.log(error);
					return new restify.errors.InternalServerError('token search failure');
				}

				// exists and valid
				if ( session && session.active && session.confirmed ) {
					callback(null, session);
				} else {
					callback(new restify.errors.UnauthorizedError('invalid session'));
				}
			});
		} else {
			callback(new restify.errors.BadRequestError('no session token'));
		}
	};


	/**
	 * Get all user session list.
	 *
	 * @param {string} token user session token
	 * @param {Function} callback error/success handler
	 */
	sessions.list = function ( token, callback ) {
		// is valid user
		sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			sessions.find({userId: session.userId}).only('id', 'active', 'confirmed', 'attempts', 'ctime', 'atime', 'ttime').run(function ( error, sessions ) {
				var data = [];

				if ( error ) {
					console.log(error);
					return callback(new restify.errors.NotFoundError('sessions were not found'));
				}

				// reformat data
				sessions.forEach(function ( item ) {
					data.push({
						id:        item.id,
						active:    item.active,
						confirmed: item.confirmed,
						attempts:  item.attempts,
						ctime:     item.ctime,
						atime:     item.atime,
						ttime:     item.ttime
					});
				});

				callback(null, data);
			});
		});
	};


	/**
	 * Terminate the given user session by id.
	 *
	 * @param {string} token user session token
	 * @param {number} id user session id
	 * @param {Function} callback error/success handler
	 */
	sessions.terminate = function ( token, id, callback ) {
		function sessionSave ( error, session ) {
			if ( error ) {
				console.log(error);
				return callback(new restify.errors.InternalServerError('session saving failure'));
			}

			callback(null, session);
		}

		// correct incoming params
		if ( id ) {
			// is valid user
			sessions.check(token, function ( error, currentSession ) {
				var data = {active: false, ttime: +new Date()};

				if ( error ) {
					return callback(error);
				}


				if ( currentSession.id === id ) {
					// kill the current session
					currentSession.save(data, sessionSave);
				} else {
					// find by id
					sessions.get(id, function ( error, session ) {
						if ( error ) {
							console.log(error);
							return callback(new restify.errors.InternalServerError('session search failure'));
						}

						// does the user own the given session?
						if ( currentSession.userId === session.userId ) {
							if ( session.active ) {
								session.save(data, sessionSave);
							} else {
								callback(new restify.errors.BadRequestError('session is already terminated'));
							}
						} else {
							callback(new restify.errors.BadRequestError('invalid session'));
						}
					});
				}
			});
		} else {
			callback(new restify.errors.BadRequestError('no session id'));
		}
	};
};
