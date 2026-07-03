import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { POSTFX_VERT, POSTFX_FRAG } from "./shaders";

interface PostFXProps {
  reducedMotion?: boolean;
  progressRef?: React.MutableRefObject<number>;
}

/**
 * PostFX — fullscreen clip-space quad with animated film grain + vignette.
 * Grain and vignette breathe with scroll velocity, so transits feel faster.
 * Cheaper than an EffectComposer pass: one extra draw call, no render targets.
 */
const PostFX = memo(({ reducedMotion = false, progressRef }: PostFXProps) => {
  const prevProgress = useRef(0);
  const smoothedSpeed = useRef(0);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: POSTFX_VERT,
      fragmentShader: POSTFX_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uGrain: { value: 0.12 },
        uVignette: { value: 0.55 },
        uSpeed: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { geometry: geo, material: mat };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime.value += delta;

    if (progressRef) {
      const p = progressRef.current;
      const raw = Math.abs(p - prevProgress.current) / Math.max(delta, 1e-4);
      prevProgress.current = p;
      // Normalise: full-speed transit ≈ 0.06 progress/s → speed ≈ 1
      const target = Math.min(raw * 16, 1);
      smoothedSpeed.current += (target - smoothedSpeed.current) * Math.min(delta * 6, 1);
      material.uniforms.uSpeed.value = smoothedSpeed.current;
    }
  });

  return <mesh geometry={geometry} material={material} renderOrder={999} frustumCulled={false} />;
});

PostFX.displayName = "PostFX";
export default PostFX;
