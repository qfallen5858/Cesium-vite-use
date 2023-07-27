#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution; //[0,1]
  //st.x *= u_resolution.x / u_resolution.y;
  
  vec3 color = vec3(0.0);
  float d = 0.0;

  st = st * 2. - 1.;//[-1,1]
  d = length(abs(st) - 0.5);

  gl_FragColor = vec4(vec3(fract(d*8.)), 1.0);
}