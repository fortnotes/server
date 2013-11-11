/**
 * Base view implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */
app.class.View = (function(app){
	'use strict';

	/**
	 * @constructor
	 */
	var View = function () {
		app.class.Emitter.call(this);
	};

	// inheritance
	View.prototype = Object.create(app.class.Emitter.prototype);
	View.prototype.constructor = View;

	// export
	return View;
})(app);