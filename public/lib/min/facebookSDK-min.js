function statusChangeCallback(n){console.log("statusChangeCallback"),console.log(n),"connected"===n.status?testAPI():document.getElementById("status").innerHTML="not_authorized"===n.status?"Please log into this app.":"Please log into Facebook."}function checkLoginState(){FB.getLoginStatus(function(n){statusChangeCallback(n)})}function testAPI(){console.log("Welcome!  Fetching your information.... "),FB.api("/me",function(n){console.log("Successful login for: "+n.name),document.getElementById("status").innerHTML="Thanks for logging in, "+n.name+"!"})}window.fbAsyncInit=function(){FB.init({appId:"1526375344302080",cookie:!0,xfbml:!0,version:"v2.1"}),FB.getLoginStatus(function(n){statusChangeCallback(n)})},function(n,t,e){var o,a=n.getElementsByTagName(t)[0];n.getElementById(e)||(o=n.createElement(t),o.id=e,o.src="//connect.facebook.net/en_US/sdk.js",a.parentNode.insertBefore(o,a))}(document,"script","facebook-jssdk");