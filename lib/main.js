/**
 * FortNotes API Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('./restify');


// public
module.exports = function ( done ) {
	// init db
	require('./orm').on('sync', function () {
		/*// apply resources
		require('./resources/sessions');
		require('./resources/notes');
		require('./resources/users');
		require('./resources/tags');


		restify.listen(global.config.port, function () {
			console.log('%s listening at %s:%s', restify.name, require('ip').address(), global.config.port);

			if ( typeof done === 'function' ) {
				done();
			}

			var Mocha = require('mocha'),
				mocha = new Mocha({
					reporter: 'spec'
				});

			mocha.addFile('./tests/main.js');
			//console.log(mocha);
			// Now, you can run the tests.
			mocha.run(function(failures){
				console.log(failures);
				//process.on('exit', function () {
				process.exit(failures);
				//});
			});
		});*/
	});
};
