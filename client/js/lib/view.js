/**
 * Base view implementation
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Emitter = require('./emitter');


/**
 * @constructor
 */
function View () {
	// parent init
	Emitter.call(this);
}


// inheritance
View.prototype = Object.create(Emitter.prototype);
View.prototype.constructor = View;


// public export
module.exports = View;
