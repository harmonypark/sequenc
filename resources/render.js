'use strict';

exports.index = function(req, res, next){
	res.format({
		json: function(){
			res.json({"hey": 1});
		},
		html: function(){
			res.send('Hello world!');
		}
	});
};

exports.create = function(req, res, next){
};

exports.update = function(req, res, next){

};

exports.destroy = function(req, res, next){

};

exports.id = "api/render"
