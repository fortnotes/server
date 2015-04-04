/**
 * RESTful web API module.
 * Note tags.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify  = require('../lib/restify'),
	db       = require('../lib/orm'),
	sessions = db.models.sessions;
