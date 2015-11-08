var redis = require('redis');
var config = require('./config.json');
//console.log(config);

var arr = Object.keys(config).map(function(k) { return config[k] });
//console.log(arr[0].listener);

var subscriber = redis.createClient(6379, 'localhost' , {no_ready_check: true});
subscriber.on('connect', function() {
    console.log('Connected to Subscriber Redis');
});

var publisher = redis.createClient(6379, 'localhost' , {no_ready_check: true});
publisher.on('connect', function() {
    console.log('Connected to Publisher Redis');
});



subscriber.on("message", function(channel, message) {
  console.log("Got message" + message);
	messageEvent = JSON.parse(message);
	console.log(messageEvent);

	origin_from_message = messageEvent.origin;
	event_from_message = messageEvent.event;

	console.log("Origin-"+  origin_from_message);
	console.log("Event-" + event_from_message);

	for(var key in arr){
    console.log("Origin :" + arr[key].origin );
    console.log("Event :"+ arr[key].event);
		if((origin_from_message == arr[key].origin) && (event_from_message == arr[key].event)){

			console.log("Origin :" + arr[key].origin );
			console.log("Inside Redis :"+ arr[key].listener);
			publisher.publish(arr[key].listener, JSON.stringify(messageEvent));

			}

	}
	});

subscriber.subscribe("RI");