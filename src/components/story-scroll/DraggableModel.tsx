import { useRef, useState, useMemo, useCallback, useEffect, memo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { DRAGGABLE_VERT, DRAGGABLE_FRAG } from "./shaders";

/**
 * Model variants — unique geometry + motion per station concept:
 * - webFrames:    desktop/tablet/phone screens orbiting, typing bars — web apps
 * - commerce:     product cube inside a sweeping scanner ring — e-shop
 * - agentCore:    core mind with orbiting agents firing data pulses — AI agents
 * - invoiceStack: levitating documents, cycling flyer, dropping stamp — invoicing
 * - pipeline:     torus-knot conduit with packets flowing along it — automation
 * - dockLink:     two chain links docking with a contact spark — integrations
 * - crystal:      faceted gem with floating shards — clarity/logic
 * - beacon:       obelisk broadcasting expanding signal rings — connection
 */
export type ModelVariant =
  | "webFrames"
  | "commerce"
  | "agentCore"
  | "invoiceStack"
  | "pipeline"
  | "dockLink"
  | "crystal"
  | "beacon";

interface DraggableModelProps {
  position: [number, number, number];
  color: string;
  variant: ModelVariant;
  scale?: number;
  onClick?: () => void;
  showGlow?: boolean;
}

/* Per-variant hover float — so the world doesn't bob in unison */
const FLOAT_PARAMS: Record<ModelVariant, { speed: number; amp: number }> = {
  webFrames:    { speed: 0.32, amp: 0.13 },
  commerce:     { speed: 0.5,  amp: 0.1 },
  agentCore:    { speed: 0.45, amp: 0.2 },
  invoiceStack: { speed: 0.28, amp: 0.1 },
  pipeline:     { speed: 0.55, amp: 0.16 },
  dockLink:     { speed: 0.4,  amp: 0.18 },
  crystal:      { speed: 0.42, amp: 0.18 },
  beacon:       { speed: 0.6,  amp: 0.22 },
};

/** Per-instance additive glow material derived from the shader's colour. */
const useGlowBasicMat = (mat: THREE.ShaderMaterial, opacity: number) => {
  const m = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: (mat.uniforms.uColor.value as THREE.Color).clone(),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [mat, opacity]
  );
  useEffect(() => () => m.dispose(), [m]);
  return m;
};

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

  useEffect(
    () => () => {
      mat.dispose();
      wireMat.dispose();
      lineMat.dispose();
      glowMat.dispose();
    },
    [mat, wireMat, lineMat, glowMat]
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
      const f = FLOAT_PARAMS[variant];
      groupRef.current.position.y = position[1] + Math.sin(t * f.speed) * f.amp;
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
        {variant === "webFrames" && <WebFramesModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "commerce" && <CommerceModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "agentCore" && <AgentCoreModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "invoiceStack" && <InvoiceStackModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "pipeline" && <PipelineModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
        {variant === "dockLink" && <DockLinkModel mat={mat} wireMat={wireMat} lineMat={lineMat} />}
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

/** Thin border strips around a screen panel (no wireframe diagonals). */
const ScreenFrame = ({
  w,
  h,
  mat,
  wireMat,
  children,
}: {
  w: number;
  h: number;
  mat: THREE.Material;
  wireMat: THREE.Material;
  children?: React.ReactNode;
}) => (
  <group>
    <mesh material={mat}>
      <planeGeometry args={[w, h]} />
    </mesh>
    <mesh material={wireMat} position={[0, h / 2, 0]}>
      <boxGeometry args={[w + 0.015, 0.015, 0.015]} />
    </mesh>
    <mesh material={wireMat} position={[0, -h / 2, 0]}>
      <boxGeometry args={[w + 0.015, 0.015, 0.015]} />
    </mesh>
    <mesh material={wireMat} position={[-w / 2, 0, 0]}>
      <boxGeometry args={[0.015, h, 0.015]} />
    </mesh>
    <mesh material={wireMat} position={[w / 2, 0, 0]}>
      <boxGeometry args={[0.015, h, 0.015]} />
    </mesh>
    {children}
  </group>
);

/**
 * WebFrames: main browser screen with typing content bars + blinking cursor,
 * tablet and phone screens orbiting around it — responsive web development.
 */
const WebFramesModel = ({ mat, wireMat }: SubProps) => {
  const swayRef = useRef<THREE.Group>(null!);
  const tabletRef = useRef<THREE.Group>(null!);
  const phoneRef = useRef<THREE.Group>(null!);
  const barsRef = useRef<THREE.Group>(null!);
  const cursorMat = useGlowBasicMat(mat, 0.9);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (swayRef.current) {
      swayRef.current.rotation.y = Math.sin(t * 0.3) * 0.22;
      swayRef.current.rotation.x = Math.cos(t * 0.22) * 0.06;
    }
    if (tabletRef.current) {
      const a = t * 0.4;
      tabletRef.current.position.set(Math.cos(a) * 1.15, Math.sin(t * 0.7) * 0.22, Math.sin(a) * 0.7);
      tabletRef.current.rotation.y = Math.sin(a) * 0.5;
    }
    if (phoneRef.current) {
      const a = t * 0.55 + Math.PI;
      phoneRef.current.position.set(Math.cos(a) * 1.05, Math.cos(t * 0.5) * 0.28, Math.sin(a) * 0.6);
      phoneRef.current.rotation.y = Math.sin(a) * 0.5;
    }
    // typing bars — grow like code being written, then reset
    if (barsRef.current) {
      barsRef.current.children.forEach((c, i) => {
        const cycle = (t * 0.35 + i * 0.31) % 1;
        c.scale.x = 0.15 + Math.min(cycle * 1.8, 1) * 0.85;
      });
    }
    // block cursor blink
    cursorMat.opacity = Math.floor(t * 2.4) % 2 === 0 ? 0.9 : 0.08;
  });

  const barWidths = [0.62, 0.44, 0.53];

  return (
    <group ref={swayRef}>
      {/* Main desktop screen */}
      <ScreenFrame w={1.15} h={0.75} mat={mat} wireMat={wireMat}>
        <group ref={barsRef}>
          {barWidths.map((w, i) => (
            <mesh key={i} material={wireMat} position={[-0.5 + w / 2, 0.18 - i * 0.16, 0.01]}>
              <boxGeometry args={[w, 0.035, 0.01]} />
            </mesh>
          ))}
        </group>
        {/* Blinking block cursor under the last line */}
        <mesh material={cursorMat} position={[-0.44, -0.26, 0.01]}>
          <boxGeometry args={[0.05, 0.07, 0.01]} />
        </mesh>
      </ScreenFrame>

      {/* Orbiting tablet + phone */}
      <group ref={tabletRef}>
        <ScreenFrame w={0.42} h={0.58} mat={mat} wireMat={wireMat} />
      </group>
      <group ref={phoneRef}>
        <ScreenFrame w={0.24} h={0.46} mat={mat} wireMat={wireMat} />
      </group>
    </group>
  );
};

/**
 * Commerce: product cube slowly turning inside a static holo-cage while a
 * scanner ring sweeps up and down — the product pulses as the scan passes.
 */
const CommerceModel = ({ mat, wireMat, lineMat }: SubProps) => {
  const productRef = useRef<THREE.Mesh>(null!);
  const scanRef = useRef<THREE.Mesh>(null!);
  const shardsRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const scanY = Math.sin(t * 0.8) * 0.55;
    if (productRef.current) {
      productRef.current.rotation.y = t * 0.35;
      const near = 1 - Math.min(Math.abs(scanY) * 3, 1);
      productRef.current.scale.setScalar(0.92 + near * 0.1);
    }
    if (scanRef.current) {
      scanRef.current.position.y = scanY;
    }
    if (shardsRef.current) {
      shardsRef.current.children.forEach((c, i) => {
        const a = t * (0.35 + i * 0.09) + (i / 4) * Math.PI * 2;
        c.position.set(Math.cos(a) * 0.95, Math.sin(t * 0.6 + i * 1.7) * 0.32, Math.sin(a) * 0.95);
        c.rotation.set(t * 0.7 + i, t * 0.4, 0);
      });
    }
  });

  return (
    <>
      <mesh ref={productRef} material={mat}>
        <boxGeometry args={[0.52, 0.52, 0.52]} />
      </mesh>
      {/* Static holo-cage around the turning product */}
      <mesh material={wireMat} scale={1.35}>
        <boxGeometry args={[0.52, 0.52, 0.52]} />
      </mesh>
      {/* Scanner ring sweeping vertically */}
      <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[0.72, 0.014, 8, 48]} />
      </mesh>
      {/* Base pad */}
      <mesh material={lineMat} position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.72, 48]} />
      </mesh>
      {/* Orbiting price shards */}
      <group ref={shardsRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={i % 2 === 0 ? mat : wireMat}>
            <tetrahedronGeometry args={[0.07, 0]} />
          </mesh>
        ))}
      </group>
    </>
  );
};

/**
 * AgentCore: thinking core with satellites (agents) on tilted orbits,
 * each continuously sending a data pulse back to the core.
 */
const AgentCoreModel = ({ mat, wireMat }: SubProps) => {
  const coreRef = useRef<THREE.Mesh>(null!);
  const satsRef = useRef<THREE.Group>(null!);
  const pulsesRef = useRef<THREE.Group>(null!);
  const pulseMat = useGlowBasicMat(mat, 0.85);
  const satPos = useMemo(() => new THREE.Vector3(), []);

  const orbits = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        radius: 0.85 + (i % 3) * 0.13,
        speed: 0.35 + i * 0.09,
        incl: (i / 5) * Math.PI,
        phase: (i / 5) * Math.PI * 2,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current) {
      // "thinking" — two overlapping pulse frequencies
      const think = 1 + Math.sin(t * 2.2) * 0.05 + Math.sin(t * 5.7) * 0.02;
      coreRef.current.scale.setScalar(think);
      coreRef.current.rotation.y = t * 0.2;
    }
    orbits.forEach((o, i) => {
      const a = t * o.speed + o.phase;
      satPos.set(
        Math.cos(a) * o.radius,
        Math.sin(a) * Math.sin(o.incl) * o.radius * 0.6,
        Math.sin(a) * Math.cos(o.incl) * o.radius
      );
      const sat = satsRef.current?.children[i];
      if (sat) {
        sat.position.copy(satPos);
        sat.rotation.y = t * 1.2 + i;
      }
      // pulse travels satellite -> core, swells mid-flight
      const pulse = pulsesRef.current?.children[i];
      if (pulse) {
        const cycle = (t * 0.45 + i * 0.23) % 1;
        pulse.position.copy(satPos).multiplyScalar(1 - cycle);
        pulse.scale.setScalar(0.5 + Math.sin(cycle * Math.PI) * 0.9);
      }
    });
  });

  return (
    <>
      <mesh ref={coreRef} material={mat}>
        <icosahedronGeometry args={[0.42, 1]} />
      </mesh>
      <mesh material={wireMat} scale={1.3}>
        <icosahedronGeometry args={[0.42, 1]} />
      </mesh>
      <group ref={satsRef}>
        {orbits.map((_, i) => (
          <mesh key={i} material={mat}>
            <octahedronGeometry args={[0.085, 0]} />
          </mesh>
        ))}
      </group>
      <group ref={pulsesRef}>
        {orbits.map((_, i) => (
          <mesh key={i} material={pulseMat}>
            <sphereGeometry args={[0.032, 8, 8]} />
          </mesh>
        ))}
      </group>
    </>
  );
};

/**
 * InvoiceStack: hovering stack of documents; one flies out, loops around and
 * reinserts; a stamp periodically drops onto the pile; a coin orbits.
 */
const InvoiceStackModel = ({ mat, wireMat }: SubProps) => {
  const docsRef = useRef<THREE.Group>(null!);
  const flyerRef = useRef<THREE.Mesh>(null!);
  const stampRef = useRef<THREE.Group>(null!);
  const coinRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // cascading levitation of the pile
    docsRef.current?.children.forEach((c, i) => {
      c.position.y = -0.4 + i * 0.13 + Math.sin(t * 0.9 + i * 0.55) * 0.03;
      c.rotation.y = Math.sin(t * 0.25 + i * 0.8) * 0.18;
    });
    // one document escapes, arcs around and returns (loop)
    if (flyerRef.current) {
      const cycle = (t * 0.22) % 1;
      const lift = Math.sin(cycle * Math.PI);
      flyerRef.current.position.set(
        Math.sin(cycle * Math.PI * 2) * 0.55,
        0.2 + lift * 0.6,
        Math.cos(cycle * Math.PI * 2) * 0.3
      );
      flyerRef.current.rotation.z = lift * 0.45;
      flyerRef.current.rotation.y = cycle * Math.PI * 2;
    }
    // stamp: hovers, drops fast, lifts slowly
    if (stampRef.current) {
      const cycle = (t * 0.3) % 1;
      const drop =
        cycle < 0.12 ? 1 - cycle / 0.12 : cycle < 0.3 ? (cycle - 0.12) / 0.18 : 1;
      stampRef.current.position.y = 0.32 + drop * 0.45;
    }
    // spinning coin orbit
    if (coinRef.current) {
      const a = t * 0.55;
      coinRef.current.position.set(Math.cos(a) * 0.9, 0.1 + Math.sin(t * 1.1) * 0.2, Math.sin(a) * 0.9);
      coinRef.current.rotation.set(Math.PI / 2, 0, t * 2.2);
    }
  });

  return (
    <>
      <group ref={docsRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={i === 3 ? mat : wireMat}>
            <boxGeometry args={[0.72, 0.02, 0.52]} />
          </mesh>
        ))}
      </group>
      {/* The escaping document */}
      <mesh ref={flyerRef} material={mat}>
        <boxGeometry args={[0.72, 0.02, 0.52]} />
      </mesh>
      {/* Stamp */}
      <group ref={stampRef} position={[0, 0.8, 0]}>
        <mesh material={mat}>
          <cylinderGeometry args={[0.11, 0.15, 0.16, 12]} />
        </mesh>
        <mesh material={wireMat} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.13, 8]} />
        </mesh>
      </group>
      {/* Coin */}
      <mesh ref={coinRef} material={mat}>
        <cylinderGeometry args={[0.09, 0.09, 0.028, 16]} />
      </mesh>
    </>
  );
};

/**
 * Pipeline: torus-knot conduit with data packets flowing along the exact
 * knot curve — automation that never stops moving.
 */
const PipelineModel = ({ mat, wireMat }: SubProps) => {
  const spinRef = useRef<THREE.Group>(null!);
  const flowRef = useRef<THREE.InstancedMesh>(null!);
  const flowMat = useGlowBasicMat(mat, 0.85);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const FLOW_COUNT = 26;
  const RADIUS = 0.6;
  const P = 2;
  const Q = 3;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (spinRef.current) {
      spinRef.current.rotation.y = t * 0.12;
      spinRef.current.rotation.x = Math.sin(t * 0.2) * 0.25;
    }
    if (flowRef.current) {
      for (let i = 0; i < FLOW_COUNT; i++) {
        // parametric position on the torus knot (matches TorusKnotGeometry)
        const u = (((t * 0.05 + i / FLOW_COUNT) % 1) * P) * Math.PI * 2;
        const quOverP = (Q / P) * u;
        const cs = Math.cos(quOverP);
        dummy.position.set(
          RADIUS * (2 + cs) * 0.5 * Math.cos(u),
          RADIUS * (2 + cs) * 0.5 * Math.sin(u),
          RADIUS * Math.sin(quOverP) * 0.5
        );
        const s = 0.75 + Math.sin(t * 3 + i) * 0.3;
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        flowRef.current.setMatrixAt(i, dummy.matrix);
      }
      flowRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={spinRef}>
      {/* Conduit — translucent shader tube + wire skeleton */}
      <mesh material={mat}>
        <torusKnotGeometry args={[RADIUS, 0.035, 96, 8, P, Q]} />
      </mesh>
      <mesh material={wireMat} scale={1.02}>
        <torusKnotGeometry args={[RADIUS, 0.02, 64, 6, P, Q]} />
      </mesh>
      {/* Data packets flowing along the knot */}
      <instancedMesh ref={flowRef} args={[undefined, undefined, FLOW_COUNT]} material={flowMat}>
        <sphereGeometry args={[0.042, 8, 8]} />
      </instancedMesh>
    </group>
  );
};

/**
 * DockLink: two perpendicular chain links that repeatedly pull together and
 * apart — a spark flares at the moment of contact. Integration, literally.
 */
const DockLinkModel = ({ mat, wireMat }: SubProps) => {
  const linkA = useRef<THREE.Group>(null!);
  const linkB = useRef<THREE.Group>(null!);
  const sparkRef = useRef<THREE.Mesh>(null!);
  const sparkMat = useGlowBasicMat(mat, 0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const cycle = (Math.sin(t * 0.5) + 1) / 2; // 0 = docked, 1 = apart
    const sep = 0.16 + cycle * 0.42;
    if (linkA.current) {
      linkA.current.position.x = -sep;
      linkA.current.rotation.x = t * 0.3;
    }
    if (linkB.current) {
      linkB.current.position.x = sep;
      linkB.current.rotation.x = -t * 0.3;
    }
    if (sparkRef.current) {
      const docked = 1 - Math.min((sep - 0.16) / 0.12, 1);
      sparkRef.current.scale.setScalar(0.25 + docked * (1 + Math.sin(t * 8) * 0.25));
      sparkMat.opacity = docked * 0.8;
    }
  });

  return (
    <>
      <group ref={linkA}>
        <mesh material={mat}>
          <torusGeometry args={[0.4, 0.055, 12, 48]} />
        </mesh>
        <mesh material={wireMat} scale={1.16}>
          <torusGeometry args={[0.4, 0.035, 8, 32]} />
        </mesh>
      </group>
      <group ref={linkB} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={mat}>
          <torusGeometry args={[0.4, 0.055, 12, 48]} />
        </mesh>
        <mesh material={wireMat} scale={1.16}>
          <torusGeometry args={[0.4, 0.035, 8, 32]} />
        </mesh>
      </group>
      {/* Contact spark */}
      <mesh ref={sparkRef} material={sparkMat}>
        <sphereGeometry args={[0.09, 12, 12]} />
      </mesh>
    </>
  );
};

/**
 * Crystal: faceted gem with floating broken shards + inner refraction lines.
 * Represents transparency/clarity.
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
        <mesh material={mat} scale={[0.6, 1, 0.6]}>
          <octahedronGeometry args={[0.65, 0]} />
        </mesh>
        <mesh material={wireMat} scale={[0.55, 0.95, 0.55]}>
          <octahedronGeometry args={[0.65, 1]} />
        </mesh>
        <points>
          <octahedronGeometry args={[0.7, 1]} />
          <pointsMaterial color={mat.uniforms.uColor.value as THREE.Color} size={0.04} transparent opacity={0.5} depthWrite={false} />
        </points>
      </group>
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
 * Beacon: pyramidal obelisk with expanding signal rings + tip glow.
 * Represents connection/signal broadcasting.
 */
const BeaconModel = ({ mat, wireMat, lineMat }: SubProps) => {
  const ringsRef = useRef<THREE.Group>(null!);
  const tipRef = useRef<THREE.Mesh>(null!);

  // Each ring gets its own material so opacity can animate independently
  const ringMats = useMemo(
    () =>
      Array.from(
        { length: 4 },
        () =>
          new THREE.MeshBasicMaterial({
            color: (mat.uniforms.uColor.value as THREE.Color).clone(),
            transparent: true,
            opacity: 0.15,
            wireframe: true,
            depthWrite: false,
          })
      ),
    [mat]
  );
  useEffect(() => () => ringMats.forEach((m) => m.dispose()), [ringMats]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        const cycle = (t * 0.6 + i * 0.4) % 2;
        const yPos = 0.6 + cycle * 0.5;
        const ringScale = 0.3 + cycle * 0.6;
        ring.position.y = yPos;
        ring.scale.setScalar(ringScale);
        ringMats[i].opacity = Math.max(0, 1 - cycle / 1.8) * 0.15;
      });
    }
    if (tipRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.15;
      tipRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <mesh material={mat} position={[0, -0.15, 0]}>
        <coneGeometry args={[0.35, 1.2, 4, 1]} />
      </mesh>
      <mesh material={wireMat} position={[0, -0.15, 0]} scale={1.04}>
        <coneGeometry args={[0.35, 1.2, 4, 1]} />
      </mesh>
      <mesh material={lineMat} position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[0.25, 0.45, 4]} />
      </mesh>
      <mesh ref={tipRef} material={mat} position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
      </mesh>
      <group ref={ringsRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} material={ringMats[i]}>
            <ringGeometry args={[0.4, 0.42, 32]} />
          </mesh>
        ))}
      </group>
    </>
  );
};
