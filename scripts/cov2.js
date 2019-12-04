
image1Src = "https://img.shoplineapp.com/media/image_clips/5dcd0d5a7853e0000fa818fc/original.png?1573719385"

// 中獎圖片
images = [
    "https://img.shoplineapp.com/media/image_clips/5dcd0d5a5e0f21138ea7ce41/original.png?1573719385",
    "https://img.shoplineapp.com/media/image_clips/5dcd0d5ae97e050021ef84e3/original.png?1573719385",
    "https://img.shoplineapp.com/media/image_clips/5dcd0d5a1cc8950027697069/original.png?1573719385"
];
bodyStyle = document.body.style;
bodyStyle.mozUserSelect = 'none';
bodyStyle.webkitUserSelect = 'none';

// image1 = new Image();
// myCanvas1 = document.getElementById('myCanvas1');
//
// image1.onload = function(){
//     let con1 = myCanvas1.getContext("2d");
//     console.log("load image1");
//     let w = image1.width;
//     let h = image1.height;
//      myCanvas1.width = w;
//      myCanvas1.height = h;
//     //myCanvas1.style.position = 'absolute';
//     con1.drawImage(image1, 0, 0, w,h);
// };
// image1.src = image1Src;


image2 = new Image();
myCanvas2 = document.getElementById('myCanvas2');

num = Math.floor(Math.random() * images.length);

image2.onload = function(e){
    console.log("load image2");
    let con2 = myCanvas2.getContext("2d");
    let flag = false;

    let w = image2.width;
    let h = image2.height;
    myCanvas2.width = w;
    myCanvas2.height = h;

    let offsetX = myCanvas2.offsetLeft ; // 获取画布在浏览器视口的偏移量
    let offsetY = myCanvas2.offsetTop;

    myCanvas2.style.backgroundImage = 'url('+images[num]+')';
    //con2.drawImage(image2, 0, 0, w,h);
    con2.fillStyle = 'gray';
    con2.fillRect(0, 0, w, h);
    //con2.fillStyle='transparent';

    con2.globalCompositeOperation = "destination-out"; // 遮盖行为
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
            with (con2) { // 判断当前对象
                beginPath();
                console.log("1");
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
image2.src = images[num];

