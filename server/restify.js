/**
 * Init restify server.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('restify'),
	server  = restify.createServer({
		name: 'FortNotes API Server'
	});


// plugins
server.use(restify.CORS());
server.use(restify.bodyParser());


// public export
module.exports = server;
