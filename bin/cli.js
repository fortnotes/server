#!/usr/bin/env node

'use strict';

var fs      = require('fs'),
    path    = require('path'),
    program = require('commander'),
    debug   = require('debug')('app:cli'),
    pkgInfo = require('../package.json'),
    config  = require('../config'),
    userConfig;


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


//console.log(program);

program.profile = program.profile ||
    path.join(process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, '.config'), pkgInfo.name);

debug('profile: ' + program.profile);

// overwrite default options with user configuration
if ( program.config ) {
    // todo: replace with !path.isAbsolute(program.config) in node 0.12.*
    if ( path.resolve(program.config) !== path.normalize(program.config) ) {
        // correct relative path
        program.config = path.join(__dirname, '..', program.config);
    }

    // valid file is given
    if ( fs.existsSync(program.config) ) {
        // get content
        userConfig = require(program.config);
        // config content is valid
        if ( userConfig && typeof userConfig === 'object' ) {
            debug('config file: %s', path.resolve(program.config));
            // redefine only top level
            Object.keys(userConfig).forEach(function (name) {
                config[name] = userConfig[name];
            });
        }
    }
}

// redefine some options
config.debug = !!program.debug;
config.test  = !!program.test;

//debug('config data: %o', config);

// start app
//require('../lib/main');
