module.exports = function(io, db) {

	io.configure(function () {
		io.set('authorization', function (handshakeData, callback) {
			// CHECK FOR AUTH
			callback(null, true);

		});
	});

	io.sockets.on('connection', function (socket) {

		// console.log(socket.handshake);

		socket.on('hello', function (data) {
			socket.handshake.user = data;
	    });

	    socket.on('report', function (data) {

	    	// STORE REPORT
	    	var store_data = {
	    		time:new Date().getTime(),
	    		user_ip:socket.handshake.address.address,
	    		localisation:data
	    		};
	    	var duplicate = {
	    			user_ip:socket.handshake.address.address
	    		}

	    	db.collection('reports').find(duplicate).toArray(function (error, items) {

		        var store = true;
	        	var time = new Date().getTime();

	        	for(var report in items){
	        		if(time - items[report].time < 1000 * 2){
	        			// LAST REPORT WAS LESS THAN 1000 * 60 * 5 MILLISECONDS (5 MIN)
	        			// IGNORE
	        			store = false;
	        			break;
	        		}
	        	}
	        	if(store){
	        		db.collection('reports').insert(store_data, function(error, result){
				        // broadcast an alert
						socket.broadcast.emit('alert:controller', data);
						console.log(socket.broadcast.manager.sockets.sockets);
						//console.log('emitted from ' + socket.handshake.user.city);
				    });
	        	}

		    });
	    });
	});
};
