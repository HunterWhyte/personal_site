attribute vec4 a_position;
varying vec4 v_color;
varying vec2 v_texcoord;

void main() {
  gl_Position = vec4(a_position.xy, 0.0, 1.0);
  v_color = gl_Position;
  v_texcoord = a_position.xy;
}