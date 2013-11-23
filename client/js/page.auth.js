'use strict';

var io           = require('./lib/io'),
	sjcl         = require('./lib/sjcl'),
	aes          = require('./aes'),
	config       = require('./config'),
	pageAuth     = document.querySelector('body > div.page.auth'),
	pageList     = document.querySelector('body > div.page.list'),
	inputName    = pageAuth.querySelector('input.name'),
	inputPass    = pageAuth.querySelector('input.pass'),
	buttonLogin  = pageAuth.querySelector('button.login'),
	buttonSignup = pageAuth.querySelector('button.signup'),
	apiKey       = localStorage.getItem('config.auth.key');


// authenticated?
if ( apiKey ) {
	//TODO: session revoke
	pageList.classList.add('active');
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
	var hashName = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(inputName.value)),
		hashPass = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(inputPass.value));
	// get a salt for the given login
	io.ajax(config.urls.api + 'auth/' + hashName, {
		onload: function(response){
			response = JSON.parse(response);
			// generate a hash and receive an api key
			io.ajax(config.urls.api + 'auth/' + hashName + '/' + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(hashPass + response.salt)), {
				method: 'post',
				data  : aes.encrypt(JSON.stringify({
					ip: response.ip,
					ua: window.navigator.userAgent
				})),
				onload: function(response){
					response = JSON.parse(response);
					// access is granted
					if ( response.code === 1 && response.key ) {
						// save authentication
						localStorage.setItem('config.auth.key', response.key);
						localStorage.setItem('config.auth.time', +new Date());
						// go the the client section
						pageList.classList.toggle('active');
						pageAuth.classList.toggle('active');
					} else {
						//TODO: wrong auth data
						console.log(response);
					}
				}
			});
		}
	});
});

buttonSignup.addEventListener('click', function(){
	//TODO: registration
	console.log(this);
});