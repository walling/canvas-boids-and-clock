function Bouncer() {
	this.x = Math.random() * 0.1 + 0.45;
	this.y = Math.random() * 0.1 + 0.45;
	this.r = 0.1;
	this.g = 0.1;
	this.b = 0.2;

	var x = Math.random() * 2 - 1;
	this.dir = {
		x : x,
		y : Math.sqrt(1 - x * x) * (Math.random() < 0.8 ? -1 : 1)
	};
}

function Bouncers(count) {
	count = count || 10;

	this.grid  = new GridIndex(30, 30, 0, 1, 0, 1);
	this.count = count;
	this.balls = new Array(count);

	for (var i = 0; i < count; i++) {
		this.balls[i] = new Bouncer();
		this.grid.add(this.balls[i]);
	}
}

var cos30 = Math.cos(30 * Math.PI / 180);
var sin30 = Math.sin(30 * Math.PI / 180);

Bouncers.prototype.loop = function(ctx, W, H, dt, T) {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, W, H);

	var r = (0.4 * Math.min(W, H) | 0);
	var centerX = 0.5 + (0.5 * W | 0);
	var centerY = 0.5 + (0.5 * H | 0);

	var r2 = r + 4;
	ctx.strokeStyle = 'white';
	ctx.strokeRect(centerX - r2, centerY - r2, 2 * r2, 2 * r2);

	for (var i = 0; i < this.count; i++) {
		var ball = this.balls[i];
		var n1 = {
			x : cos30 * ball.dir.x - sin30 * ball.dir.y,
			y : sin30 * ball.dir.x + cos30 * ball.dir.y
		};
		var n2 = {
			x :  cos30 * ball.dir.x + sin30 * ball.dir.y,
			y : -sin30 * ball.dir.x + cos30 * ball.dir.y
		};

		var others = this.grid.localLookup(ball.x, ball.y, 0.03, function(o) {
			if (o === ball) return false;

			var pointer = {
				x : o.x - ball.x,
				y : o.y - ball.y
			};
			return _.dot(n1, pointer) > 0 || _.dot(n2, pointer) > 0;
		});

		if (others.length > 0) {
			var separation = { x : 0, y : 0 };
			var alignment  = { x : 0, y : 0 };
			var cohesion   = { x : -ball.x, y : -ball.y };

			var oR = 0;
			var oG = 0;
			var oB = 0;
			var bd = 0;

			var sees = Math.min(3, others.length);
			var avg = 1 / sees;
			for (var j = 0; j < sees; j++) {
				var other = others[j];

				separation.x -= (other.x - ball.x) * avg;
				separation.y -= (other.y - ball.y) * avg;
				alignment.x += other.dir.x * avg;
				alignment.y += other.dir.y * avg;
				cohesion.x += other.x * avg;
				cohesion.y += other.y * avg;

				var d =
					_.sq(other.r - ball.r) +
					_.sq(other.g - ball.g) +
					_.sq(other.b - ball.b);
				if (d >= bd) {
					bd = d;
					oR = other.r;
					oG = other.g;
					oB = other.b;
				}
			}

			separation = _.normalized(separation);
			alignment  = _.normalized(alignment);
			cohesion   = _.normalized(cohesion);

			separation.x *= 1 + 3 * _.easeInOut(others.length * 0.1);
			separation.y *= 1 + 3 * _.easeInOut(others.length * 0.1);

			ball.dir.x += 0.95 * ball.dir.x + 0.05 * separation.x;
			ball.dir.y += 0.95 * ball.dir.y + 0.05 * separation.y;
			ball.dir.x += 0.8  * ball.dir.x + 0.2  * alignment.x;
			ball.dir.y += 0.8  * ball.dir.y + 0.2  * alignment.y;
			ball.dir.x += 0.9  * ball.dir.x + 0.1  * cohesion.x;
			ball.dir.y += 0.9  * ball.dir.y + 0.1  * cohesion.y;

			ball.r = ball.r * 0.8 + oR * 0.2;
			ball.g = ball.g * 0.8 + oG * 0.2;
			ball.b = ball.b * 0.8 + oB * 0.2;
			ball.r = ball.r * 0.99 + 0.1 * 0.01;
			ball.g = ball.g * 0.99 + 0.1 * 0.01;
			ball.b = ball.b * 0.99 + 0.2 * 0.01;
		}

		if (Math.random() < 0.0001 + 0.001 * _.easeInOut(others.length * 0.001)) {
			ball.r = 0.8;
			ball.g = 1;
			ball.b = 0.8;
		}

		ball.dir.x = 0.4 * ball.dir.x +  0.6 * _.easeInOut(1 - 4 * ball.x);
		ball.dir.x = 0.4 * ball.dir.x + -0.6 * _.easeInOut(ball.x * 4 - 3);
		ball.dir.y = 0.4 * ball.dir.y +  0.6 * _.easeInOut(1 - 4 * ball.y);
		ball.dir.y = 0.4 * ball.dir.y + -0.6 * _.easeInOut(ball.y * 4 - 3);
		ball.dir = _.normalized(ball.dir);

		ball.x += 0.1 * ball.dir.x * dt;
		ball.y += 0.1 * ball.dir.y * dt;

		this.grid.add(ball);

		ball.r = 0.99 * ball.r + 0.01 * 0.3 * _.easeInOut(ball.dir.x *  2);
		ball.b = 0.99 * ball.b + 0.01 * 0.3 * _.easeInOut(ball.dir.x * -2);

		var cR = (ball.r * 256) | 0;
		var cG = (ball.g * 256) | 0;
		var cB = (ball.b * 256) | 0;
		var cA = 0.2;
		var rgb  = 'rgb(' + cR + ', ' + cG + ', ' + cB + ')';
		var rgba = 'rgba(' + cR + ', ' + cG + ', ' + cB + ', ' + cA + ')';

		var x = (ball.x * 2 - 1) * r + centerX;
		var y = (ball.y * 2 - 1) * r + centerY;

		ctx.beginPath();
		ctx.moveTo(x + ball.dir.x * 1.5, y + ball.dir.y * 1.5);
		ctx.lineTo(x - n1.x * 3, y - n1.y * 3);
		ctx.lineTo(x - n2.x * 3, y - n2.y * 3);
		ctx.closePath();

		//ctx.arc(x, y, 3, 0, 2 * Math.PI, true);

		//ctx.shadowColor = rgb;
		//ctx.shadowBlur = 1;
		//ctx.shadowOffsetX = 0;
		//ctx.shadowOffsetY = 0;
		ctx.strokeStyle = rgb;
		ctx.stroke();

		//ctx.shadowBlur = 0;
		//ctx.fillStyle = rgba;
		//ctx.fill();
	}
};
