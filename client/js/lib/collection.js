/**
* Base collection implementation
* @author DarkPark
* @license GNU GENERAL PUBLIC LICENSE Version 3
*/

'use strict';

// declarations
var Emitter = require('./emitter'),
	io      = require('./io');


/**
 * @param {[app.class.Model]} models init model list
 * @constructor
 */
function Collection ( models ) {
	// parent init
	Emitter.call(this);
	// init
	this._data = [];
	this._ids  = {};
	this.model = null;
	this.url   = null;
	this.models(models);
}


// inheritance
Collection.prototype = Object.create(Emitter.prototype);
Collection.prototype.constructor = Collection;


/**
 * Removes all models from the collection
 */
Collection.prototype.clear = function () {
	var index = 0;
	// remove all associated links
	for ( ; index < this._data.length; index++ ) {
		this._data[index].removeAllListeners();
	}
	this._data = [];
	this._ids  = {};
	this.emit('clear');
};


/**
 * Adds the given list of models to the collection
 * @param {[app.class.Model]} data model list
 */
Collection.prototype.models = function ( data ) {
	var index = 0;
	if ( Array.isArray(data) ) {
		for ( ; index < data.length; index++ ) {
			this.add(data[index]);
		}
	}
};


/**
 * Appends the given model to the collection
 * @param {app.class.Model} model
 */
Collection.prototype.add = function ( model ) {
	this._ids[model.get(model.idName)] = model;
	this._data.push(model);
	this.emit('add', model);
};


/**
 * Inserts the given model to some plece in the collection
 * @param {app.class.Model} model
 * @param {Number} position index of the model
 */
Collection.prototype.insert = function ( model, position ) {
	this._ids[model.get(model.idName)] = model;
	this._data.splice(position, 0, model);
	this.emit('add', model, position);
};


/**
 * Deletes the given model from the collection
 * @param {app.class.Model} model
 */
Collection.prototype.remove = function ( model ) {
	var index = this._data.indexOf(model);
	if ( index > -1 ) {
		this._data.splice(index, 1);
		delete this._ids[model.get('id')];
		this.emit('remove', model);
	}
};


/**
 * Gets a model by the given index in the collection
 * @param {Number} position
 * @return {app.class.Model} model or undefined if fail
 */
Collection.prototype.at = function ( position ) {
	return this._data[position];
};


/**
 * Gets a model by its id
 * @param {String|Number} id
 * @return {app.class.Model} model or undefined if fail
 */
Collection.prototype.get = function ( id ) {
	return this._ids[id];
};


// extending with base methods
['filter', 'forEach', 'every', 'map', 'some'].forEach(function ( name ) {
	Collection.prototype[name] = function () {
		return Array.prototype[name].apply(this._data, arguments);
	};
});


/**
 * Applies the custom sor method for all models in the collection
 * @param {Function} comparator
 */
Collection.prototype.sort = function ( comparator ) {
	this._data.sort(comparator);
	this.emit('sort');
};


/**
 * Collects models from a server
 */
Collection.prototype.fetch = function () {
	var self = this, index = 0;
	if ( this.model && this.url ) {
		// collect data
		io.ajax(this.url, {
			// request params
			method: 'get',
			onload: function( data ) {
				data = self.parse(data);
				// create models from response and add
				if ( Array.isArray(data) && self.model ) {
					for ( ; index < data.length; index++ ) {
						//console.log(data[index]);
						// create a model from received data
						self.add(new (self.model)(data[index]));
					}
				}
				self.emit('fetch', true);
			},
			// error handlers
			onerror:   this.fetchFailure,
			ontimeout: this.fetchFailure
		});
	}
};


/**
 * Error handler while model data fetch
 */
Collection.prototype.fetchFailure = function () {
	this.emit('fetch', false);
};


/**
 * Converts received data from a server to a model list
 * @param {String} response
 * @return {Array}
 */
Collection.prototype.parse = function ( response ) {
	var data = [];
	try {
		data = JSON.parse(response).data;
	} catch(e){ console.log(e); }
	return data;
};


// public export
module.exports = Collection;