var Events = require("./events"),
    logger = require('../logger'),
    metrics = require('../metrics');

var meter = metrics.createMeter('messages');

Channel = module.exports = require("./klass").create();

Channel.extend({
  channels: {},
  
  find: function(name){
    if (!this.channels[name]) 
      this.channels[name] = Channel.inst(name);
    return this.channels[name];
  },
  
  publish: function(message){
    var channels = message.getChannels();
    delete message.channels;
    logger.debug('publishing to channels %s: %s', channels, message.data);

    channels.forEach(function(channel) {
      message.channel = channel;
      this.find(channel).clients.forEach(function(client) {
        client.write(message);
        meter.mark();
      });
    }, this);
  },
  
  unsubscribe: function(client){
    for (var name in this.channels)
      this.channels[name].unsubscribe(client);
  }
});

Channel.include({
  init: function(name){
    this.name    = name;
    this.clients = [];
  },
  
  subscribe: function(client){
    this.clients.push(client);
    Events.subscribe(this, client);
  },
  
  unsubscribe: function(client){
    if ( !this.clients.include(client) ) return;
    this.clients = this.clients.remove(client);
    Events.unsubscribe(this, client);
  }
});
