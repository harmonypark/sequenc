'use strict';

var express = require('express'),
	url = require('url'),
	config = require('config'),
	queueServer = require('./server/queue'),
	app = express();

queueServer.loadProcs('./procs');
app.use(express.logger('dev'));
app.use(queueServer.app);
app.use(function(err, req, res, next){
	res.send({ errors: [err] }, err.status); //TODO: implement proper error handler
});

app.listen(config.port);
console.log('App listening on port:' + config.port);
