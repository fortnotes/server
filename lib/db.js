/**
 * Object Relational Mapping.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var orm = require('orm'),
	db;


// global options
orm.settings.set('connection.debug', global.config.debug);
orm.settings.set('instance.cache',   false);

// init
db = orm.connect(global.config.database);


// public
module.exports = db;
