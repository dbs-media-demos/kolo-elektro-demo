import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The hero: a real distribution board on a dark wall, built from primitives (no model files).
 * Breakers, copper combs, slotted ducts, neatly dressed IEC-colour wires and an open door with a
 * handwritten directory. A pendant lamp hangs in front of it and sways, so real shadows of the
 * wires move across the board. The pointer is the electrician's headlamp. Everything runs on one
 * switch: close the main breaker and the board comes up row by row, then the lamp strikes on.
 *
 * Desktop only: phones and tablets get stills rendered from this scene (scripts/capture-stills.mjs)
 * and never download three.js.
 *
 * Built so it never stutters: the build yields to the page between steps, warm() compiles every
 * shader asynchronously and draws one frame while the canvas is still hidden, and the first two
 * seconds on screen are timed. Under ~45 fps, one frame over 100 ms, or more than 2 ms of main-thread
 * work a frame (a weak CPU behind a good graphics card), it stops and calls onSlow.
 */

export type PanelSceneOptions = {
  /** The canvas's WebGL 2 context, already checked for a real graphics chip. */
  context?: WebGL2RenderingContext;
  onFirstFrame?: () => void;
  onPower?: (on: boolean) => void;
  /** Draw fixed "after power-up" or "before power-up" frames (fallback stills), no autoplay. */
  still?: "on" | "off";
  /** The first 2 s on screen ran too slowly for this machine: the loop has stopped for good. */
  onSlow?: () => void;
};

export type PanelScene = {
  /** Compile every shader (without blocking) and draw one frame while the canvas is still hidden. */
  warm(): Promise<void>;
  start(): void;
  stop(): void;
  setScroll(p: number): void;
  setPointer(x: number, y: number): void;
  hitMain(x: number, y: number): boolean;
  toggle(): void;
  resize(w: number, h: number): void;
  dispose(): void;
};

const MW = 0.21; // one DIN module
const ROW_Y = [0.86, 0, -0.86];
const W = 3.4;
const H = 3.1;
const D = 0.55;

/** Hand the main thread back to the page between build steps, so scrolling never waits for the board. */
const pause = () =>
  new Promise<void>((done) => {
    const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (s?.yield) void s.yield().then(done);
    else setTimeout(done, 0);
  });

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const tex = new THREE.CanvasTexture(cv);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function plasterBump() {
  const tex = canvasTexture(
    256,
    256,
    (c) => {
      const img = c.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 110 + Math.random() * 40;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      c.globalAlpha = 0.12;
      for (let i = 0; i < 90; i++) {
        c.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
        c.beginPath();
        c.ellipse(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 30, 3 + Math.random() * 10, Math.random() * 3, 0, 7);
        c.fill();
      }
    },
    false,
  );
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 5);
  return tex;
}

function directoryTexture() {
  const rows = ["F1  svetlo dnevna", "F2  svetlo spavaća", "F3  kuhinja – šporet", "F4  kuhinja – utičnice", "F5  kupatilo – bojler", "F6  veš mašina", "F7  klima dnevna", "F8  punjač garaža", "F9  dvorište"];
  return canvasTexture(512, 660, (c) => {
    c.fillStyle = "#e9e5d8";
    c.fillRect(0, 0, 512, 660);
    c.strokeStyle = "rgba(60,60,50,.35)";
    c.lineWidth = 2;
    for (let i = 0; i < 11; i++) {
      c.beginPath();
      c.moveTo(34, 96 + i * 52);
      c.lineTo(478, 96 + i * 52);
      c.stroke();
    }
    c.fillStyle = "#23241f";
    c.font = "500 26px ui-monospace, monospace";
    c.fillText("KOLO ELEKTRO", 34, 62);
    c.fillStyle = "#1c2a55";
    c.font = '600 40px "Segoe Print", "Bradley Hand", cursive';
    rows.forEach((r, i) => {
      c.save();
      c.translate(38, 138 + i * 52);
      c.rotate(-0.006 + (i % 3) * 0.004);
      c.fillText(r, 0, 0, 430);
      c.restore();
    });
  });
}

function printTexture() {
  return canvasTexture(128, 96, (c) => {
    c.fillStyle = "#e8e5da";
    c.fillRect(0, 0, 128, 96);
    c.fillStyle = "#2b2b27";
    c.font = "600 34px ui-sans-serif, Arial";
    c.fillText("C16", 28, 42);
    c.font = "500 15px ui-sans-serif, Arial";
    c.fillText("230/400V", 26, 66);
    c.fillText("6000", 44, 86);
  });
}

function earthTexture() {
  const tex = canvasTexture(64, 8, (c) => {
    c.fillStyle = "#5f8f3a";
    c.fillRect(0, 0, 64, 8);
    c.fillStyle = "#d9c334";
    c.fillRect(0, 0, 32, 8);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(7, 1);
  return tex;
}

function glowTexture() {
  return canvasTexture(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, "rgba(255,240,205,1)");
    g.addColorStop(0.18, "rgba(255,205,120,.55)");
    g.addColorStop(0.5, "rgba(255,170,60,.12)");
    g.addColorStop(1, "rgba(255,170,60,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
}

export async function createPanelScene(canvas: HTMLCanvasElement, opts: PanelSceneOptions): Promise<PanelScene> {
  await pause();
  // Without a context handed in, no real graphics chip (software rendering) throws here
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: opts.context,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: !opts.still,
    preserveDrawingBuffer: Boolean(opts.still),
  });
  renderer.setClearColor(0x070807);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pixelRatio);
  await pause();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  // ── Soft studio reflections for the copper and steel ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  {
    const env = new THREE.Scene();
    env.background = new THREE.Color(0x050505);
    const panel = (color: THREE.Color, w: number, h: number, p: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
      m.position.set(...p);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(new THREE.Color(9, 6.5, 3.6), 5, 4, [0, 6, 4]);
    panel(new THREE.Color(1.8, 2, 2.3), 4, 7, [-7, 0, 3]);
    panel(new THREE.Color(1.1, 0.8, 0.5), 8, 2, [4, -5, 5]);

    // PMREM compiles its shaders (the panels, the background, the blur) the moment it first draws,
    // which blocks the page. Compile them first without blocking, against a render target as PMREM
    // draws. The blur shader is only reachable through PMREM's internals (three r170); if those
    // change, it is simply compiled the old way inside fromScene.
    const pre = new THREE.Scene();
    const standIns: { dispose(): void }[] = [];
    env.children.forEach((m) => pre.add(new THREE.Mesh((m as THREE.Mesh).geometry, (m as THREE.Mesh).material)));
    const bgGeo = new THREE.BoxGeometry();
    const bgMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    pre.add(new THREE.Mesh(bgGeo, bgMat));
    standIns.push(bgGeo, bgMat);
    const inner = pmrem as unknown as { _setSize?: (n: number) => void; _allocateTargets?: () => THREE.WebGLRenderTarget; _blurMaterial?: THREE.Material | null };
    if (inner._setSize && inner._allocateTargets) {
      inner._setSize(256);
      inner._allocateTargets().dispose();
      if (inner._blurMaterial) {
        const g = new THREE.PlaneGeometry();
        pre.add(new THREE.Mesh(g, inner._blurMaterial));
        standIns.push(g);
      }
    }
    const target = new THREE.WebGLRenderTarget(1, 1);
    renderer.setRenderTarget(target);
    const compiled = renderer.compileAsync(pre, camera);
    renderer.setRenderTarget(null);
    await compiled;
    await pause();

    const rt = pmrem.fromScene(env, 0.05);
    scene.environment = keep(rt).texture;
    scene.environmentIntensity = 0.3;
    [target, ...standIns].forEach((d) => d.dispose());
    env.children.forEach((m) => {
      (m as THREE.Mesh).geometry.dispose();
      ((m as THREE.Mesh).material as THREE.Material).dispose();
    });
  }
  pmrem.dispose();
  await pause();

  // ── Materials ──
  const mat = {
    wall: keep(new THREE.MeshStandardMaterial({ color: 0x4b4e50, roughness: 0.94, bumpMap: keep(plasterBump()), bumpScale: 0.9 })),
    steel: keep(new THREE.MeshStandardMaterial({ color: 0x24251f, roughness: 0.55, metalness: 0.5 })),
    back: keep(new THREE.MeshStandardMaterial({ color: 0x2d2e29, roughness: 0.82, metalness: 0.1 })),
    rail: keep(new THREE.MeshStandardMaterial({ color: 0x9a9c97, roughness: 0.35, metalness: 0.9 })),
    plastic: keep(new THREE.MeshStandardMaterial({ color: 0xcfccc2, roughness: 0.52 })),
    lever: keep(new THREE.MeshStandardMaterial({ color: 0x141513, roughness: 0.42 })),
    amber: keep(new THREE.MeshStandardMaterial({ color: 0xffa914, roughness: 0.36, emissive: 0x3a2000 })),
    copper: keep(new THREE.MeshStandardMaterial({ color: 0xd98a52, roughness: 0.28, metalness: 1 })),
    brass: keep(new THREE.MeshStandardMaterial({ color: 0xc9a24f, roughness: 0.32, metalness: 1 })),
    duct: keep(new THREE.MeshStandardMaterial({ color: 0x3c3d38, roughness: 0.74 })),
    brown: keep(new THREE.MeshStandardMaterial({ color: 0x7a4422, roughness: 0.38 })),
    black: keep(new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.34 })),
    grey: keep(new THREE.MeshStandardMaterial({ color: 0x8b8c88, roughness: 0.4 })),
    blue: keep(new THREE.MeshStandardMaterial({ color: 0x1d62b8, roughness: 0.36 })),
    earth: keep(new THREE.MeshStandardMaterial({ map: keep(earthTexture()), roughness: 0.38 })),
    print: keep(new THREE.MeshStandardMaterial({ map: keep(printTexture()), roughness: 0.6 })),
    directory: keep(new THREE.MeshStandardMaterial({ map: keep(directoryTexture()), roughness: 0.82 })),
    lamp: keep(new THREE.MeshStandardMaterial({ color: 0x191a17, roughness: 0.42, metalness: 0.65, side: THREE.DoubleSide })),
    bulb: keep(new THREE.MeshBasicMaterial({ color: 0x4a4436, toneMapped: false })),
  };

  await pause();

  // ── The wall ──
  const wall = new THREE.Mesh(keep(new THREE.PlaneGeometry(44, 30)), mat.wall);
  wall.receiveShadow = true;
  scene.add(wall);

  // ── Enclosure ──
  const board = new THREE.Group();
  scene.add(board);
  const addBox = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, r = 0) => {
    const g = keep(r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d));
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    board.add(mesh);
    return mesh;
  };
  addBox(W, H, 0.04, 0, 0, 0.02, mat.back);
  const t = 0.05;
  addBox(W + t * 2, t, D, 0, H / 2 + t / 2, D / 2, mat.steel, 0.012);
  addBox(W + t * 2, t, D, 0, -H / 2 - t / 2, D / 2, mat.steel, 0.012);
  addBox(t, H, D, -W / 2 - t / 2, 0, D / 2, mat.steel, 0.012);
  addBox(t, H, D, W / 2 + t / 2, 0, D / 2, mat.steel, 0.012);

  // ── The door, standing open: its inside carries the handwritten directory ──
  const door = new THREE.Group();
  door.position.set(W / 2 + t, 0, D);
  door.rotation.y = 1.92;
  board.add(door);
  const leaf = new THREE.Mesh(keep(new RoundedBoxGeometry(W + 0.1, H + 0.1, 0.05, 2, 0.015)), mat.steel);
  leaf.position.x = -W / 2 - 0.05;
  leaf.castShadow = leaf.receiveShadow = true;
  door.add(leaf);
  const sheet = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.5, 1.94)), mat.directory);
  sheet.position.set(-0.98, 0.1, -0.03);
  sheet.rotation.set(0, Math.PI, 0.01);
  sheet.receiveShadow = true;
  door.add(sheet);

  await pause();

  // ── What goes on the rails ──
  type Unit = { x: number; row: number; w: number; kind: "main" | "rcd" | "mcb" };
  const units: Unit[] = [];
  const startX = (-13 * MW) / 2;
  let cursor = 0;
  const place = (row: number, kind: Unit["kind"], w: number) => {
    units.push({ x: startX + (cursor + w / 2) * MW, row, w, kind });
    cursor += w;
  };
  place(0, "main", 3);
  place(0, "rcd", 4);
  for (let i = 0; i < 6; i++) place(0, "mcb", 1);
  cursor = 0;
  for (let i = 0; i < 13; i++) place(1, "mcb", 1);
  cursor = 0;
  for (let i = 0; i < 13; i++) place(2, "mcb", 1);
  const N = units.length;

  const bodyGeo = keep(
    mergeGeometries([
      new RoundedBoxGeometry(0.203, 0.62, 0.17, 2, 0.012).translate(0, 0, 0.085),
      new RoundedBoxGeometry(0.203, 0.36, 0.11, 2, 0.012).translate(0, 0, 0.205),
    ])!,
  );
  const bodies = new THREE.InstancedMesh(bodyGeo, mat.plastic, N);
  bodies.castShadow = bodies.receiveShadow = true;
  const prints = new THREE.InstancedMesh(keep(new THREE.PlaneGeometry(0.15, 0.1)), mat.print, N);
  const leverGeo = keep(new RoundedBoxGeometry(0.11, 0.055, 0.14, 2, 0.012).translate(0, 0, 0.055));
  const levers = new THREE.InstancedMesh(leverGeo, mat.lever, N);
  levers.castShadow = true;
  const flagMat = keep(new THREE.MeshBasicMaterial({ toneMapped: false }));
  const flags = new THREE.InstancedMesh(keep(new THREE.PlaneGeometry(0.1, 0.03)), flagMat, N);
  const screws = new THREE.InstancedMesh(keep(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12).rotateX(Math.PI / 2)), mat.rail, N * 2);
  const dummy = new THREE.Object3D();
  const OFF = new THREE.Color(0x35352f);
  const ON = new THREE.Color(1, 0.62, 0.1);

  const leverPos = (u: Unit) => [u.x, ROW_Y[u.row] - 0.02, 0.26] as const;
  units.forEach((u, i) => {
    const y = ROW_Y[u.row];
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(u.x, y, 0.05);
    dummy.scale.set(u.w, 1, 1);
    dummy.updateMatrix();
    bodies.setMatrixAt(i, dummy.matrix);

    dummy.position.set(u.x - (u.w > 1 ? 0.14 * (u.w - 1) : 0), y - 0.115, 0.3115);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    prints.setMatrixAt(i, dummy.matrix);

    dummy.position.set(u.x, y + 0.122, 0.3115);
    dummy.scale.set(u.w > 1 ? 1.6 : 1, 1, 1);
    dummy.updateMatrix();
    flags.setMatrixAt(i, dummy.matrix);
    flags.setColorAt(i, OFF);

    dummy.scale.set(1, 1, 1);
    dummy.position.set(u.x, y + 0.245, 0.175);
    dummy.updateMatrix();
    screws.setMatrixAt(i * 2, dummy.matrix);
    dummy.position.set(u.x, y - 0.245, 0.175);
    dummy.updateMatrix();
    screws.setMatrixAt(i * 2 + 1, dummy.matrix);
  });
  board.add(bodies, prints, levers, flags, screws);

  // The main handle is amber and bigger: the one thing on the board to reach for
  const mainUnit = units[0];
  const mainHandle = new THREE.Mesh(keep(new RoundedBoxGeometry(0.46, 0.08, 0.19, 3, 0.02).translate(0, 0, 0.075)), mat.amber);
  mainHandle.castShadow = true;
  {
    const [x, y, z] = leverPos(mainUnit);
    mainHandle.position.set(x, y, z);
  }
  board.add(mainHandle);
  const rcdButton = new THREE.Mesh(keep(new RoundedBoxGeometry(0.09, 0.09, 0.03, 2, 0.01)), mat.amber);
  rcdButton.position.set(units[1].x + 0.3, ROW_Y[0] + 0.03, 0.315);
  board.add(rcdButton);
  const hit = new THREE.Mesh(keep(new THREE.BoxGeometry(0.75, 0.75, 0.5)), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(mainUnit.x, ROW_Y[0], 0.2);
  board.add(hit);

  // Rails, copper combs and slotted ducts
  ROW_Y.forEach((y, r) => {
    addBox(2.86, 0.12, 0.02, 0, y, 0.05, mat.rail);
    const comb = addBox(13 * MW - 0.05, 0.05, 0.03, 0, y - 0.345, 0.2, mat.copper, 0.008);
    comb.castShadow = true;
    addBox(2.98, 0.17, 0.2, 0, y + 0.43, 0.115, mat.duct, 0.008);
    if (r === 2) addBox(2.98, 0.17, 0.2, 0, y - 0.47, 0.115, mat.duct, 0.008);
  });
  // Copper tabs where the comb bites into each breaker
  const tabs = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.06, 0.09, 0.012)), mat.copper, N);
  units.forEach((u, i) => {
    dummy.position.set(u.x, ROW_Y[u.row] - 0.3, 0.195);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    tabs.setMatrixAt(i, dummy.matrix);
  });
  board.add(tabs);

  {
    // The slots along the ducts: the detail that reads as "someone careful built this"
    const count = 58;
    const teeth = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.018, 0.13, 0.012)), keep(new THREE.MeshStandardMaterial({ color: 0x141512, roughness: 0.9 })), count * 4);
    let k = 0;
    [ROW_Y[0] + 0.43, ROW_Y[1] + 0.43, ROW_Y[2] + 0.43, ROW_Y[2] - 0.47].forEach((y) => {
      for (let i = 0; i < count; i++) {
        dummy.position.set(-1.45 + (i / (count - 1)) * 2.9, y, 0.217);
        dummy.updateMatrix();
        teeth.setMatrixAt(k++, dummy.matrix);
      }
    });
    board.add(teeth);
  }

  // Brass neutral and earth bars at the sides
  const addBar = (x: number, y: number) => {
    addBox(0.08, 0.84, 0.05, x, y, 0.09, mat.brass, 0.008);
    const pins = new THREE.InstancedMesh(keep(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10).rotateX(Math.PI / 2)), mat.rail, 8);
    for (let i = 0; i < 8; i++) {
      dummy.position.set(x, y - 0.37 + i * 0.106, 0.122);
      dummy.updateMatrix();
      pins.setMatrixAt(i, dummy.matrix);
    }
    board.add(pins);
  };
  addBar(-1.56, -0.42);
  addBar(1.56, -0.42);

  await pause();

  // ── Wires ──
  const wires: Record<"brown" | "black" | "grey" | "blue" | "earth", THREE.BufferGeometry[]> = { brown: [], black: [], grey: [], blue: [], earth: [] };
  const pulseGeos: THREE.BufferGeometry[] = [];
  const radial = 7;
  const addWire = (color: keyof typeof wires, pts: [number, number, number][], radius: number, opt?: { pulse?: boolean; seg?: number }) => {
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(...p)),
      false,
      "catmullrom",
      0.35,
    );
    const seg = opt?.seg ?? 22;
    wires[color].push(new THREE.TubeGeometry(curve, seg, radius, radial, false));
    if (opt?.pulse) {
      const g = new THREE.TubeGeometry(curve, seg * 2, radius * 1.08, 5, false);
      const offset = new Float32Array(g.attributes.position.count).fill(Math.random());
      g.setAttribute("aOffset", new THREE.BufferAttribute(offset, 1));
      pulseGeos.push(g);
    }
  };

  const phase: (keyof typeof wires)[] = ["brown", "black", "grey"];
  units.forEach((u, i) => {
    if (u.kind === "main") return;
    const y = ROW_Y[u.row];
    const color = phase[i % 3];
    const top = y + 0.245;
    addWire(
      color,
      [
        [u.x, top, 0.185],
        [u.x, top + 0.04, 0.245],
        [u.x, top + 0.09, 0.27],
        [u.x, y + 0.36, 0.25],
        [u.x, y + 0.39, 0.19],
      ],
      0.0135,
      { pulse: i % 4 === 0 },
    );
  });
  // Neutrals and earths run down the sides, combed parallel, into their brass bars
  for (let i = 0; i < 7; i++) {
    const x = 1.515 + i * 0.027;
    const barY = -0.05 - i * 0.106;
    for (const side of [1, -1]) {
      addWire(side > 0 ? "blue" : "earth", [
        [side * 1.49, ROW_Y[0] + 0.43, 0.13],
        [side * x, ROW_Y[0] + 0.33, 0.15],
        [side * x, 0.3, 0.15],
        [side * x, barY + 0.14, 0.15],
        [side * 1.56, barY + 0.02, 0.135],
        [side * 1.56, barY, 0.12],
      ], 0.0125, { seg: 30 });
    }
  }
  await pause();
  // The heavy feed: comes through the top and lands in the main switch
  const feedColors: (keyof typeof wires)[] = ["brown", "black", "grey"];
  feedColors.forEach((c, i) => {
    const x = mainUnit.x - MW + i * MW;
    addWire(
      c,
      [
        [x + 0.3, 1.6, 0.3],
        [x + 0.2, 1.5, 0.33],
        [x + 0.04, 1.36, 0.33],
        [x, 1.25, 0.28],
        [x, ROW_Y[0] + 0.25, 0.19],
      ],
      0.028,
      { pulse: true, seg: 26 },
    );
  });
  addWire(
    "blue",
    [
      [mainUnit.x + 0.62, 1.6, 0.3],
      [mainUnit.x + 0.58, 1.48, 0.34],
      [mainUnit.x + 0.5, 1.32, 0.3],
      [mainUnit.x + 0.5, 1.2, 0.2],
    ],
    0.028,
    { seg: 20 },
  );
  // Conduit and the supply cable above the enclosure, up the wall and out of frame
  addBox(0.62, 0.07, 0.24, mainUnit.x + 0.3, H / 2 + 0.085, 0.3, mat.duct, 0.01);
  const conduit = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.11, 0.11, 12, 16)), mat.duct);
  conduit.position.set(mainUnit.x + 0.3, H / 2 + 6.1, 0.2);
  conduit.castShadow = true;
  board.add(conduit);

  (Object.keys(wires) as (keyof typeof wires)[]).forEach((c) => {
    if (!wires[c].length) return;
    const merged = keep(mergeGeometries(wires[c])!);
    const m = new THREE.Mesh(merged, mat[c]);
    m.castShadow = true;
    m.receiveShadow = true;
    board.add(m);
    wires[c].forEach((g) => g.dispose());
  });

  // Light running along the live conductors
  const pulseMat = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uPower: { value: 0 } },
      vertexShader: "attribute float aOffset; varying float vA; uniform float uT; void main(){ float p = fract(uv.x - uT*0.55 + aOffset); vA = smoothstep(0.82,1.0,p); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "varying float vA; uniform float uPower; void main(){ gl_FragColor = vec4(vec3(1.0,0.72,0.28)*2.4, vA*uPower); }",
    }),
  );
  if (pulseGeos.length) {
    const g = keep(mergeGeometries(pulseGeos)!);
    board.add(new THREE.Mesh(g, pulseMat));
    pulseGeos.forEach((p) => p.dispose());
  }

  await pause();

  // ── The pendant ──
  const pivot = new THREE.Group();
  const LAMP = { x: -1.55, z: 2.7, top: 8.2, drop: 6.05 };
  pivot.position.set(LAMP.x, LAMP.top, LAMP.z);
  scene.add(pivot);
  const cord = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.014, 0.014, LAMP.drop, 6)), mat.black);
  cord.position.y = -LAMP.drop / 2;
  pivot.add(cord);
  const shadeProfile = [
    [0.05, 0.42],
    [0.09, 0.4],
    [0.16, 0.3],
    [0.34, 0.16],
    [0.5, 0.04],
    [0.56, -0.03],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shade = new THREE.Mesh(keep(new THREE.LatheGeometry(shadeProfile, 32)), mat.lamp);
  const lamp = new THREE.Group();
  lamp.position.y = -LAMP.drop - 0.38;
  lamp.add(shade);
  const shadeInner = keep(new THREE.MeshBasicMaterial({ color: 0x2a2420, side: THREE.BackSide, toneMapped: false }));
  const shadeIn = new THREE.Mesh(keep(new THREE.LatheGeometry(shadeProfile.map((p) => new THREE.Vector2(p.x * 0.985, p.y)), 32)), shadeInner);
  lamp.add(shadeIn);
  const bulb = new THREE.Mesh(keep(new THREE.SphereGeometry(0.12, 20, 16)), mat.bulb);
  bulb.position.y = 0.08;
  lamp.add(bulb);
  const glow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(glowTexture()), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })));
  glow.scale.setScalar(3.4);
  glow.position.y = 0.02;
  lamp.add(glow);
  pivot.add(lamp);

  const spot = new THREE.SpotLight(0xffd6a6, 0, 16, 0.82, 0.8, 1.5);
  spot.position.set(0, 0.05, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.setScalar(2048);
  spot.shadow.bias = -0.0012;
  spot.shadow.normalBias = 0.025;
  spot.shadow.radius = 5;
  spot.shadow.camera.near = 0.5;
  spot.shadow.camera.far = 12;
  lamp.add(spot);
  spot.target.position.set(0.55, -0.45, 0.2);
  scene.add(spot.target);

  // A soft cone of light hanging under the shade
  const coneMat = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uPower: { value: 0 } },
      vertexShader: "varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
      fragmentShader: "varying float vY; varying vec3 vN; varying vec3 vV; uniform float uPower; void main(){ float rim = pow(abs(dot(normalize(vN),normalize(vV))),1.6); float a = rim*pow(vY,1.5)*0.11*uPower; gl_FragColor = vec4(1.0,0.76,0.44,a); }",
    }),
  );
  const cone = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.5, 3.1, 4.6, 32, 1, true)), coneMat);
  cone.position.y = -2.3;
  lamp.add(cone);

  // ── Other light ──
  scene.add(new THREE.HemisphereLight(0x8fa3b8, 0x161411, 0.32));
  const headlamp = new THREE.SpotLight(0xdfe9ff, 26, 26, 0.17, 0.75, 1.3);
  headlamp.position.set(-4, 0.5, 11);
  scene.add(headlamp, headlamp.target);
  const inner = new THREE.PointLight(0xffb45c, 0, 5, 1.8);
  inner.position.set(0, 1.0, 0.95);
  board.add(inner);

  await pause();

  // ── Dust in the beam ──
  const dustCount = 140;
  const dustGeo = keep(new THREE.BufferGeometry());
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeed = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    const r = Math.random() * 2.1;
    const a = Math.random() * Math.PI * 2;
    dustPos[i * 3] = LAMP.x + Math.cos(a) * r;
    dustPos[i * 3 + 1] = -1.2 + Math.random() * 3.8;
    dustPos[i * 3 + 2] = LAMP.z - 0.8 + Math.sin(a) * r * 0.7;
    dustSeed[i] = Math.random() * 10;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 1));
  const dustMat = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uPower: { value: 0 }, uPx: { value: pixelRatio } },
      vertexShader:
        "attribute float aSeed; uniform float uT; uniform float uPx; varying float vA; void main(){ vec3 p = position; p.x += sin(uT*0.12+aSeed)*0.28; p.y += mod(uT*0.03+aSeed*0.3,0.6); p.z += cos(uT*0.09+aSeed*2.0)*0.2; vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = uPx*(14.0/-mv.z)*(0.6+fract(aSeed)); vA = 0.25+0.45*sin(uT*0.4+aSeed*6.0)*sin(uT*0.4+aSeed*6.0); }",
      fragmentShader: "varying float vA; uniform float uPower; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d)*vA*uPower; gl_FragColor = vec4(1.0,0.82,0.55,a); }",
    }),
  );
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ── Sparks, once, as the main closes ──
  const SPARKS = 54;
  const sparkGeo = keep(new THREE.BufferGeometry());
  const sparkPos = new Float32Array(SPARKS * 3);
  const sparkVel = new Float32Array(SPARKS * 3);
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = keep(new THREE.PointsMaterial({ color: new THREE.Color(2.6, 1.7, 0.7), size: 0.038, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  scene.add(sparks);
  let sparkLife = 0;
  const burst = () => {
    sparkLife = 1;
    for (let i = 0; i < SPARKS; i++) {
      sparkPos[i * 3] = mainUnit.x + (Math.random() - 0.5) * 0.3;
      sparkPos[i * 3 + 1] = ROW_Y[0] + 0.12;
      sparkPos[i * 3 + 2] = 0.42;
      sparkVel[i * 3] = (Math.random() - 0.5) * 3.4;
      sparkVel[i * 3 + 1] = Math.random() * 3.2 - 0.3;
      sparkVel[i * 3 + 2] = Math.random() * 2.6 + 0.4;
    }
  };

  // ── State ──
  const lever = new Float32Array(N); // 0 = off, 1 = on
  const leverWant = new Float32Array(N);
  const leverAt = new Float64Array(N);
  let levelDirty = true;
  let power = false;
  let lampLevel = 0;
  let lampOnAt = Infinity;
  let shake = 0;
  let scroll = 0;
  let scrollTarget = 0;
  let width = 1;
  let height = 1;
  let time = 0;
  const pointer = { x: 0.3, y: 0.1, tx: 0.3, ty: 0.1, seen: false };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const aimPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.3);
  const aim = new THREE.Vector3(0.6, 0, 0.3);
  const camFrom = new THREE.Vector3();
  const camTo = new THREE.Vector3();
  const lookFrom = new THREE.Vector3();
  const lookTo = new THREE.Vector3(mainUnit.x + 0.6, ROW_Y[0] - 0.1, 0.25);
  const look = new THREE.Vector3();

  const setPower = (on: boolean, instant = false) => {
    if (on === power && !instant) return;
    power = on;
    opts.onPower?.(on);
    const now = time;
    if (on) {
      leverAt[0] = now;
      leverWant[0] = 1;
      if (!instant) {
        burst();
        shake = 1;
      }
      for (let i = 1; i < N; i++) {
        leverAt[i] = now + (instant ? 0 : 0.22 + i * 0.032);
        leverWant[i] = 1;
      }
      lampOnAt = now + (instant ? 0 : 0.34 + N * 0.032);
    } else {
      leverAt[0] = now;
      leverWant[0] = 0;
      for (let i = 1; i < N; i++) {
        leverAt[i] = now + (instant ? 0 : 0.05 + (N - i) * 0.012);
        leverWant[i] = 0;
      }
      lampOnAt = Infinity;
      if (!instant) shake = 0.6;
    }
    levelDirty = true;
    if (instant) {
      lever.fill(on ? 1 : 0);
      lampLevel = on ? 1 : 0;
    }
  };

  /** The way an old lamp catches: two stutters and a settle. */
  const flicker = (s: number) => {
    if (s < 0) return 0;
    if (s < 0.06) return 0.75;
    if (s < 0.14) return 0.03;
    if (s < 0.2) return 0.45;
    if (s < 0.3) return 0.05;
    if (s < 0.52) return 0.25 + (s - 0.3) * 2.6;
    return Math.min(1, 0.82 + (s - 0.52) * 0.8);
  };

  const composeLevers = () => {
    let changed = false;
    for (let i = 0; i < N; i++) {
      if (time >= leverAt[i] && lever[i] !== leverWant[i]) {
        const dir = leverWant[i] > lever[i] ? 1 : -1;
        lever[i] = Math.min(1, Math.max(0, lever[i] + dir * 0.34));
        if (Math.abs(lever[i] - leverWant[i]) < 0.02) lever[i] = leverWant[i];
        changed = true;
      }
    }
    if (!changed && !levelDirty) return;
    levelDirty = false;
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const u = units[i];
      const [x, y, z] = leverPos(u);
      const angle = 0.55 - lever[i] * 1.1;
      if (u.kind === "main") {
        mainHandle.rotation.x = angle;
        dummy.position.set(0, -50, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.001);
      } else {
        dummy.position.set(x, y, z);
        dummy.rotation.set(angle, 0, 0);
        dummy.scale.set(u.w > 1 ? 1.8 : 1, 1, 1);
      }
      dummy.updateMatrix();
      levers.setMatrixAt(i, dummy.matrix);
      c.copy(OFF).lerp(ON, lever[i]);
      flags.setColorAt(i, c);
    }
    levers.instanceMatrix.needsUpdate = true;
    if (flags.instanceColor) flags.instanceColor.needsUpdate = true;
  };

  const frameCamera = (p: number) => {
    const aspect = width / height;
    const wide = aspect > 1.05;
    // Distance so the board keeps a similar presence on any screen
    const d = wide ? Math.min(13, 11.1 + Math.max(0, 1.5 - aspect) * 3.5) : Math.max(15, 8.8 / Math.max(aspect, 0.42));
    camFrom.set(wide ? -3.1 : -1.5, wide ? -0.5 : -0.3, d);
    camTo.set(lookTo.x - 0.75, lookTo.y + 0.05, wide ? 3.2 : 4.4);
    lookFrom.set(wide ? 0.35 : 0.2, wide ? 0.05 : 0.15, 0.2);
    const e = smooth(0, 1, p);
    camera.position.lerpVectors(camFrom, camTo, e);
    look.lerpVectors(lookFrom, lookTo, e);
    // Pointer parallax: small, so the depth reads without seasickness
    camera.position.x += (pointer.x - 0.1) * 0.34;
    camera.position.y += pointer.y * 0.2;
    if (shake > 0) {
      camera.position.x += Math.sin(time * 70) * 0.012 * shake;
      camera.position.y += Math.cos(time * 91) * 0.012 * shake;
    }
    camera.aspect = aspect;
    camera.lookAt(look);
    // Principal point shift: the board sits right of the headline, or above it on phones
    const fade = 1 - e;
    if (wide) camera.setViewOffset(width, height, -width * 0.17 * fade, 0, width, height);
    else camera.setViewOffset(width, height, 0, height * 0.23 * fade, width, height);
    camera.updateProjectionMatrix();
  };

  const update = (dt: number) => {
    time += dt;
    scroll += (scrollTarget - scroll) * Math.min(1, dt * 7);
    composeLevers();

    // Lamp
    let target = 0;
    if (time >= lampOnAt) target = flicker(time - lampOnAt);
    if (power && time >= lampOnAt && time - lampOnAt > 1.4) target = 1 + Math.sin(time * 37) * 0.006;
    lampLevel += (target - lampLevel) * Math.min(1, dt * (target > lampLevel ? 50 : 22));
    if (!power && lampOnAt === Infinity) lampLevel *= Math.max(0, 1 - dt * 22);
    const L = lampLevel;

    spot.intensity = 38 * L;
    glow.material.opacity = 0.95 * L;
    (bulb.material as THREE.MeshBasicMaterial).color.setRGB(0.29 + 2.3 * L, 0.26 + 1.7 * L, 0.21 + 0.85 * L);
    shadeInner.color.setRGB(0.16 + 1.1 * L, 0.14 + 0.7 * L, 0.12 + 0.34 * L);
    inner.intensity = 1.4 * L;
    coneMat.uniforms.uPower.value = L;
    dustMat.uniforms.uPower.value = L;
    dustMat.uniforms.uT.value = time;
    pulseMat.uniforms.uPower.value = L;
    pulseMat.uniforms.uT.value = time;
    mat.amber.emissive.setRGB(0.25 + 0.5 * L, 0.11 + 0.26 * L, 0.0);
    scene.environmentIntensity = 0.22 + 0.2 * L;
    renderer.toneMappingExposure = 1.05 - scroll * 0.12;

    // The pendant sways: a slow pendulum, nudged by the pointer and by the switch's knock
    const sx = Math.sin(time * 0.72) * 0.016 + (pointer.x - 0.2) * 0.012 + Math.sin(time * 3.1) * 0.004 * shake;
    const sz = Math.cos(time * 0.51) * 0.011;
    pivot.rotation.set(sz, 0, sx);

    // The headlamp follows the pointer; with no pointer it wanders over the board
    if (!pointer.seen) {
      pointer.tx = 0.28 + Math.sin(time * 0.31) * 0.34;
      pointer.ty = 0.05 + Math.sin(time * 0.47) * 0.24;
    }
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4.5);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4.5);
    frameCamera(scroll);
    if (pointer.seen) {
      ndc.set(pointer.x, pointer.y);
      ray.setFromCamera(ndc, camera);
      ray.ray.intersectPlane(aimPlane, aim);
    } else {
      aim.set(pointer.x * 3.2, pointer.y * 3, 0.3);
    }
    headlamp.target.position.lerp(aim, Math.min(1, dt * 7));
    headlamp.position.set(camera.position.x, camera.position.y + 0.5, camera.position.z);
    headlamp.intensity = (34 - L * 16) * (1 + camera.position.z * 0.04);

    if (shake > 0) shake = Math.max(0, shake - dt * 3.2);

    if (sparkLife > 0) {
      sparkLife -= dt * 1.25;
      for (let i = 0; i < SPARKS; i++) {
        sparkVel[i * 3 + 1] -= 8.5 * dt;
        sparkPos[i * 3] += sparkVel[i * 3] * dt;
        sparkPos[i * 3 + 1] += sparkVel[i * 3 + 1] * dt;
        sparkPos[i * 3 + 2] += sparkVel[i * 3 + 2] * dt;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkMat.opacity = Math.max(0, sparkLife);
    } else if (sparkMat.opacity !== 0) {
      sparkMat.opacity = 0;
    }
  };

  let bootTimer = 0;

  // ── Loop ──
  let raf = 0;
  let running = false;
  let last = 0;
  let firstFrame = false;
  let fresh = true; // the first frame after a start() carries the pause, not the machine's speed
  // The first 2 s on screen decide whether this machine keeps the live board (not when drawing stills)
  let watching = Boolean(opts.onSlow && !opts.still);
  let watchMs = 0;
  let watchFrames = 0;
  let watchCost = 0;

  const tick = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    const raw = now - last;
    last = now;
    const t0 = performance.now();
    update(dt);
    renderer.render(scene, camera);
    const cost = performance.now() - t0; // main-thread time; the GPU's share runs on its own
    if (!firstFrame) {
      firstFrame = true;
      opts.onFirstFrame?.();
      // The canvas fades in on the same dark board as the still; a beat later the main closes
      if (!opts.still) bootTimer = window.setTimeout(() => setPower(true), 900);
    }
    if (fresh) {
      fresh = false;
      return;
    }
    if (!watching) return;
    watchMs += raw;
    watchFrames++;
    watchCost += cost;
    const done = watchMs >= 2000;
    // Slow: under ~45 fps, one frame over 100 ms, or the board's own work over 2 ms a frame. A fast
    // graphics card can hold a high frame rate on a weak CPU, but then every scroll fights the board
    // for the main thread (0.4-0.7 ms here, 2.7-5.4 ms with Chrome's 4x CPU slowdown).
    if (raw > 100 || (done && ((watchFrames * 1000) / watchMs < 45 || watchCost / watchFrames > 2))) {
      watching = false;
      api.stop();
      opts.onSlow?.();
    } else if (done) watching = false;
  };

  const api: PanelScene = {
    async warm() {
      // Shader sources are built one material at a time, giving the page the main thread in between;
      // the GPU compiles them in parallel and compileAsync then waits for them without blocking
      const seen = new Set<string>();
      const parts: THREE.Object3D[] = [];
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (!m || o.children.length) return;
        const key = m.uuid + ((o as THREE.InstancedMesh).isInstancedMesh ? ":i" : "");
        if (seen.has(key)) return;
        seen.add(key);
        parts.push(o);
      });
      for (const o of parts) {
        renderer.compile(o, camera, scene);
        await pause();
      }
      await renderer.compileAsync(scene, camera);
      // The lamp's shadow pass draws with its own depth shaders. Compile those the same way, against a
      // render target like the shadow map, so the hidden frame below finds them ready too
      const rt = new THREE.WebGLRenderTarget(1, 1);
      const depthBox = new THREE.BoxGeometry();
      const depthMats = [0, 1].map(() => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.BackSide }));
      const depthScene = new THREE.Scene().add(new THREE.Mesh(depthBox, depthMats[0]), new THREE.InstancedMesh(depthBox, depthMats[1], 1));
      renderer.setRenderTarget(rt);
      const depthReady = renderer.compileAsync(depthScene, spot.shadow.camera, scene);
      renderer.setRenderTarget(null);
      await depthReady;
      await pause();
      // One frame while the canvas is still invisible: texture and buffer uploads and the first shadow pass
      update(0);
      renderer.render(scene, camera);
      // Only now: the shadow pass holds those programs, so freeing the stand-ins keeps them
      [rt, depthBox, ...depthMats].forEach((d) => d.dispose());
    },
    start() {
      if (running) return;
      running = true;
      fresh = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    setScroll(p) {
      scrollTarget = p;
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
      pointer.seen = true;
    },
    hitMain(x, y) {
      ndc.set(x, y);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(hit, false).length > 0;
    },
    toggle: () => setPower(!power),
    resize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      frameCamera(scroll);
    },
    dispose() {
      window.clearTimeout(bootTimer);
      api.stop();
      disposables.forEach((d) => d.dispose());
      scene.clear();
      renderer.dispose();
      // Hand the GPU memory back now, not whenever the garbage collector gets to it
      renderer.forceContextLoss();
    },
  };

  if (opts.still) {
    setPower(opts.still === "on", true);
    lampOnAt = opts.still === "on" ? -5 : Infinity;
    pointer.seen = true;
    pointer.tx = pointer.x = 0.4;
    pointer.ty = pointer.y = 0.12;
  } else {
    lampOnAt = Infinity;
  }

  return api;
}
