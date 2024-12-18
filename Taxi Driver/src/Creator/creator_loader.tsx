import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';

export const loadCity = async (cityRef: React.MutableRefObject<THREE.Object3D | null>, scene: THREE.Scene,
    curvesRef: React.MutableRefObject<THREE.CatmullRomCurve3 | null>) => {

    const loader = new GLTFLoader();
    const path = '/environment.glb';

    loader.load(path,
        (gltf) => {
            cityRef.current = gltf.scene;
            scene.add(cityRef.current);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: '#458728',
                side: THREE.DoubleSide,
            });
            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(450, 360),
                floorMaterial
            );
            floor.rotateX(-Math.PI / 2)
            floor.position.y = -1.5;
            scene.add(floor)
        },
        () => { }, //progress bar

        (error: any) => {
            console.error(`Error:${error}`);
        }//onError
    )
}