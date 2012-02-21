var redis   = require("./redis");
var Message = require("./message");
var Channel = require("./channel");
var logger = require('../logger'),
    metrics = require('../metrics');


Publish = module.exports = {};
Publish.listen = function(){
  this.client = redis.createClient();
  
  this.client.on("message", function(_, data) {
    logger.debug("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
      Channel.publish(message);
    } catch(e) { return; }
  });
  
  this.client.subscribe("juggernaut");
};
