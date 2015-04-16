/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var db    = require('../db'),
	debug = require('debug')('db:model:keys');


db.define('keys', {
	// link to the table users - owner of the key
	userId: {type: 'integer', unsigned: true, required: true, index: true},

	// public and private key data
	pub: {type: 'text', big: true, required: true},
	key: {type: 'text', big: true, required: true},

	// creation time
	createTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

	// termination time
	deleteTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0}
});


debug('loaded');
