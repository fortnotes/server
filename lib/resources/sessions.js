/**
 * RESTful web API module.
 * User sessions.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify  = require('../restify'),
	sessions = require('../db').models.sessions;


/**
 * @api {get} /sessions?limit=:limit&offset=:offset Receive a list of user sessions.
 *
 * @apiVersion 1.0.0
 * @apiName getSessions
 * @apiGroup Sessions
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiParam {number} [params.limit] Maximum number of records to return.
 * @apiParam {number} [params.offset=0] Offset of the first record to return.
 *
 * @apiSuccess {number} id User session ID.
 * @apiSuccess {number} createTime Session creation time.
 * @apiSuccess {number} confirmTime Session activation time.
 * @apiSuccess {number} deleteTime Session termination time.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/sessions
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {"id": 128, "createTime": 1427190024722, "confirmTime": 0, "deleteTime": 0},
 *         {"id": 129, "createTime": 1427190838740, "confirmTime": 1427201953944, "deleteTime": 0},
 *         {"id": 129, "createTime": 1427190838740, "confirmTime": 1427201953944, "deleteTime": 1427201959845}
 *     ]
 *
 * @apiUse SessionCheckError
 * @apiUse ServerDataSearchError
 */
restify.get('/sessions?limit=:limit&offset=:offset',
	function ( request, response ) {
		sessions.list(request.authorization.token, request.params, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(data);
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
 * @apiSuccess {number} id Generated user session ID.
 * @apiSuccess {string} token Generated user session bearer token.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --data "email=test@gmail.com" http://localhost:9090/sessions
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "id": 128,
 *         "token": "2r1W5ItJN4GlqK2teD77JLZGddf0unnvAlKv+SAl7VCViStq5VcLgkmFZ85iyBS4Wmp1omOnXNlKeQkoM+UmBt/oMda91ovjNlUR8Kl2oG8Hec+Hrijy8xp3+qQwg1qs"
 *     }
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "RNG failure"
 *     }
 *
 * @apiUse NotFoundError
 * @apiUse ContentTooBigError
 * @apiUse MissingParameterError
 * @apiUse ServerDataCreationError
 */
restify.post('/sessions',
	function ( request, response ) {
		// todo: add limitation for total amount of user sessions

		sessions.request(request.params.email, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send({id: data.id, token: data.token});
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
 * @apiParam {number} id User session ID.
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
 *     {
 *         "code": "BadRequestError",
 *         "message": "invalid session or confirmation code"
 *     }
 *
 * @apiUse NotFoundError
 * @apiUse MissingParameterError
 * @apiUse ServerDataSearchError
 * @apiUse ServerDataSavingError
 */
restify.put('/sessions/:id',
	function ( request, response ) {
		sessions.confirm(Number(request.params.id), request.params.code, function ( error ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(true);
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
 * @apiParam {number} id User session ID.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --request DELETE http://localhost:9090/sessions/128
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     true
 *
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "BadRequestError",
 *         "message": "invalid session"
 *     }
 *
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "BadRequestError",
 *         "message": "session is already terminated"
 *     }
 *
 * @apiUse NotFoundError
 * @apiUse SessionCheckError
 * @apiUse MissingParameterError
 * @apiUse ServerDataSavingError
 */
restify.del('/sessions/:id',
	function ( request, response ) {
		sessions.terminate(request.authorization.token, Number(request.params.id), function ( error ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(true);
		});
	}
);
