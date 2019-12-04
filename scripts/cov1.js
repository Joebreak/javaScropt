
image1Src = "https://img.shoplineapp.com/media/image_clips/5dcd0d5a7853e0000fa818fc/original.png?1573719385"

// 中獎圖片
images = [
    "https://img.shoplineapp.com/media/image_clips/5dcd0d5a5e0f21138ea7ce41/original.png?1573719385",
    "https://img.shoplineapp.com/media/image_clips/5dcd0d5ae97e050021ef84e3/original.png?1573719385",
    "https://img.shoplineapp.com/media/image_clips/5dcd0d5a1cc8950027697069/original.png?1573719385"
];
image1 = new Image();


myCanvas1 = document.getElementById('myCanvas1');
ctx = myCanvas1.getContext("2d");

image1.onload = function(){
    console.log("load image1");
    w = image1.width;
    h = image1.height;
    myCanvas1.width = w;
    myCanvas1.height = h;
    ctx.drawImage(image1, 0, 0, w, h);
};
image1.src = image1Src;
bodyStyle = document.body.style;
bodyStyle.mozUserSelect = 'none';
bodyStyle.webkitUserSelect = 'none';


myCanvas2 = document.getElementById('myCanvas2');

let w;
let h;


ctx2 = myCanvas2.getContext("2d");
image2.onload = function(e){
    console.log("load image2");
    w = image2.width;
    h = image2.height;
    myCanvas2.width = w;
    myCanvas2.height = h;
    let offsetX = myCanvas2.offsetLeft; // 获取画布在浏览器视口的偏移量
    let offsetY = myCanvas2.offsetTop;
    let flag = false;

    myCanvas2.width = w;
    myCanvas2.height = h;
    //myCanvas2.style.backgroundImage = 'url('+image2.src+')';
   // myCanvas2.style.backgroundImage = image2.src;
    ctx2.drawImage(image2, 0, 0);

    ctx2.globalCompositeOperation = "destination-out"; // 遮盖行为

    function eventDown() {
        e.preventDefault(); // 阻止鼠标默认事件
        flag = true;
    }

    function eventUp() {
        e.preventDefault();
        flag = false;
    }

    function eventMove(e) {
        e.preventDefault();
        if (flag) {
            if (e.changedTouches) { // 获取手势操作对象
                e = e.changedTouches[e.changedTouches.length - 1];
            }
            let x = (e.clientX + document.body.scrollLeft || e.pageX)
                - offsetX;
            let y = (e.clientY + document.body.scrollTop || e.pageY)
                - offsetY;
            with (ctx2) { // 判断当前对象
                beginPath();
                fillRect(x,y,0,0);
                //arc(x, y, 30, 0, Math.PI * 2);
                fill();
            }
        }
    }

    // pc端
    myCanvas2.addEventListener("mousedown", eventDown);
    myCanvas2.addEventListener("mouseup", eventUp);
    myCanvas2.addEventListener("mousemove", eventMove);
    // 移动端
    myCanvas2.addEventListener("touchstart", eventDown);
    myCanvas2.addEventListener("touchend", eventUp);
    myCanvas2.addEventListener("touchmove", eventMove);
};

num = Math.floor(Math.random() * images.length);
image2.src = images[num];
