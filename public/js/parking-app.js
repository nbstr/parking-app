/*JQUERY BEHAVIOUR*/

/*SELECT TYPE OF PARKING @section#main-screen-to-park"*/


$(document).on('pageinit',function(){

	var $redirection;
	var $warning = '<span class="warning">Please select a a type!</span>';
	var $valueParkHere = $("#main-screen-to-park .btn-group a:first-child");
	var $discParking = $('.disc_off');
	var $meterParking =$('.meter_off');

	/* START reinit with default values in case user goes back on #main-screen-to-park page*/

	$("#main-screen-to-park .btn-group .warning").remove();
	$($valueParkHere).attr("href","");
	$($discParking).attr("src","images/img_disc_off.png");
	$($meterParking).attr("src","images/img_park_off.png")


	/*END reinit*/

	$($meterParking).on("tap",function(){

		$(this).attr("src","images/img_park_on.png");
		$(this).attr("alt","meter on");
		$($discParking).attr("src","images/img_disc_off.png");
		$($discParking).attr("alt","disc off");
		$redirection = "#park-here-meter";
		$($valueParkHere).attr("href",$redirection);
		
	});

	$($discParking).on("tap",function(){
		
		$(this).attr("src","images/img_disc_on.png");
		$(this).attr("alt","disc on");
		$($meterParking).attr("alt","meter off");
		$($meterParking).attr("src","images/img_park_off.png");
		$redirection ="#park-here-disc";
		$("#main-screen-to-park .btn-group a:first-of-type").attr("href",$redirection);
		
	});

	$($valueParkHere).on("tap",function(){

		if($(this).attr("href")==""){
			$("#main-screen-to-park .btn-group span").remove();
			$("#main-screen-to-park .btn-group").prepend($warning).find("span").hide().fadeIn("slow");
		}else{
			$("#main-screen-to-park .btn-group .warning").remove();
		}
	});

});
