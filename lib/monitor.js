'use strict';

var newRelic;

if(process.env.NODE_ENV === 'production'){
  newRelic = require('newrelic');
  console.log("New Relic monitoring started...");
}

module.exports = {
	newRelic: newRelic
};