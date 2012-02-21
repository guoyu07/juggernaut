module.exports = conf = {};

// set to true for verbose logging
conf.devel = true;

// full path of log file or stdout for logging to std output
conf.logfile = 'stdout';

// redis server config
conf.redis = {
  host: 'localhost',
  port: 6379
};

// authorised private key of known publisher
// only authorised publisher is able to publish message throught /pub/ API.
conf.authorizedKey = {
  // key: description
  'testkey': 'key for internal testing of service'
};

// metrics config
conf.metrics = {
  // reporting interval, in second
  reportInterval: 60
};
