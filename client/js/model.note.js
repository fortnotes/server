/**
 * Single note model implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Model  = require('./lib/model'),
	config = require('./config');


/**
 * @param {Object} attributes init attributes
 * @constructor
 */
function Note ( attributes ) {
	var time = +new Date();
	// parent init with default params
	Model.call(this, {
		_id     : '',
		ctime   : time,  // creation time
		mtime   : time,  // modification time
		hash    : '',    // sha256 of the encrypted data for validation
		data    : ''     // encrypted data of the whole note
		//entries : [],    // plain data of the note entries
		//tags    : []     // plain data of the note tags
	});
	//this.entries = [];  // plain data of the note entries
	//this.tags    = [];  // plain data of the note tags
	// sync link
	this.url = config.urls.api + 'notes';
	// extend
	this.attributes(attributes);
}


// inheritance
Note.prototype = Object.create(Model.prototype);
Note.prototype.constructor = Note;


Note.prototype.check = function () {

};


Note.prototype.encrypt = function () {

};


Note.prototype.decrypt = function () {

};


// public export
module.exports = Note;