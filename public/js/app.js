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
        disparitionUp($('.dialog-geo'));
        $rootScope.geoFinished = false;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success,null,{
                enableHighAccuracy: true, timeout: 5000});
        }
    };
    
    $rootScope.getPositionAgain= function(){
        setTimeout($rootScope.getPosition(), 3000);
    }
    
    function success(position){
        $rootScope.position = position;
        console.log($rootScope.position);
        window.position = $rootScope.position;
        $rootScope.geoFinished = true;
        console.log($rootScope.geoFinished);
        $rootScope.writeToPhone("_geoCoords",$rootScope.position.coords.latitude+'::'+$rootScope.position.coords.longitude);// LONG::LAT -> coord.split("::")
        if ($rootScope.position.coords.accuracy > 20){
            $('.dialog-geo').find('h1').text("The accuracy of your position is: "+$rootScope.position.coords.accuracy.toFixed(2)+"m. Good enough? (Turn your gps on!)");
            apparitionDown($('.dialog-geo'));
        } else {
            console.log("<10");
        }
    }
    
    $rootScope.gmaps = function(){
        console.log($rootScope.lat + " -- " + $rootScope.long);
        $rootScope.latlng = new google.maps.LatLng($rootScope.lat,$rootScope.long);
        console.log($rootScope.latlng);
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

    $rootScope.loadLastCurrentData=function(){
        //load currentData from a file written somewhere on the phone 
        CordovaService.ready.then(function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $rootScope.gotFSReader, $rootScope.fail);
        });
    }
    $rootScope.writeData=function(data){
        $rootScope.currentData={};
        $rootScope.currentData=data;
//        if($rootScope.currentData.telephone)
//            $rootScope.currentData.phone=phoneTel($rootScope.currentData.telephone);
        CordovaService.ready.then(function() {
            console.log("CordovaService Ready.");
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $rootScope.gotFS, $rootScope.fail);
        });
    }
    
    $rootScope.writeDatouz=function(){
        CordovaService.ready.then(function() {
            console.log("CordovaService Ready.");
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
                console.log(evt.target.result);
                $rootScope.loadLast($('textarea'),$rootScope.currentData);
                console.log($rootScope.currentData);
                window.rscd=$rootScope.currentData;
                $rootScope.firstLoad=false;
                console.log("Read completed.");
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
    
//    function a(){
//        //action of function a
//        console.log("Ulysse");
//    }
//    function b(param1,param2){
//        console.log(param1);
//        //other actions of function b...
//        //...
//        if(typeof(param2)=='function'){
//            param2();
//        }
//    }
//    var c="bonjour";
//    b(c,a);
    
    $rootScope.jsonWriteData=function(key,value){
        console.log("Entered jsonWriteData");
        var tmp = JSON.stringify($rootScope.currentData);
        console.log($rootScope.currentData);
        console.log(tmp);
        if (tmp==="{}"){
            console.log(1);
            tmp = '{"'+key+'":"'+value+'"}';
            $rootScope.writeData(JSON.parse(tmp));
        } else {
            if (tmp.indexOf(key)== -1){
                console.log(2);
                prepend = tmp.slice(0,tmp.length-1);
                tmp = prepend + ',"'+key+'":"'+value+'"}';
                console.log(tmp);
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
//            console.log($rootScope.lat);
//            console.log($rootScope.long);
        }
        if (value._activePage && ($.mobile.activePage.attr( "id" )=="main-screen-to-park")){
            if (value._activePage!="main-screen-to-park"){
                window.location.href="#"+value._activePage;
            } else {
                console.log(value._activePage);
//                window.location.href="#main-screen-to-park";
            }
        }
        console.log("Finshed loadLAst");
    }
    
    $rootScope.goToCar=function(){
        console.log("entered go to car");
//        if(window.deviceName && window.deviceName.toLowerCase()=="android"){
//            console.log("is android");
//            var maplink = "geo:"+$rootScope.lat+","+$rootScope.long;
//            console.log(maplink);
//            //window.location.href=maplink;
//            window.open("http://maps.google.com/?q=" + $rootScope.lat+","+$rootScope.long, "_system");
//        } else {
//            console.log("isn't android");
//            window.location.href="maps:q="+$rootScope.lat+","+$rootScope.long;
//        }
        var adr = codeLatLng($rootScope.lat,$rootScope.long);
        //var adr = codeLatLng(50.4589405,4.868409);
//        console.log(adr);
//        window.adr=adr;
//        geoCode(adr);
    }
    
//    $rootScope.goToCar=function(){
//
//        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + $rootScope.lat + ',' + $rootScope.long)
//        .error(function(response){
//            console.error(response);
//        })
//        .then(function(response){
//            window.response = response;
//            //response.
//        });
//    }
    
    $(document).on( "pagechange", function( event ) {
        console.log($.mobile.activePage.attr( "id" ));
        if ($rootScope.firstLoad==false){
            $rootScope.writeToPhone("_activePage",$.mobile.activePage.attr( "id" ));
        }
    });
    
    $rootScope.init = function () {
        var geocoder;
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
    };
    $rootScope.init();            
}]);