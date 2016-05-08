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
    config  = require('../../config'),
    db      = require('../../lib/db'),
    data    = require('../data'),
    userA   = data.userA,
    userB   = data.userB;


describe('Notes', function () {
    var client = restify.createJsonClient({
            url: 'http://localhost:' + config.port,
            version: '*'
        });

    after(function () {
        // need to close all connections manually
        client.close();
    });


    describe('get users notes', function () {
        it('should fail: no authorization header', function ( done ) {
            client.get('/notes', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: empty authorization header', function ( done ) {
            client.headers.authorization = '';

            client.get('/notes', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization header', function ( done ) {
            client.headers.authorization = 'qwe';

            client.get('/notes', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
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

            client.post('/notes', {data: 'qwe', hash: 'rty'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(401);
                data.code.should.equal('UnauthorizedError');
                data.message.should.equal('invalid session');
                done();
            });
        });

        it('should pass: add userB new note', function ( done ) {
            var data = 'userB note #1',
                hash = '21adccb1e319523e983e903a73a9e3d3112513802f7ecc5b9a4ad4c7ccd1370858d4033c5e60e17e68994821c06d736111dc9a63a7db94065af830675e022eca';

            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.post('/notes', {data: data, hash: hash}, function ( error, request, response, note ) {
                response.statusCode.should.equal(200);
                note.should.be.instanceOf(Object);
                note.should.have.keys('id');
                note.id.should.not.equal(0).and.be.instanceOf(Number);
                userB.noteA.id = note.id;

                db.models.notes.get(note.id, function ( error, note ) {
                    should.not.exist(error);
                    note.should.be.instanceOf(Object);
                    note.data.should.equal(data);
                    note.hash.should.equal(hash);
                    note.createTime.should.equal(note.updateTime);
                    done();
                });
            });
        });

        it('should fail: userB note history with no note id', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.get('/notes/', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty note id');
                done();
            });
        });

        it('should fail: userB note history with wrong note id', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.get('/notes/teapot', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty note id');
                done();
            });
        });

        it('should pass: userB note empty history', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.get('/notes/' + userB.noteA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(0);
                done();
            });
        });

        it('should fail: add userB new note data with no request data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty note attributes');
                done();
            });
        });

        it('should fail: add userB new note data with no data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty note attributes');
                done();
            });
        });

        it('should fail: add userB new note data with empty data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: '', hash: ''}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty note attributes');
                done();
            });
        });

        it('should fail: add userB new note data with too big data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: new Array(config.dataSize + 2).join('*'), hash: 'zxc'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should fail: add userB new note data with too big hash', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: 'some data', hash: new Array(config.hashSize + 2).join('*')}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should fail: add userB new note data with too big data and hash', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: new Array(config.dataSize + 2).join('*'), hash: new Array(config.hashSize + 2).join('*')}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should pass: update userB note data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: 'userB note #1 updated', hash: 'zxc'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.equal(true);
                done();
            });
        });

        it('should pass: update userB note data', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: 'userB note #1 updated twice', hash: 'zxc'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.equal(true);
                done();
            });
        });

        it('should pass: userB note history with two ordered records', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.get('/notes/' + userB.noteA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(2);
                data[0].should.have.keys('data', 'hash', 'time');
                data[0].data.should.equal('userB note #1 updated');
                data[0].time.should.be.greaterThan(data[1].time);
                done();
            });
        });

        it('should pass: userB note history with limit', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.get('/notes/' + userB.noteA.id + '?limit=1', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(1);
                data[0].should.have.keys('data', 'hash', 'time');
                data[0].data.should.equal('userB note #1 updated');
                done();
            });
        });

        it('should pass: userB note history with offset', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.get('/notes/' + userB.noteA.id + '?offset=1', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(1);
                data[0].should.have.keys('data', 'hash', 'time');
                data[0].data.should.equal('userB note #1');
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

            client.post('/notes', {data: 'userA note #1', hash: 'zxc'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Object);
                data.should.have.keys('id');
                data.id.should.not.equal(0).and.be.instanceOf(Number);
                userA.noteA.id = data.id;
                done();
            });
        });

        it('should fail: userB note history of userA note', function ( done ) {
            client.headers.authorization = 'Bearer ' + userB.sessionB.token;
            client.get('/notes/' + userA.noteA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('invalid note id');
                done();
            });
        });

        it('should fail: add userA new note data to userB', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.put('/notes/' + userB.noteA.id, {data: 'userA asd2', hash: 'zxc'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('invalid note id');
                done();
            });
        });

        it('should pass: add userB new note', function ( done ) {
            var data = 'userB note #2',
                hash = 'b335d0ba6cbf53e95048fca0e7f0cef96b2d980655d675be7d7d9948de4b0a558ebe93ec391f87be3e55b97c31ae050acbcf61c07f6cff2b64b78e0dcc35d903';

            client.headers.authorization = 'Bearer ' + userB.sessionB.token;

            client.post('/notes', {data: data, hash: hash}, function ( error, request, response, note ) {
                response.statusCode.should.equal(200);
                note.should.be.instanceOf(Object);
                note.should.have.keys('id');
                note.id.should.not.equal(0).and.be.instanceOf(Number);
                userB.noteB.id = note.id;
                done();
            });
        });

        it('should pass: userB note list', function ( done ) {
            client.get('/notes', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(2);
                data[0].should.have.keys('id', 'data', 'hash', 'createTime', 'updateTime', 'readTime');
                data[0].data.should.equal('userB note #2');
                data[0].updateTime.should.be.greaterThan(data[1].updateTime);
                done();
            });
        });

        it('should pass: userB note list with limit', function ( done ) {
            client.get('/notes?limit=1', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(1);
                data[0].should.have.keys('id', 'data', 'hash', 'createTime', 'updateTime', 'readTime');
                data[0].id.should.equal(userB.noteB.id);
                done();
            });
        });

        it('should pass: userB note list with offset', function ( done ) {
            client.get('/notes?offset=1', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Array);
                data.should.have.length(1);
                data[0].should.have.keys('id', 'data', 'hash', 'createTime', 'updateTime', 'readTime');
                data[0].id.should.equal(userB.noteA.id);
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

        it('should fail: POST /notes/:id is not allowed', function ( done ) {
            client.post('/notes/' + userB.noteA.id, {qwe: 123}, function ( error, request, response, data ) {
                response.statusCode.should.equal(405);
                data.code.should.equal('MethodNotAllowedError');
                data.message.should.equal('POST is not allowed');
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
