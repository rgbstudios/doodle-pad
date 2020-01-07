let canvas, ctx, rad, isClicking = false, oldImages = [];

// let palette, showToolbar;
$( ()=> {

canvas = document.getElementById("doodleCanvas");
ctx = canvas.getContext("2d");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("mousedown", engage);
canvas.addEventListener("mouseup",   disengage);
canvas.addEventListener("mousemove", putPoint);

canvas.addEventListener("touchstart", engage);
canvas.addEventListener("touchend",   disengage);
canvas.addEventListener("touchmove",  putPoint);

// --------------------------------

// palette = document.getElementById("palette");
// showToolbar = document.getElementById("showToolbar");

// --------------------------------

window.onresize = function() {
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.putImageData(img, 0, 0);
	setRad(rad);
	setSwatch({target:document.getElementsByClassName("active")[0]});
}

// RADIUS
let defaultRad = 5,
		radVal = document.getElementById("radVal"),
		radInput = document.getElementById("radInput");

setRad(defaultRad);
radInput.value = defaultRad;

// --------------------------------

radInput.onchange = function() {
	setRad(radInput.value);
}

// COLOR
let colors = [];
colors.push("hsl(0,0%,0%)");
colors.push("hsl(0,0%,25%)");
colors.push("hsl(0,0%,50%)");
colors.push("hsl(0,0%,75%)");
colors.push("hsl(0,0%,100%)");
for(let i = 0; i < 360; i += 30) {
	colors.push("hsl(" + i + ",100%,25%)");
}
for(let i = 0; i < 360; i += 30) {
	colors.push("hsl(" + i + ",100%,50%)");
}
for(let i = 0; i < 360; i += 30) {
	colors.push("hsl(" + i + ",100%,75%)");
}

for(let i = 0; i < colors.length; i++) {
	let swatch = document.createElement("div");
	swatch.className = "swatch";
	swatch.style.backgroundColor = colors[i];
	swatch.addEventListener("click", setSwatch);
	document.getElementById("colors").appendChild(swatch);
}

// --------------------------------

setSwatch({target:document.getElementsByClassName("swatch")[0]});


deleteImg();

// --------------------------------

document.onkeydown = function(evt) {
	if(evt.keyCode == 90 && evt.ctrlKey) { // "z"
		undo();
	} else if(evt.keyCode == 83 && evt.ctrlKey) { // "s"
		saveImg();
	}
}

// LOAD IMAGE
let hiddenFile = document.getElementById("hiddenFile")
hiddenFile.addEventListener("change", handleFile);




}); // end onload








function saveOld() {
	if(oldImages.length > 29) {
		oldImages = oldImages.slice(1,29);
	}
	oldImages.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function engage(evt) {
	isClicking = true;
	putPoint(evt);
}

function disengage() {
	saveOld();
	isClicking = false;
	ctx.beginPath(); // clear old path
}

function putPoint(evt) {
	if(isClicking) {
		let x,y;
		if(evt.clientX) {
			x = evt.clientX;
			y = evt.clientY;
		} else {
			let touch = evt.touches[0];
			x = touch.pageX;
			y = touch.pageY;
		}
		ctx.lineTo(x, y); // connect to previous click
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(x, y, rad, 0, 2*Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(x, y);
	}
}








function togglePalette() {
	let colors = document.getElementById("colors");
	if(colors.style.display == "inline-block") {
		colors.style.display = "none";
		// palette.style.color = "#eee";
		// palette.style.backgroundColor = "#666";
	} else {
		colors.style.display = "inline-block";
		// palette.style.color = "#666";
		// palette.style.backgroundColor = "#eee";
	}
}

function toggleToolbar() {
	let innerToolbar = document.getElementById("innerToolbar");
	let toolbar = document.getElementById("toolbar");
	if(innerToolbar.style.display == "inline-block") {
		innerToolbar.style.display = "none";
		toolbar.style.height = "0px";
		toolbar.style.padding = "0px";
		// showToolbar.style.color = "#eee";
		// showToolbar.style.backgroundColor = "#666";
	} else {
		innerToolbar.style.display = "inline-block";
		toolbar.style.height = "50px";
		toolbar.style.padding = "10px";
		// showToolbar.style.color = "#666";
		// showToolbar.style.backgroundColor = "#eee";
	}
}









function setRad(newRad) {
	rad = newRad;
	ctx.lineWidth = 2 * rad;
	radVal.innerHTML = rad < 10 ? "0" + rad : rad;
}






function setSwatch(evt) {
	let swatch = evt.target;
	setColor(swatch.style.backgroundColor);
	swatch.className += " active";
}

function setColor(color) {
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	let active = document.getElementsByClassName("active")[0];
	if(active) {
		active.className = "swatch";
	}
}





function saveImg() {
	let data = canvas.toDataURL("image/png");
	let newWindow = window.open('about:blank','image from canvas');
	newWindow.document.write("<img src='" + data + "' alt='from canvas'/>");
}
function deleteImg() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let oldStyle = ctx.fillStyle;
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = oldStyle;
}






function undo() {
	if(oldImages.length != 0) {
		ctx.putImageData(oldImages.pop(), 0, 0);
	}
}

// https://www.thewebflash.com/toggling-fullscreen-mode-using-the-html5-fullscreen-api/
function fullscreen(elem) {
	elem = elem || document.documentElement;
	if (!document.fullscreenElement && !document.mozFullScreenElement &&
			!document.webkitFullscreenElement && !document.msFullscreenElement) {
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}





function handleFile(evt) {
	saveOld();
	let img = new Image;
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
	}
	img.src = URL.createObjectURL(evt.target.files[0]);
}
function loadImg() {
	hiddenFile.click();
}