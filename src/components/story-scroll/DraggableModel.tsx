import { useRef, useState, useMemo, useCallback, memo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { DRAGGABLE_VERT, DRAGGABLE_FRAG } from "./shaders";

/**
 * Model variants — unique geometry for each station concept:
 * - showcase: sliced sphere with orbiting fragments — portfolio/display
 * - webKnot: DNA helix double-strand — interconnected web systems
 * - autoLoops: gyroscope with 3 spinning rings — automation cycles
 * - crystal: faceted gem with floating shards — clarity/logic
 * - beacon: pyramidal obelisk with pulse rings — signal/connection
 */
export type ModelVariant = "showcase" | "webKnot" | "autoLoops" | "crystal" | "beacon";

interface DraggableModelProps {
  position: [number, number, number];
  color: string;
  variant: ModelVariant;
  scale?: number;
  onClick?: () => void;
  showGlow?: boolean;
}

const DraggableModel = memo(({ position, color, variant, scale = 1, onClick, showGlow = true }: DraggableModelProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const dragDelta = useRef(0);
  const dragRotation = useRef({ x: 0, y: 0 });
  const targetDragRot = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: DRAGGABLE_VERT,
        fragmentShader: DRAGGABLE_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uHover: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [color]
  );

  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        wireframe: true,
        depthWrite: false,
      }),
    [color]
  );

  const lineMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      }),
    [color]
  );

  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.035,
        depthWrite: false,
      }),
    [color]
  );

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    mat.uniforms.uTime.value = t;
    mat.uniforms.uHover.value +=
      ((hovered || isDragging.current ? 1 : 0) - mat.uniforms.uHover.value) * 0.08;

    dragRotation.current.x += (targetDragRot.current.x - dragRotation.current.x) * 0.1;
    dragRotation.current.y += (targetDragRot.current.y - dragRotation.current.y) * 0.1;

    if (!isDragging.current) {
      targetDragRot.current.y += delta * 0.2;
    }

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.18;
    }

    if (innerRef.current) {
      innerRef.current.rotation.x = dragRotation.current.x;
      innerRef.current.rotation.y = dragRotation.current.y;
    }
  });

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    isDragging.current = true;
    dragDelta.current = 0;
    prevPointer.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
  }, []);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const dx = e.clientX - prevPointer.current.x;
    const dy = e.clientY - prevPointer.current.y;
    prevPointer.current = { x: e.clientX, y: e.clientY };
    dragDelta.current += Math.abs(dx) + Math.abs(dy);
    targetDragRot.current.y += dx * 0.008;
    targetDragRot.current.x += dy * 0.008;
  }, []);

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDragging.current) return;
      e.stopPropagation();
      isDragging.current = false;
      document.body.style.cursor = hovered ? "pointer" : "";
      if (dragDelta.current < 8 && onClick) onClick();
    },
    [hovered, onClick]
  );

  const pointerHandlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
      if (!isDragging.current) document.body.style.cursor = "pointer";
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(false);
      if (!isDragging.current) document.body.style.cursor = "";
    },
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };

  return (
    <group ref={groupRef} position={position}>
      <group ref={innerRef} scale={scale}>
        {variant === "showcase" && <ShowcaseModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "webKnot" && <WebKnotModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "autoLoops" && <AutoLoopsModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "crystal" && <CrystalModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "beacon" && <BeaconModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}

        {/* Invisible interaction sphere */}
        <mesh {...pointerHandlers}>
          <sphereGeometry args={[1.5, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Ambient glow sphere */}
      {showGlow && (
        <mesh scale={scale * 2}>
          <sphereGeometry args={[1, 16, 16]} />
          <primitive object={glowMat} attach="material" />
        </mesh>
      )}
    </group>
  );
});

DraggableModel.displayName = "DraggableModel";
export default DraggableModel;

/* ── Variant sub-models ── */

interface SubProps {
  mat: THREE.ShaderMaterial;
  wireMat: THREE.MeshBasicMaterial;
  lineMat: THREE.MeshBasicMaterial;
}

/**
 * Showcase: Hollow sliced sphere with orbiting debris fragments
 * Represents a curated portfolio display
 */
const ShowcaseModel = ({ mat, wireMat, lineMat }: SubProps) => {
  const debrisRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Debris orbits at different speeds and radii
    if (debrisRef.current) {
      debrisRef.current.children.forEach((c, i) => {
        const speed = 0.3 + i * 0.08;
        const radius = 0.9 + i * 0.15;
        const offset = (i / 6) * Math.PI * 2;
        const yOff = Math.sin(t * 0.5 + i) * 0.3;
        c.position.set(
          Math.cos(t * speed + offset) * radius,
          yOff,
          Math.sin(t * speed + offset) * radius
        );
        c.rotation.x = t * 0.8 + i;
        c.rotation.z = t * 0.4;
      });
    }
    // Core slow breathe
    if (coreRef.current) {
      const breathe = 1 + Math.sin(t * 0.8) * 0.04;
      coreRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <>
      {/* Full sphere core */}
      <mesh ref={coreRef} material={mat}>
        <sphereGeometry args={[0.55, 32, 32]} />
      </mesh>
      {/* Wireframe cage */}
      <mesh material={wireMat} scale={1.15}>
        <icosahedronGeometry args={[0.6, 1]} />
      </mesh>
      {/* Orbiting debris */}
      <group ref={debrisRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} material={i % 2 === 0 ? mat : lineMat}>
            <tetrahedronGeometry args={[0.06 + i * 0.01, 0]} />
          </mesh>
        ))}
      </group>
    </>
  );
};

/**
 * WebKnot: DNA double helix — two spiraling strands connected by rungs
 * Represents interconnected web systems
 */
const WebKnotModel = ({ mat, wireMat }: SubProps) => {
  const helixRef = useRef<THREE.Group>(null!);
  const nodeCount = 16;
  const radius = 0.35;
  const height = 1.6;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!helixRef.current) return;
    helixRef.current.rotation.y = t * 0.15;
    // Pulse nodes
    helixRef.current.children.forEach((c, i) => {
      if ((c as THREE.Mesh).geometry?.type === "SphereGeometry") {
        const pulse = 1 + Math.sin(t * 2 + i * 0.5) * 0.15;
        c.scale.setScalar(pulse);
      }
    });
  });

  const nodes: JSX.Element[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const frac = i / (nodeCount - 1);
    const angle = frac * Math.PI * 3;
    const y = (frac - 0.5) * height;
    // Strand A
    const ax = Math.cos(angle) * radius;
    const az = Math.sin(angle) * radius;
    // Strand B (opposite)
    const bx = Math.cos(angle + Math.PI) * radius;
    const bz = Math.sin(angle + Math.PI) * radius;

    nodes.push(
      <mesh key={`a${i}`} position={[ax, y, az]} material={mat}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>,
      <mesh key={`b${i}`} position={[bx, y, bz]} material={mat}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>,
    );
    // Connecting rung every 3rd node
    if (i % 3 === 0) {
      nodes.push(
        <mesh key={`r${i}`} position={[(ax + bx) / 2, y, (az + bz) / 2]} material={wireMat}>
          <boxGeometry args={[Math.sqrt((ax - bx) ** 2 + (az - bz) ** 2), 0.015, 0.015]} />
        </mesh>
      );
    }
  }

  // Central axis tube
  nodes.push(
    <mesh key="axis" material={wireMat}>
      <cylinderGeometry args={[0.02, 0.02, height * 1.1, 8]} />
    </mesh>
  );

  return <group ref={helixRef}>{nodes}</group>;
};

/**
 * AutoLoops: Gyroscope — 3 independently rotating rings with a core
 * Represents perpetual automation workflows
 */
const AutoLoopsModel = ({ mat, wireMat, lineMat }: SubProps) => {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ring1.current) { ring1.current.rotation.x = t * 0.5; ring1.current.rotation.z = t * 0.1; }
    if (ring2.current) { ring2.current.rotation.y = t * 0.4; ring2.current.rotation.x = Math.PI / 3; }
    if (ring3.current) { ring3.current.rotation.z = t * 0.35; ring3.current.rotation.x = -Math.PI / 4; ring3.current.rotation.y = t * 0.15; }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.08;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      {/* Core sphere — pulsing energy */}
      <mesh ref={coreRef} material={mat}>
        <octahedronGeometry args={[0.18, 0]} />
      </mesh>
      {/* Ring 1 — outer, thick */}
      <mesh ref={ring1} material={mat}>
        <torusGeometry args={[0.8, 0.04, 16, 64]} />
      </mesh>
      {/* Ring 2 — mid, tilted */}
      <mesh ref={ring2} material={mat}>
        <torusGeometry args={[0.6, 0.035, 16, 64]} />
      </mesh>
      {/* Ring 3 — inner, wireframe */}
      <mesh ref={ring3} material={wireMat}>
        <torusGeometry args={[0.45, 0.025, 12, 48]} />
      </mesh>
      {/* Orbit nodes on outer ring */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8]} material={lineMat}>
            <sphereGeometry args={[0.05, 8, 8]} />
          </mesh>
        );
      })}
    </>
  );
};

/**
 * Crystal: Faceted gem with floating broken shards + inner refraction lines
 * Represents transparency/clarity
 */
const CrystalModel = ({ mat, wireMat, lineMat }: SubProps) => {
  const shardsRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (shardsRef.current) {
      shardsRef.current.children.forEach((c, i) => {
        const dist = 0.8 + Math.sin(t * 0.6 + i * 1.5) * 0.2;
        const angle = (i / 5) * Math.PI * 2 + t * 0.12;
        const yOff = Math.cos(t * 0.4 + i * 2) * 0.35;
        c.position.set(Math.cos(angle) * dist, yOff, Math.sin(angle) * dist);
        c.rotation.x = t * 0.5 + i;
        c.rotation.y = t * 0.3;
      });
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.08;
    }
  });

  return (
    <>
      <group ref={coreRef}>
        {/* Main crystal — elongated octahedron */}
        <mesh material={mat} scale={[0.6, 1, 0.6]}>
          <octahedronGeometry args={[0.65, 0]} />
        </mesh>
        {/* Inner wireframe structure */}
        <mesh material={wireMat} scale={[0.55, 0.95, 0.55]}>
          <octahedronGeometry args={[0.65, 1]} />
        </mesh>
        {/* Vertex highlight points */}
        <points>
          <octahedronGeometry args={[0.7, 1]} />
          <pointsMaterial color={mat.uniforms.uColor.value} size={0.04} transparent opacity={0.5} depthWrite={false} />
        </points>
      </group>
      {/* Floating broken shards */}
      <group ref={shardsRef}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} material={i % 2 === 0 ? mat : lineMat} scale={0.7}>
            <octahedronGeometry args={[0.08 + i * 0.01, 0]} />
          </mesh>
        ))}
      </group>
    </>
  );
};

/**
 * Beacon: Tall pyramidal obelisk with expanding energy rings + tip glow
 * Represents connection/signal broadcasting
 */
const BeaconModel = ({ mat, wireMat, lineMat }: SubProps) => {
  const ringsRef = useRef<THREE.Group>(null!);
  const tipRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        // Rings expand upward from the tip, then reset
        const cycle = (t * 0.6 + i * 0.4) % 2;
        const expand = cycle;
        const yPos = 0.6 + expand * 0.5;
        const ringScale = 0.3 + expand * 0.6;
        const alpha = Math.max(0, 1 - expand / 1.8);
        ring.position.y = yPos;
        ring.scale.set(ringScale, ringScale, ringScale);
        (ring as THREE.Mesh).material = wireMat;
        ((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = alpha * 0.15;
      });
    }
    if (tipRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.15;
      tipRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      {/* Obelisk body — elongated pyramid */}
      <mesh material={mat} position={[0, -0.15, 0]}>
        <coneGeometry args={[0.35, 1.2, 4, 1]} />
      </mesh>
      {/* Wireframe skeleton */}
      <mesh material={wireMat} position={[0, -0.15, 0]} scale={1.04}>
        <coneGeometry args={[0.35, 1.2, 4, 1]} />
      </mesh>
      {/* Base platform */}
      <mesh material={lineMat} position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[0.25, 0.45, 4]} />
      </mesh>
      {/* Tip glow sphere */}
      <mesh ref={tipRef} material={mat} position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
      </mesh>
      {/* Expanding signal rings */}
      <group ref={ringsRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} material={wireMat}>
            <ringGeometry args={[0.4, 0.42, 32]} />
          </mesh>
        ))}
      </group>
    </>
  );
};
