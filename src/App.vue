<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'
import { CESIUM_VIEWER } from '@/symbol/index'
import * as dat from 'dat.gui'
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css'


import { ShelterRadar } from '@/libs/cesium/radar'
import { StickRadar, RadarSolidScan } from './libs/cesium/radar';
import * as Cesium from 'cesium';
import { AirPlane } from './libs/cesium/action/headingPitchRoll';

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
    
    animation:true,
    timeline:true,
    shouldAnimate:true,
    baseLayerPicker:false,
    geocoder:false,
    sceneModePicker:false,
    navigationHelpButton:false,
    scene3DOnly:true,
    navigationInstructionsInitiallyVisible:true,
    terrainProvider:Cesium.createWorldTerrain()
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
  const shelterRadar: ShelterRadar = new ShelterRadar({ viewer })
  shelterRadar.createRadar({
    position: Cesium.Cartesian3.fromDegrees(117.3307246479066, 35.9004749662003, 0)
  })

  const stickRadar:StickRadar = new StickRadar({viewer})
  stickRadar.createRadar({lat:35.9004749662003, lng:117.3307246479066})

  const solidRada:RadarSolidScan = new RadarSolidScan({viewer})
  solidRada.createRadar({
    position: Cesium.Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 0)
  })

  const airPlane:AirPlane = new AirPlane({viewer})
  airPlane.createAirplane({
    position: Cesium.Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 5000),
    url:'./assets/models/Cesium_Air.glb'

  })


  const handler:Cesium.ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((event:Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    // console.log(event)
    const pickedPosition:Cesium.Cartesian3|undefined = viewer?.scene.pickPosition(event.position)
    if(Cesium.defined(pickedPosition)){
      console.log(pickedPosition)
      let position:Cesium.Cartographic = Cesium.Cartographic.fromCartesian(pickedPosition!) //Ellipsoid.WGS84.cartesianToCartographic(pickedPosition!)
      let longitude = Cesium.Math.toDegrees(position.longitude)
      let latitude = Cesium.Math.toDegrees(position.latitude)
      console.log(`longitude:${longitude},latitude:${latitude}`)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  provide(CESIUM_VIEWER, viewer)

  initDatGui()
  
})

function initDatGui():void{
  const gui:dat.GUI = new dat.GUI()
  const radarParams:dat.GUI = gui.addFolder('干扰雷达')
  const radarDynamicParams = radarParams.addFolder("雷达动态参数")
  radarDynamicParams.add({type:'扇扫'}, "type", ['停止','环扫','扇扫', '定位', '俯仰']).name('状态').onChange(value => {
    console.log(value)
  })
  radarDynamicParams.open();
  // const ctrObj = {param1:0.01, param2:0.01}
  // gui.add(ctrObj, 'param1', 0.01)
  // gui.add(ctrObj, 'param2', 0.01)
  gui.width = 350
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
