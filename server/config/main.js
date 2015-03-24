/**
 * Main server configuration.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

module.exports = {
	debug: true,

	httpPort: 9090,

	session: {
		tokenSize:       96,
		confirmCodeSize: 12,
		confirmAttempts: 3
	},

	database: {
		host: '127.0.0.1',
		port: 27017,
		base: 'fortnotes'
	}
};
