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

server.use(function logger ( request, response, next ) {
	console.log('(restify)    %s\t%s\t%j', request.method, request.url, request.params);

	return next();
});


// public export
module.exports = server;
