/**
 * FortNotes API Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('./restify'),
    config  = require('../config'),
    db      = require('./db');


// ready
db.on('connect', function ( error ) {
    if ( error ) { throw error; }

    // plugins
    db.use(require('orm-transaction'));

    // models
    require('./models/keys');
    require('./models/notes');
    require('./models/notes.history.js');
    require('./models/users');
    require('./models/sessions');

    // db is ready
    db.sync(function ( error ) {
        if ( error ) { throw error; }

        // apply restify resources
        require('./resources/sessions');
        require('./resources/notes');
        //require('./resources/users');
        require('./resources/tags');
        require('./resources/profile');

        // accept API requests
        restify.listen(config.port, function () {
            console.log('%s listening at %s:%s', restify.name, require('ip').address(), config.port);

            if ( config.test ) {
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

    /* eslint-disable no-process-exit */
    process.exit();
});
