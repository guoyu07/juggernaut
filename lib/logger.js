var Log = require('log'),
    conf = require('../conf.js');

var level = conf.devel ? 'debug' : 'notice';

var stream = process.stdout;
if (conf.logfile && conf.logfile != 'stdout') {
  stream = require('fs').createWriteStream(conf.logfile, { flags: 'a'});
}

module.exports = new Log(level, stream);

