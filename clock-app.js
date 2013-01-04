function Clock() {
}

Clock.prototype.loop = function(ctx, W, H, dt, T) {
	ctx.fillStyle = '#101018';
	ctx.fillRect(0, 0, W, H);

	var now = new Date(T);
	var s = now.getUTCSeconds() + _.easeInOut(0.001 * now.getUTCMilliseconds());
	var m = now.getUTCMinutes();
	var r = 0.4 * Math.min(W, H);
	var centerX = 0.5 * W;
	var centerY = 0.5 * H;

	ctx.beginPath();
	ctx.arc(centerX, centerY, 0.03 * r, (s / 60 * 2 - 0.5) * Math.PI, -0.5 * Math.PI, m % 2 === 1);
	ctx.arc(centerX, centerY, r, -0.5 * Math.PI, (s / 60 * 2 - 0.5) * Math.PI, m % 2 === 0);
	ctx.closePath();

	var r2 = r * 0.9;
	for (var i = 1; i < 12; i++) {
		var angle = (i / 12 * 2 - 0.5) * Math.PI;
		ctx.moveTo(centerX + Math.cos(angle) * r , centerY + Math.sin(angle) * r );
		ctx.lineTo(centerX + Math.cos(angle) * r2, centerY + Math.sin(angle) * r2);
	}

	ctx.shadowColor = 'red';
	ctx.shadowBlur = 6;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.strokeStyle = '#990000';
	ctx.stroke();
	ctx.shadowBlur = 0;
	ctx.fillStyle = 'rgba(255,0,0,0.1)';
	ctx.fill();
};
