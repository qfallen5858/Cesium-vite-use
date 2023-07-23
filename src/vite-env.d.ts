///<reference types="vite/client"/>

interface ImportMetaEnv{
  readonly VITE_CESIUM_BASE_URL:string
  readonly PROD:boolean
}

interface ImportMeta{
  readonly env:ImportMetaEnv
}