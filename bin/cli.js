#!/usr/bin/env node

'use strict';

var fs      = require('fs'),
    path    = require('path'),
    program = require('commander'),
    debug   = require('debug')('app:cli'),
    pkgInfo = require('../package.json');


// init
program
    .version(pkgInfo.version)
    .description(pkgInfo.description)
    .option('-d, --debug', 'enable verbose debug mode')
    .option('-t, --test', 'run tests and exit')
    .option('-p, --profile <path>', 'path to the profile directory with config and data files');

// extend default help info
program.on('--help', function () {
    console.log('  Examples:');
    console.log('');
    console.log('    $ fortnotes --profile /etc/fortnotes --test');
    console.log('    $ fortnotes --profile ~/.config/fortnotes --debug');
    console.log('    $ DEBUG=* fortnotes');
    console.log('');
});

// parse and invoke commands when defined
program.parse(process.argv);

// main path
program.profile = program.profile ||
    path.join(process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, '.config'), pkgInfo.name);


// init/load profile and application
fs.mkdir(program.profile, function ( error ) {
    var App        = require('../lib/app'),
        configFile = path.join(program.profile, 'config.js'),
        configData, app;

    // make sure directory is present
    if ( error && error.code !== 'EEXIST') {
        console.log(error);
    }
    debug('profile directory: ' + program.profile);

    // config
    try {
        configData = require(configFile);
    } catch ( error ) {
        if ( error.code === 'MODULE_NOT_FOUND' ) {
            // copy the default config
            fs.writeFileSync(configFile, fs.readFileSync(path.join(process.cwd(), '.profile', 'config.js')));
            // load it
            configData = require(configFile);
        } else {
            console.log(error);
        }
    }
    debug(configData);
    
    // init
    app = new App(configData);

    // handle Ctrl+C in terminal
    process.on('SIGINT', function () {
        app.close();

        /* eslint-disable no-process-exit */
        process.exit();
    });
});
