import * as Cesium from 'cesium'

export type RadarProps = {
  viewer:Cesium.Viewer;
}

export type CreateRadarParams = {
  position: Cesium.Cartesian3,
  num?:number,
  maxAngle?:number
  radii?:Cesium.Cartesian3,
  innerRadii?:Cesium.Cartesian3
}

export class ShelterRadar{
  private _viewer:Cesium.Viewer;
  private _radarArr:Cesium.Entity[] = []
  constructor(props:RadarProps){
    this._viewer = props.viewer;
  }

  public createRadar(params:CreateRadarParams):Cesium.Entity{
    const {position, num = 0, maxAngle = 300, radii = new Cesium.Cartesian3(50000,50000,20000),innerRadii = new Cesium.Cartesian3(10000.0, 10000.0, 10000.0)} = params;
    let angle:number = num;
    const radar = this._viewer.entities.add({
      position,
      orientation: new Cesium.CallbackProperty(()=>{
        angle += 0.3;
        if(angle >= maxAngle) angle = 0;
        return Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll((angle * Math.PI) / 180.0, 0, 0))
      }, false),
      ellipsoid:{
        radii,
        innerRadii,
        minimumClock:Cesium.Math.toRadians(-10),
        maximumClock:Cesium.Math.toRadians(10),
        minimumCone:Cesium.Math.toRadians(90),
        maximumCone:Cesium.Math.toRadians(90),
        material:Cesium.Color.YELLOW.withAlpha(0.5),
        outline:true,
        outlineColor:Cesium.Color.YELLOW.withAlpha(0.8),
        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    this._radarArr.push(radar)
    return radar
  }

  public clear():void{
    this._radarArr.forEach(entity => {
      this._viewer.entities.remove(entity)
    })
    this._radarArr = []
  }

  public remove(entity:Cesium.Entity):void{
    this._viewer.entities.remove(entity)
    this._radarArr = this._radarArr.filter(_entity => _entity.id != entity.id)
  }
}

export type StickRadarParams = {
  lat:number,
  lng:number,
  alt?:number,
  scanColor?:Cesium.Color,
  duration?:number,
  radius?:number
}

export class StickRadar{
  private _viewer:Cesium.Viewer;

  private randarArr:any[] = []
  constructor(props:RadarProps){
    this._viewer = props.viewer;
  }

  public get viewer():Cesium.Viewer{
    return this._viewer;
  }

  createRadar(params:StickRadarParams){
    const {lat, lng, alt = 0, scanColor, duration, radius} = params
    const location = new Cesium.Cartographic(Cesium.Math.toRadians(lng), Cesium.Math.toRadians(lat), alt)
    const color = scanColor || new Cesium.Color(118/255, 215/255, 209/255, 0.6)
    const time = duration || 4000
    const radarRaius = radius || 30000
    const radar = this.addRadarScanPostStage(location, radarRaius, color, time);
    this.randarArr.push(radar)
  }

  addRadarScanPostStage(location:Cesium.Cartographic, radius:number , scanColor:Cesium.Color, duration:number ){
    /* // 彩色纹理
      uniform sampler2D colorTexture;
      // 深度纹理
      uniform sampler2D depthTexture;
      // 纹理坐标
      varying vec2 v_textureCoordinates;
      // 扫描中心
      uniform vec4 u_scanCenterEC;
      // 扫描平面法线EC
      uniform vec3 u_scanPlaneNormalEC;
      // 扫描线法线EC
      uniform vec3 u_scanLineNormalEC;
      // 半径
      uniform float u_radius;
      // 扫描的颜色
      uniform vec4 u_scanColor;
      
      bool isPointOnLineRight( in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt) {
          vec3 v01 = testPt - ptOnLine;
          normalize(v01);
          vec3 temp = cross(v01, lineNormal);
          float d = dot(temp, u_scanPlaneNormalEC);
          return d > 0.5;
      }
      vec4 toEye( in vec2 uv, in float depth) {
          vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
          vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
          posInCamera = posInCamera / posInCamera.w;
          return posInCamera;
      }
      vec3 pointProjectOnPlane( in vec3 planeNormal, in vec3 planeOrigin, in vec3 point) {
          vec3 v01 = point - planeOrigin;
          float d = dot(planeNormal, v01);
          return (point - planeNormal * d);
      }
      float distancePointToLine( in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt) {
          vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);
          return length(tempPt - ptOnLine);
      }
      float getDepth( in vec4 depth) {
          float z_window = czm_unpackDepth(depth);
          z_window = czm_reverseLogDepth(z_window);
          float n_range = czm_depthRange.near;
          float f_range = czm_depthRange.far;
          return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
      }
      void main() {
          // 得到釉色 = 结构二维(彩色纹理,纹理坐标)
          gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
          // 深度 = (釉色 = 结构二维(深度纹理,纹理坐标))
          float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
          // 视角 = (纹理坐标,深度)
          vec4 viewPos = toEye(v_textureCoordinates, depth);
          // 平面点投影 = (扫描平面法线,扫描中心,视角)
          vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
          // 差值
          float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
          // 直径 = 两个半径
          float twou_radius = u_radius * 2.0;
          if (dis < u_radius) {
              float f0 = 1.0 - abs(u_radius - dis) / u_radius;
              f0 = pow(f0, 64.0);
              vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;
              float f = 0.0;
              if (isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz)) {
                  float dis1 = length(prjOnPlane.xyz - lineEndPt);
                  f = abs(twou_radius - dis1) / twou_radius;
                  f = pow(f, 3.0);
              }
              gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);
          }
      } */
      const ScanSegmentShader =
      "uniform sampler2D colorTexture;\n" +
      "uniform sampler2D depthTexture;\n" +
      "in vec2 v_textureCoordinates;\n" +
      "uniform vec4 u_scanCenterEC;\n" +
      "uniform vec3 u_scanPlaneNormalEC;\n" +
      "uniform vec3 u_scanLineNormalEC;\n" +
      "uniform float u_radius;\n" +
      "uniform vec4 u_scanColor;\n" +
      "out vec4 fragColor;" +

      "vec4 toEye(in vec2 uv, in float depth)\n" +
      " {\n" +
      " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
      " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
      " posInCamera =posInCamera / posInCamera.w;\n" +
      " return posInCamera;\n" +
      " }\n" +

      "bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
      "{\n" +
      "vec3 v01 = testPt - ptOnLine;\n" +
      "normalize(v01);\n" +
      "vec3 temp = cross(v01, lineNormal);\n" +
      "float d = dot(temp, u_scanPlaneNormalEC);\n" +
      "return d > 0.5;\n" +
      "}\n" +

      "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
      "{\n" +
      "vec3 v01 = point -planeOrigin;\n" +
      "float d = dot(planeNormal, v01) ;\n" +
      "return (point - planeNormal * d);\n" +
      "}\n" +

      "float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
      "{\n" +
      "vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n" +
      "return length(tempPt - ptOnLine);\n" +
      "}\n" +

      "float getDepth(in vec4 depth)\n" +
      "{\n" +
      "float z_window = czm_unpackDepth(depth);\n" +
      "z_window = czm_reverseLogDepth(z_window);\n" +
      "float n_range = czm_depthRange.near;\n" +
      "float f_range = czm_depthRange.far;\n" +
      "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
      "}\n" +

      "void main()\n" +
      "{\n" +
      "fragColor = texture(colorTexture, v_textureCoordinates);\n" +
      "float depth = getDepth( texture(depthTexture, v_textureCoordinates));\n" +
      "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
      "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
      "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
      "float twou_radius = u_radius * 2.0;\n" +
      "if(dis < u_radius)\n" +
      "{\n" +
      "float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n" +
      "f0 = pow(f0, 64.0);\n" +
      // lineEndPt扫描线
      "vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius * 0.5;\n" +
      "float f = 0.0;\n" +
      "if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n" +
      "{\n" +
      "float dis1= length(prjOnPlane.xyz - lineEndPt);\n" +
      "f = abs(twou_radius -dis1) / twou_radius;\n" +
      "f = pow(f, 3.0);\n" +
      "}\n" +
      //外边框 内边框颜色
      "fragColor = mix(fragColor, u_scanColor, f + f0);\n" +
      "}\n" +
      "}\n";
      const _Cartesian3Center = Cesium.Cartographic.toCartesian(location);
      const _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
  
      const _CartographicCenter1 = new Cesium.Cartographic(location.longitude, location.latitude, location.height + 500);
      const _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
      const _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
  
      const _CartographicCenter2 = new Cesium.Cartographic(location.longitude + Cesium.Math.toRadians(0.001), location.latitude, location.height);
      const _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
      const _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
      const _RotateQ = new Cesium.Quaternion();
      const _RotateM = new Cesium.Matrix3();
  
      const _time = (new Date()).getTime();
  
      const _scratchCartesian4Center = new Cesium.Cartesian4();
      const _scratchCartesian4Center1 = new Cesium.Cartesian4();
      const _scratchCartesian4Center2 = new Cesium.Cartesian4();
      const _scratchCartesian3Normal = new Cesium.Cartesian3();
      const _scratchCartesian3Normal1 = new Cesium.Cartesian3();
  
      const ScanPostStage = new Cesium.PostProcessStage({
        fragmentShader: ScanSegmentShader,
        uniforms: {
          //扫描中心点
          u_scanCenterEC: () => {
            return Cesium.Matrix4.multiplyByVector(this._viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
          },
          //扫描平面法线
          u_scanPlaneNormalEC: () => {
            const temp = Cesium.Matrix4.multiplyByVector(this._viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
            const temp1 = Cesium.Matrix4.multiplyByVector(this._viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
            _scratchCartesian3Normal.x = temp1.x - temp.x;
            _scratchCartesian3Normal.y = temp1.y - temp.y;
            _scratchCartesian3Normal.z = temp1.z - temp.z;
  
            Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
            return _scratchCartesian3Normal;
          },
          //扫描半径
          u_radius: radius,
          //扫描线的法线
          u_scanLineNormalEC: () => {
            const temp = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
            const temp1 = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
            const temp2 = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);
  
            _scratchCartesian3Normal.x = temp1.x - temp.x;
            _scratchCartesian3Normal.y = temp1.y - temp.y;
            _scratchCartesian3Normal.z = temp1.z - temp.z;
  
            Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
  
            _scratchCartesian3Normal1.x = temp2.x - temp.x;
            _scratchCartesian3Normal1.y = temp2.y - temp.y;
            _scratchCartesian3Normal1.z = temp2.z - temp.z;
  
            const tempTime = (((new Date()).getTime() - _time) % duration) / duration;
            // 第二个参数为 扫描幅度
            Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
            Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
            Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
            Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
            return _scratchCartesian3Normal1;
          },
          //扫描颜色
          u_scanColor: scanColor
        }
      });
      return this._viewer.scene.postProcessStages.add(ScanPostStage);
  
  }
  clear(){
    for(let i = 0; i < this.randarArr.length; i++){
      this._viewer.scene.postProcessStages.remove(this.randarArr[i])
    }
    this.randarArr = []
  }
}

export type CreateRadarSolidScanParams = {
  position: Cesium.Cartesian3,
  radius?:number,
  color?:Cesium.Color
  speed?:number,
  scanColor?:Cesium.Color
}


export class RadarSolidScan{
  private _viewer:Cesium.Viewer;
  private _radarArr:Cesium.Entity[] = []
  private _positionArr:number[] = []
  constructor(props:RadarProps){
    this._viewer = props.viewer;
  }

  public createRadar(params:CreateRadarSolidScanParams):Cesium.Entity{
    const {position, radius = 10000.0, color = new Cesium.Color(1.0, 1.0, 0.0, 0.3), speed = 1.0, scanColor = new Cesium.Color(1.0, 0.0, 0.0, 0.8)} = params
    const parentEntity = this._viewer.entities.getOrCreateEntity('radar');
    const radar = this._viewer.entities.add({
      parent:parentEntity,
      position:position,
      name:'立体雷达扫描',
      ellipsoid:{
        radii: new Cesium.Cartesian3(radius, radius, radius),
        material:color,
        outline:true,
        outlineColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
        outlineWidth:1
      }
    })

    let heading = 0;
    const centerCartographic = Cesium.Cartographic.fromCartesian(position);
    const lnt = Cesium.Math.toDegrees(centerCartographic.longitude)
    const lat = Cesium.Math.toDegrees(centerCartographic.latitude)
    this._viewer.clock.onTick.addEventListener(() => {
      heading += speed;
      this._positionArr = this._calculatePane(lnt, lat, radius, heading)
    })

    const scan = this._viewer.entities.add({
      parent:parentEntity,
      wall:{
        positions: new Cesium.CallbackProperty(()=>{
          return Cesium.Cartesian3.fromDegreesArrayHeights(this._positionArr)
        }, false),
        material:scanColor
      }
    })
    this._radarArr.push(radar, scan, parentEntity)
    // this._radarArr.push(parentEntity)
    return parentEntity;
  }

  public clear():void{
    this._radarArr.forEach(entity => {
      this._viewer.entities.remove(entity)
    })
    this._radarArr = []
  }

  public remove(entity:Cesium.Entity):void{
    for(let i = this._viewer.entities.values.length - 1; i >=0 ; i --){
      const _entity = this._viewer.entities.values[i];
      if((_entity.parent && _entity.parent.id === entity.id) || _entity.id === entity.id){
        this._viewer.entities.remove(_entity)
      }
    }
    this._viewer.entities.remove(entity);

    this._radarArr = this._radarArr.filter(_entity => {
      if((_entity.parent && _entity.parent.id === entity.id) || _entity.id === entity.id){
          return false;
      }
      return true;
    })
  }



  private _calculatePane(centerLnt:number, centerLat:number, radius:number, heading:number){
    // console.log(heading)
    const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(centerLnt, centerLat));//以中点建立相对坐标系变换矩阵
    const headingRadians = Cesium.Math.toRadians(heading)
    const deltaLnt = radius * Math.cos(headingRadians)
    const deltaLat = radius * Math.sin(headingRadians)
    const translation = Cesium.Cartesian3.fromElements(deltaLnt, deltaLat, 0)
    const targetCartesian = Cesium.Matrix4.multiplyByPoint(matrix, translation, new Cesium.Cartesian3())
    const targetCartographic = Cesium.Cartographic.fromCartesian(targetCartesian)
    const targetLntDegree = Cesium.Math.toDegrees(targetCartographic.longitude)
    const targetLatDegree = Cesium.Math.toDegrees(targetCartographic.latitude)
    return this._calculateSector(centerLnt, centerLat, targetLntDegree, targetLatDegree, radius)
  }

  private _calculateSector(centerLnt:number, centerLat:number, edgeLnt:number, edgeLat:number, radius:number){
    const positionArr:number[] = []
    positionArr.push(centerLnt, centerLat, 0)
    for(let i = 0; i <= 90; i++){
      const radians:number = Cesium.Math.toRadians(i)
      const height = radius * Math.sin(radians)
      const cos = Math.cos(radians)
      const lnt = (edgeLnt - centerLnt) * cos + centerLnt
      const lat = (edgeLat - centerLat) * cos + centerLat
      positionArr.push(lnt, lat, height)
    }
    return positionArr
  }
}