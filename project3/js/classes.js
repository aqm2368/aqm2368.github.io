class Ship extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0) {
        super(texture);
        this.invincible = false;
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }

    hit(time = 2) {
        let elapsedTime = 0;
        this.invincible = true;

        const hitFade = (ticker) => {
            if(!this.invincible) {
                this.alpha = 1;
                this.invincible = false;
                app.ticker.remove(hitFade);
            }

            if(getPaused()) return;

            elapsedTime += ticker.elapsedMS / 1000;
            // console.log(elapsedTime);
            let t = lerp(0, time, elapsedTime);

            this.alpha = (1 + Math.sin((t * Math.pow(Math.E, (t+3)/2))))/2;

            if(elapsedTime >= time) {
                this.alpha = 1;
                this.invincible = false;
                app.ticker.remove(hitFade);
            }
        };

        app.ticker.add(hitFade);
    }
}
class Background extends PIXI.Sprite {
    constructor(texture, screenWidth = 1066, screenHeight = 900, speed, zIndex) {
        super(texture);
        this.x = 0;
        this.y = 0;
        this.anchor.set(0, 0.5);
        this.screenWidth = 1066;
        this.screenHeight = 900;
        this.maxSpeed = speed;
        this.speed = speed;
        this.zIndex = zIndex;
    }

    move(dt = 1 / 60) {
        this.y += this.speed * dt;
        if(this.y >= this.screenHeight) {
            this.y -= this.screenHeight;
        }
    }

    halfSpeed(time = 2) {
        let elapsedTime = 0;

        const lowerSpeed = (ticker) => {
            if(!getPaused()) {
                this.doubleSpeed();
                app.ticker.remove(lowerSpeed);
                return;
            }

            elapsedTime += ticker.elapsedMS / 1000;
            // console.log(elapsedTime);
            let t = lerp(0, time, elapsedTime);

            this.speed = lerp(this.maxSpeed, this.maxSpeed/2, t);

            if(elapsedTime >= time) {
                this.speed = this.maxSpeed / 2;
                app.ticker.remove(lowerSpeed);
            }
        };

        app.ticker.add(lowerSpeed);
    }

    doubleSpeed(time = 2) {
        let elapsedTime = 0;

        const raiseSpeed = (ticker) => {
            if(getPaused()) {
                this.halfSpeed();
                app.ticker.remove(raiseSpeed);
            }

            elapsedTime += ticker.elapsedMS / 1000;
            // console.log(elapsedTime);
            let t = lerp(0, time, elapsedTime);

            this.speed = lerp(this.maxSpeed/2, this.maxSpeed, t);

            if(elapsedTime >= time) {
                this.speed = this.maxSpeed;
                app.ticker.remove(raiseSpeed);
            }
        };

        app.ticker.add(raiseSpeed);
    }
}

class Asteroid extends PIXI.Sprite {
    constructor(texture, x = 300, y = 300) {
        super(texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(1);
        this.isAlive = true;
        this.x = x;
        this.y = y;
        this.fwd = { x: 1, y: 0 };
        this.speed = 150;
        this.rotationSpeed = 0.5;
        this.zIndex = -10;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        this.rotation += this.rotationSpeed * dt;
    }
}

class Circle extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
        super();
        this.circle(x, y, radius);
        this.fill(color);

        let gap = 2;
        let gapRadius = radius;

        this.circle(x, y, radius / 2);
        this.rect(x - gap, y - gapRadius, gap * 2, gapRadius * 2);
        this.rect(x - gapRadius, y - gap, gapRadius * 2, gap * 2);
        this.fill(0x000000);

        this.circle(x, y, 1.5);
        this.fill(0xFFFFFF);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = getRandomUnitVector();
        this.speed = 100;
        this.rotationSpeed = Math.sign((Math.random() * 2 - 1)) * 30;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        this.rotation += this.rotationSpeed * dt * Math.random();
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Triangle extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
        super();
        this.poly([x - radius, y + radius/1.5,    x, y - radius/0.75,    x + radius, y + radius/1.5]);
        this.fill(color);

        let gap = 2;
        let gapRadius = radius;

        this.circle(x, y, radius / 2.2);
        this.fill(0x000000);

        this.circle(x, y, 2);
        this.fill(0xFF0000);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = getRandomUnitVector();
        this.speed = 200;
        // this.rotationSpeed = Math.sign((Math.random() * 2 - 1)) * 30;
        this.isAlive = true;
    }

    move(dt = 1 / 60, ship) {
        let newFwd = normalize({ x: (ship.x - this.x), y: (ship.y - this.y)});
        let t = 0.4;
        this.fwd.x = lerp(this.fwd.x, newFwd.x, t);
        this.fwd.y = lerp(this.fwd.y, newFwd.y, t);
        this.x += this.fwd.x * this.speed * dt * 0.1 * Math.floor(Math.random() * 7 + 3);
        this.y += this.fwd.y * this.speed * dt * 0.1 * Math.floor(Math.random() * 7 + 3);
        this.rotation = Math.atan2(newFwd.y, newFwd.x) + Math.PI / 2;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Donut extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
        super();
        this.circle(x, y, radius);
        this.fill(color);

        let gap = 2;
        let gapRadius = radius;

        this.circle(x, y, radius / 2);
        // this.rect(x - gap, y - gapRadius, gap * 2, gapRadius * 2);
        this.fill(0x000000);
        this.rect(x - gapRadius, y - gap, gapRadius * 2, gap * 2);
        this.fill(0xffffff);

        this.circle(x, y, 1);
        this.fill(0x000000);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.rotationSpeed = 60;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        this.rotation += this.rotationSpeed * dt * Math.random();
    }

    teleportX(x = 0) {
        this.x = x;
    }

    teleportY(y = 0) {
        this.y = y;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xffffff, x = 0, y = 0) {
        super();
        this.rect(-2, -3, 4, 6);
        this.fill(color);
        this.x = x;
        this.y = y;
        this.fwd = { x: 0, y: -1 };
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}