/**
 * RESTful web API module
 * Main entry point
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// root constants
module.exports = require('./codes');

// main objects
module.exports.auth     = require('./auth');
module.exports.users    = require('./users');
module.exports.notes    = require('./notes');
module.exports.sessions = require('./sessions');
module.exports.tags     = require('./tags');
module.exports.users    = require('./users');
