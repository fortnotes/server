(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * AES encryption/decryption wrapper
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/aes.js');

var Emitter = require('./lib/emitter'),
	sjcl    = require('./lib/sjcl'),
	config  = require('./config'),
	aes     = new Emitter(),
	pass    = null;  // private primary password (accessed only indirectly)


// hash of the given pass (if not set then the pass was not created)
aes.hash   = null;
// salt string for hash generation
aes.salt   = null;
// time in seconds for pass caching (default - 5 minutes)
aes.time   = 300;


/**
 * Checks if pass set
 * @return {Boolean} true if exists
 */
aes.hasPass = function () {
	return Boolean(pass);
};


/**
 * Set the private pass var and start timer for clearing it in some time
 * @param {String} value password to set
 */
aes.setPass = function ( value ) {
	// set the private password
	pass = value;
	// calculate and set hash
	this.hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(
		sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(value)) +
			this.salt
	));
	// notify all subscribers
	this.emit('pass', true);

	//if ( !this.HasHash() ) this.SetPassHash(this.CalcHash(value));
	//fb('pass will expire in ' + time);
	// set clearing timer
	//setTimeout(function(){self.ExpirePass()}, time * 1000);
};


/**
 * Checks if pass set and matches the hash
 * @param {String} value password to check
 */
aes.checkPass = function ( value ) {
	return this.hash === sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(
		sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(value)) +
			this.salt
	));
};


/**
 * Encrypts the given text with the stored pass
 * @param {String} data text for encryption
 * @return {Object|Boolean} encrypted line or false on failure
 */
aes.encrypt = function ( data ) {
	var enc = {};
	// password is present and not empty input
	if ( pass && data ) {
		// protected block
		try {
			enc = sjcl.json._encrypt(pass, data, config.sjcl);
			// get only significant fields
			return {iv:enc.iv, salt:enc.salt, ct:enc.ct};
			//return sjcl.encrypt(pass, data, this.config);
		} catch ( e ) {
			console.trace();
			console.log('encrypt failure', e);
		}
	}
	return false;
};


/**
 * Decrypts the given text with the stored pass
 * @param {Object} data text to be decrypted
 * @return {String|Boolean} decrypted line or false on failure
 */
aes.decrypt = function ( data ) {
	//var name;
	// password is present and not empty input
	if ( pass && data ) {
		// protected block
		try {
			// apply user-specific decoding params to the data
			//for ( name in config.sjcl ) { if ( config.sjcl.hasOwnProperty(name) ) { data[name] = config.sjcl[name]; } }
			return sjcl.json._decrypt(pass, config.sjcl, data);
		} catch ( e ) {
			console.trace();
			console.log('decrypt failure', e);
		}
	}
	return false;
};


// public export
module.exports = aes;
},{"./config":4,"./lib/emitter":6,"./lib/sjcl":10}],2:[function(require,module,exports){
/**
 * Application API wrapper
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/api.js');

var io     = require('./lib/io'),
	config = require('./config');


function api ( method, url, data, callback ) {
	io.ajax(config.apiUrl + url, {
		method : method,
		data   : data,
		headers: config.apiKey ? {key: config.apiKey} : {},
		onload : function ( response, status ) {
			var data  = null,
				error = null;
			if ( response && status === 200 ) {
				// seems valid
				try {
					data = JSON.parse(response);
				} catch ( e ) { error = e; }
			} else {
				console.log('!!!!');
				error = new Error('empty response or invalid status');
			}
			callback(error, data);
		},
		onerror: function ( e ) {
			callback(e, null);
		},
		ontimeout: function () {
			callback(new Error('request timed out'), null);
		}
	});
}

// public export
module.exports.get = function ( url, callback ) {
	return api('get', url, null, callback);
};

module.exports.head = function ( url, callback ) {
	return api('head', url, null, callback);
};

module.exports.post = function ( url, data, callback ) {
	return api('post', url, data, callback);
};

module.exports.put = function ( url, callback ) {
	return api('put', url, null, callback);
};

module.exports.delete = function ( url, callback ) {
	return api('delete', url, null, callback);
};
},{"./config":4,"./lib/io":7}],3:[function(require,module,exports){
/**
 * List of notes
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/collection.notes.js');

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
	this.url    = config.apiUrl + 'notes';
}


// inheritance
Notes.prototype = Object.create(Collection.prototype);
Notes.prototype.constructor = Notes;


// public export
module.exports = Notes;
},{"./config":4,"./lib/collection":5,"./model.note":12}],4:[function(require,module,exports){
/**
 * Real-time application parameters
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/config.js');

module.exports = {
	// app work mode
	debug  : Boolean(localStorage.getItem('debug')),
	// all api requests address
	apiUrl : '/api/v1/',
	// base64 encoded 64 bytes string issued on session creation
	apiKey : localStorage.getItem('config.auth.key'),
	// default encrypt/decrypt parameters (rewritten by user individual options)
	sjcl   : JSON.parse(localStorage.getItem('config.sjcl')) || { v:1,iter:1000,ks:256,ts:128,mode:'ccm',adata:'',cipher:'aes' }
};
},{}],5:[function(require,module,exports){
/**
* Base collection implementation
* @author DarkPark
* @license GNU GENERAL PUBLIC LICENSE Version 3
*/

'use strict';

console.log('/client/js/lib/collection.js');

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
},{"./emitter":6,"./io":7}],6:[function(require,module,exports){
/**
 * Events Emitter base implementation
 * @see http://nodejs.org/api/events.html
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/lib/emitter.js');

/**
 * @constructor
 */
function Emitter () {
	this._events = Object.create(null);
}


Emitter.prototype = {
	/**
	 * Bind an event to the given callback function.
	 * The same callback function can be added multiple times for the same event name.
	 * @param {String} name event identifier
	 * @param {Function} callback function to call on this event
	 * @example
	 *		TODO: add
	 */
	addListener : function ( name, callback ) {
		// initialization may be required
		this._events[name] = this._events[name] || [];
		// append this new event to the list
		this._events[name].push(callback);
	},

	/**
	 * Remove one/many callbacks.
	 * @param {String} name event identifier
	 * @param {Function} callback function to call on this event
	 * @example
	 *		TODO: add
	 */
	removeListener : function ( name, callback ) {
		// the event exists and should have some callbacks
		if ( Array.isArray(this._events[name]) ) {
			// rework the callback list to exclude the given one
			this._events[name] = this._events[name].filter(function(fnc){ return fnc !== callback; });
			// event has no more callbacks so clean it
			if ( this._events[name].length === 0 ) {
				delete this._events[name];
			}
		}
	},

	/**
	 * Remove all callbacks for the given event name.
	 * Without event name clears all events.
	 * @param {String} [name] event identifier
	 * @example
	 *		TODO: add
	 */
	removeAllListeners : function ( name ) {
		// check input
		if ( arguments.length === 0 ) {
			// no arguments so remove everything
			this._events = Object.create(null);
		} else if ( arguments.length === 1 ) {
			// only name is given so remove all callbacks for the given event
			delete this._events[name];
		}
	},

	/**
	 * Execute each of the listeners in order with the supplied arguments.
	 * @param {String} name event identifier
	 * @param {...*} [args] options
	 * @example
	 *		TODO: add
	 */
	emit : function ( name, args ) {
		var fncIndex;
		args = Array.prototype.slice.call(arguments, 1);
		// the event exists and should have some callbacks
		if ( Array.isArray(this._events[name]) ) {
			for ( fncIndex = 0; fncIndex < this._events[name].length; fncIndex++ ) {
				// invoke the callback with parameters
				this._events[name][fncIndex].apply(this, args);
			}
		}
	},

	/**
	 * Adds a one time listener for the event.
	 * This listener is invoked only the next time the event is fired, after which it is removed.
	 * @param {String} name event identifier
	 * @param {Function} callback function to call on this event
	 */
	once: function ( name, callback ) {
		var self = this;
		this.addListener(name, function wrapper () {
			self.removeListener(name, wrapper);
			callback.apply(self, arguments);
		});
	}
};


// public export
module.exports = Emitter;
},{}],7:[function(require,module,exports){
/**
 * IO helpers
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/lib/io.js');

// declarations
var io = {},
	defaults = {
		method    : 'GET',  // HTTP method to use, such as "GET", "POST", "PUT", "DELETE", etc.
		async     : true,   // whether or not to perform the operation asynchronously
		headers   : {},     // list of HTTP request headers
		type      : 'text', // "", "arraybuffer", "blob", "document", "json", "text"
		data      : null,   // data to send (plain object)
		timeout   : 30000,  // amount of milliseconds a request can take before being terminated
		onload    : null,   // callback when the request has successfully completed
		onerror   : null,   // callback when the request has failed
		ontimeout : null    // callback when the author specified timeout has passed before the request could complete
	},
	defaultsKeys = Object.keys(defaults);


/**
 * Main method to send ajax requests
 * @param {String} url
 * @param {Object} options Plain object with call parameters
 * @return {XMLHttpRequest|Boolean} false in case wrong params
 * @example
 *		TODO: add
 */
io.ajax = function ( url, options ) {
	var index, headersKeys;
	// init
	options = options || {};
	// valid non-empty string
	if ( url && (typeof url === 'string' || url instanceof String) && url.length > 0 ) {
		// plain object is given as param
		if ( options && typeof options === 'object') {
			// extend with default options
			for ( index = 0 ; index < defaultsKeys.length ; index++ ) {
				// in case not redefined
				if ( options[defaultsKeys[index]] === undefined ) {
					options[defaultsKeys[index]] = defaults[defaultsKeys[index]];
				}
			}
		}

		var client = new XMLHttpRequest();
		// init a request
		client.open(options.method, url, options.async);

		// apply the given headers
		if ( options.headers && typeof options.headers === 'object') {
			headersKeys = Object.keys(options.headers);
			for ( index = 0; index < headersKeys.length; index++ ) {
				client.setRequestHeader(headersKeys[index], options.headers[headersKeys[index]]);
			}
		}

		// set response type and timeout
		client.responseType = options.type;
		client.timeout      = options.timeout;

		// callbacks
		if ( options.onload && typeof options.onload === 'function' ) {
			client.onload = function(){
				options.onload.call(this, this.response, this.status);
			};
		}
		client.onerror   = options.onerror;
		client.ontimeout = options.ontimeout;

		// actual request
		//client.send(this.encode(options.data));
		client.send(options.data ? JSON.stringify(options.data) : null);

		return client;
	}
	return false;
};


/**
 * Serializes the given data for sending to the server via ajax call
 * @param {Object} data Plain object to serialize
 * @return {String} null if no data to encode
 * @example
 *		TODO: add
 */
io.encode = function ( data ) {
	var result = [], index = 0, keys;
	// input plain object validation
	if ( data && typeof data === 'object') {
		keys = Object.keys(data);
		// apply encoding
		for ( ; index < keys.length; index++ ) {
			result.push(encodeURIComponent(keys[index]) + '=' + encodeURIComponent(data[keys[index]]));
		}
		// build the list of params
		if ( result.length > 0 ) {
			return result.join('&');
		}
	}
	return null;
};


// public export
module.exports = io;
},{}],8:[function(require,module,exports){
/**
 * Base model implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/lib/model.js');

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
},{"./emitter":6,"./io":7}],9:[function(require,module,exports){
/**
 * Base page implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/lib/page.js');

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

},{"./emitter":6}],10:[function(require,module,exports){
/** @fileOverview Javascript cryptography implementation.
 *
 * Crush to remove comments, shorten variable names and
 * generally reduce transmission size.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

"use strict";
/*jslint indent: 2, bitwise: false, nomen: false, plusplus: false, white: false, regexp: false */
/*global document, window, escape, unescape, module, require, Uint32Array */

console.log('/client/js/lib/sjcl.js');

/** @namespace The Stanford Javascript Crypto Library, top-level namespace. */
var sjcl = {
  /** @namespace Symmetric ciphers. */
  cipher: {},

  /** @namespace Hash functions.  Right now only SHA256 is implemented. */
  hash: {},

  /** @namespace Key exchange functions.  Right now only SRP is implemented. */
  keyexchange: {},
  
  /** @namespace Block cipher modes of operation. */
  mode: {},

  /** @namespace Miscellaneous.  HMAC and PBKDF2. */
  misc: {},
  
  /**
   * @namespace Bit array encoders and decoders.
   *
   * @description
   * The members of this namespace are functions which translate between
   * SJCL's bitArrays and other objects (usually strings).  Because it
   * isn't always clear which direction is encoding and which is decoding,
   * the method names are "fromBits" and "toBits".
   */
  codec: {},
  
  /** @namespace Exceptions. */
  exception: {
    /** @constructor Ciphertext is corrupt. */
    corrupt: function(message) {
      this.toString = function() { return "CORRUPT: "+this.message; };
      this.message = message;
    },
    
    /** @constructor Invalid parameter. */
    invalid: function(message) {
      this.toString = function() { return "INVALID: "+this.message; };
      this.message = message;
    },
    
    /** @constructor Bug or missing feature in SJCL. @constructor */
    bug: function(message) {
      this.toString = function() { return "BUG: "+this.message; };
      this.message = message;
    },

    /** @constructor Something isn't ready. */
    notReady: function(message) {
      this.toString = function() { return "NOT READY: "+this.message; };
      this.message = message;
    }
  }
};

if(typeof module !== 'undefined' && module.exports){
  module.exports = sjcl;
}
/** @fileOverview Low-level AES implementation.
 *
 * This file contains a low-level implementation of AES, optimized for
 * size and for efficiency on several browsers.  It is based on
 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
 * Rijmen, Antoon Bosselaers and Paulo Barreto.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Schedule out an AES key for both encryption and decryption.  This
 * is a low-level class.  Use a cipher mode to do bulk encryption.
 *
 * @constructor
 * @param {Array} key The key as an array of 4, 6 or 8 words.
 *
 * @class Advanced Encryption Standard (low-level interface)
 */
sjcl.cipher.aes = function (key) {
  if (!this._tables[0][0][0]) {
    this._precompute();
  }
  
  var i, j, tmp,
    encKey, decKey,
    sbox = this._tables[0][4], decTable = this._tables[1],
    keyLen = key.length, rcon = 1;
  
  if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
    throw new sjcl.exception.invalid("invalid aes key size");
  }
  
  this._key = [encKey = key.slice(0), decKey = []];
  
  // schedule encryption keys
  for (i = keyLen; i < 4 * keyLen + 28; i++) {
    tmp = encKey[i-1];
    
    // apply sbox
    if (i%keyLen === 0 || (keyLen === 8 && i%keyLen === 4)) {
      tmp = sbox[tmp>>>24]<<24 ^ sbox[tmp>>16&255]<<16 ^ sbox[tmp>>8&255]<<8 ^ sbox[tmp&255];
      
      // shift rows and add rcon
      if (i%keyLen === 0) {
        tmp = tmp<<8 ^ tmp>>>24 ^ rcon<<24;
        rcon = rcon<<1 ^ (rcon>>7)*283;
      }
    }
    
    encKey[i] = encKey[i-keyLen] ^ tmp;
  }
  
  // schedule decryption keys
  for (j = 0; i; j++, i--) {
    tmp = encKey[j&3 ? i : i - 4];
    if (i<=4 || j<4) {
      decKey[j] = tmp;
    } else {
      decKey[j] = decTable[0][sbox[tmp>>>24      ]] ^
                  decTable[1][sbox[tmp>>16  & 255]] ^
                  decTable[2][sbox[tmp>>8   & 255]] ^
                  decTable[3][sbox[tmp      & 255]];
    }
  }
};

sjcl.cipher.aes.prototype = {
  // public
  /* Something like this might appear here eventually
  name: "AES",
  blockSize: 4,
  keySizes: [4,6,8],
  */
  
  /**
   * Encrypt an array of 4 big-endian words.
   * @param {Array} data The plaintext.
   * @return {Array} The ciphertext.
   */
  encrypt:function (data) { return this._crypt(data,0); },
  
  /**
   * Decrypt an array of 4 big-endian words.
   * @param {Array} data The ciphertext.
   * @return {Array} The plaintext.
   */
  decrypt:function (data) { return this._crypt(data,1); },
  
  /**
   * The expanded S-box and inverse S-box tables.  These will be computed
   * on the client so that we don't have to send them down the wire.
   *
   * There are two tables, _tables[0] is for encryption and
   * _tables[1] is for decryption.
   *
   * The first 4 sub-tables are the expanded S-box with MixColumns.  The
   * last (_tables[01][4]) is the S-box itself.
   *
   * @private
   */
  _tables: [[[],[],[],[],[]],[[],[],[],[],[]]],

  /**
   * Expand the S-box tables.
   *
   * @private
   */
  _precompute: function () {
   var encTable = this._tables[0], decTable = this._tables[1],
       sbox = encTable[4], sboxInv = decTable[4],
       i, x, xInv, d=[], th=[], x2, x4, x8, s, tEnc, tDec;

    // Compute double and third tables
   for (i = 0; i < 256; i++) {
     th[( d[i] = i<<1 ^ (i>>7)*283 )^i]=i;
   }
   
   for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
     // Compute sbox
     s = xInv ^ xInv<<1 ^ xInv<<2 ^ xInv<<3 ^ xInv<<4;
     s = s>>8 ^ s&255 ^ 99;
     sbox[x] = s;
     sboxInv[s] = x;
     
     // Compute MixColumns
     x8 = d[x4 = d[x2 = d[x]]];
     tDec = x8*0x1010101 ^ x4*0x10001 ^ x2*0x101 ^ x*0x1010100;
     tEnc = d[s]*0x101 ^ s*0x1010100;
     
     for (i = 0; i < 4; i++) {
       encTable[i][x] = tEnc = tEnc<<24 ^ tEnc>>>8;
       decTable[i][s] = tDec = tDec<<24 ^ tDec>>>8;
     }
   }
   
   // Compactify.  Considerable speedup on Firefox.
   for (i = 0; i < 5; i++) {
     encTable[i] = encTable[i].slice(0);
     decTable[i] = decTable[i].slice(0);
   }
  },
  
  /**
   * Encryption and decryption core.
   * @param {Array} input Four words to be encrypted or decrypted.
   * @param dir The direction, 0 for encrypt and 1 for decrypt.
   * @return {Array} The four encrypted or decrypted words.
   * @private
   */
  _crypt:function (input, dir) {
    if (input.length !== 4) {
      throw new sjcl.exception.invalid("invalid aes block size");
    }
    
    var key = this._key[dir],
        // state variables a,b,c,d are loaded with pre-whitened data
        a = input[0]           ^ key[0],
        b = input[dir ? 3 : 1] ^ key[1],
        c = input[2]           ^ key[2],
        d = input[dir ? 1 : 3] ^ key[3],
        a2, b2, c2,
        
        nInnerRounds = key.length/4 - 2,
        i,
        kIndex = 4,
        out = [0,0,0,0],
        table = this._tables[dir],
        
        // load up the tables
        t0    = table[0],
        t1    = table[1],
        t2    = table[2],
        t3    = table[3],
        sbox  = table[4];
 
    // Inner rounds.  Cribbed from OpenSSL.
    for (i = 0; i < nInnerRounds; i++) {
      a2 = t0[a>>>24] ^ t1[b>>16 & 255] ^ t2[c>>8 & 255] ^ t3[d & 255] ^ key[kIndex];
      b2 = t0[b>>>24] ^ t1[c>>16 & 255] ^ t2[d>>8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
      c2 = t0[c>>>24] ^ t1[d>>16 & 255] ^ t2[a>>8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
      d  = t0[d>>>24] ^ t1[a>>16 & 255] ^ t2[b>>8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
      kIndex += 4;
      a=a2; b=b2; c=c2;
    }
        
    // Last round.
    for (i = 0; i < 4; i++) {
      out[dir ? 3&-i : i] =
        sbox[a>>>24      ]<<24 ^ 
        sbox[b>>16  & 255]<<16 ^
        sbox[c>>8   & 255]<<8  ^
        sbox[d      & 255]     ^
        key[kIndex++];
      a2=a; a=b; b=c; c=d; d=a2;
    }
    
    return out;
  }
};

/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace Arrays of bits, encoded as arrays of Numbers.
 *
 * @description
 * <p>
 * These objects are the currency accepted by SJCL's crypto functions.
 * </p>
 *
 * <p>
 * Most of our crypto primitives operate on arrays of 4-byte words internally,
 * but many of them can take arguments that are not a multiple of 4 bytes.
 * This library encodes arrays of bits (whose size need not be a multiple of 8
 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
 * array of words, 32 bits at a time.  Since the words are double-precision
 * floating point numbers, they fit some extra data.  We use this (in a private,
 * possibly-changing manner) to encode the number of bits actually  present
 * in the last word of the array.
 * </p>
 *
 * <p>
 * Because bitwise ops clear this out-of-band data, these arrays can be passed
 * to ciphers like AES which want arrays of words.
 * </p>
 */
sjcl.bitArray = {
  /**
   * Array slices in units of bits.
   * @param {bitArray} a The array to slice.
   * @param {Number} bstart The offset to the start of the slice, in bits.
   * @param {Number} bend The offset to the end of the slice, in bits.  If this is undefined,
   * slice until the end of the array.
   * @return {bitArray} The requested slice.
   */
  bitSlice: function (a, bstart, bend) {
    a = sjcl.bitArray._shiftRight(a.slice(bstart/32), 32 - (bstart & 31)).slice(1);
    return (bend === undefined) ? a : sjcl.bitArray.clamp(a, bend-bstart);
  },

  /**
   * Extract a number packed into a bit array.
   * @param {bitArray} a The array to slice.
   * @param {Number} bstart The offset to the start of the slice, in bits.
   * @param {Number} length The length of the number to extract.
   * @return {Number} The requested slice.
   */
  extract: function(a, bstart, blength) {
    // FIXME: this Math.floor is not necessary at all, but for some reason
    // seems to suppress a bug in the Chromium JIT.
    var x, sh = Math.floor((-bstart-blength) & 31);
    if ((bstart + blength - 1 ^ bstart) & -32) {
      // it crosses a boundary
      x = (a[bstart/32|0] << (32 - sh)) ^ (a[bstart/32+1|0] >>> sh);
    } else {
      // within a single word
      x = a[bstart/32|0] >>> sh;
    }
    return x & ((1<<blength) - 1);
  },

  /**
   * Concatenate two bit arrays.
   * @param {bitArray} a1 The first array.
   * @param {bitArray} a2 The second array.
   * @return {bitArray} The concatenation of a1 and a2.
   */
  concat: function (a1, a2) {
    if (a1.length === 0 || a2.length === 0) {
      return a1.concat(a2);
    }
    
    var out, i, last = a1[a1.length-1], shift = sjcl.bitArray.getPartial(last);
    if (shift === 32) {
      return a1.concat(a2);
    } else {
      return sjcl.bitArray._shiftRight(a2, shift, last|0, a1.slice(0,a1.length-1));
    }
  },

  /**
   * Find the length of an array of bits.
   * @param {bitArray} a The array.
   * @return {Number} The length of a, in bits.
   */
  bitLength: function (a) {
    var l = a.length, x;
    if (l === 0) { return 0; }
    x = a[l - 1];
    return (l-1) * 32 + sjcl.bitArray.getPartial(x);
  },

  /**
   * Truncate an array.
   * @param {bitArray} a The array.
   * @param {Number} len The length to truncate to, in bits.
   * @return {bitArray} A new array, truncated to len bits.
   */
  clamp: function (a, len) {
    if (a.length * 32 < len) { return a; }
    a = a.slice(0, Math.ceil(len / 32));
    var l = a.length;
    len = len & 31;
    if (l > 0 && len) {
      a[l-1] = sjcl.bitArray.partial(len, a[l-1] & 0x80000000 >> (len-1), 1);
    }
    return a;
  },

  /**
   * Make a partial word for a bit array.
   * @param {Number} len The number of bits in the word.
   * @param {Number} x The bits.
   * @param {Number} [0] _end Pass 1 if x has already been shifted to the high side.
   * @return {Number} The partial word.
   */
  partial: function (len, x, _end) {
    if (len === 32) { return x; }
    return (_end ? x|0 : x << (32-len)) + len * 0x10000000000;
  },

  /**
   * Get the number of bits used by a partial word.
   * @param {Number} x The partial word.
   * @return {Number} The number of bits used by the partial word.
   */
  getPartial: function (x) {
    return Math.round(x/0x10000000000) || 32;
  },

  /**
   * Compare two arrays for equality in a predictable amount of time.
   * @param {bitArray} a The first array.
   * @param {bitArray} b The second array.
   * @return {boolean} true if a == b; false otherwise.
   */
  equal: function (a, b) {
    if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
      return false;
    }
    var x = 0, i;
    for (i=0; i<a.length; i++) {
      x |= a[i]^b[i];
    }
    return (x === 0);
  },

  /** Shift an array right.
   * @param {bitArray} a The array to shift.
   * @param {Number} shift The number of bits to shift.
   * @param {Number} [carry=0] A byte to carry in
   * @param {bitArray} [out=[]] An array to prepend to the output.
   * @private
   */
  _shiftRight: function (a, shift, carry, out) {
    var i, last2=0, shift2;
    if (out === undefined) { out = []; }
    
    for (; shift >= 32; shift -= 32) {
      out.push(carry);
      carry = 0;
    }
    if (shift === 0) {
      return out.concat(a);
    }
    
    for (i=0; i<a.length; i++) {
      out.push(carry | a[i]>>>shift);
      carry = a[i] << (32-shift);
    }
    last2 = a.length ? a[a.length-1] : 0;
    shift2 = sjcl.bitArray.getPartial(last2);
    out.push(sjcl.bitArray.partial(shift+shift2 & 31, (shift + shift2 > 32) ? carry : out.pop(),1));
    return out;
  },
  
  /** xor a block of 4 words together.
   * @private
   */
  _xor4: function(x,y) {
    return [x[0]^y[0],x[1]^y[1],x[2]^y[2],x[3]^y[3]];
  }
};
/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */
 
/** @namespace UTF-8 strings */
sjcl.codec.utf8String = {
  /** Convert from a bitArray to a UTF-8 string. */
  fromBits: function (arr) {
    var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out += String.fromCharCode(tmp >>> 24);
      tmp <<= 8;
    }
    return decodeURIComponent(escape(out));
  },
  
  /** Convert from a UTF-8 string to a bitArray. */
  toBits: function (str) {
    str = unescape(encodeURIComponent(str));
    var out = [], i, tmp=0;
    for (i=0; i<str.length; i++) {
      tmp = tmp << 8 | str.charCodeAt(i);
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
};
/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace Hexadecimal */
sjcl.codec.hex = {
  /** Convert from a bitArray to a hex string. */
  fromBits: function (arr) {
    var out = "", i, x;
    for (i=0; i<arr.length; i++) {
      out += ((arr[i]|0)+0xF00000000000).toString(16).substr(4);
    }
    return out.substr(0, sjcl.bitArray.bitLength(arr)/4);//.replace(/(.{8})/g, "$1 ");
  },
  /** Convert from a hex string to a bitArray. */
  toBits: function (str) {
    var i, out=[], len;
    str = str.replace(/\s|0x/g, "");
    len = str.length;
    str = str + "00000000";
    for (i=0; i<str.length; i+=8) {
      out.push(parseInt(str.substr(i,8),16)^0);
    }
    return sjcl.bitArray.clamp(out, len*4);
  }
};

/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace Base64 encoding/decoding */
sjcl.codec.base64 = {
  /** The base64 alphabet.
   * @private
   */
  _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  
  /** Convert from a bitArray to a base64 string. */
  fromBits: function (arr, _noEquals, _url) {
    var out = "", i, bits=0, c = sjcl.codec.base64._chars, ta=0, bl = sjcl.bitArray.bitLength(arr);
    if (_url) {
      c = c.substr(0,62) + '-_';
    }
    for (i=0; out.length * 6 < bl; ) {
      out += c.charAt((ta ^ arr[i]>>>bits) >>> 26);
      if (bits < 6) {
        ta = arr[i] << (6-bits);
        bits += 26;
        i++;
      } else {
        ta <<= 6;
        bits -= 6;
      }
    }
    while ((out.length & 3) && !_noEquals) { out += "="; }
    return out;
  },
  
  /** Convert from a base64 string to a bitArray */
  toBits: function(str, _url) {
    str = str.replace(/\s|=/g,'');
    var out = [], i, bits=0, c = sjcl.codec.base64._chars, ta=0, x;
    if (_url) {
      c = c.substr(0,62) + '-_';
    }
    for (i=0; i<str.length; i++) {
      x = c.indexOf(str.charAt(i));
      if (x < 0) {
        throw new sjcl.exception.invalid("this isn't base64!");
      }
      if (bits > 26) {
        bits -= 26;
        out.push(ta ^ x>>>bits);
        ta  = x << (32-bits);
      } else {
        bits += 6;
        ta ^= x << (32-bits);
      }
    }
    if (bits&56) {
      out.push(sjcl.bitArray.partial(bits&56, ta, 1));
    }
    return out;
  }
};

sjcl.codec.base64url = {
  fromBits: function (arr) { return sjcl.codec.base64.fromBits(arr,1,1); },
  toBits: function (str) { return sjcl.codec.base64.toBits(str,1); }
};
/** @fileOverview Javascript SHA-256 implementation.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * Special thanks to Aldo Cortesi for pointing out several bugs in
 * this code.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Context for a SHA-256 operation in progress.
 * @constructor
 * @class Secure Hash Algorithm, 256 bits.
 */
sjcl.hash.sha256 = function (hash) {
  if (!this._key[0]) { this._precompute(); }
  if (hash) {
    this._h = hash._h.slice(0);
    this._buffer = hash._buffer.slice(0);
    this._length = hash._length;
  } else {
    this.reset();
  }
};

/**
 * Hash a string or an array of words.
 * @static
 * @param {bitArray|String} data the data to hash.
 * @return {bitArray} The hash value, an array of 16 big-endian words.
 */
sjcl.hash.sha256.hash = function (data) {
  return (new sjcl.hash.sha256()).update(data).finalize();
};

sjcl.hash.sha256.prototype = {
  /**
   * The hash's block size, in bits.
   * @constant
   */
  blockSize: 512,
   
  /**
   * Reset the hash state.
   * @return this
   */
  reset:function () {
    this._h = this._init.slice(0);
    this._buffer = [];
    this._length = 0;
    return this;
  },
  
  /**
   * Input several words to the hash.
   * @param {bitArray|String} data the data to hash.
   * @return this
   */
  update: function (data) {
    if (typeof data === "string") {
      data = sjcl.codec.utf8String.toBits(data);
    }
    var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data),
        ol = this._length,
        nl = this._length = ol + sjcl.bitArray.bitLength(data);
    for (i = 512+ol & -512; i <= nl; i+= 512) {
      this._block(b.splice(0,16));
    }
    return this;
  },
  
  /**
   * Complete hashing and output the hash value.
   * @return {bitArray} The hash value, an array of 8 big-endian words.
   */
  finalize:function () {
    var i, b = this._buffer, h = this._h;

    // Round out and push the buffer
    b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1,1)]);
    
    // Round out the buffer to a multiple of 16 words, less the 2 length words.
    for (i = b.length + 2; i & 15; i++) {
      b.push(0);
    }
    
    // append the length
    b.push(Math.floor(this._length / 0x100000000));
    b.push(this._length | 0);

    while (b.length) {
      this._block(b.splice(0,16));
    }

    this.reset();
    return h;
  },

  /**
   * The SHA-256 initialization vector, to be precomputed.
   * @private
   */
  _init:[],
  /*
  _init:[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],
  */
  
  /**
   * The SHA-256 hash key, to be precomputed.
   * @private
   */
  _key:[],
  /*
  _key:
    [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
     0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
     0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
     0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
     0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
     0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
     0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
     0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
  */


  /**
   * Function to precompute _init and _key.
   * @private
   */
  _precompute: function () {
    var i = 0, prime = 2, factor;

    function frac(x) { return (x-Math.floor(x)) * 0x100000000 | 0; }

    outer: for (; i<64; prime++) {
      for (factor=2; factor*factor <= prime; factor++) {
        if (prime % factor === 0) {
          // not a prime
          continue outer;
        }
      }
      
      if (i<8) {
        this._init[i] = frac(Math.pow(prime, 1/2));
      }
      this._key[i] = frac(Math.pow(prime, 1/3));
      i++;
    }
  },
  
  /**
   * Perform one cycle of SHA-256.
   * @param {bitArray} words one block of words.
   * @private
   */
  _block:function (words) {  
    var i, tmp, a, b,
      w = words.slice(0),
      h = this._h,
      k = this._key,
      h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3],
      h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];

    /* Rationale for placement of |0 :
     * If a value can overflow is original 32 bits by a factor of more than a few
     * million (2^23 ish), there is a possibility that it might overflow the
     * 53-bit mantissa and lose precision.
     *
     * To avoid this, we clamp back to 32 bits by |'ing with 0 on any value that
     * propagates around the loop, and on the hash state h[].  I don't believe
     * that the clamps on h4 and on h0 are strictly necessary, but it's close
     * (for h4 anyway), and better safe than sorry.
     *
     * The clamps on h[] are necessary for the output to be correct even in the
     * common case and for short inputs.
     */
    for (i=0; i<64; i++) {
      // load up the input word for this round
      if (i<16) {
        tmp = w[i];
      } else {
        a   = w[(i+1 ) & 15];
        b   = w[(i+14) & 15];
        tmp = w[i&15] = ((a>>>7  ^ a>>>18 ^ a>>>3  ^ a<<25 ^ a<<14) + 
                         (b>>>17 ^ b>>>19 ^ b>>>10 ^ b<<15 ^ b<<13) +
                         w[i&15] + w[(i+9) & 15]) | 0;
      }
      
      tmp = (tmp + h7 + (h4>>>6 ^ h4>>>11 ^ h4>>>25 ^ h4<<26 ^ h4<<21 ^ h4<<7) +  (h6 ^ h4&(h5^h6)) + k[i]); // | 0;
      
      // shift register
      h7 = h6; h6 = h5; h5 = h4;
      h4 = h3 + tmp | 0;
      h3 = h2; h2 = h1; h1 = h0;

      h0 = (tmp +  ((h1&h2) ^ (h3&(h1^h2))) + (h1>>>2 ^ h1>>>13 ^ h1>>>22 ^ h1<<30 ^ h1<<19 ^ h1<<10)) | 0;
    }

    h[0] = h[0]+h0 | 0;
    h[1] = h[1]+h1 | 0;
    h[2] = h[2]+h2 | 0;
    h[3] = h[3]+h3 | 0;
    h[4] = h[4]+h4 | 0;
    h[5] = h[5]+h5 | 0;
    h[6] = h[6]+h6 | 0;
    h[7] = h[7]+h7 | 0;
  }
};


/** @fileOverview CCM mode implementation.
 *
 * Special thanks to Roy Nicholson for pointing out a bug in our
 * implementation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace CTR mode with CBC MAC. */
sjcl.mode.ccm = {
  /** The name of the mode.
   * @constant
   */
  name: "ccm",
  
  /** Encrypt in CCM mode.
   * @static
   * @param {Object} prf The pseudorandom function.  It must have a block size of 16 bytes.
   * @param {bitArray} plaintext The plaintext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] The authenticated data.
   * @param {Number} [tlen=64] the desired tag length, in bits.
   * @return {bitArray} The encrypted data, an array of bytes.
   */
  encrypt: function(prf, plaintext, iv, adata, tlen) {
    var L, i, out = plaintext.slice(0), tag, w=sjcl.bitArray, ivl = w.bitLength(iv) / 8, ol = w.bitLength(out) / 8;
    tlen = tlen || 64;
    adata = adata || [];
    
    if (ivl < 7) {
      throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
    }
    
    // compute the length of the length
    for (L=2; L<4 && ol >>> 8*L; L++) {}
    if (L < 15 - ivl) { L = 15-ivl; }
    iv = w.clamp(iv,8*(15-L));
    
    // compute the tag
    tag = sjcl.mode.ccm._computeTag(prf, plaintext, iv, adata, tlen, L);
    
    // encrypt
    out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
    
    return w.concat(out.data, out.tag);
  },
  
  /** Decrypt in CCM mode.
   * @static
   * @param {Object} prf The pseudorandom function.  It must have a block size of 16 bytes.
   * @param {bitArray} ciphertext The ciphertext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [[]] adata The authenticated data.
   * @param {Number} [64] tlen the desired tag length, in bits.
   * @return {bitArray} The decrypted data.
   */
  decrypt: function(prf, ciphertext, iv, adata, tlen) {
    tlen = tlen || 64;
    adata = adata || [];
    var L, i, 
        w=sjcl.bitArray,
        ivl = w.bitLength(iv) / 8,
        ol = w.bitLength(ciphertext), 
        out = w.clamp(ciphertext, ol - tlen),
        tag = w.bitSlice(ciphertext, ol - tlen), tag2;
    

    ol = (ol - tlen) / 8;
        
    if (ivl < 7) {
      throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
    }
    
    // compute the length of the length
    for (L=2; L<4 && ol >>> 8*L; L++) {}
    if (L < 15 - ivl) { L = 15-ivl; }
    iv = w.clamp(iv,8*(15-L));
    
    // decrypt
    out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
    
    // check the tag
    tag2 = sjcl.mode.ccm._computeTag(prf, out.data, iv, adata, tlen, L);
    if (!w.equal(out.tag, tag2)) {
      throw new sjcl.exception.corrupt("ccm: tag doesn't match");
    }
    
    return out.data;
  },

  /* Compute the (unencrypted) authentication tag, according to the CCM specification
   * @param {Object} prf The pseudorandom function.
   * @param {bitArray} plaintext The plaintext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} adata The authenticated data.
   * @param {Number} tlen the desired tag length, in bits.
   * @return {bitArray} The tag, but not yet encrypted.
   * @private
   */
  _computeTag: function(prf, plaintext, iv, adata, tlen, L) {
    // compute B[0]
    var q, mac, field = 0, offset = 24, tmp, i, macData = [], w=sjcl.bitArray, xor = w._xor4;

    tlen /= 8;
  
    // check tag length and message length
    if (tlen % 2 || tlen < 4 || tlen > 16) {
      throw new sjcl.exception.invalid("ccm: invalid tag length");
    }
  
    if (adata.length > 0xFFFFFFFF || plaintext.length > 0xFFFFFFFF) {
      // I don't want to deal with extracting high words from doubles.
      throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
    }

    // mac the flags
    mac = [w.partial(8, (adata.length ? 1<<6 : 0) | (tlen-2) << 2 | L-1)];

    // mac the iv and length
    mac = w.concat(mac, iv);
    mac[3] |= w.bitLength(plaintext)/8;
    mac = prf.encrypt(mac);
    
  
    if (adata.length) {
      // mac the associated data.  start with its length...
      tmp = w.bitLength(adata)/8;
      if (tmp <= 0xFEFF) {
        macData = [w.partial(16, tmp)];
      } else if (tmp <= 0xFFFFFFFF) {
        macData = w.concat([w.partial(16,0xFFFE)], [tmp]);
      } // else ...
    
      // mac the data itself
      macData = w.concat(macData, adata);
      for (i=0; i<macData.length; i += 4) {
        mac = prf.encrypt(xor(mac, macData.slice(i,i+4).concat([0,0,0])));
      }
    }
  
    // mac the plaintext
    for (i=0; i<plaintext.length; i+=4) {
      mac = prf.encrypt(xor(mac, plaintext.slice(i,i+4).concat([0,0,0])));
    }

    return w.clamp(mac, tlen * 8);
  },

  /** CCM CTR mode.
   * Encrypt or decrypt data and tag with the prf in CCM-style CTR mode.
   * May mutate its arguments.
   * @param {Object} prf The PRF.
   * @param {bitArray} data The data to be encrypted or decrypted.
   * @param {bitArray} iv The initialization vector.
   * @param {bitArray} tag The authentication tag.
   * @param {Number} tlen The length of th etag, in bits.
   * @param {Number} L The CCM L value.
   * @return {Object} An object with data and tag, the en/decryption of data and tag values.
   * @private
   */
  _ctrMode: function(prf, data, iv, tag, tlen, L) {
    var enc, i, w=sjcl.bitArray, xor = w._xor4, ctr, b, l = data.length, bl=w.bitLength(data);

    // start the ctr
    ctr = w.concat([w.partial(8,L-1)],iv).concat([0,0,0]).slice(0,4);
    
    // en/decrypt the tag
    tag = w.bitSlice(xor(tag,prf.encrypt(ctr)), 0, tlen);
  
    // en/decrypt the data
    if (!l) { return {tag:tag, data:[]}; }
    
    for (i=0; i<l; i+=4) {
      ctr[3]++;
      enc = prf.encrypt(ctr);
      data[i]   ^= enc[0];
      data[i+1] ^= enc[1];
      data[i+2] ^= enc[2];
      data[i+3] ^= enc[3];
    }
    return { tag:tag, data:w.clamp(data,bl) };
  }
};
/** @fileOverview OCB 2.0 implementation
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** @namespace
 * Phil Rogaway's Offset CodeBook mode, version 2.0.
 * May be covered by US and international patents.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */
sjcl.mode.ocb2 = {
  /** The name of the mode.
   * @constant
   */
  name: "ocb2",
  
  /** Encrypt in OCB mode, version 2.0.
   * @param {Object} prp The block cipher.  It must have a block size of 16 bytes.
   * @param {bitArray} plaintext The plaintext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] The authenticated data.
   * @param {Number} [tlen=64] the desired tag length, in bits.
   * @param [false] premac 1 if the authentication data is pre-macced with PMAC.
   * @return The encrypted data, an array of bytes.
   * @throws {sjcl.exception.invalid} if the IV isn't exactly 128 bits.
   */
  encrypt: function(prp, plaintext, iv, adata, tlen, premac) {
    if (sjcl.bitArray.bitLength(iv) !== 128) {
      throw new sjcl.exception.invalid("ocb iv must be 128 bits");
    }
    var i,
        times2 = sjcl.mode.ocb2._times2,
        w = sjcl.bitArray,
        xor = w._xor4,
        checksum = [0,0,0,0],
        delta = times2(prp.encrypt(iv)),
        bi, bl,
        output = [],
        pad;
        
    adata = adata || [];
    tlen  = tlen || 64;
  
    for (i=0; i+4 < plaintext.length; i+=4) {
      /* Encrypt a non-final block */
      bi = plaintext.slice(i,i+4);
      checksum = xor(checksum, bi);
      output = output.concat(xor(delta,prp.encrypt(xor(delta, bi))));
      delta = times2(delta);
    }
    
    /* Chop out the final block */
    bi = plaintext.slice(i);
    bl = w.bitLength(bi);
    pad = prp.encrypt(xor(delta,[0,0,0,bl]));
    bi = w.clamp(xor(bi.concat([0,0,0]),pad), bl);
    
    /* Checksum the final block, and finalize the checksum */
    checksum = xor(checksum,xor(bi.concat([0,0,0]),pad));
    checksum = prp.encrypt(xor(checksum,xor(delta,times2(delta))));
    
    /* MAC the header */
    if (adata.length) {
      checksum = xor(checksum, premac ? adata : sjcl.mode.ocb2.pmac(prp, adata));
    }
    
    return output.concat(w.concat(bi, w.clamp(checksum, tlen)));
  },
  
  /** Decrypt in OCB mode.
   * @param {Object} prp The block cipher.  It must have a block size of 16 bytes.
   * @param {bitArray} ciphertext The ciphertext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] The authenticated data.
   * @param {Number} [tlen=64] the desired tag length, in bits.
   * @param {boolean} [premac=false] true if the authentication data is pre-macced with PMAC.
   * @return The decrypted data, an array of bytes.
   * @throws {sjcl.exception.invalid} if the IV isn't exactly 128 bits.
   * @throws {sjcl.exception.corrupt} if if the message is corrupt.
   */
  decrypt: function(prp, ciphertext, iv, adata, tlen, premac) {
    if (sjcl.bitArray.bitLength(iv) !== 128) {
      throw new sjcl.exception.invalid("ocb iv must be 128 bits");
    }
    tlen  = tlen || 64;
    var i,
        times2 = sjcl.mode.ocb2._times2,
        w = sjcl.bitArray,
        xor = w._xor4,
        checksum = [0,0,0,0],
        delta = times2(prp.encrypt(iv)),
        bi, bl,
        len = sjcl.bitArray.bitLength(ciphertext) - tlen,
        output = [],
        pad;
        
    adata = adata || [];
  
    for (i=0; i+4 < len/32; i+=4) {
      /* Decrypt a non-final block */
      bi = xor(delta, prp.decrypt(xor(delta, ciphertext.slice(i,i+4))));
      checksum = xor(checksum, bi);
      output = output.concat(bi);
      delta = times2(delta);
    }
    
    /* Chop out and decrypt the final block */
    bl = len-i*32;
    pad = prp.encrypt(xor(delta,[0,0,0,bl]));
    bi = xor(pad, w.clamp(ciphertext.slice(i),bl).concat([0,0,0]));
    
    /* Checksum the final block, and finalize the checksum */
    checksum = xor(checksum, bi);
    checksum = prp.encrypt(xor(checksum, xor(delta, times2(delta))));
    
    /* MAC the header */
    if (adata.length) {
      checksum = xor(checksum, premac ? adata : sjcl.mode.ocb2.pmac(prp, adata));
    }
    
    if (!w.equal(w.clamp(checksum, tlen), w.bitSlice(ciphertext, len))) {
      throw new sjcl.exception.corrupt("ocb: tag doesn't match");
    }
    
    return output.concat(w.clamp(bi,bl));
  },
  
  /** PMAC authentication for OCB associated data.
   * @param {Object} prp The block cipher.  It must have a block size of 16 bytes.
   * @param {bitArray} adata The authenticated data.
   */
  pmac: function(prp, adata) {
    var i,
        times2 = sjcl.mode.ocb2._times2,
        w = sjcl.bitArray,
        xor = w._xor4,
        checksum = [0,0,0,0],
        delta = prp.encrypt([0,0,0,0]),
        bi;
        
    delta = xor(delta,times2(times2(delta)));
 
    for (i=0; i+4<adata.length; i+=4) {
      delta = times2(delta);
      checksum = xor(checksum, prp.encrypt(xor(delta, adata.slice(i,i+4))));
    }
    
    bi = adata.slice(i);
    if (w.bitLength(bi) < 128) {
      delta = xor(delta,times2(delta));
      bi = w.concat(bi,[0x80000000|0,0,0,0]);
    }
    checksum = xor(checksum, bi);
    return prp.encrypt(xor(times2(xor(delta,times2(delta))), checksum));
  },
  
  /** Double a block of words, OCB style.
   * @private
   */
  _times2: function(x) {
    return [x[0]<<1 ^ x[1]>>>31,
            x[1]<<1 ^ x[2]>>>31,
            x[2]<<1 ^ x[3]>>>31,
            x[3]<<1 ^ (x[0]>>>31)*0x87];
  }
};
/** @fileOverview GCM mode implementation.
 *
 * @author Juho Vähä-Herttua
 */

/** @namespace Galois/Counter mode. */
sjcl.mode.gcm = {
  /** The name of the mode.
   * @constant
   */
  name: "gcm",
  
  /** Encrypt in GCM mode.
   * @static
   * @param {Object} prf The pseudorandom function.  It must have a block size of 16 bytes.
   * @param {bitArray} plaintext The plaintext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] The authenticated data.
   * @param {Number} [tlen=128] The desired tag length, in bits.
   * @return {bitArray} The encrypted data, an array of bytes.
   */
  encrypt: function (prf, plaintext, iv, adata, tlen) {
    var out, data = plaintext.slice(0), w=sjcl.bitArray;
    tlen = tlen || 128;
    adata = adata || [];

    // encrypt and tag
    out = sjcl.mode.gcm._ctrMode(true, prf, data, adata, iv, tlen);

    return w.concat(out.data, out.tag);
  },
  
  /** Decrypt in GCM mode.
   * @static
   * @param {Object} prf The pseudorandom function.  It must have a block size of 16 bytes.
   * @param {bitArray} ciphertext The ciphertext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] The authenticated data.
   * @param {Number} [tlen=128] The desired tag length, in bits.
   * @return {bitArray} The decrypted data.
   */
  decrypt: function (prf, ciphertext, iv, adata, tlen) {
    var out, data = ciphertext.slice(0), tag, w=sjcl.bitArray, l=w.bitLength(data);
    tlen = tlen || 128;
    adata = adata || [];

    // Slice tag out of data
    if (tlen <= l) {
      tag = w.bitSlice(data, l-tlen);
      data = w.bitSlice(data, 0, l-tlen);
    } else {
      tag = data;
      data = [];
    }

    // decrypt and tag
    out = sjcl.mode.gcm._ctrMode(false, prf, data, adata, iv, tlen);

    if (!w.equal(out.tag, tag)) {
      throw new sjcl.exception.corrupt("gcm: tag doesn't match");
    }
    return out.data;
  },

  /* Compute the galois multiplication of X and Y
   * @private
   */
  _galoisMultiply: function (x, y) {
    var i, j, xi, Zi, Vi, lsb_Vi, w=sjcl.bitArray, xor=w._xor4;

    Zi = [0,0,0,0];
    Vi = y.slice(0);

    // Block size is 128 bits, run 128 times to get Z_128
    for (i=0; i<128; i++) {
      xi = (x[Math.floor(i/32)] & (1 << (31-i%32))) !== 0;
      if (xi) {
        // Z_i+1 = Z_i ^ V_i
        Zi = xor(Zi, Vi);
      }

      // Store the value of LSB(V_i)
      lsb_Vi = (Vi[3] & 1) !== 0;

      // V_i+1 = V_i >> 1
      for (j=3; j>0; j--) {
        Vi[j] = (Vi[j] >>> 1) | ((Vi[j-1]&1) << 31);
      }
      Vi[0] = Vi[0] >>> 1;

      // If LSB(V_i) is 1, V_i+1 = (V_i >> 1) ^ R
      if (lsb_Vi) {
        Vi[0] = Vi[0] ^ (0xe1 << 24);
      }
    }
    return Zi;
  },

  _ghash: function(H, Y0, data) {
    var Yi, i, l = data.length;

    Yi = Y0.slice(0);
    for (i=0; i<l; i+=4) {
      Yi[0] ^= 0xffffffff&data[i];
      Yi[1] ^= 0xffffffff&data[i+1];
      Yi[2] ^= 0xffffffff&data[i+2];
      Yi[3] ^= 0xffffffff&data[i+3];
      Yi = sjcl.mode.gcm._galoisMultiply(Yi, H);
    }
    return Yi;
  },

  /** GCM CTR mode.
   * Encrypt or decrypt data and tag with the prf in GCM-style CTR mode.
   * @param {Boolean} encrypt True if encrypt, false if decrypt.
   * @param {Object} prf The PRF.
   * @param {bitArray} data The data to be encrypted or decrypted.
   * @param {bitArray} iv The initialization vector.
   * @param {bitArray} adata The associated data to be tagged.
   * @param {Number} tlen The length of the tag, in bits.
   */
  _ctrMode: function(encrypt, prf, data, adata, iv, tlen) {
    var H, J0, S0, enc, i, ctr, tag, last, l, bl, abl, ivbl, w=sjcl.bitArray, xor=w._xor4;

    // Calculate data lengths
    l = data.length;
    bl = w.bitLength(data);
    abl = w.bitLength(adata);
    ivbl = w.bitLength(iv);

    // Calculate the parameters
    H = prf.encrypt([0,0,0,0]);
    if (ivbl === 96) {
      J0 = iv.slice(0);
      J0 = w.concat(J0, [1]);
    } else {
      J0 = sjcl.mode.gcm._ghash(H, [0,0,0,0], iv);
      J0 = sjcl.mode.gcm._ghash(H, J0, [0,0,Math.floor(ivbl/0x100000000),ivbl&0xffffffff]);
    }
    S0 = sjcl.mode.gcm._ghash(H, [0,0,0,0], adata);

    // Initialize ctr and tag
    ctr = J0.slice(0);
    tag = S0.slice(0);

    // If decrypting, calculate hash
    if (!encrypt) {
      tag = sjcl.mode.gcm._ghash(H, S0, data);
    }

    // Encrypt all the data
    for (i=0; i<l; i+=4) {
       ctr[3]++;
       enc = prf.encrypt(ctr);
       data[i]   ^= enc[0];
       data[i+1] ^= enc[1];
       data[i+2] ^= enc[2];
       data[i+3] ^= enc[3];
    }
    data = w.clamp(data, bl);

    // If encrypting, calculate hash
    if (encrypt) {
      tag = sjcl.mode.gcm._ghash(H, S0, data);
    }

    // Calculate last block from bit lengths, ugly because bitwise operations are 32-bit
    last = [
      Math.floor(abl/0x100000000), abl&0xffffffff,
      Math.floor(bl/0x100000000), bl&0xffffffff
    ];

    // Calculate the final tag block
    tag = sjcl.mode.gcm._ghash(H, tag, last);
    enc = prf.encrypt(J0);
    tag[0] ^= enc[0];
    tag[1] ^= enc[1];
    tag[2] ^= enc[2];
    tag[3] ^= enc[3];

    return { tag:w.bitSlice(tag, 0, tlen), data:data };
  }
};
/** @fileOverview HMAC implementation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** HMAC with the specified hash function.
 * @constructor
 * @param {bitArray} key the key for HMAC.
 * @param {Object} [hash=sjcl.hash.sha256] The hash function to use.
 */
sjcl.misc.hmac = function (key, Hash) {
  this._hash = Hash = Hash || sjcl.hash.sha256;
  var exKey = [[],[]], i,
      bs = Hash.prototype.blockSize / 32;
  this._baseHash = [new Hash(), new Hash()];

  if (key.length > bs) {
    key = Hash.hash(key);
  }
  
  for (i=0; i<bs; i++) {
    exKey[0][i] = key[i]^0x36363636;
    exKey[1][i] = key[i]^0x5C5C5C5C;
  }
  
  this._baseHash[0].update(exKey[0]);
  this._baseHash[1].update(exKey[1]);
  this._resultHash = new Hash(this._baseHash[0]);
};

/** HMAC with the specified hash function.  Also called encrypt since it's a prf.
 * @param {bitArray|String} data The data to mac.
 */
sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function (data) {
  if (!this._updated) {
    this.update(data);
    return this.digest(data);
  } else {
    throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
  }
};

sjcl.misc.hmac.prototype.reset = function () {
  this._resultHash = new this._hash(this._baseHash[0]);
  this._updated = false;
};

sjcl.misc.hmac.prototype.update = function (data) {
  this._updated = true;
  this._resultHash.update(data);
};

sjcl.misc.hmac.prototype.digest = function () {
  var w = this._resultHash.finalize(), result = new (this._hash)(this._baseHash[1]).update(w).finalize();

  this.reset();

  return result;
};/** @fileOverview Password-based key-derivation function, version 2.0.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** Password-Based Key-Derivation Function, version 2.0.
 *
 * Generate keys from passwords using PBKDF2-HMAC-SHA256.
 *
 * This is the method specified by RSA's PKCS #5 standard.
 *
 * @param {bitArray|String} password  The password.
 * @param {bitArray|String} salt The salt.  Should have lots of entropy.
 * @param {Number} [count=1000] The number of iterations.  Higher numbers make the function slower but more secure.
 * @param {Number} [length] The length of the derived key.  Defaults to the
                            output size of the hash function.
 * @param {Object} [Prff=sjcl.misc.hmac] The pseudorandom function family.
 * @return {bitArray} the derived key.
 */
sjcl.misc.pbkdf2 = function (password, salt, count, length, Prff) {
  count = count || 1000;
  
  if (length < 0 || count < 0) {
    throw sjcl.exception.invalid("invalid params to pbkdf2");
  }
  
  if (typeof password === "string") {
    password = sjcl.codec.utf8String.toBits(password);
  }
  
  if (typeof salt === "string") {
    salt = sjcl.codec.utf8String.toBits(salt);
  }
  
  Prff = Prff || sjcl.misc.hmac;
  
  var prf = new Prff(password),
      u, ui, i, j, k, out = [], b = sjcl.bitArray;

  for (k = 1; 32 * out.length < (length || 1); k++) {
    u = ui = prf.encrypt(b.concat(salt,[k]));
    
    for (i=1; i<count; i++) {
      ui = prf.encrypt(ui);
      for (j=0; j<ui.length; j++) {
        u[j] ^= ui[j];
      }
    }
    
    out = out.concat(u);
  }

  if (length) { out = b.clamp(out, length); }

  return out;
};
/** @fileOverview Random number generator.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 * @author Michael Brooks
 */

/** @constructor
 * @class Random number generator
 * @description
 * <b>Use sjcl.random as a singleton for this class!</b>
 * <p>
 * This random number generator is a derivative of Ferguson and Schneier's
 * generator Fortuna.  It collects entropy from various events into several
 * pools, implemented by streaming SHA-256 instances.  It differs from
 * ordinary Fortuna in a few ways, though.
 * </p>
 *
 * <p>
 * Most importantly, it has an entropy estimator.  This is present because
 * there is a strong conflict here between making the generator available
 * as soon as possible, and making sure that it doesn't "run on empty".
 * In Fortuna, there is a saved state file, and the system is likely to have
 * time to warm up.
 * </p>
 *
 * <p>
 * Second, because users are unlikely to stay on the page for very long,
 * and to speed startup time, the number of pools increases logarithmically:
 * a new pool is created when the previous one is actually used for a reseed.
 * This gives the same asymptotic guarantees as Fortuna, but gives more
 * entropy to early reseeds.
 * </p>
 *
 * <p>
 * The entire mechanism here feels pretty klunky.  Furthermore, there are
 * several improvements that should be made, including support for
 * dedicated cryptographic functions that may be present in some browsers;
 * state files in local storage; cookies containing randomness; etc.  So
 * look for improvements in future versions.
 * </p>
 */
sjcl.prng = function(defaultParanoia) {
  
  /* private */
  this._pools                   = [new sjcl.hash.sha256()];
  this._poolEntropy             = [0];
  this._reseedCount             = 0;
  this._robins                  = {};
  this._eventId                 = 0;
  
  this._collectorIds            = {};
  this._collectorIdNext         = 0;
  
  this._strength                = 0;
  this._poolStrength            = 0;
  this._nextReseed              = 0;
  this._key                     = [0,0,0,0,0,0,0,0];
  this._counter                 = [0,0,0,0];
  this._cipher                  = undefined;
  this._defaultParanoia         = defaultParanoia;
  
  /* event listener stuff */
  this._collectorsStarted       = false;
  this._callbacks               = {progress: {}, seeded: {}};
  this._callbackI               = 0;
  
  /* constants */
  this._NOT_READY               = 0;
  this._READY                   = 1;
  this._REQUIRES_RESEED         = 2;

  this._MAX_WORDS_PER_BURST     = 65536;
  this._PARANOIA_LEVELS         = [0,48,64,96,128,192,256,384,512,768,1024];
  this._MILLISECONDS_PER_RESEED = 30000;
  this._BITS_PER_RESEED         = 80;
};
 
sjcl.prng.prototype = {
  /** Generate several random words, and return them in an array.
   * A word consists of 32 bits (4 bytes)
   * @param {Number} nwords The number of words to generate.
   */
  randomWords: function (nwords, paranoia) {
    var out = [], i, readiness = this.isReady(paranoia), g;
  
    if (readiness === this._NOT_READY) {
      throw new sjcl.exception.notReady("generator isn't seeded");
    } else if (readiness & this._REQUIRES_RESEED) {
      this._reseedFromPools(!(readiness & this._READY));
    }
  
    for (i=0; i<nwords; i+= 4) {
      if ((i+1) % this._MAX_WORDS_PER_BURST === 0) {
        this._gate();
      }
   
      g = this._gen4words();
      out.push(g[0],g[1],g[2],g[3]);
    }
    this._gate();
  
    return out.slice(0,nwords);
  },
  
  setDefaultParanoia: function (paranoia, allowZeroParanoia) {
    if (paranoia === 0 && allowZeroParanoia !== "Setting paranoia=0 will ruin your security; use it only for testing") {
      throw "Setting paranoia=0 will ruin your security; use it only for testing";
    }

    this._defaultParanoia = paranoia;
  },
  
  /**
   * Add entropy to the pools.
   * @param data The entropic value.  Should be a 32-bit integer, array of 32-bit integers, or string
   * @param {Number} estimatedEntropy The estimated entropy of data, in bits
   * @param {String} source The source of the entropy, eg "mouse"
   */
  addEntropy: function (data, estimatedEntropy, source) {
    source = source || "user";
  
    var id,
      i, tmp,
      t = (new Date()).valueOf(),
      robin = this._robins[source],
      oldReady = this.isReady(), err = 0, objName;
      
    id = this._collectorIds[source];
    if (id === undefined) { id = this._collectorIds[source] = this._collectorIdNext ++; }
      
    if (robin === undefined) { robin = this._robins[source] = 0; }
    this._robins[source] = ( this._robins[source] + 1 ) % this._pools.length;
  
    switch(typeof(data)) {
      
    case "number":
      if (estimatedEntropy === undefined) {
        estimatedEntropy = 1;
      }
      this._pools[robin].update([id,this._eventId++,1,estimatedEntropy,t,1,data|0]);
      break;
      
    case "object":
      objName = Object.prototype.toString.call(data);
      if (objName === "[object Uint32Array]") {
        tmp = [];
        for (i = 0; i < data.length; i++) {
          tmp.push(data[i]);
        }
        data = tmp;
      } else {
        if (objName !== "[object Array]") {
          err = 1;
        }
        for (i=0; i<data.length && !err; i++) {
          if (typeof(data[i]) !== "number") {
            err = 1;
          }
        }
      }
      if (!err) {
        if (estimatedEntropy === undefined) {
          /* horrible entropy estimator */
          estimatedEntropy = 0;
          for (i=0; i<data.length; i++) {
            tmp= data[i];
            while (tmp>0) {
              estimatedEntropy++;
              tmp = tmp >>> 1;
            }
          }
        }
        this._pools[robin].update([id,this._eventId++,2,estimatedEntropy,t,data.length].concat(data));
      }
      break;
      
    case "string":
      if (estimatedEntropy === undefined) {
       /* English text has just over 1 bit per character of entropy.
        * But this might be HTML or something, and have far less
        * entropy than English...  Oh well, let's just say one bit.
        */
       estimatedEntropy = data.length;
      }
      this._pools[robin].update([id,this._eventId++,3,estimatedEntropy,t,data.length]);
      this._pools[robin].update(data);
      break;
      
    default:
      err=1;
    }
    if (err) {
      throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
    }
  
    /* record the new strength */
    this._poolEntropy[robin] += estimatedEntropy;
    this._poolStrength += estimatedEntropy;
  
    /* fire off events */
    if (oldReady === this._NOT_READY) {
      if (this.isReady() !== this._NOT_READY) {
        this._fireEvent("seeded", Math.max(this._strength, this._poolStrength));
      }
      this._fireEvent("progress", this.getProgress());
    }
  },
  
  /** Is the generator ready? */
  isReady: function (paranoia) {
    var entropyRequired = this._PARANOIA_LEVELS[ (paranoia !== undefined) ? paranoia : this._defaultParanoia ];
  
    if (this._strength && this._strength >= entropyRequired) {
      return (this._poolEntropy[0] > this._BITS_PER_RESEED && (new Date()).valueOf() > this._nextReseed) ?
        this._REQUIRES_RESEED | this._READY :
        this._READY;
    } else {
      return (this._poolStrength >= entropyRequired) ?
        this._REQUIRES_RESEED | this._NOT_READY :
        this._NOT_READY;
    }
  },
  
  /** Get the generator's progress toward readiness, as a fraction */
  getProgress: function (paranoia) {
    var entropyRequired = this._PARANOIA_LEVELS[ paranoia ? paranoia : this._defaultParanoia ];
  
    if (this._strength >= entropyRequired) {
      return 1.0;
    } else {
      return (this._poolStrength > entropyRequired) ?
        1.0 :
        this._poolStrength / entropyRequired;
    }
  },
  
  /** start the built-in entropy collectors */
  startCollectors: function () {
    if (this._collectorsStarted) { return; }
  
    this._eventListener = {
      loadTimeCollector: this._bind(this._loadTimeCollector),
      mouseCollector: this._bind(this._mouseCollector),
      keyboardCollector: this._bind(this._keyboardCollector),
      accelerometerCollector: this._bind(this._accelerometerCollector)
    }

    if (window.addEventListener) {
      window.addEventListener("load", this._eventListener.loadTimeCollector, false);
      window.addEventListener("mousemove", this._eventListener.mouseCollector, false);
      window.addEventListener("keypress", this._eventListener.keyboardCollector, false);
      window.addEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
    } else if (document.attachEvent) {
      document.attachEvent("onload", this._eventListener.loadTimeCollector);
      document.attachEvent("onmousemove", this._eventListener.mouseCollector);
      document.attachEvent("keypress", this._eventListener.keyboardCollector);
    } else {
      throw new sjcl.exception.bug("can't attach event");
    }
  
    this._collectorsStarted = true;
  },
  
  /** stop the built-in entropy collectors */
  stopCollectors: function () {
    if (!this._collectorsStarted) { return; }
  
    if (window.removeEventListener) {
      window.removeEventListener("load", this._eventListener.loadTimeCollector, false);
      window.removeEventListener("mousemove", this._eventListener.mouseCollector, false);
      window.removeEventListener("keypress", this._eventListener.keyboardCollector, false);
      window.removeEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
    } else if (document.detachEvent) {
      document.detachEvent("onload", this._eventListener.loadTimeCollector);
      document.detachEvent("onmousemove", this._eventListener.mouseCollector);
      document.detachEvent("keypress", this._eventListener.keyboardCollector);
    }

    this._collectorsStarted = false;
  },
  
  /* use a cookie to store entropy.
  useCookie: function (all_cookies) {
      throw new sjcl.exception.bug("random: useCookie is unimplemented");
  },*/
  
  /** add an event listener for progress or seeded-ness. */
  addEventListener: function (name, callback) {
    this._callbacks[name][this._callbackI++] = callback;
  },
  
  /** remove an event listener for progress or seeded-ness */
  removeEventListener: function (name, cb) {
    var i, j, cbs=this._callbacks[name], jsTemp=[];

    /* I'm not sure if this is necessary; in C++, iterating over a
     * collection and modifying it at the same time is a no-no.
     */

    for (j in cbs) {
      if (cbs.hasOwnProperty(j) && cbs[j] === cb) {
        jsTemp.push(j);
      }
    }

    for (i=0; i<jsTemp.length; i++) {
      j = jsTemp[i];
      delete cbs[j];
    }
  },
  
  _bind: function (func) {
    var that = this;
    return function () {
      func.apply(that, arguments);
    };
  },

  /** Generate 4 random words, no reseed, no gate.
   * @private
   */
  _gen4words: function () {
    for (var i=0; i<4; i++) {
      this._counter[i] = this._counter[i]+1 | 0;
      if (this._counter[i]) { break; }
    }
    return this._cipher.encrypt(this._counter);
  },
  
  /* Rekey the AES instance with itself after a request, or every _MAX_WORDS_PER_BURST words.
   * @private
   */
  _gate: function () {
    this._key = this._gen4words().concat(this._gen4words());
    this._cipher = new sjcl.cipher.aes(this._key);
  },
  
  /** Reseed the generator with the given words
   * @private
   */
  _reseed: function (seedWords) {
    this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
    this._cipher = new sjcl.cipher.aes(this._key);
    for (var i=0; i<4; i++) {
      this._counter[i] = this._counter[i]+1 | 0;
      if (this._counter[i]) { break; }
    }
  },
  
  /** reseed the data from the entropy pools
   * @param full If set, use all the entropy pools in the reseed.
   */
  _reseedFromPools: function (full) {
    var reseedData = [], strength = 0, i;
  
    this._nextReseed = reseedData[0] =
      (new Date()).valueOf() + this._MILLISECONDS_PER_RESEED;
    
    for (i=0; i<16; i++) {
      /* On some browsers, this is cryptographically random.  So we might
       * as well toss it in the pot and stir...
       */
      reseedData.push(Math.random()*0x100000000|0);
    }
    
    for (i=0; i<this._pools.length; i++) {
     reseedData = reseedData.concat(this._pools[i].finalize());
     strength += this._poolEntropy[i];
     this._poolEntropy[i] = 0;
   
     if (!full && (this._reseedCount & (1<<i))) { break; }
    }
  
    /* if we used the last pool, push a new one onto the stack */
    if (this._reseedCount >= 1 << this._pools.length) {
     this._pools.push(new sjcl.hash.sha256());
     this._poolEntropy.push(0);
    }
  
    /* how strong was this reseed? */
    this._poolStrength -= strength;
    if (strength > this._strength) {
      this._strength = strength;
    }
  
    this._reseedCount ++;
    this._reseed(reseedData);
  },
  
  _keyboardCollector: function () {
    this._addCurrentTimeToEntropy(1);
  },
  
  _mouseCollector: function (ev) {
    var x = ev.x || ev.clientX || ev.offsetX || 0, y = ev.y || ev.clientY || ev.offsetY || 0;
    sjcl.random.addEntropy([x,y], 2, "mouse");
    this._addCurrentTimeToEntropy(0);
  },
  
  _loadTimeCollector: function () {
    this._addCurrentTimeToEntropy(2);
  },

  _addCurrentTimeToEntropy: function (estimatedEntropy) {
    if (window && window.performance && typeof window.performance.now === "function") {
      //how much entropy do we want to add here?
      sjcl.random.addEntropy(window.performance.now(), estimatedEntropy, "loadtime");
    } else {
      sjcl.random.addEntropy((new Date()).valueOf(), estimatedEntropy, "loadtime");
    }
  },
  _accelerometerCollector: function (ev) {
    var ac = ev.accelerationIncludingGravity.x||ev.accelerationIncludingGravity.y||ev.accelerationIncludingGravity.z;
    var or = "";
    if(window.orientation){
      or = window.orientation;
    }
    sjcl.random.addEntropy([ac,or], 3, "accelerometer");
    this._addCurrentTimeToEntropy(0);
  },

  _fireEvent: function (name, arg) {
    var j, cbs=sjcl.random._callbacks[name], cbsTemp=[];
    /* TODO: there is a race condition between removing collectors and firing them */

    /* I'm not sure if this is necessary; in C++, iterating over a
     * collection and modifying it at the same time is a no-no.
     */

    for (j in cbs) {
      if (cbs.hasOwnProperty(j)) {
        cbsTemp.push(cbs[j]);
      }
    }

    for (j=0; j<cbsTemp.length; j++) {
      cbsTemp[j](arg);
    }
  }
};

/** an instance for the prng.
* @see sjcl.prng
*/
sjcl.random = new sjcl.prng(6);

(function(){
  try {
    var buf, crypt, getRandomValues, ab;
    // get cryptographically strong entropy depending on runtime environment
    if (typeof module !== 'undefined' && module.exports && (crypt = require('crypto')) && crypt.randomBytes) {
      buf = crypt.randomBytes(1024/8);
      sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes");

    } else if (window && Uint32Array) {
      ab = new Uint32Array(32);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(ab);
      } else if (window.msCrypto && window.msCrypto.getRandomValues) {
        window.msCrypto.getRandomValues(ab);
      } else {
        return;
      }

      // get cryptographically strong entropy in Webkit
      sjcl.random.addEntropy(ab, 1024, "crypto.getRandomValues");

    } else {
      // no getRandomValues :-(
    }
  } catch (e) {
    console.log("There was an error collecting entropy from the browser:");
    console.log(e);
    //we do not want the library to fail due to randomness not being maintained.
  }
}());
/** @fileOverview Convenince functions centered around JSON encapsulation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */
 
 /** @namespace JSON encapsulation */
 sjcl.json = {
  /** Default values for encryption */
  defaults: { v:1, iter:1000, ks:128, ts:64, mode:"ccm", adata:"", cipher:"aes" },

  /** Simple encryption function.
   * @param {String|bitArray} password The password or key.
   * @param {String} plaintext The data to encrypt.
   * @param {Object} [params] The parameters including tag, iv and salt.
   * @param {Object} [rp] A returned version with filled-in parameters.
   * @return {Object} The cipher raw data.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   */
  _encrypt: function (password, plaintext, params, rp) {
    params = params || {};
    rp = rp || {};

    var j = sjcl.json, p = j._add({ iv: sjcl.random.randomWords(4,0) },
                                  j.defaults), tmp, prp, adata;
    j._add(p, params);
    adata = p.adata;
    if (typeof p.salt === "string") {
      p.salt = sjcl.codec.base64.toBits(p.salt);
    }
    if (typeof p.iv === "string") {
      p.iv = sjcl.codec.base64.toBits(p.iv);
    }

    if (!sjcl.mode[p.mode] ||
        !sjcl.cipher[p.cipher] ||
        (typeof password === "string" && p.iter <= 100) ||
        (p.ts !== 64 && p.ts !== 96 && p.ts !== 128) ||
        (p.ks !== 128 && p.ks !== 192 && p.ks !== 256) ||
        (p.iv.length < 2 || p.iv.length > 4)) {
      throw new sjcl.exception.invalid("json encrypt: invalid parameters");
    }

    if (typeof password === "string") {
      tmp = sjcl.misc.cachedPbkdf2(password, p);
      password = tmp.key.slice(0,p.ks/32);
      p.salt = tmp.salt;
    } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.publicKey) {
      tmp = password.kem();
      p.kemtag = tmp.tag;
      password = tmp.key.slice(0,p.ks/32);
    }
    if (typeof plaintext === "string") {
      plaintext = sjcl.codec.utf8String.toBits(plaintext);
    }
    if (typeof adata === "string") {
      adata = sjcl.codec.utf8String.toBits(adata);
    }
    prp = new sjcl.cipher[p.cipher](password);

    /* return the json data */
    j._add(rp, p);
    rp.key = password;

    /* do the encryption */
    p.ct = sjcl.mode[p.mode].encrypt(prp, plaintext, p.iv, adata, p.ts);

    //return j.encode(j._subtract(p, j.defaults));
    return p;
  },

  /** Simple encryption function.
   * @param {String|bitArray} password The password or key.
   * @param {String} plaintext The data to encrypt.
   * @param {Object} [params] The parameters including tag, iv and salt.
   * @param {Object} [rp] A returned version with filled-in parameters.
   * @return {String} The ciphertext serialized data.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   */
  encrypt: function (password, plaintext, params, rp) {
    var j = sjcl.json, p = j._encrypt.apply(j, arguments);
    return j.encode(p);
  },

  /** Simple decryption function.
   * @param {String|bitArray} password The password or key.
   * @param {Object} ciphertext The cipher raw data to decrypt.
   * @param {Object} [params] Additional non-default parameters.
   * @param {Object} [rp] A returned object with filled parameters.
   * @return {String} The plaintext.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   * @throws {sjcl.exception.corrupt} if the ciphertext is corrupt.
   */
  _decrypt: function (password, ciphertext, params, rp) {
    params = params || {};
    rp = rp || {};

    var j = sjcl.json, p = j._add(j._add(j._add({},j.defaults),ciphertext), params, true), ct, tmp, prp, adata=p.adata;
    if (typeof p.salt === "string") {
      p.salt = sjcl.codec.base64.toBits(p.salt);
    }
    if (typeof p.iv === "string") {
      p.iv = sjcl.codec.base64.toBits(p.iv);
    }

    if (!sjcl.mode[p.mode] ||
        !sjcl.cipher[p.cipher] ||
        (typeof password === "string" && p.iter <= 100) ||
        (p.ts !== 64 && p.ts !== 96 && p.ts !== 128) ||
        (p.ks !== 128 && p.ks !== 192 && p.ks !== 256) ||
        (!p.iv) ||
        (p.iv.length < 2 || p.iv.length > 4)) {
      throw new sjcl.exception.invalid("json decrypt: invalid parameters");
    }

    if (typeof password === "string") {
      tmp = sjcl.misc.cachedPbkdf2(password, p);
      password = tmp.key.slice(0,p.ks/32);
      p.salt  = tmp.salt;
    } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.secretKey) {
      password = password.unkem(sjcl.codec.base64.toBits(p.kemtag)).slice(0,p.ks/32);
    }
    if (typeof adata === "string") {
      adata = sjcl.codec.utf8String.toBits(adata);
    }
    prp = new sjcl.cipher[p.cipher](password);

    /* do the decryption */
    ct = sjcl.mode[p.mode].decrypt(prp, p.ct, p.iv, adata, p.ts);

    /* return the json data */
    j._add(rp, p);
    rp.key = password;

    return sjcl.codec.utf8String.fromBits(ct);
  },

  /** Simple decryption function.
   * @param {String|bitArray} password The password or key.
   * @param {String} ciphertext The ciphertext to decrypt.
   * @param {Object} [params] Additional non-default parameters.
   * @param {Object} [rp] A returned object with filled parameters.
   * @return {String} The plaintext.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   * @throws {sjcl.exception.corrupt} if the ciphertext is corrupt.
   */
  decrypt: function (password, ciphertext, params, rp) {
    var j = sjcl.json;
    return j._decrypt(password, j.decode(ciphertext), params, rp);
  },
  
  /** Encode a flat structure into a JSON string.
   * @param {Object} obj The structure to encode.
   * @return {String} A JSON string.
   * @throws {sjcl.exception.invalid} if obj has a non-alphanumeric property.
   * @throws {sjcl.exception.bug} if a parameter has an unsupported type.
   */
  encode: function (obj) {
    var i, out='{', comma='';
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (!i.match(/^[a-z0-9]+$/i)) {
          throw new sjcl.exception.invalid("json encode: invalid property name");
        }
        out += comma + '"' + i + '":';
        comma = ',';

        switch (typeof obj[i]) {
          case 'number':
          case 'boolean':
            out += obj[i];
            break;

          case 'string':
            out += '"' + escape(obj[i]) + '"';
            break;

          case 'object':
            out += '"' + sjcl.codec.base64.fromBits(obj[i],0) + '"';
            break;

          default:
            throw new sjcl.exception.bug("json encode: unsupported type");
        }
      }
    }
    return out+'}';
  },
  
  /** Decode a simple (flat) JSON string into a structure.  The ciphertext,
   * adata, salt and iv will be base64-decoded.
   * @param {String} str The string.
   * @return {Object} The decoded structure.
   * @throws {sjcl.exception.invalid} if str isn't (simple) JSON.
   */
  decode: function (str) {
    str = str.replace(/\s/g,'');
    if (!str.match(/^\{.*\}$/)) { 
      throw new sjcl.exception.invalid("json decode: this isn't json!");
    }
    var a = str.replace(/^\{|\}$/g, '').split(/,/), out={}, i, m;
    for (i=0; i<a.length; i++) {
      if (!(m=a[i].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))) {
        throw new sjcl.exception.invalid("json decode: this isn't json!");
      }
      if (m[3]) {
        out[m[2]] = parseInt(m[3],10);
      } else {
        out[m[2]] = m[2].match(/^(ct|salt|iv)$/) ? sjcl.codec.base64.toBits(m[4]) : unescape(m[4]);
      }
    }
    return out;
  },
  
  /** Insert all elements of src into target, modifying and returning target.
   * @param {Object} target The object to be modified.
   * @param {Object} src The object to pull data from.
   * @param {boolean} [requireSame=false] If true, throw an exception if any field of target differs from corresponding field of src.
   * @return {Object} target.
   * @private
   */
  _add: function (target, src, requireSame) {
    if (target === undefined) { target = {}; }
    if (src === undefined) { return target; }
    var i;
    for (i in src) {
      if (src.hasOwnProperty(i)) {
        if (requireSame && target[i] !== undefined && target[i] !== src[i]) {
          throw new sjcl.exception.invalid("required parameter overridden");
        }
        target[i] = src[i];
      }
    }
    return target;
  },
  
  /** Remove all elements of minus from plus.  Does not modify plus.
   * @private
   */
  _subtract: function (plus, minus) {
    var out = {}, i;

    for (i in plus) {
      if (plus.hasOwnProperty(i) && plus[i] !== minus[i]) {
        out[i] = plus[i];
      }
    }

    return out;
  },
  
  /** Return only the specified elements of src.
   * @private
   */
  _filter: function (src, filter) {
    var out = {}, i;
    for (i=0; i<filter.length; i++) {
      if (src[filter[i]] !== undefined) {
        out[filter[i]] = src[filter[i]];
      }
    }
    return out;
  }
};

/** Simple encryption function; convenient shorthand for sjcl.json.encrypt.
 * @param {String|bitArray} password The password or key.
 * @param {String} plaintext The data to encrypt.
 * @param {Object} [params] The parameters including tag, iv and salt.
 * @param {Object} [rp] A returned version with filled-in parameters.
 * @return {String} The ciphertext.
 */
sjcl.encrypt = sjcl.json.encrypt;

/** Simple decryption function; convenient shorthand for sjcl.json.decrypt.
 * @param {String|bitArray} password The password or key.
 * @param {String} ciphertext The ciphertext to decrypt.
 * @param {Object} [params] Additional non-default parameters.
 * @param {Object} [rp] A returned object with filled parameters.
 * @return {String} The plaintext.
 */
sjcl.decrypt = sjcl.json.decrypt;

/** The cache for cachedPbkdf2.
 * @private
 */
sjcl.misc._pbkdf2Cache = {};

/** Cached PBKDF2 key derivation.
 * @param {String} password The password.
 * @param {Object} [obj] The derivation params (iteration count and optional salt).
 * @return {Object} The derived data in key, the salt in salt.
 */
sjcl.misc.cachedPbkdf2 = function (password, obj) {
  var cache = sjcl.misc._pbkdf2Cache, c, cp, str, salt, iter;
  
  obj = obj || {};
  iter = obj.iter || 1000;
  
  /* open the cache for this password and iteration count */
  cp = cache[password] = cache[password] || {};
  c = cp[iter] = cp[iter] || { firstSalt: (obj.salt && obj.salt.length) ?
                     obj.salt.slice(0) : sjcl.random.randomWords(2,0) };
          
  salt = (obj.salt === undefined) ? c.firstSalt : obj.salt;
  
  c[salt] = c[salt] || sjcl.misc.pbkdf2(password, salt, obj.iter);
  return { key: c[salt].slice(0), salt:salt.slice(0) };
};



},{"crypto":14}],11:[function(require,module,exports){
/**
 * Main application entry point
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/main.js');

var aes    = require('./aes'),
	api    = require('./api'),
	config = require('./config'),
	pages  = require('./pages'),
	Notes  = require('./collection.notes');


// authenticated?
if ( config.apiKey ) {
	// it appears the user is logged in but validation is required
	api.put('sessions/' + config.apiKey, function(err, response){
		var pass;
		// session is valid
		if ( response.code === 1 ) {
			console.log('%c%s %o', 'color:green', 'session is valid, last access time:', new Date(response.atime));
			pages.list.show();

			// apply saved pass salt and hash
			aes.salt = localStorage.getItem('config.pass.salt');
			aes.hash = localStorage.getItem('config.pass.hash');

			// ask a user pass and check it
			pass = window.prompt('Provide your password to unlock data', '');
			if ( pass && aes.checkPass(pass) ) {
				aes.setPass(pass);
				console.log('%c%s', 'color:blue', 'pass is valid');

				// collect all sessions info
				api.get('sessions', function ( err, response ) {
					if ( response.code === 1 ) {
						response.data.forEach(function ( session ) {
							console.log('session', new Date(session.atime), session._id, JSON.parse(aes.decrypt(session.data)));
						});
					}
				});

				var notes = new Notes();
				notes.addListener('fetch', function(status){
					console.log('notes fetch', status);
				});
				notes.fetch();
				console.log(notes);
			} else {
				console.log('%c%s', 'color:red', 'pass is invalid');
				return;
			}
		} else {
			// authentication has expired
			pages.auth.show();
			console.log('%c%s', 'color:red', 'session is invalid, need to login');
			localStorage.clear();
			return;
		}
	});



	/*
	api.get('sessions/' + config.apiKey, function(err, response){
	console.log('current session', response);
	console.log('current session data', JSON.parse(aes.decrypt(response.data.data)));
	});/**/
} else {
	pages.auth.show();
}

localStorage.setItem('debug', 1);

//app.init();

// test data
//aes.salt = '0fb449e1ae2dc62c11f64a415e66610fa7945ce62033866788db5cc0e2ffb0da';
//aes.setPass('qwerty');

console.log('/client/js/main.js done');
},{"./aes":1,"./api":2,"./collection.notes":3,"./config":4,"./pages":13}],12:[function(require,module,exports){
/**
 * Single note model implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/model.note.js');

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
	this.url = config.apiUrl + 'notes';
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
},{"./config":4,"./lib/model":8}],13:[function(require,module,exports){
/**
 * Main application html blocks
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

console.log('/client/js/pages.js');

var Page = require('./lib/page');

module.exports = {
	auth: new Page(document.querySelector('body > div.page.auth')),
	list: new Page(document.querySelector('body > div.page.list'))
};

},{"./lib/page":9}],14:[function(require,module,exports){

},{}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL21lZGlhL3NlcnZlci9wcm9qZWN0cy9Gb3J0Tm90ZXMvY2xpZW50L2pzL2Flcy5qcyIsIi9tZWRpYS9zZXJ2ZXIvcHJvamVjdHMvRm9ydE5vdGVzL2NsaWVudC9qcy9hcGkuanMiLCIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9jbGllbnQvanMvY29sbGVjdGlvbi5ub3Rlcy5qcyIsIi9tZWRpYS9zZXJ2ZXIvcHJvamVjdHMvRm9ydE5vdGVzL2NsaWVudC9qcy9jb25maWcuanMiLCIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9jbGllbnQvanMvbGliL2NvbGxlY3Rpb24uanMiLCIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9jbGllbnQvanMvbGliL2VtaXR0ZXIuanMiLCIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9jbGllbnQvanMvbGliL2lvLmpzIiwiL21lZGlhL3NlcnZlci9wcm9qZWN0cy9Gb3J0Tm90ZXMvY2xpZW50L2pzL2xpYi9tb2RlbC5qcyIsIi9tZWRpYS9zZXJ2ZXIvcHJvamVjdHMvRm9ydE5vdGVzL2NsaWVudC9qcy9saWIvcGFnZS5qcyIsIi9tZWRpYS9zZXJ2ZXIvcHJvamVjdHMvRm9ydE5vdGVzL2NsaWVudC9qcy9saWIvc2pjbC5qcyIsIi9tZWRpYS9zZXJ2ZXIvcHJvamVjdHMvRm9ydE5vdGVzL2NsaWVudC9qcy9tYWluLmpzIiwiL21lZGlhL3NlcnZlci9wcm9qZWN0cy9Gb3J0Tm90ZXMvY2xpZW50L2pzL21vZGVsLm5vdGUuanMiLCIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9jbGllbnQvanMvcGFnZXMuanMiLCIvbWVkaWEvc2VydmVyL3Byb2plY3RzL0ZvcnROb3Rlcy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3dEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQUVTIGVuY3J5cHRpb24vZGVjcnlwdGlvbiB3cmFwcGVyXG4gKiBAbmFtZXNwYWNlXG4gKiBAYXV0aG9yIERhcmtQYXJrXG4gKiBAbGljZW5zZSBHTlUgR0VORVJBTCBQVUJMSUMgTElDRU5TRSBWZXJzaW9uIDNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnNvbGUubG9nKCcvY2xpZW50L2pzL2Flcy5qcycpO1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4vbGliL2VtaXR0ZXInKSxcblx0c2pjbCAgICA9IHJlcXVpcmUoJy4vbGliL3NqY2wnKSxcblx0Y29uZmlnICA9IHJlcXVpcmUoJy4vY29uZmlnJyksXG5cdGFlcyAgICAgPSBuZXcgRW1pdHRlcigpLFxuXHRwYXNzICAgID0gbnVsbDsgIC8vIHByaXZhdGUgcHJpbWFyeSBwYXNzd29yZCAoYWNjZXNzZWQgb25seSBpbmRpcmVjdGx5KVxuXG5cbi8vIGhhc2ggb2YgdGhlIGdpdmVuIHBhc3MgKGlmIG5vdCBzZXQgdGhlbiB0aGUgcGFzcyB3YXMgbm90IGNyZWF0ZWQpXG5hZXMuaGFzaCAgID0gbnVsbDtcbi8vIHNhbHQgc3RyaW5nIGZvciBoYXNoIGdlbmVyYXRpb25cbmFlcy5zYWx0ICAgPSBudWxsO1xuLy8gdGltZSBpbiBzZWNvbmRzIGZvciBwYXNzIGNhY2hpbmcgKGRlZmF1bHQgLSA1IG1pbnV0ZXMpXG5hZXMudGltZSAgID0gMzAwO1xuXG5cbi8qKlxuICogQ2hlY2tzIGlmIHBhc3Mgc2V0XG4gKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGV4aXN0c1xuICovXG5hZXMuaGFzUGFzcyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIEJvb2xlYW4ocGFzcyk7XG59O1xuXG5cbi8qKlxuICogU2V0IHRoZSBwcml2YXRlIHBhc3MgdmFyIGFuZCBzdGFydCB0aW1lciBmb3IgY2xlYXJpbmcgaXQgaW4gc29tZSB0aW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgcGFzc3dvcmQgdG8gc2V0XG4gKi9cbmFlcy5zZXRQYXNzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblx0Ly8gc2V0IHRoZSBwcml2YXRlIHBhc3N3b3JkXG5cdHBhc3MgPSB2YWx1ZTtcblx0Ly8gY2FsY3VsYXRlIGFuZCBzZXQgaGFzaFxuXHR0aGlzLmhhc2ggPSBzamNsLmNvZGVjLmhleC5mcm9tQml0cyhzamNsLmhhc2guc2hhMjU2Lmhhc2goXG5cdFx0c2pjbC5jb2RlYy5oZXguZnJvbUJpdHMoc2pjbC5oYXNoLnNoYTI1Ni5oYXNoKHZhbHVlKSkgK1xuXHRcdFx0dGhpcy5zYWx0XG5cdCkpO1xuXHQvLyBub3RpZnkgYWxsIHN1YnNjcmliZXJzXG5cdHRoaXMuZW1pdCgncGFzcycsIHRydWUpO1xuXG5cdC8vaWYgKCAhdGhpcy5IYXNIYXNoKCkgKSB0aGlzLlNldFBhc3NIYXNoKHRoaXMuQ2FsY0hhc2godmFsdWUpKTtcblx0Ly9mYigncGFzcyB3aWxsIGV4cGlyZSBpbiAnICsgdGltZSk7XG5cdC8vIHNldCBjbGVhcmluZyB0aW1lclxuXHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXtzZWxmLkV4cGlyZVBhc3MoKX0sIHRpbWUgKiAxMDAwKTtcbn07XG5cblxuLyoqXG4gKiBDaGVja3MgaWYgcGFzcyBzZXQgYW5kIG1hdGNoZXMgdGhlIGhhc2hcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBwYXNzd29yZCB0byBjaGVja1xuICovXG5hZXMuY2hlY2tQYXNzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblx0cmV0dXJuIHRoaXMuaGFzaCA9PT0gc2pjbC5jb2RlYy5oZXguZnJvbUJpdHMoc2pjbC5oYXNoLnNoYTI1Ni5oYXNoKFxuXHRcdHNqY2wuY29kZWMuaGV4LmZyb21CaXRzKHNqY2wuaGFzaC5zaGEyNTYuaGFzaCh2YWx1ZSkpICtcblx0XHRcdHRoaXMuc2FsdFxuXHQpKTtcbn07XG5cblxuLyoqXG4gKiBFbmNyeXB0cyB0aGUgZ2l2ZW4gdGV4dCB3aXRoIHRoZSBzdG9yZWQgcGFzc1xuICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgdGV4dCBmb3IgZW5jcnlwdGlvblxuICogQHJldHVybiB7T2JqZWN0fEJvb2xlYW59IGVuY3J5cHRlZCBsaW5lIG9yIGZhbHNlIG9uIGZhaWx1cmVcbiAqL1xuYWVzLmVuY3J5cHQgPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG5cdHZhciBlbmMgPSB7fTtcblx0Ly8gcGFzc3dvcmQgaXMgcHJlc2VudCBhbmQgbm90IGVtcHR5IGlucHV0XG5cdGlmICggcGFzcyAmJiBkYXRhICkge1xuXHRcdC8vIHByb3RlY3RlZCBibG9ja1xuXHRcdHRyeSB7XG5cdFx0XHRlbmMgPSBzamNsLmpzb24uX2VuY3J5cHQocGFzcywgZGF0YSwgY29uZmlnLnNqY2wpO1xuXHRcdFx0Ly8gZ2V0IG9ubHkgc2lnbmlmaWNhbnQgZmllbGRzXG5cdFx0XHRyZXR1cm4ge2l2OmVuYy5pdiwgc2FsdDplbmMuc2FsdCwgY3Q6ZW5jLmN0fTtcblx0XHRcdC8vcmV0dXJuIHNqY2wuZW5jcnlwdChwYXNzLCBkYXRhLCB0aGlzLmNvbmZpZyk7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRjb25zb2xlLnRyYWNlKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnZW5jcnlwdCBmYWlsdXJlJywgZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cblxuLyoqXG4gKiBEZWNyeXB0cyB0aGUgZ2l2ZW4gdGV4dCB3aXRoIHRoZSBzdG9yZWQgcGFzc1xuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgdGV4dCB0byBiZSBkZWNyeXB0ZWRcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBkZWNyeXB0ZWQgbGluZSBvciBmYWxzZSBvbiBmYWlsdXJlXG4gKi9cbmFlcy5kZWNyeXB0ID0gZnVuY3Rpb24gKCBkYXRhICkge1xuXHQvL3ZhciBuYW1lO1xuXHQvLyBwYXNzd29yZCBpcyBwcmVzZW50IGFuZCBub3QgZW1wdHkgaW5wdXRcblx0aWYgKCBwYXNzICYmIGRhdGEgKSB7XG5cdFx0Ly8gcHJvdGVjdGVkIGJsb2NrXG5cdFx0dHJ5IHtcblx0XHRcdC8vIGFwcGx5IHVzZXItc3BlY2lmaWMgZGVjb2RpbmcgcGFyYW1zIHRvIHRoZSBkYXRhXG5cdFx0XHQvL2ZvciAoIG5hbWUgaW4gY29uZmlnLnNqY2wgKSB7IGlmICggY29uZmlnLnNqY2wuaGFzT3duUHJvcGVydHkobmFtZSkgKSB7IGRhdGFbbmFtZV0gPSBjb25maWcuc2pjbFtuYW1lXTsgfSB9XG5cdFx0XHRyZXR1cm4gc2pjbC5qc29uLl9kZWNyeXB0KHBhc3MsIGNvbmZpZy5zamNsLCBkYXRhKTtcblx0XHR9IGNhdGNoICggZSApIHtcblx0XHRcdGNvbnNvbGUudHJhY2UoKTtcblx0XHRcdGNvbnNvbGUubG9nKCdkZWNyeXB0IGZhaWx1cmUnLCBlKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuXG4vLyBwdWJsaWMgZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IGFlczsiLCIvKipcbiAqIEFwcGxpY2F0aW9uIEFQSSB3cmFwcGVyXG4gKiBAYXV0aG9yIERhcmtQYXJrXG4gKiBAbGljZW5zZSBHTlUgR0VORVJBTCBQVUJMSUMgTElDRU5TRSBWZXJzaW9uIDNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnNvbGUubG9nKCcvY2xpZW50L2pzL2FwaS5qcycpO1xuXG52YXIgaW8gICAgID0gcmVxdWlyZSgnLi9saWIvaW8nKSxcblx0Y29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxuXG5mdW5jdGlvbiBhcGkgKCBtZXRob2QsIHVybCwgZGF0YSwgY2FsbGJhY2sgKSB7XG5cdGlvLmFqYXgoY29uZmlnLmFwaVVybCArIHVybCwge1xuXHRcdG1ldGhvZCA6IG1ldGhvZCxcblx0XHRkYXRhICAgOiBkYXRhLFxuXHRcdGhlYWRlcnM6IGNvbmZpZy5hcGlLZXkgPyB7a2V5OiBjb25maWcuYXBpS2V5fSA6IHt9LFxuXHRcdG9ubG9hZCA6IGZ1bmN0aW9uICggcmVzcG9uc2UsIHN0YXR1cyApIHtcblx0XHRcdHZhciBkYXRhICA9IG51bGwsXG5cdFx0XHRcdGVycm9yID0gbnVsbDtcblx0XHRcdGlmICggcmVzcG9uc2UgJiYgc3RhdHVzID09PSAyMDAgKSB7XG5cdFx0XHRcdC8vIHNlZW1zIHZhbGlkXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0ZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuXHRcdFx0XHR9IGNhdGNoICggZSApIHsgZXJyb3IgPSBlOyB9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnISEhIScpO1xuXHRcdFx0XHRlcnJvciA9IG5ldyBFcnJvcignZW1wdHkgcmVzcG9uc2Ugb3IgaW52YWxpZCBzdGF0dXMnKTtcblx0XHRcdH1cblx0XHRcdGNhbGxiYWNrKGVycm9yLCBkYXRhKTtcblx0XHR9LFxuXHRcdG9uZXJyb3I6IGZ1bmN0aW9uICggZSApIHtcblx0XHRcdGNhbGxiYWNrKGUsIG51bGwpO1xuXHRcdH0sXG5cdFx0b250aW1lb3V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjYWxsYmFjayhuZXcgRXJyb3IoJ3JlcXVlc3QgdGltZWQgb3V0JyksIG51bGwpO1xuXHRcdH1cblx0fSk7XG59XG5cbi8vIHB1YmxpYyBleHBvcnRcbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uICggdXJsLCBjYWxsYmFjayApIHtcblx0cmV0dXJuIGFwaSgnZ2V0JywgdXJsLCBudWxsLCBjYWxsYmFjayk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZWFkID0gZnVuY3Rpb24gKCB1cmwsIGNhbGxiYWNrICkge1xuXHRyZXR1cm4gYXBpKCdoZWFkJywgdXJsLCBudWxsLCBjYWxsYmFjayk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5wb3N0ID0gZnVuY3Rpb24gKCB1cmwsIGRhdGEsIGNhbGxiYWNrICkge1xuXHRyZXR1cm4gYXBpKCdwb3N0JywgdXJsLCBkYXRhLCBjYWxsYmFjayk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5wdXQgPSBmdW5jdGlvbiAoIHVybCwgY2FsbGJhY2sgKSB7XG5cdHJldHVybiBhcGkoJ3B1dCcsIHVybCwgbnVsbCwgY2FsbGJhY2spO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZGVsZXRlID0gZnVuY3Rpb24gKCB1cmwsIGNhbGxiYWNrICkge1xuXHRyZXR1cm4gYXBpKCdkZWxldGUnLCB1cmwsIG51bGwsIGNhbGxiYWNrKTtcbn07IiwiLyoqXG4gKiBMaXN0IG9mIG5vdGVzXG4gKiBAYXV0aG9yIERhcmtQYXJrXG4gKiBAbGljZW5zZSBHTlUgR0VORVJBTCBQVUJMSUMgTElDRU5TRSBWZXJzaW9uIDNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnNvbGUubG9nKCcvY2xpZW50L2pzL2NvbGxlY3Rpb24ubm90ZXMuanMnKTtcblxudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2xpYi9jb2xsZWN0aW9uJyksXG5cdGNvbmZpZyAgICAgPSByZXF1aXJlKCcuL2NvbmZpZycpLFxuXHROb3RlICAgICAgID0gcmVxdWlyZSgnLi9tb2RlbC5ub3RlJyk7XG5cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gbW9kZWxzIGluaXQgYXR0cmlidXRlc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIE5vdGVzICggbW9kZWxzICkge1xuXHQvLyBwYXJlbnQgaW5pdFxuXHRDb2xsZWN0aW9uLmNhbGwodGhpcywgbW9kZWxzKTtcblx0dGhpcy5tb2RlbCAgPSBOb3RlO1xuXHR0aGlzLnVybCAgICA9IGNvbmZpZy5hcGlVcmwgKyAnbm90ZXMnO1xufVxuXG5cbi8vIGluaGVyaXRhbmNlXG5Ob3Rlcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbGxlY3Rpb24ucHJvdG90eXBlKTtcbk5vdGVzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE5vdGVzO1xuXG5cbi8vIHB1YmxpYyBleHBvcnRcbm1vZHVsZS5leHBvcnRzID0gTm90ZXM7IiwiLyoqXG4gKiBSZWFsLXRpbWUgYXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQGF1dGhvciBEYXJrUGFya1xuICogQGxpY2Vuc2UgR05VIEdFTkVSQUwgUFVCTElDIExJQ0VOU0UgVmVyc2lvbiAzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zb2xlLmxvZygnL2NsaWVudC9qcy9jb25maWcuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdC8vIGFwcCB3b3JrIG1vZGVcblx0ZGVidWcgIDogQm9vbGVhbihsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGVidWcnKSksXG5cdC8vIGFsbCBhcGkgcmVxdWVzdHMgYWRkcmVzc1xuXHRhcGlVcmwgOiAnL2FwaS92MS8nLFxuXHQvLyBiYXNlNjQgZW5jb2RlZCA2NCBieXRlcyBzdHJpbmcgaXNzdWVkIG9uIHNlc3Npb24gY3JlYXRpb25cblx0YXBpS2V5IDogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NvbmZpZy5hdXRoLmtleScpLFxuXHQvLyBkZWZhdWx0IGVuY3J5cHQvZGVjcnlwdCBwYXJhbWV0ZXJzIChyZXdyaXR0ZW4gYnkgdXNlciBpbmRpdmlkdWFsIG9wdGlvbnMpXG5cdHNqY2wgICA6IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NvbmZpZy5zamNsJykpIHx8IHsgdjoxLGl0ZXI6MTAwMCxrczoyNTYsdHM6MTI4LG1vZGU6J2NjbScsYWRhdGE6JycsY2lwaGVyOidhZXMnIH1cbn07IiwiLyoqXG4qIEJhc2UgY29sbGVjdGlvbiBpbXBsZW1lbnRhdGlvblxuKiBAYXV0aG9yIERhcmtQYXJrXG4qIEBsaWNlbnNlIEdOVSBHRU5FUkFMIFBVQkxJQyBMSUNFTlNFIFZlcnNpb24gM1xuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zb2xlLmxvZygnL2NsaWVudC9qcy9saWIvY29sbGVjdGlvbi5qcycpO1xuXG4vLyBkZWNsYXJhdGlvbnNcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi9lbWl0dGVyJyksXG5cdGlvICAgICAgPSByZXF1aXJlKCcuL2lvJyk7XG5cblxuLyoqXG4gKiBAcGFyYW0ge1thcHAuY2xhc3MuTW9kZWxdfSBtb2RlbHMgaW5pdCBtb2RlbCBsaXN0XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gQ29sbGVjdGlvbiAoIG1vZGVscyApIHtcblx0Ly8gcGFyZW50IGluaXRcblx0RW1pdHRlci5jYWxsKHRoaXMpO1xuXHQvLyBpbml0XG5cdHRoaXMuX2RhdGEgPSBbXTtcblx0dGhpcy5faWRzICA9IHt9O1xuXHR0aGlzLm1vZGVsID0gbnVsbDtcblx0dGhpcy51cmwgICA9IG51bGw7XG5cdHRoaXMubW9kZWxzKG1vZGVscyk7XG59XG5cblxuLy8gaW5oZXJpdGFuY2VcbkNvbGxlY3Rpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbWl0dGVyLnByb3RvdHlwZSk7XG5Db2xsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbGxlY3Rpb247XG5cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBtb2RlbHMgZnJvbSB0aGUgY29sbGVjdGlvblxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGluZGV4ID0gMDtcblx0Ly8gcmVtb3ZlIGFsbCBhc3NvY2lhdGVkIGxpbmtzXG5cdGZvciAoIDsgaW5kZXggPCB0aGlzLl9kYXRhLmxlbmd0aDsgaW5kZXgrKyApIHtcblx0XHR0aGlzLl9kYXRhW2luZGV4XS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblx0fVxuXHR0aGlzLl9kYXRhID0gW107XG5cdHRoaXMuX2lkcyAgPSB7fTtcblx0dGhpcy5lbWl0KCdjbGVhcicpO1xufTtcblxuXG4vKipcbiAqIEFkZHMgdGhlIGdpdmVuIGxpc3Qgb2YgbW9kZWxzIHRvIHRoZSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge1thcHAuY2xhc3MuTW9kZWxdfSBkYXRhIG1vZGVsIGxpc3RcbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUubW9kZWxzID0gZnVuY3Rpb24gKCBkYXRhICkge1xuXHR2YXIgaW5kZXggPSAwO1xuXHRpZiAoIEFycmF5LmlzQXJyYXkoZGF0YSkgKSB7XG5cdFx0Zm9yICggOyBpbmRleCA8IGRhdGEubGVuZ3RoOyBpbmRleCsrICkge1xuXHRcdFx0dGhpcy5hZGQoZGF0YVtpbmRleF0pO1xuXHRcdH1cblx0fVxufTtcblxuXG4vKipcbiAqIEFwcGVuZHMgdGhlIGdpdmVuIG1vZGVsIHRvIHRoZSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge2FwcC5jbGFzcy5Nb2RlbH0gbW9kZWxcbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKCBtb2RlbCApIHtcblx0dGhpcy5faWRzW21vZGVsLmdldChtb2RlbC5pZE5hbWUpXSA9IG1vZGVsO1xuXHR0aGlzLl9kYXRhLnB1c2gobW9kZWwpO1xuXHR0aGlzLmVtaXQoJ2FkZCcsIG1vZGVsKTtcbn07XG5cblxuLyoqXG4gKiBJbnNlcnRzIHRoZSBnaXZlbiBtb2RlbCB0byBzb21lIHBsZWNlIGluIHRoZSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge2FwcC5jbGFzcy5Nb2RlbH0gbW9kZWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiBpbmRleCBvZiB0aGUgbW9kZWxcbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24gKCBtb2RlbCwgcG9zaXRpb24gKSB7XG5cdHRoaXMuX2lkc1ttb2RlbC5nZXQobW9kZWwuaWROYW1lKV0gPSBtb2RlbDtcblx0dGhpcy5fZGF0YS5zcGxpY2UocG9zaXRpb24sIDAsIG1vZGVsKTtcblx0dGhpcy5lbWl0KCdhZGQnLCBtb2RlbCwgcG9zaXRpb24pO1xufTtcblxuXG4vKipcbiAqIERlbGV0ZXMgdGhlIGdpdmVuIG1vZGVsIGZyb20gdGhlIGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7YXBwLmNsYXNzLk1vZGVsfSBtb2RlbFxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoIG1vZGVsICkge1xuXHR2YXIgaW5kZXggPSB0aGlzLl9kYXRhLmluZGV4T2YobW9kZWwpO1xuXHRpZiAoIGluZGV4ID4gLTEgKSB7XG5cdFx0dGhpcy5fZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGRlbGV0ZSB0aGlzLl9pZHNbbW9kZWwuZ2V0KCdpZCcpXTtcblx0XHR0aGlzLmVtaXQoJ3JlbW92ZScsIG1vZGVsKTtcblx0fVxufTtcblxuXG4vKipcbiAqIEdldHMgYSBtb2RlbCBieSB0aGUgZ2l2ZW4gaW5kZXggaW4gdGhlIGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICogQHJldHVybiB7YXBwLmNsYXNzLk1vZGVsfSBtb2RlbCBvciB1bmRlZmluZWQgaWYgZmFpbFxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uICggcG9zaXRpb24gKSB7XG5cdHJldHVybiB0aGlzLl9kYXRhW3Bvc2l0aW9uXTtcbn07XG5cblxuLyoqXG4gKiBHZXRzIGEgbW9kZWwgYnkgaXRzIGlkXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcmV0dXJuIHthcHAuY2xhc3MuTW9kZWx9IG1vZGVsIG9yIHVuZGVmaW5lZCBpZiBmYWlsXG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICggaWQgKSB7XG5cdHJldHVybiB0aGlzLl9pZHNbaWRdO1xufTtcblxuXG4vLyBleHRlbmRpbmcgd2l0aCBiYXNlIG1ldGhvZHNcblsnZmlsdGVyJywgJ2ZvckVhY2gnLCAnZXZlcnknLCAnbWFwJywgJ3NvbWUnXS5mb3JFYWNoKGZ1bmN0aW9uICggbmFtZSApIHtcblx0Q29sbGVjdGlvbi5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZVtuYW1lXS5hcHBseSh0aGlzLl9kYXRhLCBhcmd1bWVudHMpO1xuXHR9O1xufSk7XG5cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBjdXN0b20gc29yIG1ldGhvZCBmb3IgYWxsIG1vZGVscyBpbiB0aGUgY29sbGVjdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29tcGFyYXRvclxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5zb3J0ID0gZnVuY3Rpb24gKCBjb21wYXJhdG9yICkge1xuXHR0aGlzLl9kYXRhLnNvcnQoY29tcGFyYXRvcik7XG5cdHRoaXMuZW1pdCgnc29ydCcpO1xufTtcblxuXG4vKipcbiAqIENvbGxlY3RzIG1vZGVscyBmcm9tIGEgc2VydmVyXG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgc2VsZiA9IHRoaXMsIGluZGV4ID0gMDtcblx0aWYgKCB0aGlzLm1vZGVsICYmIHRoaXMudXJsICkge1xuXHRcdC8vIGNvbGxlY3QgZGF0YVxuXHRcdGlvLmFqYXgodGhpcy51cmwsIHtcblx0XHRcdC8vIHJlcXVlc3QgcGFyYW1zXG5cdFx0XHRtZXRob2Q6ICdnZXQnLFxuXHRcdFx0b25sb2FkOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0ZGF0YSA9IHNlbGYucGFyc2UoZGF0YSk7XG5cdFx0XHRcdC8vIGNyZWF0ZSBtb2RlbHMgZnJvbSByZXNwb25zZSBhbmQgYWRkXG5cdFx0XHRcdGlmICggQXJyYXkuaXNBcnJheShkYXRhKSAmJiBzZWxmLm1vZGVsICkge1xuXHRcdFx0XHRcdGZvciAoIDsgaW5kZXggPCBkYXRhLmxlbmd0aDsgaW5kZXgrKyApIHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YVtpbmRleF0pO1xuXHRcdFx0XHRcdFx0Ly8gY3JlYXRlIGEgbW9kZWwgZnJvbSByZWNlaXZlZCBkYXRhXG5cdFx0XHRcdFx0XHRzZWxmLmFkZChuZXcgKHNlbGYubW9kZWwpKGRhdGFbaW5kZXhdKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHNlbGYuZW1pdCgnZmV0Y2gnLCB0cnVlKTtcblx0XHRcdH0sXG5cdFx0XHQvLyBlcnJvciBoYW5kbGVyc1xuXHRcdFx0b25lcnJvcjogICB0aGlzLmZldGNoRmFpbHVyZSxcblx0XHRcdG9udGltZW91dDogdGhpcy5mZXRjaEZhaWx1cmVcblx0XHR9KTtcblx0fVxufTtcblxuXG4vKipcbiAqIEVycm9yIGhhbmRsZXIgd2hpbGUgbW9kZWwgZGF0YSBmZXRjaFxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5mZXRjaEZhaWx1cmUgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuZW1pdCgnZmV0Y2gnLCBmYWxzZSk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgcmVjZWl2ZWQgZGF0YSBmcm9tIGEgc2VydmVyIHRvIGEgbW9kZWwgbGlzdFxuICogQHBhcmFtIHtTdHJpbmd9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoIHJlc3BvbnNlICkge1xuXHR2YXIgZGF0YSA9IFtdO1xuXHR0cnkge1xuXHRcdGRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5kYXRhO1xuXHR9IGNhdGNoKGUpeyBjb25zb2xlLmxvZyhlKTsgfVxuXHRyZXR1cm4gZGF0YTtcbn07XG5cblxuLy8gcHVibGljIGV4cG9ydFxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uOyIsIi8qKlxuICogRXZlbnRzIEVtaXR0ZXIgYmFzZSBpbXBsZW1lbnRhdGlvblxuICogQHNlZSBodHRwOi8vbm9kZWpzLm9yZy9hcGkvZXZlbnRzLmh0bWxcbiAqIEBhdXRob3IgRGFya1BhcmtcbiAqIEBsaWNlbnNlIEdOVSBHRU5FUkFMIFBVQkxJQyBMSUNFTlNFIFZlcnNpb24gM1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc29sZS5sb2coJy9jbGllbnQvanMvbGliL2VtaXR0ZXIuanMnKTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRW1pdHRlciAoKSB7XG5cdHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cblxuRW1pdHRlci5wcm90b3R5cGUgPSB7XG5cdC8qKlxuXHQgKiBCaW5kIGFuIGV2ZW50IHRvIHRoZSBnaXZlbiBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICogVGhlIHNhbWUgY2FsbGJhY2sgZnVuY3Rpb24gY2FuIGJlIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc2FtZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBldmVudCBpZGVudGlmaWVyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNhbGwgb24gdGhpcyBldmVudFxuXHQgKiBAZXhhbXBsZVxuXHQgKlx0XHRUT0RPOiBhZGRcblx0ICovXG5cdGFkZExpc3RlbmVyIDogZnVuY3Rpb24gKCBuYW1lLCBjYWxsYmFjayApIHtcblx0XHQvLyBpbml0aWFsaXphdGlvbiBtYXkgYmUgcmVxdWlyZWRcblx0XHR0aGlzLl9ldmVudHNbbmFtZV0gPSB0aGlzLl9ldmVudHNbbmFtZV0gfHwgW107XG5cdFx0Ly8gYXBwZW5kIHRoaXMgbmV3IGV2ZW50IHRvIHRoZSBsaXN0XG5cdFx0dGhpcy5fZXZlbnRzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgb25lL21hbnkgY2FsbGJhY2tzLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBldmVudCBpZGVudGlmaWVyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNhbGwgb24gdGhpcyBldmVudFxuXHQgKiBAZXhhbXBsZVxuXHQgKlx0XHRUT0RPOiBhZGRcblx0ICovXG5cdHJlbW92ZUxpc3RlbmVyIDogZnVuY3Rpb24gKCBuYW1lLCBjYWxsYmFjayApIHtcblx0XHQvLyB0aGUgZXZlbnQgZXhpc3RzIGFuZCBzaG91bGQgaGF2ZSBzb21lIGNhbGxiYWNrc1xuXHRcdGlmICggQXJyYXkuaXNBcnJheSh0aGlzLl9ldmVudHNbbmFtZV0pICkge1xuXHRcdFx0Ly8gcmV3b3JrIHRoZSBjYWxsYmFjayBsaXN0IHRvIGV4Y2x1ZGUgdGhlIGdpdmVuIG9uZVxuXHRcdFx0dGhpcy5fZXZlbnRzW25hbWVdID0gdGhpcy5fZXZlbnRzW25hbWVdLmZpbHRlcihmdW5jdGlvbihmbmMpeyByZXR1cm4gZm5jICE9PSBjYWxsYmFjazsgfSk7XG5cdFx0XHQvLyBldmVudCBoYXMgbm8gbW9yZSBjYWxsYmFja3Mgc28gY2xlYW4gaXRcblx0XHRcdGlmICggdGhpcy5fZXZlbnRzW25hbWVdLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhbGwgY2FsbGJhY2tzIGZvciB0aGUgZ2l2ZW4gZXZlbnQgbmFtZS5cblx0ICogV2l0aG91dCBldmVudCBuYW1lIGNsZWFycyBhbGwgZXZlbnRzLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gW25hbWVdIGV2ZW50IGlkZW50aWZpZXJcblx0ICogQGV4YW1wbGVcblx0ICpcdFx0VE9ETzogYWRkXG5cdCAqL1xuXHRyZW1vdmVBbGxMaXN0ZW5lcnMgOiBmdW5jdGlvbiAoIG5hbWUgKSB7XG5cdFx0Ly8gY2hlY2sgaW5wdXRcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBubyBhcmd1bWVudHMgc28gcmVtb3ZlIGV2ZXJ5dGhpbmdcblx0XHRcdHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0fSBlbHNlIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApIHtcblx0XHRcdC8vIG9ubHkgbmFtZSBpcyBnaXZlbiBzbyByZW1vdmUgYWxsIGNhbGxiYWNrcyBmb3IgdGhlIGdpdmVuIGV2ZW50XG5cdFx0XHRkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogRXhlY3V0ZSBlYWNoIG9mIHRoZSBsaXN0ZW5lcnMgaW4gb3JkZXIgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBldmVudCBpZGVudGlmaWVyXG5cdCAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIG9wdGlvbnNcblx0ICogQGV4YW1wbGVcblx0ICpcdFx0VE9ETzogYWRkXG5cdCAqL1xuXHRlbWl0IDogZnVuY3Rpb24gKCBuYW1lLCBhcmdzICkge1xuXHRcdHZhciBmbmNJbmRleDtcblx0XHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblx0XHQvLyB0aGUgZXZlbnQgZXhpc3RzIGFuZCBzaG91bGQgaGF2ZSBzb21lIGNhbGxiYWNrc1xuXHRcdGlmICggQXJyYXkuaXNBcnJheSh0aGlzLl9ldmVudHNbbmFtZV0pICkge1xuXHRcdFx0Zm9yICggZm5jSW5kZXggPSAwOyBmbmNJbmRleCA8IHRoaXMuX2V2ZW50c1tuYW1lXS5sZW5ndGg7IGZuY0luZGV4KysgKSB7XG5cdFx0XHRcdC8vIGludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBwYXJhbWV0ZXJzXG5cdFx0XHRcdHRoaXMuX2V2ZW50c1tuYW1lXVtmbmNJbmRleF0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgb25lIHRpbWUgbGlzdGVuZXIgZm9yIHRoZSBldmVudC5cblx0ICogVGhpcyBsaXN0ZW5lciBpcyBpbnZva2VkIG9ubHkgdGhlIG5leHQgdGltZSB0aGUgZXZlbnQgaXMgZmlyZWQsIGFmdGVyIHdoaWNoIGl0IGlzIHJlbW92ZWQuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIGV2ZW50IGlkZW50aWZpZXJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2FsbCBvbiB0aGlzIGV2ZW50XG5cdCAqL1xuXHRvbmNlOiBmdW5jdGlvbiAoIG5hbWUsIGNhbGxiYWNrICkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmFkZExpc3RlbmVyKG5hbWUsIGZ1bmN0aW9uIHdyYXBwZXIgKCkge1xuXHRcdFx0c2VsZi5yZW1vdmVMaXN0ZW5lcihuYW1lLCB3cmFwcGVyKTtcblx0XHRcdGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3VtZW50cyk7XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuLy8gcHVibGljIGV4cG9ydFxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyOyIsIi8qKlxuICogSU8gaGVscGVyc1xuICogQG5hbWVzcGFjZVxuICogQGF1dGhvciBEYXJrUGFya1xuICogQGxpY2Vuc2UgR05VIEdFTkVSQUwgUFVCTElDIExJQ0VOU0UgVmVyc2lvbiAzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zb2xlLmxvZygnL2NsaWVudC9qcy9saWIvaW8uanMnKTtcblxuLy8gZGVjbGFyYXRpb25zXG52YXIgaW8gPSB7fSxcblx0ZGVmYXVsdHMgPSB7XG5cdFx0bWV0aG9kICAgIDogJ0dFVCcsICAvLyBIVFRQIG1ldGhvZCB0byB1c2UsIHN1Y2ggYXMgXCJHRVRcIiwgXCJQT1NUXCIsIFwiUFVUXCIsIFwiREVMRVRFXCIsIGV0Yy5cblx0XHRhc3luYyAgICAgOiB0cnVlLCAgIC8vIHdoZXRoZXIgb3Igbm90IHRvIHBlcmZvcm0gdGhlIG9wZXJhdGlvbiBhc3luY2hyb25vdXNseVxuXHRcdGhlYWRlcnMgICA6IHt9LCAgICAgLy8gbGlzdCBvZiBIVFRQIHJlcXVlc3QgaGVhZGVyc1xuXHRcdHR5cGUgICAgICA6ICd0ZXh0JywgLy8gXCJcIiwgXCJhcnJheWJ1ZmZlclwiLCBcImJsb2JcIiwgXCJkb2N1bWVudFwiLCBcImpzb25cIiwgXCJ0ZXh0XCJcblx0XHRkYXRhICAgICAgOiBudWxsLCAgIC8vIGRhdGEgdG8gc2VuZCAocGxhaW4gb2JqZWN0KVxuXHRcdHRpbWVvdXQgICA6IDMwMDAwLCAgLy8gYW1vdW50IG9mIG1pbGxpc2Vjb25kcyBhIHJlcXVlc3QgY2FuIHRha2UgYmVmb3JlIGJlaW5nIHRlcm1pbmF0ZWRcblx0XHRvbmxvYWQgICAgOiBudWxsLCAgIC8vIGNhbGxiYWNrIHdoZW4gdGhlIHJlcXVlc3QgaGFzIHN1Y2Nlc3NmdWxseSBjb21wbGV0ZWRcblx0XHRvbmVycm9yICAgOiBudWxsLCAgIC8vIGNhbGxiYWNrIHdoZW4gdGhlIHJlcXVlc3QgaGFzIGZhaWxlZFxuXHRcdG9udGltZW91dCA6IG51bGwgICAgLy8gY2FsbGJhY2sgd2hlbiB0aGUgYXV0aG9yIHNwZWNpZmllZCB0aW1lb3V0IGhhcyBwYXNzZWQgYmVmb3JlIHRoZSByZXF1ZXN0IGNvdWxkIGNvbXBsZXRlXG5cdH0sXG5cdGRlZmF1bHRzS2V5cyA9IE9iamVjdC5rZXlzKGRlZmF1bHRzKTtcblxuXG4vKipcbiAqIE1haW4gbWV0aG9kIHRvIHNlbmQgYWpheCByZXF1ZXN0c1xuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgUGxhaW4gb2JqZWN0IHdpdGggY2FsbCBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJuIHtYTUxIdHRwUmVxdWVzdHxCb29sZWFufSBmYWxzZSBpbiBjYXNlIHdyb25nIHBhcmFtc1xuICogQGV4YW1wbGVcbiAqXHRcdFRPRE86IGFkZFxuICovXG5pby5hamF4ID0gZnVuY3Rpb24gKCB1cmwsIG9wdGlvbnMgKSB7XG5cdHZhciBpbmRleCwgaGVhZGVyc0tleXM7XG5cdC8vIGluaXRcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdC8vIHZhbGlkIG5vbi1lbXB0eSBzdHJpbmdcblx0aWYgKCB1cmwgJiYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnIHx8IHVybCBpbnN0YW5jZW9mIFN0cmluZykgJiYgdXJsLmxlbmd0aCA+IDAgKSB7XG5cdFx0Ly8gcGxhaW4gb2JqZWN0IGlzIGdpdmVuIGFzIHBhcmFtXG5cdFx0aWYgKCBvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Ly8gZXh0ZW5kIHdpdGggZGVmYXVsdCBvcHRpb25zXG5cdFx0XHRmb3IgKCBpbmRleCA9IDAgOyBpbmRleCA8IGRlZmF1bHRzS2V5cy5sZW5ndGggOyBpbmRleCsrICkge1xuXHRcdFx0XHQvLyBpbiBjYXNlIG5vdCByZWRlZmluZWRcblx0XHRcdFx0aWYgKCBvcHRpb25zW2RlZmF1bHRzS2V5c1tpbmRleF1dID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0b3B0aW9uc1tkZWZhdWx0c0tleXNbaW5kZXhdXSA9IGRlZmF1bHRzW2RlZmF1bHRzS2V5c1tpbmRleF1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGNsaWVudCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdC8vIGluaXQgYSByZXF1ZXN0XG5cdFx0Y2xpZW50Lm9wZW4ob3B0aW9ucy5tZXRob2QsIHVybCwgb3B0aW9ucy5hc3luYyk7XG5cblx0XHQvLyBhcHBseSB0aGUgZ2l2ZW4gaGVhZGVyc1xuXHRcdGlmICggb3B0aW9ucy5oZWFkZXJzICYmIHR5cGVvZiBvcHRpb25zLmhlYWRlcnMgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRoZWFkZXJzS2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMuaGVhZGVycyk7XG5cdFx0XHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgaGVhZGVyc0tleXMubGVuZ3RoOyBpbmRleCsrICkge1xuXHRcdFx0XHRjbGllbnQuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXJzS2V5c1tpbmRleF0sIG9wdGlvbnMuaGVhZGVyc1toZWFkZXJzS2V5c1tpbmRleF1dKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBzZXQgcmVzcG9uc2UgdHlwZSBhbmQgdGltZW91dFxuXHRcdGNsaWVudC5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnR5cGU7XG5cdFx0Y2xpZW50LnRpbWVvdXQgICAgICA9IG9wdGlvbnMudGltZW91dDtcblxuXHRcdC8vIGNhbGxiYWNrc1xuXHRcdGlmICggb3B0aW9ucy5vbmxvYWQgJiYgdHlwZW9mIG9wdGlvbnMub25sb2FkID09PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0Y2xpZW50Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdG9wdGlvbnMub25sb2FkLmNhbGwodGhpcywgdGhpcy5yZXNwb25zZSwgdGhpcy5zdGF0dXMpO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y2xpZW50Lm9uZXJyb3IgICA9IG9wdGlvbnMub25lcnJvcjtcblx0XHRjbGllbnQub250aW1lb3V0ID0gb3B0aW9ucy5vbnRpbWVvdXQ7XG5cblx0XHQvLyBhY3R1YWwgcmVxdWVzdFxuXHRcdC8vY2xpZW50LnNlbmQodGhpcy5lbmNvZGUob3B0aW9ucy5kYXRhKSk7XG5cdFx0Y2xpZW50LnNlbmQob3B0aW9ucy5kYXRhID8gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5kYXRhKSA6IG51bGwpO1xuXG5cdFx0cmV0dXJuIGNsaWVudDtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5cbi8qKlxuICogU2VyaWFsaXplcyB0aGUgZ2l2ZW4gZGF0YSBmb3Igc2VuZGluZyB0byB0aGUgc2VydmVyIHZpYSBhamF4IGNhbGxcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFBsYWluIG9iamVjdCB0byBzZXJpYWxpemVcbiAqIEByZXR1cm4ge1N0cmluZ30gbnVsbCBpZiBubyBkYXRhIHRvIGVuY29kZVxuICogQGV4YW1wbGVcbiAqXHRcdFRPRE86IGFkZFxuICovXG5pby5lbmNvZGUgPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG5cdHZhciByZXN1bHQgPSBbXSwgaW5kZXggPSAwLCBrZXlzO1xuXHQvLyBpbnB1dCBwbGFpbiBvYmplY3QgdmFsaWRhdGlvblxuXHRpZiAoIGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0a2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuXHRcdC8vIGFwcGx5IGVuY29kaW5nXG5cdFx0Zm9yICggOyBpbmRleCA8IGtleXMubGVuZ3RoOyBpbmRleCsrICkge1xuXHRcdFx0cmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleXNbaW5kZXhdKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChkYXRhW2tleXNbaW5kZXhdXSkpO1xuXHRcdH1cblx0XHQvLyBidWlsZCB0aGUgbGlzdCBvZiBwYXJhbXNcblx0XHRpZiAoIHJlc3VsdC5sZW5ndGggPiAwICkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdC5qb2luKCcmJyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuXG4vLyBwdWJsaWMgZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IGlvOyIsIi8qKlxuICogQmFzZSBtb2RlbCBpbXBsZW1lbnRhdGlvblxuICogQGF1dGhvciBEYXJrUGFya1xuICogQGxpY2Vuc2UgR05VIEdFTkVSQUwgUFVCTElDIExJQ0VOU0UgVmVyc2lvbiAzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zb2xlLmxvZygnL2NsaWVudC9qcy9saWIvbW9kZWwuanMnKTtcblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuL2VtaXR0ZXInKSxcblx0aW8gICAgICA9IHJlcXVpcmUoJy4vaW8nKTtcblxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIGluaXQgYXR0cmlidXRlc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIE1vZGVsICggYXR0cmlidXRlcyApIHtcblx0Ly8gcGFyZW50IGluaXRcblx0RW1pdHRlci5jYWxsKHRoaXMpO1xuXHQvLyBpbml0XG5cdHRoaXMuX2RhdGEgID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0dGhpcy5pZE5hbWUgPSAnX2lkJztcblx0dGhpcy51cmwgICAgPSBudWxsO1xuXHR0aGlzLmF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG59XG5cblxuLy8gaW5oZXJpdGFuY2Vcbk1vZGVsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW1pdHRlci5wcm90b3R5cGUpO1xuTW9kZWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW9kZWw7XG5cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBhdHRyaWJ1dGVzIGZyb20gdGhlIG1vZGVsXG4gKi9cbk1vZGVsLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fZGF0YSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdHRoaXMuZW1pdCgnY2xlYXInKTtcbn07XG5cblxuTW9kZWwucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHQvL1RPRE86IHJlc3RvcmUgaW5pdCBkYXRhXG5cdHRoaXMuZW1pdCgncmVzZXQnKTtcbn07XG5cblxuLyoqXG4gKiBHZXRzIHRoZSBtb2RlbCBhdHRyaWJ1dGUgYnkgbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBrZXlcbiAqIEByZXR1cm4geyp9XG4gKi9cbk1vZGVsLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoIGtleSApIHtcblx0cmV0dXJuIHRoaXMuX2RhdGFba2V5XTtcbn07XG5cblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBnaXZlbiBtb2RlbCBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0ga2V5XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKi9cbk1vZGVsLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7XG5cdHZhciBwcmV2aW91cyA9IHRoaXMuZ2V0KGtleSk7XG5cdHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuXHQvLyB0cmlnZ2VyIG9ubHkgaWYgdmFsdWVzIGFyZSBkaWZmZXJlbnRcblx0aWYgKCB2YWx1ZSAhPT0gcHJldmlvdXMgKSB7XG5cdFx0dGhpcy5lbWl0KCdjaGFuZ2UnLCBrZXksIHZhbHVlLCBwcmV2aW91cyk7XG5cdH1cbn07XG5cblxuLyoqXG4gKiBFeHRlbmRzIHRoZSBtb2RlbCB3aXRoIHRoZSBnaXZlbiBhdHRyaWJ1dGUgbGlzdFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqL1xuTW9kZWwucHJvdG90eXBlLmF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG5cdHZhciBpbmRleCAgID0gMCxcblx0XHRrZXlMaXN0ID0gZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgPyBPYmplY3Qua2V5cyhkYXRhKSA6IFtdO1xuXHRmb3IgKCA7IGluZGV4IDwga2V5TGlzdC5sZW5ndGg7IGluZGV4KysgKSB7XG5cdFx0dGhpcy5zZXQoa2V5TGlzdFtpbmRleF0sIGRhdGFba2V5TGlzdFtpbmRleF1dKTtcblx0fVxufTtcblxuXG4vKipcbiAqIENoZWNrIGFuIGF0dHJpYnV0ZSBleGlzdGVuY2VcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0ga2V5XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5Nb2RlbC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKCBrZXkgKSB7XG5cdHJldHVybiB0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGtleSk7XG59O1xuXG5cbi8qKlxuICogRGVsZXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IGtleVxuICovXG5Nb2RlbC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCBrZXkgKSB7XG5cdHZhciBwcmV2aW91cyA9IHRoaXMuZ2V0KGtleSk7XG5cdGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG5cdHRoaXMuZW1pdCgnY2hhbmdlJywga2V5LCB1bmRlZmluZWQsIHByZXZpb3VzKTtcbn07XG5cblxuLyoqXG4gKiBQcmVwYXJlIGFsbCBkYXRhIGZvciBzZW5kaW5nIHRvIGEgc2VydmVyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbk1vZGVsLnByb3RvdHlwZS5wYWNrID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gdGhpcy5fZGF0YTtcbn07XG5cblxuLyoqXG4gKiBSZXN0b3JlcyB0aGUgcmVjZWl2ZWQgZGF0YSBmcm9tIGEgc2VydmVyIHRvIGEgbW9kZWwgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuTW9kZWwucHJvdG90eXBlLnVucGFjayA9IGZ1bmN0aW9uICggZGF0YSApIHtcblx0cmV0dXJuIGRhdGE7XG59O1xuXG5cbi8qKlxuICogU3luYyBtb2RlbCB0byBhIHNlcnZlclxuICovXG5Nb2RlbC5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRpZiAoIHRoaXMudXJsICkge1xuXHRcdC8vIGNvbGxlY3QgZGF0YVxuXHRcdGlvLmFqYXgodGhpcy51cmwsIHtcblx0XHRcdC8vIHJlcXVlc3QgcGFyYW1zXG5cdFx0XHRtZXRob2Q6IHNlbGYuX2RhdGFbc2VsZi5pZE5hbWVdID8gJ3B1dCcgOiAncG9zdCcsXG5cdFx0XHRkYXRhICA6IHNlbGYucGFjaygpLFxuXHRcdFx0b25sb2FkOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0ZGF0YSA9IHNlbGYudW5wYWNrKHNlbGYucGFyc2UoZGF0YSkpO1xuXHRcdFx0XHRzZWxmLmF0dHJpYnV0ZXMoZGF0YSk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRzZWxmLmVtaXQoJ3NhdmUnLCB0cnVlKTtcblx0XHRcdH0sXG5cdFx0XHQvLyBlcnJvciBoYW5kbGVyc1xuXHRcdFx0b25lcnJvcjogICB0aGlzLnNhdmVGYWlsdXJlLFxuXHRcdFx0b250aW1lb3V0OiB0aGlzLnNhdmVGYWlsdXJlXG5cdFx0fSk7XG5cdH1cbn07XG5cblxuLyoqXG4gKiBFcnJvciBoYW5kbGVyIHdoaWxlIG1vZGVsIGRhdGEgZmV0Y2hcbiAqL1xuTW9kZWwucHJvdG90eXBlLnNhdmVGYWlsdXJlID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLmVtaXQoJ3NhdmUnLCBmYWxzZSk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgcmVjZWl2ZWQgZGF0YSBmcm9tIGEgc2VydmVyIHRvIGEgbW9kZWwgYXR0cmlidXRlc1xuICogQHBhcmFtIHtTdHJpbmd9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbk1vZGVsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICggcmVzcG9uc2UgKSB7XG5cdHZhciBkYXRhID0ge307XG5cdHRyeSB7XG5cdFx0ZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmRhdGE7XG5cdH0gY2F0Y2goZSl7IGNvbnNvbGUubG9nKGUpOyB9XG5cdHJldHVybiBkYXRhO1xufTtcblxuXG4vLyBwdWJsaWMgZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsOyIsIi8qKlxuICogQmFzZSBwYWdlIGltcGxlbWVudGF0aW9uXG4gKiBAYXV0aG9yIERhcmtQYXJrXG4gKiBAbGljZW5zZSBHTlUgR0VORVJBTCBQVUJMSUMgTElDRU5TRSBWZXJzaW9uIDNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnNvbGUubG9nKCcvY2xpZW50L2pzL2xpYi9wYWdlLmpzJyk7XG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnLi9lbWl0dGVyJyk7XG5cblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgaW5pdCBhdHRyaWJ1dGVzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gUGFnZSAoIG5vZGUgKSB7XG5cdC8vIHBhcmVudCBpbml0XG5cdEVtaXR0ZXIuY2FsbCh0aGlzKTtcblx0Ly8gaW5pdFxuXHR0aGlzLiRub2RlID0gbm9kZTtcblx0dGhpcy5fZGF0YSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cblxuLy8gaW5oZXJpdGFuY2VcblBhZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbWl0dGVyLnByb3RvdHlwZSk7XG5QYWdlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBhZ2U7XG5cblxuLyoqXG4gKiBTaG93IHBhZ2VcbiAqL1xuUGFnZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy4kbm9kZS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0dGhpcy5lbWl0KCdzaG93Jyk7XG59O1xuXG5cbi8qKlxuICogSGlkZSBwYWdlXG4gKi9cblBhZ2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuJG5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdHRoaXMuZW1pdCgnaGlkZScpO1xufTtcblxuXG4vLyBwdWJsaWMgZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2U7XG4iLCIvKiogQGZpbGVPdmVydmlldyBKYXZhc2NyaXB0IGNyeXB0b2dyYXBoeSBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBDcnVzaCB0byByZW1vdmUgY29tbWVudHMsIHNob3J0ZW4gdmFyaWFibGUgbmFtZXMgYW5kXG4gKiBnZW5lcmFsbHkgcmVkdWNlIHRyYW5zbWlzc2lvbiBzaXplLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuLypqc2xpbnQgaW5kZW50OiAyLCBiaXR3aXNlOiBmYWxzZSwgbm9tZW46IGZhbHNlLCBwbHVzcGx1czogZmFsc2UsIHdoaXRlOiBmYWxzZSwgcmVnZXhwOiBmYWxzZSAqL1xuLypnbG9iYWwgZG9jdW1lbnQsIHdpbmRvdywgZXNjYXBlLCB1bmVzY2FwZSwgbW9kdWxlLCByZXF1aXJlLCBVaW50MzJBcnJheSAqL1xuXG5jb25zb2xlLmxvZygnL2NsaWVudC9qcy9saWIvc2pjbC5qcycpO1xuXG4vKiogQG5hbWVzcGFjZSBUaGUgU3RhbmZvcmQgSmF2YXNjcmlwdCBDcnlwdG8gTGlicmFyeSwgdG9wLWxldmVsIG5hbWVzcGFjZS4gKi9cbnZhciBzamNsID0ge1xuICAvKiogQG5hbWVzcGFjZSBTeW1tZXRyaWMgY2lwaGVycy4gKi9cbiAgY2lwaGVyOiB7fSxcblxuICAvKiogQG5hbWVzcGFjZSBIYXNoIGZ1bmN0aW9ucy4gIFJpZ2h0IG5vdyBvbmx5IFNIQTI1NiBpcyBpbXBsZW1lbnRlZC4gKi9cbiAgaGFzaDoge30sXG5cbiAgLyoqIEBuYW1lc3BhY2UgS2V5IGV4Y2hhbmdlIGZ1bmN0aW9ucy4gIFJpZ2h0IG5vdyBvbmx5IFNSUCBpcyBpbXBsZW1lbnRlZC4gKi9cbiAga2V5ZXhjaGFuZ2U6IHt9LFxuICBcbiAgLyoqIEBuYW1lc3BhY2UgQmxvY2sgY2lwaGVyIG1vZGVzIG9mIG9wZXJhdGlvbi4gKi9cbiAgbW9kZToge30sXG5cbiAgLyoqIEBuYW1lc3BhY2UgTWlzY2VsbGFuZW91cy4gIEhNQUMgYW5kIFBCS0RGMi4gKi9cbiAgbWlzYzoge30sXG4gIFxuICAvKipcbiAgICogQG5hbWVzcGFjZSBCaXQgYXJyYXkgZW5jb2RlcnMgYW5kIGRlY29kZXJzLlxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIG1lbWJlcnMgb2YgdGhpcyBuYW1lc3BhY2UgYXJlIGZ1bmN0aW9ucyB3aGljaCB0cmFuc2xhdGUgYmV0d2VlblxuICAgKiBTSkNMJ3MgYml0QXJyYXlzIGFuZCBvdGhlciBvYmplY3RzICh1c3VhbGx5IHN0cmluZ3MpLiAgQmVjYXVzZSBpdFxuICAgKiBpc24ndCBhbHdheXMgY2xlYXIgd2hpY2ggZGlyZWN0aW9uIGlzIGVuY29kaW5nIGFuZCB3aGljaCBpcyBkZWNvZGluZyxcbiAgICogdGhlIG1ldGhvZCBuYW1lcyBhcmUgXCJmcm9tQml0c1wiIGFuZCBcInRvQml0c1wiLlxuICAgKi9cbiAgY29kZWM6IHt9LFxuICBcbiAgLyoqIEBuYW1lc3BhY2UgRXhjZXB0aW9ucy4gKi9cbiAgZXhjZXB0aW9uOiB7XG4gICAgLyoqIEBjb25zdHJ1Y3RvciBDaXBoZXJ0ZXh0IGlzIGNvcnJ1cHQuICovXG4gICAgY29ycnVwdDogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJDT1JSVVBUOiBcIit0aGlzLm1lc3NhZ2U7IH07XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH0sXG4gICAgXG4gICAgLyoqIEBjb25zdHJ1Y3RvciBJbnZhbGlkIHBhcmFtZXRlci4gKi9cbiAgICBpbnZhbGlkOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBcIklOVkFMSUQ6IFwiK3RoaXMubWVzc2FnZTsgfTtcbiAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfSxcbiAgICBcbiAgICAvKiogQGNvbnN0cnVjdG9yIEJ1ZyBvciBtaXNzaW5nIGZlYXR1cmUgaW4gU0pDTC4gQGNvbnN0cnVjdG9yICovXG4gICAgYnVnOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBcIkJVRzogXCIrdGhpcy5tZXNzYWdlOyB9O1xuICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9LFxuXG4gICAgLyoqIEBjb25zdHJ1Y3RvciBTb21ldGhpbmcgaXNuJ3QgcmVhZHkuICovXG4gICAgbm90UmVhZHk6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIFwiTk9UIFJFQURZOiBcIit0aGlzLm1lc3NhZ2U7IH07XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgfVxufTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICBtb2R1bGUuZXhwb3J0cyA9IHNqY2w7XG59XG4vKiogQGZpbGVPdmVydmlldyBMb3ctbGV2ZWwgQUVTIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIFRoaXMgZmlsZSBjb250YWlucyBhIGxvdy1sZXZlbCBpbXBsZW1lbnRhdGlvbiBvZiBBRVMsIG9wdGltaXplZCBmb3JcbiAqIHNpemUgYW5kIGZvciBlZmZpY2llbmN5IG9uIHNldmVyYWwgYnJvd3NlcnMuICBJdCBpcyBiYXNlZCBvblxuICogT3BlblNTTCdzIGFlc19jb3JlLmMsIGEgcHVibGljLWRvbWFpbiBpbXBsZW1lbnRhdGlvbiBieSBWaW5jZW50XG4gKiBSaWptZW4sIEFudG9vbiBCb3NzZWxhZXJzIGFuZCBQYXVsbyBCYXJyZXRvLlxuICpcbiAqIEFuIG9sZGVyIHZlcnNpb24gb2YgdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgaW4gdGhlIHB1YmxpY1xuICogZG9tYWluLCBidXQgdGhpcyBvbmUgaXMgKGMpIEVtaWx5IFN0YXJrLCBNaWtlIEhhbWJ1cmcsIERhbiBCb25laCxcbiAqIFN0YW5mb3JkIFVuaXZlcnNpdHkgMjAwOC0yMDEwIGFuZCBCU0QtbGljZW5zZWQgZm9yIGxpYWJpbGl0eVxuICogcmVhc29ucy5cbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqL1xuXG4vKipcbiAqIFNjaGVkdWxlIG91dCBhbiBBRVMga2V5IGZvciBib3RoIGVuY3J5cHRpb24gYW5kIGRlY3J5cHRpb24uICBUaGlzXG4gKiBpcyBhIGxvdy1sZXZlbCBjbGFzcy4gIFVzZSBhIGNpcGhlciBtb2RlIHRvIGRvIGJ1bGsgZW5jcnlwdGlvbi5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IGtleSBUaGUga2V5IGFzIGFuIGFycmF5IG9mIDQsIDYgb3IgOCB3b3Jkcy5cbiAqXG4gKiBAY2xhc3MgQWR2YW5jZWQgRW5jcnlwdGlvbiBTdGFuZGFyZCAobG93LWxldmVsIGludGVyZmFjZSlcbiAqL1xuc2pjbC5jaXBoZXIuYWVzID0gZnVuY3Rpb24gKGtleSkge1xuICBpZiAoIXRoaXMuX3RhYmxlc1swXVswXVswXSkge1xuICAgIHRoaXMuX3ByZWNvbXB1dGUoKTtcbiAgfVxuICBcbiAgdmFyIGksIGosIHRtcCxcbiAgICBlbmNLZXksIGRlY0tleSxcbiAgICBzYm94ID0gdGhpcy5fdGFibGVzWzBdWzRdLCBkZWNUYWJsZSA9IHRoaXMuX3RhYmxlc1sxXSxcbiAgICBrZXlMZW4gPSBrZXkubGVuZ3RoLCByY29uID0gMTtcbiAgXG4gIGlmIChrZXlMZW4gIT09IDQgJiYga2V5TGVuICE9PSA2ICYmIGtleUxlbiAhPT0gOCkge1xuICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwiaW52YWxpZCBhZXMga2V5IHNpemVcIik7XG4gIH1cbiAgXG4gIHRoaXMuX2tleSA9IFtlbmNLZXkgPSBrZXkuc2xpY2UoMCksIGRlY0tleSA9IFtdXTtcbiAgXG4gIC8vIHNjaGVkdWxlIGVuY3J5cHRpb24ga2V5c1xuICBmb3IgKGkgPSBrZXlMZW47IGkgPCA0ICoga2V5TGVuICsgMjg7IGkrKykge1xuICAgIHRtcCA9IGVuY0tleVtpLTFdO1xuICAgIFxuICAgIC8vIGFwcGx5IHNib3hcbiAgICBpZiAoaSVrZXlMZW4gPT09IDAgfHwgKGtleUxlbiA9PT0gOCAmJiBpJWtleUxlbiA9PT0gNCkpIHtcbiAgICAgIHRtcCA9IHNib3hbdG1wPj4+MjRdPDwyNCBeIHNib3hbdG1wPj4xNiYyNTVdPDwxNiBeIHNib3hbdG1wPj44JjI1NV08PDggXiBzYm94W3RtcCYyNTVdO1xuICAgICAgXG4gICAgICAvLyBzaGlmdCByb3dzIGFuZCBhZGQgcmNvblxuICAgICAgaWYgKGkla2V5TGVuID09PSAwKSB7XG4gICAgICAgIHRtcCA9IHRtcDw8OCBeIHRtcD4+PjI0IF4gcmNvbjw8MjQ7XG4gICAgICAgIHJjb24gPSByY29uPDwxIF4gKHJjb24+PjcpKjI4MztcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZW5jS2V5W2ldID0gZW5jS2V5W2kta2V5TGVuXSBeIHRtcDtcbiAgfVxuICBcbiAgLy8gc2NoZWR1bGUgZGVjcnlwdGlvbiBrZXlzXG4gIGZvciAoaiA9IDA7IGk7IGorKywgaS0tKSB7XG4gICAgdG1wID0gZW5jS2V5W2omMyA/IGkgOiBpIC0gNF07XG4gICAgaWYgKGk8PTQgfHwgajw0KSB7XG4gICAgICBkZWNLZXlbal0gPSB0bXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlY0tleVtqXSA9IGRlY1RhYmxlWzBdW3Nib3hbdG1wPj4+MjQgICAgICBdXSBeXG4gICAgICAgICAgICAgICAgICBkZWNUYWJsZVsxXVtzYm94W3RtcD4+MTYgICYgMjU1XV0gXlxuICAgICAgICAgICAgICAgICAgZGVjVGFibGVbMl1bc2JveFt0bXA+PjggICAmIDI1NV1dIF5cbiAgICAgICAgICAgICAgICAgIGRlY1RhYmxlWzNdW3Nib3hbdG1wICAgICAgJiAyNTVdXTtcbiAgICB9XG4gIH1cbn07XG5cbnNqY2wuY2lwaGVyLmFlcy5wcm90b3R5cGUgPSB7XG4gIC8vIHB1YmxpY1xuICAvKiBTb21ldGhpbmcgbGlrZSB0aGlzIG1pZ2h0IGFwcGVhciBoZXJlIGV2ZW50dWFsbHlcbiAgbmFtZTogXCJBRVNcIixcbiAgYmxvY2tTaXplOiA0LFxuICBrZXlTaXplczogWzQsNiw4XSxcbiAgKi9cbiAgXG4gIC8qKlxuICAgKiBFbmNyeXB0IGFuIGFycmF5IG9mIDQgYmlnLWVuZGlhbiB3b3Jkcy5cbiAgICogQHBhcmFtIHtBcnJheX0gZGF0YSBUaGUgcGxhaW50ZXh0LlxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGNpcGhlcnRleHQuXG4gICAqL1xuICBlbmNyeXB0OmZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiB0aGlzLl9jcnlwdChkYXRhLDApOyB9LFxuICBcbiAgLyoqXG4gICAqIERlY3J5cHQgYW4gYXJyYXkgb2YgNCBiaWctZW5kaWFuIHdvcmRzLlxuICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhIFRoZSBjaXBoZXJ0ZXh0LlxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIHBsYWludGV4dC5cbiAgICovXG4gIGRlY3J5cHQ6ZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIHRoaXMuX2NyeXB0KGRhdGEsMSk7IH0sXG4gIFxuICAvKipcbiAgICogVGhlIGV4cGFuZGVkIFMtYm94IGFuZCBpbnZlcnNlIFMtYm94IHRhYmxlcy4gIFRoZXNlIHdpbGwgYmUgY29tcHV0ZWRcbiAgICogb24gdGhlIGNsaWVudCBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gc2VuZCB0aGVtIGRvd24gdGhlIHdpcmUuXG4gICAqXG4gICAqIFRoZXJlIGFyZSB0d28gdGFibGVzLCBfdGFibGVzWzBdIGlzIGZvciBlbmNyeXB0aW9uIGFuZFxuICAgKiBfdGFibGVzWzFdIGlzIGZvciBkZWNyeXB0aW9uLlxuICAgKlxuICAgKiBUaGUgZmlyc3QgNCBzdWItdGFibGVzIGFyZSB0aGUgZXhwYW5kZWQgUy1ib3ggd2l0aCBNaXhDb2x1bW5zLiAgVGhlXG4gICAqIGxhc3QgKF90YWJsZXNbMDFdWzRdKSBpcyB0aGUgUy1ib3ggaXRzZWxmLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3RhYmxlczogW1tbXSxbXSxbXSxbXSxbXV0sW1tdLFtdLFtdLFtdLFtdXV0sXG5cbiAgLyoqXG4gICAqIEV4cGFuZCB0aGUgUy1ib3ggdGFibGVzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3ByZWNvbXB1dGU6IGZ1bmN0aW9uICgpIHtcbiAgIHZhciBlbmNUYWJsZSA9IHRoaXMuX3RhYmxlc1swXSwgZGVjVGFibGUgPSB0aGlzLl90YWJsZXNbMV0sXG4gICAgICAgc2JveCA9IGVuY1RhYmxlWzRdLCBzYm94SW52ID0gZGVjVGFibGVbNF0sXG4gICAgICAgaSwgeCwgeEludiwgZD1bXSwgdGg9W10sIHgyLCB4NCwgeDgsIHMsIHRFbmMsIHREZWM7XG5cbiAgICAvLyBDb21wdXRlIGRvdWJsZSBhbmQgdGhpcmQgdGFibGVzXG4gICBmb3IgKGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgdGhbKCBkW2ldID0gaTw8MSBeIChpPj43KSoyODMgKV5pXT1pO1xuICAgfVxuICAgXG4gICBmb3IgKHggPSB4SW52ID0gMDsgIXNib3hbeF07IHggXj0geDIgfHwgMSwgeEludiA9IHRoW3hJbnZdIHx8IDEpIHtcbiAgICAgLy8gQ29tcHV0ZSBzYm94XG4gICAgIHMgPSB4SW52IF4geEludjw8MSBeIHhJbnY8PDIgXiB4SW52PDwzIF4geEludjw8NDtcbiAgICAgcyA9IHM+PjggXiBzJjI1NSBeIDk5O1xuICAgICBzYm94W3hdID0gcztcbiAgICAgc2JveEludltzXSA9IHg7XG4gICAgIFxuICAgICAvLyBDb21wdXRlIE1peENvbHVtbnNcbiAgICAgeDggPSBkW3g0ID0gZFt4MiA9IGRbeF1dXTtcbiAgICAgdERlYyA9IHg4KjB4MTAxMDEwMSBeIHg0KjB4MTAwMDEgXiB4MioweDEwMSBeIHgqMHgxMDEwMTAwO1xuICAgICB0RW5jID0gZFtzXSoweDEwMSBeIHMqMHgxMDEwMTAwO1xuICAgICBcbiAgICAgZm9yIChpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgIGVuY1RhYmxlW2ldW3hdID0gdEVuYyA9IHRFbmM8PDI0IF4gdEVuYz4+Pjg7XG4gICAgICAgZGVjVGFibGVbaV1bc10gPSB0RGVjID0gdERlYzw8MjQgXiB0RGVjPj4+ODtcbiAgICAgfVxuICAgfVxuICAgXG4gICAvLyBDb21wYWN0aWZ5LiAgQ29uc2lkZXJhYmxlIHNwZWVkdXAgb24gRmlyZWZveC5cbiAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgZW5jVGFibGVbaV0gPSBlbmNUYWJsZVtpXS5zbGljZSgwKTtcbiAgICAgZGVjVGFibGVbaV0gPSBkZWNUYWJsZVtpXS5zbGljZSgwKTtcbiAgIH1cbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBFbmNyeXB0aW9uIGFuZCBkZWNyeXB0aW9uIGNvcmUuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGlucHV0IEZvdXIgd29yZHMgdG8gYmUgZW5jcnlwdGVkIG9yIGRlY3J5cHRlZC5cbiAgICogQHBhcmFtIGRpciBUaGUgZGlyZWN0aW9uLCAwIGZvciBlbmNyeXB0IGFuZCAxIGZvciBkZWNyeXB0LlxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGZvdXIgZW5jcnlwdGVkIG9yIGRlY3J5cHRlZCB3b3Jkcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jcnlwdDpmdW5jdGlvbiAoaW5wdXQsIGRpcikge1xuICAgIGlmIChpbnB1dC5sZW5ndGggIT09IDQpIHtcbiAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwiaW52YWxpZCBhZXMgYmxvY2sgc2l6ZVwiKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIGtleSA9IHRoaXMuX2tleVtkaXJdLFxuICAgICAgICAvLyBzdGF0ZSB2YXJpYWJsZXMgYSxiLGMsZCBhcmUgbG9hZGVkIHdpdGggcHJlLXdoaXRlbmVkIGRhdGFcbiAgICAgICAgYSA9IGlucHV0WzBdICAgICAgICAgICBeIGtleVswXSxcbiAgICAgICAgYiA9IGlucHV0W2RpciA/IDMgOiAxXSBeIGtleVsxXSxcbiAgICAgICAgYyA9IGlucHV0WzJdICAgICAgICAgICBeIGtleVsyXSxcbiAgICAgICAgZCA9IGlucHV0W2RpciA/IDEgOiAzXSBeIGtleVszXSxcbiAgICAgICAgYTIsIGIyLCBjMixcbiAgICAgICAgXG4gICAgICAgIG5Jbm5lclJvdW5kcyA9IGtleS5sZW5ndGgvNCAtIDIsXG4gICAgICAgIGksXG4gICAgICAgIGtJbmRleCA9IDQsXG4gICAgICAgIG91dCA9IFswLDAsMCwwXSxcbiAgICAgICAgdGFibGUgPSB0aGlzLl90YWJsZXNbZGlyXSxcbiAgICAgICAgXG4gICAgICAgIC8vIGxvYWQgdXAgdGhlIHRhYmxlc1xuICAgICAgICB0MCAgICA9IHRhYmxlWzBdLFxuICAgICAgICB0MSAgICA9IHRhYmxlWzFdLFxuICAgICAgICB0MiAgICA9IHRhYmxlWzJdLFxuICAgICAgICB0MyAgICA9IHRhYmxlWzNdLFxuICAgICAgICBzYm94ICA9IHRhYmxlWzRdO1xuIFxuICAgIC8vIElubmVyIHJvdW5kcy4gIENyaWJiZWQgZnJvbSBPcGVuU1NMLlxuICAgIGZvciAoaSA9IDA7IGkgPCBuSW5uZXJSb3VuZHM7IGkrKykge1xuICAgICAgYTIgPSB0MFthPj4+MjRdIF4gdDFbYj4+MTYgJiAyNTVdIF4gdDJbYz4+OCAmIDI1NV0gXiB0M1tkICYgMjU1XSBeIGtleVtrSW5kZXhdO1xuICAgICAgYjIgPSB0MFtiPj4+MjRdIF4gdDFbYz4+MTYgJiAyNTVdIF4gdDJbZD4+OCAmIDI1NV0gXiB0M1thICYgMjU1XSBeIGtleVtrSW5kZXggKyAxXTtcbiAgICAgIGMyID0gdDBbYz4+PjI0XSBeIHQxW2Q+PjE2ICYgMjU1XSBeIHQyW2E+PjggJiAyNTVdIF4gdDNbYiAmIDI1NV0gXiBrZXlba0luZGV4ICsgMl07XG4gICAgICBkICA9IHQwW2Q+Pj4yNF0gXiB0MVthPj4xNiAmIDI1NV0gXiB0MltiPj44ICYgMjU1XSBeIHQzW2MgJiAyNTVdIF4ga2V5W2tJbmRleCArIDNdO1xuICAgICAga0luZGV4ICs9IDQ7XG4gICAgICBhPWEyOyBiPWIyOyBjPWMyO1xuICAgIH1cbiAgICAgICAgXG4gICAgLy8gTGFzdCByb3VuZC5cbiAgICBmb3IgKGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBvdXRbZGlyID8gMyYtaSA6IGldID1cbiAgICAgICAgc2JveFthPj4+MjQgICAgICBdPDwyNCBeIFxuICAgICAgICBzYm94W2I+PjE2ICAmIDI1NV08PDE2IF5cbiAgICAgICAgc2JveFtjPj44ICAgJiAyNTVdPDw4ICBeXG4gICAgICAgIHNib3hbZCAgICAgICYgMjU1XSAgICAgXlxuICAgICAgICBrZXlba0luZGV4KytdO1xuICAgICAgYTI9YTsgYT1iOyBiPWM7IGM9ZDsgZD1hMjtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxuLyoqIEBmaWxlT3ZlcnZpZXcgQXJyYXlzIG9mIGJpdHMsIGVuY29kZWQgYXMgYXJyYXlzIG9mIE51bWJlcnMuXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cblxuLyoqIEBuYW1lc3BhY2UgQXJyYXlzIG9mIGJpdHMsIGVuY29kZWQgYXMgYXJyYXlzIG9mIE51bWJlcnMuXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiA8cD5cbiAqIFRoZXNlIG9iamVjdHMgYXJlIHRoZSBjdXJyZW5jeSBhY2NlcHRlZCBieSBTSkNMJ3MgY3J5cHRvIGZ1bmN0aW9ucy5cbiAqIDwvcD5cbiAqXG4gKiA8cD5cbiAqIE1vc3Qgb2Ygb3VyIGNyeXB0byBwcmltaXRpdmVzIG9wZXJhdGUgb24gYXJyYXlzIG9mIDQtYnl0ZSB3b3JkcyBpbnRlcm5hbGx5LFxuICogYnV0IG1hbnkgb2YgdGhlbSBjYW4gdGFrZSBhcmd1bWVudHMgdGhhdCBhcmUgbm90IGEgbXVsdGlwbGUgb2YgNCBieXRlcy5cbiAqIFRoaXMgbGlicmFyeSBlbmNvZGVzIGFycmF5cyBvZiBiaXRzICh3aG9zZSBzaXplIG5lZWQgbm90IGJlIGEgbXVsdGlwbGUgb2YgOFxuICogYml0cykgYXMgYXJyYXlzIG9mIDMyLWJpdCB3b3Jkcy4gIFRoZSBiaXRzIGFyZSBwYWNrZWQsIGJpZy1lbmRpYW4sIGludG8gYW5cbiAqIGFycmF5IG9mIHdvcmRzLCAzMiBiaXRzIGF0IGEgdGltZS4gIFNpbmNlIHRoZSB3b3JkcyBhcmUgZG91YmxlLXByZWNpc2lvblxuICogZmxvYXRpbmcgcG9pbnQgbnVtYmVycywgdGhleSBmaXQgc29tZSBleHRyYSBkYXRhLiAgV2UgdXNlIHRoaXMgKGluIGEgcHJpdmF0ZSxcbiAqIHBvc3NpYmx5LWNoYW5naW5nIG1hbm5lcikgdG8gZW5jb2RlIHRoZSBudW1iZXIgb2YgYml0cyBhY3R1YWxseSAgcHJlc2VudFxuICogaW4gdGhlIGxhc3Qgd29yZCBvZiB0aGUgYXJyYXkuXG4gKiA8L3A+XG4gKlxuICogPHA+XG4gKiBCZWNhdXNlIGJpdHdpc2Ugb3BzIGNsZWFyIHRoaXMgb3V0LW9mLWJhbmQgZGF0YSwgdGhlc2UgYXJyYXlzIGNhbiBiZSBwYXNzZWRcbiAqIHRvIGNpcGhlcnMgbGlrZSBBRVMgd2hpY2ggd2FudCBhcnJheXMgb2Ygd29yZHMuXG4gKiA8L3A+XG4gKi9cbnNqY2wuYml0QXJyYXkgPSB7XG4gIC8qKlxuICAgKiBBcnJheSBzbGljZXMgaW4gdW5pdHMgb2YgYml0cy5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gYSBUaGUgYXJyYXkgdG8gc2xpY2UuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBic3RhcnQgVGhlIG9mZnNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHNsaWNlLCBpbiBiaXRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gYmVuZCBUaGUgb2Zmc2V0IHRvIHRoZSBlbmQgb2YgdGhlIHNsaWNlLCBpbiBiaXRzLiAgSWYgdGhpcyBpcyB1bmRlZmluZWQsXG4gICAqIHNsaWNlIHVudGlsIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxuICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIHJlcXVlc3RlZCBzbGljZS5cbiAgICovXG4gIGJpdFNsaWNlOiBmdW5jdGlvbiAoYSwgYnN0YXJ0LCBiZW5kKSB7XG4gICAgYSA9IHNqY2wuYml0QXJyYXkuX3NoaWZ0UmlnaHQoYS5zbGljZShic3RhcnQvMzIpLCAzMiAtIChic3RhcnQgJiAzMSkpLnNsaWNlKDEpO1xuICAgIHJldHVybiAoYmVuZCA9PT0gdW5kZWZpbmVkKSA/IGEgOiBzamNsLmJpdEFycmF5LmNsYW1wKGEsIGJlbmQtYnN0YXJ0KTtcbiAgfSxcblxuICAvKipcbiAgICogRXh0cmFjdCBhIG51bWJlciBwYWNrZWQgaW50byBhIGJpdCBhcnJheS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gYSBUaGUgYXJyYXkgdG8gc2xpY2UuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBic3RhcnQgVGhlIG9mZnNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHNsaWNlLCBpbiBiaXRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIG51bWJlciB0byBleHRyYWN0LlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSByZXF1ZXN0ZWQgc2xpY2UuXG4gICAqL1xuICBleHRyYWN0OiBmdW5jdGlvbihhLCBic3RhcnQsIGJsZW5ndGgpIHtcbiAgICAvLyBGSVhNRTogdGhpcyBNYXRoLmZsb29yIGlzIG5vdCBuZWNlc3NhcnkgYXQgYWxsLCBidXQgZm9yIHNvbWUgcmVhc29uXG4gICAgLy8gc2VlbXMgdG8gc3VwcHJlc3MgYSBidWcgaW4gdGhlIENocm9taXVtIEpJVC5cbiAgICB2YXIgeCwgc2ggPSBNYXRoLmZsb29yKCgtYnN0YXJ0LWJsZW5ndGgpICYgMzEpO1xuICAgIGlmICgoYnN0YXJ0ICsgYmxlbmd0aCAtIDEgXiBic3RhcnQpICYgLTMyKSB7XG4gICAgICAvLyBpdCBjcm9zc2VzIGEgYm91bmRhcnlcbiAgICAgIHggPSAoYVtic3RhcnQvMzJ8MF0gPDwgKDMyIC0gc2gpKSBeIChhW2JzdGFydC8zMisxfDBdID4+PiBzaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdpdGhpbiBhIHNpbmdsZSB3b3JkXG4gICAgICB4ID0gYVtic3RhcnQvMzJ8MF0gPj4+IHNoO1xuICAgIH1cbiAgICByZXR1cm4geCAmICgoMTw8Ymxlbmd0aCkgLSAxKTtcbiAgfSxcblxuICAvKipcbiAgICogQ29uY2F0ZW5hdGUgdHdvIGJpdCBhcnJheXMuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGExIFRoZSBmaXJzdCBhcnJheS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gYTIgVGhlIHNlY29uZCBhcnJheS5cbiAgICogQHJldHVybiB7Yml0QXJyYXl9IFRoZSBjb25jYXRlbmF0aW9uIG9mIGExIGFuZCBhMi5cbiAgICovXG4gIGNvbmNhdDogZnVuY3Rpb24gKGExLCBhMikge1xuICAgIGlmIChhMS5sZW5ndGggPT09IDAgfHwgYTIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYTEuY29uY2F0KGEyKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIG91dCwgaSwgbGFzdCA9IGExW2ExLmxlbmd0aC0xXSwgc2hpZnQgPSBzamNsLmJpdEFycmF5LmdldFBhcnRpYWwobGFzdCk7XG4gICAgaWYgKHNoaWZ0ID09PSAzMikge1xuICAgICAgcmV0dXJuIGExLmNvbmNhdChhMik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzamNsLmJpdEFycmF5Ll9zaGlmdFJpZ2h0KGEyLCBzaGlmdCwgbGFzdHwwLCBhMS5zbGljZSgwLGExLmxlbmd0aC0xKSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBsZW5ndGggb2YgYW4gYXJyYXkgb2YgYml0cy5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gYSBUaGUgYXJyYXkuXG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGxlbmd0aCBvZiBhLCBpbiBiaXRzLlxuICAgKi9cbiAgYml0TGVuZ3RoOiBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBsID0gYS5sZW5ndGgsIHg7XG4gICAgaWYgKGwgPT09IDApIHsgcmV0dXJuIDA7IH1cbiAgICB4ID0gYVtsIC0gMV07XG4gICAgcmV0dXJuIChsLTEpICogMzIgKyBzamNsLmJpdEFycmF5LmdldFBhcnRpYWwoeCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRydW5jYXRlIGFuIGFycmF5LlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBhIFRoZSBhcnJheS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbiBUaGUgbGVuZ3RoIHRvIHRydW5jYXRlIHRvLCBpbiBiaXRzLlxuICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gQSBuZXcgYXJyYXksIHRydW5jYXRlZCB0byBsZW4gYml0cy5cbiAgICovXG4gIGNsYW1wOiBmdW5jdGlvbiAoYSwgbGVuKSB7XG4gICAgaWYgKGEubGVuZ3RoICogMzIgPCBsZW4pIHsgcmV0dXJuIGE7IH1cbiAgICBhID0gYS5zbGljZSgwLCBNYXRoLmNlaWwobGVuIC8gMzIpKTtcbiAgICB2YXIgbCA9IGEubGVuZ3RoO1xuICAgIGxlbiA9IGxlbiAmIDMxO1xuICAgIGlmIChsID4gMCAmJiBsZW4pIHtcbiAgICAgIGFbbC0xXSA9IHNqY2wuYml0QXJyYXkucGFydGlhbChsZW4sIGFbbC0xXSAmIDB4ODAwMDAwMDAgPj4gKGxlbi0xKSwgMSk7XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBNYWtlIGEgcGFydGlhbCB3b3JkIGZvciBhIGJpdCBhcnJheS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbiBUaGUgbnVtYmVyIG9mIGJpdHMgaW4gdGhlIHdvcmQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSBiaXRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gWzBdIF9lbmQgUGFzcyAxIGlmIHggaGFzIGFscmVhZHkgYmVlbiBzaGlmdGVkIHRvIHRoZSBoaWdoIHNpZGUuXG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIHBhcnRpYWwgd29yZC5cbiAgICovXG4gIHBhcnRpYWw6IGZ1bmN0aW9uIChsZW4sIHgsIF9lbmQpIHtcbiAgICBpZiAobGVuID09PSAzMikgeyByZXR1cm4geDsgfVxuICAgIHJldHVybiAoX2VuZCA/IHh8MCA6IHggPDwgKDMyLWxlbikpICsgbGVuICogMHgxMDAwMDAwMDAwMDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBudW1iZXIgb2YgYml0cyB1c2VkIGJ5IGEgcGFydGlhbCB3b3JkLlxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgcGFydGlhbCB3b3JkLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgYml0cyB1c2VkIGJ5IHRoZSBwYXJ0aWFsIHdvcmQuXG4gICAqL1xuICBnZXRQYXJ0aWFsOiBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHgvMHgxMDAwMDAwMDAwMCkgfHwgMzI7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbXBhcmUgdHdvIGFycmF5cyBmb3IgZXF1YWxpdHkgaW4gYSBwcmVkaWN0YWJsZSBhbW91bnQgb2YgdGltZS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gYSBUaGUgZmlyc3QgYXJyYXkuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGIgVGhlIHNlY29uZCBhcnJheS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhID09IGI7IGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGVxdWFsOiBmdW5jdGlvbiAoYSwgYikge1xuICAgIGlmIChzamNsLmJpdEFycmF5LmJpdExlbmd0aChhKSAhPT0gc2pjbC5iaXRBcnJheS5iaXRMZW5ndGgoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHggPSAwLCBpO1xuICAgIGZvciAoaT0wOyBpPGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHggfD0gYVtpXV5iW2ldO1xuICAgIH1cbiAgICByZXR1cm4gKHggPT09IDApO1xuICB9LFxuXG4gIC8qKiBTaGlmdCBhbiBhcnJheSByaWdodC5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gYSBUaGUgYXJyYXkgdG8gc2hpZnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzaGlmdCBUaGUgbnVtYmVyIG9mIGJpdHMgdG8gc2hpZnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbY2Fycnk9MF0gQSBieXRlIHRvIGNhcnJ5IGluXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IFtvdXQ9W11dIEFuIGFycmF5IHRvIHByZXBlbmQgdG8gdGhlIG91dHB1dC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zaGlmdFJpZ2h0OiBmdW5jdGlvbiAoYSwgc2hpZnQsIGNhcnJ5LCBvdXQpIHtcbiAgICB2YXIgaSwgbGFzdDI9MCwgc2hpZnQyO1xuICAgIGlmIChvdXQgPT09IHVuZGVmaW5lZCkgeyBvdXQgPSBbXTsgfVxuICAgIFxuICAgIGZvciAoOyBzaGlmdCA+PSAzMjsgc2hpZnQgLT0gMzIpIHtcbiAgICAgIG91dC5wdXNoKGNhcnJ5KTtcbiAgICAgIGNhcnJ5ID0gMDtcbiAgICB9XG4gICAgaWYgKHNoaWZ0ID09PSAwKSB7XG4gICAgICByZXR1cm4gb3V0LmNvbmNhdChhKTtcbiAgICB9XG4gICAgXG4gICAgZm9yIChpPTA7IGk8YS5sZW5ndGg7IGkrKykge1xuICAgICAgb3V0LnB1c2goY2FycnkgfCBhW2ldPj4+c2hpZnQpO1xuICAgICAgY2FycnkgPSBhW2ldIDw8ICgzMi1zaGlmdCk7XG4gICAgfVxuICAgIGxhc3QyID0gYS5sZW5ndGggPyBhW2EubGVuZ3RoLTFdIDogMDtcbiAgICBzaGlmdDIgPSBzamNsLmJpdEFycmF5LmdldFBhcnRpYWwobGFzdDIpO1xuICAgIG91dC5wdXNoKHNqY2wuYml0QXJyYXkucGFydGlhbChzaGlmdCtzaGlmdDIgJiAzMSwgKHNoaWZ0ICsgc2hpZnQyID4gMzIpID8gY2FycnkgOiBvdXQucG9wKCksMSkpO1xuICAgIHJldHVybiBvdXQ7XG4gIH0sXG4gIFxuICAvKiogeG9yIGEgYmxvY2sgb2YgNCB3b3JkcyB0b2dldGhlci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF94b3I0OiBmdW5jdGlvbih4LHkpIHtcbiAgICByZXR1cm4gW3hbMF1eeVswXSx4WzFdXnlbMV0seFsyXV55WzJdLHhbM11eeVszXV07XG4gIH1cbn07XG4vKiogQGZpbGVPdmVydmlldyBCaXQgYXJyYXkgY29kZWMgaW1wbGVtZW50YXRpb25zLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG4gXG4vKiogQG5hbWVzcGFjZSBVVEYtOCBzdHJpbmdzICovXG5zamNsLmNvZGVjLnV0ZjhTdHJpbmcgPSB7XG4gIC8qKiBDb252ZXJ0IGZyb20gYSBiaXRBcnJheSB0byBhIFVURi04IHN0cmluZy4gKi9cbiAgZnJvbUJpdHM6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICB2YXIgb3V0ID0gXCJcIiwgYmwgPSBzamNsLmJpdEFycmF5LmJpdExlbmd0aChhcnIpLCBpLCB0bXA7XG4gICAgZm9yIChpPTA7IGk8YmwvODsgaSsrKSB7XG4gICAgICBpZiAoKGkmMykgPT09IDApIHtcbiAgICAgICAgdG1wID0gYXJyW2kvNF07XG4gICAgICB9XG4gICAgICBvdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh0bXAgPj4+IDI0KTtcbiAgICAgIHRtcCA8PD0gODtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUob3V0KSk7XG4gIH0sXG4gIFxuICAvKiogQ29udmVydCBmcm9tIGEgVVRGLTggc3RyaW5nIHRvIGEgYml0QXJyYXkuICovXG4gIHRvQml0czogZnVuY3Rpb24gKHN0cikge1xuICAgIHN0ciA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKTtcbiAgICB2YXIgb3V0ID0gW10sIGksIHRtcD0wO1xuICAgIGZvciAoaT0wOyBpPHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgdG1wID0gdG1wIDw8IDggfCBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmICgoaSYzKSA9PT0gMykge1xuICAgICAgICBvdXQucHVzaCh0bXApO1xuICAgICAgICB0bXAgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaSYzKSB7XG4gICAgICBvdXQucHVzaChzamNsLmJpdEFycmF5LnBhcnRpYWwoOCooaSYzKSwgdG1wKSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG4vKiogQGZpbGVPdmVydmlldyBCaXQgYXJyYXkgY29kZWMgaW1wbGVtZW50YXRpb25zLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG5cbi8qKiBAbmFtZXNwYWNlIEhleGFkZWNpbWFsICovXG5zamNsLmNvZGVjLmhleCA9IHtcbiAgLyoqIENvbnZlcnQgZnJvbSBhIGJpdEFycmF5IHRvIGEgaGV4IHN0cmluZy4gKi9cbiAgZnJvbUJpdHM6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICB2YXIgb3V0ID0gXCJcIiwgaSwgeDtcbiAgICBmb3IgKGk9MDsgaTxhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIG91dCArPSAoKGFycltpXXwwKSsweEYwMDAwMDAwMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cig0KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dC5zdWJzdHIoMCwgc2pjbC5iaXRBcnJheS5iaXRMZW5ndGgoYXJyKS80KTsvLy5yZXBsYWNlKC8oLns4fSkvZywgXCIkMSBcIik7XG4gIH0sXG4gIC8qKiBDb252ZXJ0IGZyb20gYSBoZXggc3RyaW5nIHRvIGEgYml0QXJyYXkuICovXG4gIHRvQml0czogZnVuY3Rpb24gKHN0cikge1xuICAgIHZhciBpLCBvdXQ9W10sIGxlbjtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxzfDB4L2csIFwiXCIpO1xuICAgIGxlbiA9IHN0ci5sZW5ndGg7XG4gICAgc3RyID0gc3RyICsgXCIwMDAwMDAwMFwiO1xuICAgIGZvciAoaT0wOyBpPHN0ci5sZW5ndGg7IGkrPTgpIHtcbiAgICAgIG91dC5wdXNoKHBhcnNlSW50KHN0ci5zdWJzdHIoaSw4KSwxNileMCk7XG4gICAgfVxuICAgIHJldHVybiBzamNsLmJpdEFycmF5LmNsYW1wKG91dCwgbGVuKjQpO1xuICB9XG59O1xuXG4vKiogQGZpbGVPdmVydmlldyBCaXQgYXJyYXkgY29kZWMgaW1wbGVtZW50YXRpb25zLlxuICpcbiAqIEBhdXRob3IgRW1pbHkgU3RhcmtcbiAqIEBhdXRob3IgTWlrZSBIYW1idXJnXG4gKiBAYXV0aG9yIERhbiBCb25laFxuICovXG5cbi8qKiBAbmFtZXNwYWNlIEJhc2U2NCBlbmNvZGluZy9kZWNvZGluZyAqL1xuc2pjbC5jb2RlYy5iYXNlNjQgPSB7XG4gIC8qKiBUaGUgYmFzZTY0IGFscGhhYmV0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NoYXJzOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIixcbiAgXG4gIC8qKiBDb252ZXJ0IGZyb20gYSBiaXRBcnJheSB0byBhIGJhc2U2NCBzdHJpbmcuICovXG4gIGZyb21CaXRzOiBmdW5jdGlvbiAoYXJyLCBfbm9FcXVhbHMsIF91cmwpIHtcbiAgICB2YXIgb3V0ID0gXCJcIiwgaSwgYml0cz0wLCBjID0gc2pjbC5jb2RlYy5iYXNlNjQuX2NoYXJzLCB0YT0wLCBibCA9IHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGFycik7XG4gICAgaWYgKF91cmwpIHtcbiAgICAgIGMgPSBjLnN1YnN0cigwLDYyKSArICctXyc7XG4gICAgfVxuICAgIGZvciAoaT0wOyBvdXQubGVuZ3RoICogNiA8IGJsOyApIHtcbiAgICAgIG91dCArPSBjLmNoYXJBdCgodGEgXiBhcnJbaV0+Pj5iaXRzKSA+Pj4gMjYpO1xuICAgICAgaWYgKGJpdHMgPCA2KSB7XG4gICAgICAgIHRhID0gYXJyW2ldIDw8ICg2LWJpdHMpO1xuICAgICAgICBiaXRzICs9IDI2O1xuICAgICAgICBpKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YSA8PD0gNjtcbiAgICAgICAgYml0cyAtPSA2O1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoKG91dC5sZW5ndGggJiAzKSAmJiAhX25vRXF1YWxzKSB7IG91dCArPSBcIj1cIjsgfVxuICAgIHJldHVybiBvdXQ7XG4gIH0sXG4gIFxuICAvKiogQ29udmVydCBmcm9tIGEgYmFzZTY0IHN0cmluZyB0byBhIGJpdEFycmF5ICovXG4gIHRvQml0czogZnVuY3Rpb24oc3RyLCBfdXJsKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcc3w9L2csJycpO1xuICAgIHZhciBvdXQgPSBbXSwgaSwgYml0cz0wLCBjID0gc2pjbC5jb2RlYy5iYXNlNjQuX2NoYXJzLCB0YT0wLCB4O1xuICAgIGlmIChfdXJsKSB7XG4gICAgICBjID0gYy5zdWJzdHIoMCw2MikgKyAnLV8nO1xuICAgIH1cbiAgICBmb3IgKGk9MDsgaTxzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHggPSBjLmluZGV4T2Yoc3RyLmNoYXJBdChpKSk7XG4gICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJ0aGlzIGlzbid0IGJhc2U2NCFcIik7XG4gICAgICB9XG4gICAgICBpZiAoYml0cyA+IDI2KSB7XG4gICAgICAgIGJpdHMgLT0gMjY7XG4gICAgICAgIG91dC5wdXNoKHRhIF4geD4+PmJpdHMpO1xuICAgICAgICB0YSAgPSB4IDw8ICgzMi1iaXRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJpdHMgKz0gNjtcbiAgICAgICAgdGEgXj0geCA8PCAoMzItYml0cyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChiaXRzJjU2KSB7XG4gICAgICBvdXQucHVzaChzamNsLmJpdEFycmF5LnBhcnRpYWwoYml0cyY1NiwgdGEsIDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxuc2pjbC5jb2RlYy5iYXNlNjR1cmwgPSB7XG4gIGZyb21CaXRzOiBmdW5jdGlvbiAoYXJyKSB7IHJldHVybiBzamNsLmNvZGVjLmJhc2U2NC5mcm9tQml0cyhhcnIsMSwxKTsgfSxcbiAgdG9CaXRzOiBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBzamNsLmNvZGVjLmJhc2U2NC50b0JpdHMoc3RyLDEpOyB9XG59O1xuLyoqIEBmaWxlT3ZlcnZpZXcgSmF2YXNjcmlwdCBTSEEtMjU2IGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEFuIG9sZGVyIHZlcnNpb24gb2YgdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgaW4gdGhlIHB1YmxpY1xuICogZG9tYWluLCBidXQgdGhpcyBvbmUgaXMgKGMpIEVtaWx5IFN0YXJrLCBNaWtlIEhhbWJ1cmcsIERhbiBCb25laCxcbiAqIFN0YW5mb3JkIFVuaXZlcnNpdHkgMjAwOC0yMDEwIGFuZCBCU0QtbGljZW5zZWQgZm9yIGxpYWJpbGl0eVxuICogcmVhc29ucy5cbiAqXG4gKiBTcGVjaWFsIHRoYW5rcyB0byBBbGRvIENvcnRlc2kgZm9yIHBvaW50aW5nIG91dCBzZXZlcmFsIGJ1Z3MgaW5cbiAqIHRoaXMgY29kZS5cbiAqXG4gKiBAYXV0aG9yIEVtaWx5IFN0YXJrXG4gKiBAYXV0aG9yIE1pa2UgSGFtYnVyZ1xuICogQGF1dGhvciBEYW4gQm9uZWhcbiAqL1xuXG4vKipcbiAqIENvbnRleHQgZm9yIGEgU0hBLTI1NiBvcGVyYXRpb24gaW4gcHJvZ3Jlc3MuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBjbGFzcyBTZWN1cmUgSGFzaCBBbGdvcml0aG0sIDI1NiBiaXRzLlxuICovXG5zamNsLmhhc2guc2hhMjU2ID0gZnVuY3Rpb24gKGhhc2gpIHtcbiAgaWYgKCF0aGlzLl9rZXlbMF0pIHsgdGhpcy5fcHJlY29tcHV0ZSgpOyB9XG4gIGlmIChoYXNoKSB7XG4gICAgdGhpcy5faCA9IGhhc2guX2guc2xpY2UoMCk7XG4gICAgdGhpcy5fYnVmZmVyID0gaGFzaC5fYnVmZmVyLnNsaWNlKDApO1xuICAgIHRoaXMuX2xlbmd0aCA9IGhhc2guX2xlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cbn07XG5cbi8qKlxuICogSGFzaCBhIHN0cmluZyBvciBhbiBhcnJheSBvZiB3b3Jkcy5cbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSB7Yml0QXJyYXl8U3RyaW5nfSBkYXRhIHRoZSBkYXRhIHRvIGhhc2guXG4gKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIGhhc2ggdmFsdWUsIGFuIGFycmF5IG9mIDE2IGJpZy1lbmRpYW4gd29yZHMuXG4gKi9cbnNqY2wuaGFzaC5zaGEyNTYuaGFzaCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIHJldHVybiAobmV3IHNqY2wuaGFzaC5zaGEyNTYoKSkudXBkYXRlKGRhdGEpLmZpbmFsaXplKCk7XG59O1xuXG5zamNsLmhhc2guc2hhMjU2LnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqIFRoZSBoYXNoJ3MgYmxvY2sgc2l6ZSwgaW4gYml0cy5cbiAgICogQGNvbnN0YW50XG4gICAqL1xuICBibG9ja1NpemU6IDUxMixcbiAgIFxuICAvKipcbiAgICogUmVzZXQgdGhlIGhhc2ggc3RhdGUuXG4gICAqIEByZXR1cm4gdGhpc1xuICAgKi9cbiAgcmVzZXQ6ZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2ggPSB0aGlzLl9pbml0LnNsaWNlKDApO1xuICAgIHRoaXMuX2J1ZmZlciA9IFtdO1xuICAgIHRoaXMuX2xlbmd0aCA9IDA7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIFxuICAvKipcbiAgICogSW5wdXQgc2V2ZXJhbCB3b3JkcyB0byB0aGUgaGFzaC5cbiAgICogQHBhcmFtIHtiaXRBcnJheXxTdHJpbmd9IGRhdGEgdGhlIGRhdGEgdG8gaGFzaC5cbiAgICogQHJldHVybiB0aGlzXG4gICAqL1xuICB1cGRhdGU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBkYXRhID0gc2pjbC5jb2RlYy51dGY4U3RyaW5nLnRvQml0cyhkYXRhKTtcbiAgICB9XG4gICAgdmFyIGksIGIgPSB0aGlzLl9idWZmZXIgPSBzamNsLmJpdEFycmF5LmNvbmNhdCh0aGlzLl9idWZmZXIsIGRhdGEpLFxuICAgICAgICBvbCA9IHRoaXMuX2xlbmd0aCxcbiAgICAgICAgbmwgPSB0aGlzLl9sZW5ndGggPSBvbCArIHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGRhdGEpO1xuICAgIGZvciAoaSA9IDUxMitvbCAmIC01MTI7IGkgPD0gbmw7IGkrPSA1MTIpIHtcbiAgICAgIHRoaXMuX2Jsb2NrKGIuc3BsaWNlKDAsMTYpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIFxuICAvKipcbiAgICogQ29tcGxldGUgaGFzaGluZyBhbmQgb3V0cHV0IHRoZSBoYXNoIHZhbHVlLlxuICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIGhhc2ggdmFsdWUsIGFuIGFycmF5IG9mIDggYmlnLWVuZGlhbiB3b3Jkcy5cbiAgICovXG4gIGZpbmFsaXplOmZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaSwgYiA9IHRoaXMuX2J1ZmZlciwgaCA9IHRoaXMuX2g7XG5cbiAgICAvLyBSb3VuZCBvdXQgYW5kIHB1c2ggdGhlIGJ1ZmZlclxuICAgIGIgPSBzamNsLmJpdEFycmF5LmNvbmNhdChiLCBbc2pjbC5iaXRBcnJheS5wYXJ0aWFsKDEsMSldKTtcbiAgICBcbiAgICAvLyBSb3VuZCBvdXQgdGhlIGJ1ZmZlciB0byBhIG11bHRpcGxlIG9mIDE2IHdvcmRzLCBsZXNzIHRoZSAyIGxlbmd0aCB3b3Jkcy5cbiAgICBmb3IgKGkgPSBiLmxlbmd0aCArIDI7IGkgJiAxNTsgaSsrKSB7XG4gICAgICBiLnB1c2goMCk7XG4gICAgfVxuICAgIFxuICAgIC8vIGFwcGVuZCB0aGUgbGVuZ3RoXG4gICAgYi5wdXNoKE1hdGguZmxvb3IodGhpcy5fbGVuZ3RoIC8gMHgxMDAwMDAwMDApKTtcbiAgICBiLnB1c2godGhpcy5fbGVuZ3RoIHwgMCk7XG5cbiAgICB3aGlsZSAoYi5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2Jsb2NrKGIuc3BsaWNlKDAsMTYpKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgcmV0dXJuIGg7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRoZSBTSEEtMjU2IGluaXRpYWxpemF0aW9uIHZlY3RvciwgdG8gYmUgcHJlY29tcHV0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdDpbXSxcbiAgLypcbiAgX2luaXQ6WzB4NmEwOWU2NjcsMHhiYjY3YWU4NSwweDNjNmVmMzcyLDB4YTU0ZmY1M2EsMHg1MTBlNTI3ZiwweDliMDU2ODhjLDB4MWY4M2Q5YWIsMHg1YmUwY2QxOV0sXG4gICovXG4gIFxuICAvKipcbiAgICogVGhlIFNIQS0yNTYgaGFzaCBrZXksIHRvIGJlIHByZWNvbXB1dGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2tleTpbXSxcbiAgLypcbiAgX2tleTpcbiAgICBbMHg0MjhhMmY5OCwgMHg3MTM3NDQ5MSwgMHhiNWMwZmJjZiwgMHhlOWI1ZGJhNSwgMHgzOTU2YzI1YiwgMHg1OWYxMTFmMSwgMHg5MjNmODJhNCwgMHhhYjFjNWVkNSxcbiAgICAgMHhkODA3YWE5OCwgMHgxMjgzNWIwMSwgMHgyNDMxODViZSwgMHg1NTBjN2RjMywgMHg3MmJlNWQ3NCwgMHg4MGRlYjFmZSwgMHg5YmRjMDZhNywgMHhjMTliZjE3NCxcbiAgICAgMHhlNDliNjljMSwgMHhlZmJlNDc4NiwgMHgwZmMxOWRjNiwgMHgyNDBjYTFjYywgMHgyZGU5MmM2ZiwgMHg0YTc0ODRhYSwgMHg1Y2IwYTlkYywgMHg3NmY5ODhkYSxcbiAgICAgMHg5ODNlNTE1MiwgMHhhODMxYzY2ZCwgMHhiMDAzMjdjOCwgMHhiZjU5N2ZjNywgMHhjNmUwMGJmMywgMHhkNWE3OTE0NywgMHgwNmNhNjM1MSwgMHgxNDI5Mjk2NyxcbiAgICAgMHgyN2I3MGE4NSwgMHgyZTFiMjEzOCwgMHg0ZDJjNmRmYywgMHg1MzM4MGQxMywgMHg2NTBhNzM1NCwgMHg3NjZhMGFiYiwgMHg4MWMyYzkyZSwgMHg5MjcyMmM4NSxcbiAgICAgMHhhMmJmZThhMSwgMHhhODFhNjY0YiwgMHhjMjRiOGI3MCwgMHhjNzZjNTFhMywgMHhkMTkyZTgxOSwgMHhkNjk5MDYyNCwgMHhmNDBlMzU4NSwgMHgxMDZhYTA3MCxcbiAgICAgMHgxOWE0YzExNiwgMHgxZTM3NmMwOCwgMHgyNzQ4Nzc0YywgMHgzNGIwYmNiNSwgMHgzOTFjMGNiMywgMHg0ZWQ4YWE0YSwgMHg1YjljY2E0ZiwgMHg2ODJlNmZmMyxcbiAgICAgMHg3NDhmODJlZSwgMHg3OGE1NjM2ZiwgMHg4NGM4NzgxNCwgMHg4Y2M3MDIwOCwgMHg5MGJlZmZmYSwgMHhhNDUwNmNlYiwgMHhiZWY5YTNmNywgMHhjNjcxNzhmMl0sXG4gICovXG5cblxuICAvKipcbiAgICogRnVuY3Rpb24gdG8gcHJlY29tcHV0ZSBfaW5pdCBhbmQgX2tleS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wcmVjb21wdXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGkgPSAwLCBwcmltZSA9IDIsIGZhY3RvcjtcblxuICAgIGZ1bmN0aW9uIGZyYWMoeCkgeyByZXR1cm4gKHgtTWF0aC5mbG9vcih4KSkgKiAweDEwMDAwMDAwMCB8IDA7IH1cblxuICAgIG91dGVyOiBmb3IgKDsgaTw2NDsgcHJpbWUrKykge1xuICAgICAgZm9yIChmYWN0b3I9MjsgZmFjdG9yKmZhY3RvciA8PSBwcmltZTsgZmFjdG9yKyspIHtcbiAgICAgICAgaWYgKHByaW1lICUgZmFjdG9yID09PSAwKSB7XG4gICAgICAgICAgLy8gbm90IGEgcHJpbWVcbiAgICAgICAgICBjb250aW51ZSBvdXRlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoaTw4KSB7XG4gICAgICAgIHRoaXMuX2luaXRbaV0gPSBmcmFjKE1hdGgucG93KHByaW1lLCAxLzIpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2tleVtpXSA9IGZyYWMoTWF0aC5wb3cocHJpbWUsIDEvMykpO1xuICAgICAgaSsrO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBQZXJmb3JtIG9uZSBjeWNsZSBvZiBTSEEtMjU2LlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSB3b3JkcyBvbmUgYmxvY2sgb2Ygd29yZHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYmxvY2s6ZnVuY3Rpb24gKHdvcmRzKSB7ICBcbiAgICB2YXIgaSwgdG1wLCBhLCBiLFxuICAgICAgdyA9IHdvcmRzLnNsaWNlKDApLFxuICAgICAgaCA9IHRoaXMuX2gsXG4gICAgICBrID0gdGhpcy5fa2V5LFxuICAgICAgaDAgPSBoWzBdLCBoMSA9IGhbMV0sIGgyID0gaFsyXSwgaDMgPSBoWzNdLFxuICAgICAgaDQgPSBoWzRdLCBoNSA9IGhbNV0sIGg2ID0gaFs2XSwgaDcgPSBoWzddO1xuXG4gICAgLyogUmF0aW9uYWxlIGZvciBwbGFjZW1lbnQgb2YgfDAgOlxuICAgICAqIElmIGEgdmFsdWUgY2FuIG92ZXJmbG93IGlzIG9yaWdpbmFsIDMyIGJpdHMgYnkgYSBmYWN0b3Igb2YgbW9yZSB0aGFuIGEgZmV3XG4gICAgICogbWlsbGlvbiAoMl4yMyBpc2gpLCB0aGVyZSBpcyBhIHBvc3NpYmlsaXR5IHRoYXQgaXQgbWlnaHQgb3ZlcmZsb3cgdGhlXG4gICAgICogNTMtYml0IG1hbnRpc3NhIGFuZCBsb3NlIHByZWNpc2lvbi5cbiAgICAgKlxuICAgICAqIFRvIGF2b2lkIHRoaXMsIHdlIGNsYW1wIGJhY2sgdG8gMzIgYml0cyBieSB8J2luZyB3aXRoIDAgb24gYW55IHZhbHVlIHRoYXRcbiAgICAgKiBwcm9wYWdhdGVzIGFyb3VuZCB0aGUgbG9vcCwgYW5kIG9uIHRoZSBoYXNoIHN0YXRlIGhbXS4gIEkgZG9uJ3QgYmVsaWV2ZVxuICAgICAqIHRoYXQgdGhlIGNsYW1wcyBvbiBoNCBhbmQgb24gaDAgYXJlIHN0cmljdGx5IG5lY2Vzc2FyeSwgYnV0IGl0J3MgY2xvc2VcbiAgICAgKiAoZm9yIGg0IGFueXdheSksIGFuZCBiZXR0ZXIgc2FmZSB0aGFuIHNvcnJ5LlxuICAgICAqXG4gICAgICogVGhlIGNsYW1wcyBvbiBoW10gYXJlIG5lY2Vzc2FyeSBmb3IgdGhlIG91dHB1dCB0byBiZSBjb3JyZWN0IGV2ZW4gaW4gdGhlXG4gICAgICogY29tbW9uIGNhc2UgYW5kIGZvciBzaG9ydCBpbnB1dHMuXG4gICAgICovXG4gICAgZm9yIChpPTA7IGk8NjQ7IGkrKykge1xuICAgICAgLy8gbG9hZCB1cCB0aGUgaW5wdXQgd29yZCBmb3IgdGhpcyByb3VuZFxuICAgICAgaWYgKGk8MTYpIHtcbiAgICAgICAgdG1wID0gd1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGEgICA9IHdbKGkrMSApICYgMTVdO1xuICAgICAgICBiICAgPSB3WyhpKzE0KSAmIDE1XTtcbiAgICAgICAgdG1wID0gd1tpJjE1XSA9ICgoYT4+PjcgIF4gYT4+PjE4IF4gYT4+PjMgIF4gYTw8MjUgXiBhPDwxNCkgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAoYj4+PjE3IF4gYj4+PjE5IF4gYj4+PjEwIF4gYjw8MTUgXiBiPDwxMykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIHdbaSYxNV0gKyB3WyhpKzkpICYgMTVdKSB8IDA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRtcCA9ICh0bXAgKyBoNyArIChoND4+PjYgXiBoND4+PjExIF4gaDQ+Pj4yNSBeIGg0PDwyNiBeIGg0PDwyMSBeIGg0PDw3KSArICAoaDYgXiBoNCYoaDVeaDYpKSArIGtbaV0pOyAvLyB8IDA7XG4gICAgICBcbiAgICAgIC8vIHNoaWZ0IHJlZ2lzdGVyXG4gICAgICBoNyA9IGg2OyBoNiA9IGg1OyBoNSA9IGg0O1xuICAgICAgaDQgPSBoMyArIHRtcCB8IDA7XG4gICAgICBoMyA9IGgyOyBoMiA9IGgxOyBoMSA9IGgwO1xuXG4gICAgICBoMCA9ICh0bXAgKyAgKChoMSZoMikgXiAoaDMmKGgxXmgyKSkpICsgKGgxPj4+MiBeIGgxPj4+MTMgXiBoMT4+PjIyIF4gaDE8PDMwIF4gaDE8PDE5IF4gaDE8PDEwKSkgfCAwO1xuICAgIH1cblxuICAgIGhbMF0gPSBoWzBdK2gwIHwgMDtcbiAgICBoWzFdID0gaFsxXStoMSB8IDA7XG4gICAgaFsyXSA9IGhbMl0raDIgfCAwO1xuICAgIGhbM10gPSBoWzNdK2gzIHwgMDtcbiAgICBoWzRdID0gaFs0XStoNCB8IDA7XG4gICAgaFs1XSA9IGhbNV0raDUgfCAwO1xuICAgIGhbNl0gPSBoWzZdK2g2IHwgMDtcbiAgICBoWzddID0gaFs3XStoNyB8IDA7XG4gIH1cbn07XG5cblxuLyoqIEBmaWxlT3ZlcnZpZXcgQ0NNIG1vZGUgaW1wbGVtZW50YXRpb24uXG4gKlxuICogU3BlY2lhbCB0aGFua3MgdG8gUm95IE5pY2hvbHNvbiBmb3IgcG9pbnRpbmcgb3V0IGEgYnVnIGluIG91clxuICogaW1wbGVtZW50YXRpb24uXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cblxuLyoqIEBuYW1lc3BhY2UgQ1RSIG1vZGUgd2l0aCBDQkMgTUFDLiAqL1xuc2pjbC5tb2RlLmNjbSA9IHtcbiAgLyoqIFRoZSBuYW1lIG9mIHRoZSBtb2RlLlxuICAgKiBAY29uc3RhbnRcbiAgICovXG4gIG5hbWU6IFwiY2NtXCIsXG4gIFxuICAvKiogRW5jcnlwdCBpbiBDQ00gbW9kZS5cbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJmIFRoZSBwc2V1ZG9yYW5kb20gZnVuY3Rpb24uICBJdCBtdXN0IGhhdmUgYSBibG9jayBzaXplIG9mIDE2IGJ5dGVzLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBwbGFpbnRleHQgVGhlIHBsYWludGV4dCBkYXRhLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBpdiBUaGUgaW5pdGlhbGl6YXRpb24gdmFsdWUuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IFthZGF0YT1bXV0gVGhlIGF1dGhlbnRpY2F0ZWQgZGF0YS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0bGVuPTY0XSB0aGUgZGVzaXJlZCB0YWcgbGVuZ3RoLCBpbiBiaXRzLlxuICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIGVuY3J5cHRlZCBkYXRhLCBhbiBhcnJheSBvZiBieXRlcy5cbiAgICovXG4gIGVuY3J5cHQ6IGZ1bmN0aW9uKHByZiwgcGxhaW50ZXh0LCBpdiwgYWRhdGEsIHRsZW4pIHtcbiAgICB2YXIgTCwgaSwgb3V0ID0gcGxhaW50ZXh0LnNsaWNlKDApLCB0YWcsIHc9c2pjbC5iaXRBcnJheSwgaXZsID0gdy5iaXRMZW5ndGgoaXYpIC8gOCwgb2wgPSB3LmJpdExlbmd0aChvdXQpIC8gODtcbiAgICB0bGVuID0gdGxlbiB8fCA2NDtcbiAgICBhZGF0YSA9IGFkYXRhIHx8IFtdO1xuICAgIFxuICAgIGlmIChpdmwgPCA3KSB7XG4gICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImNjbTogaXYgbXVzdCBiZSBhdCBsZWFzdCA3IGJ5dGVzXCIpO1xuICAgIH1cbiAgICBcbiAgICAvLyBjb21wdXRlIHRoZSBsZW5ndGggb2YgdGhlIGxlbmd0aFxuICAgIGZvciAoTD0yOyBMPDQgJiYgb2wgPj4+IDgqTDsgTCsrKSB7fVxuICAgIGlmIChMIDwgMTUgLSBpdmwpIHsgTCA9IDE1LWl2bDsgfVxuICAgIGl2ID0gdy5jbGFtcChpdiw4KigxNS1MKSk7XG4gICAgXG4gICAgLy8gY29tcHV0ZSB0aGUgdGFnXG4gICAgdGFnID0gc2pjbC5tb2RlLmNjbS5fY29tcHV0ZVRhZyhwcmYsIHBsYWludGV4dCwgaXYsIGFkYXRhLCB0bGVuLCBMKTtcbiAgICBcbiAgICAvLyBlbmNyeXB0XG4gICAgb3V0ID0gc2pjbC5tb2RlLmNjbS5fY3RyTW9kZShwcmYsIG91dCwgaXYsIHRhZywgdGxlbiwgTCk7XG4gICAgXG4gICAgcmV0dXJuIHcuY29uY2F0KG91dC5kYXRhLCBvdXQudGFnKTtcbiAgfSxcbiAgXG4gIC8qKiBEZWNyeXB0IGluIENDTSBtb2RlLlxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcmYgVGhlIHBzZXVkb3JhbmRvbSBmdW5jdGlvbi4gIEl0IG11c3QgaGF2ZSBhIGJsb2NrIHNpemUgb2YgMTYgYnl0ZXMuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGNpcGhlcnRleHQgVGhlIGNpcGhlcnRleHQgZGF0YS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gaXYgVGhlIGluaXRpYWxpemF0aW9uIHZhbHVlLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBbW11dIGFkYXRhIFRoZSBhdXRoZW50aWNhdGVkIGRhdGEuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbNjRdIHRsZW4gdGhlIGRlc2lyZWQgdGFnIGxlbmd0aCwgaW4gYml0cy5cbiAgICogQHJldHVybiB7Yml0QXJyYXl9IFRoZSBkZWNyeXB0ZWQgZGF0YS5cbiAgICovXG4gIGRlY3J5cHQ6IGZ1bmN0aW9uKHByZiwgY2lwaGVydGV4dCwgaXYsIGFkYXRhLCB0bGVuKSB7XG4gICAgdGxlbiA9IHRsZW4gfHwgNjQ7XG4gICAgYWRhdGEgPSBhZGF0YSB8fCBbXTtcbiAgICB2YXIgTCwgaSwgXG4gICAgICAgIHc9c2pjbC5iaXRBcnJheSxcbiAgICAgICAgaXZsID0gdy5iaXRMZW5ndGgoaXYpIC8gOCxcbiAgICAgICAgb2wgPSB3LmJpdExlbmd0aChjaXBoZXJ0ZXh0KSwgXG4gICAgICAgIG91dCA9IHcuY2xhbXAoY2lwaGVydGV4dCwgb2wgLSB0bGVuKSxcbiAgICAgICAgdGFnID0gdy5iaXRTbGljZShjaXBoZXJ0ZXh0LCBvbCAtIHRsZW4pLCB0YWcyO1xuICAgIFxuXG4gICAgb2wgPSAob2wgLSB0bGVuKSAvIDg7XG4gICAgICAgIFxuICAgIGlmIChpdmwgPCA3KSB7XG4gICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImNjbTogaXYgbXVzdCBiZSBhdCBsZWFzdCA3IGJ5dGVzXCIpO1xuICAgIH1cbiAgICBcbiAgICAvLyBjb21wdXRlIHRoZSBsZW5ndGggb2YgdGhlIGxlbmd0aFxuICAgIGZvciAoTD0yOyBMPDQgJiYgb2wgPj4+IDgqTDsgTCsrKSB7fVxuICAgIGlmIChMIDwgMTUgLSBpdmwpIHsgTCA9IDE1LWl2bDsgfVxuICAgIGl2ID0gdy5jbGFtcChpdiw4KigxNS1MKSk7XG4gICAgXG4gICAgLy8gZGVjcnlwdFxuICAgIG91dCA9IHNqY2wubW9kZS5jY20uX2N0ck1vZGUocHJmLCBvdXQsIGl2LCB0YWcsIHRsZW4sIEwpO1xuICAgIFxuICAgIC8vIGNoZWNrIHRoZSB0YWdcbiAgICB0YWcyID0gc2pjbC5tb2RlLmNjbS5fY29tcHV0ZVRhZyhwcmYsIG91dC5kYXRhLCBpdiwgYWRhdGEsIHRsZW4sIEwpO1xuICAgIGlmICghdy5lcXVhbChvdXQudGFnLCB0YWcyKSkge1xuICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmNvcnJ1cHQoXCJjY206IHRhZyBkb2Vzbid0IG1hdGNoXCIpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0LmRhdGE7XG4gIH0sXG5cbiAgLyogQ29tcHV0ZSB0aGUgKHVuZW5jcnlwdGVkKSBhdXRoZW50aWNhdGlvbiB0YWcsIGFjY29yZGluZyB0byB0aGUgQ0NNIHNwZWNpZmljYXRpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IHByZiBUaGUgcHNldWRvcmFuZG9tIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBwbGFpbnRleHQgVGhlIHBsYWludGV4dCBkYXRhLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBpdiBUaGUgaW5pdGlhbGl6YXRpb24gdmFsdWUuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGFkYXRhIFRoZSBhdXRoZW50aWNhdGVkIGRhdGEuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0bGVuIHRoZSBkZXNpcmVkIHRhZyBsZW5ndGgsIGluIGJpdHMuXG4gICAqIEByZXR1cm4ge2JpdEFycmF5fSBUaGUgdGFnLCBidXQgbm90IHlldCBlbmNyeXB0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY29tcHV0ZVRhZzogZnVuY3Rpb24ocHJmLCBwbGFpbnRleHQsIGl2LCBhZGF0YSwgdGxlbiwgTCkge1xuICAgIC8vIGNvbXB1dGUgQlswXVxuICAgIHZhciBxLCBtYWMsIGZpZWxkID0gMCwgb2Zmc2V0ID0gMjQsIHRtcCwgaSwgbWFjRGF0YSA9IFtdLCB3PXNqY2wuYml0QXJyYXksIHhvciA9IHcuX3hvcjQ7XG5cbiAgICB0bGVuIC89IDg7XG4gIFxuICAgIC8vIGNoZWNrIHRhZyBsZW5ndGggYW5kIG1lc3NhZ2UgbGVuZ3RoXG4gICAgaWYgKHRsZW4gJSAyIHx8IHRsZW4gPCA0IHx8IHRsZW4gPiAxNikge1xuICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJjY206IGludmFsaWQgdGFnIGxlbmd0aFwiKTtcbiAgICB9XG4gIFxuICAgIGlmIChhZGF0YS5sZW5ndGggPiAweEZGRkZGRkZGIHx8IHBsYWludGV4dC5sZW5ndGggPiAweEZGRkZGRkZGKSB7XG4gICAgICAvLyBJIGRvbid0IHdhbnQgdG8gZGVhbCB3aXRoIGV4dHJhY3RpbmcgaGlnaCB3b3JkcyBmcm9tIGRvdWJsZXMuXG4gICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uYnVnKFwiY2NtOiBjYW4ndCBkZWFsIHdpdGggNEdpQiBvciBtb3JlIGRhdGFcIik7XG4gICAgfVxuXG4gICAgLy8gbWFjIHRoZSBmbGFnc1xuICAgIG1hYyA9IFt3LnBhcnRpYWwoOCwgKGFkYXRhLmxlbmd0aCA/IDE8PDYgOiAwKSB8ICh0bGVuLTIpIDw8IDIgfCBMLTEpXTtcblxuICAgIC8vIG1hYyB0aGUgaXYgYW5kIGxlbmd0aFxuICAgIG1hYyA9IHcuY29uY2F0KG1hYywgaXYpO1xuICAgIG1hY1szXSB8PSB3LmJpdExlbmd0aChwbGFpbnRleHQpLzg7XG4gICAgbWFjID0gcHJmLmVuY3J5cHQobWFjKTtcbiAgICBcbiAgXG4gICAgaWYgKGFkYXRhLmxlbmd0aCkge1xuICAgICAgLy8gbWFjIHRoZSBhc3NvY2lhdGVkIGRhdGEuICBzdGFydCB3aXRoIGl0cyBsZW5ndGguLi5cbiAgICAgIHRtcCA9IHcuYml0TGVuZ3RoKGFkYXRhKS84O1xuICAgICAgaWYgKHRtcCA8PSAweEZFRkYpIHtcbiAgICAgICAgbWFjRGF0YSA9IFt3LnBhcnRpYWwoMTYsIHRtcCldO1xuICAgICAgfSBlbHNlIGlmICh0bXAgPD0gMHhGRkZGRkZGRikge1xuICAgICAgICBtYWNEYXRhID0gdy5jb25jYXQoW3cucGFydGlhbCgxNiwweEZGRkUpXSwgW3RtcF0pO1xuICAgICAgfSAvLyBlbHNlIC4uLlxuICAgIFxuICAgICAgLy8gbWFjIHRoZSBkYXRhIGl0c2VsZlxuICAgICAgbWFjRGF0YSA9IHcuY29uY2F0KG1hY0RhdGEsIGFkYXRhKTtcbiAgICAgIGZvciAoaT0wOyBpPG1hY0RhdGEubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgICAgbWFjID0gcHJmLmVuY3J5cHQoeG9yKG1hYywgbWFjRGF0YS5zbGljZShpLGkrNCkuY29uY2F0KFswLDAsMF0pKSk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICAvLyBtYWMgdGhlIHBsYWludGV4dFxuICAgIGZvciAoaT0wOyBpPHBsYWludGV4dC5sZW5ndGg7IGkrPTQpIHtcbiAgICAgIG1hYyA9IHByZi5lbmNyeXB0KHhvcihtYWMsIHBsYWludGV4dC5zbGljZShpLGkrNCkuY29uY2F0KFswLDAsMF0pKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHcuY2xhbXAobWFjLCB0bGVuICogOCk7XG4gIH0sXG5cbiAgLyoqIENDTSBDVFIgbW9kZS5cbiAgICogRW5jcnlwdCBvciBkZWNyeXB0IGRhdGEgYW5kIHRhZyB3aXRoIHRoZSBwcmYgaW4gQ0NNLXN0eWxlIENUUiBtb2RlLlxuICAgKiBNYXkgbXV0YXRlIGl0cyBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcmYgVGhlIFBSRi5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBlbmNyeXB0ZWQgb3IgZGVjcnlwdGVkLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBpdiBUaGUgaW5pdGlhbGl6YXRpb24gdmVjdG9yLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSB0YWcgVGhlIGF1dGhlbnRpY2F0aW9uIHRhZy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRsZW4gVGhlIGxlbmd0aCBvZiB0aCBldGFnLCBpbiBiaXRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gTCBUaGUgQ0NNIEwgdmFsdWUuXG4gICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdpdGggZGF0YSBhbmQgdGFnLCB0aGUgZW4vZGVjcnlwdGlvbiBvZiBkYXRhIGFuZCB0YWcgdmFsdWVzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2N0ck1vZGU6IGZ1bmN0aW9uKHByZiwgZGF0YSwgaXYsIHRhZywgdGxlbiwgTCkge1xuICAgIHZhciBlbmMsIGksIHc9c2pjbC5iaXRBcnJheSwgeG9yID0gdy5feG9yNCwgY3RyLCBiLCBsID0gZGF0YS5sZW5ndGgsIGJsPXcuYml0TGVuZ3RoKGRhdGEpO1xuXG4gICAgLy8gc3RhcnQgdGhlIGN0clxuICAgIGN0ciA9IHcuY29uY2F0KFt3LnBhcnRpYWwoOCxMLTEpXSxpdikuY29uY2F0KFswLDAsMF0pLnNsaWNlKDAsNCk7XG4gICAgXG4gICAgLy8gZW4vZGVjcnlwdCB0aGUgdGFnXG4gICAgdGFnID0gdy5iaXRTbGljZSh4b3IodGFnLHByZi5lbmNyeXB0KGN0cikpLCAwLCB0bGVuKTtcbiAgXG4gICAgLy8gZW4vZGVjcnlwdCB0aGUgZGF0YVxuICAgIGlmICghbCkgeyByZXR1cm4ge3RhZzp0YWcsIGRhdGE6W119OyB9XG4gICAgXG4gICAgZm9yIChpPTA7IGk8bDsgaSs9NCkge1xuICAgICAgY3RyWzNdKys7XG4gICAgICBlbmMgPSBwcmYuZW5jcnlwdChjdHIpO1xuICAgICAgZGF0YVtpXSAgIF49IGVuY1swXTtcbiAgICAgIGRhdGFbaSsxXSBePSBlbmNbMV07XG4gICAgICBkYXRhW2krMl0gXj0gZW5jWzJdO1xuICAgICAgZGF0YVtpKzNdIF49IGVuY1szXTtcbiAgICB9XG4gICAgcmV0dXJuIHsgdGFnOnRhZywgZGF0YTp3LmNsYW1wKGRhdGEsYmwpIH07XG4gIH1cbn07XG4vKiogQGZpbGVPdmVydmlldyBPQ0IgMi4wIGltcGxlbWVudGF0aW9uXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cblxuLyoqIEBuYW1lc3BhY2VcbiAqIFBoaWwgUm9nYXdheSdzIE9mZnNldCBDb2RlQm9vayBtb2RlLCB2ZXJzaW9uIDIuMC5cbiAqIE1heSBiZSBjb3ZlcmVkIGJ5IFVTIGFuZCBpbnRlcm5hdGlvbmFsIHBhdGVudHMuXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cbnNqY2wubW9kZS5vY2IyID0ge1xuICAvKiogVGhlIG5hbWUgb2YgdGhlIG1vZGUuXG4gICAqIEBjb25zdGFudFxuICAgKi9cbiAgbmFtZTogXCJvY2IyXCIsXG4gIFxuICAvKiogRW5jcnlwdCBpbiBPQ0IgbW9kZSwgdmVyc2lvbiAyLjAuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcnAgVGhlIGJsb2NrIGNpcGhlci4gIEl0IG11c3QgaGF2ZSBhIGJsb2NrIHNpemUgb2YgMTYgYnl0ZXMuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IHBsYWludGV4dCBUaGUgcGxhaW50ZXh0IGRhdGEuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGl2IFRoZSBpbml0aWFsaXphdGlvbiB2YWx1ZS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gW2FkYXRhPVtdXSBUaGUgYXV0aGVudGljYXRlZCBkYXRhLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RsZW49NjRdIHRoZSBkZXNpcmVkIHRhZyBsZW5ndGgsIGluIGJpdHMuXG4gICAqIEBwYXJhbSBbZmFsc2VdIHByZW1hYyAxIGlmIHRoZSBhdXRoZW50aWNhdGlvbiBkYXRhIGlzIHByZS1tYWNjZWQgd2l0aCBQTUFDLlxuICAgKiBAcmV0dXJuIFRoZSBlbmNyeXB0ZWQgZGF0YSwgYW4gYXJyYXkgb2YgYnl0ZXMuXG4gICAqIEB0aHJvd3Mge3NqY2wuZXhjZXB0aW9uLmludmFsaWR9IGlmIHRoZSBJViBpc24ndCBleGFjdGx5IDEyOCBiaXRzLlxuICAgKi9cbiAgZW5jcnlwdDogZnVuY3Rpb24ocHJwLCBwbGFpbnRleHQsIGl2LCBhZGF0YSwgdGxlbiwgcHJlbWFjKSB7XG4gICAgaWYgKHNqY2wuYml0QXJyYXkuYml0TGVuZ3RoKGl2KSAhPT0gMTI4KSB7XG4gICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcIm9jYiBpdiBtdXN0IGJlIDEyOCBiaXRzXCIpO1xuICAgIH1cbiAgICB2YXIgaSxcbiAgICAgICAgdGltZXMyID0gc2pjbC5tb2RlLm9jYjIuX3RpbWVzMixcbiAgICAgICAgdyA9IHNqY2wuYml0QXJyYXksXG4gICAgICAgIHhvciA9IHcuX3hvcjQsXG4gICAgICAgIGNoZWNrc3VtID0gWzAsMCwwLDBdLFxuICAgICAgICBkZWx0YSA9IHRpbWVzMihwcnAuZW5jcnlwdChpdikpLFxuICAgICAgICBiaSwgYmwsXG4gICAgICAgIG91dHB1dCA9IFtdLFxuICAgICAgICBwYWQ7XG4gICAgICAgIFxuICAgIGFkYXRhID0gYWRhdGEgfHwgW107XG4gICAgdGxlbiAgPSB0bGVuIHx8IDY0O1xuICBcbiAgICBmb3IgKGk9MDsgaSs0IDwgcGxhaW50ZXh0Lmxlbmd0aDsgaSs9NCkge1xuICAgICAgLyogRW5jcnlwdCBhIG5vbi1maW5hbCBibG9jayAqL1xuICAgICAgYmkgPSBwbGFpbnRleHQuc2xpY2UoaSxpKzQpO1xuICAgICAgY2hlY2tzdW0gPSB4b3IoY2hlY2tzdW0sIGJpKTtcbiAgICAgIG91dHB1dCA9IG91dHB1dC5jb25jYXQoeG9yKGRlbHRhLHBycC5lbmNyeXB0KHhvcihkZWx0YSwgYmkpKSkpO1xuICAgICAgZGVsdGEgPSB0aW1lczIoZGVsdGEpO1xuICAgIH1cbiAgICBcbiAgICAvKiBDaG9wIG91dCB0aGUgZmluYWwgYmxvY2sgKi9cbiAgICBiaSA9IHBsYWludGV4dC5zbGljZShpKTtcbiAgICBibCA9IHcuYml0TGVuZ3RoKGJpKTtcbiAgICBwYWQgPSBwcnAuZW5jcnlwdCh4b3IoZGVsdGEsWzAsMCwwLGJsXSkpO1xuICAgIGJpID0gdy5jbGFtcCh4b3IoYmkuY29uY2F0KFswLDAsMF0pLHBhZCksIGJsKTtcbiAgICBcbiAgICAvKiBDaGVja3N1bSB0aGUgZmluYWwgYmxvY2ssIGFuZCBmaW5hbGl6ZSB0aGUgY2hlY2tzdW0gKi9cbiAgICBjaGVja3N1bSA9IHhvcihjaGVja3N1bSx4b3IoYmkuY29uY2F0KFswLDAsMF0pLHBhZCkpO1xuICAgIGNoZWNrc3VtID0gcHJwLmVuY3J5cHQoeG9yKGNoZWNrc3VtLHhvcihkZWx0YSx0aW1lczIoZGVsdGEpKSkpO1xuICAgIFxuICAgIC8qIE1BQyB0aGUgaGVhZGVyICovXG4gICAgaWYgKGFkYXRhLmxlbmd0aCkge1xuICAgICAgY2hlY2tzdW0gPSB4b3IoY2hlY2tzdW0sIHByZW1hYyA/IGFkYXRhIDogc2pjbC5tb2RlLm9jYjIucG1hYyhwcnAsIGFkYXRhKSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRwdXQuY29uY2F0KHcuY29uY2F0KGJpLCB3LmNsYW1wKGNoZWNrc3VtLCB0bGVuKSkpO1xuICB9LFxuICBcbiAgLyoqIERlY3J5cHQgaW4gT0NCIG1vZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcnAgVGhlIGJsb2NrIGNpcGhlci4gIEl0IG11c3QgaGF2ZSBhIGJsb2NrIHNpemUgb2YgMTYgYnl0ZXMuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGNpcGhlcnRleHQgVGhlIGNpcGhlcnRleHQgZGF0YS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gaXYgVGhlIGluaXRpYWxpemF0aW9uIHZhbHVlLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBbYWRhdGE9W11dIFRoZSBhdXRoZW50aWNhdGVkIGRhdGEuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGxlbj02NF0gdGhlIGRlc2lyZWQgdGFnIGxlbmd0aCwgaW4gYml0cy5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcHJlbWFjPWZhbHNlXSB0cnVlIGlmIHRoZSBhdXRoZW50aWNhdGlvbiBkYXRhIGlzIHByZS1tYWNjZWQgd2l0aCBQTUFDLlxuICAgKiBAcmV0dXJuIFRoZSBkZWNyeXB0ZWQgZGF0YSwgYW4gYXJyYXkgb2YgYnl0ZXMuXG4gICAqIEB0aHJvd3Mge3NqY2wuZXhjZXB0aW9uLmludmFsaWR9IGlmIHRoZSBJViBpc24ndCBleGFjdGx5IDEyOCBiaXRzLlxuICAgKiBAdGhyb3dzIHtzamNsLmV4Y2VwdGlvbi5jb3JydXB0fSBpZiBpZiB0aGUgbWVzc2FnZSBpcyBjb3JydXB0LlxuICAgKi9cbiAgZGVjcnlwdDogZnVuY3Rpb24ocHJwLCBjaXBoZXJ0ZXh0LCBpdiwgYWRhdGEsIHRsZW4sIHByZW1hYykge1xuICAgIGlmIChzamNsLmJpdEFycmF5LmJpdExlbmd0aChpdikgIT09IDEyOCkge1xuICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmludmFsaWQoXCJvY2IgaXYgbXVzdCBiZSAxMjggYml0c1wiKTtcbiAgICB9XG4gICAgdGxlbiAgPSB0bGVuIHx8IDY0O1xuICAgIHZhciBpLFxuICAgICAgICB0aW1lczIgPSBzamNsLm1vZGUub2NiMi5fdGltZXMyLFxuICAgICAgICB3ID0gc2pjbC5iaXRBcnJheSxcbiAgICAgICAgeG9yID0gdy5feG9yNCxcbiAgICAgICAgY2hlY2tzdW0gPSBbMCwwLDAsMF0sXG4gICAgICAgIGRlbHRhID0gdGltZXMyKHBycC5lbmNyeXB0KGl2KSksXG4gICAgICAgIGJpLCBibCxcbiAgICAgICAgbGVuID0gc2pjbC5iaXRBcnJheS5iaXRMZW5ndGgoY2lwaGVydGV4dCkgLSB0bGVuLFxuICAgICAgICBvdXRwdXQgPSBbXSxcbiAgICAgICAgcGFkO1xuICAgICAgICBcbiAgICBhZGF0YSA9IGFkYXRhIHx8IFtdO1xuICBcbiAgICBmb3IgKGk9MDsgaSs0IDwgbGVuLzMyOyBpKz00KSB7XG4gICAgICAvKiBEZWNyeXB0IGEgbm9uLWZpbmFsIGJsb2NrICovXG4gICAgICBiaSA9IHhvcihkZWx0YSwgcHJwLmRlY3J5cHQoeG9yKGRlbHRhLCBjaXBoZXJ0ZXh0LnNsaWNlKGksaSs0KSkpKTtcbiAgICAgIGNoZWNrc3VtID0geG9yKGNoZWNrc3VtLCBiaSk7XG4gICAgICBvdXRwdXQgPSBvdXRwdXQuY29uY2F0KGJpKTtcbiAgICAgIGRlbHRhID0gdGltZXMyKGRlbHRhKTtcbiAgICB9XG4gICAgXG4gICAgLyogQ2hvcCBvdXQgYW5kIGRlY3J5cHQgdGhlIGZpbmFsIGJsb2NrICovXG4gICAgYmwgPSBsZW4taSozMjtcbiAgICBwYWQgPSBwcnAuZW5jcnlwdCh4b3IoZGVsdGEsWzAsMCwwLGJsXSkpO1xuICAgIGJpID0geG9yKHBhZCwgdy5jbGFtcChjaXBoZXJ0ZXh0LnNsaWNlKGkpLGJsKS5jb25jYXQoWzAsMCwwXSkpO1xuICAgIFxuICAgIC8qIENoZWNrc3VtIHRoZSBmaW5hbCBibG9jaywgYW5kIGZpbmFsaXplIHRoZSBjaGVja3N1bSAqL1xuICAgIGNoZWNrc3VtID0geG9yKGNoZWNrc3VtLCBiaSk7XG4gICAgY2hlY2tzdW0gPSBwcnAuZW5jcnlwdCh4b3IoY2hlY2tzdW0sIHhvcihkZWx0YSwgdGltZXMyKGRlbHRhKSkpKTtcbiAgICBcbiAgICAvKiBNQUMgdGhlIGhlYWRlciAqL1xuICAgIGlmIChhZGF0YS5sZW5ndGgpIHtcbiAgICAgIGNoZWNrc3VtID0geG9yKGNoZWNrc3VtLCBwcmVtYWMgPyBhZGF0YSA6IHNqY2wubW9kZS5vY2IyLnBtYWMocHJwLCBhZGF0YSkpO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXcuZXF1YWwody5jbGFtcChjaGVja3N1bSwgdGxlbiksIHcuYml0U2xpY2UoY2lwaGVydGV4dCwgbGVuKSkpIHtcbiAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5jb3JydXB0KFwib2NiOiB0YWcgZG9lc24ndCBtYXRjaFwiKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dHB1dC5jb25jYXQody5jbGFtcChiaSxibCkpO1xuICB9LFxuICBcbiAgLyoqIFBNQUMgYXV0aGVudGljYXRpb24gZm9yIE9DQiBhc3NvY2lhdGVkIGRhdGEuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcnAgVGhlIGJsb2NrIGNpcGhlci4gIEl0IG11c3QgaGF2ZSBhIGJsb2NrIHNpemUgb2YgMTYgYnl0ZXMuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGFkYXRhIFRoZSBhdXRoZW50aWNhdGVkIGRhdGEuXG4gICAqL1xuICBwbWFjOiBmdW5jdGlvbihwcnAsIGFkYXRhKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHRpbWVzMiA9IHNqY2wubW9kZS5vY2IyLl90aW1lczIsXG4gICAgICAgIHcgPSBzamNsLmJpdEFycmF5LFxuICAgICAgICB4b3IgPSB3Ll94b3I0LFxuICAgICAgICBjaGVja3N1bSA9IFswLDAsMCwwXSxcbiAgICAgICAgZGVsdGEgPSBwcnAuZW5jcnlwdChbMCwwLDAsMF0pLFxuICAgICAgICBiaTtcbiAgICAgICAgXG4gICAgZGVsdGEgPSB4b3IoZGVsdGEsdGltZXMyKHRpbWVzMihkZWx0YSkpKTtcbiBcbiAgICBmb3IgKGk9MDsgaSs0PGFkYXRhLmxlbmd0aDsgaSs9NCkge1xuICAgICAgZGVsdGEgPSB0aW1lczIoZGVsdGEpO1xuICAgICAgY2hlY2tzdW0gPSB4b3IoY2hlY2tzdW0sIHBycC5lbmNyeXB0KHhvcihkZWx0YSwgYWRhdGEuc2xpY2UoaSxpKzQpKSkpO1xuICAgIH1cbiAgICBcbiAgICBiaSA9IGFkYXRhLnNsaWNlKGkpO1xuICAgIGlmICh3LmJpdExlbmd0aChiaSkgPCAxMjgpIHtcbiAgICAgIGRlbHRhID0geG9yKGRlbHRhLHRpbWVzMihkZWx0YSkpO1xuICAgICAgYmkgPSB3LmNvbmNhdChiaSxbMHg4MDAwMDAwMHwwLDAsMCwwXSk7XG4gICAgfVxuICAgIGNoZWNrc3VtID0geG9yKGNoZWNrc3VtLCBiaSk7XG4gICAgcmV0dXJuIHBycC5lbmNyeXB0KHhvcih0aW1lczIoeG9yKGRlbHRhLHRpbWVzMihkZWx0YSkpKSwgY2hlY2tzdW0pKTtcbiAgfSxcbiAgXG4gIC8qKiBEb3VibGUgYSBibG9jayBvZiB3b3JkcywgT0NCIHN0eWxlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3RpbWVzMjogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBbeFswXTw8MSBeIHhbMV0+Pj4zMSxcbiAgICAgICAgICAgIHhbMV08PDEgXiB4WzJdPj4+MzEsXG4gICAgICAgICAgICB4WzJdPDwxIF4geFszXT4+PjMxLFxuICAgICAgICAgICAgeFszXTw8MSBeICh4WzBdPj4+MzEpKjB4ODddO1xuICB9XG59O1xuLyoqIEBmaWxlT3ZlcnZpZXcgR0NNIG1vZGUgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQGF1dGhvciBKdWhvIFbDpGjDpC1IZXJ0dHVhXG4gKi9cblxuLyoqIEBuYW1lc3BhY2UgR2Fsb2lzL0NvdW50ZXIgbW9kZS4gKi9cbnNqY2wubW9kZS5nY20gPSB7XG4gIC8qKiBUaGUgbmFtZSBvZiB0aGUgbW9kZS5cbiAgICogQGNvbnN0YW50XG4gICAqL1xuICBuYW1lOiBcImdjbVwiLFxuICBcbiAgLyoqIEVuY3J5cHQgaW4gR0NNIG1vZGUuXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHtPYmplY3R9IHByZiBUaGUgcHNldWRvcmFuZG9tIGZ1bmN0aW9uLiAgSXQgbXVzdCBoYXZlIGEgYmxvY2sgc2l6ZSBvZiAxNiBieXRlcy5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gcGxhaW50ZXh0IFRoZSBwbGFpbnRleHQgZGF0YS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gaXYgVGhlIGluaXRpYWxpemF0aW9uIHZhbHVlLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBbYWRhdGE9W11dIFRoZSBhdXRoZW50aWNhdGVkIGRhdGEuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGxlbj0xMjhdIFRoZSBkZXNpcmVkIHRhZyBsZW5ndGgsIGluIGJpdHMuXG4gICAqIEByZXR1cm4ge2JpdEFycmF5fSBUaGUgZW5jcnlwdGVkIGRhdGEsIGFuIGFycmF5IG9mIGJ5dGVzLlxuICAgKi9cbiAgZW5jcnlwdDogZnVuY3Rpb24gKHByZiwgcGxhaW50ZXh0LCBpdiwgYWRhdGEsIHRsZW4pIHtcbiAgICB2YXIgb3V0LCBkYXRhID0gcGxhaW50ZXh0LnNsaWNlKDApLCB3PXNqY2wuYml0QXJyYXk7XG4gICAgdGxlbiA9IHRsZW4gfHwgMTI4O1xuICAgIGFkYXRhID0gYWRhdGEgfHwgW107XG5cbiAgICAvLyBlbmNyeXB0IGFuZCB0YWdcbiAgICBvdXQgPSBzamNsLm1vZGUuZ2NtLl9jdHJNb2RlKHRydWUsIHByZiwgZGF0YSwgYWRhdGEsIGl2LCB0bGVuKTtcblxuICAgIHJldHVybiB3LmNvbmNhdChvdXQuZGF0YSwgb3V0LnRhZyk7XG4gIH0sXG4gIFxuICAvKiogRGVjcnlwdCBpbiBHQ00gbW9kZS5cbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJmIFRoZSBwc2V1ZG9yYW5kb20gZnVuY3Rpb24uICBJdCBtdXN0IGhhdmUgYSBibG9jayBzaXplIG9mIDE2IGJ5dGVzLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBjaXBoZXJ0ZXh0IFRoZSBjaXBoZXJ0ZXh0IGRhdGEuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGl2IFRoZSBpbml0aWFsaXphdGlvbiB2YWx1ZS5cbiAgICogQHBhcmFtIHtiaXRBcnJheX0gW2FkYXRhPVtdXSBUaGUgYXV0aGVudGljYXRlZCBkYXRhLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RsZW49MTI4XSBUaGUgZGVzaXJlZCB0YWcgbGVuZ3RoLCBpbiBiaXRzLlxuICAgKiBAcmV0dXJuIHtiaXRBcnJheX0gVGhlIGRlY3J5cHRlZCBkYXRhLlxuICAgKi9cbiAgZGVjcnlwdDogZnVuY3Rpb24gKHByZiwgY2lwaGVydGV4dCwgaXYsIGFkYXRhLCB0bGVuKSB7XG4gICAgdmFyIG91dCwgZGF0YSA9IGNpcGhlcnRleHQuc2xpY2UoMCksIHRhZywgdz1zamNsLmJpdEFycmF5LCBsPXcuYml0TGVuZ3RoKGRhdGEpO1xuICAgIHRsZW4gPSB0bGVuIHx8IDEyODtcbiAgICBhZGF0YSA9IGFkYXRhIHx8IFtdO1xuXG4gICAgLy8gU2xpY2UgdGFnIG91dCBvZiBkYXRhXG4gICAgaWYgKHRsZW4gPD0gbCkge1xuICAgICAgdGFnID0gdy5iaXRTbGljZShkYXRhLCBsLXRsZW4pO1xuICAgICAgZGF0YSA9IHcuYml0U2xpY2UoZGF0YSwgMCwgbC10bGVuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFnID0gZGF0YTtcbiAgICAgIGRhdGEgPSBbXTtcbiAgICB9XG5cbiAgICAvLyBkZWNyeXB0IGFuZCB0YWdcbiAgICBvdXQgPSBzamNsLm1vZGUuZ2NtLl9jdHJNb2RlKGZhbHNlLCBwcmYsIGRhdGEsIGFkYXRhLCBpdiwgdGxlbik7XG5cbiAgICBpZiAoIXcuZXF1YWwob3V0LnRhZywgdGFnKSkge1xuICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmNvcnJ1cHQoXCJnY206IHRhZyBkb2Vzbid0IG1hdGNoXCIpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0LmRhdGE7XG4gIH0sXG5cbiAgLyogQ29tcHV0ZSB0aGUgZ2Fsb2lzIG11bHRpcGxpY2F0aW9uIG9mIFggYW5kIFlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nYWxvaXNNdWx0aXBseTogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB2YXIgaSwgaiwgeGksIFppLCBWaSwgbHNiX1ZpLCB3PXNqY2wuYml0QXJyYXksIHhvcj13Ll94b3I0O1xuXG4gICAgWmkgPSBbMCwwLDAsMF07XG4gICAgVmkgPSB5LnNsaWNlKDApO1xuXG4gICAgLy8gQmxvY2sgc2l6ZSBpcyAxMjggYml0cywgcnVuIDEyOCB0aW1lcyB0byBnZXQgWl8xMjhcbiAgICBmb3IgKGk9MDsgaTwxMjg7IGkrKykge1xuICAgICAgeGkgPSAoeFtNYXRoLmZsb29yKGkvMzIpXSAmICgxIDw8ICgzMS1pJTMyKSkpICE9PSAwO1xuICAgICAgaWYgKHhpKSB7XG4gICAgICAgIC8vIFpfaSsxID0gWl9pIF4gVl9pXG4gICAgICAgIFppID0geG9yKFppLCBWaSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFN0b3JlIHRoZSB2YWx1ZSBvZiBMU0IoVl9pKVxuICAgICAgbHNiX1ZpID0gKFZpWzNdICYgMSkgIT09IDA7XG5cbiAgICAgIC8vIFZfaSsxID0gVl9pID4+IDFcbiAgICAgIGZvciAoaj0zOyBqPjA7IGotLSkge1xuICAgICAgICBWaVtqXSA9IChWaVtqXSA+Pj4gMSkgfCAoKFZpW2otMV0mMSkgPDwgMzEpO1xuICAgICAgfVxuICAgICAgVmlbMF0gPSBWaVswXSA+Pj4gMTtcblxuICAgICAgLy8gSWYgTFNCKFZfaSkgaXMgMSwgVl9pKzEgPSAoVl9pID4+IDEpIF4gUlxuICAgICAgaWYgKGxzYl9WaSkge1xuICAgICAgICBWaVswXSA9IFZpWzBdIF4gKDB4ZTEgPDwgMjQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gWmk7XG4gIH0sXG5cbiAgX2doYXNoOiBmdW5jdGlvbihILCBZMCwgZGF0YSkge1xuICAgIHZhciBZaSwgaSwgbCA9IGRhdGEubGVuZ3RoO1xuXG4gICAgWWkgPSBZMC5zbGljZSgwKTtcbiAgICBmb3IgKGk9MDsgaTxsOyBpKz00KSB7XG4gICAgICBZaVswXSBePSAweGZmZmZmZmZmJmRhdGFbaV07XG4gICAgICBZaVsxXSBePSAweGZmZmZmZmZmJmRhdGFbaSsxXTtcbiAgICAgIFlpWzJdIF49IDB4ZmZmZmZmZmYmZGF0YVtpKzJdO1xuICAgICAgWWlbM10gXj0gMHhmZmZmZmZmZiZkYXRhW2krM107XG4gICAgICBZaSA9IHNqY2wubW9kZS5nY20uX2dhbG9pc011bHRpcGx5KFlpLCBIKTtcbiAgICB9XG4gICAgcmV0dXJuIFlpO1xuICB9LFxuXG4gIC8qKiBHQ00gQ1RSIG1vZGUuXG4gICAqIEVuY3J5cHQgb3IgZGVjcnlwdCBkYXRhIGFuZCB0YWcgd2l0aCB0aGUgcHJmIGluIEdDTS1zdHlsZSBDVFIgbW9kZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBlbmNyeXB0IFRydWUgaWYgZW5jcnlwdCwgZmFsc2UgaWYgZGVjcnlwdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHByZiBUaGUgUFJGLlxuICAgKiBAcGFyYW0ge2JpdEFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIGVuY3J5cHRlZCBvciBkZWNyeXB0ZWQuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGl2IFRoZSBpbml0aWFsaXphdGlvbiB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7Yml0QXJyYXl9IGFkYXRhIFRoZSBhc3NvY2lhdGVkIGRhdGEgdG8gYmUgdGFnZ2VkLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGxlbiBUaGUgbGVuZ3RoIG9mIHRoZSB0YWcsIGluIGJpdHMuXG4gICAqL1xuICBfY3RyTW9kZTogZnVuY3Rpb24oZW5jcnlwdCwgcHJmLCBkYXRhLCBhZGF0YSwgaXYsIHRsZW4pIHtcbiAgICB2YXIgSCwgSjAsIFMwLCBlbmMsIGksIGN0ciwgdGFnLCBsYXN0LCBsLCBibCwgYWJsLCBpdmJsLCB3PXNqY2wuYml0QXJyYXksIHhvcj13Ll94b3I0O1xuXG4gICAgLy8gQ2FsY3VsYXRlIGRhdGEgbGVuZ3Roc1xuICAgIGwgPSBkYXRhLmxlbmd0aDtcbiAgICBibCA9IHcuYml0TGVuZ3RoKGRhdGEpO1xuICAgIGFibCA9IHcuYml0TGVuZ3RoKGFkYXRhKTtcbiAgICBpdmJsID0gdy5iaXRMZW5ndGgoaXYpO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBwYXJhbWV0ZXJzXG4gICAgSCA9IHByZi5lbmNyeXB0KFswLDAsMCwwXSk7XG4gICAgaWYgKGl2YmwgPT09IDk2KSB7XG4gICAgICBKMCA9IGl2LnNsaWNlKDApO1xuICAgICAgSjAgPSB3LmNvbmNhdChKMCwgWzFdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgSjAgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCBbMCwwLDAsMF0sIGl2KTtcbiAgICAgIEowID0gc2pjbC5tb2RlLmdjbS5fZ2hhc2goSCwgSjAsIFswLDAsTWF0aC5mbG9vcihpdmJsLzB4MTAwMDAwMDAwKSxpdmJsJjB4ZmZmZmZmZmZdKTtcbiAgICB9XG4gICAgUzAgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCBbMCwwLDAsMF0sIGFkYXRhKTtcblxuICAgIC8vIEluaXRpYWxpemUgY3RyIGFuZCB0YWdcbiAgICBjdHIgPSBKMC5zbGljZSgwKTtcbiAgICB0YWcgPSBTMC5zbGljZSgwKTtcblxuICAgIC8vIElmIGRlY3J5cHRpbmcsIGNhbGN1bGF0ZSBoYXNoXG4gICAgaWYgKCFlbmNyeXB0KSB7XG4gICAgICB0YWcgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCBTMCwgZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gRW5jcnlwdCBhbGwgdGhlIGRhdGFcbiAgICBmb3IgKGk9MDsgaTxsOyBpKz00KSB7XG4gICAgICAgY3RyWzNdKys7XG4gICAgICAgZW5jID0gcHJmLmVuY3J5cHQoY3RyKTtcbiAgICAgICBkYXRhW2ldICAgXj0gZW5jWzBdO1xuICAgICAgIGRhdGFbaSsxXSBePSBlbmNbMV07XG4gICAgICAgZGF0YVtpKzJdIF49IGVuY1syXTtcbiAgICAgICBkYXRhW2krM10gXj0gZW5jWzNdO1xuICAgIH1cbiAgICBkYXRhID0gdy5jbGFtcChkYXRhLCBibCk7XG5cbiAgICAvLyBJZiBlbmNyeXB0aW5nLCBjYWxjdWxhdGUgaGFzaFxuICAgIGlmIChlbmNyeXB0KSB7XG4gICAgICB0YWcgPSBzamNsLm1vZGUuZ2NtLl9naGFzaChILCBTMCwgZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIGxhc3QgYmxvY2sgZnJvbSBiaXQgbGVuZ3RocywgdWdseSBiZWNhdXNlIGJpdHdpc2Ugb3BlcmF0aW9ucyBhcmUgMzItYml0XG4gICAgbGFzdCA9IFtcbiAgICAgIE1hdGguZmxvb3IoYWJsLzB4MTAwMDAwMDAwKSwgYWJsJjB4ZmZmZmZmZmYsXG4gICAgICBNYXRoLmZsb29yKGJsLzB4MTAwMDAwMDAwKSwgYmwmMHhmZmZmZmZmZlxuICAgIF07XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGZpbmFsIHRhZyBibG9ja1xuICAgIHRhZyA9IHNqY2wubW9kZS5nY20uX2doYXNoKEgsIHRhZywgbGFzdCk7XG4gICAgZW5jID0gcHJmLmVuY3J5cHQoSjApO1xuICAgIHRhZ1swXSBePSBlbmNbMF07XG4gICAgdGFnWzFdIF49IGVuY1sxXTtcbiAgICB0YWdbMl0gXj0gZW5jWzJdO1xuICAgIHRhZ1szXSBePSBlbmNbM107XG5cbiAgICByZXR1cm4geyB0YWc6dy5iaXRTbGljZSh0YWcsIDAsIHRsZW4pLCBkYXRhOmRhdGEgfTtcbiAgfVxufTtcbi8qKiBAZmlsZU92ZXJ2aWV3IEhNQUMgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cblxuLyoqIEhNQUMgd2l0aCB0aGUgc3BlY2lmaWVkIGhhc2ggZnVuY3Rpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7Yml0QXJyYXl9IGtleSB0aGUga2V5IGZvciBITUFDLlxuICogQHBhcmFtIHtPYmplY3R9IFtoYXNoPXNqY2wuaGFzaC5zaGEyNTZdIFRoZSBoYXNoIGZ1bmN0aW9uIHRvIHVzZS5cbiAqL1xuc2pjbC5taXNjLmhtYWMgPSBmdW5jdGlvbiAoa2V5LCBIYXNoKSB7XG4gIHRoaXMuX2hhc2ggPSBIYXNoID0gSGFzaCB8fCBzamNsLmhhc2guc2hhMjU2O1xuICB2YXIgZXhLZXkgPSBbW10sW11dLCBpLFxuICAgICAgYnMgPSBIYXNoLnByb3RvdHlwZS5ibG9ja1NpemUgLyAzMjtcbiAgdGhpcy5fYmFzZUhhc2ggPSBbbmV3IEhhc2goKSwgbmV3IEhhc2goKV07XG5cbiAgaWYgKGtleS5sZW5ndGggPiBicykge1xuICAgIGtleSA9IEhhc2guaGFzaChrZXkpO1xuICB9XG4gIFxuICBmb3IgKGk9MDsgaTxiczsgaSsrKSB7XG4gICAgZXhLZXlbMF1baV0gPSBrZXlbaV1eMHgzNjM2MzYzNjtcbiAgICBleEtleVsxXVtpXSA9IGtleVtpXV4weDVDNUM1QzVDO1xuICB9XG4gIFxuICB0aGlzLl9iYXNlSGFzaFswXS51cGRhdGUoZXhLZXlbMF0pO1xuICB0aGlzLl9iYXNlSGFzaFsxXS51cGRhdGUoZXhLZXlbMV0pO1xuICB0aGlzLl9yZXN1bHRIYXNoID0gbmV3IEhhc2godGhpcy5fYmFzZUhhc2hbMF0pO1xufTtcblxuLyoqIEhNQUMgd2l0aCB0aGUgc3BlY2lmaWVkIGhhc2ggZnVuY3Rpb24uICBBbHNvIGNhbGxlZCBlbmNyeXB0IHNpbmNlIGl0J3MgYSBwcmYuXG4gKiBAcGFyYW0ge2JpdEFycmF5fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBtYWMuXG4gKi9cbnNqY2wubWlzYy5obWFjLnByb3RvdHlwZS5lbmNyeXB0ID0gc2pjbC5taXNjLmhtYWMucHJvdG90eXBlLm1hYyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIGlmICghdGhpcy5fdXBkYXRlZCkge1xuICAgIHRoaXMudXBkYXRlKGRhdGEpO1xuICAgIHJldHVybiB0aGlzLmRpZ2VzdChkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImVuY3J5cHQgb24gYWxyZWFkeSB1cGRhdGVkIGhtYWMgY2FsbGVkIVwiKTtcbiAgfVxufTtcblxuc2pjbC5taXNjLmhtYWMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLl9yZXN1bHRIYXNoID0gbmV3IHRoaXMuX2hhc2godGhpcy5fYmFzZUhhc2hbMF0pO1xuICB0aGlzLl91cGRhdGVkID0gZmFsc2U7XG59O1xuXG5zamNsLm1pc2MuaG1hYy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgdGhpcy5fdXBkYXRlZCA9IHRydWU7XG4gIHRoaXMuX3Jlc3VsdEhhc2gudXBkYXRlKGRhdGEpO1xufTtcblxuc2pjbC5taXNjLmhtYWMucHJvdG90eXBlLmRpZ2VzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHcgPSB0aGlzLl9yZXN1bHRIYXNoLmZpbmFsaXplKCksIHJlc3VsdCA9IG5ldyAodGhpcy5faGFzaCkodGhpcy5fYmFzZUhhc2hbMV0pLnVwZGF0ZSh3KS5maW5hbGl6ZSgpO1xuXG4gIHRoaXMucmVzZXQoKTtcblxuICByZXR1cm4gcmVzdWx0O1xufTsvKiogQGZpbGVPdmVydmlldyBQYXNzd29yZC1iYXNlZCBrZXktZGVyaXZhdGlvbiBmdW5jdGlvbiwgdmVyc2lvbiAyLjAuXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cblxuLyoqIFBhc3N3b3JkLUJhc2VkIEtleS1EZXJpdmF0aW9uIEZ1bmN0aW9uLCB2ZXJzaW9uIDIuMC5cbiAqXG4gKiBHZW5lcmF0ZSBrZXlzIGZyb20gcGFzc3dvcmRzIHVzaW5nIFBCS0RGMi1ITUFDLVNIQTI1Ni5cbiAqXG4gKiBUaGlzIGlzIHRoZSBtZXRob2Qgc3BlY2lmaWVkIGJ5IFJTQSdzIFBLQ1MgIzUgc3RhbmRhcmQuXG4gKlxuICogQHBhcmFtIHtiaXRBcnJheXxTdHJpbmd9IHBhc3N3b3JkICBUaGUgcGFzc3dvcmQuXG4gKiBAcGFyYW0ge2JpdEFycmF5fFN0cmluZ30gc2FsdCBUaGUgc2FsdC4gIFNob3VsZCBoYXZlIGxvdHMgb2YgZW50cm9weS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY291bnQ9MTAwMF0gVGhlIG51bWJlciBvZiBpdGVyYXRpb25zLiAgSGlnaGVyIG51bWJlcnMgbWFrZSB0aGUgZnVuY3Rpb24gc2xvd2VyIGJ1dCBtb3JlIHNlY3VyZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbbGVuZ3RoXSBUaGUgbGVuZ3RoIG9mIHRoZSBkZXJpdmVkIGtleS4gIERlZmF1bHRzIHRvIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCBzaXplIG9mIHRoZSBoYXNoIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtPYmplY3R9IFtQcmZmPXNqY2wubWlzYy5obWFjXSBUaGUgcHNldWRvcmFuZG9tIGZ1bmN0aW9uIGZhbWlseS5cbiAqIEByZXR1cm4ge2JpdEFycmF5fSB0aGUgZGVyaXZlZCBrZXkuXG4gKi9cbnNqY2wubWlzYy5wYmtkZjIgPSBmdW5jdGlvbiAocGFzc3dvcmQsIHNhbHQsIGNvdW50LCBsZW5ndGgsIFByZmYpIHtcbiAgY291bnQgPSBjb3VudCB8fCAxMDAwO1xuICBcbiAgaWYgKGxlbmd0aCA8IDAgfHwgY291bnQgPCAwKSB7XG4gICAgdGhyb3cgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImludmFsaWQgcGFyYW1zIHRvIHBia2RmMlwiKTtcbiAgfVxuICBcbiAgaWYgKHR5cGVvZiBwYXNzd29yZCA9PT0gXCJzdHJpbmdcIikge1xuICAgIHBhc3N3b3JkID0gc2pjbC5jb2RlYy51dGY4U3RyaW5nLnRvQml0cyhwYXNzd29yZCk7XG4gIH1cbiAgXG4gIGlmICh0eXBlb2Ygc2FsdCA9PT0gXCJzdHJpbmdcIikge1xuICAgIHNhbHQgPSBzamNsLmNvZGVjLnV0ZjhTdHJpbmcudG9CaXRzKHNhbHQpO1xuICB9XG4gIFxuICBQcmZmID0gUHJmZiB8fCBzamNsLm1pc2MuaG1hYztcbiAgXG4gIHZhciBwcmYgPSBuZXcgUHJmZihwYXNzd29yZCksXG4gICAgICB1LCB1aSwgaSwgaiwgaywgb3V0ID0gW10sIGIgPSBzamNsLmJpdEFycmF5O1xuXG4gIGZvciAoayA9IDE7IDMyICogb3V0Lmxlbmd0aCA8IChsZW5ndGggfHwgMSk7IGsrKykge1xuICAgIHUgPSB1aSA9IHByZi5lbmNyeXB0KGIuY29uY2F0KHNhbHQsW2tdKSk7XG4gICAgXG4gICAgZm9yIChpPTE7IGk8Y291bnQ7IGkrKykge1xuICAgICAgdWkgPSBwcmYuZW5jcnlwdCh1aSk7XG4gICAgICBmb3IgKGo9MDsgajx1aS5sZW5ndGg7IGorKykge1xuICAgICAgICB1W2pdIF49IHVpW2pdO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBvdXQgPSBvdXQuY29uY2F0KHUpO1xuICB9XG5cbiAgaWYgKGxlbmd0aCkgeyBvdXQgPSBiLmNsYW1wKG91dCwgbGVuZ3RoKTsgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuLyoqIEBmaWxlT3ZlcnZpZXcgUmFuZG9tIG51bWJlciBnZW5lcmF0b3IuXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKiBAYXV0aG9yIE1pY2hhZWwgQnJvb2tzXG4gKi9cblxuLyoqIEBjb25zdHJ1Y3RvclxuICogQGNsYXNzIFJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yXG4gKiBAZGVzY3JpcHRpb25cbiAqIDxiPlVzZSBzamNsLnJhbmRvbSBhcyBhIHNpbmdsZXRvbiBmb3IgdGhpcyBjbGFzcyE8L2I+XG4gKiA8cD5cbiAqIFRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaXMgYSBkZXJpdmF0aXZlIG9mIEZlcmd1c29uIGFuZCBTY2huZWllcidzXG4gKiBnZW5lcmF0b3IgRm9ydHVuYS4gIEl0IGNvbGxlY3RzIGVudHJvcHkgZnJvbSB2YXJpb3VzIGV2ZW50cyBpbnRvIHNldmVyYWxcbiAqIHBvb2xzLCBpbXBsZW1lbnRlZCBieSBzdHJlYW1pbmcgU0hBLTI1NiBpbnN0YW5jZXMuICBJdCBkaWZmZXJzIGZyb21cbiAqIG9yZGluYXJ5IEZvcnR1bmEgaW4gYSBmZXcgd2F5cywgdGhvdWdoLlxuICogPC9wPlxuICpcbiAqIDxwPlxuICogTW9zdCBpbXBvcnRhbnRseSwgaXQgaGFzIGFuIGVudHJvcHkgZXN0aW1hdG9yLiAgVGhpcyBpcyBwcmVzZW50IGJlY2F1c2VcbiAqIHRoZXJlIGlzIGEgc3Ryb25nIGNvbmZsaWN0IGhlcmUgYmV0d2VlbiBtYWtpbmcgdGhlIGdlbmVyYXRvciBhdmFpbGFibGVcbiAqIGFzIHNvb24gYXMgcG9zc2libGUsIGFuZCBtYWtpbmcgc3VyZSB0aGF0IGl0IGRvZXNuJ3QgXCJydW4gb24gZW1wdHlcIi5cbiAqIEluIEZvcnR1bmEsIHRoZXJlIGlzIGEgc2F2ZWQgc3RhdGUgZmlsZSwgYW5kIHRoZSBzeXN0ZW0gaXMgbGlrZWx5IHRvIGhhdmVcbiAqIHRpbWUgdG8gd2FybSB1cC5cbiAqIDwvcD5cbiAqXG4gKiA8cD5cbiAqIFNlY29uZCwgYmVjYXVzZSB1c2VycyBhcmUgdW5saWtlbHkgdG8gc3RheSBvbiB0aGUgcGFnZSBmb3IgdmVyeSBsb25nLFxuICogYW5kIHRvIHNwZWVkIHN0YXJ0dXAgdGltZSwgdGhlIG51bWJlciBvZiBwb29scyBpbmNyZWFzZXMgbG9nYXJpdGhtaWNhbGx5OlxuICogYSBuZXcgcG9vbCBpcyBjcmVhdGVkIHdoZW4gdGhlIHByZXZpb3VzIG9uZSBpcyBhY3R1YWxseSB1c2VkIGZvciBhIHJlc2VlZC5cbiAqIFRoaXMgZ2l2ZXMgdGhlIHNhbWUgYXN5bXB0b3RpYyBndWFyYW50ZWVzIGFzIEZvcnR1bmEsIGJ1dCBnaXZlcyBtb3JlXG4gKiBlbnRyb3B5IHRvIGVhcmx5IHJlc2VlZHMuXG4gKiA8L3A+XG4gKlxuICogPHA+XG4gKiBUaGUgZW50aXJlIG1lY2hhbmlzbSBoZXJlIGZlZWxzIHByZXR0eSBrbHVua3kuICBGdXJ0aGVybW9yZSwgdGhlcmUgYXJlXG4gKiBzZXZlcmFsIGltcHJvdmVtZW50cyB0aGF0IHNob3VsZCBiZSBtYWRlLCBpbmNsdWRpbmcgc3VwcG9ydCBmb3JcbiAqIGRlZGljYXRlZCBjcnlwdG9ncmFwaGljIGZ1bmN0aW9ucyB0aGF0IG1heSBiZSBwcmVzZW50IGluIHNvbWUgYnJvd3NlcnM7XG4gKiBzdGF0ZSBmaWxlcyBpbiBsb2NhbCBzdG9yYWdlOyBjb29raWVzIGNvbnRhaW5pbmcgcmFuZG9tbmVzczsgZXRjLiAgU29cbiAqIGxvb2sgZm9yIGltcHJvdmVtZW50cyBpbiBmdXR1cmUgdmVyc2lvbnMuXG4gKiA8L3A+XG4gKi9cbnNqY2wucHJuZyA9IGZ1bmN0aW9uKGRlZmF1bHRQYXJhbm9pYSkge1xuICBcbiAgLyogcHJpdmF0ZSAqL1xuICB0aGlzLl9wb29scyAgICAgICAgICAgICAgICAgICA9IFtuZXcgc2pjbC5oYXNoLnNoYTI1NigpXTtcbiAgdGhpcy5fcG9vbEVudHJvcHkgICAgICAgICAgICAgPSBbMF07XG4gIHRoaXMuX3Jlc2VlZENvdW50ICAgICAgICAgICAgID0gMDtcbiAgdGhpcy5fcm9iaW5zICAgICAgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fZXZlbnRJZCAgICAgICAgICAgICAgICAgPSAwO1xuICBcbiAgdGhpcy5fY29sbGVjdG9ySWRzICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fY29sbGVjdG9ySWROZXh0ICAgICAgICAgPSAwO1xuICBcbiAgdGhpcy5fc3RyZW5ndGggICAgICAgICAgICAgICAgPSAwO1xuICB0aGlzLl9wb29sU3RyZW5ndGggICAgICAgICAgICA9IDA7XG4gIHRoaXMuX25leHRSZXNlZWQgICAgICAgICAgICAgID0gMDtcbiAgdGhpcy5fa2V5ICAgICAgICAgICAgICAgICAgICAgPSBbMCwwLDAsMCwwLDAsMCwwXTtcbiAgdGhpcy5fY291bnRlciAgICAgICAgICAgICAgICAgPSBbMCwwLDAsMF07XG4gIHRoaXMuX2NpcGhlciAgICAgICAgICAgICAgICAgID0gdW5kZWZpbmVkO1xuICB0aGlzLl9kZWZhdWx0UGFyYW5vaWEgICAgICAgICA9IGRlZmF1bHRQYXJhbm9pYTtcbiAgXG4gIC8qIGV2ZW50IGxpc3RlbmVyIHN0dWZmICovXG4gIHRoaXMuX2NvbGxlY3RvcnNTdGFydGVkICAgICAgID0gZmFsc2U7XG4gIHRoaXMuX2NhbGxiYWNrcyAgICAgICAgICAgICAgID0ge3Byb2dyZXNzOiB7fSwgc2VlZGVkOiB7fX07XG4gIHRoaXMuX2NhbGxiYWNrSSAgICAgICAgICAgICAgID0gMDtcbiAgXG4gIC8qIGNvbnN0YW50cyAqL1xuICB0aGlzLl9OT1RfUkVBRFkgICAgICAgICAgICAgICA9IDA7XG4gIHRoaXMuX1JFQURZICAgICAgICAgICAgICAgICAgID0gMTtcbiAgdGhpcy5fUkVRVUlSRVNfUkVTRUVEICAgICAgICAgPSAyO1xuXG4gIHRoaXMuX01BWF9XT1JEU19QRVJfQlVSU1QgICAgID0gNjU1MzY7XG4gIHRoaXMuX1BBUkFOT0lBX0xFVkVMUyAgICAgICAgID0gWzAsNDgsNjQsOTYsMTI4LDE5MiwyNTYsMzg0LDUxMiw3NjgsMTAyNF07XG4gIHRoaXMuX01JTExJU0VDT05EU19QRVJfUkVTRUVEID0gMzAwMDA7XG4gIHRoaXMuX0JJVFNfUEVSX1JFU0VFRCAgICAgICAgID0gODA7XG59O1xuIFxuc2pjbC5wcm5nLnByb3RvdHlwZSA9IHtcbiAgLyoqIEdlbmVyYXRlIHNldmVyYWwgcmFuZG9tIHdvcmRzLCBhbmQgcmV0dXJuIHRoZW0gaW4gYW4gYXJyYXkuXG4gICAqIEEgd29yZCBjb25zaXN0cyBvZiAzMiBiaXRzICg0IGJ5dGVzKVxuICAgKiBAcGFyYW0ge051bWJlcn0gbndvcmRzIFRoZSBudW1iZXIgb2Ygd29yZHMgdG8gZ2VuZXJhdGUuXG4gICAqL1xuICByYW5kb21Xb3JkczogZnVuY3Rpb24gKG53b3JkcywgcGFyYW5vaWEpIHtcbiAgICB2YXIgb3V0ID0gW10sIGksIHJlYWRpbmVzcyA9IHRoaXMuaXNSZWFkeShwYXJhbm9pYSksIGc7XG4gIFxuICAgIGlmIChyZWFkaW5lc3MgPT09IHRoaXMuX05PVF9SRUFEWSkge1xuICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLm5vdFJlYWR5KFwiZ2VuZXJhdG9yIGlzbid0IHNlZWRlZFwiKTtcbiAgICB9IGVsc2UgaWYgKHJlYWRpbmVzcyAmIHRoaXMuX1JFUVVJUkVTX1JFU0VFRCkge1xuICAgICAgdGhpcy5fcmVzZWVkRnJvbVBvb2xzKCEocmVhZGluZXNzICYgdGhpcy5fUkVBRFkpKTtcbiAgICB9XG4gIFxuICAgIGZvciAoaT0wOyBpPG53b3JkczsgaSs9IDQpIHtcbiAgICAgIGlmICgoaSsxKSAlIHRoaXMuX01BWF9XT1JEU19QRVJfQlVSU1QgPT09IDApIHtcbiAgICAgICAgdGhpcy5fZ2F0ZSgpO1xuICAgICAgfVxuICAgXG4gICAgICBnID0gdGhpcy5fZ2VuNHdvcmRzKCk7XG4gICAgICBvdXQucHVzaChnWzBdLGdbMV0sZ1syXSxnWzNdKTtcbiAgICB9XG4gICAgdGhpcy5fZ2F0ZSgpO1xuICBcbiAgICByZXR1cm4gb3V0LnNsaWNlKDAsbndvcmRzKTtcbiAgfSxcbiAgXG4gIHNldERlZmF1bHRQYXJhbm9pYTogZnVuY3Rpb24gKHBhcmFub2lhLCBhbGxvd1plcm9QYXJhbm9pYSkge1xuICAgIGlmIChwYXJhbm9pYSA9PT0gMCAmJiBhbGxvd1plcm9QYXJhbm9pYSAhPT0gXCJTZXR0aW5nIHBhcmFub2lhPTAgd2lsbCBydWluIHlvdXIgc2VjdXJpdHk7IHVzZSBpdCBvbmx5IGZvciB0ZXN0aW5nXCIpIHtcbiAgICAgIHRocm93IFwiU2V0dGluZyBwYXJhbm9pYT0wIHdpbGwgcnVpbiB5b3VyIHNlY3VyaXR5OyB1c2UgaXQgb25seSBmb3IgdGVzdGluZ1wiO1xuICAgIH1cblxuICAgIHRoaXMuX2RlZmF1bHRQYXJhbm9pYSA9IHBhcmFub2lhO1xuICB9LFxuICBcbiAgLyoqXG4gICAqIEFkZCBlbnRyb3B5IHRvIHRoZSBwb29scy5cbiAgICogQHBhcmFtIGRhdGEgVGhlIGVudHJvcGljIHZhbHVlLiAgU2hvdWxkIGJlIGEgMzItYml0IGludGVnZXIsIGFycmF5IG9mIDMyLWJpdCBpbnRlZ2Vycywgb3Igc3RyaW5nXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlc3RpbWF0ZWRFbnRyb3B5IFRoZSBlc3RpbWF0ZWQgZW50cm9weSBvZiBkYXRhLCBpbiBiaXRzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzb3VyY2UgVGhlIHNvdXJjZSBvZiB0aGUgZW50cm9weSwgZWcgXCJtb3VzZVwiXG4gICAqL1xuICBhZGRFbnRyb3B5OiBmdW5jdGlvbiAoZGF0YSwgZXN0aW1hdGVkRW50cm9weSwgc291cmNlKSB7XG4gICAgc291cmNlID0gc291cmNlIHx8IFwidXNlclwiO1xuICBcbiAgICB2YXIgaWQsXG4gICAgICBpLCB0bXAsXG4gICAgICB0ID0gKG5ldyBEYXRlKCkpLnZhbHVlT2YoKSxcbiAgICAgIHJvYmluID0gdGhpcy5fcm9iaW5zW3NvdXJjZV0sXG4gICAgICBvbGRSZWFkeSA9IHRoaXMuaXNSZWFkeSgpLCBlcnIgPSAwLCBvYmpOYW1lO1xuICAgICAgXG4gICAgaWQgPSB0aGlzLl9jb2xsZWN0b3JJZHNbc291cmNlXTtcbiAgICBpZiAoaWQgPT09IHVuZGVmaW5lZCkgeyBpZCA9IHRoaXMuX2NvbGxlY3Rvcklkc1tzb3VyY2VdID0gdGhpcy5fY29sbGVjdG9ySWROZXh0ICsrOyB9XG4gICAgICBcbiAgICBpZiAocm9iaW4gPT09IHVuZGVmaW5lZCkgeyByb2JpbiA9IHRoaXMuX3JvYmluc1tzb3VyY2VdID0gMDsgfVxuICAgIHRoaXMuX3JvYmluc1tzb3VyY2VdID0gKCB0aGlzLl9yb2JpbnNbc291cmNlXSArIDEgKSAlIHRoaXMuX3Bvb2xzLmxlbmd0aDtcbiAgXG4gICAgc3dpdGNoKHR5cGVvZihkYXRhKSkge1xuICAgICAgXG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgaWYgKGVzdGltYXRlZEVudHJvcHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlc3RpbWF0ZWRFbnRyb3B5ID0gMTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3Bvb2xzW3JvYmluXS51cGRhdGUoW2lkLHRoaXMuX2V2ZW50SWQrKywxLGVzdGltYXRlZEVudHJvcHksdCwxLGRhdGF8MF0pO1xuICAgICAgYnJlYWs7XG4gICAgICBcbiAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICBvYmpOYW1lID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpO1xuICAgICAgaWYgKG9iak5hbWUgPT09IFwiW29iamVjdCBVaW50MzJBcnJheV1cIikge1xuICAgICAgICB0bXAgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0bXAucHVzaChkYXRhW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhID0gdG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9iak5hbWUgIT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgICAgIGVyciA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpPTA7IGk8ZGF0YS5sZW5ndGggJiYgIWVycjsgaSsrKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZihkYXRhW2ldKSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgZXJyID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIGlmIChlc3RpbWF0ZWRFbnRyb3B5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvKiBob3JyaWJsZSBlbnRyb3B5IGVzdGltYXRvciAqL1xuICAgICAgICAgIGVzdGltYXRlZEVudHJvcHkgPSAwO1xuICAgICAgICAgIGZvciAoaT0wOyBpPGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRtcD0gZGF0YVtpXTtcbiAgICAgICAgICAgIHdoaWxlICh0bXA+MCkge1xuICAgICAgICAgICAgICBlc3RpbWF0ZWRFbnRyb3B5Kys7XG4gICAgICAgICAgICAgIHRtcCA9IHRtcCA+Pj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcG9vbHNbcm9iaW5dLnVwZGF0ZShbaWQsdGhpcy5fZXZlbnRJZCsrLDIsZXN0aW1hdGVkRW50cm9weSx0LGRhdGEubGVuZ3RoXS5jb25jYXQoZGF0YSkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBpZiAoZXN0aW1hdGVkRW50cm9weSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgLyogRW5nbGlzaCB0ZXh0IGhhcyBqdXN0IG92ZXIgMSBiaXQgcGVyIGNoYXJhY3RlciBvZiBlbnRyb3B5LlxuICAgICAgICAqIEJ1dCB0aGlzIG1pZ2h0IGJlIEhUTUwgb3Igc29tZXRoaW5nLCBhbmQgaGF2ZSBmYXIgbGVzc1xuICAgICAgICAqIGVudHJvcHkgdGhhbiBFbmdsaXNoLi4uICBPaCB3ZWxsLCBsZXQncyBqdXN0IHNheSBvbmUgYml0LlxuICAgICAgICAqL1xuICAgICAgIGVzdGltYXRlZEVudHJvcHkgPSBkYXRhLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3Bvb2xzW3JvYmluXS51cGRhdGUoW2lkLHRoaXMuX2V2ZW50SWQrKywzLGVzdGltYXRlZEVudHJvcHksdCxkYXRhLmxlbmd0aF0pO1xuICAgICAgdGhpcy5fcG9vbHNbcm9iaW5dLnVwZGF0ZShkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgICAgXG4gICAgZGVmYXVsdDpcbiAgICAgIGVycj0xO1xuICAgIH1cbiAgICBpZiAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uYnVnKFwicmFuZG9tOiBhZGRFbnRyb3B5IG9ubHkgc3VwcG9ydHMgbnVtYmVyLCBhcnJheSBvZiBudW1iZXJzIG9yIHN0cmluZ1wiKTtcbiAgICB9XG4gIFxuICAgIC8qIHJlY29yZCB0aGUgbmV3IHN0cmVuZ3RoICovXG4gICAgdGhpcy5fcG9vbEVudHJvcHlbcm9iaW5dICs9IGVzdGltYXRlZEVudHJvcHk7XG4gICAgdGhpcy5fcG9vbFN0cmVuZ3RoICs9IGVzdGltYXRlZEVudHJvcHk7XG4gIFxuICAgIC8qIGZpcmUgb2ZmIGV2ZW50cyAqL1xuICAgIGlmIChvbGRSZWFkeSA9PT0gdGhpcy5fTk9UX1JFQURZKSB7XG4gICAgICBpZiAodGhpcy5pc1JlYWR5KCkgIT09IHRoaXMuX05PVF9SRUFEWSkge1xuICAgICAgICB0aGlzLl9maXJlRXZlbnQoXCJzZWVkZWRcIiwgTWF0aC5tYXgodGhpcy5fc3RyZW5ndGgsIHRoaXMuX3Bvb2xTdHJlbmd0aCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZmlyZUV2ZW50KFwicHJvZ3Jlc3NcIiwgdGhpcy5nZXRQcm9ncmVzcygpKTtcbiAgICB9XG4gIH0sXG4gIFxuICAvKiogSXMgdGhlIGdlbmVyYXRvciByZWFkeT8gKi9cbiAgaXNSZWFkeTogZnVuY3Rpb24gKHBhcmFub2lhKSB7XG4gICAgdmFyIGVudHJvcHlSZXF1aXJlZCA9IHRoaXMuX1BBUkFOT0lBX0xFVkVMU1sgKHBhcmFub2lhICE9PSB1bmRlZmluZWQpID8gcGFyYW5vaWEgOiB0aGlzLl9kZWZhdWx0UGFyYW5vaWEgXTtcbiAgXG4gICAgaWYgKHRoaXMuX3N0cmVuZ3RoICYmIHRoaXMuX3N0cmVuZ3RoID49IGVudHJvcHlSZXF1aXJlZCkge1xuICAgICAgcmV0dXJuICh0aGlzLl9wb29sRW50cm9weVswXSA+IHRoaXMuX0JJVFNfUEVSX1JFU0VFRCAmJiAobmV3IERhdGUoKSkudmFsdWVPZigpID4gdGhpcy5fbmV4dFJlc2VlZCkgP1xuICAgICAgICB0aGlzLl9SRVFVSVJFU19SRVNFRUQgfCB0aGlzLl9SRUFEWSA6XG4gICAgICAgIHRoaXMuX1JFQURZO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRoaXMuX3Bvb2xTdHJlbmd0aCA+PSBlbnRyb3B5UmVxdWlyZWQpID9cbiAgICAgICAgdGhpcy5fUkVRVUlSRVNfUkVTRUVEIHwgdGhpcy5fTk9UX1JFQURZIDpcbiAgICAgICAgdGhpcy5fTk9UX1JFQURZO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8qKiBHZXQgdGhlIGdlbmVyYXRvcidzIHByb2dyZXNzIHRvd2FyZCByZWFkaW5lc3MsIGFzIGEgZnJhY3Rpb24gKi9cbiAgZ2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uIChwYXJhbm9pYSkge1xuICAgIHZhciBlbnRyb3B5UmVxdWlyZWQgPSB0aGlzLl9QQVJBTk9JQV9MRVZFTFNbIHBhcmFub2lhID8gcGFyYW5vaWEgOiB0aGlzLl9kZWZhdWx0UGFyYW5vaWEgXTtcbiAgXG4gICAgaWYgKHRoaXMuX3N0cmVuZ3RoID49IGVudHJvcHlSZXF1aXJlZCkge1xuICAgICAgcmV0dXJuIDEuMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aGlzLl9wb29sU3RyZW5ndGggPiBlbnRyb3B5UmVxdWlyZWQpID9cbiAgICAgICAgMS4wIDpcbiAgICAgICAgdGhpcy5fcG9vbFN0cmVuZ3RoIC8gZW50cm9weVJlcXVpcmVkO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8qKiBzdGFydCB0aGUgYnVpbHQtaW4gZW50cm9weSBjb2xsZWN0b3JzICovXG4gIHN0YXJ0Q29sbGVjdG9yczogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9jb2xsZWN0b3JzU3RhcnRlZCkgeyByZXR1cm47IH1cbiAgXG4gICAgdGhpcy5fZXZlbnRMaXN0ZW5lciA9IHtcbiAgICAgIGxvYWRUaW1lQ29sbGVjdG9yOiB0aGlzLl9iaW5kKHRoaXMuX2xvYWRUaW1lQ29sbGVjdG9yKSxcbiAgICAgIG1vdXNlQ29sbGVjdG9yOiB0aGlzLl9iaW5kKHRoaXMuX21vdXNlQ29sbGVjdG9yKSxcbiAgICAgIGtleWJvYXJkQ29sbGVjdG9yOiB0aGlzLl9iaW5kKHRoaXMuX2tleWJvYXJkQ29sbGVjdG9yKSxcbiAgICAgIGFjY2VsZXJvbWV0ZXJDb2xsZWN0b3I6IHRoaXMuX2JpbmQodGhpcy5fYWNjZWxlcm9tZXRlckNvbGxlY3RvcilcbiAgICB9XG5cbiAgICBpZiAod2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCB0aGlzLl9ldmVudExpc3RlbmVyLmxvYWRUaW1lQ29sbGVjdG9yLCBmYWxzZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLl9ldmVudExpc3RlbmVyLm1vdXNlQ29sbGVjdG9yLCBmYWxzZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIHRoaXMuX2V2ZW50TGlzdGVuZXIua2V5Ym9hcmRDb2xsZWN0b3IsIGZhbHNlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIHRoaXMuX2V2ZW50TGlzdGVuZXIuYWNjZWxlcm9tZXRlckNvbGxlY3RvciwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcbiAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIHRoaXMuX2V2ZW50TGlzdGVuZXIubG9hZFRpbWVDb2xsZWN0b3IpO1xuICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoXCJvbm1vdXNlbW92ZVwiLCB0aGlzLl9ldmVudExpc3RlbmVyLm1vdXNlQ29sbGVjdG9yKTtcbiAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KFwia2V5cHJlc3NcIiwgdGhpcy5fZXZlbnRMaXN0ZW5lci5rZXlib2FyZENvbGxlY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5idWcoXCJjYW4ndCBhdHRhY2ggZXZlbnRcIik7XG4gICAgfVxuICBcbiAgICB0aGlzLl9jb2xsZWN0b3JzU3RhcnRlZCA9IHRydWU7XG4gIH0sXG4gIFxuICAvKiogc3RvcCB0aGUgYnVpbHQtaW4gZW50cm9weSBjb2xsZWN0b3JzICovXG4gIHN0b3BDb2xsZWN0b3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9jb2xsZWN0b3JzU3RhcnRlZCkgeyByZXR1cm47IH1cbiAgXG4gICAgaWYgKHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgdGhpcy5fZXZlbnRMaXN0ZW5lci5sb2FkVGltZUNvbGxlY3RvciwgZmFsc2UpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5fZXZlbnRMaXN0ZW5lci5tb3VzZUNvbGxlY3RvciwgZmFsc2UpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCB0aGlzLl9ldmVudExpc3RlbmVyLmtleWJvYXJkQ29sbGVjdG9yLCBmYWxzZSk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRldmljZW1vdGlvblwiLCB0aGlzLl9ldmVudExpc3RlbmVyLmFjY2VsZXJvbWV0ZXJDb2xsZWN0b3IsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmRldGFjaEV2ZW50KSB7XG4gICAgICBkb2N1bWVudC5kZXRhY2hFdmVudChcIm9ubG9hZFwiLCB0aGlzLl9ldmVudExpc3RlbmVyLmxvYWRUaW1lQ29sbGVjdG9yKTtcbiAgICAgIGRvY3VtZW50LmRldGFjaEV2ZW50KFwib25tb3VzZW1vdmVcIiwgdGhpcy5fZXZlbnRMaXN0ZW5lci5tb3VzZUNvbGxlY3Rvcik7XG4gICAgICBkb2N1bWVudC5kZXRhY2hFdmVudChcImtleXByZXNzXCIsIHRoaXMuX2V2ZW50TGlzdGVuZXIua2V5Ym9hcmRDb2xsZWN0b3IpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbGxlY3RvcnNTdGFydGVkID0gZmFsc2U7XG4gIH0sXG4gIFxuICAvKiB1c2UgYSBjb29raWUgdG8gc3RvcmUgZW50cm9weS5cbiAgdXNlQ29va2llOiBmdW5jdGlvbiAoYWxsX2Nvb2tpZXMpIHtcbiAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5idWcoXCJyYW5kb206IHVzZUNvb2tpZSBpcyB1bmltcGxlbWVudGVkXCIpO1xuICB9LCovXG4gIFxuICAvKiogYWRkIGFuIGV2ZW50IGxpc3RlbmVyIGZvciBwcm9ncmVzcyBvciBzZWVkZWQtbmVzcy4gKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdW3RoaXMuX2NhbGxiYWNrSSsrXSA9IGNhbGxiYWNrO1xuICB9LFxuICBcbiAgLyoqIHJlbW92ZSBhbiBldmVudCBsaXN0ZW5lciBmb3IgcHJvZ3Jlc3Mgb3Igc2VlZGVkLW5lc3MgKi9cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKG5hbWUsIGNiKSB7XG4gICAgdmFyIGksIGosIGNicz10aGlzLl9jYWxsYmFja3NbbmFtZV0sIGpzVGVtcD1bXTtcblxuICAgIC8qIEknbSBub3Qgc3VyZSBpZiB0aGlzIGlzIG5lY2Vzc2FyeTsgaW4gQysrLCBpdGVyYXRpbmcgb3ZlciBhXG4gICAgICogY29sbGVjdGlvbiBhbmQgbW9kaWZ5aW5nIGl0IGF0IHRoZSBzYW1lIHRpbWUgaXMgYSBuby1uby5cbiAgICAgKi9cblxuICAgIGZvciAoaiBpbiBjYnMpIHtcbiAgICAgIGlmIChjYnMuaGFzT3duUHJvcGVydHkoaikgJiYgY2JzW2pdID09PSBjYikge1xuICAgICAgICBqc1RlbXAucHVzaChqKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGk9MDsgaTxqc1RlbXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIGogPSBqc1RlbXBbaV07XG4gICAgICBkZWxldGUgY2JzW2pdO1xuICAgIH1cbiAgfSxcbiAgXG4gIF9iaW5kOiBmdW5jdGlvbiAoZnVuYykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgZnVuYy5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0sXG5cbiAgLyoqIEdlbmVyYXRlIDQgcmFuZG9tIHdvcmRzLCBubyByZXNlZWQsIG5vIGdhdGUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2VuNHdvcmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaT0wOyBpPDQ7IGkrKykge1xuICAgICAgdGhpcy5fY291bnRlcltpXSA9IHRoaXMuX2NvdW50ZXJbaV0rMSB8IDA7XG4gICAgICBpZiAodGhpcy5fY291bnRlcltpXSkgeyBicmVhazsgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2lwaGVyLmVuY3J5cHQodGhpcy5fY291bnRlcik7XG4gIH0sXG4gIFxuICAvKiBSZWtleSB0aGUgQUVTIGluc3RhbmNlIHdpdGggaXRzZWxmIGFmdGVyIGEgcmVxdWVzdCwgb3IgZXZlcnkgX01BWF9XT1JEU19QRVJfQlVSU1Qgd29yZHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2F0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2tleSA9IHRoaXMuX2dlbjR3b3JkcygpLmNvbmNhdCh0aGlzLl9nZW40d29yZHMoKSk7XG4gICAgdGhpcy5fY2lwaGVyID0gbmV3IHNqY2wuY2lwaGVyLmFlcyh0aGlzLl9rZXkpO1xuICB9LFxuICBcbiAgLyoqIFJlc2VlZCB0aGUgZ2VuZXJhdG9yIHdpdGggdGhlIGdpdmVuIHdvcmRzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVzZWVkOiBmdW5jdGlvbiAoc2VlZFdvcmRzKSB7XG4gICAgdGhpcy5fa2V5ID0gc2pjbC5oYXNoLnNoYTI1Ni5oYXNoKHRoaXMuX2tleS5jb25jYXQoc2VlZFdvcmRzKSk7XG4gICAgdGhpcy5fY2lwaGVyID0gbmV3IHNqY2wuY2lwaGVyLmFlcyh0aGlzLl9rZXkpO1xuICAgIGZvciAodmFyIGk9MDsgaTw0OyBpKyspIHtcbiAgICAgIHRoaXMuX2NvdW50ZXJbaV0gPSB0aGlzLl9jb3VudGVyW2ldKzEgfCAwO1xuICAgICAgaWYgKHRoaXMuX2NvdW50ZXJbaV0pIHsgYnJlYWs7IH1cbiAgICB9XG4gIH0sXG4gIFxuICAvKiogcmVzZWVkIHRoZSBkYXRhIGZyb20gdGhlIGVudHJvcHkgcG9vbHNcbiAgICogQHBhcmFtIGZ1bGwgSWYgc2V0LCB1c2UgYWxsIHRoZSBlbnRyb3B5IHBvb2xzIGluIHRoZSByZXNlZWQuXG4gICAqL1xuICBfcmVzZWVkRnJvbVBvb2xzOiBmdW5jdGlvbiAoZnVsbCkge1xuICAgIHZhciByZXNlZWREYXRhID0gW10sIHN0cmVuZ3RoID0gMCwgaTtcbiAgXG4gICAgdGhpcy5fbmV4dFJlc2VlZCA9IHJlc2VlZERhdGFbMF0gPVxuICAgICAgKG5ldyBEYXRlKCkpLnZhbHVlT2YoKSArIHRoaXMuX01JTExJU0VDT05EU19QRVJfUkVTRUVEO1xuICAgIFxuICAgIGZvciAoaT0wOyBpPDE2OyBpKyspIHtcbiAgICAgIC8qIE9uIHNvbWUgYnJvd3NlcnMsIHRoaXMgaXMgY3J5cHRvZ3JhcGhpY2FsbHkgcmFuZG9tLiAgU28gd2UgbWlnaHRcbiAgICAgICAqIGFzIHdlbGwgdG9zcyBpdCBpbiB0aGUgcG90IGFuZCBzdGlyLi4uXG4gICAgICAgKi9cbiAgICAgIHJlc2VlZERhdGEucHVzaChNYXRoLnJhbmRvbSgpKjB4MTAwMDAwMDAwfDApO1xuICAgIH1cbiAgICBcbiAgICBmb3IgKGk9MDsgaTx0aGlzLl9wb29scy5sZW5ndGg7IGkrKykge1xuICAgICByZXNlZWREYXRhID0gcmVzZWVkRGF0YS5jb25jYXQodGhpcy5fcG9vbHNbaV0uZmluYWxpemUoKSk7XG4gICAgIHN0cmVuZ3RoICs9IHRoaXMuX3Bvb2xFbnRyb3B5W2ldO1xuICAgICB0aGlzLl9wb29sRW50cm9weVtpXSA9IDA7XG4gICBcbiAgICAgaWYgKCFmdWxsICYmICh0aGlzLl9yZXNlZWRDb3VudCAmICgxPDxpKSkpIHsgYnJlYWs7IH1cbiAgICB9XG4gIFxuICAgIC8qIGlmIHdlIHVzZWQgdGhlIGxhc3QgcG9vbCwgcHVzaCBhIG5ldyBvbmUgb250byB0aGUgc3RhY2sgKi9cbiAgICBpZiAodGhpcy5fcmVzZWVkQ291bnQgPj0gMSA8PCB0aGlzLl9wb29scy5sZW5ndGgpIHtcbiAgICAgdGhpcy5fcG9vbHMucHVzaChuZXcgc2pjbC5oYXNoLnNoYTI1NigpKTtcbiAgICAgdGhpcy5fcG9vbEVudHJvcHkucHVzaCgwKTtcbiAgICB9XG4gIFxuICAgIC8qIGhvdyBzdHJvbmcgd2FzIHRoaXMgcmVzZWVkPyAqL1xuICAgIHRoaXMuX3Bvb2xTdHJlbmd0aCAtPSBzdHJlbmd0aDtcbiAgICBpZiAoc3RyZW5ndGggPiB0aGlzLl9zdHJlbmd0aCkge1xuICAgICAgdGhpcy5fc3RyZW5ndGggPSBzdHJlbmd0aDtcbiAgICB9XG4gIFxuICAgIHRoaXMuX3Jlc2VlZENvdW50ICsrO1xuICAgIHRoaXMuX3Jlc2VlZChyZXNlZWREYXRhKTtcbiAgfSxcbiAgXG4gIF9rZXlib2FyZENvbGxlY3RvcjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2FkZEN1cnJlbnRUaW1lVG9FbnRyb3B5KDEpO1xuICB9LFxuICBcbiAgX21vdXNlQ29sbGVjdG9yOiBmdW5jdGlvbiAoZXYpIHtcbiAgICB2YXIgeCA9IGV2LnggfHwgZXYuY2xpZW50WCB8fCBldi5vZmZzZXRYIHx8IDAsIHkgPSBldi55IHx8IGV2LmNsaWVudFkgfHwgZXYub2Zmc2V0WSB8fCAwO1xuICAgIHNqY2wucmFuZG9tLmFkZEVudHJvcHkoW3gseV0sIDIsIFwibW91c2VcIik7XG4gICAgdGhpcy5fYWRkQ3VycmVudFRpbWVUb0VudHJvcHkoMCk7XG4gIH0sXG4gIFxuICBfbG9hZFRpbWVDb2xsZWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9hZGRDdXJyZW50VGltZVRvRW50cm9weSgyKTtcbiAgfSxcblxuICBfYWRkQ3VycmVudFRpbWVUb0VudHJvcHk6IGZ1bmN0aW9uIChlc3RpbWF0ZWRFbnRyb3B5KSB7XG4gICAgaWYgKHdpbmRvdyAmJiB3aW5kb3cucGVyZm9ybWFuY2UgJiYgdHlwZW9mIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy9ob3cgbXVjaCBlbnRyb3B5IGRvIHdlIHdhbnQgdG8gYWRkIGhlcmU/XG4gICAgICBzamNsLnJhbmRvbS5hZGRFbnRyb3B5KHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSwgZXN0aW1hdGVkRW50cm9weSwgXCJsb2FkdGltZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2pjbC5yYW5kb20uYWRkRW50cm9weSgobmV3IERhdGUoKSkudmFsdWVPZigpLCBlc3RpbWF0ZWRFbnRyb3B5LCBcImxvYWR0aW1lXCIpO1xuICAgIH1cbiAgfSxcbiAgX2FjY2VsZXJvbWV0ZXJDb2xsZWN0b3I6IGZ1bmN0aW9uIChldikge1xuICAgIHZhciBhYyA9IGV2LmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueHx8ZXYuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55fHxldi5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lno7XG4gICAgdmFyIG9yID0gXCJcIjtcbiAgICBpZih3aW5kb3cub3JpZW50YXRpb24pe1xuICAgICAgb3IgPSB3aW5kb3cub3JpZW50YXRpb247XG4gICAgfVxuICAgIHNqY2wucmFuZG9tLmFkZEVudHJvcHkoW2FjLG9yXSwgMywgXCJhY2NlbGVyb21ldGVyXCIpO1xuICAgIHRoaXMuX2FkZEN1cnJlbnRUaW1lVG9FbnRyb3B5KDApO1xuICB9LFxuXG4gIF9maXJlRXZlbnQ6IGZ1bmN0aW9uIChuYW1lLCBhcmcpIHtcbiAgICB2YXIgaiwgY2JzPXNqY2wucmFuZG9tLl9jYWxsYmFja3NbbmFtZV0sIGNic1RlbXA9W107XG4gICAgLyogVE9ETzogdGhlcmUgaXMgYSByYWNlIGNvbmRpdGlvbiBiZXR3ZWVuIHJlbW92aW5nIGNvbGxlY3RvcnMgYW5kIGZpcmluZyB0aGVtICovXG5cbiAgICAvKiBJJ20gbm90IHN1cmUgaWYgdGhpcyBpcyBuZWNlc3Nhcnk7IGluIEMrKywgaXRlcmF0aW5nIG92ZXIgYVxuICAgICAqIGNvbGxlY3Rpb24gYW5kIG1vZGlmeWluZyBpdCBhdCB0aGUgc2FtZSB0aW1lIGlzIGEgbm8tbm8uXG4gICAgICovXG5cbiAgICBmb3IgKGogaW4gY2JzKSB7XG4gICAgICBpZiAoY2JzLmhhc093blByb3BlcnR5KGopKSB7XG4gICAgICAgIGNic1RlbXAucHVzaChjYnNbal0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaj0wOyBqPGNic1RlbXAubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNic1RlbXBbal0oYXJnKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKiBhbiBpbnN0YW5jZSBmb3IgdGhlIHBybmcuXG4qIEBzZWUgc2pjbC5wcm5nXG4qL1xuc2pjbC5yYW5kb20gPSBuZXcgc2pjbC5wcm5nKDYpO1xuXG4oZnVuY3Rpb24oKXtcbiAgdHJ5IHtcbiAgICB2YXIgYnVmLCBjcnlwdCwgZ2V0UmFuZG9tVmFsdWVzLCBhYjtcbiAgICAvLyBnZXQgY3J5cHRvZ3JhcGhpY2FsbHkgc3Ryb25nIGVudHJvcHkgZGVwZW5kaW5nIG9uIHJ1bnRpbWUgZW52aXJvbm1lbnRcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgJiYgKGNyeXB0ID0gcmVxdWlyZSgnY3J5cHRvJykpICYmIGNyeXB0LnJhbmRvbUJ5dGVzKSB7XG4gICAgICBidWYgPSBjcnlwdC5yYW5kb21CeXRlcygxMDI0LzgpO1xuICAgICAgc2pjbC5yYW5kb20uYWRkRW50cm9weShidWYsIDEwMjQsIFwiY3J5cHRvLnJhbmRvbUJ5dGVzXCIpO1xuXG4gICAgfSBlbHNlIGlmICh3aW5kb3cgJiYgVWludDMyQXJyYXkpIHtcbiAgICAgIGFiID0gbmV3IFVpbnQzMkFycmF5KDMyKTtcbiAgICAgIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICAgIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFiKTtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93Lm1zQ3J5cHRvICYmIHdpbmRvdy5tc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgICAgd2luZG93Lm1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBjcnlwdG9ncmFwaGljYWxseSBzdHJvbmcgZW50cm9weSBpbiBXZWJraXRcbiAgICAgIHNqY2wucmFuZG9tLmFkZEVudHJvcHkoYWIsIDEwMjQsIFwiY3J5cHRvLmdldFJhbmRvbVZhbHVlc1wiKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBubyBnZXRSYW5kb21WYWx1ZXMgOi0oXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgY29sbGVjdGluZyBlbnRyb3B5IGZyb20gdGhlIGJyb3dzZXI6XCIpO1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIC8vd2UgZG8gbm90IHdhbnQgdGhlIGxpYnJhcnkgdG8gZmFpbCBkdWUgdG8gcmFuZG9tbmVzcyBub3QgYmVpbmcgbWFpbnRhaW5lZC5cbiAgfVxufSgpKTtcbi8qKiBAZmlsZU92ZXJ2aWV3IENvbnZlbmluY2UgZnVuY3Rpb25zIGNlbnRlcmVkIGFyb3VuZCBKU09OIGVuY2Fwc3VsYXRpb24uXG4gKlxuICogQGF1dGhvciBFbWlseSBTdGFya1xuICogQGF1dGhvciBNaWtlIEhhbWJ1cmdcbiAqIEBhdXRob3IgRGFuIEJvbmVoXG4gKi9cbiBcbiAvKiogQG5hbWVzcGFjZSBKU09OIGVuY2Fwc3VsYXRpb24gKi9cbiBzamNsLmpzb24gPSB7XG4gIC8qKiBEZWZhdWx0IHZhbHVlcyBmb3IgZW5jcnlwdGlvbiAqL1xuICBkZWZhdWx0czogeyB2OjEsIGl0ZXI6MTAwMCwga3M6MTI4LCB0czo2NCwgbW9kZTpcImNjbVwiLCBhZGF0YTpcIlwiLCBjaXBoZXI6XCJhZXNcIiB9LFxuXG4gIC8qKiBTaW1wbGUgZW5jcnlwdGlvbiBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtTdHJpbmd8Yml0QXJyYXl9IHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvciBrZXkuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbGFpbnRleHQgVGhlIGRhdGEgdG8gZW5jcnlwdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbWV0ZXJzIGluY2x1ZGluZyB0YWcsIGl2IGFuZCBzYWx0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gW3JwXSBBIHJldHVybmVkIHZlcnNpb24gd2l0aCBmaWxsZWQtaW4gcGFyYW1ldGVycy5cbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2lwaGVyIHJhdyBkYXRhLlxuICAgKiBAdGhyb3dzIHtzamNsLmV4Y2VwdGlvbi5pbnZhbGlkfSBpZiBhIHBhcmFtZXRlciBpcyBpbnZhbGlkLlxuICAgKi9cbiAgX2VuY3J5cHQ6IGZ1bmN0aW9uIChwYXNzd29yZCwgcGxhaW50ZXh0LCBwYXJhbXMsIHJwKSB7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIHJwID0gcnAgfHwge307XG5cbiAgICB2YXIgaiA9IHNqY2wuanNvbiwgcCA9IGouX2FkZCh7IGl2OiBzamNsLnJhbmRvbS5yYW5kb21Xb3Jkcyg0LDApIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgai5kZWZhdWx0cyksIHRtcCwgcHJwLCBhZGF0YTtcbiAgICBqLl9hZGQocCwgcGFyYW1zKTtcbiAgICBhZGF0YSA9IHAuYWRhdGE7XG4gICAgaWYgKHR5cGVvZiBwLnNhbHQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHAuc2FsdCA9IHNqY2wuY29kZWMuYmFzZTY0LnRvQml0cyhwLnNhbHQpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHAuaXYgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHAuaXYgPSBzamNsLmNvZGVjLmJhc2U2NC50b0JpdHMocC5pdik7XG4gICAgfVxuXG4gICAgaWYgKCFzamNsLm1vZGVbcC5tb2RlXSB8fFxuICAgICAgICAhc2pjbC5jaXBoZXJbcC5jaXBoZXJdIHx8XG4gICAgICAgICh0eXBlb2YgcGFzc3dvcmQgPT09IFwic3RyaW5nXCIgJiYgcC5pdGVyIDw9IDEwMCkgfHxcbiAgICAgICAgKHAudHMgIT09IDY0ICYmIHAudHMgIT09IDk2ICYmIHAudHMgIT09IDEyOCkgfHxcbiAgICAgICAgKHAua3MgIT09IDEyOCAmJiBwLmtzICE9PSAxOTIgJiYgcC5rcyAhPT0gMjU2KSB8fFxuICAgICAgICAocC5pdi5sZW5ndGggPCAyIHx8IHAuaXYubGVuZ3RoID4gNCkpIHtcbiAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwianNvbiBlbmNyeXB0OiBpbnZhbGlkIHBhcmFtZXRlcnNcIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXNzd29yZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdG1wID0gc2pjbC5taXNjLmNhY2hlZFBia2RmMihwYXNzd29yZCwgcCk7XG4gICAgICBwYXNzd29yZCA9IHRtcC5rZXkuc2xpY2UoMCxwLmtzLzMyKTtcbiAgICAgIHAuc2FsdCA9IHRtcC5zYWx0O1xuICAgIH0gZWxzZSBpZiAoc2pjbC5lY2MgJiYgcGFzc3dvcmQgaW5zdGFuY2VvZiBzamNsLmVjYy5lbEdhbWFsLnB1YmxpY0tleSkge1xuICAgICAgdG1wID0gcGFzc3dvcmQua2VtKCk7XG4gICAgICBwLmtlbXRhZyA9IHRtcC50YWc7XG4gICAgICBwYXNzd29yZCA9IHRtcC5rZXkuc2xpY2UoMCxwLmtzLzMyKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwbGFpbnRleHQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHBsYWludGV4dCA9IHNqY2wuY29kZWMudXRmOFN0cmluZy50b0JpdHMocGxhaW50ZXh0KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYWRhdGEgPSBzamNsLmNvZGVjLnV0ZjhTdHJpbmcudG9CaXRzKGFkYXRhKTtcbiAgICB9XG4gICAgcHJwID0gbmV3IHNqY2wuY2lwaGVyW3AuY2lwaGVyXShwYXNzd29yZCk7XG5cbiAgICAvKiByZXR1cm4gdGhlIGpzb24gZGF0YSAqL1xuICAgIGouX2FkZChycCwgcCk7XG4gICAgcnAua2V5ID0gcGFzc3dvcmQ7XG5cbiAgICAvKiBkbyB0aGUgZW5jcnlwdGlvbiAqL1xuICAgIHAuY3QgPSBzamNsLm1vZGVbcC5tb2RlXS5lbmNyeXB0KHBycCwgcGxhaW50ZXh0LCBwLml2LCBhZGF0YSwgcC50cyk7XG5cbiAgICAvL3JldHVybiBqLmVuY29kZShqLl9zdWJ0cmFjdChwLCBqLmRlZmF1bHRzKSk7XG4gICAgcmV0dXJuIHA7XG4gIH0sXG5cbiAgLyoqIFNpbXBsZSBlbmNyeXB0aW9uIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ3xiaXRBcnJheX0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9yIGtleS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsYWludGV4dCBUaGUgZGF0YSB0byBlbmNyeXB0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtZXRlcnMgaW5jbHVkaW5nIHRhZywgaXYgYW5kIHNhbHQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcnBdIEEgcmV0dXJuZWQgdmVyc2lvbiB3aXRoIGZpbGxlZC1pbiBwYXJhbWV0ZXJzLlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBjaXBoZXJ0ZXh0IHNlcmlhbGl6ZWQgZGF0YS5cbiAgICogQHRocm93cyB7c2pjbC5leGNlcHRpb24uaW52YWxpZH0gaWYgYSBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cbiAgICovXG4gIGVuY3J5cHQ6IGZ1bmN0aW9uIChwYXNzd29yZCwgcGxhaW50ZXh0LCBwYXJhbXMsIHJwKSB7XG4gICAgdmFyIGogPSBzamNsLmpzb24sIHAgPSBqLl9lbmNyeXB0LmFwcGx5KGosIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIGouZW5jb2RlKHApO1xuICB9LFxuXG4gIC8qKiBTaW1wbGUgZGVjcnlwdGlvbiBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtTdHJpbmd8Yml0QXJyYXl9IHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvciBrZXkuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjaXBoZXJ0ZXh0IFRoZSBjaXBoZXIgcmF3IGRhdGEgdG8gZGVjcnlwdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdIEFkZGl0aW9uYWwgbm9uLWRlZmF1bHQgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtycF0gQSByZXR1cm5lZCBvYmplY3Qgd2l0aCBmaWxsZWQgcGFyYW1ldGVycy5cbiAgICogQHJldHVybiB7U3RyaW5nfSBUaGUgcGxhaW50ZXh0LlxuICAgKiBAdGhyb3dzIHtzamNsLmV4Y2VwdGlvbi5pbnZhbGlkfSBpZiBhIHBhcmFtZXRlciBpcyBpbnZhbGlkLlxuICAgKiBAdGhyb3dzIHtzamNsLmV4Y2VwdGlvbi5jb3JydXB0fSBpZiB0aGUgY2lwaGVydGV4dCBpcyBjb3JydXB0LlxuICAgKi9cbiAgX2RlY3J5cHQ6IGZ1bmN0aW9uIChwYXNzd29yZCwgY2lwaGVydGV4dCwgcGFyYW1zLCBycCkge1xuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICBycCA9IHJwIHx8IHt9O1xuXG4gICAgdmFyIGogPSBzamNsLmpzb24sIHAgPSBqLl9hZGQoai5fYWRkKGouX2FkZCh7fSxqLmRlZmF1bHRzKSxjaXBoZXJ0ZXh0KSwgcGFyYW1zLCB0cnVlKSwgY3QsIHRtcCwgcHJwLCBhZGF0YT1wLmFkYXRhO1xuICAgIGlmICh0eXBlb2YgcC5zYWx0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwLnNhbHQgPSBzamNsLmNvZGVjLmJhc2U2NC50b0JpdHMocC5zYWx0KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwLml2ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwLml2ID0gc2pjbC5jb2RlYy5iYXNlNjQudG9CaXRzKHAuaXYpO1xuICAgIH1cblxuICAgIGlmICghc2pjbC5tb2RlW3AubW9kZV0gfHxcbiAgICAgICAgIXNqY2wuY2lwaGVyW3AuY2lwaGVyXSB8fFxuICAgICAgICAodHlwZW9mIHBhc3N3b3JkID09PSBcInN0cmluZ1wiICYmIHAuaXRlciA8PSAxMDApIHx8XG4gICAgICAgIChwLnRzICE9PSA2NCAmJiBwLnRzICE9PSA5NiAmJiBwLnRzICE9PSAxMjgpIHx8XG4gICAgICAgIChwLmtzICE9PSAxMjggJiYgcC5rcyAhPT0gMTkyICYmIHAua3MgIT09IDI1NikgfHxcbiAgICAgICAgKCFwLml2KSB8fFxuICAgICAgICAocC5pdi5sZW5ndGggPCAyIHx8IHAuaXYubGVuZ3RoID4gNCkpIHtcbiAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwianNvbiBkZWNyeXB0OiBpbnZhbGlkIHBhcmFtZXRlcnNcIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXNzd29yZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdG1wID0gc2pjbC5taXNjLmNhY2hlZFBia2RmMihwYXNzd29yZCwgcCk7XG4gICAgICBwYXNzd29yZCA9IHRtcC5rZXkuc2xpY2UoMCxwLmtzLzMyKTtcbiAgICAgIHAuc2FsdCAgPSB0bXAuc2FsdDtcbiAgICB9IGVsc2UgaWYgKHNqY2wuZWNjICYmIHBhc3N3b3JkIGluc3RhbmNlb2Ygc2pjbC5lY2MuZWxHYW1hbC5zZWNyZXRLZXkpIHtcbiAgICAgIHBhc3N3b3JkID0gcGFzc3dvcmQudW5rZW0oc2pjbC5jb2RlYy5iYXNlNjQudG9CaXRzKHAua2VtdGFnKSkuc2xpY2UoMCxwLmtzLzMyKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYWRhdGEgPSBzamNsLmNvZGVjLnV0ZjhTdHJpbmcudG9CaXRzKGFkYXRhKTtcbiAgICB9XG4gICAgcHJwID0gbmV3IHNqY2wuY2lwaGVyW3AuY2lwaGVyXShwYXNzd29yZCk7XG5cbiAgICAvKiBkbyB0aGUgZGVjcnlwdGlvbiAqL1xuICAgIGN0ID0gc2pjbC5tb2RlW3AubW9kZV0uZGVjcnlwdChwcnAsIHAuY3QsIHAuaXYsIGFkYXRhLCBwLnRzKTtcblxuICAgIC8qIHJldHVybiB0aGUganNvbiBkYXRhICovXG4gICAgai5fYWRkKHJwLCBwKTtcbiAgICBycC5rZXkgPSBwYXNzd29yZDtcblxuICAgIHJldHVybiBzamNsLmNvZGVjLnV0ZjhTdHJpbmcuZnJvbUJpdHMoY3QpO1xuICB9LFxuXG4gIC8qKiBTaW1wbGUgZGVjcnlwdGlvbiBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtTdHJpbmd8Yml0QXJyYXl9IHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvciBrZXkuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjaXBoZXJ0ZXh0IFRoZSBjaXBoZXJ0ZXh0IHRvIGRlY3J5cHQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcGFyYW1zXSBBZGRpdGlvbmFsIG5vbi1kZWZhdWx0IHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcnBdIEEgcmV0dXJuZWQgb2JqZWN0IHdpdGggZmlsbGVkIHBhcmFtZXRlcnMuXG4gICAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHBsYWludGV4dC5cbiAgICogQHRocm93cyB7c2pjbC5leGNlcHRpb24uaW52YWxpZH0gaWYgYSBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cbiAgICogQHRocm93cyB7c2pjbC5leGNlcHRpb24uY29ycnVwdH0gaWYgdGhlIGNpcGhlcnRleHQgaXMgY29ycnVwdC5cbiAgICovXG4gIGRlY3J5cHQ6IGZ1bmN0aW9uIChwYXNzd29yZCwgY2lwaGVydGV4dCwgcGFyYW1zLCBycCkge1xuICAgIHZhciBqID0gc2pjbC5qc29uO1xuICAgIHJldHVybiBqLl9kZWNyeXB0KHBhc3N3b3JkLCBqLmRlY29kZShjaXBoZXJ0ZXh0KSwgcGFyYW1zLCBycCk7XG4gIH0sXG4gIFxuICAvKiogRW5jb2RlIGEgZmxhdCBzdHJ1Y3R1cmUgaW50byBhIEpTT04gc3RyaW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBzdHJ1Y3R1cmUgdG8gZW5jb2RlLlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IEEgSlNPTiBzdHJpbmcuXG4gICAqIEB0aHJvd3Mge3NqY2wuZXhjZXB0aW9uLmludmFsaWR9IGlmIG9iaiBoYXMgYSBub24tYWxwaGFudW1lcmljIHByb3BlcnR5LlxuICAgKiBAdGhyb3dzIHtzamNsLmV4Y2VwdGlvbi5idWd9IGlmIGEgcGFyYW1ldGVyIGhhcyBhbiB1bnN1cHBvcnRlZCB0eXBlLlxuICAgKi9cbiAgZW5jb2RlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIGksIG91dD0neycsIGNvbW1hPScnO1xuICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgaWYgKCFpLm1hdGNoKC9eW2EtejAtOV0rJC9pKSkge1xuICAgICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwianNvbiBlbmNvZGU6IGludmFsaWQgcHJvcGVydHkgbmFtZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gY29tbWEgKyAnXCInICsgaSArICdcIjonO1xuICAgICAgICBjb21tYSA9ICcsJztcblxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiBvYmpbaV0pIHtcbiAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgb3V0ICs9IG9ialtpXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIG91dCArPSAnXCInICsgZXNjYXBlKG9ialtpXSkgKyAnXCInO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgb3V0ICs9ICdcIicgKyBzamNsLmNvZGVjLmJhc2U2NC5mcm9tQml0cyhvYmpbaV0sMCkgKyAnXCInO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IHNqY2wuZXhjZXB0aW9uLmJ1ZyhcImpzb24gZW5jb2RlOiB1bnN1cHBvcnRlZCB0eXBlXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQrJ30nO1xuICB9LFxuICBcbiAgLyoqIERlY29kZSBhIHNpbXBsZSAoZmxhdCkgSlNPTiBzdHJpbmcgaW50byBhIHN0cnVjdHVyZS4gIFRoZSBjaXBoZXJ0ZXh0LFxuICAgKiBhZGF0YSwgc2FsdCBhbmQgaXYgd2lsbCBiZSBiYXNlNjQtZGVjb2RlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBkZWNvZGVkIHN0cnVjdHVyZS5cbiAgICogQHRocm93cyB7c2pjbC5leGNlcHRpb24uaW52YWxpZH0gaWYgc3RyIGlzbid0IChzaW1wbGUpIEpTT04uXG4gICAqL1xuICBkZWNvZGU6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxzL2csJycpO1xuICAgIGlmICghc3RyLm1hdGNoKC9eXFx7LipcXH0kLykpIHsgXG4gICAgICB0aHJvdyBuZXcgc2pjbC5leGNlcHRpb24uaW52YWxpZChcImpzb24gZGVjb2RlOiB0aGlzIGlzbid0IGpzb24hXCIpO1xuICAgIH1cbiAgICB2YXIgYSA9IHN0ci5yZXBsYWNlKC9eXFx7fFxcfSQvZywgJycpLnNwbGl0KC8sLyksIG91dD17fSwgaSwgbTtcbiAgICBmb3IgKGk9MDsgaTxhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIShtPWFbaV0ubWF0Y2goL14oPzooW1wiJ10/KShbYS16XVthLXowLTldKilcXDEpOig/OihcXGQrKXxcIihbYS16MC05K1xcLyUqXy5APVxcLV0qKVwiKSQvaSkpKSB7XG4gICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwianNvbiBkZWNvZGU6IHRoaXMgaXNuJ3QganNvbiFcIik7XG4gICAgICB9XG4gICAgICBpZiAobVszXSkge1xuICAgICAgICBvdXRbbVsyXV0gPSBwYXJzZUludChtWzNdLDEwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFttWzJdXSA9IG1bMl0ubWF0Y2goL14oY3R8c2FsdHxpdikkLykgPyBzamNsLmNvZGVjLmJhc2U2NC50b0JpdHMobVs0XSkgOiB1bmVzY2FwZShtWzRdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSxcbiAgXG4gIC8qKiBJbnNlcnQgYWxsIGVsZW1lbnRzIG9mIHNyYyBpbnRvIHRhcmdldCwgbW9kaWZ5aW5nIGFuZCByZXR1cm5pbmcgdGFyZ2V0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3QgdG8gYmUgbW9kaWZpZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcmMgVGhlIG9iamVjdCB0byBwdWxsIGRhdGEgZnJvbS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcmVxdWlyZVNhbWU9ZmFsc2VdIElmIHRydWUsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhbnkgZmllbGQgb2YgdGFyZ2V0IGRpZmZlcnMgZnJvbSBjb3JyZXNwb25kaW5nIGZpZWxkIG9mIHNyYy5cbiAgICogQHJldHVybiB7T2JqZWN0fSB0YXJnZXQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkOiBmdW5jdGlvbiAodGFyZ2V0LCBzcmMsIHJlcXVpcmVTYW1lKSB7XG4gICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7IHRhcmdldCA9IHt9OyB9XG4gICAgaWYgKHNyYyA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB0YXJnZXQ7IH1cbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgaW4gc3JjKSB7XG4gICAgICBpZiAoc3JjLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIGlmIChyZXF1aXJlU2FtZSAmJiB0YXJnZXRbaV0gIT09IHVuZGVmaW5lZCAmJiB0YXJnZXRbaV0gIT09IHNyY1tpXSkge1xuICAgICAgICAgIHRocm93IG5ldyBzamNsLmV4Y2VwdGlvbi5pbnZhbGlkKFwicmVxdWlyZWQgcGFyYW1ldGVyIG92ZXJyaWRkZW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0W2ldID0gc3JjW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9LFxuICBcbiAgLyoqIFJlbW92ZSBhbGwgZWxlbWVudHMgb2YgbWludXMgZnJvbSBwbHVzLiAgRG9lcyBub3QgbW9kaWZ5IHBsdXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc3VidHJhY3Q6IGZ1bmN0aW9uIChwbHVzLCBtaW51cykge1xuICAgIHZhciBvdXQgPSB7fSwgaTtcblxuICAgIGZvciAoaSBpbiBwbHVzKSB7XG4gICAgICBpZiAocGx1cy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBwbHVzW2ldICE9PSBtaW51c1tpXSkge1xuICAgICAgICBvdXRbaV0gPSBwbHVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH0sXG4gIFxuICAvKiogUmV0dXJuIG9ubHkgdGhlIHNwZWNpZmllZCBlbGVtZW50cyBvZiBzcmMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZmlsdGVyOiBmdW5jdGlvbiAoc3JjLCBmaWx0ZXIpIHtcbiAgICB2YXIgb3V0ID0ge30sIGk7XG4gICAgZm9yIChpPTA7IGk8ZmlsdGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc3JjW2ZpbHRlcltpXV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvdXRbZmlsdGVyW2ldXSA9IHNyY1tmaWx0ZXJbaV1dO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG4vKiogU2ltcGxlIGVuY3J5cHRpb24gZnVuY3Rpb247IGNvbnZlbmllbnQgc2hvcnRoYW5kIGZvciBzamNsLmpzb24uZW5jcnlwdC5cbiAqIEBwYXJhbSB7U3RyaW5nfGJpdEFycmF5fSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb3Iga2V5LlxuICogQHBhcmFtIHtTdHJpbmd9IHBsYWludGV4dCBUaGUgZGF0YSB0byBlbmNyeXB0LlxuICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbWV0ZXJzIGluY2x1ZGluZyB0YWcsIGl2IGFuZCBzYWx0LlxuICogQHBhcmFtIHtPYmplY3R9IFtycF0gQSByZXR1cm5lZCB2ZXJzaW9uIHdpdGggZmlsbGVkLWluIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBjaXBoZXJ0ZXh0LlxuICovXG5zamNsLmVuY3J5cHQgPSBzamNsLmpzb24uZW5jcnlwdDtcblxuLyoqIFNpbXBsZSBkZWNyeXB0aW9uIGZ1bmN0aW9uOyBjb252ZW5pZW50IHNob3J0aGFuZCBmb3Igc2pjbC5qc29uLmRlY3J5cHQuXG4gKiBAcGFyYW0ge1N0cmluZ3xiaXRBcnJheX0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9yIGtleS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjaXBoZXJ0ZXh0IFRoZSBjaXBoZXJ0ZXh0IHRvIGRlY3J5cHQuXG4gKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gQWRkaXRpb25hbCBub24tZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtPYmplY3R9IFtycF0gQSByZXR1cm5lZCBvYmplY3Qgd2l0aCBmaWxsZWQgcGFyYW1ldGVycy5cbiAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHBsYWludGV4dC5cbiAqL1xuc2pjbC5kZWNyeXB0ID0gc2pjbC5qc29uLmRlY3J5cHQ7XG5cbi8qKiBUaGUgY2FjaGUgZm9yIGNhY2hlZFBia2RmMi5cbiAqIEBwcml2YXRlXG4gKi9cbnNqY2wubWlzYy5fcGJrZGYyQ2FjaGUgPSB7fTtcblxuLyoqIENhY2hlZCBQQktERjIga2V5IGRlcml2YXRpb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc3dvcmQgVGhlIHBhc3N3b3JkLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmpdIFRoZSBkZXJpdmF0aW9uIHBhcmFtcyAoaXRlcmF0aW9uIGNvdW50IGFuZCBvcHRpb25hbCBzYWx0KS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRlcml2ZWQgZGF0YSBpbiBrZXksIHRoZSBzYWx0IGluIHNhbHQuXG4gKi9cbnNqY2wubWlzYy5jYWNoZWRQYmtkZjIgPSBmdW5jdGlvbiAocGFzc3dvcmQsIG9iaikge1xuICB2YXIgY2FjaGUgPSBzamNsLm1pc2MuX3Bia2RmMkNhY2hlLCBjLCBjcCwgc3RyLCBzYWx0LCBpdGVyO1xuICBcbiAgb2JqID0gb2JqIHx8IHt9O1xuICBpdGVyID0gb2JqLml0ZXIgfHwgMTAwMDtcbiAgXG4gIC8qIG9wZW4gdGhlIGNhY2hlIGZvciB0aGlzIHBhc3N3b3JkIGFuZCBpdGVyYXRpb24gY291bnQgKi9cbiAgY3AgPSBjYWNoZVtwYXNzd29yZF0gPSBjYWNoZVtwYXNzd29yZF0gfHwge307XG4gIGMgPSBjcFtpdGVyXSA9IGNwW2l0ZXJdIHx8IHsgZmlyc3RTYWx0OiAob2JqLnNhbHQgJiYgb2JqLnNhbHQubGVuZ3RoKSA/XG4gICAgICAgICAgICAgICAgICAgICBvYmouc2FsdC5zbGljZSgwKSA6IHNqY2wucmFuZG9tLnJhbmRvbVdvcmRzKDIsMCkgfTtcbiAgICAgICAgICBcbiAgc2FsdCA9IChvYmouc2FsdCA9PT0gdW5kZWZpbmVkKSA/IGMuZmlyc3RTYWx0IDogb2JqLnNhbHQ7XG4gIFxuICBjW3NhbHRdID0gY1tzYWx0XSB8fCBzamNsLm1pc2MucGJrZGYyKHBhc3N3b3JkLCBzYWx0LCBvYmouaXRlcik7XG4gIHJldHVybiB7IGtleTogY1tzYWx0XS5zbGljZSgwKSwgc2FsdDpzYWx0LnNsaWNlKDApIH07XG59O1xuXG5cbiIsIi8qKlxuICogTWFpbiBhcHBsaWNhdGlvbiBlbnRyeSBwb2ludFxuICogQGF1dGhvciBEYXJrUGFya1xuICogQGxpY2Vuc2UgR05VIEdFTkVSQUwgUFVCTElDIExJQ0VOU0UgVmVyc2lvbiAzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zb2xlLmxvZygnL2NsaWVudC9qcy9tYWluLmpzJyk7XG5cbnZhciBhZXMgICAgPSByZXF1aXJlKCcuL2FlcycpLFxuXHRhcGkgICAgPSByZXF1aXJlKCcuL2FwaScpLFxuXHRjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpLFxuXHRwYWdlcyAgPSByZXF1aXJlKCcuL3BhZ2VzJyksXG5cdE5vdGVzICA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbi5ub3RlcycpO1xuXG5cbi8vIGF1dGhlbnRpY2F0ZWQ/XG5pZiAoIGNvbmZpZy5hcGlLZXkgKSB7XG5cdC8vIGl0IGFwcGVhcnMgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIGJ1dCB2YWxpZGF0aW9uIGlzIHJlcXVpcmVkXG5cdGFwaS5wdXQoJ3Nlc3Npb25zLycgKyBjb25maWcuYXBpS2V5LCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKXtcblx0XHR2YXIgcGFzcztcblx0XHQvLyBzZXNzaW9uIGlzIHZhbGlkXG5cdFx0aWYgKCByZXNwb25zZS5jb2RlID09PSAxICkge1xuXHRcdFx0Y29uc29sZS5sb2coJyVjJXMgJW8nLCAnY29sb3I6Z3JlZW4nLCAnc2Vzc2lvbiBpcyB2YWxpZCwgbGFzdCBhY2Nlc3MgdGltZTonLCBuZXcgRGF0ZShyZXNwb25zZS5hdGltZSkpO1xuXHRcdFx0cGFnZXMubGlzdC5zaG93KCk7XG5cblx0XHRcdC8vIGFwcGx5IHNhdmVkIHBhc3Mgc2FsdCBhbmQgaGFzaFxuXHRcdFx0YWVzLnNhbHQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY29uZmlnLnBhc3Muc2FsdCcpO1xuXHRcdFx0YWVzLmhhc2ggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY29uZmlnLnBhc3MuaGFzaCcpO1xuXG5cdFx0XHQvLyBhc2sgYSB1c2VyIHBhc3MgYW5kIGNoZWNrIGl0XG5cdFx0XHRwYXNzID0gd2luZG93LnByb21wdCgnUHJvdmlkZSB5b3VyIHBhc3N3b3JkIHRvIHVubG9jayBkYXRhJywgJycpO1xuXHRcdFx0aWYgKCBwYXNzICYmIGFlcy5jaGVja1Bhc3MocGFzcykgKSB7XG5cdFx0XHRcdGFlcy5zZXRQYXNzKHBhc3MpO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnJWMlcycsICdjb2xvcjpibHVlJywgJ3Bhc3MgaXMgdmFsaWQnKTtcblxuXHRcdFx0XHQvLyBjb2xsZWN0IGFsbCBzZXNzaW9ucyBpbmZvXG5cdFx0XHRcdGFwaS5nZXQoJ3Nlc3Npb25zJywgZnVuY3Rpb24gKCBlcnIsIHJlc3BvbnNlICkge1xuXHRcdFx0XHRcdGlmICggcmVzcG9uc2UuY29kZSA9PT0gMSApIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoIHNlc3Npb24gKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdzZXNzaW9uJywgbmV3IERhdGUoc2Vzc2lvbi5hdGltZSksIHNlc3Npb24uX2lkLCBKU09OLnBhcnNlKGFlcy5kZWNyeXB0KHNlc3Npb24uZGF0YSkpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dmFyIG5vdGVzID0gbmV3IE5vdGVzKCk7XG5cdFx0XHRcdG5vdGVzLmFkZExpc3RlbmVyKCdmZXRjaCcsIGZ1bmN0aW9uKHN0YXR1cyl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ25vdGVzIGZldGNoJywgc3RhdHVzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG5vdGVzLmZldGNoKCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5vdGVzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCclYyVzJywgJ2NvbG9yOnJlZCcsICdwYXNzIGlzIGludmFsaWQnKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBhdXRoZW50aWNhdGlvbiBoYXMgZXhwaXJlZFxuXHRcdFx0cGFnZXMuYXV0aC5zaG93KCk7XG5cdFx0XHRjb25zb2xlLmxvZygnJWMlcycsICdjb2xvcjpyZWQnLCAnc2Vzc2lvbiBpcyBpbnZhbGlkLCBuZWVkIHRvIGxvZ2luJyk7XG5cdFx0XHRsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH0pO1xuXG5cblxuXHQvKlxuXHRhcGkuZ2V0KCdzZXNzaW9ucy8nICsgY29uZmlnLmFwaUtleSwgZnVuY3Rpb24oZXJyLCByZXNwb25zZSl7XG5cdGNvbnNvbGUubG9nKCdjdXJyZW50IHNlc3Npb24nLCByZXNwb25zZSk7XG5cdGNvbnNvbGUubG9nKCdjdXJyZW50IHNlc3Npb24gZGF0YScsIEpTT04ucGFyc2UoYWVzLmRlY3J5cHQocmVzcG9uc2UuZGF0YS5kYXRhKSkpO1xuXHR9KTsvKiovXG59IGVsc2Uge1xuXHRwYWdlcy5hdXRoLnNob3coKTtcbn1cblxubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RlYnVnJywgMSk7XG5cbi8vYXBwLmluaXQoKTtcblxuLy8gdGVzdCBkYXRhXG4vL2Flcy5zYWx0ID0gJzBmYjQ0OWUxYWUyZGM2MmMxMWY2NGE0MTVlNjY2MTBmYTc5NDVjZTYyMDMzODY2Nzg4ZGI1Y2MwZTJmZmIwZGEnO1xuLy9hZXMuc2V0UGFzcygncXdlcnR5Jyk7XG5cbmNvbnNvbGUubG9nKCcvY2xpZW50L2pzL21haW4uanMgZG9uZScpOyIsIi8qKlxuICogU2luZ2xlIG5vdGUgbW9kZWwgaW1wbGVtZW50YXRpb25cbiAqIEBhdXRob3IgRGFya1BhcmtcbiAqIEBsaWNlbnNlIEdOVSBHRU5FUkFMIFBVQkxJQyBMSUNFTlNFIFZlcnNpb24gM1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc29sZS5sb2coJy9jbGllbnQvanMvbW9kZWwubm90ZS5qcycpO1xuXG52YXIgTW9kZWwgID0gcmVxdWlyZSgnLi9saWIvbW9kZWwnKSxcblx0Y29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIGluaXQgYXR0cmlidXRlc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIE5vdGUgKCBhdHRyaWJ1dGVzICkge1xuXHR2YXIgdGltZSA9ICtuZXcgRGF0ZSgpO1xuXHQvLyBwYXJlbnQgaW5pdCB3aXRoIGRlZmF1bHQgcGFyYW1zXG5cdE1vZGVsLmNhbGwodGhpcywge1xuXHRcdF9pZCAgICAgOiAnJyxcblx0XHRjdGltZSAgIDogdGltZSwgIC8vIGNyZWF0aW9uIHRpbWVcblx0XHRtdGltZSAgIDogdGltZSwgIC8vIG1vZGlmaWNhdGlvbiB0aW1lXG5cdFx0aGFzaCAgICA6ICcnLCAgICAvLyBzaGEyNTYgb2YgdGhlIGVuY3J5cHRlZCBkYXRhIGZvciB2YWxpZGF0aW9uXG5cdFx0ZGF0YSAgICA6ICcnICAgICAvLyBlbmNyeXB0ZWQgZGF0YSBvZiB0aGUgd2hvbGUgbm90ZVxuXHRcdC8vZW50cmllcyA6IFtdLCAgICAvLyBwbGFpbiBkYXRhIG9mIHRoZSBub3RlIGVudHJpZXNcblx0XHQvL3RhZ3MgICAgOiBbXSAgICAgLy8gcGxhaW4gZGF0YSBvZiB0aGUgbm90ZSB0YWdzXG5cdH0pO1xuXHQvL3RoaXMuZW50cmllcyA9IFtdOyAgLy8gcGxhaW4gZGF0YSBvZiB0aGUgbm90ZSBlbnRyaWVzXG5cdC8vdGhpcy50YWdzICAgID0gW107ICAvLyBwbGFpbiBkYXRhIG9mIHRoZSBub3RlIHRhZ3Ncblx0Ly8gc3luYyBsaW5rXG5cdHRoaXMudXJsID0gY29uZmlnLmFwaVVybCArICdub3Rlcyc7XG5cdC8vIGV4dGVuZFxuXHR0aGlzLmF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG59XG5cblxuLy8gaW5oZXJpdGFuY2Vcbk5vdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNb2RlbC5wcm90b3R5cGUpO1xuTm90ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb3RlO1xuXG5cbk5vdGUucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuXG59O1xuXG5cbk5vdGUucHJvdG90eXBlLmVuY3J5cHQgPSBmdW5jdGlvbiAoKSB7XG5cbn07XG5cblxuTm90ZS5wcm90b3R5cGUuZGVjcnlwdCA9IGZ1bmN0aW9uICgpIHtcblxufTtcblxuXG4vLyBwdWJsaWMgZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IE5vdGU7IiwiLyoqXG4gKiBNYWluIGFwcGxpY2F0aW9uIGh0bWwgYmxvY2tzXG4gKiBAYXV0aG9yIERhcmtQYXJrXG4gKiBAbGljZW5zZSBHTlUgR0VORVJBTCBQVUJMSUMgTElDRU5TRSBWZXJzaW9uIDNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnNvbGUubG9nKCcvY2xpZW50L2pzL3BhZ2VzLmpzJyk7XG5cbnZhciBQYWdlID0gcmVxdWlyZSgnLi9saWIvcGFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0YXV0aDogbmV3IFBhZ2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keSA+IGRpdi5wYWdlLmF1dGgnKSksXG5cdGxpc3Q6IG5ldyBQYWdlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHkgPiBkaXYucGFnZS5saXN0JykpXG59O1xuIixudWxsXX0=
