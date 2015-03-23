/**
 * RESTful web API module.
 * User sessions.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../restify'),
	querystring = require('querystring'),
	crypto = require('crypto'),
	cookie = require('cookie'),
	isEmail = require('isemail');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./server/db/sqlite/db.sqlite');
var stmtUserCreate = db.prepare('insert into users (email) values (?)');
var stmtSessionCreate = db.prepare('insert into sessions (user_id, token, code, ctime) values (?, ?, ?, ?)');


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
	var token = request.headers.cookie ? cookie.parse(request.headers.cookie).token : null;

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
 * @api {get} /sessions Receive a list of all authorized user sessions.
 *
 * @apiVersion 1.0.0
 * @apiName getSessions
 * @apiGroup Sessions
 * @apiPermission authUser
 *
 * @apiExample {curl} Example usage:
 *     curl --include http://localhost:9090/sessions
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 */
restify.get('/sessions',
	function ( request, response, next ) {
		db.get('select user_id, state from sessions where token = ?', token, function ( error, session ) {
			if ( error ) { throw error; }


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
 * @apiParam {string} email Users email address.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --data "email=test@gmail.com" http://localhost:9090/sessions
 *
 * @apiSuccess {string} token Generated user session ID.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Content-Length: 148
 *     Set-Cookie:token=5nNOF+dNQaHvq/klxbRtQ2BwvxbnQ/FuhqIQ7UcbdlSNWZRf/S9MRHQ0/4BYMBQMYizh0DScOTqUlVYg7fyCdiw7JowGM3Q7HrdTCqqEO9Q1LVEBPXtF1ry+XLVKB+xi; expires=Tue, 22 Mar 2016 17:54:03 GMT
 *
 *     {"id": 128}
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error": "empty or invalid email address"}
 */
restify.post('/sessions',
	function ( request, response ) {
		var email = request.params.email,
			tDate = new Date();

		if ( email && isEmail(email) ) {
			// generate session token
			crypto.randomBytes(110, function ( error, data ) {
				var token, ccode;

				if ( error ) { throw error; }

				// set token lifetime 1 year
				tDate.setFullYear(tDate.getFullYear() + 1);

				token = data.slice(0, 96).toString('base64');
				ccode = data.slice(96).toString('hex');

				// building a response
				//event.response.writeHead(200, {
				//	'Access-Control-Allow-Origin': '*',
				//	'Access-Control-Allow-Credentials': 'true',
				//	'Set-Cookie': ['token=' + data.toString('base64') + '; expires=' + tDate.toUTCString()]
				//});
				//event.response.end();

				getUserId(email, function ( error, id ) {
					if ( error ) {
						return response.send(400, {error: 'was not able to find or create user'});
					}

					stmtSessionCreate.run([id, token, ccode, +new Date()], function ( error, row ) {
						db.get('select id from sessions where token = ?', token, function ( error, row ) {
							response.setHeader('Set-Cookie', 'token=' + 'token' + '; domain=localhost; expires=' + tDate.toUTCString());
							response.send(200, {id: row.id, token: token});
						});
					});
				});

			});
		} else {
			// building a response
			response.send(400, {error: 'empty or invalid email address'});
			//event.response.writeHead(200, {
			//	'Access-Control-Allow-Origin': '*',
			//	'Access-Control-Allow-Credentials': true,
			//	'Content-Length': 3
			//});
			//event.response.end('!!!');
		}
	}
);


/**
 * @api {put} /sessions/:id Activate a new session with the code sent to the user email address.
 *
 * @apiVersion 1.0.0
 * @apiName putSessions
 * @apiGroup Session Item
 * @apiPermission none
 *
 * @apiParam {string} id User session ID.
 * @apiParam {string} code Session activation code.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --data "code=fd28f002ea673d316e" --request PUT http://localhost:9090/sessions/128
 *
 * @apiSuccess {string} token Generated user session ID???.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {"ok": true}
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error": "invalid session"}
 */
restify.put('/sessions/:id',
	function ( request, response, next ) {
		var id   = Number(request.params.id),
			code = request.params.code;

		if ( id && code ) {
			db.get('select state, code from sessions where id = ?', id, function ( error, row ) {
				console.log(row);
				if ( row && row.state === 0 && row.code === code ) {
					db.run('update sessions set state = 1, atime = ? where id = ?', +new Date(), id, function ( error, row ) {
						response.send(200, {ok: true});
					});
				} else {
					response.send(400, {error: 'invalid session'});
				}
			});
		} else {
			response.send(400, {error: 'invalid session id or confirmation code'});
		}
	}
);


/**
 * @api {delete} /sessions/:id Terminate the given user session.
 *
 * @apiVersion 1.0.0
 * @apiName deleteSessions
 * @apiGroup Session Item
 * @apiPermission authUser
 *
 * @apiParam {string} id User session ID.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Cookie: token=5nNOF+dNQaHvq..." --request DELETE http://localhost:9090/sessions/128
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *
 *     {"error":"invalid session"}
 */
restify.del('/sessions/:id',
	function ( request, response ) {
		var id = Number(request.params.id);

		authUser(request, response, function ( userId ) {
			db.run('update sessions set state = 2, ttime = ? where id = ? and user_id = ?', +new Date(), id, userId, function ( error ) {
				if ( error ) { throw error; }

				response.send(200, {ok: true});
			});
		});
	}
);
