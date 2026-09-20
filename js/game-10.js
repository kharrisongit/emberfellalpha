const BESTIARY = [
  {"k": "devil1", "n": "Cinder Bailiff", "w": "the demon's Cinderhold trials", "t": "Before the Wingfall, riders sealed bargains with burned handprints. The Cinder Bailiffs still collect those debts. Maelis has persuaded one that a fair contest counts as payment."},
  {"k": "devil3", "n": "Crownless Fiend", "w": "the demon's Cinderhold trials", "t": "Halvard promised this fiend a kingdom beneath his own. With the crown broken, it has come to claim the empty hall. The summoner permits it only a few minutes at a time."},
  {"k": "skeleton1", "n": "Oathbone Swordsman", "w": "the demon's Cinderhold trials", "t": "These were the temple guards who refused to leave their posts when the wings fell. Their shields have rotted away. Their orders have not."},
  {"k": "skeleton3", "n": "Sepulchral Marshal", "w": "the demon's Cinderhold trials", "t": "The old rider tombs had no locks. Each had a marshal sworn to know every person entitled to enter. Centuries have thinned the list to no one."},
  {"k": "mage1", "n": "Ashscript Adept", "w": "the demon's Cinderhold trials", "t": "An apprentice once copied the names of fallen riders into a book of ash. The names burned through the pages and into his bones. He recites them whenever he raises his staff."},
  {"k": "mage2", "n": "Hollow Cantor", "w": "the demon's Cinderhold trials", "t": "The last choir beneath Forgewick sang until the temple doors were sealed. This cantor remembers the melody, though every word has become a curse."},

  {"k": "ghost3", "n": "Rimecrown Spirit", "w": "Hollybeck Temple and the last graveyard wave", "t": "Hollybeck once crowned its winter dead with woven rowan, hoping the old riders would know them at the temple gates. These spirits still wear the shape of that welcome. They emerge last from the graves, as though waiting for every other soul to be accounted for."},
  {"k": "shroomBrown", "n": "Timbercap Shroom", "w": "the first Shroom Pass arenas", "t": "Millwood's woodcutters once left rotten stumps standing so these small brown caps would feed on them instead of the timber stacks. With fewer axes in the northern woods, the Timbercaps have spread onto the paths. They still gather wherever the last tree was felled."},
  {"k": "reptile", "n": "Duneblade", "w": "the first desert crossings", "t": "The oldest caravan maps mark these crossings with a blade instead of a well. Duneblades once accepted a bowl of water as passage money. Since the roads emptied, they have kept collecting the bowls. Travellers are no longer allowed to leave them."},
  {"k": "reptile2", "n": "Cistern Fang", "w": "the deeper desert roads", "t": "Sandspire's abandoned cisterns still bear claw marks around their rims. The Cistern Fangs remember which stones cover water, and guard those secrets more fiercely than coin. Their road bands patrol the paths between wells that no human has opened in fifty years."},
  {"k": "reptile3", "n": "Sunscar Sentinel", "w": "the far desert crossings", "t": "Their elders inherit a stretch of road and the names of everyone who died defending it. A Sunscar Sentinel is the last keeper of that memory. Caravan folk say it faces the setting sun after battle, counting a company that is no longer there."},
  {"k": "boneguard", "n": "Boneguard", "w": "the final battle at Cinderhold", "t": "The king's last levy needs neither wages nor graves. Each blade is bound into its owner's hand, each rib marked with the same command. A Boneguard does not remember the oath it swore in life. Something beneath Cinderhold remembers for it."},
  {"k": "plant1", "n": "Hedgebite Vinemaw", "w": "the first blossom roads", "t": "Thornwell gardeners once planted these along orchard walls to keep the deer out. After Wingfall, the orchards went untended. The roots crossed the walls, and the mouths learned that a footstep could mean something larger than a deer."},
  {"k": "plant2", "n": "Pilgrim Vinemaw", "w": "the middle blossom roads", "t": "These grew where travellers left flowers at roadside shrines. Their seeds travelled in the hems of pilgrims' coats, linking one shrine to the next. The pilgrims are gone, but the plants still lean towards the road whenever they hear someone coming."},
  {"k": "plant3", "n": "Widowbloom Vinemaw", "w": "the far blossom roads", "t": "Village custom was to plant one at the gate when a rider failed to return. After Wingfall, entire lanes flowered. The oldest blooms have swallowed their gates and the paths beyond; people still leave offerings, though nobody now agrees whom they are feeding."},
  {"k": "gnoll1", "n": "Tollfang Gnoll", "w": "the first snow arenas and roads", "t": "Tollfang bands occupy the shelters where winter roadkeepers once collected passage money. They have copied the custom without understanding the receipt. A strip of old uniform is enough to make one a collector; anyone without it is expected to pay."},
  {"k": "gnoll2", "n": "Rimepick Gnoll", "w": "the deeper snow roads and mine galleries", "t": "Rimepicks learned to follow ore carts rather than caravans. When Forgewick's deeper workings fell silent, they carried stolen tools into the mountain roads. Each band keeps a broken miner's lamp, passed from hand to hand as a claim to everything found underground."},
  {"k": "gnoll3", "n": "Cairnkeeper Gnoll", "w": "the last snow arenas", "t": "The largest clans leave their dead beneath heaps of travellers' stones. A Cairnkeeper carries the names of those cairns in a knotted cord. It raids the road for iron and cloth, then takes the spoils home to people who can no longer use them."},
  {"k": "eyeRed", "n": "Cinder Watcher", "w": "the first volcanic roads and Cinderhold approach", "t": "Quarrymen once judged safe footing by where the red eyes gathered: warm rock, but not yet molten. That knowledge died with the last road crews. The Watchers still gather at the crossings, patiently examining every living thing that mistakes them for distant lamps."},
  {"k": "eye2", "n": "Kiln Watcher", "w": "the middle volcanic roads", "t": "The shuttered kilns beyond Ashcrag have no windows, yet their keepers used to complain of being watched. When the doors were broken open, these creatures drifted out. Some still circle an empty patch of road as though tending a furnace only they can see."},
  {"k": "eyePurple", "n": "Vesper Watcher", "w": "the far volcanic roads and Cinderhold approach", "t": "The violet eyes appear in drawings older than Halvard's reign, always above an empty throne. Scholars called them witnesses, not servants. Those near Cinderhold have watched the same king for fifty years. No one knows what would finally satisfy them enough to look away."},
  {"k": "ent1", "n": "Orchard Longroot", "w": "the first wooded roads beyond Coralmere", "t": "Fruit growers once tied bells to these trees to frighten birds from their branches. After the farms emptied, the trees followed the sound of carts towards Coralmere. The bells are gone. The habit of waiting beside a road has outlived both the farmers and the fruit."},
  {"k": "ent2", "n": "Boundary Longroot", "w": "the middle wooded roads beyond Coralmere", "t": "Before Wingfall, disputes over woodland ended at trees marked by a rider's seal. These were those trees. Fifty years without anyone to renew the marks has left them wandering the old boundaries, treating every traveller as someone moving a fence in the night."},
  {"k": "ent", "n": "Oathroot Longroot", "w": "the far wooded roads beyond Coralmere", "t": "Riders once planted a tree when they swore to protect a settlement. The oldest Longroots grew from those promises. Woodcutters say they began walking when the riders fell, searching for whoever should inherit the oath. They have not accepted anyone yet."},
  {"k": "shroomRed", "n": "Lanterncap Shroom", "w": "the upper and middle mine galleries", "t": "Children in Millwood were taught to count the red caps beside the pass: if the number changed, go home. Adults called it a nursery warning until the mine paths began moving overnight. A Lanterncap can stand still longer than most people can stay afraid."},
  {"k": "shroomPurple", "n": "Deepveil Shroom", "w": "the deepest mine galleries", "t": "Miners found the violet caps growing through the felt of abandoned helmets. They thrive below the last timber supports, where even the roots from above cannot reach. Old pit hands left an empty helmet at each descent, hoping the growth would settle for that."},
  {"k": "ghost", "n": "Gravewake Spirit", "w": "Hollybeck graveyard and the temple undercrofts", "t": "Hollybeck's oldest graves face the road so the dead may see their families return. Few families make that journey now. The restless rise to meet footsteps at the gate; beneath the temples, other spirits wait with the same terrible patience."},
  {"k": "wraith", "n": "Bound Wraith", "w": "the summons of the Book of the Dead", "t": "The Book of the Dead records obligations rather than names. Read a debt aloud and something hooded arrives to discharge it. It will fight beside the bearer without complaint. The missing pages may explain what the bearer owes in return."},
  {"k": "golem1", "n": "Stone Golem", "w": "the desert temple depths and the mine", "t": "The chisel marks beneath its feet belong to the masons who built the old rider halls. Stone Golems hauled the blocks, then stood watch when the work was done. Their makers carved the command to wake. No surviving wall records the command to rest."},
  {"k": "golem2", "n": "Iron Golem", "w": "the Forgewick temple depths", "t": "Forgewick smiths once repaired these wardens a plate at a time, stamping each replacement with a family mark. Several generations can be read across one body. The last stamps date to Wingfall. The wardens have kept their posts without a smith ever since."},
  {"k": "golem3", "n": "Ember Golem", "w": "the Hollybeck temple depths", "t": "An ember carried from a rider's hearth was sealed inside each of these guardians to keep the high halls warm. The hearths went cold after Wingfall; the embers did not. Beneath Hollybeck's snow, they still tend a household of empty rooms."},
  {"k": "lich", "n": "Lich", "w": "the final battle at Cinderhold", "t": "The old rider rites joined one life to another through trust. A lich makes a cruel imitation: it binds what should have been released, then calls that binding survival. Its bones endure, but every command to the dead is another confession that it fears joining them."},
  {"k": "devil", "n": "Ashfiend", "w": "the passage beneath Ashcrag", "t": "The first miners to break into the hot caverns found claw marks on their side of the rock. Whatever made them had been trying to get deeper. The Ashfiend now guards the passage above those workings. Even it seems unwilling to return to whatever lies below."}
];
function facing(f, tgt) {
  const dx = tgt.x - f.x, dy = tgt.y - f.y;
  const d = foeDir(f.dir, f.flip);
  if (d === "e") return dx > -6;
  if (d === "w") return dx < 6;
  if (d === "u") return dy < 6;
  return dy > -6;
}
// Full enemy sequences retain the existing combat and movement timing.
function golemFrame(f, sp, name, stats, impactFrame = 5) {
  const n = sp[4];
  if (f.st === "dead") return Math.min(n - 1, Math.floor(f.t / 0.5 * n));
  if (name.includes("_hurt_"))
    return Math.min(n - 1, Math.floor(Math.max(0, 0.25 - f.hurt) / 0.25 * n));
  if (name.includes("_atk_")) {
    // Align each sprite pack’s impact pose with the damage event.
    const impact = Math.min(impactFrame, n - 1);
    const frame = f.t < stats.hitAt ? f.t / stats.hitAt * impact
      : impact + (f.t - stats.hitAt) / (stats.swingT - stats.hitAt) * (n - impact);
    return Math.max(0, Math.min(n - 1, Math.floor(frame)));
  }
  const t = f.st === "swing" ? Math.max(0, f.t - stats.swingT) : f.t;
  return Math.floor(t * 6 * n / 4) % n;
}
function foeDir(dir, flip) {
  return dir === "s" ? (flip ? "w" : "e") : dir;
}
function spawnFoes() {
  foes = []; turnHolder = null; turnT = 0; foeCool = 0;
  (MD.foes || []).forEach((f, idx) => {
    const kind = FOE[f.k] ? f.k : "skeleton";
    if(kind==="treasuryknight" && royalDefeated["treasuryCaptain"])return;
    if(kind==="royalguard" && (wonAll || royalDefeated[MAPID+":"+idx]))return;
    if (kind === "knight" && knightEncounterDone) return;
    if (NO_RESPAWN.test(kind) && bossGone[MAPID + ":" + idx]) return;
    const k = FOE[kind];
    if(MD.templeContinuous&&(bossGone[MAPID+':room:'+(idx<4?'ghost':'golem')]||(idx>=4&&bossGone[(MD.templeOldGolem||'tp3')+':'+(idx-4)])))return;
    const x = f.x * TS + 8, y = f.y * TS + 16;
    foes.push({ kind, x, y, hx: x, hy: y,
                hp: enemyMaxHp(kind, x), st: "idle", t: 0, dir: "d", flip: false, hurt: 0, idx,
                storyKnight: kind === "knight", storyPassive: kind === "knight" });
  });
  /* A death or map reload restarts the story duel from its approach trigger. */
  if (MAPID === "world" && !knightEncounterDone && foes.some(f => f.storyKnight)) {
    knightEncounterPhase = "waiting";
    knightEncounter = null;
  }
}
function swordOverlaps(f) {
  const body = foeBodyProfile(f);
  return Math.abs(body.x-P.x)<=PC_W/2+body.r && Math.abs(body.y-P.y)<=PC_H+body.r;
}
function deflectClearance(actor, angle, distance, isDragon) {
  let x = actor.x, y = actor.y, moved = 0;
  const stand = isDragon ? dragonCanStand : canStand;
  for (let left = distance; left > .1; left -= 3) {
    const step = Math.min(3, left);
    const nx = x + Math.cos(angle) * step, ny = y + Math.sin(angle) * step;
    if (!stand(nx, ny)) break;
    x = nx; y = ny; moved += step;
  }
  return { x, y, moved };
}
function knockFromKing(actor, f, distance, isDragon = false) {
  let dx = actor.x - f.x, dy = actor.y - f.y;
  if (Math.hypot(dx, dy) < 1) { dx = actor === P ? -1 : 1; dy = .25; }
  const base = Math.atan2(dy, dx);
  /* Fan away from a blocked radial path so a wall cannot cancel the shove. */
  const turns = [0, -.35, .35, -.70, .70, -1.05, 1.05, -1.57, 1.57];
  let best = deflectClearance(actor, base, distance, isDragon);
  for (let i = 1; i < turns.length; i++) {
    const test = deflectClearance(actor, base + turns[i], distance, isDragon);
    if (test.moved > best.moved + 1) best = test;
  }
  actor.x = best.x; actor.y = best.y;
}
function drawKingShield(f) {
  if (!kingShield || kingShield.foe !== f) return;
  const p = Math.max(0, 1 - kingShield.t / kingShield.life);
  const flare = Math.sin(Math.PI * p);
  ctx.save();
  ctx.translate(f.x, f.y - 36);
  ctx.rotate(kingShield.angle);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const lich = f.kind === "lich";
  ctx.strokeStyle = lich
    ? `rgba(122,45,190,${.28 + flare * .72})`
    : `rgba(184,225,255,${.22 + flare * .72})`;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 43 + p * 5, -1.0, 1.0); ctx.stroke();
  ctx.strokeStyle = lich
    ? `rgba(8,3,13,${.55 + flare * .4})`
    : `rgba(143,112,255,${.15 + flare * .55})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 36 + p * 8, -1.08, 1.08); ctx.stroke();
  ctx.fillStyle = lich
    ? `rgba(48,8,71,${.35 + flare * .65})`
    : `rgba(225,244,255,${flare * .8})`;
  for (let a = -.78; a <= .79; a += .39) {
    ctx.beginPath(); ctx.arc(Math.cos(a) * 45, Math.sin(a) * 45, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function stepKingShield(dt) {
  if (!kingShield) return;
  kingShield.t += dt;
  if (kingShield.t >= kingShield.life || !kingShield.foe || kingShield.foe.st === "dead") kingShield = null;
}
function kingDeflect(f, attacker) {
  const source = attacker || P;
  kingShield = { foe: f, t: 0, life: .42,
    angle: Math.atan2(source.y - (f.y - 36), source.x - f.x) };
  if (mounted) {
    dragon.x = P.x; dragon.y = P.y; dragon.air = false; dragon.tr = null;
    setMounted(false, true);
  }
  if (Math.hypot(P.x - f.x, P.y - f.y) < 130) {
    if (!camFree && !hatchCamera && !bossScene)
      deflectCamera ||= { map: MAPID, zoom: cam.z, t: 0 };
    if (deflectCamera) deflectCamera.t = 0;
    knockFromKing(P, f, 52, false);
    P.moving = false;
    P.act = { kind: "fall", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4() };
  }
  if (dragonHere() && dragon.on && !dragon.down &&
             Math.hypot(dragon.x - f.x, dragon.y - f.y) < 150) {
    knockFromKing(dragon, f, 72, true);
    dragon.knockdown = dragon.knockdownMax;
    dragon.faintDir = cardinalDirection(dragon.dir) === "w" ? "w" : "e";
    dragon.moving = false; dragon.air = false; dragon.tr = null;
  }
  hunt = null; claw = null; linger = 0;
  clawT = Math.max(clawT, 1.1);
  dragonBreak = { foe: f, t: .75 };
  dragonCombatPause = Math.max(dragonCombatPause, .75);
  if (!f.guardToastAt || tAcc - f.guardToastAt > .7) {
    f.guardToastAt = tAcc;
    toast(f.kind === "lich" ? "the lich's ward throws them back" : "the king dragon turns them aside");
  }
}
function regularFoe(f) { return !f.ally && !f.trial && !BOSS_KIND.test(f.kind || "") && f.kind !== "kdragon"; }
function makeFoeRetreat(f, sourceX, sourceY, seconds = .68) {
  if (f.ally || f.trial) return;
  const boss = BOSS_KIND.test(f.kind || "") || f.kind === "kdragon";
  if (boss) {
    /* Bosses stand their ground initially, then step away if Corin keeps
       locking them in a sword loop. */
    f.pressureHits = (!f.pressureAt || tAcc - f.pressureAt > 1.25)
      ? 1 : (f.pressureHits || 0) + 1;
    f.pressureAt = tAcc;
    if (f.pressureHits < 3) return;
    f.pressureHits = 0;
    seconds = f.kind === "kdragon" ? .85 : .50;
    if (f.kind === "kdragon" || f.kind === "lich") {
      /* Breaking a three-hit sword string begins a retaliation, not another
         identical loop.  Its scales turn follow-up slashes until the
         retreat has flowed into a committed counterattack on Corin. */
      f.swordGuard = Math.max(f.swordGuard || 0, 3.05);
      f.pressureCounter = true;
      f.cool = 0;
    }
  } else {
    // Ordinary enemies commit to attacks. A single hit no longer turns them
    // around; two quick hits can buy a short step back, at most once per 2s.
    if (f.st === "wind" || f.st === "swing" || tAcc < (f.retreatReadyAt || 0)) return;
    f.pressureHits = f.pressureAt === undefined || tAcc - f.pressureAt > 1.5
      ? 1 : (f.pressureHits || 0) + 1;
    f.pressureAt = tAcc;
    if (f.pressureHits < 2) return;
    f.pressureHits = 0;
    f.retreatReadyAt = tAcc + 2;
    seconds = Math.min(seconds, .28);
  }
  f.retreat = Math.max(f.retreat || 0, seconds);
  f.retreatX = sourceX; f.retreatY = sourceY;
  f.st = "walk"; f.t = 0; f.hit = 0;
}
function swingHits() {
  const a = P.act;
  if (!a || a.kind !== "swing" || a.hit) return;
  if (a.t < 3 || a.t > 6) return;              /* the middle of the swing */
  a.hit = 1;
  const [dx,dy] = directionVector(playerFacing4(a));
  const tx = P.x + dx * 16, ty = P.y + dy * 16;
  for (const f of foes) {
    if (f.st === "dead" || f.ally) continue;      /* his own dead are not targets */
    const body = foeBodyProfile(f);
    if (!swordOverlaps(f) && Math.hypot(body.x - tx, body.y - ty) > 20 + body.r) continue;
    // Each variant has its own page and encounter order.
    if (!seenFoe[f.kind]) seenFoe[f.kind] = ++seenCount;
    if ((f.kind === "kdragon" || f.kind === "lich") && f.swordGuard > 0) {
      kingDeflect(f, P);
      continue;
    }
    let dmg = smithUpgrade ? 2 : 1;
    if (a.hot) dmg += 1;              /* the brand's third swing */
    if (worn.edge) {
      edgeCarry += 0.2;
      if (edgeCarry >= 1) { dmg += 1; edgeCarry -= 1; }
    }
    f.hp -= dmg; f.hurt = 0.25;
    if (f.hp > 0) makeFoeRetreat(f, P.x, P.y);
    if (f.hp <= 0) {
      f.st = "dead"; f.t = 0;
      if (!f.ally && !f.storyKnight) dropGold(f.x, f.y, f.kind);
      markBossGone(f);
      if (worn.spore && pHp < pMax) pHp = Math.min(pMax, pHp + 1);
      if (worn.flame && worn.twin && twinSpent && ++twinKills >= 4) {
        twinSpent = false; twinKills = 0;
        toast("the twin heart beats again");
      }
    }
  }
}
let edgeCarry = 0;
const charm = { spore: false, ward: false, edge: false, brand: false, twin: false,
                lamp: false, flame: false, wake: false };
const worn  = { spore: false, ward: false, edge: false, brand: false, twin: false,
                lamp: false, flame: false, wake: false };
let wakeSpent = false;
let gold = 50, potions = 0, elixirs = 0, bombs = 0, dust = 0;
let boarMeat = 0, dragonFish = 0;
let bells = 0, marks = 0, dropped = null;
let breaths = 0, stones = 0, salts = 0;
const BELL_COST = 40, MARK_COST = 20;
const BREATH_COST = 80, STONE_COST = 60, SALT_COST = 70;
const DUST_COST = 50;
const BOMB_COST = 100;
const POTION_COST = 20;
const ELIXIR_COST = 60;
const BOAR_MEAT_COST = 20, DRAGON_FISH_COST = 20;
const BOAR_MEAT_HEAL = 30, DRAGON_FISH_HEAL = 35;
const treasuryTaken = new Set();
const TREASURY_CHESTS = [{id:'chest0',x:184,y:88,n:600},{id:'chest2',x:184,y:176,n:600}];
function seedTreasuryGold(){
 if(MAPID!=='royal_treasury')return;
 let i=0;
 for(const y of [88,184])for(const x of [32,64]){
  const id='pile'+([88,112,160,184].indexOf(y)*6+[32,64,96,128,160,192].indexOf(x));i++;
  if(!treasuryTaken.has(id))loot.push({x,y,n:50,art:i%3?'gold_p2':'gold_p3',t:0,treasuryId:id});
 }
}
function treasuryGuarding(){return MAPID==="royal_treasury"&&!foesHeld&&foes.some(f=>f.kind==="treasuryknight"&&f.st!=="dead")}
function tryTreasuryChest(){
 if(MAPID!=='royal_treasury')return false;
 const c=TREASURY_CHESTS.find(c=>!treasuryTaken.has(c.id)&&Math.hypot(P.x-c.x,P.y-c.y)<34);
 if(!c)return false;
 if(treasuryGuarding()){toast("Defeat the Treasury Captain to claim the treasure.");return true;}
 treasuryTaken.add(c.id);gold+=c.n;flyGold(c.x,c.y,c.n);
 showReveal('it_coin','Corin found '+c.n+' gold!',3,true);
 return true;
}
function drawTreasuryChests(){
 if(MAPID!=='royal_treasury')return;
 const sp=SPR.chest;
 for(const c of TREASURY_CHESTS){
  const f=treasuryTaken.has(c.id)?sp[4]-1:0;
  drawGameImage(ctx,atlasImg,sp[0]+f*sp[2],sp[1],sp[2],sp[3],c.x-sp[2]/2,c.y-sp[3],sp[2],sp[3]);
 }
}

let loot = [];
const WORTH = {
  plant1: 3, plant2: 4, shroomBrown: 4, shroomRed: 5, shroomPurple: 6,
  gnoll1: 7, gnoll2: 7, gnoll3: 7, plant3: 4, reptile2: 8, reptile3: 8, reptile: 8, boneguard: 8, eyeRed: 8, eye2: 8, eyePurple: 11,
  royalguard: 18, knight: 0, ghost: 9, ghost3: 9, ent1: 12, ent2: 12, ent: 12, wraith: 0,
  golem1: 26, golem2: 34, golem3: 38, lich: 44, devil: 50,
};
const GOLD_DROP_MULTIPLIER = 1.8;
function dropGold(x, y, kind) {
  const base = WORTH[kind] !== undefined ? WORTH[kind]
             : BOSS_KIND.test(kind || "") ? 30 : 5;
  if (!base) return 0;                      /* his own dead pay nothing */
  const richer = Math.ceil(base * GOLD_DROP_MULTIPLIER);
  const n = Math.max(1, richer + Math.floor(Math.random() * Math.max(2, richer * 0.4)) - 1);
  const art = n >= 26 ? "gold_p4" : n >= 12 ? "gold_p3"
            : n >= 6  ? "gold_p2" : "gold_p1";
  loot.push({ x, y, n, art, t: 0 });
  if (graves && arenaLock === graves.ring) graves.earned += n;
  return n;
}
function takeGold() {          /* kept for anything that still calls it */
  return dropGold(P.x, P.y, null);
}
let flying = [];
function flyGold(x, y, n) {
  const many = Math.min(9, 3 + Math.floor(n / 6));
  for (let i = 0; i < many; i++)
    flying.push({ x, y, t: -i * 0.045, life: 0.62,
                  sx: x + (Math.random() - 0.5) * 22,
                  sy: y - 4 - Math.random() * 14,
                  lift: 26 + Math.random() * 26 });
}
function stepFly(dt) {
  if (!flying.length) return;
  for (const f of flying) f.t += dt;
  flying = flying.filter(f => f.t < f.life);
}
function drawFly() {
  if (!flying.length) return;
  const sp = SPR.it_coin || SPR.gold_p1;
  if (!sp) return;
  const tx = cam.x + 40 / cam.z, ty = cam.y + 22 / cam.z;
  ctx.save();
  for (const f of flying) {
    if (f.t < 0) continue;
    const p = Math.min(1, f.t / f.life);
    const e = p * p;                       /* slow away, fast home */
    const x = f.sx + (tx - f.sx) * e;
    const y = f.sy + (ty - f.sy) * e - Math.sin(p * 3.14159) * f.lift;
    const k = 0.5 * (1 - p * 0.45);
    ctx.globalAlpha = 1 - p * p * 0.5;
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(x - sp[2] * k / 2), Math.round(y - sp[3] * k / 2),
                  sp[2] * k, sp[3] * k);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
function grabGold() {
  let got = 0, kept = [];
  for (const g of loot) {
    if(g.treasuryId&&treasuryGuarding()){kept.push(g);continue;}
    if (Math.hypot(g.x - P.x, g.y - P.y) < 26) { got += g.n; if(g.treasuryId)treasuryTaken.add(g.treasuryId); flyGold(g.x, g.y, g.n); }
    else kept.push(g);
  }
  if (!got) return false;
  loot = kept;
  gold += got;
  toast("Corin got " + got + " gold!");
  return true;
}
function drawLoot() {
  drawTreasuryChests();
  const vw = VW / cam.z, vh = VH / cam.z;
  for (const g of loot) {
    if (g.x < cam.x - 32 || g.x > cam.x + vw + 32 ||
        g.y < cam.y - 32 || g.y > cam.y + vh + 32) continue;
    const sp = SPR[g.art] || SPR.gold_p2;
    if (!sp) continue;
    const b = Math.round(Math.sin(g.t * 3) * 1.5);
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(g.x - sp[2] / 2), Math.round(g.y - sp[3] + b),
                  sp[2], sp[3]);
  }
}
function stepLoot(dt) {
 for(const g of loot)g.t+=dt;
 if(MAPID==='royal_treasury'&&mode==='play'&&!ovl&&!sayNpc&&loot.some(g=>g.treasuryId&&Math.hypot(g.x-P.x,g.y-P.y)<14))grabGold();
}
let devItemTest = false;
function drinkPotion() {
  if (potions <= 0 && !devSafe) { toast("no potions"); return false; }
  if (pHp >= pMax && !devSafe && !devItemTest) { toast("he is not hurt"); return false; }
  potions--;
  pHp = Math.min(pMax, pHp + 2);
  showHeal("potion");
  toast("two hearts back -- " + potions + " left");
  return true;
}
function feedDragon(kind) {
  if (!hasDragon()) { toast("Corin does not have the dragon yet"); return false; }
  // A stale recovery flag from an earlier save must never block feeding.
  if (!dragon.down) dragon.revive = 0;
  const fish = kind === "fish";
  if ((fish ? dragonFish : boarMeat) <= 0 && !devSafe) {
    toast(fish ? "no fish" : "no boar meat"); return false;
  }
  syncDragonVitality(false);
  if (dragon.hp >= dragon.maxHp && !devSafe && !devItemTest) {
    toast("the dragon is already full"); return false;
  }
  const wasDown = dragon.down;
  if (fish) dragonFish--; else boarMeat--;
  dragon.hp = Math.min(dragon.maxHp, dragon.hp + (fish ? DRAGON_FISH_HEAL : BOAR_MEAT_HEAL));
  dragon.down = wasDown ? true : dragon.hp <= 0;
  dragon.revive = wasDown && dragon.hp > 0 ? Math.min(dragon.revive || 1.2, 1.2) : 0;
  dragon.hurt = 0; dragon.inv = 1.2;
  if (dragonHere()) showHeal("dragon", dragon.x, dragon.y - 18);
  toast((fish ? "fish" : "boar meat") + " restores the dragon");
  return true;
}
let saintT = 0;
function useSaint() {
  if (breaths <= 0 && !devSafe) { toast("no saint's breath"); return false; }
  breaths--; saintT = 16;
  toast("nothing can touch him");
  return true;
}
function useStone() {
  if (stones <= 0 && !devSafe) { toast("no stones"); return false; }
  let best = null, bd = 260;
  for (const f of foes) {
    if (f.st !== "dead" || f.ally || f.raised) continue;
    const d = Math.hypot(f.x - P.x, f.y - P.y);
    if (d < bd) { bd = d; best = f; }
  }
  if (!best && devItemTest) {
    const kind=foes.find(f=>FOE[f.kind]&&!BOSS_KIND.test(f.kind))?.kind||'skeleton1';
    const prefix=FOE_ART[kind]||'sk';
    const nm=[prefix+'_die_d',prefix+'_die'].find(k=>SPR[k]);
    if(!nm){toast('No death animation available here.');return false;}
    stonePreview={kind,x:P.x+28,y:P.y,st:'idle',t:0,hp:1,raised:1,ally:1,emerge:1,reverseRise:1.2,reverseRiseMax:1.2,nm};return true;
  }
  if (!best && !devSafe) { toast("nothing dead near enough"); return false; }
  if (!best) { stones--; toast("nothing dead near enough -- spent anyway"); return true; }
  stones--;
  best.reverseRise = 1.2; best.reverseRiseMax = 1.2;
  const k = FOE[best.kind] || {};
  best.st = "idle"; best.t = 0; best.ally = 1; best.raised = 1;
  best.hold = 0; best.holdMax = 0; best.emerge = 1;   /* it climbs out */
  best.hp = Math.max(1, Math.round((k.hp || 4) / 2));
  best.hurt = 0; best.mad = 0;
  best.slot = foes.indexOf(best);
  rebuildBuckets();
  toast("it gets up, and it is his now");
  return true;
}
function useSalt() {
  if (salts <= 0 && !devSafe) { toast("no salt"); return false; }
  let ring = null;
  for (const f of features) {
    if (f.kind !== "arena") continue;
    if (Math.hypot(P.x / TS - f.x, P.y / TS - f.y) <= (f.r || 6)) { ring = f; break; }
  }
  if (devItemTest && (!ring || bossRing(ring) || arenaFoesLeft(ring) || (arenaLock===ring&&!arenaGoing))) {
    plantRing(ring || {x:P.x/TS,y:P.y/TS,r:3});return true;
  }
  if (!ring && !devSafe) { toast("he is not standing in a ring"); return false; }
  if (!ring) { salts--; toast("no ring here -- spent anyway"); return true; }
  if (bossRing(ring)) { toast("that one was never coming back"); return false; }
  if (arenaLock === ring && !arenaGoing) { toast("not while it is still fighting"); return false; }
  if (arenaFoesLeft(ring) && !devSafe) { toast("clear it first"); return false; }
  salts--;
  holy.add(ringKey(ring));
  plantRing(ring);            /* and the ground shows it */
  cooling.delete(ringKey(ring));
  toast("the ground is at peace. Nothing will rise here again.");
  return true;
}
let bell = null;
function useBell() {
  if (bells <= 0 && !devSafe) { toast("no bell stakes"); return false; }
  bells--;
  let bx, by;
  if (P.dir === "d") { bx = P.x; by = P.y + 30; }
  else if (P.dir === "u") { bx = P.x + (P.flip ? -30 : 30); by = P.y + 12; }
  else { bx = P.x + (P.flip ? -32 : 32); by = P.y + 12; }
  bell = { x: bx, y: by, t: 12, age: 0 };
  toast("the bell goes in, and it will not stop");
  return true;
}
function stepBell(dt) {
  if (!bell) return;
  bell.t -= dt;
  bell.age = (bell.age || 0) + dt;
  if (bell.t <= 0) { bell = null; toast("the bell falls quiet"); }
}
function drawBell() {
  if (!bell) return;
  const age = bell.age || 0;
  const drop = Math.min(1, age / 0.28);          /* it falls the last few feet */
  const fall = (1 - drop) * (1 - drop) * 26;
  const hit = Math.max(0, 1 - Math.max(0, age - 0.28) / 0.5);
  const shake = Math.sin(age * 46) * (0.6 + 2.6 * hit);
  const sp = SPR.it_bell_w || SPR.it_bell;
  const x = Math.round(bell.x + shake), y = Math.round(bell.y - fall);
  ctx.save();
  const PERIOD = 0.34;
  for (let k = 0; k < 4; k++) {
    const a = age - k * PERIOD;
    if (a < 0) continue;
    const ph = (a % (PERIOD * 4)) / (PERIOD * 4);
    if (ph > 1) continue;
    const rr = 18 + ph * 120;
    ctx.globalAlpha = (1 - ph) * 0.5;
    ctx.strokeStyle = "#f0e2b4";
    ctx.lineWidth = Math.max(1, 3 * (1 - ph));
    ctx.beginPath();
    ctx.ellipse(bell.x, bell.y - 4, rr, rr * 0.42, 0, 0, 6.283);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (sp) {
    /* it_bell_w is stored at its drawn size; the old 0.7 was for the
       31x38 sprite this replaced and would tower over the map now */
    const k = SPR.it_bell_w ? 1 : 0.7;
    const w = Math.round(sp[2] * k), h = Math.round(sp[3] * k);
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  x - (w >> 1), y - h, w, h);
  }
  ctx.restore();
}
function drawTrialPedestal() {
  const x = TRIAL_PEDESTAL.x, y = TRIAL_PEDESTAL.y;
  const active = trialSealPlaced;
  const dx = x - 16, dy = y - 36;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#101522";
  ctx.beginPath(); ctx.ellipse(x, y - 1, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  /* This is the pale stone altar from the Witchmoor room. The room artwork is
     a single bitmap, so clip its pedestal silhouette away from the floor. */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx + 11, dy + 4); ctx.lineTo(dx + 21, dy + 4);
  ctx.lineTo(dx + 21, dy + 5); ctx.lineTo(dx + 26, dy + 5);
  ctx.lineTo(dx + 26, dy + 23); ctx.lineTo(dx + 28, dy + 23);
  ctx.lineTo(dx + 28, dy + 26); ctx.lineTo(dx + 24, dy + 26);
  ctx.lineTo(dx + 24, dy + 34); ctx.lineTo(dx + 21, dy + 34);
  ctx.lineTo(dx + 21, dy + 36); ctx.lineTo(dx + 11, dy + 36);
  ctx.lineTo(dx + 11, dy + 34); ctx.lineTo(dx + 9, dy + 34);
  ctx.lineTo(dx + 9, dy + 26); ctx.lineTo(dx + 5, dy + 26);
  ctx.lineTo(dx + 5, dy + 23); ctx.lineTo(dx + 6, dy + 23);
  ctx.lineTo(dx + 6, dy + 5); ctx.lineTo(dx + 11, dy + 5);
  ctx.closePath(); ctx.clip();
  drawGameImage(ctx, atlasImg, 207, 16711, 32, 42, dx, dy, 32, 42);
  ctx.restore();

  /* Replace the Witchmoor book with the Cinderhold Seal's recessed socket. */
  ctx.fillStyle = "#63758f"; ctx.fillRect(x - 6, y - 31, 12, 2);
  ctx.fillStyle = "#30394c"; ctx.fillRect(x - 7, y - 29, 14, 12);
  ctx.fillStyle = active ? "#5e2778" : "#171b28";
  ctx.fillRect(x - 5, y - 28, 10, 9);
  ctx.fillStyle = active ? "#c36be8" : "#252c3d";
  ctx.fillRect(x - 3, y - 27, 6, 1);
  if (active) {
    const pulse = 0.42 + Math.sin(tAcc * 5) * 0.16;
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#d678ff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y - 24, 13, 7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    const seal = SPR.it_cinderseal;
    if (seal) drawGameImage(ctx, sheetOf(seal), seal[0], seal[1], seal[2], seal[3],
      Math.round(x - seal[2] / 2), Math.round(y - 18 - seal[3]), seal[2], seal[3]);
  }
  ctx.restore();
}
let graves = null;
let lastFight = 0, wonAll = 0;

let trialSealPlaced = false;
const THRONE_DEMON={x:176,y:136};
function trialDemonHere(){return wonAll&&((MAPID==="witchmoor"&&!trialSealPlaced)||(MAPID==="cinderhold"&&trialSealPlaced));}
let cinderSeal = false, trialWins = 0, trial = null;
const TRIAL_STRONG = new Set(["golem1", "golem2", "golem3", "devil", "devil1", "devil3",
  "lich", "kdragon", "boneguard", "gnoll3", "plant3", "reptile3", "ent", "eyePurple",
  "shroomPurple", "ghost3", "skeleton3", "mage2"]);
function trialRoster() {
  return BESTIARY.filter(e => e.k !== "wraith" && FOE[e.k]).map(e => ({
    kind: e.k, name: e.n, count: TRIAL_STRONG.has(e.k) ? 1 : 2
  })).sort((a, b) => FOE[a.kind].hp - FOE[b.kind].hp);
}
function trialAsk() {
  if (!wonAll || !cinderSeal || trial) return;
  ask = { opts: [
    { n: "PLACE THE CINDERHOLD SEAL", go: () => { if(trialSealPlaced)return; royalBlackout("a sound came from the throne room",()=>{trialSealPlaced=true;saveGame();}); } },
    { n: "NOT YET", go: null }
  ] }; askPick = 0; askDraw();
}
function interactTrialPedestal() {
  if (!trialPedestalHere() || trial ||
      Math.hypot(P.x - TRIAL_PEDESTAL.x, P.y - TRIAL_PEDESTAL.y) > 48) return false;
  faceCorinAt(TRIAL_PEDESTAL.x, TRIAL_PEDESTAL.y);
  if (!wonAll) {playScene(["The seal chamber is silent. The Crown still holds the throne."]);return true;}
  if (!cinderSeal) {
    playScene(["A pale stone pedestal stands against the north wall, at the end of the rug.",
      "A seal-shaped hollow has been cut into its crown."], { hold: false });
  } else if(trialSealPlaced)playScene(["The seal rests in its socket. The demon awaits you in the throne room."]);
  else trialAsk();
  return true;
}
function talkTrialDemon() {
  if (!wonAll || trial) return;
  if(trialSealPlaced&&MAPID==='cinderhold'){
    playScene(["Demon: I will summon waves of creatures for you to face. Two of the lesser kinds, one of the greater.",
      "Demon: Defeat them all to complete the trial. You may return and try again whenever you wish.",
      "Demon: Are you ready?"],{hold:false,after:()=>{
      ask={quick:1,opts:[{n:'YES',go:startTrial},{n:'NO',go:null}]};askPick=0;askDraw();
    }});return;
  }
  playScene(cinderSeal ? ["Demon: Place your seal in the chamber adjoining the throne room. I will meet you in the hall."] : [
    "Maelis: With the King gone, a keeper of old trials has answered my circle.",
    "Demon: I offer a contest against summoned creatures. I will oversee it, not fight you.",
    "Demon: Take this seal to the chamber adjoining Cinderhold's throne room. Set it in the pedestal to call me there."
  ],{hold:false,after:()=>{const first=!cinderSeal;cinderSeal=true;saveGame();if(first)showReveal('it_cinderseal','Corin obtained the Cinderhold Seal!',3);}});
}
function clearTrialCombat() {
  foes = []; bolts.length = 0; breath = null; hunt = null; claw = null;
  spell = null; risings = []; turnHolder = null; turnT = 0; foeCool = 0;
  lastFight = 0; bossScene = null; grief = null; risePend = null;
  arenaLock = null; arenaT = 0; arenaGoing = false;
  twinSpent = false; twinKills = 0;
}
function stopTrial(message = "The trial ends. Speak to the demon in the throne room to try again.") {
  if (!trial) return;
  trial = null; clearTrialCombat(); rebuildBuckets();
  if (message) toast(message);
}
function startTrial() {
  if (!wonAll || !cinderSeal || MAPID !== "cinderhold" || !trialSealPlaced || trial) return;
  setOvl(null);
  clearTrialCombat();
  P.x = 176; P.y = 160; P.dir = "u"; P.act = null; pInv = 2;
  cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2; clampCam();
  trial = { waves: trialRoster(), index: -1, wait: 0, spawning: false };
  arenaLock = { id: "demon-trial", kind: "arena", x: 11, y: 18, r: 25.2 };
  arenaT = 1; arenaGoing = false;
  const run = trial;
  playScene(["Demon: Then let the trial begin.",
    "Shapes begin to gather across the throne room."],
    { hold: false, after: () => {
      if (trial === run && MAPID === "cinderhold") nextTrialWave();
    } });
}
function nextTrialWave() {
  if (!trial) return;
  const run = trial;
  run.index++;
  if (run.index >= run.waves.length) {
    trialWins++; stopTrial(""); saveGame();
    playScene(["The last shape breaks apart. Cinderhold falls quiet.",
      "Demon: Every creature, and still you stand. Come again when the silence bores you.",
      "Cinderhold trial complete! Victories: " + trialWins], { hold: false });
    return;
  }
  const wave = run.waves[run.index];
  /* Recenter before choosing positions, then keep every enemy comfortably
     inside the current view. This also works after Corin moves between waves. */
  cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2; clampCam();
  const left = cam.x + 24, right = cam.x + VW / cam.z - 24;
  const top = cam.y + 28, bottom = cam.y + VH / cam.z - 24;
  const spots = [];
  const offsets = [[-76,32],[76,32],[-72,-32],[72,-32],[0,64],[-48,56],[48,56],[0,-64]];
  for (const [ox, oy] of offsets) {
    const x = Math.round((P.x + ox) / 8) * 8, y = Math.round((P.y + oy) / 8) * 8;
    if (x < left || x > right || y < top || y > bottom) continue;
    if (Math.hypot(x - P.x, y - P.y) < 68) continue;
    if ([[-18,-18],[18,-18],[-18,0],[18,0]].some(([dx,dy]) => isSolid(x+dx,y+dy))) continue;
    if (spots.some(p => Math.hypot(p.x-x,p.y-y) < 56)) continue;
    spots.push({x,y});
  }
  /* A visible grid supplies alternatives if Corin ended the previous wave
     beside a wall or piece of furniture. */
  for (let y = Math.ceil(top / 16) * 16; y <= bottom; y += 24) {
    for (let x = Math.ceil(left / 16) * 16; x <= right; x += 24) {
      if (Math.hypot(x - P.x, y - P.y) < 68) continue;
      if ([[-18,-18],[18,-18],[-18,0],[18,0]].some(([dx,dy]) => isSolid(x+dx,y+dy))) continue;
      if (spots.some(p => Math.hypot(p.x-x,p.y-y) < 56)) continue;
      spots.push({x,y});
    }
  }
  if (spots.length < wave.count) { stopTrial("The summoning floor is blocked. Clear the hall and try again."); return; }
  run.spawning = true;
  playScene(["Cinderhold trial — Wave " + (run.index + 1) + "/" + run.waves.length + ": " + wave.name + " ×" + wave.count],
    { hold: false, after: () => {
      if (trial !== run || MAPID !== "cinderhold") return;
      foes = foes.filter(f => f.ally && f.st !== "dead");
      bolts.length = 0; run.spawning = false; run.wait = 0;
      for (const pos of spots.slice(0, wave.count)) {
        foes.push({ kind: wave.kind, x: pos.x, y: pos.y, hx: pos.x, hy: pos.y,
          hp: enemyMaxHp(wave.kind, pos.x), st: "idle", t: 0, dir: "d", flip: false,
          hurt: 0, ring: 0, trial: true, hold: 0, holdMax: 0, emerge: 1 });
        /* Trial foes must exist visibly as soon as their health bars do.
           Keep the summoning flash, but do not bury the sprite behind the
           normal 2.6s resurrection/emergence state. */
        showRise(pos.x, pos.y, [168,92,232]);
      }
      rebuildBuckets();
    }});
}
function stepTrial(dt) {
  if (!trial) return;
  if (MAPID !== "cinderhold") { stopTrial(""); return; }
  if (pHp <= 0) { stopTrial("The trial is lost. Speak to the demon in the throne room to try again."); return; }
  if (trial.spawning || scene || sayNpc || ask || ovl) return;
  if (foes.some(f => !f.ally && f.st !== "dead")) { trial.wait = 0; return; }
  trial.wait += dt;
  if (trial.wait >= 2) nextTrialWave();
}

function startLastFight() {
  if (wonAll || lastFight || MAPID !== "cinderhold") return;
  lastFight = 1;
  const k = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  const kx = k ? k.x : P.x, ky = k ? k.y : P.y - 60;
  foes.push({ kind: "kdragon", x: kx + 40, y: ky + 16, hx: kx + 40, hy: ky + 16,
              st: "idle", t: 0, hp: enemyMaxHp("kdragon", kx + 40), dir: "d", flip: false,
              hurt: 0, ring: 0, chaseDelay: 0.75 });
  rebuildBuckets();
  toast("It comes down off the steps and lifts both heads.");
}
let grief = null;
let bossScene = null;
function bossWalk(actor, x, y, dt, player) {
  const dx = x - actor.x, dy = y - actor.y, d = Math.hypot(dx, dy);
  const step = Math.min(d, 78 * dt);
  if (player) { faceCorinAt(x, y); actor.moving = d > 1; actor.t += dt; }
  else { faceToward(actor, x, y); actor.goto = d > 1 ? [x, y] : null; }
  if (d > 0) { actor.x += dx / d * step; actor.y += dy / d * step; }
  return d <= step;
}
/* Reserve the corpse's full sprite rectangle plus room for a person's feet. */
function bossBodyBounds(dead) {
  const rawDir = foeDir(dead.dir, dead.flip);
  const dir = rawDir === "s" ? (dead.flip ? "w" : "e") : rawDir;
  const sp = SPR["kdnew_death_" + dir] || SPR.kdnew_death_e || SPR.kdnew_death_w || SPR.kd_idle_d || SPR.kd_idle;
  const deathScale = sp && sp[5] === 4 ? 176 / 128 : 1;
  const w = sp ? sp[2] * deathScale : 120, h = sp ? sp[3] * deathScale : 100;
  return { l: dead.x - w/2 - 10, r: dead.x + w/2 + 10,
           t: dead.y - h - 8, b: dead.y + 12 };
}
function bossBodyDepth(x, y, body) {
  return Math.max(0, Math.min(x-body.l, body.r-x, y-body.t, body.b-y));
}
let bossRouteOrigin = null;
function bossRouteEdge(ax, ay, bx, by, body) {
  let depth = bossBodyDepth(ax, ay, body);
  const count = Math.max(1, Math.ceil(Math.hypot(bx-ax, by-ay)/2));
  for (let i = 1; i <= count; i++) {
    const x = ax + (bx-ax)*i/count, y = ay + (by-ay)*i/count;
    const next = bossBodyDepth(x, y, body);
    // Someone already overlapping when the dragon dies may step out, never farther in.
    if (next > depth + 0.001 || (depth === 0 && next > 0)) return false;
    if (!canStand(x, y)) {
      // A rider may finish over a blocked tile. Permit leaving only those
      // original tiles; never permit entering another wall along the route.
      const start=bossRouteOrigin;
      if(!start || !start.blocked || Math.floor(x/TS)!==start.tx || Math.floor(y/TS)!==start.ty)return false;
    }
    depth = next;
  }
  return true;
}
function bossRoute(x, y, actor, body) {
  const start = Math.floor(actor.y / TS) * MW + Math.floor(actor.x / TS);
  const end = Math.floor(y / TS) * MW + Math.floor(x / TS);
  if (!canStand(x, y) || bossBodyDepth(x,y,body) > 0) return null;
  const queue = [start], prev = new Map([[start, null]]);
  const point = v => v === start ? [actor.x, actor.y] : [(v%MW)*TS+TS/2, Math.floor(v/MW)*TS+TS/2];
  for (let i = 0; i < queue.length && !prev.has(end); i++) {
    const v = queue[i], vx = v % MW, vy = Math.floor(v / MW);
    const [ax,ay] = point(v);
    for (const [nx, ny] of [[vx+1,vy],[vx-1,vy],[vx,vy+1],[vx,vy-1]]) {
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const key = ny * MW + nx;
      if (prev.has(key) || !bossRouteEdge(ax,ay,nx*TS+TS/2,ny*TS+TS/2,body)) continue;
      prev.set(key, v); queue.push(key);
    }
  }
  if (!prev.has(end)) return null;
  const [ex,ey] = point(end);
  if (!bossRouteEdge(ex,ey,x,y,body)) return null;
  const route = [[x,y]];
  for (let v = end; v !== start; v = prev.get(v)) route.unshift(point(v));
  return route;
}
function bossChooseRoute(actor, body, occupied) {
  bossRouteOrigin={tx:Math.floor(actor.x/TS),ty:Math.floor(actor.y/TS),blocked:!canStand(actor.x,actor.y)};
  // Search every reachable half-tile, not just six destinations that may be blocked.
  const grid = TS/2, width = MW*2, height = MH*2;
  const start = Math.floor(actor.y/grid)*width + Math.floor(actor.x/grid);
  const point = v => v === start ? [actor.x,actor.y] : [(v%width)*grid+grid/2,Math.floor(v/width)*grid+grid/2];
  const queue=[start], prev=new Map([[start,null]]);
  const cx=(body.l+body.r)/2, cy=body.b+30;
  let best=null, score=Infinity;
  for (let i=0;i<queue.length;i++) {
    const v=queue[i], [x,y]=point(v);
    if (bossBodyDepth(x,y,body)===0 && canStand(x,y) &&
        (!occupied || Math.hypot(x-occupied[0],y-occupied[1])>=48)) {
      const cost=Math.hypot(x-cx,y-cy);
      if(cost<score){score=cost;best=v;}
    }
    const vx=v%width,vy=Math.floor(v/width);
    for(const [nx,ny] of [[vx+1,vy],[vx-1,vy],[vx,vy+1],[vx,vy-1]]) {
      if(nx<0||ny<0||nx>=width||ny>=height)continue;
      const key=ny*width+nx;
      if(prev.has(key)||!bossRouteEdge(x,y,nx*grid+grid/2,ny*grid+grid/2,body))continue;
      prev.set(key,v);queue.push(key);
    }
  }
  bossRouteOrigin=null;
  if(best===null)return null;
  const route=[];
  for(let v=best;v!==start;v=prev.get(v))route.unshift(point(v));
  if(!route.length)route.push([actor.x,actor.y]);
  return route;
}
function bossParkDragon(b) {
  // During the grief scene he stays close to Corin instead of selecting a
  // distant empty tile.  Try a few natural "watching" positions in order.
  const poses=["n","e","s","w"].map(dir=>dragonSprite(dir)).filter(Boolean);
  const hw=Math.max(28,...poses.map(sp=>sp[2]/4));
  const hh=Math.max(44,...poses.map(sp=>sp[3]/2));
  for (const [ox, oy] of [[48,28],[-48,28],[44,-28],[-44,-28],[0,50],[0,-48]]) {
    const x=Math.max(hw+8,Math.min(PXW-hw-8,P.x+ox));
    const y=Math.max(hh+8,Math.min(PXH-8,P.y+oy));
    if (!canStand(x,y)) continue;
    if (x+hw>b.body.l && x-hw<b.body.r && y+20>b.body.t && y-hh<b.body.b) continue;
    return [x,y];
  }
  return null;
}
function bossStageSpot(x, y, used = []) {
  /* Cinderhold's floor is fixed, but test the exact feet position once so a
     staged portal can never be planted into a wall or another actor. */
  for (let r = 0; r <= 144; r += 8) for (let oy = -r; oy <= r; oy += 8)
    for (let ox = -r; ox <= r; ox += 8) {
      if (r && Math.abs(ox) !== r && Math.abs(oy) !== r) continue;
      const px = Math.max(12, Math.min(PXW - 12, x + ox));
      const py = Math.max(16, Math.min(PXH - 8, y + oy));
      if (!canStand(px, py) || used.some(p => Math.hypot(px-p[0], py-p[1]) < 42)) continue;
      return [px, py];
    }
  return [x, y];
}
function stageBossBlackout(b) {
  /* The blackout is an intentional, fixed reset.  From here onward the
     grief scene and every portal use these same clean arena coordinates. */
  const cx = Math.round(PXW / 2), cy = Math.round(PXH / 2);
  const dead = bossStageSpot(cx, cy - 4);
  /* Keep both mourners just below the corpse, inside the scene camera and
     outside the large displayed body.  The companion stays at Corin's side. */
  const king = bossStageSpot(cx + 66, cy + 52, [dead]);
  const corin = bossStageSpot(cx - 66, cy + 52, [dead, king]);
  /* Put the companion on Corin's inward side so its full sprite remains in
     the fixed scene camera instead of clipping past the left edge. */
  const pet = bossStageSpot(corin[0] + 38, corin[1] + 24, [dead, king, corin]);
  const guardL = bossStageSpot(king[0] - 52, king[1] + 56, [dead, king, corin, pet]);
  const guardR = bossStageSpot(king[0] + 52, king[1] + 56, [dead, king, corin, pet, guardL]);
  b.layout = { dead, king, corin, pet, guards:[guardL, guardR] };
  b.dead.x = dead[0]; b.dead.y = dead[1];
  P.x = corin[0]; P.y = corin[1]; P.act = null; P.moving = false; faceCorinAt(dead[0], dead[1]);
  if (b.k) { b.k.x = king[0]; b.k.y = king[1]; b.k.goto = null; faceToward(b.k, dead[0], dead[1]); }
  if (dragonHere() && dragon.on) {
    dragon.x = pet[0]; dragon.y = pet[1]; dragon.air = false; dragon.tr = null; dragon.moving = false;
    dragon.dir = direction4(dead[0] - pet[0], dead[1] - pet[1], dragon.dir);
  }
  b.kx = king[0]; b.ky = king[1]; b.body = bossBodyBounds(b.dead);
  b.cx = cx; b.cy = cy; b.route = []; b.kingRoute = []; b.dragonPark = pet;
  rebuildSolid();
}
function stepBossScene(dt) {
  const b = bossScene;
  if (!b) return;
  if (MAPID !== "cinderhold") { bossScene = null; grief = null; risePend = null; return; }
  b.t += dt;
  b.dead.t += dt;
  /* Player movement is paused during this scene, so advance Corin's clock
     here to keep his standing/breathing animation alive. */
  if (!P.act && !P.moving) P.t += dt;
  /* Normal dragon AI is paused by bossScene, so advance the companion's
     animation clock here.  A parked dragon must still breathe and idle. */
  if (dragonHere() && dragon.on) dragon.t += dt;
  const zoom = b.phase === "return" ? b.zoom : Math.max(b.zoom * 0.85, Math.min(b.zoom, VW/260, VH/240));
  cam.z += (zoom - cam.z) * (1 - Math.exp(-5 * dt));
  // Keep Corin visible while he approaches, even after a distant killing blow.
  const followPlayer = b.phase === "return" || b.phase === "walk" && b.route.length > 0;
  const cx = followPlayer ? P.x : b.cx;
  const cy = followPlayer ? P.y : b.cy;
  const ease = 1 - Math.exp(-5 * dt);
  cam.x += (cx - VW/cam.z/2 - cam.x) * ease;
  cam.y += (cy - VH/cam.z/2 - cam.y) * ease;
  clampCam();
  if (b.phase === "blackoutIn") {
    b.black = Math.min(1, (b.black || 0) + dt / .34);
    if (b.black < 1) return;
    stageBossBlackout(b); b.phase = "blackoutLine"; b.t = 0;
    playScene(["Halvard: No!"], { after: () => { b.phase = "blackoutOut"; b.t = 0; } });
    return;
  }
  if (b.phase === "blackoutLine") return;
  if (b.phase === "blackoutOut") {
    b.black = Math.max(0, (b.black || 0) - dt / .42);
    if (b.black > 0) return;
    b.phase = "settle"; b.t = 0;
    return;
  }
  if (b.phase === "park") {
    const target=b.dragonPark = bossParkDragon(b);
    if(target && dragonHere() && dragon.on){
      const dx=target[0]-dragon.x,dy=target[1]-dragon.y,d=Math.hypot(dx,dy),step=Math.min(d,110*dt);
      dragon.air=false; dragon.tr=null; dragon.t+=dt;
      dragon.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?"e":"w"):(dy>0?"s":"n");
      if(d>0){dragon.x+=dx/d*step;dragon.y+=dy/d*step;}
      if(d>step)return;
    }
    b.phase="pan";b.t=0;
  }
  if (b.phase === "pan" && b.t >= 1.2) { b.phase = "walk"; b.t = 0; }
  if (b.phase === "walk") {
    const pt = b.route[0];
    if (pt && bossWalk(P, pt[0], pt[1], dt, true)) b.route.shift();
    const kp = b.kingRoute[0];
    if (b.k && kp && bossWalk(b.k, kp[0], kp[1], dt, false)) b.kingRoute.shift();
    const arrived = !b.kingRoute.length;
    if (!b.route.length && arrived) {
      P.moving = false; faceCorinAt(b.kx, b.ky);
      if (b.k) { b.k.goto = null; faceToward(b.k, b.dead.x, b.dead.y); }
      rebuildSolid(); b.phase = "settle"; b.t = 0;
    }
    // Corin is still walking; keep his dragon just beside him rather than
    // letting it resume free combat movement at the edge of the map.
    const target = b.dragonPark = bossParkDragon(b);
    if (target && dragonHere() && dragon.on) {
      const dx=target[0]-dragon.x,dy=target[1]-dragon.y,d=Math.hypot(dx,dy)||1,step=Math.min(d,110*dt);
      dragon.air=false; dragon.tr=null; dragon.moving=d>step;
      dragon.dir=direction4(dx,dy,dragon.dir);
      dragon.x+=dx/d*step; dragon.y+=dy/d*step;
    }
  } else if (b.phase === "settle" && b.t >= 1.2) {
      b.phase="dialogue";
      playScene([
        "Halvard: ...",
        "Halvard: Forty years I fed that thing out of my own hand.",
        "Halvard: You will not have understood what you have taken.",
        "Halvard: I stopped being a man some time ago. Watch.",
      ], { after: () => { b.phase = "fade"; b.t = 0; } });
  } else if (b.phase === "fade") {
    b.dead.sceneAlpha = Math.max(0, 1 - b.t / 1.2);
    if (b.t >= 1.2) { b.dead.sceneHidden = true; b.phase = "rise"; b.t = 0; risePhase(); }
  } else if (b.phase === "rise") {
    stepLichTransition(dt);
    for (const f of foes) if ((f.kind === "lich" || f.kind === "boneguard") && f.hold > 0) {
      f.hold = Math.max(0, f.hold - dt);
      f.emerge = Math.max(0, Math.min(1, (1 - f.hold/f.holdMax - 0.25)/0.7));
      f.t += dt;
    }
    if (!risePend && foes.some(f => f.kind === "lich") &&
        foes.filter(f => f.kind === "lich" || f.kind === "boneguard").every(f => f.hold <= 0)) {
      b.phase = "return"; b.t = 0;
    }
  } else if (b.phase === "return" && b.t >= 1.2) {
    cam.z = b.zoom; camFree = false; P.moving = false; bossScene = null; rebuildSolid();
  }
}

function secondPhase() {
  if (lastFight !== 1) return;
  lastFight = 2;
  const dead = foes.find(f => f.kind === "kdragon");
  const kk = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  if (dead) {
    bossScene = { phase: "blackoutIn", t: 0, dead, body:bossBodyBounds(dead), k:kk,
      zoom:cam.z, kx:dead.x, ky:dead.y, cx:dead.x, cy:dead.y, black:0 };
    if (kk) kk.goto = null;
    if (mounted) setMounted(false);
    camFree = true; P.act = null; P.moving = false;
    breath = null; claw = null; spell = null; bolts.length = 0;
    dragon.moving = false;
    return;
  }
  risePhase();
}

function stepGrief(dt) {
  if (!grief) return;
  grief.t += dt;
  const m = grief.k;
  const dx = grief.tx - m.x, dy = grief.ty - m.y;
  const d = Math.hypot(dx, dy) || 1;
  if (d > 6) {
    const sp = 52 * dt;
    m.x += (dx / d) * sp; m.y += (dy / d) * sp;
    m.f = Math.abs(dx) > Math.abs(dy) ? "s" : (dy > 0 ? "d" : "u");
    m.flip = Math.abs(dx) > Math.abs(dy) && dx < 0;
  }
}
let risePend = null;
function stepLichTransition(dt) {
  if (!risePend) return;
  risePend.t += dt;
  // Keep Halvard visible until the portal has fully opened beneath him.
  if (risePend.k && risePend.t >= 1.2 && !risePend.hidden) {
    risePend.k.away = 1; risePend.k.d = null;
    risePend.hidden = true;
    rebuildSolid();
  }
  if (risePend.t < risePend.wait) return;
  const { kx, ky, guards } = risePend;
  risePend = null;
  riseNow(kx, ky, guards);
}
function risePhase() {
  const k = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  const staged = bossScene && bossScene.layout;
  /* The transformation and both guards now rise from the exact patch of
     floor occupied by the fallen dragon, after its body fades away. */
  const kx = staged ? staged.dead[0] : k ? k.x : P.x;
  const ky = staged ? staged.dead[1] : k ? k.y : P.y - 60;
  const guards = staged ? (() => {
    const occupied = [staged.corin, staged.pet, staged.king, [kx, ky + 18]];
    const left = bossStageSpot(kx - 48, ky + 4, occupied);
    const right = bossStageSpot(kx + 48, ky + 4, [...occupied, left]);
    return [left, right];
  })() : null;
  showRise(kx, ky, [168, 92, 232]);
  risePend = { kx, ky, k, guards, hidden: false, t: 0, wait: 1.6 };
  toast("the floor opens under him");
}
function riseNow(kx, ky, guardSpots = null) {
  foes.push({ kind: "lich", x: kx, y: ky + 18, hx: kx, hy: ky + 18,
              st: "idle", t: 0, hp: enemyMaxHp("lich", kx), ring: 0,
              dir: "d", flip: false, hurt: 0, hold: 2.6, holdMax: 2.6, emerge: 0 });
  showRise(kx, ky + 18, [168, 92, 232]);
  const guards = guardSpots || [[kx - 44, ky + 26], [kx + 44, ky + 26]];
  for (const [gx, gy] of guards) {
    foes.push({ kind: "boneguard", x: gx, y: gy, hx: gx, hy: gy,
                st: "idle", t: 0, hp: enemyMaxHp("boneguard", gx), ring: 0,
                dir: "d", flip: false, hurt: 0, hold: 2.6, holdMax: 2.6, emerge: 0 });
    showRise(gx, gy, [168, 92, 232]);
  }
  rebuildBuckets();
  toast("what reaches the floor is not the King");
}
function lastFightHold() {
  if (!lastFight || wonAll) return;
  if (lastFight === 1) {
    const dg = foes.filter(f => f.kind === "kdragon");
    /* Let the supplied full collapse play once before Halvard starts moving. */
    if (dg.length && dg.every(f => f.st === "dead" && f.t >= 1.1)) secondPhase();
    return;
  }
  const pack = foes.filter(f => f.kind === "lich" || f.kind === "boneguard");
  const up = pack.filter(f => f.st !== "dead");
  if (pack.length && !up.length) winGame();
}
function winGame() {
  if (wonAll) return;
  wonAll = 1;
  if (window.EmberKingMusic) window.EmberKingMusic.stop();
  /* The King is a persistent story removal, not a room-local actor state. */
  if (MAPID === "cinderhold") npcs = npcs.filter(n => !/Halvard/.test(n.n || ""));
  rebuildSolid();
  saveGame();
  playScene([
    "The King goes down in his own hall.",
    "The two heads come to rest, one across the other.",
    "Corin: It is done, then.",
    "Corin: Come on. There is a long road home and nothing chasing us down it.",
    "-- EMBERFELL --",
  ], { hold: false });
}
function plantGraves() {
  const ring = arenaLock;
  let cx, cy;
  if (P.dir === "d") { cx = P.x; cy = P.y + 42; }
  else if (P.dir === "u") { cx = P.x + (P.flip ? -54 : 54); cy = P.y + 16; }
  else { cx = P.x + (P.flip ? -58 : 58); cy = P.y + 16; }
  const gy = cy;                          /* the line they stand on */
  const spots = [
    { x: cx - 26, y: gy, s: "wf_grave1" },
    { x: cx,      y: gy, s: "wf_grave2" },
    { x: cx + 26, y: gy, s: "wf_grave3" },
  ];
  const bits = [
    { x: cx - 46, y: gy + 4,  s: "bones3", flip: 0 },
    { x: cx - 38, y: gy + 10, s: "bones4", flip: 0 },
    { x: cx + 46, y: gy + 4,  s: "bones5", flip: 1 },
    { x: cx + 38, y: gy + 10, s: "bones6", flip: 1 },
    { x: cx,      y: gy + 20, s: "bones10", flip: 0 },
  ];
  graves = { ring, spots, bits, held: 0, earned: 0, fell: 0, t: 0 };
}
function stepGraves(dt) {
  if (!graves) return;
  graves.t += dt;
  if (arenaLock !== graves.ring && graves.t > 1.5) {
    if (graves.held) toast("the stones keep what was under them");
    graves = null;
  }
}
function drawGraves() {
  if (!graves) return;
  const glow = graves.held > 0;
  for (const b of graves.bits) {
    const sp = SPR[b.s]; if (!sp) continue;
    const bx = Math.round(b.x - sp[2] / 2), by = Math.round(b.y - sp[3]);
    if (b.flip) {
      ctx.save();
      ctx.translate(bx + sp[2], by);
      ctx.scale(-1, 1);
      drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
      ctx.restore();
    } else {
      drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3], bx, by, sp[2], sp[3]);
    }
  }
  for (const g of graves.spots) {
    const sp = SPR[g.s]; if (!sp) continue;
    if (glow) drawSmoke("ghost", g.x, g.y - 20, (graves.t % 2.0) / 2.0,
      {width:24, height:38, color:"#efd497", alpha:0.6});
    drawSmoke("fall", g.x, g.y - 2, graves.t / 0.8, {width:44, height:18});
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(g.x - sp[2] / 2), Math.round(g.y - sp[3]), sp[2], sp[3]);
  }
}
function settleGraves() {
  if (!graves || arenaLock !== graves.ring) return;
  if (graves.held > 0) {
    gold += graves.held;
    toast("he takes " + graves.held + " gold back up out of the ground");
  } else if (!graves.fell && graves.earned > 0) {
    gold += graves.earned;
    toast("the stones pay double -- " + graves.earned + " more");
  } else {
    toast("the stones had nothing to give");
  }
  graves = null;
}
function useMark() {
  if (marks <= 0 && !devSafe) { toast("no markers"); return false; }
  if (graves) { toast("his stones are already in the ground"); return false; }
  if (!arenaLock && !devSafe && !devItemTest) { toast("there is no fight to wager on"); return false; }
  marks--;
  plantGraves();
  toast("three stones go in. Finish it and they pay.");
  return true;
}
const MAD_FOR = 14;
function useDust() {
  if (dust <= 0 && !devSafe) { toast("no dust"); return false; }
  const near = foes.filter(f => !f.ally && f.st !== "dead" &&
                                Math.hypot(f.x - P.x, f.y - P.y) < 300);
  if (near.length < 2 && !devSafe && !devItemTest) { toast("nothing enough to set against itself"); return false; }
  dust--;
  showDust(P.x, P.y);
  for (const f of near) f.mad = MAD_FOR;
  toast("the dust goes up -- they cannot tell one another from him");
  return true;
}
const BOSS_KIND = /^(golem1|golem2|golem3|devil|lich|ghost|ghost3|knight|treasuryknight)$/;
/* golems, the Ashfiend and the Lich stay dead once felled outside an arena;
   arena foes are meant to refill (see refillRing), these are not */
const NO_RESPAWN = /^(golem1|golem2|golem3|devil|lich|knight)$/;
const bossGone = {};                /* mapid+":"+idx -> true once one falls for good */
function markBossGone(f) {
  if(f.kind==="treasuryknight"){royalDefeated.treasuryCaptain=true;recoverStrandedDragon();toast("Treasury Captain defeated — the treasure is yours!");}
  if(f.kind==="royalguard" && f.idx!==undefined){royalDefeated[MAPID+":"+f.idx]=true;if(!foes.some(q=>q!==f&&q.kind==="royalguard"&&q.st!=="dead"))recoverStrandedDragon();}
  if (!f.ally && !f.storyKnight && f.idx !== undefined && NO_RESPAWN.test(f.kind))
    bossGone[MAPID + ":" + f.idx] = true;   /* stays down for good, however it died */
}
function bossRing(a) {
  if (!a) return false;
  if (MAPID === "cinderhold") return true;           /* the King's own floor */
  return foes.some(f => f.st !== "dead" && !f.ally && BOSS_KIND.test(f.kind) &&
                        Math.hypot(f.x / TS - a.x, f.y / TS - a.y) <= (a.r || 6) + 5);
}
// Supplied Smoke pack frames; no generated smoke shapes or particles.
const SMOKE_FRAMES = {circle:10,curl:24,cycle:6,long:6,fall:16,trail:12,rise:14,ghost:18,ring1:7,ring2:7,ring3:7,skull:20};
// Reuse recolored smoke frames; bound retained canvases to 2 MiB.
const smokeTintCache = new Map();
let smokeTintPixels = 0;
function smokeTint(name, frame, sp, color) {
  const key = name + ":" + frame + ":" + color;
  const cached = smokeTintCache.get(key);
  if (cached) {
    smokeTintCache.delete(key); smokeTintCache.set(key, cached);
    return cached;
  }
  const pixels = sp[2] * sp[3];
  if (pixels > 524288) return tintFoe(sp, 0, color, 0.72);
  while (smokeTintPixels + pixels > 524288 || smokeTintCache.size >= 64) {
    const oldest = smokeTintCache.keys().next().value;
    const cv = smokeTintCache.get(oldest);
    smokeTintPixels -= cv.width * cv.height;
    smokeTintCache.delete(oldest);
    cv.width = cv.height = 0;
  }
  const cv = document.createElement("canvas");
  cv.width = sp[2]; cv.height = sp[3];
  drawGameImage(cv.getContext("2d"), tintFoe(sp, 0, color, 0.72), 0, 0);
  smokeTintCache.set(key, cv); smokeTintPixels += pixels;
  return cv;
}
function drawSmoke(name, x, y, progress, options = {}) {
  if (progress < 0 || progress >= 1) return;
  const count = SMOKE_FRAMES[name];
  if (!count) return;
  const frame = Math.min(count - 1, Math.floor(progress * count));
  const sp = SPR["fx_smoke_" + name + "_" + frame];
  if (!sp) return;
  const width = options.width || sp[2];
  const height = options.height || width * sp[3] / sp[2];
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha *= options.alpha === undefined ? 1 : options.alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (options.angle) ctx.rotate(options.angle);
  if (options.color) {
    const tinted = smokeTint(name, frame, sp, options.color);
    drawGameImage(ctx, tinted, Math.round(-width / 2), Math.round(-height / 2), width, height);
  } else {
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
      Math.round(-width / 2), Math.round(-height / 2), width, height);
  }
  ctx.restore();
}
function drawBuff(name, progress, width, alpha = 1, color = null, cx = P.x, cy = P.y, bubblesOnly = false) {
  if (progress < 0 || progress >= 1) return;
  const count = 12;
  const sp = SPR["fx_buff_" + name + "_" + Math.min(count - 1, Math.floor(progress * count))];
  if (!sp) return;
  const height = width * sp[3] / sp[2];
  const x = Math.round(cx - width / 2), y = Math.round(cy - height * 0.80);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  const sh = bubblesOnly ? Math.floor(sp[3] * 0.45) : sp[3];
  const dh = height * sh / sp[3];
  if (color) drawGameImage(ctx, tintFoe(sp, 0, color, 0.65), 0, 0, sp[2], sh, x, y, width, dh);
  else drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sh, x, y, width, dh);
  ctx.restore();
}
function drawSaintBuff(front = false) {
  if (saintT <= 0) return;
  const age = 16 - saintT;
  if(front){
    // Isolate the five upright blades; the circular floor sigil stays below Corin.
    const sp=SPR.fx_buff_saint_0;if(!sp)return;
    const w=64,h=w*sp[3]/sp[2],x=P.x-w/2,y=P.y-h*.8;
    ctx.save();ctx.beginPath();
    for(const [cx,top,bottom] of [[.18,.35,.77],[.32,.18,.66],[.5,.36,.90],[.67,.2,.66],[.81,.34,.77]])
      ctx.rect(x+w*(cx-.025),y+h*top,w*.05,h*(bottom-top));
    ctx.clip();
  }
  drawBuff("saint", (age % 1.2) / 1.2, 64, Math.min(1, saintT / 0.8));
  if(front)ctx.restore();
}

let spell = null;
function castSkull(x, y, hue, then) {
  spell = { kind: "skull", x, y, t: 0, life: 1.9, hue: hue || "#9fd8c8", then, done: 0 };
}
function stepSpell(dt) {
  if (!spell) return;
  spell.t += dt;
  if (!spell.done && spell.t > 0.95) { spell.done = 1; if (spell.then) spell.then(); }
  if (spell.t >= spell.life) spell = null;
}

let stonePreview = null;
let heal = null;
let risings = [];
const HOLY_FLOWERS = ["aflower1_0", "aflower3_0", "aflower1_2", "aflower3_1",
                      "aflower1_4", "aflower3_4", "aflower1_8", "aflower3_6",
                      "aflower1_w", "aflower3_w", "aflower2_2", "aflower3_9"];
let blooms = [];
let consecrationTrails = [];
const CONSECRATION_LAP = 2.2, CONSECRATION_LAPS = 1, CONSECRATION_TAIL = 0.45;
const CONSECRATION_DURATION = CONSECRATION_LAP * CONSECRATION_LAPS;
function plantRing(ring) {
  const n = Math.max(12, Math.round((ring.r || 6) * 3.2));
  const t0 = CONSECRATION_DURATION + CONSECRATION_TAIL + 0.05;
  if (blooms.length + n > 160) blooms.splice(0, blooms.length + n - 160);
  consecrationTrails.push({x:ring.x * TS, y:ring.y * TS,
    radius:((ring.r || 6) - 0.6) * TS, t:0});
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283;
    const rr = ((ring.r || 6) - 0.6) * TS;
    blooms.push({
      x: ring.x * TS + Math.cos(a) * rr,
      y: ring.y * TS + Math.sin(a) * rr * 0.92,
      s: HOLY_FLOWERS[i % HOLY_FLOWERS.length],
      wait: t0 + i * 0.045,          /* they open round the circle in turn */
      t: 0,
    });
  }
}
function stepBlooms(dt) {
  for (const b of blooms) b.t += dt;
  for (const trail of consecrationTrails) trail.t += dt;
  consecrationTrails = consecrationTrails.filter(trail =>
    trail.t < CONSECRATION_DURATION + CONSECRATION_TAIL);
}
function drawConsecrationTrail() {
  for (const trail of consecrationTrails) {
    // Draw the older smoke first so the bright leading plume stays visible.
    for (let i = 9; i >= 0; i--) {
      const age = trail.t - i * 0.05;
      if (age < 0 || age >= CONSECRATION_DURATION) continue;
      const angle = age / CONSECRATION_LAP * Math.PI * 2;
      const x = trail.x + Math.cos(angle) * trail.radius;
      const y = trail.y + Math.sin(angle) * trail.radius * 0.92;
      drawSmoke("long", x, y - 3, (age * 1.25 + i * 0.07) % 1,
        {width:9, height:38, color:"#ffb4dc", alpha:(1 - i * 0.09) * 0.85,
         angle:Math.atan2(Math.cos(angle) * 0.92, -Math.sin(angle)) - Math.PI / 2});
    }
  }
}
function drawBlooms() {
  drawConsecrationTrail();
  const vw = VW / cam.z, vh = VH / cam.z;
  for (const b of blooms) {
    if (b.x < cam.x - 48 || b.x > cam.x + vw + 48 ||
        b.y < cam.y - 48 || b.y > cam.y + vh + 48) continue;
    const a = b.t - b.wait;
    if (a < 0) continue;
    const sp = SPR[b.s];
    if (!sp) continue;
    drawSmoke("ring3", b.x, b.y - 2, a / 0.8, {width:22, color:"#ff8fcc", alpha:0.75});
    const up = Math.min(1, a / 0.35);
    const ease = 1 - (1 - up) * (1 - up);
    const h = Math.round(sp[3] * ease);
    if (h < 1) continue;
    drawGameImage(ctx, atlasImg, sp[0], sp[1] + (sp[3] - h), sp[2], h,
                  Math.round(b.x - sp[2] / 2), Math.round(b.y - h),
                  sp[2], h);
  }
}
function showRise(x, y, col) {
  risings.push({ x, y, t: 0, life: 2.6, col: col || [168, 92, 232] });
}
function stepRise(dt) {
  if (!risings.length) return;
  for (const r of risings) r.t += dt;
  risings = risings.filter(r => r.t < r.life);
}
function drawRise() {
  const vw = VW / cam.z, vh = VH / cam.z;
  for (const r of risings) {
    if (r.x < cam.x - 80 || r.x > cam.x + vw + 80 ||
        r.y < cam.y - 100 || r.y > cam.y + vh + 80) continue;
    const p = r.t / r.life;
    const open = Math.min(1, p / 0.45);        /* the seam pulls apart */
    const fade = p < 0.70 ? 1 : 1 - (p - 0.70) / 0.30;
    ctx.save();
    const C = r.col.join(",");
    const Cm = r.col.map(v => Math.round(v * 0.42)).join(",");
    const spin = r.t * 2.4;
    const W = 26 * open, Hh = W * 0.42;   /* a touch smaller */
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.scale(1, 0.42);                     /* everything below is a circle */
    const RAD = W;
    ctx.globalAlpha = fade;
    const well = ctx.createRadialGradient(0, 0, 0, 0, 0, RAD);
    well.addColorStop(0, "rgba(2,0,6,0.99)");
    well.addColorStop(0.42, "rgba(8,2,16,0.92)");
    well.addColorStop(0.74, "rgba(" + Cm + ",0.7)");
    well.addColorStop(0.93, "rgba(" + C + ",0.85)");
    well.addColorStop(1, "rgba(" + C + ",0)");
    ctx.fillStyle = well;
    ctx.beginPath(); ctx.arc(0, 0, RAD, 0, 6.283); ctx.fill();
    ctx.lineCap = "round";
    for (let k = 0; k < 5; k++) {
      const base = spin + (k / 5) * 6.283;
      ctx.globalAlpha = fade * 0.75;
      ctx.strokeStyle = "rgba(" + C + ",0.8)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let q = 0; q <= 12; q++) {
        const u = q / 12;
        const rr = RAD * (1 - u * 0.86);
        const a = base + u * 2.3;           /* it winds in as it goes */
        const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
        if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = fade * 0.9;
    ctx.strokeStyle = "rgba(232,190,255,0.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, RAD * 0.98, 0, 6.283); ctx.stroke();
    ctx.globalAlpha = fade * 0.5;
    ctx.strokeStyle = "rgba(" + C + ",0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, RAD * 1.04, 0, 6.283); ctx.stroke();
    ctx.restore();
    drawSmoke("ghost", r.x, r.y - 26, p,
      {width:48, height:62, color:"rgb(" + C + ")", alpha:fade});
    ctx.restore();
  }
}

function showHeal(kind, x = P.x, y = P.y - 22) {
  if(kind==="dragon"){dragon.healPulse=1;return;}
  heal = { t: 0, life: kind === "elixir" ? 1.4 : 1.1, kind, x, y };
}
function stepHeal(dt) {
  if(dragon.healPulse>0)dragon.healPulse=Math.max(0,dragon.healPulse-dt);
  if(stonePreview){stonePreview.reverseRise-=dt;if(stonePreview.reverseRise<=0)stonePreview=null;}
  if (!heal) return;
  heal.t += dt;
  if (heal.t >= heal.life) heal = null;
}
function drawHeal() {
  if (!heal) return;
  const elixir = heal.kind === "elixir";
  const dragonHeal = heal.kind === "dragon";
  drawBuff("heal", heal.t / heal.life, elixir ? 62 : dragonHeal ? 72 : 50,
    Math.min(1, (heal.life - heal.t) / 0.2),
    elixir ? "#ffdc80" : dragonHeal ? "#e88958" : null, heal.x, heal.y + 22 + (dragonHeal ? 0 : (elixir ? 62 : 50) * 100 / 80 * 0.4), !dragonHeal);
}
let tintCv = null, tintCtx = null;
function tintFoe(sp, fr, col, amt) {
  if (!tintCv) { tintCv = document.createElement("canvas"); tintCtx = tintCv.getContext("2d"); }
  if (tintCv.width !== sp[2] || tintCv.height !== sp[3]) {
    tintCv.width = sp[2]; tintCv.height = sp[3];
  }
  const g = tintCtx;
  g.clearRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  drawGameImage(g, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-atop";
  g.globalAlpha = amt;
  g.fillStyle = col;
  g.fillRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  return tintCv;
}
let dustPuff = null;
function showDust(x, y) {
  dustPuff = { x, y, t: 0, life: 2.8 };
}
function stepDust(dt) {
  if (!dustPuff) return;
  dustPuff.t += dt;
  if (dustPuff.t >= dustPuff.life) dustPuff = null;
}
function drawDust() {
  for (const f of foes) {
    if (!(f.mad > 0) || f.st === "dead") continue;
    const target = f._hunt;
    if (!target || target.st === "dead") continue;
    const dx = target.x - f.x, dy = target.y - f.y;
    drawSmoke("trail", (f.x + target.x) / 2, (f.y + target.y) / 2 - 12,
      (foeClock % 1.2) / 1.2, {width:Math.min(110, Math.hypot(dx, dy)),
        height:20, angle:Math.atan2(dy, dx), color:"#b67be4", alpha:0.55 * Math.min(1, f.mad / 2)});
  }
  if (!dustPuff) return;
  const p = dustPuff.t / dustPuff.life;
  drawSmoke("curl", dustPuff.x, dustPuff.y - 12, p,
    {width:Math.max(230,VW/cam.z*.85), height:Math.max(120,VH/cam.z*.55), color:"#b67be4"});
  for (let i = 0; i < 7; i++) {
    const age = dustPuff.t - i * 0.12;
    drawSmoke("trail", dustPuff.x + (i - 3) * Math.max(40,VW/cam.z/8), dustPuff.y - 10 + (i%3-1)*36,
      age / 2.2, {width:110, color:"#b67be4", alpha:0.7, angle:(i - 1) * 0.5});
  }
}
let fireCv = null, fireCtx = null;
function tintFire(sp, fr, col) {
  if (!fireCv) { fireCv = document.createElement("canvas"); fireCtx = fireCv.getContext("2d"); }
  if (fireCv.width !== sp[2] || fireCv.height !== sp[3]) {
    fireCv.width = sp[2]; fireCv.height = sp[3];
  }
  const g = fireCtx;
  g.clearRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = col;
  g.fillRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "destination-in";
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  return fireCv;
}
let darkCv = null, darkCtx = null;
function darkFoe(sp, fr, col) {
  if (!darkCv) { darkCv = document.createElement("canvas"); darkCtx = darkCv.getContext("2d"); }
  if (darkCv.width !== sp[2] || darkCv.height !== sp[3]) {
    darkCv.width = sp[2]; darkCv.height = sp[3];
  }
  const g = darkCtx;
  g.clearRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = col;
  g.fillRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "destination-in";
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  return darkCv;
}

function drawSpell() {
  if (!spell || spell.kind !== "skull") return;
  drawSmoke("skull", spell.x, spell.y - 8, spell.t / spell.life,
    {width:150, color:spell.hue});
}
function useBomb() {
  if (bombs <= 0 && !devSafe) { toast("he has no curse to spend"); return false; }
  if (!arenaLock && !devSafe && !devItemTest) { toast("nothing to walk out of"); return false; }
  if (!arenaLock) {
    bombs--;
    castSkull(P.x, P.y, "#a8c8bc", () => toast("nothing here to curse"));
    return true;
  }
  bombs--;
  if (bossRing(arenaLock)) {
    castSkull(P.x, P.y, "#a8c8bc", () => {
      toast("he says the word. It does not even look up.");
    });
    return true;
  }
  const ring = arenaLock;
  castSkull(ring.x * TS, ring.y * TS, "#a8c8bc", () => {
    let n = 0;
    for (const f of foes) {
      if (f.ally || f.st === "dead") continue;
      if (Math.hypot(f.x / TS - ring.x, f.y / TS - ring.y) > (ring.r || 6) + 5) continue;
      f.st = "dead"; f.t = 0; f.hp = 0; f.mad = 0;
      n++;
    }
    ring._wave = 99;
    cooling.set(ringKey(ring), ARENA_REST);
    releaseArena();
    rebuildBuckets();
    toast(n ? "the word lands, and nothing in the ring is left standing"
            : "the word goes out over an empty ring");
  });
  return true;
}
function drinkElixir() {
  if (elixirs <= 0 && !devSafe) { toast("no elixirs"); return false; }
  if (pHp >= pMax && !devSafe && !devItemTest) { toast("he is not hurt"); return false; }
  elixirs--;
  pHp = pMax;
  showHeal("elixir");
  toast("full again -- " + elixirs + " elixir" + (elixirs === 1 ? "" : "s") + " left");
  return true;
}
const STOCK = {
  potion: { n: "POTION",  cost: () => POTION_COST, go: buyPotion },
  elixir: { n: "ELIXIR",  cost: () => ELIXIR_COST, go: buyElixir },
  boarMeat: { n: "BOAR MEAT", cost: () => BOAR_MEAT_COST, go: buyBoarMeat },
  dragonFish: { n: "FRESH FISH", cost: () => DRAGON_FISH_COST, go: buyDragonFish },
  bomb:   { n: "MAELIS'S CURSE", cost: () => BOMB_COST, go: buyBomb },
  dust:   { n: "MADNESS DUST", cost: () => DUST_COST, go: buyDust },
  bell:   { n: "BELL STAKE",   cost: () => BELL_COST, go: buyBell },
  mark:   { n: "GRAVE MARKER", cost: () => MARK_COST, go: buyMark },
  saint:  { n: "SAINT'S BREATH", cost: () => BREATH_COST, go: buyBreath },
  stone:  { n: "RESURRECTION STONE", cost: () => STONE_COST, go: buyStone },
  salt:   { n: "CONSECRATION", cost: () => SALT_COST, go: buySalt },
};
function merchantAsk(giver) {
  ask = { quick:1, opts:[
    {n:"TALK",go:()=>beginNpcTalk(giver)},
    {n:"PURCHASE",go:()=>sellerAsk(giver)},
    {n:"LEAVE",go:null}
  ]};askPick=0;askDraw();
}
function purchaseQuantity(giver,key,amount=1) {
  const item=STOCK[key];if(!item)return;
  if(gold<item.cost()){toast('Not enough gold for '+item.n.toLowerCase()+'.');sellerAsk(giver);return;}
  const max=Math.max(1,Math.min(99,Math.floor(gold/item.cost())));
  const qty=Math.max(1,Math.min(max,Math.trunc(amount)||1));
  ask={quick:1,quantity:{giver,key,qty,max},back:()=>sellerAsk(giver),opts:[
    {n:"CONTINUE  (A)",go:()=>confirmPurchase(giver,key,qty)},
    {n:"BACK",go:()=>sellerAsk(giver)}
  ]};askPick=0;askDraw();
}
function confirmPurchase(giver,key,qty){
  const item=STOCK[key];if(!item)return;
  ask={quick:1,confirmation:{key,qty},back:()=>purchaseQuantity(giver,key,qty),opts:[
    {n:'Buy '+qty+' × '+item.n+' for '+qty*item.cost()+' gold?',head:true},
    {n:'YES, BUY  (A)',go:()=>{
      if(buyStockQuantity(key,qty))sellerAsk(giver);
      else purchaseQuantity(giver,key,qty);
    }},
    {n:'BACK',go:()=>purchaseQuantity(giver,key,qty)}
  ]};askPick=1;askDraw();
}
function changePurchaseQuantity(delta) {
  if(!ask?.quantity)return;
  const {giver,key,qty}=ask.quantity;purchaseQuantity(giver,key,qty+delta);
}
function buyStockQuantity(key,qty) {
  const item=STOCK[key];
  if(!item||!Number.isInteger(qty)||qty<1||qty>99)return false;
  const total=item.cost()*qty;
  if(gold<total){toast("not enough gold — "+total+" needed");return false;}
  switch(key){
    case "potion":potions+=qty;break;case "elixir":elixirs+=qty;break;
    case "boarMeat":boarMeat+=qty;break;case "dragonFish":dragonFish+=qty;break;
    case "bomb":bombs+=qty;break;case "dust":dust+=qty;break;
    case "bell":bells+=qty;break;case "mark":marks+=qty;break;
    case "saint":breaths+=qty;break;case "stone":stones+=qty;break;
    case "salt":salts+=qty;break;default:return false;
  }
  gold-=total;toast(qty+" × "+item.n+" bought — "+gold+" gold left");return true;
}
function sellerAsk(giver) {
  const list = [].concat(giver.sells);
  if (!/Maelis|witch/i.test(giver.n || ""))
    list.push(giver.n === "Nerissa" ? "dragonFish" : "boarMeat");
  const stock = [...new Set(list)].filter(k => STOCK[k]);
  if (!stock.length) return;
  const opts = stock.map(k => ({
    n: STOCK[k].n + " -- " + STOCK[k].cost() + "g",
    go: () => purchaseQuantity(giver,k),
  }));
  opts.push({ n: "BACK", go: () => merchantAsk(giver) });
  ask = { opts, quick:1 }; askPick = 0;
  askDraw();
}
function buyBreath() {
  if (gold < BREATH_COST) { toast("not enough gold -- " + gold + "/" + BREATH_COST); return false; }
  gold -= BREATH_COST; breaths++; toast("saint's breath bought -- " + gold + " gold left"); return true;
}
function buyStone() {
  if (gold < STONE_COST) { toast("not enough gold -- " + gold + "/" + STONE_COST); return false; }
  gold -= STONE_COST; stones++; toast("a resurrection stone bought -- " + gold + " gold left"); return true;
}
function buySalt() {
  if (gold < SALT_COST) { toast("not enough gold -- " + gold + "/" + SALT_COST); return false; }
  gold -= SALT_COST; salts++; toast("consecration bought -- " + gold + " gold left"); return true;
}
function buyBell() {
  if (gold < BELL_COST) { toast("not enough gold -- " + gold + "/" + BELL_COST); return false; }
  gold -= BELL_COST; bells++;
  toast("a bell stake bought -- " + gold + " gold left");
  return true;
}
function buyMark() {
  if (gold < MARK_COST) { toast("not enough gold -- " + gold + "/" + MARK_COST); return false; }
  gold -= MARK_COST; marks++;
  toast("a grave marker bought -- " + gold + " gold left");
  return true;
}
function buyDust() {
  if (gold < DUST_COST) { toast("not enough gold -- " + gold + "/" + DUST_COST); return false; }
  gold -= DUST_COST; dust++;
  toast("madness dust bought -- " + gold + " gold left");
  return true;
}
function buyBomb() {
  if (gold < BOMB_COST) { toast("not enough gold -- " + gold + "/" + BOMB_COST); return false; }
  gold -= BOMB_COST; bombs++;
  toast("she gives him the word -- " + gold + " gold left");
  return true;
}
function buyElixir() {
  if (gold < ELIXIR_COST) { toast("not enough gold -- " + gold + "/" + ELIXIR_COST); return false; }
  gold -= ELIXIR_COST; elixirs++;
  toast("an elixir bought -- " + gold + " gold left");
  return true;
}
function buyPotion() {
  if (gold < POTION_COST) { toast("not enough gold -- " + gold + "/" + POTION_COST); return false; }
  gold -= POTION_COST; potions++;
  toast("a potion bought -- " + gold + " gold left");
  return true;
}
function buyBoarMeat() {
  if (gold < BOAR_MEAT_COST) { toast("not enough gold -- " + gold + "/" + BOAR_MEAT_COST); return false; }
  gold -= BOAR_MEAT_COST; boarMeat++;
  toast("boar meat bought for the dragon -- " + gold + " gold left");
  return true;
}
function buyDragonFish() {
  if (gold < DRAGON_FISH_COST) { toast("not enough gold -- " + gold + "/" + DRAGON_FISH_COST); return false; }
  gold -= DRAGON_FISH_COST; dragonFish++;
  toast("fresh fish bought for the dragon -- " + gold + " gold left");
  return true;
}
let twinKills = 0;
const CHARM_ART = { spore: "it_spore", ward: "it_ward", edge: "it_edge",
                    brand: "it_brand", twin: "it_twin", lamp: "it_lamp",
                    flame: "it_twinflame", wake: "it_wake" };
let twinSpent = false;
const WORN_MAX = 3;
function wornCount() {
  let n = 0;
  for (const k in worn) if (worn[k]) n++;
  return n;
}
let brandCount = 0, brandHot = false;
const CHARM_ICON = { spore: "ms3_idle_d", ward: "it_stone", edge: "sm_atk_d",
                     brand: "fslash_d", twin: "dr5_idle_e",
                     lamp: "wt_torch1", flame: "fire_s", wake: "it_stone" };
const CHARM_NOTE = {
  brand: "Corin obtained the Fire Slash!",
  twin:  "Corin obtained the Twin Heart!",
  lamp:  "Corin obtained the Hollybeck Lantern!",
  flame: "Corin obtained the Twin Flame!",
  wake:  "Corin obtained the Book of the Dead!",
  spore: "Corin obtained the Deep Ring Spore!",
  ward:  "Corin obtained the Witch's Ward!",
  edge:  "Corin obtained Dunstan's Whetstone!",
};
function giveCharm(which, line) {
  if (charm[which]) return false;
  charm[which] = true;
  playScene([line]);
  return true;
}
let turnHolder = null, turnT = 0, foeCool = 0;
function targetFor(f) {
  if (f.ally || f.mad > 0) {
    let best = null, bd = 220;
    const fresh = f._huntT !== undefined && f._huntT > foeClock - 0.25;
    const kept = f._hunt;
    if (fresh && (!kept || (kept.st !== "dead" &&
                            Math.hypot(kept.x - f.x, kept.y - f.y) < 300))) {
      if (kept) return { x: kept.x, y: kept.y,
                         d: Math.hypot(kept.x - f.x, kept.y - f.y),
                         isPlayer: false, foe: kept };
      best = null;                       /* a remembered miss: fall through */
    } else {
      f._huntT = foeClock;
      for (const q of foes) {
      if (q === f || q.st === "dead") continue;
      if (f.ally && q.ally) continue;
      if (!f.ally && q.ally) continue;   /* a maddened foe leaves his side alone */
      const d = Math.hypot(q.x - f.x, q.y - f.y);
      if (d < bd) { bd = d; best = q; }
    }
      f._hunt = best;
    }
    if (best) return { x: best.x, y: best.y, d: bd, isPlayer: false, foe: best };
    const side = (f.slot % 2) ? -1 : 1;
    const back = (P.dir === "u") ? -1 : 1;
    const tx2 = P.x + side * 22;
    const ty2 = P.y + back * 52;
    return { x: tx2, y: ty2, d: Math.hypot(tx2 - f.x, ty2 - f.y),
             isPlayer: false, follow: 1 };
  }
  if (bell && !f.ally) {
    const bd = Math.hypot(bell.x - f.x, bell.y - f.y);
    if (bd < 420) return { x: bell.x, y: bell.y, d: bd, isPlayer: false, toBell: 1 };
  }
  const dp = Math.hypot(P.x - f.x, P.y - f.y);
  if (!(dragonHere() && dragon.on) || dragon.down) return { x: P.x, y: P.y, d: dp, isPlayer: true };
  const dd = Math.hypot(dragon.x - f.x, (dragon.y + 8) - f.y);
  if (dd < dp * 0.8) return { x: dragon.x, y: dragon.y + 8, d: dd, isPlayer: false, isDragon: true };
  return { x: P.x, y: P.y, d: dp, isPlayer: true };
}
const WAKE_COOL = 24;              /* seconds between callings */
let wakeCool = 0;
function wakeReady() { return charm.wake && wakeCool <= 0 && !dying(); }
function wakeCount() {
  return foes.filter(f => f.ally && f.kind === "wraith" && f.st !== "dead").length;
}
function wakeTheDead() {
  if (!wakeReady()) return false;
  const room = 2 - wakeCount();
  if (room <= 0) { toast("two is all that will come"); return false; }
  wakeCool = WAKE_COOL;
  for (let i = 0; i < room; i++) {
    const ang = i * Math.PI + 0.7854;       /* one either side of him */
    showRise(P.x + Math.cos(ang) * 34, P.y + Math.sin(ang) * 26);   /* violet */
    foes.push({ kind: "wraith", ally: 1, slot: i,
                x: P.x + Math.cos(ang) * 34,
                y: P.y + Math.sin(ang) * 26,
                hx: P.x, hy: P.y,
                st: "idle", t: 0, hold: 2.6, holdMax: 2.6, emerge: 0,
                hp: (FOE.wraith || {}).hp || 8,
                dir: "d", flip: false, hurt: 0 });
  }
  rebuildBuckets();
  toast("two of the Hollybeck dead get up");
  return true;
}
let foeClock = 0;     /* seconds, for anything that need not look every frame */
const FOE_THINK = 640;
const thinks = (f) => {
  if(MD?.templeContinuous&&!MD.templeActive[templeRoomOf(f)])return false;
  if (f.storyPassive) return false;
  if (f.trial || f.ally || f.mad > 0 || BOSS_KIND.test(f.kind || "") || f.kind === "kdragon") return true;
  const dx = f.x - P.x, dy = f.y - P.y;
  return dx * dx + dy * dy < FOE_THINK * FOE_THINK;
};
let live = [];
function kingDragonTarget(f) {
  const playerD = Math.hypot(P.x - f.x, P.y - f.y);
  /* A companion lingering near the throne must not permanently pin the boss
     there. Once Corin retreats across the hall, the king dragon commits to
     chasing him rather than idling beside its original target. */
  if (playerD > 128) return { x: P.x, y: P.y, d: playerD, dragon: false, pursuingCorin: true };
  if (dragonCombatHere() && dragon.on && !dragon.down) {
    const bodyY = dragon.y - 14;
    const dragonD = Math.hypot(dragon.x - f.x, bodyY - f.y);
    if ((typeof mounted !== "undefined" && mounted) || dragonD <= playerD * 1.15)
      return { x: dragon.x, y: bodyY, d: dragonD, dragon: true };
  }
  return { x: P.x, y: P.y, d: playerD, dragon: false };
}
function stepFoes(dt) {
  foeClock += dt;
  if (wakeCool > 0) wakeCool -= dt;
  live.length = 0;
  for (const f of foes) {
    f._thinking = f.st !== "dead" && thinks(f);
    if (f._thinking) live.push(f);
  }
  // Regular battle music begins when a hostile enemy/boss is actively engaged.
  // King music has priority and the battle track resumes only if combat remains afterward.
  const musicCombat = live.some(f => !f.ally && f.st !== "dead");
  /* Battle music intentionally disabled for now. Area music continues during combat. */
  turnT -= dt;
  if (foeCool > 0) foeCool -= dt;
  if (!turnHolder || turnHolder.st === "dead" || turnT <= 0) {
    let best = null, bd = 1e9;
    for (const f of live) {
      const t = targetFor(f);
      if (t.d < bd) { bd = t.d; best = f; }
    }
    turnHolder = best;
    turnT = 1.6;
  }
  if (lastFight && MAPID === "cinderhold") {
    for (const f of foes) {
      if (!(f.kind === "kdragon" || f.kind === "lich" || f.kind === "boneguard"))
        continue;
      const k2 = FOE[f.kind] || {};
      f.t += dt;
      if (f.hurt > 0) f.hurt -= dt;
      if (f.st === "dead") continue;
      if (f.hold > 0) {
        f.hold = Math.max(0, f.hold - dt); f.st = "idle";
        f.emerge = Math.max(0, Math.min(1, (1 - f.hold/(f.holdMax || 2.6) - 0.25)/0.7));
        continue;
      }
      if (f.emerge !== undefined && f.emerge < 1) f.emerge = 1;
      f.cool = (f.cool || 0) - dt;
      if (f.swordGuard > 0) f.swordGuard = Math.max(0, f.swordGuard - dt);
      if (f.kind === "kdragon" && f.chaseDelay > 0) {
        f.chaseDelay = Math.max(0, f.chaseDelay - dt); f.st = "idle";
        continue;
      }
      if (f.retreat > 0) {
        f.retreat = Math.max(0, f.retreat - dt);
        const rx=f.x-(f.retreatX === undefined ? P.x : f.retreatX);
        const ry=f.y-(f.retreatY === undefined ? P.y : f.retreatY);
        const rd=Math.hypot(rx,ry)||1, sp=Math.max(k2.speed||30,f.kind==="kdragon"?118:64)*dt*(f.glassRetreatBoost||1);
        const nx=f.x+rx/rd*sp, ny=f.y+ry/rd*sp;
        if(f.kind==="kdragon"){
          const clear=(x,y)=>!isSolid(x,y)&&!isSolid(x-30,y)&&!isSolid(x+30,y)&&!isSolid(x,y-34);
          const mx=clear(nx,f.y), my=clear(f.x,ny);
          if(mx)f.x=nx; if(my)f.y=ny;
          if(!mx&&!my)f.retreat=0;       /* never force the dragon through a wall */
          f.dir8=direction4(rx,ry,f.dir8);
        }
        else { if(!isSolid(nx,f.y))f.x=nx; if(!isSolid(f.x,ny))f.y=ny; }
        f.st="walk"; f.cool=Math.max(f.cool||0,.28);
        if (f.retreat <= 0) f.glassRetreatBoost = 1;
        if (f.retreat <= 0 && f.pressureCounter) {
          f.st="wind"; f.t=0; f.hitDone=0; f.cool=0; beginEnemyWindup(f);
        }
        continue;
      }
      const target = f.pressureCounter
        ? { x:P.x, y:P.y, d:Math.hypot(P.x-f.x,P.y-f.y), dragon:false, counter:true }
        : (f.kind === "kdragon" || f.kind === "lich") ? kingDragonTarget(f)
        : { x: P.x, y: P.y, d: Math.hypot(P.x - f.x, P.y - f.y), dragon: false };
      const dx = target.x - f.x, dy = target.y - f.y;
      const d = target.d || 1;
      f.onDragon = !!target.dragon;
      if(f.kind==="kdragon") f.dir8=direction4(dx,dy,f.dir8);
      if (Math.abs(dx) > Math.abs(dy)) {
        f.dir = "s";
        const TURN = 42;                 /* how far past it you must get */
        if (f.flip === undefined) f.flip = dx < 0;
        if (dx < -TURN) f.flip = true;
        else if (dx > TURN) f.flip = false;
      } else {
        f.dir = dy > 0 ? "d" : "u";
      }
      if (f.st === "wind" || f.st === "swing") {
        const sw = k2.swingT || 1.2;
        if (f.st === "wind" && f.t >= GLASS_TELEGRAPH_WINDOW) { f.st = "swing"; f.t = 0; f.hitDone = 0; }
        if (f.st === "swing") {
          if (!f.hitDone && f.t >= (k2.hitAt || 0.5)) {
            f.hitDone = 1;
            if ((f.kind === "kdragon" || f.kind === "lich") && k2.cast && d <= (k2.reach || 30) + 28) {
              const fd = f.dir8 || direction4(dx, dy, "s");
              const mouth = f.kind === "kdragon" ? kingDragonMouth(f, fd) : { x: f.x, y: f.y - 22 };
              const ax = target.x - mouth.x, ay = target.y - mouth.y;
              const ad = Math.hypot(ax, ay) || 1;
              bolts.push({ x: mouth.x, y: mouth.y, vx: ax / ad, vy: ay / ad,
                dir: fd === "n" ? "u" : fd === "s" ? "d" : fd, art: k2.cast, dmg: k2.dmg,
                sp: k2.boltSp || 220, life: 1.6, t: 0, targetDragon: !!target.dragon, unblockable: !!f.unblockableAttack });
              if (f.kind === "kdragon") f.chaseDelay = 0.35;
            } else if (d <= (k2.reach || 30) + 10) {
              if (target.dragon) {
                hurtDragon(k2.dmg || 2);
                dragonCombatPause = Math.max(dragonCombatPause, 0.42);
              }
              else if(!glassShieldDeflectFoe(f)) hurtPlayer(k2.dmg || 2);
            }
            if (f.kind === "kdragon" && f.pressureCounter) f.pressureCounter = false;
          }
          if (f.t >= sw) { finishGlassShieldParry(f); f.st = "idle"; f.t = 0; f.unblockableAttack = false; f.cool = Math.max(f.cool || 0,(k2.rest || 1) * .72); }
        }
        continue;
      }
      /* Reach is how far an attack can travel.  The king dragon must still
         cross the hall before it plants itself to attack. */
      const chaseRange = f.kind === "kdragon" ? 86 : (k2.reach || 30) * 0.8;
      if (d <= chaseRange && f.cool <= 0) {
        f.st = "wind"; f.t = 0; f.hitDone = 0; beginEnemyWindup(f);
        continue;
      }
      /* Projectile reach is not the king dragon's resting distance: it fires
         while closing, then keeps flying down the hall until it is nearby. */
      if (d > chaseRange) {
        const sp = (k2.speed || 30) * 1.10 * dt;
        const nx = f.x + (dx / d) * sp, ny = f.y + (dy / d) * sp;
        if (f.kind === "kdragon") { f.x = nx; f.y = ny; }
        else {
          if (!isSolid(nx, f.y)) f.x = nx;
          if (!isSolid(f.x, ny)) f.y = ny;
        }
        f.st = "walk";
      } else if (f.st !== "walk") f.st = "idle";
    }
  }
  for (const f of foes) {
    const k = FOE[f.kind];
    if (lastFight && MAPID === "cinderhold" &&
        (f.kind === "kdragon" || f.kind === "lich" || f.kind === "boneguard")) continue;
    f.t += dt;
    if(f.reverseRise>0){f.reverseRise=Math.max(0,f.reverseRise-dt);f.emerge=1;continue;}
    if (f.hold > 0) {
      f.hold -= dt;
      f.st = "idle";
      const total = f.holdMax || 2.6;
      const done = 1 - f.hold / total;
      f.emerge = Math.max(0, Math.min(1, (done - 0.34) / 0.60));
      continue;
    }
    if (f.emerge !== undefined && f.emerge < 1) f.emerge = 1;
    if (f.st !== "dead" && !f._thinking) continue;
    if (f.hurt > 0) f.hurt -= dt;
    if (f.mad > 0) f.mad -= dt;
    if (f.st === "dead") continue;
    if (f.kind === "kdragon" || (lastFight === 2 &&
        (f.kind === "lich" || f.kind === "boneguard"))) {
      f.hx = P.x; f.hy = P.y; f.ring = 0;
    }
    if (f.trial) { f.hx = P.x; f.hy = P.y; f.ring = 0; }
    if (f.ally) {
      f.hx = P.x; f.hy = P.y; f.ring = 0;
      const gap = Math.hypot(f.x - P.x, f.y - P.y);
      if (gap > 420) {
        const side = (f.slot % 2) ? -1 : 1;
        for (const [ox, oy] of [[side * 22, 52], [side * 26, 40],
                                [-side * 22, 52], [0, 58], [0, -58]]) {
          if (!isSolid(P.x + ox, P.y + oy)) {
            f.x = P.x + ox; f.y = P.y + oy;
            f.st = "walk"; f.going = false;
            break;
          }
        }
      }
    }
    const hx = f.hx === undefined ? f.x : f.hx;
    const hy = f.hy === undefined ? f.y : f.hy;
    if (f.ring === undefined) {
      f.ring = 0;
      for (const a of features) {
        if (a.kind !== "arena") continue;
        if (Math.hypot(hx / TS - a.x, hy / TS - a.y) <= a.r + 2) {
          f.ring = (a.r - 1) * TS;
          f.cx = a.x * TS + TS / 2; f.cy = a.y * TS + TS / 2;
          break;
        }
      }
    }
    const LEASH = f.ally ? 170 : (f.ring ? f.ring : 88);
    const away = Math.hypot(f.x - hx, f.y - hy);
    if (f.ally) f.going = false;
    else if (bell) f.going = false;       /* the bell is worth leaving home for */
    else if (away > LEASH) f.going = true;
    else if (away < LEASH * 0.35) f.going = false;
    if (f.retreat > 0) f.retreat = Math.max(0, f.retreat - dt);
    else if (f.glassRetreatBoost) f.glassRetreatBoost = 0;
    const retreating = !f.ally && f.retreat > 0;
    const rdx = f.x - (f.retreatX === undefined ? P.x : f.retreatX);
    const rdy = f.y - (f.retreatY === undefined ? P.y : f.retreatY);
    const rd = Math.hypot(rdx, rdy) || 1;
    const retreatTgt = { x:f.x + rdx / rd * 68, y:f.y + rdy / rd * 68,
      d:68, isPlayer:false, retreat:true };
    const tgt = retreating ? retreatTgt
      : f.going ? { x: hx, y: hy, d: away, isPlayer: true, home: 1 }
      : targetFor(f);
    f.onDragon = !tgt.isPlayer;
    const dx = tgt.x - f.x, dy = tgt.y - f.y, d = tgt.d;
    if(f.kind==="kdragon") f.dir8=direction4(dx,dy,f.dir8);
    const faceX = retreating && regularFoe(f) ? -dx : dx;
    const faceY = retreating && regularFoe(f) ? -dy : dy;
    if (Math.abs(faceX) > Math.abs(faceY)) { f.dir = "s"; f.flip = faceX < 0; }
    else f.dir = faceY > 0 ? "d" : "u";
    const myTurn = (f === turnHolder);
    const want = k.standoff ? k.standoff : (myTurn ? k.reach - 4 : k.ring);
    f.slot = (f.slot === undefined) ? foes.indexOf(f) : f.slot;
    const nLive = live.length || 1;
    const ang = (f.slot / nLive) * 6.2832 + f.t * 0.2;
    const orbit = !(f.ally && tgt.follow) && !(f.mad > 0 && tgt.foe) && !tgt.toBell;
    const sx = (myTurn || !orbit) ? 0 : Math.cos(ang) * want;
    const sy = (myTurn || !orbit) ? 0 : Math.sin(ang) * want;
    if (f.st === "idle") {
      if (f.ally || f.mad > 0 || tgt.toBell || d < k.sight) { f.st = "walk"; f.t = 0; }
    } else if (f.st === "walk") {
      if (!f.ally && !(f.mad > 0) && !tgt.toBell && d > k.sight * 1.5) { f.st = "idle"; f.t = 0; }
      else if (!tgt.retreat && !f.going && !tgt.toBell && d < k.reach &&
               (!P.act || (regularFoe(f) && P.act.kind === "swing")) &&
               ((f.ally || f.mad > 0) ? !tgt.follow : (myTurn && foeCool <= 0)) &&
               facing(f, tgt)) {
        f.st = "wind"; f.t = 0; beginEnemyWindup(f);
      }
      else {
        let tx = tgt.x + sx, ty = tgt.y + sy;
        let rx = tx - f.x, ry = ty - f.y, rd = Math.hypot(rx, ry);
        let stop = myTurn ? want : 6;
        if (f.mad > 0 && tgt.foe) stop = Math.max(6, k.reach - 6);
        if (tgt.toBell) stop = 14;          /* they crowd round it */
        if (f.ally && tgt.follow) stop = 34;     /* they hold well off him */
        if (k.standoff && d < k.standoff - 12) {
          rx = f.x - tgt.x; ry = f.y - tgt.y;
          rd = Math.hypot(rx, ry) || 1; stop = 0;
        }
        if (rd > stop) {
          let sp = k.speed * ((myTurn || (f.ally && tgt.foe) || (f.mad > 0 && tgt.foe)) ? 1 : 0.90);
          if (tgt.retreat) sp *= (regularFoe(f) ? 1.1 : 1.65) * (f.glassRetreatBoost || 1);
          if (f.ally) sp = Math.max(sp, 150 + Math.min(120, rd * 1.2));
          const nx = f.x + (rx / rd) * sp * dt, ny = f.y + (ry / rd) * sp * dt;
          if (f.halfW === undefined) {
            const a = SPR[(FOE_ART[f.kind] || "sk") + "_idle_d"];
            f.halfW = a ? Math.max(6, Math.min(15, Math.round(a[2] * 0.22))) : 7;
          }
          const halfW = f.halfW;
          if (f.buf === undefined) {
            const a = SPR[(FOE_ART[f.kind] || "sk") + "_idle_d"];
            f.buf = a ? Math.min(2, Math.max(1, Math.round(a[3] / TS / 2))) : 1;
          }
          const legal = (X, Y, b) => {
            if (isSolid(X - halfW, Y) || isSolid(X, Y) || isSolid(X + halfW, Y)) return false;
            for (let t = 1; t <= b; t++)
              if (isSolid(X - halfW, Y - t * TS) || isSolid(X, Y - t * TS) ||
                  isSolid(X + halfW, Y - t * TS)) return false;
            return true;
          };
          let freeX = true, freeY = true;
          if (!f.ally) {
            // Full footprint checks are the costliest part of a crowded fight.
            // Stagger them across alternate frames; the cheap centre check on
            // the in-between frame still prevents crossing a new wall.
            const fullNav = ((Math.floor(foeClock * 60) + (f.slot || 0)) & 1) === 0 ||
                            f._navFreeX === undefined;
            if (fullNav) {
              const stuck = !legal(f.x, f.y, f.buf);
              const clear = (X, Y) => stuck ? !isSolid(X, Y) : legal(X, Y, f.buf);
              f._navFreeX = clear(nx, f.y);
              f._navFreeY = clear(f.x, ny);
            }
            freeX = f._navFreeX && !isSolid(nx, f.y);
            freeY = f._navFreeY && !isSolid(f.x, ny);
          }
          if (freeX) f.x = nx;
          if (freeY) f.y = ny;
          if (f.ally) {
            for (const q of foes) {
              if (q === f || !q.ally || q.st === "dead") continue;
              const ox2 = f.x - q.x, oy2 = f.y - q.y;
              const od2 = Math.hypot(ox2, oy2);
              if (od2 > 0.01 && od2 < 22) {
                const push = (22 - od2) * 0.5;
                const px2 = f.x + (ox2 / od2) * push;
                const py2 = f.y + (oy2 / od2) * push;
                if (!isSolid(px2, py2)) { f.x = px2; f.y = py2; }
              }
            }
          }
          if (f.ring) {
            const cx = f.cx === undefined ? hx : f.cx;
            const cy = f.cy === undefined ? hy : f.cy;
            const ox = f.x - cx, oy = f.y - cy, od = Math.hypot(ox, oy);
            if (od > f.ring) {
              const bx = cx + (ox / od) * f.ring, by = cy + (oy / od) * f.ring;
              if (!isSolid(bx, by)) { f.x = bx; f.y = by; }
            }
          }
        }
      }
    } else if (f.st === "wind") {
      if (f.t > k.wind) { f.st = "swing"; f.t = 0; f.hit = 0; }
    } else if (f.st === "swing") {
      if (!f.hit && f.t > k.hitAt) {
        f.hit = 1;
        foeCool = k.groupRest * .72;
        if (!facing(f, tgt)) { /* the moment is lost */ }
        else if (k.cast) {
          const ax = tgt.x - f.x, ay = (tgt.y - 6) - (f.y - 22);
          const ad = Math.hypot(ax, ay) || 1;
          const dd = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? "w" : "e")
                                                 : (ay < 0 ? "u" : "d");
          bolts.push({ x: f.x, y: f.y - 22, vx: ax / ad, vy: ay / ad,
                       dir: dd, art: k.cast, dmg: k.dmg,
                       sp: k.boltSp || 150, life: 2.6, t: 0,
                       targetDragon: !!tgt.isDragon, unblockable: !!f.unblockableAttack });
        } else if (d < k.reach + 8 && tgt.isPlayer) { if(!glassShieldDeflectFoe(f)) hurtPlayer(k.dmg); }
        else if (d < k.reach + 8 && tgt.isDragon) hurtDragon(k.dmg);
        else if (d < k.reach + 8 && (f.ally || f.mad > 0) && tgt.foe && tgt.foe.st !== "dead") {
          tgt.foe.hp -= k.dmg * (f.mad > 0 ? 2 : 1); tgt.foe.hurt = 0.25;
          if (tgt.foe.hp <= 0) { tgt.foe.st = "dead"; tgt.foe.t = 0; markBossGone(tgt.foe); }
        }
      }
      if (f.t > k.swingT + (f.mad > 0 ? k.rest * 0.25 : k.rest * .80)) {
        finishGlassShieldParry(f);
        f.st = "walk"; f.t = 0; f.unblockableAttack = false;
        if (myTurn) turnT = 0;
      }
    }
  }
}
let pHp = 6, pMax = 6, pInv = 0;
function inFight() { return foes.some(f => f.st !== "dead" && Math.hypot(f.x - P.x, f.y - P.y) < 200); }
let devSafe = false;
let dragonOff = false;
let devDragonPassive = false;
function hurtPlayer(n) {
  if (foesHeld) return;
  if (devSafe) return;        /* invincible while the dev panel is open */
  if (saintT > 0) return;     /* Saint's Breath: nothing lands at all */
  if (mounted && dragonHere() && !dragon.down) {
    hurtDragon(n);
    return;
  }
  if (pInv > 0) return;
  if (worn.twin && !twinSpent && arenaLock && dragonHere() && !dragon.down) {
    twinSpent = true;
    pInv = 1.1;
    hurtDragon(1);
    toast("the dragon takes it");
    return;
  }
  if (smithUpgrade && !mounted) n = Math.max(1, n - 1);
  if (worn.ward) {
    wardCarry += n * 0.25;
    while (wardCarry >= 1 && n > 0) { n -= 1; wardCarry -= 1; }
  }
  if (n <= 0) { pInv = 1.1; return; }
  pHp = Math.max(0, pHp - n);
  pInv = 1.1;
  if (pHp <= 0) { P.act = { kind: "die", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4() }; return; }
  P.act = { kind: "hurt", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4() };
}
let wardCarry = 0;
function dying() { return !!(P.act && P.act.kind === "die"); }
let safeSpot = null, deadShown = false;
function markSafe() {
  if (dying() || arenaLock || scene || fadeDir !== 0) return;
  if (foes.some(f => !f.ally && f.st !== "dead" &&
                     Math.hypot(f.x - P.x, f.y - P.y) < 180)) return;
  safeSpot = { map: MAPID, x: P.x, y: P.y };
}
function showDeath() {
  if (deadShown) return;
  deadShown = true;
  const lost = Math.floor(gold * 0.3);
  const el = document.getElementById("dead");
  const why = document.getElementById("deadWhy");
  if (why) why.textContent = lost > 0 ? "He loses " + lost + " gold." : "";
  if (!el) return;
  el.style.display = "flex";
  el.style.opacity = "0";
  requestAnimationFrame(() => { el.style.opacity = "1"; });
}
function getUp() {
  const el = document.getElementById("dead");
  standUp();
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => { el.style.display = "none"; }, 760);
}
let standing = false;
function standUp() {
  if (trial) stopTrial("");
  if (standing) return;        /* one press is enough, even during the fade */
  standing = true;
  setTimeout(() => { standing = false; }, 900);
  deadShown = false;
  const lost = Math.floor(gold * 0.3);
  gold = Math.max(0, gold - lost);
  if (lost > 0) dropped = { gold: lost };   /* a marker can fetch it back */
  pHp = pMax;
  recoverStrandedDragon();
  pInv = 2.2;
  P.act = null;
  try { releaseArena(); } catch (e) { /* no ring open */ }
  foes = foes.filter(f => f.ally);
  const to = safeSpot || { map: "world", x: P.x, y: P.y };
  if (to.map !== MAPID) { loadMap(to.map, true); buildGround(); }
  P.x = to.x; P.y = to.y;
  recoverTempleArrival(!!W.maps[to.map]?.templeLegacy);
  spawnFoes();
  rebuildBuckets();
  cam.x = P.x - VW / cam.z / 2;
  cam.y = P.y - VH / cam.z / 2;
  clampCam();
  toast("he gets up");
}
function blockReason(px, py) {
  if(px<0||py<0||px>=MW*TS||py>=MH*TS)return "edge";
  const override=collisionOverride(px,py);if(override!==undefined)return override?"custom":null;
  if(blockedByNpcBody(px,py)||blockedByNpcBuffer(px,py))return "npc";
  if(MD.roomBlocks?.some(r=>px>=r[0]&&px<r[2]&&py>=r[1]&&py<r[3]))return "furniture";
  if(MAPID==="glasshouse"&&glassHatchFrame()<3&&px>=48&&px<88&&py>=104&&py<118)return "counter";
  if(MAPID==="witchmoor"&&wonAll&&px>=184&&px<213&&py>=282&&py<311)return "story";
  if(blockedByTrialPedestal(px,py))return "story";
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= MW || y >= MH) return "edge";
  if (solid[y * MW + x] === 1) {
    if (terr[y * MW + x] === WALL) return "terr";
    if (typeof baseTerr !== "undefined" && baseTerr && baseTerr[y * MW + x] === WALL) return "base";
    return "solid";     /* set by rebuildSolid from something else */
  }
  if (!arenaPass && arenaLock && arenaT > 0.25 &&
      Math.hypot(x - arenaLock.x, y - arenaLock.y) > arenaLock.r + 0.5) return "arena";
  if (x <= 80) {
    if (northShut() && MAPID === "world" && y <= gateRow && y >= gateRow - 5) return "gate";
    if (eggGate >= 0 && quest === Q.CARRY && MAPID === "world" &&
        y >= eggGate && y <= eggGate + 5) return "gate";
    if (quest === Q.FLED && MAPID === "world" && fieldGate >= 0 &&
        y >= fieldGate && y <= fieldGate + 5) return "gate";
  }
  if (fenceAt && fenceAt.has(y * MW + x)) return "fence";
  if (blockedByGuard(x, y)) return "guard";
  if (odoShuts(x, y)) return "odo";
  if (blockedByItem(x, y)) return "item";
  if (blockedByHerd(x, y)) return "herd";
  return null;
}
const REASON_COLOUR = {
  custom:"rgba(240,70,30,0.45)",npc:"rgba(255,230,0,0.4)",furniture:"rgba(255,0,180,0.4)",counter:"rgba(30,210,255,0.4)",story:"rgba(170,70,240,0.4)",
  terr:  "rgba(200,30,30,0.34)",    base: "rgba(230,90,20,0.34)",
  solid: "rgba(255,0,140,0.34)",    arena:"rgba(255,160,0,0.34)",
  gate:  "rgba(120,0,255,0.34)",    fence:"rgba(0,180,255,0.34)",
  guard: "rgba(255,255,0,0.34)",    odo:  "rgba(255,255,0,0.34)",
  item:  "rgba(255,120,255,0.34)",  herd: "rgba(0,255,200,0.34)",
  edge:  "rgba(90,90,90,0.34)"
};

const HT = 8;
function drawCollide() {
  if (!collideView || !solid) return;
  const vw = VW / cam.z, vh = VH / cam.z;
  ctx.save();
  ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
  const hx0 = Math.max(0, Math.floor(cam.x / HT)), hx1 = Math.floor((cam.x + vw) / HT);
  const hy0 = Math.max(0, Math.floor(cam.y / HT)), hy1 = Math.floor((cam.y + vh) / HT);
  for (let hy = hy0; hy <= hy1; hy++) for (let hx = hx0; hx <= hx1; hx++) {
    const px = hx * HT + HT / 2, py = hy * HT + HT / 2;
    if (px >= MW * TS || py >= MH * TS) continue;
    const why = blockReason(px, py);
    const marked = badTiles[hx + "," + hy];
    ctx.fillStyle = marked ? "rgba(255,255,255,0.75)"
                  : why ? (REASON_COLOUR[why] || "rgba(200,30,30,0.34)")
                        : "rgba(40,220,90,0.13)";
    ctx.fillRect(hx * HT, hy * HT, HT - 1, HT - 1);
  }
  // Exact outlines retain narrow blockers that a half-tile sample can miss.
  ctx.lineWidth=1/cam.z;ctx.strokeStyle='#ff58cc';
  for(const r of MD.roomBlocks||[])ctx.strokeRect(r[0],r[1],r[2]-r[0],r[3]-r[1]);
  ctx.strokeStyle='#ffe85c';
  for(const n of npcs){if(!npcHere(n)||n.goto||n.leaving)continue;ctx.strokeRect(n.x-7,n.y-8,14,8);ctx.strokeRect(n.x-TS/2,n.y,TS,TS/2);}
  ctx.restore();

}

function collideTap(clientX,clientY){if(!collideView||geometryPan)return false;paintCollision(clientX,clientY);return true;}

const dragonVitalGradients = new Map();
function drawDragonVitals(x, y, width) {
  syncDragonVitality(false);
  const h = 44, pad = 5, fw = 34, fh = 34;
  const meterX = x + pad + fw + 7, meterY = y + 20;
  const meterW = Math.max(92, width - (pad + fw + 7) - pad), meterH = 10;
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.fillStyle = "#0b0e15";
  const r = 6;
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+width-r,y);
  ctx.quadraticCurveTo(x+width,y,x+width,y+r); ctx.lineTo(x+width,y+h-r);
  ctx.quadraticCurveTo(x+width,y+h,x+width-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.fill();
  ctx.globalAlpha = 0.85; ctx.strokeStyle = dragon.down ? "#8d5d5d" : "#5a6377"; ctx.stroke();
  const face = SPR["dr5_idle_s"];
  if (face) {
    ctx.globalAlpha = dragon.down ? 0.55 : 1;
    ctx.save(); ctx.beginPath(); ctx.arc(x+pad+fw/2,y+pad+fh/2,fw/2,0,Math.PI*2); ctx.clip();
    const cropW = Math.min(face[2], 34), cropH = Math.min(face[3], 34);
    const sx = face[0] + Math.floor((face[2]-cropW)/2);
    const sy = face[1] + Math.max(0, Math.floor(face[3]*0.18));
    const k = Math.max(fw/cropW, fh/cropH);
    drawGameImage(ctx, sheetOf(face), sx, sy, cropW, cropH,
      x+pad+(fw-cropW*k)/2, y+pad+(fh-cropH*k)/2, cropW*k, cropH*k);
    ctx.restore();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = dragon.down ? "#9d6868" : "#8a93a8";
    ctx.beginPath(); ctx.arc(x+pad+fw/2,y+pad+fh/2,fw/2,0,Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.font = "bold 9px monospace"; ctx.textBaseline = "middle";
  ctx.fillStyle = dragon.down ? "#d88b83" : "#d9e3d2";
  ctx.fillText(dragon.down ? "DRAGON — HURT" : "DRAGON", meterX, y + 12);
  ctx.fillStyle = "#25191a"; ctx.fillRect(meterX, meterY, meterW, meterH);
  const ratio = dragon.maxHp ? dragon.hp / dragon.maxHp : 0;
  const gradKey = meterX + ":" + meterW;
  let grad = dragonVitalGradients.get(gradKey);
  if (!grad) {
    grad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
    grad.addColorStop(0, "#9d2f2f"); grad.addColorStop(1, "#e88343");
    dragonVitalGradients.set(gradKey, grad);
  }
  ctx.fillStyle = grad; ctx.fillRect(meterX, meterY, Math.round(meterW * ratio), meterH);
  ctx.strokeStyle = "#d3a176"; ctx.strokeRect(meterX + 0.5, meterY + 0.5, meterW - 1, meterH - 1);
  ctx.font = "bold 8px monospace";
  ctx.fillStyle = "#f3eadb";
  ctx.fillText(dragon.hp + "/" + dragon.maxHp, meterX + 3, meterY + meterH / 2 + 0.5);
  if (dragon.down) {
    ctx.font = "7px monospace"; ctx.fillStyle = "#e79b91";
    ctx.fillText("FEED TO REVIVE", meterX, y + 37);
  }
  ctx.restore();
}

function hudTopInset() {
  const full = document.fullscreenElement || document.webkitFullscreenElement ||
    document.body.classList.contains("pseudoFullscreen");
  const touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  let embedded = false;
  try { embedded = window.top !== window.self; } catch (e) { embedded = true; }
  /* Only the ChatGPT embedded frame paints chrome over the game viewport.
     Normal iPhone browsers have a real visual viewport and need the HUD high. */
  return touch && embedded && !full ? Math.max(92, Math.round(VH * 0.14)) : 8;
}
function drawKingDragonHeadVitals(king, spriteX, spriteY, spriteW) {
  const maxHp = enemyMaxHp(king.kind, Number.isFinite(king.hx) ? king.hx : king.x);
  const width = Math.max(54, Math.min(76, Math.round(spriteW * 0.42)));
  /* The new king art has empty pixels above the crown. Keep this directly
     against the visible head instead of floating in that transparent space. */
  const height = 8, x = Math.round(king.x - width / 2), y = Math.round(spriteY + 3);
  const meterX = x + 2, meterY = y + 2, meterW = width - 4, meterH = 4;
  ctx.save();
  ctx.globalAlpha = 0.94; ctx.fillStyle = "#08050e";
  ctx.fillRect(x, y, width, height);
  ctx.globalAlpha = 1; ctx.strokeStyle = "#b46ee8"; ctx.lineWidth = 1;
  ctx.strokeRect(x + .5, y + .5, width - 1, height - 1);
  ctx.fillStyle = "#1b1029"; ctx.fillRect(meterX, meterY, meterW, meterH);
  const ratio = Math.max(0, Math.min(1, king.hp / maxHp));
  const grad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
  grad.addColorStop(0, "#4c2370"); grad.addColorStop(0.55, "#8e42c7"); grad.addColorStop(1, "#d48aff");
  ctx.fillStyle = grad; ctx.fillRect(meterX, meterY, Math.max(1, Math.round(meterW * ratio)), meterH);
  ctx.fillStyle = "rgba(255,255,255,.32)"; ctx.fillRect(meterX, meterY, Math.max(1, Math.round(meterW * ratio)), 1);
  ctx.restore();
}

