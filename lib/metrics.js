var metrics = require('metrics'),
    client = require('./client');

var counters = {};
var meters = {};

var map = function(obj, mapper) {
  var res = {};
  for (var key in obj)
    if (obj.hasOwnProperty(key))
      res[key] = mapper(obj[key]);
  return res;
};

var printMetric = function(metric) {
  return metric.printObj();
};

var report = function() {
  client.publish('metrics', {
    'counters': map(counters, printMetric),
    'meters': map(meters, printMetric)
  });
};

var interval = setInterval(report, 60*1000);

console.log('BOO');

module.exports.createCounter = function(name) {
  var counter = counters[name] = new metrics.Counter();
  return counter;
};

module.exports.createMeter = function(name) {
  var meter = meters[name] = new metrics.Meter();
  return meter;
};
