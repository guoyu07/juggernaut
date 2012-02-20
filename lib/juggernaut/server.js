var http     = require("http");
var https    = require("https");
var path     = require("path");
var fs       = require("fs");
var io       = require("socket.io");
var Connection = require("./connection");
var express = require('express');
var conf = require('../../conf'),
    logger = require('../logger');

var credentials;
var keysPath = __dirname + "/keys";
if (path.existsSync(keysPath + "/privatekey.pem") && path.existsSync(keysPath + "/certificate.pem")) {
  var privateKey = fs.readFileSync(keysPath + "/privatekey.pem", "utf8");
  var certificate = fs.readFileSync(keysPath + "/certificate.pem", "utf8");
  credentials = {key: privateKey, cert: certificate};
}

Server = module.exports = require("./klass").create();

Server.include({
  init: function(){
    var app;
    if (credentials) {
      app = express.createServer(credentials);
    } else { 
      app = express.createServer();
    }
    app.configure(function() {
      app.use(express.logger(conf.devel ? 'dev' : 'tiny'));
      app.use(express.static(__dirname + '/../../public'));
      app.use(express.staticCache());
    });
    this.server = app;

    this.io = io.listen(this.server);
    if (!conf.devel)
      this.io.set('log level', 1);
    this.io.sockets.on("connection", function(stream){ Connection.inst(stream); });
  },

  listen: function(port){
    port = parseInt(port || process.env.PORT || 8080, 10);
    this.server.listen(port);
    logger.notice('Juggernaut listening on ' + port);
  }
});
