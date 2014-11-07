/*JQUERY BEHAVIOUR*/

/*SELECT TYPE OF PARKING @section#main-screen-to-park"*/


$(document).on('pageinit',function(){

	var $redirection,
	$warning = '<span class="warning">Please select a type!</span>',
	$valueParkHere = $("#main-screen-to-park .btn-group div:first-child"),
	$discParking = $('.disc_off'),
	$meterParking =$('.meter_off');

	/* START reinit with default values in case user goes back on #main-screen-to-park page*/

	$("#main-screen-to-park .btn-group .warning").remove();
	$($valueParkHere).children().attr("href","");
	$($discParking).attr("src","images/img_disc_off.png");
	$($meterParking).attr("src","images/img_park_off.png");


	/*END reinit*/

	$($meterParking).on("tap",function(){

		$("#main-screen-to-park .btn-group .warning").remove();
		$(this).attr("src","images/img_park_on.png");
		$(this).attr("alt","meter on");
		$($discParking).attr("src","images/img_disc_off.png");
		$($discParking).attr("alt","disc off");
		$redirection = "#park-here-meter";
        $($valueParkHere).children().attr("href",$redirection);
//        location.href=$redirection;
		console.log("tapped");
	});

	$($discParking).on("tap",function(){

		$("#main-screen-to-park .btn-group .warning").remove();
		$(this).attr("src","images/img_disc_on.png");
		$(this).attr("alt","disc on");
		$($meterParking).attr("alt","meter off");
		$($meterParking).attr("src","images/img_park_off.png");
		$redirection ="#park-here-disc";
        $($valueParkHere).children().attr("href",$redirection);
		
	});

	$($valueParkHere).on("tap",function(){

		if($(this).children().attr("href")==""){
			$("#main-screen-to-park .btn-group span").remove();
			$("#main-screen-to-park .btn-group").prepend($warning).find("span").hide().fadeIn("slow");
		}else{
			$("#main-screen-to-park .btn-group .warning").remove();
		}
	});

});

/* Timer */ 

var timerBusy = false,
    t = 0,
    cpt=0;

 
function timer(count,interval){
    //interval is in milliseconds
    if (!timerBusy){
        timerBusy = true;
        clearInterval();
        cpt = count;
        if (cpt>0 && interval>0){
            console.log("dobule in");
                t = setInterval(function(){
                    if(cpt>0){
                        cpt = cpt -1;
                        console.log(cpt);
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
    } else {
        console.log("timer is already busy");
    }
}

/* Get an input value and put it in the timer */

function parkCount(){
    var theTime = $("input[type='time']").val(),
        timeArray = $("input[type='time']").val().split(":"),
        h = parseInt(timeArray[0]),
        m = parseInt(timeArray[1]),
        tot = h*60+m;

    timer(tot,1000);
}

function resetCount(){
    window.clearInterval(t);
    timerBusy = false;
    console.log(timerBusy);
    $(".daTime").text("00:00");
    return;
}

function extendCount(){
    cpt=cpt+15;
    window.clearInterval(t);
    timerBusy = false;
    console.log(timerBusy);
    timer(cpt,1000);
    return;
}