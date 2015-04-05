/**
 * RESTful web API module.
 * Notes.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../lib/restify'),
	notes   = require('../lib/orm').models.notes;


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
 * @apiSuccess {number} ctime Note creation time.
 * @apiSuccess {number} mtime Note modification time.
 * @apiSuccess {number} atime Note last access time.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {"id": 512, "ctime": 1427190024722, "mtime": 0, "atime": 0},
 *         {"id": 513, "ctime": 1427190838740, "mtime": 1427201953944, "atime": 0},
 *         {"id": 513, "ctime": 1427190838740, "mtime": 1427201953944, "atime": 1427201959845}
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
		notes.add(request.authorization.token, function ( error, note ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send({id: note.id});
		});
	}
);
