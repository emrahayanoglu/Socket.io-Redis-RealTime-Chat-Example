var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

app.listen(8000);

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
	// inside if statement
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);

	redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

io.sockets.on('connection', function (client) {
	
	redis.subscribe("emrchat");
	
    redis.on("message", function(channel, message) {
        client.send(message);
    });

    client.on('message', function(msg) {
    });

    client.on('disconnect', function() {
        subsClient.quit();
    });
});