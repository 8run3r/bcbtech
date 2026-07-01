import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";

interface ScrollCameraRigProps {
  progressRef: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}

/** Quintic smootherstep — camera dwells at stations, swoops between them. */
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

/**
 * Cinematic descent camera — igloo.inc style.
 * Flies a CatmullRom spline through alternating side-viewpoints of all 8
 * stations, with a look-ahead target spline, frame-rate independent damping,
 * pointer parallax, curvature banking and speed-reactive FOV.
 */
const ScrollCameraRig = ({ progressRef, reducedMotion = false }: ScrollCameraRigProps) => {
  const { camera, size } = useThree();
  const smoothedPos = useRef(new THREE.Vector3());
  const smoothedLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const prevU = useRef(0);

  const { camSpline, lookSpline } = useMemo(() => {
    const camPts = STATIONS.map((s, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return new THREE.Vector3(s.pos[0] + side * 4.6, s.pos[1] + 3.1, s.pos[2] + 5.6);
    });
    const lookPts = STATIONS.map(
      (s) => new THREE.Vector3(s.pos[0], s.pos[1] + 0.7, s.pos[2])
    );
    return {
      camSpline: new THREE.CatmullRomCurve3(camPts, false, "catmullrom", 0.5),
      lookSpline: new THREE.CatmullRomCurve3(lookPts, false, "catmullrom", 0.5),
    };
  }, []);

  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
    }),
    []
  );

  useFrame(({ clock, pointer }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const count = STATIONS.length;
    const tStations = progress * (count - 1);
    const idx = Math.min(Math.floor(tStations), count - 2);
    const frac = tStations - idx;
    const u = (idx + smoother(frac)) / (count - 1);

    camSpline.getPoint(u, scratch.pos);
    lookSpline.getPoint(Math.min(u + 0.012, 1), scratch.look);

    // Narrow viewports pull back so stations stay framed
    const narrow = Math.min(size.width / 1280, 1);
    const dolly = 1 + (1 - narrow) * 0.35;
    scratch.pos.sub(scratch.look).multiplyScalar(dolly).add(scratch.look);

    const t = clock.elapsedTime;
    if (!reducedMotion) {
      // Idle drift + pointer parallax
      scratch.pos.x += Math.sin(t * 0.22) * 0.18 + pointer.x * 0.55;
      scratch.pos.y += Math.cos(t * 0.17) * 0.12 - pointer.y * 0.35;
      scratch.look.x += pointer.x * 0.25;
      scratch.look.y -= pointer.y * 0.15;
    }

    if (!initialized.current) {
      smoothedPos.current.copy(scratch.pos);
      smoothedLook.current.copy(scratch.look);
      initialized.current = true;
    }

    // Frame-rate independent damping
    const kPos = 1 - Math.exp(-5.2 * delta);
    const kLook = 1 - Math.exp(-4.2 * delta);
    smoothedPos.current.lerp(scratch.pos, kPos);
    smoothedLook.current.lerp(scratch.look, kLook);

    cam.position.copy(smoothedPos.current);

    // Bank into curves like a drone
    camSpline.getTangent(u, scratch.tangent);
    const bank = reducedMotion
      ? 0
      : THREE.MathUtils.clamp(-scratch.tangent.x * 0.55, -0.16, 0.16);
    cam.up.set(Math.sin(bank), Math.cos(bank), 0);
    cam.lookAt(smoothedLook.current);

    // Speed-reactive FOV — subtle whoosh between stations
    const uSpeed = Math.abs(u - prevU.current) / Math.max(delta, 1e-4);
    prevU.current = u;
    const targetFov = 50 + Math.min(uSpeed * 38, reducedMotion ? 0 : 9);
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov += (targetFov - cam.fov) * kPos;
      cam.updateProjectionMatrix();
    }
  });

  return null;
};

export default ScrollCameraRig;
