function drawHeartsLegacy() {
  if (saintT > 0) {
    const ending = saintT < 3;
    const puls = (Math.sin(saintT * (ending ? 16 : 6)) + 1) / 2;
    ctx.save();
    ctx.shadowColor = ending ? "#ffd070" : "#fff0b4";
    ctx.shadowBlur = (ending ? 10 : 14) + puls * (ending ? 14 : 10);
    ctx.translate(0, Math.sin(saintT * (ending ? 12 : 4)) * (ending ? 1.4 : 0.8));
  }
  const full = SPR["ui_heart"], empty = SPR["ui_heart_off"];
  if (!full) return;
  const HZ = 2;
  const step = full[2] * HZ + 3;
  const FACE = corinKit() + "idle_d";
  const fw = 34, fh = 34;                 /* the portrait badge */
  const pad = 5;
  const barX = 8, barY = hudTopInset();
  const rowW = pMax * step - 3;
  const wornList = ["flame", "twin", "brand", "spore", "ward", "edge"].filter(k => worn[k]);
  const CZ = 18, cGap = 3;
  const chW = wornList.length ? (6 + wornList.length * (CZ + cGap) - cGap) : 0;
  const boxW = pad + fw + 6 + rowW + chW + pad;
  const boxH = Math.max(fh, full[3] * HZ) + pad * 2;
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.fillStyle = "#0b0e15";
  const r = 6, x = barX, y = barY, w = boxW, hgt = boxH;
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + hgt - r);
  ctx.quadraticCurveTo(x + w, y + hgt, x + w - r, y + hgt); ctx.lineTo(x + r, y + hgt);
  ctx.quadraticCurveTo(x, y + hgt, x, y + hgt - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
  ctx.globalAlpha = 0.85; ctx.strokeStyle = "#5a6377"; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  const f2 = SPR[FACE];
  /* Portrait artwork is decorative. Some costume sheets intentionally omit
     an idle portrait crop, so never let that suppress the health HUD. */
  if (f2) {
    const src = atlasImg;
    ctx.save();
    ctx.beginPath();
    ctx.arc(barX + pad + fw / 2, barY + pad + fh / 2, fw / 2, 0, Math.PI * 2);
    ctx.clip();
    const cx = 24, cw = 16;
    const cy = 18, ch = 16;
    const k = Math.max(fw / cw, fh / ch);
    const dw = Math.round(cw * k), dh = Math.round(ch * k);
    drawGameImage(ctx, src, f2[0] + cx, f2[1] + cy, cw, ch,
                  barX + pad + (fw - dw) / 2, barY + pad + (fh - dh) / 2, dw, dh);
    ctx.restore();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = "#8a93a8";
    ctx.beginPath();
    ctx.arc(barX + pad + fw / 2, barY + pad + fh / 2, fw / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const x0 = barX + pad + fw + 6, y0 = barY + (boxH - full[3] * HZ) / 2;
  if (saintT > 0) {
    const ending = saintT < 3;      /* the last three seconds run hot */
    const puls = (Math.sin(saintT * (ending ? 16 : 6)) + 1) / 2;
    const hw = full[2] * HZ, hh = full[3] * HZ;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < pMax; i++) {
      const cx3 = x0 + i * step + hw / 2, cy3 = y0 + hh / 2;
      const lag = (Math.sin(saintT * (ending ? 14 : 5) - i * 0.7) + 1) / 2;
      const R = hw * (1.5 + 0.5 * lag);
      const g = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, R);
      const a = (ending ? 0.5 : 0.38) + lag * 0.42;
      g.addColorStop(0, "rgba(255,246,214," + a.toFixed(3) + ")");
      g.addColorStop(0.35, "rgba(255," + (ending ? 206 : 226) + ",120," + (a * 0.6).toFixed(3) + ")");
      g.addColorStop(1, "rgba(255,190,80,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx3, cy3, R, 0, 6.283); ctx.fill();
    }
    const bg = ctx.createLinearGradient(x0 - 8, 0, x0 + rowW + 8, 0);
    const ba = (0.16 + puls * 0.2) * (ending ? 1.3 : 1);
    bg.addColorStop(0, "rgba(255,220,120,0)");
    bg.addColorStop(0.5, "rgba(255,244,200," + ba.toFixed(3) + ")");
    bg.addColorStop(1, "rgba(255,220,120,0)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(x0 + rowW / 2, y0 + hh / 2, rowW * 0.62, hh * 1.1, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(255,250,224,0.95)";
    for (let k = 0; k < 8; k++) {
      const ph = (saintT * 0.85 + k * 0.23) % 1;
      ctx.globalAlpha = (1 - ph) * 0.9;
      const sx = x0 + ((k * 0.17 + saintT * 0.09) % 1) * rowW;
      const sz = 2.2 * (1 - ph * 0.5);
      ctx.fillRect(sx, (y0 + hh * 0.5) - ph * 26, sz, sz);
    }
    ctx.restore();
  }
  for (let i = 0; i < pMax; i++) {
    const s2 = i < pHp ? full : (empty || full);
    if (s2 === full || i < pHp) ctx.globalAlpha = 1; else ctx.globalAlpha = 0.9;
    drawGameImage(ctx, atlasImg, s2[0], s2[1], s2[2], s2[3],
                  x0 + i * step, y0, s2[2] * HZ, s2[3] * HZ);
  }
  ctx.globalAlpha = 1;
  if (wornList.length) {
    let cx2 = x0 + rowW + 6;
    const cy2 = barY + (boxH - CZ) / 2;
    for (const k of wornList) {
      const nm = (SPR[CHARM_ART[k]] && CHARM_ART[k]) || CHARM_ICON[k];
      const sp = SPR[nm];
      if (sp) {
        const img = sp[5] === 2 ? smImg : sp[5] ? dragonImg : atlasImg;
        const kk = Math.min(CZ / sp[2], CZ / sp[3]);
        const dw = Math.round(sp[2] * kk), dh = Math.round(sp[3] * kk);
        drawGameImage(ctx, img, sp[0], sp[1], sp[2], sp[3],
                      cx2 + (CZ - dw) / 2, cy2 + (CZ - dh) / 2, dw, dh);
      }
      cx2 += CZ + cGap;
    }
  }
  if (saintT > 0) ctx.restore();
  if (hasDragon()) drawDragonVitals(barX, barY + boxH + 4, Math.max(190, Math.min(270, boxW)));
}

/* One compact party panel: the same portrait-and-meter language for Corin
   and the dragon, sized to stay out of the way on an iPhone. */
function drawPartyPortrait(sp, img, x, y, size, stroke, focus) {
  if (!sp) return;
  ctx.save(); ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
  const crop = focus === "corin" ? 16 : focus === "dragon" ? 24
    : Math.max(1, Math.floor(Math.min(sp[2], sp[3]) * .52));
  const sx = focus === "corin" ? sp[0] + 24 : focus === "dragon" ? sp[0] + 31
    : sp[0] + Math.floor((sp[2] - crop) / 2);
  /* The south pose stores the tail high in its cell; the eyes are lower. */
  const sy = focus === "corin" ? sp[1] + 18 : focus === "dragon" ? sp[1] + 38 : sp[1];
  drawGameImage(ctx, img, sx, sy, crop, crop, x, y, size, size);
  ctx.restore(); ctx.strokeStyle = stroke; ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2 - .5, 0, Math.PI * 2); ctx.stroke();
}
function drawHudHeart(x, y, px, color, alpha) {
  const rows = [[2,3,5,6],[1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7],[1,2,3,4,5,6],[2,3,4,5],[3,4]];
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  rows.forEach((cols, yy) => cols.forEach(xx => ctx.fillRect(x + xx * px, y + yy * px, px, px)));
  ctx.restore();
}
function drawHearts() {
  syncDragonVitality(false);
  const x = 8, y = hudTopInset(), step = 18;
  const w = Math.min(156, VW - 16), h = hasDragon() ? 54 : 28;
  const heartX = x + 35, portrait = 23;
  ctx.save(); ctx.globalAlpha = .68; ctx.fillStyle = "#0b0e15"; ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1; ctx.strokeStyle = saintT > 0 ? "#f0bd63" : "#65758c"; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  const drawRow = (hp, max, sp, img, ry, colour, focus) => {
    drawPartyPortrait(sp, img, x + 5, ry + 2, portrait, colour, focus);
    const slots = 6, on = Math.max(0, Math.min(slots, (max ? hp / max : 0) * slots));
    for (let i = 0; i < slots; i++) {
      const hx=heartX+i*step,hy=ry+8,fill=Math.max(0,Math.min(1,on-i));
      drawHudHeart(hx,hy,2,colour,.25);
      if(fill>0){ctx.save();ctx.beginPath();ctx.rect(hx,hy,16*fill,14);ctx.clip();
        drawHudHeart(hx,hy,2,colour,1);ctx.restore();}
    }
  };
  drawRow(pHp, pMax, SPR[corinKit() + "idle_d"], atlasImg, y + 1, "#4d83c9", "corin");
  if (hasDragon()) {
    const face = SPR.dr5_pose_south || SPR.dr5_idle_s;
    drawRow(dragon.hp, dragon.maxHp, face, face ? sheetOf(face) : dragonImg,
      y + 27, dragon.down ? "#a84a4e" : "#d44742", "dragon");
  }
  if (saintT > 0) {
    const pulse = .50 + .50 * (Math.sin((16 - saintT) * 8) + 1) / 2;
    ctx.globalAlpha = pulse; ctx.strokeStyle = "#ffe39a"; ctx.lineWidth = 2;
    ctx.strokeRect(heartX - 3, y + 8, step * 6 - 1, 14);
  }
  ctx.restore();
}
let foesHeld = false;
function stepCombat(dt) {
  stepTempleGates(dt);
  stepFly(dt); // Cosmetic pickups keep moving even with foes disabled.
  if (pInv > 0) pInv -= dt;
  stepKingShield(dt);
  if (bossScene) { stepRise(dt); stepBossScene(dt); return; }
  if (foesHeld) return;
  swingHits();
  stepFoes(dt);
  stepSpell(dt);
  stepHeal(dt);
  stepRise(dt);
  stepDust(dt);
  stepGraves(dt);
  stepFall(dt);
  stepGrief(dt);
  stepLichTransition(dt);
  lastFightHold();
  stepBlooms(dt);
  stepLoot(dt);
  stepBell(dt);
  stepArenas(dt);
  if (saintT > 0) { saintT -= dt; if (saintT <= 0) toast("the breath goes out of him"); }
  markSafe();
}

const ACT = {
  swing: { frames: 8, fps: 16, anim: "atk" },
  hurt:  { frames: 5, fps: 14, anim: "hurt" },
  fall:  { frames: 7, fps: 6, anim: "die" },
  die:   { frames: 7, fps: 9, anim: "die", hold: true, then: showDeath },
};
function startAct(kind) {
  if (P.act || fadeDir !== 0) return;
  if (kind === "swing" && worn.brand) {
    brandCount++;
    brandHot = (brandCount % 3 === 0);
  } else if (kind === "swing") brandHot = false;
  P.act = { kind, t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4(), hot: brandHot };
}
function stepAct(dt) {
  const a = P.act;
  if (!a) return;
  const spec = ACT[a.kind];
  a.t += dt * spec.fps;
  if (a.t >= spec.frames) {
    if (spec.hold) {
      a.t = spec.frames - 0.01;
      if (spec.then && !a.done) { a.done = 1; spec.then(); }
    } else P.act = null;
  }
}

const FACE_OF = {};
const FACE_CELL = 80, FACE_COLS = 8, FACE_ROWS = 5, FACE_SHOW = 124;
const NO_FACE = new Set(["Bolete", "Cap", "Chanter", "Fungo", "Gill", "Morel", "Mott", "Mycella", "Nib", "Pip", "Russ", "Spore", "Truffle", "Velva"]);
const FACE_COUNT = 0;  /* portraits 0..88 are drawn; 89..95 are empty slots */
function faceFor(who) {
  if (!who) return -1;
  if (NO_FACE.has(who)) return -1;      /* the mushroom folk have no portrait */
  if (FACE_OF[who] !== undefined) return FACE_OF[who];
  for (const k in FACE_OF) if (who.includes(k) || k.includes(who)) return FACE_OF[k];
  return -1;
}
const sayEl = document.getElementById("say");
const faceEl = document.getElementById("face");
const nameEl = document.getElementById("sayname");
faceEl.style.backgroundImage = 'url("' + FACE_SRC + '")';
let shownFace = -1;
function sayOn() { sayEl.classList.add("on"); sayEl.style.display = ""; }
function sayOff() {
  sayEl.classList.remove("on"); sayEl.style.display = "";
  nameEl.className = "";
}
function showFace(who) {
  const i = faceFor(who);
  shownFace = i;
  const el = document.getElementById("face") || faceEl;
  if (i < 0) { el.style.display = "none"; return; }
  if (!el.style.backgroundImage || el.style.backgroundImage === "none")
    el.style.backgroundImage = 'url("' + FACE_SRC + '")';
  const faceSide = /Corin/.test(who) ? "right" : "left";
  const k = FACE_SHOW / FACE_CELL;   /* drawn bigger than it is stored */
  el.style.backgroundPosition =
    `-${(i % FACE_COLS) * FACE_CELL * k}px -${Math.floor(i / FACE_COLS) * FACE_CELL * k}px`;
  el.style.backgroundSize = (FACE_COLS * FACE_SHOW) + "px "
                          + (FACE_ROWS * FACE_SHOW) + "px";
  el.className = faceSide;
  el.style.display = "block";
}
let sayNpc = null, sayLine = 0;
function whoSays(npc, line) {
  const colon = line.indexOf(": ");
  if (colon > 0 && colon < 22) return [line.slice(0, colon), line.slice(colon + 2)];
  return [npc.n, line];
}

let ride = null;
function ferryOf() { return MD.ferry || null; }
function ferryBoatObj() {
  const f = ferryOf(); if (!f) return null;
  const nm = NAME2I[f.boat];
  let best = null, bd = 9e9;
  for (const o of objs) {
    if (o.s !== nm) continue;
    for (const p of [f.a, f.b]) {
      const d = Math.abs(o.x / TS - p[0]) + Math.abs(o.y / TS - p[1]);
      if (d < bd && d < 8) { bd = d; best = o; }
    }
  }
  return best;
}
const FERRY_HOP = 0.45;
function ferryTry() {
  const f = ferryOf(); if (!f || ride) return false;
  const px = P.x / TS, py = (P.y - 1) / TS;
  const onPlank = terr[Math.floor(py) * MW + Math.floor(px)] === DECK;
  const near = (p) => Math.abs(px - p[0]) <= (onPlank ? 9 : 2.5) &&
                      Math.abs(py - p[1]) <= (onPlank ? 9 : 2.5);
  let from = null;
  if (near(f.land_a)) from = "a"; else if (near(f.land_b)) from = "b";
  if (!from) return false;
  const pts = f.pts.map(p => [p[0] * TS + TS / 2, p[1] * TS + TS]);
  const route = from === "a" ? pts : pts.slice().reverse();
  const d0 = Math.atan2(route[1][1] - route[0][1], route[1][0] - route[0][0]) + Math.PI / 2;
  ride = { pts: route, i: 0, t: 0,
           to: from === "a" ? f.land_b : f.land_a, flip: false,
           ang: 0, ang0: 0, angT: d0, turn: 0, turnFor: 0,
           board: FERRY_HOP, land: 0, from: [P.x, P.y] };
  let d = d0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  ride.angT = d;
  ride.turnFor = Math.min(1.6, Math.abs(d) / Math.PI * 1.6);   /* a half turn takes 1.6s */
  ride.turn = ride.turnFor;
  const b = ferryBoatObj();
  if (b) { hidden.add(b.id); rebuildBuckets(); }   /* buckets filter hidden AT BUILD */
  toast("you push off");
  return true;
}
const FERRY_SEAT = 14;
function ferrySeatAt(a) {
  const s = SPR[ferryOf().boat];
  return (a[1] - s[3] / 2) + FERRY_SEAT;
}
function ferrySeat() {
  const s = SPR[ferryOf().boat];
  return (ride.y - s[3] / 2) + FERRY_SEAT;
}
function stepFerry(dt) {
  if (!ride) return;
  P.moving = false;
  P.flip = false;
  P.dir = (ride.pts[ride.pts.length - 1][1] < ride.pts[0][1]) ? "u" : "d";
  if (ride.turn > 0) {                    /* she comes about first, while you watch */
    ride.turn -= dt;
    const k = ride.turnFor ? 1 - Math.max(0, ride.turn) / ride.turnFor : 1;
    const e = k * k * (3 - 2 * k);        /* ease, so she swings rather than snaps */
    ride.ang = ride.ang0 + (ride.angT - ride.ang0) * e;
    const a0 = ride.pts[0];
    ride.x = a0[0]; ride.y = a0[1];
    P.x = ride.from[0]; P.y = ride.from[1];   /* you are still on the boards */
    return;
  }
  if (ride.board > 0) {                   /* stepping down into the boat */
    ride.board -= dt;
    const k = 1 - Math.max(0, ride.board) / FERRY_HOP;
    const a = ride.pts[0];
    P.x = ride.from[0] + (a[0] - ride.from[0]) * k;
    P.y = ride.from[1] + (ferrySeatAt(a) - ride.from[1]) * k - Math.sin(k * Math.PI) * 7;
    ride.x = a[0]; ride.y = a[1];
    return;
  }
  if (ride.land > 0) {                    /* and back out at the far end */
    ride.land -= dt;
    const k = 1 - Math.max(0, ride.land) / FERRY_HOP;
    const a = ride.pts[ride.pts.length - 1];
    const tx = ride.to[0] * TS + TS / 2, ty = ride.to[1] * TS + TS;
    P.x = a[0] + (tx - a[0]) * k;
    P.y = ferrySeatAt(a) + (ty - ferrySeatAt(a)) * k - Math.sin(k * Math.PI) * 7;
    if (ride.land <= 0) { P.x = tx; P.y = ty; ride = null; toast("you step ashore"); }
    return;
  }
  const SPEED = 80;                       /* pixels a second -- an unhurried drift */
  let move = SPEED * dt;
  while (move > 0 && ride.i < ride.pts.length - 1) {
    const a = ride.pts[ride.i], b = ride.pts[ride.i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const rem = len * (1 - ride.t);
    if (move < rem) { ride.t += move / len; move = 0; }
    else { move -= rem; ride.i++; ride.t = 0; }
    ride.ang = Math.atan2(dy, dx) + Math.PI / 2;
  }
  const a = ride.pts[Math.min(ride.i, ride.pts.length - 1)];
  const b = ride.pts[Math.min(ride.i + 1, ride.pts.length - 1)];
  ride.x = a[0] + (b[0] - a[0]) * ride.t;
  ride.y = a[1] + (b[1] - a[1]) * ride.t;
  P.x = ride.x; P.y = ferrySeat();
  if (ride.i >= ride.pts.length - 1) {
    ride.land = FERRY_HOP;                /* hop out rather than cut */
    const bo = ferryBoatObj();
    if (bo) {
      bo.x = ride.pts[ride.pts.length - 1][0];
      bo.y = ride.pts[ride.pts.length - 1][1];
      hidden.delete(bo.id);
      rebuildBuckets();
    }
  }
}
function drawFerry(g) {
  if (!ride) return;
  const f = ferryOf(); const s = SPR[f.boat]; if (!s) return;
  const fr = Math.floor(performance.now() / 140) % s[4];
  g.save();
  g.translate(ride.x, ride.y - s[3] / 2);
  g.rotate(ride.ang);
  drawGameImage(g, atlasImg, s[0] + fr * s[2], s[1], s[2], s[3],
              -s[2] / 2, -s[3] / 2, s[2], s[3]);
  g.restore();
}
function npcContextDialogue(n, alt) {
  if(brambleQuest===1 && n.n!=="Rowan the Hunter" && !n.pettable &&
     (MAPID==="tavern" || (MD.title||"").startsWith("Thornwell") ||
      (MAPID==="world"&&n.x>=220*TS&&n.x<=320*TS&&n.y>=44*TS&&n.y<=150*TS)))
    return BRAMBLE_HINTS[n.n] || n.d;

  // Victory must outrank merchant repeats and every old fear-of-Halvard line.
  if (wonAll) return (alt && n.dv2) || n.dv || n.d;
  if (hasDragon()) {
    const visible = MAPID === "world" && dragonHere() && dragon.on &&
      (mounted || Math.hypot(n.x - dragon.x, n.y - dragon.y) < 160);
    if (visible) return (alt && n.dd2) || n.dd || n.dragonNear || n.d;
    return (alt && n.dragonRumor2) || n.dragonRumor || n.d;
  }
  if (alt && n.d2) return n.d2;
  return (hasSword() && n.dm) || n.d;
}

function finishSmithUpgrade() {
  const whetstone = () => {
    if (charm.edge) return;
    playScene(["Dunstan: You'll need this too."], { who: "Dunstan", after: () => {
      if (charm.edge) return;
      charm.edge = true;
      showReveal(SPR.it_edge ? "it_edge" : CHARM_ICON.edge,
        "Corin obtained Dunstan's Whetstone!", 5, true);
    } });
  };
  if (!smithUpgrade) {
    smithUpgrade = true;
    showReveal("corin_armor_idle_d", "Corin received an upgraded sword and armor!", 5, true, whetstone);
  } else whetstone();
}
let glassHatchStarted = -1;
function glassHatchFrame() { return glassHatchStarted < 0 ? 0 : Math.min(3, Math.floor((performance.now() / 1000 - glassHatchStarted) / 0.15)); }
function drawHettieCallout(n,sp) {
  const bob=Math.sin(tAcc*4)*1.5, x=Math.round(n.x-18),y=Math.round(n.y-sp[3]-21+bob);
  ctx.save();ctx.fillStyle="#493529";ctx.fillRect(x+2,y+2,36,17);
  ctx.fillStyle="#fff1d1";ctx.strokeStyle="#493529";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+32,y);ctx.quadraticCurveTo(x+36,y,x+36,y+4);
  ctx.lineTo(x+36,y+12);ctx.quadraticCurveTo(x+36,y+16,x+32,y+16);
  ctx.lineTo(n.x+4,y+16);ctx.lineTo(n.x,y+21);ctx.lineTo(n.x-3,y+16);
  ctx.lineTo(x+4,y+16);ctx.quadraticCurveTo(x,y+16,x,y+12);ctx.lineTo(x,y+4);ctx.quadraticCurveTo(x,y,x+4,y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#34251b";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("hey!",n.x,y+8);
  if(Math.sin(tAcc*3)>0.55){ctx.strokeStyle="#f4ce76";ctx.beginPath();ctx.moveTo(x-5,y+2);ctx.lineTo(x-8,y);ctx.moveTo(x+41,y+2);ctx.lineTo(x+44,y);ctx.stroke();}
  ctx.restore();
}

let thornwellMet=false, thornwellArrival=null, thornwellReturn=null;
let brambleQuest=0, brambleMap="", brambleTrail=[], brambleDeparture=null;
function welcomePath() {
  // Local, collision-checked staging along an approach into town.
  const start=[Math.round(P.x/8)*8+24,Math.round(P.y/8)*8];
  if(!canStand(...start))return null;
  const stagingDistance=Math.max(80,Math.min(200,VW/cam.z/2+30));
  const q=[{p:start,path:[start]}],seen=new Set([start.join(',')]);let best=null;
  for(let i=0;i<q.length&&i<3000;i++){
    const cur=q[i],dist=Math.hypot(cur.p[0]-P.x,cur.p[1]-P.y);
    if(dist>=stagingDistance&&cur.path.length>=8){best=cur.path;break;}
    for(const [dx,dy] of [[8,0],[0,8],[0,-8],[-8,0]]){
      const p=[cur.p[0]+dx,cur.p[1]+dy],k=p.join(',');
      if(seen.has(k)||Math.hypot(p[0]-P.x,p[1]-P.y)>stagingDistance+48||!canStand(...p))continue;
      seen.add(k);q.push({p,path:cur.path.concat([p])});
    }
  }
  return best&&best.reverse();
}
function brambleActor(name) {
  const src=W.maps.world.npcs.find(n=>n.n===name);
  return {...src,id:"bramble-"+name,t:0,brambleCompanion:true,goto:null};
}
function syncBrambleParty() {
  if(brambleMap===MAPID)return;
  if(brambleQuest===2){brambleQuest=3;brambleDeparture=null;}
  brambleMap=MAPID;brambleTrail=[];
  npcs=npcs.filter(n=>n.n!=="Rowan the Hunter" && !n.pettable);
  if(brambleQuest===0||brambleQuest===3){
    if(MAPID==="world"){
      const dog=brambleActor("Bramble");npcs.push(dog);
      if(brambleQuest===3)npcs.push(brambleActor("Rowan the Hunter"));
    }
  }else if(brambleQuest===1){
    const dog=brambleActor("Bramble");dog.x=P.x;dog.y=P.y;npcs.push(dog);
  }
  if(MAPID==="tavern"&&brambleQuest<2){const hunter=brambleActor("Rowan the Hunter");hunter.x=240;hunter.y=220;npcs.push(hunter);}
}
function bramblePath(from,to) {
  const snap=p=>p.map(v=>Math.round(v/8)*8),a=snap(from),b=snap(to),q=[a],seen=new Map([[a.join(','),null]]);
  let end=null;
  for(let i=0;i<q.length&&i<12000;i++){
    const p=q[i];if(Math.hypot(p[0]-b[0],p[1]-b[1])<9){end=p;break;}
    for(const [dx,dy]of [[8,0],[0,8],[-8,0],[0,-8]]){
      const v=[p[0]+dx,p[1]+dy],key=v.join(',');
      if(seen.has(key)||Math.hypot(v[0]-a[0],v[1]-a[1])>480||!canStand(...v))continue;
      seen.set(key,p);q.push(v);
    }
  }
  if(!end)return null;const path=[];for(let p=end;p;p=seen.get(p.join(',')))path.push(p);return path.reverse();
}
function moveBrambleActor(n,path,speed,dt) {
  if(!path?.length)return;
  const [x,y]=path[0],d=Math.hypot(x-n.x,y-n.y),step=Math.min(d,speed*dt);faceToward(n,x,y);
  if(d){n.x+=(x-n.x)/d*step;n.y+=(y-n.y)/d*step;}if(d<=step+.01)path.shift();
}
function tryBrambleReunion(n) {
  if(n.n!=="Rowan the Hunter"||MAPID!=="tavern"||brambleQuest!==1)return false;
  const dog=npcs.find(n=>n.pettable);
  playScene(["Rowan: Bramble! There you are. Thank you for bringing him back.","Corin: He found me on the road. Friendly little fellow.","Rowan: I am Rowan. I hear you have a dragon travelling with you.",
    smithUpgrade?"Rowan: I see Dunstan has already worked on your blade. You chose well.":"Rowan: Take that sword to Dunstan, the blacksmith in Forgewick. He will give you a stronger blade for the road ahead.",
    "Rowan: We should head home. Come find us outside the house any time—Bramble's company is good for the spirits."],{bramble:true,after:()=>{
      brambleQuest=2;
      const exit=MD.doors.find(d=>d.to==="world"),target=[exit.x*TS+8,exit.y*TS-8];
      brambleDeparture=[n,dog].filter(Boolean).map((actor,i)=>({actor,path:bramblePath([actor.x,actor.y],[target[0]+i*8,target[1]])}));
      brambleTrail=[];
    }});return true;
}
function stepThornwellWelcome(dt) {
  syncBrambleParty();
  if(brambleDeparture){
    for(const v of brambleDeparture){if(v.path)moveBrambleActor(v.actor,v.path,54,dt);else if(v.actor.x<cam.x-32||v.actor.x>cam.x+VW/cam.z+32||v.actor.y<cam.y-32||v.actor.y>cam.y+VH/cam.z+32)v.path=[];}
    if(brambleDeparture.every(v=>v.path&&v.path.length===0)){npcs=npcs.filter(n=>!n.brambleCompanion);brambleDeparture=null;brambleQuest=3;}return;
  }
  if(thornwellArrival){
    const a=thornwellArrival;moveBrambleActor(a.dog,a.path,100,dt);
    if(!a.path.length){thornwellArrival=null;petCompanion(a.dog);faceCorinAt(a.dog.x,a.dog.y);}
    return;
  }
  if(brambleQuest===1){
    const dog=npcs.find(n=>n.pettable);if(!dog||sceneHold()||sayNpc||mounted||ride||doorMotion)return;
    const last=brambleTrail.at(-1);
    if(last&&Math.hypot(P.x-last[0],P.y-last[1])>40){
      const route=bramblePath([dog.x,dog.y],[P.x,P.y]);
      if(route)brambleTrail=route;
      else if(Math.hypot(dog.x-P.x,dog.y-P.y)>200&&(dog.x<cam.x-32||dog.x>cam.x+VW/cam.z+32||dog.y<cam.y-32||dog.y>cam.y+VH/cam.z+32)){dog.x=P.x;dog.y=P.y;brambleTrail=[];}
      else return;
    }else if(!last||Math.hypot(P.x-last[0],P.y-last[1])>=5)brambleTrail.push([P.x,P.y]);
    if(brambleTrail.length>600)brambleTrail.splice(0,brambleTrail.length-600);
    if(Math.hypot(dog.x-P.x,dog.y-P.y)>22&&brambleTrail.length) {
      if(canStand(...brambleTrail[0]))moveBrambleActor(dog,brambleTrail,85,dt);
      else brambleTrail.shift();
    }else if(brambleTrail.length>1)brambleTrail=brambleTrail.slice(-1);
    return;
  }
  if(brambleQuest!==0||MAPID!=="world"||mode!=="play"||editing||sceneHold()||sayNpc||doorMotion||ride||mounted)return;
  if(P.x<220*TS||P.x>320*TS||P.y<44*TS||P.y>150*TS)return;
  const dog=npcs.find(n=>n.pettable),path=welcomePath();if(!dog||!path)return;
  if(Math.hypot(dog.x-P.x,dog.y-P.y)<150){
    const nearby=bramblePath([dog.x,dog.y],[P.x+24,P.y]);if(!nearby)return;thornwellArrival={dog,path:nearby};
  }else{[dog.x,dog.y]=path[0];thornwellArrival={dog,path:path.slice(1)};}
  brambleQuest=1;thornwellMet=true;
  playScene(["Corin: Oh! Hello there. Come here, boy.","Corin scratches the dog's ears. His tail wags furiously.","Corin: You have a collar. We'd better find your owner.","The dog falls into step behind Corin."],{bramble:true,hold:()=>!thornwellArrival,after:()=>{brambleTrail=[];}});
}
function skipBrambleForTest(){
  if(scene?.bramble){scene=null;walker=null;sayOff();showFace(null);}
  if(sayNpc&&(sayNpc.pettable||sayNpc.n==='Rowan the Hunter')){sayNpc=null;sayOff();showFace(null);}
  thornwellMet=true;brambleQuest=3;thornwellArrival=null;thornwellReturn=null;
  brambleDeparture=null;brambleTrail=[];brambleMap='';syncBrambleParty();
  P.moving=false;
}
function petCompanion(n) {
  if (!n || !n.pettable || mounted || Math.hypot(n.x-P.x,n.y-P.y)>32) return false;
  const now=tAcc;
  if ((n.pettedUntil || 0)>now) return true;
  faceToward(n,P.x,P.y);
  n.pettedUntil=now+1.6;
  pHp=pMax; showHeal("potion");
  toast("You scratch Bramble behind the ears. Full health restored!");
  return true;
}
function drawPetHeart(n,t,sp) {
  if (!(n.pettedUntil>t)) return;
  const elapsed=1.6-(n.pettedUntil-t),x=Math.round(n.x-3),y=Math.round(n.y-sp[3]-8-elapsed*4);
  ctx.save();ctx.fillStyle="#f17a90";
  for(const [dy,row] of ["0110110","1111111","1111111","0111110","0011100","0001000"].entries())
    for(let dx=0;dx<row.length;dx++)if(row[dx]==="1")ctx.fillRect(x+dx,y+dy,1,1);
  ctx.restore();
}
let fishingPole=false, fishing=null;
const FISH_TAU=Math.PI*2;
function waterInReach(){
  if(!terr||!MW||!MH)return false;
  const dir=playerFacing4(),v={e:[1,0],w:[-1,0],n:[0,-1],s:[0,1]}[dir]||[0,1];
  // Sample a short fan in front of Corin, including the edge of a dock.
  for(const d of [8,16,24])for(const side of [-5,0,5]){
    const x=Math.floor((P.x+v[0]*d-v[1]*side)/TS),y=Math.floor((P.y+v[1]*d+v[0]*side)/TS);
    if(x<0||y<0||x>=MW||y>=MH)continue;
    if([WATER,DWATER,SEA,POOL_T].includes(terr[y*MW+x]))return true;
  }
  return false;
}
function fishingSafe(){
  return mode==='play'&&!sceneHold()&&!doorMotion&&!fadeDir&&!ride&&!mounted&&!arenaLock&&!trial&&!deadShown&&!P.act&&
    !foes.some(f=>f.hp>0&&Math.hypot(f.x-P.x,f.y-P.y)<180);
}
function endFishing(){
  fishing=null;running=false;P.moving=false;
  clearPadInputs();padDx=padDy=0;
  for(const k in keys)keys[k]=0;
}
function tryFishing(){
  if(!fishingPole||!waterInReach())return false;
  if(!fishingSafe()){toast('Find a quiet moment on the bank before fishing.');return true;}
  endFishing();
  fishing={phase:'prompt'};
  ask={quick:1,opts:[{n:'Do you want to fish?',head:true},{n:'YES',go:startFishing},{n:'NO',go:endFishing}]};
  askPick=1;askDraw();return true;
}
function fishingRegion(){
  let x=P.x/TS;
  if(MAPID!=='world'){
    // Follow interior exits back to their overworld region.
    let id=MAPID;const seen=new Set();
    while(id!=='world'&&!seen.has(id)){
      seen.add(id);const doors=W.maps[id]?.doors||[];
      const d=doors.find(d=>d.to==='world')||doors.find(d=>!seen.has(d.to));
      if(!d)break;x=d.tx;id=d.to;
    }
  }
  const tier=[700,1300,1900,2500,3100].filter(edge=>x>=edge).length;
  return {tier:tier+1,reward:tier+1,speed:2.4+tier*.36,halfWidth:.40-tier*.035};
}
function startFishing(){
  if(!fishingPole||!waterInReach()||!fishingSafe()){endFishing();return;}
  endFishing();
  fishing={phase:'spin',angle:-Math.PI/2,target:Math.random()*FISH_TAU,...fishingRegion(),
    elapsed:0,resultAge:0,caught:false};
}
function stepFishing(dt){
  if(!fishing)return;
  if(fishing.phase==='spin'){
    fishing.elapsed+=dt;fishing.angle=(fishing.angle+dt*fishing.speed)%FISH_TAU;
  }else if(fishing.phase==='result')fishing.resultAge+=dt;
}
function fishingAction(){
  const f=fishing;if(!f)return;
  if(f.phase==='spin'){
    if(f.elapsed<0.3)return; // Ignore the cast's trailing touch/mouse event.
    const gap=Math.abs(Math.atan2(Math.sin(f.angle-f.target),Math.cos(f.angle-f.target)));
    f.caught=gap<=f.halfWidth;f.phase='result';f.resultAge=0;
    if(f.caught)dragonFish+=f.reward;
  }else if(f.phase==='result'&&f.resultAge>=0.45)startFishing();
}
function drawFishing(){
  const f=fishing;if(!f||f.phase==='prompt')return;
  const w=Math.min(VW-24,340),h=Math.min(VH-24,340),x=(VW-w)/2,y=Math.max(12,(VH-h)/2-20);
  const cx=x+w/2,cy=y+h*0.48,r=Math.min(w*0.26,h*0.25);
  ctx.save();ctx.fillStyle='rgba(8,19,24,.66)';ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='#102f36';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#d6bf82';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,w-2,h-2);
  ctx.textAlign='center';ctx.fillStyle='#f5e7c5';ctx.font='bold 19px Georgia';ctx.fillText('CAST A LINE',cx,y+30);
  ctx.font='12px sans-serif';ctx.fillStyle='#c4ddd6';ctx.fillText('Stop the marker inside the green arc',cx,y+52);
  ctx.lineWidth=14;ctx.strokeStyle='#36555c';ctx.beginPath();ctx.arc(cx,cy,r,0,FISH_TAU);ctx.stroke();
  ctx.strokeStyle='#8dde91';ctx.beginPath();ctx.arc(cx,cy,r,f.target-f.halfWidth,f.target+f.halfWidth);ctx.stroke();
  // Gold end marks make the target readable without relying on color alone.
  ctx.strokeStyle='#fff2ad';ctx.lineWidth=2;
  for(const a of [f.target-f.halfWidth,f.target+f.halfWidth]){ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r-11),cy+Math.sin(a)*(r-11));ctx.lineTo(cx+Math.cos(a)*(r+11),cy+Math.sin(a)*(r+11));ctx.stroke();}
  const ax=Math.cos(f.angle),ay=Math.sin(f.angle);
  ctx.strokeStyle='#fff6dc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+ax*r,cy+ay*r);ctx.stroke();
  ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.arc(cx+ax*r,cy+ay*r,6,0,FISH_TAU);ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,5,0,FISH_TAU);ctx.fill();
  ctx.font='bold 16px sans-serif';ctx.fillStyle=f.phase==='result'&&f.caught?'#a2edac':'#fff0cb';
  ctx.fillText(f.phase==='spin'?'A  ·  REEL IN':f.caught?'FISH CAUGHT!  +'+f.reward:'It slipped away!',cx,y+h-66);
  ctx.font='12px sans-serif';ctx.fillStyle='#c4ddd6';
  ctx.fillText(f.phase==='result'?(f.caught?'Each fish restores '+DRAGON_FISH_HEAL+' dragon HP.':'Try stopping the marker between the gold marks.'):'Difficulty '+f.tier+'  ·  Catch '+f.reward+' fish',cx,y+h-44);
  ctx.fillText(f.phase==='result'?'A / Space: cast again  ·  B / Esc: leave':'B / Esc: cancel  ·  Space also reels in',cx,y+h-23);
  ctx.restore();
}
function interact() {
  if(fishing){if(fishing.phase==='prompt')askTake();else fishingAction();return;}
  if (MAPID === "glasshouse" && !sayNpc && Math.abs(P.x - 68) < 29 && Math.abs(P.y - 116) < 28) {
    if (glassHatchStarted < 0) glassHatchStarted = performance.now() / 1000;
    return;
  }
  if (doorMotion) return;
  if (P.act && P.act.kind === "fall") return;
  if (sceneHold()) { advanceScene(); return; }
  if (ride) return;                    /* already aboard */
  if (!sayNpc && dragon.down && dragonHere() &&
      Math.hypot(P.x - dragon.x, P.y - dragon.y) < 42) {
    if (boarMeat > 0) feedDragon("meat");
    else if (dragonFish > 0) feedDragon("fish");
    else toast("the dragon needs boar meat or fish");
    return;
  }
  if (!sayNpc && trialDemonHere() && !trial && Math.hypot(P.x - (MAPID==="witchmoor"?196:THRONE_DEMON.x), P.y - (MAPID==="witchmoor"?304:THRONE_DEMON.y)) < 48) {
    talkTrialDemon(); return;
  }
  if (!sayNpc && interactTrialPedestal()) return;
  if (ferryTry()) return;
  if (tryTreasuryChest()) return;
  if (tryTempleLever()) return;
  if (tryCellarSupplies()) return;
  if (tryChest()) return;              /* the temple chest, if he is at one */
  {
    const it = itemAt(P.x, P.y);
    if (it) { takeItem(it); return; }
  }
  {
    const said = questTalk();
    if (said) return;
  }
  if (sayNpc) {
    if (!typeDone()) { typeAll(); return; }   /* finish the line first */
    sayLine++;
    if (sayLine >= (sayNpc.said || sayNpc.d).length) {
      if (sayNpc.wasFacing) { sayNpc.f = sayNpc.wasFacing; sayNpc.wasFacing = null; }
      if (MAPID === "cinderhold" && /Halvard/.test(sayNpc.n || "")) {
        const gone = sayNpc;
        sayNpc = null; sayOff(); showFace(null);
        startLastFight();
        return;
      }
      const giver = sayNpc;
      sayNpc = null; sayOff(); showFace(null);
      if(giver.n==='Liora'&&!fishingPole){
        fishingPole=true;
        showReveal('fishing_rod','Corin obtained a Fishing Pole! Face water and press A to fish.');
        return;
      }
      if(giver.n==='Sela'&&!glassShield){
        glassShield=true; saveGame();
        showReveal(SPR.it_ward ? 'it_ward' : 'sh_glow','Corin obtained the Glass Shield! Hold B during battle to raise its force field.');
        return;
      }
      if (giver.n === "Dunstan" && hasSword() && (!smithUpgrade || !charm.edge)) {
        finishSmithUpgrade(); return;
      }
      if (giver.n !== "Dunstan" && giver.charm && !charm[giver.charm]) {
        const k = giver.charm;
        charm[k] = true;
        const art = (SPR[CHARM_ART[k]] && CHARM_ART[k]) || CHARM_ICON[k];
        showReveal(art, CHARM_NOTE[k]);
      }
      if (giver.gift && !breathHas[giver.gift]) {
        unlockDragonBreath(giver.gift);
        const giftName = giver.gift[0].toUpperCase() + giver.gift.slice(1);
        const giftIcon = HS_ICON[giver.gift];
        showReveal(SPR[giftIcon] ? giftIcon : "chest",
                   "Corin obtained a Heartstone! The " + giftName + " breath is unlocked.", 3);
      }
    }
    else {
      const [wn, tn] = whoSays(sayNpc, (sayNpc.said || sayNpc.d)[sayLine]);
      typeStart(wn, tn);
      showFace(wn);
      typePaint();
    }
    return;
  }
  let best = null, bd = 32; // Reach across NPC footing and a final movement step.
  for (const n of npcs) {
    if (!npcHere(n)) continue;
    if (n.noTalk) continue;
    if (lastFight && MAPID === "cinderhold" && /Halvard/.test(n.n || "")) continue;
    const d = npcTalkDistance(n);
    if (d < bd) { bd = d; best = n; }
  }
  if (best && tryBrambleReunion(best)) return;
  if (best && petCompanion(best)) return;
  if (best && best.pettable) return;
  if (best && /Ald[e]?ric/.test(best.n || "")) heartKnown = true;
  if (best) {
    const giftPending=(best.charm && !charm[best.charm]) || (best.gift && !breathHas[best.gift]);
    if(best.sells && !giftPending) merchantAsk(best);
    else beginNpcTalk(best);
    return;
  }
  if (tryFishing()) return;
  if (typeof mounted !== "undefined" && mounted && dragonHere()) {
    clawNow();
    return;
  }
  if (hasSword()) startAct("swing");
}
function beginNpcTalk(best) {
    if (MAPID === "cinderhold" && /Halvard/.test(best.n || "") && !wonAll && window.EmberKingMusic) window.EmberKingMusic.start();
    sayNpc = best; sayLine = 0;
    if (!best.wasFacing) best.wasFacing = best.f;
    if (best.patrol && best.goto) { best.goto = null; best.arrived = true; }
    faceToward(best, P.x, P.y);
    best.spoke = (best.spoke || 0) + 1;
    const alt = best.spoke % 2 === 0;
    if(best.n==='Liora'&&!fishingPole){
      sayNpc.said=["The trout gather beneath Forgefalls, where the current brings their supper.",
        "Here, Corin. My spare fishing pole deserves more adventures than my bag.",
        "Face any water and press A. Stop the spinning marker inside the green arc to catch a fish. Your dragon can eat the catch to recover."];
    }
    else if (best.n === "Sela" && !glassShield) {
      sayNpc.said = ["Sela: Corin, wait. I made something from the clearest furnace glass I have.",
        "Sela: It is not meant to stop a blade by being harder than steel. The glass catches the force and throws it back.",
        "Sela: Take the Glass Shield. Hold B when something attacks you and the field will turn the blow away."];
    }
    else if (best.n === "Maelis" && !charm.ward) {
      sayNpc.said = ["You have a talent for finding things that bite, Corin.",
        "Take my ward. Wear it, and a little of their spite will fall short.",
        "That is a gift. If you want to buy a curse, ask me another time."];
    }
    else if (best.n === "Dunstan" && hasSword() && !smithUpgrade) {
      sayNpc.said = [...(wonAll ? (best.dv || []) : []), "Maddock's blade has served you well. Let me fit you with something stronger.",
        "There. A stronger edge, and armor to match."];
    }
    else sayNpc.said = npcContextDialogue(best, alt);
    const [w0, t0] = whoSays(best, sayNpc.said[0]);
    typeStart(w0, t0);
    showFace(w0);
    typePaint();
    showFace(best.n);
    sayEl.classList.remove("narr");     /* a villager is always a person */
    sayOn();
}
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
{
  const el = document.getElementById("buildstamp");
  if (el) el.textContent = "  build 19:10:42";
}
padBind();
{
  const fb = document.getElementById("bFine");
  if (fb) fb.addEventListener("click", () => {
    finePlace = !finePlace;
    fb.classList.toggle("on", finePlace);
  });
}
function actionButton() {
  if(atlasOpen)return;
  if(fishing&&fishing.phase!=='prompt'){fishingAction();return;}
  if (typeof BOOT !== "undefined" && BOOT.waiting) { BOOT.close(); return; }
  if (deadShown) { getUp(); return; }
  if (typeof ovl !== "undefined" && ovl) { ovlTake(); return; }   /* A takes the entry */
  /* Any open menu takes A, not just the quick one. A shop list is built as
     a plain ask, so A used to fall through to interact() and start the
     merchant talking again instead of buying. */
  if (typeof ask !== "undefined" && ask) { askTake(); return; }
  if (typeof bagOpen !== "undefined" && bagOpen) { bagUse(); return; }
  if (grabGold()) return;      /* gold underfoot comes first */
  interact();
}
bindHold("act", actionButton, null);
bindHold("btnB", () => {
  if(fishing){askShut();endFishing();return;}
  if(atlasOpen){closeAtlas();return;}
  if (typeof ask !== "undefined" && ask) { askBack(); return; }
  if (typeof bagOpen !== "undefined" && bagOpen) { setBag(false); return; }
  if (typeof ovl !== "undefined" && ovl) { setOvl(null); return; }
  running = true;
  if (glassShield && inFight()) { glassShieldHeld = true; glassShieldWindowUntil = tAcc + GLASS_BLOCK_WINDOW; glassShieldPulse = Math.max(glassShieldPulse,.18); tryGlassShieldParry(); }
}, () => { running = false; glassShieldHeld = false; });
{
  const fb = document.getElementById("btnFire");
  if (fb) setInterval(() => fb.classList.toggle("cooling", !canBreathe()), 120);
}

const deckEl = document.getElementById("deck");
const devTitle = document.getElementById("devtitle");
let devOpen = false;

function setDevTitle(t) { devTitle.textContent = t || "DEV TOOLS"; }

let switching = false;
function closeOthers(keep) {
  if (switching) return;
  switching = true;
  if (keep !== "build") setBuild(false);
  if (keep !== "paint") setPaint(false);
  if (keep !== "travel") setTravel(false);
  if (keep !== "edit" && editing) {
    editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
  }
  switching = false;
}

let devUnlocked = false;
function setDev(on) {
  if (on) devUnlocked = true;
  devOpen = on;
  deckEl.classList.toggle("dev", on);
  { const db = document.getElementById("devbtn");
    if (db) db.classList.toggle("on", on); }
  if (!on) { setTravel(false); setDevTitle(null); }
  refreshToolbar();
}

function exitTools() {
  doorEdit=false;collideView=false;geometryEnd();document.getElementById("geometryBar").style.display="none";
  setBuild(false); setPaint(false); setTravel(false);
  editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
  setDev(false);
}

function activeTool() {
  if (building) return arenaMode ? "ARENA" : areaMode ? "MOVE AREAS"
                : (buildTool === "route" ? "ROUTE" : KINDS[areaKind].toUpperCase());
  if (painting) return "PAINT";
  if (editing) return "MOVE THINGS";
  return null;
}

function refreshToolbar() {
  const bar = document.getElementById("toolbar");
  const what = activeTool();
  const show = !!what && !devOpen;
  bar.classList.toggle("on", show);
  if (!show) return;
  document.getElementById("tbWhat").textContent = what;
  const un = document.getElementById("tbUndo");
  const n = building ? buildUndo.length : painting ? undoStack.length : 0;
  un.style.display = (building || painting) ? "" : "none";
  un.textContent = n ? "UNDO " + n : "UNDO";
  un.classList.toggle("off", n === 0);
  const tog = document.getElementById("tbToggle");
  const drawable = building && !areaMode && !arenaMode;
  tog.style.display = drawable ? "" : "none";
  tog.textContent = drawArmed ? "DRAWING" : "PAN";
  tog.classList.toggle("on", drawArmed);
}
{ const db = document.getElementById("devbtn");
  if (db) tap(db, () => setDev(!devOpen)); }

function recentreOnCorin() {
  if (cameraOwnsView()) return;
  camFree = false;
  cam.z = playZoom();
  cam.x = P.x - VW / cam.z / 2;
  cam.y = P.y - VH / cam.z / 2;
  clampCam();
  toast("back to " + (areaUnder(P.x, P.y) || "the character"));
}
tap(document.getElementById("devclose"), () => setDev(false));
tap(document.getElementById("tbUndo"), () => {
  if (building) document.getElementById("tUndo").click();
  else if (painting) undoStroke();
  else toast("nothing to undo here");
});
tap(document.getElementById("tbTools"), () => setDev(true));
tap(document.getElementById("tbToggle"), () => setArmed(!drawArmed));
tap(document.getElementById("tbDone"), exitTools);

function soloTool(name) {
  for (const [id, on] of [["bEdit", editing],
                          ["bPaint", painting], ["bBuild", building]])
    document.getElementById(id).classList.toggle("on", !!on);
  setDevTitle(name);
}

const bEdit = document.getElementById("bEdit");
const editEl = document.getElementById("edit"), selEl = document.getElementById("sel");
function tap(el, fn) {
  el.addEventListener("click", fn);
  el.addEventListener("touchstart", e => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
}
const paintEl = document.getElementById("paint");
const bPaint = document.getElementById("bPaint");
function setPaint(on) {
  if (on) closeOthers("paint");
  painting = on;
  bPaint.classList.toggle("on", on);
  paintEl.style.display = on ? "block" : "none";
  soloTool(on ? "PAINT GROUND" : null);
  refreshToolbar();
  if (on) refreshUndo();
  if (on) { editing = false; bEdit.classList.remove("on"); editEl.style.display = "none"; }
}
tap(bPaint, () => { if (!devOpen) setDev(true); setPaint(!painting); });

const travelEl = document.getElementById("travel");
const bTravel = document.getElementById("bTravel");
let travelling = false;
function setTravel(on) {
  if (on) closeOthers("travel");
  travelling = on;
  bTravel.classList.toggle("on", on);
  travelEl.style.display = on ? "block" : "none";
  if (on) {
    setPaint(false); setBuild(false);
    editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
    buildTravel();
    setDevTitle("FAST TRAVEL");
  }
}
tap(bTravel, () => { if (!devOpen) setDev(true); setTravel(!travelling); });

tap(document.getElementById("bReset"), () => {
  const n = countChanges();
  if (!n) { toast("nothing to reset"); return; }
  if (!resetArmed) {
    resetArmed = true;
    setTimeout(() => { resetArmed = false; }, 4000);
    toast("tap RESET again to discard " + n + " change" + (n === 1 ? "" : "s"));
    return;
  }
  resetArmed = false;
  setBuild(false); setPaint(false);
  editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
  loadMap(MAPID, true);
  P.x = MD.spawn[0]; P.y = MD.spawn[1];
  cam.z = playZoom(); camFree = false;
  toast("reset -- back to the world as built");
});

const buildEl = document.getElementById("build");
const bBuild = document.getElementById("bBuild");
function setBuild(on) {
  if (on) closeOthers("build");
  building = on;
  bBuild.classList.toggle("on", on);
  buildEl.style.display = on ? "block" : "none";
  soloTool(on ? "DRAW ROUTES & AREAS" : null);
  refreshToolbar();
  if (on) {
    setPaint(false); editing = false; bEdit.classList.remove("on");
    editEl.style.display = "none";
    setArmed(false);          /* always open in PAN, never armed */
    areaMode = false; pickedArea = null; areaDrag = null; arenaMode = false;
    grabMode = false; grabRect = null;
    const grew = ensureWorkspace();
    camFree = true;                 /* free the camera, but do not move it */
    clampCam();
    refreshBuild();
    toast(grew ? "room added -- PAN to position, then tap PAN to draw"
               : "PAN to position, then tap PAN to draw");
  }
  drawA = drawB = null;
}
tap(bBuild, () => { if (!devOpen) setDev(true); setBuild(!building); });
function setArmed(on) {
  drawArmed = on;
  if (on) setDev(false);          /* get the panel out of the way to draw */
  const el = document.getElementById("tMode");
  el.textContent = on ? "DRAWING" : "PAN";
  el.classList.toggle("on", on);
  drawA = drawB = null;
  refreshBuild();
  refreshToolbar();
}
tap(document.getElementById("tMode"), () => setArmed(!drawArmed));
tap(document.getElementById("tRoute"), () => {
  buildTool = "route";
  document.getElementById("tRoute").classList.add("on");
  document.getElementById("tTown").classList.remove("on");
  refreshBuild();
  refreshToolbar();
});
tap(document.getElementById("tTown"), () => {
  buildTool = "town";
  document.getElementById("tTown").classList.add("on");
  document.getElementById("tRoute").classList.remove("on");
  refreshBuild();
});
tap(document.getElementById("tStyle"), () => {
  buildStyle = STYLES[(STYLES.indexOf(buildStyle) + 1) % STYLES.length];
  refreshBuild();
});
const EXPAND_STEP = 60;
function expand(dx, dy) {
  const w0 = MW, h0 = MH;
  if (!growWorld(MW + dx, MH + dy)) return;
  if (MW === w0 && MH === h0) {
    toast("the world is as big as it goes: " + MW + "x" + MH);
    return;
  }
  realizeFeatures();
  cam.z = Math.max(fitZoom(), Math.min(VW / PXW, VH / PXH));
  clampCam();
  toast("world is now " + MW + " x " + MH + " tiles");
}
tap(document.getElementById("tKind"), () => {
  areaKind = (areaKind + 1) % KINDS.length;
  refreshBuild();
});
tap(document.getElementById("tGrab"), () => {
  grabMode = !grabMode;
  if (grabMode) { setArmed(false); areaMode = false; arenaMode = false; setDev(false); }
  else { grabRect = null; grabDrag = null; }
  document.getElementById("tGrab").classList.toggle("on", grabMode);
  refreshBuild(); refreshToolbar();
  toast(grabMode ? "drag a box, then drag the box to move it" : "grab tool off");
});
tap(document.getElementById("tArena"), () => {
  arenaMode = !arenaMode;
  if (arenaMode) { setArmed(false); areaMode = false; }
  document.getElementById("tArena").classList.toggle("on", arenaMode);
  refreshBuild();
  if (arenaMode) setDev(false);
  refreshToolbar();
  toast(arenaMode ? "tap the path to clear an arena" : "arena tool off");
});
tap(document.getElementById("tAreas"), () => {
  areaMode = !areaMode;
  if (areaMode) { arenaMode = false; grabMode = false; grabRect = null;
                  document.getElementById("tArena").classList.remove("on");
                  document.getElementById("tGrab").classList.remove("on"); }
  if (areaMode) setArmed(false);
  pickedArea = null; areaDrag = null;
  refreshBuild();
  if (areaMode) setDev(false);
  refreshToolbar();
  toast(areaMode ? "areas highlighted -- drag one to move it"
                 : "back to drawing");
});
tap(document.getElementById("tEast"), () => expand(EXPAND_STEP, 0));
tap(document.getElementById("tSouth"), () => expand(0, EXPAND_STEP));

tap(document.getElementById("aSmall"), () => resizeArea(-4));
tap(document.getElementById("aBig"), () => resizeArea(4));
tap(document.getElementById("aFit"), fitArea);

tap(document.getElementById("tUndo"), () => {
  const act = buildUndo.pop();
  if (!act) { toast("nothing to undo"); return; }
  if (act.kind === "add") {
    const i = features.findIndex(f => f.id === act.id);
    if (i >= 0) {
      const f = features.splice(i, 1)[0];
      realizeFeatures();
      toast("removed " + (f.label || f.kind));
    }
  } else if (act.kind === "resize") {
    const f = features.find(x => x.id === act.id);
    if (f) {
      f.x0 = act.was.x0; f.y0 = act.was.y0; f.x1 = act.was.x1; f.y1 = act.was.y1;
      worldChanged(); realizeFeatures(); rebuildBuckets(); rebuildSolid(); refreshBuild();
      toast((f.label || "area") + " put back to its old size");
    }
  } else if (act.kind === "region") {
    const r = regionMoves[act.i];
    if (r) {
      moveRegion({ x0: r.x0 + r.dx, y0: r.y0 + r.dy,
                   x1: r.x1 + r.dx, y1: r.y1 + r.dy }, -r.dx, -r.dy, true);
      regionMoves.splice(act.i, 1);
      toast("region moved back");
    }
  } else {
    const f = features.find(x => x.id === act.id);
    if (f) {
      moveArea(f, -act.dx, -act.dy, true);       /* put it back, silently */
      toast((f.label || "area") + " moved back");
    }
  }
  refreshBuild();
});
tap(document.getElementById("tDone"), () => {
  setBuild(false);
  toast(buildUndo.length ? buildUndo.length + " change(s) -- tap COPY to send them"
                         : "nothing drawn");
});
let devHeldArena = null;
function setFoesEnabled(enabled) {
  foesHeld = !enabled;
  const button = document.getElementById("bFoes");
  button.textContent = foesHeld ? "FOES: OFF" : "FOES: ON";
  button.classList.toggle("on", foesHeld);
  button.setAttribute("aria-pressed", String(foesHeld));
  if (foesHeld) {
    devHeldArena = arenaLock ? {map:MAPID,ring:arenaLock,t:arenaT} : null;
    // Bypass barriers without completing encounters, granting rewards or changing saves.
    arenaLock=null; arenaT=0; arenaGoing=false; falling=null;
    bolts.length=0; breath=null; hunt=null; claw=null; spell=null;
  } else {
    if(devHeldArena && devHeldArena.map===MAPID &&
       (trial || arenaFoesLeft(devHeldArena.ring))) {
      arenaLock=devHeldArena.ring;arenaT=devHeldArena.t;
    }
    devHeldArena=null;
  }
  toast(foesHeld ? "Foes paused — passages and arena barriers are open" : "Foes and battle barriers enabled");
}
tap(document.getElementById("bFoes"), () => setFoesEnabled(foesHeld));
tap(document.getElementById("pDone"), () => {
  if (groundDirty) { groundDirty = false; finishPaint(); }
  setPaint(false);
  toast(painted.size ? "painted " + painted.size + " tiles -- tap COPY to send them"
                     : "no terrain changes");
});
const PAINTS = ["pGrass", "pDirt", "pWater", "pPool", "pPave2",
                "pMarble", "pTerrace", "pRoadSand",
                "pLava", "pVRock", "pVCrack", "pVStone"];
for (const id of PAINTS) {
  const el = document.getElementById(id);
  if (!el) continue;
  tap(el, () => {
    paintT = +el.dataset.t;
    for (const o of PAINTS) {
      const b = document.getElementById(o);
      if (b) b.classList.toggle("on", o === id);
    }
  });
}
tap(document.getElementById("pUndo"), undoStroke);
tap(document.getElementById("pSize"), () => {
  brush = brush === 1 ? 2 : brush === 2 ? 4 : brush === 4 ? 6 : 1;
  document.getElementById("pSize").textContent = "BRUSH " + brush;
});

tap(bEdit, () => {
  editing = !editing;
  if (editing) { setPaint(false); setBuild(false); }
  bEdit.classList.toggle("on", editing);
  editEl.style.display = editing ? "block" : "none";
  soloTool(editing ? "MOVE THINGS" : null);
  refreshToolbar();
  if (!editing) selected = null;
  refreshSel();
});
const xdelEl = document.getElementById("xdel");
function refreshHandle() {
  let wx = null, wy = null;
  if (editing && selected) {
    const sp = editorSprite(selected);
    if (!sp) return;
    wx = selected.x + (selected.wx || 0);
    wy = selected.y + (selected.wy || 0) - (sp ? sp[3] : 16) - 6;
  } else if (building && grabMode && grabRect && !grabDrag) {
    wx = (grabRect.x1 + 1) * TS;
    wy = grabRect.y0 * TS - 6;
  }
  if (wx === null) {
    if (xdelEl.style.display !== "none") xdelEl.style.display = "none";
    if (typeof xlistEl !== "undefined" && xlistEl.style.display !== "none") xlistEl.style.display = "none";
    return;
  }
  xdelEl.style.display = "block";
  xdelEl.style.left = ((wx - cam.x) * cam.z) + "px";
  xdelEl.style.top = ((wy - cam.y) * cam.z) + "px";
  if (typeof xlistEl !== "undefined") {
    const show = building && grabMode && grabRect && !grabDrag;
    xlistEl.style.display = show ? "block" : "none";
    if (show) {
      xlistEl.style.left = ((wx - cam.x) * cam.z) + "px";
      xlistEl.style.top = ((wy - cam.y) * cam.z + 26) + "px";
    }
  }
}
tap(xdelEl, () => {
  if (editing && selected) { deleteSelected(); return; }
  if (building && grabMode && grabRect) { deleteGrabbed(); return; }
});

function listGrabbed() {
  if (!grabRect) { toast("drag a box first"); return; }
  const { x0, y0, x1, y1 } = grabRect;
  const rows = [];
  const seen = (o, where) => {
    const nm = NAMES[o.s] || "?";
    if (!/^(oak_|bir_|spr_|fru_|mw_|kt_|blo_|wf_pine|deadtree|halfdead)/.test(nm))
      return;
    const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
    if (tx < x0 || tx > x1 || ty < y0 || ty > y1) return;
    rows.push(nm + " " + tx + " " + ty + " " + where);
  };
  for (const o of objs) if (!deleted.has(o.id)) seen(o, "stored");
  for (const o of fobjs) seen(o, "generated");
  rows.sort();
  const head = "EMBERFELL TREES v1\nMAP " + MAPID +
               "\nbox " + x0 + "," + y0 + " .. " + x1 + "," + y1 +
               "\n" + rows.length + " trees";
  copyText(head + "\n" + rows.join("\n"),
           () => toast(rows.length + " trees copied"));
}
const xlistEl = document.createElement("div");
xlistEl.id = "xlist";
xlistEl.className = "xdel";
xlistEl.textContent = "LIST";
xlistEl.style.display = "none";
document.body.appendChild(xlistEl);
tap(xlistEl, () => { if (building && grabMode && grabRect) listGrabbed(); });

function deleteGrabbed() {
  if (!grabRect) return;
  const { x0, y0, x1, y1 } = grabRect;
  const inside = (px, py) => {
    const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS);
    return tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1;
  };
  let n = 0;
  for (const o of objs.slice()) {
    if (o.feat || deleted.has(o.id) || !inside(o.x, o.y)) continue;
    deleted.add(o.id); objs = objs.filter(q => q !== o); n++;
  }
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) {
      const key = tx + "," + ty;
      if (felled.has(key)) continue;
      felled.add(key); felledNew.push(key);
    }
  n += fobjs.filter(o => inside(o.x, o.y)).length;
  for (const [tag, arr] of [["s", scat], ["a", sanm]])
    for (let i = 0; i < arr.length; i += 3) {
      if (decorGone.has(tag + i) || !inside(arr[i + 1], arr[i + 2])) continue;
      decorGone.add(tag + i);
      decorDel.push([tag, Math.round(arr[i + 1]), Math.round(arr[i + 2])]);
      n++;
    }
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * MW + x;
      if (terr[i] === WATER || terr[i] === BRIDGE) continue;
      if (terr[i] !== GRASS) { terr[i] = GRASS; notePainted(i); n++; }
    }
  clearedBoxes.push([x0, y0, x1, y1]);
  grabRect = null; grabDrag = null;
  realizeFeatures();
  reindex(); indexScatter(); chunks.clear(); rebuildBuckets(); rebuildSolid();
  refreshHandle(); refreshBuild();
  toast("cleared " + n + " thing" + (n === 1 ? "" : "s"));
}

function refreshSel() {
  selEl.textContent = selected
    ? (selected.n || selected.spr || NAMES[selected.s]) + " #" + (selected.id || "actor") + " @ " + Math.round(selected.x) + "," + Math.round(selected.y)
    : "drag anything to move it, then DONE";
  refreshHandle();
}
function countChanges() {
  let n = geometryPatch().length + Object.keys(actorLayouts[MAPID]||{}).length + deleted.size + added.length + painted.size + regionMoves.length
          + decorDel.length + felledNew.length + clearedBoxes.length;
  for (const [k, m] of decorMoved) {
    if (decorGone.has(k)) continue;
    const arr = m.tag === "s" ? scat : sanm;
    if (Math.round(arr[m.di + 1]) !== m.x0 || Math.round(arr[m.di + 2]) !== m.y0) n++;
  }
  for (const f of features)
    if (featOrig.get(f.id) !== JSON.stringify(f)) n++;
  for (const o of objs) {
    if (o.id >= ORIG.length || o.feat) continue;
    const a = ORIG[o.id];
    if (Math.round(o.x) !== a.x || Math.round(o.y) !== a.y) n++;
  }
  return n;
}

function doneEditing() {
  const n = countChanges();
  editing = false; selected = null; dragObj = null;
  bEdit.classList.remove("on");
  editEl.style.display = "none";
  reindex(); refreshSel();
  toast(n ? "saved -- " + n + " change" + (n === 1 ? "" : "s") + ", tap COPY to send them"
          : "no changes made");
}
tap(document.getElementById("nDone"), doneEditing);
function deleteSelected() {
  if (!selected) return;
  if(selected.editableWall){
    const key=editorActorInfo(selected).key;selected.editorDeleted=true;
    (actorLayouts[MAPID] ||= {})[key]={x:selected.x,y:selected.y,deleted:true};
    try{localStorage.setItem('emberfell.actor-layout.v1',JSON.stringify(actorLayouts));}catch(e){toast('Use COPY to keep this wall deletion.');}
    selected=null;rebuildSolid();mapDirty=true;refreshSel();refreshHandle();return;
  }
  if(editorActorInfo(selected)){toast("This actor can be moved. Keep its story identity intact.");return;}
  if (selected.feat) {
    const tx = Math.floor(selected.x / TS), ty = Math.floor((selected.y - 1) / TS);
    const key = tx + "," + ty;
    if (!felled.has(key)) { felled.add(key); felledNew.push(key); }
    selected = null;
    realizeFeatures(); rebuildBuckets(); rebuildSolid();
    refreshSel(); refreshHandle();
    return;
  }
  if (selected.decor) {
    decorGone.add(selected.decor + selected.di);
    decorDel.push([selected.decor, Math.round(selected.x), Math.round(selected.y)]);
  } else {
    deleted.add(selected.id);
    objs = objs.filter(o => o !== selected);
  }
  selected = null;
  reindex(); indexScatter(); chunks.clear(); rebuildBuckets();
  refreshSel(); refreshHandle();
}
tap(document.getElementById("nDel"), deleteSelected);
tap(document.getElementById("nDup"), () => {
  if (!selected) return;
  if(editorActorInfo(selected)){toast("Drag this actor to reposition it.");return;}
  const o = { id: nextId++, s: selected.s, x: selected.x + TS, y: selected.y + TS };
  objs.push(o); added.push(o); selected = o; reindex(); refreshSel();
});

function buildPatch() {
  const L = ["EMBERFELL PATCH v3", "MAP " + MAPID, ...geometryPatch()];
  for(const [key,v] of Object.entries(actorLayouts[MAPID]||{}))L.push("ACTOR "+JSON.stringify({key,...v}));
  for (const r of regionMoves)
    L.push("R " + r.x0 + " " + r.y0 + " " + r.x1 + " " + r.y1 + " " + r.dx + " " + r.dy);
  for (const f of features) {
    if (featOrig.get(f.id) === JSON.stringify(f)) continue;   /* unchanged */
    if (f.kind === "route")
      L.push("F route " + f.id + " " + f.x0 + " " + f.y0 + " " + f.x1 + " " +
             f.y1 + " " + f.w + " " + f.band + " " + f.style + " " +
             (f.a0 ? f.a0.area + ":" + f.a0.side : "-") + " " +
             (f.a1 ? f.a1.area + ":" + f.a1.side : "-") +
             (f.pts && f.pts.length > 2
                ? " " + f.pts.map(p => p[0] + "," + p[1]).join(";")
                : ""));
    else if (f.kind === "arena")
      L.push("F arena " + f.id + " " + f.x + " " + f.y + " " +
             (f.r || 6) + " " + f.style);
    else
      L.push("F area " + f.id + " " + f.x0 + " " + f.y0 + " " + f.x1 + " " +
             f.y1 + " " + f.band + " " + f.style + " " +
             (f.label || "Area").replace(/\s+/g, "_"));
  }
  const prows = new Map();
  for (const [i, tv] of painted) {
    const y = (i / MW) | 0, x = i % MW;
    if (!prows.has(y)) prows.set(y, []);
    prows.get(y).push([x, tv]);
  }
  for (const y of [...prows.keys()].sort((a, b) => a - b)) {
    const cells = prows.get(y).sort((a, b) => a[0] - b[0]);
    let i = 0;
    while (i < cells.length) {
      let j = i;
      while (j + 1 < cells.length && cells[j + 1][0] === cells[j][0] + 1 &&
             cells[j + 1][1] === cells[i][1]) j++;
      if (TCHAR[cells[i][1]] === undefined) { i = j; continue; }
      L.push("T " + TCHAR[cells[i][1]] + " " + cells[i][0] + " " + y + " " + (j - i + 1));
      i = j + 1;
    }
  }
  for (const o of objs) {
    if (o.id >= ORIG.length) continue;
    const a = ORIG[o.id];
    if (Math.round(o.x) !== a.x || Math.round(o.y) !== a.y)
      L.push("M " + o.id + " " + Math.round(o.x) + " " + Math.round(o.y));
  }
  for (const [x0, y0, x1, y1] of clearedBoxes)
    L.push("C " + x0 + " " + y0 + " " + x1 + " " + y1);
  const inBox = (tx, ty) => clearedBoxes.some(
    ([x0, y0, x1, y1]) => tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1);
  for (const id of [...deleted].sort((a, b) => a - b)) {
    const a = ORIG[id];
    if (a && inBox(Math.floor(a.x / TS), Math.floor((a.y - 1) / TS))) continue;
    L.push("D " + id);
  }
  for (const [tag, x, y] of decorDel)
    if (!inBox(Math.floor(x / TS), Math.floor((y - 1) / TS)))
      L.push("X " + tag + " " + x + " " + y);
  for (const [k, m] of decorMoved) {
    if (decorGone.has(k)) continue;             /* moved, then deleted */
    const arr = m.tag === "s" ? scat : sanm;
    const nx = Math.round(arr[m.di + 1]), ny = Math.round(arr[m.di + 2]);
    if (nx === m.x0 && ny === m.y0) continue;   /* dragged and put back */
    L.push("S " + m.tag + " " + (NAMES[m.s] || m.s) + " " +
           m.x0 + " " + m.y0 + " " + nx + " " + ny);
  }
  for (const k of felledNew) {
    const [kx, ky] = k.split(",").map(Number);
    if (!inBox(kx, ky)) L.push("K " + kx + " " + ky);
  }
  for (const o of added)
    if (!deleted.has(o.id))
      L.push("A " + NAMES[o.s] + " " + Math.round(o.x) + " " + Math.round(o.y));
  if (L.length === 2) L.push("(no changes on this map)");
  return L.join("\n");
}
const dumpEl = document.getElementById("dump"), dumpText = document.getElementById("dumpText");
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg; toastEl.style.display = "block";
  clearTimeout(toast._t); toast._t = setTimeout(() => toastEl.style.display = "none", 1800);
}
function copyText(txt, done) {
  const legacy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      ta.setSelectionRange(0, txt.length);          /* iOS needs the range */
      const ok = document.execCommand && document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) { return false; }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(
      () => done(true),
      () => done(legacy()));
    return;
  }
  done(legacy());
}

tap(document.getElementById("bCopy"), () => {
  const txt = buildPatch();
  const n = txt.split("\n").length - 1;
  copyText(txt, ok => {
    if (ok) toast("copied " + n + " change" + (n === 1 ? "" : "s"));
    else showDump(txt);
  });
});
function showDump(txt) {
  const dumpEl = document.getElementById("dump");
  const dumpText = document.getElementById("dumpText");
  if (!dumpEl || !dumpText) { toast("copy failed"); return; }
  dumpText.value = txt; dumpEl.style.display = "flex";
  dumpText.focus(); dumpText.select();
}
{
  const dc = document.getElementById("dumpClose");
  const de = document.getElementById("dump");
  if (dc && de) tap(dc, () => de.style.display = "none");
}

const isArea = (f) => f.kind === "area" || f.kind === "town";
let STYLE_TREE = ATLAS.styles.tree;
let STYLES = [];
const buildStyles = () => {
  STYLES = Object.keys(STYLE_TREE)
    .filter(k => !k.endsWith("_small") && k !== "dying");
};
function sows(style) { return !!style && style !== "volcano" && !!STYLE_TREE[style]; }
const TREE_STEP = 2;
const ROUTE_W = 5, ROUTE_BAND = 20, TOWN_BAND = 6, TOWN_MIN = 24;

let building = false, buildTool = "route", buildStyle = "spruce";
let drawArmed = false;
const KINDS = ["Town", "Graveyard", "Temple", "Camp", "Ruin", "Farmstead"];
let areaKind = 0;
let areaMode = false, pickedArea = null, areaDrag = null;
let arenaMode = false;
let grabMode = false, grabRect = null, grabDrag = null;
let regionMoves = [];
const ARENA_R = 6.3;
let buildUndo = [];
let features = [], fobjs = [], fsanim = [], baseTerr = null, featSeq = 1;
const DESERT_OK = /^(cactus|drock|palm|acacia|deadtree|halfdead|deadbush|bones|sand_)/;
function sandRefuses(o) {
  if (!baseTerr || !o || o.s === undefined) return false;
  const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return false;
  const _b = baseTerr[ty * MW + tx];
  const _desert = _b === SAND || _b === ROADSAND || _b === DWATER
                  || (typeof inDesert === "function" && inDesert(tx, ty));
  if (!_desert) return false;
  return !DESERT_OK.test(NAMES[o.s] || "");
}
let hidden = new Set();
let soilAreas = [];
function soilWob(t) {
  return Math.round(3.1 * Math.sin(t * 1.27) + 2.2 * Math.sin(t * 0.61 + 1.9)
                    + 1.3 * Math.sin(t * 2.13 + 0.4));
}
function soilIn(x, y) {
  for (const f of soilAreas)
    if (x >= f.x0 + soilWob(y) && x <= f.x1 - soilWob(y + 41) &&
        y >= f.y0 + soilWob(x + 17) && y <= f.y1 - soilWob(x + 63))
      return f.soil;
  return null;
}
function swampRoadAt(x, y) {
  if (terr[y * MW + x] !== DIRT) return inSwamp(x, y);
  let yes = 0, no = 0;
  for (let r = -3; r <= 3; r++) {
    if (inSwamp(x, y + r)) yes++; else no++;
    if (inSwamp(x + r, y)) yes++; else no++;
  }
  return yes >= no;
}
function inWinter(x, y) {
  const F = (typeof features !== "undefined" && features.length) ? features : MD.features;
  if (!F) return false;
  for (const f of F) {
    if (f.style !== "winter") continue;
    if (f.kind === "route") {
      const reach = (f.band || 20) + ((f.w || 5) >> 1) + 2;
      for (const [a, b] of routeLegs(f)) {
        const vert = a[0] === b[0];
        const lo = (vert ? Math.min(a[1], b[1]) : Math.min(a[0], b[0])) - reach;
        const hi = (vert ? Math.max(a[1], b[1]) : Math.max(a[0], b[0])) + reach;
        const along = vert ? y : x, across = vert ? x : y;
        if (along >= lo && along <= hi &&
            Math.abs(across - (vert ? a[0] : a[1])) <= reach) return true;
      }
    } else if (f.x0 !== undefined &&
               x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1) return true;
  }
  const WR = MD.winter_regions;
  if (WR) for (const r of WR)
    if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
  return false;
}
function hash2(x, y) {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  n = (n ^ (n >>> 13)) | 0;
  n = Math.imul(n, 1274126177) | 0;
  return ((n ^ (n >>> 16)) >>> 0);
}
function lavaPatch(x, y) {
  const C = 4;
  const gx = Math.floor(x / C), gy = Math.floor(y / C);
  const fx = (x - gx * C) / C, fy = (y - gy * C) / C;
  const v = (a, b) => (hash2(a, b) % 1000) / 1000;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = v(gx, gy)     + (v(gx + 1, gy)     - v(gx, gy))     * sx;
  const b = v(gx, gy + 1) + (v(gx + 1, gy + 1) - v(gx, gy + 1)) * sx;
  return a + (b - a) * sy;
}
function nearLava(x, y) {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const a = x + dx, b = y + dy;
    if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
    if (terr[b * MW + a] === VLAVA) return true;
  }
  return false;
}
function onLava(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  const i = y * MW + x;
  if (typeof baseTerr !== "undefined" && baseTerr && baseTerr[i] === VLAVA) return true;
  return terr[i] === VLAVA;
}
function onVBridge(x, y) {
  const B = MD.vbridges;
  if (!B) return false;
  for (const [x0, x1, yy] of B)
    if (y >= yy - 3 && y <= yy + 3 && x >= x0 && x <= x1) return true;
  return false;
}
function inVolcano(x, y) {
  if (onLava(x, y)) return true;
  const F = (typeof features !== "undefined" && features.length) ? features : MD.features;
  if (!F) return false;
  for (const f of F) {
    if (f.style !== "volcano") continue;
    if (f.kind === "route") {
      const reach = (f.band || 20) + ((f.w || 5) >> 1) + 2;
      for (const [a, b] of routeLegs(f)) {
        const vert = a[0] === b[0];
        const lo = (vert ? Math.min(a[1], b[1]) : Math.min(a[0], b[0])) - reach;
        const hi = (vert ? Math.max(a[1], b[1]) : Math.max(a[0], b[0])) + reach;
        const along = vert ? y : x, across = vert ? x : y;
        if (along >= lo && along <= hi &&
            Math.abs(across - (vert ? a[0] : a[1])) <= reach) return true;
      }
    } else if (f.x0 !== undefined &&
               x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1) return true;
  }
  const WR = MD.volcano_regions;
  if (WR) for (const r of WR)
    if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
  return false;
}
function snowGround(x, y) {
  const t = terr[y * MW + x];
  if (t !== GRASS && t !== WALL) return false;
  if (!inWinter(x, y)) return false;
  return !(typeof inVolcano === "function" && inVolcano(x, y));
}
function soilAt(x, y) {
  if (typeof inWinter === "function" && inWinter(x, y) && SPR.wp_mid0) {
    const off = (a, b) => (a < 0 || b < 0 || a >= MW || b >= MH) ||
                          terr[b * MW + a] !== DIRT || !inWinter(a, b);
    if (off(x, y - 1) || off(x, y + 1) || off(x - 1, y) || off(x + 1, y)) {
      const sn = GROUND_SETS.snow;
      const w2 = (((x * 374761393) ^ (y * 668265263)) >>> 0) % sn.length;
      if (SPR[sn[w2]]) return sn[w2];
    }
    const set = GROUND_SETS.snow_track;
    const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
    if (SPR[set[v]]) return set[v];
  }
  if (typeof inSwamp === "function" && SPR.swd0) {
    if (swampRoadAt(x, y)) {
      const set = GROUND_SETS.swamp_soil;
      const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
      if (SPR[set[v]]) return set[v];
    }
  }
  return soilIn(x, y) || "dirt";
}
const realizedCache = new Map();
let editStamp = 0;
function worldChanged() { editStamp++; realizedCache.clear(); }
let featOrig = new Map();
let resetArmed = false;
let drawA = null, drawB = null;      /* live preview while a finger is down */
var drawPts = [];                   /* corners of a route bent mid-swipe */

const evn = (v) => v - (v & 1);      /* snap to the 2-tile grid everything uses */

function straighten(ax, ay, bx, by) {
  const dx = Math.abs(bx - ax), dy = Math.abs(by - ay);
  if (dx >= dy) return [evn(ax), evn(ay), evn(bx), evn(ay)];
  return [evn(ax), evn(ay), evn(ax), evn(by)];
}

function squareOf(ax, ay, bx, by) {
  let n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), TOWN_MIN);
  n = evn(n);
  const x0 = evn(Math.min(ax, bx < ax ? ax - n : ax));
  const y0 = evn(Math.min(ay, by < ay ? ay - n : ay));
  return [x0, y0, x0 + n, y0 + n];
}

function attachPoint(area, side) {
  const b = area.band || 6, r = area.road;
  const cx = r ? area.x0 + r.x : (area.x0 + area.x1) >> 1;
  const cy = r ? area.y0 + r.y : (area.y0 + area.y1) >> 1;
  return { w: [area.x0 + b, cy], e: [area.x1 - b, cy],
           n: [cx, area.y0 + b], s: [cx, area.y1 - b] }[side];
}

const RCELL = 4;

function areaRects(pad) {
  return features.filter(isArea).map(a => [a.x0 - pad, a.y0 - pad, a.x1 + pad, a.y1 + pad]);
}

function exitPoint(area, side, pad) {
  const r = area.road;
  const cx = r ? area.x0 + r.x : (area.x0 + area.x1) >> 1;
  const cy = r ? area.y0 + r.y : (area.y0 + area.y1) >> 1;
  return { w: [area.x0 - pad, cy], e: [area.x1 + pad, cy],
           n: [cx, area.y0 - pad], s: [cx, area.y1 + pad] }[side];
}

function findPath(a, b, blocks, corridors) {
  const gw = Math.ceil(MW / RCELL), gh = Math.ceil(MH / RCELL);
  const solid = new Uint8Array(gw * gh);
  for (const [x0, y0, x1, y1] of blocks)
    for (let gy = Math.max(0, y0 / RCELL | 0); gy <= Math.min(gh - 1, y1 / RCELL | 0); gy++)
      for (let gx = Math.max(0, x0 / RCELL | 0); gx <= Math.min(gw - 1, x1 / RCELL | 0); gx++)
        solid[gy * gw + gx] = 1;
  for (const [ca, cb] of corridors) {
    const x0 = Math.min(ca[0], cb[0]), x1 = Math.max(ca[0], cb[0]);
    const y0 = Math.min(ca[1], cb[1]), y1 = Math.max(ca[1], cb[1]);
    for (let gy = Math.max(0, y0 / RCELL | 0); gy <= Math.min(gh - 1, y1 / RCELL | 0); gy++)
      for (let gx = Math.max(0, x0 / RCELL | 0); gx <= Math.min(gw - 1, x1 / RCELL | 0); gx++)
        solid[gy * gw + gx] = 0;
  }
  const key = (p) => p[1] * gw + p[0];
  const sa = [Math.min(gw - 1, Math.max(0, a[0] / RCELL | 0)),
              Math.min(gh - 1, Math.max(0, a[1] / RCELL | 0))];
  const sb = [Math.min(gw - 1, Math.max(0, b[0] / RCELL | 0)),
              Math.min(gh - 1, Math.max(0, b[1] / RCELL | 0))];
  solid[key(sa)] = 0; solid[key(sb)] = 0;
  const prev = new Map([[key(sa), -1]]);
  const q = [sa];
  for (let h = 0; h < q.length; h++) {
    const [cx, cy] = q[h];
    if (cx === sb[0] && cy === sb[1]) break;
    for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
      if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
      const k = ny * gw + nx;
      if (solid[k] || prev.has(k)) continue;
      prev.set(k, cy * gw + cx);
      q.push([nx, ny]);
    }
  }
  if (!prev.has(key(sb))) return null;
  const cells = [];
  for (let k = key(sb); k !== -1; k = prev.get(k)) cells.push([k % gw, k / gw | 0]);
  cells.reverse();
  const pts = [a.slice()];
  for (let i = 1; i < cells.length - 1; i++)
    pts.push([cells[i][0] * RCELL + (RCELL >> 1), cells[i][1] * RCELL + (RCELL >> 1)]);
  pts.push(b.slice());
  const clean = [pts[0]];
  for (const pt of pts.slice(1)) {
    const last = clean[clean.length - 1];
    if (pt[0] !== last[0] && pt[1] !== last[1]) clean.push([pt[0], last[1]]);
    const t = clean[clean.length - 1];
    if (pt[0] !== t[0] || pt[1] !== t[1]) clean.push(pt);
  }
  const out = [];
  for (let i = 0; i < clean.length - 1; i++) out.push([clean[i], clean[i + 1]]);
  return out;
}

const _legCache = new Map();
function routeLegs(f) {
  const ck = f.id + ":" + editStamp;
  const copy = ls => ls.map(([a, b]) => [[a[0], a[1]], [b[0], b[1]]]);
  const hit = _legCache.get(ck);
  if (hit) return copy(hit);
  const res = _routeLegs(f);
  if (_legCache.size > 4096) _legCache.clear();
  _legCache.set(ck, res);
  return copy(res);
}
function _routeLegs(f) {
  if (f.pts && f.pts.length >= 2) {
    const out = [];
    for (let i = 0; i < f.pts.length - 1; i++) {
      const a = f.pts[i], b = f.pts[i + 1];
      if (a[0] !== b[0] || a[1] !== b[1]) out.push([a.slice(), b.slice()]);
    }
    if (out.length) return out;
  }
  const byId = new Map(features.map(x => [x.id, x]));
  let p0 = [f.x0, f.y0], p1 = [f.x1, f.y1];
  const s0 = f.a0, s1 = f.a1;
  const a0 = s0 && byId.get(s0.area), a1 = s1 && byId.get(s1.area);
  const facing = (me, other) => {
    const mx = (me.x0 + me.x1) / 2, my = (me.y0 + me.y1) / 2;
    const ox = (other.x0 + other.x1) / 2, oy = (other.y0 + other.y1) / 2;
    if (Math.abs(ox - mx) >= Math.abs(oy - my)) return ox > mx ? "e" : "w";
    return oy > my ? "s" : "n";
  };
  let side0 = s0 && s0.side, side1 = s1 && s1.side;
  if (a0 && a1) { side0 = facing(a0, a1); side1 = facing(a1, a0); }
  if (a0) p0 = attachPoint(a0, side0).slice();
  if (a1) p1 = attachPoint(a1, side1).slice();
  const w = f.w || 5, pad = (w >> 1) + 1 + RCELL;

  if (!a0 && !a1) {
    if (p0[0] === p1[0] || p0[1] === p1[1]) return [[p0, p1]];
    return [[p0, [p1[0], p0[1]]], [[p1[0], p0[1]], p1]];
  }
  const e0 = a0 ? exitPoint(a0, side0, pad).slice() : p0;
  const e1 = a1 ? exitPoint(a1, side1, pad).slice() : p1;
  const corridors = [];
  if (a0) corridors.push([p0, e0]);
  if (a1) corridors.push([e1, p1]);
  let mid = findPath(e0, e1, areaRects((w >> 1) + 1), corridors);
  if (!mid) mid = (e0[0] !== e1[0] && e0[1] !== e1[1])
    ? [[e0, [e1[0], e0[1]]], [[e1[0], e0[1]], e1]] : [[e0, e1]];
  const legs = [];
  if (a0) legs.push([p0, e0]);
  for (const m of mid) legs.push(m);
  if (a1) legs.push([e1, p1]);
  return legs.filter(([x, y]) => x[0] !== y[0] || x[1] !== y[1]);
}

function inClearing(x, y) {
  for (const a of features) {
    if (!isArea(a)) continue;
    if (a.wild) continue;
    if (a.meadow) {                 /* no treeline: clear to its rim and beyond */
      if (x >= a.x0 - 12 && x <= a.x1 + 12 && y >= a.y0 - 12 && y <= a.y1 + 12)
        return true;
      continue;
    }
    const b = a.band || 6;
    if (x >= a.x0 + b && x <= a.x1 - b && y >= a.y0 + b && y <= a.y1 - b) return true;
  }
  return false;
}

let lineTiles = new Set();

