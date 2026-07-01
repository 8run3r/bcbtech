import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";

interface ZoneLightingProps {
  progressRef: React.MutableRefObject<number>;
}

const STATION_COLORS = STATIONS.map((s) => new THREE.Color(s.color));

/**
 * ZoneLighting — three point lights tracking the active station,
 * blending colour between zones. Also tints the scene fog so the
 * atmosphere inherits the zone colour (igloo-style depth haze).
 */
const ZoneLighting = ({ progressRef }: ZoneLightingProps) => {
  const mainRef = useRef<THREE.PointLight>(null!);
  const accentRef = useRef<THREE.PointLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);
  const targetColor = useRef(new THREE.Color("#00ffaa"));
  const fogTint = useRef(new THREE.Color("#000000"));

  useFrame(({ scene }) => {
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const count = STATIONS.length;
    const t = progress * (count - 1);
    const idx = Math.min(Math.floor(t), count - 2);
    const frac = t - idx;
    const ease = frac * frac * (3 - 2 * frac);

    const from = STATIONS[idx];
    const to = STATIONS[Math.min(idx + 1, count - 1)];
    const x = from.pos[0] + (to.pos[0] - from.pos[0]) * ease;
    const y = from.pos[1] + (to.pos[1] - from.pos[1]) * ease;
    const z = from.pos[2] + (to.pos[2] - from.pos[2]) * ease;

    targetColor.current.copy(STATION_COLORS[idx]).lerp(STATION_COLORS[idx + 1], ease);

    if (mainRef.current) {
      mainRef.current.position.set(x, y + 5, z + 4);
      mainRef.current.color.lerp(targetColor.current, 0.05);
    }
    if (accentRef.current) {
      accentRef.current.position.set(x, y - 12, z - 3);
      accentRef.current.color.lerp(targetColor.current, 0.05);
    }
    if (rimRef.current) {
      rimRef.current.position.set(x - 5, y + 2, z - 5);
      rimRef.current.color.lerp(targetColor.current, 0.04);
    }

    // Fog inherits a whisper of the zone colour
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fogTint.current.copy(targetColor.current).multiplyScalar(0.05);
      fog.color.lerp(fogTint.current, 0.05);
    }
  });

  return (
    <>
      <ambientLight intensity={0.07} />
      <pointLight ref={mainRef} position={[0, 5, 4]} intensity={0.55} color="#00ffaa" distance={35} />
      <pointLight ref={accentRef} position={[0, -12, -3]} intensity={0.35} color="#00ffaa" distance={30} />
      <pointLight ref={rimRef} position={[-5, 2, -5]} intensity={0.25} color="#00ffaa" distance={25} />
    </>
  );
};

export default ZoneLighting;
