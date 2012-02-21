require("./ext/array");

var Publish = require("./publish");
var Server  = require("./server");
var metrics = require('../metrics');

module.exports.listen = function(port){
  Publish.listen();
  var server = Server.inst();
  server.listen(port);

  metrics.addReporter(function(trackedMetrics) {
    Channel.publish(new Message({
      channels: ['metrics'],
      data: trackedMetrics
    }));
  });
};
