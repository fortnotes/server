'use strict';

define(function () {

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

	// export
	return Emitter;

});

///**
// * Events Emitter base implementation
// * @see http://nodejs.org/api/events.html
// * @author DarkPark
// * @license GNU GENERAL PUBLIC LICENSE Version 3
// */
//app.class.Emitter = (function(){
//	'use strict';
//
//	/**
//	 * @constructor
//	 */
//	function Emitter () {
//		this._events = Object.create(null);
//	};
//
//	Emitter.prototype = {
//		/**
//		 * Bind an event to the given callback function.
//		 * The same callback function can be added multiple times for the same event name.
//		 * @param {String} name event identifier
//		 * @param {Function} callback function to call on this event
//		 * @example
//		 *		TODO: add
//		 */
//		addListener : function ( name, callback ) {
//			// initialization may be required
//			this._events[name] = this._events[name] || [];
//			// append this new event to the list
//			this._events[name].push(callback);
//		},
//
//		/**
//		 * Remove one/many callbacks.
//		 * @param {String} name event identifier
//		 * @param {Function} callback function to call on this event
//		 * @example
//		 *		TODO: add
//		 */
//		removeListener : function ( name, callback ) {
//			// the event exists and should have some callbacks
//			if ( Array.isArray(this._events[name]) ) {
//				// rework the callback list to exclude the given one
//				this._events[name] = this._events[name].filter(function(fnc){ return fnc !== callback; });
//				// event has no more callbacks so clean it
//				if ( this._events[name].length === 0 ) {
//					delete this._events[name];
//				}
//			}
//		},
//
//		/**
//		 * Remove all callbacks for the given event name.
//		 * Without event name clears all events.
//		 * @param {String} [name] event identifier
//		 * @example
//		 *		TODO: add
//		 */
//		removeAllListeners : function ( name ) {
//			// check input
//			if ( arguments.length === 0 ) {
//				// no arguments so remove everything
//				this._events = Object.create(null);
//			} else if ( arguments.length === 1 ) {
//				// only name is given so remove all callbacks for the given event
//				delete this._events[name];
//			}
//		},
//
//		/**
//		 * Execute each of the listeners in order with the supplied arguments.
//		 * @param {String} name event identifier
//		 * @param {...*} [args] options
//		 * @example
//		 *		TODO: add
//		 */
//		emit : function ( name, args ) {
//			var fncIndex;
//			args = Array.prototype.slice.call(arguments, 1);
//			// the event exists and should have some callbacks
//			if ( Array.isArray(this._events[name]) ) {
//				for ( fncIndex = 0; fncIndex < this._events[name].length; fncIndex++ ) {
//					// invoke the callback with parameters
//					this._events[name][fncIndex].apply(this, args);
//				}
//			}
//		},
//
//		/**
//		 * Adds a one time listener for the event.
//		 * This listener is invoked only the next time the event is fired, after which it is removed.
//		 * @param {String} name event identifier
//		 * @param {Function} callback function to call on this event
//		 */
//		once: function ( name, callback ) {
//			var self = this;
//			this.addListener(name, function wrapper () {
//				self.removeListener(name, wrapper);
//				callback.apply(self, arguments);
//			});
//		}
//	};
//
//	// export
//	return Emitter;
//})();