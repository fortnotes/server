/**
 * Mocha REST tags tests.
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


describe('Tags', function () {
	var client = restify.createJsonClient({
		url: 'http://localhost:9090',
		version: '*'
	});

	after(function () {
		// need to close all connections manually
		client.close();
	});


	describe('get users tags', function () {
		it('should fail: no authorization header', function ( done ) {
			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: empty authorization header', function ( done ) {
			client.headers.authorization = '';

			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: wrong authorization header', function ( done ) {
			client.headers.authorization = 'qwe';

			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer qwe';

			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(401);
				data.code.should.equal('UnauthorizedError');
				data.message.should.equal('invalid session');
				done();
			});
		});

		it('should pass: empty tags data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Object);
				data.should.have.property('data');
				data.should.have.property('hash');
				data.should.have.property('time');
				should(data.data).equal(null);
				should(data.hash).equal(null);
				data.time.should.equal(0);
				done();
			});
		});
	});


	describe('create users tags', function () {
		it('should fail: wrong data and hash', function ( done ) {
			// reset session
			delete client.headers.authorization;

			client.put('/tags', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('invalid tags data or hash');
				done();
			});
		});

		it('should fail: no authorization header', function ( done ) {
			client.put('/tags', {data: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: empty authorization header', function ( done ) {
			client.headers.authorization = '';

			client.put('/tags', {data: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: wrong authorization header', function ( done ) {
			client.headers.authorization = 'qwe';

			client.put('/tags', {data: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('no session token');
				done();
			});
		});

		it('should fail: wrong authorization token', function ( done ) {
			client.headers.authorization = 'Bearer qwe';

			client.put('/tags', {data: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(401);
				data.code.should.equal('UnauthorizedError');
				data.message.should.equal('invalid session');
				done();
			});
		});

		it('should fail: wrong data and hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {}, function ( error, request, response, data ) {
				response.statusCode.should.equal(400);
				data.code.should.equal('BadRequestError');
				data.message.should.equal('invalid tags data or hash');
				done();
			});
		});

		it('should pass: add data and hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);
				done();
			});
		});

		it('should pass: validate added tags data and hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Object);
				data.should.have.property('data');
				data.should.have.property('hash');
				data.should.have.property('time');
				should(data.data).equal('qwe');
				should(data.hash).equal('rty');
				data.time.should.not.equal(0);
				done();
			});
		});
	});
});
