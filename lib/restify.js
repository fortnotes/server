/**
 * Init restify server.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('restify'),
	server  = restify.createServer(global.config.restify);


// plugins
server.use(restify.CORS());
server.use(restify.bodyParser());
server.use(restify.queryParser());

// authorization
server.use(function ( request, response, next ) {
	request.authorization = {};

	if ( request.headers.authorization ) {
		request.authorization.token = request.headers.authorization.slice(7);

		// todo: remove in production
		if ( request.authorization.token.length !== global.config.tokenSize ) {
			console.log('wrong token size');
		}
	}

	return next();
});

// logger
server.use(function ( request, response, next ) {
	console.log('(restify)    %s\t%s\t%j', request.method, request.url, request.params);

	return next();
});


// public
module.exports = server;
