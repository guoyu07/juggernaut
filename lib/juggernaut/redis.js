var conf = require('../../conf.js');
var util = require("util");
var url = require("url");
var redis = require("redis");

module.exports.createClient = function(){
  var client;
  
  if (process.env.REDISTOGO_URL) {
    var address = url.parse(process.env.REDISTOGO_URL);
    client = redis.createClient(address.port, address.hostname);
    client.auth(address.auth.split(":")[1]);
  } else {
    var redisConf = conf.redis || {};
    client = redis.createClient(redisConf.port, redisConf.host);
  }
  
  // Prevent redis calling exit
  client.on("error", function(error){
    util.error(error);
  });
  
  return client;
};
