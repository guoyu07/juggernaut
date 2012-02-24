var metrics = require('metrics'),
    conf = require('../conf').metrics || {};

var Metrics = module.exports = {};

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

Metrics.addReporter = function(reporter) {
  reporters.push(reporter);
};

Metrics.removeReporter = function(reporter) {
  reporters.remove(reporter);
};

Metrics.snapshot = function(name) {
  if (!name)
    return map(trackedMetrics, printMetric);
  if (trackedMetrics[name])
    return trackedMetrics[name].printObj();
  return undefined;
};

Metrics.createCounter = function(name) {
  checkConflict(name);
  var counter = trackedMetrics[name] = new metrics.Counter();
  return counter;
};

Metrics.createMeter = function(name) {
  checkConflict(name);
  var meter = trackedMetrics[name] = new metrics.Meter();
  return meter;
};

Metrics.createHistogram = function(name) {
  checkConflict(name);
  // double the default sample size of histogram
  var hist = trackedMetrics[name] = metrics.Histogram.createUniformHistogram(2056);
  return hist;
};

Metrics.createTimer = function(name) {
  checkConflict(name);
  var timer = trackedMetrics[name] = new metrics.Timer();
  return timer;
};

Metrics.getTimer = function(name) {
  var timer = trackedMetrics[name];
  if (!timer)
    timer = trackedMetrics[name] = new metrics.Timer();
  return timer;
};
