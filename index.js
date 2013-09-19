'use strict';

var express = require('express'),
	config = require('config'),
	queueServer = require('./server/queue'),
	app = express();

queueServer.loadProcs('./procs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
// app.use(express.basicAuth('foo', 'bar'));
app.use(queueServer.app);
app.listen(config.port);

console.log('App listening on port:' + config.port);
