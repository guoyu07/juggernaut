var util = require('util');
var conf = require('../conf.js');
var redis;

module.exports.publish = function(channels, message) {
  if (!redis) {
    var redisConf = conf.redis || {};
    // init redis client for 1st use
    redis = require('redis').createClient(redisConf.port, redisConf.host);
  }

  var data = {
    channels: channels,
    data: message
  };
  client.publish('juggernaut', JSON.stringify(data));
};
