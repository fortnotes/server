/**
 * Init restify server.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('restify'),
	debug   = require('debug')('http'),
	config  = require('../config'),
	server  = restify.createServer(config.restify);

/* eslint-disable new-cap */

// plugins
server.use(restify.CORS());
server.use(restify.bodyParser());
server.use(restify.queryParser());

/* eslint-disable no-unused-vars */

// authorization
server.use(function ( request, response, next ) {
	request.authorization = {};

	if ( request.headers.authorization ) {
		request.authorization.token = request.headers.authorization.slice(7);
	}

	return next();
});

// logger
server.use(function ( request, response, next ) {
	debug('%s\t%s\t%o', request.method, request.url, request.params);

	return next();
});


// public
module.exports = server;
