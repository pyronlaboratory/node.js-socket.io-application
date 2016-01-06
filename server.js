var mongo = require('mongodb').MongoClient,
	 client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/testing',function(err, db){
	if (err) throw err;
	
	client.on('connection',function(socket){

		var col = db.collection('message'),
		   sendStatus = function(s){
			socket.emit('status',s);
		   };

		//emit all messages
		col.find().limit(5).sort({_id: 1}).toArray(function(err,res) {
			if(err) throw err;
			socket.emit('output',res);
		});

		//wait for input
		socket.on('input',function(data){
			var name = data.name,
			    message = data.message;
			var whitespacePattern = /^\s*$/;

			if(whitespacePattern.test(name)|| whitespacePattern.test(message)){
				    sendStatus('Delivery failed');
			} else {
				col.insert({name:name, message:message}, function(){

					//emit latest message to ALL clients
					client.emit('output',[data]);
					
					sendStatus({
						message:"Message sent",
						clear:true
					});
				});
			}

		});
	});
});
