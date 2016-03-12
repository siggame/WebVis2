precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uSampler;
uniform vec4 uTint;

void main(void) {
    // gl_FragColor = texture2D(uSampler, vTexCoord);
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
