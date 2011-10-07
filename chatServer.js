var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var port = process.env.PORT || 5000;
console.log("Listening on " + port);
 
app.listen(port);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

if (process.env.REDISTOGO_URL) {
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);

	redis.auth(rtg.auth.split(":")[1]);
} else {
  	var redis1 = require("redis").createClient();
	var redis2 = require("redis").createClient();
}

io.sockets.on('connection', function (client) {
	
	redis1.subscribe("emrchat");
	
    redis1.on("message", function(channel, message) {
        client.send(message);
    });

    client.on('message', function(msg) {
		redis2.publish("emrchat",msg);
    });

    client.on('disconnect', function() {
        redis1.quit();
    });
});