precision mediump float;

varying float vDepth;
varying vec3 vNormal;

uniform float startDepth;
uniform float size;

void main() {
    float isSide = dot(vNormal, vec3(0.0, 0.0, 1.0));
    isSide = -(abs(isSide) - 1.0);
    float darken = 0.3;

    vec3 color = vec3(0.0, 0.93, 1.0);

    float bToD = 2.5;
    gl_FragColor = vec4(color * vec3(1.0 - (darken * isSide + 1.0 + (-vDepth - (710.0 - startDepth)) / (size / bToD))), 1.0);
}