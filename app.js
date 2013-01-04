window.onload = function() {

	var canvas = document.getElementsByTagName('canvas')[0];
	if (!canvas) {
		console.error('Canvas element not found!');
		return;
	}

	var ctx = canvas.getContext('2d');
	var app = null;
	var fps = 30;
	var loop;

	canvas.onclick = function() {
		if (app instanceof Bouncers) {
			app = new Clock();
		} else {
			app = new Bouncers(1000);
		}
	};
	canvas.onclick();

	var W = 0;
	var H = 0;
	var T = new Date().getTime();
	window.onresize = function() {
		var newW = window.innerWidth;
		var newH = window.innerHeight;

		// If window size is unchanged, do nothing.
		if (W === newW && H === newH) return;

		canvas.width  = W = newW;
		canvas.height = H = newH;
		loop();
	};

	var Ts = [];
	var oldFPS = fps;
	function currentFPS(T) {
		Ts.push(T);
		var oldT, newFPS;
		if (Ts.length > 10) {
			oldT = Ts.shift();
			newFPS = Ts.length * 1000 / (T - oldT);
			oldFPS = 0.95 * oldFPS + 0.05 * newFPS;
		} else if (Ts.length > 2) {
			oldT = Ts[0];
			newFPS = Ts.length * 1000 / (T - oldT);
			oldFPS = 0.8 * oldFPS + 0.2 * newFPS;
		}
		return oldFPS;
	}

	loop = function() {
		var newT = new Date().getTime();
		var dt = 0.001 * (newT - T);
		T = newT;
		app.loop(ctx, W, H, dt, T);

		ctx.fillStyle = 'white';
		ctx.textAlign = 'left';
		ctx.shadowBlur = 0;
		ctx.fillText(currentFPS(T).toFixed(1) + ' fps', 10, 20);
	}

	window.onresize();
	setInterval(loop, 1000 / fps - 1);
};
