angular.module('app', [])
/*
|--------------------------------------------------------
| ROOTSCOPE
|--------------------------------------------------------
*/

.service('CordovaService', ['$document', '$q',
 function($document, $q) {

     var d = $q.defer(),
         resolved = false;

     var self = this;
     this.ready = d.promise;

     $(document).ready(function() {
         document.addEventListener('deviceready', function() {
             resolved = true;
             d.resolve(window.cordova);
         });
     });

     // Check to make sure we didn't miss the 
     // event (just in case)
     setTimeout(function() {
         if (!resolved) {
             if (window.cordova) d.resolve(window.cordova);
         }
     }, 3000);
 }])

.run(['$window','$rootScope','CordovaService','$http', function($window,$rootScope,CordovaService,$http) {
    
    $rootScope.geoFinished = false;
    
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
            $rootScope.online = false;
//            alert("online");
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
            $rootScope.online = true;
//            alert("offline");
        });
    }, false);
    
//    $rootScope.reallyTime = function() {
//        parkCount();
//        $rootScope.geoFinished = false;
//        $rootScope.getPosition();
//    };
    
    /* Get an input value and put it in the timer */
    
    var compareImputs = function(){
        if ($("input[name='timeStartParkMeter']").val()!="" && $("input[name='timeEndParkMeter']").val()!=""){
            return [$("input[name='timeStartParkMeter']").val(),$("input[name='timeEndParkMeter']").val()];
        } else if($("input[name='timeStartBlue']").val()!="") {
            return $("input[name='timeStartBlue']").val();
        } else if ($("input[name='timeStartRed']").val()!="") {
            return $("input[name='timeStartRed']").val();
        } else {
            return ("sry");
        }
    }
    
    var resetInputs = function(){
        $("input[name='timeStartParkMeter']").val("");
        $("input[name='timeEndParkMeter']").val("");
        $("input[name='timeStartBlue']").val("");
    }
    
    var getTotMins = function(h,m){
        var hh = parseInt(h),
            mm = parseInt(m);
        //console.log(hh);
        //console.log(mm);
        return (hh*60)+mm;
    }
    
    var getTimeDiff = function(tot1,tot2){
        if (tot1>=tot2){
            return tot1-tot2;
        } else {
//            console.log(tot2-tot1);
//            console.log((24*60)-(tot2-tot1));
            return (24*60)-(tot2-tot1);
        }
    }

    $rootScope.parkCount= function(count){
        var split,tot1,tot2,total;
        resetCount();
        console.log(compareImputs());
        if (compareImputs().length==2){
//            console.log("disssssss");
//            console.log(compareImputs());
            split = compareImputs()[0].split(":");
            tot1=getTotMins(split[0],split[1]);
            $rootScope.pkStart = $rootScope.toRegDate(split[0],split[1]);
            console.log($rootScope.pkStart);
            split = compareImputs()[1].split(":");
            tot2=getTotMins(split[0],split[1]);
            $rootScope.pkStop = $rootScope.toRegDate(split[0],split[1]);
            console.log($rootScope.pkStop);
            console.log(tot1+" "+tot2+" "+getTimeDiff(tot1,tot2));
            
            total=getTimeDiff(tot1,tot2);
            timer(total,1000);
            resetInputs();
        } else {
            if (compareImputs()!="sry"){
                split=compareImputs().split(":");
                tot1 = getTotMins(split[0],split[1]);
                $rootScope.pkStart = $rootScope.toRegDate(split[0],split[1]);
                var d = new Date();
                tot2 = getTotMins((d.getHours()),(d.getMinutes()));
                tot1 = getTimeDiff(tot1,tot2);
            } else {
                tot1 = 0;
            }
            total=count+tot1;
            timer(total,1000); 
            resetInputs();
        }
        $rootScope.notificationCancelAll();
        if (total>30){
            $rootScope.allAlerts(1,"Time's nearly up!","There is 30 mins left!",(total-30)*1000);
        }
        $rootScope.allAlerts(2,"Time's nearly up!","There is only 5 mins left!",(total-5)*1000);
        
    }
    
    $rootScope.reallyTimer = function(count) {
        $rootScope.parkCount(count);
        $rootScope.geoFinished = false;
        $rootScope.getPosition();
        //$rootScope.toRegDate($rootScope.h,$rootScope.m);
    };
    
    $rootScope.getPosition = function(){
        $rootScope.geoFinished = false;
        if (navigator.geolocation) {
            //navigator.geolocation.getCurrentPosition(success,null,{
            $rootScope.id = navigator.geolocation.watchPosition(success,null,{
                enableHighAccuracy: true, timeout: 5000});
        }
    };
    
    $rootScope.dontGetPositionAgain= function(){
        disparitionUp($('.dialog-geo'));
        $rootScope.clearGPS();
    }
    
    $rootScope.getPositionAgain= function(){
        disparitionUp($('.dialog-geo'));
        setTimeout(function(){ $rootScope.getPosition() }, 1000);
    }
    
    function success(position){
        $rootScope.position = position;
//        console.log($rootScope.position);
        window.position = $rootScope.position;
        $rootScope.geoFinished = true;
//        console.log($rootScope.geoFinished);
        $rootScope.lat=$rootScope.position.coords.latitude;
        $rootScope.long=$rootScope.position.coords.longitude;
        $rootScope.writeToPhone("_geoCoords",$rootScope.position.coords.latitude+'::'+$rootScope.position.coords.longitude);// LONG::LAT -> coord.split("::")
        if ($rootScope.position.coords.accuracy > 20){
            $('.dialog-geo').find('h1').text("The accuracy of your position is: "+$rootScope.position.coords.accuracy.toFixed(2)+"m. Good enough? (Turn your gps on!)");
            apparitionDown($('.dialog-geo'));
        } else {
            $rootScope.clearGPS();
            console.log("<10");
        }
    }
    
    
    $rootScope.clearGPS = function(){
        navigator.geolocation.clearWatch($rootScope.id);
        disparitionUp('.dialog-geo');
        console.log("gps cleared");
    }
    
    $rootScope.gmaps = function(){
//        console.log($rootScope.lat + " -- " + $rootScope.long);
        $rootScope.latlng = new google.maps.LatLng($rootScope.lat,$rootScope.long);
//        console.log($rootScope.latlng);
        var mapOptions = {
            zoom: 14,
            center: $rootScope.latlng,
            disableDefaultUI:true,
        };
        var map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);
        $('#map_canvas').css('height', window.innerHeight).css('width', window.innerWidth); 
        google.maps.event.addDomListener(window, "resize", function() {
            $('#map_canvas').css('height', window.innerHeight).css('width', window.innerWidth); 
        });

        var marker = new google.maps.Marker({
            map: map,
            position: $rootScope.latlng
        });
    }
    
    $(document).on("pageshow", "#map", function( event ){
        $rootScope.gmaps();
        //$('#map_canvas').css('height', window.innerHeight).css('width', window.innerWidth);
        console.log("map loaded");
    });
    
    //ios,  android?
    $rootScope.getDeviceName=function(){
        CordovaService.ready.then(function() {
            window.deviceName=device.platform;
            $rootScope.devUUID=device.uuid;
            console.log("dev uuid : "+$rootScope.devUUID);
            $rootScope.registerUUID();
        });
    }
    
    /*Back-end coms*/
    
//    $rootScope.registerNewUserWithoutFacebook = function(){
//        $http.post('http://ticketescape.m4kers.com/users', $rootScope.dataObject)
//        .success(function(data, status, headers, config) {
//            console.log("succescallback");
//            console.log(data);
//            console.log(status);
//            console.log(headers);
//            console.log(config);
//        })
//        .error(function(data, status, headers, config) {
//            console.log("errorcallback");
//            console.log(data);
//            console.log(status);
//            console.log(headers);
//            console.log(config);
//        });
//    }
    
    $rootScope.doComsList = function(){
        console.log("docmomlsk");
        console.log($rootScope.comsList);
        while ($rootScope.comsList.length){
            var task=$rootScope.comsList.shift();
            if (task.func == 'regzone'){
                $rootScope.pkStart=task.time1;
                $rootScope.pkStop=task.time2;
                $rootScope.registerZone(task.color);
            } else if (task.func == 'uuid'){
                $rootScope.registerUUID();
            }
            console.log($rootScope.comsList);
        }
    }
//    [
//        {
//            "date":"...",
//            "func":"...",
//            "data":{...}
//        }
//    ]
    
    $rootScope.comsList = [
        //        function(){ console.log("this is function: a") },
        //        function(){ console.log("this is function: b") },
        //        function(){ console.log("this is function: c")},
        //        function(){$rootScope.toRegDate('12','34')},
        //        function(){$rootScope.registerZone('green')}
    ];
    
    $rootScope.storeComsList = function() {
        $rootScope.writeToPhone('_comsList',$rootScope.comsList);
    }
    
//    function(data){
//        //...
//    }

    //use angular interval
//    window.setInterval(function(){
//        console.log("interval");
//        $rootScope.loadLastCurrentData();
////        console.log($rootScope.online);
////        console.log($rootScope.comsList);
//        if ($rootScope.online==true && $rootScope.comsList.length>0){
//            $rootScope.doComsList();
//        }
//    }, 10000);//make loner before release
    
    $rootScope.registerRegID = function(regid){
        if ($rootScope.online==true){
            var post_data = {'device_token':$rootScope.devUUID,'device_notification_token':regid,'app_name':'TicketEscape_droid'};
            console.log(post_data);
            $http.post('http://ticketescape.m4kers.com/users/registration_id', post_data)
            .success(function(data, status, headers, config) {
                console.log("succescallback");
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            })
            .error(function(data, status, headers, config) {
                console.log("errorcallback");
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            });
        } else {
            $rootScope.comsList.push({'func':'regid'});
            $rootScope.storeComsList();
        }
    }
    
    $rootScope.registerUUID = function(){
        if ($rootScope.online==true){
            var post_data = {'device_token':$rootScope.devUUID};
            console.log(post_data);
            $http.post('http://ticketescape.m4kers.com/users', post_data)
            .success(function(data, status, headers, config) {
                console.log("succescallback");
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            })
            .error(function(data, status, headers, config) {
                console.log("errorcallback");
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            });
        } else {
            $rootScope.comsList.push({'func':'uuid'});
            $rootScope.storeComsList();
        }
    }
    
    $rootScope.registerZone = function(color){
//        if(time1==undefined){
//            time1="undefined";
//        }
//        if(time2=undefined){
//            time2="undefined";
//        }
        var d = new Date();
        $rootScope.color = color;
        if ($rootScope.online==true){
            var post_data;
            if (color=="green"){
                post_data = {
                    'geo_lat':$rootScope.lat,
                    'geo_lon':$rootScope.long,
                    'zone':'green'
                };
                console.log(post_data);
                $http.post('http://ticketescape.m4kers.com/parking', post_data)
                .success(function(data, status, headers, config) {
                    console.log("succescallback");
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                })
                .error(function(data, status, headers, config) {
                    console.log("errorcallback");
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                    console.log("error, puttin in array");
                    $rootScope.comsList.push({'func':'regzone','color':color,'time1':$rootScope.pkStart,'time2':$rootScope.pkStop});
                    $rootScope.storeComsList();
                });
            } else if(color=="blue"){
                if($rootScope.pkStart==undefined){
                    $rootScope.pkStart=$rootScope.toRegDate(d.getHours(),d.getMinutes());
                }
                post_data = {
                    'geo_lat':$rootScope.lat,
                    'geo_lon':$rootScope.long,
                    'zone':'blue',
                    'timestamp_start':$rootScope.pkStart
                };
                console.log(post_data);
                $http.post('http://ticketescape.m4kers.com/parking', post_data)
                .success(function(data, status, headers, config) {
                    console.log("succescallback");
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                })
                .error(function(data, status, headers, config) {
                    console.log("errorcallback");
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                    console.log("error, puttin in array");
                    $rootScope.comsList.push({'func':'regzone','color':color,'time1':$rootScope.pkStart,'time2':$rootScope.pkStop});
                    $rootScope.storeComsList();
                });
            } else if(color=="orange"){
                if($rootScope.pkStart==undefined){
                    $rootScope.pkStart=$rootScope.toRegDate(d.getHours(),d.getMinutes());
                }
                if($rootScope.pkStop=undefined){
                    $rootScope.pkStop="undefined";
                }
                post_data = {
                    'geo_lat':$rootScope.lat,
                    'geo_lon':$rootScope.long,
                    'zone':'blue',
                    'timestamp_start':$rootScope.pkStart,
                    'timestamp_end':$rootScope.pkStop
                };
                console.log(post_data);
                $http.post('http://ticketescape.m4kers.com/parking', post_data)
                .success(function(data, status, headers, config) {
                    console.log("succescallback");
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                })
                .error(function(data, status, headers, config) {
                    console.log("errorcallback");
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                    console.log("error, puttin in array");
                    $rootScope.comsList.push({'func':'regzone','color':color,'time1':$rootScope.pkStart,'time2':$rootScope.pkStop});
                    $rootScope.storeComsList();
                });
            }
        } else {
//            $rootScope.comsList.push(function(){$rootScope.registerZone(color)});
            console.log("offline, puttin in array");
            $rootScope.comsList.push({'func':'regzone','color':color,'time1':$rootScope.pkStart,'time2':$rootScope.pkStop});
            $rootScope.storeComsList();
        }

    }
    
    /*"normal" offline notifications*/
    
    function alertDismissed() {
        alert("Dismissed!");
    }
    
    $rootScope.allAlerts = function(id,title,text,timeInMilliseconds){
        setTimeout(function(){
            //$rootScope.playBeep();
            $rootScope.vibrate();
            var d = new Date();
            $rootScope.notificationAdd(id,title,text);
        },timeInMilliseconds);
    }
    
    $rootScope.showAlert = function() {
        console.log("should show alert");
        navigator.notification.alert(
            'You are the winner!',  // message
            alertDismissed,         // callback
            'Game Over',            // title
            'Done'                  // buttonName
        );
    }
    
    $rootScope.playBeep = function() {
        console.log("should play beep");
        navigator.notification.beep(3);
    }

    $rootScope.vibrate = function() {
        console.log("should vibrate");
        navigator.notification.vibrate(2000);
    }
    
    /*to ontification tray*/
    
    $rootScope.notificationCancelAll = function() {
        window.plugin.notification.local.cancelAll(function () {
            // All notifications have been cancelled
            console.log("canceled all");
        });
    }

    $rootScope.notificationAdd=function(id,title,message){
        CordovaService.ready.then(function() {
            window.plugin.notification.local.add({
                id:         id,  // A unique id of the notification
//                date:       date,    // This expects a date object
                message:    message,  // The message that is displayed
                title:      title,  // The title of the message
//                repeat:     String,  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
//                badge:      Number,  // Displays number badge to notification
//                sound:      String,  // A sound to be played
//                json:       "",  // Data to be passed through the notification
                autoCancel: true, // Setting this flag and the notification is automatically cancelled when the user clicks it
                ongoing:    false, // Prevent clearing of notification (Android only)
            });
//            window.plugin.notification.local.add({ message: message });
        });
    }
    
    $rootScope.notificationhasPermission=function(){
        CordovaService.ready.then(function() {
            window.plugin.notification.local.hasPermission(function (granted) {
                console.log('Permission has been granted: ' + granted);

                console.log(window.plugin.notification.local);
            });
        });
    }
    
//    $rootScope.notificationRegisterPermission=function(){
//        CordovaService.ready.then(function() {
//            window.plugin.notification.local.registerPermission(function (granted) {
//                console.log('Permission has been granted: ' + granted);
//            });
//        });
//    }
    
    /*Push Notifications*/
    
    var pushNotification;
    
    $rootScope.pushInit=function(){
        CordovaService.ready.then(function() {
            document.addEventListener("deviceready", function(){
                pushNotification = window.plugins.pushNotification;
            });
        })
    }
    
    $rootScope.pushRegister=function(){
        CordovaService.ready.then(function() {
//            $("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
            console.log(' registering ' + device.platform);
            if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
                console.log("is an android");
                pushNotification.register(
                    $rootScope.successHandler,
                    $rootScope.errorHandler,
                    {
                        "senderID":"1041626889289",
                        "ecb":"onNotification"
                    });
            } else if ( device.platform == 'blackberry10'){
                pushNotification.register(
                    $rootScope.successHandler,
                    $rootScope.errorHandler,
                    {
                        invokeTargetId : "replace_with_invoke_target_id",
                        appId: "replace_with_app_id",
                        ppgUrl:"replace_with_ppg_url", //remove for BES pushes
                        ecb: "pushNotificationHandler",
                        simChangeCallback: replace_with_simChange_callback,
                        pushTransportReadyCallback: replace_with_pushTransportReady_callback,
                        launchApplicationOnPush: true
                    });
            } else {
                pushNotification.register(
                    $rootScope.tokenHandler,
                    $rootScope.errorHandler,
                    {
                        "badge":"true",
                        "sound":"true",
                        "alert":"true",
                        "ecb":"onNotificationAPN"
                    });
            }
        })
    }
    
    //might have to register/unregister for each interactions
    
    $rootScope.successHandler = function(result) {
        console.log('result = ' + result);
    }
    
    $rootScope.errorHandler = function(error) {
        console.log('error = ' + error);
    }
    
    // Android and Amazon Fire OS
    window.onNotification = function(e) {
        //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
        console.log("app status 'received' :"+ e.event);

        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
//                    $("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                    console.log("app status 'registered' :"+ e.regid);
                    // Your GCM push server needs to know the regID before it can push to this device
                    // here is where you might want to send it the regID for later use.
                    console.log("regID = " + e.regid);
                    $rootScope.registerRegID(e.regid);
                }
                break;

            case 'message':
                // if this flag is set, this notification happened while we were in the foreground.
                // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                if ( e.foreground )
                {
//                    $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                    console.log("app status 'inline notification' :"+ e.regid);
                    

                    // on Android soundname is outside the payload.
                    // On Amazon FireOS all custom attributes are contained within payload
                    var soundfile = e.soundname || e.payload.sound;
                    // if the notification contains a soundname, play it.
                    var my_media = new Media("/android_asset/www/"+ soundfile);
                    my_media.play();
                }
                else
                {  // otherwise we were launched because the user touched a notification in the notification tray.
                    if ( e.coldstart )
                    {
                        //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                        console.log("COLDSTART NOTIFICATION");
                    }
                    else
                    {
//                        $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                        console.log("BACKGROUND NOTIFICATION");
                    }
                }

//                $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
                console.log('MESSAGE -> MSG: ' + e.payload.message);
                //Only works for GCM
//                $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
                console.log('MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '');
                //Only works on Amazon Fire OS
//                $status.append('<li>MESSAGE -> TIME: ' + e.payload.timeStamp + '</li>');
                console.log('MESSAGE -> TIME: ' + e.payload.timeStamp + '');
                break;

            case 'error':
//                $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
                console.log('ERROR -> MSG:' + e.msg + '');
                break;

            default:
//                $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
                console.log('EVENT -> Unknown, an event was received and we do not know what it is');
                break;
        }
    }
    
    // iOS
    function onNotificationAPN (event) {
        if ( event.alert )
        {
            navigator.notification.alert(event.alert);
        }

        if ( event.sound )
        {
            var snd = new Media(event.sound);
            snd.play();
        }

        if ( event.badge )
        {
            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        }
    }
    
    $rootScope.tokenHandler = function(result) {
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
        alert('device token = ' + result);
    }

    
    /*Bluetooth Logic*/
    
//    //initialize bluetooth
//    $rootScope.bluetoothInit=function(){
//        CordovaService.ready.then(function() {
//            bluetoothle.initialize($rootScope.initializeSuccess, $rootScope.initializeError, {
//                "request": true,
//                "statusReceiver": true
//            });
//        });
//    }
//    
//    $rootScope.initializeSuccess = function(success){
//        console.log(success);
//        $rootScope.bluetoothStartScan();
//    }
//    $rootScope.initializeError = function(error){
//        console.log(error);
//    }
//    
//    //enable bluetooth
//    //only android
//    $rootScope.bluetoothEnable=function(){
//        CordovaService.ready.then(function() {
//            bluetoothle.enable(enableSuccess, enableError);
//        });
//    }
//
//    //enable bluetooth
//    //only android
//    $rootScope.bluetoothDisable=function(){
//        CordovaService.ready.then(function() {
//            bluetoothle.disable(disableSuccess, disableError);
//        });
//    }
//
//    //scan for bluetooth
//    $rootScope.bluetoothStartScan=function(){
//        CordovaService.ready.then(function() {
//            setTimeout(function(){ 
//                bluetoothle.startScan($rootScope.startScanSuccess, $rootScope.startScanError, {
//                    "serviceUuids": []
//                }); 
//                
//            }, 3000);
//        });
//    }
//
//    $rootScope.startScanSuccess = function(success){
//        //        setTimeout(function(){ 
//        console.log("Scanning");
//        console.log(success);
//        console.log($rootScope.bluetoothIsScanning());
//        $rootScope.bluetoothDiscover();
//        //            console.log(a.status); 
//        //            console.log(a.advertisement);
//        //            console.log(a.rssi);
//        //            console.log(a.name);
//        //            console.log(a.address);
//        //        }, 3000);
//    }
//    $rootScope.startScanError = function(error){
//        console.log(error);
//    }
//
//    $rootScope.bluetoothIsScanning=function(){
//        CordovaService.ready.then(function() {
//            bluetoothle.isScanning($rootScope.isScanning);
//        });
//    }
//
//    $rootScope.isScanning = function(a){
//        console.log(a.status);
//    }
//    
//    //android
//    $rootScope.bluetoothDiscover=function(){
//        CordovaService.ready.then(function() {
//            bluetoothle.discover($rootScope.discoverSuccess, $rootScope.discoverError);
//        });
//    }
//    
//    $rootScope.discoverSuccess = function(devices,services,characteristics,descriptors){
//        console.log(devices);
//        console.log(services);
//        console.log(characteristics);
//        console.log(descriptors);
//    }
//    
//    $rootScope.discoverError = function(a){
//        console.log(a);
//    }
//
//    //enable bluetooth
//    //only android
//    $rootScope.bluetoothStopScan=function(){
//        CordovaService.ready.then(function() {
//            bluetoothle.stopScan(stopScanSuccess, stopScanError);
//        });
//    }
//
//    //scan for bluetooth
//    //    $rootScope.bluetoothStartScan=function(){
//    //        CordovaService.ready.then(function() {
//    //            setTimeout(function(){ 
//    //                bluetoothle.connect(connectSuccess, connectError, params);
//    //            }, 5000);
//    //        });
//    //    }
//    $rootScope.bluetoothConnect=function(adr){
//        CordovaService.ready.then(function() {
//            setTimeout(function(adr){ 
//                bluetoothle.connect(connectSuccess, connectError, adr);
//            }, 5000);
//        });
//    }
    
//    $rootScope.bluetoothToWindowInit=function(){
//        //load currentData from a file written somewhere on the phone 
//        CordovaService.ready.then(function() {
//            window.bluetooth = cordova.require("cordova/plugin/bluetooth");
//        });
//    }
    
    $rootScope.bluetoothIsEnabled = function(){
        CordovaService.ready.then(function() {
            window.bluetooth.enable($rootScope.isEnabled,$rootScope.onError);
        });
    }
    
    $rootScope.isEnabled = function(isOk){
        console.log(isOk);
    }
    
    $rootScope.onError = function(error){
        console.log(error);
    }
    
    $rootScope.bluetoothToggleOn = function(){
        CordovaService.ready.then(function() {
            window.bluetooth.enable($rootScope.blSuccess,$rootScope.onError);
        });
    }
    
    $rootScope.blSuccess = function(){
        console.log("bluetooth successfully turned on");
        $rootScope.bluetoothStartDiscovery(null);
    }
    
    $rootScope.bluetoothStartDiscovery = function(options){
        CordovaService.ready.then(function() {
            window.bluetooth.startDiscovery($rootScope.onDeviceDiscovered,$rootScope.onDiscoveryFinished,$rootScope.onError,options);//last is options
        });
    }
    
    $rootScope.onDeviceDiscovered = function(discoveredDevice){
        console.log("a device was discovered");
        console.log(discoveredDevice.name);
        console.log(discoveredDevice.address);
        $rootScope.devicesMap[discoveredDevice.name]=discoveredDevice.address;
    }
    
    $rootScope.onDiscoveryFinished = function(){
        console.log("dicovery finished with success");
        console.log("map:");
        console.log($rootScope.devicesMap);
        //$rootScope.bluetoothPair();
    }
    
    $rootScope.bluetoothIsPaired = function(address){
        CordovaService.ready.then(function() {
            window.bluetooth.isPaired($rootScope.onResult, $rootScope.onError, address)
        });
    }
    
    $rootScope.onResult = function(a){
        console.log("on Result");
        console.log(a);
    }
    
    $rootScope.bluetoothPair = function(address){
        CordovaService.ready.then(function() {
            window.bluetooth.pair($rootScope.onDevicePaired, $rootScope.onError, address)
        });
    }
    
    $rootScope.onDevicePaired = function(a){
        console.log("device paired?");
        console.log(a);
    }

    $rootScope.bluetoothPair = function(){
        //atm we know device, how will we know which mac adresses are buzzers?
        //
        CordovaService.ready.then(function() {
            for (var key in $rootScope.devicesMap) {
                //alert("key : " + key + " value : " + myMap[key]);
                if ($rootScope.devicesMap[key]=="98:D3:31:90:13:D5"){
                    window.bluetooth.pair($rootScope.onPairSuccess,$rootScope.onError,$rootScope.devicesMap[key]);
                }
            }
        });
    }
    
    $rootScope.onPairSuccess = function(a){
        console.log("Pair sucessfull");
        console.log(a);
    }
    
    $rootScope.bluetoothIsConnected = function(address){
        CordovaService.ready.then(function() {
            window.bluetooth.isConnected($rootScope.onResult, $rootScope.onError)
        });
    }
    
    $rootScope.bluetoothIsConnectionManaged = function(address){
        CordovaService.ready.then(function() {
            window.bluetooth.isConnectionManaged($rootScope.onResult, $rootScope.onError)
        });
    }
    
    $rootScope.bluetoothConnect = function(options){
        CordovaService.ready.then(function() {
            window.bluetooth.connect($rootScope.onBluetoothConnected, $rootScope.onError, options)
        });
    }
    
    $rootScope.onBluetoothConnected = function(a){
        console.log("isConnected?");
        console.log(a);
    }
    
    /*Read / Write/ Load logic*/
    $rootScope.loadLastCurrentData=function(){
        //load currentData from a file written somewhere on the phone 
        CordovaService.ready.then(function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $rootScope.gotFSReader, $rootScope.fail);
        });
    }
    $rootScope.writeData=function(data){
        $rootScope.currentData={};
        $rootScope.currentData=data;
        CordovaService.ready.then(function() {
//            console.log("CordovaService Ready.");
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $rootScope.gotFS, $rootScope.fail);
        });
    }
    
    $rootScope.writeDatouz=function(){
        CordovaService.ready.then(function() {
//            console.log("CordovaService Ready.");
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $rootScope.gotFS, $rootScope.fail);
        });
    }


    //File Reader
    $rootScope.gotFSReader=function(fileSystem) {
        fileSystem.root.getFile(config.savedFile, null, $rootScope.gotFileEntryReader, $rootScope.fail);
    }

    $rootScope.gotFileEntryReader=function(fileEntry) {
        fileEntry.file($rootScope.gotFile, $rootScope.fail);
    }

    $rootScope.gotFile=function(file){
        $rootScope.readData(file);
    }

    $rootScope.readData=function(file,func) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Entered Read.");
            $rootScope.$apply(function(){
                console.log(evt.target.result);
                $rootScope.currentData={};
                if (evt.target.result){
                    $rootScope.currentData=JSON.parse(evt.target.result);
                $rootScope.loadLast($('textarea'),$rootScope.currentData);
//                console.log($rootScope.currentData);
//                window.rscd=$rootScope.currentData;
                }
                $rootScope.firstLoad=false;
            });
        };
        reader.readAsText(file);
        
    }

    //File Writer
    $rootScope.gotFS=function(fileSystem) {
        fileSystem.root.getFile(config.savedFile, {create: true, exclusive: false}, $rootScope.gotFileEntry, $rootScope.fail);
    }

    $rootScope.gotFileEntry=function(fileEntry) {
        fileEntry.createWriter($rootScope.gotFileWriter, $rootScope.fail);
    }

    $rootScope.gotFileWriter=function(writer) {
        writer.onwriteend = function(evt) {
            //file written
//            console.log("Entered Write.");
//            console.log("***");
//            console.log(evt);
//            console.log("***");
//            console.log($rootScope.currentData);
//            console.log(JSON.stringify($rootScope.currentData));
        };
        writer.write(JSON.stringify($rootScope.currentData));
//        writer.write(($rootScope.currentData));
    }
    
    //Handle error
    $rootScope.fail=function(error) {
        if(error.code==1){
            console.log("Error: file not found exception");
        }
        else if(error.code==2){
            console.log("Error: invalid url error");
        }
        else{
            console.log("Error: connection error");
        }
    }
    
    $rootScope.jsonWriteData=function(key,value){
        console.log("Entered jsonWriteData");
        var tmp = JSON.stringify($rootScope.currentData);
        //console.log($rootScope.currentData);
        //console.log(tmp);
        if (tmp==="{}"){
            console.log(1);
            tmp = '{"'+key+'":"'+value+'"}';
            $rootScope.writeData(JSON.parse(tmp));
        } else {
            if (tmp.indexOf(key)== -1){
                console.log(2);
                prepend = tmp.slice(0,tmp.length-1);
                tmp = prepend + ',"'+key+'":"'+value+'"}';
//                console.log(tmp);
                window.tmp=tmp;
                $rootScope.writeData(JSON.parse(tmp));
            } else {
                console.log(3);
                var prepend = tmp.slice(0,tmp.indexOf(key)+key.length+3),
                    change = value,
                    afterChange = tmp.slice(tmp.indexOf(key)+key.length+3,tmp.length),
                    append = afterChange.slice(afterChange.indexOf('"'),tmp.length);
                tmp = prepend + change + append;
                console.log(prepend);
                console.log(change);
                console.log(append);
                console.log(tmp);
                $rootScope.writeData(JSON.parse(tmp));
//                $rootScope.writeData(tmp);
            }
        }
        
        $rootScope.key="";
        $rootScope.value="";
        
        console.log("jsonWriteData finished.");
    }
    
    $rootScope.writeToPhone=function(key,value){
        var comString ="";
        console.log("Entered writeToPhone");
        $rootScope.key=key;
        if (typeof(value) == "string" && value.charAt(0)!="."){
            console.log(value);
            console.log(value.charAt(0));
            $rootScope.value=value;
        } else if(value.constructor === Array){
            console.log("its an array");
            for (var test=0;test<value.length;test++){
                console.log(value[test]);
                comString += JSON.stringify(value[test]);
//                var tez = comString.replace('"',"'");
//                $rootScope.value=comString;
                var tez = "'" + comString + "'";
                $rootScope.value=tez;
            }
            console.log(comString);
        } else {
            $rootScope.value=$(value).val();
        }
        $rootScope.jsonWriteData($rootScope.key,$rootScope.value);
        console.log("writeToPhone finished.");
    }
    
    $rootScope.loadLast=function(target,value){
        console.log("Entered loadLAst");
        if (value._pkNotes){
            target.val(value._pkNotes);
        }
        if (value._geoCoords){
            var temp = value._geoCoords.split('::');
            $rootScope.lat=parseFloat(temp[0]);
            $rootScope.long=parseFloat(temp[1]);
            $rootScope.geoFinished = true;
//            console.log($rootScope.lat);
//            console.log($rootScope.long);
        }
        if (value._activePage && ($.mobile.activePage.attr( "id" )=="main-screen-to-park")){
            if (value._activePage!="main-screen-to-park"){
                window.location.href="#"+value._activePage;
            } else {
                //console.log(value._activePage);
            }
        }
        if (value._comsList){
            $rootScope.comsList=value._comsList;
        }
        console.log("Finshed loadLAst");
    }
    
    $rootScope.goToCar=function(){
        console.log("entered go to car");

        var adr = codeLatLng($rootScope.lat,$rootScope.long);
    }
    
    $(document).on( "pagechange", function( event ) {
        console.log($.mobile.activePage.attr( "id" ));
        if ($rootScope.firstLoad==false){
            $rootScope.writeToPhone("_activePage",$.mobile.activePage.attr( "id" ));
        }
    });
    
    $rootScope.toRegDate = function(h,m){
        //2014-12-30 11:55:59
        var hh=h,mm=m;
        console.log();
        var today = new Date();
        console.log("tiiiime");
//        if (h<10){
//            hh='0'+h;
//        }
//        if (m<10){
//            mm='0'+m;
//        }
        console.log(today.getFullYear()+'-'+today.getMonth()+'-'+today.getDay()+' '+hh+':'+mm+':00');
        return today.getFullYear()+'-'+today.getMonth()+'-'+today.getDay()+' '+h+':'+m+':00';
    }
    
    
    
    $rootScope.init = function () {
        var geocoder;
        $rootScope.getDeviceName();
        //TESTMODE//
        //$rootScope.devUUID='testDeviceID';
        //TESTMODE//
        $rootScope.registerUUID();
        $rootScope.devicesMap=[];
        //$rootScope.initRegister();
        //$rootScope.registerSubmit();
        //$rootScope.registerNewUserWithoutFacebook();
        $rootScope.firstLoad=true;
        $rootScope.angularLoaded=true; 
        console.log("coucou angular");
        $rootScope.currentData={};
        $rootScope.key="";
        $rootScope.value="";
        $rootScope.lat="";
        $rootScope.long="";
        $rootScope.loadLastCurrentData();
        //$rootScope.bluetoothInit();
        $rootScope.bluetoothIsEnabled();
        $rootScope.bluetoothToggleOn();
        $rootScope.notificationhasPermission();
//        $rootScope.notificationRegisterPermission();
        //showAlert();
        $rootScope.pushInit();
        $rootScope.pushRegister();
    };
    $rootScope.init();            
}]);