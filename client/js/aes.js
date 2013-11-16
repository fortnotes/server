/**
 * AES encryption/decryption wrapper
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Emitter = require('./lib/emitter'),
	sjcl    = require('./lib/sjcl'),
	aes     = new Emitter(),
	pass    = null;  // private primary password (accessed only indirectly)


// hash of the given pass (if not set then the pass was not created)
aes.hash   = null;
// salt string for hash generation
aes.salt   = null;
// time in seconds for pass caching (default - 5 minutes)
aes.time   = 300;
// encode/decode default configuration
aes.config = {ks:256,ts:128,mode:'ccm',cipher:'aes'};


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
	//var result = {};
	// password is present and not empty input
	if ( pass && data ) {
		// protected block
		try {
			return sjcl.json._encrypt(pass, data, this.config);
			/*sjcl.encrypt(pass, data, this.config, result);
			return result;*/
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
	// password is present and not empty input
	if ( pass && data ) {
		// protected block
		try {
			return sjcl.json._decrypt(pass, data);
		} catch ( e ) {
			console.trace();
			console.log('decrypt failure', e);
		}
	}
	return false;
};


// public export
module.exports = aes;