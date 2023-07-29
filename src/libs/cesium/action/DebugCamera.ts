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


    this._viewer.entities.add({
      point:{
        show:true,
        outlineColor:Cesium.Color.RED,  
        outlineWidth:10,
        pixelSize:30,
      },
      position:start
    })

    this._viewer.entities.add({
      point:{
        show:true,
        outlineColor:Cesium.Color.GREEN,  
        outlineWidth:10,
        pixelSize:30,
      },
      position:target
    })

    const camera_direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(target, start, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    const spotLightCamera = new Cesium.Camera(this._viewer.scene);
    console.log(spotLightCamera)
    spotLightCamera.position = start;
    spotLightCamera.direction = camera_direction;
    // spotLightCamera.frustum
    //spotLightCamera.frustum.near = 1
    //spotLightCamera.frustum.far = 100 //= new Cesium.PerspectiveFrustum({near:1, far:100})
    // const frustum = spotLightCamera.frustum as Cesium.PerspectiveFrustum;
    let frustum = new Cesium.PerspectiveFrustum();
    frustum = (spotLightCamera.frustum as Cesium.PerspectiveFrustum).clone(frustum)
    frustum.fov = Cesium.Math.PI_OVER_SIX
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

    const orientation = Cesium.Quaternion.fromRotationMatrix(
      rotation, 
      scratchOritentation
    );

    const instanceOutline = new Cesium.GeometryInstance({
      geometry:new Cesium.FrustumGeometry({
        frustum,//:spotLightCamera.frustum as Cesium.PerspectiveFrustum,
        origin:position,
        orientation
      }),
      attributes:{
        color:Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.CYAN.withAlpha(0.5)),
        show:new Cesium.ShowGeometryInstanceAttribute(true)
      }
    })

    //https://www.jianshu.com/p/f2c9a4cac078
    //packages\engine\Source\Scene\DebugCameraPrimitive.js

    const newPrimitive = this._viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances:instanceOutline,
        appearance:new Cesium.PerInstanceColorAppearance(
          {
            translucent:true,
            flat:true
          }
        )
      })
    )

    this._viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
      modelMatrix:newPrimitive.modelMatrix,
      length:100000.0,
      width:10.0
    }))
  }


}