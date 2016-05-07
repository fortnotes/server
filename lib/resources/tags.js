/**
 * RESTful web API module.
 * Note tags.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('../restify'),
    users   = require('../db').models.users;


/**
 * @api {get} /tags Receive user tags data.
 *
 * @apiVersion 1.0.0
 * @apiName getTags
 * @apiGroup Tags
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiSuccess {string} data User tags encrypted data.
 * @apiSuccess {string} hash Hash of tags data before encryption.
 * @apiSuccess {number} time Tags modification time.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." http://localhost:9090/tags
 *
 * @apiSuccessExample Success (no tags):
 *     HTTP/1.1 200 OK
 *
 *     {"data":"...","hash":"...","time":1428777153259}
 *
 * @apiSuccessExample Success (some data):
 *     HTTP/1.1 200 OK
 *
 *     {"data":null,"hash":null,"time":0}
 *
 * @apiUse SessionCheckError
 * @apiUse ServerDataSearchError
 */
restify.get('/tags',
    function ( request, response ) {
        users.getTags(request.authorization.token, function ( error, data ) {
            if ( error ) {
                return response.send(error);
            }

            // ok
            response.send(data);
        });
    }
);


/**
 * @api {put} /tags Save user tags data.
 *
 * @apiVersion 1.0.0
 * @apiName putTags
 * @apiGroup Tags
 * @apiPermission authUser
 *
 * @apiHeader {string} Authorization Bearer token for the user session.
 *
 * @apiParam {string} data User tags encrypted data.
 * @apiParam {string} hash Hash of tags data before encryption.
 * @apiParam {number} amount Amount of user tags in tags encrypted data.
 *
 * @apiExample {curl} Example usage:
 *     curl --include --header "Authorization: Bearer 5nNOF+dNQaHvq..." --data "data=[encrypted data]&hash=[sha512 hash of data]&amount=16" --request PUT http://localhost:9090/tags
 *
 *  @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     true
 *
 * @apiUse SessionCheckError
 * @apiUse ContentTooBigError
 * @apiUse NotFoundError
 * @apiUse MissingParameterError
 * @apiUse ServerDataSearchError
 * @apiUse ServerDataSavingError
 */
restify.put('/tags',
    function ( request, response ) {
        users.setTags(request.authorization.token, request.params, function ( error, data ) {
            if ( error ) {
                return response.send(error);
            }

            // ok
            response.send(data);
        });
    }
);
