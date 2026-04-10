import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";

interface ZoneLightingProps {
  progress: number;
}

const ZoneLighting = ({ progress }: ZoneLightingProps) => {
  const mainRef = useRef<THREE.PointLight>(null!);
  const accentRef = useRef<THREE.PointLight>(null!);
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);
  const targetColor = useRef(new THREE.Color());

  useFrame(() => {
    const count = STATIONS.length;
    const t = progress * (count - 1);
    const idx = Math.min(Math.floor(t), count - 2);
    const frac = t - idx;
    const ease = frac * frac * (3 - 2 * frac);

    const from = STATIONS[idx];
    const to = STATIONS[Math.min(idx + 1, count - 1)];
    const y = from.pos[1] + (to.pos[1] - from.pos[1]) * ease;

    // Blend between current and next station color
    const fromColor = new THREE.Color(from.color);
    const toColor = new THREE.Color(to.color);
    targetColor.current.copy(fromColor).lerp(toColor, ease);

    if (mainRef.current) {
      mainRef.current.position.y = y + 5;
      mainRef.current.color.lerp(targetColor.current, 0.05);
    }
    if (accentRef.current) {
      accentRef.current.position.y = y - 12;
      accentRef.current.color.lerp(targetColor.current, 0.05);
    }
    if (rimRef.current) {
      rimRef.current.position.y = y + 2;
      rimRef.current.color.lerp(targetColor.current, 0.04);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = 0.07;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.07} />
      <pointLight ref={mainRef} position={[0, 5, 4]} intensity={0.5} color="#00ffaa" distance={35} />
      <pointLight ref={accentRef} position={[0, -12, -3]} intensity={0.3} color="#00ffaa" distance={30} />
      <pointLight ref={rimRef} position={[-5, 2, -5]} intensity={0.2} color="#00ffaa" distance={25} />
    </>
  );
};

export default ZoneLighting;
