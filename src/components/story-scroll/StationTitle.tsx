import { useRef, useMemo, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORD_VERT, WORD_FRAG } from "./shaders";
import {
  preparePretextHandle,
  buildWordVertices,
} from "@/lib/word-to-vertex";

interface StationTitleProps {
  text: string;
  color: string;
  stationPos: [number, number, number];
}

const StationTitle = memo(({ text, color, stationPos }: StationTitleProps) => {
  const meshRef = useRef<THREE.Points>(null!);

  const { geometry, uniforms } = useMemo(() => {
    if (typeof window === "undefined")
      return { geometry: new THREE.BufferGeometry(), uniforms: {} };

    const fontSize = 48;
    const lh = 58;
    const prepared = preparePretextHandle(text, fontSize);
    const { ndcPositions, wordData } = buildWordVertices(prepared, 400, fontSize, lh);

    const count = wordData.length;
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) delays[i] = i / Math.max(count - 1, 1);

    const geo = new THREE.BufferGeometry();
    const scaled = ndcPositions.slice();
    for (let i = 0; i < count; i++) {
      scaled[i * 3] *= 2;
      scaled[i * 3 + 1] *= 0.8;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(scaled, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

    const unifs = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    };
    return { geometry: geo, uniforms: unifs };
  }, [text, color]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: WORD_VERT,
        fragmentShader: WORD_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += delta;
  });

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[stationPos[0] - 1.5, stationPos[1] + 1.2, stationPos[2]]}
    />
  );
});

StationTitle.displayName = "StationTitle";
export default StationTitle;
