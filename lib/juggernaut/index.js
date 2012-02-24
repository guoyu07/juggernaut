require("./ext/array");

var Publish = require("./publish");
var Server  = require("./server");
var metrics = require('../metrics');
var redis = require('./redis').createClient();

module.exports.listen = function(port){
  Publish.listen();
  var server = Server.inst();
  server.listen(port);

  metrics.addReporter(function(trackedMetrics) {
    // publish metrics data to channel `metrics`
    Channel.publish(new Message({
      channels: ['metrics'],
      data: trackedMetrics
    }));
    // save metrics data to redis
    redis.set('juggernaut-metrics', JSON.stringify(trackedMetrics));
  });

};
