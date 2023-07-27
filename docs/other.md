knockout可以在cesium上添加响应式支持

```javascript
let viewer = new Cesium.Viewer('cesiumContainer');

    // 1.创建viewModel对象
    const viewModel = {
      alpha: 1.0, // 透明度, 范围0.0-1.0
      brightness: 1.0, // 亮度
      contrast: 1.0, // 对比度
      hue: 0.0, // 色调
      saturation: 1.0, // 饱和度
      gamma: 1.0, // 伽马值
    };

    // 2.监测viewModel中的属性
    Cesium.knockout.track(viewModel);

    // 3.激活属性, 将viewModel对象与html控件绑定
    const inputPanel = document.getElementById('inputPanel');
    Cesium.knockout.applyBindings(viewModel, inputPanel);
    // 获取当前地球影像
    const mLayer = viewer.imageryLayers.get(0);

    // 4.监听属性变化
    monitorParamChange("alpha");
    monitorParamChange("brightness");
    monitorParamChange("contrast");
    monitorParamChange("hue");
    monitorParamChange("saturation");
    monitorParamChange("gamma");

    function monitorParamChange(name) {
      Cesium.knockout.getObservable(viewModel, name).subscribe(function (value) {
        // value值改变后会赋值给imagelayer的相应属性
        mLayer[name] = value;
      });
    }

```