var Client = require("./client");
var logger = require('../logger');

Connection = module.exports = require("./klass").create();

Connection.include({
  init: function(stream){
    this.stream     = stream;
    this.session_id = this.stream.id;
    this.client     = Client.inst(this);

    this.stream.on("message", this.proxy(this.onmessage));
    this.stream.on("disconnect", this.proxy(this.ondisconnect));
  },
  
  onmessage: function(data){
    logger.debug("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
    
      switch (message.type){
        case "subscribe":
          this.client.subscribe(message.getChannel());
        break;
        case "unsubscribe":
          this.client.unsubscribe(message.getChannel());
        break;
        case "meta":
          this.client.setMeta(message.data);
        break;
        case "event":
          this.client.event(message.data);
        break;
        default:
          throw "Unknown type";
      }
    } catch(e) { 
      logger.error("Error!");
      logger.error(e);
      return; 
    }
  },
  
  ondisconnect: function(){
    this.client.disconnect();
  },
  
  write: function(message){
    if (typeof message.toJSON == "function")
      message = message.toJSON();
    this.stream.send(message);
  }
});
