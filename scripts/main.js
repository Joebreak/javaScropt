
function setUserName1(name) {
  localStorage.setItem('name', name);
  myHeading.innerHTML = 'hello~ '+ name;
}

var myHeading = document.querySelector('h1');
let myButton = document.querySelector('button');


function setUserName() {
  let myName = prompt('Please enter your name.');
  if(!myName || myName === null) {
    setUserName();
  } else {
    setUserName1(myName)
  }
}

let storageName = localStorage.getItem('name')
if(!storageName) {
  setUserName();
} else {
	setUserName1(storageName);
}
	

myButton.onclick = function() {
  setUserName();
}