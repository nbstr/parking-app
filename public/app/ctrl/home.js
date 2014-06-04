function HomeCtrl($scope, $sckt, $geo, $http){

	// PARK HERE

	$scope.park = function(){
		console.log('client/park');
	};

	// REPORT CONTROLLER

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
			$scope.thank_you();
		});
	};

	// THANK YOU FOR REPORTING

	$scope.thank_you = function(){
		$('#block-home').fadeOut(500, function(){
			$('#block-thanks').fadeIn(500);
		});
	};

	// YOU'RE WELCOME

	$scope.youre_welcome = function(){
		$('#block-thanks').fadeOut(500, function(){
			$('#block-home').fadeIn(500);
		});
	};

	// OK CONTROLLER

	$scope.ok = function(){
		$('#block-warning, .mask').fadeOut(500);
	};

	$scope.init = function(){
		$scope.parking = {
			type:true // true:disc, false:parkmeter
		}
	}
	$scope.init();
}