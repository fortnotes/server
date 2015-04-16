/**
 * Default server configuration.
 * Can be redefined by user config file options.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

module.exports = {
	// enable verbose debug mode
	debug: false,

	// run tests and exit
	test: false,

	// HTTP port serving REST API requests
	port: 9090,

	// maximum encrypted data size (notes, tags, etc.)
	dataSize: 1048576,

	// notes/tags sha512 hash size
	hashSize: 128,

	// default amount of returned records in lists of notes, sessions, etc.
	dataLimit: 20,

	// maximum amount of returned records in lists
	dataLimitMax: 200,

	// generated token size in bytes
	sessionTokenSize: 96,

	// generated token confirmation code size in bytes
	sessionConfirmCodeSize: 12,

	// allowed amount of attempts to activate sessions
	sessionConfirmAttempts: 3,

	// nodemailer SMTP transport configuration (use direct if not set)
	// https://github.com/andris9/nodemailer-smtp-transport
	smtpTransport: null,

	// nodemailer e-mail message fields
	// https://github.com/andris9/Nodemailer#e-mail-message-fields
	mailOptions: {
		from: 'admin@fortnotes.com',
		subject: 'FortNotes Server notification'
	},

	// server creation options passed to restify package
	// http://mcavage.me/node-restify/#creating-a-server
	restify: {
		name: 'FortNotes API REST Server'
	},

	// database connection options passed to node-orm2 package
	// https://github.com/dresende/node-orm2/wiki/Connecting-to-Database
	database: 'sqlite://./data.sqlite'
};
