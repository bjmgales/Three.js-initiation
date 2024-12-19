import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import * as utils from '../utils.ts'
import { loadCity, loadTaxi, loadFont } from './loader.ts';
import { carHardPath, userRoadPoints } from './car_path.ts';
import { defaultCam, setNewLight, carCamera,
        setCamPosition, setCamAngle, randomCamPicker}
        from './camera_lightings.ts';


function background(scene: THREE.Scene, time: number, light: THREE.AmbientLight,
    dirLight: THREE.DirectionalLight
) {
    if (time > 2)
        return;
    if (time <= 1) {
        scene.background = new THREE.Color().lerpColors(
            new THREE.Color('#87CEEB'),
            new THREE.Color('#FF4500'),
            time
        );
        light.color = new THREE.Color().lerpColors(
            new THREE.Color('#FFFFFF'),
            new THREE.Color('#FF8C00'),
            time
        );
        dirLight.intensity = THREE.MathUtils.lerp(3, 0.8, time);
    }
    else {
        scene.background = new THREE.Color().lerpColors(
            new THREE.Color('#FF4500'),
            new THREE.Color('#000033'),
            time - 1
        );
        light.color = new THREE.Color().lerpColors(
            new THREE.Color('#FF8C00'),
            new THREE.Color('#111144'),
            time - 1
        );
        dirLight.intensity = THREE.MathUtils.lerp(0.8, 0.2, time - 1);
    }

}

interface Three {
    isStart: boolean,
    setStart: React.Dispatch<React.SetStateAction<boolean>>,
    endTrip: boolean,
    setEndTrip: React.Dispatch<React.SetStateAction<boolean>>,
    isReset: boolean,
    isCreator: boolean,
    newPath: { [key: string]: string }
}

const Three = (props: Three) => {
    const threeRef = useRef<HTMLDivElement | null>(null);
    const tRef = useRef<number>(0);
    const cityRef = useRef<THREE.Object3D | null>(null);
    const taxiRef = useRef<THREE.Object3D | null>(null);
    const curvesRef = useRef<THREE.CatmullRomCurve3 | null>(null)
    const isStartRef = useRef<Boolean>(props.isStart);

    useEffect(() => {
        isStartRef.current = props.isStart;
    }, [props.isStart]);

    useEffect(() => {
        if (!threeRef.current || threeRef.current.children.length > 0) return;
        Object.values(props.newPath).map((point: any) =>
            userRoadPoints.push(new THREE.Vector3(parseFloat(point.x), parseFloat(point.y), parseFloat(point.z)))
        );
        let scene = new THREE.Scene();
        let renderer = new THREE.WebGLRenderer();
        const camera = defaultCam(renderer)

        let light = new THREE.AmbientLight(0x555555, 2)
        scene.add(light);
        let dirLight = new THREE.DirectionalLight('#FFFFFF', 3)
        dirLight.position.set(1, 1, 1);
        threeRef.current.appendChild(renderer.domElement);
        scene.add(dirLight)
        renderer.setSize(window.innerWidth, window.innerHeight);

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            carCam.aspect = window.innerWidth / window.innerHeight;
            carCam.updateProjectionMatrix();
        }
        window.addEventListener('resize', handleResize);
        let carCam: THREE.PerspectiveCamera;


        let time = 0;
        let spotlightOn = true;
        let animationFrameId: number;
        let wheels: THREE.Object3D[] = [];
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (!taxiRef.current || !taxiRef.current.position || !cityRef?.current || !carCam)
                return;
            if (tRef.current < 1) {
                if (isStartRef.current) {
                    randomCamPicker(carCam, tRef.current, taxiRef);
                    carHardPath(curvesRef, taxiRef, tRef, wheels);
                    time += 0.001;
                    scene.remove(scene.getObjectByName('title')!)
                }
                else{
                    if (scene.getObjectByName('title'))
                        scene.getObjectByName('title')!.rotation.y += 0.01
                }
                background(scene, time, light, dirLight);

            }
            else if (tRef.current >= 1 && spotlightOn) {
                props.setEndTrip(true);
                setCamPosition(carCam, 'finalCam');
                carCam.lookAt(taxiRef.current?.position!)
                setCamAngle(carCam, 'finalCam');

                (async () => {
                    await utils.sleep(1);
                    setNewLight(new THREE.PointLight('#dc3023', 1000, 10), cityRef.current!, [-28.5, 4, -160])
                })()
                spotlightOn = false;
            }
            renderer.autoClear = true;
            renderer.render(scene, carCam);
        }

        (async () => {
            await loadCity(cityRef, scene, curvesRef, props.newPath);
            await loadTaxi(taxiRef, scene);
            carCam = carCamera(taxiRef);
            await loadFont(scene, taxiRef)
            console.log(taxiRef.current)
            wheels.push(taxiRef.current?.getObjectByName('DEF-WheelBkL')!)
            wheels.push(taxiRef.current?.getObjectByName('DEF-WheelBkR')!)
            wheels.push(taxiRef.current?.getObjectByName('DEF-WheelFtL')!)
            wheels.push(taxiRef.current?.getObjectByName('DEF-WheelFtR')!)
            animate();
        })()

        return (() => {
            window.removeEventListener('resize', handleResize);
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
            taxiRef.current = null;
            curvesRef.current = null;
            renderer.dispose();
            time = 0;
            tRef.current = 0;
            randomCamPicker.lastT = -1
        })
    }, [props.isReset]);

    return (
        <div ref={threeRef}></div>
    );
}

export default Three;