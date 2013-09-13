'use strict';

var TaskRunner = require('../lib/task-runner'),
	util = require('util');

exports.index = function(req, res, next){
	res.format({
		json: function(){
			res.send({'foo': 'bar'});
		}
	});
};

exports.show = function(req, res, next){
	var task = TaskRunner.get(req.params.id);
	if (task) {
		res.format({
			json: function(){
				res.send({id: task.pid});
			}
		});
	} else {
		res.send(404);
	}


};

exports.create = function(req, res, next){
	var errors, task;

	req.checkBody('url', 'Invalid parameter!').isUrl();
	req.sanitize('url').xss();
	errors = req.validationErrors(true);

	if(errors){
		res.format({
			json: function(){
				res.send(errors, 400);
			}
		});
	} else {
		task = TaskRunner.create({task: 'capture.js', args: ['/']});

		res.format({
			json: function(){
				res.setHeader("Content-Location", req.protocol + "://" + req.get('host') + req.url + '/' + task.pid);
				res.send(202, {id: task.pid});
			}
		});
	}
};

exports.update = function(req, res, next){

};

exports.destroy = function(req, res, next){

};

exports.id = "api/tasks/capture";
exports.param = { id: 'id' };
