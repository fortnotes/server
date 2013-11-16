/**
 * Base application configuration parameters
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

module.exports = {
	debug   : Boolean(localStorage.getItem('debug')),
	urls    : {
		api : '/api/v1/'
	},
	user    : {
		id  : '52757791919134ffc7eec0e8'
	}
};