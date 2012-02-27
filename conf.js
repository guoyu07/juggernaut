var conf = {};

// Accept connection on specified port.
// By default, juggernaut will listen on port 8080
conf.port = 8080;

// Set to true to run juggernaut as a daemon
// by default when daemonized
conf.daemonized = false;

// by default, juggernaut will write a pid file in /var/run/juggernaut.pid
conf.pidfile = '/var/run/juggernaut.pid';

// set to true for verbose logging
conf.devel = true;

// full path of log file or stdout for logging to std output
conf.logfile = 'stdout';

// socket.io config
conf.io = {
  'transports': ['htmlfile', 'xhr-polling', 'jsonp-polling'],
  'polling duration': 60,
  'heartbeat interval': 60
};

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

var path = require('path');
var systemConfig = '/etc/juggernaut/conf.js';
if (__filename !== systemConfig && path.existsSync(systemConfig)) {
  // load the global config if exists
  module.exports = require(systemConfig);
} else {
  module.exports = conf;
}

