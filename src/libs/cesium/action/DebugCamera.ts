import * as Cesium from 'cesium';
import type { InitProps } from '../type';

export type CameraParams = {
  start:Cesium.Cartesian3,
  target:Cesium.Cartesian3
}


export class DebugCamera{
  private _viewer:Cesium.Viewer;

  public constructor(initProp:InitProps){
    this._viewer = initProp.viewer;
  }

  public create(params:CameraParams){
    const {start, target} = params;
    const camera_direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(target, start, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    const spotLightCamera = new Cesium.Camera(this._viewer.scene);
    spotLightCamera.position = start;
    spotLightCamera.direction = camera_direction;
    spotLightCamera.frustum = new Cesium.PerspectiveFrustum({near:1, far:100})

    const scratchRight = new Cesium.Cartesian3();
    const scratchRotation = new Cesium.Matrix3();
    const scratchOritentation = new Cesium.Quaternion();
    const position = spotLightCamera.positionWC;
    const direction = spotLightCamera.directionWC;
    const up = spotLightCamera.upWC;
    let right = spotLightCamera.rightWC

    right = Cesium.Cartesian3.negate(right, scratchRight);

    const rotation = scratchRotation;

    Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
    Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
    Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);

    const orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOritentation);

    const instanceOutline = new Cesium.GeometryInstance({
      geometry:new Cesium.FrustumGeometry({
        frustum:spotLightCamera.frustum,
        origin:start,
        orientation
      }),
      attributes:{
        color:Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED),
        show:new Cesium.ShowGeometryInstanceAttribute(true)
      }
    })

    //https://www.jianshu.com/p/f2c9a4cac078
    //packages\engine\Source\Scene\DebugCameraPrimitive.js

    const newPrimitive = this._viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances:instanceOutline,
        appearance:new Cesium.PerInstanceColorAppearance()
      })
    )
  }


}