attribute vec3 aPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
attribute vec3 aNormal;
varying vec3 vNormal;

varying float vDepth;

void main() {
    vec4 viewPos = uModelViewMatrix * vec4(aPosition, 1.0);

    vDepth = viewPos.z;

    vNormal = normalize(aNormal);

    gl_Position = uProjectionMatrix * viewPos;
}