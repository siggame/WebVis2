precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uSampler;
uniform vec4 uTint;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTexCoord) * uTint;
}
