'use strict';

var config = require('config'),
	express = require('express'),
	expressValidator = require('express-validator'),
	Resource = require('express-resource'),
	_ = require('underscore'),
	resources = require('./resources'),
	port = process.env.PORT || config.port,
	apiKeys = config.apiKeys || [],
	app = express(),
	server;

// create an error with .status. we
// can then use the property in our
// custom error handler (Connect repects this prop as well)

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}

function setupResources(app, resources){
	_.each(resources, function(resource){
		app.resource(resource.id, resource, resource.param);
	});
}

app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.compress());
	app.use(express.bodyParser());
	app.use(expressValidator());
	app.use(express.basicAuth(function(user, pass) {
		return user === 'testUser' && pass === 'testPass';
	}));
	app.use(app.router);
	setupResources(app, resources);
	app.use(function(err, req, res, next){
		res.send(err.status || 500, { error: err.message });
	});
	app.use(function(req, res){
		res.send(404, { error: "Lame, can't find that" });
	});
});


server = app.listen(port);

console.log('Framecap listening on port:' + port);

process.on('SIGTERM', server.close.bind(server));
