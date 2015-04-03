/**
 * RESTful web API module.
 * Notes.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../lib/restify'),
	db      = require('../lib/orm');


/**
 * @api {get} /notes Get user notes.
 *
 * @apiVersion 1.0.0
 * @apiName getNotes
 * @apiGroup Notes
 * @apiPermission authUser
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/notes
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     []
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *
 *     {"error": "invalid session"}
 */
restify.get('/notes',
	function ( request, response ) {
		//var token = request.headers.authorization.slice(7);

		db.models.sessions.check(request.authorization.token, function ( error, session ) {
			if ( error ) {
				return response.send(401, error);
			}

			db.models.notes.find({userId: session.userId}, function ( error, notes ) {
				var data = [];

				if ( error ) {
					return response.send(400, error);
				}

				// reformat data
				notes.forEach(function ( item ) {
					data.push({
						id:    item.id,
						ctime: item.ctime,
						mtime: item.mtime,
						atime: item.atime
					});
				});

				response.send(data);
			});
		});
	}
);
