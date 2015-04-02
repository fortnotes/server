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


// public export
module.exports = server;
