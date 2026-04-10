import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 100;
const SPREAD_XZ = 20;
const SPREAD_Y = 76; // vertical spread matching station range (0 to -72)

const Voxels = memo(() => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const positions: [number, number, number][] = [];
    const speeds: number[] = [];
    const phases: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      positions.push([
        (Math.random() - 0.5) * SPREAD_XZ,
        -Math.random() * SPREAD_Y, // descend from 0 to -60
        (Math.random() - 0.5) * SPREAD_XZ,
      ]);
      speeds.push(0.2 + Math.random() * 0.4);
      phases.push(Math.random() * Math.PI * 2);
    }
    return { positions, speeds, phases };
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    const green = new THREE.Color("#00ffaa");
    const orange = new THREE.Color("#FF8C00");
    const dark = new THREE.Color("#222");
    for (let i = 0; i < COUNT; i++) {
      // Top half green, bottom half orange, some dark
      const yNorm = -data.positions[i][1] / SPREAD_Y; // 0=top, 1=bottom
      const c =
        i % 4 === 0
          ? dark
          : yNorm < 0.5
          ? green
          : orange;
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [data.positions]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const [x, y, z] = data.positions[i];
      // Gentle orbit + float
      const float = Math.sin(t * data.speeds[i] + data.phases[i]) * 0.2;
      const drift = Math.sin(t * 0.1 + data.phases[i]) * 0.3;
      dummy.position.set(x + drift, y + float, z);
      dummy.rotation.set(t * 0.08 + i, t * 0.04, t * 0.02);
      dummy.scale.setScalar(0.05 + (i % 5) * 0.018);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxGeometry>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.45}
        roughness={0.8}
      />
    </instancedMesh>
  );
});

Voxels.displayName = "Voxels";
export default Voxels;
