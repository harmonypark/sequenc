'use strict';

var express = require('express'),
	url = require('url'),
	config = require('config'),
	queueServer = require('./lib/queue'),
	monitor = require('./lib/monitor'),
	port = (parseInt(process.env.PORT) || config.port || 3000),
	app = express();

queueServer.loadProcs('./procs');
app.use(express.logger('dev'));
app.use(queueServer.app);
app.use(function(err, req, res, next){
	res.send({ errors: [err] }, err.status); //TODO: implement proper error handler
});

app.listen(port);
app.set('port', (process.env.NODE_ENV === 'production') ? null : port); // if we are in development - set it, else forget it

console.log('App listening on port:' + port);
