var Channel = require('./juggernaut/channel'),
    Message = require('./juggernaut/message'),
    metrics = require('metrics'),
    conf = require('../conf').metrics || {};

var trackedMetrics = {};
var reporters = [];

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
  var metricObjs = map(trackedMetrics, printMetric);
  reporters.forEach(function(reporter) {
    reporter(metricObjs);
  });
};

var interval = setInterval(report, (conf.reportInterval || 300) * 1000);

var checkConflict = function(name) {
  if (trackedMetrics[name] !== undefined) throw 'Duplicated metric name ' + name;
};

module.exports.createCounter = function(name) {
  checkConflict(name);
  var counter = trackedMetrics[name] = new metrics.Counter();
  return counter;
};

module.exports.createMeter = function(name) {
  checkConflict(name);
  var meter = trackedMetrics[name] = new metrics.Meter();
  return meter;
};

module.exports.addReporter = function(reporter) {
  reporters.push(reporter);
};

module.exports.removeReporter = function(reporter) {
  reporters.remove(reporter);
};
