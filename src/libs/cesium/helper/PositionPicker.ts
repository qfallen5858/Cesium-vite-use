import * as Cesium from 'cesium'
import { type InitProps } from '../type'

export class PositionPicker {
  private _viewer: Cesium.Viewer

  private _labelEntity: Cesium.Entity | null = null

  private _handler:Cesium.ScreenSpaceEventHandler;

  public constructor(initProps: InitProps) {
    this._viewer = initProps.viewer
    this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas)
  }

  public startPick() {
    if (Cesium.defined(this._labelEntity)) {
      return
    }
    this._labelEntity = this._viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
      }
    })

    // const handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas)
    this._handler.setInputAction(this._moveFunc, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  private _moveFunc = (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
    console.log(movement.endPosition)
    const cartesian = this._viewer.camera.pickEllipsoid(
      movement.endPosition,
      this._viewer.scene.globe.ellipsoid
    )
    console.log(cartesian)
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      // console.log(cartographic)
      cartographic.height = 10
      const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2)
      const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2)

      // this._labelEntity!.position = new Cesium.ConstantPositionProperty(cartesian)
      this._labelEntity!.position = new Cesium.ConstantPositionProperty(
        Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          cartographic.height + 10000.0,
          this._viewer.scene.globe.ellipsoid
        )
      )
      // console.log(this._labelEntity?.position)
      this._labelEntity!.label!.show = new Cesium.ConstantProperty(true)
      this._labelEntity!.label!.text = new Cesium.ConstantProperty(
        `Lon:${longitudeString} \n Lat:${latitudeString}`
      )
    } else {
      this._labelEntity!.label!.show = new Cesium.ConstantProperty(false)
    }
  }

  public stopPick() {
    if (!Cesium.defined(this._labelEntity)) {
      return
    }

    this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
}
