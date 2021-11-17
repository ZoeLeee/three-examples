import * as THREE from "three";
import Base from "./base";
import rayMarchingFragmentShader from '../modules/rayMarchingFragmentShader.glsl';
import rayMarchingFireVertexShader from '../modules/rayMarchingFireVertexShader.glsl';


const matcapTextureUrl = "https://i.loli.net/2021/02/27/7zhBySIYxEqUFW3.png";

export class RayMarching extends Base {
    rayMarchingMaterial: THREE.ShaderMaterial;
    clock!: THREE.Clock;
    constructor(sel: string, debug: boolean) {
        super(sel, debug);
        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 0, 0);
        this.orthographicCameraParams = {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0,
            far: 1,
            zoom: 1
        };
    }

    // 初始化
    init() {
        this.createScene();
        this.createOrthographicCamera();
        this.createRenderer();
        this.createRayMarchingMaterial();
        this.createPlane();
        this.createLight();
        this.trackMousePos();
        this.addListeners();
        this.setLoop();
    }
    // 创建平面
    createPlane() {
        const geometry = new THREE.BoxBufferGeometry(1,1,1);
        const material = this.rayMarchingMaterial;
        this.createMesh({
            geometry,
            material
        });
    }
    // 创建光线追踪材质
    createRayMarchingMaterial() {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(matcapTextureUrl);
        const rayMarchingMaterial = new THREE.ShaderMaterial({
            vertexShader: rayMarchingFireVertexShader,
            fragmentShader: rayMarchingFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uTexture: {
                    value: texture
                },
                uProgress: {
                    value: 1
                },
                uVelocityBox: {
                    value: 0.25
                },
                uVelocitySphere: {
                    value: 0.5
                },
                uAngle: {
                    value: 1.5
                },
                uDistance: {
                    value: 1.2
                }
            }
        });
        this.rayMarchingMaterial = rayMarchingMaterial;
    }
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        const mousePos = this.mousePos;

        if (this.rayMarchingMaterial) {
            this.rayMarchingMaterial.uniforms.uTime.value = elapsedTime;
            this.rayMarchingMaterial.uniforms.uMouse.value = mousePos;
        }
    }
}
