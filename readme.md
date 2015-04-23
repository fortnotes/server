FortNotes Server
================

[![Build Status](https://img.shields.io/travis/fortnotes/server.svg?style=flat-square)](https://travis-ci.org/fortnotes/server)
[![NPM version](https://img.shields.io/npm/v/fortnotes.svg?style=flat-square)](https://www.npmjs.com/package/fortnotes)
[![Dependencies Status](https://img.shields.io/david/fortnotes/server.svg?style=flat-square)](https://david-dm.org/fortnotes/server)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg?style=flat-square)](https://gitter.im/fortnotes/server)

[FortNotes](https://fortnotes.com/) is a highly secure online private information manager based on the AES encryption in the browser.
This repo is for a new fully redesigned and reworked version.
The current stable version can be found on the [Bitbucket](https://bitbucket.org/DarkPark/fortnotes).


## Getting Started ##

[Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/) should be installed beforehand.
Please follow the official [instruction](http://nodejs.org/download/).

FortNotes Server is available as an [npm package](https://www.npmjs.org/package/fortnotes) and should be installed globally:

```bash
npm install -g fortnotes
```

In Linux this can be done as a root:

```bash
sudo npm install -g fortnotes
```

Then to start a server with default options:

```bash
fortnotes
```

## Usage ##

General way of usage:

```bash
fortnotes [options]
```

Full list of available options can be provided by the `fortnotes` application:

```bash
fortnotes --help
```

To run FortNotes Server with the specific configuration:

```bash
fortnotes --config ~/.fortnotes/config.json
```

Where the content of `config.json`:

```json
{
	"port": 8080,
	"dataLimit": 50,
	"sessionTokenSize": 128,
	"sessionConfirmAttempts": 5,
	"smtpTransport": {
		"service": "gmail",
		"auth": {
			"user": "gmail.user@gmail.com",
			"pass": "userpass"
		}
	},
	"database": "sqlite://./data.sqlite"
}
```

#### DBMS Support

- MySQL & MariaDB
- PostgreSQL
- Amazon Redshift (not tested)
- SQLite

There are some config file examples for
[mysql](tests/configs/mysql.json),
[postgres](tests/configs/postgres.json),
[sqlite in memory](tests/configs/sqlite.json) and
[other options](tests/configs/options.json).

#### Config file options

 Name                    | Description
-------------------------|-------------
 debug                   | enable verbose debug mode
 test                    | run tests and exit
 port                    | HTTP port serving REST API requests
 dataSize                | maximum encrypted data size (notes, tags)
 hashSize                | notes/tags sha512 hash size
 dataLimit               | default amount of returned records in lists of notes, sessions etc.
 dataLimitMax            | maximum amount of returned records in lists
 sessionTokenSize        | generated token size in bytes
 sessionConfirmCodeSize  | generated token confirmation code size in bytes
 sessionConfirmAttempts  | allowed amount of attempts to activate sessions
 smtpTransport           | nodemailer SMTP transport [configuration](https://github.com/andris9/nodemailer-smtp-transport) (use direct if not set)
 mailOptions             | nodemailer e-mail message [fields](https://github.com/andris9/Nodemailer#e-mail-message-fields)
 restify                 | server creation options passed to [restify package](http://mcavage.me/node-restify/#creating-a-server)
 database                | database connection options passed to [node-orm2 package](https://github.com/dresende/node-orm2/wiki/Connecting-to-Database)

Default config options are listed in the [config.js](config.js).

## Development ##

Get the latest version of source files:

```bash
git clone git@github.com:fortnotes/server.git
cd server
```

Install global dependencies:

```bash
sudo npm install -g gulp node-dev
```

Then install local dependencies:

```bash
npm install
```

Now you can start it like this:

```bash
node-dev ./bin/cli.js --config ./tests/configs/sqlite.json --debug
```

To see sub-system log details:

```bash
DEBUG=* node ./bin/cli.js --config ./tests/configs/sqlite.json
```

Full REST API documentation is built from source files and available [online](https://fortnotes.github.io/server/).


## Testing ##

It's possible to run all tests locally with given config:

```bash
fortnotes --config ~/.fortnotes/config.json --test
```

Tests are also run on [Travis CI](https://travis-ci.org/fortnotes/server) for node versions `0.10.x`, `0.12.x` and `iojs`.


## License ##

FortNotes Server is released under the [GPL-3.0 License](http://opensource.org/licenses/GPL-3.0).
