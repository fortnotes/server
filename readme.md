FortNotes Server
================

[![Build Status](https://travis-ci.org/fortnotes/server.svg?branch=master)](https://travis-ci.org/fortnotes/server)
[![Join the chat at https://gitter.im/DarkPark/FortNotes](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DarkPark/FortNotes?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
	"port": 9090,
	"dataSize": 1048576,
    "hashSize": 128,
    "dataLimit": 20,
    "dataLimitMax": 200,
	"restify": {
		"name": "FortNotes API REST Server"
	},
	"session": {
		"tokenSize":       96,
		"confirmCodeSize": 12,
		"confirmAttempts": 3
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
 mailTransportType       | nodemailer transport [type](http://adilapapaya.com/docs/nodemailer/#possibletransportmethods)
 mailTransportConfig     | nodemailer transport [configuration](http://adilapapaya.com/docs/nodemailer/#globaltransportoptions)
 mailOptions             | nodemailer e-mail message [fields](http://adilapapaya.com/docs/nodemailer/#emailmessagefields)
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
node-dev ./bin/cli.js --config ../config/sqlite.json --debug
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
