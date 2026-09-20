const BRAMBLE_HINTS={"Orin":["Rowan left his dog out here and took himself to the Copper Cup. That tells you which of them has manners."],"Mella":["Bramble has stayed clear of my hives. Rowan should reward him; try the tavern north of here."],"Sennet":["I saved a scrap for that dog, but his hunter is eating at the Copper Cup. You could take Bramble up there."],"Ada":["Rowan is in the northern tavern while his poor dog follows strangers. Go fetch the man before I do."],"Linnet":["One hunter entered the Copper Cup; no dog followed him in. Your travelling companion balances that tally."],"Garrow":["Saw Rowan go north to the tavern from this very bench. Bramble evidently chose the scenic route."],"Wren":["That dog is looking for a familiar voice. Rowan's will be coming from the Copper Cup, I expect."],"Berta":["I would stock dog biscuits if Rowan stopped leaving Bramble behind. His owner is at the northern tavern."],"Merrin":["Rowan went past my table toward the Copper Cup. Bramble missed him by a few minutes."],"Asta":["I sketched that dog this morning. His hunter went into the tavern before I could finish the ears."],"Colm":["Rowan had the sensible idea of eating at the Copper Cup. Take Bramble there before my supper interests him."],"Bren":["You want a hunter, not a librarian, for this mystery. Rowan is at the Copper Cup in north Thornwell."],"Della":["Bramble knows a kind face when he sees one. His owner is enjoying the northern tavern; reunite them there."],"Ewan":["This resembles a tale where the dog chooses the hero. The less dramatic ending is Rowan at the Copper Cup."],"Osric":["A missing hunter sounds like an adventure I can solve from home: try Thornwell's northern tavern."],"Alder":["I saw Bramble sniffing by the orchard. Rowan had already headed north for a drink at the Copper Cup."],"Gwyneth":["That is Rowan's dog. Take him to the tavern and tell his owner to mind his companion as carefully as his boots."],"Archivist Elowen":["Rowan is taking his refreshment at the Copper Cup north of the school. Bramble is not one of our pupils."],"Mira":["Bramble belongs to Rowan. I passed the hunter on my way from the tavern; he was settling in, not leaving."],"Oren":["No graveyard mystery this time. Rowan is alive and comfortable at the Copper Cup, waiting for that dog."],"Tessa":["The hunter heard our music and went into the Copper Cup. Bramble seems to have followed a different tune."],"Master Iven":["A small geography exercise: north through Thornwell, then into the Copper Cup. That is where Rowan went."],"Bram":["You will find Rowan among the tavern tables, not out exploring temples. Bramble can lead the conversation."],"Nell":["Rowan is at the northern tavern. At least somebody missing today has only gone for a drink."],"Sable":["I can confirm one account without consulting a book: Rowan went into the Copper Cup without his dog."],"Pella":["The journey you need is shorter than anything on my globe. Take Bramble north to the town tavern."],"Bess":["Rowan is here. Bring Bramble to him before those paws make a tour of every table."],"Ronan":["I poured Rowan a cider a little while ago. His dog has arrived before he has finished it."],"Venn":["For once I can deliver directions without crossing a border. Rowan is right here in the Copper Cup."],"Hobb":["That dog belongs to the hunter. The hunter belongs to a chair in this tavern, for the moment."],"Edric":["Rowan is taking his evening here. Walk Bramble over to him and spare us a search party tomorrow."],"Dorr":["...Rowan. In here. Ask the dog which one. Let me sleep."],"Ser Anwen":["The hunter is inside this tavern, Corin. No need to question the entire town on his dog's behalf."],"Grusk":["Rowan is here, but he is not in our game. Bramble would probably play more honestly than Dain."],"Fen":["The hunter has been sitting in here through the music. Bring his dog over before someone invites it to dance."],"Tobin":["You found the person Rowan was waiting for. Well, the dog. His owner is already inside the Copper Cup."],"Senn":["I would wager Bramble finds Rowan in this very room. Finally, odds I like."],"Dain":["A copper says that is Rowan's dog. No? Very well, the hunter is here and you can ask him for free."],"Rusk":["Rowan came into the tavern instead of taking the pass. Wise choice. Take Bramble to him."],"Pip":["Bramble's footsteps have been circling outside. Rowan is in this tavern; I heard him come in."],"Vale":["If that dog is seeking the hunter, Rowan is here. Kindly do not make my hat part of the search."],"Cerys":["Rowan has been watching the room instead of our cards. I think he has noticed his dog is missing."],"Nyra":["The hunter is here, and neither of his hands is hiding cards. You want Rowan, not our table."],"Maren":["Rowan chose the Copper Cup over the docks today. Take his dog to the tavern north of the square."],"Celia":["I heard Rowan asking about supper at the Copper Cup. His dog seems to be asking you about Rowan."]};
function individualizeDialogue() {
  const fields=["d","d2","dm","dd","dd2","dv","dv2","dragonNear","dragonRumor","dragonRumor2"];
  const owners=new Map();
  const body=s=>s.replace(/^[^:]{1,21}: /,"").trim();
  for(const m of Object.values(W.maps))for(const n of m.npcs||[])
    for(const k of fields)for(const s of Array.isArray(n[k])?n[k]:[]) {
      if(s.startsWith("Corin: "))continue;
      const line=body(s);if(!owners.has(line))owners.set(line,new Set());owners.get(line).add(n.n);
    }
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]) {
    const p=NPC_VOICES[n.n];if(!p)continue;
    const b=NPC_BASE_LINES[n.n];
    if(b){n.d=b.slice(0,2);n.d2=[b[2]||p[2]];}
    n.dragonNear=[p[0]];n.dragonRumor=[p[1]];n.dragonRumor2=[p[2]];
    // Keep individually written story exchanges; replace shared victory filler.
    for(const k of ["dv","dv2"]) {
      const old=Array.isArray(n[k])?n[k]:[];
      n[k]=old.some(s=>(owners.get(body(s))?.size||0)>1)||!old.length?[p[3]]:old;
    }
    if(n.dd2 && JSON.stringify(n.dd2)===JSON.stringify(n.dd))n.dd2=[p[0]];
    for(const k of fields)if(Array.isArray(n[k])) {
      const used=new Set();n[k]=n[k].map(s=>s.replace("Fifty-five.","Fifty gold.").replace("A hundred and twenty.","A hundred gold.")).filter(s=>{
        const v=body(s);if(used.has(v))return false;used.add(v);return true;
      });
    }
  }
}

const ROYAL_DATA = {"maps":{"royal_vestibule":{"w":22,"h":11,"ts":16,"terr":"6.89|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.23","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[176,144],"title":"Cinderhold \u2014 Entrance Hall","doors":[{"x":1.5,"y":9.25,"to":"royal_westhall","tx":19.0,"ty":6.25,"dir":"d","explicitDir":true,"triggerRect":{"x":24,"y":148,"w":32,"h":12},"stairDown":true},{"x":18.5,"y":9.25,"to":"royal_easthall","tx":2.0,"ty":6.25,"dir":"d","explicitDir":true,"triggerRect":{"x":296,"y":148,"w":32,"h":12},"stairDown":true},{"x":10.0,"y":10.0,"to":"world","tx":3374,"ty":302,"dir":"d","explicitDir":true,"triggerRect":{"x":160,"y":160,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_vestibule","roomBlocks":[[100,70,124,89],[228,70,252,89]],"roomActors":[{"spr":"royal_fountain","x":112,"y":88,"schoolArt":true},{"spr":"royal_fountain","x":240,"y":88,"schoolArt":true},{"spr":"royal_stairs_left","x":40,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_westhall","editKey":"castle-stair-south:royal_westhall"},{"spr":"royal_stairs_right","x":312,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_easthall","editKey":"castle-stair-south:royal_easthall"}],"foes":[],"royal":true,"travel":1,"hidden":[],"house_rows":[],"travel_kind":"Castle"},"royal_westhall":{"w":22,"h":11,"ts":16,"terr":"6.89|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.23","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[176,144],"title":"West Gallery","doors":[{"x":18.5,"y":9.25,"to":"royal_vestibule","tx":2.0,"ty":6.25,"dir":"d","explicitDir":true,"triggerRect":{"x":296,"y":148,"w":32,"h":12},"stairDown":true},{"x":10.0,"y":3.0,"to":"royal_banquet","tx":6.5,"ty":12,"dir":"u","explicitDir":true,"triggerRect":{"x":160,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_westhall","roomBlocks":[],"roomActors":[{"spr":"royal_door","x":176.0,"y":64,"schoolArt":true,"royalDoor":true},{"spr":"royal_stairs_right","x":312,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_vestibule","editKey":"castle-stair-south:royal_vestibule"}],"foes":[{"k":"royalguard","x":8,"y":6},{"k":"royalguard","x":13,"y":6}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_easthall":{"w":22,"h":11,"ts":16,"terr":"6.89|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.23","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[176,144],"title":"East Gallery","doors":[{"x":1.5,"y":9.25,"to":"royal_vestibule","tx":19.0,"ty":6.25,"dir":"d","explicitDir":true,"triggerRect":{"x":24,"y":148,"w":32,"h":12},"stairDown":true},{"x":10.0,"y":3.0,"to":"royal_armory","tx":6.5,"ty":10.0,"dir":"u","explicitDir":true,"triggerRect":{"x":160,"y":48,"w":32,"h":16},"stairDown":false},{"x":18.5,"y":9.25,"to":"royal_guardroom","tx":2.0,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":296,"y":148,"w":32,"h":12},"stairDown":true}],"bg":"#2b2528","roomArt":"royal_room_easthall","roomBlocks":[],"roomActors":[{"spr":"royal_door","x":176.0,"y":64,"schoolArt":true,"royalDoor":true},{"spr":"royal_stairs_left","x":40,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_vestibule","editKey":"castle-stair-south:royal_vestibule"},{"spr":"royal_stairs_right","x":312,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_guardroom","editKey":"castle-stair-south:royal_guardroom"}],"foes":[{"k":"royalguard","x":8,"y":6},{"k":"royalguard","x":13,"y":6}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_banquet":{"w":14,"h":15,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[112,208],"title":"Royal Banquet Hall","doors":[{"x":6.0,"y":14,"to":"royal_westhall","tx":10.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":96,"y":224,"w":32,"h":16},"stairDown":false},{"x":6.0,"y":3.0,"to":"royal_upperhall","tx":10.5,"ty":8.0,"dir":"u","explicitDir":true,"triggerRect":{"x":96,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_banquet","roomBlocks":[[43,122,181,160]],"roomActors":[{"spr":"royal_door","x":112.0,"y":64,"schoolArt":true,"royalDoor":true}],"foes":[{"k":"royalguard","x":2.5,"y":10},{"k":"royalguard","x":10.5,"y":10}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_armory":{"w":14,"h":13,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[112,176],"title":"Royal Armory","doors":[{"x":6.0,"y":12.0,"to":"royal_easthall","tx":10.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":96,"y":192,"w":32,"h":16},"stairDown":false},{"x":6.0,"y":3.0,"to":"royal_upperhall","tx":19.0,"ty":6.25,"dir":"u","explicitDir":true,"triggerRect":{"x":96,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_armory","roomBlocks":[[22,66,55,82],[22,106,55,122],[22,154,55,170],[162,66,195,82],[162,106,195,122],[162,154,195,170]],"roomActors":[{"spr":"royal_door","x":112.0,"y":64,"schoolArt":true,"royalDoor":true}],"foes":[{"k":"royalguard","x":5,"y":10},{"k":"royalguard","x":8,"y":10}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_guardroom":{"w":14,"h":13,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[64,176],"title":"Guard Quarters","doors":[{"x":1.5,"y":3.0,"to":"royal_easthall","tx":19.0,"ty":6.25,"dir":"u","explicitDir":true,"triggerRect":{"x":24,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_guardroom","roomBlocks":[[116,65,140,92],[116,105,140,132],[116,145,140,172],[180,65,204,92],[180,105,204,132],[180,145,204,172]],"roomActors":[{"spr":"ibed0","x":128,"y":92,"schoolArt":true,"stillFrame":0},{"spr":"ibed0","x":128,"y":132,"schoolArt":true,"stillFrame":0},{"spr":"ibed0","x":128,"y":172,"schoolArt":true,"stillFrame":0},{"spr":"ibed0","x":192,"y":92,"schoolArt":true,"stillFrame":0},{"spr":"ibed0","x":192,"y":132,"schoolArt":true,"stillFrame":0},{"spr":"ibed0","x":192,"y":172,"schoolArt":true,"stillFrame":0},{"spr":"royal_door","x":40.0,"y":64,"schoolArt":true,"royalDoor":true}],"foes":[{"k":"royalguard","x":2.5,"y":7},{"k":"royalguard","x":4.5,"y":10}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_upperhall":{"w":22,"h":11,"ts":16,"terr":"6.89|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.23","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[176,144],"title":"Upper Gallery","doors":[{"x":10.0,"y":10.0,"to":"royal_banquet","tx":6.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":160,"y":160,"w":32,"h":16},"stairDown":false},{"x":18.5,"y":9.25,"to":"royal_armory","tx":6.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":296,"y":148,"w":32,"h":12},"stairDown":true},{"x":1.5,"y":9.25,"to":"royal_salon","tx":11.0,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":24,"y":148,"w":32,"h":12},"stairDown":true},{"x":10.0,"y":3.0,"to":"royal_northhall","tx":10.5,"ty":8.0,"dir":"u","explicitDir":true,"triggerRect":{"x":160,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_upperhall","roomBlocks":[],"roomActors":[{"spr":"royal_door","x":176.0,"y":64,"schoolArt":true,"royalDoor":true},{"spr":"royal_stairs_right","x":312,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_armory","editKey":"castle-stair-south:royal_armory"},{"spr":"royal_stairs_left","x":40,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_salon","editKey":"castle-stair-south:royal_salon"}],"foes":[{"k":"royalguard","x":8,"y":6},{"k":"royalguard","x":13,"y":6}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_bedroom":{"w":11,"h":9,"ts":16,"terr":"6.45|0.9|6.2|0.9|6.2|0.9|6.2|0.9|6.12","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[88,112],"title":"King's Bedroom","doors":[{"x":4.5,"y":8.0,"to":"royal_salon","tx":6.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":72,"y":128,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_bedroom","roomBlocks":[[67,64,109,94],[35,74,53,91],[123,74,141,91]],"roomActors":[],"foes":[],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_salon":{"w":14,"h":13,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[112,176],"title":"Fireside Salon","doors":[{"x":10.5,"y":3.0,"to":"royal_upperhall","tx":2.0,"ty":6.25,"dir":"u","explicitDir":true,"triggerRect":{"x":168,"y":48,"w":32,"h":16},"stairDown":false},{"x":6.0,"y":3.0,"to":"royal_bedroom","tx":5.0,"ty":6.0,"dir":"u","explicitDir":true,"triggerRect":{"x":96,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_salon","roomBlocks":[[26,64,70,88],[20,112,60,130],[92,112,132,130],[68,132,84,150]],"roomActors":[{"spr":"royal_fire","x":48,"y":88,"schoolArt":true},{"spr":"royal_door","x":184.0,"y":64,"schoolArt":true,"royalDoor":true},{"spr":"royal_door","x":112.0,"y":64,"schoolArt":true,"royalDoor":true}],"foes":[{"k":"royalguard","x":3,"y":10},{"k":"royalguard","x":7,"y":10}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_study":{"w":14,"h":13,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[176,176],"title":"Royal Study","doors":[{"x":10.5,"y":3.0,"to":"royal_northhall","tx":2.0,"ty":6.25,"dir":"u","explicitDir":true,"triggerRect":{"x":168,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_study","roomBlocks":[[21,56,71,90],[21,140,71,174],[97,56,147,90],[116,140,172,156]],"roomActors":[{"spr":"royal_door","x":184.0,"y":64,"schoolArt":true,"royalDoor":true}],"foes":[{"k":"royalguard","x":10,"y":10},{"k":"royalguard","x":10,"y":6}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_treasury":{"w":14,"h":13,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[112,176],"title":"Treasury Antechamber","doors":[{"x":1.5,"y":3.0,"to":"royal_northhall","tx":19.0,"ty":6.25,"dir":"u","explicitDir":true,"triggerRect":{"x":24,"y":48,"w":32,"h":16},"stairDown":false},{"x":6.0,"y":3.0,"to":"royal_seal","tx":6.5,"ty":10.0,"dir":"u","explicitDir":true,"triggerRect":{"x":96,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_treasury","roomBlocks":[[173,68,195,88],[173,156,195,176]],"roomActors":[{"spr":"royal_door","x":40.0,"y":64,"schoolArt":true,"royalDoor":true},{"spr":"royal_door","x":112.0,"y":64,"schoolArt":true,"royalDoor":true}],"foes":[{"k":"treasuryknight","x":9,"y":6}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_northhall":{"w":22,"h":11,"ts":16,"terr":"6.89|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.2|0.20|6.23","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[176,144],"title":"Hall of the Crown","doors":[{"x":10.0,"y":10.0,"to":"royal_upperhall","tx":10.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":160,"y":160,"w":32,"h":16},"stairDown":false},{"x":1.5,"y":9.25,"to":"royal_study","tx":11.0,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":24,"y":148,"w":32,"h":12},"stairDown":true},{"x":18.5,"y":9.25,"to":"royal_treasury","tx":2.0,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":296,"y":148,"w":32,"h":12},"stairDown":true},{"x":10.0,"y":3.0,"to":"cinderhold","tx":9.5,"ty":28,"dir":"u","explicitDir":true,"triggerRect":{"x":160,"y":48,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_northhall","roomBlocks":[[100,70,124,89],[228,70,252,89]],"roomActors":[{"spr":"royal_fountain","x":112,"y":88,"schoolArt":true},{"spr":"royal_fountain","x":240,"y":88,"schoolArt":true},{"spr":"royal_door","x":176.0,"y":64,"schoolArt":true,"royalDoor":true},{"spr":"royal_stairs_left","x":40,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_study","editKey":"castle-stair-south:royal_study"},{"spr":"royal_stairs_right","x":312,"y":156,"sy":-10,"schoolArt":true,"stairTo":"royal_treasury","editKey":"castle-stair-south:royal_treasury"}],"foes":[{"k":"royalguard","x":8,"y":6},{"k":"royalguard","x":13,"y":6}],"royal":true,"travel":0,"hidden":[],"house_rows":[]},"royal_seal":{"w":14,"h":13,"ts":16,"terr":"6.57|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.2|0.12|6.15","objs":[],"scatter":[],"sanim":[],"fobjs":[],"npcs":[],"features":[],"regions":[],"places":[],"spawn":[112,176],"title":"Chamber of the Seal","doors":[{"x":6.0,"y":12.0,"to":"royal_treasury","tx":6.5,"ty":4.5,"dir":"d","explicitDir":true,"triggerRect":{"x":96,"y":192,"w":32,"h":16},"stairDown":false}],"bg":"#2b2528","roomArt":"royal_room_seal","roomBlocks":[[28,68,46,86],[178,68,196,86]],"roomActors":[],"foes":[],"royal":true,"travel":0,"hidden":[],"house_rows":[]}},"pages":[[0,4000768,352,176,EMBERFELL_ASSETS.a0089],[0,4001792,352,176,EMBERFELL_ASSETS.a0090],[0,4002816,352,176,EMBERFELL_ASSETS.a0091],[0,4003840,224,240,EMBERFELL_ASSETS.a0092],[0,4004864,224,208,EMBERFELL_ASSETS.a0093],[0,4006912,224,208,EMBERFELL_ASSETS.a0094],[0,4007936,352,176,EMBERFELL_ASSETS.a0095],[0,4008960,176,144,EMBERFELL_ASSETS.a0096],[0,4009984,224,208,EMBERFELL_ASSETS.a0097],[0,4011008,224,208,EMBERFELL_ASSETS.a0098],[0,4013056,224,208,EMBERFELL_ASSETS.a0099],[0,4014080,352,176,EMBERFELL_ASSETS.a0100],[0,4015104,224,208,EMBERFELL_ASSETS.a0101],[0,4017152,192,64,EMBERFELL_ASSETS.a0102],[0,4018176,384,64,EMBERFELL_ASSETS.a0103],[0,4019200,152,24,EMBERFELL_ASSETS.a0104],[0,4020224,114,24,EMBERFELL_ASSETS.a0105],[0,4021248,162,23,EMBERFELL_ASSETS.a0106],[0,4033536,192,48,EMBERFELL_ASSETS.a0107],[0,4034560,67,51,EMBERFELL_ASSETS.a0108],[0,4035584,67,51,EMBERFELL_ASSETS.a0109],[0,4036608,80,48,EMBERFELL_ASSETS.a0110],[0,4037632,448,304,EMBERFELL_ASSETS.a0111],[0,4038656,416,176,EMBERFELL_ASSETS.a0112],[0,4039680,144,208,EMBERFELL_ASSETS.a0113],[0,4040704,144,208,EMBERFELL_ASSETS.a0114],[0,4041728,144,208,EMBERFELL_ASSETS.a0115],[0,4042752,160,208,EMBERFELL_ASSETS.a0116],[0,4043776,496,384,EMBERFELL_ASSETS.a0117],[0,4044800,24,40,EMBERFELL_ASSETS.a0118],[0,4045824,48,32,EMBERFELL_ASSETS.a0119],[0,4046848,48,32,EMBERFELL_ASSETS.a0120],[0,4047872,768,256,EMBERFELL_ASSETS.a0121],[0,4048896,384,256,EMBERFELL_ASSETS.a0122],[0,4049920,448,256,EMBERFELL_ASSETS.a0123],[0,4050944,320,256,EMBERFELL_ASSETS.a0124],[0,4051968,448,256,EMBERFELL_ASSETS.a0125],[0,4060160,384,41,EMBERFELL_ASSETS.a0126],[0,4061184,384,41,EMBERFELL_ASSETS.a0127]],"sprites":{"royal_room_vestibule":[0,4000768,352,176,1],"royal_room_westhall":[0,4001792,352,176,1],"royal_room_easthall":[0,4002816,352,176,1],"royal_room_banquet":[0,4003840,224,240,1],"royal_room_armory":[0,4004864,224,208,1],"royal_room_guardroom":[0,4006912,224,208,1],"royal_room_upperhall":[0,4007936,352,176,1],"royal_room_bedroom":[0,4008960,176,144,1],"royal_room_salon":[0,4009984,224,208,1],"royal_room_study":[0,4011008,224,208,1],"royal_room_treasury":[0,4013056,224,208,1],"royal_room_northhall":[0,4014080,352,176,1],"royal_room_seal":[0,4015104,224,208,1],"royal_fountain":[0,4017152,32,64,6],"royal_fire":[0,4018176,64,64,6],"royal_guest_woman":[0,4019200,19,24,8],"royal_guest_man":[0,4020224,19,24,6],"royal_reader":[0,4021248,27,23,6],"royal_door":[0,4033536,32,48,6],"royal_dragon_statue_left":[0,4034560,67,51,1],"royal_dragon_statue_right":[0,4035584,67,51,1],"royal_statue_rug":[0,4036608,80,48,1],"inn_room":[0,4037632,448,304,1],"innrooms_room":[0,4038656,416,176,1],"inn_guest1_room":[0,4039680,144,208,1],"inn_guest2_room":[0,4040704,144,208,1],"inn_guest3_room":[0,4041728,144,208,1],"inn_guest4_room":[0,4042752,160,208,1],"tavern_room":[0,4043776,496,384,1],"royal_exit_plant":[0,4044800,24,40,1],"royal_stairs_left":[0,4045824,48,32,1],"royal_stairs_right":[0,4046848,48,32,1],"kn3_idle_d":[0,4047872,64,64,12],"kn3_idle_e":[0,4047936,64,64,12],"kn3_idle_w":[0,4048000,64,64,12],"kn3_idle_u":[0,4048064,64,64,12],"kn3_walk_d":[0,4048896,64,64,6],"kn3_walk_e":[0,4048960,64,64,6],"kn3_walk_w":[0,4049024,64,64,6],"kn3_walk_u":[0,4049088,64,64,6],"kn3_atk_d":[0,4049920,64,64,7],"kn3_atk_e":[0,4049984,64,64,7],"kn3_atk_w":[0,4050048,64,64,7],"kn3_atk_u":[0,4050112,64,64,7],"kn3_hurt_d":[0,4050944,64,64,5],"kn3_hurt_e":[0,4051008,64,64,5],"kn3_hurt_w":[0,4051072,64,64,5],"kn3_hurt_u":[0,4051136,64,64,5],"kn3_die_d":[0,4051968,64,64,7],"kn3_die_e":[0,4052032,64,64,7],"kn3_die_w":[0,4052096,64,64,7],"kn3_die_u":[0,4052160,64,64,7],"royal_intro_guard_white":[0,4060160,32,41,12],"royal_intro_guard_black":[0,4061184,32,41,12]}};

const royalDefeated = {};
function registerRoyalSprites(){Object.assign(SPR, ROYAL_DATA.sprites);}
async function loadRoyalAssets(){
 for(const [x,y,w,h,src] of ROYAL_DATA.pages){const img=new Image();img.src=src;await img.decode();registerAtlasPage({img,x,y,w,h});}
}
function installRoyalCastle(){
 for(const [id,m] of Object.entries(ROYAL_DATA.maps))W.maps[id]=JSON.parse(JSON.stringify(m));
 const entrance=W.maps.world.doors.find(d=>d.to==='cinderhold');
 if(entrance){entrance.to='royal_vestibule';entrance.tx=10.5;entrance.ty=7;}
 const throne=W.maps.cinderhold;
 const treasury=W.maps.royal_treasury,seal=W.maps.royal_seal;
 treasury.doors=treasury.doors.filter(d=>d.to!=='royal_seal');
 treasury.roomActors=treasury.roomActors.filter(a=>!(a.royalDoor&&a.x===112));
 Object.assign(seal.doors[0],{to:'cinderhold',tx:19,ty:5.5});
 throne.doors.push({x:18.5,y:3,to:'royal_seal',tx:6.5,ty:10,dir:'u',explicitDir:true,triggerRect:{x:296,y:48,w:32,h:16}});
 (throne.roomActors ||= []).push({spr:'royal_door',x:312,y:64,sy:96,schoolArt:true,royalDoor:true});
 throne.title='Cinderhold — Throne Room';throne.travel=true;throne.travel_kind='Castle';
 // Royal water statues flank the throne against its north wall.
 throne.roomActors=(throne.roomActors||[]).filter(a=>!a.royalStatue);
 throne.roomBlocks=(throne.roomBlocks||[]);
 for(const x of [72,280]){
  throne.roomActors.push({spr:'royal_fountain',x,y:88,schoolArt:true,royalStatue:true});
  throne.roomBlocks.push([x-12,70,x+12,89]);
 }
 for(const d of throne.doors)if(d.to==='world')Object.assign(d,{to:'royal_northhall',tx:10.5,ty:4.5,dir:'d',explicitDir:true});
 // Exterior dragon statues face inward beside the throne-room aisle.
 for(const [spr,x] of [['royal_dragon_statue_left',72],['royal_dragon_statue_right',280]]){
  throne.roomActors.push({spr,x,y:168,schoolArt:true,royalStatue:true,statueTint:'#397b79'});
  throne.roomBlocks.push([x-27,153,x+27,168]);
 }
 // Paired plants mark south-facing castle exits without narrowing their thresholds.
 for(const map of Object.values(W.maps).filter(m=>m.royal)){
  map.roomActors=(map.roomActors||[]).filter(a=>!a.royalExitPlant&&!a.royalExitMarker);
  for(const exit of map.doors||[]){
   if(exit.dir!=='d'||exit.stairDown)continue;
   const cx=exit.triggerRect?exit.triggerRect.x+exit.triggerRect.w/2:exit.x*TS+8;
   const y=exit.triggerRect?exit.triggerRect.y-4:exit.y*TS+12;
   for(const x of [cx-36,cx+36]){
    map.roomActors.push({spr:'royal_exit_plant',x,y,schoolArt:true,royalExitPlant:true});
    (map.roomBlocks ||= []).push([x-7,y-12,x+7,y]);
   }
  }
 }
 // The innkeeper sits directly behind her counter, without an extra chair.
 const inn=W.maps.inn;
 inn.roomActors=(inn.roomActors||[]).filter(a=>!(a.castSeat&&/^ichair/.test(a.spr)));
 const keeper=inn.npcs.find(n=>n.n==='Maren');
 if(keeper){keeper.y=114;keeper.seatClipY=112;keeper.talkY=147;}
 // The roadside escort uses the Royal pack ceremonial halberd guards.
 for(const n of W.maps.world.npcs||[])if(['Serjeant Bram','Doran','Tolan'].includes(n.n)){n.packSpr='royal_intro_guard_'+(n.n==='Serjeant Bram'?'black':'white');n.packDirections=false;n.packWalk=false;n.body=undefined;n.sk=undefined;n.idleFps=6;}
 // Use the edited vestibule corner as the template for every castle stair.
 for(const [id,m] of Object.entries(W.maps))if(m.royal){
  for(const a of m.roomActors||[])if(a.stairTo){
   const east=a.spr==='royal_stairs_right',width=m.w*TS,height=m.h*TS;
   shiftActorData(m,a,east?width-34:34,height-14,true);
   const d=m.doors.find(d=>d.stairDown&&d.to===a.stairTo);
   if(d){
    d.triggerRect={x:east?width-55:47,y:height-43,w:8,h:26};
    d.x=d.triggerRect.x/TS;d.y=d.triggerRect.y/TS;
    d.dir=east?'r':'l';d.explicitDir=true;
   }
   const cells=m.collisionOverrides ||= {},row=height/8-6;
   for(let n=1;n<=6;n++)cells[(east?width/8-1-n:n)+','+row]=true;
   cells[(east?width/8-7:6)+','+(row-1)]=false;
   const back=W.maps[a.stairTo]?.doors.find(d=>d.to===id);
   if(back){back.tx=((east?width-72:72)-8)/TS;back.ty=(height-24-16)/TS;}
  }
 }
 // Apply saved stair placements before any connected doorway can be used.
 for(const [id,map] of Object.entries(W.maps))if(map.royal)applyActorLayout(map,id);
 // Preserve each villager's identity, furniture, dialogue, and existing table lip.
 for(const [mapId,name,spr] of [['house03','Della','royal_guest_woman'],['house07','Garrick','royal_guest_man'],['house04','Ewan','royal_reader']]){
  const n=W.maps[mapId]?.npcs.find(n=>n.n===name);if(!n)continue;
  n.packSpr=spr;n.lookId=spr;n.packWalk=false;n.packDirections=false;n.stationary=true;n.idleFps=5;
  n.y=(n.seatClipY??n.y-3)+3;
 }
}

const KNIGHT_ARENA_ID = 9146;
function installKnightEncounter() {
  const m = W.maps.world;
  if (!m) return;
  if (!m.features.some(f => f.id === KNIGHT_ARENA_ID))
    m.features.push({ id:KNIGHT_ARENA_ID, kind:"arena", x:2020, y:300, r:7.3,
                      style:"blossom", storyKnight:true });
  if (!m.foes.some(f => f.storyKnight))
    m.foes.push({ k:"knight", x:2020, y:300, storyKnight:true });
}
function installFishingVillager() {
  const m=W.maps.world;
  if(!m)return;
  // The dock's decorative old man reused Odo's portrait, but was not an NPC.
  const keep=[];
  for(let i=0;i<m.objs.length;i+=3){
    const [s,x,y]=m.objs.slice(i,i+3);
    if(W.names[s]==='hb_oldman'&&x===32376&&y===8520)continue;
    keep.push(s,x,y);
  }
  m.objs=keep;
  NPC_VOICES.Liora=['Tell your winged friend the catch is coming; glaring at the water will not hurry it.',
    'They say your travelling companion has scales. Mine usually fit in a bucket.',
    'If the road leaves your dragon tired, bring it something fresh from the river.',
    'Even the falls sound gentler without Halvard casting a shadow over the valley.'];
  if(!m.npcs.some(n=>n.n==='Liora'))m.npcs.push({
    n:'Liora',x:416*W.ts,y:329.5*W.ts,f:'d',stationary:true,
    packSpr:'pack_fisher_boy',packDirections:false,packWalk:false,idleFps:6,lookId:'pack_fisher_boy',loc:'Forgefalls',
    d:['The spray keeps my hair damp, but the trout make up for it.'],
    d2:['Watch the green arc, not the waterfall. A patient thumb catches supper.'],
    dd:['Your dragon has been watching my creel. I think we share an interest.'],
    dd2:['A fish from your own line tastes better. Your dragon seems to agree.'],
    dragonNear:['Tell your winged friend the catch is coming; glaring at the water will not hurry it.'],
    dragonRumor:['They say your travelling companion has scales. Mine usually fit in a bucket.'],
    dragonRumor2:['If the road leaves your dragon tired, bring it something fresh from the river.'],
    dv:['Even the falls sound gentler without Halvard casting a shadow over the valley.'],
    dv2:['You have earned a quiet afternoon here, Corin. Cast a line and let the world wait.']
  });
}
function installMarketCounters(){
  const world=W.maps.world;
  const placements={
    Berta:{spr:'stall1',x:4120,y:1816},
    Nerissa:{spr:'stall2',x:32136,y:8176}
  };
  for(const [name,p] of Object.entries(placements)){
    const n=(world.npcs||[]).find(n=>n.n===name);if(!n)continue;
    const sid=W.names.indexOf(p.spr);if(sid<0)continue;
    let found=-1,best=Infinity;
    for(let i=0;i<(world.objs||[]).length;i+=3){
      if(world.objs[i]!==sid)continue;
      const d=Math.hypot(world.objs[i+1]-n.x,world.objs[i+2]-n.y);
      if(d<best){best=d;found=i;}
    }
    if(found<0){world.objs.push(sid,p.x,p.y);found=world.objs.length-3;}
    world.objs[found+1]=p.x;world.objs[found+2]=p.y;
    Object.assign(n,{x:p.x,y:p.y-30,stationary:true,patrol:undefined,
      talkX:p.x,talkY:p.y+14,counter:{x:p.x,y:p.y}});
  }
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]){
    if(!n.sells)continue;
    if(n.counter)continue;
    let stall=null,near=64;
    for(let i=0;i<(m.objs||[]).length;i+=3){
      const [s,x,y]=m.objs.slice(i,i+3);
      if(!/^stall[123]$/.test(W.names[s]))continue;
      const d=Math.hypot(x-n.x,y-n.y);if(d<near){near=d;stall={x,y};}
    }
    if(!stall)continue;
    n.x=stall.x;n.y=stall.y-30;n.stationary=true;n.patrol=undefined;
    n.talkX=stall.x;n.talkY=stall.y+14;n.counter={x:stall.x,y:stall.y};
  }
}
function installFirstTemple(){
 const m=W.maps.tp1,outside={...m.doors.find(d=>d.to==='world')},alderic=W.maps.tp4.npcs.find(n=>n.n==='Alderic');
 Object.assign(m,{w:20,h:120,firstTemple:true,templeContinuous:true,title:'Forgewick Temple',roomArt:'first_temple_continuous',bg:'#19171c',floorbg:'#615b50',spawn:[160,1888]});
 m.terr=terrRLE(Array(2400).fill(DIRT));m.base_terr=m.terr;m.objs=[];m.scatter=[];m.sanim=[];m.fsanim=[];m.fobjs=[];m.features=[];m.hidden=[];m.npcs=[];
 m.roomActors=[];m.roomBlocks=[];m.collisionOverrides={};m.templeActive={};
 m.templeFloors=[[112,192,208,1904],[64,64,256,192],[68,416,252,536],[68,1216,252,1336],[144,1904,176,1920]];
 m.templeWalls=[];
 for(const [y,l,r] of [[192,64,256],[368,68,252],[536,68,252],[1168,68,252],[1336,68,252],[1776,112,208]]){m.templeFloors.push([144,y,176,y+48]);m.templeWalls.push([l,y,144,y+48],[176,y,r,y+48]);}
 m.doors=[{x:9.5,y:119,to:'world',tx:outside.tx,ty:outside.ty,dir:'d',explicitDir:true,triggerRect:{x:144,y:1904,w:32,h:16}}];
 m.templeGates=[{y:1824,style:'door'},{y:1384,style:'door'},{y:1216,style:'bars',room:'ghost'},{y:584,style:'door'},{y:416,style:'bars',room:'golem'},{y:240,style:'door'}];
 m.templeGates.forEach((g,i)=>{g.open=0;m.roomActors.push({spr:'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i});});
 for(const y of [64,416,1216])for(const x of [88,232])m.roomActors.push({spr:'first_temple_torch',x,y,schoolArt:true});
 for(const y of [240,584,1384,1824])for(const x of [128,192])m.roomActors.push({spr:'first_temple_torch',x,y,schoolArt:true});
 m.foes=[{x:6,y:78,k:'ghost'},{x:13,y:78,k:'ghost'},{x:7,y:81,k:'ghost'},{x:12,y:81,k:'ghost'},{x:6,y:29,k:'golem2'},{x:13,y:30,k:'golem2'}];
 // Reserve the silver-haired armored elder for Alderic.
 W.maps.world.npcs=W.maps.world.npcs.filter(n=>n.n!=='Sennet');
 if(alderic){for(const k of ['sk','body','seatSpr','seatClipY','seated','school','sy','counter','talkX','talkY','patrol','goto','idleFrame'])delete alderic[k];
  Object.assign(alderic,{x:112,y:144,packSpr:'guild_elder',lookId:'guild_elder',packDirections:false,packWalk:false,stationary:true,idleFps:5,gift:undefined});alderic.d=['You came further than the others, then. Come closer.','You are carrying a heartstone. Do you know what you carry?','Corin: I know it was in the shell.','Alderic: They were cut from the first dragon. One stone for each thing she could do.','Alderic: A rider holds them. A dragon answers to them.','Alderic: The chest beside me holds the storm. It is yours, Corin.','Corin: Why keep them apart?','Alderic: Because a dragon with all four answers to nobody.'];m.npcs.push(alderic);}

 for(const y of [440,1240])for(const x of [128,192]){m.roomActors.push({spr:'temple67_sentinel',x,y,schoolArt:true});m.roomBlocks.push([x-6,y-10,x+6,y]);}
 for(const y of [240,584,1384])for(const x of [80,240])m.roomActors.push({spr:y===584?'temple67_skull':'first_temple_dragon_head',x,y:y-8,schoolArt:true});
 m.roomActors.push({spr:'temple73_fire_statue',x:160,y:112,schoolArt:true});m.roomBlocks.push([144,94,176,112],[148,118,172,128]);
 // Small native skulls and bones are floor details, outside the spike crossing rows.
 for(const [x,y,spr] of [[92,168,'skull'],[236,180,'bones'],[88,492,'skull'],[228,516,'bones'],[124,306,'skull'],[194,340,'bones'],[124,620,'bones'],[194,806,'skull'],[124,950,'skull'],[192,1138,'bones'],[88,1290,'bones'],[234,1308,'skull'],[124,1410,'skull'],[194,1550,'bones'],[124,1660,'skull'],[194,1746,'skull'],[124,1860,'bones']])m.roomActors.push({spr:'temple73_'+spr,x,y,sy:-100,schoolArt:true,stillFrame:0});
 m.templeClock=0;m.templeTraps=[{id:'lower',rows:Array.from({length:6},(_,i)=>1456+i*48),leverX:188,leverY:1408},{id:'upper',rows:Array.from({length:10},(_,i)=>656+i*48),leverX:188,leverY:608}];
 for(const h of m.templeTraps){h.leverOpen=0;m.roomActors.push({spr:'temple71_lever',x:h.leverX,y:h.leverY,schoolArt:true,templeLever:h.id});for(let i=0;i<h.rows.length;i++)for(let x=120;x<=200;x+=16)m.roomActors.push({spr:'temple71_spikes',x,y:h.rows[i]+8,sy:-100,schoolArt:true,templeSpike:h.id,trapRow:i});}
 for(const id of ['tp2','tp3','tp4']){W.maps[id].travel=false;W.maps[id].templeLegacy=true;}
 const entry=W.maps.world.doors.find(d=>d.to==='tp1');if(entry){entry.tx=9.5;entry.ty=117;}
}
function restoreTempleEntrances(){
 const m=W.maps.world;
 for(const [to,spr] of [['tp1','rt_ext2'],['sn1','rt_snow'],['ds1','rt_desert']]){
  const d=m.doors.find(d=>d.to===to);if(!d)continue;
  const x=d.x*16+8,y=d.y*16;
  if(to==='sn1'&&m.scatter.some((v,i)=>i%3===0&&W.names[v]===spr&&Math.abs(m.scatter[i+1]-x)<128&&Math.abs(m.scatter[i+2]-y)<128))continue;
  // Keep these landmark buildings out of procedural decoration hiding and saved object deletions.
  (m.roomActors ||= []).push({spr,x,y,sy:y-32,schoolArt:true,stillFrame:0,sceneReserved:true,templeEntrance:to});
  for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]===spr)(m.hidden ||= []).push(i/3);
  (m.roomBlocks ||= []).push([x-74,y-76,x-18,y-32],[x+18,y-76,x+74,y-32],[x-60,y-102,x+60,y-76]);
 }
}
function installSecondTemple(){
 const m=W.maps.ds1,oldExit=m.doors.find(d=>d.to==='world');
 Object.assign(m,{w:20,h:140,title:'Sandspire Temple',roomArt:'scientist_interior',templeContinuous:true,templeScience:true,templeOldGolem:'ds3',templeOldChest:'ds4',templeRooms:[['ghost',1536,1656],['golem',736,856]],bg:'#19171c',floorbg:'#615b50',spawn:[160,2208]});
 m.terr=terrRLE(Array(2800).fill(DIRT));m.base_terr=m.terr;
 for(const key of ['objs','scatter','sanim','fsanim','fobjs','features','hidden','npcs','roomActors','roomBlocks'])m[key]=[];
 m.collisionOverrides={};m.templeActive={};
 m.templeFloors=[[96,64,224,112],[32,112,288,288],[64,336,256,512],[112,512,208,2224],[68,736,252,856],[68,1536,252,1656],[144,2224,176,2240]];
 m.templeWalls=[];for(const [y,l,r]of [[288,32,288],[512,64,256],[688,68,252],[856,68,252],[1488,68,252],[1656,68,252],[2096,112,208]]){m.templeFloors.push([144,y,176,y+48]);m.templeWalls.push([l,y,144,y+48],[176,y,r,y+48]);}
 m.doors=[{x:9.5,y:139,to:'world',tx:oldExit.tx,ty:oldExit.ty,dir:'d',explicitDir:true,triggerRect:{x:144,y:2224,w:32,h:16}}];
 m.templeGates=[{y:2144,style:'door'},{y:1704,style:'door'},{y:1536,style:'bars',room:'ghost'},{y:904,style:'door'},{y:736,style:'bars',room:'golem'},{y:560,style:'door'},{y:336,style:'bars'}];
 m.templeGates.forEach((g,i)=>{g.open=0;m.roomActors.push({spr:i===6?'scientist_vault_gate':'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i});});
 m.foes=[{x:6,y:98,k:'ghost'},{x:13,y:98,k:'ghost'},{x:7,y:101,k:'ghost'},{x:12,y:101,k:'ghost'},{x:6,y:49,k:'golem1'},{x:13,y:50,k:'golem1'}];
 const prop=(spr,x,y,box)=>{m.roomActors.push({spr,x,y,schoolArt:true});if(box)m.roomBlocks.push(box);};
 // Webbed treasure chamber, with the glowing skull in its recessed north wall.
 prop('scientist_skull',160,80,[144,64,176,80]);
 prop('scientist_pod_tall',76,220,[57,191,92,218]);prop('scientist_pod_mid',112,159,[96,140,125,159]);
 prop('scientist_pod_mid',235,163,[219,144,249,162]);prop('scientist_pod_round',211,253,[197,239,224,252]);
 prop('scientist_roots_tall',68,154);prop('scientist_roots_tall',264,279);prop('scientist_roots_small',58,276);
 for(const [x,y]of [[60,140],[259,141],[270,260]])prop('scientist_web',x,y);
 for(const [x,y]of [[114,228],[178,257],[252,199],[96,264]])prop('scientist_gold',x,y);
 m.roomBlocks.push([148,214,172,224]);
 // Laboratory antechamber: animated specimens, shelves, and a work table.
 prop('scientist_shelf',88,393,[70,380,106,393]);prop('scientist_shelf_plant',232,393,[215,380,248,393]);
 prop('scientist_flask',111,445,[97,432,125,445]);prop('scientist_flask',222,485,[209,472,235,485]);
 prop('scientist_desk',108,508,[80,494,135,508]);
 for(const y of [736,1536]){for(const x of [88,232])prop('first_temple_torch',x,y);for(const x of [128,192])prop('scientist_flask',x,y+28,[x-10,y+16,x+10,y+28]);}
 for(const y of [560,904,1704,2144])for(const x of [128,192])prop('first_temple_torch',x,y);
 for(const [x,y]of [[124,615],[191,1160],[123,1470],[190,1950],[124,2180]])m.roomActors.push({spr:'temple73_bones',x,y,schoolArt:true,sy:-100,stillFrame:0});
 m.templeClock=0;m.templeTraps=[{id:'lower',rows:[],leverX:188,leverY:1728},{id:'upper',rows:[],leverX:188,leverY:928}];
 for(const h of m.templeTraps){h.leverOpen=0;prop('temple71_lever',h.leverX,h.leverY);m.roomActors[m.roomActors.length-1].templeLever=h.id;}
 m.templeMachines=[];m.templeShots=[];
 for(const [hall,type,n,start]of [['lower','arrow',6,1776],['upper','cannon',10,976]])for(let i=0;i<n;i++){
  const dir=i%2?-1:1,y=start+i*48,id=m.templeMachines.length;
  m.templeMachines.push({hall,type,x:dir===1?116:204,y,dir,offset:i*.43,lastCycle:-1,frame:0});
  m.roomActors.push({spr:'scientist_'+(type==='cannon'?'cannon_':'arrow_port_')+(dir===1?'r':'l'),x:dir===1?112:208,y:y+16,sy:y+16,schoolArt:true,templeMachine:id});
 }
 for(const id of ['ds2','ds3','ds4']){W.maps[id].travel=false;W.maps[id].templeLegacy='ds1';W.maps[id].npcs=[];}
 const entry=W.maps.world.doors.find(d=>d.to==='ds1');if(entry){entry.tx=9.5;entry.ty=137;}
}
function refineSecondTemple(){
 const m=W.maps.ds1;
 m.templeFloors=m.templeFloors.filter(r=>r[1]>=512);m.templeFloors.push([96,240,224,288],[32,288,288,512]);
 m.templeWalls=m.templeWalls.filter(r=>r[1]>=512);m.templeWalls=m.templeWalls.filter(r=>r[1]!==512);m.templeWalls.push([32,512,144,560],[176,512,288,560]);
 m.templeGates=m.templeGates.filter(g=>g.y!==336);
 m.roomActors=m.roomActors.filter(o=>o.y>=560&&!o.templeGate&&o.templeGate!==0);
 m.roomBlocks=m.roomBlocks.filter(b=>b[1]>=560);
 m.templeGates.forEach((g,i)=>m.roomActors.push({spr:'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i}));
 for(const o of m.roomActors){if(o.spr==='scientist_flask')o.spr='temple67_sentinel';if(o.spr.startsWith('scientist_arrow_port_'))o.x+=o.x<160?-5:5;}
 const prop=(spr,x,y,box)=>{m.roomActors.push({spr,x,y,schoolArt:true});if(box)m.roomBlocks.push(box);};
 prop('scientist_skull',160,276,[144,258,176,276]);
 prop('scientist_pod_tall',64,360,[48,340,79,360]);prop('scientist_pod_mid',250,359,[236,340,265,359]);
 prop('scientist_pod_round',236,445,[224,434,249,445]);
 prop('scientist_flask',101,404,[89,390,113,404]);prop('scientist_flask',210,404,[198,390,222,404]);
 prop('scientist_shelf',61,475,[42,463,79,475]);prop('scientist_shelf_plant',256,501,[240,488,272,501]);
 prop('scientist_desk',111,500,[84,488,136,500]);
 prop('scientist_roots_tall',47,332);prop('scientist_roots_small',276,437);
 prop('scientist_web',57,313);prop('scientist_web',270,313);
 for(const [x,y]of [[111,351],[211,352],[170,446]])prop('scientist_gold',x,y);
 m.roomBlocks.push([148,334,172,344]);
 for(const machine of m.templeMachines)if(machine.type==='cannon'){
  const y=machine.y,left=machine.dir>0;m.templeFloors.push(left?[80,y-8,112,y+24]:[208,y-8,240,y+24]);
  m.roomBlocks.push(left?[80,y-8,105,y+16]:[215,y-8,240,y+16]);
 }
}
function installThirdTemple(){
 const exit=W.maps.sn1.doors.find(d=>d.to==='world');
 const m=W.maps.sn1=JSON.parse(JSON.stringify(W.maps.ds1));
 Object.assign(m,{title:'Frostvault Temple',roomArt:'dragon75_interior',templeScience:false,templeDragon:true,templeOldGolem:'sn3',templeOldChest:'sn4',bg:'#19171c',floorbg:'#535d70',roomActors:[],roomBlocks:[],templeMachines:[],templeShots:[],templeHazards:[],templeActive:{}});
 Object.assign(m.doors[0],{tx:exit.tx,ty:exit.ty});
 m.foes=m.foes.map(f=>({...f,k:f.k==='golem1'?'golem3':f.k}));
 m.templeGates.forEach((g,i)=>{g.open=0;delete g.entered;m.roomActors.push({spr:'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i});});
 const prop=(spr,x,y,box,ground=false)=>{m.roomActors.push({spr,x,y,schoolArt:true,sy:ground?-100:y});if(box)m.roomBlocks.push(box);};
 // Three weapon-free dragon skulls in a stepped treasure alcove.
 prop('dragon75_plinth_blue',160,144,[142,122,178,144],true);prop('dragon75_skull',160,130);
 for(const [x,spr]of [[96,'dragon75_skull_small'],[224,'dragon75_skull_round']]){prop('dragon75_plinth_red',x,202,[x-12,180,x+12,202],true);prop(spr,x,187);}
 for(const x of [112,208])prop('dragon75_banner_red',x,94);
 for(const x of [56,264])prop('dragon75_banner_blue',x,143);
 for(const [x,y]of [[65,232],[94,262],[231,256],[256,219],[134,170],[181,175]])prop('scientist_gold',x,y,null,true);
 m.roomBlocks.push([148,230,172,240]);
 for(const y of [736,1536]){for(const x of [88,232])prop('first_temple_torch',x,y);for(const x of [128,192])prop('dragon75_statue',x,y+25,[x-7,y+15,x+7,y+25]);}
 for(const y of [336,560,904,1704,2144])for(const x of [128,192])prop('first_temple_torch',x,y);
 for(const [x,y]of [[88,388],[232,388]])prop('dragon75_statue',x,y,[x-7,y-10,x+7,y]);
 for(const [x,y]of [[124,615],[191,1160],[123,1470],[190,1950],[124,2180],[84,460],[235,487]])prop('temple73_bones',x,y,null,true);
 for(const h of m.templeTraps){h.leverOpen=0;prop('temple71_lever',h.leverX,h.leverY);m.roomActors.at(-1).templeLever=h.id;}
 for(const [hall,type,n,start]of [['lower','flame',6,1776],['upper','saw',10,976]])for(let i=0;i<n;i++){
  const y=start+i*48,dir=i%2?-1:1; m.templeHazards.push({hall,type,y,dir,offset:i*.48,x:128,frame:0,active:false});
  if(type==='saw')prop('dragon75_rail',160,y+2,null,true);
 }
 for(const id of ['sn2','sn3','sn4']){W.maps[id].travel=false;W.maps[id].templeLegacy='sn1';W.maps[id].npcs=[];}
 const entry=W.maps.world.doors.find(d=>d.to==='sn1');if(entry){entry.tx=9.5;entry.ty=137;}
}
function finishTempleLayouts77(){
 const m=W.maps.sn1;
 m.templeFloors=m.templeFloors.filter(r=>r[1]>=512);m.templeFloors.push([96,240,224,288],[32,288,288,512]);
 m.templeWalls=m.templeWalls.filter(r=>r[1]>512);m.templeWalls.push([32,512,144,560],[176,512,288,560]);
 m.templeGates=m.templeGates.filter(g=>g.y!==336);
 m.roomActors=m.roomActors.filter(o=>o.y>=560&&!Number.isInteger(o.templeGate));
 m.roomBlocks=m.roomBlocks.filter(b=>b[1]>=560);
 m.templeGates.forEach((g,i)=>m.roomActors.push({spr:'dragon77_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i}));
 const prop=(spr,x,y,box,ground=false)=>{m.roomActors.push({spr,x,y,schoolArt:true,sy:ground?-100:y});if(box)m.roomBlocks.push(box);};
 // Banners sit on the stone faces, with the skull collection gathered in one chamber.
 for(const x of [112,208])prop('dragon75_banner_red',x,239);
 for(const x of [56,264])prop('dragon75_banner_blue',x,287);
 prop('dragon75_plinth_blue',160,309,[142,287,178,309],true);prop('dragon75_skull',160,295);
 for(const [x,spr]of [[96,'dragon75_skull_small'],[224,'dragon75_skull_round']]){prop('dragon75_plinth_red',x,366,[x-12,344,x+12,366],true);prop(spr,x,351);}
 for(const [x,y]of [[63,405],[97,454],[228,450],[257,397],[136,342],[183,347]])prop('scientist_gold',x,y,null,true);
 m.roomBlocks.push([148,406,172,416]);
 for(const [x,y]of [[64,495],[256,495]])prop('dragon75_statue',x,y,[x-7,y-10,x+7,y]);
 // Insert whole native floor/wall strips, retaining sprite sizes and hazard animation timing.
 const cuts=[632,1136,1168,...Array.from({length:10},(_,i)=>680+i*48),1432,1744,1776,...Array.from({length:6},(_,i)=>1480+i*48)].sort((a,b)=>a-b);
 for(const id of ['tp1','ds1','sn1']){
  const map=W.maps[id],offset=id==='tp1'?0:320,points=cuts.map(y=>y+offset),Y=y=>y+16*points.filter(c=>c<=y).length;
  map.templeRooms=(map.templeRooms||[['ghost',1216,1336],['golem',416,536]]).map(([kind,a,b])=>[kind,Y(a),Y(b)]);
  for(const key of ['templeFloors','templeWalls','roomBlocks'])map[key]=map[key].map(([l,t,r,b])=>[l,Y(t),r,Y(b)]);
  for(const actor of map.roomActors){actor.y=Y(actor.y);if(actor.sy>=0)actor.sy=Y(actor.sy);if(actor.spr==='first_temple_torch')actor.spr='torch77_'+id;}
  for(const npc of map.npcs){npc.y=Y(npc.y);if(npc.sy>=0)npc.sy=Y(npc.sy);}
  for(const foe of map.foes)foe.y=(Y(foe.y*16+16)-16)/16;
  for(const gate of map.templeGates)gate.y=Y(gate.y);
  for(const trap of map.templeTraps){trap.rows=trap.rows.map(Y);trap.leverY=Y(trap.leverY);}
  for(const machine of map.templeMachines||[])machine.y=Y(machine.y);
  for(const hazard of map.templeHazards||[])hazard.y=Y(hazard.y);
  for(const door of map.doors){door.y=Y(door.y*16)/16;if(door.triggerRect)door.triggerRect.y=Y(door.triggerRect.y);}
  map.spawn[1]=Y(map.spawn[1]);map.h+=points.length;map.terr=terrRLE(Array(map.w*map.h).fill(DIRT));map.base_terr=map.terr;
  const entry=W.maps.world.doors.find(d=>d.to===id);if(entry){entry.tx=(map.spawn[0]-8)/16;entry.ty=(map.spawn[1]-16)/16;}
 }
}
function refineTemples78(){
 for(const id of ['ds1','sn1']){
  const m=W.maps[id],X=x=>Math.round(64+(x-32)*.75),Y=y=>y<288?y+64:Math.round(352+(y-288)*160/224);
  for(const o of m.roomActors)if(o.y<512){o.x=X(o.x);o.y=Y(o.y);if(o.sy>=0)o.sy=Y(o.sy);}
  m.roomBlocks=m.roomBlocks.map(([l,t,r,b])=>b<512?[X(l),Y(t),X(r),Y(b)]:[l,t,r,b]);
  m.templeFloors=m.templeFloors.filter(r=>r[1]>=512);m.templeFloors.push([112,304,208,352],[64,352,256,512]);
  m.templeWalls=m.templeWalls.filter(r=>r[1]>512);m.templeWalls.push([64,512,144,560],[176,512,256,560]);
  const chest=CHESTS.find(c=>c.map===id);chest.y=(Y(chest.y*16+16)-16)/16;
 }
  // Smaller treasure rooms; preserve native sprite sizes and the existing exit thresholds.
 for(const id of ['tp1','ds1','sn1']){
  const m=W.maps[id],first=id==='tp1',limit=first?192:512;
  const X=x=>Math.round(80+(x-64)*5/6),Y=y=>first?Math.round(80+(y-64)*.875):(y<352?y+16:Math.round(368+(y-352)*.9));
  for(const o of m.roomActors)if(o.y<limit){o.x=X(o.x);o.y=Y(o.y);if(o.sy>=0)o.sy=o.y;}
  for(const n of m.npcs)if(n.y<limit){n.x=X(n.x);n.y=Y(n.y);}
  m.roomBlocks=m.roomBlocks.map(([l,t,r,b])=>b<limit?[X(l),Y(t),X(r),Y(b)]:[l,t,r,b]);
  const chest=CHESTS.find(c=>c.map===id);chest.x=(X(chest.x*16+8)-8)/16;chest.y=(Y(chest.y*16+16)-16)/16;
  m.templeFloors=m.templeFloors.filter(b=>b[1]>=limit);m.templeFloors.push(...(first?[[80,80,240,192]]:[[128,320,192,368],[80,368,240,512]]));
  m.templeWalls=m.templeWalls.filter(b=>b[1]>limit);m.templeWalls.push([80,limit,144,limit+48],[176,limit,240,limit+48]);
 }
 for(const id of ['tp1','ds1','sn1']){
  const m=W.maps[id],safe=y=>!(m.templeTraps||[]).some(h=>h.rows.some(row=>Math.abs(y-row)<36))&&!(m.templeHazards||[]).some(h=>Math.abs(y-h.y)<30)&&!(m.templeMachines||[]).some(h=>Math.abs(y-h.y)<30)&&!m.templeGates.some(g=>Math.abs(y-g.y)<42);
  m.roomActors=m.roomActors.filter(o=>!/^temple73_(skull|bones)$/.test(o.spr)||safe(o.y));
  let variant=0;for(const o of m.roomActors)if(/^temple73_(skull|bones)$/.test(o.spr))o.spr='floor78_'+(variant++%9);
  for(let y=600;y<m.h*16-80;y+=112){if(!safe(y))continue;const x=variant%2?126:194;if(!m.templeFloors.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]))continue;m.roomActors.push({spr:'floor78_'+(variant++%9),x,y,sy:-100,schoolArt:true,stillFrame:0});}
  if(id==='ds1')m.templeFloors.push(...[[80,1032,112,1048],[208,1096,240,1112],[80,1160,112,1176],[208,1224,240,1240],[80,1288,112,1304],[208,1352,240,1368],[80,1416,112,1432],[208,1480,240,1496]]);
  if(id==='ds1'){const placed={scientist_pod_tall:120,scientist_pod_mid:208,scientist_roots_tall:112,scientist_roots_small:220,scientist_web:112};for(const o of m.roomActors)if(o.y<512&&placed[o.spr]){const old=o.x;o.x=o.spr==='scientist_web'&&old>160?216:placed[o.spr];for(const b of m.roomBlocks)if(Math.abs((b[0]+b[2])/2-old)<5&&Math.abs(b[3]-o.y)<3){b[0]+=o.x-old;b[2]+=o.x-old;}}}
  m.editableWallOrigins=[];
  for(const [map,x,y,sx,sy,wallKey]of WALL78_PIECES){if(map!==id)continue;
   const solid=!m.templeFloors.some(b=>x+8>=b[0]&&x+8<b[2]&&y+8>=b[1]&&y+8<b[3])||m.templeWalls.some(b=>x+8>=b[0]&&x+8<b[2]&&y+8>=b[1]&&y+8<b[3]);
   m.editableWallOrigins.push([x,y,x+16,y+16]);m.roomActors.push({spr:`wall78_${id}_${x}_${y}`,editKey:wallKey||`wall:${x}:${y}`,x:x+8,y:y+16,sy:-50,schoolArt:true,stillFrame:0,editableWall:true,wallSolid:solid});
  }
 }
 for(const h of W.maps.sn1.templeHazards)if(h.type==='flame')W.maps.sn1.roomActors.push({spr:'flame78_vent',x:h.dir>0?108:212,y:h.y+8,sy:-40,schoolArt:true,stillFrame:0});
}
function finishTempleLayouts82(){
 const allCuts={"tp1":[704,752,800,848,896,960,1008,1056,1104,1152,1200,1264,1312,1696,1744,1792,1840,1888,1936,1968,2016,2064],"ds1":[1024,1072,1120,1168,1216,1280,1328,1376,1424,1472,1520,1584,1632,2016,2064,2112,2160,2208,2256,2288,2336,2384],"sn1":[1024,1072,1120,1168,1216,1280,1328,1376,1424,1472,1520,1584,1632,2016,2064,2112,2160,2208,2256,2288,2336,2384]};
 for(const id of ['tp1','ds1','sn1']){
  const m=W.maps[id],cuts=allCuts[id].filter(c=>id!=='ds1'||c>=1912),Y=y=>y+16*cuts.filter(c=>c<=y).length;
  const oldRooms=m.templeRooms.map(r=>[...r]);
  for(const [kind,top,bottom]of oldRooms){
   m.templeFloors=m.templeFloors.map(b=>b[0]===68&&b[1]===top&&b[2]===252&&b[3]===bottom?[70,top+1,250,bottom-1]:b);
   m.templeWalls=m.templeWalls.map(([l,t,r,b])=>t===top-48?[l===68?70:l,t+1,r===252?250:r,b+1]:t===bottom?[l===68?70:l,t-1,r===252?250:r,b-1]:[l,t,r,b]);
   for(const gate of m.templeGates)if(gate.y===top)gate.y++;else if(gate.y===bottom+48)gate.y--;
   for(const actor of m.roomActors)if(!actor.editableWall){if(actor.y===top)actor.y++;else if(actor.y===bottom+48)actor.y--;}
  }
  m.templeRooms=oldRooms.map(([k,t,b])=>[k,Y(t+1),Y(b-1)]);
  for(const key of ['templeFloors','templeWalls','roomBlocks'])m[key]=m[key].map(([l,t,r,b])=>[l,Y(t),r,Y(b)]);
  for(const o of m.roomActors){if(o.editableWall)continue;o.y=Y(o.y);if(o.sy>=0)o.sy=o.y;}
  for(const n of m.npcs){n.y=Y(n.y);if(n.sy>=0)n.sy=n.y;}
  for(const f of m.foes)f.y=(Y(f.y*16+16)-16)/16;
  for(const g of m.templeGates)g.y=Y(g.y);
  for(const h of m.templeTraps){h.rows=h.rows.map(Y);h.leverY=Y(h.leverY);}
  for(const h of m.templeMachines||[])h.y=Y(h.y);
  for(const h of m.templeHazards||[])h.y=Y(h.y);
  for(const d of m.doors){d.y=Y(d.y*16)/16;if(d.triggerRect)d.triggerRect.y=Y(d.triggerRect.y);}
  m.spawn[1]=Y(m.spawn[1]);m.h+=cuts.length;m.terr=terrRLE(Array(m.w*m.h).fill(DIRT));m.base_terr=m.terr;
  for(const o of m.roomActors)if(o.editableWall){const x=o.x,y=o.y-8;o.wallSolid=!m.templeFloors.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3])||m.templeWalls.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]);}
  const entry=W.maps.world.doors.find(d=>d.to===id);if(entry){entry.tx=(m.spawn[0]-8)/16;entry.ty=(m.spawn[1]-16)/16;}
 }
}
const foeVisibleTopCache82=new Map();
function foeVisibleTop82(sp,frame){
 const key=sp[0]+':'+sp[1]+':'+frame;if(foeVisibleTopCache82.has(key))return foeVisibleTopCache82.get(key);
 const c=document.createElement('canvas');c.width=sp[2];c.height=sp[3];const cctx=c.getContext('2d');drawGameImage(cctx,sheetOf(sp),sp[0]+frame*sp[2],sp[1],sp[2],sp[3],0,0,sp[2],sp[3]);const pixels=cctx.getImageData(0,0,c.width,c.height).data;
 let top=0;outer:for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>64){top=y;break outer;}foeVisibleTopCache82.set(key,top);return top;
}
function editedTempleWallCollision(x,y){
 if(!MD?.editableWallOrigins)return null;
 if(MD.roomActors.some(o=>o.editableWall&&!o.editorDeleted&&o.wallSolid&&x>=o.x-8&&x<o.x+8&&y>=o.y-16&&y<o.y))return true;
 if(MD.editableWallOrigins.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]))return false;
 return null;
}
function stepDragonTempleTraps(dt){
 if(!MD.templeDragon)return;
 for(const a of MD.templeHazards){
  const disabled=bossGone[MAPID+':traps:'+a.hall],phase=(MD.templeClock+a.offset)%(a.type==='flame'?3.4:5.6);
  if(a.type==='flame'){
   a.frame=disabled||phase<1.5||phase>=2.3?0:Math.min(8,1+Math.floor((phase-1.5)/.1));a.active=!disabled&&a.frame>=3&&a.frame<=6;
   if(a.active&&Math.abs(P.y-a.y)<9&&P.x>115&&P.x<205)hurtPlayer(1);
  }else{
   a.active=!disabled&&phase>=1.4&&phase<4.2;
   const prev=a.x;a.x=a.active?128+64*Math.sin((phase-1.4)/2.8*Math.PI):128;
   a.frame=a.active?Math.floor(MD.templeClock*12)%6:0;
   if(a.active&&Math.abs(P.y-a.y)<12&&P.x>Math.min(prev,a.x)-11&&P.x<Math.max(prev,a.x)+11)hurtPlayer(1);
  }
 }
}
function drawDragonTempleTraps(){
 if(!MD?.templeDragon)return;
 for(const a of MD.templeHazards){
  if(a.type==='flame'&&a.frame===0)continue;
  const sp=SPR['dragon75_'+(a.type==='saw'?'saw':'flame_'+(a.dir>0?'r':'l'))];
  const x=a.type==='saw'?a.x:(a.dir>0?156:196);
  drawGameImage(ctx,atlasImg,sp[0]+a.frame*sp[2],sp[1],sp[2],sp[3],Math.round(x-sp[2]/2),a.y-16,sp[2],sp[3]);
 }
}
function installCastleCellar(){
 const m=W.maps.royal_cellar={w:20,h:18,title:'Cinderhold — Dragon Larder',royal:true,roomArt:'dragon75_cellar',bg:'#19171c',floorbg:'#615b50',spawn:[160,256],objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],npcs:[],foes:[],roomActors:[],roomBlocks:[[0,0,320,48],[0,48,16,288],[304,48,320,288],[16,272,144,288],[176,272,304,288]],collisionOverrides:{},doors:[{x:9.5,y:17,to:'royal_westhall',tx:17,ty:4.5,dir:'d',explicitDir:true,triggerRect:{x:144,y:272,w:32,h:16}}],cellarCaches:[]};
 m.terr=terrRLE(Array(360).fill(DIRT));m.base_terr=m.terr;
 for(const y of [112,208])for(let i=0;i<4;i++){
  const x=64+i*64,id=m.cellarCaches.length;m.cellarCaches.push({id,x,y,kind:id%2?'fish':'meat',amount:10});
  m.roomActors.push({spr:'dragon75_food'+(i+1),x,y,schoolArt:true});m.roomBlocks.push([x-20,y-20,x+20,y]);
 }
 for(const x of [32,288]){m.roomActors.push({spr:'dragon75_barrels',x,y:260,schoolArt:true});m.roomBlocks.push([x-14,245,x+14,260]);}
 for(const x of [32,160,288])m.roomActors.push({spr:'first_temple_torch',x,y:48,schoolArt:true});
 const hall=W.maps.royal_westhall;
 hall.doors.push({x:16.5,y:3,to:'royal_cellar',tx:9.5,ty:15,dir:'u',explicitDir:true,triggerRect:{x:264,y:48,w:32,h:16}});
 hall.collisionOverrides ||= {};
 hall.roomActors.push({spr:'royal_door',x:280,y:64,schoolArt:true,royalDoor:true});
 for(let y=6;y<=10;y++)for(let x=33;x<37;x++)hall.collisionOverrides[x+','+y]=false;
 const armory=W.maps.royal_armory;
 for(const [spr,x,y]of [['rack1',64,65],['rack2',160,65],['rack3',112,153]]){armory.roomActors.push({spr:'dragon75_'+spr,x,y,schoolArt:true});armory.roomBlocks.push([x-20,y-12,x+20,y]);}
}
function tryCellarSupplies(){
 if(!MD.cellarCaches)return false;
 const a=MD.cellarCaches.find(a=>Math.abs(P.x-a.x)<26&&P.y>=a.y-3&&P.y<a.y+34);if(!a)return false;
 const key='royal_cellar:supply:'+a.id;
 if(bossGone[key]){toast('This shelf has already supplied your dragon.');return true;}
 bossGone[key]=true;if(a.kind==='fish')dragonFish+=a.amount;else boarMeat+=a.amount;
 toast('Collected 10 '+(a.kind==='fish'?'fresh fish':'boar meat')+' — free provisions for your dragon.');saveGame();return true;
}
function stepTempleMachines(dt){
 if(!MD.templeScience)return;
 if(foesHeld){MD.templeShots=[];return;}
 for(const a of MD.templeMachines){
  const disabled=bossGone[MAPID+':traps:'+a.hall],time=MD.templeClock+a.offset,cycle=Math.floor(time/4.8),phase=time%4.8;
  a.frame=disabled||phase>3.4?0:phase<1.5?0:phase<1.9?1:phase<2.2?2:Math.min(9,3+Math.floor((phase-2.2)/.12));
  if(!disabled&&phase>=2.2&&a.lastCycle!==cycle){a.lastCycle=cycle;MD.templeShots.push({hall:a.hall,type:a.type,x:a.x,y:a.y,dir:a.dir,age:0});}
 }
 const live=[];
 for(const shot of MD.templeShots){
  if(bossGone[MAPID+':traps:'+shot.hall])continue;
  const prev=shot.x;shot.x+=shot.dir*(shot.type==='arrow'?110:76)*dt;shot.age+=dt;
  if(Math.abs(P.y-shot.y)<(shot.type==='arrow'?8:10)&&P.x>=Math.min(prev,shot.x)-7&&P.x<=Math.max(prev,shot.x)+7){hurtPlayer(1);continue;}
  if(shot.x>112&&shot.x<208&&shot.age<2)live.push(shot);
 }
 MD.templeShots=live;
}
function drawTempleShots(){
 if(!MD?.templeScience)return;
 for(const shot of MD.templeShots){const sp=SPR['scientist_'+(shot.type==='arrow'?'arrow_'+(shot.dir>0?'r':'l'):'ball')];drawGameImage(ctx,atlasImg,sp[0],sp[1],sp[2],sp[3],Math.round(shot.x-sp[2]/2),Math.round(shot.y-sp[3]/2),sp[2],sp[3]);}
}
function templeRoomOf(f){return f.idx<4?'ghost':'golem';}
function templeRoomCleared(room){return !!bossGone[MAPID+':room:'+room]||!foes.some(f=>templeRoomOf(f)===room&&f.st!=='dead'&&!f.ally);}
function stepTempleGates(dt){
 if(!MD?.templeContinuous)return;
 for(const [room,top,bottom] of (MD.templeRooms||[['ghost',1216,1336],['golem',416,536]])){
  if(P.y>top&&P.y<bottom)MD.templeActive[room]=true;
  if(templeRoomCleared(room))bossGone[MAPID+':room:'+room]=true;
  for(const f of foes)if(templeRoomOf(f)===room&&f.st!=='dead'){f.x=Math.max(84,Math.min(236,f.x));f.y=Math.max(top+32,Math.min(bottom-16,f.y));}
 }
 for(const g of MD.templeGates){const open=foesHeld||(g.room?templeRoomCleared(g.room):!!g.entered);
  g.open=Math.max(0,Math.min(1,g.open+(open?1:-1)*dt*3));}
 if(chestOpen[MD.templeOldChest||'tp4'])chestOpen[MAPID]=true;
 if(!sceneHold()&&fadeDir===0){MD.templeClock+=dt;for(const h of MD.templeTraps){h.leverOpen=Math.min(1,h.leverOpen+(bossGone[MAPID+':traps:'+h.id]?dt*3:0));if(foesHeld||bossGone[MAPID+':traps:'+h.id])continue;for(let i=0;i<h.rows.length;i++)if(templeSpikeFrame(h.id,i)===3&&P.x>112&&P.x<208&&Math.abs(P.y-h.rows[i])<9)hurtPlayer(1);}stepTempleMachines(dt);stepDragonTempleTraps(dt);}

}
function templeSpikeFrame(id,row){
 if(foesHeld||bossGone[MAPID+':traps:'+id])return 0;
 const phase=((MD.templeClock||0)+row*.8)%4.8;
 return phase<2?0:phase<2.45?1:phase<2.65?2:phase<3.85?3:phase<4.1?4:5;
}
function tryTempleLever(){
 if(!MD?.templeContinuous)return false;
 const h=MD.templeTraps.find(h=>Math.hypot(P.x-h.leverX,P.y-h.leverY)<27);
 if(!h)return false;
 const key=MAPID+':traps:'+h.id;
 if(bossGone[key])toast('The traps in this hall are already disabled.');
 else{bossGone[key]=true;toast((MD.templeScience||MD.templeDragon)?'The mechanisms fall silent. This hall is safe now.':'The spikes settle into the floor. This hall is safe now.');}
 return true;
}
function recoverTempleArrival(force=false){
 if(!MD?.templeContinuous)return;
 if(force||!Number.isFinite(P.x)||!Number.isFinite(P.y)||!canStand(P.x,P.y)){
  [P.x,P.y]=MD.spawn;P.dir='u';P.dir8='n';chunks.clear();
 }
}
function blockedByTempleGate(x,y){return !!MD?.templeContinuous&&MD.templeGates.some(g=>g.open<.99&&x>=144&&x<176&&y>=g.y-16&&y<g.y);}

function repairCoralmere(){
  const m=W.maps.world;
  // Imported world collision patch: exact 8-pixel cells cleared by the map editor.
  m.collisionOverrides=m.collisionOverrides||{};
  for(const [x,y0,y1] of [[4108,1016,1028],[4109,1016,1027],[4110,1017,1017],[4092,1015,1027],[4093,1015,1028],[4091,1020,1025],[4090,1020,1025],[4078,1020,1026],[4062,1020,1025],[4063,1020,1025],[4046,1019,1026],[4059,1020,1027],[4035,1020,1025],[4034,1022,1025],[4034,1014,1015],[4035,1014,1015],[4033,1008,1016],[4022,1020,1027],[4030,1041,1048],[4042,1042,1042],[4043,1042,1047],[4029,1052,1053],[4036,1051,1051],[4037,1052,1053]])
    for(let y=y0;y<=y1;y++)m.collisionOverrides[x+','+y]=false;
  // Latest dock boundary patch; applied after the earlier walkable-cell patch.
  for(let y=1038;y<=1055;y++)m.collisionOverrides['4029,'+y]=true;
  for(const [a,b,y] of [[4028,4043,1056],[4052,4079,1056],[4080,4102,1042],[4080,4103,1048]])
    for(let x=a;x<=b;x++)m.collisionOverrides[x+','+y]=true;
  for(const [x,a,b] of [[4078,1049,1055],[4079,1040,1041],[4078,1037,1040]])
    for(let y=a;y<=b;y++)m.collisionOverrides[x+','+y]=true;
  for(const [x,y] of [[4051,1056],[4044,1056],[4104,1046],[4104,1047],[4104,1048],[4105,1046],[4105,1047],[4105,1048],[4046,1014],[4047,1014],[4048,1015],[4047,1015],[4046,1015]])m.collisionOverrides[x+','+y]=false;
  // Latest fine-grained dock walkway clearances (8-pixel cells).
  for(const [y,a,b] of [[1039,4044,4044],[1039,4069,4069],[1039,4071,4071],[1040,4044,4045],[1040,4060,4060],[1040,4063,4066],[1040,4069,4071],[1041,4044,4045],[1041,4053,4053],[1041,4060,4060],[1041,4063,4066],[1041,4069,4071],[1042,4044,4045],[1042,4053,4053],[1042,4060,4060],[1042,4064,4071],[1042,4078,4079],[1043,4044,4045],[1043,4053,4053],[1043,4060,4075],[1043,4078,4079],[1044,4044,4052],[1044,4074,4079],[1044,4092,4101],[1045,4044,4052],[1045,4056,4056],[1045,4061,4061],[1045,4074,4079],[1045,4092,4101],[1046,4044,4045],[1046,4051,4053],[1046,4056,4056],[1046,4061,4061],[1046,4092,4092],[1046,4097,4103],[1047,4034,4042],[1047,4044,4045],[1047,4053,4053],[1047,4056,4056],[1047,4061,4061],[1047,4092,4103],[1048,4034,4035],[1048,4044,4047],[1048,4050,4053],[1048,4056,4056],[1048,4061,4061],[1048,4092,4092],[1048,4103,4103],[1049,4034,4035],[1049,4044,4053],[1049,4056,4062],[1050,4077,4077],[1051,4077,4077],[1052,4044,4045],[1052,4070,4070],[1052,4073,4073],[1052,4077,4077],[1053,4044,4045],[1053,4070,4070],[1053,4073,4077],[1054,4036,4045],[1054,4070,4074],[1055,4036,4045],[1055,4070,4074],[1060,4047,4047],[1061,4047,4047],[1066,4047,4047],[1067,4047,4047],[1068,4047,4047],[1069,4045,4047]])
    for(let x=a;x<=b;x++)m.collisionOverrides[x+','+y]=false;
  // Restore the original dock cargo suppressed by old object-index hide entries.
  m.hidden=(m.hidden||[]).filter(i=>!/^hb_/.test(W.names[m.objs[i*3]]||''));
  // Keep cargo at the working edges, leaving the shop approach and patrol clear.
  const dockMoves={hb_shark:[32398,8393],hb_fishmat:[32594,8348],hb_barrel_crate:[32605,8430],
    hb_sack:[32576,8436],hb_fishbox_ice:[32258,8400],hb_fishbox_grn:[32326,8438],
    hb_icecrate:[32543,8338]};
  for(let i=0;i<m.objs.length;i+=3){
    const name=W.names[m.objs[i]],pos=dockMoves[name];
    if(pos&&m.objs[i+1]>32200&&m.objs[i+1]<33000&&m.objs[i+2]>8300&&m.objs[i+2]<8600){m.objs[i+1]=pos[0];m.objs[i+2]=pos[1];}
  }
  m.objs.push(W.names.indexOf('hb_boy_grn'),32488,8544);
  m.moorings=[
    [32360,8506,32344,8482],[32543,8448,32543,8480],
    [32577,8448,32577,8478],[32779,8384,32766,8424],
    [32407,8530,32422,8557],[32401,8576,32439,8576],
    [32831,8391,32853,8379]
  ];
  const doryn=m.npcs.find(n=>n.n==='Doryn');
  if(doryn){
    const {x,y}=doryn;
    m.roomActors=(m.roomActors||[]).filter(a=>!(a.castSeat&&a.x===x&&[y+5,y+30].includes(a.y)));
    m.roomBlocks=(m.roomBlocks||[]).filter(b=>!(b[0]===x-23&&b[1]===y+1));
    m.npcs=m.npcs.filter(n=>n!==doryn);
    Object.assign(doryn,{x:96,y:131,talkX:62,talkY:140,seatClipY:128,loc:'Coralmere, indoors (house43)',stationary:true,patrol:undefined,sceneReserved:true});
    W.maps.house43.npcs.push(doryn);
    W.maps.house43.roomActors.push({spr:'ichair1',x:96,y:136,sy:130,schoolArt:true,castSeat:true,sceneReserved:true});
  }
  m.npcs=m.npcs.filter(n=>n.n!=='Orrin');
  const maren=m.npcs.find(n=>n.n==='Maren');
  if(maren)Object.assign(maren,{x:32536,y:8376,patrol:true,
    patrolPoints:[[32536,8376],[32584,8376],[32584,8432],[32536,8432]],
    patrolSpeed:25,patrolRest:3500,stationary:false,sceneReserved:true});
  const seller=m.npcs.find(n=>n.n==='Nerissa');
  if(seller){
    const old=seller.counter;
    for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]==='stall2'&&m.objs[i+1]===old.x&&m.objs[i+2]===old.y){m.objs[i+1]=32472;m.objs[i+2]=8392;}
    Object.assign(seller,{x:32472,y:8380,talkX:32472,talkY:8406,counter:{x:32472,y:8392},
      seatClipY:8380,seated:false,stationary:true,sceneReserved:true,sy:8370});
  }
}
function npcTalkDistance(n){
  if(n.counter){
    const c=n.counter;
    if(playerFacing4()!=='n'||Math.abs(P.x-c.x)>22||P.y<c.y+2||P.y>c.y+34)return Infinity;
    return Math.hypot(P.x-n.talkX,P.y-n.talkY);
  }
  return Math.min(Math.hypot(n.x-P.x,n.y-P.y),Math.hypot((n.talkX??n.x)-P.x,(n.talkY??n.y)-P.y));
}
function arrangeNpcCast(){
  const seatIds=[1,2,6,8,11,12,13];
  for(const i of seatIds){const s=SPR['pack_pupil_'+i];SPR['seated_body_'+i]=[s[0],s[1],s[2],s[3]-9,s[4]];}
  for(const [name,source]of [['king_seated','kg_idle_d'],['maddock_seated','maddock_smith107_idle_d']]){
    const s=SPR[source];SPR[name]=s.slice();SPR[name][3]=s[3]-7;
  }
  const usePack=(n,p,directions=false,walk=false)=>{
    n.packSpr=p;n.packDirections=directions;n.packWalk=walk;n.lookId=p;
    n.body=undefined;n.sk=undefined;n.school=false;n.desertNative=false;n.idleFrame=undefined;n.sy=undefined;
    n.stationary=!walk;n.patrol=undefined;n.goto=undefined;
  };
  const useSkin=(n,sk)=>{usePack(n,undefined);n.sk=sk;n.lookId='npc_'+sk;n.stationary=false;};
  const world=W.maps.world;
  const packs={Orin:'market_citizen4',Calder:'guild_fighter2',Weft:'market_citizen2',
    Torvald:'pack_smith',Sella:'guild_mage4',Sennet:'guild_elder',Ada:'pack_drinker2',
    Wren:'pack_grandmother',Berta:'pack_mage_red',Chanter:'guild_mage1',Morel:'guild_mage2'};
  const skins={Mella:'chef_chloe',Dorrick:'miner_mike',
    Bevan:'lumberjack_jack',Bregga:'farmer_bob',Ingrid:'villf',Sigrun:'nanf',Orrin:'bartender_bruno'};
  for(const n of world.npcs){
    if(packs[n.n]){const p=packs[n.n],d=!!SPR[p+'_idle_d'],w=['d','u','e','w'].every(k=>!!SPR[p+'_walk_'+k]);usePack(n,p,d,w);}
    if(skins[n.n])useSkin(n,skins[n.n]);
    if(n.n==='Serjeant Bram')usePack(n,'guild_fighter_sword',true,true);
    if(n.n==='Tolan')useSkin(n,'gwil');
    if(n.n==='Merrin'||n.n==='Asta')usePack(n,'pack_pupil_'+(n.n==='Merrin'?8:11)+'_chair');
  }
  // Repeated background actors use only the limited, seated character sheets.
  let seatIndex=0;
  function seat(n,m,id,index){
    const old={x:n.x,y:n.y};n.talkX=undefined;n.talkY=undefined;
    const early=/Millwood|Thornwell|Forgewick/.test(n.loc||'')||/^(school2?|tavern|inn|smithy|house27_bedroom|house02_bedroom)$/.test(id);
    const pool=early?[1,2,11,12,13]:seatIds;
    let pupil=n.n==='Winnie'?1:n.n==='Joss'?2:n.n==='Tam'?11:pool[seatIndex++%pool.length];
    if(pupil===8&&!/Sandspire/.test(n.loc||''))pupil=12;
    if(n.n==='Tam'){
      n.d=['Tam: Come in, Corin. Joss has the press working again, so the whole house smells of apples.',
        'Tam: I have put a bottle aside for Nan. I will take it over when this batch is settled.'];
      n.d2=['Tam: The early apples make sharp cider. I leave the sweeter ones on the tree another week.'];
      n.dd=['Tam: Nan came round yesterday. She tries to sound brave when she asks after you.',
        'Tam: Send word when you can. A mother can imagine a hundred disasters before breakfast.'];
      n.dd2=['Tam: There is always a place at our table, Corin. Even heroes need a proper meal.'];
      n.dv=['Tam: We opened our best cider when the news arrived. Joss nearly broke the tap in his hurry.'];
      n.dv2=['Tam: For the first time in years, I can think about next harvest without wondering what the king will take.'];
      n.dragonNear=['Tam: Keep your dragon away from the drying apples, please. I lost enough to the wasps.'];
      n.dragonRumor=['Tam: I heard about your travelling companion. Does Nan know how much it eats?'];
      n.dragonRumor2=['Tam: If you fly over the orchard, tell me whether the roof needs mending. Joss keeps saying it can wait.'];
      n.bio='A human mother and apple farmer in Millwood, raising her children with Joss.';
    }
    usePack(n,'seated_body_'+pupil);n.seated=true;n.stationary=true;n.f='d';n.flip=false;
    let table=null,chair=null;
    if(n.n==='Tam'&&id==='house27_bedroom'){
      table=m.roomBlocks.find(b=>b[0]===50&&b[1]===133);
      n.x=(table[0]+table[2])/2;n.y=table[1]-3;
      (m.roomActors ||= []).push({spr:'ichair0',x:n.x,y:n.y+7,sy:n.y-1,schoolArt:true,castSeat:true});
      m.roomActors.push({roomCrop:[table[0],table[1]-5,table[2]-table[0],table[3]-table[1]+5],x:n.x,y:table[3],sy:table[3],castSeat:true});
      n.talkX=table[0]-12;n.talkY=n.y+2;chair=true;
    }
    if(index===0&&/^house\d\d$/.test(id)){
      const blocks=m.roomBlocks||[];
      table=blocks.find(b=>b[1]>=125&&b[1]<=155&&b[2]-b[0]>=40&&b[2]-b[0]<=65);
      if(table){
        // Round tables have a north chair; rectangular desks have a south chair.
        const round=table[2]-table[0]>=58&&table[3]-table[1]>=24;
        if(round){
          n.x=(table[0]+table[2])/2;n.y=table[1]-12;
          const crop=[table[0],table[1]-14,table[2]-table[0],table[3]-table[1]+14];
          (m.roomActors ||= []).push({roomCrop:crop,x:n.x,y:table[3],sy:table[3],castSeat:true});
          n.talkX=table[0]-12;n.talkY=n.y+2;
          chair=true;
        }else{
          const b=blocks.find(b=>b!==table&&b[2]-b[0]<=15&&b[1]>=table[1]&&b[1]<=table[3]+25&&b[0]>table[0]-22&&b[0]<table[2]+22);
          if(b){n.x=(b[0]+b[2])/2;n.y=b[3]-4;chair=true;}
        }
      }
    }
    if(!chair){
      // A compact wooden chair supports residents in rooms without table seating.
      n.x=old.x;n.y=old.y;
      if(id==='smithy'){n.x=216;n.y=224;}
      if(id==='glasswork'){n.x=112;n.y=148;}
      if(id==='tavern'&&n.n==='Nyra'){n.x=344;n.y=210;}
      (m.roomActors ||= []).push({spr:'ichair0',x:n.x,y:n.y+7,sy:n.y-1,schoolArt:true,castSeat:true});
    }
    if(n.talkX===undefined){n.talkX=n.x;n.talkY=n.y+17;}
    if(id==='tavern'&&n.n==='Grusk'){n.talkX=348;n.talkY=238;}
  }
  const exceptions=new Set(['world','house26','tavern','school','school2','inn','witchmoor']);
  for(const [id,m]of Object.entries(W.maps)){
    if(exceptions.has(id))continue;
    // Remove the free-standing stools that belonged to the old character placements.
    m.roomActors=(m.roomActors||[]).filter(a=>a.spr!=='stump_stool');
    for(const [i,n]of (m.npcs||[]).entries()){
      if(n.n==='King Halvard'){
        n.seatSpr='king_seated';
        // The old wooden chair was only a placeholder. Use the approved throne,
        // centered on Halvard's seat and backed against the north end of the hall.
        m.roomActors=(m.roomActors||[]).filter(a=>!(a.castSeat&&/^ichair/.test(a.spr||'')&&Math.abs(a.x-n.x)<10));
        m.roomActors.push({throneRoomAsset:true,x:n.x,y:n.y+9,sy:n.y-2,sceneReserved:true});continue;
      }
      if(n.n==='Elder Maddock'){
        // Maddock stands only when his scripted movement needs his walking sheet.
        n.seatSpr='maddock_seated';
        m.roomActors.push({spr:'ichair0',x:n.x,y:n.y+7,sy:n.y-1,schoolArt:true,castSeat:true});continue;
      }
      if(n.school){
        const remove=n.n==='Dunstan'?'smithy_anim_8':n.n==='Sela'?'glassnew_anim_4':n.n==='Elin'?'glassnew_anim_6':n.lookId;
        m.roomActors=m.roomActors.filter(a=>a.spr!==remove);
      }
      seat(n,m,id,i);
    }
  }
  const apprentice=world.npcs.find(n=>n.n==='Ember');
  if(apprentice){world.roomActors=world.roomActors.filter(a=>a.spr!=='smithout_anim_7');seat(apprentice,world,'world',1);}
  const keepIndoor={};
  const indoorUsed=new Set(world.npcs.filter(n=>!n.seated&&!/pupil/.test(n.packSpr||'')).map(n=>n.lookId||n.packSpr||n.body||'npc_'+n.sk));
  for(const id of ['school','school2','tavern','inn']){
    const m=W.maps[id];if(!m)continue;
    for(const [i,n]of m.npcs.entries()){
      if(n.n==='Sable'){
        m.roomActors=m.roomActors.filter(a=>a.spr!=='school2_anim_5');seat(n,m,id,i);continue;
      }
      if(n.school||/pupil/.test(n.packSpr||''))continue;
      if(keepIndoor[n.n]){
        const p=keepIndoor[n.n];if(p.startsWith('npc:'))useSkin(n,p.slice(4));else usePack(n,p);
        n.stationary=true;
      }else if(id==='inn')usePack(n,'pack_drinker1');
      else if(indoorUsed.has(n.lookId||n.packSpr)||['Bess','Dorr','Nyra','Ser Anwen','Vale'].includes(n.n))seat(n,m,id,i);
      indoorUsed.add(n.lookId||n.packSpr);
    }
  }
  // Outdoor walking sheets get short real patrols, apart from counters and story actors.
  const story=new Set(['Bryn','Hettie','Gwil','Odo','King Halvard','Serjeant Bram','Doran','Tolan','Elder Maddock','Rowan the Hunter','Bramble','Liora']);
  for(const n of world.npcs){
    if(story.has(n.n)||n.counter||n.seated||n.school||n.desertNative)continue;
    const walking=n.packWalk||n.sk&&['d','s','u'].every(d=>SPR['npc_'+n.sk+'_'+d]);
    if(walking){n.stationary=false;n.patrol=[n.x/16-.5,n.y/16-1,n.x/16+1,n.y/16-1];n.patrolRest=4500;}
  }
  world.roomActors=(world.roomActors||[]).filter(a=>a.spr!=='stump_stool');
  // Liora owns the red-haired fishing appearance. The harbour kobold is
  // reserved for the desert; the tavern's distinct table performer stays.
  for(const key of ['objs','scatter','fobjs']){
    const a=world[key];if(!Array.isArray(a))continue;const kept=[];
    for(let i=0;i<a.length;i+=3){
      if(['hb_boy_red','hb_kobold'].includes(W.names[a[i]]))continue;
      kept.push(a[i],a[i+1],a[i+2]);
    }
    world[key]=kept;
  }
  // Keep the early villages human; retain monster sheets for later regions.
  for(const name of ['Doryn','Tessa']){const n=world.npcs.find(n=>n.n===name);if(n)seat(n,world,'world',1);}
  const merrin=world.npcs.find(n=>n.n==='Merrin');if(merrin)usePack(merrin,'pack_pupil_2_chair');
  for(const id of ['school','school2','tavern']){
    const m=W.maps[id];if(!m)continue;
    for(const n of m.npcs||[]){
      const match=/^pack_pupil_([68])_chair$/.exec(n.packSpr||'');
      if(match)usePack(n,'pack_pupil_'+(match[1]==='6'?2:11)+'_chair');
    }
  }
  restoreSchoolCast();
  restoreTavernCast();
  reserveMillwoodCast();
  finishTownCast();
  repairSeating();
}
// Four authored poses: resting, breathing in, half blink and closed blink.
// Long open-eye holds and a brief blink follow the native seated characters.
function villagerIdleFrame(o,t,frames){
  if(o.idleSeed===undefined){
    let seed=2166136261;
    for(const c of (o.n||'')+'|'+o.packSpr)seed=Math.imul(seed^c.charCodeAt(0),16777619);
    o.idleSeed=seed>>>0;
  }
  const cycle=4.8+((o.idleSeed>>>8)%9)*0.1;
  const phase=(o.idleSeed%997)/997*cycle;
  const p=((t+phase)%cycle)/cycle;
  const frame=p<0.20?0:p<0.46?1:p<0.88?0:p<0.895?2:p<0.92?3:p<0.935?2:0;
  return frame%frames;
}
function finishTownCast(){
  const world=W.maps.world;
  // Bryn is retired; Ada now appears only in her own Thornwell home.
  world.npcs=world.npcs.filter(n=>n.n!=='Bryn'&&n.n!=='Ada'&&n.n!=='Ember');
  const townOf=(id,n)=>{
    const match=(n.loc||'').match(/Millwood|Thornwell|Forgewick|Sandspire|Coralmere|Hollybeck|Shroom Pass/);
    if(match)return match[0];
    if(['inn','school','school2','tavern'].includes(id))return 'Thornwell';
    if(['smithy','glasswork','glasshouse','mine'].includes(id))return 'Forgewick';
    if(id==='world')return n.x<2000?'Millwood':n.x<7000?'Thornwell':n.x<18000?'Forgewick':n.x<29000?'Sandspire':n.x<38000?'Coralmere':'Hollybeck';
    return id;
  };
  const regionalCast = {"common":[{"key":"villager_seated_common_a6_0","sex":"female","species":"human"},{"key":"villager_seated_common_a6_1","sex":"female","species":"human"},{"key":"villager_seated_common_a6_2","sex":"female","species":"human"},{"key":"villager_seated_common_a6_3","sex":"male","species":"human"},{"key":"villager_seated_common_a6_4","sex":"male","species":"human"},{"key":"villager_seated_common_a6_5","sex":"male","species":"human"},{"key":"villager_seated_common_b6_0","sex":"female","species":"human"},{"key":"villager_seated_common_b6_1","sex":"female","species":"human"},{"key":"villager_seated_common_b6_2","sex":"female","species":"human"},{"key":"villager_seated_common_b6_3","sex":"male","species":"human"},{"key":"villager_seated_common_b6_4","sex":"male","species":"human"},{"key":"villager_seated_common_b6_5","sex":"male","species":"human"},{"key":"villager_seated_common_c6_0","sex":"female","species":"human"},{"key":"villager_seated_common_c6_1","sex":"female","species":"human"},{"key":"villager_seated_common_c6_2","sex":"male","species":"human"},{"key":"villager_seated_common_c6_3","sex":"male","species":"human"},{"key":"villager_seated_common_c6_4","sex":"male","species":"human"},{"key":"villager_seated_common_c6_5","sex":"male","species":"human"},{"key":"villager_seated_common_d6_0","sex":"female","species":"human"},{"key":"villager_seated_common_d6_1","sex":"male","species":"human"},{"key":"villager_seated_common_d6_2","sex":"male","species":"human"},{"key":"villager_seated_common_d6_3","sex":"male","species":"human"},{"key":"villager_seated_common_d6_4","sex":"male","species":"goblin"},{"key":"villager_seated_common_d6_5","sex":"male","species":"orc"}],"desert":[{"key":"villager_seated_desert_a5_0","sex":"female","species":"human"},{"key":"villager_seated_desert_a5_1","sex":"female","species":"human"},{"key":"villager_seated_desert_a5_2","sex":"female","species":"human"},{"key":"villager_seated_desert_a5_3","sex":"male","species":"human"},{"key":"villager_seated_desert_a5_4","sex":"male","species":"human"},{"key":"villager_seated_desert_b4_0","sex":"female","species":"lizard"},{"key":"villager_seated_desert_b4_1","sex":"female","species":"human"},{"key":"villager_seated_desert_b4_2","sex":"male","species":"lizard"},{"key":"villager_seated_desert_b4_3","sex":"male","species":"human"}],"coast":[{"key":"villager_seated_coast_a4_0","sex":"female","species":"human"},{"key":"villager_seated_coast_a4_1","sex":"female","species":"human"},{"key":"villager_seated_coast_a4_2","sex":"female","species":"human"},{"key":"villager_seated_coast_a4_3","sex":"male","species":"human"},{"key":"villager_seated_coast_b3_0","sex":"female","species":"human"},{"key":"villager_seated_coast_b3_1","sex":"female","species":"human"},{"key":"villager_seated_coast_b3_2","sex":"male","species":"human"}],"snow":[{"key":"villager_seated_snow5_0","sex":"female","species":"human"},{"key":"villager_seated_snow5_1","sex":"female","species":"human"},{"key":"villager_seated_snow5_2","sex":"female","species":"human"},{"key":"villager_seated_snow5_3","sex":"male","species":"human"},{"key":"villager_seated_snow5_4","sex":"male","species":"human"}]};
  const counts=new Map();
  const women=new Set(['Ada','Della','Fara','Hester','Junia','Lysa','Dagna','Gwyneth','Petra','Suri','Una','Vela','Rania','Yara','Coral','Edda','Ilsa','Elin','Maren','Sela','Celia','Zella','Iris','Asta','Tessa','Astrid','Nerissa','Greta']);
  function seatedLook(n,id){
    const town=townOf(id,n),used=counts.get(town)||new Set();counts.set(town,used);
    const region=town==='Sandspire'?'desert':town==='Coralmere'?'coast':town==='Hollybeck'?'snow':'common';
    const pool=regionalCast[region].filter(s=>town!=='Thornwell'||s.species==='human');
    const sex=women.has(n.n)?'female':'male';
    const actor=pool.find(s=>s.sex===sex&&!used.has(s.key));
    if(!actor)throw Error('Regional seated cast exhausted for '+n.n+' in '+town);
    used.add(actor.key);
    Object.assign(n,{packSpr:actor.key,lookId:actor.key,
      packDirections:false,packWalk:false,sk:undefined,body:undefined,school:false,
      seated:true,seatSpr:undefined,stationary:true,patrol:undefined,goto:undefined,f:'d',flip:false,sceneReserved:true});
  }
  for(const [id,m]of Object.entries(W.maps)){
    if(['tavern','school','school2'].includes(id))continue;
    for(const n of m.npcs||[]){
      if(townOf(id,n)==='Millwood')continue;
      if(n.seated||/^pack_pupil_/.test(n.packSpr||'')||id==='inn')seatedLook(n,id);
    }
  }
  // The tavern owns every variant of its performers and patrons.
  // Remove decorative aliases of active, named villagers as well.
  for(const key of ['objs','scatter','fobjs']){
    const a=world[key]||[],out=[];
    for(let i=0;i<a.length;i+=3)if(!['hb_boy_grn','hb_gramma','hb_oldman'].includes(W.names[a[i]]))out.push(a[i],a[i+1],a[i+2]);
    world[key]=out;
  }
  const linna=world.npcs.find(n=>n.n==='Linnet');
  if(linna){linna.n='Linna';for(const k of ['d','d2','dd','dd2','dv','dv2','dragonNear','dragonRumor','dragonRumor2'])if(Array.isArray(linna[k]))linna[k]=linna[k].map(s=>s.replace(/^Linnet:/,'Linna:'));}
  const marek=world.npcs.find(n=>n.n==='Marek');
  if(marek)Object.assign(marek,{packSpr:'pack_boy',lookId:'pack_boy',packDirections:false,packWalk:false,stationary:true,patrol:undefined});
  // Colm's eating sheet is distinct from the tavern patrons. All other
  // seated outdoor residents receive a real table, rather than a road chair.
  world.roomActors=(world.roomActors||[]).filter(a=>!a.castSeat);
  const tableSeat=(m,n,x,y)=>{
    Object.assign(n,{x,y,talkX:x-35,talkY:y+8,sceneReserved:true});
    m.roomActors.push({spr:'ichair1',x,y:y+5,sy:y-1,schoolArt:true,castSeat:true,sceneReserved:true});
    m.roomActors.push({spr:'itable0',x,y:y+30,sy:y+30,schoolArt:true,castSeat:true,sceneReserved:true});
    (m.roomBlocks ||= []).push([x-23,y+1,x+23,y+28]);
  };
  for(const n of world.npcs){
    if(!n.seated||n.counter)continue;
    if(n.n==='Merrin'||n.n==='Asta'){
      const i=n.n==='Merrin'?0:1,rect=i?[216,212,32,28]:[104,183,32,27],src=SPR.ifloor_tavern_patio;
      const spr='patio_table_front_'+i;SPR[spr]=[src[0]+rect[0],src[1]+rect[1],rect[2],rect[3],1];
      n.x=3728+rect[0]+16;n.y=848+rect[1]+3;n.talkX=n.x+(i?34:-34);n.talkY=n.y+14;n.sceneReserved=true;
      world.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,castSeat:true,sceneReserved:true});
      world.roomActors.push({spr,x:n.x,y:848+rect[1]+rect[3],schoolArt:true,castSeat:true,sceneReserved:true});
      (world.roomBlocks ||= []).push([n.x-16,n.y,n.x+16,848+rect[1]+rect[3]]);
    }else tableSeat(world,n,n.x,n.y);
  }
  // Every cropped indoor torso sits at a table's north edge. Reuse the
  // room's furniture artwork so the tabletop correctly masks the cut.
  for(const [id,m]of Object.entries(W.maps)){
    if(['world','tavern','school','school2','house26','cinderhold','witchmoor'].includes(id))continue;
    const residents=(m.npcs||[]).filter(n=>n.seated||n.seatSpr);if(!residents.length)continue;
    m.roomActors=(m.roomActors||[]).filter(a=>!a.castSeat);
    if(id==='glasshouse'||id==='inn'){
      const rect=id==='glasshouse'?[88,100,106,18]:[160,112,80,25];
      residents.forEach((n,i)=>{
        n.x=id==='glasshouse'?112+i*36:200;n.y=rect[1]+3;
        n.talkX=n.x;n.talkY=rect[1]+rect[3]+10;n.sceneReserved=true;
        m.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,castSeat:true,sceneReserved:true});
      });
      m.roomActors.push({roomCrop:rect,x:rect[0]+rect[2]/2,y:rect[1]+rect[3],sy:rect[1]+rect[3],castSeat:true,sceneReserved:true});
      continue;
    }
    let table=(m.roomBlocks||[]).find(b=>b[1]>=125&&b[1]<=155&&b[2]-b[0]>=40&&b[2]-b[0]<=65);
    if(table&&m.roomArt){
      const w=table[2]-table[0],h=table[3]-table[1];
      const inset=['house33','house36','house39'].includes(id)?43:w>=58?(h>=24?14:17):h>=24?5:6;
      const top=table[1]-inset,cx=(table[0]+table[2])/2;
      for(const [i,n]of residents.entries()){
        n.x=cx+(residents.length>1?(i-(residents.length-1)/2)*22:0);n.y=top+3;
        n.talkX=i?table[2]+12:table[0]-12;n.talkY=top+12;n.sceneReserved=true;
        m.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,castSeat:true,sceneReserved:true});
      }
      m.roomActors.push({roomCrop:[table[0]-2,top,w+4,table[3]-top],x:cx,y:table[3],sy:table[3],castSeat:true,sceneReserved:true});
    }else{
      // Bedrooms/workshops without a dining table get a compact writing table.
      for(const [i,n]of residents.entries()){
        let x=n.x,y=n.y;
        if(/_bedroom/.test(id)){x=136;y=112;}
        if(id==='glasshouse'){x=144+i*72;y=156;}
        if(id==='smithy'){x=216;y=224;}
        if(id==='glasswork'){x=72;y=138;}
        if(id==='inn'){x=120;y=184;}
        tableSeat(m,n,x,y);
      }
    }
  }
  const routes={
    Gwil:[[282,6992],[394,6992],[394,7016],[282,7016]],
    Orin:[[4288,1440],[4440,1440]],
    Mella:[[4096,1760],[4224,1760]],
    Linna:[[4288,1664],[4288,1536]],
    Garrow:[[3816,1696],[3816,1744]]
  };
  for(const [i,n]of world.npcs.entries()){
    if(routes[n.n]){
      n.x=routes[n.n][0][0];n.y=routes[n.n][0][1];n.patrolPoints=routes[n.n];n.patrol=true;
      n.patrolFrom=undefined;n.stationary=false;n.sceneReserved=true;
    }
    if(n.patrol&&!n.desertNative){n.patrolRest=2800+(i*1397)%4200;n.patrolSpeed=30+(i*7)%17;n.routeSeed=i;}
  }
  const bevan=world.npcs.find(n=>n.n==='Bevan');if(bevan){bevan.x=12472;bevan.y=3280;bevan.sceneReserved=true;}
  const gwil=world.npcs.find(n=>n.n==='Gwil');
  if(gwil){
    gwil.loc='Millwood, farm';gwil.bio='A Millwood woodcutter helping tend the village farm.';
    gwil.d=['Gwil: The wood can wait a morning. These beds need tending before the sun gets high.', 'Gwil: Hettie asked me to keep an eye on the farm. I reckon the crows have already noticed the change.'];
    gwil.d2=['Gwil: I mended that fence with oak offcuts. Nothing goes to waste around here.', 'Gwil: Mind the seedlings, Corin. They have only just found their feet.'];
  }
}
let npcCollisionActor=null;
function canNpcStand(x,y,actor){
  const previous=npcCollisionActor;npcCollisionActor=actor;
  try{return ![[-5.5,-7],[5.5,-7],[-5.5,-1],[5.5,-1]].some(([dx,dy])=>isSolid(x+dx,y+dy,true));}
  finally{npcCollisionActor=previous;}
}
function patrolRoute(n){
  const clear=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.ceil(d/4));
    for(let i=0;i<=steps;i++)if(!canNpcStand(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps,n))return false;return true;};
  if(n.patrolPoints&&n.patrolPoints.every((p,i,a)=>clear(p,a[(i+1)%a.length])))return n.patrolPoints;
  const origin=[n.x,n.y],points=[origin],dirs=[[1,0],[0,1],[-1,0],[0,-1]],seed=n.routeSeed||0;
  for(let i=0;i<4;i++){
    const d=dirs[(i+seed)%4];let end=origin;
    for(let dist=8;dist<=48+(seed%4)*16;dist+=8){const p=[origin[0]+d[0]*dist,origin[1]+d[1]*dist];if(!clear(origin,p))break;end=p;}
    if(end!==origin){points.push(end,origin);if(points.length>=5)break;}
  }
  return points;
}

function repairSeating(){
  const world=W.maps.world;
  world.npcs=world.npcs.filter(n=>n.n!=='Mella');
  // Remove the old picnic-basket/flute figure from Hollybeck. The sheet is
  // legacy market art and is no longer assigned to any resident.
  world.npcs=world.npcs.filter(n=>n.n!=='Hakon');
  delete NPC_VOICES.Hakon;

  // Rowan stands beside house00. Make its resident his wife and give their
  // cottage and conversation an explicit connection to the hunter quest.
  const rowanHome=W.maps.house00;
  const ada=rowanHome?.npcs?.find(n=>n.n==='Ada');
  if(ada){
    rowanHome.title='Thornwell — Rowan and Ada’s Cottage';
    ada.bio='Rowan the Hunter’s wife. She keeps their Thornwell cottage while he ranges with Bramble.';
    ada.d=[
      'Ada: Rowan leaves before sunrise and still manages to bring half the forest home on his boots.',
      'Corin: Bramble brings the other half.',
      'Ada: That is why I married the hunter and merely tolerate his dog.'
    ];
    ada.d2=[
      'Ada: If you see my husband outside, remind him that a hunt ends when he comes home.',
      'Ada: Bramble remembers. Rowan occasionally needs prompting.'
    ];
  }

  // These sheets have different transparent padding around the character.
  // Per-sprite anchors put each visible body at the centre of the table's
  // straight north edge without changing the authored clipping height.
  for(const [id,name,x]of [
    ['house46','Edda',80],
    ['house47','Fennel',75],
    ['house50','Bjorn',74]
  ]){
    const n=W.maps[id]?.npcs?.find(n=>n.n===name);
    if(n){n.x=x;n.stationary=true;n.sceneReserved=true;}
  }
  const linna=world.npcs.find(n=>n.n==='Linna');
  if(linna)Object.assign(linna,{stationary:true,patrol:undefined,patrolPoints:undefined,goto:undefined,sk:undefined,packWalk:false,idleFrame:0});
  const wren=world.npcs.find(n=>n.n==='Wren');
  if(wren){
    const oldX=wren.x,oldY=1872;
    world.roomActors=(world.roomActors||[]).filter(a=>!(a.x===oldX&&
      ((a.spr==='ichair1'&&a.y===oldY+5)||(a.spr==='itable0'&&a.y===oldY+30))));
    world.roomBlocks=(world.roomBlocks||[]).filter(b=>!(b[0]===oldX-23&&b[1]===oldY+1&&b[2]===oldX+23&&b[3]===oldY+28));

    const bi=world.npcs.findIndex(n=>n.n==='Berta');
    const berta=bi>=0?world.npcs.splice(bi,1)[0]:null;
    const sales=berta?.sells||['potion','salt'];
    Object.assign(wren,{x:4120,y:1786,talkX:4120,talkY:1830,counter:{x:4120,y:1816},
      sells:sales,seated:false,seatClipY:undefined,stationary:true,sceneReserved:true,idleFrame:undefined,
      bio:'Thornwell’s herbalist and merchant, tending the greenhouse market stand.'});

    if(berta){
      delete berta.sells;delete berta.counter;
      Object.assign(berta,{x:88.5,y:132,talkX:47,talkY:141,packSpr:'villager_seated_common_c6_0',
        lookId:'villager_seated_common_c6_0',packDirections:false,packWalk:false,seated:true,
        seatClipY:129,stationary:true,sceneReserved:true,idleFrame:undefined,patrol:undefined,
        bio:'A retired Thornwell market herbalist who still mixes stock for Wren.',
        d:['Berta: Wren has taken over the greenhouse stall. I am discovering how quiet this room can be.',
          'Berta: She knows the herbs, and she has more patience for customers than I ever did.'],
        d2:['Berta: I still mix stock for Wren. Leaving the counter did not mean leaving the work.']});
      const home=W.maps.house02;
      home.title='Thornwell — Berta’s Cottage';
      home.npcs.push(berta);
      home.roomActors.push({spr:'ichair1',x:berta.x,y:berta.y+5,sy:berta.y-1,
        schoolArt:true,castSeat:true,sceneReserved:true});
    }
  }
  for(const[id,m]of Object.entries(W.maps)){
    const crops=(m.roomActors||[]).filter(a=>a.roomCrop);
    for(const n of m.npcs||[]){
      if(!n.seated&&!n.seatSpr)continue;
      const crop=crops.find(a=>n.x>=a.roomCrop[0]-12&&n.x<=a.roomCrop[0]+a.roomCrop[2]+12&&Math.abs(n.y-a.roomCrop[1])<20);
      if(crop)n.seatClipY=crop.roomCrop[1];
    }
    // A room-background rectangle must never redraw over the player.
    m.roomActors=(m.roomActors||[]).filter(a=>!a.roomCrop);
    if(['house23','house25','house27'].includes(id))m.roomActors=m.roomActors.filter(a=>!(a.castSeat&&a.spr==='ichair1'));
  }
  for(const[id,name]of [['house27','Joss'],['house27_bedroom','Tam']]){
    const n=W.maps[id].npcs.find(n=>n.n===name);if(n)n.y-=1;
  }
  // Rania and Latif share the straight north edge of a Sandspire square table.
  const m=W.maps.house41;
  m.roomActors=m.roomActors.filter(a=>!a.castSeat);
  m.roomActors.push({roomBackgroundPatch:{spr:'house33_room',rect:[32,104,120,96]},x:32,y:104,sy:-100,sceneReserved:true});
  m.roomBlocks=m.roomBlocks.filter(b=>!(b[0]===59&&b[1]===150));
  m.roomBlocks.push([65,116,111,172],[46,143,59,162],[117,143,130,162]);
  for(const[i,n]of m.npcs.entries()){
    n.x=77+i*22;n.y=113;n.seatClipY=110;n.talkX=i?143:33;n.talkY=126;n.sceneReserved=true;
    m.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,sceneReserved:true});
  }
}
function drawNpcFrame(o,s,frame,img){
  // Sella's native hooded sheet has one pose per direction; breathe at fixed feet.
  if(o.n==='Sella'&&o.stationary&&s[4]===1){
    const h=s[3]-(Math.sin(performance.now()/1000*1.8)>0.65?1:0);
    drawGameImage(ctx,img,s[0],s[1],s[2],s[3],Math.round(o.x-s[2]/2),Math.round(o.y-h),s[2],h);return;
  }
  const clip=o.seatClipY!==undefined&&!o.goto&&!(o.seatSpr&&(scene||bossScene||hatchExit));
  if(clip){ctx.save();ctx.beginPath();ctx.rect(o.x-s[2]/2-1,o.y-s[3]-2,s[2]+2,Math.max(0,o.seatClipY-(o.y-s[3])+2));ctx.clip();}
  drawGameImage(ctx,img,s[0]+frame*s[2],s[1],s[2],s[3],Math.round(o.x-s[2]/2),Math.round(o.y-s[3]),s[2],s[3]);
  if(clip)ctx.restore();
}

function millwoodSpriteFamily(key){
  if(!key)return '';
  const pupil=/^(?:seated_body_|pack_pupil_)(\d+)/.exec(key);
  if(pupil)return 'pupil_'+pupil[1];
  if(/^hettie96|^market_bread$/.test(key))return 'hettie96';
  if(/^maddock_smith107|^maddock_seated$/.test(key))return 'maddock_smith107';
  if(/^kg(?:_|$)|^king_seated$/.test(key))return 'kg';
  if(/^pack_oldman|^hb_oldman$/.test(key))return 'pack_oldman';
  return key.replace(/_(?:idle|walk)_[duew]$/,'');
}
function reserveMillwoodCast(){
  const owners=new Map();
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]){
    if(!/Millwood/.test(n.loc||''))continue;
    const family=millwoodSpriteFamily(n.packSpr||n.body||(n.sk?'npc_'+n.sk:n.lookId));
    if(family)owners.set(family,n.n);
  }
  let replacement=0;
  for(const [id,m]of Object.entries(W.maps))for(const n of m.npcs||[]){
    const family=millwoodSpriteFamily(n.packSpr||n.body||(n.sk?'npc_'+n.sk:n.lookId));
    const owner=owners.get(family);if(!owner||owner===n.n)continue;
    // Only the remaining seated sheets may repeat outside Millwood.
    // Keep early-town humans and reserve lizards for the desert.
    const later=/Coralmere|Hollybeck|Shroom Pass/.test(n.loc||'');
    const pool=/Sandspire/.test(n.loc||'')?[12,6,8]:later?[12,6]:[12];
    const pupil=pool[replacement++%pool.length];
    const chair=/_chair$/.test(n.packSpr||'');
    n.packSpr=chair?'pack_pupil_'+pupil+'_chair':'seated_body_'+pupil;
    n.lookId=n.packSpr;n.packDirections=false;n.packWalk=false;n.stationary=true;
    n.sk=undefined;n.body=undefined;n.seatSpr=undefined;n.patrol=undefined;n.goto=undefined;
    n.seated=true;n.f='d';n.flip=false;
  }
}
function restoreTavernCast(){
  const m=W.maps.tavern;
  const rows=[
    ['Bess',9,240,128,240,150],['Ronan',6,208,144,224,148],
    ['Venn',7,80,176,64,190],['Hobb',8,160,184,144,168],
    ['Edric',10,120,272,134,266],['Dorr',11,416,240,440,240],
    ['Ser Anwen',12,280,256,260,238],['Grusk',13,388,272,388,230],
    ['Fen',14,184,192,220,190],
    ['Senn',16,304,256,318,236],['Dain',17,360,280,345,278],
    ['Rusk',18,144,176,131,193],['Linnet',19,256,176,256,196],
    ['Pip',20,208,208,220,216],['Vale',21,88,272,66,266],
    ['Cerys',22,320,288,338,288],['Nyra',23,416,280,440,280]
  ];
  m.npcs=m.npcs.filter(n=>n.n!=='Tobin');
  m.roomActors=m.roomActors.filter(a=>!a.castSeat&&!/^tavern_anim_/.test(a.spr));
  for(const [name,i,x,y,talkX,talkY]of rows){
    const spr='tavern_anim_'+i,n=m.npcs.find(n=>n.n===name);if(!n)continue;
    Object.assign(n,{x,y,talkX,talkY,school:true,stationary:true,sceneReserved:true,lookId:spr,
      packSpr:undefined,packDirections:false,packWalk:false,sk:undefined,body:undefined,seated:false,seatSpr:undefined,patrol:undefined,goto:undefined});
    m.roomActors.push({spr,x,y,schoolArt:true,sceneReserved:true,editKey:'tavern:'+spr});
  }
  // User's tavern PATCH v3. The requested removal supersedes Tobin's move.
  for(const [i,x,y]of [[17,374,272],[23,407,273],[12,286,256],
    [20,201,208],[8,162,176],[18,127,177]]){
    const a=m.roomActors.find(a=>a.spr==='tavern_anim_'+i);a.x=x;a.y=y;
  }
  m.roomActors.push({spr:'stump_stool',x:210,y:140,sy:143,schoolArt:true,
    sceneReserved:true,editKey:'tavern:ronan_stool'});
}
function restoreSchoolCast(){
  // Original scene sheets belong exclusively to the reading hall and study.
  const reader=SPR.school_src_Reader1;
  SPR.library_reader_red=[reader[0],reader[1],reader[2],40,reader[4]];
  const layouts={
    school:[
      ['Archivist Elowen','school_src_Librarian_idle',216,112,216,120],
      ['Mira','library_reader_red',258,192,306,202],
      ['Oren','school_anim_5',170,220,132,220],
      ['Tessa','school_anim_6',268,264,308,264]],
    school2:[
      ['Master Iven','school2_anim_3',72,184,54,190],
      ['Bram','school2_anim_6',96,192,118,197],
      ['Nell','school2_anim_4',248,184,281,190],
      ['Sable','school2_anim_5',112,160,112,164],
      ['Pella','school2_anim_7',136,192,168,190]]
  };
  for(const [id,rows]of Object.entries(layouts)){
    const m=W.maps[id];
    m.roomActors=m.roomActors.filter(a=>!a.castSeat&&/^(school_anim_[0-3]|school2_anim_[0-2])$/.test(a.spr));
    for(const [name,spr,x,y,talkX,talkY]of rows){
      const n=m.npcs.find(n=>n.n===name);if(!n)continue;
      Object.assign(n,{x,y,talkX,talkY,school:true,stationary:true,sceneReserved:true,lookId:spr,
        packSpr:undefined,packDirections:false,packWalk:false,sk:undefined,body:undefined,seated:false,seatSpr:undefined,patrol:undefined,goto:undefined});
      m.roomActors.push({spr,x,y,schoolArt:true,sceneReserved:true});
    }
  }
  // User's EMBERFELL PATCH v3: artwork and dialogue proxy have separate anchors.
  const study=W.maps.school2;
  for(const [spr,x,y]of [['school2_anim_3',79,175],['school2_anim_6',96,176],
    ['school2_anim_5',103,165],['school2_anim_4',249,176]]){
    const actor=study.roomActors.find(a=>a.spr===spr);actor.x=x;actor.y=y;
  }
  const iven=study.npcs.find(n=>n.n==='Master Iven');iven.x=71;iven.y=182;
}
