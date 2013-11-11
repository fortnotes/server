/**
 * List of notes
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */
app.class.Notes = (function(app){
	'use strict';

	/**
	 * @param {Object} models init attributes
	 * @constructor
	 */
	function Notes ( models ) {
		app.class.Collection.call(this, models);
		this.model  = app.class.Note;
		this.url    = app.urls.api + 'notes';
	}

	// inheritance
	Notes.prototype = Object.create(app.class.Collection.prototype);
	Notes.prototype.constructor = Notes;

	// export
	return Notes;
})(app);