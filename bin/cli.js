#!/usr/bin/env node

'use strict';

var fs      = require('fs'),
	path    = require('path'),
	gulp    = require('gulp'),
	program = require('commander'),
	pkgInfo = require('../package.json');


fs.mkdir(path.join(process.env.HOME || process.env.USERPROFILE, '.fortnotes'), function ( error ) {
	console.log(error);
});

/**
 * Process the given command and forward it to gulp.
 *
 * @param {Object} command the task executed at the moment
 */
function execCommand ( command ) {
	var name;

	console.log(command);

	return;

	// save link to this command
	// to use inside some tasks
	program.currCommnand = command;

	// don't use both develop and release flags at once
	if ( command.develop && command.release ) {
		delete command.develop;
		delete command.release;
	}

	// build gulp task name
	name = command['_name'] +
	(command.clean ? ':clean' : '') +
	(command.develop ? ':develop' : '') +
	(command.release ? ':release' : '');

	// first run or root of the project
	if ( name === 'init' || fs.existsSync(path.join(process.env.CWD, 'package.json')) ) {
		// exec selected task
		gulp.start(name);
	} else {
		console.log('Wrong current directory!\nThis command should be executed only in the root directory of the project.'.red);
	}
}


program
	.version(pkgInfo.version)
	.usage('<command> [options]');

program
	.command('app')
	.description('serve client application static files')
	.option('-p, --port', 'HTTP port to listen')
	.option('-i, --iiii', 'HTTP port to listen')
	.action(execCommand);

program
	.command('api')
	.description('serve API requests')
	.option('-p, --port', 'HTTP port to listen')
	.action(execCommand);

// extend default help info
program.on('--help', function () {
	console.log('  Examples:');
	console.log('');
	console.log('    $ fortnotes app --help');
	console.log('    $ fortnotes api --port 9090');
	console.log('');
});

// parse and invoke commands when defined
program.parse(process.argv);

// no options were given
if ( !program.args.length ) {
	// show help and exit
	program.help();
}


// public export
module.exports = program;
