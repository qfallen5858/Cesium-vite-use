<script setup lang="ts">
import {onMounted, ref} from 'vue'
// import {TileMapServiceImageryProvider, Viewer, buildModuleUrl} from 'cesium'
import {TileMapServiceImageryProvider, Viewer, buildModuleUrl} from 'cesium'
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css'

const viewerDivRef = ref<HTMLDivElement>()
window.CESIUM_BASE_URL = 'libs/cesium'

onMounted(()=>{
  new Viewer(viewerDivRef.value as HTMLElement, {
    imageryProvider: new TileMapServiceImageryProvider({
      url:'libs/cesium/Assets/Textures/NaturalEarthII'
    })
  })
})


</script>

<template>
  <div id="cesium-viewer" ref="viewerDivRef"></div>
</template>

<style scoped>
#cesium-viewer{
  width: 100%;
  height: 100%;
}
</style>
