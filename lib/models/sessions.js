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

		// creation time
		createTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

		// generated session unique token
		token: {type: 'text', size: 128, required: true, unique: true},

		// generated confirmation code to activate the session
		confirmCode: {type: 'text', size: 32, required: true},

		// amount of attempts to activate the session (default maximum is 3)
		confirmAttempts: {type: 'integer', unsigned: true, defaultValue: 0},

		// time of session confirmation with code
		confirmTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

		// termination time
		deleteTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0}
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

				// insert new session
				sessions.create({userId: user.id, token: token, confirmCode: code, createTime: +new Date()}, function ( error, session ) {
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

				session.confirmAttempts++;

				// allow to confirm
				if ( session && session.deleteTime === 0 && session.confirmCode === code && session.confirmAttempts < global.config.session.confirmAttempts ) {
					//session.confirmed = true;
					session.confirmTime = +new Date();
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
			// get the necessary session
			sessions.one({token: token}, function ( error, session ) {
				if ( error ) {
					console.log(error);
					return new restify.errors.InternalServerError('token search failure');
				}

				// exists and valid
				if ( session && session.deleteTime === 0 && session.confirmTime !== 0 ) {
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
		// is user authorized
		sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// get all user sessions
			sessions.find({userId: session.userId}).only('id', 'confirmAttempts', 'createTime', 'confirmTime', 'deleteTime').run(function ( error, sessionList ) {
				var data = [];

				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('sessions search failure'));
				}

				// reformat data
				sessionList.forEach(function ( item ) {
					data.push({
						id:          item.id,
						createTime:  item.createTime,
						confirmTime: item.confirmTime,
						deleteTime:  item.deleteTime
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
			// is user authorized
			sessions.check(token, function ( error, currentSession ) {
				var data = {deleteTime: +new Date()};

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
							if ( session.deleteTime === 0 ) {
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
