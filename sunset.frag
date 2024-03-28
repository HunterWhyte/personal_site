precision mediump float;

varying vec4 v_color;
varying vec2 v_texcoord;
uniform vec2 u_resolution;
#define fragCoord (v_texcoord)*u_resolution

uniform float u_time;

mat2 rotate2D(float r){
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float circle(vec2 st, vec2 center, float size, float blur){
  float dist = distance(st, center);
  float mask = smoothstep(size+blur, size-blur, dist);
  return mask;
}


float waves(float x, float y, float modulate, float height, float scale){
  // draw waves in front
  float wave1 = sin(x*16. + modulate)*scale;
  float wave2 = sin(x*13. + modulate)*scale;
  float wave3 = sin(x*25. + modulate)*scale;
  float waves = wave1 + wave2 + wave3;
  float waves_mask = smoothstep(waves, waves-0.01, y-height);
  return waves_mask;
}

void main() { 
	vec2 st = (fragCoord.xy/u_resolution.y);
  st.x = st.x+0.5;
  float pct = 0.0;
  
  // draw the sun
  float rise = sin(u_time*0.5)*0.65; // 0<>1
  rise = rise + 0.1; // -0.5<>0.5
  float rise_glow = st.y*(rise + 1.);

  // draw gradient background
  vec3 bg_col = vec3((1.-st.y)*(rise+1.)*0.3, 0., st.y*0.1);
  
  float mask = circle(st, vec2(0.5, rise), 0.25, 0.001);
  vec3 circle_col = vec3(mask*(st.y+0.15), mask*0.1, mask*0.175);
  vec3 color = mix(bg_col, circle_col, mask);

  
  float waves_mask = waves(st.x, st.y, u_time+4.5, 0.125, 0.05);
  vec3 waves_color = vec3(rise_glow,0.168,0.305);
  color = mix(color, waves_color, waves_mask);
  
  waves_mask = waves(st.x, st.y, u_time+3.14, 0.12, 0.05);
  waves_color = vec3(rise_glow, 0.11, 0.2);
  color = mix(color, waves_color, waves_mask);
  
  waves_mask = waves(st.x, st.y, u_time+0.2, 0.1, 0.05);
  waves_color = vec3(rise_glow,0.134,0.280);
  color = mix(color, waves_color, waves_mask);
  vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;

  gl_FragColor = vec4( color, 1.0 );
  // gl_FragColor = vec4(fragCoord, 1.0, 1.0 );
}