precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main(void){
  vec2 position = (gl_FragCoord.xy / u_resolution);
  float sun = distance(position, vec2(0.5)) * -4. + 1.; //离中心越远值越大
  gl_FragColor = vec4(vec3(1./sun, 0, 0 ), 1. );
}
