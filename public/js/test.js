$(function() {

  var host = '118.102.1.139';
  var port = 80;
  var urlPrefix = 'http://' + host + ':' + port;

  var now = function() { return (new Date()).getTime(); };

  var postMetric = function(data) {
    $.post(urlPrefix + '/metric', {'multimetrics': data});
  };

  var jug = new Juggernaut({
    host: host,
    port: port
  });

  var random = 'channel-' + Math.floor(Math.random() * 100000);
  var before = now();
  var connectTime, notifyTime, latency;
  var connected = false;

  jug.on('connect', function() {
    connectTime = now() - before;
    connected = true;
    console.log('juggernaut connected after ' + connectTime + ' ms');
  });

  jug.on('disconnect', function() {
    console.log('juggernaut disconnected');
    connected = false;
  });

  jug.subscribe(random, function(data) {
    if (data === random) {
      latency = now() - before;
      jug.unsubscribe(random);
      console.log('test finished, notification received after ' + latency + ' ms');
      postMetric({
        establishConnection: connectTime,
        notifyTime: notifyTime,
        notificationLatency: latency
      });
    }
  });

  var interval = setInterval(function() {
    if (connected) {
      before = now();
      $.post(urlPrefix + '/notify/' + random, {authkey: 'testkey', data: random},
        function() { 
          notifyTime = now() - before;
          console.log('notify request completed after ' + notifyTime + ' ms');
        });
      clearInterval(interval);
    }
  }, 2000);
});
