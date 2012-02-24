var url = require("url");
var redis = require("redis");
var conf = require('../../conf'),
    logger = require('../logger');

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
    logger.error('%s', error);
  });
  
  return client;
};
