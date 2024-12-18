import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export const loadCity = async (cityRef: React.MutableRefObject<THREE.Object3D | null>, scene: THREE.Scene) => {

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

export const loadFont = async(scene: THREE.Scene)=>{
    const loader = new FontLoader;
    loader.load('/assets/taxiFont.json', (font)=>{
        console.log(font)
        const geometry = new TextGeometry(
            'TAXI DRIVER',
            {
                font:font,
                size:3,
                depth:3,
                curveSegments:12,
            }
        )
        const textMesh = new THREE.Mesh(geometry, [
            new THREE.MeshPhongMaterial({color: '#F2C632'}),
            new THREE.MeshPhongMaterial({color: '#F9270F'}),
        ])
        textMesh.position.set(0, 190, -300); // Set it at the center for debugging
        scene.add(textMesh)

    })
}