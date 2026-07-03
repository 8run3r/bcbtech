import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";
import { ATMOSPHERE_VERT, ATMOSPHERE_FRAG } from "./shaders";
import { sampleStation, smoother, DWELL } from "./choreography";

const COUNT = 1600;
const SPREAD_XZ = 32;
const TOP_Y = 6;
const BOTTOM_Y = -140;

const STATION_COLORS = STATIONS.map((s) => new THREE.Color(s.color));

interface AtmosphereProps {
  progressRef: React.MutableRefObject<number>;
}

/**
 * Atmosphere — single-draw-call GPU dust field filling the whole descent.
 * Particles drift slowly in the vertex shader; colour follows the active
 * zone so the haze always matches the station the camera is passing.
 */
const Atmosphere = memo(({ progressRef }: AtmosphereProps) => {
  const dpr = useThree((state) => state.viewport.dpr);
  const targetColor = useRef(new THREE.Color("#00ffaa"));

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD_XZ;
      positions[i * 3 + 1] = TOP_Y + Math.random() * (BOTTOM_Y - TOP_Y);
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_XZ;
      sizes[i] = 0.8 + Math.random() * 2.6;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.4 + Math.random() * 1.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERT,
      fragmentShader: ATMOSPHERE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color("#00ffaa") },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr;
  }, [material, dpr]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;

    // Blend across the transit portion only — matches the choreography timeline
    const { idx, local } = sampleStation(progressRef.current);
    const next = Math.min(idx + 1, STATIONS.length - 1);
    const blend = local < DWELL ? 0 : smoother((local - DWELL) / (1 - DWELL));
    targetColor.current.copy(STATION_COLORS[idx]).lerp(STATION_COLORS[next], blend);
    (material.uniforms.uColor.value as THREE.Color).lerp(targetColor.current, 0.04);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
});

Atmosphere.displayName = "Atmosphere";
export default Atmosphere;
