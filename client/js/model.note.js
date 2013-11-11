/**
 * Single note model implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */
app.class.Note = (function(app){
	'use strict';

	/**
	 * @param {Object} attributes init attributes
	 * @constructor
	 */
	function Note ( attributes ) {
		var time = +new Date();
		// init model with default params
		app.class.Model.call(this, {
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
		this.url = app.urls.api + 'notes';
		// extend
		this.attributes(attributes);
	}

	// inheritance
	Note.prototype = Object.create(app.class.Model.prototype);
	Note.prototype.constructor = Note;

//	/**
//	 * Prepare all data for sending to a server
//	 * @return {Object}
//	 */
//	Note.prototype.pack = function () {
//		return {
//			_id   : this._data._id,
//			ctime : this._data.ctime,
//			mtime : this._data.mtime,
//			hash  : this._data.hash,
//			data  : this._data.data
//		};
//	};
//
//	/**
//	 * Restores the received data from a server to a model data
//	 * @param {Object} data
//	 * @return {Object}
//	 */
//	Note.prototype.unpack = function ( data ) {
//		return data;
//	};

	Note.prototype.check = function () {

	};

	Note.prototype.encrypt = function () {

	};

	Note.prototype.decrypt = function () {

	};

	// export
	return Note;
})(app);