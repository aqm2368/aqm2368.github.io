attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 pos;

uniform float millis;

void main() {
    pos = aTexCoord;

    vec4 position = vec4(aPosition, 1.0);
    position.xy = position.xy * 2.0 - 1.0;

    // position.y *= .9;

    // position.y += sin(millis/900. + position.x * 8.)/10.;
    // if(position.y > 1.) {
    //     position.y -= position.y - 1.;
    // }

    gl_Position = position;
}