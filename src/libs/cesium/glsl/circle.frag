#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
void main(){
  // 获取屏幕坐标并进行平移
  vec2 st=gl_FragCoord.xy/u_resolution-.5;
  
  vec3 color=vec3(1.);
  float lengthV=length(st);// 求每个顶点的长度
  float sphere=max(0.,lengthV*2.);//
  
  float sphereAlpha=step(.5,sphere);//
  color*=clamp(sphereAlpha,0.,.75);
  
  // 高光：就是一个颜色渐变的球
  color+=(1.-length(st-vec2(-.12,.12))*3.)*(1.-sphereAlpha);
  
  float refLight=1.-sphereAlpha;
  refLight*=smoothstep(.3,.5,(length(st*.5+vec2(.05,-.08)))*2.);
  
  // color = vec3(refLight);
  color+=refLight;
  float sha=smoothstep(.5,.65,length(st*vec2(.2,1.)+vec2(-.05,.22))*8.);
  sha+=(1.-smoothstep(.7,.05,length(st*vec2(.2,1.)+vec2(-.02,.22))*6.))*.5;
  sha=clamp(sha+(1.-sphereAlpha),0.,1.);
  
  color*=sha;
  color=color*.8+.1;
  gl_FragColor=vec4(color,1.);
  
}