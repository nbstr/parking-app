/*JQUERY BEHAVIOUR*/

/*SELECT TYPE OF PARKING*/

/* change image when button icon is clicked, from inactive to active */


/*
$(document).ready(function(){
}); NOT GOOD FOR JQUERYMOBILE*/

$(document).on('pageinit',function(){

	var $redirection;

	$('.meter_off').on("tap",function(){
		$(this).attr("src","images/img_park_on.png");
		$('.disc_off').attr("src","images/img_disc_off.png");
		$redirection = "#park-here-meter";
		$("#main-screen-to-park .btn-group a:first-child").attr("href",$redirection);
	});

	$('.disc_off').on("tap",function(){
		$(this).attr("src","images/img_disc_on.png");
		$('.meter_off').attr("src","images/img_park_off.png");
		$redirection ="#park-here-disc";
		$("#main-screen-to-park .btn-group a:first-child").attr("href",$redirection);
	});

});