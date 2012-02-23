var Channel = require('./juggernaut/channel'),
    Message = require('./juggernaut/message'),
    conf = require('../conf');
    logger = require('./logger');

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
module.exports.notifyPost = function(req, res) {
  var channels, data;
  try {
    // validate request's authkey with configured authkeys
    validate(req, 'authkey', function(key) {
        return conf.authorizedKey[key] !== undefined;
      }, 'invalid auth key');
    channels = validateExistence(req, 'channels');
    data = validateExistence(req, 'data');
  } catch (e) {
    res.send({result: -1, message: e});
  }

  logger.debug('received notify request for channels ' + channels + ', data: ' + data);
  Channel.publish(new Message({channels: channels, data: data}));
  res.send({result: 1});
};

module.exports.healthCheck = function(req, res) {
  res.end('ok');
};
