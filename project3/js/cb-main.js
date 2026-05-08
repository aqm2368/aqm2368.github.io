// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

const prefix = "aqm2368-";
const highScorePrefix = "highScore";
if(!localStorage.getItem(prefix + highScorePrefix)) {
    localStorage.setItem(prefix + highScorePrefix, 0);
}

let sceneWidth, sceneHeight;

// aliases
let stage;
let assets;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, gameOverScoreLabel, gameOverHighScoreLabel, shootSound, hitSound, fireballSound;
let gameOverScene;

let background, stars1, stars2, stars3, stars4;

let circles = [];
let donuts = [];
let bullets = [];
let aliens = [];
let triangles = [];
let asteroids = [];
let explosions = [];
let explosionTextures;
let score = 0;
let highScore = parseInt(localStorage.getItem(prefix + highScorePrefix));
let life = 0;
let levelNum = 1;
let paused = true;
let sideFire = true;
let asteroidTimer = 0;
function getPaused() { return paused; }

const alphaCorsaItalic = new FontFace("Alpha Corsa Italic", "url(media/alphacorsa-italic.ttf)");
const alphaCorsa = new FontFace("Alpha Corsa", "url(media/alphacorsa.ttf)");

// Load all assets
loadImages();

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
    PIXI.Assets.addBundle("sprites", {
        spaceship: "media/spaceship-recolored.png",
        explosions: "media/explosions.png",
        move: "media/move.png",
        asteroid: "media/asteroid.png",
        background: "media/space-background.png",
        stars1: "media/space-stars-1.png",
        stars2: "media/space-stars-2.png",
        stars3: "media/space-stars-3.png",
        stars4: "media/space-stars-4.png",
    });

  // The second argument is a callback function that is called whenever the loader makes progress.
    assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
        console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
    });

    await alphaCorsa.load();
    await alphaCorsaItalic.load();

    document.fonts.add(alphaCorsa);
    document.fonts.add(alphaCorsaItalic);

    setup();
}

async function setup() {
    await app.init({ width: 1066, height: 600 });

    document.querySelector(".game").appendChild(app.canvas);

    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;

    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create ship
    ship = new Ship(assets.spaceship);
    ship.zIndex = 1;
    gameScene.addChild(ship);

    // #6 - Load Sounds
    shootSound = new Howl({
        src: ["sounds/shoot.wav"],
    });

    hitSound = new Howl({
        src: ["sounds/hit.mp3"],
    });

    fireballSound = new Howl({
        src: ["sounds/fireball.mp3"],
    });

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    let baseSpeed = 40;
    let exponent = 2.6;
    background = new Background(assets.background, sceneWidth, sceneHeight, baseSpeed * Math.pow(1, exponent), -15);
    stars1 = new Background(assets.stars1, sceneWidth, sceneHeight, baseSpeed * Math.pow(2, exponent), -14);
    stars2 = new Background(assets.stars2, sceneWidth, sceneHeight, baseSpeed * Math.pow(3, exponent), -13);
    stars3 = new Background(assets.stars3, sceneWidth, sceneHeight, baseSpeed * Math.pow(4, exponent), -12);
    stars4 = new Background(assets.stars4, sceneWidth, sceneHeight, baseSpeed * Math.pow(5, exponent), 100);
    // halfSpeed();
    changeBackgroundScene(startScene);

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas
    window.addEventListener('keydown', (e) => {
        if(!gameScene.visible) return;

        if(e.repeat) return;
        
        if (e.key === 'w') {
            fireBullet();
        }
        else if(e.key === 'a' && sideFire) {
            fireBulletLeft();
        }
        else if(e.key === 'd' && sideFire) {
            fireBulletRight();
        }
        else if (e.key === 'Escape') {
            paused = !paused;
            if(paused) {
                for(let e of explosions) {
                    e.stop();
                }
            }
            else {
                for(let e of explosions) {
                    e.play();
                }
            }
        }
    });

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

function createLabelsAndButtons() {
    let buttonStyle = {
        fill: 0x000000,
        stroke: {
            color: 0xffffff,
            width: 3,
            join: 'miter',
            alignment: 1,
        },
        fontSize: 48,
        fontFamily: "Alpha Corsa"
    };

    let headerStyle = {
        fill: 0xAE00FF,
        fontSize: 96,
        fontFamily: "Alpha Corsa Italic",
        stroke: {
        width: 4,
        color: 0x000000,
        join: 'miter',
        alignment: 1,
        },
    }
    let headerBackgroundStyle = {
        fill: 0x9900FF,
        fontSize: 96,
        fontFamily: "Alpha Corsa Italic",
        stroke: {
        width: 8,
        color: 0xffffff,
        join: 'miter',
        alignment: 1,
        },
    }

    let startLabel1 = new PIXI.Text("STAR CHASER", headerStyle);
    let startLabel1Background = new PIXI.Text("STAR CHASER", headerBackgroundStyle);
    startLabel1.x = sceneWidth / 2 - startLabel1.width / 2;
    startLabel1.y = 220;
    startLabel1Background.x = sceneWidth / 2 - startLabel1Background.width / 2;
    startLabel1Background.y = startLabel1.y - 2;
    startScene.addChild(startLabel1Background);
    startScene.addChild(startLabel1);

    // let startLabel2 = new PIXI.Text("Ayele Moore", {
    //     fill: 0xffffff,
    //     fontSize: 32,
    //     fontFamily: "Lexend",
    //     fontStyle: "Italic",
    //     stroke: 0xff0000,
    //     strokeThickness: 6
    // });
    // startLabel2.x = sceneWidth / 2 - startLabel2.width / 2;
    // startLabel2.y = 300;
    // startScene.addChild(startLabel2);

    let startButton = new PIXI.Text("PLAY", buttonStyle);
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = 360;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", (e) => (e.currentTarget.alpha = 0.7));
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));  
    startScene.addChild(startButton);  

    let textStyle = {
        fill: 0x000000,
        stroke: {
            color: 0xBD5BFF,
            width: 3,
            join: 'miter',
            alignment: 1,
        },
        fontSize: 18,
        fontFamily: "Alpha Corsa"
    };

    scoreLabel = new PIXI.Text("", textStyle);
    scoreLabel.zIndex = 10;
    scoreLabel.x = 20;
    scoreLabel.y = 20;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    lifeLabel = new PIXI.Text("", textStyle);
    lifeLabel.zIndex = 10;
    lifeLabel.x = 20;
    lifeLabel.y = 46;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // 3 - set up `gameOverScene`
    // 3A - make game over text

    let gameOverStyle = {
        fill: 0xAE00FF,
        fontSize: 84,
        fontFamily: "Alpha Corsa",
        stroke: {
        width: 4,
        color: 0x000000,
        join: 'miter',
        alignment: 1,
        },
    }
    let gameOverBackgroundStyle = {
        fill: 0x9900FF,
        fontSize: 84,
        fontFamily: "Alpha Corsa",
        stroke: {
        width: 8,
        color: 0xffffff,
        join: 'miter',
        alignment: 1,
        },
    }

    let gameOverText = new PIXI.Text("GAME OVER", gameOverStyle);
    let gameOverTextBackground = new PIXI.Text("GAME OVER", gameOverBackgroundStyle);
    gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverText.y = 220;
    gameOverTextBackground.x = sceneWidth / 2 - gameOverTextBackground.width / 2;
    gameOverTextBackground.y = gameOverText.y - 2;
    gameOverScene.addChild(gameOverTextBackground);
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("PLAY AGAIN?", buttonStyle);
    playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
    playAgainButton.y = 450;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
    playAgainButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); // ditto
    gameOverScene.addChild(playAgainButton);

    gameOverScoreLabel = new PIXI.Text("", {
        fill: 0x000000,
        stroke: {
            color: 0xBD5BFF,
            width: 3,
            join: 'miter',
            alignment: 1,
        },
        fontSize: 28,
        fontFamily: "Alpha Corsa"
    });
    gameOverHighScoreLabel = new PIXI.Text("", {
        fill: 0x000000,
        stroke: {
            color: 0xBD5BFF,
            width: 3,
            join: 'miter',
            alignment: 1,
        },
        fontSize: 28,
        fontFamily: "Alpha Corsa"
    });
    gameOverScoreLabel.x = sceneWidth / 2 - gameOverScoreLabel.width / 2;
    gameOverScoreLabel.y = gameOverText.y + 90;
    gameOverHighScoreLabel.y = gameOverScoreLabel.y + 40;

    gameOverScene.addChild(gameOverScoreLabel);
    gameOverScene.addChild(gameOverHighScoreLabel);
}

function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `sCORE:   ${score}`;
}

function decreaseLifeBy(value) {
    if(ship && ship.invincible) {
        life = parseInt(life);
        lifeLabel.text = `LIFE:      ${life}%`
        return;
    }

    life -= value;
    life = parseInt(life);
    lifeLabel.text = `LIFE:      ${life}%`
    if(value !== 0)
        ship.hit();
}

function startGame() {
    // doubleSpeed();
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    changeBackgroundScene(gameScene);
    paused = false;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    loadLevel();

    // setTimeout(() => {
    //    paused = false; 
    // }, 50);
}

function gameLoop(){
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    if(paused && life > 0) return;
    
    background.move(dt);
    stars1.move(dt);
    stars2.move(dt);
    stars3.move(dt);
    stars4.move(dt); 

    if (paused) return; // keep this commented out for now

    // #2 - Move Ship
    let mousePosition = app.renderer.events.pointer.global;
    // ship.position = mousePosition;

    let amt = 20 * dt;

    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);

    let w2 = ship.width / 2;
    let h2 = ship.height / 2;
    ship.x = clamp(newX, 0 + w2, sceneWidth - w2);
    ship.y = clamp(newY, 0 + h2, sceneHeight - h2);

    // #3 - Move Circles
    for (let c of circles) {
        c.move(dt);
        if (c.x <= c.radius || c.x >= sceneWidth - c.radius) {
            c.reflectX();
            c.move(dt);
        }
        if (c.y <= c.radius || c.y >= sceneHeight - c.radius) {
            c.reflectY();
            c.move(dt);
        }
    }

    for (let t of triangles) {
        t.move(dt, ship);
        if (t.x <= t.radius || t.x >= sceneWidth - t.radius) {
            t.reflectX();
            t.move(dt, ship);
        }
        if (t.y <= t.radius || t.y >= sceneHeight - t.radius) {
            t.reflectY();
            t.move(dt, ship);
        }
    }

    for (let d of donuts) {
        d.move(dt);
        if (d.x <= d.radius * -2)
            d.teleportX(sceneWidth + d.radius * 2);
        else if(d.x >= sceneWidth + d.radius * 2)
            d.teleportX(d.radius * -2);

        if (d.y <= d.radius * -2)
            d.teleportY(sceneHeight + d.radius * 2);
        else if(d.y >= sceneHeight + d.radius * 2)
            d.teleportY(d.radius * -2);

        d.move(dt);
    }

    for (let a of asteroids) {
        a.move(dt);
        let rangeScale = 1.5;
        if (a.x <= a.height * -rangeScale || a.x >= sceneWidth + rangeScale * a.height || a.y <= a.height * -rangeScale || a.y >= sceneHeight + rangeScale * a.height) {
            a.isAlive = false;
            gameScene.removeChild(a);
        }
    }

    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }

    // #5 - Check for Collisions
    for (let c of circles) {
        for (let b of bullets) {
            if (rectsIntersect(c, b)) {
                fireballSound.play();
                createExplosion(c.x, c.y, 64, 64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }
        }

        if (c.isAlive && rectIntersectsShip(c, ship)) {
            fireballSound.play();
            createExplosion(c.x, c.y, 64, 64);
            if(!ship.invincible)
                hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }

    for (let t of triangles) {
        for (let b of bullets) {
            if (rectsIntersect(t, b)) {
                fireballSound.play();
                createExplosion(t.x, t.y, 64, 64);
                gameScene.removeChild(t);
                t.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }
        }

        if (t.isAlive && rectIntersectsShip(t, ship)) {
            fireballSound.play();
            createExplosion(t.x, t.y, 64, 64);
            if(!ship.invincible)
                hitSound.play();
            gameScene.removeChild(t);
            t.isAlive = false;
            decreaseLifeBy(20);
        }
    }

    for (let d of donuts) {
        for (let b of bullets) {
            if (rectsIntersect(d, b)) {
                fireballSound.play();
                createExplosion(d.x, d.y, 64, 64);
                gameScene.removeChild(d);
                d.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }
        }

        if (d.isAlive && rectIntersectsShip(d, ship)) {
            fireballSound.play();
            createExplosion(d.x, d.y, 64, 64);
            if(!ship.invincible)
                hitSound.play();
            gameScene.removeChild(d);
            d.isAlive = false;
            decreaseLifeBy(20);
        }
    }

    for (let a of asteroids) {
        for(let c of circles) {
            if (rectsIntersectAsteroid(c, a)) {
                fireballSound.play();
                createExplosion(c.x, c.y, 64, 64);
                gameScene.removeChild(c);
                c.isAlive = false;
                break;
            }
        }

        for(let d of donuts) {
            if (rectsIntersectAsteroid(d, a)) {
                fireballSound.play();
                createExplosion(d.x, d.y, 64, 64);
                gameScene.removeChild(d);
                d.isAlive = false;
                break;
            }
        }

        for(let b of bullets) {
            if (rectsIntersectAsteroid(b, a)) {
                createTinyExplosion(b.x, b.y, 64, 64);
                gameScene.removeChild(b);
                b.isAlive = false;
                break;
            }
        }

        if (a.isAlive && shipIntersectAsteroid(ship, a)) {
            if(!ship.invincible) {
                hitSound.play();
            }
            decreaseLifeBy(40);
        }
    }

    if(asteroids.length == 0) {
        asteroidTimer += dt;
        if(asteroidTimer >= 3) {
            createAsteroid();
            asteroidTimer = 0;
        }
    }
    else 
        asteroidTimer = 0;

    // #6 - Now do some clean up
    bullets = bullets.filter((b) => b.isAlive);

    circles = circles.filter((c) => c.isAlive);

    asteroids = asteroids.filter((a) => a.isAlive);

    triangles = triangles.filter((t) => t.isAlive);

    donuts = donuts.filter((d) => d.isAlive);
    
    explosions = explosions.filter((e) => e.playing);

    // #7 - Is game over?
    if (life <= 0) {
        end();
        return;
    }

    // #8 - Load next level
    if (circles.length == 0 && donuts.length == 0 && triangles.length == 0) {
        levelNum++;
        loadLevel();
    }
}

function end() {
    paused = true;
    // halfSpeed();
    ship.invincible = false;

    circles.forEach((c) => gameScene.removeChild(c));
    circles = [];

    donuts.forEach((d) => gameScene.removeChild(d));
    donuts = [];

    asteroids.forEach((a) => gameScene.removeChild(a));
    asteroids = [];

    triangles.forEach((t) => gameScene.removeChild(t));
    triangles = [];

    bullets.forEach((b) => gameScene.removeChild(b));
    bullets = [];

    explosions.forEach((e) => gameScene.removeChild(e));
    explosions = [];

    app.view.onclick = null;

    score = parseInt(score);
    if(score > highScore) {
        highScore = score;
        localStorage.setItem(prefix + highScorePrefix, highScore);
    }

    gameOverScoreLabel.text = `FINAL sCORE: ${score}`;
    gameOverScoreLabel.x = sceneWidth / 2 - gameOverScoreLabel.width / 2;

    gameOverHighScoreLabel.text = `HIGH sCORE: ${highScore}`;
    gameOverHighScoreLabel.x = sceneWidth / 2 - gameOverHighScoreLabel.width / 2;

    gameOverScene.visible = true;
    changeBackgroundScene(gameOverScene);
    gameScene.visible = false;
}

function createCircles(numCircles = 10) {
    for (let i = 0; i < numCircles; i++) {
        let c = new Circle(10, 0xFF00A1);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function createDonuts(numCircles = 10) {
    for (let i = 0; i < numCircles; i++) {
        let d = new Donut(10, 0x4D00B8);
        d.x = Math.random() * (sceneWidth - 50) + 25;
        d.y = Math.random() * (sceneHeight - 400) + 25;
        donuts.push(d);
        gameScene.addChild(d);
    }
}

function fireBullet() {
    if (paused) return;

    let b = new Bullet(0xffffff, ship.x, ship.y);
    b.zIndex = 0;
    bullets.push(b);
    gameScene.addChild(b);

    if(score >= 5) {
        let heightOffset = 10;
        let widthOffset = 4;
        let bLeft = new Bullet(0xffffff, ship.getBounds().minX + widthOffset, ship.y + heightOffset);
        bLeft.zIndex = 0;
        let bRight = new Bullet(0xffffff, ship.getBounds().maxX - widthOffset, ship.y + heightOffset);
        bRight.zIndex = 0;
        bullets.push(bLeft);
        bullets.push(bRight);
        gameScene.addChild(bLeft);
        gameScene.addChild(bRight);
    }

    shootSound.play();
}
function fireBulletLeft() {
    if (paused) return;

    let b = new Bullet(0xffffff, ship.x, ship.y);
    b.fwd = { x: -1, y: 1 };
    bullets.push(b);
    gameScene.addChild(b);

    shootSound.play();
}
function fireBulletRight() {
    if (paused) return;

    let b = new Bullet(0xffffff, ship.x, ship.y);
    b.fwd = { x: 1, y: 1 };
    bullets.push(b);
    gameScene.addChild(b);

    shootSound.play();
}

function loadLevel(){
    createCircles(levelNum * 5);
    createDonuts(levelNum * 5);
    createTriangles(levelNum * 2);
}

function loadSpriteSheet() {
    let spriteSheet = PIXI.Texture.from("media/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++)
    {
        let frame = new PIXI.Texture({
            source: spriteSheet,
            frame: new PIXI.Rectangle(i * width, 64, width, height),
        });
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = () => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

function createTinyExplosion(x, y, frameWidth, frameHeight) {
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 10;
    expl.loop = false;
    expl.onComplete = () => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

function createAsteroid() {
    let x, y;
    let fwd;

    switch(Math.floor(Math.random() * 4) + 1) {
        case (1) : {
            x = -200;
            y = Math.floor(Math.random() * (sceneHeight - 100)) + 100;
            fwd = { x: 1, y: Math.floor(Math.random() * 3) * 0.1 };
            break;
        }
        case (2) : {
            x = 200 + sceneWidth;
            y = Math.floor(Math.random() * (sceneHeight - 100)) + 100;
            fwd = { x: -1, y: Math.floor(Math.random() * 3) * 0.1 };
            break;
        }
        case (3) : {
            x = Math.floor(Math.random() * (sceneWidth - 100)) + 100;
            y = -300;
            fwd = { x: Math.floor(Math.random() * 4) * 0.1, y: 1};
            break;
        }
        case (4) : {
            x = Math.floor(Math.random() * (sceneWidth - 100)) + 100;
            y = 300 + sceneHeight;
            fwd = { x: Math.floor(Math.random() * 4) * 0.1, y: -1};
            break;
        }
    }
    let a = new Asteroid(assets.asteroid, x, y);
    a.fwd = fwd;
    asteroids.push(a);
    gameScene.addChild(a);
}

function createTriangles(numCircles = 10) {
    for (let i = 0; i < numCircles; i++) {
        let t = new Triangle(10, 0xFF0000);
        t.x = Math.random() * (sceneWidth - 50) + 25;
        t.y = Math.random() * (sceneHeight - 400) + 25;
        triangles.push(t);
        gameScene.addChild(t);
    }
}

function changeBackgroundScene(scene) {
    scene.addChild(background, stars1, stars2, stars3, stars4);
}

function doubleSpeed() {
    background.doubleSpeed();
    stars1.doubleSpeed();
    stars2.doubleSpeed();
    stars3.doubleSpeed();
    stars4.doubleSpeed();
}

function halfSpeed() {
    background.halfSpeed();
    stars1.halfSpeed();
    stars2.halfSpeed();
    stars3.halfSpeed();
    stars4.halfSpeed();
}