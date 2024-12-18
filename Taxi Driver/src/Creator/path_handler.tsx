import * as THREE from "three";

let raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 0; // ignore LineSegment
let mouse = new THREE.Vector2();

export const roadPoints: THREE.Vector3[] = [
]

export const isClickOnRoad = (event: MouseEvent, camera: THREE.PerspectiveCamera,
    scene: THREE.Scene, curvesRef: React.MutableRefObject<THREE.CatmullRomCurve3 | null>) =>{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersection = intersects[0];
    if ((intersection.object as THREE.Object3D).name == 'Road' || (intersection.object as THREE.Object3D).name == 'RoadMarking'){
        const point = new THREE.Vector3(intersection.point.x, intersection.point.y, intersection.point.z);
        roadPoints.push(point);
        handleNewPoint(curvesRef, scene);
    }
    else
        return undefined;
  }
}

let currentCurve: THREE.Line | null = null;

const isCurveOnRoad = (curve: THREE.CatmullRomCurve3, scene:THREE.Scene) => {
    const points = curve.getPoints(100);
    for (let point of points) {
        raycaster.set(point.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0){
            const intersection = intersects[0];
            if ((intersection.object as THREE.Object3D).name != 'Road' &&
                (intersection.object as THREE.Object3D).name != 'RoadMarking'){
                return false;
            }
        }
    }
    return true;
};

export const handleNewPoint = (curvesRef: React.MutableRefObject<THREE.CatmullRomCurve3 | null>, scene: THREE.Scene) =>{

    if (currentCurve) {
        scene.remove(currentCurve);
    }
    if (!isCurveOnRoad(new THREE.CatmullRomCurve3(roadPoints), scene)){
        let alert = document.getElementById('not-on-road');
        alert!.style.display = 'block';
        alert!.style.color = 'white';
        roadPoints.pop()
        setTimeout(()=>{
            alert!.style.display = 'none';
        }, 3000)
    }
    curvesRef.current = new THREE.CatmullRomCurve3(roadPoints);
    const geometry = new THREE.BufferGeometry().setFromPoints(curvesRef.current.getPoints(100));
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    currentCurve = new THREE.Line(geometry, material);
    currentCurve.position.setY(2)
    scene.add(currentCurve);
    const roadPointsJSON = roadPoints.map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
    }));
    fetch("http://localhost:8000/save-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roadPointsJSON),
      })
        .then((response) => response.json())
        .catch((error) => console.error("Erreur :", error));
}
