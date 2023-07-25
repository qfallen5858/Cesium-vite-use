import * as Cesium from 'cesium'

export type AirPlaneProps = {
  viewer: Cesium.Viewer
}

export type CreateAirPlaneParams = {
  position: Cesium.Cartesian3
  url: string
}

export class AirPlane {
  private _viewer: Cesium.Viewer

  private _hpRoll: Cesium.HeadingPitchRoll
  constructor(props: AirPlaneProps) {
    this._viewer = props.viewer
    this._hpRoll = new Cesium.HeadingPitchRoll()
  }

  public async createAirplane(params: CreateAirPlaneParams) {
    const { position, url} = params
    const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
    try {
      const model = await Cesium.Model.fromGltfAsync({
        url,
        modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
          position,
          this._hpRoll,
          Cesium.Ellipsoid.WGS84,
          fixedFrameTransform
        ),
        minimumPixelSize: 128
      })
      this._viewer.scene.primitives.add(model)
    } catch (error) {
      console.log(`Failed to load model.${error}`)
    }
  }
}
