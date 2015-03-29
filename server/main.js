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


// init db
require('./orm');


// apply resources
require('./resources/sessions');
require('./resources/users');


restify.listen(config.httpPort, function () {
	console.log('%s listening at %s', restify.name, restify.url);
});
