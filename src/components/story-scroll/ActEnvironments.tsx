import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS, ACTS } from "./stations";
import { sampleStation, DWELL } from "./choreography";

/**
 * ActEnvironments — each act of the descent gets its own world, replacing
 * the old uniform voxel field. Groups toggle visibility by camera altitude
 * (fog swallows the transitions), so only ~1 environment renders at a time.
 *
 *   Act I   STAVBA        — architectural lattice of pillars and beams
 *   Act II  INTELIGENCIA  — neural constellation with synapse lines
 *   Act III TOK           — streams of data trails flowing downward
 *   Act IV  SPOJENIE      — sparse monoliths drifting in open space
 */

const ACT_Y = ACTS.map((_, k) => {
  const top = STATIONS[k * 2].pos[1];
  const bottom = STATIONS[k * 2 + 1].pos[1];
  return { top, bottom, center: (top + bottom) / 2, span: top - bottom };
});

/** Camera altitude for visibility culling — mirrors the choreography timeline. */
const camAltitude = (p: number) => {
  const { idx, local } = sampleStation(p);
  const next = Math.min(idx + 1, STATIONS.length - 1);
  const blend = local < DWELL ? 0 : (local - DWELL) / (1 - DWELL);
  return STATIONS[idx].pos[1] + (STATIONS[next].pos[1] - STATIONS[idx].pos[1]) * blend;
};

const VISIBLE_RANGE = 42;

/* ── Act I — architectural lattice (static matrices, group rotates) ── */
const LATTICE_COUNT = 84;

const Lattice = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const { top, span } = ACT_Y[0];
    for (let i = 0; i < LATTICE_COUNT; i++) {
      const ring = Math.floor(i / 12);
      const angle = ((i % 12) / 12) * Math.PI * 2 + ring * 0.26;
      const radius = 9 + (i % 3) * 2.4;
      dummy.position.set(
        Math.cos(angle) * radius,
        top + 5 - ring * ((span + 12) / 7) + ((i * 7919) % 5) * 0.4,
        Math.sin(angle) * radius
      );
      // Every fourth element is a horizontal beam
      dummy.rotation.set(0, angle, i % 4 === 0 ? Math.PI / 2 : 0);
      dummy.scale.setScalar(0.8 + ((i * 31) % 7) * 0.12);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LATTICE_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.14, 1.7, 0.14]} />
      <meshStandardMaterial color="#00ffaa" transparent opacity={0.22} roughness={0.7} depthWrite={false} />
    </instancedMesh>
  );
};

/* ── Act II — neural constellation ── */
const NEURON_COUNT = 140;

const Neural = () => {
  const pointsMatRef = useRef<THREE.PointsMaterial>(null!);
  const linesMatRef = useRef<THREE.LineBasicMaterial>(null!);

  const { pointsGeo, linesGeo } = useMemo(() => {
    const { top, bottom } = ACT_Y[1];
    const pos = new Float32Array(NEURON_COUNT * 3);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < NEURON_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 6;
      const v = new THREE.Vector3(
        Math.cos(angle) * radius,
        top + 6 - Math.random() * (top - bottom + 12),
        Math.sin(angle) * radius
      );
      pts.push(v);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // Synapses — connect near neighbours, capped
    const linePos: number[] = [];
    let links = 0;
    for (let i = 0; i < NEURON_COUNT && links < 150; i++) {
      for (let j = i + 1; j < NEURON_COUNT && links < 150; j++) {
        if (pts[i].distanceTo(pts[j]) < 4.6) {
          linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          links++;
        }
      }
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePos), 3));
    return { pointsGeo: pGeo, linesGeo: lGeo };
  }, []);

  useEffect(
    () => () => {
      pointsGeo.dispose();
      linesGeo.dispose();
    },
    [pointsGeo, linesGeo]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pointsMatRef.current) pointsMatRef.current.opacity = 0.4 + Math.sin(t * 0.7) * 0.15;
    if (linesMatRef.current) linesMatRef.current.opacity = 0.07 + Math.sin(t * 0.7 + 1.2) * 0.035;
  });

  return (
    <>
      <points geometry={pointsGeo} frustumCulled={false}>
        <pointsMaterial
          ref={pointsMatRef}
          color="#FF3D71"
          size={0.09}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={linesGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={linesMatRef}
          color="#a855f7"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
};

/* ── Act III — data streams flowing downward ── */
const STREAM_COUNT = 100;

const Streams = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const arr: { x: number; z: number; speed: number; phase: number; len: number }[] = [];
    for (let i = 0; i < STREAM_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 7 + Math.random() * 7;
      arr.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        speed: 2.5 + Math.random() * 4.5,
        phase: Math.random() * 100,
        len: 0.6 + Math.random() * 1.6,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { top, span } = ACT_Y[2];
    const range = span + 16;
    for (let i = 0; i < STREAM_COUNT; i++) {
      const d = data[i];
      const y = top + 8 - ((t * d.speed + d.phase) % range);
      dummy.position.set(d.x, y, d.z);
      dummy.scale.set(1, d.len, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STREAM_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.035, 1, 0.035]} />
      <meshBasicMaterial
        color="#FF8C00"
        transparent
        opacity={0.38}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

/* ── Act IV — sparse drifting monoliths ── */
const MONOLITHS = Array.from({ length: 9 }, (_, i) => {
  const angle = (i / 9) * Math.PI * 2;
  const radius = 9 + (i % 3) * 3;
  return {
    pos: [
      Math.cos(angle) * radius,
      ACT_Y[3].top + 5 - (i / 9) * (ACT_Y[3].span + 12),
      Math.sin(angle) * radius,
    ] as [number, number, number],
    scale: 1.6 + (i % 4) * 0.55,
    spin: 0.02 + (i % 3) * 0.012,
  };
});

const Monoliths = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current?.children.forEach((c, i) => {
      c.rotation.y = t * MONOLITHS[i].spin;
      c.rotation.x = Math.sin(t * 0.08 + i * 2.1) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {MONOLITHS.map((m, i) => (
        <mesh key={i} position={m.pos} scale={m.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#4A9EFF" wireframe transparent opacity={0.13} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ── Orchestrator — visibility by camera altitude ── */
interface ActEnvironmentsProps {
  progressRef: React.MutableRefObject<number>;
}

const ActEnvironments = memo(({ progressRef }: ActEnvironmentsProps) => {
  const refs = [
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
  ];

  useFrame(({ clock }) => {
    const y = camAltitude(progressRef.current);
    const t = clock.elapsedTime;
    for (let k = 0; k < 4; k++) {
      const g = refs[k].current;
      if (!g) continue;
      g.visible = Math.abs(y - ACT_Y[k].center) < VISIBLE_RANGE;
      if (g.visible) g.rotation.y = t * (k % 2 === 0 ? 0.018 : -0.014);
    }
  });

  return (
    <>
      <group ref={refs[0]} position={[0, 0, 0]}>
        <Lattice />
      </group>
      <group ref={refs[1]}>
        <Neural />
      </group>
      <group ref={refs[2]}>
        <Streams />
      </group>
      <group ref={refs[3]}>
        <Monoliths />
      </group>
    </>
  );
});

ActEnvironments.displayName = "ActEnvironments";
export default ActEnvironments;
