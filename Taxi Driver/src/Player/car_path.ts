import * as THREE from 'three';

export let speed = 0.0005
export const defRoadPoints = [
  new THREE.Vector3(-38, 0, -150),
  new THREE.Vector3(-40, 0, 0),
  new THREE.Vector3(-41, 0, 44), // fin de la premiere ligne droite

  new THREE.Vector3(-40, 0, 50),
  new THREE.Vector3(-38, 0, 56),
  new THREE.Vector3(-34, 0, 59),
  new THREE.Vector3(-27, 0, 62),
  new THREE.Vector3(-15, 0, 65),
  new THREE.Vector3(0, 0, 67), // fin du premier virage

  new THREE.Vector3(142, 0, 69),
  new THREE.Vector3(146, 0, 68), //fin deuxieme ligne droite

  new THREE.Vector3(149, 0, 66),
  new THREE.Vector3(151, 0, 64),
  new THREE.Vector3(153, 0, 61),
  new THREE.Vector3(154, 0, 58),
  new THREE.Vector3(156, 0, 50),
  new THREE.Vector3(160, 0, 20),
  new THREE.Vector3(171, 0, -50),
  new THREE.Vector3(182, 0, -100),
  new THREE.Vector3(190, 0, -120),
  new THREE.Vector3(193, 0, -125),
  new THREE.Vector3(200, 0, -133),
  new THREE.Vector3(200, 0, -138),
  new THREE.Vector3(198, 0, -140),
  new THREE.Vector3(194, 0, -143),
  new THREE.Vector3(100, 0, -138),
  new THREE.Vector3(0, 0, -138),
  new THREE.Vector3(-18, 0, -138), // fin de la derniere ligne droite

  new THREE.Vector3(-29, 0, -140),
  new THREE.Vector3(-30, 0, -141),
  new THREE.Vector3(-32, 0, -144),
  new THREE.Vector3(-32, 0, -144),
  new THREE.Vector3(-33, 0, -150),
  new THREE.Vector3(-29, 0, -155),
  new THREE.Vector3(-28, 0, -160),
]

export let userRoadPoints: THREE.Vector3[] = []

export function carHardPath(curvesRef: React.MutableRefObject<THREE.CatmullRomCurve3 | null>,
  taxiRef: React.MutableRefObject<THREE.Object3D | null>, t: React.MutableRefObject<number>,
  wheels:THREE.Object3D[]) {
  if (!curvesRef?.current || !taxiRef?.current)
    return;
  t.current = t.current % 1;
  const position = curvesRef.current.getPointAt(t.current);
  const tangent = curvesRef.current.getTangentAt(t.current);
  taxiRef.current.position.copy(position);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    tangent.clone().normalize()
  );
  taxiRef.current.quaternion.slerp(quaternion, 0.1);
  t.current += speed;
  wheels.forEach(wheel => {
    wheel.rotation.x+=0.1
  });
}

export function getPath(newPath: { [key: string]: string }) {

  if (!Object.keys(newPath).length) {
    userRoadPoints = defRoadPoints
  }
  else {
    userRoadPoints = Object.values(newPath).map((point: any) =>
      new THREE.Vector3(parseFloat(point.x), parseFloat(point.y), parseFloat(point.z))
    );
  }
  const roadPointsJSON = userRoadPoints.map((point) => ({
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

  const curve = new THREE.CatmullRomCurve3(userRoadPoints, false);
  return curve;
}