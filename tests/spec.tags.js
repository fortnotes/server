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
				data.should.have.keys('data', 'hash', 'time');
				should(data.data).equal(null);
				should(data.hash).equal(null);
				data.time.should.equal(0);
				done();
			});
		});
	});


	describe('create users tags', function () {
		it('should fail: no authorization header and data', function ( done ) {
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

		it('should fail: too big data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: new Array(global.config.dataSize + 2).join('*'), hash: 'qwe', amount: 10}, function ( error, request, response, data ) {
				response.statusCode.should.equal(406);
				data.code.should.equal('NotAcceptableError');
				data.message.should.equal('too big tags data or hash');
				done();
			});
		});

		it('should fail: too big hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: 'tagsData', hash: new Array(global.config.hashSize + 2).join('*'), amount: 10}, function ( error, request, response, data ) {
				response.statusCode.should.equal(406);
				data.code.should.equal('NotAcceptableError');
				data.message.should.equal('too big tags data or hash');
				done();
			});
		});

		it('should fail: too big hash and data', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: new Array(global.config.dataSize + 2).join('*'), hash: new Array(global.config.hashSize + 2).join('*'), amount: 10}, function ( error, request, response, data ) {
				response.statusCode.should.equal(406);
				data.code.should.equal('NotAcceptableError');
				data.message.should.equal('too big tags data or hash');
				done();
			});
		});

		it('should pass: add data/hash/amount', function ( done ) {
			var tagsData   = 'qwe',
				tagsHash   = 'ac8f8cc1619fe1968457b7e71086b4d5bbe8caa8d2e6da30165ca04c3b928a1da84a4afda983bcd049338881df438dd046c23c7a971705b24af0f7f6ad067b36',
				tagsAmount = 5;

			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: tagsData, hash: tagsHash, amount: tagsAmount}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);

				// check saved data
				db.models.users.get(userB.id, function ( error, data ) {
					should.not.exist(error);
					data.tagsData.should.equal(tagsData);
					data.tagsHash.should.equal(tagsHash);
					data.tagsAmount.should.equal(tagsAmount);
					done();
				});
			});
		});

		it('should pass: validate added tags data and hash', function ( done ) {
			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.get('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.be.instanceOf(Object);
				data.should.have.keys('data', 'hash', 'time');
				should(data.data).equal('qwe');
				should(data.hash).equal('ac8f8cc1619fe1968457b7e71086b4d5bbe8caa8d2e6da30165ca04c3b928a1da84a4afda983bcd049338881df438dd046c23c7a971705b24af0f7f6ad067b36');
				data.time.should.not.equal(0);
				done();
			});
		});

		it('should pass: set data/hash without amount', function ( done ) {
			var tagsData   = 'qwe2',
				tagsHash   = 'rty2';

			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: tagsData, hash: tagsHash, amount: 'not a number'}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);

				// check saved data
				db.models.users.get(userB.id, function ( error, data ) {
					should.not.exist(error);
					data.tagsData.should.equal(tagsData);
					data.tagsHash.should.equal(tagsHash);
					data.tagsAmount.should.equal(0);
					done();
				});
			});
		});

		it('should pass: set data/hash with wrong amount', function ( done ) {
			var tagsData   = 'qwe3',
				tagsHash   = 'rty3';

			client.headers.authorization = 'Bearer ' + userB.sessionB.token;

			client.put('/tags', {data: tagsData, hash: tagsHash}, function ( error, request, response, data ) {
				response.statusCode.should.equal(200);
				data.should.equal(true);

				// check saved data
				db.models.users.get(userB.id, function ( error, data ) {
					should.not.exist(error);
					data.tagsData.should.equal(tagsData);
					data.tagsHash.should.equal(tagsHash);
					data.tagsAmount.should.equal(0);
					done();
				});
			});
		});
	});


	describe('not allowed requests', function () {
		it('should fail: POST /tags is not allowed', function ( done ) {
			client.post('/tags', {qwe: 123}, function ( error, request, response, data ) {
				response.statusCode.should.equal(405);
				data.code.should.equal('MethodNotAllowedError');
				data.message.should.equal('POST is not allowed');
				done();
			});
		});

		it('should fail: DELETE /tags is not allowed', function ( done ) {
			client.del('/tags', function ( error, request, response, data ) {
				response.statusCode.should.equal(405);
				data.code.should.equal('MethodNotAllowedError');
				data.message.should.equal('DELETE is not allowed');
				done();
			});
		});
	});
});
