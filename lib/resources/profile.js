/**
 * RESTful web API module.
 * Notes.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../restify'),
	users   = require('../db').models.users;


/**
 * @api {get} /profile/pass Receive user master password data.
 *
 * @apiVersion 1.0.0
 * @apiName getPass
 * @apiGroup Profile
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiSuccess {string} salt User master password salt.
 * @apiSuccess {string} hash User master password sha512 hash.
 * @apiSuccess {number} time User master password modification time.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/profile/pass
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     {"data":"...","hash":"...","time":1428777153259}
 *
 * @apiUse SessionCheckError
 * @apiUse ServerDataSearchError
 */
restify.get('/profile/pass',
	function ( request, response ) {
		users.getPass(request.authorization.token, function ( error, data ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(data);
		});
	}
);


/**
 * @api {put} /profile/pass Save user master password data.
 *
 * @apiVersion 1.0.0
 * @apiName setPath
 * @apiGroup Profile
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiParam {string} salt User master password salt.
 * @apiParam {string} hash User master password sha512 hash.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --data "salt=[pass salt]&hash=[sha512 hash of pass]" --request PUT http://localhost:9090/profile/pass
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     true
 *
 * @apiUse SessionCheckError
 * @apiUse ContentTooBigError
 * @apiUse NotFoundError
 * @apiUse MissingParameterError
 * @apiUse ServerDataSearchError
 * @apiUse ServerDataSavingError
 */
restify.put('/profile/pass',
	function ( request, response ) {
		users.setPass(request.authorization.token, request.params, function ( error ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(true);
		});
	}
);
