precision mediump float;
#define PI 3.14159265359

varying vec2 pos;
uniform float millis;
uniform float height;
uniform float width;

void main() {
    vec2 newPos = fract(pos * 10.);
    // pos = newPos;

    // float c = (sin(pos.x * 2. + millis/1000.) + 1.) / 2.;
    vec4 start = vec4(3., 219., 252., 255.) / 255.;
    vec4 end = vec4(0., 95., 110., 255.) / 255.;
    float t = ((pos.x * (width / height)) + pos.y) / 2. + mod(millis/1000. / 10., 1.);
    if(t > 1.) {
        t -= 1.;
    }
    float sinResult = sin(10. * t * PI);
    float smoothed;
    float e = 3.;

    if(sinResult < 0.) {
        smoothed = (-pow(sin(-10. * t * PI), e) + 1.) / 2.;

    }
    else {
        smoothed = (pow(sinResult, e) + 1.) / 2.;
    }

    // vec4 color = mix(start, end, -2. * (abs(t - 0.5)) + 1.);
    vec4 color = mix(end, start, smoothed);

    // gl_FragColor = vec4(c, 0., 1., 1.);
    gl_FragColor = color;
}