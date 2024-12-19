import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { loadCity } from './creator_loader.tsx';
import {
    defaultCam, setNewLight
} from '../Player/camera_lightings.ts';
import { isClickOnRoad, roadPoints } from './path_handler.tsx';

function background(scene: THREE.Scene, time: number) {
    if (time > 2)
        return;
    if (time <= 1) {
        scene.background = new THREE.Color().lerpColors(
            new THREE.Color('#0096FF'),
            new THREE.Color('#968fff'),
            time
        )
    }
    else {
        scene.background = new THREE.Color().lerpColors(
            new THREE.Color('#968fff'),
            new THREE.Color('#2d028a'),
            time - 1)
    }
}

interface ThreeCreator {
    isReset: boolean,
    isCreator: boolean,
}

const ThreeCreator = (props: ThreeCreator) => {
    const threeRef = useRef<HTMLDivElement | null>(null);
    const cityRef = useRef<THREE.Object3D | null>(null);
    const curvesRef = useRef<THREE.CatmullRomCurve3 | null>(null)

    useEffect(() => {
        if (!threeRef.current || threeRef.current.children.length > 0) return;

        fetch("http://localhost:8000/reset-trip", {
            method: "DELETE",
            headers: {},
            body: '',
        })

        let scene = new THREE.Scene();
        let renderer = new THREE.WebGLRenderer();
        const camera = defaultCam(renderer)

        setNewLight(new THREE.AmbientLight('#f3d887', 10), scene)
        setNewLight(new THREE.DirectionalLight('#FFFFFF', 5), scene, [1, 1, 1]);
        threeRef.current.appendChild(renderer.domElement);

        renderer.setSize(window.innerWidth, window.innerHeight);

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', handleResize);

        const handleMiddleClick = (event: MouseEvent) => {
            if (event.button == 1)
                isClickOnRoad(event, camera, scene, curvesRef)
        };
        window.addEventListener('mousedown', handleMiddleClick);



        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (!cityRef?.current)
                return;
            background(scene, 0);
            renderer.autoClear = true;
            renderer.render(scene, camera);
        }
        (async ()=>{
            loadCity(cityRef, scene);
            animate()
        })()

        return (() => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleMiddleClick);

            cancelAnimationFrame(animationFrameId);
            threeRef.current?.removeChild(renderer.domElement);
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            cityRef.current = null;
            curvesRef.current = null;
            roadPoints.length = 0;
            renderer.dispose();
        })
    }, [props.isReset]);

    return (
        <div ref={threeRef}></div>
    );
}

export default ThreeCreator;