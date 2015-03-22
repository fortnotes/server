/**
 * FortNotes API Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('./restify'),
	config  = require('./config/main');


// apply resources
require('./api/sessions');


restify.listen(config.server.port, function () {
	console.log('%s listening at %s', restify.name, restify.url);
});
