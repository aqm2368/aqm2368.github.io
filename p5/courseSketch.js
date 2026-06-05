let shaders;
let squares = [];
let size = 100; let cols = window.screen.width / size; let rows = window.screen.height / size;
let side1;
let startDepth = 10;

function preload() {
    shaders = loadShader(
        'assets/towers.vert',
        'assets/towers.frag'
    );
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL);

    rectMode(CENTER);
    angleMode(DEGREES);

    for(let i = 0; i < cols; i++) {
        squares[i] = [];
        for(let j = 0; j < rows; j++) {
            squares[i][j] = new Rectangle(size * i - width/2, size * j - height/2, i, j);
        }
    }

    side1 = createGraphics(size, size);
    side1.background('black');

    //shader(shaders);
}

function draw() {
    //clear();
    shader(shaders);
    shaders.setUniform("startDepth", startDepth);
    shaders.setUniform("size", size);
    // shaders.setUniform("cameraZ", cam.eye.z);
    background(255);
    for(let i = 0; i < cols; i++) {
        for ( let j = 0; j < rows; j++) {
            // squares[i][j].move();
            squares[i][j].display();
        }
    }
    //rect(0, 0, 200, 200);
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    // cols = window.innerWidth / size; rows = window.innerHeight / size;
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            squares[i][j].x = size * i - width/2;
            squares[i][j].y = size * j - height/2;
        }
    }
}

class Rectangle {
    constructor(x, y, i, j) {
        this.x = x;
        this.y = y;
        this.i = i;
        this.j = j;
        this.z = startDepth + (size * 2 * noise(this.x, this.y, millis()/4000)) - size;
    }

    display() {
        // texture(side1);
        // noFill();
        let color = ('#00e1ff')
        color = 'black';
        stroke(color);
        noStroke();
        // strokeWeight(0.5);
        push();
        this.z = lerp(this.z, startDepth + (size * 2 * noise(this.x, this.y, millis()/4000)) - size, 0.5);
        this.z = lerp(this.z, squares[(this.i + 1) % squares.length][this.j].z, 0.1);
        this.z = lerp(this.z, squares[(this.i - 1 + squares.length) % squares.length][this.j].z, 0.1);
        this.z = lerp(this.z, squares[this.i][(this.j + 1) % squares[this.i].length].z, 0.1);
        this.z = lerp(this.z, squares[this.i][(this.j - 1 + squares[this.i].length) % squares[this.i].length].z, 0.1);
        translate(this.x, this.y, this.z);
        box(size, size, size * 2);
        pop();
    }
}