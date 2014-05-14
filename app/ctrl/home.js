function HomeCtrl($scope, $sckt, $geo, $http){
	$scope.park = function(){
		console.log('client/park');
	};
	$scope.report = function(){
		$geo.position(function(position){
			// SET DATA
			var data = {
				coord:{
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    acr: position.coords.accuracy
                }
			};
			$sckt.push('report', data);
		});
	};
	$scope.init = function(){
		//
	}
	$scope.init();
}