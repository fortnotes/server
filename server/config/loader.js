/**
 * Central Web Server
 * include one of the config files basing on the environment
 * @module loader
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// make sure env var is set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// load the config file
module.exports = require('./' + process.env.NODE_ENV + '.json');