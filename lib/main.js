/**
 * FortNotes API Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('./restify'),
	db      = require('./db');


// ready
db.on('connect', function ( error ) {
	if ( error ) { throw error; }

	// plugins
	db.use(require('orm-transaction'));

	// models
	require('./models/keys')(db);
	require('./models/notes')(db);
	require('./models/notes.data')(db);
	require('./models/users')(db);
	require('./models/sessions')(db);

	// db is ready
	db.sync(function ( error ) {
		if ( error ) { throw error; }

		// apply restify resources
		require('./resources/sessions');
		require('./resources/notes');
		require('./resources/users');
		require('./resources/tags');

		// accept API requests
		restify.listen(global.config.port, function () {
			console.log('%s listening at %s:%s', restify.name, require('ip').address(), global.config.port);

			if ( global.config.test ) {
				// run tests and exit
				require('../tests/main');
			}
		});
	});
});


// handle Ctrl+C in terminal
process.on('SIGINT', function () {
	console.log('close database connection');
	db.close();
	process.exit();
});
