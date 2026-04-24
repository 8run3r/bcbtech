import { useEffect, useRef, useCallback, useState } from "react";

// ── Constants ──────────────────────────────────────────────
const TILE = 64;
const MAP_W = 16;
const MAP_H = 16;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const MOVE_SPEED = 3;
const ROT_SPEED = 0.045;
const MAX_DEPTH = 800;
const WEAPON_BOB_SPEED = 8;
const WEAPON_BOB_AMT = 6;
const ENEMY_RADIUS = 20;
const BULLET_DAMAGE = 34;
const PLAYER_MAX_HP = 100;
const ENEMY_SHOOT_RANGE = 400;
const ENEMY_DAMAGE = 8;
const ENEMY_SHOOT_INTERVAL = 1500;

// 1 = wall, 0 = empty, 2 = door
const MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,0,0,0,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,1,1,0,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface Enemy {
  x: number;
  y: number;
  hp: number;
  alive: boolean;
  lastShot: number;
  hitFlash: number;
}

const INITIAL_ENEMIES: Omit<Enemy, "lastShot" | "hitFlash">[] = [
  { x: 5 * TILE + 32, y: 3 * TILE + 32, hp: 100, alive: true },
  { x: 10 * TILE + 32, y: 5 * TILE + 32, hp: 100, alive: true },
  { x: 3 * TILE + 32, y: 10 * TILE + 32, hp: 100, alive: true },
  { x: 13 * TILE + 32, y: 8 * TILE + 32, hp: 100, alive: true },
  { x: 7 * TILE + 32, y: 13 * TILE + 32, hp: 100, alive: true },
  { x: 12 * TILE + 32, y: 12 * TILE + 32, hp: 100, alive: true },
  { x: 2 * TILE + 32, y: 6 * TILE + 32, hp: 100, alive: true },
  { x: 9 * TILE + 32, y: 2 * TILE + 32, hp: 100, alive: true },
];

function isWall(x: number, y: number): boolean {
  const mx = Math.floor(x / TILE);
  const my = Math.floor(y / TILE);
  if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return true;
  return MAP[my][mx] === 1;
}

function castRay(px: number, py: number, angle: number): { dist: number; wallType: "v" | "h" } {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  // Horizontal intersections
  let hDist = MAX_DEPTH;
  {
    const up = sin < 0;
    const firstY = up ? Math.floor(py / TILE) * TILE - 0.001 : Math.floor(py / TILE) * TILE + TILE;
    const firstX = px + (firstY - py) / (sin || 0.0001) * cos;
    const stepY = up ? -TILE : TILE;
    const stepX = stepY / (sin || 0.0001) * cos;
    let rx = firstX, ry = firstY;
    for (let i = 0; i < 20; i++) {
      if (isWall(rx, ry)) {
        hDist = Math.sqrt((rx - px) ** 2 + (ry - py) ** 2);
        break;
      }
      rx += stepX;
      ry += stepY;
    }
  }
  // Vertical intersections
  let vDist = MAX_DEPTH;
  {
    const left = cos < 0;
    const firstX = left ? Math.floor(px / TILE) * TILE - 0.001 : Math.floor(px / TILE) * TILE + TILE;
    const firstY = py + (firstX - px) / (cos || 0.0001) * sin;
    const stepX = left ? -TILE : TILE;
    const stepY = stepX / (cos || 0.0001) * sin;
    let rx = firstX, ry = firstY;
    for (let i = 0; i < 20; i++) {
      if (isWall(rx, ry)) {
        vDist = Math.sqrt((rx - px) ** 2 + (ry - py) ** 2);
        break;
      }
      rx += stepX;
      ry += stepY;
    }
  }
  return vDist < hDist ? { dist: vDist, wallType: "v" } : { dist: hDist, wallType: "h" };
}

// ── Draw soldier sprite on a small offscreen canvas ──
function drawSoldierSprite(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, flash: boolean) {
  const w = h * 0.5;
  const cx = x;
  const baseY = y + h;

  // Body - white/blue uniform
  ctx.fillStyle = flash ? "#ff4444" : "#dde4f0";
  ctx.fillRect(cx - w * 0.25, y + h * 0.25, w * 0.5, h * 0.45);

  // Blue stripes on uniform
  ctx.fillStyle = flash ? "#ff6666" : "#3366aa";
  ctx.fillRect(cx - w * 0.25, y + h * 0.3, w * 0.5, h * 0.06);
  ctx.fillRect(cx - w * 0.25, y + h * 0.5, w * 0.5, h * 0.06);

  // Shoulders / epaulettes
  ctx.fillStyle = flash ? "#ff6666" : "#4477bb";
  ctx.fillRect(cx - w * 0.35, y + h * 0.25, w * 0.15, h * 0.1);
  ctx.fillRect(cx + w * 0.2, y + h * 0.25, w * 0.15, h * 0.1);

  // Belt
  ctx.fillStyle = flash ? "#aa2222" : "#222";
  ctx.fillRect(cx - w * 0.25, y + h * 0.6, w * 0.5, h * 0.04);

  // Head
  ctx.fillStyle = flash ? "#ff8888" : "#f0d0b0";
  const headR = w * 0.2;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.15, headR, 0, Math.PI * 2);
  ctx.fill();

  // Long nose - distinctive feature
  ctx.fillStyle = flash ? "#ff9999" : "#e8c0a0";
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.6, y + h * 0.13);
  ctx.lineTo(cx + headR * 1.8, y + h * 0.18);
  ctx.lineTo(cx + headR * 0.6, y + h * 0.22);
  ctx.closePath();
  ctx.fill();

  // Eyes - menacing
  ctx.fillStyle = flash ? "#ff0000" : "#220000";
  ctx.fillRect(cx - headR * 0.4, y + h * 0.11, headR * 0.25, headR * 0.2);
  ctx.fillRect(cx + headR * 0.15, y + h * 0.11, headR * 0.25, headR * 0.2);

  // Helmet / cap - blue
  ctx.fillStyle = flash ? "#cc3333" : "#2255aa";
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.07, headR * 1.15, headR * 0.6, 0, Math.PI, 0);
  ctx.fill();

  // Legs
  ctx.fillStyle = flash ? "#992222" : "#1a1a2e";
  ctx.fillRect(cx - w * 0.18, y + h * 0.7, w * 0.15, h * 0.3);
  ctx.fillRect(cx + w * 0.03, y + h * 0.7, w * 0.15, h * 0.3);

  // Boots
  ctx.fillStyle = flash ? "#661111" : "#111";
  ctx.fillRect(cx - w * 0.2, baseY - h * 0.06, w * 0.2, h * 0.06);
  ctx.fillRect(cx + w * 0.01, baseY - h * 0.06, w * 0.2, h * 0.06);

  // Arms
  ctx.fillStyle = flash ? "#ff4444" : "#dde4f0";
  ctx.fillRect(cx - w * 0.38, y + h * 0.3, w * 0.12, h * 0.3);
  ctx.fillRect(cx + w * 0.26, y + h * 0.3, w * 0.12, h * 0.3);
}

function drawWeapon(ctx: CanvasRenderingContext2D, cw: number, ch: number, bob: number, shooting: boolean) {
  const bx = cw / 2;
  const by = ch - 10 + bob;

  // Gun body
  ctx.fillStyle = shooting ? "#ffcc00" : "#444";
  ctx.fillRect(bx - 15, by - 80, 30, 80);

  // Barrel
  ctx.fillStyle = shooting ? "#ffaa00" : "#333";
  ctx.fillRect(bx - 6, by - 120, 12, 45);

  // Grip
  ctx.fillStyle = "#222";
  ctx.fillRect(bx - 10, by - 15, 20, 25);

  // Muzzle flash
  if (shooting) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(bx, by - 125, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(bx, by - 125, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Main Component ──────────────────────────────────────
export default function DoomGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "dead" | "win">("menu");
  const [kills, setKills] = useState(0);
  const [hp, setHp] = useState(PLAYER_MAX_HP);

  const playerRef = useRef({ x: 1.5 * TILE, y: 1.5 * TILE, angle: 0 });
  const enemiesRef = useRef<Enemy[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const shootRef = useRef(false);
  const shootAnimRef = useRef(0);
  const frameRef = useRef(0);
  const hpRef = useRef(PLAYER_MAX_HP);
  const killsRef = useRef(0);
  const gameStateRef = useRef<"menu" | "playing" | "dead" | "win">("menu");
  const damageFlashRef = useRef(0);

  const resetGame = useCallback(() => {
    playerRef.current = { x: 1.5 * TILE, y: 1.5 * TILE, angle: 0 };
    enemiesRef.current = INITIAL_ENEMIES.map(e => ({ ...e, lastShot: 0, hitFlash: 0 }));
    hpRef.current = PLAYER_MAX_HP;
    killsRef.current = 0;
    damageFlashRef.current = 0;
    setHp(PLAYER_MAX_HP);
    setKills(0);
    setGameState("playing");
    gameStateRef.current = "playing";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const key = e.key.toLowerCase();
      if (down) keysRef.current.add(key);
      else keysRef.current.delete(key);

      if (key === " " && down && gameStateRef.current === "playing") {
        e.preventDefault();
        shootRef.current = true;
      }
      if ((key === "enter" || key === " ") && down && gameStateRef.current !== "playing") {
        resetGame();
      }
    };

    const handleClick = () => {
      if (gameStateRef.current === "playing") {
        shootRef.current = true;
      } else {
        resetGame();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", handleClick);

    let animId: number;
    let lastTime = 0;

    const loop = (time: number) => {
      const dt = Math.min(time - lastTime, 33);
      lastTime = time;
      frameRef.current++;

      const cw = canvas.width;
      const ch = canvas.height;
      const p = playerRef.current;
      const enemies = enemiesRef.current;

      if (gameStateRef.current === "playing") {
        // ── Input ──
        const keys = keysRef.current;
        let dx = 0, dy = 0;
        if (keys.has("w") || keys.has("arrowup")) {
          dx += Math.cos(p.angle) * MOVE_SPEED;
          dy += Math.sin(p.angle) * MOVE_SPEED;
        }
        if (keys.has("s") || keys.has("arrowdown")) {
          dx -= Math.cos(p.angle) * MOVE_SPEED;
          dy -= Math.sin(p.angle) * MOVE_SPEED;
        }
        if (keys.has("a") || keys.has("arrowleft")) p.angle -= ROT_SPEED;
        if (keys.has("d") || keys.has("arrowright")) p.angle += ROT_SPEED;

        // Collision
        const margin = 10;
        if (!isWall(p.x + dx * 3 + (dx > 0 ? margin : -margin), p.y)) p.x += dx;
        if (!isWall(p.x, p.y + dy * 3 + (dy > 0 ? margin : -margin))) p.y += dy;

        // ── Shooting ──
        if (shootRef.current) {
          shootRef.current = false;
          shootAnimRef.current = 6;

          // Check enemy hits - center screen ray
          const sortedEnemies = enemies
            .filter(e => e.alive)
            .map(e => {
              const edx = e.x - p.x;
              const edy = e.y - p.y;
              const dist = Math.sqrt(edx * edx + edy * edy);
              let angleToEnemy = Math.atan2(edy, edx) - p.angle;
              while (angleToEnemy > Math.PI) angleToEnemy -= Math.PI * 2;
              while (angleToEnemy < -Math.PI) angleToEnemy += Math.PI * 2;
              return { enemy: e, dist, angle: angleToEnemy };
            })
            .filter(e => Math.abs(e.angle) < 0.15)
            .sort((a, b) => a.dist - b.dist);

          if (sortedEnemies.length > 0) {
            const target = sortedEnemies[0];
            // Check wall not blocking
            const wallHit = castRay(p.x, p.y, p.angle);
            if (target.dist < wallHit.dist) {
              target.enemy.hp -= BULLET_DAMAGE;
              target.enemy.hitFlash = 8;
              if (target.enemy.hp <= 0) {
                target.enemy.alive = false;
                killsRef.current++;
                setKills(killsRef.current);
                if (killsRef.current >= INITIAL_ENEMIES.length) {
                  setGameState("win");
                  gameStateRef.current = "win";
                }
              }
            }
          }
        }

        // ── Enemy AI ──
        const now = Date.now();
        for (const e of enemies) {
          if (!e.alive) continue;
          if (e.hitFlash > 0) e.hitFlash--;

          const edx = p.x - e.x;
          const edy = p.y - e.y;
          const dist = Math.sqrt(edx * edx + edy * edy);

          // Move toward player
          if (dist > TILE * 1.5) {
            const speed = 1.2;
            const nx = e.x + (edx / dist) * speed;
            const ny = e.y + (edy / dist) * speed;
            if (!isWall(nx, ny)) {
              e.x = nx;
              e.y = ny;
            }
          }

          // Shoot at player
          if (dist < ENEMY_SHOOT_RANGE && now - e.lastShot > ENEMY_SHOOT_INTERVAL) {
            // Check line of sight
            const wallCheck = castRay(e.x, e.y, Math.atan2(edy, edx));
            if (wallCheck.dist > dist) {
              e.lastShot = now;
              hpRef.current = Math.max(0, hpRef.current - ENEMY_DAMAGE);
              damageFlashRef.current = 6;
              setHp(hpRef.current);
              if (hpRef.current <= 0) {
                setGameState("dead");
                gameStateRef.current = "dead";
              }
            }
          }
        }

        if (damageFlashRef.current > 0) damageFlashRef.current--;
      }

      if (shootAnimRef.current > 0) shootAnimRef.current--;

      // ── Render ──
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch / 2);
      skyGrad.addColorStop(0, "#0a0a1a");
      skyGrad.addColorStop(1, "#1a1a3a");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, ch / 2);

      // Floor
      const floorGrad = ctx.createLinearGradient(0, ch / 2, 0, ch);
      floorGrad.addColorStop(0, "#1a1a2a");
      floorGrad.addColorStop(1, "#333344");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, ch / 2, cw, ch / 2);

      // ── Raycasting walls ──
      const numRays = cw;
      const wallDepths: number[] = [];

      for (let i = 0; i < numRays; i++) {
        const rayAngle = playerRef.current.angle - HALF_FOV + (i / numRays) * FOV;
        const { dist, wallType } = castRay(playerRef.current.x, playerRef.current.y, rayAngle);
        const corrDist = dist * Math.cos(rayAngle - playerRef.current.angle);
        wallDepths.push(corrDist);

        const wallH = Math.min((TILE * ch * 0.8) / corrDist, ch);
        const wallTop = (ch - wallH) / 2;

        const shade = Math.max(0, 1 - corrDist / MAX_DEPTH);
        const base = wallType === "v" ? 40 : 55;
        const r = Math.floor(base * shade * 0.6);
        const g = Math.floor(base * shade * 0.7);
        const b = Math.floor((base + 40) * shade);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i, wallTop, 1, wallH);
      }

      // ── Render enemies (sprite-sorted) ──
      const enemyRenders = enemiesRef.current
        .filter(e => e.alive)
        .map(e => {
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let angle = Math.atan2(dy, dx) - p.angle;
          while (angle > Math.PI) angle -= Math.PI * 2;
          while (angle < -Math.PI) angle += Math.PI * 2;
          return { ...e, dist, screenAngle: angle };
        })
        .filter(e => Math.abs(e.screenAngle) < HALF_FOV + 0.2)
        .sort((a, b) => b.dist - a.dist);

      for (const e of enemyRenders) {
        const corrDist = e.dist * Math.cos(e.screenAngle);
        if (corrDist < 5) continue;
        const spriteH = Math.min((TILE * ch * 0.7) / corrDist, ch * 0.9);
        const screenX = cw / 2 + (e.screenAngle / HALF_FOV) * (cw / 2);
        const spriteTop = (ch - spriteH) / 2 + spriteH * 0.05;

        // Check if behind wall
        const rayIdx = Math.floor(screenX);
        if (rayIdx >= 0 && rayIdx < numRays && wallDepths[rayIdx] < e.dist) continue;

        const flash = e.hitFlash > 0;
        drawSoldierSprite(ctx, screenX, spriteTop, spriteH, flash);

        // HP bar
        if (e.hp < 100) {
          const barW = spriteH * 0.4;
          ctx.fillStyle = "#300";
          ctx.fillRect(screenX - barW / 2, spriteTop - 8, barW, 4);
          ctx.fillStyle = "#f33";
          ctx.fillRect(screenX - barW / 2, spriteTop - 8, barW * (e.hp / 100), 4);
        }
      }

      // ── Damage flash ──
      if (damageFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlashRef.current * 0.07})`;
        ctx.fillRect(0, 0, cw, ch);
      }

      // ── Weapon ──
      const bobPhase = Math.sin(frameRef.current * 0.08 * WEAPON_BOB_SPEED) * WEAPON_BOB_AMT;
      const isMoving = keysRef.current.has("w") || keysRef.current.has("s");
      drawWeapon(ctx, cw, ch, isMoving ? bobPhase : 0, shootAnimRef.current > 3);

      // ── Crosshair ──
      ctx.strokeStyle = "#0ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cw / 2 - 10, ch / 2);
      ctx.lineTo(cw / 2 + 10, ch / 2);
      ctx.moveTo(cw / 2, ch / 2 - 10);
      ctx.lineTo(cw / 2, ch / 2 + 10);
      ctx.stroke();

      // ── HUD ──
      ctx.font = "bold 20px 'JetBrains Mono', monospace";
      ctx.fillStyle = hpRef.current > 30 ? "#0f0" : "#f33";
      ctx.fillText(`HP: ${hpRef.current}`, 20, ch - 20);
      ctx.fillStyle = "#ff0";
      ctx.fillText(`KILLS: ${killsRef.current}/${INITIAL_ENEMIES.length}`, cw - 200, ch - 20);

      // ── Menu / Death / Win overlay ──
      if (gameStateRef.current !== "playing") {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, cw, ch);
        ctx.textAlign = "center";

        if (gameStateRef.current === "menu") {
          ctx.font = "bold 48px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#0ff";
          ctx.fillText("COK DOOM", cw / 2, ch / 2 - 60);
          ctx.font = "18px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#aaa";
          ctx.fillText("Destroy the long-nosed soldiers", cw / 2, ch / 2);
          ctx.fillText("WASD / Arrows = Move | Click / Space = Shoot", cw / 2, ch / 2 + 35);
          ctx.fillStyle = "#0f0";
          ctx.fillText("[ CLICK TO START ]", cw / 2, ch / 2 + 80);
        } else if (gameStateRef.current === "dead") {
          ctx.font = "bold 48px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#f33";
          ctx.fillText("YOU DIED", cw / 2, ch / 2 - 30);
          ctx.font = "18px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#aaa";
          ctx.fillText(`Kills: ${killsRef.current}/${INITIAL_ENEMIES.length}`, cw / 2, ch / 2 + 20);
          ctx.fillStyle = "#0f0";
          ctx.fillText("[ CLICK TO RETRY ]", cw / 2, ch / 2 + 60);
        } else if (gameStateRef.current === "win") {
          ctx.font = "bold 48px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#0f0";
          ctx.fillText("MISSION COMPLETE", cw / 2, ch / 2 - 30);
          ctx.font = "18px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#aaa";
          ctx.fillText("All hostiles eliminated.", cw / 2, ch / 2 + 20);
          ctx.fillStyle = "#0ff";
          ctx.fillText("[ CLICK TO PLAY AGAIN ]", cw / 2, ch / 2 + 60);
        }
        ctx.textAlign = "left";
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("click", handleClick);
    };
  }, [resetGame]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="border border-cyan-900/50 cursor-crosshair max-w-full"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-cyan-800 font-mono">
        WASD = Move | Space/Click = Shoot
      </div>
    </div>
  );
}
