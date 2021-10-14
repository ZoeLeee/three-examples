import React, { useEffect, useRef } from "react";
import Base from "../../lib/base";
import * as THREE from "three";

interface Props {}

const templateVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main(){
        vec4 modelPosition=modelMatrix*vec4(position,1.);
        vec4 viewPosition=viewMatrix*modelPosition;
        vec4 projectedPosition=projectionMatrix*viewPosition;
        gl_Position=projectedPosition;
        
        vUv=uv;
        vPosition=position;
    }
`;

const templateFragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;

    varying vec2 vUv;
    varying vec3 vPosition;

    void main(){
        vec3 color=vec3(vUv.x,vUv.y,1.);
        gl_FragColor=vec4(color,1.);
    }
`;

class Template extends Base {
  clock!: THREE.Clock;
  templateMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
  }
  // 创建材质
  createTemplateMaterial() {
    const templateMaterial = new THREE.ShaderMaterial({
      vertexShader: templateVertexShader,
      fragmentShader: templateFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
    });
    this.templateMaterial = templateMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.templateMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.templateMaterial) {
      this.templateMaterial.uniforms.uTime.value = elapsedTime;
      this.templateMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

const Fire: React.FC<Props> = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = () => {
      const template = new Template(ref.current, false);
      template.init();
    };
    start();
  }, []);
  return (
      <div
        ref={ref}
        style={{ width: 500, height: 500 }}
        className="template"
      ></div>
  );
};

export default Fire;
