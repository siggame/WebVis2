attribute vec3 aVertPos;
attribute vec4 aVertColor;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) {
    gl_Position = uPMatrix * uVMatrix * vec4(aVertPos, 1.0);
    vColor = aVertColor;
}
