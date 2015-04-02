/**
 * RESTful web API module.
 * User sessions.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../lib/restify'),
	db      = require('../lib/orm');


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
 *         {"id": 128, "active": 1, "confirmed": 0, "attempts": 0, "ctime": 1427190024722, "atime": 0, "ttime": 0},
 *         {"id": 129, "active": 1, "confirmed": 1, "attempts": 1, "ctime": 1427190838740, "atime": 1427201953944, "ttime": 0},
 *         {"id": 129, "active": 0, "confirmed": 1, "attempts": 2, "ctime": 1427190838740, "atime": 1427201953944, "ttime": 1427201959845}
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *
 *     {"error": "invalid session"}
 */
restify.get('/sessions',
	function ( request, response ) {
		var token = request.headers.authorization.slice(7);

		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return response.send(401, error);
			}

			db.models.sessions.find({userId: session.userId}).only('id', 'active', 'confirmed', 'attempts', 'ctime', 'atime', 'ttime').run(function ( error, sessions ) {
				var data = [];

				if ( error ) {
					return response.send(400, error);
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

				response.send(200, data);
			});
		});
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
 * @apiParam {string} email User email address.
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
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *
 *     "empty or invalid email address"
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *
 *     "RNG failure"
 */
restify.post('/sessions',
	function ( request, response ) {
		// todo: add limitation for total amount of user sessions

		db.models.sessions.request(request.params.email, function ( error, session ) {
			if ( error ) {
				return response.send(error.code, error.message);
			}

			// ok
			response.send(200, {id: session.id, token: session.token});
		});
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
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *
 *     "invalid session id or confirmation code"
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *
 *     "failed to confirm session"
 */
restify.put('/sessions/:id',
	function ( request, response ) {
		db.models.sessions.confirm(Number(request.params.id), request.params.code, function ( error ) {
			if ( error ) {
				return response.send(error.code, error.message);
			}

			// ok
			response.send(200, true);
		});
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
				return response.send(400, error);
			}

			// ok
			response.send(200, true);
		});
	}
);
