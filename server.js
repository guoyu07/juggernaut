#!/usr/bin/env node

var util = require("util"),
    fs = require('fs'),
    path = require('path'),
    conf = require('./conf');

var pidfile = conf.pidfile;

// start server
Juggernaut = require("./index");
Juggernaut.listen(conf.port);

// write pid file
fs.writeFileSync(pidfile, process.pid);

// try to remove the pid file on exit
var prepareExit = function(err) {
  if (path.existsSync(pidfile))
    fs.unlinkSync(pidfile);
  process.exit(err? 1 : 0);
};

process.on('SIGINT', prepareExit);
process.on('SIGTERM', prepareExit);
process.on('uncaughtException', prepareExit);
