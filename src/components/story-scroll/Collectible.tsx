import { useRef, useState, useMemo, useCallback, memo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COLLECTIBLE_VERT, COLLECTIBLE_FRAG } from "./shaders";

interface CollectibleProps {
  position: [number, number, number];
  color: string;
  shape: "octahedron" | "tetrahedron" | "icosahedron" | "torus" | "dodecahedron";
  onCollect?: () => void;
}

const GEOMETRIES = {
  octahedron: <octahedronGeometry args={[0.25, 0]} />,
  tetrahedron: <tetrahedronGeometry args={[0.3, 0]} />,
  icosahedron: <icosahedronGeometry args={[0.22, 0]} />,
  torus: <torusGeometry args={[0.2, 0.08, 8, 16]} />,
  dodecahedron: <dodecahedronGeometry args={[0.25, 0]} />,
};

const Collectible = memo(({ position, color, shape, onCollect }: CollectibleProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);
  const collectAnim = useRef(0);
  const grabOffset = useRef<THREE.Vector3 | null>(null);
  const isDragging = useRef(false);
  const originalPos = useRef(new THREE.Vector3(...position));
  const velocity = useRef(new THREE.Vector3());

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uHover: { value: 0 },
      uCollected: { value: 0 },
    }),
    [color]
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: COLLECTIBLE_VERT,
        fragmentShader: COLLECTIBLE_FRAG,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [uniforms]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value += delta;
    mat.uniforms.uHover.value += ((hovered ? 1 : 0) - mat.uniforms.uHover.value) * 0.1;

    if (collected) {
      collectAnim.current = Math.min(collectAnim.current + delta * 3, 1);
      mat.uniforms.uCollected.value = collectAnim.current;
      meshRef.current.scale.setScalar(1 + collectAnim.current * 0.5);
      meshRef.current.rotation.y += delta * 8;
    } else if (!isDragging.current) {
      // Float back to original position
      const pos = meshRef.current.position;
      const diff = originalPos.current.clone().sub(pos);
      velocity.current.add(diff.multiplyScalar(0.02));
      velocity.current.multiplyScalar(0.92);
      pos.add(velocity.current.clone().multiplyScalar(delta * 60));

      // Idle rotation
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (collected) return;
    e.stopPropagation();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    isDragging.current = true;
    grabOffset.current = meshRef.current.position.clone().sub(e.point);
  }, [collected]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current || !grabOffset.current) return;
    e.stopPropagation();
    meshRef.current.position.copy(e.point.add(grabOffset.current));
  }, []);

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    isDragging.current = false;
    grabOffset.current = null;

    // Check if dragged far enough = collected
    const dist = meshRef.current.position.distanceTo(originalPos.current);
    if (dist > 1.5) {
      setCollected(true);
      onCollect?.();
    }
  }, [onCollect]);

  if (collectAnim.current >= 1) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      material={material}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "grab"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = ""; }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {GEOMETRIES[shape]}
    </mesh>
  );
});

Collectible.displayName = "Collectible";
export default Collectible;
