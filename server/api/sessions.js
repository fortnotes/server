/**
 * RESTful web API module.
 * User sessions.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../restify'),
	//querystring = require('querystring'),
	crypto = require('crypto'),
	//cookie = require('cookie'),
	isEmail = require('isemail'),
	config  = require('../config/main');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./server/db/sqlite/db.sqlite');
var stmtUserCreate = db.prepare('insert into users (email) values (?)');
var stmtSessionCreate = db.prepare('insert into sessions (user_id, token, code, ctime) values (?, ?, ?, ?)');

var db = require('../orm');

/**
 * @apiDefine UserNotFoundError
 *
 * @apiError UserNotFound The ID of the User was not found.
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *     "error": "UserNotFound"
 * }
 */

/**
 * @apiDefine authUser Authorized user access only.
 *
 * Requests are valid only in case the user is authorized and have a valid active session.
 */


function getUserId ( email, callback ) {
	db.get('select id from users where email = ?', email, function ( error, row ) {
		//console.log(error);
		//console.log(row);

		if ( error ) {
			return callback(error, null);
		}

		if ( row ) {
			callback(null, row.id);
		} else {
			stmtUserCreate.run(email, function ( error, row ) {
				db.get('select id from users where email = ?', email, function ( error, row ) {
					if ( error ) {
						return callback(error, null);
					}

					callback(null, row.id);
				});
			});
		}
	});
}


function authUser ( request, response, callback ) {
	var token = request.headers.authorization ? request.headers.authorization.slice(7) : null;

	if ( token ) {
		db.get('select user_id, state from sessions where token = ?', token, function ( error, session ) {
			if ( error ) { throw error; }

			// exists and valid
			if ( session && session.state === 1 ) {
				callback(session.user_id);
			} else {
				response.send(401, {error: 'invalid session'});
			}
		});
	} else {
		response.send(401, {error: 'no session token'});
	}
}


/**
 * @api {get} /sessions Receive a list of a user sessions.
 *
 * @apiVersion 1.0.0
 * @apiName getSessions
 * @apiGroup Sessions
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/sessions
 *
 * @apiSuccess {number} id User session ID.
 * @apiSuccess {number} state Session active state: 0 - not active, 1 - active, 2 - terminated.
 * @apiSuccess {number} attempts Amount of attempts to activate the session (default maximum is 3).
 * @apiSuccess {number} ctime Session creation time.
 * @apiSuccess {number} atime Session activation time.
 * @apiSuccess {number} ttime Session termination time.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {"id":128, "state":0, "attempts":0, "ctime":1427190024722, "atime":0, "ttime":0},
 *         {"id":129, "state":1, "attempts":1, "ctime":1427190838740, "atime":1427201953944, "ttime":0}
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 */
restify.get('/sessions',
	function ( request, response ) {
		var token = request.headers.authorization.slice(7);

		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				response.send(400, error);
			} else {
				db.models.sessions.find({userId: session.userId}).only('id', 'active', 'confirmed', 'attempts', 'ctime', 'atime', 'ttime').run(function ( error, sessions ) {
					var data = [];

					if ( error ) {
						response.send(400, error);
					} else {
						sessions.forEach(function ( item ) {
							data.push({
								id: item.id,
								active: item.active,
								confirmed: item.confirmed,
								attempts: item.attempts,
								ctime: item.ctime,
								atime: item.atime,
								ttime: item.ttime
							});
						});
						response.send(200, data);
					}
				});
			}
		});
		//authUser(request, response, function ( userId ) {
		//	db.all('select id, state, attempts, ctime, atime, ttime from sessions where user_id = ?', userId, function ( error, sessions ) {
		//		if ( error ) { throw error; }
		//
		//		response.send(200, sessions);
		//	});
		//});
	}
);


/**
 * @api {post} /sessions Initialize a new session for the given email address.
 *
 * @apiVersion 1.0.0
 * @apiName postSessions
 * @apiGroup Sessions
 * @apiPermission none
 *
 * @apiParam {string} email Users email address.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --data "email=test@gmail.com" http://localhost:9090/sessions
 *
 * @apiSuccess {string} id Generated user session ID.
 * @apiSuccess {string} token Generated user session bearer token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "id": 128,
 *         "token": "2r1W5ItJN4GlqK2teD77JLZGddf0unnvAlKv+SAl7VCViStq5VcLgkmFZ85iyBS4Wmp1omOnXNlKeQkoM+UmBt/oMda91ovjNlUR8Kl2oG8Hec+Hrijy8xp3+qQwg1qs"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error": "empty or invalid email address"}
 */
restify.post('/sessions',
	function ( request, response ) {
		//var email = request.params.email,
		//	tDate = new Date();

		// todo: add limitation for total amount of user sessions

		db.models.sessions.request(request.params.email, function ( error, session ) {
			if ( error ) {
				// building a response
				response.send(400, error);
			} else {
				response.send(200, {id: session.id, token: session.token});
			}
		});

		//if ( email && isEmail(email) ) {
		//	// generate session token
		//	crypto.randomBytes(config.session.tokenSize + config.session.confirmCodeSize, function ( error, data ) {
		//		var token, ccode;
		//
		//		if ( error ) { throw error; }
		//
		//		// set token lifetime 1 year
		//		tDate.setFullYear(tDate.getFullYear() + 1);
		//
		//		token = data.slice(0, config.session.tokenSize).toString('base64');
		//		ccode = data.slice(config.session.tokenSize).toString('base64');
		//
		//		// building a response
		//		//event.response.writeHead(200, {
		//		//	'Access-Control-Allow-Origin': '*',
		//		//	'Access-Control-Allow-Credentials': 'true',
		//		//	'Set-Cookie': ['token=' + data.toString('base64') + '; expires=' + tDate.toUTCString()]
		//		//});
		//		//event.response.end();
		//
		//		getUserId(email, function ( error, id ) {
		//			if ( error ) {
		//				return response.send(400, {error: 'was not able to find or create user'});
		//			}
		//
		//			stmtSessionCreate.run([id, token, ccode, +new Date()], function ( error, row ) {
		//				db.get('select id from sessions where token = ?', token, function ( error, row ) {
		//					response.setHeader('Set-Cookie', 'token=' + 'token' + '; domain=localhost; expires=' + tDate.toUTCString());
		//					response.send(200, {id: row.id, token: token});
		//				});
		//			});
		//		});
		//
		//	});
		//} else {
		//	// building a response
		//	response.send(400, {error: 'empty or invalid email address'});
		//	//event.response.writeHead(200, {
		//	//	'Access-Control-Allow-Origin': '*',
		//	//	'Access-Control-Allow-Credentials': true,
		//	//	'Content-Length': 3
		//	//});
		//	//event.response.end('!!!');
		//}
	}
);


/**
 * @api {put} /sessions/:id Activate a new session with the code sent to the user email address.
 *
 * @apiVersion 1.0.0
 * @apiName putSessionItem
 * @apiGroup Session
 * @apiPermission none
 *
 * @apiParam {string} id User session ID.
 * @apiParam {string} code Session activation code.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --data "code=fd28f002ea673d316e" --request PUT http://localhost:9090/sessions/128
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     true
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error": "invalid session"}
 */
restify.put('/sessions/:id',
	function ( request, response ) {
		//var id   = Number(request.params.id),
		//	code = request.params.code;

		db.models.sessions.confirm(request.params.id, request.params.code, function ( error, session ) {
			if ( error ) {
				// fail
				response.send(400, error);
			} else {
				// ok
				response.send(200, true);
			}
		});

		//if ( id && code ) {
		//	db.get('select state, code, attempts from sessions where id = ?', id, function ( error, session ) {
		//		//console.log(session);
		//		if ( session && session.state === 0 && session.code === code && session.attempts < config.session.confirmAttempts ) {
		//			db.run('update sessions set state = 1, atime = ? where id = ?', +new Date(), id, function ( error, row ) {
		//				response.send(200, true);
		//			});
		//		} else {
		//			response.send(400, {error: 'invalid session'});
		//		}
		//
		//		// increase attempts amount
		//		db.run('update sessions set attempts = attempts + 1 where id = ?', id);
		//	});
		//} else {
		//	response.send(400, {error: 'invalid session id or confirmation code'});
		//}
	}
);


/**
 * @api {delete} /sessions/:id Terminate the given user session.
 *
 * @apiVersion 1.0.0
 * @apiName deleteSessionItem
 * @apiGroup Session
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiParam {string} id User session ID.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --request DELETE http://localhost:9090/sessions/128
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     true
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error":"invalid session"}
 */
restify.del('/sessions/:id',
	function ( request, response ) {
		var token = request.headers.authorization.slice(7),
			id    = Number(request.params.id);

		db.models.sessions.terminate(token, id, function ( error ) {
			if ( error ) {
				// fail
				response.send(400, error);
			} else {
				// ok
				response.send(200, true);
			}
		});

		//authUser(request, response, function ( userId ) {
		//	db.run('update sessions set state = 2, ttime = ? where id = ? and user_id = ?', +new Date(), id, userId, function ( error ) {
		//		if ( error ) { throw error; }
		//
		//		// todo: check update result
		//
		//		response.send(200, true);
		//	});
		//});
	}
);
