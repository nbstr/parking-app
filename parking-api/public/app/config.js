var config = {};

// FRONT END ENVIRONMENTS
function set_environment(url){
	// BASE URLS USED
	config.socket = url; // SOCKET
}

var $environments = {
	// SETS DEFAULT ENVIRONMENT, IF NOT RECOGNIZED
	default:'remote',
	// DEFINES CURRENT HOST
	host:location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/",
	// ENVIRONMENTS
	local:{
		url:'http://192.168.17.6:3000'
	},
	remote:{
		url:'http://188.226.249.240:3000'
	}
};

// DEFAULT SETTINGS
set_environment($environments[$environments.default].url);

// AUTOMATICALLY DETECTS AND SETS ENVIRONMENT
(function Environment(){
	for(environment in $environments){
		if($environments.host == $environments[environment].host){
			set_environment($environments[environment].url);
			break;
		}
	}
})();