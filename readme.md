FortNotes Server
================

[![Build Status](https://travis-ci.org/fortnotes/server.svg?branch=master)](https://travis-ci.org/fortnotes/server)
[![Join the chat at https://gitter.im/DarkPark/FortNotes](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DarkPark/FortNotes?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[FortNotes](https://fortnotes.com/) is a highly secure online private information manager based on the AES encryption in the browser.
This repo is for a new fully redesigned and reworked version.
The current stable version can be found on the [Bitbucket](https://bitbucket.org/DarkPark/fortnotes).


## Getting Started

[Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/) should be installed beforehand.
Please follow the official [instruction](http://nodejs.org/download/).

`FortNotes Server` is available as an [npm package](https://www.npmjs.org/package/fortnotes-server) and should be installed globally:

```bash
npm install -g fortnotes-server
```

In Linux this can be done as a root:

```bash
sudo npm install -g fortnotes-server
```

Then to start a server with default options:

```bash
fortnotes
```

## Usage

General way of usage:

```bash
fortnotes [options]
```

Full list of available options can be provided by the `fortnotes` application:

```bash
fortnotes --help
```


## Development ##

Get the latest version from github:

```bash
git clone git@github.com:fortnotes/server.git
cd server
```

Install global dependencies:

```bash
sudo npm install -g node-dev
```

Then install local dependencies:

```bash
npm install
```

Now you cat start it like this:

```bash
node-dev ./bin/cli.js --debug
```


## License

`FortNotes Server` is released under the [GPL-3.0 License](http://opensource.org/licenses/GPL-3.0).
