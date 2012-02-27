var util = require('util'),
    querystring = require('querystring');

var conf = require('../conf'),
    client = require('./client'),
    metrics = require('./metrics'),
    logger = require('./logger');

var ok = 'ok';

module.exports.map = function(app) {
  app.get('/', index);
  app.post('/notify/:channels?', notify);
  app.options('/notify/:channels?', allowCORS);
  app.get('/health', health);
  app.post('/metric/:metric?', postMetric);
  app.get('/metric/:metric?', getMetric);
  app.options('/metric/:metric?', allowCORS);
};

var validate = function(req, param, check, msg) {
  var paramValue = req.param(param);
  if (!check(paramValue)) throw msg;
  return paramValue;
};

var validateExistence = function(req, param) {
  return validate(req, param, function(value) {
    return value !== undefined;
  }, 'no ' + param);
};

// set headers of the response to allow Cross-Origin Resource Sharing
var prepareResponseForCORS = function(res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
};

// display index page
function index(req, res) {
  res.render('index', {
    metrics: metrics.snapshot()
  });
}

// Properly set the headers of the response to allow Cross-Origin Resource Sharing.
// This function is mainly for handling OPTIONS request.
function allowCORS(req, res) {
  prepareResponseForCORS(res);
  res.end();
}

// handle POST request to /notify
// allow messeage publishing over simple HTTP call
function notify(req, res) {
  prepareResponseForCORS(res);
  var channels, data;
  try {
    // validate request's authkey with configured authkeys
    validate(req, 'authkey', function(key) {
        return conf.authorizedKey[key] !== undefined;
      }, 'invalid auth key');
    channels = validateExistence(req, 'channels');
    data = validateExistence(req, 'data');
  } catch (e) {
    res.send(e, 400);
    return;
  }

  logger.debug('received notify request for channels ' + channels + ', data: ' + data);
  client.publish(channels, data);
  res.send(ok);
}


// simple health check for juggernaut
// mostly for monit checking
function health(req, res) {
  res.end(ok);
}


// metrics collector, primarily used for testing

// post a metric value to server
function postMetric(req, res) {
  prepareResponseForCORS(res);
  // multiple metrics
  var multiMetrics = req.param('multimetrics');
  if (multiMetrics) {
    var data = querystring.parse(multiMetrics);
    for (var key in data) {
      if (data.hasOwnProperty(key))
        metrics.getTimer(key).update(parseInt(data[key], 10));
    }
    res.send(ok);
    return;
  }

  // single metric
  var metric, value;
  try {
    metric = validateExistence(req, 'metric');
    value = parseInt(validateExistence(req, 'value'), 10);
  } catch (e) {
    res.send(e, 400);
    return;
  }

  metrics.getTimer(metric).update(value);
  res.send(ok);
}

// get current data of a metric
function getMetric(req, res) {
  prepareResponseForCORS(res);
  var metric = req.param('metric');
  var snapshot = metrics.snapshot(metric);
  if (snapshot)
    res.send(snapshot);
  else
    res.send('not found', 404);
}
