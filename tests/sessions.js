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
	restify = require('restify'),
	//config  = require('../config/main'),
	client  = restify.createJsonClient({
		url: 'http://localhost:9090',
		version: '*'
	}),
	db = require('../lib/orm');


describe('Sessions', function () {
	var u1s1 = {},
		u1s2 = {},
		u2s1 = {},
		u2s2 = {},
		sessionId   = null,
		sessionCode = null;

	before(function () {

	});


	after(function () {
		// need to close http connection manually
		client.close();
		// and database
		db.close();
	});

	describe('request a new session', function () {
		it('should fail - no email', function ( done ) {
			client.post('/sessions', {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'empty or invalid email address');

				done();
			});
		});

		it('should fail - empty email', function ( done ) {
			client.post('/sessions', {email: ''}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'empty or invalid email address');
				done();
			});
		});

		it('should fail - wrong email', function ( done ) {
			client.post('/sessions', {email: 'qwerty'}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'empty or invalid email address');
				done();
			});
		});

		it('should return new session id and token', function ( done ) {
			client.post('/sessions', {email: 'qwe@rty.com'}, function ( error, request, response, data ) {
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

					sessionId   = data.id;
					sessionCode = data.code;
					done();
				});
			});
		});
	});

	describe('activate a new session with the confirmation code', function () {
		it('should fail - no id and code', function ( done ) {
			client.put('/sessions/', {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail - no id', function ( done ) {
			client.put('/sessions/', {code: 123456}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail - no code', function ( done ) {
			client.put('/sessions/' + sessionId, {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail - wrong id and code', function ( done ) {
			client.put('/sessions/' + (sessionId + 1000), {code: 123456}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 404);
				assert.strictEqual(data, 'session was not found');
				done();
			});
		});

		it('should fail - wrong code', function ( done ) {
			client.put('/sessions/' + sessionId, {code: 123}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session or confirmation code');
				done();
			});
		});

		it('should activate', function ( done ) {
			client.put('/sessions/' + sessionId, {code: sessionCode}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(data, true);
				done();
			});
		});

		it('should fail - already active', function ( done ) {
			client.put('/sessions/' + sessionId, {code: sessionCode}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session or confirmation code');
				done();
			});
		});

		it('should deactivate', function ( done ) {
			db.transaction(function ( error, transaction ) {
				assert.ifError(error);

				db.models.sessions.get(sessionId, function ( error, session ) {
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

		it('should fail - confirm attempts exceeded', function ( done ) {
			client.put('/sessions/' + sessionId, {code: sessionCode}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session or confirmation code');
				done();
			});
		});

		it('should create new session and activate', function ( done ) {
			client.post('/sessions', {email: 'qwe@rty.com'}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(response.headers['content-type'], 'application/json');
				assert.strictEqual(Number(response.headers['content-length']), response.body.length);
				assert.ok(data.id);
				assert.ok(data.token);
				assert.strictEqual(Number(data.id), data.id);

				// save this session info
				db.models.sessions.get(data.id, function ( error, session ) {
					assert.ifError(error);

					client.put('/sessions/' + session.id, {code: session.code}, function ( error, request, response, data ) {
						assert.ifError(error);
						assert.strictEqual(response.statusCode, 200);
						assert.strictEqual(data, true);
						done();
					});
				});
			});
		});
	});
});
