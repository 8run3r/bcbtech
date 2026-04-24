import { useEffect, useRef, useCallback, useState } from "react";

// ── Constants ──
const TILE = 64;
const TEX = 64;
const MAP_W = 20;
const MAP_H = 20;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const WALK_SPD = 1.8;
const STRAFE_SPD = 1.4;
const SPRINT_MULT = 1.7;
const MOUSE_SENS = 0.0015;
const KEY_ROT = 0.03;
const MAX_DEPTH = 1000;
const MAX_HP = 100;
const DMG_BULLET = 34;
const MARGIN = 12;

// 1=brick 2=tech 3=server
const MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,0,1,1,2,0,0,0,0,0,0,2,1,1,0,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,3,0,0,3,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,1],
  [1,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,3,0,0,3,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,0,1,1,2,0,0,0,0,0,0,2,1,1,0,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface Enemy {
  x: number; y: number; hp: number; maxHp: number; alive: boolean;
  lastShot: number; hitFlash: number;
  type: "virus" | "sentinel";
  speed: number; damage: number; interval: number; range: number;
}

interface Pickup { x: number; y: number; active: boolean; type: "health" | "score" }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }

interface RayHit { dist: number; wallType: "h"|"v"; texCol: number; mapVal: number }

// Virus = green, slower, weaker. Sentinel = red, faster, tougher.
const SPAWN_ENEMIES: Array<{ x: number; y: number; type: "virus"|"sentinel" }> = [
  { x: 3, y: 2, type: "virus" },
  { x: 16, y: 2, type: "sentinel" },
  { x: 9, y: 5, type: "virus" },
  { x: 14, y: 7, type: "virus" },
  { x: 5, y: 8, type: "sentinel" },
  { x: 9, y: 9, type: "virus" },
  { x: 10, y: 10, type: "sentinel" },
  { x: 3, y: 14, type: "virus" },
  { x: 16, y: 14, type: "sentinel" },
  { x: 10, y: 17, type: "virus" },
  { x: 7, y: 12, type: "virus" },
  { x: 12, y: 3, type: "sentinel" },
];

const PICKUP_SPAWNS: Array<{ x: number; y: number; type: "health"|"score" }> = [
  { x: 2, y: 5, type: "health" }, { x: 17, y: 5, type: "health" },
  { x: 9, y: 8, type: "health" }, { x: 10, y: 11, type: "health" },
  { x: 5, y: 16, type: "score" }, { x: 14, y: 16, type: "score" },
  { x: 2, y: 14, type: "health" }, { x: 17, y: 14, type: "score" },
];

function makeEnemy(s: typeof SPAWN_ENEMIES[0]): Enemy {
  const isS = s.type === "sentinel";
  return {
    x: s.x * TILE + 32, y: s.y * TILE + 32,
    hp: isS ? 80 : 60, maxHp: isS ? 80 : 60,
    alive: true, lastShot: 0, hitFlash: 0,
    type: s.type,
    speed: isS ? 1.0 : 0.6,
    damage: isS ? 8 : 4,
    interval: isS ? 1500 : 2500,
    range: isS ? 500 : 350,
  };
}

function isWall(x: number, y: number): boolean {
  const mx = Math.floor(x / TILE), my = Math.floor(y / TILE);
  if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return true;
  return MAP[my][mx] > 0;
}

function castRay(px: number, py: number, angle: number): RayHit {
  const sin = Math.sin(angle), cos = Math.cos(angle);
  let hDist = MAX_DEPTH, hCol = 0, hVal = 1;
  {
    const up = sin < 0;
    const fY = up ? Math.floor(py / TILE) * TILE - 0.001 : Math.floor(py / TILE) * TILE + TILE;
    const fX = px + (fY - py) / (sin || 1e-4) * cos;
    const sY = up ? -TILE : TILE;
    const sX = sY / (sin || 1e-4) * cos;
    let rx = fX, ry = fY;
    for (let i = 0; i < 24; i++) {
      const mx = Math.floor(rx / TILE), my = Math.floor(ry / TILE);
      if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) break;
      if (MAP[my][mx] > 0) {
        hDist = Math.hypot(rx - px, ry - py); hVal = MAP[my][mx];
        hCol = Math.floor((((rx % TILE) + TILE) % TILE) * TEX / TILE); break;
      }
      rx += sX; ry += sY;
    }
  }
  let vDist = MAX_DEPTH, vCol = 0, vVal = 1;
  {
    const left = cos < 0;
    const fX = left ? Math.floor(px / TILE) * TILE - 0.001 : Math.floor(px / TILE) * TILE + TILE;
    const fY = py + (fX - px) / (cos || 1e-4) * sin;
    const sX = left ? -TILE : TILE;
    const sY = sX / (cos || 1e-4) * sin;
    let rx = fX, ry = fY;
    for (let i = 0; i < 24; i++) {
      const mx = Math.floor(rx / TILE), my = Math.floor(ry / TILE);
      if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) break;
      if (MAP[my][mx] > 0) {
        vDist = Math.hypot(rx - px, ry - py); vVal = MAP[my][mx];
        vCol = Math.floor((((ry % TILE) + TILE) % TILE) * TEX / TILE); break;
      }
      rx += sX; ry += sY;
    }
  }
  return vDist < hDist
    ? { dist: vDist, wallType: "v", texCol: vCol, mapVal: vVal }
    : { dist: hDist, wallType: "h", texCol: hCol, mapVal: hVal };
}

// ── Textures ──
function genTextures(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [document.createElement("canvas")];
  // 1: Brick
  {
    const c = document.createElement("canvas"); c.width = c.height = TEX;
    const g = c.getContext("2d")!;
    g.fillStyle = "#16162a"; g.fillRect(0, 0, TEX, TEX);
    for (let r = 0; r < 8; r++) {
      const off = (r % 2) * 8;
      for (let col = -1; col <= 4; col++) {
        const v = 22 + ((r * 7 + col * 13) % 15);
        g.fillStyle = `rgb(${v},${(v * 0.8)|0},${(v * 1.3)|0})`;
        g.fillRect(col * 16 + off + 1, r * 8 + 1, 14, 6);
      }
    }
    g.strokeStyle = "rgba(0,255,170,0.06)"; g.lineWidth = 1;
    for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(0, i * 8); g.lineTo(TEX, i * 8); g.stroke(); }
    out.push(c);
  }
  // 2: Tech panel
  {
    const c = document.createElement("canvas"); c.width = c.height = TEX;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0d0d1e"; g.fillRect(0, 0, TEX, TEX);
    g.strokeStyle = "rgba(0,255,255,0.18)"; g.lineWidth = 1;
    g.strokeRect(3, 3, TEX - 6, TEX - 6);
    g.strokeStyle = "rgba(0,255,170,0.12)";
    [[4,14,28,14,28,21,52,21],[4,30,20,30,20,38,48,38],[4,48,35,48,35,54,56,54]].forEach(t => {
      g.beginPath(); g.moveTo(t[0], t[1]);
      for (let i = 2; i < t.length; i += 2) g.lineTo(t[i], t[i + 1]);
      g.stroke();
    });
    ([[56,8,"#00ffaa"],[56,20,"#00ff66"],[56,32,"#ff6600"]] as [number,number,string][]).forEach(([x,y,cl]) => {
      g.fillStyle = cl; g.fillRect(x, y, 3, 3);
    });
    out.push(c);
  }
  // 3: Server rack
  {
    const c = document.createElement("canvas"); c.width = c.height = TEX;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0e0e20"; g.fillRect(0, 0, TEX, TEX);
    for (let i = 0; i < 8; i++) {
      const y = i * 8;
      g.fillStyle = i % 2 ? "#141430" : "#181838"; g.fillRect(2, y, 60, 7);
      g.fillStyle = "rgba(0,200,255,0.08)"; g.fillRect(4, y + 3, 52, 1);
      g.fillStyle = (i * 37) % 3 === 0 ? "rgba(0,255,100,0.6)" : "rgba(255,140,0,0.4)";
      g.fillRect(54, y + 2, 2, 2);
      g.fillStyle = (i * 23) % 2 === 0 ? "rgba(0,180,255,0.4)" : "rgba(0,255,170,0.3)";
      g.fillRect(50, y + 2, 2, 2);
    }
    out.push(c);
  }
  return out;
}

// ── Sprites ──
function drawVirus(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, flash: boolean, frame: number, type: "virus"|"sentinel") {
  const w = h * 0.5;
  const gl = Math.sin(frame * 0.15) * 3;
  const baseColor = type === "sentinel" ? (flash ? "#ff0044" : "#ff4757") : (flash ? "#ff0044" : "#00ddaa");
  const innerColor = type === "sentinel" ? (flash ? "#990022" : "#661122") : (flash ? "#990022" : "#005544");
  const glowColor = type === "sentinel" ? (flash ? "#ff0044" : "#ff4757") : (flash ? "#ff0044" : "#00ff99");
  const eyeColor = type === "sentinel" ? "#ffaa00" : "#ff0055";

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = glowColor;
  ctx.beginPath(); ctx.arc(x, y + h * 0.45, h * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = flash ? 0.95 : 0.8;
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.05);
  ctx.lineTo(x + w * 0.45 + gl, y + h * 0.35);
  ctx.lineTo(x + w * 0.35, y + h * 0.75);
  ctx.lineTo(x, y + h * 0.95);
  ctx.lineTo(x - w * 0.35, y + h * 0.75);
  ctx.lineTo(x - w * 0.45 - gl, y + h * 0.35);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = innerColor; ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.2);
  ctx.lineTo(x + w * 0.25, y + h * 0.4);
  ctx.lineTo(x + w * 0.2, y + h * 0.65);
  ctx.lineTo(x, y + h * 0.8);
  ctx.lineTo(x - w * 0.2, y + h * 0.65);
  ctx.lineTo(x - w * 0.25, y + h * 0.4);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = flash ? "#ff0000" : "#000";
  ctx.beginPath(); ctx.arc(x, y + h * 0.42, h * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = flash ? "#fff" : eyeColor;
  ctx.beginPath(); ctx.arc(x, y + h * 0.42, h * 0.05, 0, Math.PI * 2); ctx.fill();
  // Sentinel spikes
  if (type === "sentinel") {
    ctx.strokeStyle = flash ? "#ff0000" : "#ff4757"; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + frame * 0.02;
      const cr = h * 0.35, sr = h * 0.5;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * cr, y + h * 0.45 + Math.sin(a) * cr * 0.5);
      ctx.lineTo(x + Math.cos(a) * sr, y + h * 0.45 + Math.sin(a) * sr * 0.5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Scan lines
  ctx.globalAlpha = 0.25; ctx.fillStyle = flash ? "#ff0000" : glowColor;
  for (let i = 0; i < 4; i++) {
    const ly = y + h * (0.15 + i * 0.2);
    const lw = w * (0.2 + Math.abs(Math.sin(frame * 0.1 + i * 1.5)) * 0.3);
    ctx.fillRect(x - lw / 2, ly, lw, 1.5);
  }
  ctx.globalAlpha = 1;
}

function drawGun(ctx: CanvasRenderingContext2D, cw: number, ch: number, bob: number, firing: boolean, frame: number) {
  const bx = cw / 2 + 50, by = ch + bob;
  ctx.fillStyle = "#222238"; ctx.fillRect(bx - 22, by - 80, 44, 50);
  ctx.fillStyle = "#1a1a30"; ctx.fillRect(bx - 7, by - 110, 14, 35);
  ctx.fillStyle = firing ? "#00ffaa" : `rgba(0,255,170,${0.3 + Math.sin(frame * 0.06) * 0.15})`;
  ctx.fillRect(bx - 9, by - 112, 18, 3);
  ctx.fillStyle = "#111118"; ctx.fillRect(bx - 7, by - 30, 14, 35);
  ctx.fillStyle = "rgba(0,255,170,0.15)";
  ctx.fillRect(bx - 22, by - 75, 3, 40); ctx.fillRect(bx + 19, by - 75, 3, 40);
  const pulse = 0.25 + Math.sin(frame * 0.04) * 0.15;
  ctx.fillStyle = `rgba(0,255,170,${pulse})`;
  ctx.fillRect(bx - 18, by - 68, 7, 3); ctx.fillRect(bx - 18, by - 62, 7, 3); ctx.fillRect(bx - 18, by - 56, 7, 3);
  if (firing) {
    const fs = 12 + Math.random() * 8;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#00ffaa";
    ctx.beginPath(); ctx.arc(bx, by - 116, fs, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(bx, by - 116, fs * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMinimap(ctx: CanvasRenderingContext2D, px: number, py: number, angle: number, enemies: Enemy[], pickups: Pickup[], cw: number) {
  const sz = 100, cell = sz / MAP_W, ox = cw - sz - 12, oy = 12;
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#000"; ctx.fillRect(ox, oy, sz, sz);
  ctx.strokeStyle = "rgba(0,255,170,0.3)"; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, sz, sz);
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      if (MAP[y][x] > 0) {
        ctx.fillStyle = MAP[y][x] === 3 ? "rgba(0,200,255,0.2)" : MAP[y][x] === 2 ? "rgba(0,255,200,0.2)" : "rgba(0,255,170,0.15)";
        ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
      }
  ctx.globalAlpha = 0.8;
  for (const e of enemies) if (e.alive) {
    ctx.fillStyle = e.type === "sentinel" ? "#ff4757" : "#00ffaa";
    ctx.fillRect(ox + (e.x / TILE) * cell - 1, oy + (e.y / TILE) * cell - 1, 3, 3);
  }
  for (const p of pickups) if (p.active) {
    ctx.fillStyle = p.type === "health" ? "#00ff66" : "#ffcc00";
    ctx.fillRect(ox + (p.x / TILE) * cell - 1, oy + (p.y / TILE) * cell - 1, 2, 2);
  }
  const ppx = ox + (px / TILE) * cell, ppy = oy + (py / TILE) * cell;
  ctx.fillStyle = "#00ff99"; ctx.beginPath(); ctx.arc(ppx, ppy, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#00ff99"; ctx.beginPath(); ctx.moveTo(ppx, ppy);
  ctx.lineTo(ppx + Math.cos(angle) * 7, ppy + Math.sin(angle) * 7); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ── Component ──
export default function DoomGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu"|"playing"|"dead"|"win">("menu");

  const pRef = useRef({ x: 1.5 * TILE, y: 1.5 * TILE, angle: 0 });
  const enemRef = useRef<Enemy[]>([]);
  const pickRef = useRef<Pickup[]>([]);
  const particles = useRef<Particle[]>([]);
  const keys = useRef<Set<string>>(new Set());
  const shootRef = useRef(false);
  const shootAnim = useRef(0);
  const frame = useRef(0);
  const hpRef = useRef(MAX_HP);
  const killsRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimer = useRef(0);
  const gsRef = useRef<typeof gameState>("menu");
  const dmgFlash = useRef(0);
  const texRef = useRef<HTMLCanvasElement[]>([]);
  const lockedRef = useRef(false);
  const shakeRef = useRef(0);
  const startTime = useRef(0);

  const reset = useCallback(() => {
    pRef.current = { x: 1.5 * TILE, y: 1.5 * TILE, angle: 0 };
    enemRef.current = SPAWN_ENEMIES.map(makeEnemy);
    pickRef.current = PICKUP_SPAWNS.map(p => ({ x: p.x * TILE + 32, y: p.y * TILE + 32, active: true, type: p.type }));
    particles.current = [];
    hpRef.current = MAX_HP; killsRef.current = 0; scoreRef.current = 0;
    comboRef.current = 0; comboTimer.current = 0;
    dmgFlash.current = 0; shakeRef.current = 0;
    startTime.current = Date.now();
    setGameState("playing"); gsRef.current = "playing";
  }, []);

  useEffect(() => { texRef.current = genTextures(); }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;

    const resize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      cv.height = 480;
      cv.width = Math.floor(480 * aspect);
    };
    resize();
    window.addEventListener("resize", resize);

    const onKD = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current.add(k);
      if (k === " " && gsRef.current === "playing") { e.preventDefault(); shootRef.current = true; }
      if ((k === "enter" || k === " ") && gsRef.current !== "playing") reset();
    };
    const onKU = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const onClick = () => {
      if (gsRef.current === "playing") {
        if (!lockedRef.current) cv.requestPointerLock();
        shootRef.current = true;
      } else reset();
    };
    const onMM = (e: MouseEvent) => {
      if (document.pointerLockElement === cv && gsRef.current === "playing")
        pRef.current.angle += e.movementX * MOUSE_SENS;
    };
    const onLC = () => { lockedRef.current = document.pointerLockElement === cv; };

    window.addEventListener("keydown", onKD);
    window.addEventListener("keyup", onKU);
    cv.addEventListener("click", onClick);
    document.addEventListener("mousemove", onMM);
    document.addEventListener("pointerlockchange", onLC);

    let animId: number;

    const loop = () => {
      frame.current++;
      const f = frame.current;
      const cw = cv.width, ch = cv.height;
      const p = pRef.current;
      const enemies = enemRef.current;
      const pickups = pickRef.current;
      const tex = texRef.current;
      const parts = particles.current;

      if (gsRef.current === "playing") {
        const k = keys.current;
        const ca = Math.cos(p.angle), sa = Math.sin(p.angle);
        const sprint = k.has("shift") ? SPRINT_MULT : 1;
        let dx = 0, dy = 0;
        if (k.has("w") || k.has("arrowup"))    { dx += ca * WALK_SPD * sprint;   dy += sa * WALK_SPD * sprint; }
        if (k.has("s") || k.has("arrowdown"))  { dx -= ca * WALK_SPD * sprint;   dy -= sa * WALK_SPD * sprint; }
        if (k.has("a"))                         { dx += sa * STRAFE_SPD * sprint; dy -= ca * STRAFE_SPD * sprint; }
        if (k.has("d"))                         { dx -= sa * STRAFE_SPD * sprint; dy += ca * STRAFE_SPD * sprint; }
        if (k.has("arrowleft"))  p.angle -= KEY_ROT;
        if (k.has("arrowright")) p.angle += KEY_ROT;

        if (!isWall(p.x + dx + Math.sign(dx) * MARGIN, p.y)) p.x += dx;
        if (!isWall(p.x, p.y + dy + Math.sign(dy) * MARGIN)) p.y += dy;

        // Pickups
        for (const pk of pickups) {
          if (!pk.active) continue;
          if (Math.hypot(pk.x - p.x, pk.y - p.y) < 28) {
            pk.active = false;
            if (pk.type === "health") hpRef.current = Math.min(MAX_HP, hpRef.current + 25);
            else scoreRef.current += 200;
          }
        }

        // Combo decay
        if (comboTimer.current > 0) {
          comboTimer.current--;
          if (comboTimer.current <= 0) comboRef.current = 0;
        }

        // Shooting
        if (shootRef.current) {
          shootRef.current = false; shootAnim.current = 6;
          const sorted = enemies.filter(e => e.alive).map(e => {
            const ex = e.x - p.x, ey = e.y - p.y;
            let a = Math.atan2(ey, ex) - p.angle;
            while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2;
            return { enemy: e, dist: Math.hypot(ex, ey), angle: a };
          }).filter(e => Math.abs(e.angle) < 0.15).sort((a, b) => a.dist - b.dist);

          if (sorted.length > 0) {
            const t = sorted[0], wall = castRay(p.x, p.y, p.angle);
            if (t.dist < wall.dist) {
              t.enemy.hp -= DMG_BULLET; t.enemy.hitFlash = 8;
              if (t.enemy.hp <= 0) {
                t.enemy.alive = false; killsRef.current++;
                comboRef.current++; comboTimer.current = 90;
                const bonus = comboRef.current > 1 ? comboRef.current * 50 : 0;
                scoreRef.current += (t.enemy.type === "sentinel" ? 150 : 100) + bonus;
                // Death particles
                for (let i = 0; i < 12; i++) {
                  const a = Math.random() * Math.PI * 2;
                  const spd = 0.5 + Math.random() * 2;
                  parts.push({
                    x: t.enemy.x, y: t.enemy.y,
                    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                    life: 30 + Math.random() * 20,
                    color: t.enemy.type === "sentinel" ? "#ff4757" : "#00ffaa",
                  });
                }
                if (killsRef.current >= SPAWN_ENEMIES.length) {
                  setGameState("win"); gsRef.current = "win"; document.exitPointerLock();
                }
              }
            }
          }
        }

        // Enemy AI
        const now = Date.now();
        for (const e of enemies) {
          if (!e.alive) continue;
          if (e.hitFlash > 0) e.hitFlash--;
          const ex = p.x - e.x, ey = p.y - e.y, dist = Math.hypot(ex, ey);
          if (dist > TILE * 1.2) {
            const nx = e.x + (ex / dist) * e.speed, ny = e.y + (ey / dist) * e.speed;
            if (!isWall(nx, ny)) { e.x = nx; e.y = ny; }
          }
          if (dist < e.range && now - e.lastShot > e.interval) {
            const wall = castRay(e.x, e.y, Math.atan2(ey, ex));
            if (wall.dist > dist) {
              e.lastShot = now;
              hpRef.current = Math.max(0, hpRef.current - e.damage);
              dmgFlash.current = 6; shakeRef.current = 4;
              if (hpRef.current <= 0) {
                setGameState("dead"); gsRef.current = "dead"; document.exitPointerLock();
              }
            }
          }
        }
        if (dmgFlash.current > 0) dmgFlash.current--;
        if (shakeRef.current > 0) shakeRef.current--;
      }
      if (shootAnim.current > 0) shootAnim.current--;

      // Update particles
      for (let i = parts.length - 1; i >= 0; i--) {
        parts[i].x += parts[i].vx; parts[i].y += parts[i].vy; parts[i].life--;
        if (parts[i].life <= 0) parts.splice(i, 1);
      }

      // ── Render ──
      const shake = shakeRef.current > 0 ? (Math.random() - 0.5) * 4 : 0;
      ctx.save();
      if (shake) ctx.translate(shake, shake * 0.5);

      const skyG = ctx.createLinearGradient(0, 0, 0, ch / 2);
      skyG.addColorStop(0, "#050510"); skyG.addColorStop(1, "#0a0a20");
      ctx.fillStyle = skyG; ctx.fillRect(0, 0, cw, ch / 2);
      const flG = ctx.createLinearGradient(0, ch / 2, 0, ch);
      flG.addColorStop(0, "#0a0a18"); flG.addColorStop(1, "#1a1a30");
      ctx.fillStyle = flG; ctx.fillRect(0, ch / 2, cw, ch / 2);

      // Walls
      const numRays = Math.ceil(cw / 2);
      const wallZ = new Float32Array(cw).fill(MAX_DEPTH);
      for (let i = 0; i < numRays; i++) {
        const ra = p.angle - HALF_FOV + (i / numRays) * FOV;
        const hit = castRay(p.x, p.y, ra);
        const cd = hit.dist * Math.cos(ra - p.angle);
        const sx = Math.floor((i / numRays) * cw);
        const colW = Math.ceil(cw / numRays) + 1;
        for (let d = 0; d < colW && sx + d < cw; d++) wallZ[sx + d] = cd;
        const wH = Math.min((TILE * ch * 0.8) / cd, ch);
        const wTop = (ch - wH) / 2;
        if (tex.length > hit.mapVal && tex[hit.mapVal]) {
          ctx.drawImage(tex[hit.mapVal], hit.texCol, 0, 1, TEX, sx, wTop, colW, wH);
          const shade = Math.max(0.05, 1 - cd / MAX_DEPTH) * (hit.wallType === "v" ? 0.7 : 1);
          ctx.fillStyle = `rgba(0,0,0,${1 - shade})`;
          ctx.fillRect(sx, wTop, colW, wH);
        }
      }

      // Pickups (billboard)
      for (const pk of pickups) {
        if (!pk.active) continue;
        const dx2 = pk.x - p.x, dy2 = pk.y - p.y;
        const dist = Math.hypot(dx2, dy2);
        let a = Math.atan2(dy2, dx2) - p.angle;
        while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2;
        if (Math.abs(a) > HALF_FOV + 0.2) continue;
        const cd = dist * Math.cos(a);
        if (cd < 5) continue;
        const sX = cw / 2 + (a / HALF_FOV) * (cw / 2);
        const ri = Math.floor(sX);
        if (ri >= 0 && ri < cw && wallZ[ri] < dist) continue;
        const sz = Math.min((TILE * ch * 0.25) / cd, ch * 0.3);
        const sY = ch / 2 + sz * 0.3 + Math.sin(f * 0.06) * sz * 0.1;
        ctx.globalAlpha = 0.7 + Math.sin(f * 0.08) * 0.2;
        ctx.fillStyle = pk.type === "health" ? "#00ff66" : "#ffcc00";
        // Cross / diamond shape
        if (pk.type === "health") {
          ctx.fillRect(sX - sz * 0.06, sY - sz * 0.2, sz * 0.12, sz * 0.4);
          ctx.fillRect(sX - sz * 0.2, sY - sz * 0.06, sz * 0.4, sz * 0.12);
        } else {
          ctx.beginPath();
          ctx.moveTo(sX, sY - sz * 0.2); ctx.lineTo(sX + sz * 0.15, sY);
          ctx.lineTo(sX, sY + sz * 0.2); ctx.lineTo(sX - sz * 0.15, sY);
          ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Enemies
      const renders = enemies.filter(e => e.alive).map(e => {
        const dx2 = e.x - p.x, dy2 = e.y - p.y;
        let a = Math.atan2(dy2, dx2) - p.angle;
        while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2;
        return { ...e, dist: Math.hypot(dx2, dy2), sa: a };
      }).filter(e => Math.abs(e.sa) < HALF_FOV + 0.3).sort((a, b) => b.dist - a.dist);

      for (const e of renders) {
        const cd = e.dist * Math.cos(e.sa);
        if (cd < 5) continue;
        const sH = Math.min((TILE * ch * 0.65) / cd, ch * 0.85);
        const sX = cw / 2 + (e.sa / HALF_FOV) * (cw / 2);
        const sTop = (ch - sH) / 2 + sH * 0.05;
        const ri = Math.floor(sX);
        if (ri >= 0 && ri < cw && wallZ[ri] < e.dist) continue;
        drawVirus(ctx, sX, sTop, sH, e.hitFlash > 0, f, e.type);
        if (e.hp < e.maxHp) {
          const bw = sH * 0.35;
          ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(sX - bw / 2 - 1, sTop - 9, bw + 2, 6);
          ctx.fillStyle = e.type === "sentinel" ? "#ff4757" : "#00ffaa";
          ctx.fillRect(sX - bw / 2, sTop - 8, bw * (e.hp / e.maxHp), 4);
        }
      }

      // Damage flash
      if (dmgFlash.current > 0) {
        ctx.fillStyle = `rgba(255,0,30,${dmgFlash.current * 0.08})`;
        ctx.fillRect(0, 0, cw, ch);
      }

      // Weapon
      const moving = keys.current.has("w") || keys.current.has("s") || keys.current.has("a") || keys.current.has("d");
      const bobSpd = keys.current.has("shift") ? 0.18 : 0.12;
      drawGun(ctx, cw, ch, moving ? Math.sin(f * bobSpd) * 5 : 0, shootAnim.current > 3, f);

      // Crosshair
      ctx.strokeStyle = "rgba(0,255,170,0.6)"; ctx.lineWidth = 1;
      const cx = cw / 2, cy = ch / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy); ctx.lineTo(cx - 4, cy);
      ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 12, cy);
      ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy - 4);
      ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,255,170,0.4)"; ctx.fillRect(cx - 1, cy - 1, 2, 2);

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, ch - 40, cw, 40);
      ctx.fillStyle = "rgba(0,255,170,0.1)"; ctx.fillRect(0, ch - 40, cw, 1);
      ctx.font = "bold 12px 'JetBrains Mono',monospace";
      const hpC = hpRef.current > 60 ? "#00ff99" : hpRef.current > 30 ? "#ffaa00" : "#ff3344";
      ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(12, ch - 30, 120, 5);
      ctx.fillStyle = hpC; ctx.fillRect(12, ch - 30, 120 * (hpRef.current / 100), 5);
      ctx.fillText(`INTEGRITY ${hpRef.current}%`, 12, ch - 10);
      ctx.fillStyle = "#00ccff"; ctx.fillText(`PURGED ${killsRef.current}/${SPAWN_ENEMIES.length}`, cw / 2 - 80, ch - 10);
      ctx.fillStyle = "#ffcc00"; ctx.fillText(`SCORE ${scoreRef.current}`, cw - 140, ch - 10);

      // Combo indicator
      if (comboRef.current > 1) {
        ctx.font = "bold 18px 'VT323',monospace";
        ctx.fillStyle = `rgba(255,204,0,${Math.min(1, comboTimer.current / 30)})`;
        ctx.textAlign = "center";
        ctx.fillText(`${comboRef.current}x COMBO`, cw / 2, 50);
        ctx.textAlign = "left";
      }

      // Sprint indicator
      if (keys.current.has("shift") && gsRef.current === "playing") {
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.fillStyle = "rgba(255,200,0,0.5)"; ctx.fillText("» SPRINT", 12, ch - 45);
      }

      drawMinimap(ctx, p.x, p.y, p.angle, enemies, pickups, cw);

      // CRT scanlines
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      for (let y = 0; y < ch; y += 3) ctx.fillRect(0, y, cw, 1);
      // Vignette
      const vigG = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.3, cw / 2, ch / 2, ch * 0.8);
      vigG.addColorStop(0, "transparent"); vigG.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = vigG; ctx.fillRect(0, 0, cw, ch);

      ctx.restore();

      // Overlays
      if (gsRef.current !== "playing") {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = "rgba(0,255,170,0.02)";
        for (let y = 0; y < ch; y += 3) ctx.fillRect(0, y, cw, 1);
        ctx.textAlign = "center";

        if (gsRef.current === "menu") {
          ctx.font = "bold 42px 'JetBrains Mono',monospace";
          ctx.fillStyle = "#00ffaa"; ctx.fillText("SYSTEM BREACH", cw / 2, ch / 2 - 80);
          ctx.font = "11px 'JetBrains Mono',monospace";
          ctx.fillStyle = "#445"; ctx.fillText("// COKTECH HIDDEN PROTOCOL — EASTER EGG ACTIVATED", cw / 2, ch / 2 - 45);
          ctx.fillStyle = "#778"; ctx.font = "12px 'JetBrains Mono',monospace";
          ctx.fillText("WASD = Move & Strafe | Mouse = Look | Click = Shoot", cw / 2, ch / 2);
          ctx.fillText("Shift = Sprint | Arrow keys also work", cw / 2, ch / 2 + 20);
          ctx.font = "10px 'JetBrains Mono',monospace"; ctx.fillStyle = "#556";
          ctx.fillText("Green = Virus (weak) | Red = Sentinel (strong)", cw / 2, ch / 2 + 48);
          ctx.fillText("Pick up + for health | ◆ for bonus score", cw / 2, ch / 2 + 64);
          ctx.fillStyle = "#00ff99"; ctx.font = "bold 14px 'JetBrains Mono',monospace";
          ctx.fillText("[ CLICK TO INITIALIZE ]", cw / 2, ch / 2 + 100);
        } else if (gsRef.current === "dead") {
          ctx.fillStyle = "rgba(255,0,0,0.05)"; ctx.fillRect(0, 0, cw, ch);
          ctx.font = "bold 48px 'JetBrains Mono',monospace";
          ctx.fillStyle = "#ff2244"; ctx.fillText("PROCESS KILLED", cw / 2, ch / 2 - 50);
          ctx.font = "14px 'JetBrains Mono',monospace"; ctx.fillStyle = "#888";
          const elapsed = ((Date.now() - startTime.current) / 1000) | 0;
          ctx.fillText(`Eliminated: ${killsRef.current}/${SPAWN_ENEMIES.length}`, cw / 2, ch / 2);
          ctx.fillText(`Score: ${scoreRef.current}  |  Time: ${elapsed}s`, cw / 2, ch / 2 + 22);
          ctx.fillStyle = "#00ff99"; ctx.fillText("[ CLICK TO REBOOT ]", cw / 2, ch / 2 + 65);
        } else {
          ctx.fillStyle = "rgba(0,255,170,0.03)"; ctx.fillRect(0, 0, cw, ch);
          ctx.font = "bold 48px 'JetBrains Mono',monospace";
          ctx.fillStyle = "#00ff99"; ctx.fillText("SERVER PURGED", cw / 2, ch / 2 - 50);
          ctx.font = "14px 'JetBrains Mono',monospace"; ctx.fillStyle = "#888";
          const elapsed = ((Date.now() - startTime.current) / 1000) | 0;
          ctx.fillText(`Score: ${scoreRef.current}  |  Time: ${elapsed}s`, cw / 2, ch / 2);
          ctx.fillText("All corrupted processes eliminated.", cw / 2, ch / 2 + 22);
          ctx.fillStyle = "#00ccff"; ctx.fillText("[ CLICK TO REINITIALIZE ]", cw / 2, ch / 2 + 65);
        }
        ctx.textAlign = "left";
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKD); window.removeEventListener("keyup", onKU);
      cv.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onMM); document.removeEventListener("pointerlockchange", onLC);
      window.removeEventListener("resize", resize);
    };
  }, [reset]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        style={{ imageRendering: "pixelated", width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
