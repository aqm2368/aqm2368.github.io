precision mediump float;

uniform vec3 iResolution;
uniform float millis;

vec3 palatte(float t) {
    vec3 a = vec3(0.538407346410207, 0.938407346410207, 0.758407346410207);
    vec3 b = vec3(1.47840734641021, 0.758407346410207, 0.358407346410207);
    vec3 c = vec3(0.588407346410207, 0.988407346410207, 1.55840734641021);
    vec3 d = vec3(0.588407346410207, -0.441592653589793, -0.131592653589793);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = ((gl_FragCoord.xy / iResolution.xy) - 1.0) / 2.0; 
    uv.x *= iResolution.z;

    vec2 uv0 = uv;

    vec3 finalColor = vec3(0.0);

    for(float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * (3.0 + 0.5 * i)) - 0.5;

        float d = length(uv) * exp(-length(uv0 * 1.7));
        vec3 color = palatte(length(uv0) + i*0.1+ millis * 0.2);

        d = sin(d * 10.0 + millis) * 1.5;
        d = abs(d);
        d = pow((.1 / length(uv0)) * (0.1 / d), 1.75);

        finalColor += color * d;
    }

    // vec3 finalColor = vec3(0, 0, 0);

    // float d = (sin(length(uv)*80.0 + millis/1000.0));
    // d = step(0.99, d);
    // d = (d - 1.0) * -1.0;
    // finalColor = vec3(d, d, d);

    gl_FragColor = vec4(finalColor, 1);
}