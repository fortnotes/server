/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs      = require('fs'),
    path    = require('path'),
    debug   = require('debug')('app'),
    cwd     = process.cwd(),
    ignore  = [];


/**
 * @constructor
 */
function App () {
    this.events = {};
}


App.prototype = {
    // program info
    package: require(path.join(cwd, 'package.json')),

    // server address
    host: require('ip').address()
};


// correct constructor name
App.prototype.constructor = App;


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
