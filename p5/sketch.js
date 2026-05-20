let exampleShader;

function preload() {
    exampleShader = loadShader(
        '../p5/assets/example.vert',
        '../p5/assets/example.frag'
    );
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    // createCanvas(600, 600, WEBGL);

    shader(exampleShader);

    noStroke();
}

function draw() {
    clear();
    exampleShader.setUniform("millis", millis());
    exampleShader.setUniform("height", height);
    exampleShader.setUniform("width", width);

    // background('#000000')

    fill('#000000');
    rect(0, 0, width, height);

    fill('#ffffff');
    // ellipse(0, 0, width, height, 150);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}