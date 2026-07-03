import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { camPose } from "./choreography";

interface ScrollCameraRigProps {
  progressRef: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}

/**
 * Cinematic descent camera.
 * Dwells in a slow orbit around each station model, then swoops to the next
 * one through the zone portal (quadratic bezier via the world axis).
 * Pointer parallax + idle drift on top, frame-rate independent damping,
 * banking from lateral velocity and speed-reactive FOV.
 */
const ScrollCameraRig = ({ progressRef, reducedMotion = false }: ScrollCameraRigProps) => {
  const smoothedPos = useRef(new THREE.Vector3());
  const smoothedLook = useRef(new THREE.Vector3());
  const prevPos = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const bank = useRef(0);

  const scratch = useMemo(
    () => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }),
    []
  );

  useFrame(({ camera, clock, pointer }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    camPose(progressRef.current, reducedMotion, scratch.pos, scratch.look);

    const t = clock.elapsedTime;
    if (!reducedMotion) {
      // Idle drift + pointer parallax
      scratch.pos.x += Math.sin(t * 0.22) * 0.16 + pointer.x * 0.55;
      scratch.pos.y += Math.cos(t * 0.17) * 0.1 - pointer.y * 0.35;
      scratch.look.x += pointer.x * 0.25;
      scratch.look.y -= pointer.y * 0.15;
    }

    if (!initialized.current) {
      smoothedPos.current.copy(scratch.pos);
      smoothedLook.current.copy(scratch.look);
      prevPos.current.copy(scratch.pos);
      initialized.current = true;
    }

    // Frame-rate independent damping
    const kPos = 1 - Math.exp(-5.2 * delta);
    const kLook = 1 - Math.exp(-4.2 * delta);
    smoothedPos.current.lerp(scratch.pos, kPos);
    smoothedLook.current.lerp(scratch.look, kLook);

    cam.position.copy(smoothedPos.current);

    // Bank into lateral motion like a drone
    const velX = (smoothedPos.current.x - prevPos.current.x) / Math.max(delta, 1e-4);
    const velMag = smoothedPos.current.distanceTo(prevPos.current) / Math.max(delta, 1e-4);
    prevPos.current.copy(smoothedPos.current);

    const targetBank = reducedMotion
      ? 0
      : THREE.MathUtils.clamp(-velX * 0.028, -0.16, 0.16);
    bank.current += (targetBank - bank.current) * kPos;
    cam.up.set(Math.sin(bank.current), Math.cos(bank.current), 0);
    cam.lookAt(smoothedLook.current);

    // Speed-reactive FOV — whoosh widens the lens during transit
    const targetFov = 50 + (reducedMotion ? 0 : Math.min(velMag * 0.55, 11));
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov += (targetFov - cam.fov) * kPos;
      cam.updateProjectionMatrix();
    }
  });

  return null;
};

export default ScrollCameraRig;
