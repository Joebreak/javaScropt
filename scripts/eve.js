

		var width = document.documentElement.clientWidth
        //var height = document.documentElement.clientHeight;
		var canvas = document.getElementById("mycanvas");
        var boxTop = 0;//canvas的top值
        var boxLeft = 0;//canvas的left值
		
        var device = /android|iphone|ipad|ipod|webos|iemobile|opear mini|linux/i.test(navigator.userAgent.toLowerCase());
        console.log(width)
        var startEvtName = device ? "touchstart" : "mousedown";
        var moveEvtName = device ? "touchmove" : "mousemove";
        var endEvtName = device ? "touchend" : "mouseup";

        
        //定义画布的大小
        canvas.height = 200;
        canvas.width = 600;
        can=canvas.getContext('2d');

		document.body.addEventListener('touchmove', 
			function(event) {
			event.preventDefault();
		}, false); 
		
        var oImg = new Image();
        oImg.src = "https://img.shoplineapp.com/media/image_clips/5dcd0d5a7853e0000fa818fc/original.png?1573719385";
        oImg.onload = function () {
            can.beginPath();
            can.drawImage(oImg, 0, 0, 886,994);
            can.closePath();
		}
        can.fillRect(0,0,866,990);
        
        function draw(event) {
            var x = device ? event.touches[0].clientX : event.clientX;
            var y = device ? event.touches[0].clientY : event.clientY;
            console.log(x,y);

            can.beginPath();
            can.globalCompositeOperation = "destination-out";
            can.arc(x-boxLeft, y-boxTop, 40, 0, Math.PI * 2, false);
            can.fill();
            can.closePath();
        }

        canvas.addEventListener(startEvtName, function () {
            canvas.addEventListener(moveEvtName, draw, false);
        }, false);

        canvas.addEventListener(endEvtName, function () {
            canvas.removeEventListener(moveEvtName, draw, false);
        }, false);
        

		
function showOverlay(){

/*
<canvas id="canvas"></canvas></div>
https://img.shoplineapp.com/media/image_clips/5dc520c7c26e2700237c89cc/original.png?1573200070

<img src="https://img.shoplineapp.com/media/image_clips/5dc520c7c26e2700237c89cc/original.png?1573200070">
*/
   
}
    