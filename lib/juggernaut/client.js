var Channel = require("./channel");
var Events  = require("./events");
var logger = require('../logger');

Client = module.exports = require("./klass").create();

var count = 0;

Client.include({
  init: function(conn){
    this.connection = conn;
    this.session_id = this.connection.session_id;
    count++;
    logger.debug('new client connected, total ' + count + ' clients');
  },
  
  setMeta: function(value){
    this.meta = value;
  },
  
  event: function(data){
    Events.custom(this, data);
  },
  
  subscribe: function(name){
    logger.debug("Client subscribing to: " + name);
    
    var channel = Channel.find(name);
    channel.subscribe(this);
  },
  
  unsubscribe: function(name){
    logger.debug("Client unsubscribing from: " + name);

    var channel = Channel.find(name);
    channel.unsubscribe(this);
  },
    
  write: function(message){
    if (message.except) {
      var except = Array.makeArray(message.except);
      if (except.include(this.session_id))
        return false;
    }
    
    this.connection.write(message);
  },
  
  disconnect: function(){
    // Unsubscribe from all channels
    Channel.unsubscribe(this);
    count--;
  },

  count: function() {
    return count;
  }

});
