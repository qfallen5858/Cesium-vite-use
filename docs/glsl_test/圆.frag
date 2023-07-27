#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float circle(in vec2 _st, in float _radius){
  vec2 dist = _st - vec2(0.5);
  return 1. - smoothstep(_radius-(_radius * 0.01), _radius + (_radius * 0.01) , dot(dist, dist)*7. );
}


void main(void){
  vec2 st = gl_FragCoord.xy / u_resolution;
  float pct = 0.0;

  pct = distance(st, vec2(0.4)) + distance(st, vec2(0.6));

  // vec3 color = vec3(step(sin(u_time), pct));
  vec3 color = vec3(circle(st, 0.9));
  // vec3 color = vec3(1.0);
  gl_FragColor = vec4(color, 1.0 );

}