# 注意版本差异

- varying 替换为 out
- attribute 替换为 in
- segment 中的 gl_FragColor通过声明 out vec4 fragColor代替，在cesium中可以用out_FragColor代替gl_FragColor

## 常用变量

- uniform: 统一变量，来自CPU的变量值
- u_resolution 画布尺寸
- u_time 时间
- u_mouse 鼠标位置

## Cesium内置变量与函数

### 变量

- czm_model:模型变换矩阵，将对象从模型空间变换到世界空间
- czm_view:视图变换矩阵，将世界空间中的对象变换到摄像机空间
- czm_projection:投影变换矩阵，将摄像机空间中的对象进行透视或正交投影，得到剪辑空间坐标
- czm_modelView：模型视图变换矩阵，即 czm_view * czm_model
- czm_modelViewProjection：模型视图投影变换矩阵，即 czm_projection * czm_view * czm_model，将对象从模型空间变换到剪辑空间
- czm_inverseModel：模型变换矩阵的逆矩阵，用于将世界空间中的坐标变换到模型空间中
- czm_inverseView：视图变换矩阵的逆矩阵，用于将摄像机空间中的坐标变换到世界空间中
- czm_inverseProjection：投影变换矩阵的逆矩阵，用于将剪辑空间中的坐标变换到摄像机空间中
- czm_normal：变换后的法线向量，用于进行光照计算
- czm_ellipsoid：椭球体参数，用于进行地球表面坐标系和笛卡尔坐标系之间的转换
- czm_frameNumber：帧计数器，每次渲染时自增1，可用于实现动画效果
- czm_pixelRatio：设备像素比，用于实现高分辨率屏幕上的渲染

### 常用函数

- czm_unpackDepth：它用于将从深度纹理中读取到的深度值进行解压缩，以便在着色器中进行深度测试和深度值比较等操作。深度纹理通常用于实现阴影效果、深度检测等功能。在Cesium中，深度值通常被存储在一个16位的纹理单元中，这个值被压缩成0到1之间的浮点数，以便节省显存空间
- czm_inverseTranspose：返回一个矩阵的逆转置矩阵，通常用于变换法线向量
- czm_saturation：返回一个颜色的饱和度，通常用于实现色彩调整
- czm_sceneMode：返回当前场景的模式，例如二维地图、三维场景等
- czm_ellipsoidContainsPoint：判断一个点是否在当前椭球体内，通常用于进行鼠标拾取等操作
- czm_eastNorthUpToFixedFrame：返回从东-北-天坐标系到固定坐标系的变换矩阵，通常用于实现坐标系转换
- czm_geodeticSurfaceNormal：返回一个点在椭球体表面上的法线向量，通常用于进行光照计算
- czm_transformColor：将一个颜色从一种颜色空间转换为另一种颜色空间，通常用于进行色彩调整
- czm_decompressTextureCoordinates：解压缩纹理坐标，通常用于将纹理坐标从一个压缩格式转换为普通的二维坐标
- czm_eyeOffset：返回一个向量，表示摄像机视点在局部坐标系中的偏移量
- czm_fractionAndIntervalToIndex：根据插值系数和区间范围计算索引，通常用于实现纹理合并

### 源码参考路径

automaticUniforms.js:packages\engine\Source\Renderer\AutomaticUniforms.js

packages\engine\Source\Shaders


  
## 相关参考资料

https://github.com/mattdesl/lwjgl-basics/wiki/GLSL-Versions

https://www.cnblogs.com/kekec/p/14065756.html

https://blog.csdn.net/aoxuestudy/article/details/122754410

https://juejin.cn/post/7076749267515375653

https://blog.csdn.net/linzi19900517/article/details/129424356

https://github.com/wshxbqq/GLSL-Card#glsl-%E4%B8%AD%E6%96%87%E6%89%8B%E5%86%8C

https://thebookofshaders.com/?lan=ch

https://glslsandbox.com/e#105105.0