/**
 * Mocha REST notes tests.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var restify = require('restify'),
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

		it('should pass: empty note list', function ( done ) {
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
		var noteId;

		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer qwe';

			client.post('/notes', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(401);
				data.code.should.equal('UnauthorizedError');
				data.message.should.equal('invalid session');
				done();
			});
		});

		it('should pass: add new note', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Object);
				data.should.have.property('id');
				data.id.should.be.instanceOf(Number);
				noteId = data.id;
				done();
			});
		});

		it('should pass: add new note data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.post('/notes/' + noteId, {data: 'asd', hash: 'zxc'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);
				done();
			});
		});
	});
});
