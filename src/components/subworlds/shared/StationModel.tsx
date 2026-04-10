import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import DraggableModel, { type ModelVariant } from "@/components/story-scroll/DraggableModel";

/** Camera that subtly orbits based on scroll progress */
const CameraController = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const angle = progress * Math.PI * 1.5;
    const tx = Math.sin(angle) * 0.8;
    const ty = Math.cos(angle * 0.7) * 0.3;
    const tz = 4 + Math.sin(progress * Math.PI) * 0.5;

    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.position.z += (tz - camera.position.z) * 0.05;
    camera.lookAt(target.current);
  });

  return null;
};

/** Wrapper that applies scroll-based transforms on top of DraggableModel */
const ScrollAnimatedModel = ({
  variant,
  color,
  scale,
  progress,
}: {
  variant: ModelVariant;
  color: string;
  scale: number;
  progress: number;
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Scroll-driven rotation
    const targetY = progress * Math.PI * 3;
    const targetX = Math.sin(progress * Math.PI * 2) * 0.3;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;

    // Subtle scale pulse based on scroll
    const s = 1 + Math.sin(progress * Math.PI * 6) * 0.04;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      <DraggableModel
        position={[0, 0, 0]}
        color={color}
        variant={variant}
        scale={scale}
        showGlow={false}
      />
    </group>
  );
};

/**
 * Renders a 3D model with scroll-driven animation.
 * Camera orbits subtly, model rotates with scroll progress.
 */
const StationModel = ({
  variant,
  color,
  scale = 1,
  scrollProgress = 0,
}: {
  variant: ModelVariant;
  color: string;
  scale?: number;
  scrollProgress?: number;
}) => (
  <div className="w-full h-full" style={{ minHeight: 200 }}>
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <CameraController progress={scrollProgress} />
      <ambientLight intensity={0.1} />
      <pointLight position={[3, 3, 5]} intensity={0.7} color={color} distance={20} />
      <pointLight position={[-3, -2, 3]} intensity={0.35} color={color} distance={15} />
      <pointLight position={[0, -3, 2]} intensity={0.15} color="#ffffff" distance={10} />
      <Suspense fallback={null}>
        <ScrollAnimatedModel
          variant={variant}
          color={color}
          scale={scale}
          progress={scrollProgress}
        />
      </Suspense>
      <fog attach="fog" args={["#000", 5, 14]} />
    </Canvas>
  </div>
);

export default StationModel;
