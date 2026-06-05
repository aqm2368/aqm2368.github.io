let shaders;
let squares = [];
let initSize = 124 * 0.9;
let size = initSize; let cols = window.screen.width / size; let rows = window.screen.height / size;
let side1;
let startDepth = -100;
let mouseRange = 80;
let horizontalShift = -(cols * size)/2 + size * (cols % 1) / 2;
let verticalShift = -(rows * size)/2 + size * (rows % 1) / 2;

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

    size = initSize * 1.25 / (window.devicePixelRatio);

    for(let i = 0; i < cols; i++) {
        squares[i] = [];
        for(let j = 0; j < rows; j++) {
            squares[i][j] = new Rectangle(size * i - (cols * size)/2 + size * (cols % 1) / 2, size * j - (rows * size)/2 + size * (rows % 1) / 2, i, j);
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
    background(0);
    horizontalShift = -(cols * size)/2 + size * (cols % 1) / 2;
    verticalShift = -(rows * size)/2 + size * (rows % 1) / 2;
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
    size = initSize * 1.25 / (window.devicePixelRatio);
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            squares[i][j].x = size * i - (cols * size)/2 + size * (cols % 1) / 2;
            squares[i][j].y = size * j - (rows * size)/2 + size * (rows % 1) / 2;
        }
    }
}

class Rectangle {
    constructor(x, y, i, j) {
        this.x = x;
        this.y = y;
        this.i = i;
        this.j = j;
        this.z = startDepth + (size * 2 * noise(this.x - horizontalShift, this.y - verticalShift, millis()/4000)) - size;
    }

    display() {
        // texture(side1);
        // noFill();
        let color = ('#00e1ff');
        color = 'black';
        // stroke(color);
        //noStroke();
        strokeWeight(0.7);
        // push();
        if((mouseX - width/2 - this.x * 1.00)*(mouseX - width/2 - this.x * 1.00) + (mouseY - height/2 - this.y)*(mouseY - height/2 - this.y) < mouseRange*mouseRange) {
            this.z = lerp(this.z, startDepth + size * 2 - size, 0.1);

            let t = 0.4;

            let indexC = (this.i + 1) % squares.length;
            let indexR = this.j; 
            squares[indexC][indexR].z = lerp(squares[indexC][indexR].z, startDepth + size * 2 - size, t);

            indexC = (this.i - 1 + squares.length) % squares.length;
            squares[indexC][indexR].z = lerp(squares[indexC][indexR].z, startDepth + size * 2 - size, t);

            indexC = this.i;
            indexR = (this.j + 1) % squares[this.i].length
            squares[indexC][indexR].z = lerp(squares[indexC][indexR].z, startDepth + size * 2 - size, t);

            indexR = (this.j - 1 + squares[this.i].length) % squares[this.i].length;
            squares[indexC][indexR].z = lerp(squares[indexC][indexR].z, startDepth + size * 2 - size, t);;
        } else {
            this.z = lerp(this.z, startDepth + (size * 2 * noise(this.x - horizontalShift, this.y - verticalShift, millis()/4000)) - size, 0.5);
            this.z = lerp(
                this.z,
                (
                    squares[(this.i + 1) % squares.length][this.j].z + 
                    squares[(this.i - 1 + squares.length) % squares.length][this.j].z +
                    squares[this.i][(this.j + 1) % squares[this.i].length].z + 
                    squares[this.i][(this.j - 1 + squares[this.i].length) % squares[this.i].length].z
                ) / 4, 
                0.6
            );
        }
        push();
        translate(this.x, this.y, this.z);
        box(size, size, size * 2);
        pop();
    }
}

// let shaders;
// let squares = [];

// let size = 110;
// let cols = Math.ceil(window.innerWidth / size);
// let rows = Math.ceil(window.innerHeight / size);

// let side1;

// let startDepth = -60;
// let mouseRange = 78;
// let mouseRangeSq;

// let mx, my;
// let noiseTime;

// function preload() {
//     shaders = loadShader(
//         'assets/towers.vert',
//         'assets/towers.frag'
//     );
// }

// function setup() {
//     createCanvas(window.innerWidth, window.innerHeight, WEBGL);

//     rectMode(CENTER);
//     angleMode(DEGREES);

//     mouseRangeSq = mouseRange * mouseRange;

//     for(let i = 0; i < cols; i++) {
//         squares[i] = [];

//         for(let j = 0; j < rows; j++) {

//             squares[i][j] = new Rectangle(
//                 size * i - width/2 + (cols % 1 != 0) * size/2,
//                 size * j - height/2 - (rows % 1 != 0) * size/4,
//                 i,
//                 j
//             );

//         }
//     }

//     side1 = createGraphics(size, size);
//     side1.background('black');

//     shader(shaders);

//     shaders.setUniform("startDepth", startDepth);
//     shaders.setUniform("size", size);
// }

// function draw() {

//     background(255);

//     mx = mouseX - width * 0.5;
//     my = mouseY - height * 0.5;

//     noiseTime = millis() * 0.00025;

//     // Calculate terrain targets once
//     for(let i = 0; i < cols; i++) {
//         for(let j = 0; j < rows; j++) {

//             squares[i][j].targetZ =
//                 startDepth +
//                 size * 2 *
//                 noise(i * 0.2, j * 0.2, noiseTime)
//                 - size;
//         }
//     }

//     // Update simulation
//     for(let i = 0; i < cols; i++) {
//         for(let j = 0; j < rows; j++) {
//             squares[i][j].update();
//         }
//     }

//     // Draw
//     for(let i = 0; i < cols; i++) {
//         for(let j = 0; j < rows; j++) {
//             squares[i][j].display();
//         }
//     }
// }

// function windowResized() {

//     resizeCanvas(window.innerWidth, window.innerHeight);

//     for(let i = 0; i < cols; i++) {
//         for(let j = 0; j < rows; j++) {

//             squares[i][j].x =
//                 size * i -
//                 width/2 +
//                 (cols % 1 != 0) * size/2;

//             squares[i][j].y =
//                 size * j -
//                 height/2 -
//                 (rows % 1 != 0) * size/4;
//         }
//     }
// }

// class Rectangle {

//     constructor(x, y, i, j) {

//         this.x = x;
//         this.y = y;

//         this.i = i;
//         this.j = j;

//         this.right = (i + 1) % cols;
//         this.left = (i - 1 + cols) % cols;
//         this.down = (j + 1) % rows;
//         this.up = (j - 1 + rows) % rows;

//         this.z = startDepth;
//         this.targetZ = startDepth;
//     }

//     update() {

//         let dx = mx - this.x;
//         let dy = my - this.y;

//         if(dx * dx + dy * dy < mouseRangeSq) {

//             let raisedHeight =
//                 startDepth +
//                 size * 2 -
//                 size;

//             this.z = lerp(this.z, raisedHeight, 0.05);

//             let t = 0.3;

//             squares[this.right][this.j].z =
//                 lerp(
//                     squares[this.right][this.j].z,
//                     raisedHeight,
//                     t
//                 );

//             squares[this.left][this.j].z =
//                 lerp(
//                     squares[this.left][this.j].z,
//                     raisedHeight,
//                     t
//                 );

//             squares[this.i][this.down].z =
//                 lerp(
//                     squares[this.i][this.down].z,
//                     raisedHeight,
//                     t
//                 );

//             squares[this.i][this.up].z =
//                 lerp(
//                     squares[this.i][this.up].z,
//                     raisedHeight,
//                     t
//                 );

//         } else {

//             this.z = lerp(this.z, this.targetZ, 0.5);

//             let avg =
//             (
//                 squares[this.right][this.j].z +
//                 squares[this.left][this.j].z +
//                 squares[this.i][this.down].z +
//                 squares[this.i][this.up].z
//             ) * 0.25;

//             this.z = lerp(this.z, avg, 0.1);
//         }
//     }

//     display() {

//         push();

//         translate(this.x, this.y, this.z);

//         noStroke();

//         box(size, size, size * 2);

//         pop();
//     }
// }