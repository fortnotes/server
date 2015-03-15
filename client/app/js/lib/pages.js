/**
 * Page manager implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/lib/pages.js');

var Emitter = require('./emitter');


/**
 * @param {Node} node init attributes
 * @constructor
 */
function Page ( node ) {
	// parent init
	Emitter.call(this);
	// init
	this.$node = node;
	this._data = Object.create(null);
}


// inheritance
Page.prototype = Object.create(Emitter.prototype);
Page.prototype.constructor = Page;


/**
 * Show page
 */
Page.prototype.show = function () {
	this.$node.classList.add('active');
	this.emit('show');
};


/**
 * Hide page
 */
Page.prototype.hide = function () {
	this.$node.classList.remove('active');
	this.emit('hide');
};


// public export
module.exports = Page;
