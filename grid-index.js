/**
 * Geo-spatial index of objects. The objects must export the properties
 * `x` and `y` in order to be indexed.
 */
function GridIndex(width, height, min_x, max_x, min_y, max_y) {
	this.uid    = GridIndex.uid++;
	this.cells  = new Array(width * height);
	this.width  = width;
	this.height = height;
	this.min_x  = min_x;
	this.max_x  = max_x;
	this.size_x = this.max_x - this.min_x;
	this.fact_x = this.width / this.size_x;
	this.min_y  = min_y;
	this.max_y  = max_y;
	this.size_y = this.max_y - this.min_y;
	this.fact_y = this.height / this.size_y;
}
GridIndex.uid = 0;

GridIndex.prototype.add = function(object) {
	var cachedIndex  = this.cachedIndexOf(object);
	var currentIndex = this.currentIndexOf(object);
	if (cachedIndex === currentIndex || currentIndex === -1) return this;

	this.removeAtIndex(cachedIndex, object);

	if (!object.gridIndex) {
		object.gridIndex = [];
	}
	object.gridIndex[this.uid] = currentIndex;

	var cells = this.cells[currentIndex];
	if (!cells) {
		cells = this.cells[currentIndex] = [];
	}
	cells.push(object);
	return this;
};

GridIndex.prototype.remove = function(object) {
	var cachedIndex = this.cachedIndexOf(object);
	return this.removeAtIndex(cachedIndex, object);
};

GridIndex.prototype.removeAtIndex = function(index, object) {
	var cells = this.cells[index];
	if (cells) {
		this.cells[index] = _.without_element(cells, object);
	}
	return this;
};

GridIndex.prototype.localLookup = function(x, y, maxDistance, filter) {
	maxDistance || (maxDistance = Math.max(width, height) * 2);
	filter || (filter = function(o) { return true; });

	var dSqr = maxDistance * maxDistance;
	var cell = this.cellFromPosition(x, y);
	if (!cell) return [];

	var results = [];
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			var cX = cell.x + i;
			var cY = cell.y + j;
			if (cX >= 0 && cX < this.width && cY >= 0 && cY < this.height) {
				var index = cY * this.width + cX;
				var cells = this.cells[index];
				if (cells) {
					for (var k = 0; k < cells.length; k++) {
						var o = cells[k];
						var d = (o.x - x) * (o.x - x) + (o.y - y) * (o.y - y);
						if (d < dSqr && filter(o)) {
							results.push(o);
						}
					}
				}
			}
		}
	}
	return results;
};

GridIndex.prototype.cachedIndexOf = function(object) {
	return (object && object.gridIndex && object.gridIndex[this.uid]) ?
		object.gridIndex[this.uid] :
		-1;
};

GridIndex.prototype.currentIndexOf = function(object) {
	return this.indexFromPosition(object.x, object.y);
};

GridIndex.prototype.cellFromPosition = function(x, y) {
	// Convert arguments to numbers.
	x -= 0.0;
	y -= 0.0;

	// Check that we got numbers (otherwise they're undefined, NaN, or the like).
	if (!(x === x && y === y)) return null;

	// Calculate the cell position.
	var cellX = ((x - this.min_x) * this.fact_x) | 0;
	var cellY = ((y - this.min_y) * this.fact_y) | 0;

	// If out of bounds, don't index the object.
	if (cellX < 0 || cellX >= this.width ||
	    cellY < 0 || cellY >= this.height) {
		return null;
	}

	return { x : cellX, y : cellY };
};

GridIndex.prototype.indexFromPosition = function(x, y) {
	var cell = this.cellFromPosition(x, y);
	return cell ? cell.y * this.width + cell.x : -1;
};
