import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";

/**
 * ZonePortals — horizontal rings at zone boundaries.
 * Camera passes through them like entering a new world.
 */
const ZonePortals = memo(() => {
  const groupRef = useRef<THREE.Group>(null!);

  // Portal at midpoint between each station pair
  const portals = useMemo(() => {
    const arr: { y: number; color: string }[] = [];
    for (let i = 0; i < STATIONS.length - 1; i++) {
      const midY = (STATIONS[i].pos[1] + STATIONS[i + 1].pos[1]) / 2;
      // Use the color of the next station (the world we're entering)
      arr.push({ y: midY, color: STATIONS[i + 1].color });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.y = t * 0.15 + i * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {portals.map((p, i) => (
        <group key={i} position={[0, p.y, 0]}>
          {/* Outer ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[8, 8.15, 64]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Inner ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[5, 5.08, 64]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Glow disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[10, 32]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.015}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
});

ZonePortals.displayName = "ZonePortals";
export default ZonePortals;
