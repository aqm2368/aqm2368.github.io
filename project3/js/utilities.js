	// http://paulbourke.net/miscellaneous/interpolation/
	
	// we use this to interpolate the ship towards the mouse position
	function lerp(start, end, amt){
  		return start * (1-amt) + amt * end;
	}
	
	// we didn't use this one
	function cosineInterpolate(y1, y2, amt){
  		let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
  		return (y1 * (1 - amt2)) + (y2 * amt2);
	}
	
	// we use this to keep the ship on the screen
	function clamp(val, min, max){
        return val < min ? min : (val > max ? max : val);
    }
    
    // bounding box collision detection - it compares PIXI.Rectangles
	function rectsIntersect(a,b){
		var ab = a.getBounds();
		var bb = b.getBounds();
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	}

	function rectIntersectsShip(a, ship) {
		var ab = a.getBounds();
		var bb = ship.getBounds();
		const fullWidth = bb.width;
		const fullHeight = bb.height;
		bb.width = fullWidth / 4;
		bb.height = fullHeight / 4;
		bb.x += (fullWidth - bb.width) / 2;
		bb.y += (fullHeight - bb.height) / 2;
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	}

	function rectsIntersectAsteroid(a, asteroid) {
		var ab = a.getBounds();
		var bb = asteroid.getBounds();
		const fullWidth = bb.width;
		const fullHeight = bb.height;
		bb.width = fullWidth / 1.5;
		bb.height = fullHeight / 1.5;
		bb.x += (fullWidth - bb.width) / 2;
		bb.y += (fullHeight - bb.height) / 2;
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	}

	function shipIntersectAsteroid(ship, asteroid) {
		var ab = ship.getBounds();
		const fullWidthAB = ab.width;
		const fullHeightAB = ab.height;
		ab.width = fullWidthAB / 4;
		ab.height = fullHeightAB / 4;
		ab.x += (fullWidthAB - ab.width) / 2;
		ab.y += (fullHeightAB - ab.height) / 2;

		var bb = asteroid.getBounds();
		const fullWidthBB = bb.width;
		const fullHeightBB = bb.height;
		bb.width = fullWidthBB / 1.5;
		bb.height = fullHeightBB / 1.5;
		bb.x += (fullWidthBB - bb.width) / 2;
		bb.y += (fullHeightBB - bb.height) / 2;
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	}
	
	// these 2 helpers are used by classes.js
	function getRandomUnitVector(){
		let x = getRandom(-1,1);
		let y = getRandom(-1,1);
		let length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}
	
		return {x:x, y:y};
	}

	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
	}

	function normalize(fwd) {
		const magnitude = Math.sqrt(Math.pow(fwd.x, 2) + Math.pow(fwd.y, 2));

		fwd.x /= magnitude;
		fwd.y /= magnitude;

		return fwd;
	}