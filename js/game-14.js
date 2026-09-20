function clawNow() {
  if(fishing)return;
  if(devDragonPassive){toast("dragon attacks are disabled in dev tools");return;}
  if (!dragonHere() || !dragon.on) { toast("the dragon is not here"); return; }
  if (dragon.down) { toast("the dragon is hurt -- feed it first"); return; }
  if (dragon.knockdown > 0) { toast("the dragon is still getting up"); return; }
  const rid = typeof mounted !== "undefined" && mounted;
  if (rid) {
    if (P.act) return;
    P.act = { kind: "swing", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4(), hit: true };
    dragon.x = P.x; dragon.y = P.y;
  }
  let best = null, bd = 1e9;
  for (const f of foes) {
    if (f.st === "dead") continue;
    const d = Math.hypot(f.x - dragon.x, f.y - dragon.y);
    if (d < 150 && d < bd) { bd = d; best = f; }
  }
  if (best) {
    const dx = best.x - dragon.x, dy = best.y - dragon.y;
    dragon.dir = direction4(dx,dy,dragon.dir);
  } else {
    dragon.dir = playerFacing4();
  }
  if (rid) dragon.dir = playerFacing4();
  claw = { dir: dragon.dir, t: 0, x: dragon.x, y: dragon.y - 8 };
  /* It used to sweep a full circle of CLAW_REACH round the dragon, so a rider
     could stand anywhere in a ring and clear it by spamming the swing. It is
     a claw: it reaches in front, and not as far. */
  const RIDE_REACH = 46, RIDE_ARC = 0.42;   /* cos of about 65 degrees */
  const [fx,fy] = directionVector(dragon.dir);
  for (const f of foes) {
    if (f.st === "dead" || f.ally) continue;
    const body = foeBodyProfile(f);
    const ax = body.x - dragon.x, ay = body.y - dragon.y;
    const d = Math.hypot(ax, ay);
    if (d > RIDE_REACH + body.r) continue;
    if (d > 8 && (ax / d) * fx + (ay / d) * fy < RIDE_ARC) continue;
    if ((f.kind === "kdragon" || f.kind === "lich") && f.swordGuard > 0) {
      kingDeflect(f, dragon);
      continue;
    }
    f.hp -= CLAW.dmg; f.hurt = 0.25;
    if (f.hp <= 0) { f.st = "dead"; f.t = 0; markBossGone(f); }
  }
}

tap(document.getElementById("bTrace"),()=>setGeometryTool(collideView?null:'collision'));

(function () {
  const b = document.getElementById("btnDev");
  if (!b) return;
  const go = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setDev(!devOpen);
    b.classList.toggle("on", devOpen);
  };
  b.addEventListener("click", go);
  b.addEventListener("touchstart", go, { passive: false });
})();
bindAtlasAndGeometry();
