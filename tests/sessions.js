/**
 * REST sessions tests.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var assert  = require('assert'),
	crypto  = require('crypto'),
	restify = require('restify'),
	//config  = require('../config/main'),
	client  = restify.createJsonClient({
		url: 'http://localhost:9090',
		version: '*'
	}),
	db = require('../lib/orm');


describe('Sessions', function () {
	var userA = {
			email: crypto.randomBytes(4).toString('hex') + '@' + crypto.randomBytes(4).toString('hex') + '.com',
			sessionA: {}
		},
		userB = {
			email: crypto.randomBytes(4).toString('hex') + '@' + crypto.randomBytes(4).toString('hex') + '.com',
			sessionA: {}
		},
		sessionId    = null,
		sessionToken = null,
		sessionCode  = null;

	before(function () {

	});

	after(function () {
		// need to close http connection manually
		client.close();
		// and database
		db.close();
	});


	describe('create users and sessions', function () {
		it('should fail: no email', function ( done ) {
			client.post('/sessions', {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'empty or invalid email address');

				done();
			});
		});

		it('should fail: empty email', function ( done ) {
			client.post('/sessions', {email: ''}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'empty or invalid email address');
				done();
			});
		});

		it('should fail: wrong email', function ( done ) {
			client.post('/sessions', {email: 'qwerty'}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'empty or invalid email address');
				done();
			});
		});

		it('should pass: create new userA and a session', function ( done ) {
			client.post('/sessions', {email: userA.email}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(response.headers['content-type'], 'application/json');
				assert.strictEqual(Number(response.headers['content-length']), response.body.length);
				assert.ok(data.id);
				assert.ok(data.token);
				assert.strictEqual(Number(data.id), data.id);

				// save this session info
				db.models.sessions.get(data.id, function ( error, data ) {
					assert.ifError(error);

					userA.sessionA = {
						id:    data.id,
						token: data.token,
						code:  data.code
					};
					done();
				});
			});
		});

		it('should pass: create new userB and a session', function ( done ) {
			client.post('/sessions', {email: userB.email}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(response.headers['content-type'], 'application/json');
				assert.strictEqual(Number(response.headers['content-length']), response.body.length);
				assert.ok(data.id);
				assert.ok(data.token);
				assert.strictEqual(Number(data.id), data.id);

				// save this session info
				db.models.sessions.get(data.id, function ( error, data ) {
					assert.ifError(error);

					userB.sessionA = {
						id:    data.id,
						token: data.token,
						code:  data.code
					};
					done();
				});
			});
		});

		it('should pass: create new session for userA', function ( done ) {
			client.post('/sessions', {email: userA.email}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(response.headers['content-type'], 'application/json');
				assert.strictEqual(Number(response.headers['content-length']), response.body.length);
				assert.ok(data.id);
				assert.ok(data.token);
				assert.strictEqual(Number(data.id), data.id);

				// save this session info
				db.models.sessions.get(data.id, function ( error, data ) {
					assert.ifError(error);

					userA.sessionB = {
						id:    data.id,
						token: data.token,
						code:  data.code
					};
					done();
				});
			});
		});

		it('should pass: create new session for userB', function ( done ) {
			client.post('/sessions', {email: userB.email}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(response.headers['content-type'], 'application/json');
				assert.strictEqual(Number(response.headers['content-length']), response.body.length);
				assert.ok(data.id);
				assert.ok(data.token);
				assert.strictEqual(Number(data.id), data.id);

				// save this session info
				db.models.sessions.get(data.id, function ( error, data ) {
					assert.ifError(error);

					userB.sessionB = {
						id:    data.id,
						token: data.token,
						code:  data.code
					};
					done();
				});
			});
		});
	});


	describe('activate sessions', function () {
		it('should fail: no id and code', function ( done ) {
			client.put('/sessions/', {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail: no id', function ( done ) {
			client.put('/sessions/', {code: 1234567890}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail: no code', function ( done ) {
			client.put('/sessions/' + userA.sessionA.id, {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail: bad-formatted id', function ( done ) {
			client.put('/sessions/teapot', {code: 1234567890}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail: wrong id and code', function ( done ) {
			client.put('/sessions/' + (userA.sessionA.id + 1000), {code: 123456}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 404);
				assert.strictEqual(data.code, 'NotFoundError');
				assert.strictEqual(data.message, 'session was not found');
				done();
			});
		});

		it('should fail: wrong code', function ( done ) {
			client.put('/sessions/' + userA.sessionA.id, {code: 123}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session or confirmation code');
				done();
			});
		});

		it('should pass: activate sessionA for userA', function ( done ) {
			client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionA.code}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(data, true);
				done();
			});
		});

		it('should pass: activate sessionB for userA', function ( done ) {
			client.put('/sessions/' + userA.sessionB.id, {code: userA.sessionB.code}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(data, true);
				done();
			});
		});

		it('should fail: already active sessionA', function ( done ) {
			client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionA.code}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session or confirmation code');
				done();
			});
		});

		it('should pass: deactivate sessionA and set max attempts', function ( done ) {
			db.transaction(function ( error, transaction ) {
				assert.ifError(error);

				db.models.sessions.get(userA.sessionA.id, function ( error, session ) {
					assert.ifError(error);

					session.save({confirmed: false, attempts: global.config.session.confirmAttempts}, function ( error, data ) {
						assert.ifError(error);

						transaction.commit(function ( error ) {
							assert.ifError(error);

							done();
						});
					});
				});
			});
		});

		it('should fail: sessionA confirm attempts exceeded', function ( done ) {
			client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionA.code}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session or confirmation code');
				done();
			});
		});

		it('should fail: session code is from another session', function ( done ) {
			client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionB.code}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session or confirmation code');
				done();
			});
		});
	});


	describe('get a user session list', function () {
		it('should fail: no authorization header', function ( done ) {
			client.get('/sessions', function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'no session token');
				done();
			});
		});

		it('should fail: empty authorization header', function ( done ) {
			client.headers.authorization = '';
			client.get('/sessions', function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'no session token');
				done();
			});
		});

		it('should fail: wrong authorization header', function ( done ) {
			client.headers.authorization = 'qwe';
			client.get('/sessions', function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'no session token');
				done();
			});
		});

		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer qwe';
			client.get('/sessions', function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data.code, 'BadRequestError');
				assert.strictEqual(data.message, 'invalid session');
				done();
			});
		});

		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer ' + userA.sessionB.token;
			client.get('/sessions', function ( error, request, response, data ) {
				//console.log(response.statusCode);
				//console.log(data);
				//console.log(sessionToken);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(typeof data, 'object');
				assert.strictEqual(data.length, 2);
				assert.strictEqual(data[0].id, userA.sessionA.id);
				assert.strictEqual(data[1].id, userA.sessionB.id);
				done();
			});
		});
	});


	/*describe('terminate a session', function () {

	});*/
});
