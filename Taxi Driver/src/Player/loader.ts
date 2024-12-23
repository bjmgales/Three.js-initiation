import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { getPath } from './car_path';
import { defRoadPoints, userRoadPoints } from './car_path';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export const loadCity = async (cityRef: React.MutableRefObject<THREE.Object3D | null>, scene: THREE.Scene,
    curvesRef: React.MutableRefObject<THREE.CatmullRomCurve3 | null>, newPath: { [key: string]: string }) => {

    return new Promise<void>((resolve, reject) => {
        const loader = new GLTFLoader();
        const path = '/environment.glb';
        loader.load(path,
            (gltf) => {
                cityRef.current = gltf.scene;
                scene.add(cityRef.current);
                curvesRef.current = getPath(newPath);
                cityRef.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const edges = new THREE.EdgesGeometry(child.geometry);
                        const edgeLines = new THREE.LineSegments(
                            edges,
                            new THREE.LineBasicMaterial({ color: '#141414' })
                        );
                        edgeLines.position.copy(child.position);
                        edgeLines.rotation.copy(child.rotation);
                        edgeLines.scale.copy(child.scale);
                        scene.add(edgeLines);
                    }
                })
                const floor = new THREE.Mesh(
                    new THREE.PlaneGeometry(450, 360),
                    new THREE.MeshStandardMaterial({
                        color: '#458728',
                        side: THREE.DoubleSide,
                    })
                );
                floor.rotateX(-Math.PI / 2)
                floor.position.y = -0.2;
                scene.add(floor)
                resolve()
            }, //onLoad

            () => { }, //progress bar

            (error: any) => {
                console.error(`Error:${error}`);
                reject(error)
            })//onError

    }
    )
}


export const loadTaxi = async (taxiRef: React.MutableRefObject<THREE.Object3D | null>, scene: THREE.Scene) => {
    return new Promise<void>((resolve, reject) => {
        const loader = new GLTFLoader();
        const path = '/taxi.glb';

        loader.load(
            path,
            (gltf) => {
                taxiRef.current = gltf.scene;
                scene.add(taxiRef.current);
                if (userRoadPoints.length > 0)
                    taxiRef.current.position.set(userRoadPoints[0].x, userRoadPoints[0].y, userRoadPoints[0].z);
                else
                    taxiRef.current.position.set(defRoadPoints[0].x, defRoadPoints[0].y, defRoadPoints[0].z);

                resolve();
            },
            () => { },
            (error: any) => {
                console.error(`Error: ${error}`);
                reject(error);
            }
        );
    });
}

export const loadFont = async(scene: THREE.Scene, taxiRef:React.MutableRefObject<THREE.Object3D | null>)=>{
    const loader = new FontLoader;
    loader.load('/assets/taxiFont.json', (font)=>{
        console.log(font)
        const geometry = new TextGeometry(
            'TAXI DRIVER',
            {
                font:font,
                size:0.2,
                depth:0.05,
                curveSegments:12,
            }
        )
        geometry.center();
        const textMesh = new THREE.Mesh(geometry, [
            new THREE.MeshPhongMaterial({color: '#F2C632'}),
            new THREE.MeshPhongMaterial({color: '#F9270F'}),
        ])
        textMesh.animations
        textMesh.position.copy(taxiRef.current?.position.clone()!);
        textMesh.position.y +=2
        textMesh.position.x
        textMesh.name='title';
        scene.add(textMesh)

    })
}