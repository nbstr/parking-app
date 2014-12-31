/*JQUERY BEHAVIOUR*/

/*SELECT TYPE OF PARKING @section#main-screen-to-park"*/


$(document).on('pageinit',function(){

	var $redirection,
//	$warning = '<span class="warning">Please select a type!</span>',
	$valueParkHere = $("#main-screen-to-park .btn-group div:first-child"),
	$discParking = $('.disc_off'),
	$meterParking =$('.meter_off');
    $('.greyed').css('opacity','0.5');

	/* START reinit with default values in case user goes back on #main-screen-to-park page*/

//	$("#main-screen-to-park .btn-group .warning").remove();
	$($valueParkHere).children().attr("href","");
	$($discParking).attr("src","images/img_disc_off.png");
	$($meterParking).attr("src","images/img_park_off.png");


	/*END reinit*/

	$($meterParking).on("tap",function(){

//		$("#main-screen-to-park .btn-group .warning").remove();
		$(this).attr("src","images/img_park_on.png");
		$(this).attr("alt","meter on");
		$($discParking).attr("src","images/img_disc_off.png");
		$($discParking).attr("alt","disc off");
		$redirection = "#park-here-meter";
        $($valueParkHere).children().attr("href",$redirection);
        $('.greyed').css('opacity','1.0');
//        location.href=$redirection;
		console.log("tapped");
	});

	$($discParking).on("tap",function(){

//		$("#main-screen-to-park .btn-group .warning").remove();
		$(this).attr("src","images/img_disc_on.png");
		$(this).attr("alt","disc on");
		$($meterParking).attr("alt","meter off");
		$($meterParking).attr("src","images/img_park_off.png");
		$redirection ="#park-here-disc";
        $($valueParkHere).children().attr("href",$redirection);
        $('.greyed').css('opacity','1.0');
		
	});

	$($valueParkHere).on("tap",function(){

		if($(this).children().attr("href")==""){
			$("#main-screen-to-park .btn-group span").remove();
//			$("#main-screen-to-park .btn-group").prepend($warning).find("span").hide().fadeIn("slow");
		}else{
//			$("#main-screen-to-park .btn-group .warning").remove();
		}
	});

});

/* Timer */ 

var timerBusy = false,
    t = 0,
    cpt=0;

 
function timer(count,interval){
    //interval is in milliseconds
    //if (!timerBusy){
        timerBusy = true;
        clearInterval();
        cpt = count;
        if (cpt>0 && interval>0){
            console.log("dobule in");
                t = setInterval(function(){
                    if(cpt>0){
                        cpt = cpt -1;
                        //console.log(cpt);
                        if(cpt>=60){
                            var x = 60,
                                y = cpt,
                                div = Math.floor(y/x),
                                rem = y % x;
                            $(".daTime").text(div+"h"+rem+"mins");
                        } else {
                            $(".daTime").text(cpt+"mins");
                            console.log(timerBusy);
                        }
                    } else {
                        window.clearInterval(t);
                        timerBusy = false;
                        console.log(timerBusy);
                        return;
                    }
                },interval);
        } else {
            console.log("count and interval must be >0");
        }
//    } else {
//        console.log("timer is already busy");
//    }
}



function resetCount(){
    window.clearInterval(t);
    timerBusy = false;
    console.log(timerBusy);
    $(".daTime").text("00:00");
    return;
}

function extendCount(xtra){
    cpt=xtra;
    window.clearInterval(t);
    timerBusy = false;
    console.log(timerBusy);
    timer(cpt,1000);
    return;
}

function apparitionDown(elem,time,enableLock,fn){
    time = time ? time : 600;
    /*
    useless now since the body is fixed
    //disableScroll();
    */
    $(elem).fadeIn(time);
    $(elem).find(".background").fadeIn(time);
    $(elem).find(".section").fadeIn(time);
    $(elem).find(".section").css('top','0');
}
function disparitionUp(elem,time){
    time = time ? time : 600;
    //if(isIE()<=9){
    //}
    $(elem).find(".background").fadeOut(time);
    $(elem).find(".section").fadeOut(time);
    $(elem).find(".section").css('top','-800px');
    $(elem).fadeOut(time);
    //console.log("DISPARTION: "+elem);
}

var geocoder;

function geoCode(adr){
    console.log(adr);
    if(window.deviceName && window.deviceName.toLowerCase()=="android"){
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': adr
        }, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {

                console.log(results);
                console.log(results[0].geometry.location.B);
                console.log(results[0].geometry.location.k);
                var long = results[0].geometry.location.B, 
                    lat = results[0].geometry.location.k;
                window.location.href="geo:"+lat+","+long+"?z=14&q="+adr;
            }else {
                alert("geo didnt work");
            }
        });
    }
    else{
        //window.open("maps://maps.apple.com/?q="+lat+","+long);
        window.location.href="maps:q="+adr;
    }

}

function codeLatLng(lat,lng) {
    console.log("entered codelatlng");
    console.log(lat + " " + lng);
    var latlng = new google.maps.LatLng(lat, lng);
    console.log(latlng);
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            console.log("GeocoderStatus.OK");
            if (results[0]) {
                window.cll=results[0];
                geoCode(results[0].formatted_address);
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}

function focusText(){
//    $('#park-here-notes').find('.redBtn').fadeOut();
    $('#park-here-notes').find('nav').fadeOut();
}


function blurText(){
//    $('#park-here-notes').find('.redBtn').fadeIn();
    $('#park-here-notes').find('nav').fadeIn();
}