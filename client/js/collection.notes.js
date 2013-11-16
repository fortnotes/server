/**
 * List of notes
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Collection = require('./lib/collection'),
	config     = require('./config'),
	Note       = require('./model.note');


/**
 * @param {Object} models init attributes
 * @constructor
 */
function Notes ( models ) {
	// parent init
	Collection.call(this, models);
	this.model  = Note;
	this.url    = config.urls.api + 'notes';
}


// inheritance
Notes.prototype = Object.create(Collection.prototype);
Notes.prototype.constructor = Notes;


// public export
module.exports = Notes;