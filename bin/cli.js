#!/usr/bin/env node

'use strict';

var fs      = require('fs'),
	path    = require('path'),
	program = require('commander'),
	pkgInfo = require('../package.json');

// init
program
	.version(pkgInfo.version)
	//.option('-t, --api-token-size <number>', 'HTTP port to listen [96]', 96)
	//.option('-c, --config <file>', 'path to the configuration options file [~/.fortnotes/config.json]', path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes', 'config.json'))
	.option('-c, --config <file>', 'path to the configuration options file', path.join(__dirname, '..', 'config.json'))
	//.option('-p, --port <number>', 'HTTP port to listen [9090]', 9090)
	//.option('-d, --db-uri <uri>', 'database connection URI', 'sqlite://' + path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes', 'data.sqlite'))
;

//console.log(process);

// extend default help info
program.on('--help', function () {
	console.log('  Examples:');
	console.log('');
	console.log('    $ fortnotes --port 80');
	console.log('    $ fortnotes --database "mysql://user:pass@localhost/dbname"');
	console.log('');
});

// parse and invoke commands when defined
program.parse(process.argv);

console.log(program);

global.config = require(program.config);

console.log(global.config);

require('../lib/main');

//global.config = {
//	port: parseInt(program.port, 10),
//	dbUri: program.dbUri
//};

// create data dir
//fs.mkdir(path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes'), function ( error ) {
//	if ( error ) {
//		// already exists
//	} else {
//		// just created
//	}
//
//	require('../lib/main');
//});


// public export
module.exports = program;
