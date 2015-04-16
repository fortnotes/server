#!/usr/bin/env node

'use strict';

var fs      = require('fs'),
	path    = require('path'),
	program = require('commander'),
	pkgInfo = require('../package.json'),
	config  = require('../config'),
	userConfig;


// init
program
	.version(pkgInfo.version)
	.description('FortNotes Server application to process client REST API requests.\n  See the details at https://fortnotes.com/.')
	.option('-d, --debug', 'enable verbose debug mode')
	.option('-t, --test', 'run tests and exit')
	.option('-c, --config <file>', 'path to the configuration options JSON file to overwrite default config');

// extend default help info
program.on('--help', function () {
	console.log('  Examples:');
	console.log('');
	console.log('    $ fortnotes --config /etc/fortnotes/config.json --test');
	console.log('    $ fortnotes --config ~/.fortnotes/config.json --debug');
	console.log('');
});

// parse and invoke commands when defined
program.parse(process.argv);

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
			console.log('Config: %s', path.resolve(program.config));
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

// start app
require('../lib/main');
