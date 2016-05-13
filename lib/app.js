/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path    = require('path'),
    Emitter = require('cjs-emitter'),
    orm     = require('orm'),
    restify = require('restify'),
    //restify = require('./restify'),
    debug   = require('debug')('app');


/**
 * @constructor
 */
function App ( config ) {
    var self = this;

    debug('app init');

    // parent constructor call
    Emitter.call(this);

    this.config = config;

    // global db options
    orm.settings.set('connection.debug', config.debug);
    orm.settings.set('instance.cache',   false);

    // init
    this.db = orm.connect(config.database);

    // ready
    this.db.on('connect', function ( error ) {
        debug('db connect');

        if ( error ) { throw error; }

        // plugins
        self.db.use(require('orm-transaction'));

        //console.log(self);

        // notify
        self.emit('db:connect');


        // models
        /*require('./models/keys');
        require('./models/notes');
        require('./models/notes.history.js');
        require('./models/users');
        require('./models/sessions');*/

        // db is ready
        self.db.sync(function ( error ) {
            debug('db sync');

            if ( error ) { throw error; }

            // notify
            self.emit('db:sync');

            // apply restify resources
            /*require('./resources/sessions');
            require('./resources/notes');
            //require('./resources/users');
            require('./resources/tags');
            require('./resources/profile');*/

            self.restify = restify.createServer(config.restify);

            /* eslint-disable new-cap */

            // plugins
            self.restify.use(restify.CORS());
            self.restify.use(restify.bodyParser());
            self.restify.use(restify.queryParser());

            /* eslint-disable no-unused-vars */

            // authorization
            self.restify.use(function ( request, response, next ) {
                request.authorization = {};

                if ( request.headers.authorization ) {
                    request.authorization.token = request.headers.authorization.slice(7);
                }

                return next();
            });

            // logger
            self.restify.use(function ( request, response, next ) {
                debug('%s\t%s\t%o', request.method, request.url, request.params);

                return next();
            });


            // accept API requests
            self.restify.listen(config.port, config.host, function () {
                debug('restify listen');

                // notify
                self.emit('http:listen');

                console.log('%s listening at %s:%s', self.restify.name, require('ip').address(), config.port);

                // if ( config.test ) {
                //     // run tests and exit
                //     require('../tests/main');
                // }
            });
        });
    });
}


// App.prototype = {
//     // program info
//     package: require(path.join(process.cwd(), 'package.json')),
//
//     // server address
//     host: require('ip').address(),
//
//     close: function () {
//         // todo
//     }
// };


// inheritance
App.prototype = Object.create(Emitter.prototype);
App.prototype.constructor = App;


// server address
App.prototype.host = require('ip').address();


// public
module.exports = App;


// app.plugins = {};
// app.runner  = new Runner();
// //app.config  = require('../config');
// app.package = require(path.join(cwd, 'package.json'));
// app.host    = require('ip').address();
// app.paths   = {
//     root:          cwd,
//     project:       path.join(cwd, '.sdk'),
//     ignorePlugins: path.join(cwd, '.sdk', 'ignore.plugins.json')
// };
//
//
// try {
//     fs.mkdirSync(app.paths.project);
//     debug('create project directory: ' + app.paths.project);
// } catch ( error ) {
//     debug('existing project directory: ' + app.paths.project);
// }
//
// try {
//     ignore = require(app.paths.ignorePlugins);
//     debug('ignore plugins', ignore);
// } catch ( error ) {
//     debug('no ignored plugins');
// }
//
// app.init = function ( config ) {
//     var tasks = {};
//
//     //debug('tasks to execute', config.tasks);
//
//     // load plugin tasks
//     config.plugins.forEach(function ( name ) {
//         if ( ignore.indexOf(name) === -1 ) {
//             // load
//             app.plugins[name] = require(name);
//             // and merge
//             extend(true, tasks, app.plugins[name].tasks);
//         }
//     });
//
//     // extract global tasks
//     Object.keys(tasks).forEach(function ( name ) {
//         var parts = name.split(':');
//
//         // task like "jade:build"
//         if ( parts.length === 2 ) {
//             // create/add in general list
//             tasks[parts[1]] = tasks[parts[1]] || [];
//             tasks[parts[1]].push(name);
//         }
//     });
//
//     //console.log(tasks);
//
//     // create runner tasks
//     Object.keys(tasks).forEach(function ( name ) {
//         // skip marked for deletion
//         //if ( name && tasks[name] && typeof tasks[name] === 'function' ) {
//         //    app.runner.task(name, tasks[name]);
//         //}
//         if ( typeof tasks[name] === 'function' ) {
//             app.runner.task(name, tasks[name]);
//         } else if ( Array.isArray(tasks[name]) ) {
//             app.runner.task(name, app.runner.parallel.apply(app.runner, tasks[name]));
//         }
//     });
//
//     //console.log(app.runner.tasks);
//
//     //if ( config.tasks.length ) {
//     //    app.runner.run(app.runner.serial(config.tasks), function () {
//     //        process.exit();
//     //    });
//     //}
//
//
//     return app;
// };
//
//
// // setInterval(function () {
// //     debug(process.memoryUsage());
// // }, 10000);
//
//
// //tasks.load('spa-system-');
//
//
// //debug('exit');
//
// // public
// module.exports = app;
