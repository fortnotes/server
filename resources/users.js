/**
 * RESTful web API module.
 * Users.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../lib/restify'),
	users   = require('../lib/orm').models.users;


/**
 * @api {get} /users/:email/keys/current Get user public key by email.
 *
 * @apiVersion 1.0.0
 * @apiName getUserKey
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiParam {string} email User email address.
 *
 * @apiExample {curl} Example usage:
 *     curl --include http://localhost:9090/users/test@gmail.com/keys/current
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     {"key": "[key data]"}
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error": "empty or invalid email address"}
 */
restify.get('/users/:email/keys/current',
	function ( request, response ) {
		users.getKey(request.params.email, function ( error, key ) {
			if ( error ) {
				return response.send(error);
			}

			// ok
			response.send(key);
		});
	}
);
