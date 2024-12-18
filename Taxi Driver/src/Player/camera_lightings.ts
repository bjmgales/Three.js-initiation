import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/Addons.js';

export const defaultCam = (renderer: THREE.WebGLRenderer) => {
    let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 700);
    camera.position.set(0, 200, - 400);
    let cameraControl = new MapControls(camera, renderer.domElement);
    cameraControl.minDistance = 0;
    cameraControl.maxDistance = 500;
    return camera;
}

export const carCamera = (taxiRef: React.MutableRefObject<THREE.Object3D | null>) => {
    let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 700);

    taxiRef.current!.add(camera);
    setCamPosition(camera, 'finalCam')
    camera.lookAt(taxiRef.current?.position!)
    setCamAngle(camera, 'finalCam')
    return camera
}

type CamName = 'backCam' | 'defaultCam' | 'farCam' | 'frontCam' | 'finalCam' | 'coolCam' | 'actionCam';
export const setCamPosition = (camera: THREE.PerspectiveCamera, camName: CamName) => {
    camera.position.set(camPos[camName][0], camPos[camName][1], camPos[camName][2])
}

export const setCamAngle = (camera: THREE.PerspectiveCamera, camName: CamName) => {
    camera.rotateX(camPos[camName][3])
    camera.rotateY(camPos[camName][4])
}

export const randomCamPicker = (camera: THREE.PerspectiveCamera, t: number, taxiRef: any) => {
    if (t > 0.9)
        return;
    const camNames: CamName[] = ['backCam', 'defaultCam', 'farCam', 'frontCam', 'coolCam', 'actionCam'];
    const randomPosition = camNames[Math.floor(Math.random() * camNames.length)];
    if (randomCamPicker.lastT != t && t - randomCamPicker.lastT > 0.1) {
        setCamPosition(camera, randomPosition);
        camera.lookAt(taxiRef.current?.position!)
        setCamAngle(camera, randomPosition);
        randomCamPicker.lastT = t;
    }
}
randomCamPicker.lastT = -1;

export const setNewLight = (light: THREE.AmbientLight | THREE.DirectionalLight | THREE.PointLight,
    object: THREE.Scene | THREE.Object3D, position?: number[]) => {

    if (position) {
        light.position.set(position[0], position[1], position[2]);
    }
    object.add(light);
}

export const camPos = {
    // 'camName' : [x, y, z, xAngle, yAngle],
    'backCam': [1, 0.1, -3.5, 0.1, 0],
    'defaultCam': [-1, 1, -3.8, 0.20, -0.25],
    'farCam': [5, 20, -60, 0.2, 0.1],
    'frontCam': [1, 0.1, 3.5, 0.1, 0],
    'finalCam': [1, 0.05, 10, 0.4, 0.2],
    'coolCam': [3, 1.5, -5, 0.25, 0.15],
    'actionCam': [0, 0.5, -4, 0.35, 0],
}