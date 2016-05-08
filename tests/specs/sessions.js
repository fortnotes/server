/**
 * Mocha REST sessions tests.
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


describe('Sessions', function () {
    var client = restify.createJsonClient({
        url: 'http://localhost:' + config.port,
        version: '*'
    });

    after(function () {
        // need to close http connection manually
        client.close();
    });


    describe('create users and sessions', function () {
        it('should fail: no request data', function ( done ) {
            client.post('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('empty or invalid email address');
                done();
            });
        });

        it('should fail: empty data', function ( done ) {
            client.post('/sessions', {}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('empty or invalid email address');
                done();
            });
        });

        it('should fail: empty email', function ( done ) {
            client.post('/sessions', {email: ''}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('empty or invalid email address');
                done();
            });
        });

        it('should fail: wrong email', function ( done ) {
            client.post('/sessions', {email: 'qwerty'}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('empty or invalid email address');
                done();
            });
        });

        it('should fail: too big email', function ( done ) {
            client.post('/sessions', {email: new Array(65).join('a') + '@' + new Array(60).join('b') + '.' + new Array(60).join('c')}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('InvalidContent');
                data.message.should.equal('content data is too big');
                done();
            });
        });

        it('should pass: create new userA and a session', function ( done ) {
            client.post('/sessions', {email: userA.email}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                response.headers['content-type'].should.equal('application/json');
                response.body.length.should.equal(Number(response.headers['content-length']));
                data.should.be.instanceOf(Object);
                data.should.have.keys('id', 'token');
                data.id.should.equal(Number(data.id));

                // save this session info
                db.models.sessions.get(data.id, function ( error, data ) {
                    should.not.exist(error);

                    userA.sessionA = {
                        id:    data.id,
                        token: data.token,
                        code:  data.confirmCode
                    };
                    userA.id = data.userId;
                    done();
                });
            });
        });

        it('should pass: create new userB and a session', function ( done ) {
            client.post('/sessions', {email: userB.email}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                response.headers['content-type'].should.equal('application/json');
                response.body.length.should.equal(Number(response.headers['content-length']));
                data.should.be.instanceOf(Object);
                data.should.have.keys('id', 'token');
                data.id.should.equal(Number(data.id));

                // save this session info
                db.models.sessions.get(data.id, function ( error, data ) {
                    should.not.exist(error);

                    userB.sessionA = {
                        id:    data.id,
                        token: data.token,
                        code:  data.confirmCode
                    };
                    userB.id = data.userId;
                    done();
                });
            });
        });

        it('should pass: create new session for userA', function ( done ) {
            client.post('/sessions', {email: userA.email}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                response.headers['content-type'].should.equal('application/json');
                response.body.length.should.equal(Number(response.headers['content-length']));
                data.should.be.instanceOf(Object);
                data.should.have.keys('id', 'token');
                data.id.should.equal(Number(data.id));

                // get this session info
                db.models.sessions.get(data.id, function ( error, data ) {
                    should.not.exist(error);

                    userA.sessionB = {
                        id:    data.id,
                        token: data.token,
                        code:  data.confirmCode
                    };
                    done();
                });
            });
        });

        it('should pass: create new session for userB', function ( done ) {
            client.post('/sessions', {email: userB.email}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                response.headers['content-type'].should.equal('application/json');
                response.body.length.should.equal(Number(response.headers['content-length']));
                data.should.be.instanceOf(Object);
                data.should.have.keys('id', 'token');
                data.id.should.equal(Number(data.id));

                // save this session info
                db.models.sessions.get(data.id, function ( error, data ) {
                    should.not.exist(error);

                    userB.sessionB = {
                        id:    data.id,
                        token: data.token,
                        code:  data.confirmCode
                    };
                    done();
                });
            });
        });
    });


    describe('activate sessions', function () {
        it('should fail: no request data', function ( done ) {
            client.put('/sessions/', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session id or confirmation code');
                done();
            });
        });

        it('should fail: no id and code', function ( done ) {
            client.put('/sessions/', {}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session id or confirmation code');
                done();
            });
        });

        it('should fail: no id', function ( done ) {
            client.put('/sessions/', {code: 1234567890}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session id or confirmation code');
                done();
            });
        });

        it('should fail: no code', function ( done ) {
            client.put('/sessions/' + userA.sessionA.id, {}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session id or confirmation code');
                done();
            });
        });

        it('should fail: bad-formatted id', function ( done ) {
            client.put('/sessions/teapot', {code: 1234567890}, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session id or confirmation code');
                done();
            });
        });

        it('should fail: wrong id and code', function ( done ) {
            client.put('/sessions/' + (userA.sessionA.id + 1000), {code: 123456}, function ( error, request, response, data ) {
                response.statusCode.should.equal(404);
                data.code.should.equal('NotFoundError');
                data.message.should.equal('resource was not found');
                done();
            });
        });

        it('should fail: wrong code', function ( done ) {
            client.put('/sessions/' + userA.sessionA.id, {code: 123}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('invalid session or confirmation code');
                done();
            });
        });

        it('should pass: activate sessionA for userA', function ( done ) {
            client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionA.code}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                data.should.equal(true);
                done();
            });
        });

        it('should pass: activate sessionB for userA', function ( done ) {
            client.put('/sessions/' + userA.sessionB.id, {code: userA.sessionB.code}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                data.should.equal(true);
                done();
            });
        });

        it('should pass: activate sessionB for userB', function ( done ) {
            client.put('/sessions/' + userB.sessionB.id, {code: userB.sessionB.code}, function ( error, request, response, data ) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                data.should.equal(true);
                done();
            });
        });

        it('should pass: deactivate sessionA and set max attempts', function ( done ) {
            db.models.sessions.get(userA.sessionA.id, function ( error, session ) {
                should.not.exist(error);
                session.save({confirmTime: 0, confirmAttempts: config.sessionConfirmAttempts}, function ( error ) {
                    should.not.exist(error);
                    done();
                });
            });
        });

        it('should fail: sessionA confirm attempts exceeded', function ( done ) {
            client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionA.code}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('invalid session or confirmation code');
                done();
            });
        });

        it('should fail: session code is from another session', function ( done ) {
            client.put('/sessions/' + userA.sessionA.id, {code: userA.sessionB.code}, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('invalid session or confirmation code');
                done();
            });
        });
    });


    describe('get a user session list', function () {
        it('should fail: no authorization header', function ( done ) {
            client.get('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: empty authorization header', function ( done ) {
            client.headers.authorization = '';

            client.get('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization header', function ( done ) {
            client.headers.authorization = 'qwe';

            client.get('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization token', function ( done ) {
            client.headers.authorization = 'Bearer qwe';

            client.get('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(401);
                data.code.should.equal('UnauthorizedError');
                data.message.should.equal('invalid session');
                done();
            });
        });

        it('should pass: get two userA sessions', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.get('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Object);
                data.length.should.equal(2);
                data[0].id.should.equal(userA.sessionB.id);
                data[1].id.should.equal(userA.sessionA.id);
                done();
            });
        });

        it('should pass: get userA sessions with limit', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.get('/sessions?limit=1', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Object);
                data.length.should.equal(1);
                data[0].id.should.equal(userA.sessionB.id);
                done();
            });
        });

        it('should pass: get userA sessions with offset', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.get('/sessions?offset=1', function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.be.instanceOf(Object);
                data.length.should.equal(1);
                data[0].id.should.equal(userA.sessionA.id);
                done();
            });
        });
    });


    describe('terminate a session', function () {
        it('should fail: no authorization header and id', function ( done ) {
            // reset session
            delete client.headers.authorization;

            client.del('/sessions/', function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session id');
                done();
            });
        });

        it('should fail: no authorization header', function ( done ) {
            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: empty authorization header', function ( done ) {
            client.headers.authorization = '';

            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization header', function ( done ) {
            client.headers.authorization = 'qwe';

            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(409);
                data.code.should.equal('MissingParameter');
                data.message.should.equal('empty session token');
                done();
            });
        });

        it('should fail: wrong authorization token', function ( done ) {
            client.headers.authorization = 'Bearer qwe';

            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(401);
                data.code.should.equal('UnauthorizedError');
                data.message.should.equal('invalid session');
                done();
            });
        });

        it('should fail: inactive session token', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionA.token;

            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(401);
                data.code.should.equal('UnauthorizedError');
                data.message.should.equal('invalid session');
                done();
            });
        });

        it('should fail: active session token but wrong user owner', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.del('/sessions/' + userB.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('invalid session');
                done();
            });
        });

        it('should pass: inactive sessionA terminated', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.equal(true);

                // get this session info
                db.models.sessions.get(userA.sessionA.id, function ( error, session ) {
                    should.not.exist(error);
                    session.deleteTime.should.not.equal(0);
                    session.confirmTime.should.equal(0);
                    done();
                });
            });
        });

        it('should fail: sessionA is already inactive', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.del('/sessions/' + userA.sessionA.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(400);
                data.code.should.equal('BadRequestError');
                data.message.should.equal('session is already terminated');
                done();
            });
        });

        it('should pass: active sessionB terminated', function ( done ) {
            client.headers.authorization = 'Bearer ' + userA.sessionB.token;

            client.del('/sessions/' + userA.sessionB.id, function ( error, request, response, data ) {
                response.statusCode.should.equal(200);
                data.should.equal(true);

                // get this session info
                db.models.sessions.get(userA.sessionB.id, function ( error, session ) {
                    should.not.exist(error);
                    session.deleteTime.should.not.equal(0);
                    done();
                });
            });
        });
    });


    describe('not allowed requests', function () {
        it('should fail: PUT /sessions is not allowed', function ( done ) {
            client.put('/sessions', {qwe: 123}, function ( error, request, response, data ) {
                response.statusCode.should.equal(405);
                data.code.should.equal('MethodNotAllowedError');
                data.message.should.equal('PUT is not allowed');
                done();
            });
        });

        it('should fail: DELETE /sessions is not allowed', function ( done ) {
            client.del('/sessions', function ( error, request, response, data ) {
                response.statusCode.should.equal(405);
                data.code.should.equal('MethodNotAllowedError');
                data.message.should.equal('DELETE is not allowed');
                done();
            });
        });
    });
});
