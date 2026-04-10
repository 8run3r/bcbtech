import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";

interface ScrollCameraRigProps {
  progress: number; // 0..1 scroll progress
}

/**
 * Vertical descent camera — inspired by igloo.inc.
 * Camera descends from above, orbiting slightly around each station.
 */
const ScrollCameraRig = ({ progress }: ScrollCameraRigProps) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    const count = STATIONS.length;
    const t = progress * (count - 1);
    const idx = Math.min(Math.floor(t), count - 2);
    const frac = t - idx;

    // Smooth easing
    const ease = frac * frac * (3 - 2 * frac);

    const from = STATIONS[idx];
    const to = STATIONS[Math.min(idx + 1, count - 1)];

    // Subtle orbit around station — camera spirals slightly as it descends
    const time = clock.elapsedTime;
    const orbitRadius = 6;
    const orbitAngle = progress * Math.PI * 1.5 + time * 0.05;
    const orbitX = Math.sin(orbitAngle) * orbitRadius;
    const orbitZ = Math.cos(orbitAngle) * orbitRadius;

    // Camera position: above and offset from station, descending
    const stationY = from.pos[1] + (to.pos[1] - from.pos[1]) * ease;
    const stationX = from.pos[0] + (to.pos[0] - from.pos[0]) * ease;
    const stationZ = from.pos[2] + (to.pos[2] - from.pos[2]) * ease;

    targetPos.current.set(
      stationX + orbitX * 0.5,
      stationY + 3.5,
      stationZ + orbitZ * 0.5 + 4
    );

    // Look at station center
    targetLook.current.set(stationX, stationY, stationZ);

    // Smooth lerp for cinematic descent
    camera.position.lerp(targetPos.current, 0.06);
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const desiredLook = targetLook.current.clone().sub(camera.position).normalize();
    const blended = currentLook.lerp(desiredLook, 0.05);
    camera.lookAt(camera.position.clone().add(blended));
  });

  return null;
};

export default ScrollCameraRig;
