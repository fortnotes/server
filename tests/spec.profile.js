/**
 * Mocha REST profile tests.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var should  = require('should'),
    restify = require('restify'),
    config  = require('../config'),
    db      = require('../lib/db'),
    data    = require('./data'),
    userA   = data.userA,
    userB   = data.userB;


describe('Profile', function () {
    var client = restify.createJsonClient({
            url: 'http://localhost:' + config.port,
            version: '*'
        });

    after(function () {
        // need to close all connections manually
        client.close();
    });


    describe('save user master password', function () {
        it('should fail: no authorization header', function ( done ) {
            client.put('/profile/pass', {salt: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: empty authorization header', function ( done ) {
            client.headers.authorization = '';

            client.put('/profile/pass', {salt: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization header', function ( done ) {
            client.headers.authorization = 'qwe';

            client.put('/profile/pass', {salt: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization token', function ( done ) {
            client.headers.authorization = 'Bearer qwe';

            client.put('/profile/pass', {salt: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(401);
                data.code.should.equal('UnauthorizedError');
                data.message.should.equal('invalid session');
                done();
            });
        });

        it('should fail: no request data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/profile/pass', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty pass salt or hash');
                done();
            });
        });

        it('should fail: no data and hash', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/profile/pass', {}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty pass salt or hash');
                done();
            });
        });

        it('should fail: too big salt', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/profile/pass', {salt: new Array(config.hashSize + 2).join('*'), hash: 'qwe'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should fail: too big hash', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/profile/pass', {salt: 'qwe', hash: new Array(config.hashSize + 2).join('*')}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should fail: too big salt and hash', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/profile/pass', {salt: new Array(config.hashSize + 2).join('*'), hash: new Array(config.hashSize + 2).join('*')}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should pass: apply master password', function ( done ) {
            var passSalt = '915259ee91e4ca8a1a132c4e892d7f9924fa6b4e63cc4d46e4623c1795236cc6c30c2c0285a9430fe4718a0c4d87e1ca61cbfeaee9cf40d1089ebe56c0054276',
                passHash = 'ac8f8cc1619fe1968457b7e71086b4d5bbe8caa8d2e6da30165ca04c3b928a1da84a4afda983bcd049338881df438dd046c23c7a971705b24af0f7f6ad067b36';

            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/profile/pass', {salt: passSalt, hash: passHash}, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.equal(true);

                // check saved data
                db.models.users.get(userB.id, function ( error, data ) {
                    should.not.exist(error);
                    data.passSalt.should.equal(passSalt);
                    data.passHash.should.equal(passHash);
                    data.passTime.should.not.equal(0);
                    done();
                });
            });
        });
    });


    describe('not allowed requests', function () {
        it('should fail: POST /profile/pass is not allowed', function ( done ) {
            client.post('/profile/pass', {qwe: 123}, function ( error, request, response, data ) {
                response.statusCode.should.equal(405);
                data.code.should.equal('MethodNotAllowedError');
                data.message.should.equal('POST is not allowed');
                done();
            });
        });

        it('should fail: DELETE /profile/pass is not allowed', function ( done ) {
            client.del('/profile/pass', function ( error, request, response, data ) {
                response.statusCode.should.equal(405);
                data.code.should.equal('MethodNotAllowedError');
                data.message.should.equal('DELETE is not allowed');
                done();
            });
        });
    });
});
