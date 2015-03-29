/**
 * REST sessions tests.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/* eslint-disable no-undef */

var assert  = require('assert'),
	restify = require('restify'),
	config  = require('../config/main'),
	client  = restify.createJsonClient({
		url: 'http://localhost:9090',
		version: '*'
	}),
	db = require('../orm');


describe('Sessions', function () {
	var session = null;

	before(function () {

	});


	after(function () {
		// need to do manually
		client.close();
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

				// save this session instance
				db.models.sessions.get(data.id, function ( error, data ) {
					session = data;
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
			client.put('/sessions/' + session.id, {}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session id or confirmation code');
				done();
			});
		});

		it('should fail - wrong id and code', function ( done ) {
			client.put('/sessions/' + (session.id + 1000), {code: 123456}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 404);
				assert.strictEqual(data, 'session was not found');
				done();
			});
		});

		it('should fail - wrong code', function ( done ) {
			client.put('/sessions/' + session.id, {code: 123}, function ( error, request, response, data ) {
				assert.strictEqual(response.statusCode, 400);
				assert.strictEqual(data, 'invalid session or confirmation code');
				done();
			});
		});

		it('should activate', function ( done ) {
			client.put('/sessions/' + session.id, {code: session.code}, function ( error, request, response, data ) {
				assert.ifError(error);
				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(data, true);
				done();
			});
		});

		it('should fail - already active', function ( done ) {
			db.models.sessions.get(session.id, function ( error, session ) {
				assert.ifError(error);
				client.put('/sessions/' + session.id, {code: session.code}, function ( error, request, response, data ) {
					assert.strictEqual(response.statusCode, 400);
					assert.strictEqual(data, 'invalid session or confirmation code');
					done();
				});
			});
		});

		it('should deactivate', function ( done ) {
			/*db.models.users.create({email: '!!!', ctime: +new Date()}, function ( error, user ) {
				//assert.ifError(error);
				console.log(error);
				done();
			});*/
			session.confirmed = false;
			session.save(function ( error, data ) {
				assert.ifError(error);
				console.log(data.confirmed);
				done();
			});
		});
	});
});
