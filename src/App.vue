<script setup lang="ts">
import { onMounted, ref, provide, onUnmounted } from 'vue'
import { CESIUM_VIEWER } from '@/symbol/index'
import * as dat from 'dat.gui'
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css'

console.log(import.meta.env)

import { ShelterRadar } from '@/libs/cesium/radar'
import { StickRadar, RadarSolidScan } from './libs/cesium/radar';
import * as Cesium from 'cesium';
import { AirPlane } from './libs/cesium/action/headingPitchRoll';
import { Ellipsoid } from 'cesium';
import { EllipsoidExample } from './libs/cesium/ellipsoids';
import { PrimitiveWithPath } from './libs/cesium/action/primitiveWithPath';
import { Wave } from './libs/cesium/action/wave';
import { DebugCamera } from './libs/cesium/action/DebugCamera';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Y2QyYjYyZi1lZWQxLTRlMTgtODVlNi05YTM5ZmUwYTkwY2IiLCJpZCI6MTU2MjAzLCJpYXQiOjE2OTAyNTQxMTN9.eo3fqpztANR3dwCOijeRDn-2WFUVZhZNFnLx-cQ2lrU'//'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YWI3NWFkMS00MzVhLTRlZDQtOTQ2Ny1kYTQyMDZhMDUzNTEiLCJpZCI6NzMzLCJpYXQiOjE1MjU2ODgwMDl9.ZDRO50KVh7eEHQ5y00x_VJ0QUSNojr0xC5fcULWKc-Q';

const viewerDivRef = ref<HTMLDivElement>()

let viewer: Cesium.Viewer | null = null;

const sysBaseUrl = import.meta.env.BASE_URL
const mode = import.meta.env.MODE
const sourceCesiumBaseUrl = import.meta.env.VITE_CESIUM_BASE_URL

const cesiumBaseUrl = mode === 'development' ? `${sysBaseUrl}${sourceCesiumBaseUrl}` : sourceCesiumBaseUrl

window.CESIUM_BASE_URL = cesiumBaseUrl

console.log(`模式:${mode}, CESIUM_BASE_URL:${cesiumBaseUrl}`)

onMounted(() => {
  const baseLayer = Cesium.ImageryLayer.fromProviderAsync(Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'), { minimumLevel: 1, maximumLevel: 10 }), {});// ImageryLayer.fromProviderAsync(TileMapServiceImageryProvider.fromUrl(buildModuleUrl('Assets/Textures/NaturalEarthII'),{}))
  // const baseLayer = Cesium.ImageryLayer.fromProviderAsync(Cesium.SingleTileImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/earth_color_low_4096.jpg')), {});// ImageryLayer.fromProviderAsync(TileMapServiceImageryProvider.fromUrl(buildModuleUrl('Assets/Textures/NaturalEarthII'),{}))

  baseLayer.readyEvent.addEventListener(provider => {
    console.log('已经创建 provider')
    provider.errorEvent.addEventListener(error => {
      console.log('加载瓦片出错。原因：', error)
    })
  })
  viewer = new Cesium.Viewer(viewerDivRef.value as HTMLElement, {
    // imageryProvider: new TileMapServiceImageryProvider({
    //   url: buildModuleUrl('Assets/Textures/NaturalEarthII')
    // })
    // baseLayer,

    animation: true,
    timeline: true,
    shouldAnimate: true,
    baseLayerPicker: false,
    geocoder: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    scene3DOnly: true,
    navigationInstructionsInitiallyVisible: true,
    // terrainProvider: Cesium.createWorldTerrain()
  })
  viewer.resolutionScale = 1.2
  viewer.scene.globe.depthTestAgainstTerrain = true
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.postProcessStages.fxaa.enabled = true;
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(117.3307246479066, 33.0004749662003, 600000.0),
    orientation: {
      heading: 0,
      pitch: -1.0,
      roll: 0.0
    },

  })
  // const shelterRadar: ShelterRadar = new ShelterRadar({ viewer })
  // shelterRadar.createRadar({
  //   position: Cesium.Cartesian3.fromDegrees(117.3307246479066, 35.9004749662003, 0)
  // })

  // const stickRadar: StickRadar = new StickRadar({ viewer })
  // stickRadar.createRadar({ lat: 35.9004749662003, lng: 117.3307246479066 })

  // const solidRada: RadarSolidScan = new RadarSolidScan({ viewer })
  // solidRada.createRadar({
  //   position: Cesium.Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 0)
  // })

  // const airPlane: AirPlane = new AirPlane({ viewer })
  // airPlane.createAirplane({
  //   position: Cesium.Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 25000),
  //   url: 'assets/models/Cesium_Air.glb'

  // })



  // const ellipsoidExample: EllipsoidExample = new EllipsoidExample({ viewer })
  // ellipsoidExample.createNormal(Cesium.Cartesian3.fromDegrees(116.46478201418758, 37.28558168329757, 100000), new Cesium.Cartesian3(20000, 20000, 20000))

  // ellipsoidExample.createDome(Cesium.Cartesian3.fromDegrees(116.46478201418758, 37.28558168329757, 25000), new Cesium.Cartesian3(20000, 20000, 20000))
  const handler: Cesium.ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    // console.log(event)
    const pickedPosition: Cesium.Cartesian3 | undefined = viewer?.scene.pickPosition(event.position)
    if (Cesium.defined(pickedPosition)) {
      console.log(pickedPosition)
      let position: Cesium.Cartographic = Cesium.Cartographic.fromCartesian(pickedPosition!) //Ellipsoid.WGS84.cartesianToCartographic(pickedPosition!)
      let longitude = Cesium.Math.toDegrees(position.longitude)
      let latitude = Cesium.Math.toDegrees(position.latitude)
      console.log(`longitude:${longitude},latitude:${latitude}`)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  provide(CESIUM_VIEWER, viewer)


  // const ellipsoid = viewer.entities.add({
  //   position:Cesium.Cartesian3.fromDegrees(116.46478201418758, 37.28558168329757, 25000),
  //   ellipsoid:{
  //     radii: new Cesium.Cartesian3(5000,5000,5000),
  //     material:new Cesium.Color(1, 1,0).withAlpha(0.4)
  //   }
  // })
  // const params = {
  //   radii: 50000.0,
  //   minimumClock:180,
  //   maximumClock:360,
  //   minimumCone: 0,
  //   maximumCone:360,
  //   color:[ 0, 128, 255, 0.3 ],
  //   position:[116.46478201418758, 37.28558168329757, 25000],

  // }
  // const gui = initDatGui()
  // const ellipsoidParams: dat.GUI = gui.addFolder('ellipoid')
  // ellipsoidParams.add(params, 'minimumClock').name('最小圆角').min(0).max(360).step(5).onFinishChange((val) => {
  //   (ellipsoid.ellipsoid as Cesium.EllipsoidGraphics).minimumClock = new Cesium.ConstantProperty(Cesium.Math.toRadians(val));
  //   console.log(`minimumClock:${val}`)
  // })
  // ellipsoidParams.add(params, 'maximumClock').name('最大圆角').min(0).max(360).step(5).onFinishChange((val) => {
  //   (ellipsoid.ellipsoid as Cesium.EllipsoidGraphics).maximumClock = new Cesium.ConstantProperty(Cesium.Math.toRadians(val)) ;
  //   console.log(`maximumClock:${val}`)
  // })
  // ellipsoidParams.add(params, 'radii').name('半径').min(50000).max(500000).step(10000).onFinishChange((val) => {
  //   (ellipsoid.ellipsoid as Cesium.EllipsoidGraphics).radii = new Cesium.ConstantProperty(new Cesium.Cartesian3(val, val, val)) ;
  //   console.log(`radii:${val}`)
  // })
  // ellipsoidParams.addColor(params, 'color').name('颜色').onFinishChange((val) => {
  //   (ellipsoid.ellipsoid as Cesium.EllipsoidGraphics).material = new Cesium.ColorMaterialProperty(new Cesium.Color(val[0]/255, val[1]/255, val[2]/255).withAlpha(val[3])) ;
  //   console.log(`color:${val}`)
  // })
  // ellipsoidParams.add(params, 'minimumCone').name('最小锥角').min(0).max(360).step(5).onFinishChange((val) => {
  //   (ellipsoid.ellipsoid as Cesium.EllipsoidGraphics).minimumCone = new Cesium.ConstantProperty(Cesium.Math.toRadians(val)) ;
  //   console.log(`minimumCone:${val}`)
  // })

  // ellipsoidParams.add(params, 'maximumCone').name('最大锥角').min(0).max(360).step(5).onFinishChange((val) => {
  //   (ellipsoid.ellipsoid as Cesium.EllipsoidGraphics).maximumCone = new Cesium.ConstantProperty(Cesium.Math.toRadians(val)) ;
  //   console.log(`maximumCone:${val}`)
  //   console.log(`params:${params}`)
  //   console.log(params)
  // })


  // initAirPlane(viewer);

  // ellipsoidParams.open()

  // const pwp = new PrimitiveWithPath({viewer});
  // const position = Cesium.Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 25000)
  // const position2 = Cesium.Cartesian3.fromDegrees(118.1513137612399, 37.950227497287244, 25000)

  // const url = 'assets/models/Cesium_Air.glb'
  // pwp.create({position, url})
  // pwp.create({position:position2, url})
  // const wave = new Wave({viewer})
  
  // wave.createWave()
    const debugCamera = new DebugCamera({viewer})
    debugCamera.create({
      start:Cesium.Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 25000),
      target:Cesium.Cartesian3.fromDegrees(117.1513137612399, 35.950227497287244, 25000)
    })
})

onUnmounted(() => {
  if (Cesium.defined(viewer)) {
    viewer?.entities.removeAll()
    viewer?.destroy()
  }
})


function initDatGui(): dat.GUI {
  const gui: dat.GUI = new dat.GUI()
  const radarParams: dat.GUI = gui.addFolder('干扰雷达')
  const radarDynamicParams = radarParams.addFolder("雷达动态参数")
  radarDynamicParams.add({ type: '扇扫' }, "type", ['停止', '环扫', '扇扫', '定位', '俯仰']).name('状态').onChange(value => {
    console.log(value)
  })
  radarDynamicParams.open();
  // const ctrObj = {param1:0.01, param2:0.01}
  // gui.add(ctrObj, 'param1', 0.01)
  // gui.add(ctrObj, 'param2', 0.01)

  gui.width = 350
  return gui;
}


</script>

<template>
  <div id="cesium-viewer" ref="viewerDivRef"></div>
</template>

<style scoped>
#cesium-viewer {
  width: 100%;
  height: 100%;
}
</style>
