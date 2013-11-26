'use strict';

var io           = require('./lib/io'),
	sjcl         = require('./lib/sjcl'),
	api          = require('./api'),
	aes          = require('./aes'),
	config       = require('./config'),
	pageAuth     = document.querySelector('body > div.page.auth'),
	pageList     = document.querySelector('body > div.page.list'),
	inputName    = pageAuth.querySelector('input.name'),
	inputPass    = pageAuth.querySelector('input.pass'),
	buttonLogin  = pageAuth.querySelector('button.login'),
	buttonSignup = pageAuth.querySelector('button.signup');


// authenticated?
if ( config.apiKey ) {
	// it appears the user is logged in but validation is required
	api.put('sessions/' + config.apiKey, function(err, response){
		// session is valid
		if ( response.code === 1 ) {
			pageList.classList.add('active');
			console.log('%c%s %o', 'color:green', 'session is valid, last access time:', new Date(response.atime));
		} else {
			// authentication has expired
			pageAuth.classList.add('active');
			console.log('%c%s', 'color:red', 'session is invalid, need to login');
			localStorage.clear();
		}
	});
} else {
	pageAuth.classList.add('active');
}


inputName.addEventListener('keydown', function(event){
	if ( event.keyCode === 13 ) { inputPass.focus(); }
});

inputPass.addEventListener('keydown', function(event){
	if ( event.keyCode === 13 ) { buttonLogin.click(); }
});


buttonLogin.addEventListener('click', function(){
	// prepare hashes
	var hashName = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(inputName.value)),
		hashPass = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(inputPass.value));

	// get a salt for the given login
	api.get('auth/' + hashName, function(err, response){
		var salt = response.salt,
			hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(hashPass + salt)),
			// user session data to store
			post = aes.encrypt(JSON.stringify({
				ip: response.ip,
				ua: window.navigator.userAgent
			}));

		// generate a hash and receive an api key
		api.post('auth/' + hashName + '/' + hash, post, function(err, response){
			// access is granted
			if ( response.code === 1 && response.key ) {
				// save authentication data
				localStorage.setItem('config.auth.key', config.apiKey = response.key);
				localStorage.setItem('config.auth.salt', salt);
				localStorage.setItem('config.auth.hash', hash);
				// encrypt/decrypt parameters
				localStorage.setItem('config.sjcl', JSON.stringify(config.sjcl = response.sjcl));
				// go the the client section
				pageList.classList.toggle('active');
				pageAuth.classList.toggle('active');
			} else {
				//TODO: wrong auth data
				console.log(response);
			}
		});
	});

//	io.ajax(config.apiUrl + 'auth/' + hashName, {
//		onload: function(response){
//			response = JSON.parse(response);
//			// generate a hash and receive an api key
//			io.ajax(config.apiUrl + 'auth/' + hashName + '/' + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(hashPass + response.salt)), {
//				method: 'post',
//				data  : aes.encrypt(JSON.stringify({
//					ip: response.ip,
//					ua: window.navigator.userAgent
//				})),
//				onload: function(response){
//					response = JSON.parse(response);
//					// access is granted
//					if ( response.code === 1 && response.key ) {
//						// save authentication
//						localStorage.setItem('config.auth.key', config.apiKey = response.key);
//						// encrypt/decrypt parameters
//						localStorage.setItem('config.sjcl', JSON.stringify(config.sjcl = response.sjcl));
//						// go the the client section
//						pageList.classList.toggle('active');
//						pageAuth.classList.toggle('active');
//					} else {
//						//TODO: wrong auth data
//						console.log(response);
//					}
//				}
//			});
//		}
//	});
});

buttonSignup.addEventListener('click', function(){
	//TODO: registration
	console.log(this);
});