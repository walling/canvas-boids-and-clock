
// Bootstrap super light-weight Underscore.js if not already included.
if (!window._) {
	window._ = {};
	window._.mixin = function(mixins) {
		for (var name in mixins) {
			if (mixins.hasOwnProperty(name)) {
				window._[name] = mixins[name];
			}
		}
	};
}

// Add some nice utility functions.
_.mixin({

	/**
	 * Removes the first occurrance of an element in the given array in-place.
	 * If the element is not found, the array is returned untouched.
	 */
	without_element: function(array, element) {
		var index = array.indexOf(element);
		if (index !== -1) {
			array.splice(index, 1);
		}
		return array;
	},

	easeInOut: function(t) {
		return -0.5 * (Math.cos(Math.PI * _.inInterval(t, 0, 1)) - 1);
	},

	minDigits: function(value, digits) {
		value = '' + value;
		if (value.length >= digits) {
			return value;
		} else {
			return new Array(digits - value.length + 1).join('0') + value;
		}
	},

	randomInt: function(min, max) {
		return min + (Math.random() * (max - min + 1) | 0);
	},

	randomColor: function() {
		return 'rgb(' +
			_.randomInt(0, 255) + ', ' +
			_.randomInt(0, 255) + ', ' +
			_.randomInt(0, 255) + ')';
	},

	sq: function(n) {
		return n * n;
	},

	normalized: function(vector) {
		var l = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		if (l <= 0) {
			return { x : 1, y : 0 };
		} else {
			return { x : vector.x / l, y : vector.y / l };
		}
	},

	dot: function(vec1, vec2) {
		return vec1.x * vec2.x + vec1.y * vec2.y;
	},

	inInterval: function(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

});
