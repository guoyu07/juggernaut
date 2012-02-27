var http     = require("http");
var https    = require("https");
var path     = require("path");
var fs       = require("fs");
var io       = require("socket.io");
var Connection = require("./connection");
var express = require('express');
var ejs = require('ejs');
var conf = require('../../conf'),
    logger = require('../logger'),
    routes = require('../routes');

var credentials;
var keysPath = __dirname + "/keys";
if (path.existsSync(keysPath + "/privatekey.pem") && path.existsSync(keysPath + "/certificate.pem")) {
  var privateKey = fs.readFileSync(keysPath + "/privatekey.pem", "utf8");
  var certificate = fs.readFileSync(keysPath + "/certificate.pem", "utf8");
  credentials = {key: privateKey, cert: certificate};
}

Server = module.exports = require("./klass").create();

var initServer = function(app) {
  app.register('.html', ejs);
  app.set('views', __dirname + '/../../views');
  app.set('view engine', 'html');
  app.use(express.logger(conf.devel ? 'dev' : 'tiny'));
  app.use(express.static(__dirname + '/../../public'));
  app.use(express.staticCache());
  app.use(express.bodyParser());
  app.set('view options', {pretty: true, layout: false});
  routes.map(app);
};

var initSocketio = function(io) {
  if (!conf.devel) {
    io.set('log level', 1);
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
  }

  if (conf.io) {
    for(var key in conf.io) {
      logger.debug(key + ':' + conf.io[key]);
      io.set(key, conf.io[key]);
    }
  }
};

Server.include({
  init: function(){
    var app;
    if (credentials) {
      app = express.createServer(credentials);
    } else { 
      app = express.createServer();
    }
    initServer(app);
    this.server = app;

    this.io = io.listen(this.server);
    initSocketio(this.io);
    this.io.sockets.on("connection", function(stream){ Connection.inst(stream); });
  },

  listen: function(port){
    port = parseInt(port || process.env.PORT || 8080, 10);
    this.server.listen(port);
    logger.notice('Juggernaut listening on ' + port);
  }
});
