/**
 * Mocha REST tests entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Mocha = require('mocha'),
    mocha = new Mocha({
        reporter: 'spec',
        timeout: 1000,
        bail: true,
        fullTrace: true
    });


// add specs
mocha.addFile('./tests/specs/sessions');
mocha.addFile('./tests/specs/tags');
mocha.addFile('./tests/specs/notes');
mocha.addFile('./tests/specs/profile');

// exec
mocha.run(function ( failures ) {
    // close db connection
    require('../lib/db').close();

    /* eslint-disable no-process-exit */
    // return exit code
    process.exit(failures);
});
