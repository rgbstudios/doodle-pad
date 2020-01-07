let canvas, ctx, rad, isClicking = false, oldImages = [];

const DEFAULT_RAD = 5;

$( ()=> {

canvas = document.getElementById('doodleCanvas');
ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener('mousedown', engage);
canvas.addEventListener('mouseup',   disengage);
canvas.addEventListener('mousemove', putPoint);

canvas.addEventListener('touchstart', engage);
canvas.addEventListener('touchend',   disengage);
canvas.addEventListener('touchmove',  putPoint);

// --------------------------------

window.onresize = function() {
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.putImageData(img, 0, 0);
	setRad(rad);
	setSwatch({target:document.getElementsByClassName('active')[0]});
}

// RADIUS
setRad(DEFAULT_RAD);
$('#radInput').val(DEFAULT_RAD);
$('#radInput').change( ()=>	setRad($('#radInput').val() ) );

// COLOR
let colors = [];
colors.push('hsl(0,0%,0%)');
colors.push('hsl(0,0%,25%)');
colors.push('hsl(0,0%,50%)');
colors.push('hsl(0,0%,75%)');
colors.push('hsl(0,0%,100%)');
for(let i = 0; i < 360; i += 30) {
	colors.push('hsl(' + i + ',100%,25%)');
}
for(let i = 0; i < 360; i += 30) {
	colors.push('hsl(' + i + ',100%,50%)');
}
for(let i = 0; i < 360; i += 30) {
	colors.push('hsl(' + i + ',100%,75%)');
}

for(let i = 0; i < colors.length; i++) {
	let swatch = document.createElement('div');
	swatch.className = 'swatch';
	swatch.style.backgroundColor = colors[i];
	swatch.addEventListener('click', setSwatch);
	document.getElementById('colors').appendChild(swatch);
}

setSwatch({target:document.getElementsByClassName('swatch')[0]});
deleteImg();
toggleMoreOptions();

// LOAD IMAGE
$('#hiddenFile').change(handleFile);

// --------------------------------

document.onkeydown = function(evt) {
	if(evt.keyCode == 90 && evt.ctrlKey) { // 'z'
		undo();
	} else if(evt.keyCode == 83 && evt.ctrlKey) { // 's'
		saveImg();
	}
}

}); // end onload

// Basic Drawing Functions

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

// Undo

function saveOld() {
	// anything that edits the image should call this function first
	if(oldImages.length > 29) {
		oldImages = oldImages.slice(1,29);
	}
	oldImages.push(ctx.getImageData(0, 0, canvas.width, canvas.height) );
}

function undo() {
	console.log('undo');
	console.log(oldImages.length);
	console.log(oldImages);
	if(oldImages.length != 0) {
		ctx.putImageData(oldImages.pop(), 0, 0);
		// ctx.putImageData(oldImages[oldImages.length-1], 0, 0);
		// oldImages.pop();
	}
}

// Toggle UI

function togglePalette() {
	if($('#colors').css('display') == 'none') {
		$('#colors').css('display', 'inline');
	} else {
		$('#colors').css('display', 'none');
	}
}

function toggleToolbar() {
	let innerToolbar = document.getElementById('innerToolbar');
	let toolbar = document.getElementById('toolbar');
	if(innerToolbar.style.display == 'none') {
		innerToolbar.style.display = 'inline-block';
		toolbar.style.height = '';
		toolbar.style.padding = '';
		$('#showMoreBtn').css('display', '');

	} else {
		innerToolbar.style.display = 'none';
		toolbar.style.height = '0px';
		toolbar.style.padding = '0px';
		$('#showMoreBtn').css('display', 'none');
	}
}

function toggleMoreOptions() {
	if($('#moreDiv').css('display') != 'none') {
		$('#moreDiv').css('display', 'none');
	}
	else {
		$('#moreDiv').css('display', '');
	}
}

// Set Options Functions

function setRad(newRad) {
	rad = newRad;
	ctx.lineWidth = 2 * rad;
	$('#radVal').html(rad < 10 ? '0' + rad : rad);
}

function setSwatch(evt) {
	let swatch = evt.target;
	setColor(swatch.style.backgroundColor);
	swatch.className += ' active';
}

function setColor(color) {
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	let active = document.getElementsByClassName('active')[0];
	if(active) {
		active.className = 'swatch';
	}
}

// Save and Delete

function saveImg() {
	let data = canvas.toDataURL('image/png');
	let newWindow = window.open('about:blank','image from canvas');
	newWindow.document.write('<img src="' + data + '">');
}

function deleteImg() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let oldStyle = ctx.fillStyle;
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = oldStyle;
}

// Fullscreen

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

// Load Image

function handleFile(evt) {
	saveOld();
	let img = new Image;
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
	}
	img.src = URL.createObjectURL(evt.target.files[0]);
}
function loadImg() {
	$('#hiddenFile').click();
}

// Image Editing

function invert() {
	saveOld();
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imageData.data;
	for(let i = 0; i < data.length; i += 4) {
		data[i]   = 255 - data[i];   // r
		data[i+1] = 255 - data[i+1]; // g
		data[i+2] = 255 - data[i+2]; // b
	}
	ctx.putImageData(imageData, 0, 0);
}

function grayscale() {
	saveOld();
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imageData.data;
	for(let i = 0; i < data.length; i += 4) {
		let avg = (data[i] + data[i+1] + data[i+2]) / 3;
		data[i]   = avg; // r
		data[i+1] = avg; // g
		data[i+2] = avg; // b
	}
	ctx.putImageData(imageData, 0, 0);
  };