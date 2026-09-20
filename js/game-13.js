function sowDesertRoute(f) {
  const CAC = (ATLAS.styles.tree || {}).desert || [];
  const RK = (ATLAS.styles.foot || {}).desert || [];
  if (!CAC.length) return 0;
  const half = f.w >> 1, off = half + 2, offRock = half + 4;
  let put = 0;
  const done = new Set();
  for (const o of objs)
    done.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
  for (const [pa, pb] of routeLegs(f)) {
    const vert = pa[0] === pb[0];
    const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - off;
    const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + off;
    const line = vert ? pa[0] : pa[1];
    const step = 1;
    for (let v = lo; v <= hi; v += step)
      for (const d of [-off, off, -offRock, offRock]) {
        const rock = Math.abs(d) === offRock;
        if (rock && ((v + (d < 0 ? 0 : 1)) % 2)) continue;
        const tx = vert ? line + d : v, ty = vert ? v : line + d;
        if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
        if (terr[ty * MW + tx] !== SAND) continue;
        if (done.has(tx + "," + ty)) continue;
        let inRoad = false;
        for (const [qa, qb] of routeLegs(f)) {
          const qv = qa[0] === qb[0];
          const ql = qv ? Math.min(qa[1], qb[1]) : Math.min(qa[0], qb[0]);
          const qh = qv ? Math.max(qa[1], qb[1]) : Math.max(qa[0], qb[0]);
          const along = qv ? ty : tx, across = qv ? tx : ty;
          const centre = qv ? qa[0] : qa[1];
          if (along >= ql - half - 1 && along <= qh + half + 1
              && Math.abs(across - centre) <= half + 1) { inRoad = true; break; }
        }
        if (inRoad) continue;
        const h = ((tx * 2654435761) ^ (ty * 1597334677)) >>> 0;
        let nm = rock
          ? (RK.length ? RK[(h >>> 11) % RK.length] : null)
          : CAC[(h >>> 7) % CAC.length];
        if (!nm || NAME2I[nm] === undefined) continue;
        done.add(tx + "," + ty);
        objs.push({ id: objs.length, s: NAME2I[nm],
                    x: tx * TS + TS / 2 + (rock ? ((h >>> 17) % 7) - 3 : 0),
                    y: ty * TS + TS });
        put++;
      }
  }
  return put;
}

function styleAt(tx, ty) {
  let best = null, area = 1e9;
  for (const f of features) {
    if (f.x0 === undefined || !f.style) continue;
    if (tx < f.x0 || tx > f.x1 || ty < f.y0 || ty > f.y1) continue;
    const a = (f.x1 - f.x0 + 1) * (f.y1 - f.y0 + 1);
    if (a < area) { area = a; best = f; }
  }
  if (best) return best.style;
  const ti = ty * MW + tx;
  if (tx >= 0 && ty >= 0 && tx < MW && ty < MH
      && (terr[ti] === SAND || (baseTerr && baseTerr[ti] === SAND)))
    return "desert";
  return buildStyle;
}

function placeArena(wx, wy) {
  let tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return;
  const ROADS = [DIRT, COBBLE, PAVING2, MARBLE, TERRACE, ROADSAND, DECK,
                 VSTONE, VROCK, VCRACK, BRIDGE];
  if (!ROADS.includes(terr[ty * MW + tx])) {
    toast("tap the path inside a route"); return;
  }
  const paved = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH &&
                          ROADS.includes(terr[y * MW + x]);
  let wLo = tx, wHi = tx, hLo = ty, hHi = ty;
  while (paved(wLo - 1, ty)) wLo--;
  while (paved(wHi + 1, ty)) wHi++;
  while (paved(tx, hLo - 1)) hLo--;
  while (paved(tx, hHi + 1)) hHi++;
  if ((wHi - wLo) <= (hHi - hLo)) tx = (wLo + wHi) >> 1;   /* a vertical road */
  else ty = (hLo + hHi) >> 1;                              /* a horizontal one */
  for (const f of features)
    if ((f.kind === "arena" || f.kind === "camp") && Math.hypot(f.x - tx, f.y - ty) < (f.r || ARENA_R) * 2) {
      toast("there is already an arena here"); return;
    }
  const f = { id: featSeq++, kind: "arena", x: tx, y: ty, r: ARENA_R,
              style: styleAt(tx, ty) };
  features.push(f);
  buildUndo.push({ kind: "add", id: f.id });
  realizeFeatures();
  toast("arena cleared, " + (ARENA_R * 2) + " tiles across");
}

function moveRegion(r, dx, dy, silent) {
  if (!dx && !dy) return;
  const px = dx * TS, py = dy * TS;
  const inside = (wx, wy) => {
    const tx = Math.floor(wx / TS), ty = Math.floor((wy - 1) / TS);
    return tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1;
  };
  if (r.x0 + dx < 0 || r.y0 + dy < 0) { toast("that would go off the world"); return; }
  if (!growWorld(r.x1 + dx + 3, r.y1 + dy + 3)) return;

  const lift = [];
  for (let y = r.y0; y <= r.y1; y++)
    for (let x = r.x0; x <= r.x1; x++) {
      lift.push(baseTerr[y * MW + x]);
      baseTerr[y * MW + x] = GRASS;
    }
  let i = 0;
  for (let y = r.y0; y <= r.y1; y++)
    for (let x = r.x0; x <= r.x1; x++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < MW && ny < MH) baseTerr[ny * MW + nx] = lift[i];
      i++;
    }
  let n = 0;
  for (const o of objs)
    if (inside(o.x, o.y)) {
      o.x += px; o.y += py; n++;
      if (o.id < ORIG.length) { ORIG[o.id].x += px; ORIG[o.id].y += py; }
    }
  for (const p of npcs) if (inside(p.x, p.y)) { p.x += px; p.y += py; n++; }
  for (const arr of [scat, sanm])
    for (let k = 0; k < arr.length; k += 3)
      if (inside(arr[k + 1], arr[k + 2])) { arr[k + 1] += px; arr[k + 2] += py; n++; }
  for (const d of decks)
    if (d.x0 >= r.x0 && d.x1 <= r.x1 && d.y0 >= r.y0 && d.y1 <= r.y1) {
      d.x0 += dx; d.x1 += dx; d.y0 += dy; d.y1 += dy; n++;
    }
  if (!silent) {
    regionMoves.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, dx, dy });
    buildUndo.push({ kind: "region", i: regionMoves.length - 1 });
  }
  r.x0 += dx; r.x1 += dx; r.y0 += dy; r.y1 += dy;
  indexScatter(); indexDecks();
  realizeFeatures();
  toast("moved " + n + " things and the ground under them");
}

function unfell(x0, y0, x1, y1, pad) {
  let n = 0;
  for (let y = y0 - pad; y <= y1 + pad; y++)
    for (let x = x0 - pad; x <= x1 + pad; x++)
      if (felled.delete(x + "," + y)) {
        n++;
        const i = felledNew.indexOf(x + "," + y);
        if (i >= 0) felledNew.splice(i, 1);
      }
  return n;
}

function commitFeature() {
  const [ax, ay] = drawA, [bx, by] = drawB;
  const bend = drawPts.slice();
  drawA = drawB = null; drawPts = [];
  if (buildTool === "route") {
    if (bend.length > 1) {
      const path = bend.concat([[bx, by]]);
      for (let i = 1; i < path.length; i++) {      /* square every leg off */
        const a = path[i - 1], b = path[i];
        if (Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])) b[1] = a[1];
        else b[0] = a[0];
      }
      const xs = path.map(p => p[0]), ys = path.map(p => p[1]);
      if (Math.min.apply(null, xs.concat(ys)) < (ROUTE_W >> 1) + 3) {
        toast("can't build off the north or west edge -- ask me to extend it");
        return;
      }
      const pad = ROUTE_W + ROUTE_BAND + 2;
      if (!growWorld(Math.max.apply(null, xs) + pad,
                     Math.max.apply(null, ys) + pad)) return;
      const nf = { id: featSeq++, kind: "route",
                   x0: path[0][0], y0: path[0][1],
                   x1: path[path.length - 1][0], y1: path[path.length - 1][1],
                   pts: path, w: ROUTE_W, band: ROUTE_BAND,
                   style: styleAt(Math.round(path[0][0]),
                                  Math.round(path[0][1])),
                   a0: null, a1: null };
      features.push(nf);
      buildUndo.push({ kind: "add", id: nf.id });
      if (nf.style === "desert") sowDesertRoute(nf);
      unfell(Math.min.apply(null, xs), Math.min.apply(null, ys),
             Math.max.apply(null, xs), Math.max.apply(null, ys), pad);
      worldChanged(); realizeFeatures(); rebuildBuckets(); rebuildSolid();
      toast("route drawn, " + (path.length - 1) + " legs in one line");
      return;
    }
    let [x0, y0, x1, y1] = straighten(ax, ay, bx, by);
    if (Math.min(x0, x1, y0, y1) < (ROUTE_W >> 1) + 3) {
      toast("can't build off the north or west edge -- ask me to extend it");
      return;
    }
    if (Math.abs(x1 - x0) + Math.abs(y1 - y0) < 6) { toast("route too short"); return; }
    const snapped = snapRoute(x0, y0, x1, y1);
    [x0, y0, x1, y1] = snapped.coords;
    const pad = ROUTE_W + ROUTE_BAND + 2;
    if (!growWorld(Math.max(x0, x1) + pad, Math.max(y0, y1) + pad)) return;
    features.push({ id: featSeq++, kind: "route", x0, y0, x1, y1,
                    w: ROUTE_W, band: ROUTE_BAND, style: buildStyle,
                    a0: snapped.a0 || null, a1: snapped.a1 || null });
    unfell(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1),
           ROUTE_W + ROUTE_BAND + 2);
    buildUndo.push({ kind: "add", id: features[features.length - 1].id });
    toast("route drawn, " + (Math.abs(x1 - x0) + Math.abs(y1 - y0)) + " tiles" +
          (snapped.note ? " -- " + snapped.note : ""));
  } else {
    let [x0, y0, x1, y1] = squareOf(ax, ay, bx, by);
    for (const f of features) {
      if (f.kind !== "route") continue;
      const vert = f.x0 === f.x1;
      const cx = (x0 + x1) >> 1, cy = (y0 + y1) >> 1;
      if (vert && Math.abs(f.x0 - cx) <= SNAP &&
          Math.max(f.y0, f.y1) >= y0 - SNAP && Math.min(f.y0, f.y1) <= y1 + SNAP) {
        const d = f.x0 - cx; x0 += d; x1 += d;
      } else if (!vert && Math.abs(f.y0 - cy) <= SNAP &&
                 Math.max(f.x0, f.x1) >= x0 - SNAP && Math.min(f.x0, f.x1) <= x1 + SNAP) {
        const d = f.y0 - cy; y0 += d; y1 += d;
      }
    }
    if (Math.min(x0, y0) < 2) {
      toast("can't build off the north or west edge -- ask me to extend it");
      return;
    }
    if (!growWorld(x1 + 3, y1 + 3)) return;
    features.push({ id: featSeq++, kind: "area", label: KINDS[areaKind],
                    x0, y0, x1, y1, band: TOWN_BAND, style: buildStyle,
                    houses: "wood" });
    unfell(x0, y0, x1, y1, 2);
    buildUndo.push({ kind: "add", id: features[features.length - 1].id });
    toast(KINDS[areaKind] + " drawn, " + (x1 - x0 + 1) + " tiles square");
  }
  realizeFeatures();
}

const NAME_A = ["Ash","Briar","Cold","Dun","Elder","Fen","Grey","Hollow","Iron",
                "Kelp","Mire","Nor","Oak","Pine","Quill","Raven","Stone","Thorn",
                "West","Yew"];
const NAME_B = ["fen","hold","mere","wick","ford","gate","barrow","reach",
                "crest","moor","vale","hollow"];
const GENERIC = ["town","graveyard","temple","camp","ruin","farmstead","area"];
const placeName = (id) =>
  NAME_A[id % NAME_A.length] + NAME_B[((id / NAME_A.length) | 0) % NAME_B.length];

function standNear(x, y) {
  if (!solid[y * MW + x]) return { x, y };
  for (let r = 1; r < 40; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
        if (!solid[ny * MW + nx]) return { x: nx, y: ny };
      }
  return { x, y };
}

function placesOf() {
  const nameFor = (f) => {
    const lbl = f.label || "Area";
    return GENERIC.includes(lbl.toLowerCase()) ? placeName(f.id) : lbl;
  };
  const byId = new Map(features.map(f => [f.id, f]));
  const out = [];
  for (const f of features) {
    if (isArea(f))
      out.push({ name: nameFor(f), kind: f.label || "Area",
                 ...standNear((f.x0 + f.x1) >> 1, (f.y0 + f.y1) >> 1) });
    else if (f.kind === "landmark")
      out.push({ name: f.label || "Landmark", kind: "Landmark",
                 ...standNear(f.x, f.y) });
  }
  for (const [id, md] of Object.entries(W.maps || {})) {
    if (id === MAPID || !md.travel || !storyTeleport(id)) continue;
    out.push({ name: md.title || id, kind: md.travel_kind || "Underground",
               map: id, x: (md.spawn[0] / TS) | 0, y: ((md.spawn[1] - 1) / TS) | 0 });
  }

  const routes = features.filter(f => f.kind === "route");
  const parent = new Map(routes.map(f => [f.id, f.id]));
  const find = (a) => { while (parent.get(a) !== a) a = parent.get(a); return a; };
  const ends = (f) => [[f.x0, f.y0], [f.x1, f.y1]];
  for (let i = 0; i < routes.length; i++)
    for (let j = i + 1; j < routes.length; j++) {
      const a = routes[i], b = routes[j];
      const near = ends(a).some(pa => ends(b).some(
        pb => Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]) <= (a.w || 5)));
      if (near) parent.set(find(b.id), find(a.id));
    }
  const chains = new Map();
  for (const f of routes) {
    const r = find(f.id);
    if (!chains.has(r)) chains.set(r, []);
    chains.get(r).push(f);
  }
  for (const legs of chains.values()) {
    const touched = [];
    for (const f of legs)
      for (const k of ["a0", "a1"]) {
        const t = f[k];
        if (!t || !byId.get(t.area)) continue;
        const nm = nameFor(byId.get(t.area));
        if (!touched.includes(nm)) touched.push(nm);
      }
    if (touched.length < 2) continue;      /* not a road anywhere yet */
    const mid = legs[legs.length >> 1];
    out.push({ name: touched[0] + "\u2013" + touched[1] + " Road", kind: "Road",
               x: (mid.x0 + mid.x1) >> 1, y: (mid.y0 + mid.y1) >> 1 });
  }
  if(MAPID==='world')for(const pl of out)if(!pl.map&&/Hollybeck Temple|Snow Temple|Winter Temple/i.test(pl.name)){pl.x=2814;pl.y=84;}
  return out;
}

function buildTravel() {
  const list = document.getElementById("tvList");
  list.innerHTML = "";
  const places = placesOf();
  if (!places.length) {
    const d = document.createElement("div");
    d.className = "mini off";
    d.textContent = "nowhere named yet";
    list.appendChild(d);
    return;
  }
  for (const pl of places) {
    const b = document.createElement("div");
    b.className = "mini";
    b.textContent = pl.name;
    const jump = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (pl.map && pl.map !== MAPID) loadMap(pl.map);
      P.x = pl.x * TS + TS / 2; P.y = pl.y * TS + TS;
      recoverTempleArrival(!!pl.map);
      camFree = false; cam.z = playZoom();
      cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2;
      clampCam();
      lastArea = null; checkArea();
      setTravel(false); setDevTitle(null);
      toast("travelled to " + pl.name);
    };
    b.addEventListener("click", jump);
    b.addEventListener("touchstart", jump, { passive: false });
    list.appendChild(b);
  }
}

function refreshBuild() {
  const u = document.getElementById("tUndo");
  u.classList.toggle("off", buildUndo.length === 0);
  u.textContent = buildUndo.length ? "UNDO " + buildUndo.length : "UNDO";
  document.getElementById("tStyle").textContent = buildStyle.toUpperCase();
  document.getElementById("tKind").textContent = KINDS[areaKind].toUpperCase();
  document.getElementById("tAreas").classList.toggle("on", areaMode);
  if (arenaMode) {
    document.getElementById("bHint").textContent =
      "ARENA: tap the path inside a route to clear a battle ring";
    return;
  }
  if (areaMode) {
    document.getElementById("bHint").textContent = pickedArea
      ? "drag " + (pickedArea.label || "area") + " -- its roads will follow"
      : "AREAS: drag any highlighted area to move it";
    return;
  }
  document.getElementById("bHint").textContent = !drawArmed
    ? "PAN: drag to move, pinch to zoom -- tap PAN to start drawing"
    : buildTool === "route"
      ? "DRAWING a ROUTE -- it straightens itself"
      : "DRAWING a TOWN -- it squares itself up";
}

const TCHAR = { 0: "g", 1: "d", 2: "c", 3: "f", 4: "w", 5: "b", 6: "W", 7: "p", 8: "v", 9: "m",
                10: "t", 11: "s", 12: "R", 13: "D", 14: "S", 15: "K",
                16: "k", 17: "j", 18: "L", 19: "V" };

function paintAt(wx, wy) {
  const fine = brush === 1;
  const cx = fine ? Math.floor(wx / TS) : (Math.floor(wx / TS) & ~1);
  const cy = fine ? Math.floor(wy / TS) : (Math.floor(wy / TS) & ~1);
  let any = false;
  for (let y = cy; y < cy + brush; y++) for (let x = cx; x < cx + brush; x++) {
    if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;   /* keep the rim */
    const i = y * MW + x;
    if (terr[i] === paintT) continue;
    if (stroke && !stroke.has(i)) stroke.set(i, terr[i]);
    terr[i] = paintT;
    any = true;
  }
  if (any) groundDirty = true;
  return any;
}

const UNDRAWABLE = new Set([5, 7, 10, 11, 13, 14, 15]);
function tidyGround(scope) {
  let look = new Set();
  for (const i of scope) {
    const x = i % MW, y = (i / MW) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && ny > 0 && nx < MW - 1 && ny < MH - 1) look.add(ny * MW + nx);
    }
  }
  let fixed = 0;
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    for (const i of look) {
      const x = i % MW, y = (i / MW) | 0;
      if (terr[i] === WATER) {
        if (stroke && stroke.has(i)) continue;
        const wet = (a, b) => T(a, b) === WATER || T(a, b) === BRIDGE || T(a, b) === DECK;
        const mk = (wet(x, y - 1) ? 0 : 8) | (wet(x + 1, y) ? 0 : 4) |
                   (wet(x, y + 1) ? 0 : 2) | (wet(x - 1, y) ? 0 : 1);
        if (UNDRAWABLE.has(mk)) {
          if (stroke && !stroke.has(i)) stroke.set(i, terr[i]);
          terr[i] = openTo(i); painted.set(i, GRASS); changed = true; fixed++;
        }
      } else if (terr[i] === DIRT && brush > 1) {
        const gr = (a, b) => T(a, b) === GRASS || T(a, b) === WALL;
        const mk = (gr(x, y - 1) ? 8 : 0) | (gr(x + 1, y) ? 4 : 0) |
                   (gr(x, y + 1) ? 2 : 0) | (gr(x - 1, y) ? 1 : 0);
        if (UNDRAWABLE.has(mk)) {
          if (stroke && !stroke.has(i)) stroke.set(i, terr[i]);
          terr[i] = openTo(i); painted.set(i, GRASS); changed = true; fixed++;
        }
      }
    }
    if (!changed) break;
  }
  return fixed;
}

function notePainted(i) {
  baseTerr[i] = terr[i];
  if (terr[i] === terrOrig[i]) painted.delete(i);
  else painted.set(i, terr[i]);
}

function undoStroke() {
  const st = undoStack.pop();
  if (!st) { toast("nothing to undo"); return; }
  for (const [i, was] of st) { terr[i] = was; notePainted(i); }
  invalidateTiles([...st.keys()]);
  reindex();
  refreshUndo();
  toast("undid " + st.size + " tile" + (st.size === 1 ? "" : "s") +
        (undoStack.length ? " -- " + undoStack.length + " left" : ""));
}

function refreshUndo() {
  const el = document.getElementById("pUndo");
  el.classList.toggle("off", undoStack.length === 0);
  el.textContent = undoStack.length ? "UNDO " + undoStack.length : "UNDO";
}

function finishPaint() {
  const fixed = tidyGround(stroke ? stroke.keys() : []);
  if (stroke && stroke.size) {
    for (const i of stroke.keys()) notePainted(i);
    undoStack.push(stroke);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  }
  const touched = stroke ? [...stroke.keys()] : [];
  stroke = null;
  refreshUndo();
  refreshToolbar();
  invalidateTiles(touched);
  reindex();
  if (fixed) toast("tidied " + fixed + " tile" + (fixed === 1 ? "" : "s") +
                   " the tileset cannot draw");
}

function wanderStep(o, d, dt) {
  if (o.wx === undefined) {
    o.wx = 0; o.wy = 0; o.tx = 0; o.ty = 0;
    o.wt = Math.random() * 3; o.face = 1;
  }
  o.wt -= dt;
  if (o.wt <= 0) {
    const rest = d.wp || 2.5;
    o.wt = rest * (0.6 + Math.random() * 0.9);
    for (let k = 0; k < 6; k++) {
      const a = Math.random() * Math.PI * 2;
      const r = d.wd * (0.45 + Math.random() * 0.55);
      const nx = Math.cos(a) * r, ny = Math.sin(a) * r * 0.6;
      if (!isSolid(o.x + nx, o.y + ny)) { o.tx = nx; o.ty = ny; break; }
    }
  }
  const dx = o.tx - o.wx, dy = o.ty - o.wy;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.6) { o.moving = false; return; }
  const sp = Math.min(dist, (d.ws || 11) * dt);
  const nx = o.wx + dx / dist * sp, ny = o.wy + dy / dist * sp;
  if (isSolid(o.x + nx, o.y + ny)) { o.tx = o.wx; o.ty = o.wy; o.moving = false; return; }
  o.wx = nx; o.wy = ny; o.moving = true;
  if (Math.abs(dx) > 0.4) o.face = dx < 0 ? -1 : 1;
}

let bannerName = null, bannerT = 0, lastArea = null;

function areaUnder(px, py) {
  const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS);
  let best = null;
  const take = (name, weight) => {
    if (name && (!best || weight < best.w)) best = { name, w: weight };
  };
  for (const f of features) {
    if (isArea(f)) {
      if (f.hidden) continue;
      if (tx < f.x0 || tx > f.x1 || ty < f.y0 || ty > f.y1) continue;
      const lbl = f.label || "Area";
      const area = (f.x1 - f.x0) * (f.y1 - f.y0);
      take(GENERIC.includes(lbl.toLowerCase()) ? placeName(f.id) : lbl,
           f.wild ? 2e9 : area);
    } else if (f.kind === "landmark") {
      const r = f.r || 10;
      if (Math.abs(tx - f.x) <= r && Math.abs(ty - f.y) <= r)
        take(f.label || "Landmark", 1);
    } else if (f.kind === "route") {
      if (f.entrance) continue;
      const j = f.joins || [];
      if (j.length < 2) continue;
      const half = (f.w || 5) >> 1, reach = half + 3;
      let on = false;
      for (const [pa, pb] of routeLegs(f)) {
        const vert = pa[0] === pb[0];
        const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
        const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
        const ln = vert ? pa[0] : pa[1];
        const v = vert ? ty : tx, d = Math.abs((vert ? tx : ty) - ln);
        if (v >= lo && v <= hi && d <= reach) { on = true; break; }
      }
      if (on) take(j[0] + "\u2013" + j[1] + " Road", 1e9);   /* beats wild country */
    }
  }
  return best && best.name;
}

const PLACES = {
  "Millwood":       { kind: "spruce", of: "the farming village Corin is from" },
  "Northern Woods": { kind: "spruce", of: "the road north, where the King's men stand" },
  "Shroom Pass":    { kind: "mystic", of: "the trail up to the mushroom folk" },
  "Sporehollow":    { kind: "mystic", of: "the mushroom folk's hollow" },
  "Thornwell":      { kind: "oak",    of: "the school village -- cider, bees, herbs" },
  "Forgewick":      { kind: "birch",  of: "the mining town, its smithy and glassblower" },
  "Forgewick":        { kind: "temple", of: "the temple east, where Maddock sends him" },

  "Coralmere":  { kind: "coast",  of: "a seaside town" },
  "Dreadmarsh": { kind: "swamp",  of: "a swamp" },
  "Infernia":   { kind: "ash",    of: "Halvard's own country" },
  "Sandspire":  { kind: "desert", of: "a desert town" },
  "Hollybeck":  { kind: "snow",   of: "a snow town -- the snow portraits are for here",
                  keeps: ["lamp_grey"] },
};
const SIGNED = Object.keys(PLACES);
function worthASign(name) {
  return !!name && SIGNED.some(p => name === p);
}
let arenaLock = null, arenaT = 0, arenaGoing = false;
const ARENA_REST = 300;                  /* seconds before it fills again */
const cooling = new Map(), holy = new Set();
function ringKey(a) { return MAPID + ":" + (a ? a.id : "?"); }
function refillRing(a) {
  if (!a || cooling.has(ringKey(a)) || holy.has(ringKey(a))) return;
  let n = 0;
  for (const spec of (MD.foes || [])) {
    if (Math.hypot(spec.x - a.x, spec.y - a.y) > (a.r || 6) + 2) continue;
    /* a ring fills again, but the thing that made it a boss fight does not */
    if (BOSS_KIND.test(spec.k || "")) continue;
    const kind = FOE[spec.k] ? spec.k : "boneguard";
    const k = FOE[kind];
    if (!k) continue;
    const x = spec.x * TS + 8, y = spec.y * TS + 16;
    if (foes.some(q => q.st !== "dead" && Math.hypot(q.x - x, q.y - y) < 6)) continue;
    foes.push({ kind, x, y, hx: x, hy: y, hp: enemyMaxHp(kind, x),
                st: "idle", t: 0, dir: "d", flip: false, hurt: 0 });
    n++;
  }
  if (n) { rebuildBuckets(); a._wave = 0; }
}
function stepArenas(dt) {
  for (const [k, v] of cooling) {
    const t = v - dt;
    if (t <= 0) cooling.delete(k); else cooling.set(k, t);
  }
}
let falling = null;
function releaseArena() {
  settleGraves();
  if(arenaLock && !arenaFoesLeft(arenaLock)) recoverStrandedDragon();
  if (arenaLock && arenaT > 0.2) falling = { ring: arenaLock, t: 0, life: 1.0 };
  arenaLock = null; arenaT = 0; arenaGoing = false;
}
function stepFall(dt) {
  if (!falling) return;
  falling.t += dt;
  if (falling.t >= falling.life) falling = null;
}
function drawFall() {
  if (!falling) return;
  const fn = SPR["vfence0_0"] ? "vfence0_0" : (SPR["swall_post"] ? "swall_post" : null);
  if (!fn) return;
  const sp = SPR[fn];
  const p = falling.t / falling.life;
  const TALL = 2;
  const full = sp[3] * TALL;
  let k = 0;
  for (const [tx, ty] of arenaRim(falling.ring)) {
    k++;
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
    const ix = tx * TS + TS / 2, iy = ty * TS + TS;
    if (ix < cam.x - 64 || ix > cam.x + VW / cam.z + 64 ||
        iy < cam.y - 96 || iy > cam.y + VH / cam.z + 96) continue;
    const lag = ((k * 0.037) % 0.42);
    const e = Math.max(0, Math.min(1, (p - lag) / (1 - lag)));
    const h = Math.round(full * (1 - e * e));
    if (h > 0) {
      const px = Math.round(ix - sp[2] / 2), py = Math.round(iy - h);
      ctx.save();
      ctx.beginPath(); ctx.rect(px, py, sp[2], h); ctx.clip();
      for (let t2 = 0; t2 < TALL; t2++)
        drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                      px, iy - full + t2 * sp[3] + (full - h), sp[2], sp[3]);
      ctx.restore();
    }
    if (e > 0.05 && e < 0.85) {
      ctx.save();
      ctx.globalAlpha = (1 - e) * 0.4;
      ctx.fillStyle = "#b9ab8e";
      for (let d = 0; d < 3; d++) {
        const a = (k + d) * 2.1;
        ctx.beginPath();
        ctx.arc(ix + Math.cos(a) * (4 + e * 10),
                iy - 2 + Math.sin(a) * 3, 2.2 * (1 - e), 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
function arenaFoesLeft(a) {
  for (const f of foes) {
    if (f.storyKnight && !f.storyEscaped && Math.hypot(f.x / TS - a.x, f.y / TS - a.y) <= a.r + 8) return true;
    if (f.st === "dead" || f.ally) continue;
    if (Math.hypot(f.x / TS - a.x, f.y / TS - a.y) <= a.r + 5) return true;
  }
  return false;
}
let lastChunk = "", chunkQ = [], chunkWarmTask = null, chunkWarmMap = "";
function resetChunkWarm() {
  chunkQ.length = 0; lastChunk = ""; chunkWarmMap = MAPID;
  if (!chunkWarmTask) return;
  if (chunkWarmTask.idle && window.cancelIdleCallback) cancelIdleCallback(chunkWarmTask.id);
  else clearTimeout(chunkWarmTask.id);
  chunkWarmTask = null;
}
function runChunkWarm() {
  chunkWarmTask = null;
  if (chunkWarmMap !== MAPID) { chunkQ.length = 0; return; }
  while (chunkQ.length) {
    const [qx, qy] = chunkQ.shift();
    if (qx < 0 || qy < 0 || qx * CHUNK >= PXW || qy * CHUNK >= PXH) continue;
    if (!chunks.has(chunkKey(qx, qy))) { try { getChunk(qx, qy); } catch (_) {} }
    break;
  }
  scheduleChunkWarm();
}
function scheduleChunkWarm() {
  if (chunkWarmTask || !chunkQ.length) return;
  chunkWarmMap = MAPID;
  if (window.requestIdleCallback)
    chunkWarmTask = { idle:true, id:requestIdleCallback(runChunkWarm, {timeout:120}) };
  else chunkWarmTask = { idle:false, id:setTimeout(runChunkWarm, 34) };
}
function warmAhead() {
  const cx = Math.floor(P.x / CHUNK), cy = Math.floor(P.y / CHUNK);
  const k = cx + "," + cy;
  if (k !== lastChunk) {
    lastChunk = k;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        if (!dx && !dy) continue;
        const key = chunkKey(cx + dx, cy + dy);
        if (chunks.has(key)) continue;
        const q = [cx + dx, cy + dy, Math.abs(dx) + Math.abs(dy)];
        if (!chunkQ.some(e => e[0] === q[0] && e[1] === q[1])) chunkQ.push(q);
      }
    chunkQ.sort((p, q) => p[2] - q[2]);        /* nearest ground first */
    if (chunkQ.length > 32) chunkQ.length = 32;
  }
  scheduleChunkWarm();
}
let arenaFeatureSource = null, arenaFeatureList = [];
function currentArenaFeatures() {
  if (arenaFeatureSource !== features) {
    arenaFeatureSource = features;
    arenaFeatureList = features.filter(f => f.kind === "arena");
  }
  return arenaFeatureList;
}
function knightArena() {
  return MAPID === "world" ? features.find(f => f.id === KNIGHT_ARENA_ID) : null;
}
function knightFoe() { return foes.find(f => f.storyKnight && !f.storyEscaped); }
function beginKnightFight(ring, f) {
  knightEncounterPhase = "intro";
  knightEncounter = { ring, foe:f, t:0 };
  f.storyPassive = true; f.st = "idle"; f.t = 0; f.dir = "d"; f.flip = false;
  arenaLock = ring; arenaT = Math.max(arenaT, .05); arenaGoing = false;
  faceCorinAt(f.x, f.y); f.dir = "u";
  playScene([
    "King's Knight: Hold there. I know you. You were in Millwood when His Majesty came through.",
    "King's Knight: So the rumors are true. You found a dragon.",
    "King's Knight: By order of King Halvard, hand it over. The creature belongs to the Crown.",
    "Corin: She belongs to no one.",
    "King's Knight: Then you leave me no choice.",
    "Corin: I won't let you take her.",
    "King's Knight: Draw your sword."
  ], { stay:true, after:() => {
    knightEncounterPhase = "fight";
    f.storyPassive = false; f.st = "walk"; f.t = 0; f.cool = .35;
  }});
}
function stepKnightEncounter(dt) {
  if (foesHeld) return;
  if (MAPID !== "world") return;
  const ring = knightArena();
  if (!ring) return;
  if (knightEncounterDone) { holy.add(ringKey(ring)); return; }
  const f = knightFoe();
  if (!f) return;
  if (knightEncounterPhase === "waiting") {
    if (!hasDragon() || scene || Math.hypot(P.x / TS - ring.x, P.y / TS - ring.y) > ring.r - 1.2) return;
    beginKnightFight(ring, f); return;
  }
  if (knightEncounterPhase === "fight" && f.st === "dead") {
    knightEncounterPhase = "down"; f.st = "down"; f.storyPassive = true; f.storyT = 0; f.hurt = 0;
    hunt = null; claw = null; breath = null; return;
  }
  if (knightEncounterPhase === "down") {
    f.storyT += dt;
    if (f.storyT >= .9 && !scene) {
      knightEncounterPhase = "yield";
      playScene([
        "King's Knight: Enough... I yield.",
        "Corin: Go. Tell Halvard the dragon chose me.",
        "King's Knight: You have made yourself an enemy of the Crown."
      ], { stay:true, after:() => {
        knightEncounterPhase = "rise"; f.st = "rise"; f.storyT = 0;
      }});
    }
    return;
  }
  if (knightEncounterPhase === "rise") {
    f.storyT += dt;
    if (f.storyT >= .65) {
      knightEncounterPhase = "escape"; f.st = "escape"; f.storyT = 0; f.dir = "d"; f.flip = false;
      holy.add(ringKey(ring)); releaseArena();
    }
    return;
  }
  if (knightEncounterPhase === "escape") {
    f.storyT += dt; f.t += dt;
    const tx = ring.x * TS + TS / 2, ty = (ring.y + ring.r + 11) * TS;
    const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx,dy) || 1;
    f.dir = Math.abs(dx) > Math.abs(dy) ? "s" : (dy < 0 ? "u" : "d");
    f.flip = dx < 0;
    const step = Math.min(d, 112 * dt);
    f.x += dx / d * step; f.y += dy / d * step;
    if (d < 5 || Math.hypot(f.x / TS - ring.x, f.y / TS - ring.y) > ring.r + 9) {
      f.storyEscaped = true; f.st = "dead";
      knightEncounterDone = true; knightEncounterPhase = "done"; knightEncounter = null;
      holy.add(ringKey(ring)); recoverStrandedDragon(); saveGame();
      toast("The knight flees toward Coralmere");
    }
  }
}
function stepArena(dt) {
  if (foesHeld) { arenaLock=null;arenaT=0;arenaGoing=false;falling=null;return; }
  if (trial) { stepTrial(dt); return; }
  stepChest(dt);
  const mapArenas = currentArenaFeatures();
  if (!MD || !mapArenas.length) {
    if (MAPID !== "world") { arenaLock = null; arenaT = 0; return; }
  }
  if (!arenaLock) {
    for (const f of mapArenas) {
      if (Math.hypot(P.x / TS - f.x, P.y / TS - f.y) > f.r - 1) continue;
      if (cooling.has(ringKey(f)) || holy.has(ringKey(f))) continue;
      if (!arenaFoesLeft(f)) { refillRing(f); if (!arenaFoesLeft(f)) continue; }
      arenaLock = f; arenaT = 0; arenaGoing = false;
      break;
    }
  } else {
    const ring = arenaLock;
    const waves = ring.waves
      || (ring.wave2 ? [{ say: "Oh no! There's more!", at: ring.wave2 }] : []);
    if (ring._wave === undefined) ring._wave = 0;
    if (!arenaGoing && !arenaFoesLeft(ring) && !ring._waving && ring._wave < waves.length) {
      const w0 = waves[ring._wave];
      ring._waving = true;
      playScene([w0.say], { after: () => {
        ring._wave++;
        ring._waving = false;
        for (const w of w0.at) {
          foes.push({ kind: w.k || "ghost",
                      x: w.x * TS + TS / 2, y: w.y * TS + TS,
                      hx: w.x * TS + TS / 2, hy: w.y * TS + TS,
                      st: "idle", t: 0,
                      hp: enemyMaxHp(w.k || "ghost", w.x * TS + TS / 2),
                      dir: "d", flip: false, hurt: 0 });
        }
        rebuildBuckets();
      } });
    }
    if (!arenaGoing && !arenaFoesLeft(ring) &&
        ring._wave >= waves.length && !scene) arenaGoing = true;
    arenaT += dt * (arenaGoing ? -2.2 : 3.0);
    if (arenaT > 1) arenaT = 1;
    if (arenaT < 0) {
      if (!bossRing(arenaLock) && !holy.has(ringKey(arenaLock)))
        cooling.set(ringKey(arenaLock), ARENA_REST);
      recoverStrandedDragon();
      arenaLock = null; arenaT = 0; arenaGoing = false;
      twinSpent = false; twinKills = 0;   /* ready for the next ring */
      for (const f of foes) if (f.raised) { f.ally = 0; f.raised = 0; f.st = "dead"; f.t = 0; }
    }
  }
}
function arenaRim(a) {
  const cacheKey = MAPID + ":" + a.x + "," + a.y + "," + a.r + ":" + ((MD.doors || []).length);
  if (a._rimCacheKey === cacheKey && a._rimCache) return a._rimCache;
  if (MAPID !== "world") {
    const out = [];
    for (const d of (MD.doors || [])) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = d.x + dx, ty = d.y;
        if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
        if (!out.some(p => p[0] === tx && p[1] === ty)) out.push([tx, ty]);
      }
    }
    a._rimCacheKey = cacheKey; a._rimCache = out; return out;
  }
  const out = [];
  const rr = a.r + 1;
  for (let ang = 0; ang < 6.2832; ang += 0.04) {
    const tx = Math.round(a.x + Math.cos(ang) * rr);
    const ty = Math.round(a.y + Math.sin(ang) * rr);
    if (!out.some(p => p[0] === tx && p[1] === ty)) out.push([tx, ty]);
  }
  a._rimCacheKey = cacheKey; a._rimCache = out; return out;
}
let lastAreaTile = "";
function checkArea() {
  const tile = MAPID + ":" + Math.floor(P.x / TS) + "," + Math.floor((P.y - 1) / TS);
  if (tile === lastAreaTile) return;
  lastAreaTile = tile;
  const now = areaUnder(P.x, P.y);
  if (now !== lastArea) {
    lastArea = now;
    if (worthASign(now)) { bannerName = now; bannerT = 0; }
  }
}

function drawBanner(dt) {
  if (!bannerName) return;
  bannerT += dt;
  const IN = 0.45, HOLD = 2.0, OUT = 0.5;
  if (bannerT > IN + HOLD + OUT) { bannerName = null; return; }
  let k = 1;                                   /* 0 hidden .. 1 fully down */
  if (bannerT < IN) k = bannerT / IN;
  else if (bannerT > IN + HOLD) k = 1 - (bannerT - IN - HOLD) / OUT;
  const ease = 1 - Math.pow(1 - k, 3);
  ctx.save();
  const pad = 10, h = 34;
  ctx.font = "700 13px ui-monospace, Menlo, monospace";
  const w = Math.max(96, ctx.measureText(bannerName).width + pad * 2 + 14);
  const x = VW - w - 12;
  const y = VH - h - 16;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(1, Math.max(0.04, ease));
  ctx.translate(-w / 2, -h / 2);

  const boards = 3, bh = h / boards;
  for (let i = 0; i < boards; i++) {
    const by = i * bh;
    ctx.fillStyle = ["#6b4a2b", "#5f4126", "#periodo"][i] || "#654529";
    ctx.fillStyle = ["#6b4a2b", "#5f4126", "#654529"][i];
    ctx.fillRect(0, by, w, bh);
    ctx.strokeStyle = "rgba(40,24,12,.35)";
    ctx.lineWidth = 1;
    for (let gline = 0; gline < 2; gline++) {
      const gy = by + bh * (0.32 + 0.36 * gline);
      ctx.beginPath();
      ctx.moveTo(6, gy);
      ctx.bezierCurveTo(w * 0.3, gy - 1.4, w * 0.7, gy + 1.4, w - 6, gy);
      ctx.stroke();
    }
    if (i < boards - 1) {
      ctx.fillStyle = "rgba(28,16,8,.55)";
      ctx.fillRect(0, by + bh - 1, w, 1.4);
      ctx.fillStyle = "rgba(255,226,180,.10)";
      ctx.fillRect(0, by + bh + 0.4, w, 1);
    }
  }
  ctx.fillStyle = "rgba(255,232,190,.16)";
  ctx.fillRect(0, 0, w, 2);
  ctx.fillStyle = "rgba(24,14,7,.45)";
  ctx.fillRect(0, h - 2.5, w, 2.5);

  ctx.strokeStyle = "#3a2716";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(1, 1, w - 2, h - 2, 4);
  else ctx.rect(1, 1, w - 2, h - 2);
  ctx.stroke();

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(22,12,5,.75)";
  ctx.fillText(bannerName, w / 2, h / 2 + 2.2);
  ctx.fillStyle = "#f4e9d4";
  ctx.fillText(bannerName, w / 2, h / 2 + 1);
  ctx.textAlign = "left";

  ctx.fillStyle = "#2e2116";
  for (const [nx, ny] of [[8, 7], [8, h - 7], [w - 8, 7], [w - 8, h - 7]]) {
    ctx.beginPath(); ctx.arc(nx, ny, 2.2, 0, 7); ctx.fill();
  }
  ctx.fillStyle = "rgba(226,206,170,.5)";
  for (const [nx, ny] of [[8, 7], [8, h - 7], [w - 8, 7], [w - 8, h - 7]]) {
    ctx.beginPath(); ctx.arc(nx - 0.7, ny - 0.7, 0.9, 0, 7); ctx.fill();
  }
  ctx.restore();
}

let last = 0, tAcc = 0, runtimeFrameErrors = 0;
function showRuntimeFrameError(error) {
  runtimeFrameErrors++;
  const message = String(error && (error.stack || error.message) || error);
  window.__lastFrameError = message;
  try { localStorage.setItem("emberfell.lastFrameError", message); } catch (_) {}
  let box = document.getElementById("runtimeFrameError");
  if (!box) {
    box = document.createElement("div"); box.id = "runtimeFrameError";
    box.setAttribute("style", "position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;background:#3a0d0de8;color:#ffd9d9;border:2px solid #ef9b74;border-radius:7px;padding:8px;font:11px/1.35 ui-monospace,monospace;white-space:pre-wrap;max-height:35%;overflow:auto;pointer-events:none");
    (document.body || document.documentElement).appendChild(box);
  }
  box.textContent = "EMBERFELL RECOVERED FROM AN ERROR (" + runtimeFrameErrors + ")\n" + message;
  if (MAPID === "world" && quest === Q.NOISE) {
    scene = null; sayNpc = null; walker = null; goingIn = false;
    const her = npcs.find(n => n.n === "Hettie");
    if (her) { her.goto = null; her.stationary = true; }
    const mad = npcs.find(n => n.n === "Elder Maddock");
    if (mad) { mad.goto = null; mad.away = 1; }
  }
  fade = 0; fadeDir = 0; pendingDoor = null; pendingActorStage = null; doorMotion = null;
  mode = "play"; P.moving = false;
  try { rebuildSolid(); } catch (_) {}
}
function frame(ms) {
  try {
    frameCore(ms);
    const box = document.getElementById("runtimeFrameError");
    if (box && runtimeFrameErrors) { box.remove(); runtimeFrameErrors = 0; }
  }
  catch (error) { showRuntimeFrameError(error); }
  finally { requestAnimationFrame(frame); }
}
function frameCore(ms) {
  window.__firstFrame = true;
  const dt = Math.min(0.05, (ms - last) / 1000 || 0); last = ms;
  if(atlasOpen)return;
  if(fishing){
    stepFishing(dt);
    drawWorld(tAcc,0);drawDark();drawHearts();drawFishing();
    return;
  }
  tAcc += dt;
  if (mode === "play") { stepAct(dt); stepPlayer(dt); useDoors(dt); checkArea(); stepKnightEncounter(dt); stepArena(dt); warmAhead(); stepCombat(dt); }
  const dgx0 = dragon.x, dgy0 = dragon.y;
  stepScene(dt);
  if (sayNpc) { faceToward(sayNpc, P.x, P.y); faceCorinAt(sayNpc.x, sayNpc.y); }
  if (walker && scene) faceCorinAt(walker.x, walker.y);
  if (scene && quest <= Q.KING && typeof guards === "function")
    for (const g of guards()) {
      if (g.goto) continue;
      g.f = "d"; g.kf = "d"; g.flip = false;
    }
  stepType(dt);
  stepBirds(dt);
  odoTurnsYouBack();
  stepShake(dt);
  greenFly(dt);
  stepWalkers(dt);
  stepElder();
  stepHatchCamera(dt);
  stepKingsMen(dt);
  stepQuest(dt);
  stepBreath(dt);
  stepDragon(dt);
  noteDragonMotion(dgx0, dgy0, dt);
  stepClaw(dt);
  stepAnims(dt);   /* one-shot animations run in the editor too */
  if (mode === "play") stepBolts(dt);
  stepFerry(dt);
  stepDeflectCamera(dt);
  drawWorld(tAcc, dt);
  drawDark();           /* the deep workings, before the hearts go on top */
  drawCollide();
  drawDoorTriggers();
  drawHearts();
  drawBanner(dt);
  drawFade();
  drawBossBlack();
  refreshHandle();      /* the delete button rides with the camera */
}

let doorCooldown = 0;

function doorAt(tx,ty){return (MD.doors||[]).find(d=>{const r=doorRect(d);return tx*TS<r.x+r.w&&(tx+1)*TS>r.x&&ty*TS<r.y+r.h&&(ty+1)*TS>r.y})||null;}

let fade = 0, fadeDir = 0, pendingDoor = null, arrivedDoor = null, arriveT = 0;
let pendingActorStage = null;
let doorMotion = null; // A short opening or stair descent, then the normal room fade.
let collideView = false, badTiles = {};
const FADE_T = 0.22;

function useDoors(dt) {
  if (bossScene && !foesHeld) return;
  if (doorMotion && !doorMotion.started) {
    doorMotion.t += dt;
    if (doorMotion.t < doorMotion.duration) return;
    doorMotion.started = true;
    pendingDoor = doorMotion.d; fadeDir = 1;
  }
  if (fadeDir !== 0) {
    fade += fadeDir * (dt / FADE_T);
    if (fadeDir > 0 && fade >= 1) {           /* fully dark: make the swap */
      fade = 1;
      if (pendingActorStage) {
        const stage = pendingActorStage; pendingActorStage = null;
        fadeDir = 0;
        if(stage()!==true)fadeDir = -1; return;
      }
      const d = pendingDoor; pendingDoor = null;
      if (!d || !W.maps[d.to]) { doorMotion = null; fadeDir = -1; return; }
      const cameFrom = MAPID;          /* the map we are leaving */
      doorMotion = null;
      if (quest === Q.ABED && cameFrom !== "world" && d.to === "world") quest = Q.ERRAND;
      loadMap(d.to);
      P.x = d.tx * TS + TS / 2;
      P.y = d.ty * TS + TS;
      recoverTempleArrival(!!MD.templeContinuous);
      P.dir = "d"; P.dir8="s"; P.flip = false;
      arriveT = 0.33;
      cam.x = P.x - (VW / cam.z) / 2;
      cam.y = P.y - (VH / cam.z) / 2;
      clampCam();
          bolts.length = 0;               /* nothing in flight follows you out */
      arrivedDoor = cameFrom;
      const nm = W.maps[d.to].title;
      if (nm) { bannerName = nm; bannerT = 0; }
      fadeDir = -1;
    } else if (fadeDir < 0 && fade <= 0) { fade = 0; fadeDir = 0; }
    return;
  }
  if (!P.moving) return;
  if (arriveT > 0) return;
  const movingDir = P.dir === "s" ? (P.flip ? "l" : "r") : P.dir;
  // Measure against the actual doorway, not the player's modulo-tile position.
  // The feet may stop at collision before crossing the visual threshold.
  let d = null, best = Infinity;
  for (const candidate of (MD.doors || [])) {
    if (!W.maps[candidate.to]) continue;
    const want = candidate.explicitDir ? candidate.dir : MAPID === "world" ? (candidate.dir || "u") : "d";
    if (movingDir !== want) continue;
    const r=doorRect(candidate),x0=r.x,y0=r.y;
    const horizontal=want==='l'||want==='r';
    const lateral=horizontal?P.y-4:P.x,center=horizontal?y0+r.h/2:x0+r.w/2;
    const half=(horizontal?r.h:r.w)/2+4;
    if(Math.abs(lateral-center)>half)continue;
    const gap=want==='u'?P.y-7-(y0+r.h):want==='d'?y0-(P.y-1):want==='l'?P.x-5.5-(x0+r.w):x0-(P.x+5.5);
    if(gap>TS/2||gap<-(horizontal?r.w:r.h)-7)continue;
    const score = Math.abs(gap) + Math.abs(lateral - center) * 0.1;
    if (score < best) { best = score; d = candidate; }
  }
  if (!d) return;
  if(!foesHeld && MD.royal && foes.some(f=>(f.kind==="royalguard"||f.kind==="treasuryknight")&&f.st!=="dead")){toast("Defeat the guards to clear this passage.");return;}
  if(!foesHeld && MD.firstTemple && d.templeForward && foes.some(f=>f.st!=="dead" && !f.ally)){toast("Defeat the guardians to open the next room.");return;}
  const animated = d.stairDown || MD.roomArt || ["school", "tavern", "inn", "smithy", "glasshouse", "glasswork"].includes(d.to);
  if (animated) {
    doorMotion = { map: MAPID, d, t: 0, duration: d.stairDown ? 0.65 : 0.42, started: false };
    P.moving = false; P.act = null;
  } else { pendingDoor = d; fadeDir = 1; }
}

function drawArena(half) {
  if (!arenaLock || arenaT <= 0) return;
  const a = arenaLock;
  const nm = SPR["vfence0_0"] ? "vfence0_0" : (SPR["swall_post"] ? "swall_post" : null);
  if (!nm) return;
  const sp = SPR[nm];
  const TALL = 2;                 /* posts stacked, so it reads as a wall */
  const rise = Math.min(1, arenaT);
  ctx.save();
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
  for (const [tx, ty] of arenaRim(a)) {
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
    if (MAPID !== "world") {
      if (half === "back") continue;
    } else {
      const behind = ty <= Math.floor(P.y / TS);
      if (half === "back" && !behind) continue;
      if (half === "front" && behind) continue;
    }
    const px = Math.round(tx * TS + TS / 2 - sp[2] / 2);
    const py = Math.round(ty * TS + TS);
    const full = sp[3] * TALL;
    const h = Math.round(full * rise);
    if (h <= 0) continue;
    for (let k = 0; k < TALL; k++) {
      const top = (TALL - 1 - k) * sp[3];        /* px from the top of the stack */
      const vis = Math.max(0, Math.min(sp[3], h - top));
      if (vis <= 0) continue;
      drawGameImage(ctx, sheetOf(sp), sp[0], sp[1] + (sp[3] - vis), sp[2], vis,
                    px, py - top - vis, sp[2], vis);
    }
  }
  ctx.restore();
}

function drawFade() {
  if (fade <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = Math.min(1, fade);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.restore();
}
function drawBossBlack() {
  const a = bossScene && bossScene.black;
  if (!a) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.restore();
}

function stepPlayer(dt) {
  if(atlasOpen)return;
  if (bossScene) return;
  if (hatchCamera) { P.moving = false; P.t += dt; return; }
  if (doorMotion) { P.moving = false; P.t += dt; return; }
  if (P.act) { P.moving = false; return; }
  {
    let dx = padDx, dy = padDy;
    if (keys.arrowleft || keys.a) dx = -1;
    if (keys.arrowright || keys.d) dx = 1;
    if (keys.arrowup || keys.w) dy = -1;
    if (keys.arrowdown || keys.s) dy = 1;
    if ((dx || dy) && mapGesturesAllowed()) {
      const m2 = Math.hypot(dx, dy) || 1;
      const sp = 900 / Math.max(cam.z, 0.05);
      cam.x += (dx / m2) * sp * dt;
      cam.y += (dy / m2) * sp * dt;
      camFree = true;
      clampCam();
      P.moving = false; P.t += dt;
      return;
    }
    let m = Math.hypot(dx, dy);
    if (arriveT > 0) {
      arriveT = Math.max(0, arriveT - dt);
      dx = dy = 0;
      m = 0;  /* do not carry held-input movement into the final locked frame */
    }
    P.moving = m > 0.01 && arriveT <= 0 && !sayNpc && !sceneHold();
    if (P.moving) {
      dx /= m; dy /= m;
      P.dir8 = direction4(dx,dy,playerFacing4());
      movePlayer(dx, dy, dt);
      if (Math.abs(dx) > Math.abs(dy)) { P.dir = "s"; P.flip = dx < 0; }
      else P.dir = dy < 0 ? "u" : "d";
      P.t += dt;
    } else P.t += dt;
    if (!editing && !camFree && !deflectCamera) {
      const vw = VW / cam.z, vh = VH / cam.z;
      cam.x = P.x - vw / 2; cam.y = P.y - vh / 2;
    }
    clampCam();
  }
}

atlasImg.onload = () => {
  if (!W) {
    try { BOOT.step(12, "unpacking the world"); } catch (e) {}
    inflateWorld().then(() => atlasImg.onload())
                  .catch((e) => { window.__boot = "INFLATE FAILED: " + e; });
    return;
  }
  const step = (m) => { try { window.__boot = (window.__boot || "") + m + "\n"; } catch (e) {} };
  try {
    step("atlas loaded " + atlasImg.width + "x" + atlasImg.height);
    try { BOOT.step(45, "laying out the world"); } catch (e) {}
    try { buildSkinTones(); step("skin tones built"); }
    catch (e) { step("skin tones failed: " + e); }
    step("world inflated, " + W.names.length + " names");
    resize();            step("resize ok, canvas " + cv.width + "x" + cv.height);
    if (!cv.width || !cv.height) {
      let tries = 0;
      const again = () => {
        tries++;
        try { resize(); } catch (e) {}
        if ((cv.width && cv.height) || tries > 40) {
          step("canvas settled at " + cv.width + "x" + cv.height +
               " after " + tries + " tries");
          return;
        }
        setTimeout(again, 100);
      };
      setTimeout(again, 100);
    }
    loadMap(W.start);    step("loadMap ok, " + MW + "x" + MH + " tiles");
    P.x = MD.spawn[0]; P.y = MD.spawn[1];
    step("spawn " + P.x + "," + P.y);
    step("objs " + objs.length + " fobjs " + fobjs.length);
    requestAnimationFrame(frame);
    step("first frame requested");
    (async () => {
      try {
        await BOOT.to(26, 700, "warming the ground");
      await new Promise(r => setTimeout(r, 24));   /* let the bar paint */
      try { BOOT.step(62, "warming the ground"); } catch (e) {}
      try {
        const cx0 = Math.floor(P.x / CHUNK), cy0 = Math.floor(P.y / CHUNK);
        let warmed = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            try { getChunk(cx0 + dx, cy0 + dy); warmed++; } catch (e) {}
          }
          BOOT.step(62 + warmed, "warming the ground");
          await new Promise(r => setTimeout(r, 0));
        }
        step("warmed " + warmed + " ground chunks");
      } catch (e) { step("chunk warm failed: " + e); }
      try { rebuildSolid(); step("collision built"); }
      catch (e) { step("collision failed: " + e); }
      await BOOT.to(58, 800, "waking the world");
      try {
        const here = MAPID;
        const out = (MD.doors || []).find(d => d.to === "world");
        if (out) {
          loadMap("world", true);
          buildGround();
          const wx = out.tx * TS, wy = out.ty * TS;
          const cx1 = Math.floor(wx / CHUNK), cy1 = Math.floor(wy / CHUNK);
          let n2 = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              try { getChunk(cx1 + dx, cy1 + dy); n2++; } catch (e) {}
            }
            BOOT.step(78 + n2, "waking the world");
            await new Promise(r => setTimeout(r, 0));
          }
          rebuildSolid();
          step("warmed " + n2 + " chunks outside the door");
          loadMap(here, true);          /* back indoors, as if nothing happened */
          buildGround();
        }
      } catch (e) { step("outdoor warm failed: " + e); }
      await new Promise(r => setTimeout(r, 24));   /* let the bar paint */
      try { BOOT.step(90, "drawing the map"); } catch (e) {}
      await new Promise(r => setTimeout(r, 24));   /* let the bar paint */
      try { bootBind(); BOOT.ready(); } catch (e) {}
      } catch (e) { step("boot tail threw: " + (e && (e.stack || e.message))); }
    })();
  } catch (e) {
    step("THREW: " + (e && (e.stack || e.message)));
  }
  setTimeout(() => {
    if (window.__firstFrame) return;      /* it drew: nothing to report */
    try { console.warn("EMBERFELL: no first frame\n" + (window.__boot || "")); } catch (e) {}
    if (!window.__bootBanner) return;
    const d = document.createElement("div");
    d.setAttribute("style", "position:fixed;left:0;top:0;right:0;z-index:99999;" +
      "background:#3a0d0d;color:#ffd9d9;font:12px ui-monospace,Menlo,monospace;" +
      "padding:10px;white-space:pre-wrap;max-height:70%;overflow:auto");
    d.textContent = "EMBERFELL: NO FIRST FRAME\n\n" + (window.__boot || "(nothing)");
    (document.body || document.documentElement).appendChild(d);
  }, 20000);
};
atlasImg.onerror = () => { document.body.innerHTML = "<p style='color:#fff;padding:20px'>atlas failed to load</p>"; };
loadAtlasPages().then(() => atlasImg.onload()).catch(() => atlasImg.onerror());

window.__H = { get cv(){return cv;}, get ctx(){return ctx;}, sowDesertRoute, W_GZ, applyWorld, W, SPR, DEFS, NAMES, P, loadMap, buildPatch, fitZoom, overviewZoom,
               get NAMES2(){return NAMES;}, get W2(){return W;}, movePlayer, canStand,
               setBag, refreshBag, bagTick, drawBagIcon, drawBagBig, get bagAnim(){return bagAnim;},
               inClearing, refillRing, stepArena, get foes(){return foes;}, get arenaLock(){return arenaLock;},
               stepPlayer, checkArea, useDoors, interact, startAct, stepAct, inFight, foeDir, breatheFire, canBreathe, stepBreath, mouthOf, fireNow, drawWorld, loadMap2: loadMap, get breath(){return breath;}, set breath(v){breath=v;}, set breathT(v){breathT=v;}, beamLength, BREATH, get dragonFacingLocked(){return dragonFacingLocked;}, get breathT(){return breathT;}, get hunt(){return hunt;}, get dragon(){return dragon;}, stepDragon,
               dragonSprite, dragonFps, dragonAirborne, dragonBob, dragonHover,
               dragonCanStand, dragonGround, dragonStep, noteDragonMotion,
               setDragonAir, refreshWingBtn, startTransition, stepTransition,
               MOUTH, MOUTH_GND, DRAGON_ANIM, DRAGON_SPR, SM_SPR, ACT, dying,
               castSkull, stepSpell, drawSpell, get spell(){return spell;},
               drawBell, stepBell, get bell(){return bell;}, set bell(v){bell=v;},
               showHeal, stepHeal, drawHeal, get heal(){return heal;},
               showRise, stepRise, drawRise, get risings(){return risings;},
               plantRing, stepBlooms, drawBlooms, get blooms(){return blooms;},
               showDust, stepDust, drawDust, get dustPuff(){return dustPuff;},
               useMark, stepGraves, drawGraves, settleGraves, get graves(){return graves;},
               dropGold, get gold(){return gold;}, set gold(v){gold=v;},
               useSaint, get saintT(){return saintT;}, set saintT(v){saintT=v;},
               flyGold, stepFly, drawFly, stepFall, drawFall, drawDying, releaseArena, get arenaT(){return arenaT;}, set arenaT(v){arenaT=v;},
               get flying(){return flying;}, get falling(){return falling;},
               startLastFight, secondPhase, risePhase, stepGrief, get grief(){return grief;}, lastFightHold, winGame, get wonAll(){return wonAll;}, get lastFight(){return lastFight;},
               get smReady() { return smReady; },
               set smReady(v) { smReady = v; },
               get pInv() { return pInv; }, set pInv(v) { pInv = v; },
               set pHp(v) { pHp = v; }, smDir,
               get dragonReady() { return dragonReady; },
               set dragonReady(v) { dragonReady = v; }, get claw(){return claw;}, stepClaw, stepBolts, setDev, mapGesturesAllowed, get devUnlocked(){return devUnlocked;}, get devSafe(){return devSafe;}, get bolts(){return bolts;}, get P2(){return P;}, get foes(){return foes;}, stepCombat, spawnFoes, doorAt, useDoors, stepArena, arenaRim, stepFoes, warmAhead, get arenaLock(){return arenaLock;}, set arenaLock(v){arenaLock=v;}, get marks(){return marks;}, set marks(v){marks=v;}, get arenaT(){return arenaT;}, ATLAS, NAME2I, routeLegs, getChunk, rebuildSolid, padSet: (a,b)=>{padDx=a;padDy=b;}, ROAD_NET, roadOf, roadLegs, set foesHeld(v){foesHeld=v;}, get foesHeld(){return foesHeld;}, get pHp(){return pHp;}, hurtPlayer, get anims(){return anims;},  stepAnims, mapTouchEnd, poolTile, poolCorners, POOL_T,  mapTouchStart, mapTouchMove, buildTravel, get scat(){return scat;}, set editing(v){editing=v;}, set dragObj(v){dragObj=v;}, get finePlace(){return finePlace;}, set finePlace(v){finePlace=v;}, weatherHere, drawWeather, whyBlocked, peekTile, stampedBy, get blockTiles(){return blockTiles;}, fenceAt2:()=>fenceAt, blockedByGuard, odoShuts, blockedByItem, get bannerName() { return bannerName; },
               get padDx() { return padDx; }, get padDy() { return padDy; },
               get running() { return running; },
               get features() { return features; }, get fobjs() { return fobjs; },
               get hidden() { return hidden; }, get objs() { return objs; }, get rockTiles() { return rockTiles; },
               get buildUndo() { return buildUndo; }, moveArea, placesOf,
               get drawArmed() { return drawArmed; }, get building() { return building; },
               get deckPlank() { return deckPlank; }, get decks() { return decks; },
               growWorld, realizeFeatures, buildGround, groundTile, fringeTile,
               GREEN, greenAt, playZoom, notePainted, Q, playScene,
               get quest(){return quest;}, set quest(v){quest=v;},
               get scene(){return scene;}, set scene(v){scene=v;},
               advanceScene, stepQuest,
               hasSword, hasDragon, SPOT, stepKingsMen, stepScene,
               ITEMS, itemAt, takeItem, itemHere, stepWalkers,
               showReveal, hideReveal, get revealing(){return revealing;},
               questTalk, typeAll, stepType, npcHere, stepElder,
               odoTurnsYouBack, odoBlocks, ODO_BRIDGE,
               faceFor, FACE_OF, get faceShown(){return shownFace;},
               get faceSide(){return faceEl.className;},
               get nameSide(){return nameEl.className;},
               get sayVisible(){return sayEl.classList.contains("on");},
               hideSay: () => sayOff(),
               greenFly, greenOffset, get greenT(){return greenT;},
               get greenPhase(){return greenPhase;}, get greenP(){return greenP;},
               BIRDS, scatterBirds, stepBirds, stepShake,
               get shake(){return shake;},
               get birdsUp(){return birdsUp;},
               dragonHere, indoors,
               faceCorinAt,
               comeOut, goBackIn, elder,
               get warnedNorth(){return warnedNorth;},
               set eggWarned(v){eggWarned=v;}, get eggWarned(){return eggWarned;},
               set eggGate(v){eggGate=v;}, set fieldGate(v){fieldGate=v;},
               set warnedNorth(v){warnedNorth=v;},
               get typedAll(){return typeDone();},
               canMoveNow: () => !sceneHold(),
               blockedByHerd, herdHere, HERD, HERD_Y, get MAPID(){return MAPID;},
               banishKingsMen, kingsMen, get walker(){return walker;},
               greenInView, followCam, sayNarr: () => sayIsNarr, resizeArea, terrRLE,
               scaleAreaContents, relayNorthRidge, findRuns,
               get pickedArea(){return pickedArea;},
               set pickedArea(v){pickedArea=v;},
               get features(){return features;},
               get objs(){return objs;}, get scat(){return scat;},
               get baseTerr(){return baseTerr;}, get MD(){return MD;}, get painted() { return painted; },
               get sanm() { return sanm; }, get fsanim() { return fsanim; },
               copyText, pickObject, deleteSelected, deleteGrabbed,
               areaUnder, worthASign, placeArena, styleAt, unfell, resizeArea, fitArea,
               routeLegs, get MD() { return MD; },
               get buckets() { return buckets; }, soilAt, get scatterChunks() { return scatterChunks; }, chunkKey, get sbuckets() { return sbuckets; }, get sanm() { return sanm; },
               get CELL() { return CELL; }, scatterFits,
               get pickedArea() { return pickedArea; },
               set pickedArea(v) { pickedArea = v; },
               get fobjs() { return fobjs; },
               get felled() { return felled; },
               get decorGone() { return decorGone; },
               get decorDel() { return decorDel; },
               get selected() { return selected; }, set selected(v) { selected = v; },
               get grabRect() { return grabRect; }, set grabRect(v) { grabRect = v; },
               get terrOrig() { return terrOrig; }, get baseTerr() { return baseTerr; },
               get painting() { return painting; },
               get terr() { return terr; }, get MW() { return MW; },
               get PXW() { return PXW; }, get PXH() { return PXH; },
               get cam() { return cam; },
               get MAPID() { return MAPID; }, get terr() { return terr; },
               get solid() { return solid; }, get objs() { return objs; }, get rockTiles() { return rockTiles; },
               rebuildSolid, set npcs(v) { npcs = v; }, get npcs() { return npcs; },
               isSolid, canStand, T, GRASS, DIRT, COBBLE, FARM, WATER, BRIDGE, WALL,
               TS, get MW() { return MW; }, get MH() { return MH; } };

let heartKnown = false;
const BAG = [
  { key: "hs_light", kind: "key", name: "Heartstone of the Storm",
    tell: "Cut from the first dragon. It wakes the lightning in her.",
    has: () => breathHas.lightning,
    icon: () => (SPR.it_hs_light ? "it_hs_light" : null) },
  { key: "hs_shadow", kind: "key", name: "Heartstone of the Shadow",
    tell: "Cut from the first dragon. It takes the light out of what it touches.",
    has: () => breathHas.shadow,
    icon: () => (SPR.it_hs_shadow ? "it_hs_shadow" : null) },
  { key: "hs_ice", kind: "key", name: "Heartstone of the Ice",
    tell: "Cut from the first dragon. The last of the four.",
    has: () => breathHas.ice,
    icon: () => (SPR.it_hs_ice ? "it_hs_ice" : null) },
  { key: "saint", name: () => "Saint's Breath" + (breaths > 1 ? " x" + breaths : ""),
    tell: "Sixteen seconds in which nothing touches him.",
    has: () => breaths > 0,
    icon: () => (SPR.it_saint ? "it_saint" : null) },
  { key: "stone", name: () => "Resurrection Stone" + (stones > 1 ? " x" + stones : ""),
    tell: "The nearest of the dead gets up on his side, half as strong as it "
        + "was, until the fighting stops.",
    has: () => stones > 0,
    icon: () => (SPR.it_res ? "it_res" : null) },
  { key: "salt", name: () => "Consecration" + (salts > 1 ? " x" + salts : ""),
    tell: "Scatter it in a ring he has cleared and nothing will rise there again.",
    has: () => salts > 0,
    icon: () => (SPR.it_salt ? "it_salt" : null) },
  { key: "bell", name: () => "Bell Stake" + (bells > 1 ? " x" + bells : ""),
    tell: "Drive it in and it rings. Everything goes to the bell instead of to him.",
    has: () => bells > 0,
    icon: () => (SPR.it_bell ? "it_bell" : null) },
  { key: "mark", name: () => "Grave Marker" + (marks > 1 ? " x" + marks : ""),
    tell: () => (dropped && dropped.gold
                 ? "There is " + dropped.gold + " gold lying where he fell."
                 : "He has not dropped anything anywhere.")
              + " " + marks + " in the pack.",
    has: () => marks > 0,
    icon: () => (SPR.it_mark ? "it_mark" : null) },
  { key: "dust", name: () => "Madness Dust" + (dust > 1 ? " x" + dust : ""),
    tell: "Throw it up and for a little while they cannot tell one another from him.",
    has: () => dust > 0,
    icon: () => (SPR.it_dust ? "it_dust" : null) },
  { key: "bomb", name: () => "Maelis's Curse" + (bombs > 1 ? " x" + bombs : ""),
    tell: "Throw it down and walk away from a fight. It will not save him "
        + "from the things that matter.",
    has: () => bombs > 0,
    icon: () => (SPR.it_bomb ? "it_bomb" : SPR.sh_glow ? "sh_glow" : null) },
  { key: "elixir", name: () => "Elixir" + (elixirs > 1 ? " x" + elixirs : ""),
    tell: "Fills him to the brim. Whatever is in it, it is not for asking about.",
    has: () => elixirs > 0,
    icon: () => (SPR.it_elixir ? "it_elixir" : null) },
  { key: "potion", name: () => "Potion" + (potions > 1 ? " x" + potions : ""),
    tell: "Two hearts back, and no waiting about for it.",
    has: () => potions > 0,
    icon: () => (SPR.it_potion ? "it_potion" : null) },
  { key: "boarMeat", name: () => "Boar Meat" + (boarMeat > 1 ? " x" + boarMeat : ""),
    tell: "A heavy cut for the dragon. Restores " + BOAR_MEAT_HEAL + " HP and gets it back on its feet.",
    has: () => boarMeat > 0,
    icon: () => (SPR.pig_graze ? "pig_graze" : null) },
  { key: "dragonFish", name: () => "Fresh Fish" + (dragonFish > 1 ? " x" + dragonFish : ""),
    tell: "A fresh catch for the dragon. Restores " + DRAGON_FISH_HEAL + " HP and gets it back on its feet.",
    has: () => dragonFish > 0,
    icon: () => (SPR.hb_fish1 ? "hb_fish1" : null) },
  {key:'fishingPole',name:'Fishing Pole',kind:'key',has:()=>fishingPole,
    tell:'A gift from Liora at Forgefalls. Face water and press A; stop the marker in the green arc to catch dragon-healing fish.',icon:()=> 'fishing_rod'},
  { key: "glassShield", name: "Glass Shield", kind: "key",
    tell: "Sela's clear-glass focus. Tap/hold B to raise a brief force field. Move with B held to run. Orange flashes warn of blockable attacks; red flashes warn of unblockable attacks.",
    has: () => glassShield,
    icon: () => (SPR.it_ward ? "it_ward" : SPR.sh_glow ? "sh_glow" : null) },
  { key: "wake", name: "Book of the Dead", kind: "key",
    tell: "Taken from the Hollybeck graves. Carry it and two of them rise at "
        + "your call -- there is no need to wear it.",
    has: () => charm.wake,
    icon: () => (SPR.it_wake ? "it_wake" : SPR.it_stone ? "it_stone" : null) },
  { key: "flame", kind: "charm", name: "Twin Flame",
    tell: "Won in the last gallery. With the Twin Heart worn, four kills and the heart beats again.",
    has: () => charm.flame, charm: "flame",
    icon: () => (SPR.it_twinflame ? "it_twinflame" : SPR.fire_s ? "fire_s" : null) },
  { key: "lamp", kind: "key", name: "Hollybeck Lantern",
    tell: "Torvald trimmed the wick himself. It has never once gone out, and the deep workings can be walked with it.",
    has: () => charm.lamp,
    icon: () => (SPR.it_lamp ? "it_lamp" : SPR.wt_torch1 ? "wt_torch1" : null) },
  { key: "twin", kind: "charm", name: "Twin Heart",
    tell: "Once in each fight the dragon steps into a blow meant for Corin.",
    has: () => charm.twin, charm: "twin",
    icon: () => (SPR.it_twin ? "it_twin" : SPR.dr5_idle_e ? "dr5_idle_e" : null) },
  { key: "brand", kind: "charm", name: "Fire Slash",
    tell: "A rune cut into stone and still burning. Every third swing catches fire and bites harder.",
    has: () => charm.brand, charm: "brand",
    icon: () => (SPR.it_brand ? "it_brand" : SPR.fslash_d ? "fslash_d" : null) },
  { key: "spore", kind: "charm", name: "Spore of the deep ring",
    tell: "The Shroom King's gift. Worn, it feeds a heart back for every kill.",
    has: () => charm.spore, charm: "spore",
    icon: () => (SPR.it_spore ? "it_spore" : SPR.ms3_idle_d ? "ms3_idle_d" : null) },
  { key: "ward", kind: "charm", name: "Witch's Ward",
    tell: "Maelis strung it herself. Worn, it turns a quarter of any blow.",
    has: () => charm.ward, charm: "ward",
    icon: () => (SPR.it_ward ? "it_ward" : SPR.it_stone ? "it_stone" : null) },
  { key: "edge", kind: "charm", name: "Dunstan's Whetstone",
    tell: "He put an edge on it every morning for forty years. Every blow lands a little heavier.",
    has: () => charm.edge, charm: "edge",
    icon: () => (SPR.it_edge ? "it_edge" : null) },
  { key: "sword", kind: "key", name: "Sword",
    tell: "Taken from the Elder's hall. Heavier than it looks.",
    has: () => hasSword(),
    icon: () => (SPR.it_sword ? "it_sword" : SPR.sm_atk_d ? "sm_atk_d" : null) },
  { key: "smithEquipment", kind: "key", name: "Forgewick armor and sword",
    tell: "Fitted by Dunstan. A stronger blade and armor that softens heavy blows.",
    has: () => smithUpgrade && hasSword(),
    icon: () => "corin_armor_idle_d" },
  { key: "cinderSeal", kind: "key", name: "Cinderhold Seal",
    tell: "Given by the demon after Halvard's defeat. Place it in the chamber adjoining the throne room, then speak to the demon there to begin the trials.",
    has: () => cinderSeal,
    icon: () => "it_cinderseal" },
  { key: "egg", name: "Dragon's egg",
    tell: "Warm to the touch. Maddock said there had not been one in fifty years.",
    has: () => quest >= Q.CARRY && quest < Q.DONE,
    icon: () => (SPR.it_egg ? "it_egg" : SPR.nest1 ? "nest1" : null) },
  { key: "heart", kind: "key",
    name: () => (heartKnown ? "Heartstone of the Flame" : "Mysterious stone"),
    tell: () => heartKnown
      ? "The first of the four, and the one she was born with. Aldric says "
        + "this is what binds a rider to a dragon."
      : "It was inside the shell. Smooth, and warmer than it ought to be.",
    has: () => quest >= Q.DONE,
    icon: () => (SPR.it_hs_flame ? "it_hs_flame" : SPR.it_egg ? "it_egg" : null) },
  { key: "eggs", name: "Six brown eggs",
    tell: "Gathered for the errand. Do not run.",
    has: () => quest >= Q.KING && quest < Q.ELDER,
    icon: () => (SPR.nest2 ? "nest2" : null) },
];
let bagOpen = false, bagPick = 0;

/* Animated bag icons. refreshBag() rebuilds the slots as DOM canvases and only
   runs on open or click, so anything with more than one frame registers its
   canvas here and a rAF loop repaints just those. Redrawing them in place
   rather than calling refreshBag() keeps the click handlers and the DOM alive. */
let bagFrame = 0, bagAnim = [], bagRAF = 0;
const BAG_FPS = 9;

function drawBagBig(big, spriteName, f) {
  const bg = big.getContext("2d");
  bg.clearRect(0, 0, big.width, big.height);
  const sp = spriteName && SPR[spriteName];
  if (!sp) return;
  const fr = sp[4] > 1 ? ((f | 0) % sp[4]) : 0;
  bg.imageSmoothingEnabled = false;
  /* The canvas is 260px square. The original scaled to fit 88 and then centred
     in the full width, so every icon sat stranded at a third of its size. */
  const room = Math.min(big.width, big.height) - 24;
  const sc = Math.max(1, Math.floor(Math.min(room / sp[2], room / sp[3])));
  const img = sp[5] === 2 ? smImg : sp[5] ? dragonImg : atlasImg;
  drawGameImage(bg, img, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
               (big.width - sp[2] * sc) / 2, (big.height - sp[3] * sc) / 2,
               sp[2] * sc, sp[3] * sc);
}

function bagTick() {
  bagRAF = 0;
  if (!bagOpen || !bagAnim.length) return;
  const f = Math.floor(performance.now() / (1000 / BAG_FPS));
  if (f !== bagFrame) {
    bagFrame = f;
    for (const [cv, nm, big] of bagAnim) {
      if (!cv.isConnected) continue;
      if (big) drawBagBig(cv, nm, f); else drawBagIcon(cv, nm, f);
    }
  }
  bagRAF = requestAnimationFrame(bagTick);
}
function bagName(it) { return typeof it.name === "function" ? it.name() : it.name; }
function bagTell(it) { return typeof it.tell === "function" ? it.tell() : it.tell; }
const BAG_ORDER = { key: 0, charm: 1, use: 2 };
function bagKind(it) { return it.kind || (it.charm ? "charm" : "use"); }
function bagHeld() {
  const held = BAG.filter(it => { try { return !!it.has(); } catch (e) { return false; } });
  held.sort((a, b) => BAG_ORDER[bagKind(a)] - BAG_ORDER[bagKind(b)]);
  return held;
}
function drawBagIcon(cv, spriteName, f) {
  const g = cv.getContext("2d"), s = SPR[spriteName];
  g.clearRect(0, 0, cv.width, cv.height);
  if (!s) return;
  const room = Math.min(cv.width, cv.height) - 6;
  const fit = Math.min(room / s[2], room / s[3]);
  const sc = fit >= 1 ? Math.min(3, Math.floor(fit)) : fit;
  const fr = s[4] > 1 ? ((f | 0) % s[4]) : 0;
  g.imageSmoothingEnabled = false;
  drawGameImage(g, sheetOf(s), s[0] + fr * s[2], s[1], s[2], s[3],
              (cv.width - s[2] * sc) / 2, (cv.height - s[3] * sc) / 2,
              s[2] * sc, s[3] * sc);
}
let bookOpen = false, bookPick = 0;
function drawBookArt(cv, ent, known) {
  const g = cv.getContext("2d");
  g.clearRect(0, 0, cv.width, cv.height);
  const kinds = [ent.k];
  const sps = kinds.map(k => {
    const art = FOE_ART[k];
    return art && (SPR[art + "_idle_d"] || SPR[art + "_walk_d"]
                || SPR[art + "_idle"]   || SPR[art + "_walk"]);
  }).filter(Boolean);
  if (!sps.length) return;
  g.imageSmoothingEnabled = false;
  const n = sps.length;
  const small = cv.width < 150;      /* a tile, however big; not the portrait */
  const pad = small ? 8 : 6;
  if (small) {
    const slot = cv.width / n;
    sps.forEach((sp, i) => {
      const fit = Math.min((slot - pad) / sp[2], (cv.height - pad) / sp[3]);
      const sc = fit >= 1 ? Math.floor(fit) : fit;
      const dw = sp[2] * sc, dh = sp[3] * sc;
      drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(slot * i + (slot - dw) / 2),
                  Math.round((cv.height - dh) / 2), dw, dh);
    });
  } else {
    const share = n > 2 ? 1 / n : n > 1 ? 0.74 : 1;
    sps.forEach((sp, i) => {
      const sc = Math.max(1, Math.floor(Math.min((cv.width * share - pad) / sp[2],
                                                 (cv.height * share - pad) / sp[3])));
      const dw = sp[2] * sc, dh = sp[3] * sc;
      const off = n > 2 ? (i - (n - 1) / 2) * cv.width / n
                : n > 1 ? (i === 0 ? -1 : 1) * cv.width * 0.13 : 0;
      drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round((cv.width - dw) / 2 + off),
                  Math.round((cv.height - dh) / 2 + (n > 1 ? (i === 0 ? -6 : 6) : 0)),
                  dw, dh);
    });
  }
  if (!known) {
    g.globalCompositeOperation = "source-atop";
    g.fillStyle = "#0a0b10";
    g.fillRect(0, 0, cv.width, cv.height);
    g.globalCompositeOperation = "source-over";
  }
}
function refreshBook() {
  const rows = document.getElementById("bagRows");
  const desc = document.getElementById("bagDesc");
  if (!rows || !desc) return;
  if (bookPick < 0) bookPick = BESTIARY.length - 1;
  if (bookPick >= BESTIARY.length) bookPick = 0;
  rows.innerHTML = "";
  const PAGES = bookOrder();
  PAGES.forEach((ent, k) => {
    const known = !!seenFoe[ent.k];
    const d = document.createElement("div");
    d.className = "slot" + (k === bookPick ? " on" : "") + (known ? "" : " empty");
    const cv = document.createElement("canvas");
    cv.width = 96; cv.height = 96;
    cv.style.cssText = "image-rendering:pixelated;width:100%;height:auto";
    d.appendChild(cv);
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      if (bagDragged()) return;
      bookPick = k; refreshBook();
    });
    rows.appendChild(d);
    drawBookArt(cv, ent, known);
  });
  const ent = PAGES[bookPick], known = !!seenFoe[ent.k];
  const big = document.getElementById("bagBig");
  if (big) drawBookArt(big, ent, known);
  desc.innerHTML = known
    ? "<b>" + ent.n + "</b><span>" + ent.t + "</span><span style='opacity:.65'>Found in "
      + ent.w + ".</span>"
    : "<b>?????</b><span>He has not met this one.</span>";
  const n = BESTIARY.filter(e => seenFoe[e.k]).length;
  const g2 = document.getElementById("bagGold");
  if (g2) { const i = g2.querySelector("i");
            if (i) i.textContent = n + "/" + BESTIARY.length; }

}
function refreshBag() {
  bagAnim = [];
  const bk = document.getElementById("bagBook");
  if (bk && !bk._wired) {
    bk._wired = 1;
    bk.addEventListener("click", (e) => {
      e.stopPropagation(); bookOpen = !bookOpen; refreshBag();
    });
  }
  if (bk) {
    const lab = bk.querySelector("i");
    if (lab) lab.textContent = bookOpen ? "CLOSE" : "BESTIARY";
    else bk.textContent = bookOpen ? "CLOSE" : "BESTIARY";
    const bi = document.getElementById("bagBookIcon");
    const bsp = (bookOpen && SPR.it_book_open) ? SPR.it_book_open : SPR.it_book;
    if (bi && bsp) {
      const bg = bi.getContext("2d");
      bg.clearRect(0, 0, bi.width, bi.height);
      bg.imageSmoothingEnabled = false;
      const bs = Math.min(bi.width / bsp[2], bi.height / bsp[3]);
      drawGameImage(bg, atlasImg, bsp[0], bsp[1], bsp[2], bsp[3],
                   Math.round((bi.width - bsp[2] * bs) / 2),
                   Math.round((bi.height - bsp[3] * bs) / 2),
                   bsp[2] * bs, bsp[3] * bs);
    }
  }
  const bagEl = document.getElementById("bag");
  if (bagEl) bagEl.classList.toggle("book", !!bookOpen);
  if (bookOpen) { refreshBook(); return; }
  const g = document.getElementById("bagGold");
  if (g) { const i = g.querySelector("i"); if (i) i.textContent = gold; }
  const cn = document.getElementById("bagCoin");
  if (cn) {
    const sp = SPR.it_coin || SPR.gold_p2;
    const cg = cn.getContext("2d");
    cg.clearRect(0, 0, cn.width, cn.height);
    if (sp) {
      cg.imageSmoothingEnabled = false;
      const sc = Math.min(cn.width / sp[2], cn.height / sp[3]);
      drawGameImage(cg, atlasImg, sp[0], sp[1], sp[2], sp[3],
                   Math.round((cn.width - sp[2] * sc) / 2),
                   Math.round((cn.height - sp[3] * sc) / 2),
                   sp[2] * sc, sp[3] * sc);
    }
  }
  const rows = document.getElementById("bagRows");
  const desc = document.getElementById("bagDesc");
  const held = bagHeld();
  rows.innerHTML = "";
  if (bagPick >= held.length) bagPick = held.length - 1;
  if (bagPick < 0) bagPick = 0;
  const SLOTS = Math.max(8, Math.ceil((held.length + 1) / 4) * 4);
  let lastKind = null;
  for (let k = 0; k < SLOTS; k++) {
    const it = held[k];
    if (it) {
      const kind = bagKind(it);
      if (kind !== lastKind) {
        if (lastKind !== null) {
          while (rows.querySelectorAll(".slot").length % 4) {
            const pad = document.createElement("div");
            pad.className = "slot empty";
            rows.appendChild(pad);
          }
        }
        lastKind = kind;
        const h = document.createElement("div");
        h.style.cssText = "grid-column:1/-1;font-size:10px;letter-spacing:2px;"
          + "opacity:.6;margin:6px 0 0;text-transform:uppercase";
        h.textContent = kind === "key" ? "carried"
                      : kind === "charm" ? "charms" : "supplies";
        rows.appendChild(h);
      }
    }
    const d = document.createElement("div");
    d.className = "slot" + (it ? "" : " empty") + (it && k === bagPick ? " on" : "");
    if (it) {
      const cv = document.createElement("canvas");
      cv.width = 46; cv.height = 46;
      d.appendChild(cv);
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        if (bagDragged()) return;
        bagPick = k; refreshBag();
      });
      const ic = it.icon();
      if (ic) { drawBagIcon(cv, ic, bagFrame); if (SPR[ic] && SPR[ic][4] > 1) bagAnim.push([cv, ic]); }
    }
    rows.appendChild(d);
  }
  desc.innerHTML = held.length
    ? "<b>" + bagName(held[bagPick]) + "</b><span>" + bagTell(held[bagPick]) + "</span>"
    : "<span>Corin is not carrying anything yet.</span>";
  const big = document.getElementById("bagBig");
  if (big) {
    const ic = held.length && held[bagPick].icon();
    drawBagBig(big, ic, bagFrame);
    if (ic && SPR[ic] && SPR[ic][4] > 1) bagAnim.push([big, ic, 1]);
  }
  const pickIt = held[bagPick];
  if (pickIt && (pickIt.key === "potion" || pickIt.key === "elixir")) {
    const b = document.createElement("div");
    b.className = "equipBtn";
    b.textContent = pickIt.key === "elixir" ? "DRINK -- full health (A)"
                                            : "DRINK -- two hearts (A)";
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pickIt.key === "elixir") drinkElixir(); else drinkPotion();
      refreshBag();
    });
    desc.appendChild(b);
  }
  if (pickIt && pickIt.charm) {
    const b = document.createElement("div");
    b.className = "equipBtn" + (worn[pickIt.charm] ? " on" : "");
    const full = !worn[pickIt.charm] && wornCount() >= WORN_MAX;
    b.textContent = worn[pickIt.charm] ? "EQUIPPED -- A to unequip"
                  : full ? "EQUIP (" + wornCount() + "/" + WORN_MAX + " -- full)"
                  : "EQUIP (" + wornCount() + "/" + WORN_MAX + ")";
    if (full) b.className += " full";
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = worn[pickIt.charm];
      if (!on && wornCount() >= WORN_MAX) {
        toast("three at a time -- take one off first");
        return;
      }
      worn[pickIt.charm] = !on;
      refreshBag();
    });
    desc.appendChild(b);
  }
}
let ask = null, askPick = 0;
function askBack(){const back=ask?.back;askShut();if(back)back();}
function askShut() {
  if(fishing&&fishing.phase==='prompt')endFishing();
  ask = null;
  const el = document.getElementById("bagAsk");
  if (el) el.style.display = "none";
}
function askDraw() {
  const el = document.getElementById("bagAsk");
  const rows = document.getElementById("askRows");
  if (!el || !rows) return;
  if (!ask) { el.style.display = "none"; return; }
  el.style.display = "block";
  wireBagDrag("bagAsk");
  el.style.width=ask.quantity?'200px':ask.confirmation?'260px':'';
  rows.innerHTML = "";
  if(ask.quantity){
    const q=ask.quantity,item=STOCK[q.key];
    const title=document.createElement('div');title.textContent=item.n;
    title.style.cssText='text-align:center;font-size:14px;font-weight:bold;padding:6px';rows.appendChild(title);
    const controls=document.createElement('div');controls.style.cssText='display:flex;align-items:center;justify-content:center;gap:14px;padding:4px';
    for(const [label,delta]of [['▼',-1],['▲',1]]){
      const b=document.createElement('button');b.type='button';b.textContent=label;
      b.setAttribute('aria-label',delta>0?'Increase quantity':'Decrease quantity');
      b.style.cssText='width:44px;height:44px;font-size:18px';b.disabled=delta>0?q.qty>=q.max:q.qty<=1;
      b.addEventListener('click',e=>{e.stopPropagation();changePurchaseQuantity(delta);});controls.appendChild(b);
      if(delta<0){const value=document.createElement('span');value.textContent=q.qty;value.setAttribute('aria-live','polite');value.style.cssText='font-size:28px;font-weight:bold;min-width:32px;text-align:center';controls.appendChild(value);}
    }
    rows.appendChild(controls);
    const detail=document.createElement('div');detail.textContent='Total: '+q.qty*item.cost()+'g · Gold: '+gold;
    detail.style.cssText='text-align:center;font-size:13px;padding:6px';rows.appendChild(detail);
    const hint=document.createElement('div');hint.textContent='D-pad ↑ / ↓: quantity';hint.style.cssText='text-align:center;font-size:12px;padding:3px';rows.appendChild(hint);
  }
  ask.opts.forEach((o, i) => {
    const d = document.createElement("div");
    if (o.head) {
      const heal = o.n === "HEALTH";
      d.style.cssText = "margin:5px 2px 3px;padding:3px 8px;border-radius:5px;"
        + "font-size:10px;font-weight:700;letter-spacing:3px;"
        + "text-transform:uppercase;"
        + (heal ? "color:#4a6b3d;background:rgba(120,170,100,.28);"
                + "border-left:3px solid #6f9c58;"
                : "color:#7a3f3a;background:rgba(190,110,95,.26);"
                + "border-left:3px solid #b0685c;");
      d.textContent = o.n;
      if(ask.confirmation)d.style.cssText='padding:8px;font-size:14px;line-height:1.45;font-weight:bold;white-space:normal;overflow-wrap:anywhere';
      rows.appendChild(d);
      return;
    }
    d.style.cssText = "padding:8px;border-radius:6px;white-space:normal;overflow-wrap:anywhere;"
      + (i === askPick ? "background:#d8c9a4;font-weight:700" : "");
    if (o.icon && SPR[o.icon]) {
      d.style.cssText += ";display:flex;align-items:center;gap:6px";
      const cv = document.createElement("canvas");
      cv.width = 18; cv.height = 18;
      cv.style.cssText = "image-rendering:pixelated;width:18px;height:18px;flex:0 0 auto";
      d.appendChild(cv);
      const sp = SPR[o.icon], g = cv.getContext("2d");
      g.imageSmoothingEnabled = false;
      const sc = Math.max(1, Math.min(Math.floor(18 / sp[2]), Math.floor(18 / sp[3])));
      drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round((18 - sp[2] * sc) / 2), Math.round((18 - sp[3] * sc) / 2),
                  sp[2] * sc, sp[3] * sc);
      const t = document.createElement("span");
      t.textContent = (i === askPick ? "\u25B8 " : "  ") + o.n;
      d.appendChild(t);
    } else {
      d.textContent = (i === askPick ? "\u25B8 " : "  ") + o.n;
    }
    d.dataset.askIndex = i;
    d.addEventListener("click", (e) => { e.stopPropagation(); if(el.moved)return; askPick = i; askTake(); });
    rows.appendChild(d);
  });
}
function askStep(d) {
  if (!ask) return;
  if(ask.quantity){changePurchaseQuantity(-d);return;}
  const n = ask.opts.length;
  let k = askPick;
  for (let i = 0; i < n; i++) {
    k = (k + d + n) % n;
    if (!ask.opts[k].head) break;
  }
  askPick = k;
  askDraw();
  const box=document.getElementById("bagAsk"), row=box.querySelector('[data-ask-index="'+askPick+'"]');
  if(row){const a=row.getBoundingClientRect(),b=box.getBoundingClientRect();
    if(a.top<b.top+6)box.scrollTop-=b.top+6-a.top;
    else if(a.bottom>b.bottom-6)box.scrollTop+=a.bottom-b.bottom+6;}
}
const USE_SAID = {
  mark:   ["it_mark",   "Corin planted the Grave Marker!"],
  salt:   ["it_salt",   "Corin consecrated the ground!"],
};
function askTake() {
  if (!ask) return;
  const o = ask.opts[askPick];
  if (!o || o.head) return;              /* a header does nothing */
  const key = ask.key, quick = ask.quick;
  askShut();
  if (quick) { if (o.go) o.go(); return; }   /* the on-screen list does its own box */
  const done = o.go ? o.go() : null;
  if (!o.go || done === false) { refreshBag(); return; }
  if (USABLE[key]) setBag(false);
  const said = USE_SAID[key];
  if (said) {
    setBag(false);                       /* out of the pack and back to it */
    flashReveal(SPR[said[0]] ? said[0] : "it_potion", said[1]);
    return;
  }
  refreshBag();
}
const HEALS = { potion: 0, elixir: 1, boarMeat: 2, dragonFish: 3 };
const USABLE = { potion: 1, elixir: 1, boarMeat: 1, dragonFish: 1, bomb: 1, dust: 1, bell: 1,
                 mark: 1, saint: 1, stone: 1, salt: 1 };
function bagUsable() {
  const list = BAG.filter(it => {
    if (!USABLE[it.key]) return false;
    try { return !!it.has(); } catch (e) { return false; }
  });
  list.sort((a, b) => {
    const ha = HEALS[a.key] !== undefined, hb = HEALS[b.key] !== undefined;
    if (ha !== hb) return ha ? -1 : 1;
    if (ha) return HEALS[a.key] - HEALS[b.key];
    return 0;
  });
  return list;
}
function useAsk() {
  const list = bagUsable();
  if (!list.length) { toast("nothing to use"); return; }
  const opts = [];
  let lastHeal = null;
  for (const it of list) {
    const heal = HEALS[it.key] !== undefined;
    if (heal !== lastHeal) {
      lastHeal = heal;
      opts.push({ n: heal ? "HEALTH" : "BATTLE", head: 1 });
    }
    opts.push({
      n: (typeof it.name === "function" ? it.name() : it.name).toUpperCase(),
      icon: it.icon ? it.icon() : null,
      go: () => doUse(it),
    });
  }
  opts.push({ n: "CANCEL", go: null });
  ask = { opts, quick: 1 };
  askPick = opts.findIndex(o => !o.head);   /* never start on a header */
  if (askPick < 0) askPick = 0;
  askDraw();
}
function doUse(it) {
  const act = it.key === "potion" ? drinkPotion
            : it.key === "elixir" ? drinkElixir
            : it.key === "boarMeat" ? () => feedDragon("meat")
            : it.key === "dragonFish" ? () => feedDragon("fish")
            : it.key === "bomb"   ? useBomb
            : it.key === "dust"   ? useDust
            : it.key === "bell"   ? useBell
            : it.key === "mark"   ? useMark
            : it.key === "saint"  ? useSaint
            : it.key === "stone"  ? useStone
            : it.key === "salt"   ? useSalt
            : null;
  if (!act) return false;
  const done = act();
  if (done === false) return false;
  setBag(false);setOvl(null);
  const said = USE_SAID[it.key];
  if (said) flashReveal(SPR[said[0]] ? said[0] : "it_potion", said[1]);
  return true;
}
function bagUse() {
  if (ask) { askTake(); return; }
  if (bookOpen) { bookOpen = false; refreshBag(); return; }
  const held = bagHeld();
  const it = held[bagPick];
  if (!it) { setBag(false); return; }
  const opts = [];
  if (it.key === "saint") opts.push({ n: "BREATHE IT", go: useSaint });
  else if (it.key === "stone") opts.push({ n: "RAISE ONE", go: useStone });
  else if (it.key === "salt") opts.push({ n: "SCATTER IT", go: useSalt });
  else if (it.key === "bell") opts.push({ n: "DRIVE IT IN", go: useBell });
  else if (it.key === "mark") opts.push({ n: "PLANT THEM", go: useMark });
  else if (it.key === "dust") opts.push({ n: "THROW IT", go: useDust });
  else if (it.key === "bomb") opts.push({ n: "SPEAK IT", go: useBomb });
  else if (it.key === "potion") opts.push({ n: "USE", go: drinkPotion });
  else if (it.key === "elixir") opts.push({ n: "USE", go: drinkElixir });
  else if (it.key === "boarMeat") opts.push({ n: "FEED DRAGON", go: () => feedDragon("meat") });
  else if (it.key === "dragonFish") opts.push({ n: "FEED DRAGON", go: () => feedDragon("fish") });
  else if (it.charm) {
    const on = worn[it.charm];
    if (!on && wornCount() >= WORN_MAX) { toast("three at a time -- take one off first"); return; }
    opts.push({ n: on ? "UNEQUIP" : "EQUIP",
                go: () => { worn[it.charm] = !on; toast(!on ? "worn" : "taken off"); } });
  } else { toast("nothing to do with it"); return; }
  opts.push({ n: "CANCEL", go: null });
  ask = { opts, key: it.key }; askPick = 0;
  askDraw();
}
function bagStep(d) {
  if (ask) { askStep(d > 0 ? 1 : -1); return; }   /* the box has the pad */
  if (bookOpen) {
    bookPick += (Math.abs(d) >= 4) ? (d > 0 ? 2 : -2) : d;
    const n = BESTIARY.length;
    if (Math.abs(d) >= 4) bookPick = Math.max(0, Math.min(n - 1, bookPick));
    else { while (bookPick < 0) bookPick += n; bookPick %= n; }
    refreshBook();
    bagShow();                 /* and bring the choice into view */
    return;
  }
  const held = bagHeld();
  if (!held.length) return;
  const cells = bagGrid(held);
  const at = cells.indexOf(bagPick);
  if (at < 0) { bagPick = 0; refreshBag(); bagShow(); return; }
  if (Math.abs(d) >= 4) {
    const step = d > 0 ? 4 : -4;
    let k = at + step;
    while (k >= 0 && k < cells.length && cells[k] === null) k += (d > 0 ? 1 : -1);
    if (k >= 0 && k < cells.length && cells[k] !== null) bagPick = cells[k];
  } else {
    let k = at + d;
    while (k >= 0 && k < cells.length && cells[k] === null) k += d;
    if (k < 0) k = cells.length - 1;
    if (k >= cells.length) k = 0;
    while (cells[k] === null) k = (k + (d > 0 ? 1 : -1) + cells.length) % cells.length;
    bagPick = cells[k];
  }
  refreshBag();
  bagShow();
}
function bagGrid(held) {
  const cells = [];
  let lastKind = null;
  held.forEach((it, i) => {
    const kind = bagKind(it);
    if (kind !== lastKind) {
      if (lastKind !== null) while (cells.length % 4) cells.push(null);
      lastKind = kind;
    }
    cells.push(i);
  });
  return cells;
}
function bagShow() {
  const rows = document.getElementById("bagRows");
  const left = document.getElementById("bagLeft");
  if (!rows || !left) return;
  const on = rows.querySelector(".slot.on");
  if (!on) return;
  const a = on.getBoundingClientRect(), b = left.getBoundingClientRect();
  if (a.top < b.top) left.scrollTop -= (b.top - a.top) + 8;
  else if (a.bottom > b.bottom) left.scrollTop += (a.bottom - b.bottom) + 12;
}
function wireBagDrag(id = "bagLeft") {
  var left = document.getElementById(id);
  if (!left || left._wired) return;
  left._wired = 1;
  var y0 = 0, top0 = 0, on = false;
  left.moved = 0;
  function yOf(e) {
    if (e.touches && e.touches.length) return e.touches[0].clientY;
    return e.clientY || 0;
  }
  left.addEventListener("touchstart", function (e) {
    on = true; y0 = yOf(e); top0 = left.scrollTop; left.moved = 0;
  }, { passive: true });
  left.addEventListener("touchmove", function (e) {
    if (!on) return;
    var dy = yOf(e) - y0;
    if (dy > 3 || dy < -3) left.moved = 1;
    var max = left.scrollHeight - left.clientHeight;
    if (max < 0) max = 0;
    var t = top0 - dy;
    left.scrollTop = t < 0 ? 0 : (t > max ? max : t);
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
  function done() {
    on = false;
    setTimeout(function () { left.moved = 0; }, 30);
  }
  left.addEventListener("touchend", done, { passive: true });
  left.addEventListener("touchcancel", done, { passive: true });
}
function bagDragged() {
  var left = document.getElementById("bagLeft");
  return !!(left && left.moved);
}
function setBag(on) {
  if(on&&fishing)return;
  if (!on) { bookOpen = false; askShut(); }      /* both shut with the pack */
  bagOpen = on;
  document.getElementById("bag").style.display = on ? "flex" : "none";
  if (on) { bagPick = 0; refreshBag(); wireBagDrag(); if (!bagRAF) bagRAF = requestAnimationFrame(bagTick); }
  else if (bagRAF) { cancelAnimationFrame(bagRAF); bagRAF = 0; bagAnim = []; }
}

const WM_ABOUT = {
  "Millwood":            "The mill village where Corin began. Waterwheel, a few roofs, and the road east.",
  "Thornwell":           "A woodland town of thorn hedges and close-set houses, second on the road.",
  "Forgewick":           "Forge town at the woodland's edge. Its mine runs deep under the hills.",
  "Forgewick Temple":    "Quiet hall south-east of the forge, kept by its own order.",
  "Sandspire":           "Spire city of the deep desert, built where the sand road meets the dunes.",
  "Sandspire Temple":    "Sandstone temple standing alone in the southern desert.",
  "The Oasis":           "Green water in the middle of the sand. Everything that crosses stops here.",
  "Coralmere":           "Harbour on the blue bay, where the desert gives way to the wet country.",
  "Hollybeck":           "Snowbound town below the crags, last settlement before the mountains.",
  "Hollybeck Temple":    "High temple north-east of the town, above the snowline.",
  "Hollybeck Graveyard": "Old stones west of Hollybeck, older than the town itself.",
  "Northern Woods":      "Deep timber north of Millwood. No road runs through it.",
  "Shroom Pass":         "A gorge grown over with mushrooms, north of the mill.",
  "North Shroom Pass Field": "Open ground at the head of the pass.",
  "Spore Hollow":        "A dell in the northern woods, thick with spores.",
  "Elders Home":         "The witch's cottage south of Millwood. A light in the window, always.",
  "Forgefalls":       "Water off the moor, south of the road.",
  "Witchmoor":      "A landing on the swamp water, east of Coralmere.",
  "Frostcrag":           "Snow mountain at the eastern edge. A pass runs under it.",
  "Ashcrag":             "Volcanic mountain, the far mouth of the pass. Lava road beyond.",
  "Cinderhold":          "Dark keep on an island in the lava, at the end of the last road.",
};
const BOOT = {
  at: 0, timer: 0,
  paint() {
    const f = document.getElementById("bootFill");
    if (f) f.style.width = BOOT.at.toFixed(1) + "%";
  },
  say(msg) {
    const m = document.getElementById("bootMsg");
    if (m && msg) m.textContent = msg;
  },
  to(pct, ms, msg) {
    BOOT.say(msg);
    return new Promise((res) => {
      const from = BOOT.at, span = pct - from, t0 = Date.now();
      if (BOOT.timer) clearInterval(BOOT.timer);
      BOOT.timer = setInterval(() => {
        let p = (Date.now() - t0) / ms;
        if (p > 1) p = 1;
        BOOT.at = from + span * (1 - Math.pow(1 - p, 2));
        BOOT.paint();
        if (p >= 1) { clearInterval(BOOT.timer); BOOT.timer = 0; res(); }
      }, 16);
    });
  },
  step(pct, msg) { BOOT.say(msg); },
  waiting: false,
  async ready() {
    await BOOT.to(100, 900, "");
    BOOT.waiting = true;
    const m = document.getElementById("bootMsg");
    const b = document.getElementById("bootBtns");
    const l = document.getElementById("bootLoad");
    const bar = document.getElementById("bootFill");
    if (bar) bar.style.width = "100%";
    if (m) m.textContent = "";
    if (b) b.style.display = "flex";
    const lbl = document.getElementById("bootLabel");
    if (lbl) { lbl.textContent = "LOADED!"; lbl.style.color = "#f0c060"; }
    const h = document.getElementById("bootHint");
    if (h) h.textContent = "press A to start";
    let has = false;
    try { migrateLegacySave(); has = !!(readSaveSlot(1)||readSaveSlot(2)||readSaveSlot(3)); } catch (e) { has = false; }
    if (l) { l.style.opacity = has ? "1" : ".35"; l.dataset.on = has ? "1" : ""; }
  },
  close() {
    BOOT.waiting = false;
    const el = document.getElementById("boot");
    if (el) el.style.display = "none";
  },
};
function bootStart() { try { BOOT.to(9, 450, "waking the embers"); } catch (e) {} }
bootStart();

function bootBind() {
  const nw = document.getElementById("bootNew");
  const ld = document.getElementById("bootLoad");
  if (nw && nw.addEventListener)
    nw.addEventListener("click", () => { BOOT.close(); });
  if (ld && ld.addEventListener)
    ld.addEventListener("click", () => {
      if (!ld.dataset.on) return;
      BOOT.close();
      try { setOvl("loadSlots"); } catch (e) {}
    });
}

const MENUS = {
  menu: { rows: "menuRows", desc: "menuDesc", pick: 0, items: () => [
    { name: "Map", tell: "Explore Emberfell. Use the D-pad to select a location.", go: () => openAtlas("menu") },
    { name: "Inventory",   tell: "What Corin has on him.",        go: () => { setOvl(null); setBag(true); } },
    { name: "Save",        tell: "Save to a new slot or overwrite an existing save.", go: () => setOvl("savePrompt") },
    { name: "Load",        tell: "Choose which save to load.", go: () => setOvl("loadSlots") },
    { name: "Manage saves", tell: "Review or delete existing save slots.", go: () => setOvl("manageSaves") },
    { name: () => "Music: " + ((window.EmberAudio && window.EmberAudio.percent()) ?? 35) + "%",
      tell: "Turn the background music off or choose its volume.", go: () => setOvl("sound") },
  ].concat(trial ? [
    { name: "End trial", tell: "Abandon this run. You can start again at the entrance.", go: () => { setOvl(null); stopTrial(); } }
  ] : []).concat(devUnlocked ? [
    { name: "Back to Corin", tell: "Recentre the view on the character.",
      go: () => { recentreOnCorin(); setOvl(null);
                  devUnlocked = false; } },
    { name: "Dev tools",   tell: "Map and cast editing.",         go: () => { setOvl(null); setDev(!devOpen); } },
  ] : []).concat([
    { name: "Full screen", tell: "Fill the screen.", go: () => { setOvl(null); toggleBig(); } },
  ]) },
  savePrompt: { rows: "savePromptRows", desc: "savePromptDesc", pick: 0, items: () => [
    { name: "Overwrite existing save", tell: "Choose an existing save slot to overwrite.", go: () => setOvl("saveSlots") },
    { name: "Create new save", tell: "Use the first empty save slot.", go: () => { const slot=firstEmptySaveSlot(); if(!slot){toast("all save slots are full — overwrite one instead");setOvl("saveSlots");return;} saveToSlot(slot); setOvl("menu"); } },
    { name: "Back", tell: "Return without saving.", go: () => setOvl("menu") }
  ] },
  saveSlots: { rows: "saveSlotRows", desc: "saveSlotDesc", pick: 0, items: () => saveSlotItems("overwrite") },
  loadSlots: { rows: "loadSlotRows", desc: "loadSlotDesc", pick: 0, items: () => saveSlotItems("load") },
  manageSaves: { rows: "manageSaveRows", desc: "manageSaveDesc", pick: 0, items: () => saveSlotItems("manage") },
  sound: { rows: "soundRows", desc: "soundDesc", pick: 0, items: () => [
    ...[0,25,50,75,100].map(v => ({
      name: () => (v === 0 ? "Music off" : "Music " + v + "%") + ((window.EmberAudio && window.EmberAudio.percent() === v) ? "  ✓" : ""),
      tell: v === 0 ? "Mute the background music." : "Set background music volume to " + v + "%.",
      go: () => { if (window.EmberAudio) window.EmberAudio.set(v); refreshOvl(); }
    })),
    { name: "Back", tell: "Return to the main menu.", go: () => setOvl("menu") }
  ] },
  atkm: { rows: "atkRows", desc: "atkDesc", pick: 0, items: () => ATTACKS.filter(a=>breathHas[EL_BREATH[a.el]]) },
  airm: { rows: "airRows", desc: "airDesc", pick: 0, items: () => [
    { name: mounted ? "Dismount" : "Mount", el: "ride",
      tell: mounted ? "Slide down off its back."
                    : "Climb onto its shoulders and fly with it.",
      go: () => { const on = !mounted;
              setMounted(on); setOvl(null);
              showReveal(on ? "corinride_" + (smithUpgrade ? "armor_" : "sword_") + "idle_s" : "dr5_idle_s",
                         on ? "CORIN TAKES THE REINS" : "CORIN SLIDES DOWN", undefined, true);
              setTimeout(hideReveal, 1400); } },    { name: dragon.air ? "Land" : "Take off", el: "wing",
      tell: dragon.air ? "Come down to the ground." : "Beat upward and fly.",
      go: () => { setDragonAir(!dragon.air); setOvl(null); } },
    { name: "Summon", el: "wake",
      dim: () => !charm.wake || wakeCool > 0 || wakeCount() >= 2,
      tell: () => !charm.wake ? "He is not carrying the Book of the Dead."
                : wakeCount() >= 2 ? "Two of them are already with him."
                : wakeCool > 0 ? "The dead are not ready. " + Math.ceil(wakeCool) + "s."
                : "Wake two of the Hollybeck dead to walk with you.",
      go: () => { if (wakeTheDead()) setOvl(null); } },
    { name: "Use item", el: "potion",
      dim: () => !bagUsable().length,
      tell: () => { const n = bagUsable().length;
                    return n ? n + " thing" + (n === 1 ? "" : "s") + " he can use."
                             : "Nothing in the pack to use."; },
      go: () => { setOvl(null); useAsk(); } },
  ] },
};
const EL_BREATH = { claw: "slash", fire: "fire", ice: "ice", bolt: "lightning", shadow: "shadow" };
function breathMenuTell(el, text) {
  const wait = breathWait(el);
  return text + (wait > 0 ? " Ready in " + wait.toFixed(1) + "s." : " Ready.");
}
const ATTACKS = [
  { name: "Slash",     el: "claw",
    tell: "A swipe of the claws. Close range." },
  { name: "Fire",      el: "fire",
    tell: () => breathMenuTell("fire", "A heavy blast. 8 damage; 12 second cooldown.") },
  { name: "Lightning", el: "bolt",
    tell: () => breathMenuTell("bolt", "A crackling orb. 12 damage; 18 second cooldown.") },
  { name: "Shadow",    el: "shadow",
    tell: () => breathMenuTell("shadow", "A crushing violet orb. 16 damage; 24 second cooldown.") },
  { name: "Ice",       el: "ice",
    tell: () => breathMenuTell("ice", "The strongest breath. 20 damage; 30 second cooldown.") },
].map(a => Object.assign(a, {
  dim: () => !breathHas[EL_BREATH[a.el]] || (a.el !== "claw" && (dragon.down || breathWait(a.el) > 0)),
  go: () => { if (!breathHas[EL_BREATH[a.el]]) { toast("not unlocked yet"); return; }
              setOvl(null);
              if (a.el === "claw") { clawNow(); return; }
              if (dragon.down) { toast("the dragon is hurt -- feed it first"); return; }
              const wait = breathWait(a.el);
              if (wait > 0) { toast((DRAGON_BREATH[a.el]?.name || "breath") + " ready in " + wait.toFixed(1) + "s"); return; }
              dragonEl = a.el; breatheFire(); },
}));
const EL_COLOUR = { claw: "#d8d2c4", fire: "#ff8a2b", ice: "#4fb4ff",
                    bolt: "#ffd23c", shadow: "#a074e0",
                    wing: "#79d18a", ride: "#e0a35c",
                    wake: "#8fd8ff",      /* the risen: cold blue */
                    potion: "#e05a4a",    /* the flask: red */
                    elixir: "#f0c250" }; /* the elixir: gold */
let ovl = null;
function setOvl(which) {
  if(which&&fishing)return;
  for (const k in MENUS) {
    const el = document.getElementById(k);
    if (!el) continue;
    if (k === "menu") el.classList.toggle("on", k === which);
    else el.style.display = (k === which) ? "block" : "none";
  }
  ovl = which || null;
  if (ovl) { MENUS[ovl].pick = 0; refreshOvl(); }
}
function refreshOvl() {
  if (!ovl) return;
  const M = MENUS[ovl], items = M.items();
  const rows = document.getElementById(M.rows);
  const desc = document.getElementById(M.desc);
  rows.innerHTML = "";
  if (!items.length) { rows.innerHTML = "<div class='row'>nothing here</div>";
                       desc.textContent = ""; return; }
  if (M.pick >= items.length) M.pick = items.length - 1;
  if (M.pick < 0) M.pick = 0;
  items.forEach((it, k) => {
    const d = document.createElement("div");
    d.className = "row" + (k === M.pick ? " on" : "");
    if (it.el && EL_COLOUR[it.el]) {
      d.style.setProperty("--el", EL_COLOUR[it.el]);
      const dot = document.createElement("span");
      dot.className = "dot";
      d.appendChild(dot);
      if (it.dim && it.dim()) d.style.opacity = ".42";
      const nm = document.createElement("span");
      nm.textContent = (typeof it.name === "function") ? it.name() : it.name;
      d.appendChild(nm);
    } else {
      const label = (typeof it.name === "function") ? it.name() : it.name;
      d.textContent = (k === M.pick ? "\u25B8 " : "  ") + label;
    }
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      if (M.pick === k) { if (it.go && !(it.dim && it.dim())) it.go(); }
      else { M.pick = k; refreshOvl(); }
    });
    rows.appendChild(d);
  });
  desc.textContent = typeof items[M.pick].tell === "function" ? items[M.pick].tell() : items[M.pick].tell || "";
}
function ovlStep(d) {
  if (!ovl) return;
  const M = MENUS[ovl], n = M.items().length;
  if (!n) return;
  M.pick = (M.pick + d + n) % n;
  refreshOvl();
}
function ovlTake() {
  if (!ovl) return;
  const M = MENUS[ovl], items = M.items();
  if (items[M.pick] && items[M.pick].go) items[M.pick].go();
}
bindHold("btnStart", () => {if(atlasOpen)closeAtlas();else setOvl(ovl === "menu" ? null : "menu");}, null);
bindHold("btnL", () => {
                         trigHold("l", true);
                         if (hasDragon()) setOvl(ovl === "atkm" ? null : "atkm"); },
                 () => { trigHold("l", false); });
bindHold("btnR", () => {
                         trigHold("r", true);
                         if (hasDragon()) setOvl(ovl === "airm" ? null : "airm"); },
                 () => { trigHold("r", false); });

const SAVE_SLOT_COUNT = 3;
let activeSaveSlot = 1;
function saveKey(slot){ return "emberfell.save." + slot; }
function readSaveSlot(slot){ try{return JSON.parse(localStorage.getItem(saveKey(slot))||"null");}catch(e){return null;} }
function migrateLegacySave(){
  try{
    if(!readSaveSlot(1)){
      const legacy=JSON.parse(localStorage.getItem("emberfell.save")||"null");
      if(legacy)localStorage.setItem(saveKey(1),JSON.stringify(legacy));
    }
  }catch(e){}
}
migrateLegacySave();
function firstEmptySaveSlot(){ for(let i=1;i<=SAVE_SLOT_COUNT;i++)if(!readSaveSlot(i))return i; return 0; }
function saveSummary(slot){
  const s=readSaveSlot(slot); if(!s)return "Slot "+slot+" — Empty";
  const map=(W.maps[s.map]&&W.maps[s.map].name)||String(s.map||"Unknown").replaceAll("_"," ");
  const d=s.when?new Date(s.when):null;
  const stamp=d&&!isNaN(d)?d.toLocaleString():"saved game";
  return "Slot "+slot+" — "+map+" — "+stamp;
}
function captureSave(){return {
  quest, smithUpgrade, glassShield, wonAll, cinderSeal, trialSealPlaced, trialWins, thornwellMet, brambleQuest, knightEncounterDone, royalDefeated, gold, treasuryTaken:[...treasuryTaken],
  breathHas:{...breathHas}, dragonHp:dragon.hp, boarMeat, dragonFish, fishingPole,
  map:MAPID, x:trial?160:P.x, y:trial?464:P.y, when:Date.now()
};}
function saveToSlot(slot,quiet=false){
  try{
    localStorage.setItem(saveKey(slot),JSON.stringify(captureSave()));
    activeSaveSlot=slot;
    /* Keep the old key mirrored for backward compatibility with older Emberfell builds. */
    localStorage.setItem("emberfell.save",localStorage.getItem(saveKey(slot)));
    if(!quiet)toast("saved to slot "+slot);
    return true;
  }catch(e){if(!quiet)toast("could not save on this device");return false;}
}
/* Story/autosave calls continue silently into the currently active slot. */
function saveGame(){ saveToSlot(activeSaveSlot,true); }
function deleteSaveSlot(slot){
  try{localStorage.removeItem(saveKey(slot)); if(activeSaveSlot===slot)activeSaveSlot=1; toast("slot "+slot+" deleted"); refreshOvl();}
  catch(e){toast("could not delete save");}
}
function saveSlotItems(mode){
  const items=[];
  for(let slot=1;slot<=SAVE_SLOT_COUNT;slot++){
    const data=readSaveSlot(slot), label=saveSummary(slot);
    if(mode==="overwrite"){
      if(data)items.push({name:label,tell:"Overwrite this save with Corin's current progress.",go:()=>{saveToSlot(slot);setOvl("menu");}});
    }else if(mode==="load"){
      items.push({name:label,tell:data?"Load this save.":"This slot is empty.",dim:()=>!readSaveSlot(slot),go:()=>{if(loadGame(slot))setOvl(null);}});
    }else{
      items.push({name:label,tell:data?"Press A again to delete this save slot.":"This slot is empty.",dim:()=>!readSaveSlot(slot),go:()=>{if(data)deleteSaveSlot(slot);}});
    }
  }
  if(mode==="overwrite"&&!items.length)items.push({name:"No saves to overwrite",tell:"Create a new save first.",dim:()=>true});
  items.push({name:"Back",tell:"Return to the main menu.",go:()=>setOvl(mode==="overwrite"?"savePrompt":"menu")});
  return items;
}
function loadGame(slot=activeSaveSlot) {
  try {
    migrateLegacySave();
    const s = readSaveSlot(slot);
    if (!s) { toast("save slot "+slot+" is empty"); return false; }
    activeSaveSlot=slot;
    if (trial) stopTrial("");
    wonAll = s.wonAll ? 1 : 0; cinderSeal = !!s.cinderSeal && !!wonAll; trialSealPlaced=!!s.trialSealPlaced&&cinderSeal; trialWins = s.trialWins || 0;
    if (s.breathHas) for (const k in breathHas) if (s.breathHas[k] !== undefined) breathHas[k] = !!s.breathHas[k];
    syncDragonVitality(false);
    dragon.hp = Number.isFinite(s.dragonHp) ? Math.max(0, Math.min(dragon.maxHp, s.dragonHp)) : dragon.maxHp;
    dragon.down = dragon.hp <= 0; dragon.revive=0;dragon.inv=0;dragon.knockdown=0;
    boarMeat=Math.max(0,s.boarMeat|0);dragonFish=Math.max(0,s.dragonFish|0);fishingPole=!!s.fishingPole;fishing=null;
    thornwellMet=!!s.thornwellMet;brambleQuest=Number.isInteger(s.brambleQuest)?Math.max(0,Math.min(3,s.brambleQuest)):0;brambleMap="";brambleDeparture=null;thornwellArrival=null;thornwellReturn=null;
    knightEncounterDone=!!s.knightEncounterDone;knightEncounterPhase=knightEncounterDone?"done":"waiting";knightEncounter=null;
    for(const k in royalDefeated)delete royalDefeated[k];Object.assign(royalDefeated,s.royalDefeated||{});
    treasuryTaken.clear();for(const id of s.treasuryTaken||[])treasuryTaken.add(id);if(Number.isFinite(s.gold))gold=Math.max(0,s.gold);
    quest=s.quest;smithUpgrade=!!s.smithUpgrade&&hasSword();glassShield=!!s.glassShield;glassShieldHeld=false;
    const retiredRoyalRoom={royal_archive:'royal_study',royal_lookout:'royal_guardroom',royal_pantry:'royal_westhall'}[s.map];if(retiredRoyalRoom)s.map=retiredRoyalRoom;
    if(s.map&&W.maps[s.map])loadMap(s.map,true);P.x=s.x;P.y=s.y;recoverTempleArrival(!!W.maps[s.map]?.templeLegacy);
    if(MD.royal&&(retiredRoyalRoom||!canStand(P.x,P.y))){P.x=MD.spawn[0];P.y=MD.spawn[1];}
    cam.x=P.x;cam.y=P.y;clampCam();chunks.clear();toast("loaded slot "+slot);return true;
  } catch (e) { toast("could not load"); return false; }
}


let mounted = false;
const MOUNT_DX = 22, MOUNT_DY = -12;
function setMounted(on, quiet = false) {
  if(fishing)return;
  if (on && !dragonHere()) { toast("the dragon is not here"); return; }
  if (on && dragon.down) { toast("the dragon is too hurt to ride"); return; }
  if (on && dragon.knockdown > 0) { toast("the dragon is still getting up"); return; }
  mounted = on;
  if (on) { if (!dragon.air) setDragonAir(true); if (!quiet) toast("you climb onto its back"); }
  else if (!quiet) toast("you slide down");
  chunks.clear();
}

tap(document.getElementById("deadBtn"), () => { getUp(); });
tap(document.getElementById("bSafe"), () => {
  devSafe = !devSafe;
  const b = document.getElementById("bSafe");
  if (b) b.classList.toggle("on", devSafe);
  toast(devSafe ? "nothing can touch him" : "he can be hurt again");
});
tap(document.getElementById("bNoDrag"), () => {
  dragonOff = !dragonOff;
  const b = document.getElementById("bNoDrag");
  if (b) b.classList.toggle("on", dragonOff);
  toast(dragonOff ? "the dragon stands down" : "the dragon is back");
});
tap(document.getElementById("bDragonPassive"), () => {
  devDragonPassive=!devDragonPassive;
  if(devDragonPassive){hunt=null;breath=null;claw=null;dragonBreak=null;dragonRecall=false;clawT=0;}
  const b=document.getElementById("bDragonPassive");
  if(b)b.classList.toggle("on",devDragonPassive);
  toast(devDragonPassive?"dragon attacks disabled — enemies can still hurt it":"dragon attacks enabled");
});
function markKingCompleteForTest() {
  if (window.EmberKingMusic) window.EmberKingMusic.stop();
  if (trial) stopTrial("");
  if (MAPID === "cinderhold") {
    clearTrialCombat();
    scene = null; sayNpc = null; sayOff(); showFace(null);
    P.act = null; P.moving = false;
    camFree = false; cam.z = playZoom();
    cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2;
    clampCam();
  }
  quest = Math.max(quest, Q.DONE);
  glassShield = true;
  wonAll = 1;
  if (MAPID === "cinderhold") npcs = npcs.filter(n => !/Halvard/.test(n.n || ""));
  rebuildSolid(); rebuildBuckets();
  saveGame();
  toast("King marked complete. Visit the witch and talk to the demon for the seal.");
}
tap(document.getElementById("bKingDone"), markKingCompleteForTest);
tap(document.getElementById("bSkip"), () => {
  skipBrambleForTest();
  devItemTest = true;
  leavingNow = false;
  kingWalk = 0;
  guardsAside = false;
  quest = Q.DONE;
  smithUpgrade = true;
  glassShield = true;
  dragon.on = true;
  dragon.placed = MAPID;
  dragon.air = !dragonGround(P.x - 24, P.y);
  dragon.x = P.x - 24; dragon.y = P.y - 26;
  greenPhase = "gone"; greenT = -1; greenP = 1; greenGone = true;
  for (const m of kingsMen()) { m.goto = null; m.leaving = 0; }
  for (const k in charm) charm[k] = true;
  let n = 0;
  for (const k in worn) worn[k] = (n++ < WORN_MAX);
  for (const k in breathHas) breathHas[k] = true;
  syncDragonVitality(true); dragon.hp = dragon.maxHp; dragon.down = false;
  heartKnown = true;
  if (potions < 5) potions = 5;
  if (elixirs < 3) elixirs = 3;
  if (boarMeat < 3) boarMeat = 3;
  if (dragonFish < 3) dragonFish = 3;
  if (bombs < 3) bombs = 3;
  if (dust < 3) dust = 3;
  if (bells < 3) bells = 3;
  if (marks < 3) marks = 3;
  if (breaths < 3) breaths = 3;
  if (stones < 3) stones = 3;
  if (salts < 3) salts = 3;
  if (gold < 500) gold = 500;
  for (const e of BESTIARY) if (!seenFoe[e.k]) seenFoe[e.k] = ++seenCount;
  rebuildBuckets();
  if (typeof refreshWingBtn === "function") refreshWingBtn();
  reindex(); chunks.clear();
  if (typeof refreshBag === "function" && typeof bagOpen !== "undefined" && bagOpen)
    refreshBag();
  saveGame();
  toast("Everything granted; Hunter and Bramble completed. Ready to explore.");
});

let bothHeldSince = -1, lHeld = false, rHeld = false;
function trigHold(which, down) {
  if (which === "l") lHeld = down; else rHeld = down;
  const now = () => (typeof performance !== "undefined" && performance.now)
                  ? performance.now() : Date.now();
  if (lHeld && rHeld) { if (bothHeldSince < 0) bothHeldSince = now(); }
  else bothHeldSince = -1;
}
setInterval(() => {
  if (devUnlocked || bothHeldSince < 0) return;
  const t = (typeof performance !== "undefined" && performance.now)
            ? performance.now() : Date.now();
  if (t - bothHeldSince >= 3000) {
    devUnlocked = true; bothHeldSince = -1;
    toast("dev unlocked -- map panning and zoom are live");
    if (ovl === "menu") refreshOvl();
  }
}, 120);

setInterval(() => {
  const on = hasDragon();
  for (const id of ["btnL", "btnR"]) {
    const el = document.getElementById(id);
    if (el) el.style.opacity = on ? "" : "0.38";
  }
  if (ovl === "atkm") refreshOvl();
}, 400);

const SKIN_BAND = { y: 831, h: 142 };
const SKIN  = [[0xf6,0xca,0x9f],[0xf9,0xe6,0xcf],[0xd2,0x9f,0x70]];
const STRAW = [[0xff,0xc8,0x25],[0xfe,0xe7,0x61],[0xff,0xa2,0x14]];  /* the hat */
const DENIM = [[0x00,0x69,0xaa],[0x00,0x98,0xdc]];                   /* dungarees */
const TONE = {
  dark:  [[0x6d,0x42,0x2c],[0x8b,0x5c,0x40],[0x4c,0x2b,0x1b]],
  desert:[[0xc2,0x86,0x55],[0xdd,0xab,0x7f],[0x93,0x5e,0x3a]],
};
const HAT = {
  brown: [[0xa8,0x7a,0x3f],[0xcb,0xa1,0x64],[0x77,0x54,0x29]],
};
const HAIR_LIGHT = [[0xe6,0x9c,0x69],[0xbf,0x6f,0x4a]];
const HAIR_DARK  = [[0x3f,0x2a,0x1e],[0x2a,0x1a,0x12]];
const SHIRT = {
  rust:  [[0xa8,0x4a,0x28],[0xd0,0x70,0x46]],
  moss:  [[0x3f,0x74,0x4a],[0x60,0x9c,0x6c]],
  plum:  [[0x6b,0x3c,0x72],[0x95,0x5f,0x9c]],
  ochre: [[0xa8,0x82,0x28],[0xd0,0xa8,0x46]],
};
const DESERT_VARIANT = 4;
const VARIANTS = [null, { skin: "dark" },
                  { hat: "brown" },
                  { skin: "dark", hat: "brown" },
                  { skin: "desert" }];   /* index 4, used by rule only */
const skinSheets = [];
function swapsFor(v) {
  const out = [];
  if (v.skin  && TONE[v.skin])   SKIN .forEach((f,i) => out.push([f, TONE[v.skin][i]]));
  if (v.skin === "dark" || v.hair === "dark")
    HAIR_LIGHT.forEach((f,i) => out.push([f, HAIR_DARK[i]]));
  if (v.hat   && HAT[v.hat])     STRAW.forEach((f,i) => out.push([f, HAT[v.hat][i]]));
  if (v.shirt && SHIRT[v.shirt]) DENIM.forEach((f,i) => out.push([f, SHIRT[v.shirt][i]]));
  return out;
}
function buildVariant(n) {
  const v = VARIANTS[n];
  if (!v) return null;
  const c = document.createElement("canvas");
  c.width = atlasImg.width; c.height = SKIN_BAND.h;
  const g = c.getContext("2d", { willReadFrequently: true });
  drawGameImage(g, atlasImg, 0, SKIN_BAND.y, c.width, SKIN_BAND.h, 0, 0, c.width, SKIN_BAND.h);
  let d;
  try { d = g.getImageData(0, 0, c.width, c.height); } catch (e) { return null; }
  const px = d.data, sw = swapsFor(v);
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue;
    for (let k = 0; k < sw.length; k++) {
      const f = sw[k][0];
      if (px[i] === f[0] && px[i+1] === f[1] && px[i+2] === f[2]) {
        px[i] = sw[k][1][0]; px[i+1] = sw[k][1][1]; px[i+2] = sw[k][1][2];
        break;
      }
    }
  }
  g.putImageData(d, 0, 0);
  return c;
}
function buildSkinTones() { /* built lazily now; nothing to do up front */ }
const DESERT_LOOK = /^desert\d/;
function npcSheetFor(o, s) {
  let t = o.tone | 0;
  if (!o.desertNative && DESERT_LOOK.test(o.sk || "") && t !== 1) t = DESERT_VARIANT;
  if (!t || t >= VARIANTS.length) return null;
  if (skinSheets[t] === undefined) skinSheets[t] = buildVariant(t);
  if (!skinSheets[t]) return null;
  return { img: skinSheets[t], dy: SKIN_BAND.y };
}

const PATROL_REST = 5000;                 /* how long they linger, in ms */
setInterval(() => {
  if (typeof npcs === "undefined" || editing || fishing) return;
  const now = Date.now();
  for (const n of npcs) {
    if (!n.patrol || n.goto) continue;
    if (typeof sayNpc !== "undefined" && sayNpc === n) continue;
    if (n.patrolFrom !== undefined && quest < n.patrolFrom) continue;
    if (n.restUntil === undefined) n.restUntil = 0;
    if (n.arrived === undefined) n.arrived = true;
    if (n.arrived) { n.restUntil = now + (n.patrolRest || PATROL_REST); n.arrived = false; }
    if (now < n.restUntil) continue;      /* still standing about */
    if (!n.desertNative) {
      if (!n.route) n.route = patrolRoute(n);
      if (n.route.length < 2) continue;
      n.leg = ((n.leg || 0) + 1) % n.route.length;
      n.goto = n.route[n.leg].slice(); n.arrived = true; continue;
    }
    n.leg = ((n.leg || 0) + 1) % 4;
    const box = n.patrol;                 /* [x0,y0,x1,y1] in tiles */
    const pt = [[box[0], box[3]], [box[2], box[3]],
                [box[2], box[1]], [box[0], box[1]]][n.leg];
    n.goto = [pt[0] * TS + TS / 2, pt[1] * TS + TS];
    n.arrived = true;                     /* rest again once this leg ends */
  }
}, 400);

