/**
 * Mocha REST notes tests.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var should  = require('should'),
	restify = require('restify'),
	db      = require('../lib/db'),
	data    = require('./data'),
	userA   = data.userA,
	userB   = data.userB;


describe('Notes', function () {
	var client = restify.createJsonClient({
		url: 'http://localhost:9090',
		version: '*'
	});

	after(function () {
		// need to close all connections manually
		client.close();
	});


	describe('get users notes', function () {
		it('should fail: no authorization header', function ( done ) {
			client.get('/notes', function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: empty authorization header', function ( done ) {
			client.headers.authorization = '';

			client.get('/notes', function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: wrong authorization header', function ( done ) {
			client.headers.authorization = 'qwe';

			client.get('/notes', function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer qwe';

			client.get('/notes', function ( error, request, response, data ) {
				response.statusCode.should.equal(401);
				data.code.should.equal('UnauthorizedError');
				data.message.should.equal('invalid session');
				done();
			});
		});

		it('should pass: userB empty note list', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.get('/notes', function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Array);
				data.should.have.length(0);
				done();
			});
		});
	});


	describe('create users notes', function () {
		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer qwe';

			client.post('/notes', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(401);
				data.code.should.equal('UnauthorizedError');
				data.message.should.equal('invalid session');
				done();
			});
		});

		it('should pass: add userB new note', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Object);
				data.should.have.keys('id');
				data.id.should.be.instanceOf(Number);
				userB.noteA.id = data.id;
				done();
			});
		});

		it('should fail: add userB new note data with no request data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('empty or invalid request parameters');
				done();
			});
		});

		it('should fail: add userB new note data with no data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('empty or invalid request parameters');
				done();
			});
		});

		it('should fail: add userB new note data with empty data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {data: '', hash: ''}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('empty or invalid request parameters');
				done();
			});
		});

		it('should fail: add userB new note data with too big data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {data: new Array(global.config.dataSize + 2).join('*'), hash: 'zxc'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(406);
				data.code.should.equal('NotAcceptableError');
				data.message.should.equal('too big note data or hash');
				done();
			});
		});

		it('should fail: add userB new note data with too big hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {data: 'some data', hash: new Array(global.config.hashSize + 2).join('*')}, function ( error, request, response, data ) {
				response.statusCode.should.equal(406);
				data.code.should.equal('NotAcceptableError');
				data.message.should.equal('too big note data or hash');
				done();
			});
		});

		it('should fail: add userB new note data with too big data and hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {data: new Array(global.config.dataSize + 2).join('*'), hash: new Array(global.config.hashSize + 2).join('*')}, function ( error, request, response, data ) {
				response.statusCode.should.equal(406);
				data.code.should.equal('NotAcceptableError');
				data.message.should.equal('too big note data or hash');
				done();
			});
		});

		it('should pass: add userB new note data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {data: 'userB asd', hash: 'zxc'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);
				done();
			});
		});

		it('should pass: reactivate userA sessionB', function ( done ) {
			db.models.sessions.get(userA.sessionB.id, function ( error, session ) {
				should.not.exist(error);

				session.save({deleteTime: 0}, function ( error ) {
					should.not.exist(error);
					done();
				});
			});
		});

		it('should pass: add userA new note', function ( done ) {
			client.headers.authorization = 'Bearer ' + userA.sessionB.token;

			client.post('/notes', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Object);
				data.should.have.keys('id');
				data.id.should.be.instanceOf(Number);
				userA.noteA.id = data.id;
				done();
			});
		});

		it('should pass: add userA new note data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userA.sessionB.token;

			client.post('/notes/' + userA.noteA.id, {data: 'userA asd', hash: 'zxc'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);
				done();
			});
		});

		it('should fail: add userA new note data to userB', function ( done ) {
			client.headers.authorization = 'Bearer ' + userA.sessionB.token;

			client.post('/notes/' + userB.noteA.id, {data: 'userA asd2', hash: 'zxc'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('invalid note id');
				done();
			});
		});
	});


	describe('not allowed requests', function () {
		it('should fail: PUT /notes is not allowed', function ( done ) {
			client.put('/notes', {qwe: 123}, function ( error, request, response, data ) {
				response.statusCode.should.equal(405);
				data.code.should.equal('MethodNotAllowedError');
				data.message.should.equal('PUT is not allowed');
				done();
			});
		});

		it('should fail: DELETE /notes is not allowed', function ( done ) {
			client.del('/notes', function ( error, request, response, data ) {
				response.statusCode.should.equal(405);
				data.code.should.equal('MethodNotAllowedError');
				data.message.should.equal('DELETE is not allowed');
				done();
			});
		});

		it('should fail: PUT /notes/:id is not allowed', function ( done ) {
			client.put('/notes/' + userB.noteA.id, {qwe: 123}, function ( error, request, response, data ) {
				response.statusCode.should.equal(405);
				data.code.should.equal('MethodNotAllowedError');
				data.message.should.equal('PUT is not allowed');
				done();
			});
		});

		it('should fail: DELETE /notes/:id is not allowed', function ( done ) {
			client.del('/notes/' + userB.noteA.id, function ( error, request, response, data ) {
				response.statusCode.should.equal(405);
				data.code.should.equal('MethodNotAllowedError');
				data.message.should.equal('DELETE is not allowed');
				done();
			});
		});
	});
});
