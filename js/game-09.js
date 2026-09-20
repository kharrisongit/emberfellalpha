function padInputIds(e) {
  if (e && e.pointerId !== undefined) return ["p" + e.pointerId];
  if (e && e.changedTouches)
    return Array.from(e.changedTouches, touch => "t" + touch.identifier);
  return ["m"];
}

function releasePadInputs(e) {
  for (const id of padInputIds(e)) {
    const el = padHeld.get(id);
    if (el) el.classList.remove("hit");
    padHeld.delete(id);
  }
  if (!padHeld.size)
    document.querySelectorAll("#dpad .hit").forEach(el => el.classList.remove("hit"));
  padAim();
}

function padAim() {
  if(fishing){padDx=padDy=0;return;}
  const cameraLocked = cameraOwnsView();
  if (!cameraLocked && !mapGesturesAllowed()) camFree = false;
  let dx = 0, dy = 0;
  for (const el of padHeld.values()) {
    dx += +el.dataset.dx || 0;
    dy += +el.dataset.dy || 0;
  }
  if (!cameraLocked && (dx || dy) && (camFree || (typeof devUnlocked !== "undefined" && devUnlocked))) {
    camFree = false;
    devUnlocked = false;
    if (typeof recentreOnCorin === "function") recentreOnCorin();
  }
  padDx = Math.max(-1, Math.min(1, dx));
  padDy = Math.max(-1, Math.min(1, dy));
}

function padBind() {
  const pad = document.getElementById("dpad");
  const cells = [];
  for (const el of (pad.querySelectorAll ? pad.querySelectorAll("div") : (pad.children || [])))
    if (el.dataset && el.dataset.dx !== undefined) cells.push(el);

  for (const el of cells) {
    const press = (e) => {
      const dy = parseInt(el.dataset.dy, 10) || 0;
      const dx = parseInt(el.dataset.dx, 10) || 0;
      if(atlasOpen){atlasMove(dx,dy);e?.preventDefault();return;}
      if (typeof ask !== "undefined" && ask) {
        if (dx && ask.quantity) changePurchaseQuantity(dx > 0 ? 1 : -1);
        if (dy) askStep(dy > 0 ? 1 : -1);
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
      if (typeof bagOpen !== "undefined" && bagOpen) {
        if (dy) bagStep(dy > 0 ? 4 : -4);
        else if (dx) bagStep(dx > 0 ? 1 : -1);
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
      if (typeof ovl !== "undefined" && ovl) {
        if (dy) ovlStep(dy > 0 ? 1 : -1);
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
      for (const id of padInputIds(e)) padHeld.set(id, el);
      el.classList.add("hit");
      padAim();
      if (e && e.preventDefault) e.preventDefault();
    };
    const release = (e) => {
      releasePadInputs(e);
      if (e && e.preventDefault) e.preventDefault();
    };
    if (padTouchMode) {
      el.addEventListener("touchstart", e => {
        // A new finger press is also a hard recovery point for any stale state
        // left by the surrounding iOS browser chrome.
        clearPadInputs();
        press(e);
      }, { passive: false });
      el.addEventListener("touchend", release, { passive: false });
      el.addEventListener("touchcancel", e => {
        clearPadInputs();
        if (e && e.preventDefault) e.preventDefault();
      }, { passive: false });
    } else {
      el.addEventListener("mousedown", press);
      el.addEventListener("mouseup", release);
      el.addEventListener("mouseleave", release);
    }
  }

  // Touch devices get touch handlers only. Registering mouse or pointer handlers
  // for the same iPhone press creates a second held direction in ChatGPT's
  // embedded browser.
  if (padTouchMode) {
    const finishTouch = e => {
      releasePadInputs(e);
      if (!e.touches || e.touches.length === 0) clearPadInputs();
    };
    document.addEventListener("touchend", finishTouch, { capture:true, passive:true });
    window.addEventListener("touchend", finishTouch, { capture:true, passive:true });
    document.addEventListener("touchcancel", clearPadInputs, { capture:true, passive:true });
    window.addEventListener("touchcancel", clearPadInputs, { capture:true, passive:true });
  } else {
    window.addEventListener("mouseup", releasePadInputs);
  }
  window.addEventListener("blur", clearPadInputs);
  window.addEventListener("pagehide", clearPadInputs);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearPadInputs();
  });
}

function bindHold(id, onDown, onUp) {
  const el = document.getElementById(id);
  if (!el) { (window.__boot = (window.__boot || "") +
              "\nbindHold: no element #" + id); return; }
  const down = (e) => {
    el.classList.add("hit"); onDown();
    if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }
  };
  const up = (e) => {
    el.classList.remove("hit"); if (onUp) onUp();
    if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }
  };
  el.addEventListener("touchstart", down, { passive: false });
  el.addEventListener("touchend", up, { passive: false });
  el.addEventListener("touchcancel", up, { passive: false });
  el.addEventListener("mousedown", down);
  el.addEventListener("mouseup", up);
}

const SCROLLERS = ["toolbody", "bagLeft", "bagPanel", "bagRows", "bagAsk"];

function scrollerFor(node) {
  for (let el = node; el && el !== document.body; el = el.parentNode) {
    if (el.id && SCROLLERS.includes(el.id)) return el;
    if (el.classList && el.classList.contains("scrolls")) return el;
  }
  return null;
}
const isSideways = () => false;

let lockY = 0, lockX = 0, lockEl = null;
document.addEventListener("touchstart", e => {
  lockEl = scrollerFor(e.target);
  lockY = e.touches[0] ? e.touches[0].clientY : 0;
  lockX = e.touches[0] ? e.touches[0].clientX : 0;
  if (lockEl) {
    if (isSideways(lockEl)) {
      const max = lockEl.scrollWidth - lockEl.clientWidth;
      if (max > 0) {
        if (lockEl.scrollLeft <= 0) lockEl.scrollLeft = 1;
        else if (lockEl.scrollLeft >= max) lockEl.scrollLeft = max - 1;
      }
    } else {
      const max = lockEl.scrollHeight - lockEl.clientHeight;
      if (max > 0) {
        if (lockEl.scrollTop <= 0) lockEl.scrollTop = 1;
        else if (lockEl.scrollTop >= max) lockEl.scrollTop = max - 1;
      }
    }
  }
}, { passive: true });

document.addEventListener("touchmove", e => {
  if (!e.cancelable) return;
  const el = lockEl || scrollerFor(e.target);
  if (!el) { e.preventDefault(); return; }        /* not a scroller: swallow */
  const t0 = e.touches[0];
  if (!lockEl) {            /* the start was swallowed: begin from here */
    lockEl = el;
    lockX = t0 ? t0.clientX : 0;
    lockY = t0 ? t0.clientY : 0;
    return;
  }
  if (isSideways(el)) {
    const dx = (t0 ? t0.clientX : lockX) - lockX;
    const max = el.scrollWidth - el.clientWidth;
    const atL = el.scrollLeft <= 1, atR = el.scrollLeft >= max - 1;
    if (max <= 0 || (atL && dx > 0) || (atR && dx < 0)) e.preventDefault();
    return;
  }
  const dy = (t0 ? t0.clientY : lockY) - lockY;
  const max = el.scrollHeight - el.clientHeight;
  const atTop = el.scrollTop <= 1, atEnd = el.scrollTop >= max - 1;
  if (max <= 0 || (atTop && dy > 0) || (atEnd && dy < 0)) e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", () => { lockEl = null; }, { passive: true });
cv.addEventListener("touchstart", e => {
  if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();return;}
  if (collideView && !geometryPan) {
    for (const t of e.changedTouches) collideTap(t.clientX, t.clientY);
    e.preventDefault(); return;
  }
  for (const t of e.changedTouches) mapTouchStart(t);
  e.preventDefault();
}, { passive: false });
cv.addEventListener("mousedown", e => {
  if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();return;}
  if (collideView && !geometryPan) { collideTap(e.clientX, e.clientY); e.preventDefault(); }
});

cv.addEventListener("touchmove", e => {
  if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();return;}
  for (const t of e.changedTouches) mapTouchMove(t);
  e.preventDefault();
}, { passive: false });

function endTouch(e) {
  for (const t of e.changedTouches) mapTouchEnd(t);
  e.preventDefault();
}
cv.addEventListener("touchend", endTouch, { passive: false });
cv.addEventListener("touchcancel", endTouch, { passive: false });

const touches = new Map();
let dragObj = null, dragMoved = false, pinchD = 0, pinchZ = 0;
function mapGesturesAllowed() {
  if(fishing)return false;
  const on = (v) => (typeof v !== "undefined" && v);
  return on(typeof devUnlocked !== "undefined" && devUnlocked)
      || on(typeof devOpen !== "undefined" && devOpen)
      || on(typeof painting !== "undefined" && painting)
      || on(typeof building !== "undefined" && building)
      || on(typeof editing !== "undefined" && editing)
}
let finePlace = false;
let pinchMx = null, pinchMy = null;

function screenToWorld(cx, cy) {
  return { x: cam.x + cx / cam.z, y: cam.y + cy / cam.z };
}
const FABRIC = /^(ifloor|iwall_|vc_c|sw_wall3|gw_trim|dg_floor)/;

const BACKDROP = /^(sw_gnd|sw_dirt|mtn_3_|rc_walls|rc_floor|sw_wall)/;
const MOUNTAIN = /^(mtn_|mts_|mtv_|vmt_|mtd_|mtw_|mte_)/;
function pickObject(wx, wy) {
  const actor=pickEditorActor(wx,wy);if(actor)return actor;
  let best = null, bestArea = 1e9;
  const grabbable = nm => nm && !BACKDROP.test(nm);
  let fab = null, fabArea = 1e9;
  for (const o of objs.concat(fobjs)) {
    if (deleted.has(o.id) || hidden.has(o.id)) continue;
    const s = SPR[NAMES[o.s]];
    if (!s) continue;      /* nothing there to stand in the way of */
    if (!grabbable(NAMES[o.s])) continue;
    const x0 = o.x + (o.wx || 0) - s[2] / 2, y0 = o.y + (o.wy || 0) - s[3];
    if (wx < x0 || wx > x0 + s[2] || wy < y0 || wy > y0 + s[3]) continue;
    const a = s[2] * s[3];
    if (FABRIC.test(NAMES[o.s])) {
      if (a < fabArea) { fabArea = a; fab = o; }
    } else if (a < bestArea) { bestArea = a; best = o; }
  }
  const layers = [["s", scat], ["a", sanm]];
  for (const [tag, arr] of layers)
    for (let i = 0; i < arr.length; i += 3) {
      const key = tag + i;
      if (decorGone.has(key)) continue;
      const sp = SPR[NAMES[arr[i]]]; if (!sp) continue;
      if (MOUNTAIN.test(NAMES[arr[i]])) continue;
      if (!grabbable(NAMES[arr[i]])) continue;
      const x0 = arr[i + 1] - sp[2] / 2, y0 = arr[i + 2] - sp[3];
      if (wx < x0 || wx > x0 + sp[2] || wy < y0 || wy > y0 + sp[3]) continue;
      const a = /^(shc_|shcap_|cliff_|sett_|ifloor_|iwall_|cvf|cvrub_)/.test(NAMES[arr[i]])
                ? 1e8 : sp[2] * sp[3];
      const hit = { decor: tag, di: i, s: arr[i], x: arr[i + 1], y: arr[i + 2],
                    id: "decor:" + key };
      if (FABRIC.test(NAMES[arr[i]])) {
        if (a < fabArea) { fabArea = a; fab = hit; }
      } else if (a < bestArea) { bestArea = a; best = hit; }
    }
  return best || fab;
}
function mapTouchStart(t) {
  touches.set(t.identifier, { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY });
  if (touches.size === 2) {
    if (typeof devUnlocked !== "undefined" && !devUnlocked) devUnlocked = true;
    const [a, b] = [...touches.values()];
    pinchD = Math.hypot(a.x - b.x, a.y - b.y); pinchZ = cam.z; dragObj = null;
    pinchMx = (a.x + b.x) / 2; pinchMy = (a.y + b.y) / 2;
    if (grabDrag) { grabDrag = null; }
    if (grabRect && grabRect.anchor && grabRect.x0 === grabRect.x1 &&
        grabRect.y0 === grabRect.y1) grabRect = null;   /* an unstarted box */
    return;
  }
  dragMoved = false;
  if (building && grabMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    const tx = Math.floor(w.x / TS), ty = Math.floor(w.y / TS);
    if (grabRect && tx >= grabRect.x0 && tx <= grabRect.x1 &&
        ty >= grabRect.y0 && ty <= grabRect.y1) {
      grabDrag = { sx: w.x, sy: w.y, dx: 0, dy: 0 };     /* move it */
    } else {
      grabRect = { x0: tx, y0: ty, x1: tx, y1: ty, anchor: [tx, ty] };
      grabDrag = null;
    }
    return;
  }
  if (building && arenaMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    placeArena(w.x, w.y);
    return;
  }
  if (building && areaMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    const f = areaAt(w.x, w.y);
    pickedArea = f || null;
    areaDrag = f ? { sx: w.x, sy: w.y, x0: f.x0, y0: f.y0 } : null;
    refreshBuild();
    return;
  }
  if (building && drawArmed) {
    const w = screenToWorld(t.clientX, t.clientY);
    drawA = [Math.floor(w.x / TS), Math.floor(w.y / TS)];
    drawB = drawA.slice();
    drawPts = [drawA.slice()];
    return;
  }
  if (painting) {
    if (!stroke) stroke = new Map();
    const w = screenToWorld(t.clientX, t.clientY);
    paintAt(w.x, w.y);
    return;
  }
  if (editing) {
    const w = screenToWorld(t.clientX, t.clientY);
    const hit = pickObject(w.x, w.y);
    if (hit) {
      dragObj = hit;
      selected = hit; refreshSel();
    }
  }
}
function mapTouchMove(t) {
  const p = touches.get(t.identifier); if (!p) return;
  const dx = t.clientX - p.x, dy = t.clientY - p.y;
  p.x = t.clientX; p.y = t.clientY;
  if (Math.hypot(t.clientX - p.sx, t.clientY - p.sy) > 6) dragMoved = true;
  if (touches.size === 2) {
    const [a, b] = [...touches.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (pinchMx !== null) { cam.x -= (mx - pinchMx) / cam.z; cam.y -= (my - pinchMy) / cam.z; }
    pinchMx = mx; pinchMy = my;
    if (pinchD > 0 && mapGesturesAllowed()) { setZoom(pinchZ * (d / pinchD), mx, my); camFree = true; }
    clampCam();
    return;
  }
  if (building && grabMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    const tx = Math.floor(w.x / TS), ty = Math.floor(w.y / TS);
    if (grabDrag) {
      grabDrag.dx = Math.round((w.x - grabDrag.sx) / TS);
      grabDrag.dy = Math.round((w.y - grabDrag.sy) / TS);
    } else if (grabRect) {
      const [ax, ay] = grabRect.anchor;
      grabRect.x0 = Math.min(ax, tx); grabRect.x1 = Math.max(ax, tx);
      grabRect.y0 = Math.min(ay, ty); grabRect.y1 = Math.max(ay, ty);
    }
    return;
  }
  if (building && areaMode) {
    if (areaDrag && pickedArea) {
      const w = screenToWorld(t.clientX, t.clientY);
      areaDrag.dx = Math.round((w.x - areaDrag.sx) / TS);
      areaDrag.dy = Math.round((w.y - areaDrag.sy) / TS);
    }
    return;
  }
  if (building && drawArmed) {
    if (drawA) {
      const w = screenToWorld(t.clientX, t.clientY);
      drawB = [Math.floor(w.x / TS), Math.floor(w.y / TS)];
      if (buildTool === "route" && drawPts.length) {
        const last = drawPts[drawPts.length - 1];
        const dx = drawB[0] - last[0], dy = drawB[1] - last[1];
        const along = Math.abs(dx) >= Math.abs(dy);
        const run = along ? Math.abs(dx) : Math.abs(dy);
        const off = along ? Math.abs(dy) : Math.abs(dx);
        if (run >= 10 && off >= 8)
          drawPts.push(along ? [drawB[0], last[1]] : [last[0], drawB[1]]);
      }
    }
    return;
  }
  if (painting) {
    const w = screenToWorld(t.clientX, t.clientY);
    paintAt(w.x, w.y);
    return;
  }
  if (dragObj) {
    if(moveEditorActor(dragObj,dragObj.x+dx/cam.z,dragObj.y+dy/cam.z))return;
    if (dragObj.feat) {
      const tx = Math.floor(dragObj.x / TS), ty = Math.floor((dragObj.y - 1) / TS);
      const key = tx + "," + ty;
      if (!felled.has(key)) { felled.add(key); felledNew.push(key); }
      const copy = { id: ORIG.length + added.length, s: dragObj.s,
                     x: dragObj.x, y: dragObj.y };
      objs.push(copy);
      added.push(copy);
      worldChanged(); realizeFeatures(); rebuildBuckets(); rebuildSolid();
      reindex(); indexScatter(); chunks.clear();
      dragObj = copy; selected = copy; refreshSel();
    }
    dragObj.x += dx / cam.z; dragObj.y += dy / cam.z;
    dragObj.x = Math.max(0, Math.min(PXW, dragObj.x));
    dragObj.y = Math.max(0, Math.min(PXH, dragObj.y));
    if (dragObj.decor) {
      const arr = dragObj.decor === "s" ? scat : sanm;
      const _mk = dragObj.decor + dragObj.di;
      if (!decorMoved.has(_mk))
        decorMoved.set(_mk, { tag: dragObj.decor, di: dragObj.di,
                              s: arr[dragObj.di],
                              x0: arr[dragObj.di + 1], y0: arr[dragObj.di + 2] });
      arr[dragObj.di + 1] = Math.round(dragObj.x);
      arr[dragObj.di + 2] = Math.round(dragObj.y);
      const md = dragObj.decor === "s" ? MD.scatter : MD.sanim;
      if (md) { md[dragObj.di + 1] = arr[dragObj.di + 1];
                md[dragObj.di + 2] = arr[dragObj.di + 2]; }
      indexScatter(); rebuildBuckets(); chunks.clear();
    }
    mapDirty = true;
    return;
  }
  if (!mapGesturesAllowed()) return;
  cam.x -= dx / cam.z; cam.y -= dy / cam.z; camFree = true; clampCam();
}
function mapTouchEnd(t) {
  const p = touches.get(t.identifier);
  touches.delete(t.identifier);
  if (touches.size < 2) { pinchD = 0; pinchMx = null; pinchMy = null; }
  if (building && grabMode) {
    if (touches.size === 0 && grabDrag && grabRect) {
      moveRegion(grabRect, grabDrag.dx || 0, grabDrag.dy || 0);
      grabDrag = null;
    }
    return;
  }
  if (building && areaMode) {
    if (touches.size === 0 && areaDrag && pickedArea &&
        (areaDrag.dx || areaDrag.dy))
      moveArea(pickedArea, areaDrag.dx || 0, areaDrag.dy || 0);
    areaDrag = null;
    return;
  }
  if (building && drawArmed) {
    if (touches.size === 0 && drawA && drawB) commitFeature();
    return;
  }
  if (painting) {
    if (touches.size === 0 && groundDirty) { groundDirty = false; finishPaint(); }
    return;
  }
  if (dragObj) {
    if(editorActorInfo(dragObj)){
      const x=finePlace?Math.round(dragObj.x):Math.round((dragObj.x-TS/2)/TS)*TS+TS/2;
      const y=finePlace?Math.round(dragObj.y):Math.round(dragObj.y/TS)*TS;
      moveEditorActor(dragObj,x,y,true);refreshSel();dragObj=null;return;
    }
    if (!finePlace) {
      dragObj.x = Math.round((dragObj.x - TS / 2) / TS) * TS + TS / 2;
      dragObj.y = Math.round(dragObj.y / TS) * TS;
    } else {
      dragObj.x = Math.round(dragObj.x);
      dragObj.y = Math.round(dragObj.y);
    }
    reindex(); refreshSel(); dragObj = null; return;
  }
}
function fitZoom() { return Math.min(VW / PXW, VH / PXH); }
function overviewZoom() {
  return Math.max(fitZoom(), Math.max(VW / PXW, VH / PXH) * 1.6);
}
function setZoom(z, ax, ay) {
  const minZ = fitZoom();
  const nz = Math.max(minZ, Math.min(6, z));
  const w = screenToWorld(ax, ay);
  cam.z = nz;
  cam.x = w.x - ax / nz; cam.y = w.y - ay / nz;
  clampCam(); mapDirty = true;
}
function clampCam() {
  const vw = VW / cam.z, vh = VH / cam.z;
  const slackX = building ? vw * 0.9 : 0, slackY = building ? vh * 0.9 : 0;
  cam.x = vw >= PXW + slackX ? (PXW - vw) / 2
        : Math.max(-slackX * 0.15, Math.min(PXW + slackX - vw, cam.x));
  cam.y = vh >= PXH + slackY ? (PXH - vh) / 2
        : Math.max(-slackY * 0.15, Math.min(PXH + slackY - vh, cam.y));
}

let mDown = false;
cv.addEventListener("mousedown", e => {
  if(!geometryPan&&(doorEdit||collideView))return;
  mDown = true;
  mapTouchStart({ identifier: "m", clientX: e.clientX, clientY: e.clientY });
});
cv.addEventListener("mousemove", e => {
  if (mDown) mapTouchMove({ identifier: "m", clientX: e.clientX, clientY: e.clientY });
});
addEventListener("mouseup", e => {
  if (!mDown) return; mDown = false;
  mapTouchEnd({ identifier: "m", clientX: e.clientX, clientY: e.clientY });
});
cv.addEventListener("wheel", e => {
  setZoom(cam.z * (e.deltaY < 0 ? 1.12 : 0.89), e.clientX, e.clientY);
  e.preventDefault();
}, { passive: false });

const anims = [];
const bolts = [];

function playOnce(prefix, count, x, y, fps, hold) {
  anims.push({ prefix, count, x, y, fps, hold, t: 0 });
}

function burstAt(art, dir, x, y) {
  const nm = art + "_" + dir;
  if (SPR[nm]) playOnce(nm, SPR[nm][4], x, y, 16, false);
}
const GLASS_GIF_FRAMES = [EMBERFELL_ASSETS.a0842, EMBERFELL_ASSETS.a0843, EMBERFELL_ASSETS.a0844, EMBERFELL_ASSETS.a0845, EMBERFELL_ASSETS.a0846, EMBERFELL_ASSETS.a0847, EMBERFELL_ASSETS.a0848, EMBERFELL_ASSETS.a0849, EMBERFELL_ASSETS.a0850];
const glassGifImgs = GLASS_GIF_FRAMES.map(src=>{ const im=new Image(); im.src=src; return im; });
let glassGifStart=-99;
function glassShieldRaised() { return glassShield && glassShieldHeld && inFight() && !mounted && !dying(); }
function glassShieldActive() { return glassShieldRaised() && tAcc <= glassShieldWindowUntil; }
function glassAttackUnblockable(f) { return !!(f && f.unblockableAttack); }
function beginEnemyWindup(f) {
  f.attackSeq = (f.attackSeq || 0) + 1;
  // Every fourth meaningful attack is a heavy, unblockable strike. The red flash is the warning.
  f.unblockableAttack = ((f.attackSeq % 4) === 0 && ((FOE[f.kind]||{}).dmg >= 2));
}
function queueGlassShieldBlock(f) {
  if (!f || f.st !== "wind" || f.st === "dead" || glassAttackUnblockable(f)) return false;
  f.glassParryQueued = true;
  f.glassParryPlayerX = P.x; f.glassParryPlayerY = P.y;
  // Do not play the effect yet. B only arms the block during the orange tell.
  // The GIF begins at the exact attack-impact frame below.
  return true;
}
function glassShieldDeflectFoe(f) {
  // A correctly timed B press reserves the block during wind-up. At the exact
  // frame the attack would deal damage, suppress damage, play the shield GIF,
  // and immediately start the enemy's bounce away from Corin.
  if (!f || !f.glassParryQueued || glassAttackUnblockable(f)) return false;
  f.glassParryQueued = false;
  glassShieldPulse = .42;
  glassGifStart = tAcc;
  f.retreat = Math.max(f.retreat || 0, 1.55);
  f.retreatX = f.glassParryPlayerX === undefined ? P.x : f.glassParryPlayerX;
  f.retreatY = f.glassParryPlayerY === undefined ? P.y : f.glassParryPlayerY;
  f.glassRetreatBoost = 4.25;
  f.cool = Math.max(f.cool || 0, 1.05);
  // The block resolves on the attack's contact frame. Switch straight into
  // retreat movement here so recoil starts NOW instead of waiting for the
  // remainder of the swing state to finish. Damage has already been suppressed.
  f.st = "walk";
  f.t = 0;
  f.hit = 1;
  f.hitDone = 1;
  f.unblockableAttack = false;
  return true;
}
function finishGlassShieldParry(f) {
  // Recoil now begins on the attack's actual hit frame, not at swing-end.
  // Keep this cleanup for attacks that never reached their target.
  if (!f || !f.glassParryQueued) return false;
  f.glassParryQueued = false;
  return false;
}
function tryGlassShieldParry() {
  if (!glassShield || !inFight() || mounted || dying()) return false;
  let caught = false;
  // B during the orange telegraph reserves the block. The enemy is allowed to finish its attack animation.
  for (const f of foes) {
    if (!f || f.st !== "wind" || glassAttackUnblockable(f)) continue;
    const k = FOE[f.kind] || {};
    const d = Math.hypot(P.x - f.x, P.y - f.y);
    const range = Math.max(72, (k.reach || 30) + 54);
    if (d <= range && queueGlassShieldBlock(f)) caught = true;
  }
  return caught;
}
function drawGlassShield() {
  // Only show the large impact-flash portion of the supplied GIF. The smaller
  // lead-in/tail frames made a successful block feel delayed and too long.
  const elapsed=Math.max(0,tAcc-glassGifStart);
  const flashFrames=[3,4,5];
  const flashDuration=.15;
  if (glassShieldPulse <= 0 && elapsed>flashDuration) return;
  if (elapsed>flashDuration) return;
  const idx=flashFrames[Math.min(flashFrames.length-1,Math.floor(elapsed/(flashDuration/flashFrames.length)))];
  const im=glassGifImgs[idx];
  if(!im || !im.complete) return;
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.globalAlpha=.96;
  // The supplied GIF's actual frames, centered over Corin. No generated replacement effect.
  const w=90,h=78;
  ctx.drawImage(im,P.x-w/2,P.y-18-h/2,w,h);
  ctx.restore();
}
function drawEnemyAttackTell(f,s2,fr,dx,dy,scale=1){
  if(!f || f.st!=="wind" || f.st==="dead") return;
  const k=FOE[f.kind]||{};
  const wind=GLASS_TELEGRAPH_WINDOW;
  const p=Math.max(0,Math.min(1,f.t/wind));
  const blink=.28+.52*(.5+.5*Math.sin(tAcc*24));
  const col=glassAttackUnblockable(f)?"#ff2424":"#ff9a22";
  ctx.save();ctx.globalCompositeOperation="lighter";ctx.globalAlpha=blink*(.55+.35*p);
  const tint=tintFoe(s2,fr,col,.9);
  drawGameImage(ctx,tint,0,0,s2[2],s2[3],dx,dy,Math.round(s2[2]*scale),Math.round(s2[3]*scale));
  ctx.restore();
}
function stepBolts(dt) {
  if (glassShieldPulse > 0) glassShieldPulse = Math.max(0, glassShieldPulse - dt);
  if (foesHeld) return;
  if (bossScene) return;
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i];
    b.t += dt;
    const step = b.sp * dt;
    const nx = b.x + b.vx * step, ny = b.y + b.vy * step;
    if (isSolid(nx, ny)) { burstAt(b.art, b.dir, b.x, b.y); bolts.splice(i, 1); continue; }
    b.x = nx; b.y = ny;
    if (b.targetDragon && !dragon.down && dragonHere() &&
        Math.hypot(dragon.x - b.x, dragon.y - 8 - b.y) < 18) {
      burstAt(b.art, b.dir, b.x, b.y);
      hurtDragon(b.dmg);
      bolts.splice(i, 1); continue;
    }
    if (!b.targetDragon && Math.hypot(P.x - b.x, (P.y - 8) - b.y) < 11) {
      if (glassShieldActive() && !b.unblockable) {
        glassShieldPulse = .42; burstAt(b.art, b.dir, b.x, b.y);
        const dx=b.x-P.x,dy=b.y-(P.y-8),d=Math.hypot(dx,dy)||1;
        b.vx=dx/d; b.vy=dy/d; b.targetDragon=false; b.t=0; b.x+=b.vx*10; b.y+=b.vy*10;
        continue;
      }
      burstAt(b.art, b.dir, b.x, b.y);
      hurtPlayer(b.dmg);
      bolts.splice(i, 1); continue;
    }
    if (b.t > b.life) bolts.splice(i, 1);
  }
}
function stepAnims(dt) {
  for (let i = anims.length - 1; i >= 0; i--) {
    const a = anims[i];
    a.t += dt * a.fps;
    if (a.t >= a.count) {
      if (a.hold) a.t = a.count - 0.001;   /* rest on the last frame */
      else anims.splice(i, 1);             /* or fade from the world */
    }
  }
}

var dragonFacingLocked = false;
const dragon = { x: 0, y: 0, t: 0, _dir: "s", on: true,
  get dir() { return this._dir; },
  set dir(v) { if (!dragonFacingLocked) this._dir = v; },
  moving: false, fly: 0, air: true, tr: null, gait: 0,
  hp: 20, maxHp: 20, hurt: 0, inv: 0, down: false,
  knockdown: 0, knockdownMax: 1.2 };
const DG_FOOT_W = 9, DG_FOOT_H = 5;      /* its feet, the same idea as his */
function dragonCanStand(x, y) {
  const hw = DG_FOOT_W / 2;
  arenaPass = true;
  const blocked = isSolid(x - hw, y - DG_FOOT_H) || isSolid(x + hw, y - DG_FOOT_H) ||
                  isSolid(x - hw, y - 1) || isSolid(x + hw, y - 1);
  arenaPass = false;
  return !blocked;
}
function dragonAirborne() { return dragon.air && !dragon.tr; }
function dragonStep(dx, dy) {
  if (breath) return;
  if (dragonAirborne()) { dragon.x += dx; dragon.y += dy; return; }
  if (dx && dragonCanStand(dragon.x + dx, dragon.y)) dragon.x += dx;
  if (dy && dragonCanStand(dragon.x, dragon.y + dy)) dragon.y += dy;
}
function dragonHover() { return dragonAirborne() ? 26 : 0; }
function dragonBob() { return dragonAirborne() ? Math.sin(dragon.t * 2.2) * 3 : 0; }
function dragonGround(x, y) {
  if (arenaLock && arenaT > 0.25) {
    const cx = arenaLock.x * TS + TS / 2, cy = arenaLock.y * TS + TS / 2;
    const lim = (arenaLock.r - 1) * TS;
    const ox = x - cx, oy = y - cy, od = Math.hypot(ox, oy);
    if (od > lim) { x = cx + (ox / od) * lim; y = cy + (oy / od) * lim; }
  }
  if (dragonCanStand(x, y)) { dragon.x = x; dragon.y = y; return true; }
  for (let r = 6; r <= 56; r += 6)
    for (let a = 0; a < 12; a++) {
      const t = a * Math.PI / 6;
      const nx = x + Math.cos(t) * r, ny = y + Math.sin(t) * r;
      if (arenaLock && arenaT > 0.25) {
        const cx = arenaLock.x * TS + TS / 2, cy = arenaLock.y * TS + TS / 2;
        if (Math.hypot(nx - cx, ny - cy) > (arenaLock.r - 1) * TS) continue;
      }
      if (dragonCanStand(nx, ny)) { dragon.x = nx; dragon.y = ny; return true; }
    }
  return false;
}
function refreshWingBtn() {
  const b = document.getElementById("btnWing");
  if (!b) return;
  const up = dragon.tr ? dragon.tr.to : dragon.air;
  b.textContent = up ? "FLY" : "WALK";
  b.classList.toggle("ground", !up);
}
function startTransition(kind, to) {
  const sp = SPR["dr5_" + kind + "_" + dragon.dir];
  dragon.tr = { kind, to, t: 0, n: sp ? sp[4] : 1 };
  refreshWingBtn();
}
function stepTransition(dt) {
  const tr = dragon.tr;
  if (!tr) return;
  tr.t += dt * DRAGON_ANIM.tr;
  if (tr.t < tr.n) return;
  dragon.tr = null;
  dragon.air = tr.to;
  refreshWingBtn();
}
function setDragonAir(on) {
  if (dragon.down) { toast("the dragon is too hurt to move"); return; }
  if (dragon.tr || on === dragon.air) return;
  if (!on) {
    if (!dragonGround(dragon.x, dragon.y + 18)) {
      toast("nowhere to set down here");
      return;
    }
    dragon.air = false;
    startTransition("down", false);
    toast("the dragon comes down beside him");
  } else {
    startTransition("up", true);
    toast("the dragon takes to the air");
  }
}
const DRAGON_ANIM = { idle: 3.5, walk: 6, fly: 3, tr: 15,
                      stride: 10, go: 12, hold: 0.18 };
function dragonFlip(dir) {
  return dir === "w" && !SPR["dr5_idle_w"];
}
const DRAGON_DRAW_SCALE = 0.42;
const KING_DRAGON_DRAW_SCALE = DRAGON_DRAW_SCALE * 1.25;
/* Death source frames are 128px rather than the living sheet's 176px cells.
   Normalize them so the collapse does not make the boss visibly shrink. */
const KING_DRAGON_DEATH_DRAW_SCALE = KING_DRAGON_DRAW_SCALE * (176 / 128);
function dragonSprite(dir) {
  dir=cardinalDirection(dir);
  if (dir === "w" && !SPR["dr5_idle_w"]) dir = "e";
  if (!dragonReady) return SPR["dr3_" + dir] || SPR["dr3_s"];
  if (dragon.down) return SPR["dr5_idle_" + dir] || SPR["dr3_" + dir] || SPR["dr3_s"];
  if (dragon.tr) {
    const sp = SPR["dr5_" + dragon.tr.kind + "_" + dir];
    if (sp) return sp;
  }
  const firing = !!breath;
  if (dragon.air && !firing && !dragon.moving && SPR["dr5_hover_"+dir]) return SPR["dr5_hover_"+dir];
  if (dragon.air)
    return (firing && SPR["drf_fire_" + dir]) || SPR["drf_" + dir]
           || SPR["dr3_" + dir] || SPR["dr3_s"];
  if (firing && SPR["dr5_fire_" + dir]) return SPR["dr5_fire_" + dir];
  const kind = !dragon.moving ? "idle"
             : (typeof running !== "undefined" && running && SPR["dr5_run_" + dir])
               ? "run" : "walk";
  return SPR["dr5_" + kind + "_" + dir] || SPR["dr3_" + dir] || SPR["dr3_s"];
}
function dragonFps() {
  if (dragon.tr) return DRAGON_ANIM.tr;
  if (dragon.air)
    return (dragon.dir === "e" || dragon.dir === "w")
      ? DRAGON_ANIM.fly * 0.6 : DRAGON_ANIM.fly;
  return dragon.moving ? DRAGON_ANIM.walk : DRAGON_ANIM.idle;
}
function noteDragonMotion(px, py, dt) {
  const v = Math.hypot(dragon.x - px, dragon.y - py) / Math.max(dt, 1e-4);
  if (v > DRAGON_ANIM.go) dragon.fly = DRAGON_ANIM.hold;
  else if (dragon.fly > 0) dragon.fly -= dt;
  dragon.moving = dragon.fly > 0;
  if (!dragonAirborne()) dragon.gait += Math.hypot(dragon.x - px, dragon.y - py);
}
let hunt = null, dragonCombatPause = 0, dragonRecall = false, dragonRecallT = 0;
let dragonBossClaws = 0, dragonBreak = null;
let kingShield = null;
function moveDragonSafe(dx, dy) {
  const distance = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(distance / 4));
  const sx = dx / steps, sy = dy / steps;
  for (let i = 0; i < steps; i++) {
    const nx = Math.max(8, Math.min(PXW - 8, dragon.x + sx));
    const ny = Math.max(12, Math.min(PXH - 8, dragon.y + sy));
    let moved = false;
    if (dragonCanStand(nx, dragon.y)) { dragon.x = nx; moved = true; }
    if (dragonCanStand(dragon.x, ny)) { dragon.y = ny; moved = true; }
    if (!moved) break;
  }
}
const CLAW_GND = {"n":[0.4915,-0.2154],"e":[1.0715,0.5702],"s":[0.4801,1.3534],"w":[-0.0694,0.4814]};
const CLAW_AIR = {"n":[0.4323,-0.2469],"e":[1.0284,0.5562],"s":[0.4587,1.3284],"w":[-0.0339,0.5755]};
const CLAW_REACH = 92;
const CLAW = { every: 2.20, dmg: 0.5, life: 0.42, back: 0.80 };
let claw = null, clawT = 0, linger = 0;
function stepClaw(dt) {
  if (bossScene) return;
  if (!claw) return;
  claw.t += dt;
  if (claw.t > CLAW.life) claw = null;
}
function kingFight() { return MAPID === "cinderhold"; }
function drawClaw() {
  if (!claw) return;
  const diag = claw.dir.length===2;
  const s2 = SPR["claw_" + (diag ? "e" : claw.dir)];
  if (diag && s2) {
    const [vx,vy]=directionVector(claw.dir),fr=Math.min(s2[4]-1,Math.floor(claw.t/CLAW.life*s2[4]));
    ctx.save();ctx.translate(claw.x+vx*23,claw.y-12+vy*23);ctx.rotate(Math.atan2(vy,vx));
    drawGameImage(ctx,atlasImg,s2[0]+fr*s2[2],s2[1],s2[2],s2[3],0,-s2[3]/2,s2[2],s2[3]);ctx.restore();return;
  }
  if (!s2) return;
  const f = Math.min(s2[4] - 1, Math.floor(claw.t / CLAW.life * s2[4]));
  const cs = dragonSprite(claw.dir) || SPR["dr5_idle_s"];
  const ct = (dragonAirborne() ? CLAW_AIR : CLAW_GND)[claw.dir]
          || CLAW_GND.s;
  const DS = DRAGON_DRAW_SCALE;
  const fx = dragonFlip(claw.dir) ? -1 : 1;
  const cx = (-cs[2] / 2 + cs[2] * ct[0]) * DS * fx;
  const cy = (-cs[3] + cs[3] * ct[1]) * DS;
  const ox = cx + (claw.dir === "e" ? 0 : claw.dir === "w" ? -s2[2] : -s2[2] / 2);
  const oy = cy + (claw.dir === "n" ? -s2[3] : claw.dir === "s" ? 0 : -s2[3] / 2);
  const chue = kingFight() ? BREATH_HUE.kingclaw : null;
  if (!chue) {
    drawGameImage(ctx, atlasImg, s2[0] + f * s2[2], s2[1], s2[2], s2[3],
                  Math.round(claw.x + ox), Math.round(claw.y + oy), s2[2], s2[3]);
  } else {
    if (!drawClaw._cv) drawClaw._cv = document.createElement("canvas");
    const cc = drawClaw._cv;
    if (cc.width !== s2[2] || cc.height !== s2[3]) { cc.width = s2[2]; cc.height = s2[3]; }
    const cg = cc.getContext("2d");
    cg.clearRect(0, 0, s2[2], s2[3]);
    cg.imageSmoothingEnabled = false;
    drawGameImage(cg, atlasImg, s2[0] + f * s2[2], s2[1], s2[2], s2[3], 0, 0, s2[2], s2[3]);
    cg.globalCompositeOperation = "source-atop";
    cg.fillStyle = chue; cg.globalAlpha = 0.72;
    cg.fillRect(0, 0, s2[2], s2[3]);
    cg.globalAlpha = 1; cg.globalCompositeOperation = "source-over";
    drawGameImage(ctx, cc, Math.round(claw.x + ox), Math.round(claw.y + oy));
  }
}
function stepDragon(dt) {
  if (bossScene) return;
  if (dragon.revive > 0) {
    dragon.revive = Math.max(0, dragon.revive - dt);
    if (dragon.revive === 0) { dragon.down = dragon.hp <= 0; dragon.inv = 1.2; }
  }
  if (!(dragonHere() && dragon.on)) return;
  dragon.t += dt;
  if (dragon.hurt > 0) dragon.hurt -= dt;
  if (dragon.inv > 0) dragon.inv -= dt;
  if (dragon.knockdown > 0) {
    dragon.knockdown = Math.max(0, dragon.knockdown - dt);
    dragon.moving = false; dragon.tr = null; breath = null; claw = null;
    return;
  }
  if (dragon.down) {
    dragon.moving = false; dragon.tr = null;
    return;
  }
  if (mounted) {
    dragon.x=P.x; dragon.y=P.y;
    /* Keep the dragon facing its boss target throughout the breath wind-up. */
    if (!(hunt && hunt.kingBreath)) dragon.dir=playerFacing4();
    dragon.moving=P.moving; stepTransition(dt); return;
  }
  stepTransition(dt);
  if (dragon.tr) return;
  if (breath) { dragon.moving = false; return; }
  if (dragon.placed !== MAPID) {
    dragon.placed = MAPID;
    if (dragon.air) { if (!breath) { dragon.x = P.x - 24; dragon.y = P.y - 26; } }
    else if (!dragonGround(P.x - 24, P.y)) {
      dragon.air = true; if (!breath) { dragon.x = P.x - 24; dragon.y = P.y - 26; }
      refreshWingBtn();
    }
  }
  /* During the king-dragon phase, Corin taking off is an explicit recall:
     she breaks from the boss and catches him instead of crowding its claws. */
  const kingFoe = lastFight && MAPID === "cinderhold" &&
    foes.find(f => (f.kind === "kdragon" || f.kind === "lich") && f.st !== "dead");
  /* Use a hysteresis band: retreat starts well away from the king and stays
     active until Corin deliberately comes back. This prevents ping-ponging. */
  if (!kingFoe) {
    dragonRecall = false; dragonRecallT = 0;
    dragonBossClaws = 0; dragonBreak = null;
  }
  else {
    const corinKingD = Math.hypot(P.x - kingFoe.x, P.y - kingFoe.y);
    if (!dragonRecall && corinKingD > 132) { dragonRecall = true; dragonRecallT = 15; }
    if (dragonRecall && dragonRecallT > 0) dragonRecallT = Math.max(0, dragonRecallT - dt);
    else if (dragonRecall && corinKingD < 88) dragonRecall = false;
  }
  if (dragonRecall) {
    hunt = null; linger = 0; claw = null; clawT = 0;
    const dx = P.x - dragon.x, dy = (P.y - dragonHover()) - dragon.y;
    const d = Math.hypot(dx, dy) || 1;
    dragon.dir = direction4(dx, dy, dragon.dir);
    dragonStep((dx / d) * Math.min(210, 72 + (d - 42) * 2.2) * dt,
               (dy / d) * Math.min(210, 72 + (d - 42) * 2.2) * dt);
    return;
  }
  /* The companion should not glue itself to a boss indefinitely.  After a
     short claw string it deliberately disengages, opens a visible gap, then
     returns to the fight. */
  if (dragonBreak) {
    const f = dragonBreak.foe;
    dragonBreak.t = Math.max(0, dragonBreak.t - dt);
    if (!f || f.st === "dead") dragonBreak = null;
    else {
      const dx = dragon.x - f.x, dy = dragon.y - f.y;
      const d = Math.hypot(dx, dy) || 1;
      dragon.dir = direction4(dx, dy, dragon.dir);
      if (d < 112 || dragonBreak.t > .35) {
        const sp = dragonAirborne() ? 150 : 112;
        moveDragonSafe((dx / d) * sp * dt, (dy / d) * sp * dt);
      } else dragon.moving = false;
      if (dragonBreak.t <= 0 && d >= 96) dragonBreak = null;
      if (dragonBreak) return;
    }
  }
  if (hunt) return;      /* it is off hunting; following him can wait */
  let far = null, fd2 = -1;
  if (!foesHeld && !devDragonPassive && dragonCombatPause <= 0) {
    for (const f of foes) {
      if (f.st === "dead" || f.ally || f.storyPassive) continue;
      const dx = f.x - P.x, dy = f.y - P.y, d2 = dx * dx + dy * dy;
      if (d2 < 16900 && d2 > fd2) { fd2 = d2; far = f; }
    }
  }
  if (!far && linger > 0) { linger -= dt; return; }
  if (far) {
    linger = 1.4;              /* it will hang here a moment once they are down */
    const tx = far.x, ty = far.y - 22;
    const dx = tx - dragon.x, dy = ty - dragon.y;
    const d = Math.hypot(dx, dy);
    dragon.dir = direction4(dx,dy,dragon.dir);
    if (d > CLAW_REACH * 0.4) {
      const sp = Math.min(210, 60 + d * 2.2) * (dragonAirborne() ? 1 : 0.72);
      dragonStep((dx / d) * sp * dt, (dy / d) * sp * dt);
    } else {
      if (typeof mounted !== "undefined" && mounted) { clawT = 0; }
      else { clawT -= dt; }
      if (clawT <= 0 && !(typeof mounted !== "undefined" && mounted)) {
        clawT = CLAW.every;
        claw = { dir: dragon.dir, t: 0, x: dragon.x, y: dragon.y - 8 };
        const in_ = Math.hypot(far.x - dragon.x, far.y - dragon.y) || 1;
        dragonStep(((far.x - dragon.x) / in_) * 9, ((far.y - dragon.y) / in_) * 9);
        if ((far.kind === "kdragon" || far.kind === "lich") && far.swordGuard > 0) {
          kingDeflect(far, dragon);
        } else {
          far.hp -= CLAW.dmg;
          far.hurt = 0.25;
          if (far.kind === "kdragon" && ++dragonBossClaws % 2 === 0) {
            dragonBreak = { foe: far, t: 1.35 };
            dragonCombatPause = Math.max(dragonCombatPause, 1.35);
          }
        }
        if (far.hp <= 0) { far.st = "dead"; far.t = 0; if (!far.storyKnight) dropGold(far.x, far.y, far.kind); markBossGone(far); }
      } else if (clawT > CLAW.every - CLAW.back) {
        const away = Math.hypot(dragon.x - far.x, dragon.y - far.y) || 1;
        dragonStep(((dragon.x - far.x) / away) * 44 * dt,
                   ((dragon.y - far.y) / away) * 44 * dt);
      }
    }
    return;
  }
  const want = 34;
  const dx = P.x - dragon.x, dy = (P.y - dragonHover()) - dragon.y;
  const d = Math.hypot(dx, dy);
  if (d > (dragonAirborne() ? 400 : 210)) {
    if (dragonAirborne()) { if (!breath) { dragon.x = P.x - 24; dragon.y = P.y - 26; } }
    else dragonGround(P.x - 24, P.y);
    return;
  }
  if (d > want) {
    const cap = dragonAirborne() ? 190 : (d > 90 ? 190 : 132);
    const sp = dragonAirborne() ? Math.min(cap, 40 + (d - want) * 2.4)
                                : Math.min(cap, 34 + (d - want) * 1.9);
    dragonStep((dx / d) * sp * dt, (dy / d) * sp * dt);
    dragon.dir = direction4(dx,dy,dragon.dir);
  }
}
function dragonHealTint(){return dragon.healPulse>0?Math.sin((1-dragon.healPulse)*Math.PI*3)**2*.72:0;}
function drawDragon() {
  if (!(dragonHere() && dragon.on)) return;
  if (dragon.down || dragon.knockdown > 0) {
    const cellW = 121, cellH = 73;
    const west = dragon.faintDir === "w";
    if (!drawDragon.faintCanvas) drawDragon.faintCanvas = document.createElement("canvas");
    const c = drawDragon.faintCanvas;
    if (c.width !== cellW || c.height !== cellH) { c.width = cellW; c.height = cellH; }
    const g = c.getContext("2d");
    g.clearRect(0, 0, cellW, cellH); g.imageSmoothingEnabled = false;
    drawGameImage(g, faintDragonImg, west ? cellW : 0, 0, cellW, cellH, 0, 0, cellW, cellH);
    if (dragon.down) {
      const recovering = dragon.revive > 0;
      const pulse = 0.18 + (Math.sin(dragon.t * (recovering ? 12 : 6)) + 1) * 0.14;
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = pulse;
      g.fillStyle = recovering ? "#44ef72" : "#ff3038";
      g.fillRect(0, 0, cellW, cellH);
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    }
    if(dragon.healPulse>0){g.globalCompositeOperation='source-atop';g.globalAlpha=dragonHealTint();g.fillStyle='#52ff78';g.fillRect(0,0,cellW,cellH);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
    const DS = DRAGON_DRAW_SCALE, w = Math.round(cellW * DS), h = Math.round(cellH * DS);
    const dx = Math.round(dragon.x - w / 2), dy = Math.round(dragon.y - h);
    ctx.globalAlpha = 0.32; ctx.fillStyle = "#000"; ctx.beginPath();
    ctx.ellipse(Math.round(dragon.x), Math.round(dragon.y), 20, 3, 0, 0, 6.284); ctx.fill();
    ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    drawGameImage(ctx, c, dx, dy, w, h);
    ctx.imageSmoothingEnabled = false;
    return;
  }
  const s2 = dragonSprite(dragon.dir);
  if (!s2) return;
  const walking = !dragon.air && !dragon.tr && dragon.moving;
  const f = dragon.tr
    ? Math.min(s2[4] - 1, Math.floor(dragon.tr.t))
    : walking
      ? Math.floor(dragon.gait / DRAGON_ANIM.stride * s2[4] / 5) % s2[4]
      : Math.floor(dragon.t * dragonFps() * s2[4] / 5) % s2[4];
  const bob = dragonBob();
  const DS = DRAGON_DRAW_SCALE;
  const w2d = Math.round(s2[2] * DS), h2d = Math.round(s2[3] * DS);
  const dx = Math.round(dragon.x - w2d / 2), dy = Math.round(dragon.y - h2d + bob);
  ctx.globalAlpha = dragonAirborne() ? 0.22 : 0.34;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(Math.round(dragon.x), Math.round(dragon.y + (dragonAirborne() ? 10 : 1)),
              dragonAirborne() ? Math.max(7, w2d * 0.28) : Math.max(6, w2d * 0.2),
              dragonAirborne() ? 4 : 2.5, 0, 0, 6.284);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Draw from the original sheet in one pass. The old scaled-frame cache caused
  // a second canvas resample that softened the dragon's outlines and details.
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const healing=dragon.healPulse>0;
  const src=healing?tintFoe(s2,f,'#52ff78',dragonHealTint()):sheetOf(s2);
  const sx=healing?0:s2[0]+f*s2[2],sy=healing?0:s2[1];
  if (dragonFlip(dragon.dir)) {
    ctx.translate(dx + w2d, dy); ctx.scale(-1, 1);
    drawGameImage(ctx, src, sx, sy, s2[2], s2[3],
                  0, 0, w2d, h2d);
  } else {
    drawGameImage(ctx, src, sx, sy, s2[2], s2[3],
                  dx, dy, w2d, h2d);
  }
  ctx.restore();
}

const GREEN = { map: "world", tx: 30, ty: 19, fps: 7, scale: 1 };
let greenPhase = "off", greenT = -1, greenP = 0, greenGone = false;
const GREEN_IN = 2.5, GREEN_CRASH = 1.1, GREEN_RISE = 0.9, GREEN_DEPART = 1.3;
function greenFly(dt) {
  if (quest !== Q.ARMED || MAPID !== GREEN.map) {
    greenPhase = "off"; greenT = -1; greenP = 0; greenGone = false; return;
  }
  const g = greenAt();
  const d = Math.hypot(P.x - g.x, P.y - g.y) / TS;
  if (greenPhase === "off" && d < 18) { greenPhase = "in"; greenP = 0; greenT = 0; }
  if (greenPhase === "in") {
    greenP += dt / GREEN_IN;
    greenT = Math.min(1, greenP);
    if (greenP >= 1) { greenPhase = "crash"; greenP = 0; shake = 1; }
  } else if (greenPhase === "crash") {
    greenP += dt / GREEN_CRASH;
    if (greenP >= 1) { greenPhase = "sit"; greenP = 0; }
  } else if (greenPhase === "sit") {
    greenP += dt;
    if (greenGone) { greenPhase = "rise"; greenP = 0; }
  } else if (greenPhase === "rise") {
    greenP += dt / GREEN_RISE;
    /* The dusty lift happens at the stump. Only then switch to the clean
       overhead flight frames, so the dirt never travels with the dragon. */
    if (greenP >= 1) { greenPhase = "depart"; greenP = 0; }
  } else if (greenPhase === "depart") {
    greenP += dt / GREEN_DEPART;
    if (greenP >= 1) { greenPhase = "gone"; greenT = 2; }
  }
}
function greenOffset() {
  if (greenPhase === "off") return null;
  if (greenPhase === "in") {
    const k = 1 - greenT;                        /* 1 far away .. 0 over the spot */
    return [300 * k, -150 * k];
  }
  if (greenPhase === "depart") {
    const k = greenP;
    return [-330 * k, -230 * k * k];             /* normal flying frames leave the field */
  }
  if (greenPhase === "gone") return [-330, -230];
  return [0, 0];
}
function followCam() {
  cam.x = P.x - VW / cam.z / 2;
  cam.y = P.y - VH / cam.z / 2;
  if (shake > 0) {
    const k = shake * shake * 26 / cam.z;
    const ring = Math.sin(shake * 46) * 0.8 + (Math.random() * 2 - 1) * 0.4;
    cam.x += ring * k * 0.6;
    cam.y += (Math.cos(shake * 39) * 0.9 + (Math.random() * 2 - 1) * 0.3) * k;
  }
}
function greenInView() {
  const g = greenAt();
  const vw = cv.width / cam.z, vh = cv.height / cam.z;
  const mx = vw * 0.2, my = vh * 0.2;
  return g.x > cam.x + mx && g.x < cam.x + vw - mx &&
         g.y > cam.y + my && g.y < cam.y + vh - my;
}
function greenAt() {
  return { x: GREEN.tx * TS + TS / 2, y: GREEN.ty * TS + TS };
}

const Q = { ABED: 0, ERRAND: 1, EGGS: 2, KING: 3, ELDER: 4, NOISE: 5,
            ARMED: 6, FLED: 7, CARRY: 8, DONE: 9 };
let quest = Q.ABED;
const hasSword = () => quest >= Q.ARMED;
let smithUpgrade = false;
let glassShield = false, glassShieldHeld = false, glassShieldPulse = 0;
const GLASS_BLOCK_WINDOW = .552;
// Universal enemy/boss telegraph duration: every orange/red attack gives the same timing window.
const GLASS_TELEGRAPH_WINDOW = GLASS_BLOCK_WINDOW;
let glassShieldWindowUntil = -1;
const corinKit = () => !hasSword() ? "corin_bare_" : smithUpgrade ? "corin_armor_" : "corin_sword_";
const corinSheet = () => mounted ? smImg : atlasImg;
const corinFeetOffset = () => mounted ? 0 : 64 - 44;

const hasDragon = () => quest >= Q.DONE;
let bridgeCleared = false;
function clearBridge() {
  if (quest < Q.DONE || MAPID !== "world") return;
  const fisher = npcs.find(x => (x.n || "") === "Odo");
  if (!fisher || fisher.odoAtHome) return;
  bridgeCleared = true;
  // No walking sheet: relocate directly beside his fishing-house entrance.
  fisher.x=664;fisher.y=6888;fisher.home=[fisher.x,fisher.y];
  fisher.goto=null;fisher.patrol=null;fisher.stationary=true;fisher.packWalk=false;
  fisher.f='d';fisher.flip=false;fisher.odoAtHome=true;
}
const indoors = () => /^house/.test(MAPID);
const dragonHere = () => !dragonOff && hasDragon() && !indoors();

let scene = null;
let walker = null;
let warnedNorth = false;
const MAD_DOOR = [54 * 16 + 8, 373 * 16 + 8];
const MAD_DOOR_TILE = [54, 373];
const ELDER_WELL = [48, 373];

const ODO_BRIDGE = { x0: 45, x1: 49, y0: 432, y1: 435 };
let odoSaid = 0, odoNearBridge = false;
function odoBlocks() {
  return !hasDragon();
}
function odoShuts(x, y) {
  if (!odoBlocks() || MAPID !== "world") return false;
  const fisher = npcs.find(m => (m.n || "") === "Odo");
  const from = fisher ? Math.floor(fisher.x / TS) : ODO_BRIDGE.x0;
  return x >= from && x <= ODO_BRIDGE.x1 &&
         y >= ODO_BRIDGE.y0 && y <= ODO_BRIDGE.y1;
}

function odoTurnsYouBack() {
  if (!odoBlocks() || MAPID !== "world" || scene) return false;
  const tx = P.x / TS, ty = (P.y - 1) / TS;
  const fisher0 = npcs.find(m => (m.n || "") === "Odo");
  const hx = fisher0 ? fisher0.x / TS : 47;
  const near = tx > hx - 2.2 && tx < ODO_BRIDGE.x1 + 1.6 &&
               ty > ODO_BRIDGE.y0 - 0.5 && ty < ODO_BRIDGE.y1 + 0.5;
  if (!near) return false;
  const fisher = npcs.find(m => (m.n || "") === "Odo");
  if (!fisher) return false;
  if (!odoSaid) {
    odoSaid = 1;
    faceToward(fisher, P.x, P.y);
    playScene([
      "Odo: Not now, lad. I am going to catch a big one.",
    ]);
  }
  return true;
}

const BIRDS = [];
let birdsUp = 0;                 /* 0 sitting, then counts up as they climb */
function placeBirds() {
  BIRDS.length = 0;
  if (quest < Q.ARMED) birdsUp = 0;
  if (MAPID !== "world") return;
  let seed = 20260901;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const perch = (tx, ty, side) => {
    if (tx < 2 || tx >= MW - 2) return;
    if (!isSolid(tx * TS + 8, ty * TS + 8)) return;   /* a tree to sit in */
    BIRDS.push({ x: tx * TS + 8, y: ty * TS + 4,
                 t: rnd() * 10, nest: rnd() < 0.35,
                 vx: (side || 1) * (26 + rnd() * 22), vy: -34 - rnd() * 26 });
  };
  for (const [ptx, pty] of [[26, 373], [26, 372], [25, 374], [26, 376],
                            [34, 370], [33, 370]])
    if (!BIRDS.length) perch(ptx, pty, -1);
  if (BIRDS.length) BIRDS[0].nest = true;

  for (let k = 0; k < 3; k++) {
    const tx = 36 + k * 2, ty = 371;
    if (tx < 2 || tx >= MW - 2) continue;
    if (isSolid(tx * TS + 8, ty * TS + 14)) continue;
    if (isSolid(tx * TS + 8, ty * TS + 24)) continue;
    if (isSolid(tx * TS - 8, ty * TS + 14)) continue;
    if (isSolid(tx * TS + 24, ty * TS + 14)) continue;
    BIRDS.push({ x: tx * TS + 8, y: ty * TS + 14, ground: 1,
                 hx: tx * TS + 8, hy: ty * TS + 14, wob: rnd() * 6.3,
                 t: rnd() * 10, nest: false,
                 vx: (rnd() < 0.5 ? -1 : 1) * (26 + rnd() * 22),
                 vy: -34 - rnd() * 26 });
  }
}
let shake = 0;
function scatterBirds() {
  if (!birdsUp) birdsUp = 0.0001;
  shake = 1;
}
function stepShake(dt) { if (shake > 0) shake = Math.max(0, shake - dt / 1.1); }
function stepBirds(dt) {
  if (MAPID !== "world") return;
  if (!birdsUp) {
    for (const b of BIRDS) {
      if (!b.ground) continue;
      b.wob += dt * 0.7;
      b.x = b.hx + Math.cos(b.wob) * 14;
      b.y = b.hy + Math.sin(b.wob * 0.6) * 7;
      b.vx = Math.cos(b.wob) < 0 ? -Math.abs(b.vx) : Math.abs(b.vx);
    }
    return;
  }
  birdsUp += dt;
  for (const b of BIRDS) { b.x += b.vx * dt; b.y += b.vy * dt; }
}
const HATCH_LINES = [
      "Maddock: You were gone longer than an egg errand ought to take.",
      "Corin: Maddock, I found something in the north field.",
      "Maddock: Let me see it. ...Corin, that is no hen's egg.",
      "Maddock: Put it down. Slowly.",
      "Maddock: That is a dragon's egg. There hasn't been one in Emberfell for fifty years.",
      "The egg moves.",
      "It shakes again -- harder.",
      "The shell splits. A hatchling pushes free.",
      "The hatchling turns to Maddock.",
      "Then it turns to Corin and crosses the space between them.",
      "A smooth stone lies in the broken shell. It glows as Corin lifts it.",
      "Corin: Why did it come to me?",
      "Maddock: Dragonriders didn't choose their dragons. The dragons chose them.",
      "Maddock: Halvard will never let you keep her. If you mean to protect her, you will have to overthrow him.",
      "Corin: Overthrow the king? Maddock, I am a miller's son.",
      "Maddock: And she chose you. Leave Halvard on the throne and he will take her -- or kill you both.",
      "Corin: I don't know if I can do this.",
      "Maddock: You do not need to know yet. You only need to decide whether you will try.",
      "Corin: ...All right. I will.",
      "Maddock: Forgewick is the closest of the old rider temples from before Wingfall. If that stone has answers, I would start there.",
];

let hatchScene = null;
let hatchExit = false;
let hatchCamera = null;
let deflectCamera = null;
function cameraOwnsView() { return !!hatchCamera || !!bossScene || !!deflectCamera || !!fishing; }
function stepDeflectCamera(dt) {
  const c = deflectCamera;
  if (!c) return;
  if (MAPID !== c.map || hatchCamera || bossScene) { deflectCamera = null; return; }
  // Track the shove throughout the fall instead of freezing until P.act ends.
  cam.z = c.zoom;
  const x = P.x - VW / cam.z / 2, y = P.y - VH / cam.z / 2;
  const ease = 1 - Math.exp(-9 * dt);
  cam.x += (x - cam.x) * ease; cam.y += (y - cam.y) * ease;
  const settled = Math.hypot(cam.x - x, cam.y - y) < .05;
  clampCam();
  c.t += dt;
  if ((!P.act || P.act.kind !== "fall") && (settled || c.t > 2)) deflectCamera = null;
}
function lockHatchCamera(c, m, hs) {
  /* Establish one composition for the whole dialogue.  Re-measuring the cast
     every time A advances a line made the camera visibly tug against itself. */
  const pts = [[P.x,P.y],[hs.eggX,hs.eggY],[hs.dragonX,hs.dragonY]];
  if (m) pts.push([m.x,m.y]);
  const left = Math.min(...pts.map(p=>p[0]))-72;
  const right = Math.max(...pts.map(p=>p[0]))+72;
  const top = Math.min(...pts.map(p=>p[1]))-92;
  const bottom = Math.max(...pts.map(p=>p[1]))+42;
  const z = Math.min(c.zoom*.85, VW*.88/(right-left), VH*.65/(bottom-top));
  return { x:(left+right)/2, y:(top+bottom)/2 + VH*.1/z, z };
}
function stepHatchCamera(dt) {
  const c = hatchCamera;
  if (!c) return;
  if (MAPID !== "world") {
    cam.z = c.zoom; camFree = false; hatchCamera = null; return;
  }
  const m = elder();
  let x = P.x, y = P.y, z = c.zoom;
  if (hatchScene) {
    c.goal ||= lockHatchCamera(c, m, hatchScene);
    ({ x, y, z } = c.goal);
  } else if (hatchExit && m && !m.away) {
    x = m.x; y = m.y-16; z = c.zoom*0.85;
  } else {
    c.returnT += dt;
  }
  const ease = 1-Math.exp(-5*dt);
  cam.z += (z-cam.z)*ease;
  cam.x += (x-VW/cam.z/2-cam.x)*ease;
  cam.y += (y-VH/cam.z/2-cam.y)*ease;
  clampCam();
  if (c.returnT >= 1.2) {
    cam.z = c.zoom; camFree = false; hatchCamera = null;
  }
}
function beginHatchScene(m) {
  hatchCamera = { zoom: cam.z, returnT: 0 };
  camFree = true;
  const dx = P.x - m.x, dy = P.y - m.y;
  const sx = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx || 1) * TS : 0;
  const sy = sx ? 0 : Math.sign(dy || 1) * TS;
  if (canStand(P.x + sx, P.y + sy)) { P.x += sx; P.y += sy; }
  const ex = P.x + (m.x - P.x) * 0.3, ey = P.y + (m.y - P.y) * 0.3;
  // Keep the egg's landing spot fixed while Corin backs away one more tile.
  for (let step = 0; step < 4; step++) {
    if (!canStand(P.x + sx / 4, P.y + sy / 4)) break;
    P.x += sx / 4; P.y += sy / 4;
  }
  hatchScene = { x: ex, y: ey - 18, eggX: ex, eggY: ey,
                 stage: 0, t: 0, dragonX: ex, dragonY: ey,
                 dir: "s", spread: false, spreadT: 0, stoneShown: false,
                 approachDone: false, turnStage: -1 };
  faceCorinAt(ex, ey);
  faceToward(m, ex, ey);
  dragon.on = false;
  playScene(HATCH_LINES, { who: "Maddock", hatch: true, stay: true, after: finishHatchScene });
  m.goto = null;
}
function stepHatchScene(dt) {
  if (!hatchScene || !scene || !scene.hatch) return;
  hatchScene.stage = scene.i;
  hatchScene.t = scene.t;
  if (scene.i < 3) {
    hatchScene.x = hatchScene.eggX;
    hatchScene.y = hatchScene.eggY - 18;
  } else if (scene.i === 3) {
    const u0 = Math.max(0, Math.min(1, (scene.t - 0.12) / 0.48));
    const u = u0 * u0 * (3 - 2 * u0);
    hatchScene.x = hatchScene.eggX;
    hatchScene.y = (hatchScene.eggY - 18) + 18 * u;
  } else {
    hatchScene.x = hatchScene.eggX;
    hatchScene.y = hatchScene.eggY;
  }
  const m = elder();
  if (scene.i >= 7 && !hatchScene.spread && m) {
    hatchScene.spread = true;
    hatchScene.spreadT = 0;
    const pdx = P.x - hatchScene.x, pdy = P.y - hatchScene.y;
    const pd = Math.max(1, Math.hypot(pdx, pdy));
    const mdx = m.x - hatchScene.x, mdy = m.y - hatchScene.y;
    const md = Math.max(1, Math.hypot(mdx, mdy));
    hatchScene.p0 = [P.x, P.y]; hatchScene.m0 = [m.x, m.y];
    hatchScene.p1 = standableNear(hatchScene.x + pdx / pd * TS * 2.5,
                                  hatchScene.y + pdy / pd * TS * 2.5);
    hatchScene.m1 = standableNear(hatchScene.x + mdx / md * TS * 2.5,
                                  hatchScene.y + mdy / md * TS * 2.5);
    m.goto = null;
  }
  if (hatchScene.spread && hatchScene.spreadT < 1 && m) {
    hatchScene.spreadT = Math.min(1, hatchScene.spreadT + dt / 0.45);
    const u = hatchScene.spreadT * hatchScene.spreadT * (3 - 2 * hatchScene.spreadT);
    P.x = hatchScene.p0[0] + (hatchScene.p1[0] - hatchScene.p0[0]) * u;
    P.y = hatchScene.p0[1] + (hatchScene.p1[1] - hatchScene.p0[1]) * u;
    m.x = hatchScene.m0[0] + (hatchScene.m1[0] - hatchScene.m0[0]) * u;
    m.y = hatchScene.m0[1] + (hatchScene.m1[1] - hatchScene.m0[1]) * u;
    faceCorinAt(hatchScene.x, hatchScene.y);
    faceToward(m, hatchScene.x, hatchScene.y);
    if (hatchScene.spreadT === 1) rebuildSolid();
  }
  if (scene.i === 10 && !hatchScene.stoneShown) {
    hatchScene.stoneShown = true;
    showReveal(SPR.it_hs_flame ? "it_hs_flame" : "it_egg",
               "Corin obtained a mysterious stone", 3);
  }
  if (scene.i >= 8) {
    const lookAt = scene.i === 8 && m ? m : P;
    const targetDir = Math.abs(lookAt.x - hatchScene.dragonX) > Math.abs(lookAt.y - hatchScene.dragonY)
      ? (lookAt.x > hatchScene.dragonX ? "e" : "w")
      : (lookAt.y > hatchScene.dragonY ? "s" : "n");
    if (scene.i === 8 && hatchScene.turnStage !== 8) {
      hatchScene.turnStage = 8;
      /* Guarantee a visible first turn even when the hatch pose already
         happens to face Maddock. */
      hatchScene.dir = targetDir === "n" || targetDir === "s" ? "e" : "s";
    } else if (scene.i === 9 && hatchScene.turnStage !== 9) {
      hatchScene.turnStage = 9;
    }
    /* Let each new box appear, then make its matching turn a beat later. */
    if (scene.t >= 0.3)
      hatchScene.dir = targetDir;
    hatchScene.walking = false;
    if (scene.i === 9 && !hatchScene.chooseBack) {
      hatchScene.chooseBack = true;
      hatchScene.chooseBackT = 0;
      hatchScene.chooseP0 = [P.x,P.y];
      const dx=P.x-hatchScene.dragonX,dy=P.y-hatchScene.dragonY,d=Math.hypot(dx,dy)||1;
      const tx=P.x+dx/d*TS,ty=P.y+dy/d*TS;
      hatchScene.chooseP1=canStand(tx,ty)?[tx,ty]:[P.x,P.y];
    }
    if(scene.i===9&&hatchScene.chooseBackT<1){
      hatchScene.chooseBackT=Math.min(1,hatchScene.chooseBackT+dt/.42);
      const u=hatchScene.chooseBackT*hatchScene.chooseBackT*(3-2*hatchScene.chooseBackT);
      P.x=hatchScene.chooseP0[0]+(hatchScene.chooseP1[0]-hatchScene.chooseP0[0])*u;
      P.y=hatchScene.chooseP0[1]+(hatchScene.chooseP1[1]-hatchScene.chooseP0[1])*u;
      faceCorinAt(hatchScene.dragonX,hatchScene.dragonY);
    }
    if (scene.i >= 9 && scene.t > 0.75 &&
        (!hatchScene.chooseBack||hatchScene.chooseBackT>=1) && !hatchScene.approachDone) {
      if (!hatchScene.walkTarget) {
        const pdx = P.x - hatchScene.dragonX, pdy = P.y - hatchScene.dragonY;
        const pd = Math.hypot(pdx, pdy) || 1;
        // One tile from the hatchling toward Corin's actual position, from any side.
        hatchScene.walkTarget = [hatchScene.dragonX + pdx / pd * TS,
                                 hatchScene.dragonY + pdy / pd * TS];
        hatchScene.walkT = 0;
      }
      const [tx, ty] = hatchScene.walkTarget;
      const vx = tx - hatchScene.dragonX, vy = ty - hatchScene.dragonY;
      const vd = Math.hypot(vx, vy);
      const step = Math.min(vd, 20 * dt);
      hatchScene.walking = vd > 0;
      hatchScene.walkT += dt;
      if (vd <= step) {
        hatchScene.dragonX = tx; hatchScene.dragonY = ty;
        hatchScene.approachDone = true;
        hatchScene.walking = false;
      } else {
        hatchScene.dragonX += vx / vd * step;
        hatchScene.dragonY += vy / vd * step;
      }
    }
  }
}
function finishHatchScene() {
  quest = Q.DONE;
  dragon.on = true;
  dragon.x = hatchScene ? hatchScene.dragonX : P.x - 24;
  dragon.y = hatchScene ? hatchScene.dragonY : P.y - 26;
  hatchScene = null;
  toast("The dragon follows you now");
  hatchExit = !!elder();
  goBackIn(true);
}
function standableNear(x, y) {
  if (canStand(x, y)) return [x, y];
  for (let r = 1; r <= 12; r++)
    for (let a = 0; a < 16; a++) {
      const th = a * Math.PI / 8;
      const nx = x + Math.cos(th) * r * TS, ny = y + Math.sin(th) * r * TS;
      if (canStand(nx, ny)) return [nx, ny];
    }
  return [x, y];
}
function blockedRun(ax, ay, bx, by) {
  const steps = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / TS));
  let bad = 0;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!canStand(ax + (bx - ax) * t, ay + (by - ay) * t)) bad++;
  }
  return bad / steps;
}

function doorRoute() {
  const d = Math.hypot(MAD_DOOR[0] - P.x, MAD_DOOR[1] - P.y) / TS;
  if (d > 12) return null;
  if (MAD_DOOR[0] < P.x) return null;      /* his door is east; never fetch him from the west */
  if (blockedRun(MAD_DOOR[0], MAD_DOOR[1], P.x, P.y) > 0.5) return null;
  return [MAD_DOOR[0], MAD_DOOR[1]];
}

function offStage() {
  const door = doorRoute();
  if (door) return door;
  const east = standableNear(cam.x + VW / cam.z + 30, P.y);
  if (east[0] > P.x + TS) return east;
  return standableNear(P.x + 14 * TS, P.y);
}
function offStageUnused() {
  return standableNear(cam.x + VW / cam.z + 40, P.y);
}
function elderOffScreen() {
  const e = elder();
  if (!e) return true;
  const vw = VW / cam.z, vh = VH / cam.z;
  return e.x < cam.x - 30 || e.x > cam.x + vw + 30 ||
         e.y < cam.y - 30 || e.y > cam.y + vh + 30;
}
function elder() { return npcs.find(x => (x.n || "") === "Elder Maddock"); }
let goingIn = false;
function comeOut(toX, toY) {
  const e = elder();
  if (!e) return null;
  const off = offStage();
  e.away = 0;
  e.x = off[0]; e.y = off[1];
  e.home = [MAD_DOOR[0], MAD_DOOR[1]];
  e.goto = [toX, toY];
  e.hurry = 1;
  goingIn = false;
  return e;
}
function elderArrived() {
  const e = elder();
  return !!e && !e.away && !e.goto;
}
function goBackIn(useHouseDoor) {
  const e = elder();
  if (!e) return;
  e.goto = useHouseDoor ? [MAD_DOOR[0], MAD_DOOR[1]] : (doorRoute() || offStage());
  e.hurry = 1;
  goingIn = true;
}
function stepElder() {
  if (!goingIn) return;
  const e = elder();
  if (!e) { goingIn = false; hatchExit = false; return; }
  if (e.goto) faceToward(e, e.goto[0], e.goto[1]);
  const atDoor = Math.hypot(e.x - MAD_DOOR[0], e.y - MAD_DOOR[1]) < (hatchExit ? 5 : TS);
  if (hatchExit && !atDoor) return;    /* follow him all the way to the doorway */
  if (e.goto && !elderOffScreen() && !atDoor) return;    /* still in shot */
  e.goto = null;
  e.x = MAD_DOOR[0]; e.y = MAD_DOOR[1];
  e.away = 1;
  goingIn = false;
  hatchExit = false;
}
function northShut() { return quest <= Q.ELDER && warnedNorth; }
let sayIsNarr = false;      /* which of the two boxes is on screen */
function speakerNamed(who) {
  if (!who) return null;
  return npcs.find(m => (m.n || "").toLowerCase().includes(who.toLowerCase()));
}
function faceToward(m, x, y) {
  if (m.stationary && !(m.desertNative && !m.packSpr)) { m.f = "d"; m.kf = "d"; m.flip = false; return; }
  const dx = x - m.x, dy = y - m.y;
  const sideways = Math.abs(dx) > Math.abs(dy);
  m.f = sideways ? "s" : (dy > 0 ? "d" : "u");
  m.flip = sideways && dx < 0;
  m.kf = sideways ? (dx > 0 ? "e" : "w") : m.f;
}
function npcHere(m) {
  if (wonAll && /King Halvard/.test(m.n || "")) return false;
  if (m.away) return false;
  if (m.when !== undefined && quest < m.when) return false;
  if (m.until !== undefined && quest >= m.until) return false;
  return true;
}

function beginHettieWalk(her) {
  if (her.hettieDeparted) return;
  her.hettieDeparted = true;
  her.stationary = false;
  her.home = [26 * TS + 8, 416 * TS + 16];
  her.goto = her.home.slice();
  her.patrol = [24, 415, 26, 416];
  her.patrolFrom = Q.KING;
  her.patrolRest = 7000;
  her.arrived = true;
}
function stepHettie() {
  if (MAPID !== "world" || quest < Q.KING || scene) return;
  const her = npcs.find(n => n.n === "Hettie");
  if (her) beginHettieWalk(her);
}

function stepWalkers(dt) {
  if(editing)return;
  if(scene && scene.who === "Hettie") { const her=npcs.find(n=>n.n==="Hettie"); if(her) faceToward(her,P.x,P.y); }
  stepHettie();
  stepThornwellWelcome(dt);
  for (const m of npcs) {
    if (m.stationary) {
      if (m.goto) {
        const visible = m.x > cam.x - 32 && m.x < cam.x + VW / cam.z + 32 &&
          m.y > cam.y - 48 && m.y < cam.y + VH / cam.z + 48;
        if (!visible) { m.x = m.goto[0]; m.y = m.goto[1]; m.goto = null; }
        else if (m.n === "Elder Maddock" && !fadeDir && !doorMotion && !pendingActorStage) {
          const target = m.goto.slice();
          pendingActorStage = () => { m.x = target[0]; m.y = target[1]; m.goto = null; };
          fadeDir = 1;
        }
      }
      continue;
    }
    if (bossScene && m === bossScene.k) continue;
    if (!m.goto) continue;
    const dx = m.goto[0] - m.x, dy = m.goto[1] - m.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) {
      m.x = m.goto[0]; m.y = m.goto[1]; m.goto = null;
      continue;
    }
    const onScreen = m.x > cam.x && m.x < cam.x + VW / cam.z &&
                     m.y > cam.y && m.y < cam.y + VH / cam.z;
    const sp = (m.hurry ? (onScreen ? 78 : 260) : (m.patrolSpeed || 44)) * dt;
    const guard = /^(King Halvard|Serjeant Bram|Doran|Tolan)$/
                    .test(m.n || "");
    const straight = [dx / d * Math.min(sp, d), dy / d * Math.min(sp, d)];
    if (!m.patrol && !canNpcStand(m.x, m.y,m)) {
      m.x += straight[0]; m.y += straight[1];
      faceToward(m, m.goto[0], m.goto[1]);
      continue;
    }
    const clear = (ax, ay) => !guard ||
      Math.hypot(m.x + ax - P.x, m.y + ay - P.y) > 11;
    const tryStep = (ax, ay) =>
      (canNpcStand(m.x + ax, m.y + ay,m) && clear(ax, ay)) ? [ax, ay] : null;
    const step = tryStep(straight[0], straight[1])
              || tryStep(0, straight[1])
              || tryStep(straight[0], 0)
              || tryStep(0, Math.sign(dy) * sp)
              || tryStep(Math.sign(dx) * sp, 0)
              || [0, 0];
    const wasX = m.x, wasY = m.y;
    m.x += step[0];
    m.y += step[1];
    if (Math.hypot(m.x - wasX, m.y - wasY) < 0.05) {
      m.stuck = (m.stuck || 0) + dt;
      if (m.stuck > 1.5 && !guard) {
        if (m.patrol) { m.goto = null; m.stuck = 0; }
        else {
          m.x = m.goto[0]; m.y = m.goto[1];
          m.goto = null; m.stuck = 0;
        }
        continue;
      }
    } else m.stuck = 0;
    // NPC collision reads these live coordinates; no static-grid rebuild is needed.
    faceToward(m, m.goto[0], m.goto[1]);
    continue;
    m.x += dx / d * Math.min(sp, d);
    m.y += dy / d * Math.min(sp, d);
    faceToward(m, m.goto[0], m.goto[1]);
  }
  if (walker && scene) faceToward(walker, P.x, P.y);
}

function faceCorinAt(x, y) {
  const dx = x - P.x, dy = y - P.y;
  P.dir8 = direction4(dx,dy,playerFacing4());
  if (Math.abs(dx) > Math.abs(dy)) { P.dir = "s"; P.flip = dx < 0; }
  else P.dir = dy > 0 ? "d" : "u";
}

function playScene(lines, opts) {
  scene = { lines, i: 0, t: 0, ...(opts || {}) };
  P.moving = false;
  if (!scene.hold) showScene();
  walker = speakerNamed(scene.who);
  if (walker) {
    faceCorinAt(walker.x, walker.y);
    const dx = walker.x - P.x, dy = walker.y - P.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    if (d > 46 && !walker.goto && !walker.stationary) {
      if (!walker.home) walker.home = [walker.x, walker.y];
      const px = -dy / d, py = dx / d;      /* perpendicular, unit length */
      const side = (walker.x >= P.x) ? 1 : -1;
      walker.goto = [P.x + dx / d * 20 + px * 22 * side,
                     P.y + dy / d * 20 + py * 22 * side];
    }
  }
}
function sendWalkerHome(stay) {
  if (walker && !walker.home) { walker = null; return; }
  if (walker && walker.home && !stay)
    walker.goto = [walker.home[0], walker.home[1]];
  if (walker) walker.goto = stay ? null : walker.goto;
  walker = null;
}
function sceneHold() { return !!scene || revealing || hatchExit || !!bossScene; }
function advanceScene() {
  if (revealing) { hideReveal(); return; }
  if (!scene) return;
  if (scene.hold) return;          /* it has not begun */
  if (!typeDone()) { typeAll(); return; }
  if (scene.t < 0.2) return;      /* no skipping on a stray tap */
  /* The hatchling's two turns are staged beats, not skippable text taps. */
  if (scene.hatch && scene.i === 8 && scene.t < 1.1) return;
  if (scene.hatch && scene.i === 9 &&
      (scene.t < 1.1 || !hatchScene || !hatchScene.approachDone)) return;
  scene.i++;
  scene.t = 0;
  if (scene.i < scene.lines.length) { showScene(); return; }
  if (scene.until && !scene.until()) { scene.waiting = true; showScene(); return; }
  const done = scene.after, scene0 = scene;
  scene = null;
  const stay = scene0 && scene0.stay;
  showScene();
  sendWalkerHome(stay);
  if (done) done();
}
const HERD_Y = 414;
let gateRow = 370, eggGate = -1, fieldGate = -1;
let eggWarned = false;
const NORTH_GATE = 370;
const KING_GATE_Y = 384;
const KNIGHT_LINE = 386;
const ROAD_MID = 30;
function inRoadBand() {
  return true;
}
function blockedByItem(x, y) {
  if (MAPID !== "world") return false;
  for (const it of ITEMS) {
    if (!it.solid || !itemHere(it)) continue;
    if (x === it.tx && y === it.ty) return true;
  }
  return false;
}

let guardsAside = false;
function blockedByGuard(x, y) {
  if (quest > Q.KING || MAPID !== "world" || guardsAside) return false;
  const g = guards();
  if (leavingNow) return false;                        /* on their way out */
  if (!g.length || g.some(m => m.goto)) return false;   /* standing aside */
  const my = Math.floor((g[0].y - 1) / TS);
  return y === my && x <= 120;
}
const GATE_X0 = 26, GATE_X1 = 33;
const HERD = [[28, "cow_graze"], [30, "cow"], [32, "cow_graze"]];
const herdHere = () => quest < Q.KING;
function blockedByHerd(x, y) {
  if (x > 120) return false;
  if (!herdHere() || MAPID !== "world" || y !== HERD_Y) return false;
  return true;
}

const ITEMS = [
  { key: "eggs",  spr: "nest2", tx: 11, ty: 430, at: Q.EGGS, gone: Q.KING,
    took: "Corin gathers the eggs" },
  { key: "paint", spr: "it_paint", map: "house22", tx: 7, ty: 3,
    at: Q.ABED, gone: 99 },
  { key: "stump", spr: "mw_stump", tx: 30, ty: 20, at: Q.ABED, gone: 99,
    solid: 1 },
  { key: "egg",   spr: "it_egg", tx: 30, ty: 20, at: Q.FLED, gone: Q.CARRY,
    onTop: "mw_stump", took: "Corin takes the egg" },
];
const itemHere = (it) => {
  if (it.key === "egg" && quest < it.gone &&
      (greenPhase === "rise" || greenPhase === "depart" || greenPhase === "gone")) return true;
  return quest >= it.at && quest < it.gone;
};
function itemAt(px, py) {
  for (const it of ITEMS) {
    if ((it.map || "world") !== MAPID) continue;
    if (!itemHere(it) || !it.took) continue;
    if (Math.hypot(px / TS - it.tx, (py - 1) / TS - it.ty) < 2.2) return it;
  }
  return null;
}

const SPOT = {
  door:  [14, 421],      /* Corin's own front door, in Millwood */
  herd:  [30, 417],      /* the lane between the two cottages, where she waits */
  coop:  [10, 430],      /* the hen house behind the mill */
  king:  [31, 382],      /* the road north, before the woods */
  elder: [44, 375],      /* Maddock, out at the edge of his land by the road */
  north: [30, 20],       /* on the dragon itself: he walks up to it */
  path:  [30, 375],      /* the north road, west of the elder's land */
};
const near = (spot, r) => Math.hypot(P.x / TS - spot[0], (P.y - 1) / TS - spot[1]) <= (r || 3);

let kingWalk = 0;
const ROAD_GUARDS=new Set(['Serjeant Bram','Doran','Tolan']);
function kingsMen() {
  return npcs.filter(m => m.n==='King Halvard'||ROAD_GUARDS.has(m.n));
}

function takeItem(it) {
  if (it.key === "eggs") {
    quest = Q.KING;
    playScene(["You gather six brown eggs into the nest-basket.",
               "The hens complain. One of them means it.",
               "Hettie: Right -- on, you great sods. On!",
               "The road north is clear."],
              { who: "Hettie", after: () => {
                const her = npcs.find(m => /Hettie/.test(m.n || ""));
                if (her) beginHettieWalk(her);
              } });
  } else if (it.key === "egg") {
    quest = Q.CARRY;
    playScene(["The egg is warm, and heavier than it looks.",
               "Whatever is inside it moves once, and then is still.",
               "Maddock needs to see this."]);
  }
  if (it.took) toast(it.took);
}

function guards() {
  return npcs.filter(m => ROAD_GUARDS.has(m.n));
}
function kingNow() { return npcs.find(m => (m.n || "") === "King Halvard"); }
function dismissRoadGuards() {
  if(walker&&ROAD_GUARDS.has(walker.n))walker=null;
  npcs=npcs.filter(n=>!ROAD_GUARDS.has(n.n));
  MD.npcs=(MD.npcs||[]).filter(n=>!ROAD_GUARDS.has(n.n));
  guardsAside=true;
}

function royalBlackout(line,swap,after){
 pendingActorStage=()=>{swap();playScene([line],{stay:true,after:()=>{fadeDir=-1;if(after)after();}});return true;};
 fadeDir=1;
}
function questTalk() {
  if (quest <= Q.KING && MAPID === "world") {
    const near = guards().find(m => Math.hypot(m.x - P.x, m.y - P.y) < 40);
    if (near) {
      leavingNow = false;
      guardsAside = false;
      const k = kingNow();
      playScene([
        near.n.split(" ").pop() + ": HALT.",
        near.n.split(" ").pop() + ": Close enough. The King is on this road.",
        "Corin: I am only going up to the field.",
        near.n.split(" ").pop() + ": Then you can wait a minute to do it.",
      ], { after: () => {
        royalBlackout('Make way for King Halvard!',()=>{dismissRoadGuards();if(k)k.goto=null;},()=>{
          if(k){k.goto=standableNear(P.x+4,P.y-30)||[P.x+4,P.y-30];k.hurry=1;}
        // Opening forest encounter: use Halvard's villain theme while he speaks.
        if(window.EmberKingMusic) window.EmberKingMusic.start();
        playScene([
          "Halvard: Hold. You are out early for a boy with a basket.",
          "Halvard: There have been reports of wild dragons in this valley. "
            + "Have you seen anything?",
          "Corin: ...No, sire. Only the hens.",
          "Halvard: No. Of course you have not.",
          "Halvard: Go on, then. Mind the pass.",
        ], { who: "Halvard",
             stay:true,
             hold: () => {
               if(fade>0)return false;
               const kk = kingNow();
               return !kk || !kk.goto ||
                      Math.hypot(kk.x - P.x, kk.y - P.y) < 46;
             },
             after: () => {
               royalBlackout('out of my way, boy!',()=>{
                 leavingNow=false;banishKingsMen();
                 if(quest===Q.KING)quest=Q.ELDER;
               },()=>{
                 // Once Halvard has left the opening scene, restore the area's music.
                 if(window.EmberKingMusic) window.EmberKingMusic.stop();
               });
             } });
        });
      } });
      return true;
    }
  }
  if (MAPID !== "world" && MAPID !== "house22") return false;
  const nearNpc = (name, r) => {
    const m = npcs.find(x => (x.n || "").includes(name) && npcHere(x));
    return m && Math.hypot(m.x - P.x, m.y - P.y) < (r || 34) ? m : null;
  };
  if (quest === Q.ERRAND && nearNpc("Hettie")) {
    quest = Q.EGGS;
    playScene([
      "Hettie: Morning, Corin. No, you are not getting past, look at them.",
      "Hettie: Elder Maddock sent word at first light -- he wants eggs, today.",
      "Hettie: Go grab them from the coop behind the mill and I will have this "
        + "lot shifted by the time you are back.",
    ], { who: "Hettie" });
    return true;
  }
  if (quest === Q.CARRY && MAPID === "world" && nearNpc("Maddock")) {
    beginHatchScene(nearNpc("Maddock"));
    return true;
  }
  if (false && MAPID === "house22" && nearNpc("Maddock")) {
    playScene(HATCH_LINES, { who: "Maddock", after: () => {
      quest = Q.DONE;
      dragon.on = true;
      dragon.x = P.x - 24; dragon.y = P.y - 26;
      showReveal("drf_s", "THE DRAGON CHOOSES HIM");
      toast("The dragon follows you now");
    } });
    return true;
  }
  if (quest === Q.ELDER && MAPID === "house22" && nearNpc("Maddock")) {
    playScene([
      "Maddock: -- AH. Corin. God's teeth, boy, announce yourself.",
      "Maddock: ...The eggs. Yes. Good lad. Put them on the table.",
      "Corin: What is that painting? I have been in this room a hundred times "
        + "and never looked at it.",
      "Maddock: Fifty years ago seven Dragonriders kept the peace in Emberfell.",
      "Maddock: Halvard was one of them. He turned on the other six and took the throne. We call it Wingfall.",
      "Maddock: He won, and no dragon has been seen openly here since.",
      "Corin: Then what is in the north wood?",
      "Maddock: I do not know. But what Halvard did left the roads full of dead things. That is why nobody travels.",
    ], { who: "Maddock", after: () => { quest = Q.NOISE; } });
    return true;
  }
  return false;
}

let gateNagged = 0, eggNagged = 0;
function nagNorth() {
  if (!northShut() || scene) return;
  if (Math.abs(P.y / TS - NORTH_GATE) > 2) return;
  if (P.x / TS < GATE_X0 - 2 || P.x / TS > GATE_X1 + 2) return;
  if (performance.now() - gateNagged < 6000) return;
  gateNagged = performance.now();
  toast("Not north. Maddock's house first.");
}

function stepQuest(dt) {
  nagNorth();
  clearBridge();
  if (scene || fadeDir || doorMotion || pendingDoor || pendingActorStage) return;
  if (MAPID !== "world") return;

  if (false) {
    playScene([
      "Hettie: Morning, Corin. No, you are not getting past, look at them.",
      "Hettie: Elder Maddock sent word at first light -- he wants eggs, today.",
      "Hettie: Go grab them from the coop behind the mill and I will have this "
        + "lot shifted by the time you are back.",
    ], { who: "Hettie" });
    return;
  }
  if (quest === Q.ELDER && !warnedNorth &&
      P.y < (SPOT.elder[1] - 3) * TS && P.y > (SPOT.elder[1] - 20) * TS &&
      inRoadBand()) {
    playScene(["Maddock: Hey!"], {
      until: () => elderArrived(),
      after: () => { playScene([
        "Maddock: Hoy. Those are mine, I think.",
        "Maddock: My house is the other way, Corin. Bring them down.",
      ], { who: "Maddock", until: () => {
        goBackIn();
        return !!(elder() && elder().away);
      }, after: () => {
        warnedNorth = true;
        gateRow = Math.floor((P.y - 1) / TS) - 1;
      } });
    } });
    comeOut(P.x + 14, P.y + 26);
    return;
  }
  if (quest === Q.NOISE && MAPID === "world" && near(SPOT.path, 5)) {
    scatterBirds();
    playScene([
      "Something comes down in the north wood.",
      "Not thunder. Lower than thunder, and it does not roll away.",
      "The birds go up off the whole ridge at once.",
    ], { after: () => {
      comeOut(P.x + 22, P.y + 2);
      playScene([
        "Maddock: ...No. Not that way. Not unarmed.",
        "Maddock: Take this. It was my father's and it is older than that.",
        "Maddock: Shroom Pass has the dead walking in it now. Do not go quietly.",
        "Corin: What was it?",
        "Maddock: I have no more idea than you do, and I have lived here "
          + "sixty years. Go carefully. Come back.",
      ], { who: "Maddock", until: () => elderArrived(), after: () => {
        quest = Q.ARMED;
        goBackIn();
        potions += 5;
        showReveal("corin_sword_idle_d", "Corin obtained the Sword!", 5, true);
        setTimeout(() => showReveal((SPR.it_potion && "it_potion") || "corin_sword_idle_d",
                                    "Maddock packs five potions with it."), 1500);
      } });
    } });
    return;
  }
  if (quest === Q.FLED && MAPID === "world" &&
      P.y > (SPOT.north[1] + 5) * TS && P.y < (SPOT.north[1] + 30) * TS) {
    fieldGate = SPOT.north[1] + 6;
    if (!eggNagged || performance.now() - eggNagged > 6000) {
      eggNagged = performance.now();
      toast("Not without the egg.");
    }
    return;
  }
  if (quest < Q.ARMED && quest !== Q.FLED && MAPID === "world" &&
      near(SPOT.north, 2.5)) {
    quest = Q.ARMED;
  }
  if (quest === Q.ARMED && near(SPOT.north, 2.5)) {
    playScene([
      "Something comes over the treeline, low and wrong.",
    ], {
      until: () => greenPhase === "sit",
      after: () => playScene([
        "It comes down in the top of the field and does not get up.",
        "A dragon. Green, and torn about the wings, and breathing hard.",
        "It sees you before you have taken three steps.",
      ], {
        until: () => greenP > 1.6,
        after: () => playScene([
          "It drags itself up out of the grass, and there is something "
            + "on the stump where it was lying.",
        ], {
          until: () => { greenGone = true; return greenPhase === "gone"; },
          after: () => playScene([
            "The wings go out -- enormous, ragged -- and it is gone.",
            "There was an egg under it.",
          ], { after: () => { quest = Q.FLED; } }),
        }),
      }),
    });
    return;
  }
  if (quest === Q.CARRY && MAPID === "world" && elder() && elder().away) {
    const e = elder();
    e.away = 0;
    e.x = ELDER_WELL[0] * TS + TS / 2;
    e.y = ELDER_WELL[1] * TS + TS;
    e.goto = null;
    e.home = [e.x, e.y];
  }

  if (quest === Q.CARRY && MAPID === "world" &&
      P.y > (ELDER_WELL[1] + 4) * TS && !eggWarned &&
      Math.abs(P.x / TS - SPOT.elder[0]) < 16) {
    {
      const e = elder();
      if (e) {
        e.away = 0;
        e.hurry = 1;
        e.goto = standableNear(P.x + 20, P.y - 20);
        if (Math.hypot(e.x - P.x, e.y - P.y) > 6 * TS) {
          const up = offStage();
          e.away = 0;
          e.x = up[0]; e.y = up[1];
          e.home = [MAD_DOOR[0], MAD_DOOR[1]];
          e.goto = standableNear(P.x + 10, P.y - 22);
          e.hurry = 1;
          goingIn = false;
        }
      }
    }
    playScene(["Maddock: Corin! Not one more step."], {
      until: () => elderArrived(),
      after: () => playScene([
        "Maddock: What is that under your arm.",
        "Maddock: ...Bring it here. Before anyone on that road sees it.",
      ], { who: "Maddock", after: () => {
        eggGate = Math.floor((P.y - 1) / TS) + 1;
        eggWarned = true;
        const e = elder();
        if (e) { e.goto = [ELDER_WELL[0] * TS + TS / 2,
                           ELDER_WELL[1] * TS + TS]; }
      } }),
    });
    return;
  }

}

function offScreen(m) {
  const vw = cv.width / cam.z, vh = cv.height / cam.z;
  return m.x < cam.x - 40 || m.x > cam.x + vw + 40 ||
         m.y < cam.y - 40 || m.y > cam.y + vh + 40;
}
let leavingNow = false;
function stepKingsMen(dt) {
  /* This procession belongs only to Halvard's early roadside scene.
     Castle actors share the same names and must never inherit it. */
  if (!leavingNow || MAPID !== "world") return;
  kingWalk += dt;
  for (const m of kingsMen()) {
    m.leaving = 1;
    const want = 120 * dt;
    const side = (Math.abs(m.y - P.y) < 40 && Math.abs(m.x - P.x) < 34)
      ? (m.x >= P.x ? 120 : -120) * dt : 0;
    const gapNow = Math.hypot(m.x - P.x, m.y - P.y);
    const onBoy = (nx, ny) =>
      gapNow >= 14 && Math.hypot(nx - P.x, ny - P.y) < 14;
    if (canStand(m.x + side, m.y + want) && !onBoy(m.x + side, m.y + want)) {
      m.x += side; m.y += want;
    }
    else if (canStand(m.x, m.y + want) && !onBoy(m.x, m.y + want)) m.y += want;
    else if (onBoy(m.x, m.y + want) &&
             canStand(m.x + (m.x >= P.x ? TS : -TS), m.y)) {
      m.x += (m.x >= P.x ? want : -want) * 2;
    }
    else {
      const road = ROAD_MID * TS + TS / 2;
      const dir = Math.sign(road - m.x) || 1;
      if (canStand(m.x + dir * TS, m.y)) m.x += dir * want;
      else if (onBoy(m.x, m.y + want) &&
               canStand(m.x + (m.x >= P.x ? TS : -TS), m.y)) {
        m.x += (m.x >= P.x ? want : -want) * 2;   /* round the boy */
      }
      else m.y += want;               /* nothing works: leave rather than stick */
    }
    faceToward(m, m.x, m.y + 64);
  }
  if (walker && kingsMen().includes(walker)) walker = null;
}
function banishKingsMen() {
  if(!kingsMen().length)return;
  npcs = npcs.filter(m => m.n!=='King Halvard'&&!ROAD_GUARDS.has(m.n));
  MD.npcs = (MD.npcs || []).filter(m => m.n!=='King Halvard'&&!ROAD_GUARDS.has(m.n));
}

function stepScene(dt) {
  if (!scene) return;
  if (scene.hold) {
    if (!scene.hold()) { sayOff(); showFace(null); return; }
    scene.hold = null;
    showScene();
  }
  scene.t += dt;
  stepHatchScene(dt);
  if (scene.waiting && scene.until && scene.until()) {
    const done = scene.after, scene0 = scene;
    scene = null;
    const stay = scene0 && scene0.stay;
    showScene();
    sendWalkerHome(stay);
    if (done) done();
  }
}
const revEl = document.getElementById("reveal");
const revArt = document.getElementById("revealArt");
const revCap = document.getElementById("revealCap");
let revealing = false;
let revAnimTimer = null;
let revealQueue = [];
let revealAfter = null;
const REVEAL_BIG = { "drf_s": "drf_s", "dr5_idle_s": "dr5_idle_s" };
const KEY_ITEM_GET_AUDIO = "data:audio/mp4;base64,";
const keyItemGetSfx = new Audio(KEY_ITEM_GET_AUDIO);
keyItemGetSfx.preload = "auto";
keyItemGetSfx.volume = 0.72;
function isKeyItemReveal(caption) {
  const c = String(caption || "");
  return /^Corin (?:obtained|received)\b/i.test(c) || /mysterious stone/i.test(c);
}
function playKeyItemGet() {
  try {
    keyItemGetSfx.pause();
    keyItemGetSfx.currentTime = 0;
    const p = keyItemGetSfx.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
function showReveal(sprName, caption, maxScale, still, after) {
  if (revealing) { revealQueue.push([sprName, caption, maxScale, still, after]); return; }
  if (REVEAL_BIG[sprName] && SPR[REVEAL_BIG[sprName]]) sprName = REVEAL_BIG[sprName];
  const sp = SPR[sprName];
  if (!sp) { if (after) after(); return; }
  revealAfter = after || null;
  if (isKeyItemReveal(caption)) playKeyItemGet();
  if (revAnimTimer) { clearInterval(revAnimTimer); revAnimTimer = null; }
  const scale = Math.max(3, Math.min(maxScale || 5,
    Math.floor(Math.min(cv.width * 0.5 / sp[2], cv.height * 0.4 / sp[3]))));
  const img = sheetOf(sp);
  let sx = sp[0], sy = sp[1], sw = sp[2], sh = sp[3];
  try {
    const m = document.createElement("canvas");
    m.width = sp[2]; m.height = sp[3];
    const mg = m.getContext("2d", { willReadFrequently: true });
    drawGameImage(mg, img, sp[0], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
    const px = mg.getImageData(0, 0, sp[2], sp[3]).data;
    let l = sp[2], r = -1, t = sp[3], b = -1;
    for (let yy = 0; yy < sp[3]; yy++)
      for (let xx = 0; xx < sp[2]; xx++)
        if (px[(yy * sp[2] + xx) * 4 + 3] > 8) {
          if (xx < l) l = xx; if (xx > r) r = xx;
          if (yy < t) t = yy; if (yy > b) b = yy;
        }
    if (r >= l && b >= t) { sx = sp[0] + l; sy = sp[1] + t; sw = r - l + 1; sh = b - t + 1; }
  } catch (e) {}
  revArt.width = sw * scale;
  revArt.height = sh * scale;
  const g = revArt.getContext("2d");
  g.imageSmoothingEnabled = false;
  const drawFrame = (frame) => {
    g.clearRect(0, 0, revArt.width, revArt.height);
    drawGameImage(g, img, sx + frame * sp[2], sy, sw, sh, 0, 0, revArt.width, revArt.height);
  };
  drawFrame(0);
  const frames = sp[4] || 1;
  if (frames > 1 && !still) {
    let frame = 0;
    revAnimTimer = setInterval(() => {
      frame = (frame + 1) % frames;
      drawFrame(frame);
    }, 90);
  }
  revCap.textContent = caption;
  revEl.classList.add("on");
  revealing = true;
}
function hideReveal() {
  if (revTimer) { clearTimeout(revTimer); revTimer = null; }
  if (revAnimTimer) { clearInterval(revAnimTimer); revAnimTimer = null; }
  const after = revealAfter; revealAfter = null;
  revEl.classList.remove("on"); revealing = false;
  if (after) after();
  if (!revealing && revealQueue.length) {
    const [n, c, s, still, next] = revealQueue.shift();
    showReveal(n, c, s, still, next);
  }
}
let revTimer = null;
function flashReveal(sprName, caption, ms) {
  showReveal(sprName, caption);
  if (!revealing) return;
  if (revTimer) clearTimeout(revTimer);
  revTimer = setTimeout(() => { revTimer = null; hideReveal(); }, ms || 900);
}

const TYPE_CPS = 45;
let typed = 0, typeFull = "", typeWho = "";
function typeStart(who, text) {
  typeWho = who; typeFull = text; typed = 0;
}
function typeDone() { return typed >= typeFull.length; }
function typeAll() { typed = typeFull.length; typePaint(); }
function typePaint() {
  sayEl.innerHTML = esc(typeFull.slice(0, Math.floor(typed)));
  nameEl.textContent = typeWho || "";
  const faceLeft = (faceEl.className || "left").indexOf("right") < 0;
  nameEl.className = (typeWho ? "on " : "") + (faceLeft ? "right" : "left");
}
function stepType(dt) {
  if (typed >= typeFull.length) return;
  typed = Math.min(typeFull.length, typed + TYPE_CPS * dt);
  typePaint();
}

function showScene() {
  if (!scene) { sayOff(); showFace(null); return; }
  const line = scene.waiting ? "..." :
    scene.lines[Math.min(scene.i, scene.lines.length - 1)];
  const colon = line.indexOf(": ");
  const who = colon > 0 && colon < 22 ? line.slice(0, colon) : "";
  const text = who ? line.slice(colon + 2) : line;
  typeStart(who, text);
  typePaint();
  showFace(who);
  sayEl.classList.toggle("narr", !who);
  sayIsNarr = !who;
  sayOn();
}

const BREATH = { reach: 152, wide: 34, life: 0.8, standoff: 46,
                 bite: 10, minLen: 30, grow: 0.12 };
const BREATHS = ["fire", "slash", "lightning", "shadow", "ice"];
/* He hatches breathing fire, and already knows how to slash. Lightning,
   shadow, and ice arrive with their heartstones -- the bag entries already
   read their unlock straight off this table. */
const breathHas = { fire: true, slash: true, lightning: false, shadow: false, ice: false };
let breathPick = "fire";
const DRAGON_HP_BASE = 20, DRAGON_HP_PER_BREATH = 10;
const DRAGON_BREATH = {
  fire:   { damage: 8,  cool: 12, name: "Fire" },
  bolt:   { damage: 12, cool: 18, name: "Lightning" },
  shadow: { damage: 16, cool: 24, name: "Shadow" },
  ice:    { damage: 20, cool: 30, name: "Ice" },
};
const breathCooldown = { fire: 0, bolt: 0, shadow: 0, ice: 0 };
function dragonMaxHp() {
  return DRAGON_HP_BASE + ((breathHas.lightning ? 1 : 0) +
    (breathHas.shadow ? 1 : 0) + (breathHas.ice ? 1 : 0)) * DRAGON_HP_PER_BREATH;
}
function syncDragonVitality(fillGain = true) {
  const oldMax = dragon.maxHp || DRAGON_HP_BASE;
  const nextMax = dragonMaxHp();
  if (fillGain && nextMax > oldMax) dragon.hp = Math.min(nextMax, (dragon.hp ?? oldMax) + nextMax - oldMax);
  dragon.maxHp = nextMax;
  dragon.hp = Math.max(0, Math.min(nextMax, dragon.hp ?? nextMax));
  dragon.down = dragon.hp <= 0 || dragon.revive > 0;
}
function unlockDragonBreath(kind) {
  if (breathHas[kind]) return false;
  breathHas[kind] = true;
  syncDragonVitality(true);
  return true;
}
function recoverStrandedDragon() {
  if(!hasDragon() || boarMeat>0 || dragonFish>0 || !(dragon.down || dragon.hp<=0))return false;
  dragon.maxHp=dragonMaxHp();dragon.hp=dragon.maxHp;
  dragon.down=false;dragon.revive=0;dragon.knockdown=0;dragon.hurt=0;dragon.inv=1.2;
  dragon.tr=null;dragon.air=false;dragon.moving=false;
  refreshWingBtn();toast("the danger has passed; your dragon regains its strength");return true;
}
function breathElementKey(kind = dragonEl) {
  return kind === "lightning" ? "bolt" : kind;
}
function breathWait(kind = dragonEl) {
  return Math.max(0, breathCooldown[breathElementKey(kind)] || 0);
}
function hurtDragon(n) {
  if (foesHeld) return false;
  if (!dragonHere() || dragon.down || dragon.inv > 0 || devSafe) return false;
  dragon.hp = Math.max(0, dragon.hp - Math.max(1, n));
  dragon.hurt = 0.42; dragon.inv = 0.55;
  if (dragon.hp <= 0) {
    dragon.down = true; dragon.moving = false; dragon.air = false; dragon.tr = null;
    dragon.faintDir = cardinalDirection(dragon.dir) === "w" ? "w" : "e";
    dragon.revive = 0;
    hunt = null; breath = null; claw = null;
    if (mounted) setMounted(false, true);
    refreshWingBtn();
    toast("the dragon is hurt and cannot fight -- feed it to get it back up");
  }
  return true;
}
const BREATH_HUE = { fire: null, slash: "#e8e4d8", lightning: "#9fd8ff",
                     shadow: "#5a3f7a", ice: "#a8e8ff",
                     kingfire: "#7ef08a", kingclaw: "#b06ee8" };
const TEMPLE_GIFT = { tp: "lightning", sn: "shadow", ds: "ice" };
const HS_ICON = { lightning: "it_hs_light", shadow: "it_hs_shadow", ice: "it_hs_ice" };
function breathNext() {
  const had = BREATHS.filter(k => breathHas[k]);
  const i = had.indexOf(breathPick);
  breathPick = had[(i + 1) % had.length];
  toast("breath: " + breathPick);
}
const CHESTS = [
  { map: "tp1", x: 9.5, y: 7, gift: "lightning" },
  { map: "sn1", x: 9.5, y: 25, gift: "shadow" },
  { map: "ds1", x: 9.5, y: 20.5, gift: "ice" },
];
const chestOpen = {};              /* map id -> true once taken */
let chestAnim = null;              /* { map, t, phase } while it plays */
function chestHere() {
  return CHESTS.find(c => c.map === MAPID);
}
function tryChest() {
  const c = chestHere();
  if (!c || chestOpen[c.map] || chestAnim) return false;
  if (Math.hypot(P.x / TS - c.x, (P.y - 1) / TS - c.y) > 2.2) return false;
  chestAnim = { c, t: 0, phase: "lid" };
  return true;
}
function checkGravePrize() {
  if (charm.wake || MAPID !== "world" || !arenaLock) return;
  const w = arenaLock.waves || (arenaLock.wave2 ? [1] : []);
  if (arenaLock.id !== 207 || (arenaLock._wave || 0) < w.length) return;
  if (arenaFoesLeft(arenaLock)) return;
  charm.wake = true;
  showReveal((SPR.it_wake && "it_wake") || "it_stone", CHARM_NOTE.wake);
}
function checkDeepPrize() {
  checkGravePrize();
  if (charm.flame || MAPID !== "mine5") return;
  if (!foes.length) return;
  for (const f of foes) if (f.st !== "dead") return;
  charm.flame = true;
  showReveal((SPR.it_twinflame && "it_twinflame") || "fire_s", CHARM_NOTE.flame);
}
let darkKick = 0;
function stepDark(dt) {
  if (!MD || !MD.dark || charm.lamp) { darkKick = 0; return; }
  if (sceneHold() || fadeDir !== 0) return;
  darkKick += dt;
  if (darkKick < 0.9) return;                 /* a moment to see nothing */
  darkKick = 0;
  const back = (MD.doors || []).find(d => /^mine/.test(d.to || ""));
  if (!back) return;
  playScene(["It is too dark to see a hand in front of him."], {
    after: () => { pendingDoor = back; fadeDir = 1; }
  });
}
function stepChest(dt) {
  stepDark(dt);
  checkDeepPrize();
  if (!chestAnim) return;
  chestAnim.t += dt;
  const a = chestAnim;
  if (a.phase === "lid" && a.t > 0.9) { a.phase = "ghost"; a.t = 0; }
  else if (a.phase === "ghost" && a.t > 1.2) {
    chestOpen[a.c.map] = true;
    unlockDragonBreath(a.c.gift);
    chestAnim = null;
    const giftName = a.c.gift[0].toUpperCase() + a.c.gift.slice(1);
    const giftIcon = HS_ICON[a.c.gift];
    showReveal(SPR[giftIcon] ? giftIcon : "chest",
               "Corin obtained a Heartstone! The " + giftName + " breath is unlocked.", 3);
  }
}
function drawChest() {
  const c = chestHere();
  if (!c) return;
  const sp = MD?.templeContinuous ? SPR.temple71_chest : SPR.chest;
  if (!sp) return;
  const px = c.x * TS + TS / 2 - sp[2] / 2, py = c.y * TS + TS - sp[3];
  let f = 0;
  if (chestOpen[c.map]) f = sp[4] - 1;
  else if (chestAnim && chestAnim.phase !== "lid") f = sp[4] - 1;
  else if (chestAnim) f = Math.min(sp[4] - 1, Math.floor(chestAnim.t / 0.9 * sp[4]));
  drawGameImage(ctx, atlasImg, sp[0] + f * sp[2], sp[1], sp[2], sp[3],
                Math.round(px), Math.round(py), sp[2], sp[3]);
  if (chestAnim && chestAnim.phase === "ghost" && SPR.ghost_rise) {
    const g = SPR.ghost_rise;
    const gf = Math.min(g[4] - 1, Math.floor(chestAnim.t / 1.2 * g[4]));
    const rise = chestAnim.t / 1.2 * 22;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - chestAnim.t / 1.2 * 0.5);
    drawGameImage(ctx, atlasImg, g[0] + gf * g[2], g[1], g[2], g[3],
                  Math.round(c.x * TS + TS / 2 - g[2] / 2),
                  Math.round(c.y * TS - g[3] - rise), g[2], g[3]);
    ctx.restore();
  }
}
let breathT = 0, breath = null;
function dragonCombatHere() {
  /* Cinderhold is an enclosed map, but its hall is the mounted dragon arena. */
  return dragonHere() || (MAPID === "cinderhold" && dragon.on &&
    (mounted || lastFight || trial || foes.some(f => f.st !== "dead")));
}
function canBreathe() { return !devDragonPassive && !fishing && breathWait() <= 0 && dragonCombatHere() && dragon.on && !dragon.down && dragon.knockdown <= 0; }

let MOUTH = ATLAS.dragon_mouth ||
  {"n":[0.3889,0.1712],"e":[0.831,0.5322],"s":[0.3889,0.6124],"w":[0.1528,0.5347]};
const MOUTH_GND = DRAGON_MOUTH || MOUTH;
function mouthOf(dir) {
  const s2 = dragonSprite(dir);
  const tbl = dragonAirborne() ? MOUTH : MOUTH_GND;
  const diagonal = {ne:[.76,.32],nw:[.24,.32],se:[.77,.69],sw:[.23,.69]};
  const m = diagonal[dir] || tbl[dir] || tbl.s;
  const bob = dragonBob();
  const DS = DRAGON_DRAW_SCALE;
  const fx = dragonFlip(dir) ? -1 : 1;     /* west is east, mirrored */
  const x = dragon.x + (-s2[2] / 2 + s2[2] * m[0]) * DS * fx;
  const y = dragon.y + bob + (-s2[3] + s2[3] * m[1]) * DS;
  const [vx, vy] = directionVector(dir);
  /* The refreshed dragon art already places the anchor at the snout. */
  return [x - vx * 3, y - vy * 3];
}

let dragonEl = "fire";        /* which breath the L-menu last chose */
function breatheFire() {
  if(devDragonPassive){toast("dragon attacks are disabled in dev tools");return;}
  if (!canBreathe()) {
    if (dragon.down) toast("the dragon is hurt -- feed it first");
    else if (!dragonCombatHere()) toast("the dragon is not here");
    else if (breathWait() > 0) toast((DRAGON_BREATH[breathElementKey()]?.name || "breath") + " ready in " + breathWait().toFixed(1) + "s");
    return;
  }
  /* A commanded breath is a priority order, not something claws can defer.
     Keep an already-visible breath intact, but cancel a prior wind-up, claw
     recovery and retreat so the dragon immediately makes room to cast. */
  if (breath) { toast("the dragon is already breathing"); return; }
  hunt = null;
  claw = null;
  clawT = 0;
  linger = 0;
  dragonCombatPause = 0;
  dragonRecall = false;
  dragonRecallT = 0;
  let best = null, bd = 1e9;
  for (const f of foes) {
    if (f.st === "dead" || f.ally || f.storyPassive) continue;
    const d = Math.hypot(f.x - dragon.x, f.y - dragon.y);
    /* The king dragon may be across the arena: approach its firing distance
       instead of wasting the player command as a blind shot. */
    if ((f.kind === "kdragon" || f.kind === "lich" || d < 320) && d < bd) { bd = d; best = f; }
  }
  if (best) {
    /* King breaths have a deliberate wind-up and keep a clear standoff. */
    if (best.kind === "kdragon" || best.kind === "lich") {
      hunt = { foe: best, t: 0, kingBreath: true }; return;
    }
    hunt = { foe: best, t: 0 }; return;
  }
  const d = playerFacing4();
  dragon.dir = d;
  fireNow(d);
}
const DRAGON_PROJECTILE = { fire: 10, ice: 13, bolt: 17, shadow: 17 };
function kingDragonMouth(f, dir) {
  /* Anchor the cast to the displayed attack cell, not the boss's old
     full-size collision art.  That keeps every bolt inside the open-mouth
     frame even when the king dragon's draw scale changes. */
  const d = cardinalDirection(dir);
  const sp = SPR["kdnew_atk_" + d] || SPR.kdnew_atk_s;
  const w = (sp ? sp[2] : 176) * KING_DRAGON_DRAW_SCALE;
  const h = (sp ? sp[3] : 176) * KING_DRAGON_DRAW_SCALE;
  const anchors = { n:[.50,.18], s:[.50,.38], e:[.75,.34], w:[.25,.34] };
  const at = anchors[d] || anchors.s;
  return { x: f.x - w / 2 + w * at[0], y: f.y - h + h * at[1] };
}
function fireNow(dir, target = null) {
  if(fishing)return;
  if (breath) return;
  dragon._dir = dir;
  dragonFacingLocked = true;
  const el = DRAGON_PROJECTILE[dragonEl] ? dragonEl : "fire";
  breathCooldown[el] = DRAGON_BREATH[el].cool;
  breathT = breathCooldown[el];
  /* Let the breath land and its recovery read before claws can resume. */
  dragonCombatPause = Math.max(dragonCombatPause, 2.30);
  if (target && (target.kind === "kdragon" || target.kind === "lich"))
    target.cool = Math.max(target.cool || 0, 0.55);
  // Select the firing sprite before measuring its mouth anchor.
  breath = { dir, el, t: 0 };
  const m = mouthOf(dir);
  let [dx,dy] = directionVector(dir);
  if (target) {
    const body = foeBodyProfile(target);
    dx = body.x - m[0]; dy = body.y - m[1];
  }
  const d = Math.hypot(dx, dy) || 1;
  Object.assign(breath, { x: m[0], y: m[1], vx: dx / d, vy: dy / d,
    distance: 0, hit: 0, impactT: 0, speed: el === "bolt" ? 300 : 200 });
}
function stepHunt(dt) {
  if (!hunt) return;
  hunt.t += dt;
  const f = hunt.foe;
  if (f.st === "dead" || hunt.t > 4) { hunt = null; return; }
  if (hunt.kingBreath) {
    const body = foeBodyProfile(f);
    const dx = body.x - dragon.x, dy = body.y - dragon.y;
    const d = Math.hypot(dx, dy) || 1;
    const aim = direction4(dx, dy, dragon.dir);
    dragon.dir = aim;
    /* Move radially, never toward a fixed side tile that could be a wall. */
    const stand = 112, gap = d - stand;
    if (!(typeof mounted !== "undefined" && mounted) && Math.abs(gap) > 12 && hunt.t < 0.72) {
      const pace = Math.min(130, 58 + Math.abs(gap) * 2);
      dragon.moving = true;
      dragonStep((dx / d) * pace * dt * Math.sign(gap),
                 (dy / d) * pace * dt * Math.sign(gap));
      return;
    }
    dragon.moving = false;
    /* A visible wind-up remains even if a wall prevents the ideal standoff. */
    if (hunt.t < 1.05) return;
    fireNow(aim, f); hunt = null; return;
  }
  const ax = dragon.x - f.x, ay = dragon.y - f.y;
  let side;
  if (Math.abs(ax) > Math.abs(ay)) side = ax > 0 ? "e" : "w";
  else side = ay > 0 ? "s" : "n";
  const sx = side === "e" ? 88 : side === "w" ? -88 : 0;
  const sy = side === "s" ? 88 : side === "n" ? -88 : 0;
  const tx = f.x + sx, ty = f.y + sy + 10;
  const dx = tx - dragon.x, dy = ty - dragon.y;
  const d = Math.hypot(dx, dy);
  const aim = side === "e" ? "w" : side === "w" ? "e" : side === "s" ? "n" : "s";
  dragon.dir = aim;
  if (d > 7) {
    const sp = Math.min(260, 90 + d * 3) * (dragonAirborne() ? 1 : 0.72);
    dragonStep((dx / d) * sp * dt, (dy / d) * sp * dt);
    return;
  }
  fireNow(aim, f);
  hunt = null;
}
function beamLength() {
  const [dx,dy] = directionVector(breath.dir);
  let stop = BREATH.reach;
  for (const f of foes) {
    if (f.st === "dead" || f.storyPassive) continue;
    const rx = f.x - breath.x, ry = f.y - breath.y;
    const along = rx * dx + ry * dy;
    const across = Math.abs(rx * dy - ry * dx);
    if (across > BREATH.wide || along <= 0) continue;
    stop = Math.min(stop, along + BREATH.bite);
  }
  const open = BREATH.grow > 0 ? Math.min(1, breath.t / BREATH.grow) : 1;
  return Math.max(BREATH.minLen, Math.min(BREATH.reach, stop)) * open;
}
function foeBodyProfile(f) {
  /* Foes are foot-anchored. The king dragon's new art is much wider and
     taller than the original sprite, so its hurt area must match the body. */
  if (f.kind === "kdragon") {
    const [dx,dy] = directionVector(f.dir8 || legacyDirection(f.dir,f.flip));
    return { x: f.x - dx * 6, y: f.y - 38 - dy * 6, r: 36 };
  }
  return { x: f.x, y: f.y - 16, r: 24 };
}
function stepBreath(dt) {
  if (foesHeld) return;
  if (bossScene) return;
  if (dragonCombatPause > 0) dragonCombatPause = Math.max(0, dragonCombatPause - dt);
  for (const k in breathCooldown) if (breathCooldown[k] > 0)
    breathCooldown[k] = Math.max(0, breathCooldown[k] - dt);
  breathT = breathWait();
  stepHunt(dt);
  dragonFacingLocked = !!breath;
  if (!breath) return;
  const b = breath, previous = b.t;
  b.t += dt;
  if (b.hit) {
    b.impactT += dt;
    if (b.impactT >= 0.2) breath = null;
  } else {
    // A short cast, followed by small collision steps so fast bolts cannot tunnel.
    let travel = Math.min(BREATH.reach - b.distance,
      (Math.max(0, b.t - 0.15) - Math.max(0, previous - 0.15)) * b.speed);
    while (travel > 0 && !b.hit && breath === b) {
      const step = Math.min(4, travel);
      const nx = b.x + b.vx * step, ny = b.y + b.vy * step;
      if (isSolid(nx, ny)) { b.hit = 1; break; }
      b.x = nx; b.y = ny; b.distance += step; travel -= step;
      const f = foes.find(f => {
        if (f.st === "dead" || f.ally || f.storyPassive) return false;
        const body = foeBodyProfile(f);
        return Math.hypot(body.x - b.x, body.y - b.y) < body.r;
      });
      if (f) {
        b.hit = 1;
        const power = DRAGON_BREATH[b.el]?.damage || DRAGON_BREATH.fire.damage;
        const fullHp = (FOE[f.kind] || {}).hp || f.hp;
        /* A fresh enemy always survives the first blast; later blasts or
           Corin's attacks can finish it. */
        const damage = f.hp >= fullHp ? Math.min(power, Math.max(1, f.hp - 1)) : power;
        f.hp = Math.max(0, f.hp - damage); f.hurt = 0.35;
        if (f.hp <= 0) {
          f.st = "dead"; f.t = 0;
          if (!f.storyKnight) dropGold(f.x, f.y, f.kind);
          markBossGone(f);
        }
      }
    }
    if (b.distance >= BREATH.reach && !b.hit) breath = null;
  }
  dragonFacingLocked = !!breath;
}
function drawLavaBubbles() {
  const s = SPR.vl_bub;
  if (!s) return;
  const x0 = Math.floor(cam.x / TS) - 1, y0 = Math.floor(cam.y / TS) - 1;
  const x1 = x0 + Math.ceil(VW / cam.z / TS) + 2;
  const y1 = y0 + Math.ceil(VH / cam.z / TS) + 2;
  if (x1 - x0 > 200) return;                 /* zoomed too far out to matter */
  const now = performance.now() / 1000;
  for (let y = Math.max(0, y0); y < Math.min(MH, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(MW, x1); x++) {
      if (terr[y * MW + x] !== VLAVA) continue;
      const ld = lavaDist(x, y);
      if (ld < 2 || ld > BUBBLE_REACH) continue;
      if (typeof cliffAt === "function" && cliffAt(x, y)) continue;
      const seed = (x * 73856093 ^ y * 19349663) >>> 0;
      if (seed % (ld <= 3 ? 5 : 11)) continue;
      const period = 2.6 + (seed % 40) / 10;
      const phase = (now + (seed % 100) / 10) % period;
      if (phase > 0.9) continue;             /* mostly still, a brief pop */
      const f = Math.min(s[4] - 1, Math.floor(phase / 0.9 * s[4]));
      drawGameImage(ctx, atlasImg, s[0] + f * s[2], s[1], s[2], s[3],
                    Math.round(x * TS), Math.round(y * TS), s[2], s[3]);
    }
  }
}
function drawDark() {
  if (!MD || !MD.dark) return;
  if (charm.lamp) return;         /* carrying the lantern lights the gallery */
  const r = 26 * cam.z;
  const px = (P.x - cam.x) * cam.z, py = (P.y - 10 - cam.y) * cam.z;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(px, py, r * 0.35, px, py, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.7, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0.97)");
  ctx.fillStyle = "rgba(0,0,0,0.97)";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawKingDragon() {
  if (lastFight) return;
  const k = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  if (!k || (typeof npcHere === "function" && !npcHere(k))) return;
  const dir = k.f === "w" ? "w" : k.f === "e" ? "e" : "s";
  const sp = SPR["kdnew_fly_" + dir] || SPR.kdnew_fly_s;
  if (!sp) return;
  const side = (dir === "w") ? -1 : 1;
  const dw = Math.round(sp[2] * KING_DRAGON_DRAW_SCALE);
  const dh = Math.round(sp[3] * KING_DRAGON_DRAW_SCALE);
  const px = k.x + side * 46 - dw / 2;
  const py = k.y + 8 - dh;
  const fr = Math.floor(tAcc * 3) % (sp[4] || 1);
  drawGameImage(ctx, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
                Math.round(px), Math.round(py), dw, dh);
}
function drawDying() {
  if (!P.act || P.act.kind !== "die") return;
  const k = ACT.die;
  const p = Math.min(1, P.act.t / (k.frames / k.fps));
  const w2 = VW / cam.z, h2 = VH / cam.z;
  ctx.save();
  ctx.globalCompositeOperation = "saturation";
  ctx.globalAlpha = p * 0.92;
  ctx.fillStyle = "hsl(0,0%,50%)";
  ctx.fillRect(cam.x, cam.y, w2, h2);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = p * 0.55;
  ctx.fillStyle = "#07060a";
  ctx.fillRect(cam.x, cam.y, w2, h2);
  ctx.globalAlpha = p * 0.8;
  const g = ctx.createRadialGradient(P.x, P.y - 10, w2 * (0.5 - p * 0.34),
                                     P.x, P.y - 10, w2 * 0.78);
  g.addColorStop(0, "rgba(7,6,10,0)");
  g.addColorStop(1, "rgba(7,6,10,0.95)");
  ctx.fillStyle = g;
  ctx.fillRect(cam.x, cam.y, w2, h2);
  ctx.globalAlpha = 1;
  ctx.restore();
}
function drawBreath() {
  drawFall();
  drawLoot();
  drawFly();
  drawDust();
  drawDying();
  drawSaintBuff(true);
  drawHeal();
  drawSpell();
  drawKingDragon();
  if(!MD?.templeContinuous)drawChest();
}
function drawDragonProjectile() {
  if (!breath || breath.t < 0.15) return;
  const b = breath, count = DRAGON_PROJECTILE[b.el];
  const frame = Math.floor(Math.max(0, b.t - 0.15) * 24) % count;
  const sp = SPR["fx_attack_" + b.el + "_" + frame];
  if (!sp) return;
  const size = (b.el === "fire" ? 54 : 46) * (b.hit ? 1 + b.impactT * 2 : 1);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  ctx.globalAlpha = b.hit ? Math.max(0, 1 - b.impactT / 0.2) : 1;
  drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3], -size / 2, -size / 2, size, size);
  ctx.restore();
}

let foes = [];
const ROAD_NET = {
  "Route 1":        { from: "Millwood",  to: "Thornwell",         legs: [12, 13] },
  "Route 2":        { from: "Thornwell", to: "Forgewick",         legs: [19, 193] },
  "Temple Route 1": { from: "Forgewick", to: "Forgewick Temple",  legs: [24, 25, 26] },
  "Route 3":        { from: "Forgewick", to: "Sandspire",         legs: [31, 32, 33] },
  "Temple Route 2": { from: "Sandspire", to: "Sandspire Temple",  legs: [37, 38, 39, 40] },
  "Route 4":        { from: "Sandspire", to: "Coralmere",         legs: [44, 45, 46, 51, 57] },
  "Route 5":        { from: "Coralmere", to: "Hollybeck",         legs: [58, 61, 62, 63, 64, 66, 67, 70, 71, 72] },
  "Temple Route 3": { from: "Hollybeck", to: "Hollybeck Temple",  legs: [74, 75, 78] },
  "Route 6":        { from: "Hollybeck", to: "Frostcrag",         legs: [84, 85, 86, 87] },
  "Route 7":        { from: "Ashcrag",   to: "Cinderhold Castle", legs: [88, 91, 92, 93, 94, 95] },
  "Oasis spur":     { from: "Route 3",   to: "The Oasis",              legs: [42] },
  "Graveyard spur": { from: "Hollybeck", to: "Hollybeck Graveyard",    legs: [80] },
  "Shroom Pass":    { from: "Millwood",  to: "Shroom Pass",            legs: [3] },
  "Northern Woods": { from: "Millwood",  to: "Northern Woods",         legs: [5] },
};
function roadOf(id) {
  for (const [nm, r] of Object.entries(ROAD_NET))
    if (r.legs.includes(id)) return nm;
  return null;
}
function roadLegs(nm) {
  const r = ROAD_NET[nm];
  return r ? features.filter(f => f.kind === "route" && r.legs.includes(f.id)) : [];
}

const FOE = {
  treasuryknight: {hp:24,speed:44,sight:300,reach:31,ring:42,dmg:2,swingT:.95,hitAt:.58,rest:.8,groupRest:1.2,wind:.32},
  royalguard: { hp:8,speed:39,sight:240,reach:29,ring:44,dmg:2,swingT:1.08,hitAt:.58,rest:1.1,groupRest:1.5,wind:.38 },
  knight:  { hp: 9, speed: 42, sight: 240, reach: 29, ring: 48, dmg: 2,
             swingT: 1.08, hitAt: 0.58, rest: 0.85, groupRest: 1.35, wind: 0.30 },
  reptile: { hp: 7, speed: 34, sight: 160, reach: 26, ring: 52, dmg: 2,
             swingT: 1.0, hitAt: 0.55, rest: 0.9, groupRest: 1.5, wind: 0.4 },
  skeleton: { hp: 3, speed: 26, sight: 110, reach: 20, ring: 52, dmg: 1,
          swingT: 1.2, hitAt: 0.6, rest: 2.0, groupRest: 4.8, wind: 0.7 },
  golem2:   { hp: 6, speed: 18, sight: 130, reach: 26, ring: 60, dmg: 2,
          swingT: 1.6, hitAt: 0.9, rest: 1.69, groupRest: 3.35, wind: 0.78 },
  golem3:   { hp: 8, speed: 20, sight: 140, reach: 28, ring: 64, dmg: 2,
          swingT: 1.5, hitAt: 0.85, rest: 1.56, groupRest: 3.1, wind: 0.74 },
  ent:      { hp: 7, speed: 16, sight: 120, reach: 30, ring: 62, dmg: 2,
          swingT: 1.7, hitAt: 0.95, rest: 1.82, groupRest: 3.47, wind: 0.86 },
  shroomBrown:  { hp: 4, speed: 24, sight: 120, reach: 22, ring: 50, dmg: 1,
                  swingT: 1.1, hitAt: 0.55, rest: 1.5, groupRest: 2.9, wind: 0.6 },
  shroomRed:    { hp: 6, speed: 26, sight: 130, reach: 24, ring: 52, dmg: 2,
                  swingT: 1.1, hitAt: 0.55, rest: 1.3, groupRest: 2.5, wind: 0.55 },
  shroomPurple: { hp: 9, speed: 22, sight: 140, reach: 26, ring: 56, dmg: 2,
                  swingT: 1.2, hitAt: 0.6, rest: 1.4, groupRest: 2.6, wind: 0.62 },
  plant1:   { hp: 3, speed: 22, sight: 100, reach: 20, ring: 46, dmg: 1,
          swingT: 1.1, hitAt: 0.55, rest: 1.8, groupRest: 3.6, wind: 0.6 },
  plant2:   { hp: 5, speed: 20, sight: 105, reach: 22, ring: 48, dmg: 1,
          swingT: 1.2, hitAt: 0.6, rest: 2.0, groupRest: 3.8, wind: 0.7 },
  gnoll2:   { hp: 6, speed: 28, sight: 140, reach: 24, ring: 52, dmg: 2,
          swingT: 1.1, hitAt: 0.55, rest: 1.17, groupRest: 2.23, wind: 0.51 },
  golem1:   { hp: 7, speed: 20, sight: 130, reach: 26, ring: 56, dmg: 2,
          swingT: 1.3, hitAt: 0.7, rest: 1.43, groupRest: 2.73, wind: 0.7 },
  kdragon:  { hp: 34, speed: 46, sight:999, reach: 175, ring: 64, dmg: 4,
              swingT: 1.9, hitAt: 1.0, rest: 2.6, groupRest: 3.2, wind: 1.08,
              cast: "lcfire", boltSp: 220 },
  devil:    { hp: 20, speed: 24, sight: 170, reach: 38, ring: 78, dmg: 3,
          swingT: 1.5, hitAt: 0.8, rest: 1.43, groupRest: 2.73, wind: 0.86 },
  lich:     { hp: 16, speed: 18, sight: 190, reach: 150, ring: 110, dmg: 3,
          swingT: 1.6, hitAt: 0.85, rest: 1.56, groupRest: 2.98, wind: 0.94,
          cast: "lcfire", boltSp: 150, standoff: 120 },
  eyeRed:   { hp: 5, speed: 14, sight: 170, reach: 34, ring: 70, dmg: 2,
          swingT: 1.4, hitAt: 0.8, rest: 1.43, groupRest: 2.73, wind: 0.7 },
  eyePurple:{ hp: 8, speed: 12, sight: 180, reach: 36, ring: 74, dmg: 2,
          swingT: 1.6, hitAt: 0.9, rest: 1.69, groupRest: 3.1, wind: 0.82 },
  boneguard:{ hp: 7, speed: 34, sight: 160, reach: 26, ring: 52, dmg: 2,
              swingT: 1.0, hitAt: 0.55, rest: 0.9, groupRest: 1.5, wind: 0.4 },
  wraith:   { hp: 8, speed: 42, sight: 999, reach: 26, ring: 46, dmg: 2,
              swingT: 0.96, hitAt: 0.53, rest: 0.85, groupRest: 1.49, wind: 0.43 },
  ghost:    { hp: 6, speed: 26, sight: 150, reach: 30, ring: 64, dmg: 2,
          swingT: 1.1, hitAt: 0.6, rest: 1.04, groupRest: 1.98, wind: 0.55 },
};
Object.assign(FOE, {
  devil1: { ...FOE.devil, hp: 18, speed: 30 },
  devil3: { ...FOE.devil, hp: 24, dmg: 4 },
  skeleton1: { ...FOE.skeleton, hp: 5 },
  skeleton3: { ...FOE.boneguard, hp: 10 },
  mage1: { ...FOE.lich, hp: 9, dmg: 2 },
  mage2: { ...FOE.lich, hp: 12, dmg: 2 },
  ghost3: { ...FOE.ghost },
  eye2: { ...FOE.eyeRed },
  ent1: { ...FOE.ent }, ent2: { ...FOE.ent },
  gnoll1: { ...FOE.gnoll2 }, gnoll3: { ...FOE.gnoll2 },
  plant3: { ...FOE.plant2 },
  reptile2: { ...FOE.reptile }, reptile3: { ...FOE.reptile }
});
const ROUTE_2_HP_START_X = 320 * TS;
const POST_ROUTE_2_COMBAT_MAPS = new Set([
  "mine2", "mine3", "mine4", "mine5",
  "tp1", "tp2", "tp3", "tp4",
  "ds1", "ds2", "ds3", "ds4",
  "sn1", "sn2", "sn3", "sn4",
  "passage", "passage2", "passage3", "cinderhold"
]);
function enemyMaxHp(kind, x, mapId = MAPID) {
  const base = (FOE[kind] || FOE.skeleton).hp;
  const late = mapId === "world"
    ? x >= ROUTE_2_HP_START_X
    : POST_ROUTE_2_COMBAT_MAPS.has(mapId);
  return base * (late || mapId.startsWith("royal_") ? 2 : 1);
}
const FOE_ART = { treasuryknight:"kn3", royalguard:"kn", knight: "kn", devil1: "dv1", devil3: "dv3", skeleton1: "bs1", skeleton3: "bs3", mage1: "lc1", mage2: "lc2", shroomBrown: "ms1", eye2: "bh2", ent1: "ent1", ent2: "ent2", gnoll1: "gn1", gnoll3: "gn3", plant3: "pl3", reptile2: "rp2", reptile3: "rp3", reptile: "rp1", kdragon: "kd92", shroomRed: "ms2", shroomPurple: "ms3",
                  golem2: "gm2", golem3: "gm3", ent: "ent3",
                  plant1: "pl1", plant2: "pl2", gnoll2: "gn2",
                  eyeRed: "bh1", eyePurple: "bh3", golem1: "gm1", lich: "lc3", devil: "dv2",
                  ghost: "gh1", ghost3: "gh3", wraith: "gh2", boneguard: "bg" };
const FOE_BORROW = { wraith: {},
                     kdragon:{} };
const seenFoe = {};
let seenCount = 0;
let knightEncounterDone = false;
let knightEncounterPhase = "waiting";
let knightEncounter = null;
function bookOrder() {
  const met = BESTIARY.filter(e => seenFoe[e.k]).sort((a, b) => seenFoe[a.k] - seenFoe[b.k]);
  const not = BESTIARY.filter(e => !seenFoe[e.k]);
  return met.concat(not);
}
