let exampleShader;
let exampleImage;

function preload() {
    exampleShader = loadShader(
        'assets/example.vert',
        'assets/fragmentPractice.frag'
    );

    exampleImage = loadImage('example_noise_glitch.png')
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    // createCanvas(600, 600, WEBGL);

    shader(exampleShader);

    noStroke();
}

function draw() {
    clear();
    exampleShader.setUniform("millis", (millis() / 1000.0) % 102935);
    exampleShader.setUniform("height", height);
    exampleShader.setUniform("width", width);
    exampleShader.setUniform("exampleImage", exampleImage);
    exampleShader.setUniform("iResolution", [width, height, width / height])

    // background('#000000')

    fill('#000000');
    rect(0, 0, width, height);

    fill('#ffffff');
    // ellipse(0, 0, width, height, 150);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}