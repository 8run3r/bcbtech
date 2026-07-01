import { memo, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { POSTFX_VERT, POSTFX_FRAG } from "./shaders";

interface PostFXProps {
  reducedMotion?: boolean;
}

/**
 * PostFX — fullscreen clip-space quad with animated film grain + vignette.
 * Cheaper than an EffectComposer pass: one extra draw call, no render targets.
 */
const PostFX = memo(({ reducedMotion = false }: PostFXProps) => {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: POSTFX_VERT,
      fragmentShader: POSTFX_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uGrain: { value: 0.12 },
        uVignette: { value: 0.55 },
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
    if (!reducedMotion) material.uniforms.uTime.value += delta;
  });

  return <mesh geometry={geometry} material={material} renderOrder={999} frustumCulled={false} />;
});

PostFX.displayName = "PostFX";
export default PostFX;
