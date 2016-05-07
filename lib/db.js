/**
 * Object Relational Mapping.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var orm    = require('orm'),
    config = require('../config'),
    db;


// global options
orm.settings.set('connection.debug', config.debug);
orm.settings.set('instance.cache',   false);

// init
db = orm.connect(config.database);


// public
module.exports = db;
