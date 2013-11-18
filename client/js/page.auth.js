'use strict';

var io           = require('./lib/io'),
	sjcl         = require('./lib/sjcl'),
	config       = require('./config'),
	page         = document.querySelector('body > div.page.auth'),
	inputName    = page.querySelector('input.name'),
	inputPass    = page.querySelector('input.pass'),
	buttonLogin  = page.querySelector('button.login'),
	buttonSignup = page.querySelector('button.signup');

buttonLogin.addEventListener('click', function(){
	var hashName = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(inputName.value)),
		hashPass = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(inputPass.value));
	//console.log(this);
	//console.log(inputName.value);
	//console.log(inputPass.value);
	io.ajax(config.urls.api + 'auth/' + hashName, {
		onload: function(response){
			response = JSON.parse(response);
			//console.log(response);
			io.ajax(config.urls.api + 'auth/' + hashName + '/' + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(hashPass + response.salt)), {
				onload: function(response){
					response = JSON.parse(response);
					console.log(response);
				}
			});
		}
	});
});

buttonSignup.addEventListener('click', function(){
	console.log(this);
});