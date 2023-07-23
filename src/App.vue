<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'
import { TileMapServiceImageryProvider, Viewer, buildModuleUrl, ImageryLayer, Ion, Cartesian3, ScreenSpaceEventHandler, ScreenSpaceEventType, defined, Cartographic, Ellipsoid, Math } from 'cesium'
import { CESIUM_VIEWER } from '@/symbol/index'
import * as dat from 'dat.gui'
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css'


import { ShelterRadar } from '@/libs/cesium/radar'
import { StickRadar, RadarSolidScan } from './libs/cesium/radar';

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YWI3NWFkMS00MzVhLTRlZDQtOTQ2Ny1kYTQyMDZhMDUzNTEiLCJpZCI6NzMzLCJpYXQiOjE1MjU2ODgwMDl9.ZDRO50KVh7eEHQ5y00x_VJ0QUSNojr0xC5fcULWKc-Q';

const viewerDivRef = ref<HTMLDivElement>()

let viewer: Viewer | null = null;

const sysBaseUrl = import.meta.env.BASE_URL
const mode = import.meta.env.MODE
const sourceCesiumBaseUrl = import.meta.env.VITE_CESIUM_BASE_URL

const cesiumBaseUrl = mode === 'development' ? `${sysBaseUrl}${sourceCesiumBaseUrl}` : sourceCesiumBaseUrl

window.CESIUM_BASE_URL = cesiumBaseUrl

console.log(`模式:${mode}, CESIUM_BASE_URL:${cesiumBaseUrl}`)

onMounted(() => {
  const baseLayer = ImageryLayer.fromProviderAsync(TileMapServiceImageryProvider.fromUrl(buildModuleUrl('Assets/Textures/NaturalEarthII'), { minimumLevel: 1, maximumLevel: 10 }), {});// ImageryLayer.fromProviderAsync(TileMapServiceImageryProvider.fromUrl(buildModuleUrl('Assets/Textures/NaturalEarthII'),{}))
  baseLayer.readyEvent.addEventListener(provider => {
    console.log('已经创建 provider')
    provider.errorEvent.addEventListener(error => {
      console.log('加载瓦片出错。原因：', error)
    })
  })
  viewer = new Viewer(viewerDivRef.value as HTMLElement, {
    // imageryProvider: new TileMapServiceImageryProvider({
    //   url: buildModuleUrl('Assets/Textures/NaturalEarthII')
    // })
    baseLayer,
    animation:true,
    timeline:true,
    shouldAnimate:true,
    baseLayerPicker:false,
    geocoder:false,
    sceneModePicker:false,
    navigationHelpButton:false,
    scene3DOnly:true,
    navigationInstructionsInitiallyVisible:true,
    
  })
  viewer.resolutionScale = 1.2
  viewer.scene.globe.depthTestAgainstTerrain = true
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.postProcessStages.fxaa.enabled = true;
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(117.3307246479066, 33.0004749662003, 600000.0),
    orientation: {
      heading: 0,
      pitch: -1.0,
      roll: 0.0
    },

  })
  const shelterRadar: ShelterRadar = new ShelterRadar({ viewer })
  shelterRadar.createRadar({
    position: Cartesian3.fromDegrees(117.3307246479066, 35.9004749662003, 0)
  })

  const stickRadar:StickRadar = new StickRadar({viewer})
  stickRadar.createRadar({lat:35.9004749662003, lng:117.3307246479066})

  const solidRada:RadarSolidScan = new RadarSolidScan({viewer})
  solidRada.createRadar({
    position: Cartesian3.fromDegrees(117.1513137612399, 37.950227497287244, 0)
  })


  const handler:ScreenSpaceEventHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((event:ScreenSpaceEventHandler.PositionedEvent) => {
    // console.log(event)
    const pickedPosition:Cartesian3|undefined = viewer?.scene.pickPosition(event.position)
    if(defined(pickedPosition)){
      console.log(pickedPosition)
      let position:Cartographic = Cartographic.fromCartesian(pickedPosition!) //Ellipsoid.WGS84.cartesianToCartographic(pickedPosition!)
      let longitude = Math.toDegrees(position.longitude)
      let latitude = Math.toDegrees(position.latitude)
      console.log(`longitude:${longitude},latitude:${latitude}`)
    }
  }, ScreenSpaceEventType.LEFT_CLICK)

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
