import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS } from "./stations";
import { sampleStation, dwellFactor, actBoundaryFlash, smoother, DWELL } from "./choreography";

interface ZoneLightingProps {
  progressRef: React.MutableRefObject<number>;
}

const STATION_COLORS = STATIONS.map((s) => new THREE.Color(s.color));
const RIM_WHITE = new THREE.Color("#dceaff");

/**
 * ZoneLighting — dramaturgy through light.
 * Key light ramps up while the camera dwells at a station and dims during
 * transit; a cool white rim light carves the model silhouette from the
 * opposite side; diving through an act-boundary portal fires a flash.
 * Fog colour inherits a whisper of the active zone.
 */
const ZoneLighting = ({ progressRef }: ZoneLightingProps) => {
  const mainRef = useRef<THREE.PointLight>(null!);
  const accentRef = useRef<THREE.PointLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);
  const targetColor = useRef(new THREE.Color("#00ffaa"));
  const fogTint = useRef(new THREE.Color("#000000"));

  useFrame(({ scene }) => {
    const p = progressRef.current;
    const { idx, local } = sampleStation(p);
    const next = Math.min(idx + 1, STATIONS.length - 1);

    // Blend station position/colour across the transit portion only,
    // so light sits firmly on the station while the camera dwells.
    const blend = local < DWELL ? 0 : smoother((local - DWELL) / (1 - DWELL));
    const from = STATIONS[idx];
    const to = STATIONS[next];
    const x = from.pos[0] + (to.pos[0] - from.pos[0]) * blend;
    const y = from.pos[1] + (to.pos[1] - from.pos[1]) * blend;
    const z = from.pos[2] + (to.pos[2] - from.pos[2]) * blend;

    targetColor.current.copy(STATION_COLORS[idx]).lerp(STATION_COLORS[next], blend);

    const dwell = dwellFactor(p);
    const flash = actBoundaryFlash(p);

    if (mainRef.current) {
      mainRef.current.position.set(x, y + 5, z + 4);
      mainRef.current.color.lerp(targetColor.current, 0.08);
      // Ramp: dim in transit, hot at the station, spike through portals
      mainRef.current.intensity = 0.55 + dwell * 0.75 + flash * 1.4;
    }
    if (accentRef.current) {
      accentRef.current.position.set(x, y - 12, z - 3);
      accentRef.current.color.lerp(targetColor.current, 0.08);
      accentRef.current.intensity = 0.4 + dwell * 0.3 + flash * 0.8;
    }
    if (rimRef.current) {
      // Cool white rim from behind-left — two-tone contrast against the zone colour
      rimRef.current.position.set(x - 6, y + 3.5, z - 6);
      rimRef.current.color.lerp(RIM_WHITE, 0.05);
      rimRef.current.intensity = 0.32 + dwell * 0.45;
    }

    // Fog inherits a whisper of the zone colour; portals briefly ignite it
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fogTint.current.copy(targetColor.current).multiplyScalar(0.09 + flash * 0.28);
      fog.color.lerp(fogTint.current, 0.08);
    }
  });

  return (
    <>
      <ambientLight intensity={0.18} />
      <pointLight ref={mainRef} position={[0, 5, 4]} intensity={0.8} color="#00ffaa" distance={40} />
      <pointLight ref={accentRef} position={[0, -12, -3]} intensity={0.5} color="#00ffaa" distance={34} />
      <pointLight ref={rimRef} position={[-5, 2, -5]} intensity={0.4} color="#dceaff" distance={30} />
    </>
  );
};

export default ZoneLighting;
