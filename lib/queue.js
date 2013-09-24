'use strict';

var kue = require('kue'),
	util = require('util'),
	_ = require('lodash'),
	fs = require('fs'),
    path = require('path'),
    redis = require('redis'),
    url = require('url'),
    redisUrl = url.parse(process.env.REDISCLOUD_URL || 'redis://localhost:6379'),
    redisAuth = (redisUrl.auth || '').split(':');

kue.redis.createClient = function() {
    var client = redis.createClient(redisUrl.port, redisUrl.hostname);
    client.auth(redisAuth[1]);
    return client;
};

var loadProcs = function loadProcs( dirname ){

	var procs;

	if(!dirname){
		return;
	}

	procs = _.compact(fs.readdirSync( dirname ).map(function(filename) {
		var name, proc;
		name = path.basename(filename, '.js');
		if (name === 'index' || name[0] === '_') {
			return;
		}

		return require(path.resolve(dirname, name));

	}));

	return createQueues( procs );
};

var createQueues = function createQueues( procs ){

	var queue, type, concur, run, schema;

	return _.compact(procs.map(function(proc){

		type = proc.type;
		concur = proc.concur || 1;
		run = proc.run;
		schema = proc.schema;

		if(!type){
			return util.debug('Proc must have an exported type to identify itself!');
		}

		queue = kue.createQueue();
		queue.process(type, concur, run);
		if( schema ){
			queue.registerSchema(type, schema)
		}

		return queue;

	}));
}

exports.loadProcs = loadProcs;
exports.app = kue.app;

