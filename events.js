
var touch;
var key;

function checkButtonClick(e){
	x = e.pageX - canvas.offsetLeft;
	y = e.pageY - canvas.offsetTop;	
	//console.log(x,y);

	//cambio di visuale
	if(x>=878 && x<=939 && y>=358 && y<=376)  initial_target = [-1.3, -0.9, 32]; 	//davanti
	if(x>=949 && x<=1009 && y>=358 && y<=376)  initial_target = [-1.3, 2, 46]; 		//dall'alto
	if(x>=1020 && x<=1078 && y>=358 && y<=376)  initial_target = [-1.3, -0.5, 40];  //posteriore
	 
	if(x>=990 && x<=1030 && y>=414 && y<=432)  shadows=true;
	if(x>=1038 && x<=1080 && y>=414 && y<=432)  shadows=false;
	
	if(x>=990 && x<=1030 && y>=389 && y<=406)  bump_mapping=true;
	if(x>=1038 && x<=1080 && y>=389 && y<=406)  bump_mapping=false;
	
	if(x>=709 && x<=807 && y>=430 && y<=490 && !pilota_automatico) luce_on=!luce_on;
	
	//retry button -> restart
	if(x>=366 && x<=520 && y>=58 && y<=106 && !win && end==1){
		start=0;
		end=0;
		CarInit();
		luce_on=false;
		bump_mapping=false;
		shadows=false;
		pilota_automatico=false;
		seconds=0;
		clearInterval(timer);
	}

	//pilota automatico
	if(x>=888 && x<=1072 && y>=479 && y<=500 && start==0){
		pilota_automatico=!pilota_automatico;
		luce_on=false;
		if(gamepad)ctrl=0;
		if(pilota_automatico){
			//start pilota automatico
			step=0;
			gamepad=false;
			CarInit();
			window.removeEventListener('keydown', doKeyDown, true);
			window.removeEventListener('keyup', doKeyUp, true);
			window.removeEventListener('touchstart', doTouchDown, true);
			window.removeEventListener('touchend', doTouchUp, true);
			window.removeEventListener('mousedown', doMouseDown, true);
			window.removeEventListener('mouseup', doMouseUp, true);
		}
		else{
			//esco dal pilota automatico
			if(ctrl==0)gamepad=true;
			window.addEventListener('keydown', doKeyDown, true);
			window.addEventListener('keyup', doKeyUp, true);
			window.addEventListener('touchstart', doTouchDown, true);
			window.addEventListener('touchend', doTouchUp, true);
			window.addEventListener('mousedown', doMouseDown, true);
			window.addEventListener('mouseup', doMouseUp, true);
		}
	}
	
}



//GAMEPAD events
window.addEventListener("gamepadconnected", function(e) {
	gp = navigator.getGamepads()[e.gamepad.index];
	console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index, gp.id,
    gp.buttons.length, gp.axes.length);
	gp_start=gp.axes[0];
	//console.log(gp_start);
	gamepad=true;
});

window.addEventListener("gamepaddisconnected", function(e) {
	console.log("Gamepad disconnected");
	//delete gp;
	//delete gp_start;
	gamepad=false;
});




//WASD events
function doKeyDown(e){
    // THE W KEY
    if (e.keyCode == 87) key[0]=true;
    // THE S KEY
    if (e.keyCode == 83) key[2]=true;
    // THE A KEY
    if (e.keyCode == 65) key[1]=true;
    // THE D KEY
    if (e.keyCode == 68) key[3]=true;
	
	if (e.keyCode == 90) luce_on=!luce_on;
}

function doKeyUp(e){
    // THE W KEY
    if (e.keyCode == 87) key[0]=false;
	// THE S KEY
    if (e.keyCode == 83) key[2]=false;
    // THE A KEY
    if (e.keyCode == 65) key[1]=false;
    // THE D KEY
    if (e.keyCode == 68) key[3]=false;
}




//TOUCH mobile events
function doTouchDown(e){
	touch = e.touches[0];
	x= touch.pageX - canvas.offsetLeft;
	y= touch.pageY - canvas.offsetTop;
	
    // THE W KEY
    if (x>=190 && y>=351 && x<=250 && y<=417) key[0]=true;
    // THE S KEY
    if (x>=190 && y>=439 && x<=251 && y<=500) key[2]=true;
    // THE A KEY
    if (x>=106 && y>=438 && x<=167 && y<=503) key[1]=true;
    // THE D KEY
    if (x>=274 && y>=440 && x<=335 && y<=504) key[3]=true;
}

function doTouchUp(e){
	x= touch.pageX - canvas.offsetLeft;
	y= touch.pageY - canvas.offsetTop;
    
	// THE W KEY
    if (x>=190 && y>=351 && x<=250 && y<=417) key[0]=false;
    // THE S KEY
    if (x>=190 && y>=439 && x<=251 && y<=500) key[2]=false;
    // THE A KEY
    if (x>=106 && y>=438 && x<=167 && y<=503) key[1]=false;
    // THE D KEY
    if (x>=274 && y>=440 && x<=335 && y<=504) key[3]=false;
}




//MOUSE events
function doMouseDown(e){
	x= e.pageX - canvas.offsetLeft;
	y= e.pageY - canvas.offsetTop;
	
    // THE W KEY
    if (x>=190 && y>=351 && x<=250 && y<=417) key[0]=true;
    // THE S KEY
    if (x>=190 && y>=439 && x<=251 && y<=500) key[2]=true;
    // THE A KEY
    if (x>=106 && y>=438 && x<=167 && y<=503) key[1]=true;
    // THE D KEY
    if (x>=274 && y>=440 && x<=335 && y<=504) key[3]=true;
}

function doMouseUp(e){
	x= e.pageX - canvas.offsetLeft;
	y= e.pageY - canvas.offsetTop;
    
	// THE W KEY
    if (x>=190 && y>=351 && x<=250 && y<=417) key[0]=false;
    // THE S KEY
    if (x>=190 && y>=439 && x<=251 && y<=500) key[2]=false;
    // THE A KEY
    if (x>=106 && y>=438 && x<=167 && y<=503) key[1]=false;
    // THE D KEY
    if (x>=274 && y>=440 && x<=335 && y<=504) key[3]=false;
}