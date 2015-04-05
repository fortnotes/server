/**
 * Mocha REST tests entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path = require('path'),
	argv = require('minimist')(process.argv.slice(2)),
	file = argv.config || path.join(__dirname, '..', 'config.json');


// map loaded configuration to global scope
global.config = require(file);

// set logging verbosity level
global.config.debug = !!argv.debug;

// report with help
console.log('Config file name: %s', file);
console.log('  * to use another config file use flag --config <file>');
console.log('  * to see verbose log use flag --debug');


// specs
require('./spec.sessions');
require('./spec.tags');
require('./spec.notes');
