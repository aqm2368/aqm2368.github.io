precision mediump float;
#define PI 3.14159265359

varying vec2 pos;
uniform sampler2D globeNoise;
uniform float millis;
uniform float maxWidth;
uniform vec3 iResolution;

vec3 palatte(float t) {
    vec3 a = vec3(0.408407346410207, 0.268407346410207, 0.6);
    vec3 b = vec3(0.848407346410207, 0.758407346410207, 1.4540734641021);
    vec3 c = vec3(0.498407346410207, -0.391592653589793, 0.808407346410207);
    vec3 d = vec3(-0.571592653589793, -0.681592653589793, 1.15840734641021);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    // Maps uv coordinates of every pixel to the center of the screen
    vec2 uv = ((gl_FragCoord.xy / iResolution.xy) - 1.0) / 2.0; 
    // Applies the aspect ratio to the horizontal coordinate of the pixel to prevent a horizontally stretched visual
    uv.x *= iResolution.z;

    // Defines a value that increases the further the pixel at uv is from the center of the screen, creating a radial gradient
    // float clouds = length(uv) + 0.1;
    // float sphere = clouds - 0.1;
    float sphere = length(uv);
    
    // Redefines the above value as either 0 or 1 based on the size of edge to create a solid circle
    sphere = smoothstep(0.45 * (iResolution.x / maxWidth), 0.45 * (iResolution.x / maxWidth) + 0.001, sphere);
    // sphere = step(0.45 * (iResolution.x / maxWidth), sphere);
    // Adjusts the above value so that the circle becomes white and the background becomes black
    sphere = sphere * -1.0 + 1.0;

    vec2 globeUV = uv / (0.45 * (iResolution.x / maxWidth));

    // Vector holding the 3D position of this pixel, with z defined as sqrt(1 - x^2 - y^2)
    vec3 xyz = vec3(globeUV.xy, sqrt(1.0 - pow(globeUV.x, 2.0) - pow(globeUV.y, 2.0)));
    vec3 xyz0 = xyz;
  
    // Create a 2D rotational matrix that rotates the grid counter-clockwise by 'angle' in radians
    float angle = -0.15;
    mat2 axisTilt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    angle += millis/1000.0;
    mat3 rotation = mat3(cos(angle), 0.0, sin(angle), 0.0, 1.0, 0.0, -sin(angle), 0.0, cos(angle));

    // Apply the 2D rotational matrix to the 2D coordinates of this pixel
    xyz.xy *= axisTilt;
    xyz *= rotation;

    // Oscillate the horizontal position of this pixel displaced by time so that it appears to be rotating around an axis

    float u = atan(xyz.z, xyz.x) / (2.0 * PI) + 0.5;
    float v = xyz.y * 0.5 + 0.5;//asin(xyz.y) / PI + 0.5;

    vec2 p = vec2(u, v);
    p.xy = 1.0 - p.xy;
    // p.x = fract(2.0 * p.x);

    vec4 color = texture2D(globeNoise, p);

    // color.x += step(0.1, p.x);

    vec3 normals = xyz0;
    angle *= -0.3;
    mat3 normalsRotation = mat3(cos(angle), 0.0, sin(angle), 0.0, 1.0, 0.0, -sin(angle), 0.0, cos(angle));
    normals *= normalsRotation;
    //normals.z = 0.7 / 1.2;
    // normals.z -= step(0.0, -normals.z);
    
    gl_FragColor = vec4(vec3((sphere * palatte(color.x)) + ((normals.z) * 1.2 - 0.7)), 1.0);
    // gl_FragColor = vec4(vec3(sphere * xyz.x), 1.0);
    // gl_FragColor = vec4(sphere * xyz, 1.0);
    // gl_FragColor = color;
}