/**
 * Init restify server.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('restify'),
	config  = require('../config'),
	server  = restify.createServer(config.restify);


// plugins
server.use(restify.CORS());
server.use(restify.bodyParser());
server.use(restify.queryParser());

// authorization
server.use(function ( request, response, next ) {
	request.authorization = {};

	if ( request.headers.authorization ) {
		request.authorization.token = request.headers.authorization.slice(7);
	}

	return next();
});

// logger
if ( config.debug ) {
	server.use(function ( request, response, next ) {
		console.log('(restify)    %s\t%s\t%j', request.method, request.url, request.params);

		return next();
	});
}


// public
module.exports = server;
