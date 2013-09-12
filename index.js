'use strict';

var config = require('config'),
	express = require('express'),
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
		app.resource(resource.id, resource);
	});
}

app.configure(function(){
	app.use(express.logger());
	app.use(express.compress());
	app.use(express.bodyParser());
	app.use('/api', function(req, res, next){
		var key = req.query['api_key'];
		if (!key) {
			return next(error(400, 'api key required'));
		}
		if (!~apiKeys.indexOf(key)) {
			return next(error(401, 'invalid api key'));
		}
		req.key = key;
		next();
	});
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
