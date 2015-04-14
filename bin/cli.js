#!/usr/bin/env node

'use strict';

var //fs      = require('fs'),
	path    = require('path'),
	program = require('commander'),
	pkgInfo = require('../package.json');


// init
program
	.version(pkgInfo.version)
	.description('Server application to process client REST API requests.\n  See the details at https://fortnotes.com/.')
	.option('-d, --debug', 'enable verbose debug mode')
	.option('-t, --test', 'run tests and exit')
	//.option('-t, --api-token-size <number>', 'HTTP port to listen [96]', 96)
	//.option('-c, --config <file>', 'path to the configuration options file [~/.fortnotes/config.json]', path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes', 'config.json'))
	.option('-c, --config <file>', 'path to the configuration options JSON file', path.join(__dirname, '..', 'config', 'sqlite.json'))
	//.option('-p, --port <number>', 'HTTP port to listen [9090]', 9090)
	//.option('-d, --db-uri <uri>', 'database connection URI', 'sqlite://' + path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes', 'data.sqlite'))
;

// extend default help info
program.on('--help', function () {
	console.log('  Examples:');
	console.log('');
	console.log('    $ fortnotes --config "~/.fortnotes/config.json"');
	console.log('');
});

// parse and invoke commands when defined
program.parse(process.argv);

// map loaded configuration to global scope
global.config = require(program.config);

global.config.debug = !!program.debug;
global.config.test = !!program.test;

require('../lib/main');
