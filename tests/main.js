/**
 * Mocha REST tests entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Mocha = require('mocha'),
	mocha = new Mocha({
		reporter: 'spec'
	});


// extend Object.prototype
require('should');

// add specs
mocha.addFile('./tests/spec.sessions');
mocha.addFile('./tests/spec.tags');
mocha.addFile('./tests/spec.notes');
mocha.addFile('./tests/spec.profile');

// exec
mocha.run(function ( failures ) {
	// close db connection
	require('../lib/db').close();
	// return exit code
	process.exit(failures);
});
