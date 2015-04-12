/**
 * RESTful web API module.
 * Notes.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify      = require('../restify'),
	notes        = require('../db').models.notes,
	notesHistory = require('../db').models.notesHistory;


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
 * @apiSuccess {number} id User note ID.
 * @apiSuccess {string} data Note encrypted data.
 * @apiSuccess {string} hash Hash of note data before encryption.
 * @apiSuccess {number} createTime Note creation time.
 * @apiSuccess {number} updateTime Note modification time.
 * @apiSuccess {number} readTime Note last access time.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/notes
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {"id": 512, "data":"some data", "hash":"some hash", "createTime": 1427190024722, "updateTime": 0, "readTime": 0},
 *         {"id": 513, "data":"some data", "hash":"some hash", "createTime": 1427190838740, "updateTime": 1427201953944, "readTime": 0},
 *         {"id": 513, "data":"some data", "hash":"some hash", "createTime": 1427190838740, "updateTime": 1427201953944, "readTime": 1427201959845}
 *     ]
 *
 * @apiUse SessionCheckError
 * @apiUse ServerDataSearchError
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
 * @apiParam {string} data Note encrypted data.
 * @apiParam {string} hash Hash of note data before encryption.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --request POST http://localhost:9090/notes
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     {id:512}
 *
 * @apiUse SessionCheckError
 * @apiUse ContentTooBigError
 * @apiUse MissingParameterError
 * @apiUse ServerDataCreationError
 */
restify.post('/notes',
	function ( request, response ) {
		notes.insert(request.authorization.token, request.params, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send({id: data.id});
		});
	}
);


/**
 * @api {get} /notes/:id Get a note old values list.
 *
 * @apiVersion 1.0.0
 * @apiName getNote
 * @apiGroup Note
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiParam {number} id Note id.
 *
 * @apiSuccess {string} data Note encrypted data.
 * @apiSuccess {string} hash Hash of note data before encryption.
 * @apiSuccess {number} time Note history record creation time.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/notes/128
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {"data":"some data", "hash":"some hash", "time": 1427190024722},
 *     ]
 *
 * @apiUse SessionCheckError
 * @apiUse InvalidNoteIdError
 * @apiUse MissingParameterError
 * @apiUse ServerDataSearchError
 */
restify.get('/notes/:id',
	function ( request, response ) {
		notesHistory.list(request.authorization.token, request.params.id, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(data);
		});
	}
);


/**
 * @api {put} /notes/:id Update a note with new data.
 *
 * @apiVersion 1.0.0
 * @apiName putNote
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
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --data "data=qwe&hash=rty" --request PUT http://localhost:9090/notes/128
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     true
 *
 * @apiUse SessionCheckError
 * @apiUse InvalidNoteIdError
 * @apiUse NotFoundError
 * @apiUse ContentTooBigError
 * @apiUse MissingParameterError
 * @apiUse ServerDataSearchError
 * @apiUse ServerDataCreationError
 * @apiUse ServerDataSavingError
 * @apiUse ServerTransactionInitError
 * @apiUse ServerTransactionCommitError
 */
restify.put('/notes/:id',
	function ( request, response ) {
		notes.update(request.authorization.token, request.params, function ( error ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(true);
		});
	}
);
