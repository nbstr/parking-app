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

.run(function($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
            $rootScope.online = false;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
            $rootScope.online = true;
        });
    }, false);
})

.run(['$rootScope','CordovaService','$http', function($rootScope,CordovaService,$http) {
    
    $rootScope.geoFinished = false;
    
    $rootScope.reallyTime = function() {
        parkCount();
        $rootScope.geoFinished = false;
        $rootScope.getPosition();
    };
    
    $rootScope.reallyTimer = function(a,b) {
        timer(a,b);
        $rootScope.geoFinished = false;
        $rootScope.getPosition();
    };
    
    $rootScope.getPosition = function(){
        $rootScope.geoFinished = false;
        if (navigator.geolocation) {
            //navigator.geolocation.getCurrentPosition(success,null,{
            $rootScope.id = navigator.geolocation.watchPosition(success,null,{
                enableHighAccuracy: true, timeout: 5000});
        }
    };
    
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
        });
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
        $rootScope.bluetoothStartDiscovery();
    }
    
    $rootScope.bluetoothStartDiscovery = function(){
        CordovaService.ready.then(function() {
            window.bluetooth.startDiscovery($rootScope.onDeviceDiscovered,$rootScope.onDiscoveryFinished,$rootScope.onError,null);//last is options
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
                $rootScope.currentData={};
                $rootScope.currentData=JSON.parse(evt.target.result);
                $rootScope.loadLast($('textarea'),$rootScope.currentData);
//                console.log($rootScope.currentData);
                window.rscd=$rootScope.currentData;
                $rootScope.firstLoad=false;
//                console.log("Read completed.");
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
//            console.log("Write completed.");
//            if ($rootScope.key!=="" && $rootScope.value!==""){
//                $rootScope.jsonWriteData($rootScope.key,$rootScope.value);
//            }
        };
        writer.write(JSON.stringify($rootScope.currentData));
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
//                console.log(prepend);
//                console.log(change);
//                console.log(append);
//                console.log(tmp);
                $rootScope.writeData(JSON.parse(tmp));
            }
        }
        
        $rootScope.key="";
        $rootScope.value="";
        
        console.log("jsonWriteData finished.");
    }
    
    $rootScope.writeToPhone=function(key,value){
        console.log("Entered writeToPhone");
        $rootScope.key=key;
        if (typeof(value) == "string" && value.charAt(0)!="."){
            console.log(value);
            console.log(value.charAt(0));
            $rootScope.value=value;
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
    
    $rootScope.init = function () {
        var geocoder;
        $rootScope.devicesMap=[];
        $rootScope.firstLoad=true;
        $rootScope.angularLoaded=true; 
        console.log("coucou angular");
        $rootScope.currentData={};
        $rootScope.key="";
        $rootScope.value="";
        $rootScope.lat="";
        $rootScope.long="";
        $rootScope.getDeviceName();
        $rootScope.loadLastCurrentData();
        //$rootScope.bluetoothInit();
        $rootScope.bluetoothIsEnabled();
        $rootScope.bluetoothToggleOn();
    };
    $rootScope.init();            
}]);