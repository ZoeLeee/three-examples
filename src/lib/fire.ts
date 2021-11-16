import * as THREE from "three";
import Base from "./base";
import rayMarchingFireFragmentShader from '../modules/rayMarchingFireFragmentShader.glsl';
import rayMarchingFireVertexShader from '../modules/rayMarchingFireVertexShader.glsl';


export class Fire extends Base {
    params:Record<string,string|number>;
    colorParams:Record<string,string>;
    clock!: THREE.Clock;
    templateMaterial!: THREE.ShaderMaterial;
    constructor(sel: string, debug: boolean) {
        super(sel, debug);
        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 0, 1);
        this.params = {
            velocity: 2,
        };
        this.colorParams = {
            color1: "#ff801a",
            color2: "#ff5718",
        };
    }
    init(){
        super.init();
        this.createTemplateMaterial();
        this.createPlane();
    }
    // 创建材质
    createTemplateMaterial() {
        const templateMaterial = new THREE.ShaderMaterial({
            vertexShader: rayMarchingFireVertexShader,
            fragmentShader: rayMarchingFireFragmentShader,
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
                  uVelocity: {
                    value: 3,
                  },
                  uColor1: {
                    value: new THREE.Color(this.colorParams.color1),
                  },
                  uColor2: {
                    value: new THREE.Color(this.colorParams.color2),
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