/**
 * Main application html blocks
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Page = require('./lib/page');

module.exports = {
	auth: new Page(document.querySelector('body > div.page.auth')),
	list: new Page(document.querySelector('body > div.page.list'))
};
