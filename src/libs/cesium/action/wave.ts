import { type InitProps } from '../type';
import * as Cesium from 'cesium'
export class Wave{
  
  private _viewer:Cesium.Viewer;
  private _waveArr:Cesium.Entity[] = []
  constructor(props: InitProps){
    this._viewer = props.viewer;
  }

  public createWave(){
    // const wave = this._viewer.scene.primitives.add({

    // })

    const wave = this._viewer.entities.add({
      position:Cesium.Cartesian3.fromDegrees(117.1513137612399, 35.950227497287244, 25000),
      cylinder:{
        length:400000.0,
        topRadius:0.0,
        bottomRadius:200000.0,
        material:Cesium.Color.RED
      }
    })
    this._waveArr.push(wave);
  }
}