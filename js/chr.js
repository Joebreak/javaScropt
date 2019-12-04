image1Src = "https://img.shoplineapp.com/media/image_clips/5de713c16ac8690ebdef97b7/original.png?1575424959";

images = [
    "https://img.shoplineapp.com/media/image_clips/5de0c5170647b9001bbf43d2/original.png?1575011604",
    "https://img.shoplineapp.com/media/image_clips/5de0c51674dae00025eaacb8/original.png?1575011604",
    "https://img.shoplineapp.com/media/image_clips/5dde34b1d5022000366c24de/original.png?1574843566",
    "https://img.shoplineapp.com/media/image_clips/5dde34b13d7913002d0133c4/original.png?1574843566",
    "https://img.shoplineapp.com/media/image_clips/5dde34af0b0ff6001236728e/original.png?1574843566"
];
var device = /android|iphone|ipad|ipod|webos|iemobile|opear mini|linux/i.test(navigator.userAgent.toLowerCase());
image = new Image();
myCanvas = document.getElementById('myCanvas');

num = Math.floor(Math.random() * images.length);
let con = myCanvas.getContext("2d");

image.onload = function(e){
    let flag = false;

    let w = image.width;
    let h = image.height;
    myCanvas.width = w;
    myCanvas.height = h;

    let offsetX = myCanvas.offsetLeft ;
    let offsetY = myCanvas.offsetTop;

    myCanvas.style.backgroundImage = 'url('+images[num]+')';
    con.drawImage(image, 0, 0, w,h);
	
    con.globalCompositeOperation = "destination-out"; 
    function eventDown() {
        e.preventDefault();
        flag = true;
    }

    function eventUp() {
        e.preventDefault();
        flag = false;
        con.closePath();
    }

    function eventMove(e) {
        e.preventDefault();
        if (flag) {
            if (e.changedTouches) {
                e = e.changedTouches[e.changedTouches.length - 1];
            }
            let x = (e.clientX + document.body.scrollLeft || e.pageX)
                - offsetX;
            let y = (e.clientY + document.body.scrollTop || e.pageY)
                - offsetY;
            with (con) { 
                beginPath();
                arc(x, y, 30, 0, Math.PI * 2);
                fill();
            }
        }
    }
    var startEvtName = device ? "touchstart" : "mousedown";
    var moveEvtName = device ? "touchmove" : "mousemove";
    var endEvtName = device ? "touchend" : "mouseup";
    myCanvas.addEventListener(startEvtName, eventDown);
    myCanvas.addEventListener(moveEvtName, eventMove);
    myCanvas.addEventListener(endEvtName, eventUp);
    
myCanvas.addEventListener(endEvtName, imageData);
function imageData() {
	var imageDate = con.getImageData(0, 0, myCanvas.width, myCanvas.height);
	
    var allPX = imageDate.width * imageDate.height;
    var iNum = 0;
    for (var i = 0; i < allPX; i++) {
        if (imageDate.data[i * 4 + 3] === 0) {
            iNum++;
        }
    }
    
    if (iNum >= allPX * 1 / 4 ) {
    	con.clearRect(0,0,image.width,image.height);
    }
  }
};
image.src = image1Src;


