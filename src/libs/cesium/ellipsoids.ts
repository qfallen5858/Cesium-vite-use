import * as Cesium from 'cesium';
import type { InitProps } from './type';
export class EllipsoidExample{
  private _viewer:Cesium.Viewer;

  public constructor(props:InitProps){
    this._viewer = props.viewer;
  }

  public createNormal(position:Cesium.Cartesian3, radii:Cesium.Cartesian3){
    this._viewer.entities.add({
      position, 
      ellipsoid:{
        radii,
        material:new Cesium.Color(0.85, 0.82, 0.48)
      }
    })
  }

  public createDome(position:Cesium.Cartesian3, radii:Cesium.Cartesian3){
    this._viewer.entities.add({
      position, 
      ellipsoid:{
        radii,
        material:Cesium.Color.BLUE.withAlpha(0.4),
        minimumCone:Cesium.Math.PI_OVER_SIX,
        maximumCone:Cesium.Math.PI_OVER_TWO,
        outline:true
      }
    })
  }
}