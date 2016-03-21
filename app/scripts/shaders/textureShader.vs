attribute vec3 aVertPos;
attribute vec2 aTexCoord;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTexCoord;

void main(void) {
    gl_Position = uPMatrix * uVMatrix * vec4(aVertPos, 1.0);
    vTexCoord = aTexCoord;
}
