import * as Cesium from 'cesium'
import { type InitProps } from '../type'

export type CreateParams = {
  position: Cesium.Cartesian3
  url: string
  speed?: number
  leadTime?: number
  trailTime?: number
  width?: number
}

export type PrimitiveWithPathItem = {
  path: Cesium.Entity
  primitive: Cesium.Primitive
}

export class PrimitiveWithPath {
  private _viewer: Cesium.Viewer

  private _fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')

  private _arr: PrimitiveWithPathItem[] = []

  constructor(props: InitProps) {
    this._viewer = props.viewer
  }

  public async create(params: CreateParams) {
    let position = params.position
    const { url, speed = 10, leadTime = 0, trailTime = 60, width = 5 } = params
    const pathPosition = new Cesium.SampledPositionProperty()
    pathPosition.addSample(Cesium.JulianDate.now(), position)

    const pathEntity = this._viewer.entities.add({
      position: pathPosition,
      name: 'path',
      path: {
        show: true,
        leadTime,
        trailTime,
        width,
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          taperPower: 0.3,
          color: Cesium.Color.PALEGOLDENROD
        })
      }
    })

    const hpRoll = new Cesium.HeadingPitchRoll()

    let speedVector = new Cesium.Cartesian3()

    const primitive = this._viewer.scene.primitives.add(
      await Cesium.Model.fromGltfAsync({
        url,
        modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
          position,
          hpRoll,
          Cesium.Ellipsoid.WGS84,
          this._fixedFrameTransform
        ),
        minimumPixelSize: 128
      })
    )
    this._arr.push({primitive, path:pathEntity})

    this._viewer.scene.preUpdate.addEventListener(() => {
      speedVector = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.UNIT_X,
        speed * 10,
        speedVector
      )

      position = Cesium.Matrix4.multiplyByPoint(primitive.modelMatrix, speedVector, position)
      pathPosition.addSample(Cesium.JulianDate.now(), position)
      Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        hpRoll,
        Cesium.Ellipsoid.WGS84,
        this._fixedFrameTransform,
        primitive.modelMatrix
      )
    })
  }

  public clear():void{
    this._arr.forEach(item =>{
      this._viewer.entities.remove(item.path)
      this._viewer.scene.primitives.remove(item.primitive)
    })
    this._arr = []
  }
}
