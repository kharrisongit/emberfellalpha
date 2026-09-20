function realizeFeatures() {
  if (MD.bg) { rebuildSolid(); rebuildBuckets(); return; }

  const townBoxes = features.filter(f => isArea(f) && !f.wild);
  const inTownArea = (x, y) => townBoxes.some(
    f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
  const pavedTiles = new Set();
  for (let i = 0; i < (MD.scatter || []).length; i += 3)
    if (/^sett_/.test(NAMES[MD.scatter[i]]))
      pavedTiles.add(Math.floor((MD.scatter[i + 2] - 1) / TS) * MW +
                     Math.floor(MD.scatter[i + 1] / TS));
  const pavedAt = (x, y) => pavedTiles.has(y * MW + x);
  const bareAreas = features.filter(f => isArea(f) && f.bare);
  soilAreas = features.filter(f => isArea(f) && f.soil && SPR[f.soil]);
  const isBare = (x, y) => bareAreas.some(
    f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
  const mysticAreas = features.filter(f => isArea(f) &&
    /shroom|mystic|spore/i.test((f.style || "") + " " + (f.label || "")));
  const isMystic = (x, y) => mysticAreas.length
    ? mysticAreas.some(f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1)
    : (MD.mystic_above !== undefined && y <= MD.mystic_above);

  lineTiles = new Set();
  terr.set(baseTerr);

  const rockSet = new Set();
  const _sc = MD.scatter || [];
  for (let i = 0; i < _sc.length; i += 3) {
    const nm = NAMES[_sc[i]], sp = SPR[nm];
    if (!sp || !/^(mtn_|mts_|mtv_|vmt_|vtower|cliff_|shc_|shcap_|waterfall)/.test(nm)) continue;
    for (let ty = Math.floor((_sc[i + 2] - sp[3]) / TS); ty <= Math.floor((_sc[i + 2] - 1) / TS); ty++)
      for (let tx = Math.floor((_sc[i + 1] - (sp[2] >> 1)) / TS);
           tx <= Math.floor((_sc[i + 1] + (sp[2] >> 1) - 1) / TS); tx++)
        rockSet.add(ty * MW + tx);
  }
  const rockAt = (x, y) => rockSet.has(y * MW + x);

  rockTiles = new Set();
  const markRock = (nm, ox, oy) => {
    const sp = SPR[nm];
    if (!sp || !/^(cliff_|waterfall|cliffpool|shc_|shcap_|mtn_|mts_|mtv_|vmt_|vtower|mtd_|mtw_|mte_)/.test(nm)) return;
    for (let ty = Math.floor((oy - sp[3]) / TS); ty <= Math.floor((oy - 1) / TS); ty++)
      for (let tx = Math.floor((ox - (sp[2] >> 1)) / TS);
           tx <= Math.floor((ox + (sp[2] >> 1) - 1) / TS); tx++)
        rockTiles.add(tx + "," + ty);
  };
  blockTiles = [];
  const markBlock = (nm, ox, oy) => {
    const sp = SPR[nm];
    if (!sp || !BLOCKS.test(nm)) return;
    for (let ty = Math.floor((oy - sp[3]) / TS); ty <= Math.floor((oy - 1) / TS); ty++)
      for (let tx = Math.floor((ox - (sp[2] >> 1)) / TS);
           tx <= Math.floor((ox + (sp[2] >> 1) - 1) / TS); tx++)
        if (tx >= 0 && ty >= 0 && tx < MW && ty < MH) blockTiles.push(ty * MW + tx);
  };
  for (const o of objs) { markRock(NAMES[o.s], o.x, o.y);
                          markBlock(NAMES[o.s], o.x, o.y); }
  for (const arr of [scat, sanm])
    for (let i = 0; i < arr.length; i += 3) {
      markRock(NAMES[arr[i]], arr[i + 1], arr[i + 2]);
      markBlock(NAMES[arr[i]], arr[i + 1], arr[i + 2]);
    }
  for (const f of features) {
    if (f.kind !== "route" || f.style !== "desert") continue;
    const half = (f.w || 5) >> 1, wall = half + 2;
    for (const [pa, pb] of routeLegs(f)) {
      const vert = pa[0] === pb[0];
      const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - wall;
      const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + wall;
      const line = vert ? pa[0] : pa[1];
      for (let v = lo; v <= hi; v++)
        for (const d of [-wall, wall]) {
          const tx = vert ? line + d : v, ty = vert ? v : line + d;
          if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
          let onRoad = false;
          for (const g of features) {
            if (g.kind !== "route") continue;
            const gh = ((g.w || 5) >> 1) + 1;
            for (const [qa, qb] of routeLegs(g)) {
              const qv = qa[0] === qb[0];
              const ql = (qv ? Math.min(qa[1], qb[1]) : Math.min(qa[0], qb[0])) - gh;
              const qh2 = (qv ? Math.max(qa[1], qb[1]) : Math.max(qa[0], qb[0])) + gh;
              const al = qv ? ty : tx, ac = qv ? tx : ty, ct = qv ? qa[0] : qa[1];
              if (al >= ql && al <= qh2 && Math.abs(ac - ct) <= gh) { onRoad = true; break; }
            }
            if (onRoad) break;
          }
          if (onRoad) continue;
          blockTiles.push(ty * MW + tx);
        }
    }
  }
  const zone = MD.shroom;
  const inTown = (px, py) => features.some(
    a => isArea(a) && !a.wild && px >= a.x0 - 2 && px <= a.x1 + 2 &&
         py >= a.y0 - 2 && py <= a.y1 + 2);
  const nearRoad = (x, y) => {
    if (!zone || y < zone.y0 || y > zone.y1) return false;
    if (zone.x0 !== undefined && (x < zone.x0 || x > zone.x1)) return false;
    if ((zone.y1 - y) / Math.max(1, zone.y1 - zone.y0) < 0.35) return false;
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const t2 = T(x + dx, y + dy);
        if ((t2 === DIRT || t2 === COBBLE || t2 === PAVING2 || t2 === MARBLE || t2 === TERRACE || t2 === BRIDGE) &&
            !inTown(x + dx, y + dy)) return true;
      }
    return false;
  };
  const areaRing = [];   /* an area's treeline, planted once `plant` exists */
  const routeAt = new Set();
  for (const rf of features) {
    if (rf.kind !== "route") continue;
    const rp = rf.pts || [[rf.x0, rf.y0], [rf.x1, rf.y1]];
    const rh = (rf.w >> 1) + 1;
    for (let i = 0; i + 1 < rp.length; i++) {
      const ax = Math.min(rp[i][0], rp[i + 1][0]);
      const bx = Math.max(rp[i][0], rp[i + 1][0]);
      const ay = Math.min(rp[i][1], rp[i + 1][1]);
      const by = Math.max(rp[i][1], rp[i + 1][1]);
      for (let yy = ay - rh; yy <= by + rh; yy++)
        for (let xx = ax - rh; xx <= bx + rh; xx++)
          routeAt.add(yy * MW + xx);
    }
  }
  const onRoute = (x, y) => routeAt.has(y * MW + x);
  const NO_PLANT = [
    { map: "world", x0: 679, y0: 106, x1: 818, y1: 128 },
    { map: "world", x0: 679, y0: 130, x1: 818, y1: 137 },
    { map: "world", x0: 808, y0: 133, x1: 822, y1: 147 },
    { map: "world", x0: 810, y0: 244, x1: 824, y1: 258 },
    { map: "world", x0: 795, y0: 123, x1: 807, y1: 134 },
    { map: "world", x0: 1494, y0: 88, x1: 1508, y1: 102 },
    { map: "world", x0: 1508, y0: 108, x1: 1522, y1: 122 },
    { map: "world", x0: 1511, y0: 66, x1: 1525, y1: 80 },
    { map: "world", x0: 2013, y0: 496, x1: 2027, y1: 510 },
    { map: "world", x0: 2042, y0: 243, x1: 2133, y1: 321 },
    { map: "world", x0: 2161, y0:  77, x1: 2314, y1: 264 },
    { map: "world", x0: 2061, y0:   1, x1: 2159, y1: 135 },
    { map: "world", x0: 2014, y0: 163, x1: 2102, y1: 205 },
    { map: "world", x0: 2016, y0: 108, x1: 2043, y1: 170 },
    { map: "world", x0: 2099, y0: 165, x1: 2131, y1: 213 },
    { map: "world", x0: 2149, y0: 164, x1: 2172, y1: 237 },
  ];
  const noPlant = (x, y) => NO_PLANT.some(
    r => r.map === MAPID && x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);
  const blossomAt = new Set();
  for (const bf of features) {
    if (bf.kind !== "route" || bf.style !== "blossom") continue;
    const bp = bf.pts || [[bf.x0, bf.y0], [bf.x1, bf.y1]];
    for (let i = 0; i + 1 < bp.length; i++) {
      const vert = bp[i][0] === bp[i + 1][0];
      const pad = 12, run = 12;
      const ax = Math.min(bp[i][0], bp[i + 1][0]) - (vert ? pad : run);
      const bx = Math.max(bp[i][0], bp[i + 1][0]) + (vert ? pad : run);
      const ay = Math.min(bp[i][1], bp[i + 1][1]) - (vert ? run : pad);
      const by = Math.max(bp[i][1], bp[i + 1][1]) + (vert ? run : pad);
      for (let yy = ay; yy <= by; yy++)
        for (let xx = ax; xx <= bx; xx++)
          if (!noPlant(xx, yy)) blossomAt.add(yy * MW + xx);
    }
  }
  const onBlossom = (x, y) => blossomAt.has(y * MW + x);
  blossomBand = blossomAt;
  arenaRings = features.filter(f => (f.kind === "arena" || f.kind === "camp"))
                       .map(f => [f.x, f.y, (f.r || 6) + 1]);
  townBoxList = features.filter(f => isArea(f) && (f.place || f.label))
                        .map(f => [f.x0, f.y0, f.x1, f.y1]);
  const put = (x, y, v) => {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return;
    if (baseTerr && baseTerr[y * MW + x] === SAND &&
        v !== DIRT && v !== ROADSAND && v !== PAVING2) return;
    const _cur = terr[y * MW + x];
    const _was = baseTerr ? baseTerr[y * MW + x] : -1;
    if (_cur === DWATER || _was === DWATER) return;
    if (_cur === SEA || _was === SEA) return;
    if (_cur === DECK || _was === DECK) return;
    if (_cur === GRASS && v !== DIRT && inDesert(x, y)) return;
    if (v === WALL && inDesert(x, y)) return;
    if (v === GRASS && (_cur === SAND || _cur === ROADSAND
                        || _was === SAND || _was === ROADSAND)) return;
    if (v === DIRT && _was === COBBLE) { terr[y * MW + x] = COBBLE; return; }
    terr[y * MW + x] = v;
  };

  for (const f of features) {
    if (!isArea(f) || f.carve === false) continue;
    for (let y = f.y0; y <= f.y1; y++) for (let x = f.x0; x <= f.x1; x++) {
      const cur = terr[y * MW + x];
      if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE) continue;
      if (rockAt(x, y)) continue;
      if (SCENE_WALL && SCENE_WALL.has(y * MW + x)) continue;
      put(x, y, Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) === f.band - 1
                ? WALL : GRASS);
    }
  }
  for (const f of features) {
    if (f.kind !== "route") continue;
    const half = f.w >> 1;
    for (const [pa, pb] of routeLegs(f)) {
    const vert = pa[0] === pb[0];
    const lo = vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0]);
    const hi = vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0]);
    const line = vert ? pa[0] : pa[1];
    for (let v = lo; v <= hi; v++)
      for (let d = -half - 1 - f.band; d <= half + 1 + f.band; d++) {
        const x = vert ? line + d : v, y = vert ? v : line + d;
        const laid = (x >= 0 && y >= 0 && x < MW && y < MH) ? baseTerr[y * MW + x] : -1;
        if (laid === BRIDGE || laid === WATER) put(x, y, laid);
        else if (laid === GRASS && inTownArea(x, y)) put(x, y, GRASS);
        else if (f.style === "volcano") {
          const vh = Math.max(1, half - 1);
          if (Math.abs(d) <= vh) put(x, y, VSTONE);
          else if (Math.abs(d) <= vh + 1 && !onVBridge(x, y)) {
            const cur = (x >= 0 && y >= 0 && x < MW && y < MH)
                        ? terr[y * MW + x] : -1;
            if (cur !== VSTONE) put(x, y, VCRACK);
          }
        }
        else if (f.style === "desert") {
          if (Math.abs(d) <= half) put(x, y, PAVING2);
          else if (Math.abs(d) === half + 1) {
            const cur = (x >= 0 && y >= 0 && x < MW && y < MH) ? terr[y * MW + x] : -1;
            if (cur !== PAVING2) put(x, y, DIRT);
          }
        }
        else if (Math.abs(d) <= half) put(x, y, DIRT);
        else if (Math.abs(d) === half + 1) {
          const cur = (x >= 0 && y >= 0 && x < MW && y < MH) ? terr[y * MW + x] : -1;
          if (cur !== DIRT && cur !== COBBLE && cur !== PAVING2 && cur !== BRIDGE) put(x, y, GRASS);
        }
        else if (Math.abs(d) === half + 2 &&
                 x >= 0 && y >= 0 && x < MW && y < MH &&
                 terr[y * MW + x] === GRASS && !inClearing(x, y))
          put(x, y, WALL);

      }
    }
  }

  const ON_PURPOSE = /^(hb_|sh_(sml|med|big|wall|fat|stalk|glow)|fence_|white_|kt_|kp_|k_|rt_|rc_|sw_stone|swpb|wf_|wt_)/;
  const CAMP = /^(wf_grave|tent|campfire|log_|torch|barrel|crate|basket|stump_|woodpile|rock\d|sh_rock|sh_sml|cart_|lantern|wf_igloo|wf_stump|wf_rock|wf_mammoth|wt_fire|wt_coals|wt_brazier|wt_torch|campfire)/;
  const arenaAt = (px, py) => features.some(
    a => (a.kind === "arena" || a.kind === "camp") && Math.hypot(px - a.x, py - a.y) <= (a.r || ARENA_R) + 1.5);
  hidden = new Set(MD.hidden || []);
  for (const o of objs) {
    const ox = Math.floor(o.x / TS), oy = Math.floor((o.y - 1) / TS);
    if (arenaAt(ox, oy) && !CAMP.test(NAMES[o.s])) { hidden.add(o.id); continue; }
    if (ON_PURPOSE.test(NAMES[o.s])) continue;
    const x = ox, y = oy;
    if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
    const now = terr[y * MW + x], was = baseTerr[y * MW + x];
    const paved = (now === DIRT || now === COBBLE || now === PAVING2 || now === MARBLE || now === TERRACE || now === BRIDGE) &&
                  !(was === DIRT || was === COBBLE || was === PAVING2 || was === MARBLE || was === TERRACE || was === BRIDGE);
    if (/^(spr_|oak_|bir_|fru_|mw_)/.test(NAMES[o.s])) continue;
    if (paved || (was === WALL && now !== WALL)) hidden.add(o.id);
  }

  for (const f of features) {
    if (f.kind !== "route") continue;
    const half = f.w >> 1, band = f.band;
    const legs = routeLegs(f);
    for (let i = 0; i < legs.length - 1; i++) {
      const [ex, ey] = legs[i][1];
      for (let dy = -half - 1 - band; dy <= half + 1 + band; dy++)
        for (let dx = -half - 1 - band; dx <= half + 1 + band; dx++) {
          const x = ex + dx, y = ey + dy;
          if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          const cur = terr[y * MW + x];
          if (f.style === "volcano") {
            const vh = Math.max(1, half - 1);
            if (d <= vh) put(x, y, VSTONE);
            else if (d <= vh + 1 && cur !== VSTONE) put(x, y, VCRACK);
          }
          else if (f.style === "desert") {
            if (d <= half) put(x, y, PAVING2);
            else if (d === half + 1 && cur !== PAVING2) put(x, y, DIRT);
          }
          else if (d <= half) put(x, y, DIRT);
          else if (d === half + 1) {
            if (cur !== DIRT && cur !== COBBLE && cur !== PAVING2 && cur !== BRIDGE) put(x, y, GRASS);
          } else if (d === half + 2) {
            if (cur === GRASS && !inClearing(x, y) && !onRoute(x, y)
                && !(MD.barebox || []).some(
                      bb => x >= bb.x0 && x <= bb.x1
                         && y >= bb.y0 && y <= bb.y1)) {
              put(x, y, WALL);
              if (sows(f.style))
                areaRing.push([x, y, f.style]);
            }
          }
        }
    }
  }

  for (const f of features) {
    if (f.kind !== "arena" && f.kind !== "camp") continue;
    const r = f.r || ARENA_R;
    for (let y = Math.floor(f.y - r - 4); y <= f.y + r + 4; y++)
      for (let x = Math.floor(f.x - r - 4); x <= f.x + r + 4; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        const cur = terr[y * MW + x];
        if (cur === WATER || cur === BRIDGE) continue;
        const d = Math.hypot(x - f.x, y - f.y);
        if (f.style === "volcano") {
          if (d <= r + 0.5) put(x, y, VSTONE);
          else if (d <= r + 1.5 && cur !== VSTONE) put(x, y, VCRACK);
        }
        else if (f.style === "desert") {
          if (d <= r + 0.5) put(x, y, PAVING2);
          else if (d <= r + 1.5 && cur !== PAVING2) put(x, y, DIRT);
        }
        else if (f.style === "winter" ||
                 (typeof inWinter === "function" && inWinter(f.x, f.y))) {
          if (d > r + 1.5 && d <= r + 3.5 && cur === GRASS) put(x, y, WALL);
        }
        else if (d <= r + 0.5) put(x, y, DIRT);
        else if (d <= r + 1.5) { if (cur !== DIRT) put(x, y, GRASS); }
        else if (d <= r + 3.5 && cur === GRASS) put(x, y, WALL);
      }
  }

  const taken = new Set();
  for (const o of objs) {
    if (hidden.has(o.id)) continue;
    taken.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
  }
  fobjs = []; fsanim = (MD.fsanim || []).slice();
  const wobble = (x, y) => {
    const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    return [((h >>> 3) % 15) - 7, -((h >>> 11) % 15)];
  };
  const buildingBoxes = [];
  for (const o of objs) {
    const nm = NAMES[o.s], sp = SPR[nm];
    /* rt_ and wt_ are the temples (desert and winter): without this they
       had no footprint at all, so you could walk straight under them */
    if (!sp || !/^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower|rt_|wt_)/.test(nm))
      continue;
    buildingBoxes.push([o.x - (sp[2] >> 1) - 2, o.y - sp[3] - 2,
                        o.x + (sp[2] >> 1) + 2, o.y + 2]);
  }
  const bodyTiles = new Set();
  for (const o of objs) {
    const nm = NAMES[o.s], sp = SPR[nm];
    if (!sp || !/^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower|rt_|wt_)/.test(nm))
      continue;
    const x0 = Math.floor((o.x - (sp[2] >> 1)) / TS);
    const x1 = Math.floor((o.x + (sp[2] >> 1) - 1) / TS);
    const y0 = Math.floor((o.y - sp[3] / 2) / TS), y1 = Math.floor((o.y - 1) / TS);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) bodyTiles.add(x + "," + y);
  }
  const onBody = (tx, ty) => bodyTiles.has(tx + "," + ty);
  const onBuilding = (px, py, sp) => {
    const tx0 = px - (sp ? sp[2] >> 1 : 8), tx1 = px + (sp ? sp[2] >> 1 : 8);
    const ty0 = py - (sp ? sp[3] : 16), ty1 = py;
    return buildingBoxes.some(([bx0, by0, bx1, by1]) =>
      Math.min(tx1, bx1) > Math.max(tx0, bx0) &&
      Math.min(ty1, by1) > Math.max(ty0, by0));
  };

  const glades = new Set();
  let speciesIdx = null;
  const ringTiles = new Set();
  const ringVertical = new Set();
  const townRing = new Set();

  const treeAt = new Set();
  function mayPlant(x, y, opts) {
    opts = opts || {};
    if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
    const k = x + "," + y;
    if (treeAt.has(k) || taken.has(k)) return false;
    if (felled.has(k)) return false;          /* you cut it down: it stays down */
    if (rockTiles.has(k)) return false;       /* it is a cliff, not a gap in the wood */
    if (glades.has(k)) return false;          /* left bare on purpose */
    if (inClearing(x, y)) return false;       /* a town square stays empty */
    if (!opts.edge && (x % TREE_STEP || y % TREE_STEP)) return false;
    if (opts.edge && opts.ring) {
      if (opts.tight) {
        return true;
      } else if (opts.vertical) { if (y % (TREE_STEP * 2)) return false; }
      else if (x % 3) return false;
    }
    return true;
  }
  function putTree(x, y, si, opts) {
  if (typeof inVolcano === "function" && inVolcano(x, y)) return false;
  if (typeof inWinter === "function" && !inWinter(x, y) &&
      /^wf_/.test(NAMES[si] || "")) return false;
    if (si === undefined || !mayPlant(x, y, opts)) return false;
    if (baseTerr && baseTerr[y * MW + x] === SAND
        && !/^(cactus|drock|palm|acacia|deadtree|halfdead|bones)/.test(NAMES[si]))
      return false;
    const nm = NAMES[si], sp = SPR[nm];
    if (onBuilding(x * TS + TS / 2, y * TS + TS, sp)) return false;
    const off = (opts && opts.edge) ? [0, 0] : wobble(x, y);
    if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                 x: x * TS + TS / 2 + off[0], y: y * TS + TS + off[1], feat: 1 });
    treeAt.add(x + "," + y);
    taken.add(x + "," + y);
    if (speciesIdx) speciesIdx.set(x + "," + y, si);
    return true;
  }
  const bandStyleTiles = new Set();
  for (const f of features) {
    if (!isArea(f)) continue;
    const b = f.band || 6;
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++)
        if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) < b)
          bandStyleTiles.add(x + "," + y);
  }
  const plant = (x, y, style, edge, extra) => {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return;
    const tg = terr[y * MW + x];
    if (style === "desert") return;
    if (style === "volcano") return;
    if (typeof inVolcano === "function" && inVolcano(x, y)) return;
    if (style === "winter" && typeof inWinter === "function" && !inWinter(x, y)) return;
    if (tg !== WALL && !(tg === SAND && style === "dying")) return;
    if (!edge) {
      const hg = ((x * 374761393) ^ (y * 668265263)) >>> 0;
      if (hg % 100 < 40) { glades.add(x + "," + y); return; }
    }
    const sp0 = STYLE_TREE[style];
    let hsp = ((x * 374761393) ^ (y * 668265263)) >>> 0;
    hsp ^= hsp >>> 15; hsp = Math.imul(hsp, 2246822519) >>> 0;
    hsp ^= hsp >>> 13; hsp = Math.imul(hsp, 3266489917) >>> 0;
    hsp ^= hsp >>> 16;
    const pick = Array.isArray(sp0) ? sp0[(hsp >>> 0) % sp0.length] : sp0;
    const ok2 = putTree(x, y, NAME2I[pick],
                        Object.assign({ edge, tight: style === "desert" }, extra));
    const feet = ATLAS.styles.foot && ATLAS.styles.foot[style];
    if (ok2 && feet) {
      const hf = ((x * 2246822519) ^ (y * 3266489917)) >>> 0;
      if (hf % 100 < 34) {
        const rock = feet[(hf >>> 7) % feet.length];
        const rs = SPR[rock];
        if (rs) fobjs.push({ id: -1 - fobjs.length, s: NAME2I[rock],
                             x: x * TS + TS / 2 + ((hf >>> 3) % 9) - 4,
                             y: y * TS + TS + 1, feat: 1 });
      }
    }
  };
  for (const f of features) {
    if (isArea(f)) {
      if (f.carve === false) continue;      /* its treeline is already placed */
      for (let y = f.y0; y <= f.y1; y++) for (let x = f.x0; x <= f.x1; x++)
      {
        const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
        if (e >= f.band) continue;
        if (e !== f.band - 1) { glades.add(x + "," + y); continue; }
        {
          let onRoad = false;
          for (const g of features) {
            if (isArea(g) || onRoad) continue;
            const gap = (g.w >> 1) + 2;
            for (const [qa, qb] of routeLegs(g)) {
              const vv = qa[0] === qb[0];
              const lo2 = (vv ? Math.min(qa[1], qb[1]) : Math.min(qa[0], qb[0])) - gap;
              const hi2 = (vv ? Math.max(qa[1], qb[1]) : Math.max(qa[0], qb[0])) + gap;
              const along = vv ? y : x, across = vv ? x : y;
              if (along >= lo2 && along <= hi2 &&
                  Math.abs(across - (vv ? qa[0] : qa[1])) <= gap) { onRoad = true; break; }
            }
          }
          if (onRoad) { glades.add(x + "," + y); continue; }
        }
        const inner2 = (e === f.band - 1);
        const vert2 = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
        plant(x, y, f.style, inner2, { ring: inner2, vertical: vert2 });
      }
    } else {
      const half = f.w >> 1;
      const legsT = routeLegs(f);
      for (let i = 0; i < legsT.length - 1; i++) {
        const [ex, ey] = legsT[i][1];
        for (let dy = -half - 1 - f.band; dy <= half + 1 + f.band; dy++)
          for (let dx = -half - 1 - f.band; dx <= half + 1 + f.band; dx++) {
            const dd = Math.max(Math.abs(dx), Math.abs(dy));
            if (dd <= half + 1) continue;
            const cx2 = ex + dx, cy2 = ey + dy;
            if (nearRoad(cx2, cy2)) continue;
            if (dd >= half + 3 && dd <= half + 6) {
              glades.add(cx2 + "," + cy2);
              continue;
            }
            continue;
          }
      }
      for (const [pa, pb] of routeLegs(f)) {
        const vert = pa[0] === pb[0];
        const over = (f.w >> 1) + 2;
        const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
        const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
        const line = vert ? pa[0] : pa[1];
        for (let v = lo; v <= hi; v++)
          for (let d = -half - 1 - f.band; d <= half + 1 + f.band; d++) {
            if (Math.abs(d) <= half + 1) continue;
            const tx = vert ? line + d : v, ty = vert ? v : line + d;
            if (nearRoad(tx, ty)) continue;   /* mushrooms are the shoulder here */
            const isEdge = Math.abs(d) === half + 2;
            const isSouth2 = f.style === "swamp" && !vert && d === half + 5;
            if (!isEdge && !isSouth2) continue;
            if (isSouth2) {
              if (f.style !== "desert") plant(tx, ty, f.style, false, {});
              continue;
            }
            if (f.style === "desert" || f.style === "volcano") continue;
            if (isEdge) {
              ringTiles.add(tx + "," + ty);
              if (vert) ringVertical.add(tx + "," + ty);
            }
            if (f.style === "desert") continue;   /* sown into the map instead */
            plant(tx, ty, f.style, isEdge,
                  { ring: isEdge, vertical: vert, tight: f.style === "winter" });
          }
      }
    }
  }
const inScene = (x, y) => (MD.barebox || []).some(
  b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
for (const [ax, ay, st] of areaRing) plant(ax, ay, st, true, { ring: true });
for (const f of features) {
  if (f.kind !== "arena" && f.kind !== "camp" || f.style !== "desert") continue;
  const CAC = (ATLAS.styles.tree || {}).desert || [];
  if (!CAC.length) continue;
  const rr = (f.r || ARENA_R) + 2.2;
  for (let deg = 0; deg < 360; deg += 11) {
    const a = deg * Math.PI / 180;
    const x = Math.round(f.x + Math.cos(a) * rr);
    const y = Math.round(f.y + Math.sin(a) * rr);
    const h = ((x * 374761393) ^ (y * 668265263)) >>> 0;
    putTree(x, y, NAME2I[CAC[h % CAC.length]], { edge: true, ring: true, tight: true });


  }
}
{
  const dar = features.filter(f => (f.kind === "arena" || f.kind === "camp") && f.style === "desert");
  if (dar.length)
    fobjs = fobjs.filter(o => {
      if (!/^drock/.test(NAMES[o.s] || "")) return true;
      const tx = o.x / TS, ty = (o.y - 1) / TS;
      return !dar.some(f => Math.hypot(tx - f.x, ty - f.y) <= (f.r || ARENA_R) + 5);
    });
}
const FOREST = STYLE_TREE[MD.forest_style || "spruce"];
  for (const f of features) {
    if (!isArea(f) || f.wild) continue;
    if (f.ring) continue;
    const b = f.band || 6;
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) >= b) continue;
        const cur = terr[y * MW + x];
        if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
          continue;                             /* a road through it is a gate */
        if (felled.has(x + "," + y)) {
          if (terr[y * MW + x] === WALL && !rockAt(x, y))
            terr[y * MW + x] = openTo(y * MW + x);
          continue;
        }
        if (!inTown(x, y) && !atOasis(x, y))
        if (!refusesTrunk(terr[y * MW + x]))
        terr[y * MW + x] = WALL;
        const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
        const inner = (e === b - 1);
        const vertical = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
        if (e !== b - 1) { glades.add(x + "," + y); continue; }
        if (!inner && (y % (TREE_STEP * 2))) { glades.add(x + "," + y); continue; }
        plant(x, y, f.style || "spruce", inner, { ring: inner, vertical });
        lineTiles.add(x + "," + y);
      }
  }

  const fillFrom = fobjs.length;
  const routeBand = new Uint8Array(MW * MH);
  for (const f of features) {
    if (f.kind !== "route") continue;
    const pad = (f.band || 8) + ((f.w || 5) >> 1) + 2;
    for (const [pa, pb] of routeLegs(f)) {
      const y0b = Math.max(0, Math.min(pa[1], pb[1]) - pad);
      const y1b = Math.min(MH - 1, Math.max(pa[1], pb[1]) + pad);
      const x0b = Math.max(0, Math.min(pa[0], pb[0]) - pad);
      const x1b = Math.min(MW - 1, Math.max(pa[0], pb[0]) + pad);
      for (let yy = y0b; yy <= y1b; yy++) {
        const row = yy * MW;
        for (let xx = x0b; xx <= x1b; xx++) routeBand[row + xx] = 1;
      }
    }
  }
  for (let y = 0; y < MH; y += TREE_STEP)
    for (let x = 0; x < MW; x += TREE_STEP) {
      if (Math.min(x, y, MW - 1 - x, MH - 1 - y) < RIM + 1) continue;
      if (nearRoad(x, y)) continue;
      if (glades.has(x + "," + y)) continue;   /* left bare on purpose */
      if (routeBand[y * MW + x]) continue;      /* the road's own wood */
      if (bandStyleTiles.has(x + "," + y)) continue;
      let ownSt = null, ownNear = false;
      for (const f of features) {
        if (f.kind !== "arena" && f.kind !== "camp" || !f.style) continue;
        const dx = x - f.x, dy = y - f.y, r = (f.r || 6) + 8;
        if (dx * dx + dy * dy <= r * r) {
          ownSt = f.style;
          ownNear = dx * dx + dy * dy <= ((f.r || 6) + 4) * ((f.r || 6) + 4);
          break;
        }
      }
      plant(x, y, ownSt === "swamp" && ownNear ? "swamp_safe"
                  : ownSt ? ownSt
                  : isMystic(x, y)
                  ? (MD.mystic_style || "mystic")
                  : (MD.forest_style || "spruce"));
    }

  fsanim = (MD.fsanim || []).filter((_, i) =>
    i % 3 !== 0 ? false : /^dtuft/.test(NAMES[MD.fsanim[i]] || "")
  ).flatMap((_, i) => []);
  {
    const keepD = [];
    const src = MD.fsanim || [];
    for (let i = 0; i < src.length; i += 3)
      if (/^dtuft/.test(NAMES[src[i]] || ""))
        keepD.push(src[i], src[i + 1], src[i + 2]);
    fsanim = keepD;
  }
  const TUFTS3 = ["agrass1", "agrass2", "agrass3"];
  for (const f of features) {
    if (!isArea(f) || f.carve === false) continue;
    for (let y = f.y0; y <= f.y1; y++) for (let x = f.x0; x <= f.x1; x++) {
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
      if (terr[y * MW + x] !== GRASS || taken.has(x + "," + y)) continue;
      if (inDesert(x, y)) continue;
      if (pavedAt(x, y)) continue;          /* nothing grows through paving */
      if (rockTiles && rockTiles.has(x + "," + y)) continue;
      if (inScene(x, y)) continue;            /* nor on a placed scene */
      if (SCENE_WALL && SCENE_WALL.has(y * MW + x)) continue;   /* nor on rock */
      if (inSwamp(x, y)) continue;
      if (typeof inWinter === "function" && inWinter(x, y)) continue;
      const hsh = (x * 73856093) ^ (y * 19349663);
      const r0 = ((hsh >> 4) % 100 + 100) % 100;
      const bare0 = isBare(x, y);
      if (r0 >= (bare0 ? 7 : 48)) continue;      /* far less cover on bare ground */
      const TUFT_FLOOR = 30;
      if (!bare0 && r0 < TUFT_FLOOR) continue;
      let si;
      if (bare0 || r0 < 40) si = NAME2I[TUFTS3[((hsh >> 11) % 3 + 3) % 3]];
      if (atCoast(x, y) && SPR.cyanf0) {
        const CYAN_IN = 8;
        if ((((hsh >> 21) % CYAN_IN + CYAN_IN) % CYAN_IN) === 0) {
          const cn = "cyanf" + (((hsh >> 17) % 2 + 2) % 2);
          if (NAME2I[cn] !== undefined) si = NAME2I[cn];
        }
      } else if (SPR.pinkf0 && ((hsh >> 5) % 3) === 0 && onBlossom(x, y)) {
        const pn = "pinkf" + (((hsh >> 17) % 4 + 4) % 4);
        if (NAME2I[pn] !== undefined) si = NAME2I[pn];
      }
      else {
        const FL = NAMES.filter(n => n && /^aflower/.test(n));
        const pool = (MD.mystic_above !== undefined && y <= MD.mystic_above)
                     ? FL.filter(n => !/_w$/.test(n)) : FL.filter(n => /_w$/.test(n));
        if (pool.length)
          si = NAME2I[pool[((hsh >> 13) % pool.length + pool.length) % pool.length]];
      }
      if (si === undefined) continue;
      fsanim.push(si, x * TS + 2 + (((hsh >> 3) % 13 + 13) % 13),
                  y * TS + 10 + (((hsh >> 9) % 7 + 7) % 7));
    }
  }

  {
    const FLOWERS = NAMES.filter(n => n && /^aflower/.test(n));
    const northF = FLOWERS.filter(n => !/_w$/.test(n));
    const southF = FLOWERS.filter(n => /_w$/.test(n));
    const line = MD.mystic_above;
    for (const f of features) {
      if (f.kind !== "route") continue;
      const pad = (f.band || 8) + ((f.w || 5) >> 1) + 1;
      for (const [pa, pb] of routeLegs(f))
        for (let y = Math.min(pa[1], pb[1]) - pad; y <= Math.max(pa[1], pb[1]) + pad; y++)
          for (let x = Math.min(pa[0], pb[0]) - pad; x <= Math.max(pa[0], pb[0]) + pad; x++) {
            if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
            if (terr[y * MW + x] !== GRASS || taken.has(x + "," + y)) continue;
            if (inSwamp(x, y)) continue;
            if (pavedAt(x, y)) continue;
            if (rockTiles && rockTiles.has(x + "," + y)) continue;
      if (inScene(x, y)) continue;            /* nor on a placed scene */
      if (SCENE_WALL && SCENE_WALL.has(y * MW + x)) continue;
            const hsh = (x * 73856093) ^ (y * 19349663);
            const r = ((hsh >> 4) % 100 + 100) % 100;
            const bare1 = isBare(x, y);
            if (r >= (bare1 ? 7 : 55)) continue;
            let si;
            if (bare1 || r < 45) si = NAME2I[TUFTS3[((hsh >> 11) % 3 + 3) % 3]];
            else {
              const pool = (line !== undefined && y <= line) ? northF : southF;
              if (pool.length)
                si = NAME2I[pool[((hsh >> 13) % pool.length + pool.length) % pool.length]];
            }
            if (si === undefined) continue;
            fsanim.push(si, x * TS + 2 + (((hsh >> 3) % 13 + 13) % 13),
                        y * TS + 10 + (((hsh >> 9) % 7 + 7) % 7));
          }
    }
  }
  {
    const keep = [];
    let cut = 0;
    for (let i = 0; i < fsanim.length; i += 3) {
      const fx = Math.floor(fsanim[i + 1] / TS);
      const fy = Math.floor(fsanim[i + 2] / TS);
      if (/^dtuft/.test(NAMES[fsanim[i]] || "")) { keep.push(
            fsanim[i], fsanim[i + 1], fsanim[i + 2]); continue; }
      if (atCoast(fx, fy) && /_w$|^flower/.test(NAMES[fsanim[i]] || "")) {
        cut++;
        continue;
      }
      if (inDesert(fx, fy)) { cut++; continue; }
      keep.push(fsanim[i], fsanim[i + 1], fsanim[i + 2]);
    }
    if (cut) fsanim = keep;
  }
  if (MD.mystic_above !== undefined) {
    const wantN = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const wantS = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    const owner = (x, y) => {
      for (let fi = features.length - 1; fi >= 0; fi--) {
        const f = features[fi];
        if ((f.kind === "arena" || f.kind === "camp") && sows(f.style)) {
          const dx = x - f.x, dy = y - f.y, r = (f.r || 6) + 6;
          if (dx * dx + dy * dy <= r * r) return f.style;
        }
        if ((f.kind === "area" || f.kind === "town") && sows(f.style)) {
          const m2 = 4;
          if (x >= f.x0 - m2 && x <= f.x1 + m2
              && y >= f.y0 - m2 && y <= f.y1 + m2) return f.style;
        }
        if (f.kind === "route" && sows(f.style)) {
          const rp = f.pts || [[f.x0, f.y0], [f.x1, f.y1]];
          const rb = (f.band || 20);
          for (let i = 0; i + 1 < rp.length; i++) {
            const ax = Math.min(rp[i][0], rp[i + 1][0]) - rb;
            const bx = Math.max(rp[i][0], rp[i + 1][0]) + rb;
            const ay = Math.min(rp[i][1], rp[i + 1][1]) - rb;
            const by = Math.max(rp[i][1], rp[i + 1][1]) + rb;
            if (x >= ax && x <= bx && y >= ay && y <= by) return f.style;
          }
        }
      }
      return null;
    };
    for (const o of fobjs) {
      const nm = NAMES[o.s];
      if (!/^(spr|mw)_/.test(nm)) continue;
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      const own = owner(x, y);
      if (own) {
        const sp1 = STYLE_TREE[own];
        const nm1 = Array.isArray(sp1)
          ? sp1[(() => { let q = ((x * 374761393) ^ (y * 668265263)) >>> 0;
             q ^= q >>> 15; q = Math.imul(q, 2246822519) >>> 0;
             q ^= q >>> 13; q = Math.imul(q, 3266489917) >>> 0;
             return (q ^ (q >>> 16)) >>> 0; })() % sp1.length]
          : sp1;
        if (NAME2I[nm1] !== undefined) { o.s = NAME2I[nm1]; continue; }
      }
      const tgt = isMystic(x, y) ? wantN : wantS;
      if (tgt !== undefined) o.s = tgt;
    }
  }
  {
    const inSquare = (x, y) => features.some(f => {
      if (!isArea(f) || f.wild) return false;
      const b = f.band || 6;
      return x >= f.x0 + b && x <= f.x1 - b && y >= f.y0 + b && y <= f.y1 - b;
    });
    const before = fobjs.length;
    fobjs = fobjs.filter(o => !inSquare(Math.floor(o.x / TS),
                                        Math.floor((o.y - 1) / TS)));
    if (fobjs.length !== before)
      for (let y = 0; y < MH; y++)
        for (let x = 0; x < MW; x++) {
          if (terr[y * MW + x] === WALL && inSquare(x, y))
            terr[y * MW + x] = openTo(y * MW + x);
        }
  }

  {
    for (const arr of [objs, fobjs])
      for (const o of arr)
        if (/^(spr_|oak_|bir_|fru_|mw_)/.test(NAMES[o.s]))
          treeAt.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
    const paved = (t) => t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === BRIDGE;
    const styleAt = new Map();
    for (const f of features) {
      if (f.kind !== "route" || !sows(f.style)) continue;
      const si = NAME2I[STYLE_TREE[f.style]];
      if (si === undefined) continue;
      for (const [pa, pb] of routeLegs(f))
        for (let y = Math.min(pa[1], pb[1]) - 2; y <= Math.max(pa[1], pb[1]) + 2; y++)
          styleAt.set(y, si);
    }
    const fallback = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    const northSi = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const drawn = new Map();
    for (const f of features) {
      if (f.kind !== "route") continue;
      const lo2 = Math.min(f.y0, f.y1), hi2 = Math.max(f.y0, f.y1);
      for (const [pa, pb] of routeLegs(f))
        for (let y = Math.min(pa[1], pb[1]) - 2; y <= Math.max(pa[1], pb[1]) + 2; y++)
          drawn.set(y, y >= lo2 - 4 && y <= hi2 + 4);
    }
    const styleNear = (x, y) => {
      let best = null;
      for (const f of features) {
        if (f.kind !== "route" || !sows(f.style)) continue;
        const si = NAME2I[STYLE_TREE[f.style]];
        if (si === undefined) continue;
        for (const [pa, pb] of routeLegs(f)) {
          let d = null;
          if (pa[0] === pb[0]) {
            if (y >= Math.min(pa[1], pb[1]) - 26 && y <= Math.max(pa[1], pb[1]) + 26)
              d = Math.abs(x - pa[0]);
          } else if (x >= Math.min(pa[0], pb[0]) - 26 && x <= Math.max(pa[0], pb[0]) + 26)
            d = Math.abs(y - pa[1]);
          if (d !== null && d <= 26 && (best === null || d < best[0])) best = [d, si];
        }
      }
      return best ? best[1] : undefined;
    };
    const speciesFor = (y, x) => {
      if (x !== undefined) {
        const near = styleNear(x, y);
        if (near !== undefined) return near;
      }
      if (styleAt.get(y) !== undefined) return styleAt.get(y);
      if (x !== undefined) return isMystic(x, y) ? northSi : fallback;
      if (MD.mystic_above !== undefined)
        return y <= MD.mystic_above ? northSi : fallback;
      return fallback;
    };
    for (let y = 1; y < MH - 1; y++) {
      let run = -1;
      for (let x = 0; x <= MW; x++) {
        const on = x < MW && paved(terr[y * MW + x]);
        if (on && run < 0) run = x;
        if (!on && run >= 0) {
          for (const x2 of [run - 2, x + 1]) {     /* one clear of the verge */
            if (x2 < 1 || x2 >= MW - 1) continue;
            const cur = terr[y * MW + x2];
            if (paved(cur) || cur === WATER) continue;
            if (inClearing(x2, y)) continue;
            const key = x2 + "," + y;
            if (felled.has(key) &&
                (felled.has((x2 - 1) + "," + y) || felled.has((x2 + 1) + "," + y)) &&
                (felled.has(x2 + "," + (y - 1)) || felled.has(x2 + "," + (y + 1))))
              continue;
            lineTiles.delete(key);
            if (baseTerr[y * MW + x2] !== SAND)
              putTree(x2, y, speciesFor(y, x2),
                      { edge: true, ring: true, vertical: true });
          }
          run = -1;
        }
      }
    }
  }

  {
    const drop = new Set();
    for (const f of features) {
      if (f.kind !== "route") continue;
      const half = (f.w || 5) >> 1;
      for (const [pa, pb] of routeLegs(f)) {
        const vert2 = pa[0] === pb[0];
        const lo2 = vert2 ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0]);
        const hi2 = vert2 ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0]);
        const ln = vert2 ? pa[0] : pa[1];
        for (let v2 = lo2; v2 <= hi2; v2++) {
          if (vert2 ? (v2 % (TREE_STEP * 2) === 0) : (v2 % 3 === 0)) continue;
          for (const off of [-half - 2, half + 2])
            drop.add(vert2 ? (ln + off) + "," + v2 : v2 + "," + (ln + off));
        }
      }
    }
    if (drop.size)
      fobjs = fobjs.filter(o => !drop.has(Math.floor(o.x / TS) + "," +
                                          Math.floor((o.y - 1) / TS)));
  }

  {
    const line = MD.mystic_above;
    if (line !== undefined) {
      const wantN = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
      const wantS = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
      const smallOf = new Map(), isSmall = new Set();
      for (const k of Object.keys(STYLE_TREE)) {
        const si = NAME2I[STYLE_TREE[k]];
        if (si === undefined) continue;
        if (k.endsWith("_small")) { isSmall.add(si); continue; }
        const sm = NAME2I[STYLE_TREE[k + "_small"]];
        if (sm !== undefined) smallOf.set(si, sm);
      }

      const bandStyle = new Map();
      for (const f of features) {
        if (!isArea(f)) continue;
        const b = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) < b)
              bandStyle.set(x + "," + y, f.style || "spruce");
      }

      const strayed = new Set();
      for (const f of features) {
        if (f.kind !== "route") continue;
        const legs = routeLegs(f);
        let lo = Infinity, hi = -Infinity;
        for (const [a, b] of legs) {
          lo = Math.min(lo, a[1], b[1]); hi = Math.max(hi, a[1], b[1]);
        }
        let drawnLo, drawnHi;
        if (f.drawn) {
          drawnLo = f.drawn[0]; drawnHi = f.drawn[1];
        } else if (f.pts && f.pts.length >= 2) {
          const py = f.pts.map(p => p[1]);
          drawnLo = Math.min.apply(null, py); drawnHi = Math.max.apply(null, py);
        } else {
          drawnLo = Math.min(f.y0, f.y1); drawnHi = Math.max(f.y0, f.y1);
        }
        if (lo >= drawnLo - 4 && hi <= drawnHi + 4) continue;
        const pad = (f.band || 8) + (f.w || 5);
        for (const [a, b] of legs)
          for (let y = Math.min(a[1], b[1]) - pad; y <= Math.max(a[1], b[1]) + pad; y++) {
            if (y >= drawnLo - pad && y <= drawnHi + pad) continue;
            for (let x = Math.min(a[0], b[0]) - pad; x <= Math.max(a[0], b[0]) + pad; x++)
              strayed.add(x + "," + y);
          }
      }

      for (const o of fobjs) {
        const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
        const key = x + "," + y;
        const bs = bandStyle.get(key);
        if (bs !== undefined) {
          const want = NAME2I[STYLE_TREE[bs]];
          if (want !== undefined) o.s = want;
          continue;
        }
        if (strayed.has(key)) {
          let want = isMystic(x, y) ? wantN : wantS;
          if (want !== undefined && isSmall.has(o.s))
            want = smallOf.has(want) ? smallOf.get(want) : want;
          if (want !== undefined) o.s = want;
        }
      }
    }
  }

  const refreshSpeciesIdx = () => {
    speciesIdx = new Map();
    for (const o of fobjs)
      speciesIdx.set(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS), o.s);
  };
  const speciesNear = (x, y) => {
    if (!speciesIdx) refreshSpeciesIdx();
    return speciesNearIdx(x, y, speciesIdx);
  };
  const speciesNearIdx = (x, y, byTile) => {
    for (let r = 1; r <= 6; r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const si = byTile.get((x + dx) + "," + (y + dy));
          if (si !== undefined) return si;
        }
    const nS = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const sS = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    return isMystic(x, y) ? nS : sS;
  };

  {
    const covered = new Set();
    for (let i = 0; i < scat.length; i += 3) {
      const nm = NAMES[scat[i]], sp = SPR[nm];
      if (!sp || !/^(mtn_|mtd_|mtw_|mte_|shc_|shcap_|cliff_|waterfall)/.test(nm)) continue;
      for (let ty = Math.floor((scat[i + 2] - sp[3]) / TS); ty <= Math.floor((scat[i + 2] - 1) / TS); ty++)
        for (let tx = Math.floor((scat[i + 1] - (sp[2] >> 1)) / TS);
             tx <= Math.floor((scat[i + 1] + (sp[2] >> 1) - 1) / TS); tx++)
          covered.add(tx + "," + ty);
    }
    for (const arr of [objs, fobjs])
      for (const o of arr) {
        const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
        for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
          for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
               tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
            covered.add(tx + "," + ty);
      }
    for (let y = RIM + 1; y < MH - RIM - 1; y++)
      for (let x = RIM + 1; x < MW - RIM - 1; x++) {
        const i = y * MW + x;
        if (terr[i] !== WALL || covered.has(x + "," + y)) continue;
        if (lineTiles.has(x + "," + y)) {
          const _si = speciesNear(x, y);
          const _sand = baseTerr[y * MW + x] === SAND;
          if (!ringTiles.has(x + "," + y) &&
              (!_sand || /^cactus/.test(NAMES[_si] || "")) &&
              putTree(x, y, _si, { edge: true })) {
            covered.add(x + "," + y);
          } else if (ringTiles.has(x + "," + y)) {
            continue;            /* the ring keeps its ground and its spacing */
          } else {
            terr[i] = openTo(i);
          }
          continue;
        }
        terr[i] = openTo(i);
      }
  }
  {
    if (buildingBoxes.length) {
      const before = fobjs.length;
      const gone = [];
      fobjs = fobjs.filter(o => {
        const sp0 = SPR[NAMES[o.s]];
        const hit = sp0 && onBuilding(o.x, o.y, sp0);
        if (hit) gone.push([Math.floor(o.x / TS), Math.floor((o.y - 1) / TS)]);
        return !hit;
      });
      if (gone.length) {
        const covered = new Set();
        for (let i = 0; i < scat.length; i += 3) {
          const nm = NAMES[scat[i]], sp = SPR[nm];
          if (!sp || !/^(mtn_|mtd_|mtw_|mte_|shc_|shcap_|cliff_|waterfall)/.test(nm)) continue;
          for (let ty = Math.floor((scat[i + 2] - sp[3]) / TS); ty <= Math.floor((scat[i + 2] - 1) / TS); ty++)
            for (let tx = Math.floor((scat[i + 1] - (sp[2] >> 1)) / TS);
                 tx <= Math.floor((scat[i + 1] + (sp[2] >> 1) - 1) / TS); tx++)
              covered.add(tx + "," + ty);
        }
        for (const arr of [objs, fobjs])
          for (const o of arr) {
            const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
            for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
              for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
                   tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
                covered.add(tx + "," + ty);
          }
        for (let y = RIM + 1; y < MH - RIM - 1; y++)
          for (let x = RIM + 1; x < MW - RIM - 1; x++) {
            const k = x + "," + y;
            if (terr[y * MW + x] !== WALL || covered.has(k)) continue;
            if (ringTiles.has(k)) { terr[y * MW + x] = openTo(y * MW + x); continue; }
      if (inDesert(x, y)) continue;   /* no ring through a desert oasis */
            if (lineTiles.has(k)) {
              if (ringTiles.has(k)) continue;   /* the ring keeps its spacing */
              if (baseTerr[y * MW + x] !== SAND &&
                  putTree(x, y, speciesNear(x, y), { edge: true })) {
                covered.add(k);
              } else {
                terr[y * MW + x] = openTo(y * MW + x);
              }
              continue;
            }
            terr[y * MW + x] = openTo(y * MW + x);
          }
      }
    }
  }

  if (ringTiles.size) {
    const keep = [];
    for (const o of fobjs) {
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      const k = x + "," + y;
      if (ringTiles.has(k)) {
        const vert = ringVertical.has(k);
        if (vert ? (y % (TREE_STEP * 2)) : (x % 3)) continue;
      }
      keep.push(o);
    }
    fobjs = keep;
  }
  {
    const cov = new Set();
    for (const arr of [objs, fobjs])
      for (const o of arr) {
        const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
        for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
          for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
               tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
            cov.add(tx + "," + ty);
      }
    for (let y = RIM + 1; y < MH - RIM - 1; y++)
      for (let x = RIM + 1; x < MW - RIM - 1; x++) {
        if (terr[y * MW + x] !== WALL) continue;
        const k = x + "," + y;
        if (cov.has(k) || townRing.has(k)) continue;
        if (rockAt(x, y)) continue;
        terr[y * MW + x] = openTo(y * MW + x);
      }
  }

  treeAt.clear();
  for (const o of fobjs)
    treeAt.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
  for (const f of features) {
    if (f.kind !== "route") continue;
    const half = f.w >> 1;
    const drawnLo = Math.min(f.y0, f.y1), drawnHi = Math.max(f.y0, f.y1);
    const nSi = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const sSi = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    const ownSi = sows(f.style) ? NAME2I[STYLE_TREE[f.style]] : undefined;
    const speciesAt = (y) => ownSi;
    for (const [pa, pb] of routeLegs(f)) {
      const vert = pa[0] === pb[0];
      const over = half + 2;
      const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
      const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
      const line = vert ? pa[0] : pa[1];
      for (let v = lo; v <= hi; v++) {
        if (vert ? (v % (TREE_STEP * 2)) : (v % 3)) continue;
        for (const d of [-half - 2, half + 2]) {
          const x = vert ? line + d : v, y = vert ? v : line + d;
          if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
          const cur = terr[y * MW + x];
          if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
            continue;
          const k = x + "," + y;
          if (treeAt.has(k) || felled.has(k)) continue;
          const si = speciesAt(y);
          if (si === undefined) continue;
          if (onBody(x, y)) continue;
          if (rockTiles.has(x + "," + y)) continue;   /* it is a cliff */
          if (!inTown(x, y) && !atOasis(x, y))
          if (!refusesTrunk(terr[y * MW + x]))
          terr[y * MW + x] = WALL;
          if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                       x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
          treeAt.add(k);
        }
      }
    }
  }

  {
    const strays = new Set();
    for (const f of features) {
      if (!isArea(f) || f.wild || f.ring) continue;
      const b = f.band || 6;
      const onRing = (x, y) => {
        const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
        if (e !== b - 1) return false;
        const vert = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
        return vert ? !(y % (TREE_STEP * 2)) : !(x % 3);
      };
      for (let y = f.y0; y <= f.y1; y++)
        for (let x = f.x0; x <= f.x1; x++) {
          const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
          if (e < b && !onRing(x, y)) strays.add(x + "," + y);
        }
    }
    if (strays.size) {
      fobjs = fobjs.filter(o => !strays.has(Math.floor(o.x / TS) + "," +
                                            Math.floor((o.y - 1) / TS)));
      for (const k of strays) {
        const [sx, sy] = k.split(",").map(Number);
        if (rockAt(sx, sy)) continue;          /* rock is not a stray tree */
        if (terr[sy * MW + sx] === WALL) terr[sy * MW + sx] = openTo(sy * MW + sx);
      }
    }
  }
  for (const f of features) {
    if (!isArea(f) || f.wild || f.ring) continue;
    const b = f.band || 6, si = NAME2I[STYLE_TREE[f.style || "spruce"]];
    if (si === undefined) continue;
    const x0 = f.x0 + b - 1, x1 = f.x1 - b + 1;
    const y0 = f.y0 + b - 1, y1 = f.y1 - b + 1;
    if (x1 <= x0 || y1 <= y0) continue;
    const want = [];
    for (let x = x0; x <= x1; x++)
      if (!(x % 3)) want.push([x, y0], [x, y1]);
    for (let y = y0; y <= y1; y++)
      if (!(y % (TREE_STEP * 2))) want.push([x0, y], [x1, y]);
    want.push([x0, y0], [x1, y0], [x0, y1], [x1, y1]);
    for (const [x, y] of want) {
      if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
      const cur = terr[y * MW + x];
      if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
        continue;
      const k = x + "," + y;
      if (treeAt.has(k) || felled.has(k)) continue;
      if (onBody(x, y)) continue;
      if (rockTiles.has(k)) continue;                 /* it is a cliff */
      if (!inTown(x, y) && !atOasis(x, y))
      if (!refusesTrunk(terr[y * MW + x]))
      terr[y * MW + x] = WALL;
      if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                   x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
      treeAt.add(k);
    }
  }

  {
    const keep = new Set(), claimed = new Set();
    const mark = (x, y, onLine) => {
      if (x < 0 || y < 0 || x >= MW || y >= MH) return;
      claimed.add(x + "," + y);
      if (onLine) keep.add(x + "," + y);
    };
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - 4); dy <= r + 4; dy++)
          for (let dx = Math.floor(-r - 4); dx <= r + 4; dx++) {
            if (Math.hypot(dx, dy) <= r + 4)
              keep.add((f.x + dx) + "," + (f.y + dy));
          }
        continue;
      }
      if (f.kind === "route") {
        const half = f.w >> 1;
        const reach = half + 1 + (f.band || 8);
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - reach;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + reach;
          const line = vert ? pa[0] : pa[1];
          for (let v = lo; v <= hi; v++)
            for (let d = -reach; d <= reach; d++) {
              const x = vert ? line + d : v, y = vert ? v : line + d;
              mark(x, y, Math.abs(d) === half + 2);
            }
        }
      } else if (isArea(f) && !f.wild && !f.ring) {
        const b = f.band || 6;
        const out = b + 6;   /* far enough to catch the last of the scatter */
        for (let y = f.y0 - out; y <= f.y1 + out; y++)
          for (let x = f.x0 - out; x <= f.x1 + out; x++) {
            const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
            if (e < b) mark(x, y, e === b - 1);
          }
      }
    }
    for (const o of objs) {
      const nm = NAMES[o.s], sp = SPR[nm];
      if (!sp || !/^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower)/.test(nm))
        continue;
      for (let ty = Math.floor((o.y - sp[3] + 1) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
        for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
             tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
          keep.delete(tx + "," + ty), claimed.add(tx + "," + ty);
    }
    if (claimed.size) {
      const gone = [];
      fobjs = fobjs.filter(o => {
        const k = Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS);
        if (claimed.has(k) && !keep.has(k)) { gone.push(k); return false; }
        return true;
      });
      for (const k of gone) {
        const [gx, gy] = k.split(",").map(Number);
        if (terr[gy * MW + gx] === WALL) terr[gy * MW + gx] = openTo(gy * MW + gx);
      }
    }
  }

  {
    const want = new Set(), band = new Set();
    const structureKeep = new Set();
    const owner = new Map();
    const claim = (x, y, on, style) => {
      if (noPlant(x, y)) return;        /* a clearing: nothing is sown here */
      const k = x + "," + y;
      band.add(k);
      if (style !== undefined && !owner.has(k)) owner.set(k, style);
      if (on) want.add(k);
    };
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - 4); dy <= r + 4; dy++)
          for (let dx = Math.floor(-r - 4); dx <= r + 4; dx++) {
            const d = Math.hypot(dx, dy);
            if (d > r + 1.5 && d <= r + 3.5)
              claim(f.x + dx, f.y + dy, false, f.style);
          }
        const rr = r + 2.5, step = 3 / rr;
        for (let a = 0; a < Math.PI * 2 - 1e-9; a += step) {
          const x = f.x + Math.round(Math.cos(a) * rr);
          const y = f.y + Math.round(Math.sin(a) * rr);
          want.add(x + "," + y);
          owner.set(x + "," + y, f.style);
          band.add(x + "," + y);
        }
      } else if (isArea(f) && !f.wild && !f.ring) {
        const b = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++) {
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) !== b - 1) continue;
            const vert = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
            claim(x, y, vert ? !(y % (TREE_STEP * 2)) : !(x % 3), f.style);
          }
      } else if (isArea(f) && f.no_trees) {
        const bb = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) === bb - 1)
              structureKeep.add(x + "," + y);
        const b = f.band || 6;
        for (let y = f.y0 - b; y <= f.y1 + b; y++)
          for (let x = f.x0 - b; x <= f.x1 + b; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) < b)
              claim(x, y, false);
      } else if (f.kind === "route") {
        const half = f.w >> 1, over = half + 2;
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
          const line = vert ? pa[0] : pa[1];
          if (f.style === "desert" || f.style === "volcano") continue;
          if (f.style === "blossom" || f.style === "spruce") continue;
          for (let v = lo; v <= hi; v++)
            for (const d of [-half - 2, half + 2])
              claim(vert ? line + d : v, vert ? v : line + d,
                    vert ? !(v % (TREE_STEP * 2)) : !(v % 3),
                    f.style);          /* the verge belongs to ITS road */
        }
      }
    }
    if (band.size) {
      fobjs = fobjs.filter(o => {
        const k = Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS);
        if (!band.has(k)) return true;
        if (!want.has(k)) return false;
        const own = owner.get(k);
        if (!own) return true;
        const wantSi = NAME2I[STYLE_TREE[own]];
        return wantSi === undefined || o.s === wantSi;
      });
      const here = new Set();
      for (const o of fobjs)
        here.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
      for (const k of want) {
        if (here.has(k) || felled.has(k)) continue;
        const [x, y] = k.split(",").map(Number);
        if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
        const cur = terr[y * MW + x];
        if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
          continue;
        const own = owner.get(k);
        const si = (own && NAME2I[STYLE_TREE[own]] !== undefined)
          ? NAME2I[STYLE_TREE[own]] : speciesNear(x, y);
        if (si === undefined || onBody(x, y)) continue;
        if (rockTiles.has(x + "," + y)) continue;     /* it is a cliff */
        if (!inTown(x, y) && !atOasis(x, y))
        if (!refusesTrunk(terr[y * MW + x]))
        terr[y * MW + x] = WALL;
        if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                     x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
        here.add(k);
      }
    }
  }

  {
    const AVENUE = { blossom: "blo_big", desert: "cactus1", spruce: "spr_big" };
    const placed = features.filter(f => isArea(f) && (f.place || f.label)
                                     && !sows(f.style));
    const townEdge = (x, y) => placed.some(
      a => x >= a.x0 - 3 && x <= a.x1 + 3 && y >= a.y0 - 3 && y <= a.y1 + 3);
    const REACH = 13;
    const legs = [];
    for (const f of features) {
      if (f.kind !== "route" || !AVENUE[f.style]) continue;
      const h = (f.w || 5) >> 1;
      for (const [pa, pb] of routeLegs(f))
        legs.push([pa[0], pa[1], pb[0], pb[1], h, f.style]);
    }
    if (legs.length) {
      const taken = new Set();
      for (const o of objs.concat(fobjs)) {
        const nm = NAMES[o.s] || "";
        if (/^(spr_|oak_|bir_|fru_|mw_|sh_|blo_|kt_)/.test(nm)) continue;
        taken.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
      }
      const box = legs.map(s => [Math.min(s[0], s[2]) - REACH, Math.min(s[1], s[3]) - REACH,
                                 Math.max(s[0], s[2]) + REACH, Math.max(s[1], s[3]) + REACH]);
      const mates = legs.map((_, i) => legs.filter((__, k) =>
        box[k][0] <= box[i][2] && box[k][2] >= box[i][0] &&
        box[k][1] <= box[i][3] && box[k][3] >= box[i][1]));
      const seen = new Set();
      for (let li = 0; li < legs.length; li++) {
        const b = box[li], near = mates[li];
        const ax = Math.max(1, b[0]), ay = Math.max(1, b[1]);
        const bx = Math.min(MW - 2, b[2]), by = Math.min(MH - 2, b[3]);
        for (let y = ay; y <= by; y++) {
          for (let x = ax; x <= bx; x++) {
            const cell = y * MW + x;
            if (seen.has(cell)) continue;
            seen.add(cell);
            const ground = terr[cell];
            if (ground !== GRASS && ground !== SAND) continue;
            let best = 1e9, half = 2, style = null;
            for (const s of near) {
              const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx * dx + dy * dy;
              let t = l2 ? ((x - s[0]) * dx + (y - s[1]) * dy) / l2 : 0;
              t = t < 0 ? 0 : t > 1 ? 1 : t;
              const ex = x - (s[0] + t * dx), ey = y - (s[1] + t * dy);
              const d = ex * ex + ey * ey;
              if (d < best) { best = d; half = s[4]; style = s[5]; }
            }
            if (style === null) continue;
            if (inTownArea(x, y)) continue;
            if (townEdge(x, y)) continue;
            if (style === "blossom" && ground !== GRASS) continue;
            if (style === "spruce" && ground !== GRASS) continue;
            if (style === "desert" && ground !== SAND) continue;
            const nm = AVENUE[style], si = NAME2I[nm];
            if (si === undefined || !SPR[nm]) continue;
            const off = Math.sqrt(best) - half - 2;
            let row = -1;
            if (off >= -0.6 && off < 0.6) row = 0;
            else if (off >= 2.4 && off < 3.6) row = 1;
            else if (off >= 5.4 && off < 6.6) row = 2;
            if (row < 0) continue;
            if ((x + y + row * 2) % (TREE_STEP * 2)) continue;
            const k = x + "," + y;
            if (taken.has(k)) continue;
            taken.add(k);
            fobjs = fobjs.filter(o =>
              !(Math.floor(o.x / TS) === x && Math.floor((o.y - 1) / TS) === y
                && /^(spr_|oak_|bir_|fru_|mw_|sh_|blo_|kt_)/.test(NAMES[o.s] || "")));
            fobjs.push({ id: -1 - fobjs.length, s: si,
                         x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
          }
        }
      }
    }
  }

  {
    const cov = new Set();
    for (const arr of [objs, fobjs])
      for (const o of arr) {
        const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
        for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
          for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
               tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
            cov.add(tx + "," + ty);
      }
    const structure = new Set();
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - 4); dy <= r + 4; dy++)
          for (let dx = Math.floor(-r - 4); dx <= r + 4; dx++) {
            const d = Math.hypot(dx, dy);
            if (d > r + 1.5 && d <= r + 3.5)
              structure.add((f.x + dx) + "," + (f.y + dy));
          }
      } else if (isArea(f) && !f.wild && !f.ring) {
        const b = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) === b - 1)
              structure.add(x + "," + y);
      } else if (f.kind === "route") {
        const half = f.w >> 1, over = half + 2;
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
          const line = vert ? pa[0] : pa[1];
          for (let v = lo; v <= hi; v++)
            for (const d of [-half - 2, half + 2])
              structure.add((vert ? line + d : v) + "," + (vert ? v : line + d));
        }
      }
    }
    for (let y = RIM + 1; y < MH - RIM - 1; y++)
      for (let x = RIM + 1; x < MW - RIM - 1; x++) {
        const k = x + "," + y;
        const mayBuild = structure.has(k) && !felled.has(k) &&
                         !onBuilding(x * TS + TS / 2, y * TS + TS, SPR["spr_big"]);
        if (terr[y * MW + x] === GRASS && mayBuild) terr[y * MW + x] = WALL;
        if (terr[y * MW + x] !== WALL) continue;
        if (cov.has(k)) continue;
        if (rockAt(x, y)) continue;            /* a cliff is not loose structure */
        if (!mayBuild) { terr[y * MW + x] = openTo(y * MW + x); continue; }
      }
  }

  {
    const gone = [];
    fobjs = fobjs.filter(o => {
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      if (!onBody(x, y)) return true;
      gone.push([x, y]);
      return false;
    });
    for (const [x, y] of gone)
      if (terr[y * MW + x] === WALL) terr[y * MW + x] = openTo(y * MW + x);
  }

  {
    const OUT = 5;
    const outside = new Map();
    const note = (x, y, d, vert, style, lo, hi, clean) => {
      if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) return;
      const slack = OUT + 4;
      const drawn = (lo === undefined) || (y >= lo - slack && y <= hi + slack);
      const k = x + "," + y;
      if (!outside.has(k) || outside.get(k)[0] > d)
        outside.set(k, [d, vert, drawn ? style : null, !!clean]);
    };
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - OUT - 4); dy <= r + OUT + 4; dy++)
          for (let dx = Math.floor(-r - OUT - 4); dx <= r + OUT + 4; dx++) {
            const d = Math.hypot(dx, dy) - (r + 3.5);
            if (d > 0 && d <= OUT)
              note(f.x + dx, f.y + dy, Math.round(d),
                   Math.abs(dx) > Math.abs(dy), f.style);
          }
      } else if (isArea(f) && !f.wild && !f.no_trees) {
        const b = f.band || 6;
        for (let y = f.y0 - OUT; y <= f.y1 + OUT; y++)
          for (let x = f.x0 - OUT; x <= f.x1 + OUT; x++) {
            const ox = Math.max(f.x0 - x, x - f.x1, 0);
            const oy = Math.max(f.y0 - y, y - f.y1, 0);
            let d, vert;
            if (ox || oy) {                      /* outside the rectangle */
              d = (b - 1) + Math.max(ox, oy);
              vert = ox >= oy;
            } else {                             /* inside, within the band */
              const ex = Math.min(x - f.x0, f.x1 - x);
              const ey = Math.min(y - f.y0, f.y1 - y);
              d = (b - 1) - Math.min(ex, ey);
              vert = ex <= ey;
            }
            if (d >= 1 && d <= OUT) note(x, y, d, vert, f.style);
          }
      } else if (f.kind === "route") {
        let drawnLo, drawnHi;
        if (f.drawn) {
          drawnLo = f.drawn[0]; drawnHi = f.drawn[1];
        } else if (f.pts && f.pts.length >= 2) {
          const py = f.pts.map(p => p[1]);
          drawnLo = Math.min.apply(null, py); drawnHi = Math.max.apply(null, py);
        } else {
          drawnLo = Math.min(f.y0, f.y1); drawnHi = Math.max(f.y0, f.y1);
        }
        const half = f.w >> 1, edge = half + 2;
        const cleanRoute = !f.style || f.style === "spruce" || f.style === "mystic";
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - edge;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + edge;
          const line = vert ? pa[0] : pa[1];
          for (let v = lo - OUT; v <= hi + OUT; v++)
            for (let o = 1; o <= OUT; o++)
              for (const side of [-1, 1]) {
                const dd = side * (edge + o);
                note(vert ? line + dd : v, vert ? v : line + dd, o, vert, f.style,
                     drawnLo, drawnHi, cleanRoute);
              }
        }
      }
    }
    for (const [k, [d, vert, style, clean]] of outside) {
      const [x, y] = k.split(",").map(Number);
      if (treeAt.has(k) || felled.has(k)) continue;
      if (inClearing(x, y) || onBody(x, y)) continue;
      const cur = terr[y * MW + x];
      if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
        continue;
      if (d !== 2 && d !== 4) continue;
      const along = vert ? y : x;            /* along the line it stands off */
      const step = vert ? TREE_STEP * 2 : 3; /* a column steps 4, a row steps 3 */
      const shift = (d === 2) ? (step >> 1) : 0;
      if (((along - shift) % step + step) % step) continue;
      if (d === 4 && !clean) {
        const hg = ((x * 374761393) ^ (y * 668265263)) >>> 0;
        if (hg % 100 >= 55) continue;        /* the outer one thins out */
      }
      const si = (style && NAME2I[STYLE_TREE[style]] !== undefined)
        ? NAME2I[STYLE_TREE[style]]
        : (mysticAreas.length || MD.mystic_above !== undefined
            ? NAME2I[STYLE_TREE[isMystic(x, y) ? (MD.mystic_style || "mystic")
                                                     : (MD.forest_style || "spruce")]]
            : speciesNear(x, y));
      if (si === undefined) continue;
      if (rockTiles.has(k)) continue;               /* it is a cliff */
      const off = wobble(x, y);
      if (!inTown(x, y) && !atOasis(x, y))
      if (!refusesTrunk(terr[y * MW + x]))
      terr[y * MW + x] = WALL;
      if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                   x: x * TS + TS / 2 + off[0], y: y * TS + TS + off[1], feat: 1 });
      treeAt.add(k);
    }
  }

  if (MD.felled && MD.felled.length) {
    const gone = new Set(MD.felled.map(f => f[0] + "," + f[1]));
    fobjs = fobjs.filter(o =>
      !gone.has(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS)));
  }

  {
    const mystic = [];
    for (const f of features)
      if (f.kind === "area" && /shroom|mystic|spore/i.test(
            (f.style || "") + " " + (f.label || "")))
        mystic.push(f);
    const inMystic = (x, y) => mystic.some(f =>
      x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
    fobjs = fobjs.filter(o => {
      if (!/^mw_/.test(NAMES[o.s] || "")) return true;
      return inMystic(Math.floor(o.x / TS), Math.floor((o.y - 1) / TS));
    });
  }

  {
    let opened = 0;
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const i2 = y * MW + x;
        if (terr[i2] !== WALL) continue;
        if (rockTiles && rockTiles.has(x + "," + y)) continue;
        const gapHere = (MD.gaps || []).some(
          b => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]);
        if (!gapHere && treeAt && treeAt.has(x + "," + y)) continue;
        const road = onRoute(x, y) || gapHere || inScene(x, y);
        if (!road && !inDesert(x, y)) continue;
        terr[i2] = (baseTerr && baseTerr[i2] !== WALL) ? baseTerr[i2]
                 : (road ? GRASS : SAND);
        opened++;
      }
    globalThis.__blankWalls = opened;
  }
  for (const f of features) {
    const isA = f.kind === "area" || f.kind === "town";
    if (!isA && f.kind !== "route") continue;
    if (!f.style || !STYLE_TREE[f.style] || f.wild) continue;
    const m3 = isA ? 5 : (f.band || 20);
    const boxes = isA
      ? [[f.x0, f.y0, f.x1, f.y1]]
      : (f.pts || [[f.x0, f.y0], [f.x1, f.y1]]).slice(0, -1).map((p, i) => {
          const q = (f.pts || [[f.x0, f.y0], [f.x1, f.y1]])[i + 1];
          return [Math.min(p[0], q[0]), Math.min(p[1], q[1]),
                  Math.max(p[0], q[0]), Math.max(p[1], q[1])];
        });
    for (const o of fobjs) {
      const nm = NAMES[o.s];
      if (!/^(spr|oak|bir|fru|mw)_/.test(nm)) continue;
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      if (!boxes.some(b => x >= b[0] - m3 && x <= b[2] + m3
                        && y >= b[1] - m3 && y <= b[3] + m3))
        continue;
      const sp2 = STYLE_TREE[f.style];
      const nm2 = Array.isArray(sp2)
        ? sp2[(() => { let q = ((x * 374761393) ^ (y * 668265263)) >>> 0;
             q ^= q >>> 15; q = Math.imul(q, 2246822519) >>> 0;
             q ^= q >>> 13; q = Math.imul(q, 3266489917) >>> 0;
             return (q ^ (q >>> 16)) >>> 0; })() % sp2.length]
        : sp2;
      if (NAME2I[nm2] !== undefined) o.s = NAME2I[nm2];
    }
  }
  {
    const floor0 = MD.nogrow_below;
    const kept = [];
    let felledIn = 0;
    for (const o of fobjs) {
      const ox = Math.floor(o.x / TS), oy = Math.floor((o.y - 1) / TS);
      if (onRoute(ox, oy)) { felledIn++; continue; }
      if (ox >= 0 && oy >= 0 && ox < MW && oy < MH
          && terr[oy * MW + ox] === DECK) { felledIn++; continue; }
      if (inScene(ox, oy)) { felledIn++; continue; }
      if (oy >= 0 && ox >= 0 && ox < MW && oy < MH
          && terr[oy * MW + ox] === SEA) { felledIn++; continue; }
      const onRouteBand = features.some(rf => {
        if (rf.kind !== "route") return false;
        const reach = (rf.band || 20) + ((rf.w || 5) >> 1) + 2;
        for (const [pa, pb] of routeLegs(rf)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - reach;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + reach;
          const along = vert ? oy : ox, across = vert ? ox : oy;
          if (along >= lo && along <= hi &&
              Math.abs(across - (vert ? pa[0] : pa[1])) <= reach) return true;
        }
        return false;
      });
      if (floor0 !== undefined && oy >= floor0 && !onRouteBand
          && !features.some(af => (af.kind === "area" || af.kind === "town")
                                  && ox >= af.x0 - 2 && ox <= af.x1 + 2
                                  && oy >= af.y0 - 2 && oy <= af.y1 + 2)) {
        felledIn++;
        continue;
      }
      kept.push(o);
    }
    if (felledIn) fobjs = kept;
  }
  {
    const swampStyles = [];
    for (const f of features)
      if (f.kind === "route" && f.style === "swamp") swampStyles.push(f);
    if (swampStyles.length && Array.isArray(STYLE_TREE.swamp)) {
      const pool = STYLE_TREE.swamp.map(n => NAME2I[n]);
      const small = (STYLE_TREE.swamp_small || []).map(n => NAME2I[n])
                      ;
      const isSw = new Set(pool.concat(small));
      const at = new Map();                     /* tile key -> species index */
      const mine = [];
      for (const o of fobjs) {
        if (!isSw.has(o.s)) continue;
        const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
        mine.push({ o: o, tx: tx, ty: ty });
      }
      mine.sort((a, b) => a.ty - b.ty || a.tx - b.tx);
      let moved = 0;
      for (const m of mine) {
        const big = pool.indexOf(m.o.s);
        const set = big >= 0 ? pool : small;
        if (set.length < 2) { at.set(m.ty * MW + m.tx, m.o.s); continue; }
        const clash = s => {
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              if (!dx && !dy) continue;
              if (at.get((m.ty + dy) * MW + (m.tx + dx)) === s) return true;
            }
          return false;
        };
        if (clash(m.o.s)) {
          const from = Math.max(0, set.indexOf(m.o.s));
          for (let k = 1; k <= set.length; k++) {
            const cand = set[(from + k) % set.length];
            if (!clash(cand)) { m.o.s = cand; moved++; break; }
          }
        }
        at.set(m.ty * MW + m.tx, m.o.s);
      }
    }
  }
  if (NAME2I.wf_pine1 !== undefined && NAME2I.wf_tree1 !== undefined) {
    const winAreas = features.filter(f => f.style === "winter" && f.kind !== "route"
                                          && f.x0 !== undefined);
    if (winAreas.length) {
      const pine = NAME2I.wf_pine1, avenue = NAME2I.wf_tree1;
      for (const o of fobjs) {
        if (o.s !== avenue) continue;
        const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
        for (const a of winAreas) {
          const b = (a.band || 6) + 2;
          if (tx >= a.x0 - b && tx <= a.x1 + b && ty >= a.y0 - b && ty <= a.y1 + b) {
            o.s = pine; break;
          }
        }
      }
    }
  }
  if (typeof inVolcano === "function") {
    const VOLC_KEEP = new RegExp("^(" + PLACED + ")");
    const sweep = (tx, ty, s) =>
      inVolcano(tx, ty) && !VOLC_KEEP.test(NAMES[s] || "");
    if (typeof scat !== "undefined" && scat && scat.length) {
      const ks = [];
      for (let i = 0; i + 2 < scat.length; i += 3) {
        const tx = Math.floor(scat[i + 1] / TS), ty = Math.floor((scat[i + 2] - 1) / TS);
        if (sweep(tx, ty, scat[i])) continue;
        ks.push(scat[i], scat[i + 1], scat[i + 2]);
      }
      if (ks.length !== scat.length) scat = ks;
    }
    if (typeof sanm !== "undefined" && sanm && sanm.length) {
      const ks = [];
      for (let i = 0; i + 2 < sanm.length; i += 3) {
        const tx = Math.floor(sanm[i + 1] / TS), ty = Math.floor((sanm[i + 2] - 1) / TS);
        if (sweep(tx, ty, sanm[i])) continue;
        ks.push(sanm[i], sanm[i + 1], sanm[i + 2]);
      }
      if (ks.length !== sanm.length) sanm = ks;
    }
    const keep = [];
    for (const o of fobjs) {
      const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
      if (sweep(tx, ty, o.s)) continue;
      keep.push(o);
    }
    if (keep.length !== fobjs.length) fobjs = keep;
    const ko = objs.filter(o => !sweep(Math.floor(o.x / TS),
                                       Math.floor((o.y - 1) / TS), o.s));
    if (ko.length !== objs.length) objs = ko;
    if (typeof fsanim !== "undefined" && fsanim && fsanim.length) {
      const ks = [];
      for (let i = 0; i + 2 < fsanim.length; i += 3) {
        const tx = Math.floor(fsanim[i + 1] / TS), ty = Math.floor((fsanim[i + 2] - 1) / TS);
        if (sweep(tx, ty, fsanim[i])) continue;
        ks.push(fsanim[i], fsanim[i + 1], fsanim[i + 2]);
      }
      if (ks.length !== fsanim.length) fsanim = ks;
    }
  }
  {
    const CLEAR = [
      [806, 132, 826, 150],          /* where Route 3 leaves Forgewick */
      [2622, 156, 2640, 170],
      [2447, 355, 2452, 408],
      [2437, 400, 2441, 408],
    ];
    const BELTS = [
      { x0: 679, y0: 118, x1: 818, y1: 152 },   /* Forgewick */
      { x0: 330, y0: 300, x1: 520, y1: 334 },   /* the range above Forgefalls */
    ];
    const onARoad = (x, y) => {
      if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
      const v = terr[y * MW + x];
      return v === DIRT || v === COBBLE || v === ROADSAND || v === PAVING2;
    };
    const BELT = BELTS[0];
    const FADE = { x0: 925, x1: 1010, y0: 120, y1: 160 };
    const isTree = (nm) =>
      /^(wf_pine|wf_tree|sw_tree|oak_|spr_|bir_|fru_|mw_|sh_|kt_|blo_|deadtree|halfdead|deadbush)/.test(nm);
    const isDead = (nm) => /^(deadtree|halfdead|deadbush)/.test(nm);
    const scat2mtn = () => {
      const out = [];
      const q = MD.scatter;
      if (!q || !q.p) return out;
      const bb = atob(q.p);
      let s2 = 0, x2 = 0, y2 = 0, i2 = 0, f2 = 0, acc = 0, sh = 0;
      while (i2 < bb.length) {
        const c = bb.charCodeAt(i2++);
        acc |= (c & 127) << sh;
        if (c & 128) { sh += 7; continue; }
        const dd = (acc >>> 1) ^ -(acc & 1); acc = 0; sh = 0;
        if (f2 === 0) { s2 += dd; f2 = 1; }
        else if (f2 === 1) { x2 += dd; f2 = 2; }
        else {
          y2 += dd; f2 = 0;
          if (/^mtn/.test(NAMES[s2] || ""))
            out.push({ x: Math.round(x2 / TS), y: Math.round(y2 / TS) });
        }
      }
      return out;
    };
    const felledAt = new Set();
    const unplant = (tx, ty) => {
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return;
      if (rockTiles && rockTiles.has(tx + "," + ty)) return;   /* real cliff */
      const i = ty * MW + tx;
      felledAt.add(i);
      if (terr[i] === WALL)
        terr[i] = (baseTerr && baseTerr[i] !== WALL) ? baseTerr[i] : GRASS;
    };
    fobjs = fobjs.filter(o => {
      const nm = NAMES[o.s] || "";
      if (!isTree(nm)) return true;
      const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
      if (CLEAR.some(c => tx >= c[0] && tx <= c[2] && ty >= c[1] && ty <= c[3])) {
        unplant(tx, ty); return false;
      }
      if (BELTS.some(b => tx >= b.x0 && tx <= b.x1 && ty >= b.y0 && ty <= b.y1)) {
        unplant(tx, ty); return false;
      }
      if (tx >= FADE.x0 && tx <= FADE.x1 && ty >= FADE.y0 && ty <= FADE.y1) {
        const t = (tx - FADE.x0) / (FADE.x1 - FADE.x0);
        const h = (((tx * 73856093) ^ (ty * 19349663)) >>> 0) % 100 / 100;
        const keep = isDead(nm) ? h < t : h > t;
        if (!keep) unplant(tx, ty);
        return keep;
      }
      return true;
    });
    {
      const si = NAME2I.oak_big;
      if (si !== undefined) {
        const artFoot = {};
        for (const o of objs.concat(fobjs)) {
          if (!/^mtn/.test(NAMES[o.s] || "")) continue;
          const ax = Math.round(o.x / TS), ay = Math.round(o.y / TS);
          if (artFoot[ax] === undefined || ay > artFoot[ax]) artFoot[ax] = ay;
        }
        {
          const sc = MD.scatter;
          const sl = (sc && sc.p) ? null : sc;
          if (Array.isArray(sl))
            for (let k = 0; k + 2 < sl.length; k += 3) {
              if (!/^mtn/.test(NAMES[sl[k]] || "")) continue;
              const ax = Math.round(sl[k + 1] / TS), ay = Math.round(sl[k + 2] / TS);
              if (artFoot[ax] === undefined || ay > artFoot[ax]) artFoot[ax] = ay;
            }
        }
        for (const o of scat2mtn()) {
          if (artFoot[o.x] === undefined || o.y > artFoot[o.x]) artFoot[o.x] = o.y;
        }
        const footOf = (x, B) => {
          B = B || BELT;
          let y = B.y0;
          while (y <= B.y1 && terr[y * MW + x] !== WALL) y++;
          if (y <= B.y1) {
            while (y <= B.y1 && terr[y * MW + x] === WALL) y++;
            if (y <= B.y1) return y;
          }
          const a = artFoot[x];
          return (a !== undefined && a >= B.y0 && a <= B.y1) ? a + 1 : -1;
        };
        const typicalNear = (x, B) => {
          const near = [];
          for (let k = x - 12; k <= x + 12; k++) {
            if (k < B.x0 || k > B.x1) continue;
            const v = footOf(k, B);
            if (v > 0) near.push(v);
          }
          if (!near.length) return -1;
          near.sort((a, b) => a - b);
          return near[near.length >> 1];
        };
        const wet = [];
        {
          const sa = MD.sanim || [];
          for (let k = 0; k + 2 < sa.length; k += 3)
            if (/waterfall|vfall/.test(NAMES[sa[k]] || ""))
              wet.push(Math.round(sa[k + 1] / TS));
        }
        const atWater = (x) => wet.some(w => Math.abs(x - w) <= 4);
        for (const B of BELTS)
        for (let x = B.x0; x <= B.x1; x += 2) {
          if (atWater(x)) continue;
          let y = footOf(x, B);
          if (y >= 0 && onARoad(x, y)) continue;
          if (y < 0) continue;
          const typical = typicalNear(x, B);
          const off = typical > 0 ? Math.abs(y - typical) : 0;
          if (typical > 0 && off > 1 && off <= 3) y = typical;
          if (onARoad(x, y)) continue;
          fobjs.push({ id: -1 - fobjs.length, s: si,
                       x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
          blockTiles.push(y * MW + x);      /* its trunk, as any tree's is */
          felledAt.delete(y * MW + x);
        }
      }
    }
    if (felledAt.size) blockTiles = blockTiles.filter(i => !felledAt.has(i));
    {
      const FACE = NAME2I["sw_tree1_2"];
      for (const f of features) {
        if (f.kind !== "route" || f.style !== "swamp") continue;
        const half = (f.w || 5) >> 1;
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]) - 2;
          const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]) + 2;
          const ct = vert ? pa[0] : pa[1];
          for (const o of fobjs) {
            const nm = NAMES[o.s] || "";
            if (!/^sw_tree/.test(nm) || o.s === FACE) continue;
            const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
            const al = vert ? ty : tx, ac = vert ? tx : ty;
            if (al < lo || al > hi) continue;
            const off = ac - ct;
            if (Math.abs(off) > half + 1) continue;      /* already clear */
            const side = off === 0 ? ((al % 2) ? 1 : -1) : Math.sign(off);
            let put = null;
            for (const want of [half + 3, half + 4, half + 5, half + 2]) {
              const cand = ct + side * want;
              const cx = vert ? cand : al, cy = vert ? al : cand;
              if (cx < 1 || cy < 1 || cx >= MW - 1 || cy >= MH - 1) continue;
              if (terr[cy * MW + cx] !== GRASS) continue;
              put = [cx, cy]; break;
            }
            if (!put) continue;
            o.x = put[0] * TS + TS / 2;
            o.y = (put[1] + 1) * TS;
          }
        }
      }
    }
    const SPECIES_BOX = [
      { x0: 393, y0: 165, x1: 400, y1: 248, tree: "bir_big" },
      { x0: 351, y0: 245, x1: 397, y1: 256, tree: "bir_big" },
    ];
    for (const b of SPECIES_BOX) {
      const si = NAME2I[b.tree];
      if (si === undefined) continue;
      for (const o of fobjs) {
        const nm = NAMES[o.s] || "";
        if (!/^(oak_|bir_|spr_|fru_|mw_|kt_)/.test(nm) || o.s === si) continue;
        const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
        if (tx < b.x0 || tx > b.x1 || ty < b.y0 || ty > b.y1) continue;
        o.s = si;
      }
    }
    {
      const SPECIES = /^(oak_|bir_|spr_|fru_|mw_|kt_)/;
      const SWEEP_SKIP = [
        { x0: 1, y0: 241, x1: 72, y1: 403 },      /* the Northern Woods */
        { x0: 0, y0: 404, x1: 62, y1: 453 },      /* Millwood, spruce as well */
      ];
      const skipHere = (x, y) => SWEEP_SKIP.some(
        b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
      const firstOf = (v) => Array.isArray(v) ? v[0]
                           : (typeof v === "string" ? v.split(",")[0] : null);
      for (const ft of features) {
        if (ft.kind !== "route") continue;
        if (ft.style === "blossom" || ft.style === "swamp" ||
            ft.style === "desert" || ft.style === "volcano") continue;
        const want = firstOf(STYLE_TREE[ft.style]);
        const si = want && NAME2I[want];
        if (si === undefined) continue;
        const half = (ft.w || 5) >> 1, reach = half + 3;
        for (const [pa, pb] of routeLegs(ft)) {
          const vert = pa[0] === pb[0];
          const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
          const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
          const line = vert ? pa[0] : pa[1];
          for (const o of fobjs) {
            const nm = NAMES[o.s] || "";
            if (!SPECIES.test(nm) || o.s === si) continue;
            const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
            const al = vert ? ty : tx, ac = vert ? tx : ty;
            if (al < lo || al > hi) continue;
            if (Math.abs(ac - line) > reach) continue;
            if (skipHere(tx, ty)) continue;      /* already settled */
            o.s = si;                  /* the road's own tree, in its place */
          }
        }
      }
    }
    {
      const si = NAME2I.oak_big;
      const road = features.find(f => f.kind === "route" && f.road === "Route 3" &&
                                      f.style === "oak");
      if (si !== undefined) {
        const FILL = [
          { x: 686, y0: 129, y1: 158 },
          { x: 687, y0: 129, y1: 158 },
          { x: 688, y0: 129, y1: 158 },
          { x: 689, y0: 129, y1: 158 },
          { y: 132, x0: 812, x1: 836 },   /* mountain down to the road */
          { y: 133, x0: 812, x1: 836 },
          { y: 147, x0: 812, x1: 836 },   /* the road down to the town */
          { y: 148, x0: 812, x1: 836 },
        ];
        for (const b of FILL)
          for (let v = (b.x !== undefined ? b.y0 : b.x0);
               v <= (b.x !== undefined ? b.y1 : b.x1); v++) {
            const x = b.x !== undefined ? b.x : v;
            const y = b.x !== undefined ? v : b.y;
            if ((x + y) % 2) continue;
            if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
            if (terr[y * MW + x] !== GRASS) continue;
            fobjs.push({ id: -1 - fobjs.length, s: si,
                         x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
            terr[y * MW + x] = WALL;
            blockTiles.push(y * MW + x);
          }
      }
      if (si !== undefined && road) {
        for (const [pa, pb] of routeLegs(road)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0]));
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0]));
          const line = vert ? pa[0] : pa[1];
          const half = ((road.w || 5) >> 1) + 2;
          for (let v = lo; v <= hi; v += 2)
            for (const side of [-1, 1])
              for (let row = 0; row < 2; row++) {
                const off = (half + 1 + row * 2) * side;
                const x = vert ? line + off : v;
                const y = vert ? v : line + off;
                if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
                if (terr[y * MW + x] !== GRASS) continue;
                if (inTownArea(x, y)) continue;
                if (row && (v + x) % 4) continue;
                fobjs.push({ id: -1 - fobjs.length, s: si,
                             x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
                terr[y * MW + x] = WALL;
                blockTiles.push(y * MW + x);
              }
        }
      }
    }
    {
      let cleared = 0;
      for (let y = BELT.y0; y <= BELT.y1; y++)
        for (let x = BELT.x0; x <= BELT.x1; x++) {
          const i = y * MW + x;
          if (terr[i] !== WALL) continue;
          if (rockTiles && rockTiles.has(x + "," + y)) continue;
          terr[i] = (baseTerr && baseTerr[i] !== WALL) ? baseTerr[i] : GRASS;
          cleared++;
        }
      if (cleared) blockTiles = blockTiles.filter(i => {
        const x = i % MW, y = (i - x) / MW;
        return !(x >= BELT.x0 && x <= BELT.x1 && y >= BELT.y0 && y <= BELT.y1);
      });
    }
  }
  /* A route's avenue should read as one unbroken line: forest down both
     verges with a tree every third tile. The normal passes get there by
     accident and miss in two ways -- inside a town region the route lays
     plain grass and never marks the verge as forest, and where the verge IS
     forest the planting pass can still decline the tile because something
     else claimed it. Route 4 was bare for its whole run past Forgewick and
     patchy again on the approach to the sand.

     This runs dead last, after every other terrain pass, because earlier
     attempts were laid correctly and then flattened again further down.
     Road crossings, water and clearings are left alone so junctions stay
     open. Sand keeps its own floor: a dead avenue, not a green one. */
  /* treeAt marks a tile even when the tree it stood for was never actually
     pushed, so it cannot be used to tell an occupied verge from an empty one.
     Go by what is really standing there. */
  const standing = new Set(objs.concat(fobjs).map(
    o => Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS)));
  const SWAMP_VERGE_SAFE = ["sw_tree2_3", "sw_tree3_3", "sw_tree4_3"];
  for (const f of features) {
    if (f.kind !== "route" || !sows(f.style)) continue;
    const off = (f.w >> 1) + 2;
    const sp0 = f.style === "swamp" ? SWAMP_VERGE_SAFE : STYLE_TREE[f.style];
    for (const [pa, pb] of routeLegs(f)) {
      const vert = pa[0] === pb[0];
      const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
      const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
      const axis = vert ? pa[0] : pa[1];
      for (const sgn of [-1, 1])
        for (let v = lo; v <= hi; v++) {
          const x = vert ? axis + sgn * off : v;
          const y = vert ? v : axis + sgn * off;
          if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
          const cur = terr[y * MW + x];
          if (cur === WATER || cur === BRIDGE || cur === DIRT || cur === COBBLE ||
              cur === PAVING2 || cur === MARBLE || cur === TERRACE ||
              cur === ROADSAND) continue;
          if (inClearing(x, y)) continue;
          if (cur === GRASS) { terr[y * MW + x] = WALL; blockTiles.push(y * MW + x); }
          const k = x + "," + y;
          if (standing.has(k)) continue;
          treeAt.delete(k);
          /* The verge outranks anything that claimed the tile, including the
             felled record -- Route 4's whole run past Forgewick is marked
             chopped in the shipped world data, which is why nothing would
             grow there however the terrain was laid. Trees felled anywhere
             off the verge still stay down. */
          glades.delete(k); taken.delete(k); felled.delete(k);
          const h = ((x * 374761393) ^ (y * 668265263)) >>> 0;
          const pick = Array.isArray(sp0) ? sp0[h % sp0.length] : sp0;
          let si = NAME2I[pick];
          /* Approaching the sand the ground refuses a living tree, which left
             a bare run where the oaks give out before the dead ones start.
             The avenue changes species there instead of leaving a hole. */
          if (typeof sandRefuses === "function" &&
              sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })) {
            const dead = STYLE_TREE.dying;
            if (dead) si = NAME2I[Array.isArray(dead) ? dead[h % dead.length] : dead];
          }
          if (putTree(x, y, si, { edge: true, ring: true, vertical: vert }))
            standing.add(k);
        }
    }
  }

  repairArenaTreeEdges();
  clearForgefallsCliffTrees();
  chunks.clear();
  indexDecks();
  reindex();
  refreshBuild();
}

/* Explicit arena rings run after route/biome cleanup so their trees survive. */
function repairArenaTreeEdges() {
  if (MAPID !== "world") return;
  const rings=features.filter(f=>f.kind==="arena"||f.kind==="camp");
  const vegetation=/^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/;
  const living=objs.filter(o=>!hidden.has(o.id)).concat(fobjs);
  const routes=features.filter(f=>f.kind==="route").flatMap(f=>routeLegs(f).map(([a,b])=>({a,b,gap:((f.w||5)>>1)+0.75})));
  const onEntrance=(x,y)=>routes.some(({a,b,gap})=>{
    const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(len||1)));
    return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)<=gap;
  });
  let nextId=Math.min(-1,...fobjs.map(o=>o.id).filter(Number.isFinite))-1;
  for(const a of rings) {
    const r=a.r||ARENA_R,rr=r+2.5;
    const style=a.style==="volcano"||a.style==="desert"?a.style:
      inWinter(a.x,a.y)?"winter":(a.style||MD.forest_style||"spruce");
    const choices=style==="volcano"?["deadtree0","halfdead0"]:
      style==="swamp"?STYLE_TREE.swamp_safe:STYLE_TREE[style];
    const names=Array.isArray(choices)?choices:[choices];
    const nearby=living.filter(o=>vegetation.test(NAMES[o.s]||"")&&Math.hypot(o.x/TS-a.x,(o.y-1)/TS-a.y)<r+7);
    const seen=new Set(),count=Math.ceil(2*Math.PI*rr/2);
    for(let j=0;j<count;j++) {
      const angle=j*2*Math.PI/count,x=Math.round(a.x+Math.cos(angle)*rr),y=Math.round(a.y+Math.sin(angle)*rr),key=x+","+y;
      if(seen.has(key))continue;seen.add(key);
      if(x<1||y<1||x>=MW-1||y>=MH-1||onEntrance(x,y))continue;
      if(rings.some(b=>b!==a&&Math.hypot(x-b.x,y-b.y)<(b.r||ARENA_R)+1.5))continue;
      if(rockTiles.has(key)||inClearing(x,y)||felledNew.includes(key))continue;
      const tile=terr[y*MW+x];
      if([WATER,DWATER,SEA,BRIDGE,DECK,COBBLE,PAVING2,MARBLE,TERRACE,ROADSAND].includes(tile))continue;
      if(nearby.some(o=>Math.hypot(o.x/TS-.5-x,o.y/TS-1-y)<1.7))continue;
      const nm=names[j%names.length],si=NAME2I[nm];if(si===undefined||!SPR[nm])continue;
      const o={id:nextId--,s:si,x:x*TS+TS/2,y:(y+1)*TS,feat:1,arenaEdge:a.id};
      if(sandRefuses(o))continue;
      // Restore shipped clearing marks at the border, not trees cut this session.
      felled.delete(key);
      fobjs.push(o);nearby.push(o);
      if(style!=="desert"&&style!=="volcano") {terr[y*MW+x]=WALL;blockTiles.push(y*MW+x);}
    }
  }
}

function clearForgefallsCliffTrees() {
  if (MAPID !== "world") return;
  const falls = features.find(f => f.kind === "landmark" && f.label === "Forgefalls");
  if (!falls) return;
  const cliff = objs.find(o => NAMES[o.s] === "cliff_fall" &&
    Math.abs(o.x / TS - falls.x) < 2 && Math.abs(o.y / TS - falls.y) < 2);
  const art = cliff && SPR.cliff_fall;
  if (!art) return;
  const left = cliff.x - art[2] / 2, right = cliff.x + art[2] / 2;
  const top = cliff.y - art[3];
  // Later forest/verge passes can plant inside the cliff after the belt is
  // cleared. Remove those trees last; retain the intended row at its foot.
  fobjs = fobjs.filter(o => {
    const name = NAMES[o.s] || "", sp = SPR[name];
    if (!/^(oak_|bir_|spr_|fru_|mw_|wf_pine|wf_tree)/.test(name) || !sp) return true;
    return !(o.y >= top && o.y <= cliff.y &&
      o.x + sp[2] / 2 > left && o.x - sp[2] / 2 < right);
  });
  // Keep cliff terrain and collision intact: only the stray artwork is gone.
}

const MAX_SIDE = 4000;
const MAX_AREA = 4000000;

function growWorld(needW, needH) {
  let nw = Math.max(MW, Math.min(MAX_SIDE, needW));
  let nh = Math.max(MH, Math.min(MAX_SIDE, needH));
  if (nw * nh > MAX_AREA) {
    if (nw > MW) nw = Math.max(MW, Math.floor(MAX_AREA / nh));
    if (nw * nh > MAX_AREA && nh > MH) nh = Math.max(MH, Math.floor(MAX_AREA / nw));
  }
  if (nw === MW && nh === MH) {
    if (needW > MW || needH > MH)
      toast("the world is as big as it goes: " + MW + "x" + MH +
            " (" + (MW * MH / 1e6).toFixed(1) + "M tiles)");
    return needW <= MW && needH <= MH;
  }
  const opened = [];
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const onOldRim = (x < RIM || y < RIM || x >= MW - RIM || y >= MH - RIM);
      const nowInside = (nw > MW && x >= MW - RIM) || (nh > MH && y >= MH - RIM);
      if (onOldRim && nowInside && terr[y * MW + x] === WALL) {
        terr[y * MW + x] = openTo(y * MW + x); baseTerr[y * MW + x] = GRASS;
        opened.push([x, y]);
      }
    }
  const nt = new Uint8Array(nw * nh).fill(GRASS);
  const nb = new Uint8Array(nw * nh).fill(GRASS);
  for (let y = 0; y < MH; y++) {
    nt.set(terr.subarray(y * MW, y * MW + MW), y * nw);
    nb.set(baseTerr.subarray(y * MW, y * MW + MW), y * nw);
  }
  terr = nt; baseTerr = nb;
  for (const [ox, oy] of opened) felled.add(ox + "," + oy);
  MW = nw; MH = nh; PXW = MW * TS; PXH = MH * TS;
  sealRim();
  solid = new Uint8Array(MW * MH);
  chunks.clear();
  indexDecks();
  indexScatter();
  return true;
}

function contentExtent() {
  const BUILT = [DIRT, COBBLE, PAVING2, FARM, WATER, BRIDGE];
  let rx = 0, by = 0;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++)
    if (BUILT.includes(terr[y * MW + x])) { if (x > rx) rx = x; if (y > by) by = y; }
  for (const o of objs) {
    const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
    if (tx > rx) rx = tx;
    if (ty > by) by = ty;
  }
  return [rx, by];
}

const WORK_MARGIN_X = 90, WORK_MARGIN_Y = 45;
function ensureWorkspace() {
  const [rx, by] = contentExtent();
  const wantW = Math.min(MAX_SIDE, rx + 1 + WORK_MARGIN_X);
  const wantH = Math.min(MAX_SIDE, by + 1 + WORK_MARGIN_Y);
  if (wantW <= MW && wantH <= MH) return false;
  growWorld(wantW, wantH);
  realizeFeatures();
  return true;
}

const RIM = 1;
function sealRim() {
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++)
      if (x < RIM || y < RIM || x >= MW - RIM || y >= MH - RIM) {
        const i = y * MW + x;
        if (terr[i] === GRASS) { terr[i] = WALL; baseTerr[i] = WALL; }
      }
}

const SNAP = 9;

function snapRoute(x0, y0, x1, y1) {
  const vert = x0 === x1;
  const notes = [];
  let line = vert ? x0 : y0;
  let lo = vert ? Math.min(y0, y1) : Math.min(x0, x1);
  let hi = vert ? Math.max(y0, y1) : Math.max(x0, x1);
  const startWasLo = (vert ? y0 : x0) <= (vert ? y1 : x1);

  let corner = null;
  for (const f of features) {
    if (f.kind !== "route") continue;
    for (const [ex, ey] of [[f.x0, f.y0], [f.x1, f.y1]]) {
      for (const which of ["lo", "hi"]) {
        const px = vert ? line : (which === "lo" ? lo : hi);
        const py = vert ? (which === "lo" ? lo : hi) : line;
        const d = Math.abs(px - ex) + Math.abs(py - ey);
        if (Math.abs(px - ex) <= SNAP && Math.abs(py - ey) <= SNAP &&
            (!corner || d < corner.d)) corner = { d, ex, ey, which };
      }
    }
  }
  if (corner) {
    line = vert ? corner.ex : corner.ey;
    const v = vert ? corner.ey : corner.ex;
    if (corner.which === "lo") lo = v; else hi = v;
    if (lo > hi) { const t2 = lo; lo = hi; hi = t2; }
    notes.push("cornered onto the last route");
  }

  let best = null;
  for (const f of features) {
    let c = null, label = null;
    if (isArea(f)) {
      const inRun = vert ? (lo <= f.y1 && hi >= f.y0) : (lo <= f.x1 && hi >= f.x0);
      if (inRun) { c = vert ? (f.x0 + f.x1) >> 1 : (f.y0 + f.y1) >> 1; label = "town centre"; }
    } else if ((f.x0 === f.x1) === vert) {
      c = vert ? f.x0 : f.y0; label = "route";
    }
    if (c === null) continue;
    const d = Math.abs(c - line);
    if (d && d <= SNAP && (!best || d < best.d)) best = { d, c, label };
  }
  if (best && !corner) { line = best.c; notes.push("lined up with " + best.label); }

  let tie0 = null, tie1 = null;
  for (const f of features) {
    if (!isArea(f)) continue;
    const across = vert ? (line >= f.x0 && line <= f.x1) : (line >= f.y0 && line <= f.y1);
    if (!across) continue;
    const near0 = vert ? f.y0 : f.x0, near1 = vert ? f.y1 : f.x1;
    if (Math.abs(hi - near0) <= SNAP && hi < near1) {
      hi = near0 + f.band;
      tie1 = { area: f.id, side: vert ? "n" : "w" };
      notes.push("tied to " + (f.label || "area"));
    } else if (Math.abs(lo - near1) <= SNAP && lo > near0) {
      lo = near1 - f.band;
      tie0 = { area: f.id, side: vert ? "s" : "e" };
      notes.push("tied to " + (f.label || "area"));
    }
  }

  const roadAt = (x, y) => {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
    const t = terr[y * MW + x];
    return t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === BRIDGE;
  };
  for (const end of ["lo", "hi"]) {
    const dir = end === "hi" ? 1 : -1;
    let v = end === "hi" ? hi : lo;
    for (let k = 1; k <= SNAP; k++) {
      const p = v + dir * k;
      const x = vert ? line : p, y = vert ? p : line;
      if (roadAt(x, y)) {
        if (end === "hi") hi = p; else lo = p;
        notes.push("joined the road");
        break;
      }
    }
  }

  if (corner) {
    const half = ROUTE_W >> 1;
    if (corner.which === "lo") lo -= half; else hi += half;
  }
  const c = vert ? [line, lo, line, hi] : [lo, line, hi, line];
  const swap = !startWasLo;
  return { coords: c.map(v => v - (v & 1)),
           a0: swap ? tie1 : tie0, a1: swap ? tie0 : tie1,
           note: [...new Set(notes)].join(", ") };
}

function areaAt(wx, wy) {
  const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
  let best = null;
  for (const f of features) {
    if (!isArea(f)) continue;
    if (tx < f.x0 || tx > f.x1 || ty < f.y0 || ty > f.y1) continue;
    const a = (f.x1 - f.x0) * (f.y1 - f.y0);
    if (!best || a < best.a) best = { f, a };
  }
  return best && best.f;
}

function terrRLE(a) {
  const out = [];
  let v = a[0], c = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === v) { c++; continue; }
    out.push(v + "." + c); v = a[i]; c = 1;
  }
  out.push(v + "." + c);
  return out.join("|");
}

const RUN_SPR = /^(fence_|swall_|white_|pale_|sett_|rail_|mtn_)/;

function findRuns(pts) {
  const key = (x, y) => x + "," + y;
  const at = new Map(pts.map(p => [key(p.x, p.y), p]));
  const used = new Set();
  const runs = [];
  for (const dir of [[TS, 0], [0, TS]])
    for (const p of pts) {
      if (used.has(key(p.x, p.y))) continue;
      if (at.has(key(p.x - dir[0], p.y - dir[1]))) continue;   /* not the head */
      const line = [];
      let x = p.x, y = p.y;
      while (at.has(key(x, y)) && !used.has(key(x, y))) {
        line.push(at.get(key(x, y))); x += dir[0]; y += dir[1];
      }
      if (line.length >= 3) {
        line.forEach(q => used.add(key(q.x, q.y)));
        runs.push({ dir, line });
      }
    }
  return { runs, singles: pts.filter(p => !used.has(key(p.x, p.y))) };
}

function scaleAreaContents(oldB, newB, inset) {
  const pad = (inset || 0) * TS;
  const oi = { x0: oldB.x0 + pad, y0: oldB.y0 + pad,
               x1: oldB.x1 - pad, y1: oldB.y1 - pad };
  const ni = { x0: newB.x0 + pad, y0: newB.y0 + pad,
               x1: newB.x1 - pad, y1: newB.y1 - pad };
  const sx = (ni.x1 - ni.x0) / Math.max(1, oi.x1 - oi.x0);
  const sy = (ni.y1 - ni.y0) / Math.max(1, oi.y1 - oi.y0);
  const X = (x) => Math.round((ni.x0 + (x - oi.x0) * sx) / TS) * TS;
  const Y = (y) => Math.round((ni.y0 + (y - oi.y0) * sy) / TS) * TS;
  const inside = (x, y) => x >= oldB.x0 && x <= oldB.x1 &&
                           y >= oldB.y0 && y <= oldB.y1;

  const keep = [], mine = new Map();
  for (const o of objs) {
    if (!inside(o.x, o.y)) { keep.push(o); continue; }
    if (!mine.has(o.s)) mine.set(o.s, []);
    mine.get(o.s).push(o);
  }
  for (const [sIdx, pts] of mine) {
    if (!RUN_SPR.test(NAMES[sIdx] || "")) {
      for (const o of pts) { o.x = X(o.x); o.y = Y(o.y); keep.push(o); }
      continue;
    }
    const { runs, singles } = findRuns(pts);
    for (const o of singles) { o.x = X(o.x); o.y = Y(o.y); keep.push(o); }
    for (const { dir, line } of runs) {
      const a = line[0], b = line[line.length - 1];
      const x0p = X(a.x), y0p = Y(a.y), x1p = X(b.x), y1p = Y(b.y);
      const steps = Math.max(0, Math.round(
        dir[0] ? (x1p - x0p) / TS : (y1p - y0p) / TS));
      for (let k = 0; k <= steps; k++) {
        const o = line[k] || { id: nextId++, s: sIdx };
        o.s = sIdx;
        o.x = x0p + (dir[0] ? k * TS : 0);
        o.y = y0p + (dir[1] ? k * TS : 0);
        keep.push(o);
      }
    }
  }
  objs.length = 0; for (const o of keep) objs.push(o);
  MD.objs = [];
  for (const o of objs) MD.objs.push(o.s, o.x, o.y);

  for (const p of npcs) {
    if (!inside(p.x, p.y)) continue;
    const ox = ((p.x % TS) + TS) % TS, oy = ((p.y % TS) + TS) % TS;
    p.x = X(p.x - ox) + ox;
    p.y = Y(p.y - oy) + oy;
  }
  MD.npcs = npcs.map(p => ({ ...p }));

  for (const [live, mdKey] of [[scat, "scatter"], [sanm, "sanim"]]) {
    const out = [], grp = new Map();
    for (let i = 0; i < live.length; i += 3) {
      if (!inside(live[i + 1], live[i + 2])) {
        out.push(live[i], live[i + 1], live[i + 2]); continue;
      }
      if (!grp.has(live[i])) grp.set(live[i], []);
      grp.get(live[i]).push({ x: live[i + 1], y: live[i + 2] });
    }
    for (const [sIdx, pts] of grp) {
      if (!RUN_SPR.test(NAMES[sIdx] || "")) {
        for (const p of pts) out.push(sIdx, X(p.x), Y(p.y));
        continue;
      }
      const { runs, singles } = findRuns(pts);
      for (const p of singles) out.push(sIdx, X(p.x), Y(p.y));
      for (const { dir, line } of runs) {
        const a = line[0], b = line[line.length - 1];
        const x0p = X(a.x), y0p = Y(a.y), x1p = X(b.x), y1p = Y(b.y);
        const steps = Math.max(0, Math.round(
          dir[0] ? (x1p - x0p) / TS : (y1p - y0p) / TS));
        for (let k = 0; k <= steps; k++)
          out.push(sIdx, x0p + (dir[0] ? k * TS : 0), y0p + (dir[1] ? k * TS : 0));
      }
    }
    live.length = 0; for (const v of out) live.push(v);
    MD[mdKey] = live.slice();
  }

  const tb = { x0: Math.floor(oldB.x0 / TS), y0: Math.floor(oldB.y0 / TS),
               x1: Math.floor(oldB.x1 / TS), y1: Math.floor(oldB.y1 / TS) };
  const nb = { x0: Math.floor(newB.x0 / TS), y0: Math.floor(newB.y0 / TS),
               x1: Math.floor(newB.x1 / TS), y1: Math.floor(newB.y1 / TS) };
  const src = Uint8Array.from(baseTerr);
  const ow = tb.x1 - tb.x0, oh = tb.y1 - tb.y0;
  const nw2 = nb.x1 - nb.x0, nh2 = nb.y1 - nb.y0;
  const outsideVal = src[Math.min(MH - 1, tb.y1 + 2) * MW +
                         Math.min(MW - 1, tb.x1 + 2)];
  for (let ty = Math.min(tb.y0, nb.y0); ty <= Math.max(tb.y1, nb.y1); ty++)
    for (let tx = Math.min(tb.x0, nb.x0); tx <= Math.max(tb.x1, nb.x1); tx++) {
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
      if (tx >= nb.x0 && tx <= nb.x1 && ty >= nb.y0 && ty <= nb.y1) {
        const sxp = tb.x0 + Math.round((tx - nb.x0) * ow / Math.max(1, nw2));
        const syp = tb.y0 + Math.round((ty - nb.y0) * oh / Math.max(1, nh2));
        baseTerr[ty * MW + tx] =
          src[Math.min(MH - 1, Math.max(0, syp)) * MW +
              Math.min(MW - 1, Math.max(0, sxp))];
      } else {
        baseTerr[ty * MW + tx] = outsideVal;   /* a shrink gives ground back */
      }
    }
  MD.base_terr = terrRLE(baseTerr);
}

function relayNorthRidge(oldB, newB) {
  const rows = new Map();
  const keep = [];
  for (let i = 0; i < scat.length; i += 3) {
    const nm = NAMES[scat[i]] || "";
    const near = scat[i + 1] >= oldB.x0 - 6 * TS && scat[i + 1] <= oldB.x1 + 6 * TS &&
                 scat[i + 2] <= oldB.y0 && scat[i + 2] >= oldB.y0 - 14 * TS;
    if (!/^mtn_/.test(nm) || !near) {
      keep.push(scat[i], scat[i + 1], scat[i + 2]); continue;
    }
    if (!rows.has(scat[i + 2])) rows.set(scat[i + 2], []);
    rows.get(scat[i + 2]).push([scat[i], scat[i + 1]]);
  }
  if (!rows.size) return 0;
  scat.length = 0; for (const v of keep) scat.push(v);

  const dx0 = newB.x0 - oldB.x0, dx1 = newB.x1 - oldB.x1;
  const dy = newB.y0 - oldB.y0;
  let laid = 0;
  for (const [y, tiles] of rows) {
    tiles.sort((a, b) => a[1] - b[1]);
    const left = tiles[0], right = tiles[tiles.length - 1];
    const tally = new Map();
    for (const [sIdx] of tiles) tally.set(sIdx, (tally.get(sIdx) || 0) + 1);
    const mid = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const nx0 = left[1] + dx0, nx1 = right[1] + dx1, ny = y + dy;
    if (nx1 < nx0) continue;                 /* squeezed out of existence */
    scat.push(left[0], nx0, ny);
    for (let x = nx0 + TS; x < nx1 - 1; x += TS) scat.push(mid, x, ny);
    if (nx1 > nx0) scat.push(right[0], nx1, ny);
    laid += Math.round((nx1 - nx0) / TS) + 1;
  }
  MD.scatter = scat.slice();
  return laid;
}

function resizeArea(by) {
  if (!pickedArea) { toast("tap an area first"); return; }
  const f = pickedArea;
  const w = f.x1 - f.x0 + 1, h = f.y1 - f.y0 + 1;
  const nw = Math.max(TOWN_MIN, w + by * 2), nh = Math.max(TOWN_MIN, h + by * 2);
  if (nw === w && nh === h) { toast("that is as small as an area goes"); return; }
  const gw = nw - w, gh = nh - h;
  const x0 = f.x0 - (gw >> 1), y0 = f.y0 - (gh >> 1);
  const x1 = x0 + nw - 1, y1 = y0 + nh - 1;
  if (x0 < 2 || y0 < 2) { toast("that would go off the north or west edge"); return; }
  for (const o of features) {
    if (o === f || !isArea(o) || o.wild || f.wild) continue;
    if (x1 >= o.x0 - 2 && x0 <= o.x1 + 2 && y1 >= o.y0 - 2 && y0 <= o.y1 + 2) {
      toast("that would land on " + (o.label || "another area")); return;
    }
  }
  if (!growWorld(x1 + 3, y1 + 3)) return;
  buildUndo.push({ kind: "resize", id: f.id,
                   was: { x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1 },
                   objs: objs.map(o => ({ ...o })),
                   scatter: scat.slice(), sanim: sanm.slice(),
                   base_terr: MD.base_terr });
  const oldB = { x0: f.x0 * TS, y0: f.y0 * TS,
                 x1: (f.x1 + 1) * TS, y1: (f.y1 + 1) * TS };
  const newB = { x0: x0 * TS, y0: y0 * TS,
                 x1: (x1 + 1) * TS, y1: (y1 + 1) * TS };
  scaleAreaContents(oldB, newB, f.band || 0);
  const ridge = relayNorthRidge(oldB, newB);
  f.x0 = x0; f.y0 = y0; f.x1 = x1; f.y1 = y1;
  realizeFeatures(); rebuildBuckets(); rebuildSolid(); refreshBuild();
  toast((f.label || "area") + " is now " + nw + " by " + nh +
        (ridge ? ", ridge re-laid" : ""));
}

function fitArea() {
  if (!pickedArea) { toast("tap an area first"); return; }
  const f = pickedArea;
  let x0 = f.x1, y0 = f.y1, x1 = f.x0, y1 = f.y0, found = false;
  for (let y = f.y0; y <= f.y1; y++)
    for (let x = f.x0; x <= f.x1; x++) {
      const t = terr[y * MW + x];
      if (t !== DIRT && t !== COBBLE && t !== PAVING2) continue;
      found = true;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  if (!found) { toast("no roads inside it to fit to"); return; }
  const b = (f.band || TOWN_BAND) + 2;
  x0 -= b; y0 -= b; x1 += b; y1 += b;
  const nw = Math.max(TOWN_MIN, x1 - x0 + 1), nh = Math.max(TOWN_MIN, y1 - y0 + 1);
  x1 = x0 + nw - 1; y1 = y0 + nh - 1;
  if (x0 < 2 || y0 < 2) { toast("that would go off the north or west edge"); return; }
  buildUndo.push({ kind: "resize", id: f.id,
                   was: { x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1 } });
  f.x0 = x0; f.y0 = y0; f.x1 = x1; f.y1 = y1;
  realizeFeatures(); rebuildBuckets(); rebuildSolid(); refreshBuild();
  toast((f.label || "area") + " pulled in to " + nw + " by " + nh);
}

function moveArea(f, dx, dy, silent) {
  dx -= dx & 1; dy -= dy & 1;                 /* stay on the 2-tile grid */
  if (!dx && !dy) return;
  const nx0 = f.x0 + dx, ny0 = f.y0 + dy, nx1 = f.x1 + dx, ny1 = f.y1 + dy;
  if (!silent && (nx0 < 2 || ny0 < 2)) {
    toast("can't move an area off the north or west edge"); return;
  }
  if (nx0 < 0 || ny0 < 0) return;
  for (const o of features) {
    if (o === f || !isArea(o)) continue;
    if (o.wild || f.wild) continue;
    if (nx1 >= o.x0 - 2 && nx0 <= o.x1 + 2 && ny1 >= o.y0 - 2 && ny0 <= o.y1 + 2) {
      if (!silent) toast("that would land on " + (o.label || "another area"));
      return;
    }
  }
  if (!growWorld(nx1 + 3, ny1 + 3)) return;

  if (f.carve === false) {
    const lift = [];
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++) {
        lift.push(baseTerr[y * MW + x]);
        baseTerr[y * MW + x] = GRASS;
      }
    let i = 0;
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < MW && ny < MH)
          baseTerr[ny * MW + nx] = lift[i];
        i++;
      }
  }

  const px = dx * TS, py = dy * TS;
  const within = (wx, wy) => {
    const tx = Math.floor(wx / TS), ty = Math.floor((wy - 1) / TS);
    return tx >= f.x0 && tx <= f.x1 && ty >= f.y0 && ty <= f.y1;
  };
  let carried = 0;
  for (const o of objs)
    if (within(o.x, o.y)) {
      o.x += px; o.y += py; carried++;
      if (o.id < ORIG.length) { ORIG[o.id].x += px; ORIG[o.id].y += py; }
    }
  for (const n of npcs)
    if (within(n.x, n.y)) { n.x += px; n.y += py; carried++; }
  for (const arr of [scat, sanm])
    for (let i = 0; i < arr.length; i += 3)
      if (within(arr[i + 1], arr[i + 2])) {
        arr[i + 1] += px; arr[i + 2] += py; carried++;
      }
  for (const d of decks)
    if (d.x0 >= f.x0 && d.x1 <= f.x1 && d.y0 >= f.y0 && d.y1 <= f.y1) {
      d.x0 += dx; d.x1 += dx; d.y0 += dy; d.y1 += dy; carried++;
    }
  indexScatter();
  f.x0 = nx0; f.y0 = ny0; f.x1 = nx1; f.y1 = ny1;
  if (!silent) buildUndo.push({ kind: "move", id: f.id, dx, dy });
  realizeFeatures();
  const tied = features.filter(r => r.kind === "route" &&
    ((r.a0 && r.a0.area === f.id) || (r.a1 && r.a1.area === f.id))).length;
  toast((f.label || "area") + " moved" + (carried ? ", " + carried + " things with it" : "") +
        (tied ? ", " + tied + " road" + (tied === 1 ? "" : "s") + " followed" : ""));
}

