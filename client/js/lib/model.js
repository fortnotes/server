/**
 * Base model implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Emitter = require('./emitter'),
	io      = require('./io');


/**
 * @param {Object} attributes init attributes
 * @constructor
 */
function Model ( attributes ) {
	// parent init
	Emitter.call(this);
	// init
	this._data  = Object.create(null);
	this.idName = '_id';
	this.url    = null;
	this.attributes(attributes);
}


// inheritance
Model.prototype = Object.create(Emitter.prototype);
Model.prototype.constructor = Model;


/**
 * Removes all attributes from the model
 */
Model.prototype.clear = function () {
	this._data = Object.create(null);
	this.emit('clear');
};


Model.prototype.reset = function () {
	//TODO: restore init data
	this.emit('reset');
};


/**
 * Gets the model attribute by name
 * @param {String|Number} key
 * @return {*}
 */
Model.prototype.get = function ( key ) {
	return this._data[key];
};


/**
 * Updates the given model attribute
 * @param {String|Number} key
 * @param {*} value
 */
Model.prototype.set = function ( key, value ) {
	var previous = this.get(key);
	this._data[key] = value;
	// trigger only if values are different
	if ( value !== previous ) {
		this.emit('change', key, value, previous);
	}
};


/**
 * Extends the model with the given attribute list
 * @param {Object} data
 */
Model.prototype.attributes = function ( data ) {
	var index   = 0,
		keyList = data && typeof data === 'object' ? Object.keys(data) : [];
	for ( ; index < keyList.length; index++ ) {
		this.set(keyList[index], data[keyList[index]]);
	}
};


/**
 * Check an attribute existence
 * @param {String|Number} key
 * @return {Boolean}
 */
Model.prototype.has = function ( key ) {
	return this._data.hasOwnProperty(key);
};


/**
 * Deletes the given attribute
 * @param {String|Number} key
 */
Model.prototype.remove = function ( key ) {
	var previous = this.get(key);
	delete this._data[key];
	this.emit('change', key, undefined, previous);
};


/**
 * Prepare all data for sending to a server
 * @return {Object}
 */
Model.prototype.pack = function () {
	return this._data;
};


/**
 * Restores the received data from a server to a model data
 * @param {Object} data
 * @return {Object}
 */
Model.prototype.unpack = function ( data ) {
	return data;
};


/**
 * Sync model to a server
 */
Model.prototype.save = function () {
	var self = this;
	if ( this.url ) {
		// collect data
		io.ajax(this.url, {
			// request params
			method: self._data[self.idName] ? 'put' : 'post',
			data  : self.pack(),
			onload: function( data ) {
				data = self.unpack(self.parse(data));
				self.attributes(data);
				console.log(data);
				self.emit('save', true);
			},
			// error handlers
			onerror:   this.saveFailure,
			ontimeout: this.saveFailure
		});
	}
};


/**
 * Error handler while model data fetch
 */
Model.prototype.saveFailure = function () {
	this.emit('save', false);
};


/**
 * Converts received data from a server to a model attributes
 * @param {String} response
 * @return {Object}
 */
Model.prototype.parse = function ( response ) {
	var data = {};
	try {
		data = JSON.parse(response).data;
	} catch(e){ console.log(e); }
	return data;
};


// public export
module.exports = Model;