import { fileURLToPath, URL } from 'node:url'
import {
  AliasOptions,
  defineConfig,
  loadEnv,
  PluginOption,
  ResolveOptions,
  splitVendorChunkPlugin
} from 'vite'
import vue from '@vitejs/plugin-vue'
// import externalGlobals from 'rollup-plugin-external-globals'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { insertHtml, h } from 'vite-plugin-insert-html'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import compress from 'vite-plugin-compression'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig((context) => {
  const mode = context.mode
  const envDir = 'env'
  const isProd = mode === 'production'

  const env = loadEnv(mode, envDir)

  const cesiumBaseUrl = env['VITE_CESIUM_BASE_URL']

  const base = '/'

  const plugins: PluginOption[] = [
    vue(),
    vueDevTools(),
    splitVendorChunkPlugin(),
    viteExternalsPlugin({
      cesium: 'Cesium'
    }),
    insertHtml({
      head: [
        h('script', {
          src: isProd ? `${cesiumBaseUrl}Cesium.js` : `${base}${cesiumBaseUrl}Cesium.js`
        })
      ]
    })
  ]

  if (!isProd) {
    // 开发模式，复制 node_modules 下的 cesium 依赖
    const cesiumLibraryRoot = 'node_modules/cesium/Build/CesiumUnminified/'
    const cesiumLibraryCopyToRootPath = 'libs/cesium/' // 相对于打包后的路径
    const cesiumStaticSourceCopyOptions = ['Assets', 'ThirdParty', 'Workers', 'Widgets'].map(
      (dirName) => {
        return {
          src: `${cesiumLibraryRoot}${dirName}/*`, // 注意后面的 * 字符，文件夹全量复制
          dest: `${cesiumLibraryCopyToRootPath}${dirName}`
        }
      }
    )
    plugins.push(
      viteStaticCopy({
        targets: [
          {
            src:'./src/assets/*',
            dest:'assets/'

          },
          // 主库文件，开发时选用非压缩版的 IIFE 格式主库文件
          {
            src: `${cesiumLibraryRoot}Cesium.js`,
            dest: cesiumLibraryCopyToRootPath
          },
          // 四大静态文件夹
          ...cesiumStaticSourceCopyOptions
        ]
      })
    )
  }
  plugins.push(
    compress({
      threshold: 10 * 1024
    })
  )

  const resolve: ResolveOptions & { alias?: AliasOptions } = {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
        // '@': fileURLToPath(new URL('./src', import.meta.url))
      },{
        find:'asset',
        replacement:fileURLToPath(new URL('./asset', import.meta.url))
      }
    ]
  }

  return {
    base,
    envDir,
    mode,
    plugins,
    resolve
  }

  // plugins: [
  //   vue(),
  //   splitVendorChunkPlugin(),
  //   viteExternalsPlugin({
  //     cesium:'Cesium'
  //   }),
  //   viteStaticCopy({
  //     targets:[
  //       {
  //         src:'node_modules/cesium/Build/CesiumUnminified/Cesium.js',
  //         dest:'libs/cesium/'
  //       },
  //       {
  //         src:'node_modules/cesium/Build/CesiumUnminified/Assets/*',
  //         dest:'libs/cesium/Assets/'
  //       },
  //       {
  //         src:'node_modules/cesium/Build/CesiumUnminified/ThirdParty/*',
  //         dest:'libs/cesium/ThirdParty/'
  //       },
  //       {
  //         src:'node_modules/cesium/Build/CesiumUnminified/Workers/*',
  //         dest:'libs/cesium/Workers/'
  //       },
  //       {
  //         src:'node_modules/cesium/Build/CesiumUnminified/Widgets/*',
  //         dest:'libs/cesium/Widgets/'
  //       },
  //     ]
  //   }),
  //   insertHtml({
  //     head:[
  //       h('script',{
  //         src:'libs/cesium/Cesium.js'
  //       })
  //     ]
  //   })
  // ],
  // // build:{
  // //   rollupOptions:{
  // //     externalGlobals({
  // //       cesium:'Cesium'
  // //     })
  // //   }
  // // },
  // resolve: {
  //   alias: {
  //     '@': fileURLToPath(new URL('./src', import.meta.url))
  //   }
  // }
})
