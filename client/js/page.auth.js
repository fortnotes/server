'use strict';

var //io           = require('./lib/io'),
	sjcl         = require('./lib/sjcl'),
	api          = require('./api'),
	aes          = require('./aes'),
	config       = require('./config'),
	pages        = require('./pages'),
	//pageAuth     = document.querySelector('body > div.page.auth'),
	//pageList     = document.querySelector('body > div.page.list'),
	inputName    = pages.auth.$node.querySelector('input.name'),
	inputPass    = pages.auth.$node.querySelector('input.pass'),
	buttonLogin  = pages.auth.$node.querySelector('button.login'),
	buttonSignup = pages.auth.$node.querySelector('button.signup');


// restore the last authenticated user name
inputName.value = localStorage.getItem('config.auth.name') || '';
if ( inputName.value ) {
	inputPass.focus();
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
		var salt, hash, post;

		if ( response.code === 1 ) {
			salt = response.salt;
			hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(hashPass + salt));
			// suppose the pass is correct
			aes.setPass(inputPass.value);

			// user session data to store
			post = aes.encrypt(JSON.stringify({
				ip: response.ip,
				ua: window.navigator.userAgent
			}));
			console.log(post);

			// generate a hash and receive an api key
			api.post('auth/' + hashName + '/' + hash, post, function(err, response){
				// access is granted
				if ( response.code === 1 && response.key ) {
					// clear plain pass
					inputPass.value = '';
					// save authentication data
					localStorage.setItem('config.auth.key',  config.apiKey = response.key);
					localStorage.setItem('config.auth.name', inputName.value);
					localStorage.setItem('config.pass.salt', aes.salt = salt);
					localStorage.setItem('config.pass.hash', aes.hash = hash);
					// encrypt/decrypt parameters
					localStorage.setItem('config.sjcl', JSON.stringify(config.sjcl = response.sjcl));
					// go the the client section
					pages.list.show();
					pages.auth.hide();
				} else {
					//TODO: wrong auth data
					console.log(response);
				}
			});
		} else {
			//TODO: wrong auth data
			console.log(response);
		}
	});
});

buttonSignup.addEventListener('click', function(){
	//TODO: registration
	console.log(this);
});