/**
 * FortNotes API Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('./restify');


// init db
require('./orm').on('connect', function () {
	// apply resources
	require('../resources/sessions');
	require('../resources/notes');
	require('../resources/users');
	require('../resources/tags');


	restify.listen(global.config.port, function () {
		console.log('%s listening at %s:%s', restify.name, require('ip').address(), global.config.port);
	});
});
