/*JQUERY BEHAVIOUR*/

/*SELECT TYPE OF PARKING*/

/* change image when button icon is clicked, from inactive to active */


$(document).on('pageinit',function(){

	var $redirection;
	var $warning = '<p class="warning">Please select a a type!</p>';
	var $valueParkHere = $("#main-screen-to-park .btn-group a:first-child");


	$('.meter_off').on("tap",function(){
		$("#main-screen-to park .btn-group .warning").detach();
		$(this).attr("src","images/img_park_on.png");
		$('.disc_off').attr("src","images/img_disc_off.png");
		$redirection = "#park-here-meter";
		$($valueParkHere).attr("href",$redirection);
		
	});

	$('.disc_off').on("tap",function(){
		
		$(this).attr("src","images/img_disc_on.png");
		$('.meter_off').attr("src","images/img_park_off.png");
		$redirection ="#park-here-disc";
		$("#main-screen-to-park .btn-group a:first-of-type").attr("href",$redirection);
		
	});

	$($valueParkHere).on("tap",function(){

		if($(this).attr("href")==""){
			$("#main-screen-to-park .btn-group p").remove();
			$("#main-screen-to-park .btn-group").prepend($warning).find("p").hide().fadeIn("slow");
		}else{
			$("#main-screen-to-park .btn-group .warning").remove();
		}
	});

});

