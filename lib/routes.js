var conf = require('../conf'),
    client = require('./client'),
    metrics = require('./metrics'),
    logger = require('./logger');

module.exports.map = function(app) {
  app.post('/notify/:channels?', notify);
  app.get('/health', health);
  app.post('/metric/:metric?', postMetric);
  app.get('/metric/:metric?', getMetric);
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


// handle POST request to /notify
// allow messeage publishing over simple HTTP call
function notify(req, res) {
  var channels, data;
  try {
    // validate request's authkey with configured authkeys
    validate(req, 'authkey', function(key) {
        return conf.authorizedKey[key] !== undefined;
      }, 'invalid auth key');
    channels = validateExistence(req, 'channels');
    data = validateExistence(req, 'data');
  } catch (e) {
    res.send({result: -1, message: e}, 400);
    return;
  }

  logger.debug('received notify request for channels ' + channels + ', data: ' + data);
  
  client.publish(channels, data);
  res.send({result: 1});
}


// simple health check for juggernaut
function health(req, res) {
  res.end('ok');
}


// metrics collector, primarily used for testing
function postMetric(req, res) {
  // multiple metrics
  var multiMetrics = req.param('multimetrics');
  if (multiMetrics) {
    var data = multiMetrics;
    for (var key in data) {
      if (data.hasOwnProperty(key))
        metrics.getTimer(key).update(parseInt(data[key], 10));
    }
    res.send({result: 1});
    return;
  }

  // single metric
  var metric, value;
  try {
    metric = validateExistence(req, 'metric');
    value = parseInt(validateExistence(req, 'value'), 10);
  } catch (e) {
    res.send({result: -1, message: e}, 400);
    return;
  }

  metrics.getTimer(metric).update(value);
  res.send({result: 1});
}

function getMetric(req, res) {
  var metric = req.param('metric');
  var snapshot = metrics.snapshot(metric);
  if (snapshot)
    res.send(snapshot);
  else
    res.send('not found', 404);
}
