/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Emitter  = require('cjs-emitter'),
    WSServer = require('ws').Server,
    Wamp     = require('cjs-wamp'),
    fs       = require('fs');


/**
 * @constructor
 *
 * @param {Object} [config={}] init parameters
 */
function App ( config ) {
    var debug = require('debug')('app'),
        wamps = {};
    //var self = this;


    // parent constructor call
    Emitter.call(this);

    this.config = config;

    this.debug = debug;

    debug('app init');

    this.server = new WSServer({
        host: config.host,
        port: config.port
    });

    // ready
    this.server.on('listening', function listening () {
        debug('WebSocket server is listening on %s:%s', config.host, config.port);
    });

    // serve requests
    this.server.on('connection', function connection ( connection ) {
        var nodeId   = connection.upgradeReq.url.slice(1),
            nodeWamp = new Wamp(connection),
            methods  = {
                auth: function ( params, callback ) {
                    // params.key
                    debug('%s: auth', nodeId);
                    callback(null, true);
                },

                ping: function ( params, callback ) {
                    callback(null, 'pong');
                },

                systemInfo: function ( params, callback ) {
                    var memInfo    = fs.readFileSync('/proc/meminfo', 'utf8'),
                        cpuInfo    = fs.readFileSync('/proc/cpuinfo', 'utf8'),
                        obj = {},
                        item; 

                    
                    function prepareInfo ( row ) {
                        item = row.split(':');
                        obj[item[0].trim()] = item[1].trim();
                        
                        return obj;
                    } 


                    memInfo = memInfo.split('\n').map(prepareInfo);
                    cpuInfo = cpuInfo.split('\n').map(prepareInfo);


                    callback({
                        memInfo: memInfo,
                        cpuInfo: cpuInfo,
                        WSClientsCount: Object.keys(wamps).length
                    });
                },

                connect: function ( params, callback ) {
                    var wamp = wamps[params.id];

                    // if ( !inProgress[nodeId] || inProgress[nodeId].indexOf(params.id) === -1 ) {
                    //     inProgress[params.id] = inProgress[params.id] || [];
                    //     inProgress[params.id].push(nodeId);

                    if ( wamp ) {
                        wamp.call('connect', {id: nodeId, sdp: params.sdp}, function ( error, result ) {
                            callback(error, result);
                            //console.log('answer');
                            //console.log(result);
                            debug('%s: link with %s - success', nodeId, params.id);
                        });
                    } else {
                        callback({message: 'node is offline'});
                        debug('%s: link with %s - failure', nodeId, params.id);
                    }
                    // } else {
                    //     callback({message: 'node is already connecting'});
                    //     debug(params.id + ' is already connecting');
                    // }


                    //console.log(params);
                },

                ice: function ( params ) {
                    var wamp = wamps[params.id];

                    if ( wamp ) {
                        wamp.call('ice', {id: nodeId, candidate: params.candidate});
                        debug('%s: send ice candidate to %s', nodeId, params.id);
                    }
                }
            };

        wamps[nodeId] = nodeWamp;

        debug('%s: open', nodeId);

        // apply all listeners
        Object.keys(methods).forEach(function ( name ) {
            nodeWamp.addListener(name, methods[name]);
        });

        connection.on('error', function ( event ) {
            debug('wamp.socket error', event);
        });

        connection.on('close', function () {
            wamps[nodeId] = nodeWamp = null;

            /*connection.nodes.forEach(function ( client ) {
             nodeWamp.call('eventTargetOffline', {id: connection.data.id});
             });*/

            //debug(wamps);
            //debug('close', {code: event, nodes: Object.keys(wamps).length});
            debug('%s: close', nodeId);
        });
    });
}


// inheritance
App.prototype = Object.create(Emitter.prototype);
App.prototype.constructor = App;


// server address
App.prototype.host = require('ip').address();


App.prototype.exit = function () {
    this.server.close();
};


// public
module.exports = App;
