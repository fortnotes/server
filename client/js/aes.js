/**
 * AES encryption/decryption wrapper
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

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