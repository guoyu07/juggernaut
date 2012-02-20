var util = require('util');
var redis = require('redis');
var conf = require('../conf.js');
var redisConf = conf.redis || {};

var client;

module.exports.publish = function(channels, message) {
  if (!client) {
    // init redis client for 1st use
    client = redis.createClient(redisConf.port, redisConf.host);
  }

  var data = {
    channels: channels,
    data: message
  };
  client.publish('juggernaut', JSON.stringify(data));
};
