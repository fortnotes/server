/**
 * RESTful web API module.
 * Notes.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify   = require('../restify'),
	notes     = require('../db').models.notes,
	notesData = require('../db').models.notesData;


/**
 * @api {get} /notes Receive a list of user notes.
 *
 * @apiVersion 1.0.0
 * @apiName getNotes
 * @apiGroup Notes
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/notes
 *
 * @apiSuccess {number} id User notes ID.
 * @apiSuccess {number} createTime Note creation time.
 * @apiSuccess {number} updateTime Note modification time.
 * @apiSuccess {number} readTime Note last access time.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {"id": 512, "createTime": 1427190024722, "updateTime": 0, "readTime": 0},
 *         {"id": 513, "createTime": 1427190838740, "updateTime": 1427201953944, "readTime": 0},
 *         {"id": 513, "createTime": 1427190838740, "updateTime": 1427201953944, "readTime": 1427201959845}
 *     ]
 *
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "BadRequestError",
 *         "message": "no session token"
 *     }
 *
 * @apiErrorExample Error 401:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         "code": "UnauthorizedError",
 *         "message": "invalid session"
 *     }
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "notes search failure"
 *     }
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "token search failure"
 *     }
 */
restify.get('/notes',
	function ( request, response ) {
		notes.list(request.authorization.token, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(data);
		});
	}
);


/**
 * @api {post} /notes Create a user note.
 *
 * @apiVersion 1.0.0
 * @apiName postNotes
 * @apiGroup Notes
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --request POST http://localhost:9090/notes
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     {id:512}
 *
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "BadRequestError",
 *         "message": "no session token"
 *     }
 *
 * @apiErrorExample Error 401:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         "code": "UnauthorizedError",
 *         "message": "invalid session"
 *     }
 */
restify.post('/notes',
	function ( request, response ) {
		notes.add(request.authorization.token, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send({id: data.id});
		});
	}
);


/**
 * @api {post} /notes/:id Add note data.
 *
 * @apiVersion 1.0.0
 * @apiName postNote
 * @apiGroup Note
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiParam {number} id Note ID.
 * @apiParam {string} data Note encrypted data.
 * @apiParam {string} hash Hash of note data before encryption.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --data "data=qwe&hash=rty" --request POST http://localhost:9090/notes
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
 *         "message": "no session token"
 *     }
 *
 * @apiErrorExample Error 401:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         "code": "UnauthorizedError",
 *         "message": "invalid session"
 *     }
 */
restify.post('/notes/:id',
	function ( request, response ) {
		notesData.add(request.authorization.token, request.params, function ( error ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(true);
		});
	}
);
