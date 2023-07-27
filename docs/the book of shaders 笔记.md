# the book of shaders

opengl/webgl:[OpenGL Introduction]("https://open.gl/introduction"),[the 8th edition of the OpenGL Programming Guide]("http://www.amazon.com/OpenGL-Programming-Guide-Official-Learning/dp/0321773039/ref=sr_1_1?s=books&ie=UTF8&qid=1424007417&sr=1-1&keywords=open+gl+programming+guide")(也叫红宝书)或[WebGL: Up and Running ]("http://www.amazon.com/WebGL-Up-Running-Tony-Parisi/dp/144932357X/ref=sr_1_4?s=books&ie=UTF8&qid=1425147254&sr=1-4&keywords=webgl")

线代和三角学的算法：[3rd Edition of Mathematics for 3D Game Programming and computer Graphics]("http://www.amazon.com/Mathematics-Programming-Computer-Graphics-Third/dp/1435458869/ref=sr_1_1?ie=UTF8&qid=1424007839&sr=8-1&keywords=mathematics+for+games")或[ 2nd Edition of Essential Mathematics for Games and Interactive Applications]("http://www.amazon.com/Essential-Mathematics-Games-Interactive-Applications/dp/0123742978/ref=sr_1_1?ie=UTF8&qid=1424007889&sr=8-1&keywords=essentials+mathematics+for+developers")

坐标系原点在左下角

## Fragment shaders(片段着色器)

shader是一系列的指令，这些指令会对屏幕上的每个像素同时下达。类似于一个函数，输入位置信息，输出颜色信息

为了使许多管线能够并行运行，每一个线程必须与其他的独立，称之为线程对于其他线程在进行的运算是“盲视”的。这个限制会使得所有数据必须以相同的方向流动。所以就不可能检查其他线程的输出结果，修改输入的数据，或者把一个线程的输出结果输入给另一个线程。每个线程不仅是盲视的，而且是无记忆的。同时，它要求编写一个通用的规则，依据不同位置依次输出不同的结果。

### Uniforms

尽管每个线程和其他线程之间不能有数据交换，但可以从CPU给每个线程输入数据。因为显卡的架构，所有线程的输入值必须统一(uniform)，而且必须设为只读。即每条线程接收相同的数据，并且是不可改变的数据。

这些输入值叫做uniform(统一值)，数据类型通常为:float,vec2,vec3,vec4,mat2,mat3,mat4,sample2D,sampleCube。uniform值需要数值类型前后一直，且在shader的开头，设定精度之后，就对齐定义。

```cpp
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;//画布尺寸（宽，高）
uniform vec2 u_mouse;//鼠标位置（在屏幕上哪个像素点）
uniform float u_time; //时间（加载后的秒数）
```

### gl_FragCoord

GLSL有个默认输出值vec4 gl_FragColor一样，它也有一个默认输入值（vec4 gl_FragCoord）。gl_FragCoord存储了活动线程正在处理的像素或屏幕碎片的坐标。因为每个像素的坐标都不一样，不能用uniform标记，我们称之为varying(变化值)

### Three.js中的应用

```html

<body>
    <div id="container"></div>
    <script src="js/three.min.js"></script>
    <script id="vertexShader" type="x-shader/x-vertex">
        void main() {
            gl_Position = vec4( position, 1.0 );
        }
    </script>
    <script id="fragmentShader" type="x-shader/x-fragment">
        uniform vec2 u_resolution;
        uniform float u_time;

        void main() {
            vec2 st = gl_FragCoord.xy/u_resolution.xy;
            gl_FragColor=vec4(st.x,st.y,0.0,1.0);
        }
    </script>
    <script>
        var container;
        var camera, scene, renderer, clock;
        var uniforms;

        init();
        animate();

        function init() {
            container = document.getElementById( 'container' );

            camera = new THREE.Camera();
            camera.position.z = 1;

            scene = new THREE.Scene();
            clock = new THREE.Clock();

            var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

            uniforms = {
                u_time: { type: "f", value: 1.0 },
                u_resolution: { type: "v2", value: new THREE.Vector2() }
            };

            var material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: document.getElementById( 'vertexShader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentShader' ).textContent
            } );

            var mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );

            container.appendChild( renderer.domElement );

            onWindowResize();
            window.addEventListener( 'resize', onWindowResize, false );
        }

        function onWindowResize( event ) {
            renderer.setSize( window.innerWidth, window.innerHeight );
            uniforms.u_resolution.value.x = renderer.domElement.width;
            uniforms.u_resolution.value.y = renderer.domElement.height;
        }

        function animate() {
            requestAnimationFrame( animate );
            render();
        }

        function render() {
            uniforms.u_time.value += clock.getDelta();
            renderer.render( scene, camera );
        }
    </script>
</body>

```

## 算法绘图

### 插值函数

#### Step函数

step()插值函数需要两个参数，一个是阈值，一个是要检测的值，当检测值小于阈值时，返回0.0，大于阈值返回1.0

``` cpp
float step(float edge, float x)  
vec2 step(vec2 edge, vec2 x)  
vec3 step(vec3 edge, vec3 x)  
vec4 step(vec4 edge, vec4 x)

vec2 step(float edge, vec2 x)  
vec3 step(float edge, vec3 x)  
vec4 step(float edge, vec4 x)
```

#### Mix函数

在两个值之间做线性插值，第三个参数是权重，计算按照x*(1-a)+y*a

```cpp
float mix(float x, float y, float a)  
vec2 mix(vec2 x, vec2 y, vec2 a)  
vec3 mix(vec3 x, vec3 y, vec3 a)  
vec4 mix(vec4 x, vec4 y, vec4 a)

vec2 mix(vec2 x, vec2 y, float a)  
vec3 mix(vec3 x, vec3 y, float a)  
vec4 mix(vec4 x, vec4 y, float a)
```

#### Smoothstep函数

在两个值中做赫米特插值

```cpp
float smoothstep(float edge0, float edge1, float x)  
vec2 smoothstep(vec2 edge0, vec2 edge1, vec2 x)  
vec3 smoothstep(vec3 edge0, vec3 edge1, vec3 x)  
vec4 smoothstep(vec4 edge0, vec4 edge1, vec4 x)

vec2 smoothstep(float edge0, float edge1, vec2 x)  
vec3 smoothstep(float edge0, float edge1, vec3 x)  
vec4 smoothstep(float edge0, float edge1, vec4 x)
```

等同于

```cpp
genType t;  /* Or genDType t; */
t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
return t * t * (3.0 - 2.0 * t);
```

$$
如果e_0<e_1: y = smoothstep(e0,e1,x);
若x<e_0:y = 0;
若e_0\leq x\leq e_1:y=3x^2-2x^3;
若e1 \lt x:y=1;
如果e_0>e_1:则上面情况刚好相反

```
float c = smoothstep(r,r-blur,d); c在小于(r-blur)的时候等于1,大于r的时候等于0
float c = smoothstep(r-blur,r,d); c在小于(r-blur)的时候等于0,大于r的时候等于1
```

$$

### 颜色

```cpp
vec4 vector;
vector[0] = vector.r = vector.x = vector.s;
vector[1] = vector.g = vector.y = vector.t;
vector[2] = vector.b = vector.z = vector.p;
vector[3] = vector.a = vector.w = vector.q;
```

GLSL中向量类型的另一大特点是可以用你需要的任意顺序简单地投射和混合（变量）值。

```cpp
vec3 yellow, magenta, green;

// Making Yellow
yellow.rg = vec2(1.0);  // Assigning 1. to red and green channels
yellow[2] = 0.0;        // Assigning 0. to blue channel

// Making Magenta
magenta = yellow.rbg;   // Assign the channels with green and blue swapped

// Making Green
green.rgb = yellow.bgb; // Assign the blue channel of Yellow (0) to red and blue channels
```

#### 混合颜色

可以用mix函数，也可以用[缓动函数](https://easings.net/zh-cn)来赋予过渡效果

#### HSB

HSB 代表色相，饱和度和亮度（或称为值）。

## 形状

### 长方形

```cpp
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // Each result will return 1.0 (white) or 0.0 (black).
    //float left = step(0.1,st.x);   // Similar to ( X greater than 0.1 )
    //float bottom = step(0.1,st.y); // Similar to ( Y greater than 0.1 )

    // bottom-left
    vec2 bl = step(vec2(0.1),st); 
    float pct = bl.x * bl.y;

    // top-right
    vec2 tr = step(vec2(0.1),1.0-st);
    pct *= tr.x * tr.y;

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

画边缘

### 圆

每个像素是否在圆的区域以内，及距离圆心距离与圆半径的判断

归一化的画布中心是 vec2(0.5)，也可以设置其他圆心地址

```cpp
vec2 st = gl_FragCoord.xy/u_resolution;
float pct = 0.0;

// a. The DISTANCE from the pixel to the center
pct = distance(st,vec2(0.5,.5));
vec3 color = vec3(step(0.1,pct));
gl_FragColor = vec4( color, 1.0 );
```

笛卡尔映射到极坐标

```cpp
vec2 pos = vec2(0.5) - st;
float r = length(pos) * 2.0;
float a = atan(pos.y, pos.x);

```

