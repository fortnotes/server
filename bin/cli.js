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
	//.option('-t, --api-code-size <number>', 'HTTP port to listen [96]', 96)
	.option('-p, --port <number>', 'HTTP port to listen [9090]', 9090)
	.option('-d, --db-uri <uri>', 'database connection URI', 'sqlite://~/.fortnotes/data.sqlite')
;

console.log(program);

// extend default help info
program.on('--help', function () {
	console.log('  Examples:');
	console.log('');
	console.log('    $ fortnotes --port 80');
	console.log('    $ fortnotes --database "mysql://user:pass@localhost/fortnotes"');
	console.log('');
});

// parse and invoke commands when defined
program.parse(process.argv);

// create data dir
fs.mkdir(path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes'), function ( error ) {
	if ( error ) {
		// already exists
	} else {
		// just created
	}

});


// public export
module.exports = program;
