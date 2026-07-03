import * as THREE from "three";
import { STATIONS, ACTS, stationAct } from "./stations";

/**
 * Choreography — single source of truth for the descent dramaturgy.
 * Every scroll-driven system (camera, lighting, postfx, model reveals)
 * derives its state from the same deterministic functions of progress,
 * so nothing needs cross-component refs and everything stays in sync.
 *
 * Timeline per station segment (1/N of total scroll):
 *   [0 .. DWELL]  — camera orbits the station model (slow, cinematic)
 *   [DWELL .. 1]  — transit swoop to the next station, flying through
 *                   the zone portal at the segment midpoint
 */

export const N = STATIONS.length;

/** Fraction of each station segment spent dwelling/orbiting. */
export const DWELL = 0.62;

/** Quintic smootherstep. */
export const smoother = (x: number) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** Which station segment progress falls into + local 0..1 within it. */
export function sampleStation(p: number) {
  const t = THREE.MathUtils.clamp(p, 0, 1) * N;
  const idx = Math.min(Math.floor(t), N - 1);
  const local = THREE.MathUtils.clamp(t - idx, 0, 1);
  return { idx, local };
}

/** Alternating orbit side per station — mirrors the old left/right rhythm. */
const azBase = (i: number) => (i % 2 === 0 ? 0.72 : -0.72);

/** Camera position on the orbit circle around a station. */
function orbitPos(i: number, az: number, out: THREE.Vector3) {
  const s = STATIONS[i];
  const { radius, height } = ACTS[stationAct(i)].cam;
  out.set(
    s.pos[0] + Math.sin(az) * radius,
    s.pos[1] + height,
    s.pos[2] + Math.cos(az) * radius
  );
  return out;
}

/** What the camera looks at while dwelling — between centre and the model. */
function lookAnchor(i: number, out: THREE.Vector3) {
  const s = STATIONS[i];
  out.set(
    s.pos[0] + s.modelOffset[0] * 0.6,
    s.pos[1] + s.modelOffset[1] * 0.6 + 0.5,
    s.pos[2] + s.modelOffset[2] * 0.6
  );
  return out;
}

const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _lookA = new THREE.Vector3();
const _lookB = new THREE.Vector3();

/**
 * Camera pose for a given progress.
 * Orbit: sweeps around the station model.
 * Transit: quadratic bezier pulled towards the world axis, so the camera
 * physically dives through the zone portal ring between stations.
 */
export function camPose(
  p: number,
  reducedMotion: boolean,
  outPos: THREE.Vector3,
  outLook: THREE.Vector3
) {
  const { idx, local } = sampleStation(p);
  const { sweep } = ACTS[stationAct(idx)].cam;
  const isLast = idx === N - 1;

  if (local < DWELL || isLast) {
    // ── Orbit ──
    const l = isLast ? local : local / DWELL;
    const e = smoother(l);
    const az = azBase(idx) + (reducedMotion ? 0 : (e - 0.5) * sweep);
    orbitPos(idx, az, outPos);
    lookAnchor(idx, outLook);
    return;
  }

  // ── Transit — through the portal ──
  const l = (local - DWELL) / (1 - DWELL);
  const e = smoother(l);
  const next = idx + 1;
  const nextSweep = ACTS[stationAct(next)].cam.sweep;

  orbitPos(idx, azBase(idx) + (reducedMotion ? 0 : sweep * 0.5), _from);
  orbitPos(next, azBase(next) - (reducedMotion ? 0 : nextSweep * 0.5), _to);

  // Portal rings sit at the world axis at the Y midpoint between stations
  const midY = (STATIONS[idx].pos[1] + STATIONS[next].pos[1]) / 2;
  _mid.set((_from.x + _to.x) * 0.15, midY, (_from.z + _to.z) * 0.15 + 1.4);

  // Quadratic bezier from → mid → to
  const a = (1 - e) * (1 - e);
  const b = 2 * (1 - e) * e;
  const c = e * e;
  outPos.set(
    a * _from.x + b * _mid.x + c * _to.x,
    a * _from.y + b * _mid.y + c * _to.y,
    a * _from.z + b * _mid.z + c * _to.z
  );

  lookAnchor(idx, _lookA);
  lookAnchor(next, _lookB);
  outLook.lerpVectors(_lookA, _lookB, e);
}

/**
 * 1 while the camera dwells at a station (plateau), 0 during transit.
 * Drives light intensity ramps and material energy.
 */
export function dwellFactor(p: number) {
  const { idx, local } = sampleStation(p);
  if (idx === N - 1) return THREE.MathUtils.smoothstep(local, 0, 0.18);
  if (local >= DWELL) return 0;
  const l = local / DWELL;
  return (
    THREE.MathUtils.smoothstep(l, 0, 0.18) *
    (1 - THREE.MathUtils.smoothstep(l, 0.82, 1))
  );
}

/**
 * Reveal factor for a station's model — 0 scattered, 1 assembled.
 * Starts assembling as the camera approaches, fully formed during dwell,
 * stays formed while leaving (no distracting re-scatter behind the camera).
 */
export function revealFactor(p: number, stationIndex: number) {
  const t = THREE.MathUtils.clamp(p, 0, 1) * N;
  const center = stationIndex + DWELL * 0.5;
  const d = center - t;
  // approaching from above: assemble over the last 0.85 segment units
  if (d > 0) return 1 - THREE.MathUtils.smoothstep(d, 0.25, 0.85);
  return 1;
}

/**
 * Gaussian flash when diving through an act-boundary portal
 * (between stations 1→2, 3→4, 5→6). Peaks exactly at the portal.
 */
export function actBoundaryFlash(p: number) {
  const { idx, local } = sampleStation(p);
  if (idx % 2 !== 1 || idx >= N - 1 || local < DWELL) return 0;
  const l = (local - DWELL) / (1 - DWELL);
  const d = l - 0.5;
  return Math.exp(-(d * d) / 0.018);
}
