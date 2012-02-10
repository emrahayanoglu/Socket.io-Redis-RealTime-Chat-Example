var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

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

//If you are using RedisToGo with Heroku
if (process.env.REDISTOGO_URL) {
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis1 = require("redis").createClient(rtg.port, rtg.hostname);
	var redis2 = require("redis").createClient(rtg.port, rtg.hostname);
	var redis3 = require("redis").createClient(rtg.port, rtg.hostname);

	redis1.auth(rtg.auth.split(":")[1]);
	redis2.auth(rtg.auth.split(":")[1]);
	redis3.auth(rtg.auth.split(":")[1]);
} else {
	//If you are using your own Redis server
  	var redis1 = require("redis").createClient();
	var redis2 = require("redis").createClient();
	var redis3 = require("redis").createClient();
}

io.sockets.on('connection', function (client) {
	
	redis1.subscribe("emrchat");
	
    redis1.on("message", function(channel, message) {
        client.send(message);
    });

    client.on('message', function(msg) {
		console.log(msg);
		if(msg.type == "chat"){
			redis2.publish("emrchat",msg.message);	
		}
		else if(msg.type == "setUsername"){
			redis2.publish("emrchat", "A New User is connected : " + msg.user);
			redis3.sadd("onlineUsers",msg.user);
		}
    });

    client.on('disconnect', function() {
        redis1.quit();
        redis2.publish("emrchat","User is disconnected : " + client.id);
    });
});