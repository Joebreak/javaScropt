let myButton = document.getElementById('mybutton');
	let message = "注意事項\n1.折扣碼使用期間為2019年12月6日1AM~2020年1月1日12PM止。\n2.本活動僅限臺灣地區。\n3.凡抽到贈送兌換卷乙張者,於官網消費並輸入折扣碼，我們將隨貨寄贈。\n4.兌換卷使用期限：2020年1/23~2/6\n地點：漢神巨蛋地下1F, PENCIL CREAMERY快閃店\n5.結帳時不要忘了輸入折扣碼唷！";
	myButton.onclick = function() {
		//alert(message);
		if (confirm(message) ==true){
			window.open("https://www.pencilcreamery.com/");
		}
	}