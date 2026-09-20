/* Dedicated high-detail art for the wounded green dragon in the north-field
   egg scene. Rows are normalized below into flight, impact, wounded,
   then its strained takeoff.  It is intentionally separate from Corin's dragon. */
const greenSceneImg = document.createElement("canvas");
const greenSceneSource = new Image();
greenSceneSource.src = EMBERFELL_ASSETS.a0839;
/* Each supplied pose is cropped and placed on this shared baseline at startup.
   That prevents transparent padding from making the crash slide across tiles. */
const GREEN_SCENE_CEL_W = 128, GREEN_SCENE_CEL_H = 112, GREEN_SCENE_DRAW = 96;
// The supplied sheet has 6 flight, 6 crash, 5 resting and 6 takeoff poses,
// with unequal spacing. Keep explicit source rectangles, not a guessed grid.
const GREEN_SCENE_RECTS = [
  [[0,0,256,225],[280,0,265,225],[566,0,223,225],[789,0,248,225],[1038,0,242,225],[1280,0,256,225]],
  [[0,231,193,220],[196,243,243,246],[439,293,265,240],[704,321,301,215],[1005,370,270,165],[1277,409,259,126]],
  [[0,539,285,178],[290,539,266,178],[558,539,303,178],[866,539,299,178],[1177,539,359,178]],
  [[0,838,283,163],[285,784,269,211],[483,733,352,268],[761,719,282,283],[974,733,299,229],[1286,720,250,226]]
];
// A few takeoff silhouettes interleave horizontally in the source sheet.
// Polygon crop boundaries exclude the neighboring pose without repainting it.
const GREEN_SCENE_MASKS = {
  '3:1': [[285,1000],[285,910],[329,876],[343,825],[381,782],[406,809],[417,882],[450,904],[484,917],[554,939],[554,1000]],
  '3:2': [[483,756],[757,733],[758,840],[767,899],[835,961],[835,1002],[551,1002],[552,938],[523,909],[483,893]],
  '3:3': [[780,719],[1043,719],[1043,748],[977,772],[953,821],[969,893],[993,935],[1043,981],[1043,1005],[827,1005],[827,952],[790,920],[761,877],[768,823]],
  '3:4': [[974,779],[1015,748],[1273,748],[1273,962],[1055,962],[1055,901],[1010,849]],
  '1:4': [[1005,450],[1060,409],[1190,364],[1275,364],[1275,535],[1005,535]]
};
async function prepareGreenScene() {
  await greenSceneSource.decode();
  const source = document.createElement("canvas");
  source.width = greenSceneSource.naturalWidth; source.height = greenSceneSource.naturalHeight;
  const g = source.getContext("2d", { willReadFrequently: true });
  g.drawImage(greenSceneSource, 0, 0);
  const pixels = g.getImageData(0, 0, source.width, source.height), rgba = pixels.data;
  // Runtime white-matte removal keeps the original JPEG embedded and avoids
  // white rectangles in the field. Feather only near-white neutral pixels.
  for (let i = 0; i < rgba.length; i += 4) {
    const lo = Math.min(rgba[i], rgba[i+1], rgba[i+2]);
    const hi = Math.max(rgba[i], rgba[i+1], rgba[i+2]);
    if (lo > 220 && hi - lo < 24) rgba[i+3] = Math.round(255 * Math.max(0, (247-lo)/27));
  }
  g.putImageData(pixels, 0, 0);
  greenSceneImg.width = GREEN_SCENE_CEL_W * 6;
  greenSceneImg.height = GREEN_SCENE_CEL_H * 4;
  const out = greenSceneImg.getContext("2d");
  out.imageSmoothingEnabled = true; out.imageSmoothingQuality = "high";
  for (let row = 0; row < GREEN_SCENE_RECTS.length; row++) {
    for (let frame = 0; frame < 6; frame++) {
      const rects = GREEN_SCENE_RECTS[row];
      const [x,y,w,h] = rects[Math.min(frame, rects.length-1)];
      const scale = .32, dw = w * scale, dh = h * scale;
      const dx = frame * GREEN_SCENE_CEL_W + (GREEN_SCENE_CEL_W-dw)/2;
      const dy = row * GREEN_SCENE_CEL_H + GREEN_SCENE_CEL_H - 6 - dh;
      out.save();
      const mask = GREEN_SCENE_MASKS[row + ':' + frame];
      if (mask) {
        out.beginPath();
        mask.forEach(([px,py], i) => out[i ? 'lineTo' : 'moveTo'](dx+(px-x)*scale,dy+(py-y)*scale));
        out.closePath(); out.clip();
      }
      out.drawImage(source, x,y,w,h, dx,dy,dw,dh);
      out.restore();
    }
  }
}
const faintDragonImg = new Image();
faintDragonImg.src = EMBERFELL_ASSETS.a0840;

let NAMES = [], TS = 16;   /* filled in once the world inflates */
const NAME2I = {};   /* filled once the world inflates */
const DEFS = {};

let MAPID = null, MD = null;   /* set at boot, after inflating */
let MW = 0, MH = 0, PXW = 0, PXH = 0;
let terr = null, solid = null, objs = [], npcs = [], ORIG = [];
let scat = [], sanm = [], decks = [];
const edits = {};
let SCENE_WALL = null, deckFix = null;
const GRASS = 0, DIRT = 1, COBBLE = 2, FARM = 3, WATER = 4, BRIDGE = 5, WALL = 6, PAVING2 = 8, MARBLE = 9, TERRACE = 10,
      SAND = 11,
      ROADSAND = 12,
      DWATER = 13,
      SEA = 14,
      DECK = 15,
      VROCK = 16, VCRACK = 17, VLAVA = 18, VSTONE = 19;

function refusesTrunk(t) {
  return t === ROADSAND || t === DIRT || t === COBBLE || t === PAVING2 ||
         t === VLAVA || t === VROCK || t === VCRACK || t === VSTONE;
}
const T = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? WALL : terr[y * MW + x];
const cliffAt = (x, y) => !!(rockTiles && rockTiles.has(x + "," + y));
const openTo = (i) => {
  if (!baseTerr) return GRASS;
  if (cliffAt(i % MW, (i / MW) | 0)) return WALL;
  if (baseTerr[i] === SAND) return SAND;
  if (baseTerr[i] === ROADSAND) return ROADSAND;
  const x0 = i % MW, y0 = (i / MW) | 0;
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      const a = x0 + dx, b = y0 + dy;
      if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
      const j = b * MW + a;
      if (baseTerr[j] === ROADSAND) return ROADSAND;
      if (baseTerr[j] === SAND) return SAND;
      if (baseTerr[j] === GRASS) return GRASS;
    }
  return GRASS;
};
let nextId = 0, added = [], deleted = new Set();

function decodeRLE(rle, n) {
  const out = new Uint8Array(n);
  let i = 0;
  for (const part of rle.split("|")) {
    const sp = part.split("."), v = +sp[0], c = +sp[1];
    for (let k = 0; k < c; k++) out[i++] = v;
  }
  if (i !== n) throw new Error("RLE length " + i + " != " + n);
  return out;
}

function loadMap(id, fresh) {
  if(W.maps[id]?.templeLegacy)id=typeof W.maps[id].templeLegacy==='string'?W.maps[id].templeLegacy:'tp1';
  fishing = null;
  pendingActorStage = null;
  brambleMap="";
  doorMotion = null;
  if (!W.maps[id]) throw new Error("no such map: " + id);
  if (trial) stopTrial("");
  if (wonAll) lastFight = 0;
  if (MD && !fresh) {
    edits[MAPID] = { objs, added, deleted, nextId, painted, undoStack };
  }
  if (fresh) delete edits[id];
  blockTiles = []; lineTiles = new Set(); rockTiles = new Set();
  MAPID = id; MD = W.maps[id];
  applyActorLayout(MD,id);
  MW = MD.w; MH = MD.h; PXW = MW * TS; PXH = MH * TS;
  if (!camFree && mode === "play") cam.z = playZoom();

  terr = new Uint8Array(MW * MH);
  let i = 0;
  for (const part of MD.terr.split("|")) {
    const sp = part.split("."), v = +sp[0], n = +sp[1];
    for (let k = 0; k < n; k++) terr[i++] = v;
  }
  if (i !== MW * MH) throw new Error("terrain RLE length " + i + " != " + MW * MH);
  SCENE_WALL = null;
  if (MD.scenes) {
    SCENE_WALL = new Set();
    for (const sc of MD.scenes)
      for (let r = 0; r < sc.col.length; r++)
        for (let c = 0; c < sc.col[r].length; c++)
          if (sc.col[r][c] === "#") {
            const sx2 = sc.x0 + c, sy2 = sc.y0 + r;
            if (sx2 >= 0 && sy2 >= 0 && sx2 < MW && sy2 < MH) {
              SCENE_WALL.add(sy2 * MW + sx2);
              terr[sy2 * MW + sx2] = WALL;
            }
          }
  }
  terrOrig = terr.slice();

  ORIG = [];
  for (let k = 0; k < MD.objs.length; k += 3)
    ORIG.push({ s: MD.objs[k], x: MD.objs[k + 1], y: MD.objs[k + 2] });

  const prev = edits[id];
  if (prev) {
    objs = prev.objs; added = prev.added; deleted = prev.deleted; nextId = prev.nextId;
    painted = prev.painted || new Map();
    undoStack = prev.undoStack || [];
    for (const [ti, tv] of painted) terr[ti] = tv;
  } else {
    objs = ORIG.map((o, k) => ({ id: k, s: o.s, x: o.x, y: o.y }));
    added = []; deleted = new Set(); nextId = ORIG.length;
    painted = new Map();
    undoStack = [];
  }
  stroke = null;

  loot = []; spell = null; risings = []; blooms = []; consecrationTrails = []; dustPuff = null; graves = null; flying = []; falling = null;
  seedTreasuryGold();
  if (id !== "cinderhold") lastFight = 0;   /* the hall keeps its own fight */
  npcs = MD.npcs.map((n, k) => ({
    id: "npc" + k, pettable: n.pettable, sy: n.sy, idleFps: n.idleFps, packSpr: n.packSpr, packDirections: n.packDirections, packWalk: n.packWalk, school: n.school, stationary: n.stationary, talkX: n.talkX, talkY: n.talkY, s: n.s, sk: n.sk, x: n.x, y: n.y, n: n.n, d: n.d,
    crown: n.crown, body: n.body, kf: "d", dd: n.dd, dm: n.dm, rod: n.rod,
    charm: n.charm,                 /* what this one hands over, if anything */
    sells: n.sells,                 /* a potion seller */
    gift: n.gift,                   /* a breath, for the ones who carry one */
    d2: n.d2, dd2: n.dd2, dv: n.dv, dv2: n.dv2, dragonNear: n.dragonNear, dragonRumor: n.dragonRumor, dragonRumor2: n.dragonRumor2,
    noTalk: n.noTalk, desertNative: n.desertNative, idleFrame:n.idleFrame, counter:n.counter, seated:n.seated,seatSpr:n.seatSpr,seatClipY:n.seatClipY,
    leaving: 0,
    when: n.when, until: n.until, away: n.away, dm: n.dm, rod: n.rod,
    patrol: n.patrol, patrolFrom: n.patrolFrom, patrolRest: n.patrolRest,
    patrolPoints:n.patrolPoints,patrolSpeed:n.patrolSpeed,routeSeed:n.routeSeed,sceneReserved:n.sceneReserved,
    f: n.f || "d", t: Math.random() * 10
  }));
  /* Halvard is permanently gone once the final encounter has been won.
     Re-entering Cinderhold (for example via the seal chamber) must not
     reconstruct him from the map's original NPC definition. */
  if (wonAll && id === "cinderhold")
    npcs = npcs.filter(n => !/Halvard/.test(n.n || ""));
  setPaint(false);
  solid = new Uint8Array(MW * MH);
  selected = null;

  baseTerr = Uint8Array.from(MD.base_terr ? decodeRLE(MD.base_terr, MW * MH) : terr);
  features = (MD.features || []).map(f => ({ ...f }));
  featOrig = new Map((MD.features || []).map(f => [f.id, JSON.stringify(f)]));
  buildUndo = []; regionMoves = []; grabRect = null; grabDrag = null;
  decorGone = new Set(); decorDel = []; decorMoved = new Map();
  deckWet = null;                       /* rebuilt for the map being loaded */
  felled = new Set(MD.felled || []);
  for (const run of String(MD.felled_rle || "").split("|")) {
    if (!run) continue;
    const [yy, xs] = run.split(":");
    if (xs.includes("-")) {
      const [a, b] = xs.split("-").map(Number);
      for (let xx = a; xx <= b; xx++) felled.add(xx + "," + yy);
    } else felled.add(xs + "," + yy);
  }
  felledNew = [];
  clearedBoxes = [];
  featSeq = features.reduce((n, f) => Math.max(n, f.id || 0), 0) + 1;
  fobjs = [];
  fsanim = (MD.fsanim || []).slice();
  hidden = new Set(MD.hidden || []);
  scat = (MD.scatter || []).slice();
  sanm = (MD.sanim || []).slice();
  decks = (MD.decks || []).map(d => ({ ...d }));
  deckFix = new Map();
  for (const [fx, fy, kind] of (MD.deckfix || []))
    deckFix.set(fy * MW + fx, kind);

  buildGround();
  if (features.length) {
    const cached = realizedCache.get(MAPID);
    if (cached && cached.stamp === editStamp) {
      terr.set(cached.terr);
      fobjs = cached.fobjs.map(o => ({ ...o }));
      fsanim = cached.fsanim.slice();
      blockTiles = (cached.blockTiles || []).slice();
      lineTiles = cached.lineTiles;
      rockTiles = cached.rockTiles;
      hidden = new Set(cached.hidden);
      reindex();
    } else {
      realizeFeatures();
      realizedCache.set(MAPID, {
        stamp: editStamp, terr: terr.slice(),
        fobjs: fobjs.map(o => ({ ...o })), fsanim: fsanim.slice(),
        blockTiles: blockTiles.slice(), lineTiles, rockTiles, hidden: new Set(hidden)
      });
    }
  } else reindex();
  if (SCENE_WALL) {
    for (const k of SCENE_WALL) terr[k] = WALL;
    rebuildSolid();          /* the collision map was built before these landed */
  }
  if (id === "world" && quest >= Q.KING) {
    const her = npcs.find(n => n.n === "Hettie");
    if (her) { beginHettieWalk(her); her.x = her.home[0]; her.y = her.home[1]; her.goto = null; }
  }
  spawnFoes();
  dragon.placed = null;   /* it will be set at his shoulder next frame */
  refreshSel();
}

let lavaNear = null;
const SPECKLE_REACH = 10, BUBBLE_REACH = 8;
function rebuildLavaNear() {
  if (!terr || !MW || !MH) { lavaNear = null; return; }
  const n = MW * MH;
  if (!lavaNear || lavaNear.length !== n) lavaNear = new Uint8Array(n);
  const CAP = 63;
  for (let y = 0, i = 0; y < MH; y++)
    for (let x = 0; x < MW; x++, i++) {
      if (terr[i] !== VLAVA) { lavaNear[i] = 0; continue; }
      let d = CAP;
      if (y > 0 && lavaNear[i - MW] < d) d = lavaNear[i - MW] + 1;
      if (x > 0 && lavaNear[i - 1] + 1 < d) d = lavaNear[i - 1] + 1;
      lavaNear[i] = d > CAP ? CAP : d;
    }
  for (let y = MH - 1, i = n - 1; y >= 0; y--)
    for (let x = MW - 1; x >= 0; x--, i--) {
      if (!lavaNear[i]) continue;
      let d = lavaNear[i];
      if (y < MH - 1 && lavaNear[i + MW] + 1 < d) d = lavaNear[i + MW] + 1;
      if (x < MW - 1 && lavaNear[i + 1] + 1 < d) d = lavaNear[i + 1] + 1;
      lavaNear[i] = d;
    }
}
function lavaDist(x, y) {
  if (!lavaNear || x < 0 || y < 0 || x >= MW || y >= MH) return 99;
  return lavaNear[y * MW + x];
}
let blockTiles = [];
const BLOCKS = /^(vfence)/;
const CLEARINGS = [ { map: "world", x0: 1079, y0: 258, x1: 1096, y1: 268 } ];
function openClearings() {
  for (const c of CLEARINGS) {
    if (c.map !== MAPID) continue;
    for (let y = c.y0; y <= c.y1; y++)
      for (let x = c.x0; x <= c.x1; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        solid[y * MW + x] = 0;
      }
  }
}
function rebuildSolid() {
  solid.fill(0);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const t = terr[y * MW + x];
  if (t === WATER || t === DWATER || t === SEA || t === WALL
      || t === POOL_T || t === VLAVA) solid[y * MW + x] = 1;
  if (t === DECK || (typeof baseTerr !== "undefined" && baseTerr &&
                     baseTerr[y * MW + x] === DECK)) solid[y * MW + x] = 0;
  else if (typeof baseTerr !== "undefined" && baseTerr && t !== SEA &&
           t !== WATER && t !== DWATER && solid[y * MW + x]) {
    let quay = false;
    for (let dy = -1; dy <= 1 && !quay; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const a = x + dx, b = y + dy;
        if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
        if (terr[b * MW + a] === DECK || baseTerr[b * MW + a] === DECK) { quay = true; break; }
      }
    if (quay) solid[y * MW + x] = 0;
  }
  else if (t === GRASS && typeof baseTerr !== "undefined" && baseTerr &&
           baseTerr[y * MW + x] === VLAVA)
    solid[y * MW + x] = 1;
  }
  for (let i = 0; i < blockTiles.length; i++) solid[blockTiles[i]] = 1;
  for (const d of decks) {
    const vertical = (d.y1 - d.y0) > (d.x1 - d.x0);
    const span = vertical ? (d.x1 - d.x0 + 1) : (d.y1 - d.y0 + 1);
    if (span < 3) continue;
    for (let y = d.y0; y <= d.y1; y++)
      for (let x = d.x0; x <= d.x1; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        const under = terr[y * MW + x];
        if (under !== BRIDGE && under !== WATER) continue;
        const edge = vertical ? (x === d.x0 || x === d.x1)
                              : (y === d.y0 || y === d.y1);
        solid[y * MW + x] = edge ? 1 : 0;
      }
  }
  const stamp = (o) => {
    const d = DEFS[o.s]; if (!d || !d.c) return;
    const cw = d.c[0], ch = d.c[1];
    const x0 = Math.floor((o.x - cw / 2) / TS), x1 = Math.floor((o.x + cw / 2 - 1) / TS);
    const y0 = Math.floor((o.y - ch) / TS), y1 = Math.floor((o.y - 1) / TS);
    for (let y = Math.max(0, y0); y <= Math.min(MH - 1, y1); y++)
      for (let x = Math.max(0, x0); x <= Math.min(MW - 1, x1); x++)
        solid[y * MW + x] = 1;
  };
  for (const o of objs) if (!deleted.has(o.id) && !hidden.has(o.id)) stamp(o);
  for (const o of fobjs) stamp(o);
  openClearings();   /* last word: a clearing beats every rule above */
}
let arenaPass = false;           /* set while testing the dragon's footing */
const stampedBy = (x, y) => {
  const out = [];
  const look = (o) => {
    const d = DEFS[o.s]; if (!d || !d.c) return;
    const cw = d.c[0], ch = d.c[1];
    const x0 = Math.floor((o.x - cw / 2) / TS), x1 = Math.floor((o.x + cw / 2 - 1) / TS);
    const y0 = Math.floor((o.y - ch) / TS), y1 = Math.floor((o.y - 1) / TS);
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1)
      out.push((NAMES[o.s] || ('id' + o.s)) + '@' + Math.round(o.x / TS) + ',' +
               Math.round((o.y - 1) / TS) + ' box ' + cw + 'x' + ch);
  };
  for (const o of objs) if (!deleted.has(o.id) && !hidden.has(o.id)) look(o);
  for (const o of fobjs) look(o);
  return out;
};
const peekTile = (x, y) => ({
  terr: terr[y * MW + x],
  base: baseTerr ? baseTerr[y * MW + x] : null,
  solid: solid[y * MW + x],
  inBlockTiles: blockTiles.indexOf(y * MW + x) >= 0,
  rock: rockTiles ? rockTiles.has(x + "," + y) : null,
});
function blockedByNpcBody(px, py) {
  return npcs.some(n => n!==npcCollisionActor && (typeof npcHere !== "function" || npcHere(n)) && !n.goto && !n.leaving && !n.brambleCompanion &&
    px >= n.x - 7 && px < n.x + 7 && py >= n.y - 8 && py < n.y);
}
function blockedByNpcBuffer(px, py) {
  for (const n of npcs) {
    if (typeof npcHere === "function" && !npcHere(n)) continue;
    if (n.goto || n.leaving) continue;
    // Anchor the half-tile clearance to the NPC's feet, not the next grid row.
    // Otherwise a south-facing NPC can block Corin beyond talking distance.
    if (px >= n.x - TS / 2 && px < n.x + TS / 2 &&
        py >= n.y && py < n.y + TS / 2) return true;
  }
  return false;
}
/* The seal altar occupies Halvard's old place at the north end of the rug. */
const TRIAL_PEDESTAL = { x: 112, y: 104 };
function trialPedestalHere() {
  return MAPID === "royal_seal";
}
function blockedByTrialPedestal(px, py) {
  return trialPedestalHere() &&
    px >= TRIAL_PEDESTAL.x - 13 && px < TRIAL_PEDESTAL.x + 13 &&
    py >= TRIAL_PEDESTAL.y - 36 && py < TRIAL_PEDESTAL.y + 2;
}
const whyBlocked = (px, py) => {
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= MW || y >= MH) return "off the map";
  if (solid[y * MW + x] === 1) return "solid[]";
  if (blockedByTrialPedestal(px, py)) return "trial pedestal";
  if (blockedByNpcBuffer(px, py)) return "npc half-tile buffer";
  if (!arenaPass && arenaLock && arenaT > 0.25 &&
      Math.hypot(x - arenaLock.x, y - arenaLock.y) > arenaLock.r + 0.5) return "arena fence";
  if (x <= 80) {
    if (northShut() && MAPID === "world" && y <= gateRow && y >= gateRow - 5)
      return "north gate";
    if (eggGate >= 0 && quest === Q.CARRY && MAPID === "world" &&
        y >= eggGate && y <= eggGate + 5) return "egg gate";
    if (quest === Q.FLED && MAPID === "world" && fieldGate >= 0 &&
        y >= fieldGate && y <= fieldGate + 5) return "field gate";
  }
  if (fenceAt && fenceAt.has(y * MW + x)) return "fence list";
  if (blockedByGuard(x, y)) return "guard";
  if (odoShuts(x, y)) return "odo";
  if (blockedByItem(x, y)) return "item";
  if (blockedByHerd(x, y)) return "herd";
  return "not blocked";
};
const isSolid = (px, py, ignoreNpcBuffer = false) => {
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= MW || y >= MH) return true;
  const override=collisionOverride(px,py);if(override!==undefined)return override;
  if (MAPID === "witchmoor" && wonAll && px >= 184 && px < 213 && py >= 282 && py < 311) return true;
  const wallEdit=editedTempleWallCollision(px,py);if(wallEdit===true)return true;
  if(wallEdit!==false&&MD?.templeContinuous&&(!MD.templeFloors.some(r=>px>=r[0]&&px<r[2]&&py>=r[1]&&py<r[3])||MD.templeWalls.some(r=>px>=r[0]&&px<r[2]&&py>=r[1]&&py<r[3])))return true;
  if (blockedByTempleGate(px,py)) return true;
  if (blockedByTrialPedestal(px, py)) return true;
  if (solid[y * MW + x] === 1) return true;
  if (blockedByNpcBody(px, py)) return true;
  if (MAPID === "glasshouse" && glassHatchFrame() < 3 && px >= 48 && px < 88 && py >= 104 && py < 118) return true;
  if (MD.roomBlocks && MD.roomBlocks.some(r => px >= r[0] && px < r[2] && py >= r[1] && py < r[3])) return true;
  if (!ignoreNpcBuffer && blockedByNpcBuffer(px, py)) return true;
  if (!arenaPass && arenaLock && arenaT > 0.25 &&
      Math.hypot(x - arenaLock.x, y - arenaLock.y) > arenaLock.r + 0.5) return true;
  const inMillwood = x <= 80;
  if (inMillwood) {
    if (northShut() && MAPID === "world" && y <= gateRow && y >= gateRow - 5)
      return true;
    if (eggGate >= 0 && quest === Q.CARRY && MAPID === "world" &&
        y >= eggGate && y <= eggGate + 5) return true;
    if (quest === Q.FLED && MAPID === "world" && fieldGate >= 0 &&
        y >= fieldGate && y <= fieldGate + 5) return true;
  }
  if (fenceAt && fenceAt.has(y * MW + x)) return true;
  if (blockedByGuard(x, y)) return true;
  if (odoShuts(x, y)) return true;
  if (blockedByItem(x, y)) return true;
  return blockedByHerd(x, y);
};

const CELL = 256;
let CW = 1, CH = 1, buckets = [], sbuckets = [];
let fenceAt = null;
function rebuildBuckets() {
  CW = Math.ceil(PXW / CELL); CH = Math.ceil(PXH / CELL);
  fenceAt = new Set((MD.fence || []).map(([fx, fy]) => fy * MW + fx));
  buckets = new Array(CW * CH); for (let i = 0; i < buckets.length; i++) buckets[i] = [];
  sbuckets = new Array(CW * CH); for (let i = 0; i < sbuckets.length; i++) sbuckets[i] = [];
  const sa = sanm.concat(fsanim);
  for (let i = 0; i < sa.length; i += 3) {
    if (i < sanm.length && decorGone.has("a" + i)) continue;
    const x = sa[i + 1], y = sa[i + 2];
    if (typeof inWinter === "function") {
      const nm = NAMES[sa[i]] || "";
      if (/(agrass|dtuft|tuft|weed|flower|fern|clover|grass|sw_tuft|swg|bloom|petal)/i.test(nm) &&
          inWinter(Math.floor(x / TS), Math.floor((y - 1) / TS))) continue;
    }
    const cx = Math.min(CW - 1, Math.max(0, Math.floor(x / CELL)));
    const cy = Math.min(CH - 1, Math.max(0, Math.floor(y / CELL)));
    sbuckets[cy * CW + cx].push(sa[i], x, y);
  }
  for (const o of objs.concat(fobjs)) {
    if (deleted.has(o.id) || hidden.has(o.id)) continue;
    const cx = Math.min(CW - 1, Math.max(0, Math.floor(o.x / CELL)));
    const cy = Math.min(CH - 1, Math.max(0, Math.floor(o.y / CELL)));
    buckets[cy * CW + cx].push(o);
  }
}
function reindex() { rebuildBuckets(); rebuildSolid(); rebuildLavaNear();
                     placeBirds(); mapDirty = true; }

const P = { x: 0, y: 0, dir: "d", moving: false, t: 0, flip: false };
const PC_W = 11, PC_H = 7;      // feet collision box
function canStand(x, y) {
  const hw = PC_W / 2;
  /* An NPC can turn after a conversation and place its directional buffer
     around Corin.  If he is already inside it, let him leave; the buffer
     starts blocking again as soon as his feet are clear. */
  const escapingNpcBuffer =
    blockedByNpcBuffer(P.x - hw, P.y - PC_H) ||
    blockedByNpcBuffer(P.x + hw, P.y - PC_H) ||
    blockedByNpcBuffer(P.x - hw, P.y - 1) ||
    blockedByNpcBuffer(P.x + hw, P.y - 1);
  return !(isSolid(x - hw, y - PC_H, escapingNpcBuffer) ||
           isSolid(x + hw, y - PC_H, escapingNpcBuffer) ||
           isSolid(x - hw, y - 1, escapingNpcBuffer) ||
           isSolid(x + hw, y - 1, escapingNpcBuffer));
}
function movePlayer(dx, dy, dt) {
  if (sceneHold()) return;      /* held still while someone is talking */
  const SP = running ? 190 : 118;     /* B is hold-to-run */
  const nx = P.x + dx * SP * dt, ny = P.y + dy * SP * dt;
  // Ordinary temple doors only start opening when a movement crosses their threshold.
  if(MD?.templeContinuous&&dy&&Math.abs(P.x-160)<=10){
    for(const g of MD.templeGates){
      if(g.room||g.entered)continue;
      const north=dy<0&&P.y>=g.y&&ny-PC_H<g.y;
      const south=dy>0&&P.y-1<g.y-16&&ny-1>=g.y-16;
      if(north||south)g.entered=true;
    }
  }

  if (dx && canStand(nx, P.y)) P.x = nx;
  if (dy && canStand(P.x, ny)) P.y = ny;
  P.x = Math.max(8, Math.min(PXW - 8, P.x));
  P.y = Math.max(16, Math.min(PXH - 2, P.y));
}

const cv = document.getElementById("cv"), ctx = cv.getContext("2d", { alpha: false });
let VW = 0, VH = 0, DPR = 1;
// Virtual source coordinates keep every sprite and alternate NPC tone unchanged.
const atlasImg = {width:4096,height:1039360};
// Throne-room asset cut directly from the approved user image.
const throneRoomImg = new Image();
throneRoomImg.src = EMBERFELL_ASSETS.a0841;
const atlasPages = new Map();
const MOUNTED_KEY_Y = new Set([623616, 624640, 625664, 626688, 627712, 628736, 629760, 630784, 631808, 632832, 633856, 634880, 635904, 636928, 637952, 638976, 640000, 641024, 642048, 643072, 644096, 645120, 646144, 647168, 648192, 649216, 650240, 651264, 652288, 653312, 654336, 655360, 656384, 657408, 658432, 659456, 660480, 661504, 662528, 663552, 664576, 665600, 666624, 667648, 668672, 669696, 670720, 671744, 672768, 673792, 674816, 675840, 676864, 677888]);
// Magenta was the mounted sheets' export matte. Key it during decode so it
// cannot bleed into scaled edges; other atlas art never passes through here.
function decodeMountedMatte(img, w, h) {
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const pixels = g.getImageData(0, 0, w, h), p = pixels.data;
  const purple = (i) => p[i] > p[i+1] + 24 && p[i+2] > p[i+1] + 24 &&
    p[i] > p[i+2] * .65 && p[i+2] > p[i] * .55 && Math.max(p[i], p[i+2]) > 65;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i+3] && purple(i) && p[i+1] < Math.max(p[i], p[i+2]) * .5) p[i+3] = 0;
  }
  // Remove residual matte tint only along transparent boundaries. Interior
  // colors and the rider/dragon silhouette retain their original alpha.
  const before = new Uint8ClampedArray(p);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y*w+x)*4;
    if (!p[i+3] || !purple(i)) continue;
    const edge = x===0 || y===0 || x===w-1 || y===h-1 ||
      !before[i-4+3] || !before[i+4+3] || !before[i-w*4+3] || !before[i+w*4+3];
    if (edge) p[i+2] = Math.min(p[i+2], p[i+1]);
  }
  g.putImageData(pixels, 0, 0);
  return canvas;
}
function registerAtlasPage(page) {
  const seatedWidths={547840:27,548864:23,549888:27,550912:26,551936:23,552960:27,553984:27};
  if(seatedWidths[page.y]&&!page.seatedClean){
    // The source frames include terracotta rugs. Remove only background-connected
    // rug pixels, preserving the same colours when enclosed by character outlines.
    const c=document.createElement('canvas');c.width=page.w;c.height=page.h;
    const g=c.getContext('2d');g.drawImage(page.img,0,0);
    const im=g.getImageData(0,0,page.w,page.h),a=im.data,fw=seatedWidths[page.y];
    const rug=new Set([0xa75d44,0x92473f,0xbe6f47,0x843f3b]);
    for(let left=0;left<page.w;left+=fw){
      const width=Math.min(fw,page.w-left),seen=new Uint8Array(width*page.h),stack=[];
      for(let y=0;y<page.h;y++){stack.push(y*width,y*width+width-1);}
      for(let x=0;x<width;x++){stack.push(x,(page.h-1)*width+x);}
      while(stack.length){
        const p=stack.pop();if(seen[p])continue;seen[p]=1;
        const x=p%width,y=Math.floor(p/width),o=(y*page.w+left+x)*4;
        if(a[o+3]&&!rug.has((a[o]<<16)|(a[o+1]<<8)|a[o+2]))continue;
        a[o+3]=0;
        if(x)stack.push(p-1);if(x+1<width)stack.push(p+1);
        if(y)stack.push(p-width);if(y+1<page.h)stack.push(p+width);
      }
    }
    g.putImageData(im,0,0);page={...page,img:c,seatedClean:true};
  }
  const x1 = Math.floor((page.x + page.w - 1) / 1024);
  const y1 = Math.floor((page.y + page.h - 1) / 1024);
  for (let ty = Math.floor(page.y / 1024); ty <= y1; ty++)
    for (let tx = Math.floor(page.x / 1024); tx <= x1; tx++)
      atlasPages.set(ty * 4 + tx, page);
}

function drawGameImage(g, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (img !== atlasImg) {
    /* A missing or not-yet-decoded auxiliary sheet must never take down the
       render loop. */
    if (!img || img.complete === false || img.naturalWidth === 0 || img.naturalHeight === 0) return;
    if (sw === undefined) g.drawImage(img, sx, sy);
    else if (dx === undefined) g.drawImage(img, sx, sy, sw, sh);
    else g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }
  if (dx === undefined) {
    dx = sx; dy = sy; dw = sw === undefined ? img.width : sw;
    dh = sh === undefined ? img.height : sh;
    sx = sy = 0; sw = img.width; sh = img.height;
  }
  if (!(sw > 0 && sh > 0 && dw > 0 && dh > 0)) return;
  const x0 = Math.floor(sx / 1024), x1 = Math.floor((sx + sw - 0.00001) / 1024);
  const y0 = Math.floor(sy / 1024), y1 = Math.floor((sy + sh - 0.00001) / 1024);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const page = atlasPages.get(ty * 4 + tx);
    if (!page) continue;
    const x = Math.max(sx, page.x, tx * 1024), y = Math.max(sy, page.y, ty * 1024);
    const right = Math.min(sx + sw, page.x + page.w, (tx + 1) * 1024);
    const bottom = Math.min(sy + sh, page.y + page.h, (ty + 1) * 1024);
    if (right <= x || bottom <= y) continue;
    g.drawImage(page.img, x - page.x, y - page.y, right - x, bottom - y,
      dx + (x - sx) * dw / sw, dy + (y - sy) * dh / sh,
      (right - x) * dw / sw, (bottom - y) * dh / sh);
  }
}
async function loadAtlasPages() {
  // Limit simultaneous decodes to avoid a large startup memory spike.
  let next = 0;
  async function worker() {
    while (next < ATLAS_PAGES.length) {
      const [x, y, w, h, src] = ATLAS_PAGES[next++];
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve; img.onerror = reject; img.src = src;
      });
      registerAtlasPage({ img: MOUNTED_KEY_Y.has(y) ? decodeMountedMatte(img, w, h) : img, x, y, w, h });
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  if (knightStoryImg.decode) await knightStoryImg.decode();
  /* Register patches deterministically after every original page. */
  for (const [x, y, w, h, src] of ATLAS_PATCHES) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve; img.onerror = reject; img.src = src;
    });
    registerAtlasPage({ img, x, y, w, h });
  }
  await prepareGreenScene();
  await loadDesertNpcAssets();
  await loadDockOriginalAssets();
  await loadRoyalAssets();
}


const stageEl = document.getElementById("stage");
function resize() {
  const nextDPR = Math.min(window.devicePixelRatio || 1, 2);
  const r = stageEl.getBoundingClientRect ? stageEl.getBoundingClientRect() : null;
  const nextW = Math.floor((r && r.width) || window.innerWidth);
  const nextH = Math.floor((r && r.height) || window.innerHeight);
  if (VW === nextW && VH === nextH && DPR === nextDPR &&
      cv.width === Math.floor(nextW * nextDPR) && cv.height === Math.floor(nextH * nextDPR)) return;
  DPR = nextDPR; VW = nextW; VH = nextH;
  cv.width = Math.floor(VW * DPR); cv.height = Math.floor(VH * DPR);
  cv.style.width = VW + "px"; cv.style.height = VH + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!cameraOwnsView() && !camFree && mode === "play") { cam.z = playZoom(); clampCam(); }
  if (hatchCamera) hatchCamera.goal = null; // Reframe only for a real viewport change.
  mapDirty = true;
}
function auditPlacements() {
  const seen = new Set();
  for (const md of Object.values(W.maps))
    for (const arr of [md.objs || [], md.scatter || []])
      for (let i = 0; i < arr.length; i += 3)
        if (!SPR[NAMES[arr[i]]]) seen.add(NAMES[arr[i]]);
  if (seen.size) console.warn("placed but not in the atlas:", [...seen].join(", "));
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange",
                        () => setTimeout(resize, 250));
if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(stageEl);

function toggleBig() {
  const root = document.documentElement;
  const on = document.fullscreenElement || document.webkitFullscreenElement;
  const pseudo = document.body.classList.contains("pseudoFullscreen");
  try {
    if (on) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else if (pseudo) {
      document.body.classList.remove("pseudoFullscreen");
    } else {
      /* Try the real browser fullscreen route on iPhone too. The old iOS
         shortcut skipped it entirely, so it could only appear to do nothing.
         The viewport mode is retained solely as a rejected-API fallback. */
      const r = root.requestFullscreen || root.webkitRequestFullscreen;
      if (!r) document.body.classList.add("pseudoFullscreen");
      else {
        const p = r.call(root);
        if (p && p.catch) p.catch(() => document.body.classList.add("pseudoFullscreen"));
        setTimeout(() => {
          if (!(document.fullscreenElement || document.webkitFullscreenElement))
            document.body.classList.add("pseudoFullscreen");
        }, 650);
      }
    }
  } catch (e) { document.body.classList.add("pseudoFullscreen"); }
  setTimeout(resize, 120);
}
document.addEventListener("fullscreenchange", () => setTimeout(resize, 120));
document.addEventListener("webkitfullscreenchange", () => setTimeout(resize, 120));

function sheetOf(s) {
  return s[5] === 5 ? knightStoryImg : s[5] === 4 ? kingDragonDeathImg : s[5] === 3 ? kingDragonImg : s[5] === 2 ? smImg : s[5] === 1 ? dragonImg : atlasImg;
}
function blit(dst, name, frame, dx, dy) {
  const s = SPR[name];
  if (!s) throw new Error("unknown sprite " + name);
  const f = frame % s[4];
  drawGameImage(dst, sheetOf(s), s[0] + f * s[2], s[1], s[2], s[3], dx, dy, s[2], s[3]);
}
const nmask = (x, y, ok) =>
  (ok(x, y - 1) ? 0 : 8) | (ok(x + 1, y) ? 0 : 4) |
  (ok(x, y + 1) ? 0 : 2) | (ok(x - 1, y) ? 0 : 1);

function scatterFits(px, py, name) {
  const t = T(Math.floor(px / TS), Math.floor((py - 1) / TS));
  if (name && ANYWHERE.test(name)) return true;
  if (name && typeof inWinter === "function" &&
      /(agrass|dtuft|tuft|weed|flower|fern|clover|bush_|grass|sw_tuft|swg|bloom|petal)/i.test(name)) {
    const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS);
    if (inWinter(tx, ty)) return false;
  }
  if (name && WATERPLANT.test(name)) return t === WATER || t === BRIDGE;
  if (name && /^mt[dwe]_/.test(name)) return true;
  if (name && /^(dune_|sand_ripple|drock|bones)/.test(name)) return t === SAND;
  return t === GRASS || t === WALL || t === FARM;
}
const PLACED = "mtn_|mts_|mtv_|vmt_|mtd_|mtw_|mte_|cave|wf_cave|vfall|vfence" +
               "|vtree_|vbush_|vtuft_|vtower|vbridge|rc_|kt_|kp_|shc_|shcap_";
const ANYWHERE = new RegExp("^(" + PLACED + "|waterfall|cliffpool|cliff_|bridge_|sett_)");
const WATERPLANT = /^(cattail|lily_)/;

function lavaLook(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return true;
  const q = T(x, y);
  if (q === VLAVA) return true;
  if (q !== GRASS && !(q === WALL && !cliffAt(x, y))) return false;
  return typeof baseTerr !== "undefined" && baseTerr &&
         baseTerr[y * MW + x] === VLAVA;
}
function lavaShore(g, x, y, px, py) {
  const tt = TERRT.vl;
  if (!tt) return;
  const n = nmask(x, y, lavaLook);
  if (n && SPR[tt.mask[n]]) blit(g, tt.mask[n], 0, px, py);
}
const CHUNK = 256;                 /* px; 16x16 tiles */
const CHUNK_CACHE = 96;            /* ~25 MB ceiling, plenty for any viewport */
let chunks = new Map();            /* key -> {cv, used} */
let chunkClock = 0;
let scatterChunks = null;          /* chunk key -> static scatter entries */

function chunkKey(cx, cy) { return cy * 4096 + cx; }

function indexScatter() {
  scatterChunks = new Map();
  const sc = scat;
  for (let i = 0; i < sc.length; i += 3) {
    if (decorGone.has("s" + i)) continue;      /* deleted this session */
    const cx = Math.floor(sc[i + 1] / CHUNK), cy = Math.floor(sc[i + 2] / CHUNK);
    const sp = SPR[NAMES[sc[i]]];
    const reach = sp ? Math.ceil((sp[2] / 2) / CHUNK) : 1;
    const up = sp ? Math.ceil(sp[3] / CHUNK) : 1;
    for (let dy = 0; dy <= up; dy++) for (let dx = -reach; dx <= reach; dx++) {
      const k = chunkKey(cx + dx, cy - dy);
      let a = scatterChunks.get(k);
      if (!a) scatterChunks.set(k, a = []);
      a.push(sc[i], sc[i + 1], sc[i + 2]);
    }
  }
}

let GROUND_SETS = ATLAS.ground_sets || {};
let GROUND_FRINGE = ATLAS.ground_fringe || {};
const NOISE_CELL = 9;

function _lat(ix, iy) {
  let h = (ix * 374761393 + iy * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) % 1000 / 1000;
}

function _oct(x, y, cell, seed) {
  const fx = x / cell, fy = y / cell;
  const ix = Math.floor(fx), iy = Math.floor(fy);
  let tx = fx - ix, ty = fy - iy;
  tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);   /* smoothstep */
  const a = _lat(ix + seed, iy), b = _lat(ix + 1 + seed, iy);
  const c = _lat(ix + seed, iy + 1), d = _lat(ix + 1 + seed, iy + 1);
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

function blobNoise(x, y) {
  return _oct(x, y, NOISE_CELL, 0) * 0.45
       + _oct(x, y, 6, 977) * 0.33
       + _oct(x, y, 3, 4211) * 0.22;
}

function rawBlue(x, y) {
  const z = MD.shroom;
  if (!z || !GROUND_SETS.blue) return false;
  const d = (z.y1 - y) / (z.y1 - z.y0) * 1.9;
  if (d <= 0) return false;
  if (d >= 1) return true;
  return d > blobNoise(x, y) * 0.85 + 0.08;
}

function isBlue(x, y) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      if (rawBlue(x + dx, y + dy)) n++;
  return n >= 5;
}

const POOL_T = 7;
function isPool(x, y) {
  return x >= 0 && y >= 0 && x < MW && y < MH && terr[y * MW + x] === POOL_T;
}
function poolTile(x, y) {
  if (!isPool(x, y)) return null;
  const m = nmask(x, y, isPool);
  if (m === 0) return SPR["water_mid"] ? "water_mid" : null;
  const C = TERRT.cwa, W0 = TERRT.wa;
  const cn = C && C.mask[m], wn = W0 && W0.mask[m];
  if (cn && SPR[cn]) return cn;
  if (wn && SPR[wn]) return wn;
  return SPR["water_mid"] ? "water_mid" : null;
}
function poolCorners(x, y) {
  const C = TERRT.cwa, W0 = TERRT.wa;
  const R = (C && C.diag) ? C : W0;
  if (!isPool(x, y) || !R || !R.diag) return null;
  if (nmask(x, y, isPool) !== 0) return null;
  const out = [];
  for (let i = 0; i < R.diag.length; i++) {
    const [dx, dy] = R.diag[i];
    if (!isPool(x + dx, y + dy)) {
      const c = R.corner[i];
      out.push(SPR[c] ? c : (W0 && W0.corner[i]));
    }
  }
  return out.filter(Boolean).length ? out.filter(Boolean) : null;
}

function grassHere(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  const i = y * MW + x;
  if (terr[i] === GRASS) return true;
  return terr[i] === WALL && baseTerr && baseTerr[i] === GRASS;
}
function sandOrRoad(x, y) {
  const i = y * MW + x;
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  return terr[i] === SAND || terr[i] === DIRT
      || (terr[i] === WALL && baseTerr && baseTerr[i] === SAND);
}
function grassNear(x, y) {
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const a = x + dx, b = y + dy;
      if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
      const j = b * MW + a;
      if (terr[j] === GRASS || (baseTerr && baseTerr[j] === GRASS)) return true;
    }
  return false;
}
function inSwamp(x, y) {
  const F = (typeof features !== "undefined" && features.length) ? features
                                                                 : MD.features;
  if (!F) return false;
  const SR = MD.swamp_regions;
  if (SR) for (const r of SR)
    if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
  for (const f of F) {
    if (f.kind !== "route" || f.style !== "swamp") continue;
    const reach = (f.band || 20) + ((f.w || 5) >> 1) + 2;
    for (const [pa, pb] of routeLegs(f)) {
      const vx = pb[0] - pa[0], vy = pb[1] - pa[1];
      const len2 = vx * vx + vy * vy;
      let t = len2 ? ((x - pa[0]) * vx + (y - pa[1]) * vy) / len2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (pa[0] + t * vx), dy = y - (pa[1] + t * vy);
      if (dx * dx + dy * dy <= reach * reach) return true;
    }
  }
  return false;
}
let arenaRings = null;
function onArenaFloor(x, y) {
  if (!arenaRings) return false;
  for (const a of arenaRings)
    if ((x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]) <= a[2] * a[2] + 4) return true;
  return false;
}
let blossomBand = null;
let townBoxList = null;
let deckWet = null;
function deckOverWater(x, y) {
  if (!deckWet) {
    deckWet = new Set();
    for (const p of (MD.deck_wet || [])) deckWet.add(p[1] * MW + p[0]);
  }
  return deckWet.has(y * MW + x);
}
function swWater(name) {
  const t = SPR["sw_" + name] ? "sw_" + name : name;
  return t;
}
function winterGroundTile(x, y) {
  const set = GROUND_SETS.snow;
  const v = (((x * 374761393) ^ (y * 668265263)) >>> 0) % set.length;
  return SPR[set[v]] ? set[v] : null;
}
function swampGround(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  if (typeof inWinter === "function" && inWinter(x, y)) return false;
  const t = terr[y * MW + x];
  return (t === GRASS || (t === WALL && baseTerr && baseTerr[y * MW + x] === GRASS))
         && inSwamp(x, y);
}
function swampSpan(x, y) {
  if (typeof inWinter === "function" && inWinter(x, y)) return false;
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  const t = terr[y * MW + x];
  return (t === GRASS || t === WATER || t === DIRT || t === COBBLE ||
          t === PAVING2 || t === ROADSAND || t === BRIDGE || t === DECK ||
          (t === WALL && baseTerr && baseTerr[y * MW + x] === GRASS))
         && inSwamp(x, y);
}
function swampEdge(x, y) {
  if (!SPR.swp_c || !swampGround(x, y)) return null;
  const m = nmask(x, y, swampSpan);
  if (m === 0) return null;
  const R = TERRT.swp;
  const nm = R && R.mask[m];
  return nm && SPR[nm] ? nm : null;
}
function swampCorners(x, y) {
  const R = TERRT.swp;
  if (!R || !R.corner || !swampGround(x, y)) return null;
  if (nmask(x, y, swampSpan) !== 0) return null;   /* an edge tile handles itself */
  let out = null;
  for (let i = 0; i < R.corner.length; i++) {
    const d = R.diag[i];
    if (swampSpan(x + d[0], y + d[1])) continue;
    const n = R.corner[i];
    if (SPR[n]) (out = out || []).push(n);
  }
  return out;
}
function atCoast(x, y) {
  const c = MD.coast;
  if (!c) return false;
  const FADE = 34;
  const dx = Math.max(c.x0 - x, x - c.x1, 0);
  const dy = Math.max(c.y0 - y, 0);          /* south is open: it runs to sea */
  const d = Math.max(dx, dy);
  if (d > FADE) return false;
  if (d === 0) return true;
  const nz = (a, b, cell) => {
    const gx = a / cell, gy = b / cell;
    const ix = Math.floor(gx), iy = Math.floor(gy);
    const fx = gx - ix, fy = gy - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (px, py) => {
      let h = (px * 1597334677 + py * 2654435761) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      return ((h ^ (h >>> 16)) & 0xFFFF) / 65535;
    };
    const a0 = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * sx;
    const b0 = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * sx;
    return a0 + (b0 - a0) * sy;
  };
  const f = nz(x, y, 19) * 0.6 + nz(x + 53, y + 29, 8) * 0.4;
  return f > d / FADE;
}
function atOasis(x, y) {
  const o = MD.oasis;
  return !!o && x >= o.x0 && x <= o.x1 && y >= o.y0 && y <= o.y1;
}
function worldWaterAt(x, y) {
  const list = (MD && MD.world_water) || [];
  for (const b of list)
    if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return true;
  return false;
}
function inDesert(x, y) {
  for (let dy = -22; dy <= 22; dy += 3)
    for (let dx = -22; dx <= 22; dx += 3) {
      const a = x + dx, b = y + dy;
      if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
      const j = b * MW + a;
      if (terr[j] === SAND || terr[j] === ROADSAND
          || (baseTerr && baseTerr[j] === SAND)) return true;
    }
  return false;
}
function sandHere(x, y) {
  const i = y * MW + x;
  if (terr[i] === SAND || terr[i] === ROADSAND) return true;
  if (terr[i] === WALL || terr[i] === DIRT || terr[i] === COBBLE
      || terr[i] === PAVING2) {
    if (baseTerr && baseTerr[i] === SAND) return true;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const a = x + dx, b = y + dy;
        if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
        const j = b * MW + a;
        if (terr[j] === SAND || (baseTerr && baseTerr[j] === SAND)) return true;
        if (terr[j] === GRASS || (baseTerr && baseTerr[j] === GRASS)) return false;
      }
  }
  return false;
}
function groundTile(x, y, which) {
  const set = GROUND_SETS[which || "green"] || GROUND_SETS.green;
  if (!set) return "grass1";
  const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
  return SPR[set[v]] ? set[v] : "grass1";
}

function blueOverlay(x, y) {
  if (!isBlue(x, y)) return null;
  const m = nmask(x, y, (a, b) => isBlue(a, b));
  if (m === 0) {
    const set = GROUND_SETS.blue;
    const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
    return SPR[set[v]] ? set[v] : null;
  }
  const nm = TERRT.bgr && TERRT.bgr.mask[m];
  return nm && SPR[nm] ? nm : null;
}

function blueCorners(x, y) {
  const R = TERRT.bgr;
  if (!isBlue(x, y) || !R) return null;
  if (nmask(x, y, (a, b) => isBlue(a, b)) !== 0) return null;
  const out = [];
  for (let i = 0; i < R.diag.length; i++) {
    const [dx, dy] = R.diag[i];
    if (!isBlue(x + dx, y + dy)) out.push(R.corner[i]);
  }
  return out.length ? out : null;
}

function fringeTile(x, y, nm) {
  if (atCoast(x, y) && SPR["c" + nm]) return "c" + nm;
  if (!isBlue(x, y)) return nm;
  const alt = GROUND_FRINGE.blue + nm.slice(2);
  return SPR[alt] ? alt : nm;
}

function renderChunk(cx, cy) {
  const cv = document.createElement("canvas");
  cv.width = CHUNK; cv.height = CHUNK;
  const g = cv.getContext("2d");
  g.imageSmoothingEnabled = false;
  if (MAPID === "witchmoor" || MD.roomArt) {
    const sp = SPR[MD.roomArt || "witch_room"];
    g.fillStyle = MD.bg; g.fillRect(0, 0, CHUNK, CHUNK);
    drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3], -cx * CHUNK, -cy * CHUNK, sp[2], sp[3]);
    return cv;
  }
  const tx0 = (cx * CHUNK) / TS, ty0 = (cy * CHUNK) / TS, n = CHUNK / TS;
  g.translate(-cx * CHUNK, -cy * CHUNK);

  const wet = (a, b) => T(a, b) === WATER || T(a, b) === BRIDGE || T(a, b) === DECK;
  const isMade = (a, b) => T(a, b) === DIRT || T(a, b) === COBBLE || T(a, b) === PAVING2 || T(a, b) === FARM;
  const notGrass = (a, b) => T(a, b) !== GRASS && T(a, b) !== WALL;

  for (let y = ty0 - 1; y < ty0 + n + 1; y++) for (let x = tx0 - 1; x < tx0 + n + 1; x++) {
    if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
    const t = T(x, y), px = x * TS, py = y * TS;
    if (MD.bg) {
      g.fillStyle = (t === WALL) ? MD.bg : (MD.floorbg || MD.bg);
      g.fillRect(px, py, TS, TS);
    } else if (typeof onLava === "function" && onLava(x, y)) {
      const r = ((x * 31 + y * 17) | 0);
      const p = lavaDist(x, y) <= SPECKLE_REACH ? lavaPatch(x, y) : 0;
      if (p > 0.70) {
        const sp = "vl_sp" + (hash2(x, y) % 9);
        blit(g, SPR[sp] ? sp : "vl_flat", 0, px, py);
      } else blit(g, "vl_flat", 0, px, py);
    } else blit(g, groundTile(x, y,
                  (typeof snowGround === "function" && snowGround(x, y)) ? "snow"
                  : (terr[y * MW + x] === WATER && inWinter(x, y)) ? "snow_ice"
                  : (terr[y * MW + x] === WATER && inSwamp(x, y)) ? "swamp_water"
                  : swampGround(x, y) ? "swamp_grass"
                  : (terr[y * MW + x] === WATER && inDesert(x, y)) ? "dwater"
                  : ((terr[y * MW + x] === GRASS
                      || (terr[y * MW + x] === WALL && baseTerr
                          && baseTerr[y * MW + x] === GRASS))
                     && atOasis(x, y)) ? "dgrass"
                  : ((terr[y * MW + x] === GRASS
                      || (terr[y * MW + x] === WALL && baseTerr
                          && baseTerr[y * MW + x] === GRASS))
                     && atCoast(x, y)) ? "coast"
                  : (terr[y * MW + x] === PAVING2 && inDesert(x, y)
                     && onArenaFloor(x, y)) ? "astone"
                  : (terr[y * MW + x] === PAVING2 && inDesert(x, y)) ? "road_sand"
                  : (terr[y * MW + x] === ROADSAND && inDesert(x, y)) ? "sand"
                  : terr[y * MW + x] === ROADSAND ? "road_sand"
                  : sandHere(x, y)
                    ? ((terr[y * MW + x] === DIRT || terr[y * MW + x] === PAVING2)
                        ? "road_sand" : "sand")
                    : "green"), 0, px, py);
    if (terr[y * MW + x] === SAND && SPR.sand_ripple0) {
      const rh = ((x * 2654435761) ^ (y * 1597334677)) >>> 0;
      if (rh % 100 < 9) blit(g, "sand_ripple" + ((rh >>> 11) % 8), 0, px, py);
    }
    if (terr[y * MW + x] === SAND && SPR.drock0) {
      const dh = ((x * 374761393) ^ (y * 668265263)) >>> 0;
      const wetNear = (() => {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const a2 = x + dx, b2 = y + dy;
          if (a2 < 0 || b2 < 0 || a2 >= MW || b2 >= MH) continue;
          if (terr[b2 * MW + a2] === WATER) return true;
        }
        return false;
      })();
      if (!wetNear && dh % 600 < 10) {
        const set = ["drock0","drock2","drock4","drock6","drock9","drock10","drock12"];
        const nm = set[(dh >>> 13) % set.length];
        if (SPR[nm]) blit(g, nm, 0, px + (dh >>> 5) % 6 - 3, py + (dh >>> 9) % 6 - 3);
      }
    }
    if (swampGround(x, y) && SPR.swt0) {
      const ph = ((x * 2246822519) ^ (y * 3266489917)) >>> 0;
      if (ph % 100 < 46) {
        const set = GROUND_SETS.swamp_tuft;
        const tn = set[(ph >>> 9) % set.length];
        if (SPR[tn]) blit(g, tn, 0, px, py);
      }
    }
    { const se = swampEdge(x, y); if (se) blit(g, se, 0, px, py); }
    { const pw = poolTile(x, y);
      if (pw) {
        blit(g, pw, 0, px, py);
        const pc = poolCorners(x, y);
        if (pc) for (const c of pc) if (SPR[c]) blit(g, c, 0, px, py);
      } }
    { const bo = blueOverlay(x, y); if (bo) blit(g, bo, 0, px, py);
      const bc = blueCorners(x, y);
      if (bc) for (const c of bc) if (SPR[c]) blit(g, c, 0, px, py); }
    if (t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === BRIDGE)
      blit(g, soilAt(x, y), 0, px, py);

    if (t === DIRT && SPR.wp_t && typeof inWinter === "function" && inWinter(x, y)) {
      const off = (a, b) => (a < 0 || b < 0 || a >= MW || b >= MH) ||
                            terr[b * MW + a] !== DIRT || !inWinter(a, b);
      const n2 = off(x, y - 1), s2 = off(x, y + 1);
      const w2 = off(x - 1, y), e2 = off(x + 1, y);
      if (n2 && w2)      blit(g, "wp_tl", 0, px, py);
      else if (n2 && e2) blit(g, "wp_tr", 0, px, py);
      else if (s2 && w2) blit(g, "wp_bl", 0, px, py);
      else if (s2 && e2) blit(g, "wp_br", 0, px, py);
      else {
        if (n2) blit(g, "wp_t", 0, px, py);
        if (s2) blit(g, "wp_b", 0, px, py);
        if (w2) blit(g, "wp_l", 0, px, py);
        if (e2) blit(g, "wp_r", 0, px, py);
      }
    }
    if (t === DIRT && SPR.swd_w && typeof swampGround === "function" && inSwamp(x, y)) {
      const w = swampGround(x - 1, y), e = swampGround(x + 1, y);
      const n2 = swampGround(x, y - 1), s = swampGround(x, y + 1);
      const dg = [];
      if (!w && !e && !n2 && !s) {
        if (swampGround(x + 1, y + 1)) dg.push("swd_cbr");
        if (swampGround(x - 1, y + 1)) dg.push("swd_cbl");
        if (swampGround(x + 1, y - 1)) dg.push("swd_ctr");
        if (swampGround(x - 1, y - 1)) dg.push("swd_ctl");
      }
      let outer = null;
      if (n2 && w) outer = "swd_otl";
      else if (n2 && e) outer = "swd_otr";
      else if (s && w) outer = "swd_obl";
      else if (s && e) outer = "swd_obr";
      if (w || e || n2 || s || dg.length) {
        const eh = ((x * 668265263) ^ (y * 374761393)) >>> 0;
        blit(g, groundTile(x, y, "swamp_grass"), 0, px, py);
        for (const c of dg) if (SPR[c]) blit(g, c, 0, px, py);
        if (outer && SPR[outer]) blit(g, outer, 0, px, py);
        else {
          if (n2) blit(g, (eh & 2) ? "swd_n" : "swd_n2", 0, px, py);
          if (s)  blit(g, (eh & 1) ? "swd_s" : "swd_s2", 0, px, py);
          if (w)  blit(g, (eh & 4) ? "swd_w" : "swd_w2", 0, px, py);
          if (e)  blit(g, (eh & 8) ? "swd_e" : "swd_e2", 0, px, py);
        }
      }
    }
    if (t === DIRT && typeof inSwamp === "function" && inSwamp(x, y)
        && !(typeof inWinter === "function" && inWinter(x, y))) {
      const sh = ((x * 1274126177) ^ (y * 2654435761)) >>> 0;
      if (SPR.swpb0 && sh % 100 < 20) {
        const set = GROUND_SETS.swamp_pebble;
        const pn = set[(sh >>> 5) % set.length];
        const s2 = SPR[pn];
        if (s2) blit(g, pn, 0,
                     px + ((TS - s2[2]) >> 1) + ((sh >>> 11) % 5) - 2,
                     py + ((TS - s2[3]) >> 1) + ((sh >>> 14) % 5) - 2);
      }
    }

    if ((t === GRASS || t === DIRT || t === COBBLE || t === PAVING2 ||
         t === WALL) &&
        typeof inVolcano === "function" && inVolcano(x, y)) {
      const walk = (a, b) => {
        const q = T(a, b);
        return q === DIRT || q === COBBLE || q === PAVING2 ||
               q === VROCK || q === VSTONE || q === TERRACE;
      };
      if (t === GRASS || (t === WALL && !cliffAt(x, y))) {
        const p = lavaDist(x, y) <= SPECKLE_REACH ? lavaPatch(x, y) : 0;
        if (p > 0.70) {
          const sp = "vl_sp" + (hash2(x, y) % 9);
          blit(g, SPR[sp] ? sp : "vl_flat", 0, px, py);
        } else blit(g, "vl_flat", 0, px, py);
        lavaShore(g, x, y, px, py);
        continue;
      }
      const tt = TERRT.vr;
      if (tt) {
        blit(g, "vr_c", 0, px, py);
        blit(g, tt.mask[nmask(x, y, walk)], 0, px, py);
        continue;
      }
    }
if (t === COBBLE) { const _cb = TERRT.cb.mask[nmask(x, y, (a, b) => T(a, b) === COBBLE)];
      const _wcb = (typeof inWinter === "function" && inWinter(x, y) && SPR["w" + _cb])
                   ? "w" + _cb : _cb;
      blit(g, _wcb, 0, px, py); }
    if (t === PAVING2) {
      blit(g, "cb2_c", 0, px, py);
      blit(g, TERRT.cb2.mask[nmask(x, y, (a, b) => T(a, b) === PAVING2)], 0, px, py);
    }
    if (t === VLAVA) {
      const p = lavaDist(x, y) <= SPECKLE_REACH ? lavaPatch(x, y) : 0;
      if (p > 0.70) {
        const sp = "vl_sp" + (hash2(x, y) % 9);
        blit(g, SPR[sp] ? sp : "vl_flat", 0, px, py);
      } else {
        blit(g, "vl_flat", 0, px, py);
      }
      lavaShore(g, x, y, px, py);
      continue;
    }
    if (t === VSTONE) {
      const f = "vs_f" + (hash2(x, y) % 8);
      blit(g, SPR[f] ? f : "vs_c", 0, px, py);
      const tt = TERRT.vs;
      if (tt) blit(g, tt.mask[nmask(x, y, (a, b) => T(a, b) === VSTONE)], 0, px, py);
      continue;
    }
    if (t === VROCK || t === VCRACK ||
        ((t === DIRT || t === COBBLE || t === PAVING2) && terr[y * MW + x] !== undefined &&
         nearLava(x, y))) {
      const key = t === VCRACK ? "vc" : "vr";
      const tt = TERRT[key];
      const land = (a, b) => {
        const q = T(a, b);
        return q !== VLAVA && q !== WATER && q !== SEA && q !== DWATER;
      };
      if (tt) {
        blit(g, key + "_c", 0, px, py);
        blit(g, tt.mask[nmask(x, y, land)], 0, px, py);
        continue;
      }
    }
    if (t === TERRACE) {
      blit(g, "plat_c", 0, px, py);
      blit(g, TERRT.plat.mask[nmask(x, y, (a, b) => T(a, b) === TERRACE)], 0, px, py);
    }
    if (t === MARBLE) {
      blit(g, "cb3_c", 0, px, py);
      blit(g, TERRT.cb3.mask[nmask(x, y, (a, b) => T(a, b) === MARBLE)], 0, px, py);
    }
    if (t === FARM) blit(g, TERRT.fl.mask[nmask(x, y, (a, b) => T(a, b) === FARM)], 0, px, py);
    if (t === WATER || t === BRIDGE || t === DWATER || t === SEA) {
      if (t === SEA && SPR.gnd_sea0) {
        blit(g, groundTile(x, y, "sea"), 0, px, py);
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== SEA && v !== DECK && v !== WATER;
        };
        const cb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (cb && SPR.csx0 && !(typeof inSwamp === "function" && inSwamp(x, y)))
          blit(g, "csx" + cb, 0, px, py);   /* the world's bank, not the marsh's */
      } else if (t === DWATER && SPR.gnd_dwater0) {
        blit(g, groundTile(x, y, "dwater"), 0, px, py);
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== WATER && v !== DWATER;
        };
        const wb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (wb) blit(g, "wsx" + (15 & ~wb), 0, px, py);
      } else {
        const m = nmask(x, y, wet);
        const wn = m === 0 ? "water_mid" : TERRT.wa.mask[m];
        const marshHere = (typeof inSwamp === "function") && inSwamp(x, y);
        blit(g, marshHere ? swWater(wn) : wn, 0, px, py);
      }
    }
    const deep = baseTerr && baseTerr[y * MW + x] === SAND
                 && !grassNear(x, y);
    if (t === WATER && inDesert(x, y) && SPR.wsx0 && !worldWaterAt(x, y)) {
      const dry = (a, b) =>
        a < 0 || b < 0 || a >= MW || b >= MH || terr[b * MW + a] !== WATER;
      const wb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
               | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
      if (wb) blit(g, "wsx" + (15 & ~wb), 0, px, py);
    }
    if (SPR.cgx0 && atCoast(x, y)
        && (t === GRASS
            || (t === WALL && baseTerr && baseTerr[y * MW + x] === GRASS))) {
      const darkG = (a, b2) => {
        if (a < 0 || b2 < 0 || a >= MW || b2 >= MH) return false;
        if (atCoast(a, b2)) return false;
        const v = terr[b2 * MW + a];
        return v === GRASS
            || (v === WALL && baseTerr && baseTerr[b2 * MW + a] === GRASS);
      };
      const cb2 = (darkG(x, y - 1) ? 8 : 0) | (darkG(x + 1, y) ? 4 : 0)
                | (darkG(x, y + 1) ? 2 : 0) | (darkG(x - 1, y) ? 1 : 0);
      if (cb2) blit(g, "cgx" + cb2, 0, px, py);
    }
    if (t === DECK && SPR.dk_deck0) {
      {
        const marshDeck = (typeof inSwamp === "function") && inSwamp(x, y);
        const overWater = deckOverWater(x, y);
        blit(g, marshDeck ? (overWater ? swWater("water_plain")
                                       : groundTile(x, y, "swamp_grass"))
                          : groundTile(x, y, "sea"), 0, px, py);
      }
      const off = (a, b) =>
        a < 0 || b < 0 || a >= MW || b >= MH || terr[b * MW + a] !== DECK;
      const eN = off(x, y - 1) && SPR.dk_far;
      const eS = off(x, y + 1) && SPR.dk_lip;
      const eW = off(x - 1, y) && SPR.dk_wl;
      const eE = off(x + 1, y) && SPR.dk_wr;
      if (!eN && !eS && !eW && !eE)
        blit(g, ((x + y) & 1) ? "dk_deck0" : "dk_deck1", 0, px, py);
      if (eN) blit(g, "dk_far", 0, px, py);
      if (eS) blit(g, "dk_lip", 0, px, py);
      if (eW) blit(g, "dk_wl", 0, px, py);
      if (eE) blit(g, "dk_wr", 0, px, py);
    }
    if (t === DECK && SPR.hb_deck_f0) {
      {
        const marshDeck = (typeof inSwamp === "function") && inSwamp(x, y);
        const overWater = deckOverWater(x, y);
        blit(g, marshDeck ? (overWater ? swWater("water_plain")
                                       : groundTile(x, y, "swamp_grass"))
                          : groundTile(x, y, "sea"), 0, px, py);
      }
      {
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== SEA && v !== DECK && v !== WATER;
        };
        const cb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (cb && SPR.csx0 && !(typeof inSwamp === "function" && inSwamp(x, y)))
          blit(g, "csx" + cb, 0, px, py);   /* the world's bank, not the marsh's */
      }
      const on = (a, b) =>
        a >= 0 && b >= 0 && a < MW && b < MH && terr[b * MW + a] === DECK;
      const n = on(x, y - 1), s2 = on(x, y + 1);
      const w2 = on(x - 1, y), e = on(x + 1, y);
      let k = deckFix && deckFix.get(y * MW + x);
      if (k) { /* named by the map */ }
      else if (n && s2 && w2 && e) k = "f" + ((((x * 7 + y * 3) % 6) + 6) % 6);
      else if (!n && !w2) k = "tl";
      else if (!n && !e) k = "tr";
      else if (!s2 && !w2) k = "bl";
      else if (!s2 && !e) k = "br";
      else if (!n) k = "t";
      else if (!s2) k = "b";
      else if (!w2) k = "l";
      else k = "r";
      blit(g, "hb_deck_" + k, 0, px, py);
      {
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== SEA && v !== DECK && v !== WATER;
        };
        const cb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (cb && SPR.csx0 && !(typeof inSwamp === "function" && inSwamp(x, y)))
          blit(g, "csx" + cb, 0, px, py);   /* the world's bank, not the marsh's */
      }
      if (typeof inSwamp === "function" && inSwamp(x, y)) {
        const pk = deckPlank.get(y * MW + x);
        if (pk && SPR[pk]) blit(g, pk, 0, px, py);
      }
    }
    if (t === ROADSAND && SPR.rsx0) {
      const notRoad = (a, b) =>
        a < 0 || b < 0 || a >= MW || b >= MH || terr[b * MW + a] !== ROADSAND;
      const rb = (notRoad(x, y - 1) ? 8 : 0) | (notRoad(x + 1, y) ? 4 : 0)
               | (notRoad(x, y + 1) ? 2 : 0) | (notRoad(x - 1, y) ? 1 : 0);
      blit(g, "rsx" + rb, 0, px, py);   /* rsx0 is the plain interior */
    }
    if (!deep && (sandHere(x, y) || t === DIRT) && SPR.gsx0
        && !inSwamp(x, y) && !inWinter(x, y)) {
      const b = (grassHere(x, y - 1) ? 8 : 0) | (grassHere(x + 1, y) ? 4 : 0)
              | (grassHere(x, y + 1) ? 2 : 0) | (grassHere(x - 1, y) ? 1 : 0);
      if (b) blit(g, (atOasis(x, y) && SPR.gsd0 ? "gsd" : "gsx") + b,
                  0, px, py);
      else {
        if (grassHere(x - 1, y - 1)) blit(g, (atOasis(x, y) && SPR.dgsd_tl ? "dgsd_tl" : "gsd_tl"), 0, px, py);
        if (grassHere(x + 1, y - 1)) blit(g, (atOasis(x, y) && SPR.dgsd_tr ? "dgsd_tr" : "gsd_tr"), 0, px, py);
        if (grassHere(x - 1, y + 1)) blit(g, (atOasis(x, y) && SPR.dgsd_bl ? "dgsd_bl" : "gsd_bl"), 0, px, py);
        if (grassHere(x + 1, y + 1)) blit(g, (atOasis(x, y) && SPR.dgsd_br ? "dgsd_br" : "gsd_br"), 0, px, py);
      }
    }
    if ((t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === FARM)
        && !inDesert(x, y) && !inSwamp(x, y) && !inWinter(x, y)) {
      const m = nmask(x, y, (a, b2) => notGrass(a, b2) && !sandHere(a, b2));
      if (m && !sandHere(x, y - 1) && !sandHere(x, y + 1)
            && !sandHere(x - 1, y) && !sandHere(x + 1, y))
        blit(g, fringeTile(x, y, TERRT.gr.mask[m]), 0, px, py);
    }
  }

  for (const d of decks) {
    if (d.placed) continue;
    if ((d.x1 + 1) * TS < cx * CHUNK || (d.x0 - 1) * TS > (cx + 1) * CHUNK) continue;
    if ((d.y1 + 1) * TS < cy * CHUNK || d.y0 * TS > (cy + 1) * CHUNK) continue;
    for (let y = d.y0; y <= d.y1; y++) {
      const rn = y === d.y0 ? "t" : y === d.y1 ? "b" : "c";
      const rowName = (y === d.y0 || y === d.y1) ? "brg_m" + rn
                    : (SPR["brg_mf"] ? "brg_mf" : "brg_mc");
      for (let x = d.x0; x <= d.x1; x++) blit(g, rowName, 0, x * TS, y * TS);
      const capOnly = (v) => v === 2;
      if (d.cl && !(capOnly(d.cl) && rn === "c"))
        blit(g, "brg_l" + rn, 0, (d.x0 - 1) * TS, y * TS);
      if (d.cr && !(capOnly(d.cr) && rn === "c"))
        blit(g, "brg_r" + rn, 0, (d.x1 + 1) * TS, y * TS);
    }
  }

  for (const [self, key, same] of [
    [wet, "wa", wet],
    [(a, b) => T(a, b) === COBBLE, "cb", (a, b) => T(a, b) === COBBLE],
    [isMade, "gr", (a, b) => notGrass(a, b) && !sandHere(a, b)]
  ]) {
    const diag = TERRT[key].diag, corner = TERRT[key].corner;
    for (let y = ty0 - 1; y < ty0 + n + 1; y++) for (let x = tx0 - 1; x < tx0 + n + 1; x++) {
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
      if (!self(x, y) || nmask(x, y, same) !== 0) continue;
      if (typeof inSwamp === "function" && inSwamp(x, y)) continue;
      if (typeof inWinter === "function" && inWinter(x, y)) continue;
      for (let i = 0; i < diag.length; i++)
        if (!same(x + diag[i][0], y + diag[i][1])) blit(g, corner[i], 0, x * TS, y * TS);
    }
  }

  const sc = scatterChunks.get(chunkKey(cx, cy));
  if (sc) for (let i = 0; i < sc.length; i += 3) {
    if (!scatterFits(sc[i + 1], sc[i + 2], NAMES[sc[i]])) continue;
    const nm = NAMES[sc[i]], sp = SPR[nm];
    blit(g, nm, 0, sc[i + 1] - (sp[2] >> 1), sc[i + 2] - sp[3]);
  }
  return cv;
}

function getChunk(cx, cy) {
  const k = chunkKey(cx, cy);
  let c = chunks.get(k);
  if (!c) {
    c = { cv: renderChunk(cx, cy), used: ++chunkClock };
    chunks.set(k, c);
    if (chunks.size > CHUNK_CACHE) {
      let oldest = null, ok = -1;
      for (const [kk, cc] of chunks) if (oldest === null || cc.used < oldest) { oldest = cc.used; ok = kk; }
      chunks.delete(ok);
    }
  }
  c.used = ++chunkClock;
  return c.cv;
}

function invalidateTiles(indices) {
  for (const i of indices) {
    const x = i % MW, y = (i / MW) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
      chunks.delete(chunkKey(Math.floor((x + dx) * TS / CHUNK),
                             Math.floor((y + dy) * TS / CHUNK)));
  }
}

let deckPlank = new Map();
let deckCover = new Set();
function underDeck(x, y) { return deckCover.has(y * MW + x); }
function indexDecks() {
  deckPlank = new Map();
  deckCover = new Set();
  for (const d of decks) {
    if (d.placed) {
      for (let y = d.y0; y <= d.y1; y++)
        for (let x = d.x0; x <= d.x1; x++) deckCover.add(y * MW + x);
      continue;
    }
    for (let y = d.y0; y <= d.y1; y++) {
      const rn = y === d.y0 ? "t" : y === d.y1 ? "b"
               : (SPR["brg_mf"] ? "f" : "c");
      for (let x = d.x0; x <= d.x1; x++)
        deckPlank.set(y * MW + x, "brg_m" + rn);
    }
  }
}

function buildGround() { resetChunkWarm(); rebuildLavaNear(); chunks.clear(); indexScatter(); indexDecks(); }

function frameOf(nameIdx, t, seed) {
  const d = DEFS[nameIdx];
  if (!d || !d.f) return 0;
  const rate = d.fj ? d.f * (1 + d.fj * (((seed % 1) + 1) % 1)) : d.f;
  return Math.floor(t * rate + (d.s0 !== undefined ? d.s0 : seed)) | 0;
}

const PLAY_ACROSS = 14;    /* world tiles visible across */
const PLAY_DOWN = 9.5;     /* world tiles visible vertically */
const PLAY_MIN = 2.3, PLAY_MAX = 5.5;
function playZoom() {
  if (!VW || !VH) return 2.5;
  const interior = MAPID !== "world";
  const z = Math.min(VW / ((interior ? 13 : PLAY_ACROSS) * TS), VH / ((interior ? 9 : PLAY_DOWN) * TS));
  return Math.max(interior ? 2.15 : PLAY_MIN, Math.min(PLAY_MAX, z)) * (interior ? 1.03 * 0.99 : 0.9 * 1.02 * 1.02);
}
let cam = { x: 0, y: 0, z: 2.5 };
let mode = "play";
let camFree = false;            // "play" | "map"
let editing = false, selected = null;
let rockTiles = new Set();
let decorGone = new Set(), decorDel = [];
let decorMoved = new Map();
let felled = new Set(), felledNew = [];
let clearedBoxes = [];
let painting = false, paintT = GRASS, brush = 1;
let painted = new Map();      /* tileIndex -> terrain, for the patch export */
let groundDirty = false;
let terrOrig = null;          /* the generated terrain, to diff against */
let stroke = null;            /* tiles touched by the stroke in progress */
let undoStack = [];
const UNDO_LIMIT = 40;
let mapDirty = true;

function drawWorld(t, dt) {
  const z = cam.z;
  const vw = VW / z, vh = VH / z;
  ctx.fillStyle = MD.bg || "#1d2a1b";
  ctx.fillRect(0, 0, VW, VH);
  ctx.save();
  ctx.scale(z, z);
  ctx.translate(-cam.x, -cam.y);

  const k0 = Math.max(0, Math.floor(cam.x / CHUNK)), k1 = Math.floor((cam.x + vw) / CHUNK);
  const l0 = Math.max(0, Math.floor(cam.y / CHUNK)), l1 = Math.floor((cam.y + vh) / CHUNK);
  for (let cy = l0; cy <= l1 && cy * CHUNK < PXH; cy++)
    for (let cx = k0; cx <= k1 && cx * CHUNK < PXW; cx++)
      drawGameImage(ctx, getChunk(cx, cy), cx * CHUNK, cy * CHUNK);

  if (building && (cam.x + vw > PXW || cam.y + vh > PXH)) {
    ctx.save();
    ctx.strokeStyle = "rgba(120,160,110,.18)";
    ctx.lineWidth = 1 / z;
    const g = TS * 8;
    for (let x = Math.max(PXW, Math.floor(cam.x / g) * g); x < cam.x + vw; x += g) {
      ctx.beginPath(); ctx.moveTo(x, cam.y); ctx.lineTo(x, cam.y + vh); ctx.stroke();
    }
    for (let y = Math.floor(cam.y / g) * g; y < cam.y + vh; y += g) {
      if (y < PXH && cam.x + vw <= PXW) continue;
      ctx.beginPath(); ctx.moveTo(Math.max(cam.x, 0), y); ctx.lineTo(cam.x + vw, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(240,192,122,.5)";
    ctx.lineWidth = 2 / z;
    ctx.strokeRect(0, 0, PXW, PXH);      /* the current world edge */
    ctx.restore();
  }

  const LIVE = z >= 0.9;
  if (LIVE) {
    const wf = Math.floor(t * 6);
    const tx0 = Math.max(0, Math.floor(cam.x / TS)), tx1 = Math.min(MW - 1, Math.ceil((cam.x + vw) / TS));
    const ty0 = Math.max(0, Math.floor(cam.y / TS)), ty1 = Math.min(MH - 1, Math.ceil((cam.y + vh) / TS));
    const ws = SPR.water_mid, plain = SPR.water_plain;
    const wet = (a, b) => T(a, b) === WATER || T(a, b) === BRIDGE || T(a, b) === DECK;
    const wdiag = TERRT.wa.diag, wcorner = TERRT.wa.corner;

    const shoreF = Math.floor(t * 5) % 8;

    for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
      const tv = terr[y * MW + x];
      if (tv !== WATER && tv !== BRIDGE) continue;
      if (underDeck(x, y)) continue;
      if ((y > 0 && terr[(y - 1) * MW + x] === DECK) ||
          (y + 1 < MH && terr[(y + 1) * MW + x] === DECK) ||
          (x > 0 && terr[y * MW + x - 1] === DECK) ||
          (x + 1 < MW && terr[y * MW + x + 1] === DECK)) continue;
      if (tv === DWATER) continue;
      if (inDesert(x, y) && !worldWaterAt(x, y)) continue;
      const px = x * TS, py = y * TS;
      const m = nmask(x, y, wet);
      const marsh = (typeof inSwamp === "function") && inSwamp(x, y);
      if (m !== 0) {
        const sp = SPR[marsh ? swWater(TERRT.wa.mask[m]) : TERRT.wa.mask[m]];
        const sf = shoreF % sp[4];
        drawGameImage(ctx, atlasImg, sp[0] + sf * sp[2], sp[1], sp[2], sp[3], px, py, TS, TS);
        const pk = deckPlank.get(y * MW + x);
        if (pk) { const b = SPR[pk];
                  drawGameImage(ctx, atlasImg, b[0], b[1], b[2], b[3], px, py, TS, TS); }
        continue;
      }
      const pl2 = marsh && SPR.sw_water_plain ? SPR.sw_water_plain : plain;
      drawGameImage(ctx, atlasImg, pl2[0], pl2[1], pl2[2], pl2[3], px, py, TS, TS);
      for (let i = 0; i < wdiag.length; i++) {
        const dx = wdiag[i][0], dy = wdiag[i][1];
        if (!wet(x + dx, y + dy)) {
          const cs = SPR[marsh ? swWater(wcorner[i]) : wcorner[i]];
          const cf = shoreF % cs[4];
          drawGameImage(ctx, atlasImg, cs[0] + cf * cs[2], cs[1], cs[2], cs[3], px, py, TS, TS);
        }
      }
      const hsh = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      if (hsh % 100 < 22) {
        const gs = marsh && SPR.sw_water_mid ? SPR.sw_water_mid : ws;
        const f = (wf + (hsh >>> 7)) % gs[4];
        drawGameImage(ctx, atlasImg, gs[0] + f * gs[2], gs[1], gs[2], gs[3], px, py, TS, TS);
      }
      const pk = deckPlank.get(y * MW + x);
      if (pk) { const b = SPR[pk];
                drawGameImage(ctx, atlasImg, b[0], b[1], b[2], b[3], px, py, TS, TS); }
    }
    const c0b = Math.max(0, Math.floor(cam.x / CELL) - 1);
    const c1b = Math.min(CW - 1, Math.floor((cam.x + vw) / CELL) + 1);
    const r0b = Math.max(0, Math.floor(cam.y / CELL) - 1);
    const r1b = Math.min(CH - 1, Math.floor((cam.y + vh) / CELL) + 1);
    for (let r = r0b; r <= r1b; r++) for (let c = c0b; c <= c1b; c++) {
      const b = sbuckets[r * CW + c];
      for (let i = 0; i < b.length; i += 3) {
        const s = SPR[NAMES[b[i]]], px = b[i + 1], py = b[i + 2];
        if (!s) continue;
        if (px + (s[2] >> 1) < cam.x || px - (s[2] >> 1) > cam.x + vw ||
            py < cam.y || py - s[3] > cam.y + vh) continue;
        if (!scatterFits(px, py, NAMES[b[i]])) continue;
        const d = DEFS[b[i]];
        const f = Math.floor(t * (d && d.f ? d.f : 6) + ((px * 7 + py * 13) % 8)) % s[4];
        const fx = px - (s[2] >> 1), fy = py - s[3];
        if (((px * 31 + py * 17) & 4) !== 0) {
          ctx.save(); ctx.translate(fx + s[2], fy); ctx.scale(-1, 1);
          drawGameImage(ctx, atlasImg, s[0] + f * s[2], s[1], s[2], s[3], 0, 0, s[2], s[3]);
          ctx.restore();
        } else {
          drawGameImage(ctx, atlasImg, s[0] + f * s[2], s[1], s[2], s[3], fx, fy, s[2], s[3]);
        }
      }
    }
  }

  drawBlooms();
  drawGraves();

  const draw = [];
  for (const actor of (MD.roomActors || [])) if(!actor.editorDeleted)draw.push(actor);
  if (trialDemonHere()) draw.push({witchDemon:true,...(MAPID==="witchmoor"?{x:196,y:304}:THRONE_DEMON)});
  if (trialPedestalHere()) draw.push({ trialPedestal: true, x: TRIAL_PEDESTAL.x,
                                      y: TRIAL_PEDESTAL.y, sy: TRIAL_PEDESTAL.y });
  const c0 = Math.max(0, Math.floor(cam.x / CELL) - 1);
  const c1 = Math.min(CW - 1, Math.floor((cam.x + vw) / CELL) + 1);
  const r0 = Math.max(0, Math.floor(cam.y / CELL) - 1);
  const r1 = Math.min(CH - 1, Math.floor((cam.y + vh) / CELL) + 1);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++)
    for (const o of buckets[r * CW + c]) {
      const s = SPR[NAMES[o.s]];
      if (!s) continue;
      const oxw = o.wx || 0, oyw = o.wy || 0;
      if (o.x + oxw + s[2] / 2 < cam.x || o.x + oxw - s[2] / 2 > cam.x + vw) continue;
      if (o.y + oyw < cam.y || o.y + oyw - s[3] > cam.y + vh) continue;
      const wd = DEFS[o.s];
      if (wd && wd.wd && !editing) wanderStep(o, wd, dt);
      draw.push(o);
    }
  for (const n of npcs) {
    if (typeof npcHere === "function" && !npcHere(n)) continue;
    if (n.x < cam.x - 64 || n.x > cam.x + vw + 64) continue;
    if (n.y < cam.y - 64 || n.y > cam.y + vh + 64) continue;
    draw.push(n);
  }
  for(const r of MD.moorings||[]){
    if(Math.max(r[0],r[2])<cam.x-32||Math.min(r[0],r[2])>cam.x+vw+32||Math.max(r[1],r[3])<cam.y-32||Math.min(r[1],r[3])>cam.y+vh+32)continue;
    draw.push({mooring:r,x:r[0],y:r[1],sy:Math.max(r[1],r[3])-4});
  }
  if(stonePreview)draw.push({foe:stonePreview,nm:stonePreview.nm,x:stonePreview.x,y:stonePreview.y});
  if(MD.templeContinuous)drawChest();
  drawTempleShots();
  drawDragonTempleTraps();
  draw.push(P);
  if (dragonHere() && dragon.on && !dragonAirborne() &&
      !(typeof mounted !== "undefined" && mounted))
    draw.push({ dg: true, x: dragon.x, y: dragon.y });
  if (hatchScene && MAPID === "world")
    draw.push({ hatchActor: true,
                x: hatchScene.stage < 7 ? hatchScene.x : hatchScene.dragonX,
                y: hatchScene.stage < 7 ? hatchScene.y : hatchScene.dragonY });
  if (bell) draw.push({ bell: true, x: bell.x, y: bell.y });
  const topOf = (o) => (o.s !== undefined && DEFS[o.s] && DEFS[o.s].t) ? 1 : 0;
  const isFab = (o) => o.s !== undefined && FABRIC.test(NAMES[o.s] || "");
  const sortY = (o) => isFab(o) ? -1e9
                     : (o.sy !== undefined ? o.sy : o.y) + (o.wy || 0)
                     + ((o.s !== undefined && /^rc_sup1_/.test(NAMES[o.s])) ? 40 : 0)
                     + ((o.s !== undefined && DEFS[o.s] && DEFS[o.s].sy) ? DEFS[o.s].sy : 0);
  const underfoot = (o) => o.s !== undefined &&
    /^(hb_stair_[es]$|rc_(ores|cavedec|ladder|floor|rails)|ifloor|iwall_)/.test(NAMES[o.s]);
  for (const f of foes) {
    const P_ = ((FOE_BORROW[f.kind] || {})[
                  f.st === "swing" ? "atk" : (f.st === "dead" || f.st === "down" || f.st === "rise") ? "die"
                : f.hurt > 0 ? "hurt" : ""])
            || FOE_ART[f.kind] || "sk";
    const D_ = foeDir(f.dir, f.flip);
    const recovering = /^(?:(gm|gn|pl|lc|rp|dv|ent|bh|ms|gh|bs)[123]|bg|kn|kn3)$/.test(P_) &&
      f.st === "swing" && f.t >= FOE[f.kind].swingT;
    const drawKey = P_ + "|" + f.st + "|" + D_ + "|" + (f.hurt > 0 ? 1 : 0) + "|" + (recovering ? 1 : 0);
    let nm = f._drawKey === drawKey ? f._drawNm : null;
    if (!nm) {
      const pick = (...c) => c.find(n => SPR[n]) || c[c.length - 1];
      nm = f.hurt > 0 && f.st !== "dead"
                               ? pick(P_ + "_hurt_" + D_, P_ + "_idle_" + D_, P_ + "_idle")
             : (f.st === "dead" || f.st === "down" || f.st === "rise") ? pick(P_ + "_die_" + D_,  P_ + "_die",  P_ + "_idle_d", P_ + "_idle")
             : f.st === "escape" ? pick(P_ + "_run_" + D_, P_ + "_walk_" + D_, P_ + "_idle_d")
             : f.st === "swing" && !recovering ? pick(P_ + "_atk_" + D_,  P_ + "_atk_d", P_ + "_idle_d", P_ + "_idle")
             : f.st === "walk"  ? pick(P_ + "_walk_" + D_, P_ + "_walk", P_ + "_idle_d", P_ + "_idle")
             :                    pick(P_ + "_idle_" + D_, P_ + "_idle", P_ + "_idle_d");
      f._drawKey = drawKey; f._drawNm = nm;
    }
    if(f.reverseRise>0)nm=SPR[P_+"_die_"+D_]?P_+"_die_"+D_:SPR[P_+"_die"]?P_+"_die":nm;
    if (f.kind === "kdragon") nm=kingDragonSprite(f);
    const fs = SPR[nm];
    // Keep remote waves and dead bodies out of the per-frame sort/draw list.
    // Their state still advances, so entering the area behaves exactly as before.
    if (fs && f.x + fs[2] / 2 >= cam.x - 48 && f.x - fs[2] / 2 <= cam.x + vw + 48 &&
              f.y >= cam.y - 48 && f.y - fs[3] <= cam.y + vh + 48)
      draw.push({ foe: f, nm, x: f.x, y: f.y });
  }
  if (arenaLock && arenaT > 0) {
    const fn = SPR["vfence0_0"] ? "vfence0_0" : (SPR["swall_post"] ? "swall_post" : null);
    if (fn) {
      const rise = Math.min(1, arenaT);
      for (const [tx, ty] of arenaRim(arenaLock)) {
        if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
        const ix = tx * TS + TS / 2, iy = ty * TS + TS;
        if (ix < cam.x - 64 || ix > cam.x + vw + 64 ||
            iy < cam.y - 96 || iy > cam.y + vh + 96) continue;
        draw.push({ fence: fn, rise, x: ix, y: iy,
                    sy: (MAPID === "world") ? iy : 1e9 });
      }
    }
  }
  if (MAPID === "world" && birdsUp < 9)
    for (const b of BIRDS) {
      if (b.x > cam.x - 64 && b.x < cam.x + vw + 64 &&
          b.y > cam.y - 64 && b.y < cam.y + vh + 64)
        draw.push({ bird: b, x: b.x, y: b.y, sy: b.y + 200 });
    }
  if (MAPID === "world" && herdHere())
    for (const [hx, spr] of HERD) {
      const ix = hx * TS + TS / 2, iy = HERD_Y * TS + TS;
      if (ix > cam.x - 64 && ix < cam.x + vw + 64 &&
          iy > cam.y - 64 && iy < cam.y + vh + 64)
        draw.push({ item: { spr, anim: true }, x: ix, y: iy, t: hx * 0.7 });
    }
  for (const it of ITEMS) {
    if ((it.map || "world") !== MAPID || !itemHere(it)) continue;
    const ix = it.tx * TS + TS / 2, iy = it.ty * TS + TS;
    if (ix > cam.x - 64 && ix < cam.x + vw + 64 &&
        iy > cam.y - 64 && iy < cam.y + vh + 64)
      if (it.map) draw.push({ item: it, x: ix, y: iy, sy: iy });
  }
  if (MAPID === "world")
    for (const it of ITEMS) {
      if (!itemHere(it)) continue;
      let lift = it.dy || 0;
      if (it.onTop && SPR[it.onTop]) {
        const u = SPR[it.onTop];
        const top = (ATLAS.flattop && ATLAS.flattop[it.onTop]) || 2;
        lift = -(u[3] - top);      /* stand it on the surface, not the base */
      }
      const ix = it.tx * TS + TS / 2, iy = it.ty * TS + TS + lift;
      if (ix > cam.x - 64 && ix < cam.x + vw + 64 &&
          iy > cam.y - 64 && iy < cam.y + vh + 64)
        draw.push({ item: it, x: ix, y: iy, sy: it.ty * TS + TS + 1 });
    }
  if (MAPID === GREEN.map && SPR.lg_fly_e && quest === Q.ARMED && greenT >= 0) {
    const g = greenAt();
    if (g.x > cam.x - 96 && g.x < cam.x + vw + 96 &&
        g.y > cam.y - 96 && g.y < cam.y + vh + 96)
      draw.push({ green: true, x: g.x, y: g.y });
  }
  for (const b of bolts) {
    const nm = b.art + "_" + b.dir;
    if (!SPR[nm]) continue;
    if (b.x < cam.x - 64 || b.x > cam.x + vw + 64 ||
        b.y < cam.y - 64 || b.y > cam.y + vh + 64) continue;
    const fr = 1 + (Math.floor(b.t * 12) % 2);
    draw.push({ bolt: b, nm, fr, x: b.x, y: b.y });
  }
  for (const a of anims) {
    const nm = a.prefix + Math.min(a.count - 1, Math.floor(a.t));
    if (SPR[nm] && a.x >= cam.x - 96 && a.x <= cam.x + vw + 96 &&
                   a.y >= cam.y - 96 && a.y <= cam.y + vh + 96)
      draw.push({ anim: a, nm, x: a.x, y: a.y });
  }
  if (glassShieldActive() || glassShieldPulse > 0) draw.push({ glassShieldFx:true, x:P.x, y:P.y, sy:P.y+80 });
  const mouth = (o) => o.s !== undefined &&
    /^(wf_cave|dg_mouth|rc_cave)/.test(NAMES[o.s] || "");
  draw.push({ portalLayer: true, x: 0, y: 0 });
  const groundLayer = o => o.roomBackgroundPatch || underfoot(o) ? 0 : o.portalLayer ? 1 : 2;
  draw.sort((a, b) => (groundLayer(a) - groundLayer(b)) || ((a === P && mouth(b)) ? 1 : (b === P && mouth(a)) ? -1 : 0)
                   || (sortY(a) - sortY(b))
                   || ((underfoot(a) ? 0 : 1) - (underfoot(b) ? 0 : 1))
                   || (topOf(a) - topOf(b)));

  for (const o of draw) {
    if(o.mooring){
      const [x1,y1,x2,y2]=o.mooring;ctx.save();ctx.beginPath();ctx.moveTo(x1,y1);
      ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+5,x2,y2);
      ctx.strokeStyle='#514333';ctx.lineWidth=3;ctx.stroke();
      ctx.strokeStyle='#b6a079';ctx.lineWidth=1;ctx.stroke();ctx.restore();
      // Original pack knot and hanging rope, aligned over the mooring post.
      blit(ctx,'hb_mooring_knot',0,x1-5,y1-5);continue;
    }
    if (o.portalLayer) { drawRise(); drawSaintBuff(); continue; }
    if (o.school) continue; // Native school animation patches draw these seated characters.
    if(o.roomBackgroundPatch){
      const {spr,rect:[sx,sy,w,h]}=o.roomBackgroundPatch,s=SPR[spr];
      if(s)drawGameImage(ctx,atlasImg,s[0]+sx,s[1]+sy,w,h,o.x,o.y,w,h);
      continue;
    }
    if(o.roomCrop){
      const [x,y,w,h]=o.roomCrop,s=SPR[MD.roomArt];
      if(s)drawGameImage(ctx,atlasImg,s[0]+x,s[1]+y,w,h,x,y,w,h);
      continue;
    }
    if (o.throneRoomAsset) {
      // Compact RPG-scale throne. Keep the feet/base at actor y so it sorts
      // naturally behind Halvard and against the north wall.
      if (throneRoomImg.complete && throneRoomImg.naturalWidth) {
        const dw=54, dh=Math.round(dw*throneRoomImg.naturalHeight/throneRoomImg.naturalWidth);
        ctx.imageSmoothingEnabled=false;
        ctx.drawImage(throneRoomImg,Math.round(o.x-dw/2),Math.round(o.y-dh),dw,dh);
      }
      continue;
    }
    if (o.schoolArt) {
      const sp = SPR[o.spr];
      let fr = o.stillFrame ?? (o.glassHatch ? glassHatchFrame() : Math.floor(t / 0.15) % sp[4]);
      if (o.royalDoor || o.smithDoor || /^(Doors|Animation_windows_doors)\.png$/.test(o.source || "")) {
        fr = 0;
        if (doorMotion && doorMotion.map === MAPID && !doorMotion.d.stairDown &&
            Math.abs(o.x - (doorMotion.d.triggerRect ? doorMotion.d.triggerRect.x + doorMotion.d.triggerRect.w/2 : doorMotion.d.x * TS + 8)) < 28 &&
            Math.abs(o.y - (doorMotion.d.y * TS + 16)) < 36) {
          const progress = Math.min(1, doorMotion.t / doorMotion.duration);
          fr = sp[4] >= 12 ? Math.min(7, 4 + Math.floor(progress * 4))
                          : Math.min(sp[4] - 1, Math.floor(progress * sp[4]));
        }
      }
      if(Number.isInteger(o.templeMachine))fr=MD.templeMachines[o.templeMachine].type==='cannon'?MD.templeMachines[o.templeMachine].frame:Math.min(2,MD.templeMachines[o.templeMachine].frame);
      if(o.spr==='scientist_skull')fr=Math.floor(t*5)%sp[4];
      if(o.templeSpike)fr=templeSpikeFrame(o.templeSpike,o.trapRow);
      if(o.templeLever){const h=MD.templeTraps.find(h=>h.id===o.templeLever);fr=Math.min(4,Math.floor((h.leverOpen||0)*5));}
      if(Number.isInteger(o.templeGate))fr=Math.min(sp[4]-1,Math.floor(MD.templeGates[o.templeGate].open*sp[4]));
      if(o.templePassDoor){const near=Math.abs(P.x-o.x)<40&&Math.abs(P.y-o.y)<85;o.openT=Math.max(0,Math.min(.3,(o.openT||0)+(near?dt:-dt)));fr=Math.min(sp[4]-1,Math.floor(o.openT/.3*sp[4]));}
      const visibleH=Number.isFinite(o.chairClipY)?Math.max(0,Math.min(sp[3],o.chairClipY-(o.y-sp[3]))):sp[3];
      if(o.statueTint){drawGameImage(ctx,tintFoe(sp,fr,o.statueTint,.65),o.x-sp[2]/2,o.y-sp[3],sp[2],sp[3]);continue;}
      if(visibleH>0)drawGameImage(ctx, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], visibleH,
        o.x - sp[2] / 2, o.y - sp[3], sp[2], visibleH);
      continue;
    }
    if (o.witchDemon) {
      const sp = SPR.witch_demon;
      const fr = Math.floor(t * 6) % sp[4];
      const bob = Math.round(Math.sin(t * 2.4) * 2);
      ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = "#201127";
      ctx.beginPath(); ctx.ellipse(o.x, o.y - 4, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      drawGameImage(ctx, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
        o.x - 40, o.y - 80 - bob, 80, 80);
      continue;
    }
    if (o.trialPedestal) { drawTrialPedestal(); continue; }
    if (o.hatchActor) {
      const hs = hatchScene;
      if (!hs) continue;
      if (hs.stage < 7) {
        const sp = SPR.it_egg;
        if (!sp) continue;
        const strength = hs.stage < 5 ? 0 : hs.stage === 5 ? 1 : 3;
        const ox = strength ? Math.round(Math.sin(hs.t * (hs.stage === 5 ? 16 : 28)) * strength) : 0;
        drawGameImage(ctx, sheetOf(sp), sp[0], sp[1], sp[2], sp[3],
                      Math.round(hs.x - sp[2] / 2) + ox, Math.round(hs.y - sp[3]), sp[2], sp[3]);
      } else {
        const dir = hs.dir || "s";
        const artDir = dir === "w" && !SPR.dr5_idle_w ? "e" : dir;
        const action = hs.walking ? "walk" : "idle";
        const nm = SPR["dr5_" + action + "_" + artDir] ? "dr5_" + action + "_" + artDir : "drf_s";
        const sp = SPR[nm];
        if (!sp) continue;
        const fr = Math.floor((hs.walking ? hs.walkT * 8 : hs.t * 5) * sp[4] / 5) % sp[4];
        const DS = DRAGON_DRAW_SCALE;
        const dw = Math.round(sp[2] * DS), dh = Math.round(sp[3] * DS);
        const px = Math.round(hs.dragonX - dw / 2), py = Math.round(hs.dragonY - dh);
        if (dragonFlip(dir)) {
          ctx.save(); ctx.translate(px + dw, py); ctx.scale(-1, 1);
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          drawGameImage(ctx, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, dw, dh);
          ctx.imageSmoothingEnabled = false;
          ctx.restore();
        } else {
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          drawGameImage(ctx, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3], px, py, dw, dh);
          ctx.imageSmoothingEnabled = false;
        }
      }
      continue;
    }
    if (o.dg) { drawDragon(); continue; }
    if (o.bell) { drawBell(); continue; }
    if (o.fence) {
      const sp = SPR[o.fence];
      const TALL = 2;                       /* stacked, so it reads as a wall */
      const full = sp[3] * TALL;
      const h = Math.round(full * o.rise);
      const px = Math.round(o.x - sp[2] / 2), py = Math.round(o.y);
      for (let k = 0; k < TALL && h > 0; k++) {
        const top = (TALL - 1 - k) * sp[3];
        const vis = Math.max(0, Math.min(sp[3], h - top));
        if (vis <= 0) continue;
        drawGameImage(ctx, sheetOf(sp), sp[0], sp[1] + (sp[3] - vis), sp[2], vis,
                      px, py - top - vis, sp[2], vis);
      }
      continue;
    }
    if (o.bird) {
      const b = o.bird;
      if (b.nest && !birdsUp && SPR.nest1) {
        const nn = SPR.nest1;
        drawGameImage(ctx, atlasImg, nn[0], nn[1], nn[2], nn[3],
                      Math.round(o.x - nn[2] / 2) + 7,
                      Math.round(o.y - nn[3]) + 6, nn[2], nn[3]);
      }
      const sp = SPR[birdsUp ? "bd_fly" : "bd_sit"];
      if (!sp) continue;
      const fr = Math.floor(t * (birdsUp ? 12 : 4) + b.t) % sp[4];
      const west = b.vx > 0;   /* the art faces west; mirror to go east */
      const dx = Math.round(o.x - sp[2] / 2), dy = Math.round(o.y - sp[3]);
      if (west) {
        ctx.save(); ctx.translate(dx + sp[2], dy); ctx.scale(-1, 1);
        drawGameImage(ctx, smImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
                      0, 0, sp[2], sp[3]);
        ctx.restore();
      } else {
        drawGameImage(ctx, smImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
                      dx, dy, sp[2], sp[3]);
      }
      continue;
    }
    if (o.item) {
      const s2 = SPR[o.item.spr];
      const fr = (o.item.anim && s2 && s2[4] > 1)
        ? Math.floor(t * 4 + (o.t || 0)) % s2[4] : 0;
      if (s2) drawGameImage(ctx, s2[5] === 2 ? smImg : s2[5] ? dragonImg : atlasImg,
                            s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                            Math.round(o.x - s2[2] / 2), Math.round(o.y - s2[3]),
                            s2[2], s2[3]);
      continue;
    }
    if (o.green) {
      const row = greenPhase === "crash" ? 1
        : greenPhase === "sit" ? 2
        : greenPhase === "rise" ? 3 : 0;
      /* The art frames vary more than a resting, injured dragon should. Hold
         the anchored pose and use only a one-pixel chest pulse—no skating. */
      const f = greenPhase === "sit" ? 0
        : greenPhase === "crash" ? Math.min(5, Math.floor(greenP * 6))
        : greenPhase === "rise" ? Math.min(5, Math.floor(greenP * 6))
        : Math.floor(performance.now() / 1000 * GREEN.fps) % 6;
      const off = greenOffset() || [0, 0];
      const w2 = GREEN_SCENE_DRAW, h2 = w2 * GREEN_SCENE_CEL_H / GREEN_SCENE_CEL_W;
      const ddx = Math.round(o.x - w2 / 2 + off[0]);
      const ddy = Math.round(o.y - h2 + off[1]);
      const breathe = greenPhase === "sit" && Math.floor(performance.now() / 650) % 2 ? 2 : 0;
      const drawH = h2 - breathe;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (dragonFlip(dragon.dir)) {
        ctx.translate(ddx + w2, ddy); ctx.scale(-1, 1);
        drawGameImage(ctx, greenSceneImg, f * GREEN_SCENE_CEL_W, row * GREEN_SCENE_CEL_H,
                      GREEN_SCENE_CEL_W, GREEN_SCENE_CEL_H, 0, h2 - drawH, w2, drawH);
      } else {
        drawGameImage(ctx, greenSceneImg, f * GREEN_SCENE_CEL_W, row * GREEN_SCENE_CEL_H,
                      GREEN_SCENE_CEL_W, GREEN_SCENE_CEL_H, ddx, ddy + h2 - drawH, w2, drawH);
      }
      ctx.restore();
      continue;
    }
    if (o.foe) {
      const f = o.foe, s2 = SPR[o.nm];
      const k = FOE[f.kind];
      if (f.sceneHidden) continue;
      ctx.globalAlpha = f.sceneAlpha === undefined ? 1 : f.sceneAlpha;
      const fr = f.reverseRise>0 ? Math.min(s2[4]-1,Math.max(0,Math.ceil(f.reverseRise/f.reverseRiseMax*s2[4])-1))
        : f.storyKnight && f.st === "down" ? s2[4] - 1
        : f.storyKnight && f.st === "rise" ? Math.max(0, s2[4] - 1 - Math.floor((f.storyT || 0) / .65 * s2[4]))
        : f.storyKnight && f.st === "escape" ? Math.floor((f.storyT || f.t) * 10) % s2[4]
        : /^(?:(pl|lc|rp|dv|ent|bh|ms|gh|bs)[123]|bg|kn|kn3)_/.test(o.nm) ? golemFrame(f, s2, o.nm, k, 4)
        : /^gn[123]_/.test(o.nm) ? golemFrame(f, s2, o.nm, k, 4)
        : /^gm[123]_/.test(o.nm) ? golemFrame(f, s2, o.nm, k)
        : f.st === "dead"
        ? Math.min(s2[4] - 1, Math.floor(f.t * 8))
        : Math.floor(f.t * (f.st === "swing" ? 3.3 : 6)) % s2[4];
      const dx = Math.round(f.x - s2[2] / 2), dy = Math.round(f.y - s2[3] + ((f.kind === "royalguard" || f.kind === "treasuryknight") ? 20 : 0));
      if (f.hurt > 0 && !SPR[(FOE_ART[f.kind] || "sk") + "_hurt_d"])
        ctx.globalAlpha = 0.45;
      if (false) {
        ctx.save(); ctx.translate(dx + s2[2], dy); ctx.scale(-1, 1);
        drawGameImage(ctx, atlasImg, s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                      0, 0, s2[2], s2[3]);
        ctx.restore();
      } else if (f.emerge !== undefined && f.emerge < 1) {
        const e = f.emerge;
        const h = s2[3];
        const under = Math.round(h * (1 - e));   /* how far down it still is */
        const sh = h - under;                    /* the part above ground */
        if (sh > 0) {
          const src = f.raised ? tintFoe(s2, fr, "#a85ce8", 0.68) : null;
          ctx.save();
          ctx.globalAlpha = (ctx.globalAlpha || 1) * Math.min(1, 0.35 + e * 0.9);
          if (src) drawGameImage(ctx, src, 0, 0, s2[2], sh,
                                 dx, f.y - sh, s2[2], sh);
          else drawGameImage(ctx, atlasImg, s2[0] + fr * s2[2], s2[1],
                             s2[2], sh, dx, f.y - sh, s2[2], sh);
          ctx.restore();
        }
      } else if (f.kind === "kdragon") {
        const ks = /^kdnew_death_/.test(o.nm) ? KING_DRAGON_DEATH_DRAW_SCALE
                 : /^kdnew_/.test(o.nm) ? KING_DRAGON_DRAW_SCALE : 1;
        const kw = Math.round(s2[2] * ks), kh = Math.round(s2[3] * ks);
        const kdx = Math.round(f.x - kw / 2), kdy = Math.round(f.y - kh);
        if (f.hurt > 0) {
          const kick = Math.round(Math.sin(f.hurt * 34) * 4 * f.hurt);
          drawGameImage(ctx, tintFoe(s2, fr, "#ff4028", 0.55 * Math.min(1, f.hurt * 2)),
                        0, 0, s2[2], s2[3], kdx + kick, kdy - Math.round(f.hurt * 3), kw, kh);
        } else {
          drawGameImage(ctx, sheetOf(s2), s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                        kdx, kdy, kw, kh);
        }
        drawKingShield(f);
        /* The open-mouth attack frames now launch a real projectile from
           kingDragonMouth() at their impact beat; no decorative flame overlay. */
        if (f.st !== "dead") drawKingDragonHeadVitals(f, kdx, kdy, kw);
      } else if (f.mad > 0 && !f.ally) {
        drawGameImage(ctx, tintFoe(s2, fr, "#d83232", 0.6), dx, dy);
      } else if (f.kind === "wraith" && /^gh1_/.test(o.nm)) {
        drawGameImage(ctx, darkFoe(s2, fr, "#4a3a6a"), dx, dy);
      } else if (f.raised) {
        ctx.save();
        ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.5;
        const hl = tintFoe(s2, fr, "#c98cff", 1);
        for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1],
                                [-1, -1], [1, -1], [-1, 1], [1, 1]])
          drawGameImage(ctx, hl, dx + ox, dy + oy);
        ctx.restore();
        drawGameImage(ctx, tintFoe(s2, fr, "#a85ce8", 0.68), dx, dy);
      } else {
        drawGameImage(ctx, sheetOf(s2), s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                      dx, dy, s2[2], s2[3]);
      }
      if (f.kind === "lich") drawKingShield(f);
      if (f.st === "wind") {
        if (f.kind === "kdragon") {
          const ks = /^kdnew_/.test(o.nm) ? KING_DRAGON_DRAW_SCALE : 1;
          drawEnemyAttackTell(f,s2,fr,Math.round(f.x-s2[2]*ks/2),Math.round(f.y-s2[3]*ks),ks);
        } else drawEnemyAttackTell(f,s2,fr,dx,dy,1);
      }
      ctx.globalAlpha = 1;
      ctx.globalAlpha = 1;
      const fMaxHp = enemyMaxHp(f.kind, Number.isFinite(f.hx) ? f.hx : f.x);
      if (f.st !== "dead" && f.kind !== "kdragon" && !(f.storyKnight && f.storyPassive)) {
        const bw = f.kind === "treasuryknight" ? 32 : 18, bh = 3;
        const bx = Math.round(f.x - bw / 2), by = dy + (/^golem[123]$/.test(f.kind) ? foeVisibleTop82(s2,fr)-6 : ((f.kind === "royalguard" || f.kind === "treasuryknight") ? 12 : -5));
        ctx.fillStyle = "#1a1416";
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = "#4a2b2b";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = f.hp > fMaxHp * 0.6 ? "#5fbf4a"
                      : f.hp > 1 ? "#d8a13a" : "#d2443a";
        ctx.fillRect(bx, by, Math.max(1, Math.round(bw * f.hp / fMaxHp)), bh);
      }
      continue;
    }
    if (o.bolt) {
      const s2 = SPR[o.nm];
      const fw = s2[2];
      drawGameImage(ctx, atlasImg, s2[0] + o.fr * fw, s2[1], fw, s2[3],
                    Math.round(o.x - fw / 2), Math.round(o.y - s2[3] / 2), fw, s2[3]);
      continue;
    }
    if (o.glassShieldFx) { drawGlassShield(); continue; }
    if (o.anim) {
      const s2 = SPR[o.nm];
      const frame = /^wm_pot_/.test(o.nm) ? Math.floor(t * 8) % s2[4] : 0;
      drawGameImage(ctx, atlasImg, s2[0] + frame * s2[2], s2[1], s2[2], s2[3],
                    Math.round(o.x - s2[2] / 2), Math.round(o.y - s2[3]), s2[2], s2[3]);
      continue;
    }
    if (o === P) {
      if (doorMotion && doorMotion.map === MAPID && doorMotion.d.stairDown) {
        const k = Math.min(1, doorMotion.t / doorMotion.duration);
        const sp = SPR[(mounted ? (hasSword() ? "sm_" : "fm_") : corinKit()) + "walk_" + smDir("s", doorMotion.d.dir !== "r")];
        const fr = Math.floor(doorMotion.t * 10) % sp[4];
        ctx.save(); ctx.beginPath(); ctx.rect(P.x - 48, P.y - 80, 96, 78); ctx.clip();
        drawGameImage(ctx, corinSheet(), sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
          Math.round(P.x - sp[2] / 2 + (doorMotion.d.dir === "r" ? 12 : -12) * k), Math.round(P.y - sp[3] + corinFeetOffset() + 20 * k), sp[2], sp[3]);
        ctx.restore(); continue;
      }
      if (P.act && !mounted) {
        const sp = ACT[P.act.kind];
        const base = (mounted ? (hasSword() ? "sm_" : "fm_") : corinKit()) + sp.anim + "_"
                   + corinDirection(P.act);
        const s = SPR[base];
        if (s) {
          const f = Math.min(s[4] - 1, Math.floor(P.act.t / sp.frames * s[4]));
          const dx = Math.round(P.x - s[2] / 2), dy = Math.round(P.y - s[3] + corinFeetOffset());
          drawGameImage(ctx, corinSheet(), s[0] + f * s[2], s[1], s[2], s[3],
                        dx, dy, s[2], s[3]);
          if (P.act.kind === "swing" && hasSword()) {
            const k = P.act.t / ACT.swing.frames;
            if (k > 0.2 && k < 0.8) {
              const d = corinDirection(P.act);
              const tail = (d === "u" ? "u" : d === "d" ? "d" : "s");
              const sl = (P.act.hot && SPR["fslash_" + tail])
                         ? SPR["fslash_" + tail] : SPR["slash_" + tail];
              if (sl) {
                const ax = d === "e" ? 14 : d === "w" ? -14 : 0;
                const ay = d === "u" ? -14 : d === "d" ? 10 : -4;
                const px0 = Math.round(P.x + ax - sl[2] / 2);
                const py0 = Math.round(P.y - 20 + ay - sl[3] / 2);
                ctx.save();
                ctx.globalAlpha = Math.sin((k - 0.2) / 0.6 * Math.PI);
                if (d === "w") {          /* the side arc mirrors for the west */
                  ctx.translate(px0 + sl[2], py0);
                  ctx.scale(-1, 1);
                  drawGameImage(ctx, atlasImg, sl[0], sl[1], sl[2], sl[3], 0, 0, sl[2], sl[3]);
                } else {
                  drawGameImage(ctx, atlasImg, sl[0], sl[1], sl[2], sl[3],
                                px0, py0, sl[2], sl[3]);
                }
                ctx.restore();
              }
            }
          }
          continue;
        }
      }
      if (ride) drawFerry(ctx);
      const kit = mounted ? (hasSword() ? "sm_" : "fm_") : corinKit();
      const nm = kit + (!P.moving ? "idle" : running ? "run" : "walk")
                 + "_" + corinDirection();
      if (typeof mounted !== "undefined" && mounted && dragonHere()) {
        const st = dragon.air ? (P.moving ? "fly" : "hover") : !P.moving ? "idle" : running ? "run" : "walk";
        const rd = playerFacing4(P.act);
        const wantW = rd === "w";
        const tr = dragon.tr && dragon.tr.kind;
        const want = tr === "up" ? "up" : tr === "down" ? "down"
                   : breath ? (dragon.air ? "ffire" : "fire")
                   : (st === "run" ? "walk" : st);
        const mountKit = "corinride_" + (smithUpgrade ? "armor_" : "sword_");
        const mountedAttack = P.act && P.act.kind === "swing";
        const mountAction = mountedAttack ? "atk" : want;
        const hasW = wantW && !!SPR[mountKit + mountAction + "_w"];
        const flip = wantW && !hasW;
        const key = wantW ? (hasW ? "w" : "e") : rd;
        const rs = SPR[mountKit + mountAction + "_" + key]
                || SPR[mountKit + st + "_" + key]
                || SPR[mountKit + "idle_s"];
        if (rs) {
          const side = key === "e" || key === "w";
          const fps = st === "idle" ? 3.5
                    : (st === "fly" || st === "hover") ? (side ? 2.6 : 3.4)
                    : 6;
          const rf = mountedAttack
            ? Math.min(rs[4] - 1, Math.floor(P.act.t / ACT.swing.frames * rs[4]))
            : dragon.tr
            ? Math.min(rs[4] - 1, Math.floor(dragon.tr.t / dragon.tr.n * rs[4]))
            : Math.floor(P.t * fps * rs[4] / 3) % rs[4];
          const RS = 0.448;
          const dw = Math.round(rs[2] * RS), dh = Math.round(rs[3] * RS);
          const RIDEDROP = 14;
          const lift = (dragon.air ? Math.round(Math.sin(P.t * 2.0) * 3) : 0)
                     - RIDEDROP;
          const dx = Math.round(P.x - dw / 2), dy = Math.round(P.y - dh - lift);
          const sm0 = ctx.imageSmoothingEnabled;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          if (flip) {
            ctx.save();
            ctx.translate(dx + dw, dy);
            ctx.scale(-1, 1);
            drawGameImage(ctx, sheetOf(rs), rs[0] + rf * rs[2], rs[1], rs[2], rs[3],
                          0, 0, dw, dh);
            ctx.restore();
          } else {
            drawGameImage(ctx, sheetOf(rs), rs[0] + rf * rs[2], rs[1], rs[2], rs[3],
                          dx, dy, dw, dh);
          }
          ctx.imageSmoothingEnabled = sm0;
          continue;
        }
      }
      const s = SPR[nm];
      const f = Math.floor(P.t * (!P.moving ? 6 : running ? 14 : 9)) % s[4];
      const dx = Math.round(P.x - s[2] / 2), dy = Math.round(P.y - s[3] + corinFeetOffset());
      drawGameImage(ctx, corinSheet(), s[0] + f * s[2], s[1], s[2], s[3], dx, dy, s[2], s[3]);
      continue;
    }
    if (!npcHere(o)) continue;
    if(o.seatSpr&&!o.goto&&!scene&&!bossScene&&!hatchExit){
      const s=SPR[o.seatSpr];if(s){drawNpcFrame(o,s,Math.floor(t*3)%s[4],sheetOf(s));continue;}
    }
    if (o.packSpr) {
      let direction = o.stationary ? "d" : o.f === "s" ? (o.flip ? "w" : "e") : (o.f || "d");
      const moved = Math.hypot(o.x - (o.px ?? o.x), o.y - (o.py ?? o.y));
      o.px = o.x; o.py = o.y;
      const action = moved > 0.05 && !o.stationary && o.packWalk ? "walk" : "idle";
      /* Nan's horizontal rows are reversed; north and south are correctly labelled. */
      if (o.n === "Nan Ferrow" && action === "walk")
        direction = ({ e: "w", w: "e" })[direction] || direction;
      const waveHettie = o.n === "Hettie" && action === "idle" &&
        quest < Q.EGGS && sayNpc !== o && !(scene && scene.who === "Hettie");
      const dockActor=o.n==='Odo'||o.n==='Liora';
      const speaking=dockActor&&(sayNpc===o||scene?.who===o.n||(o.n==='Odo'&&scene?.lines?.some(line=>line.startsWith('Odo:'))));
      if(speaking&&!o.dockSpeaking)o.dockReactionStart=t;
      o.dockSpeaking=speaking;
      const reactionAge=t-(o.dockReactionStart??-100);
      const odoGesture=o.n==='Odo'&&(speaking||t%9>=7);
      const sp = odoGesture ? SPR.pack_oldman_gesture : waveHettie ? SPR.market_bread : o.packDirections
        ? (SPR[o.packSpr + "_" + action + "_" + direction] || SPR[o.packSpr + "_idle_" + direction] || SPR[o.packSpr + "_idle_d"])
        : SPR[o.packSpr];
      if (sp) {
        let fr = action==='idle'&&o.idleFrame!==undefined ? Math.min(o.idleFrame,sp[4]-1)
          : Math.floor(t * (action === "walk" ? 8 : (o.idleFps || 5))) % sp[4];
        if(/^villager_seated_/.test(o.packSpr))fr=villagerIdleFrame(o,t,sp[4]);
        if(odoGesture)fr=Math.floor((speaking?reactionAge:t%9-7)*6)%sp[4];
        if(o.n==='Liora'){
          const age=reactionAge<2?reactionAge:t%5;
          fr=age<2?Math.min(sp[4]-1,Math.floor(age*6)):0;
        }
        drawNpcFrame(o,sp,fr,atlasImg);
        if(o.pettable) drawPetHeart(o,t,sp);
        if(waveHettie && quest < Q.EGGS && !scene && !sayNpc) drawHettieCallout(o,sp);
        continue;
      }
    }
    if (o.body && SPR[o.body + "_idle_d"]) {
      const moved = Math.hypot(o.x - (o.px === undefined ? o.x : o.px),
                               o.y - (o.py === undefined ? o.y : o.py));
      o.px = o.x; o.py = o.y;
      const walking = moved > 0.05;
      const s2 = SPR[o.body + "_" + (walking ? "walk" : "idle") + "_" + (o.kf || "d")]
              || SPR[o.body + "_idle_d"];
      const f2 = Math.floor(t * (walking ? 8 : 6) + o.t) % s2[4];
      drawGameImage(ctx, smImg, s2[0] + f2 * s2[2], s2[1], s2[2], s2[3],
                    Math.round(o.x - s2[2] / 2), Math.round(o.y - s2[3]),
                    s2[2], s2[3]);
      continue;
    }
    if (o.sk !== undefined) {
      const mv = Math.hypot(o.x - (o.px === undefined ? o.x : o.px),
                            o.y - (o.py === undefined ? o.y : o.py));
      o.px = o.x; o.py = o.y;
      const still = mv <= 0.05;
      const isuf = o.f === "s" ? "_sidle" : o.f === "u" ? "_uidle" : "_idle";
      const idle = still ? (SPR["npc_" + o.sk + isuf] ||
                            SPR["npc_" + o.sk + "_idle"]) : null;
      const s = idle || SPR["npc_" + o.sk + "_" + o.f];
      const nm = idle ? "npc_" + o.sk + isuf : "npc_" + o.sk + "_" + o.f;
      const f = still && !idle && o.idleFrame!==undefined ? Math.min(o.idleFrame,s[4]-1)
              : idle ? Math.floor(t * 3.2 + o.t) % s[4]
              : still ? (s[4] === 3 ? 1 : Math.floor(t * 5 + o.t) % s[4])
              : Math.floor(t * 5 + o.t) % s[4];
      let bob = 0;
      if (still && !o.desertNative) {
        const rate = idle ? 0.75 : 1.5;
        bob = -Math.round(0.5 + 0.5 * Math.sin(t * rate + (o.t || 0) * 3));
      }
      const px = Math.round(o.x - s[2] / 2), py = Math.round(o.y - s[3]) + bob;
      const tone = (typeof npcSheetFor === "function") ? npcSheetFor(o, s) : null;
      if (o.flip) {
        ctx.save();
        ctx.translate(px + s[2], py);
        ctx.scale(-1, 1);
        drawGameImage(ctx, tone ? tone.img : atlasImg, s[0] + f * s[2],
                      tone ? s[1] - tone.dy : s[1], s[2], s[3],
                      0, 0, s[2], s[3]);
        ctx.restore();
      } else {
        drawGameImage(ctx, tone ? tone.img : atlasImg, s[0] + f * s[2],
                      tone ? s[1] - tone.dy : s[1], s[2], s[3],
                      px, py, s[2], s[3]);
      }
      if (o.rod && SPR.fishing_rod && !hasDragon()) {
        const r = SPR.fishing_rod;
        const k = s[3] / 19;
        drawGameImage(ctx, atlasImg, r[0], r[1], r[2], r[3],
                      Math.round(o.x + (o.f === "s" && !o.flip ? 6 * k : -22 * k)),
                      Math.round(o.y - s[3] + 4 * k),
                      Math.round(r[2] * k), Math.round(r[3] * k));
      }
      if (o.crown) {
        const tops = ATLAS.headtop && ATLAS.headtop[nm];
        const bob = tops ? tops[f % tops.length] : 0;
        const cw = Math.max(9, Math.round(s[2] * 0.62));
        const x0 = Math.round(o.x - cw / 2), y0 = py + bob - 4;
        const px1 = Math.max(1, Math.round(cw / 9));
        const band = Math.max(2, Math.round(cw / 6));
        ctx.fillStyle = "#4a3212";                       /* the rim */
        ctx.fillRect(x0 - 1, y0 - 1, cw + 2, band + 5);
        ctx.fillStyle = "#f2c94c";                       /* the band */
        ctx.fillRect(x0, y0 + 3, cw, band);
        ctx.fillStyle = "#d9a72c";                       /* its shadow */
        ctx.fillRect(x0, y0 + 3 + band - 1, cw, 1);
        for (let i = 0; i < 5; i++) {                    /* five points */
          const px0 = x0 + Math.round(i * (cw - px1) / 4);
          const tall = (i % 2 === 0) ? 3 : 2;
          ctx.fillStyle = "#f2c94c";
          ctx.fillRect(px0, y0 + 3 - tall, px1, tall);
        }
        ctx.fillStyle = "#c0392b";                       /* the stone */
        ctx.fillRect(x0 + Math.round(cw / 2) - px1, y0 + 3, px1 * 2, band);
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(x0 + px1, y0 + 4, px1, 1);
        ctx.fillRect(x0 + cw - px1 * 2, y0 + 4, px1, 1);
      }
      continue;
    }
    const nm = NAMES[o.s], s = SPR[nm], od = DEFS[o.s];
    if (!s) continue; // Old device-local edits may reference art removed by a later build.
    const chim = ATLAS.chimneys && ATLAS.chimneys[nm];
    let f = s[4] > 1 ? frameOf(o.s, t, o.id * 0.37) % s[4] : 0;
    if (nm === "school_building" || nm === "tavern_building") {
      f = 0;
      if (doorMotion && doorMotion.map === "world" && Math.abs(o.x - (doorMotion.d.x * TS + 8)) < 48) {
        const progress = Math.min(1, doorMotion.t / doorMotion.duration);
        f = s[4] >= 12 ? Math.min(7, 4 + Math.floor(progress * 4))
                      : Math.min(s[4] - 1, Math.floor(progress * s[4]));
      }
    }
    const oy = (od && od.o) ? od.o : 0;
    const ox = o.wx || 0, wy = o.wy || 0;
    const dx = Math.round(o.x + ox - s[2] / 2), dy = Math.round(o.y + wy - s[3] + oy);
    if (o.face === -1) {
      ctx.save(); ctx.translate(dx + s[2], dy); ctx.scale(-1, 1);
      drawGameImage(ctx, sheetOf(s), s[0] + f * s[2], s[1], s[2], s[3], 0, 0, s[2], s[3]);
      ctx.restore();
    } else {
      drawGameImage(ctx, sheetOf(s), s[0] + f * s[2], s[1], s[2], s[3], dx, dy, s[2], s[3]);
    }
    if (chim && SPR.smoke) {
      const sm = SPR.smoke, org = ATLAS.smoke_origin || [sm[2] >> 1, sm[3]];
      const sf = Math.floor(t * 5 + o.id * 0.7) % sm[4];
      drawGameImage(ctx, atlasImg, sm[0] + sf * sm[2], sm[1], sm[2], sm[3],
                    Math.round(o.x + ox + chim[0] - org[0]),
                    Math.round(o.y + wy + chim[1] - org[1]),
                    sm[2], sm[3]);
    }
    if (editing && selected === o) {
      ctx.strokeStyle = "#ffd479"; ctx.lineWidth = 1;
      ctx.strokeRect(dx - .5, dy - .5, s[2] + 1, s[3] + 1);
      ctx.fillStyle = "rgba(255,212,121,.85)";
      ctx.fillRect(o.x + ox - 1.5, o.y + wy - 1.5, 3, 3);
    }
  }
  if (typeof drawDoorMarks === "function") drawDoorMarks(ctx);
  if (building && grabMode && grabRect) {
    const ox = grabDrag ? (grabDrag.dx || 0) * TS : 0;
    const oy = grabDrag ? (grabDrag.dy || 0) * TS : 0;
    ctx.save();
    ctx.globalAlpha = 0.3; ctx.fillStyle = "#8fd0ff";
    ctx.fillRect(grabRect.x0 * TS + ox, grabRect.y0 * TS + oy,
                 (grabRect.x1 - grabRect.x0 + 1) * TS, (grabRect.y1 - grabRect.y0 + 1) * TS);
    ctx.globalAlpha = 1; ctx.strokeStyle = "#ffd479"; ctx.lineWidth = 2 / z;
    ctx.strokeRect(grabRect.x0 * TS + ox, grabRect.y0 * TS + oy,
                   (grabRect.x1 - grabRect.x0 + 1) * TS, (grabRect.y1 - grabRect.y0 + 1) * TS);
    ctx.restore();
  }

  if (building && areaMode) {
    ctx.save();
    ctx.lineWidth = 2 / z;
    for (const f of features) {
      if (!isArea(f)) continue;
      const sel = f === pickedArea;
      const ox = sel && areaDrag ? (areaDrag.dx || 0) * TS : 0;
      const oy = sel && areaDrag ? (areaDrag.dy || 0) * TS : 0;
      ctx.globalAlpha = sel ? 0.35 : 0.18;
      ctx.fillStyle = sel ? "#ffd479" : "#8fd0ff";
      ctx.fillRect(f.x0 * TS + ox, f.y0 * TS + oy,
                   (f.x1 - f.x0 + 1) * TS, (f.y1 - f.y0 + 1) * TS);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = sel ? "#ffd479" : "#8fd0ff";
      ctx.strokeRect(f.x0 * TS + ox, f.y0 * TS + oy,
                     (f.x1 - f.x0 + 1) * TS, (f.y1 - f.y0 + 1) * TS);
    }
    ctx.restore();
  }

  if (building && drawA && drawB) {
    const [ax, ay] = drawA, [bx, by] = drawB;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#e8c48a";
    ctx.strokeStyle = "#2f6b34";
    ctx.lineWidth = 2 / z;
    if (buildTool === "route") {
      const path = (drawPts.length > 1 ? drawPts.concat([[bx, by]])
                                       : [[ax, ay], [bx, by]]).map(p => p.slice());
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        if (Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])) b[1] = a[1];
        else b[0] = a[0];
      }
      const half = ROUTE_W >> 1;
      const legBox = (a, b) => {
        const vert = a[0] === b[0];
        const rx = Math.min(a[0], b[0]) - (vert ? half : 0);
        const ry = Math.min(a[1], b[1]) - (vert ? 0 : half);
        const rw = vert ? ROUTE_W : Math.abs(b[0] - a[0]) + 1;
        const rh = vert ? Math.abs(b[1] - a[1]) + 1 : ROUTE_W;
        return [rx, ry, rw, rh];
      };
      for (let i = 1; i < path.length; i++) {
        const [rx, ry, rw, rh] = legBox(path[i - 1], path[i]);
        ctx.fillRect(rx * TS, ry * TS, rw * TS, rh * TS);
      }
      const xs = path.map(p => p[0]), ys = path.map(p => p[1]);
      const bx0 = Math.min.apply(null, xs) - half - ROUTE_BAND - 1;
      const by0 = Math.min.apply(null, ys) - half - ROUTE_BAND - 1;
      const bx1 = Math.max.apply(null, xs) + half + ROUTE_BAND + 1;
      const by1 = Math.max.apply(null, ys) + half + ROUTE_BAND + 1;
      ctx.strokeRect(bx0 * TS, by0 * TS, (bx1 - bx0 + 1) * TS, (by1 - by0 + 1) * TS);
    } else {
      const [x0, y0, x1, y1] = squareOf(ax, ay, bx, by);
      ctx.fillRect(x0 * TS, y0 * TS, (x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS);
      ctx.strokeRect(x0 * TS, y0 * TS, (x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS);
      ctx.strokeRect((x0 + TOWN_BAND) * TS, (y0 + TOWN_BAND) * TS,
                     (x1 - x0 + 1 - 2 * TOWN_BAND) * TS, (y1 - y0 + 1 - 2 * TOWN_BAND) * TS);
    }
    ctx.restore();
  }

  drawLavaBubbles();   /* over the cached ground, under everything else */
  drawBreath();
  drawClaw();
  if (dragonAirborne() && !(typeof mounted !== "undefined" && mounted))
    drawDragon();
  drawDragonProjectile();  /* breath effects always clear every combat sprite */
  ctx.restore();
  drawWeather(t);
}

const WEATHER = [
  { map: "world", kind: "snow", x0: 2571, y0: 380, x1: 2880, y1: 599 },
  { map: "world", kind: "snow", x0: 2571, y0: 100, x1: 2880, y1: 380 },
  { map: "world", kind: "sand", road: "Temple Route 2", band: 26,
    notIn: [1499, 72, 1537, 118] },
];
function nearRoad(name, x, y) {
  let best = 1e9;
  for (const f of features) {
    if (f.kind !== "route" || f.road !== name) continue;
    for (const [a, b] of routeLegs(f)) {
      const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
      let t = l2 ? ((x - a[0]) * dx + (y - a[1]) * dy) / l2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - (a[0] + t * dx), ey = y - (a[1] + t * dy);
      const d = ex * ex + ey * ey;
      if (d < best) best = d;
    }
  }
  return Math.sqrt(best);
}
let weatherTileKey = "", weatherTileValue = null;
function weatherHere() {
  if (typeof MAPID !== "undefined" && MAPID !== "world") return null;
  const x = P.x / TS, y = P.y / TS;
  const tileKey = MAPID + ":" + Math.floor(x) + "," + Math.floor(y);
  if (tileKey === weatherTileKey) return weatherTileValue;
  weatherTileKey = tileKey;
  for (const w of WEATHER) {
    if (w.road) {
      if (w.notIn && x >= w.notIn[0] && y >= w.notIn[1]
          && x <= w.notIn[2] && y <= w.notIn[3]) continue;
      if (nearRoad(w.road, x, y) <= w.band) return weatherTileValue = w;
      continue;
    }
    if (x >= w.x0 && x <= w.x1 && y >= w.y0 && y <= w.y1) return weatherTileValue = w;
  }
  return weatherTileValue = null;
}
let weatherFrameCanvas = null, weatherFrameCtx = null;
let weatherFrameKind = "", weatherFrameAt = -1;
function drawWeather(t) {
  const w = weatherHere();
  if (!w) return;
  const W = cv.width, H = cv.height;
  if (!weatherFrameCanvas) {
    weatherFrameCanvas = document.createElement("canvas");
    weatherFrameCtx = weatherFrameCanvas.getContext("2d");
  }
  if (weatherFrameCanvas.width !== W || weatherFrameCanvas.height !== H) {
    weatherFrameCanvas.width = W; weatherFrameCanvas.height = H;
    weatherFrameAt = -1;
  }
  // Weather contains hundreds of tiny marks. Refreshing that overlay at 30 Hz
  // keeps it fluid while removing the work from every other game frame.
  if (weatherFrameKind === w.kind && weatherFrameAt >= 0 && t - weatherFrameAt < 1 / 30) {
    ctx.drawImage(weatherFrameCanvas, 0, 0); return;
  }
  weatherFrameKind = w.kind; weatherFrameAt = t;
  const g = weatherFrameCtx;
  g.clearRect(0, 0, W, H); g.save();
  if (w.kind === "snow") {
    const layers = [[90, 26, 1.6, 0.55], [140, 40, 2.4, 0.75], [60, 62, 3.2, 0.95]];
    for (const [n, speed, size, alpha] of layers) {
      g.fillStyle = "rgba(255,255,255," + alpha + ")";
      for (let i = 0; i < n; i++) {
        const h = ((i * 2654435761) ^ (n * 1597334677)) >>> 0;
        const sx = (h % 1000) / 1000 * W;
        const drift = Math.sin(t * 0.6 + i) * 10;
        const sy = ((h >>> 10) % 1000) / 1000 * H + t * speed;
        g.fillRect(Math.round((sx + drift + W) % W),
                     Math.round(sy % (H + 20)) - 10, size, size);
      }
    }
  }
  if (w.kind === "sand") {
    g.fillStyle = "rgba(122,84,44,.30)";
    g.fillRect(0, 0, W, H);
    const gust = 0.18 + 0.14 * Math.sin(t * 0.5);
    g.fillStyle = "rgba(86,58,30," + gust.toFixed(3) + ")";
    g.fillRect(0, 0, W, H);
    const layers = [[260, 300,  7, 1, 0.30, "92,64,34"],
                    [320, 460, 14, 2, 0.38, "74,50,26"],
                    [220, 700, 26, 2, 0.34, "58,40,22"],
                    [120, 980, 46, 3, 0.28, "44,30,16"]];
    for (const [n, speed, len, thick, alpha, col] of layers) {
      g.fillStyle = "rgba(" + col + "," + alpha + ")";
      for (let i = 0; i < n; i++) {
        const h = ((i * 2654435761) ^ (n * 1597334677)) >>> 0;
        const sy = ((h >>> 10) % 1000) / 1000 * H;
        const sway = Math.sin(t * 1.3 + i * 0.7) * 8;
        const sx = W - (((h % 1000) / 1000 * W + t * speed) % (W + 60)) + 30;
        g.fillRect(Math.round(sx), Math.round(sy + sway), len, thick);
      }
    }
    g.fillStyle = "rgba(226,196,142,.34)";
    for (let i = 0; i < 90; i++) {
      const h = ((i * 40503) ^ 0x9e3779b9) >>> 0;
      const sy = ((h >>> 10) % 1000) / 1000 * H;
      const sx = W - (((h % 1000) / 1000 * W + t * 620) % (W + 60)) + 30;
      g.fillRect(Math.round(sx), Math.round(sy + Math.sin(t * 2 + i) * 5), 10, 1);
    }
  }
  g.restore();
  ctx.drawImage(weatherFrameCanvas, 0, 0);
}

const keys = {};
addEventListener("keydown", e => {
  const k=e.key.toLowerCase();
  if(typeof ask!=='undefined'&&ask&&(k==='arrowup'||k==='arrowdown'||k==='escape')){
    e.preventDefault();if(k==='escape'){if(!e.repeat)askBack();}else askStep(k==='arrowup'?-1:1);return;
  }
  if (fishing && (k==='a'||k==='b'||k==='escape')) {
    e.preventDefault(); if(!e.repeat){if(k==='a') actionButton();else {askShut();endFishing();}} return;
  }
  keys[k] = 1;
  if (k === "b") {
    running = true;
    if (glassShield && inFight() && !e.repeat) { e.preventDefault(); glassShieldHeld = true; glassShieldWindowUntil = tAcc + GLASS_BLOCK_WINDOW; glassShieldPulse = Math.max(glassShieldPulse,.18); tryGlassShieldParry(); }
  }
  if (e.key === " ") {e.preventDefault();if(!e.repeat)actionButton();}
});
addEventListener("keyup", e => {
  const k=e.key.toLowerCase(); keys[k] = 0;
  if(k === "b") { glassShieldHeld = false; running = false; }
});

let padDx = 0, padDy = 0, running = false;
const padHeld = new Map();          /* touch id -> button element */
const padTouchMode = ("ontouchstart" in window) ||
  (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

function clearPadInputs() {
  for (const el of new Set(padHeld.values())) el.classList.remove("hit");
  padHeld.clear();
  document.querySelectorAll("#dpad .hit").forEach(el => el.classList.remove("hit"));
  padAim();
}

