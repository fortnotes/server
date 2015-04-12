/**
 * Mocha REST tests common data.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var crypto = require('crypto');


// public
module.exports = {
	userA: {
		email: crypto.randomBytes(4).toString('hex') + '@' + crypto.randomBytes(4).toString('hex') + '.com',
		sessionA: {},
		noteA: {}
	},
	userB: {
		email: crypto.randomBytes(4).toString('hex') + '@' + crypto.randomBytes(4).toString('hex') + '.com',
		sessionA: {},
		noteA: {},
		noteB: {}
	}
};
