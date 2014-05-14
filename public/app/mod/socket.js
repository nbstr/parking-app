angular.module('Socket', [])
/*
|--------------------------------------------------------
| SOCKETS
|--------------------------------------------------------
*/
.factory('$sckt', function($rootScope, $geo){
    if(io != undefined){
        var socket = io.connect(config.socket);

        socket.on("alert:controller", function(data) {
            $geo.position(function(position){
                distance = $geo.distance({
                    // alert position
                    lat:data.coord.lat,
                    lng:data.coord.lng
                },
                {
                    // current position
                    lat:position.coords.latitude,
                    lng:position.coords.longitude
                });
                console.log(distance);
                if(true){ // if(distance < 20){
                    alert('WARNING: Controller reported at ' + distance + ' m');
                    console.log('my coord: ' + position.coords.latitude + ', ' + position.coords.longitude);
                    console.log('his coord: ' + data.coord.lat + ', ' + data.coord.lng);
                    console.log('distance: ' + distance + 'm');
                }
            });
        });

        return {
            push: function(message, data){
                if(message != undefined && data != undefined){
                    socket.emit(message, data);
                }
            },
            pull: function(message, callback){ 
                if(typeof(callback) === 'function' && message != undefined){
                    socket.on(message, callback());
                }
            }
        }

    }
})
.factory('$geo', function($rootScope){

    return {
        position:function (success){
            // check whether browser supports geolocation api
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(success, this.position_error, { enableHighAccuracy: true });
            }
            else{
                console.error("Your browser does not support geolocation. We advise you to update it.");
            }
        },
        position_error:function(error){

            var errors = {
                1: "Permission denied.",
                2: "Position unavailable.",
                3: "Connection timeout."
            };

            console.error("Error:" + errors[error.code]);
        },
        distance:function (p1, p2){
            var point1 = new google.maps.LatLng(p1.lat, p1.lng);
            var point2 = new google.maps.LatLng(p2.lat, p2.lng);
            return parseInt(google.maps.geometry.spherical.computeDistanceBetween(point1, point2));
        }
    }
});