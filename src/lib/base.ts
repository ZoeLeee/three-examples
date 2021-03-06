import * as THREE from "three";
import ky from "kyouka";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import Stats from "three/examples/jsm/libs/stats.module";
import * as dat from "three/examples/jsm/libs/dat.gui.module";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

const getNormalizedMousePos = (e: MouseEvent | Touch) => {
  return {
    x: (e.clientX / window.innerWidth) * 2 - 1,
    y: -(e.clientY / window.innerHeight) * 2 + 1,
  };
};

class Base {
  debug: boolean;
  container: HTMLElement | null;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  rendererParams!: Record<string, any>;
  perspectiveCameraParams!: Record<string, any>;
  orthographicCameraParams!: Record<string, any>;
  cameraPosition!: THREE.Vector3;
  lookAtPosition!: THREE.Vector3;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  mousePos!: THREE.Vector2;
  raycaster!: THREE.Raycaster;
  sound!: THREE.Audio;
  stats!: Stats;
  composer!: EffectComposer;
  shaderMaterial!: THREE.ShaderMaterial;
  mouseSpeed!: number;
  viewport!: any;
  constructor(sel: string | HTMLElement, debug = false) {
    this.debug = debug;
    this.container =
      typeof sel === "string" ? document.querySelector(sel) : sel;
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 100,
    };
    this.orthographicCameraParams = {
      zoom: 2,
      near: -100,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(0, 3, 10);
    this.lookAtPosition = new THREE.Vector3(0, 0, 0);
    this.rendererParams = {
      outputEncoding: THREE.LinearEncoding,
      config: {
        alpha: true,
        antialias: true,
      },
    };
    this.mousePos = new THREE.Vector2(0, 0);
    this.mouseSpeed = 0;
  }
  // ?????????
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // ????????????
  createScene() {
    const scene = new THREE.Scene();
    if (this.debug) {
      scene.add(new THREE.AxesHelper());
      const stats = Stats();
      this.container!.appendChild(stats.dom);
      this.stats = stats;
    }
    this.scene = scene;
  }
  // ??????????????????
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container!);
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    this.camera = camera;
  }
  // ??????????????????
  createOrthographicCamera() {
    const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
    const { left, right, top, bottom, near, far } = orthographicCameraParams;
    const camera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    this.camera = camera;
  }
  // ????????????????????????
  updateOrthographicCameraParams() {
    const { container } = this;
    const { zoom, near, far } = this.orthographicCameraParams;
    const aspect = calcAspect(container!);
    this.orthographicCameraParams = {
      left: -zoom * aspect,
      right: zoom * aspect,
      top: zoom,
      bottom: -zoom,
      near,
      far,
      zoom,
    };
  }
  // ????????????
  createRenderer(useWebGL1 = false) {
    const { rendererParams } = this;
    const { outputEncoding, config } = rendererParams;
    const renderer = !useWebGL1
      ? new THREE.WebGLRenderer(config)
      : new THREE.WebGL1Renderer(config);
    renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    renderer.outputEncoding = outputEncoding;
    this.resizeRendererToDisplaySize();
    this.container?.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.renderer.setClearColor(0xffffff, 0);
  }
  // ????????????
  enableShadow() {
    this.renderer.shadowMap.enabled = true;
  }
  // ?????????????????????
  resizeRendererToDisplaySize() {
    const { renderer } = this;
    if (!renderer) {
      return;
    }
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const { clientWidth, clientHeight } = canvas;
    const width = (clientWidth * pixelRatio) | 0;
    const height = (clientHeight * pixelRatio) | 0;
    const isResizeNeeded = canvas.width !== width || canvas.height !== height;
    if (isResizeNeeded) {
      renderer.setSize(width, height, false);
    }
    return isResizeNeeded;
  }
  // ????????????
  createMesh(
    meshObject: any,
    container: THREE.Scene | THREE.Mesh = this.scene
  ) {
    const {
      geometry = new THREE.BoxGeometry(1, 1, 1),
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#d9dfc8"),
      }),
      position = new THREE.Vector3(0, 0, 0),
    } = meshObject;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    container.add(mesh);
    return mesh;
  }
  // ????????????
  createLight() {
    const dirLight = new THREE.DirectionalLight(
      new THREE.Color("#ffffff"),
      0.5
    );
    dirLight.position.set(0, 50, 0);
    this.scene.add(dirLight);
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
    this.scene.add(ambiLight);
  }
  // ??????????????????
  createOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    const { lookAtPosition } = this;
    controls.target.copy(lookAtPosition);
    controls.update();
    this.controls = controls;
  }
  // ????????????
  addListeners() {
    this.onResize();
  }
  // ??????????????????
  onResize() {
    window.addEventListener("resize", (e) => {
      if (this.shaderMaterial) {
        this.shaderMaterial.uniforms.uResolution.value.x = window.innerWidth;
        this.shaderMaterial.uniforms.uResolution.value.y = window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      } else {
        if (this.camera instanceof THREE.PerspectiveCamera) {
          const aspect = calcAspect(this.container!);
          const camera = this.camera as THREE.PerspectiveCamera;
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
        } else if (this.camera instanceof THREE.OrthographicCamera) {
          this.updateOrthographicCameraParams();
          const camera = this.camera as THREE.OrthographicCamera;
          const { left, right, top, bottom, near, far } =
            this.orthographicCameraParams;
          camera.left = left;
          camera.right = right;
          camera.top = top;
          camera.bottom = bottom;
          camera.near = near;
          camera.far = far;
          camera.updateProjectionMatrix();
        }
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
      }
    });
  }
  // ??????
  update() {
    console.log("animation");
  }
  // ??????
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.resizeRendererToDisplaySize();
      this.update();
      if (this.controls) {
        this.controls.update();
      }
      if (this.stats) {
        this.stats.update();
      }
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    });
  }
  // ????????????
  createText(
    text = "",
    config: any,
    material: THREE.Material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
    })
  ) {
    //@ts-ignore
    const geo = new THREE.TextGeometry(text, config);
    const mesh = new THREE.Mesh(geo, material);
    return mesh;
  }
  // ???????????????
  createAudioSource() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    const sound = new THREE.Audio(listener);
    this.sound = sound;
  }
  // ????????????
  loadAudio(url: string): Promise<AudioBuffer> {
    const loader = new THREE.AudioLoader();
    return new Promise((resolve) => {
      loader.load(url, (buffer) => {
        this.sound.setBuffer(buffer);
        resolve(buffer);
      });
    });
  }
  // ????????????
  loadModel(url: string): Promise<THREE.Object3D> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          console.log(model);
          resolve(model);
        },
        undefined,
        (err) => {
          console.log(err);
          reject();
        }
      );
    });
  }
  // ??????FBX??????
  loadFBXModel(url: string): Promise<THREE.Object3D> {
    const loader = new FBXLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (obj) => {
          resolve(obj);
        },
        undefined,
        (err) => {
          console.log(err);
          reject();
        }
      );
    });
  }
  // ??????????????????
  createRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.trackMousePos();
  }
  // ??????????????????
  trackMousePos() {
    window.addEventListener("mousemove", (e) => {
      this.setMousePos(e);
    });
    window.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        this.setMousePos(e.touches[0]);
      },
      { passive: false }
    );
    window.addEventListener("touchmove", (e: TouchEvent) => {
      this.setMousePos(e.touches[0]);
    });
  }
  // ??????????????????
  setMousePos(e: MouseEvent | Touch) {
    const { x, y } = getNormalizedMousePos(e);
    this.mousePos.x = x;
    this.mousePos.y = y;
  }
  // ???????????????
  getInterSects(container = this.scene): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(
      container.children,
      true
    );
    return intersects;
  }
  // ??????????????????
  onChooseIntersect(target: THREE.Object3D, container = this.scene) {
    const intersects = this.getInterSects(container);
    const intersect = intersects[0];
    if (!intersect || !intersect.face) {
      return null;
    }
    const { object } = intersect;
    return target === object ? intersect : null;
  }
  // ???????????????????????????fov??????
  getScreenFov() {
    return ky.rad2deg(
      2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
    );
  }
  // ?????????????????????
  getBaryCoord(bufferGeometry: THREE.BufferGeometry) {
    // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
    const length = bufferGeometry.attributes.position.array.length;
    const count = length / 3;
    const bary = [];
    for (let i = 0; i < count; i++) {
      bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
    }
    const aCenter = new Float32Array(bary);
    bufferGeometry.setAttribute(
      "aCenter",
      new THREE.BufferAttribute(aCenter, 3)
    );
  }
  // ??????????????????
  trackMouseSpeed() {
    // https://stackoverflow.com/questions/6417036/track-mouse-speed-with-js
    let lastMouseX = -1;
    let lastMouseY = -1;
    let mouseSpeed = 0;
    window.addEventListener("mousemove", (e) => {
      const mousex = e.pageX;
      const mousey = e.pageY;
      if (lastMouseX > -1) {
        mouseSpeed = Math.max(
          Math.abs(mousex - lastMouseX),
          Math.abs(mousey - lastMouseY)
        );
        this.mouseSpeed = mouseSpeed / 100;
      }
      lastMouseX = mousex;
      lastMouseY = mousey;
    });
    document.addEventListener("mouseleave", () => {
      this.mouseSpeed = 0;
    });
  }
  // ??????PCFSoft??????
  usePCFSoftShadowMap() {
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  // ??????VSM??????
  useVSMShadowMap() {
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
  }
  // ????????????????????????z???
  setCameraUpZ() {
    this.camera.up.set(0, 0, 1);
  }
  // ??????viewport
  getViewport() {
    const { camera } = this;
    const position = new THREE.Vector3();
    const target = new THREE.Vector3();
    const distance = camera.getWorldPosition(position).distanceTo(target);
    const fov = ((camera as any).fov * Math.PI) / 180; // convert vertical fov to radians
    const h = 2 * Math.tan(fov / 2) * distance; // visible height
    const w = h * (window.innerWidth / window.innerHeight);
    const viewport = { width: w, height: h };
    this.viewport = viewport;
  }
  // ??????HDR
  loadHDR(url: string): Promise<THREE.Texture> {
    const loader = new RGBELoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          const generator = new THREE.PMREMGenerator(this.renderer);
          const envmap = generator.fromEquirectangular(texture).texture;
          texture.dispose();
          generator.dispose();
          resolve(envmap);
        },
        undefined,
        (err) => {
          console.log(err);
          reject();
        }
      );
    });
  }
  // ???mesh???????????????????????????
  sampleParticlesPositionFromMesh(
    geometry: THREE.BufferGeometry,
    count = 10000
  ) {
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const sampler = new MeshSurfaceSampler(mesh).build();
    const particlesPosition = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3();
      sampler.sample(position);
      particlesPosition.set(position.toArray(), i * 3);
    }
    return particlesPosition;
  }
}

export default Base;
