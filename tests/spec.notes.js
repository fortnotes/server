/**
 * Mocha REST notes tests.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var should  = require('should'),
	restify = require('restify'),
	db      = require('../lib/orm'),
	data    = require('./data'),
	userA   = data.userA,
	userB   = data.userB;


describe('Notes', function () {
	var client = restify.createJsonClient({
		url: 'http://localhost:9090',
		version: '*'
	});

	after(function () {
		// need to close http connection manually
		client.close();
	});


	describe('create users and sessions', function () {
		it('should fail: no email', function ( done ) {
			done();
		});
	});
});
