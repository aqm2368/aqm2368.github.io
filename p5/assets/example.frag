precision mediump float;
#define PI 3.14159265359

varying vec2 pos;
uniform float millis;
uniform float height;
uniform float width;
uniform sampler2D exampleImage;

void main() {
    vec2 newPos = fract(pos * 10.);
    // pos = newPos;

    // float c = (sin(pos.x * 2. + millis/1000.) + 1.) / 2.;
    vec4 startColor = vec4(0.01, 0.85, 0.98, 1.);
    vec4 endColor = vec4(0.01, 0.24, 0.27, 1.0);
    float t = ((pos.x * (width / height)) + pos.y) / 2. + mod(millis/1000. / 8., 1.);
    // float t = pos.x + mod(millis/1000. / 8., 1.);
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
    vec4 color = mix(endColor, startColor, smoothed);

    // gl_FragColor = vec4(c, 0., 1., 1.);
    gl_FragColor = color;

    // vec2 position = pos;
    // position.y = 1. - position.y;

    // vec4 col = texture2D(exampleImage, position);

    // float avg = (col.r + col.g + col.b) / 3.;

    // gl_FragColor = vec4(avg, avg, avg, 1.);

    vec3 circle = vec3(0.5, 0.5, 0.3);
    float d = length(pos - circle.xy) - circle.z;
    // d = smoothstep(0., 0.01, d);

    // gl_FragColor = vec4((color.r + (1.- d)/2.) / 2., (color.g + (1.- d)/2.) / 2., (color.b + (1.- d)/2.) / 2., 1.);
    gl_FragColor = (vec4(1.-d, 1.-d, 1.-d, 1.) + 0.7) * (color * 0.7);
}