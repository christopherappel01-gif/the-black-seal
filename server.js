const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingTimeout: 20000, pingInterval: 10000 });
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.status(200).send('ok'));

const rooms = new Map();
const classes = ['Knight','Ranger','Thief','Mage','Monk','Engineer'];
const skills = ['Strength','Agility','Endurance','Awareness','Survival','Stealth','Knowledge','Craft','Influence','Spirit'];
const backgrounds = ['Noble','Outlander','Scholar','Sailor','Streetwise','Artisan'];
const backgroundEdges = {Noble:'Influence',Outlander:'Survival',Scholar:'Knowledge',Sailor:'Endurance',Streetwise:'Stealth',Artisan:'Craft'};
const talents = {
  Knight:{Guardian:{desc:'When you support another hero, your successful support grants +3 instead of +2.',kind:'support'},Champion:{desc:'Gain +1 on dangerous Strength or Endurance checks.',kind:'danger'}},
  Ranger:{Pathfinder:{desc:'Gain +1 on Survival or Awareness checks used to travel, scout or track.',kind:'skill'},Deadeye:{desc:'Gain +1 on dangerous Agility or Awareness checks.',kind:'danger'}},
  Thief:{Shadow:{desc:'Gain +1 on Stealth checks and infiltration challenges.',kind:'skill'},Saboteur:{desc:'Gain +1 on Craft checks involving locks, traps or mechanisms.',kind:'skill'}},
  Mage:{Seer:{desc:'Gain +1 on Awareness or Spirit checks involving magic or hidden truth.',kind:'skill'},Elementalist:{desc:'Gain +1 on dangerous Knowledge or Spirit checks.',kind:'danger'}},
  Monk:{Healer:{desc:'Your Heroic Intervention succeeds on 6+ instead of 7+.',kind:'intervene'},Warden:{desc:'Gain +1 on dangerous Spirit or Endurance checks.',kind:'danger'}},
  Engineer:{Inventor:{desc:'Gain +1 on Craft checks involving improvised solutions.',kind:'skill'},Architect:{desc:'Gain +1 on Craft or Knowledge during Team Challenges.',kind:'team'}}
};
const classGear = {Knight:'Sunsteel Buckler',Ranger:'Whisperstring Bow',Thief:'Masterwork Picks',Mage:'Rune Staff',Monk:'Dawn Pendant',Engineer:'royal Multi-tool'};
const itemCatalog = {
  black_wax:{name:'Black Wax Fragment',icon:'🜂',desc:'Wax stamped with a lion whose crown has been deliberately removed.'},
  guild_token:{name:'Lantern Guild Token',icon:'🗝️',desc:'A brass token recognised in the hidden routes beneath Greyhaven.'},
  healing_draught:{name:'Healing Draught',icon:'🧪',desc:'Single-use. Removes one wound.'},
  forged_pass:{name:'Forged Palace Pass',icon:'📜',desc:'A convincing pass carrying the seal of a minor royal office.'},
  ledger:{name:'Smugglers’ Ledger',icon:'📚',desc:'Names, wagon routes and payments tied to the hidden army.'},
  black_seal:{name:'The Black Seal',icon:'🜂',desc:'An old royal seal able to command the Gate of Kings.'},
  gate_key:{name:'Gate Key',icon:'◈',desc:'A metal key used to stabilise one of the Gate’s ancient control stations.'},
  watch_badge:{name:'Calder’s Watch Badge',icon:'🛡️',desc:'Proof that Captain Calder trusts the bearer to act for the Crown Watch.'},
  smoke_vial:{name:'Smoke Vial',icon:'💨',desc:'Single-use. Escape one dangerous ambush without a roll.'},
  royal_cipher:{name:'Royal Cipher Sheet',icon:'🔐',desc:'Decodes military orders written in the old palace hand.'},
  tower_plan:{name:'Old Tower Plan',icon:'🗺️',desc:'Shows forgotten stairs and service tunnels around the Gate of Kings.'},
  prince_ring:{name:'Prince Halren’s Signet',icon:'💍',desc:'A temporary mark of royal authority during the crisis.'}
};

const contextualClues = {
  arrival:{Ranger:'Two men near the gate are watching the courier rather than the festival.',Thief:'The chain on Aldren’s satchel has been filed almost through already.'},
  ambush:{Knight:'The attackers are trained to fight in formation, not street thieves.',Ranger:'The getaway route was prepared before your company arrived.'},
  courier:{Mage:'The black wax carries a faint binding enchantment associated with authority.',Monk:'Aldren is more frightened of whoever is inside the city than of the attackers outside it.'},
  lantern_cellar:{Thief:'Lysa is testing whether you understand underworld etiquette, not simply asking for money.',Ranger:'Two exits from the cellar are watched from outside.'},
  guildhall:{Monk:'Rook is angry because the conspiracy is using his people as scapegoats.',Thief:'Someone in the guildhall recognises the black wax and is trying not to show it.'},
  customs_archive:{Engineer:'The altered entries were scraped and rewritten with an official office blade.',Mage:'The same wagon route appears every seventh night.'},
  palace_audience:{Knight:'The uncrowned lion was once a legitimate royal badge before being outlawed.',Mage:'Lady Elira has wards on every door except the one behind her desk.'},
  river_docks:{Ranger:'The wagon wheels carry pale western clay not found near Greyhaven.',Thief:'The palace stable badge is genuine, but belongs to a horse that died last winter.'},
  masquerade:{Thief:'Three servants are moving like trained soldiers.',Noble:'Several guests are avoiding Lord Marshal Corvin rather than seeking his favour.'},
  council:{Knight:'Corvin’s proposed troop deployments would conveniently place his own officers at every gate.',Engineer:'The old Gate of Kings plan includes machinery far beyond a simple passage.'},
  old_tower:{Engineer:'The lift was repaired using army workshop fittings.',Mage:'The stone below the tower hums with dormant transit magic.'},
  gate_chamber:{Mage:'The Gate is not a portal to one place; the Black Seal selects among fixed destinations.',Engineer:'Destroying the seal would not destroy the Gate, only make it harder to control.'},
  betrayal:{Monk:'Corvin genuinely believes the Crown is too weak to survive the coming war.',Knight:'Several of his officers hesitate when he speaks of replacing the Prince.'},
  city_riot:{Ranger:'The fastest safe route changes every few minutes as barricades move.',Thief:'The guild tunnels could bypass most military checkpoints.'},
  final_council:{Monk:'The city’s factions distrust each other, but each has something the others need.',Knight:'A united force would outnumber Corvin’s remaining loyalists.'},
  gate_awakens:{Mage:'The Gate can be collapsed, stabilised, or locked behind multiple keys.',Engineer:'Three separate control stations could be assigned to different factions so no one can open it alone.'},
  black_seal:{Monk:'The final choice is not about who deserves power; it is about what system makes abuse hardest.'}
};

const emptyStats = () => Object.fromEntries(skills.map(s => [s,0]));
const cleanName = s => String(s||'').trim().slice(0,18).replace(/[<>]/g,'');
const rollD6 = () => 1 + crypto.randomInt(6);
function roomCode(){let c;do{c=crypto.randomBytes(4).toString('hex').slice(0,5).toUpperCase();}while(rooms.has(c));return c;}
function getPlayer(room,id){return room.players.find(p=>p.id===id);}
function socketPlayer(room,socket){return getPlayer(room,socket.data.playerId);}
function addLog(room,text){room.log.push(text);if(room.log.length>120)room.log.shift();}
function validStats(stats){return skills.every(s=>Number.isInteger(stats[s])&&stats[s]>=0&&stats[s]<=5)&&skills.reduce((a,s)=>a+stats[s],0)===20;}
function skillBonus(p,skill,cfg=null,isTeam=false){let n=Number(p.stats[skill]||0);if((p.cls==='Ranger'&&(skill==='Awareness'||skill==='Survival'))||(p.cls==='Mage'&&(skill==='Knowledge'||skill==='Spirit'))||(p.cls==='Engineer'&&skill==='Craft'))n++;if(backgroundEdges[p.background]===skill)n++;const t=p.talent;if(t){if((t==='Champion'||t==='Deadeye'||t==='Elementalist'||t==='Warden')&&cfg?.dangerous){const ok={Champion:['Strength','Endurance'],Deadeye:['Agility','Awareness'],Elementalist:['Knowledge','Spirit'],Warden:['Spirit','Endurance']}[t]||[];if(ok.includes(skill))n++;}if(t==='Pathfinder'&&['Survival','Awareness'].includes(skill))n++;if(t==='Shadow'&&skill==='Stealth')n++;if(t==='Saboteur'&&skill==='Craft')n++;if(t==='Seer'&&['Awareness','Spirit'].includes(skill))n++;if(t==='Inventor'&&skill==='Craft')n++;if(t==='Architect'&&isTeam&&['Craft','Knowledge'].includes(skill))n++;}return n;}

function challengeSkills(cfg){
  if(Array.isArray(cfg.allowedSkills)&&cfg.allowedSkills.length)return cfg.allowedSkills.filter(s=>skills.includes(s)).slice(0,2);
  const d=String(cfg.desc||'').toLowerCase(),r=cfg.recommended;
  if(/rune|inscription|decipher|study|understand|archive|history|heart|beacon shard|ancient/.test(d))return ['Knowledge','Spirit'];
  if(/track|trail|navigate|scout|bearings|route|path|find high ground/.test(d))return ['Survival','Awareness'];
  if(/sneak|unseen|infiltrat|quarters|shadow|escape.*guard/.test(d))return ['Stealth','Agility'];
  if(/convince|calm|rally|parley|negotiate|trust|speak|persuad/.test(d))return ['Influence','Spirit'];
  if(/repair|mechanism|machine|gate|bridge|rigging|construct|stabilis|bypass|lock/.test(d))return ['Craft','Knowledge'];
  if(/climb|cross|leap|chase|reach|rooftop/.test(d))return ['Agility','Endurance'];
  if(/hold|lift|force|drive|break|brace|fight|stand your ground/.test(d))return ['Strength','Endurance'];
  if(/resist|vision|fear|wounded|injured|heal|keep.*standing/.test(d))return ['Spirit','Endurance'];
  if(/identify|inspect|search|notice|spot|watch/.test(d))return ['Awareness','Knowledge'];
  const pair={Strength:'Endurance',Agility:'Awareness',Endurance:'Strength',Awareness:'Survival',Survival:'Awareness',Stealth:'Agility',Knowledge:'Spirit',Craft:'Knowledge',Influence:'Spirit',Spirit:'Influence'};
  return [r||'Awareness',pair[r]||'Knowledge'].filter((s,i,a)=>skills.includes(s)&&a.indexOf(s)===i).slice(0,2);
}
function supportSkillsFor(cfg){
  if(Array.isArray(cfg.supportSkills)&&cfg.supportSkills.length)return cfg.supportSkills.filter(s=>skills.includes(s)).slice(0,2);
  const main=challengeSkills(cfg), d=String(cfg.desc||'').toLowerCase();
  if(/mechanism|repair|bridge|rigging|gate/.test(d))return [...new Set(['Craft','Strength',...main])].slice(0,2);
  if(/convince|calm|rally|parley/.test(d))return [...new Set(['Influence','Knowledge',...main])].slice(0,2);
  if(/track|navigate|scout|route/.test(d))return [...new Set(['Awareness','Survival',...main])].slice(0,2);
  return main;
}
function threatRules(room){
  const t=Number(room.threat||0);
  return {supportTarget:t>=3?7:6,dangerPenalty:t>=5?1:0,label:t>=5?'Hunted':t>=3?'Pressured':'Clear'};
}
function teamProfile(cfg,room,group=null){
  const available=group?.playerIds?.length||room.players.length;
  const count=Math.max(1,Math.min(Number(cfg.teamSize||3),available));
  if(count===1)return {count,full:1,partial:null};
  if(count===2)return {count,full:2,partial:1};
  return {count,full:count,partial:count-1};
}
function applyTeamPartialCost(room,detail){
  if(room.supplies>0){room.supplies--;detail.partialEffect='Supplies -1';}
  else{room.threat=Math.min(6,room.threat+1);detail.partialEffect='Threat +1';}
}
function applyRollMoment(room,detail){
  const chosen=[];
  if(detail.type==='team')for(const r of detail.results||[])chosen.push(r.die);
  else if(detail.type!=='intervention'&&detail.type!=='item'){
    const dice=detail.dice||[];
    if(detail.rollMode==='advantage')chosen.push(Math.max(...dice));
    else if(detail.rollMode==='disadvantage')chosen.push(Math.min(...dice));
    else if(dice.length)chosen.push(dice[0]);
  }
  const heroic=chosen.includes(6), complication=chosen.includes(1);
  detail.heroicMoment=heroic;detail.complication=complication;
  if(heroic){
    if(room.threat>0){room.threat--;detail.heroicEffect='Threat -1';}
    else{room.hope=Math.min(6,room.hope+1);detail.heroicEffect='Hope +1';}
  }
  if(complication){room.threat=Math.min(6,room.threat+1);detail.complicationEffect='Threat +1';}
}
function outcomePayload(room,cfg,result,nextScene,detail={}){
  const label=result==='success'?'SUCCESS':result==='partial'?'PARTIAL SUCCESS':result==='instant'?'DECISION MADE':'SETBACK';
  const active=room.players[room.activeIndex];
  return {label,desc:cfg.desc||'The company acts.',fromScene:room.scene,nextScene,nextSceneChanged:!!nextScene,hero:active?.name||'',heroicMoment:!!detail.heroicMoment,heroicEffect:detail.heroicEffect||null,complication:!!detail.complication,complicationEffect:detail.complicationEffect||null,partialEffect:detail.partialEffect||null,successes:detail.successes,teamSize:detail.results?.length||null,dangerous:!!cfg.dangerous};
}
function emitOutcome(room,payload){io.to(room.code).emit('outcome',payload);}
function makeReturnPin(room){let pin;do{pin=String(1000+crypto.randomInt(9000));}while(room?.players?.some(p=>p.returnPin===pin));return pin;}
function awardGrowth(room,p,amount=1,reason='challenge'){if(!p)return; p.growth=(p.growth||0)+amount; let gained=0; while(p.growth>=5){p.growth-=5;p.skillPoints=(p.skillPoints||0)+1;gained++;} if(gained){io.to(p.socketId||'').emit('skillPointEarned',{amount:gained,reason});addLog(room,`${p.name} earned ${gained} Skill Point${gained>1?'s':''}.`);}}
function groupForPlayer(room,playerOrId){const id=typeof playerOrId==='string'?playerOrId:playerOrId?.id;return (room.groups||[]).find(g=>(g.playerIds||[]).includes(id))||null;}
function activePlayer(room){return room.players[room.activeIndex]||null;}
function activeGroup(room){return groupForPlayer(room,activePlayer(room))||(room.groups||[])[0]||null;}
function primaryScene(room){return activeGroup(room)?.scene||(room.groups||[])[0]?.scene||room.scene||'arrival';}
function groupPlayers(room,group){return (group?.playerIds||[]).map(id=>getPlayer(room,id)).filter(Boolean);}
function ensureMapVisited(room,scene){room.mapVisited=Array.isArray(room.mapVisited)?room.mapVisited:[];if(scene&&!room.mapVisited.includes(scene))room.mapVisited.push(scene);}
function initMainGroup(room,scene='arrival'){
  const ids=room.players.map(p=>p.id);room.groups=[{id:'main',name:'Company',playerIds:ids,scene,pending:null,lastRoll:null,trail:[scene],splitSet:null,waitingMerge:null}];
  for(const p of room.players)p.groupId='main';room.routeHistory=Array.isArray(room.routeHistory)?room.routeHistory:[];room.mapVisited=Array.isArray(room.mapVisited)?room.mapVisited:[];ensureMapVisited(room,scene);room.scene=scene;room.pending=null;room.lastRoll=null;
}
function publicState(room,viewerId=null){
  const g=viewerId?groupForPlayer(room,viewerId):activeGroup(room);const scene=g?.scene||primaryScene(room);
  return {...room,scene,pending:g?.pending||null,lastRoll:g?.lastRoll||null,currentGroupId:g?.id||null,currentGroupName:g?.name||'Company',currentGroupPlayerIds:[...(g?.playerIds||[])],groups:(room.groups||[]).map(x=>({id:x.id,name:x.name,playerIds:[...(x.playerIds||[])],scene:x.scene,trail:[...(x.trail||[])],waitingMerge:!!x.waitingMerge,splitSet:x.splitSet||null})),routeHistory:(room.routeHistory||[]).map(x=>({...x,trail:[...(x.trail||[])],playerIds:[...(x.playerIds||[])]})),players:room.players.map(({resumeToken,returnPin,socketId,...p})=>p),itemCatalog,talentCatalog:talents};
}
function migrateRoom(room){
  const legacySession=Number(room.session||0);
  if(room.scene==='birthday')room.scene='storm';
  if(room.phase==='break'||String(room.scene||'').startsWith('session_')){const starts={1:'green_gate',2:'goblin_border',3:'ash_coast',4:'mountain_gate',5:'final_road'};room.scene=starts[legacySession]||room.scene;room.phase='playing';}
  room.items=Array.isArray(room.items)?room.items:[];room.itemUses=room.itemUses||{};room.finalChoice=room.finalChoice||null;room.allies=room.allies||{};room.flags=room.flags||{};room.chapter=Number(room.chapter||(legacySession?Math.min(6,legacySession+1):1));room.routeHistory=Array.isArray(room.routeHistory)?room.routeHistory:[];room.mapVisited=Array.isArray(room.mapVisited)?room.mapVisited:[];
  room.players=(room.players||[]).map(p=>({...p,background:backgrounds.includes(p.background)?p.background:'Outlander',portrait:[1,2,3].includes(Number(p.portrait))?Number(p.portrait):1,talent:p.talent||null,gear:p.gear||classGear[p.cls]||null,cluesSeen:p.cluesSeen||{},supportReady:p.supportReady!==false,interventionReady:p.interventionReady!==false,growth:Number(p.growth||0),skillPoints:Number(p.skillPoints||0),stats:{...emptyStats(),...(p.stats||{})}}));
  if(room.phase==='playing'||room.phase==='ended'){
    if(!Array.isArray(room.groups)||!room.groups.length) initMainGroup(room,room.scene||'arrival');
    else {room.groups=room.groups.map(g=>({...g,playerIds:Array.isArray(g.playerIds)?g.playerIds:[],scene:g.scene||room.scene||'arrival',pending:null,lastRoll:g.lastRoll||null,trail:Array.isArray(g.trail)&&g.trail.length?g.trail:[g.scene||room.scene||'arrival'],waitingMerge:g.waitingMerge||null,splitSet:g.splitSet||null}));for(const p of room.players){const g=room.groups.find(x=>x.playerIds.includes(p.id));p.groupId=g?.id||room.groups[0]?.id||'main';}for(const g of room.groups)for(const s of g.trail)ensureMapVisited(room,s);}
  }
  delete room.birthdayBlessing;delete room.birthdayBlessingAvailable;delete room.birthdayChestOpened;delete room.session;delete room.sessionEnd;
  return room;
}
function serializeRoom(room){return {v:7,code:room.code,hostId:room.hostId,phase:room.phase,scene:primaryScene(room),chapter:room.chapter,activeIndex:room.activeIndex,round:room.round,hope:room.hope,threat:room.threat,supplies:room.supplies,relics:room.relics,flags:room.flags,items:room.items,itemUses:room.itemUses,allies:room.allies,ending:room.ending,finalChoice:room.finalChoice,log:room.log,mapVisited:room.mapVisited||[],routeHistory:room.routeHistory||[],groups:(room.groups||[]).map(g=>({...g,pending:null})),players:room.players.map(({socketId,connected,...p})=>({...p,connected:false}))};}
function encodeSave(room){return zlib.deflateRawSync(Buffer.from(JSON.stringify(serializeRoom(room)))).toString('base64url');}
function decodeSave(token){try{const data=JSON.parse(zlib.inflateRawSync(Buffer.from(String(token||''),'base64url')).toString('utf8'));if(!data||![2,3,4,5,6,7].includes(data.v)||!Array.isArray(data.players)||!data.players.length)return null;return migrateRoom(data);}catch{return null;}}
function emitCampaignSave(room){const host=getPlayer(room,room.hostId);if(host?.socketId)io.to(host.socketId).emit('campaignSave',{saveToken:encodeSave(room),scene:primaryScene(room),round:room.round,chapter:room.chapter,updatedAt:Date.now()});}
function emitRoom(room){for(const p of room.players)if(p.socketId)io.to(p.socketId).emit('state',publicState(room,p.id));emitCampaignSave(room);}
function emitContextClues(room,scene,playerIds=null){const clues=contextualClues[scene];if(!clues)return;const allowed=playerIds?new Set(playerIds):null;for(const p of room.players){if(allowed&&!allowed.has(p.id))continue;const txt=clues[p.cls];if(!txt||p.cluesSeen?.[scene]||!p.socketId)continue;p.cluesSeen=p.cluesSeen||{};p.cluesSeen[scene]=true;io.to(p.socketId).emit('secret',{title:`Only your ${p.cls} notices…`,text:txt});}}
function emitToGroup(room,group,event,payload){for(const p of groupPlayers(room,group))if(p.socketId)io.to(p.socketId).emit(event,payload);}
function emitOutcome(room,payload,group=activeGroup(room)){if(group)emitToGroup(room,group,'outcome',payload);else io.to(room.code).emit('outcome',payload);}
function outcomePayload(room,cfg,result,nextScene,detail={},group=activeGroup(room)){
  const label=result==='success'?'SUCCESS':result==='partial'?'PARTIAL SUCCESS':result==='instant'?'DECISION MADE':result==='sense'?'DISCOVERY':result==='miss'?'NOTHING FOUND':'SETBACK';const active=activePlayer(room);
  return {label,desc:cfg.outcomeText||cfg.desc||'The company acts.',fromScene:group?.scene||primaryScene(room),nextScene,nextSceneChanged:!!nextScene,hero:active?.name||'',heroicMoment:!!detail.heroicMoment,heroicEffect:detail.heroicEffect||null,complication:!!detail.complication,complicationEffect:detail.complicationEffect||null,partialEffect:detail.partialEffect||null,successes:detail.successes,teamSize:detail.results?.length||null,dangerous:!!cfg.dangerous,lowStakes:!!cfg.lowStakes};
}
function nextTurn(room){if(!room.players.length)return;const old=room.activeIndex;let idx=old;let crossed=false;for(let i=1;i<=room.players.length;i++){const n=(old+i)%room.players.length;if(n===0)crossed=true;const g=groupForPlayer(room,room.players[n]);if(g&&!g.waitingMerge){idx=n;break;}}room.activeIndex=idx;if(crossed){room.round++;room.players.forEach(p=>p.supportReady=true);addLog(room,`Round ${room.round} begins. Support actions refresh.`);}}
function newPlayer(socket,name,cls,room=null,background='Outlander',portrait=1){return {id:crypto.randomUUID(),socketId:socket.id,resumeToken:crypto.randomBytes(16).toString('hex'),returnPin:makeReturnPin(room),name,cls,background:backgrounds.includes(background)?background:'Outlander',portrait:[1,2,3].includes(Number(portrait))?Number(portrait):1,talent:null,stats:emptyStats(),gear:classGear[cls],wounds:0,growth:0,skillPoints:0,supportReady:true,interventionReady:true,ready:false,connected:true,cluesSeen:{},groupId:'main'};}
function newRoom(hostId){return migrateRoom({code:roomCode(),hostId,phase:'lobby',players:[],scene:'arrival',chapter:1,activeIndex:0,round:1,hope:6,threat:0,supplies:6,relics:0,flags:{},items:[],itemUses:{},allies:{},pending:null,lastRoll:null,ending:null,finalChoice:null,log:[],groups:[],routeHistory:[],mapVisited:[]});}
function attachSocket(room,p,socket){if(p.socketId&&p.socketId!==socket.id){const old=io.sockets.sockets.get(p.socketId);if(old)old.disconnect(true);}p.socketId=socket.id;p.connected=true;socket.data.roomCode=room.code;socket.data.playerId=p.id;socket.join(room.code);}
function sendJoined(socket,room,p,event='joined'){socket.emit(event,{roomCode:room.code,playerId:p.id,resumeToken:p.resumeToken,returnPin:p.returnPin,isHost:room.hostId===p.id});}
function hostOnly(room,socket){return room&&room.hostId===socket.data.playerId;}
function removeDisconnected(room,playerId){const idx=room.players.findIndex(p=>p.id===playerId);if(idx<0)return false;const p=room.players[idx];if(p.connected||p.id===room.hostId)return false;room.players.splice(idx,1);for(const g of room.groups||[])g.playerIds=g.playerIds.filter(id=>id!==playerId);room.groups=(room.groups||[]).filter(g=>g.playerIds.length);if(room.activeIndex>=room.players.length)room.activeIndex=0;return true;}
function hasItem(room,id){return room.items.includes(id);}
function addItem(room,id){if(!itemCatalog[id])return false;if(id!=='map_fragment'&&hasItem(room,id))return false;if(id==='map_fragment'&&room.items.filter(x=>x===id).length>=3)return false;room.items.push(id);io.to(room.code).emit('itemFound',{id,...itemCatalog[id]});addLog(room,`Item discovered: ${itemCatalog[id].name}.`);return true;}
function consumeItem(room,id){const i=room.items.indexOf(id);if(i<0)return false;room.items.splice(i,1);addLog(room,`${itemCatalog[id]?.name||id} was used.`);return true;}
function effect(room,cfg,success=true){const fx=success?(cfg.effects||{}):(cfg.failEffects||{});if(fx.flag)room.flags[fx.flag]=true;if(fx.flags)for(const k of fx.flags)room.flags[k]=true;if(fx.ally){room.allies[fx.ally]=true;if(room.allies.serayne&&room.allies.goblin_clan)room.flags.stewardship_unlocked=true;}if(fx.finalChoice)room.finalChoice=fx.finalChoice;if(fx.chapter)room.chapter=fx.chapter;if(fx.supplies)room.supplies=Math.max(0,room.supplies+fx.supplies);if(fx.hope)room.hope=Math.max(0,Math.min(6,room.hope+fx.hope));if(fx.threat)room.threat=Math.max(0,Math.min(6,room.threat+fx.threat));if(fx.relics)room.relics=Math.max(0,room.relics+fx.relics);if(fx.item)addItem(room,fx.item);if(fx.items)fx.items.forEach(id=>addItem(room,id));if(fx.consume)consumeItem(room,fx.consume);if(fx.finalCrisis){const chosen=fx.finalCrisis;if(chosen!=='gate'&&!room.allies.crew&&!room.allies.final_reinforcements){room.threat=Math.min(6,room.threat+1);room.flags.gate_fell=true;}if(chosen!=='people'&&!room.allies.serayne&&!room.allies.goblin_clan){room.hope=Math.max(0,room.hope-1);room.flags.people_lost=true;}if(chosen!=='heart'&&!room.flags.heart_understood&&!room.allies.thorne){room.threat=Math.min(6,room.threat+1);room.flags.heart_scar=true;}}}
function recordScene(room,group,scene){if(!group||!scene)return;group.trail=Array.isArray(group.trail)?group.trail:[];if(group.trail[group.trail.length-1]!==scene)group.trail.push(scene);ensureMapVisited(room,scene);}
function tryMerge(room,splitSet){const gs=(room.groups||[]).filter(g=>g.splitSet===splitSet);if(gs.length<2||!gs.every(g=>g.waitingMerge))return false;const target=gs[0].waitingMerge.target,key=gs[0].waitingMerge.key;if(!gs.every(g=>g.waitingMerge.key===key))return false;const ids=[...new Set(gs.flatMap(g=>g.playerIds))];room.routeHistory=room.routeHistory||[];for(const g of gs)room.routeHistory.push({id:g.id,name:g.name,playerIds:[...g.playerIds],trail:[...g.trail],complete:true});const merged={id:'group_'+crypto.randomBytes(3).toString('hex'),name:'Company',playerIds:ids,scene:target,pending:null,lastRoll:null,trail:[target],splitSet:null,waitingMerge:null};room.groups=room.groups.filter(g=>g.splitSet!==splitSet);room.groups.push(merged);for(const id of ids){const p=getPlayer(room,id);if(p)p.groupId=merged.id;}recordScene(room,merged,target);emitContextClues(room,target,ids);addLog(room,`The separated groups reunited at ${target.replaceAll('_',' ')}.`);return true;}
function transition(room,target,group=activeGroup(room)){if(!group)return;if(!target){group.pending=null;return;}group.pending=null;if(String(target).startsWith('@final')){room.phase='ended';room.ending='campaign';room.scene='campaign_end';for(const g of room.groups||[])g.scene='campaign_end';return;}if(String(target).startsWith('@merge:')){const parts=String(target).split(':');const key=parts[1],dest=parts.slice(2).join(':');if(!group.splitSet){group.scene=dest;recordScene(room,group,dest);emitContextClues(room,dest,group.playerIds);return;}group.waitingMerge={key,target:dest};group.scene='waiting_reunion';recordScene(room,group,'waiting_reunion');tryMerge(room,group.splitSet);return;}group.scene=target;recordScene(room,group,target);emitContextClues(room,target,group.playerIds);}
function requirementsMet(room,cfg){if(cfg.requiresItem&&!hasItem(room,cfg.requiresItem))return `You do not have ${itemCatalog[cfg.requiresItem]?.name||'the required item'}.`;if(cfg.requiresFlag&&!room.flags[cfg.requiresFlag])return 'That option is not available because of an earlier choice.';if(cfg.requiresNotFlag&&room.flags[cfg.requiresNotFlag])return 'You have already explored that option.';if(cfg.requiresItemCount){const count=room.items.filter(x=>x===cfg.requiresItemCount.id).length;if(count<cfg.requiresItemCount.count)return `You need ${cfg.requiresItemCount.count} map fragments.`;}return null;}
function resolveFailure(room,cfg,group=activeGroup(room)){effect(room,cfg,false);const target=cfg.failure||cfg.success;const detail=cfg.lastDetail||group?.lastRoll||{};emitOutcome(room,outcomePayload(room,cfg,'setback',target,detail,group),group);transition(room,target,group);if(group)group.pending=null;nextTurn(room);}
const actionMap = {
  arrival:{ask:{type:'support',desc:'press Aldren about the danger',difficulty:6,recommended:'Influence',allowedSkills:['Influence','Awareness'],supportSkills:['Spirit','Knowledge'],success:'ambush',failure:'ambush',reason:'One hero questions him while another watches his reactions.',effects:{flag:'alden_warning'}},watch:{type:'solo',desc:'watch the crowd around the gate',difficulty:6,recommended:'Awareness',allowedSkills:['Awareness','Survival'],success:'ambush',failure:'ambush',reason:'One observer can focus on suspicious movement.',effects:{flag:'saw_watchers'}},enter:{type:'instant',desc:'enter Greyhaven before the gates close',success:'ambush'}},
  ambush:{protect:{type:'team',desc:'protect Aldren during the gate ambush',memberDifficulty:6,teamSize:3,need:2,success:'courier',failure:'alley_detour',dangerous:true,reason:'The company must shield Aldren, block the attackers and secure an escape route.',teamRoles:[{name:'Shield Aldren',skills:['Strength','Endurance']},{name:'Stop the satchel thief',skills:['Agility','Awareness']},{name:'Control the gate',skills:['Influence','Craft']}],effects:{item:'black_wax'}},pursue:{type:'support',desc:'pursue the thief with the satchel',difficulty:7,recommended:'Agility',allowedSkills:['Agility','Awareness'],supportSkills:['Survival','Stealth'],success:'market_chase',failure:'alley_detour',reason:'One hero chases while another predicts the route.',effects:{item:'black_wax'}},mark:{type:'solo',desc:'identify the attackers before they vanish',difficulty:7,recommended:'Awareness',allowedSkills:['Awareness','Knowledge'],success:'courier',failure:'courier',reason:'A focused observer may notice military habits or insignia.',effects:{flag:'trained_attackers',item:'black_wax'}}},
  alley_detour:{roofs:{type:'support',desc:'take the rooftops to recover the trail',difficulty:6,recommended:'Agility',allowedSkills:['Agility','Survival'],supportSkills:['Awareness','Craft'],success:'rooftops',failure:'courier',reason:'One hero climbs while another tracks from street level.'},drain:{type:'solo',desc:'follow the black wax toward the drains',difficulty:6,recommended:'Awareness',allowedSkills:['Awareness','Survival'],success:'lantern_cellar',failure:'courier',reason:'The trail is faint but still fresh.'}},
  courier:{truth:{type:'instant',desc:'tell Calder everything Aldren said',success:'watch_house',effects:{ally:'calder',item:'watch_badge'}},inspect:{type:'solo',desc:'inspect the broken chain and black wax',difficulty:6,recommended:'Knowledge',allowedSkills:['Knowledge','Craft'],success:'watch_house',failure:'watch_house',reason:'The evidence can reveal preparation and origin.',effects:{item:'black_wax'}},hide:{type:'support',desc:'keep Aldren’s final words from Calder',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Stealth'],supportSkills:['Spirit','Awareness'],success:'lantern_cellar',failure:'watch_house',reason:'One hero speaks while another controls what evidence is visible.'}},
  market_chase:{crowd:{type:'support',desc:'cut through the festival crowd',difficulty:6,recommended:'Agility',allowedSkills:['Agility','Influence'],supportSkills:['Awareness','Strength'],success:'rooftops',failure:'alley_detour',reason:'One hero moves while another clears or reads the crowd.'},roofs:{type:'solo',desc:'climb after the thief',difficulty:7,recommended:'Agility',allowedSkills:['Agility','Endurance'],success:'rooftops',failure:'courier',dangerous:true,reason:'The roofline is faster but unforgiving.'},predict:{type:'solo',desc:'predict where the thief is heading',difficulty:6,recommended:'Awareness',allowedSkills:['Awareness','Survival'],success:'lantern_cellar',failure:'rooftops',reason:'The best route may be understood without outrunning anyone.'}},
  rooftops:{runner:{type:'support',desc:'take the rooftop runner alive',difficulty:7,recommended:'Agility',allowedSkills:['Agility','Strength'],supportSkills:['Awareness','Endurance'],success:'watch_house',failure:'lantern_cellar',dangerous:true,reason:'One hero closes the distance while another cuts off escape.',effects:{flag:'runner_taken'}},satchel:{type:'solo',desc:'follow the satchel into the Lantern Ward',difficulty:6,recommended:'Awareness',allowedSkills:['Awareness','Stealth'],success:'lantern_cellar',failure:'watch_house',reason:'Keeping eyes on the handoff matters more than catching the runner.'}},
  watch_house:{help:{type:'instant',desc:'agree to investigate for Calder',success:'lantern_cellar',effects:{ally:'calder',item:'watch_badge'}},records:{type:'solo',desc:'study the customs murder records',difficulty:6,recommended:'Knowledge',allowedSkills:['Knowledge','Awareness'],success:'customs_archive',failure:'lantern_cellar',reason:'The files contain patterns only careful reading will reveal.',effects:{flag:'customs_link'}},lantern:{type:'support',desc:'learn how to enter the Lantern Ward safely',difficulty:6,recommended:'Influence',allowedSkills:['Influence','Knowledge'],supportSkills:['Streetwise','Awareness'].filter(x=>skills.includes(x)),success:'lantern_cellar',failure:'lantern_cellar',reason:'Calder knows enough to help, but not enough to guarantee a welcome.'}},
  lantern_cellar:{token:{type:'instant',desc:'pay Lysa for an introduction',success:'guildhall',effects:{supplies:-1}},talk:{type:'support',desc:'convince Lysa your company is worth the risk',difficulty:6,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Stealth'],success:'guildhall',failure:'customs_archive',reason:'One hero makes the case while another proves you understand the danger.',effects:{ally:'lysa'}},follow:{type:'solo',desc:'follow Lysa without being noticed',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],success:'guildhall',failure:'customs_archive',reason:'Only a quiet tail can discover the route without an invitation.'}},
  guildhall:{deal:{type:'instant',desc:'take Rook’s bargain',success:'customs_archive',effects:{ally:'guild',item:'guild_token'}},press:{type:'support',desc:'press Rook for the buyer’s name immediately',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'palace_audience',failure:'customs_archive',reason:'One hero pressures him while another reads what he is withholding.',effects:{flag:'palace_money'}},read:{type:'solo',desc:'read the guildhall for who is frightened',difficulty:6,recommended:'Awareness',allowedSkills:['Awareness','Spirit'],success:'customs_archive',failure:'customs_archive',reason:'Fear often points toward the person with the most to lose.',effects:{flag:'guild_fear'}}},
  customs_archive:{inside:{type:'support',desc:'enter the sealed ledger room',difficulty:7,recommended:'Craft',allowedSkills:['Craft','Stealth'],supportSkills:['Awareness','Knowledge'],success:'palace_audience',failure:'archive_alarm',reason:'One hero handles the locks while another watches patrols.',effects:{item:'ledger',flag:'hidden_army'}},clerk:{type:'support',desc:'persuade the night clerk to reveal the altered ledgers',difficulty:6,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Knowledge','Awareness'],success:'palace_audience',failure:'archive_alarm',reason:'The clerk needs reassurance and proof.',effects:{item:'ledger',flag:'hidden_army'}},forgery:{type:'solo',desc:'identify who altered the customs records',difficulty:7,recommended:'Knowledge',allowedSkills:['Knowledge','Craft'],success:'palace_audience',failure:'archive_alarm',reason:'The handwriting and tools leave technical clues.',effects:{flag:'army_workshop'}}},
  archive_alarm:{window:{type:'team',desc:'escape across the river roofline',memberDifficulty:6,teamSize:3,need:2,success:'palace_audience',failure:'river_docks',dangerous:true,reason:'The company must cross, lower people safely and keep the ledgers dry.',teamRoles:[{name:'Lead the crossing',skills:['Agility','Endurance']},{name:'Secure the line',skills:['Craft','Strength']},{name:'Watch the patrol',skills:['Awareness','Stealth']}]},hide:{type:'support',desc:'hide until the patrol passes',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],supportSkills:['Craft','Spirit'],success:'palace_audience',failure:'river_docks',reason:'The group needs both concealment and calm.'}},
  palace_audience:{meaning:{type:'instant',desc:'ask what the Black Seal can command',success:'river_docks',effects:{flag:'seal_royal'}},trust:{type:'support',desc:'test why Elira believes your story',difficulty:6,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'river_docks',failure:'river_docks',reason:'Trust here depends on reading as much as speaking.',effects:{ally:'elira'}},king:{type:'support',desc:'press Elira about the King’s condition',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Awareness'],supportSkills:['Spirit','Knowledge'],success:'river_docks',failure:'river_docks',reason:'She will only answer if convinced secrecy is no longer useful.',effects:{flag:'king_ill'}}},
  river_docks:{shadow:{type:'support',desc:'shadow the false stone wagon inland',difficulty:6,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],supportSkills:['Survival','Agility'],success:'warehouse',failure:'canal_escape',reason:'One hero keeps the wagon in sight while another prevents the party being boxed in.'},barge:{type:'solo',desc:'search the unmarked barge',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Craft'],success:'warehouse',failure:'canal_escape',reason:'The barge is watched from shore.',effects:{item:'royal_cipher'}},driver:{type:'support',desc:'take the wagon driver quietly',difficulty:7,recommended:'Strength',allowedSkills:['Strength','Stealth'],supportSkills:['Influence','Awareness'],success:'warehouse',failure:'canal_escape',reason:'The driver must be controlled without alerting the warehouse.',effects:{flag:'driver_confession'}}},
  warehouse:{chest:{type:'support',desc:'open the black-sealed chest',difficulty:7,recommended:'Craft',allowedSkills:['Craft','Knowledge'],supportSkills:['Stealth','Awareness'],success:'masquerade',failure:'canal_escape',reason:'The lock is trapped and the building is not empty.',effects:{item:'forged_pass',flag:'corvin_suspect'}},maps:{type:'solo',desc:'study the marked city maps',difficulty:6,recommended:'Knowledge',allowedSkills:['Knowledge','Awareness'],success:'masquerade',failure:'masquerade',reason:'The marked targets reveal operational priorities.',effects:{flag:'coup_targets'}},wait:{type:'support',desc:'hide and wait for the warehouse contact',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],supportSkills:['Spirit','Agility'],success:'garden_meeting',failure:'canal_escape',reason:'One hero watches while another covers the exit.',effects:{flag:'corvin_suspect'}}},
  canal_escape:{run:{type:'team',desc:'escape through the dry canal',memberDifficulty:6,teamSize:3,need:2,success:'masquerade',failure:'palace_audience',dangerous:true,reason:'The route demands speed, navigation and keeping pursuit behind.',teamRoles:[{name:'Find the route',skills:['Survival','Awareness']},{name:'Keep the way clear',skills:['Strength','Endurance']},{name:'Lose pursuit',skills:['Stealth','Agility']}]},mislead:{type:'support',desc:'leave a false trail in the canals',difficulty:6,recommended:'Survival',allowedSkills:['Survival','Stealth'],supportSkills:['Craft','Awareness'],success:'masquerade',failure:'masquerade',reason:'One hero lays the trail while another erases the real one.'}},
  masquerade:{court:{type:'support',desc:'work the masquerade and draw out a suspect',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Awareness'],supportSkills:['Spirit','Knowledge'],success:'garden_meeting',failure:'prince_attack',reason:'One hero engages the court while another watches reactions.'},servants:{type:'solo',desc:'slip into the servants’ passages',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Agility'],success:'garden_meeting',failure:'prince_attack',reason:'The service corridors reward one quiet infiltrator.'},ledgers:{type:'support',desc:'search Elira’s guest correspondence',difficulty:7,recommended:'Knowledge',allowedSkills:['Knowledge','Stealth'],supportSkills:['Awareness','Craft'],success:'garden_meeting',failure:'prince_attack',reason:'One hero searches while another keeps the room undisturbed.'}},
  garden_meeting:{stay:{type:'solo',desc:'stay hidden and hear the conspirators finish',difficulty:8,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],success:'prince_attack',failure:'prince_attack',dangerous:true,reason:'One person can remain concealed more easily than a group.',effects:{flag:'corvin_suspect'}},take:{type:'team',desc:'seize one conspirator before they leave',memberDifficulty:7,teamSize:3,need:2,success:'prince_attack',failure:'prince_attack',dangerous:true,reason:'The company must block exits, restrain the target and avoid harming guests.',effects:{flag:'corvin_suspect'}}},
  prince_attack:{prince:{type:'team',desc:'protect Prince Halren during the assassination attempt',memberDifficulty:7,teamSize:3,need:2,success:'council',failure:'council',dangerous:true,reason:'Several threats move at once around the Prince.',teamRoles:[{name:'Shield the Prince',skills:['Strength','Endurance']},{name:'Find the shooter',skills:['Awareness','Agility']},{name:'Control the room',skills:['Influence','Spirit']}],effects:{ally:'prince'}},assassin:{type:'support',desc:'catch the assassin alive',difficulty:7,recommended:'Agility',allowedSkills:['Agility','Strength'],supportSkills:['Awareness','Stealth'],success:'council',failure:'council',reason:'One hero pursues while another cuts off escape.',effects:{flag:'assassin_caught'}},bolt:{type:'solo',desc:'identify the weapon and firing angle',difficulty:7,recommended:'Awareness',allowedSkills:['Awareness','Knowledge'],success:'council',failure:'council',reason:'The scene holds technical evidence.',effects:{flag:'army_weapon'}}},
  council:{corvin:{type:'support',desc:'question Lord Marshal Corvin about the troop movements',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Awareness'],supportSkills:['Spirit','Knowledge'],success:'border_news',failure:'border_news',reason:'One hero asks while another tests the answer.',effects:{flag:'corvin_suspect'}},cael:{type:'instant',desc:'ask Brother Cael about the Gate of Kings',success:'border_news',effects:{ally:'cael',item:'tower_plan'}},plan:{type:'solo',desc:'compare the old city plan with the smugglers’ map',difficulty:6,recommended:'Knowledge',allowedSkills:['Knowledge','Craft'],success:'old_tower',failure:'border_news',reason:'The maps can be aligned by landmarks and measurements.',effects:{item:'tower_plan',flag:'gate_known'}}},
  border_news:{report:{type:'solo',desc:'test the scout’s report for inconsistencies',difficulty:6,recommended:'Awareness',allowedSkills:['Awareness','Knowledge'],success:'old_tower',failure:'old_tower',reason:'The report may reveal whether the outside army is real.',effects:{flag:'western_army'}},prepare:{type:'support',desc:'help Calder quietly prepare loyal districts',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Craft'],supportSkills:['Awareness','Spirit'],success:'old_tower',failure:'old_tower',reason:'One hero organises while another keeps preparations discreet.',effects:{ally:'watch'}},tower:{type:'instant',desc:'go immediately to the old watchtower',success:'old_tower'}},
  old_tower:{lift:{type:'instant',desc:'ride the ancient lift below the tower',success:'undercrypt'},inspect:{type:'support',desc:'inspect the repaired lift and cargo marks',difficulty:6,recommended:'Craft',allowedSkills:['Craft','Knowledge'],supportSkills:['Awareness','Survival'],success:'undercrypt',failure:'undercrypt',reason:'The repairs and cargo both carry clues.',effects:{flag:'army_workshop'}},stairs:{type:'solo',desc:'take the service stairs unseen',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Agility'],success:'undercrypt',failure:'gate_guard',reason:'The narrow stair rewards one quiet scout.'}},
  undercrypt:{quiet:{type:'support',desc:'approach the lower chamber without being heard',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],supportSkills:['Agility','Spirit'],success:'gate_chamber',failure:'gate_guard',reason:'One hero leads while another manages noise behind.'},runes:{type:'solo',desc:'read the old royal waymarks',difficulty:7,recommended:'Knowledge',allowedSkills:['Knowledge','Spirit'],success:'gate_chamber',failure:'gate_chamber',reason:'The inscriptions are magical and historical.',effects:{flag:'gate_known'}},direct:{type:'instant',desc:'walk openly into the lower chamber',success:'gate_chamber'}},
  gate_chamber:{study:{type:'support',desc:'understand how the Gate of Kings is opened',difficulty:7,recommended:'Knowledge',allowedSkills:['Knowledge','Craft'],supportSkills:['Spirit','Awareness'],success:'betrayal',failure:'gate_guard',reason:'One hero studies the mechanism while another reads its magic.',effects:{flag:'gate_known',item:'gate_key'}},disable:{type:'support',desc:'disable the Gate mechanism without destroying it',difficulty:8,recommended:'Craft',allowedSkills:['Craft','Knowledge'],supportSkills:['Spirit','Strength'],success:'betrayal',failure:'gate_guard',dangerous:true,reason:'The machinery is ancient and under strain.',effects:{flag:'gate_damaged'}},seal:{type:'solo',desc:'take back the Black Seal',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Agility'],success:'betrayal',failure:'gate_guard',reason:'The seal sits within reach but is watched.',effects:{item:'black_seal'}}},
  gate_guard:{break:{type:'team',desc:'break through the hidden garrison',memberDifficulty:7,teamSize:3,need:2,success:'betrayal',failure:'prison',dangerous:true,reason:'The company must fight, open an exit and protect whoever has the evidence.'},smoke:{type:'support',desc:'escape through the service tunnels',difficulty:7,recommended:'Survival',allowedSkills:['Survival','Stealth'],supportSkills:['Craft','Awareness'],success:'betrayal',failure:'prison',reason:'One hero finds the route while another blocks pursuit.'}},
  betrayal:{argue:{type:'support',desc:'challenge Corvin’s plan before his officers',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Knowledge','Awareness'],success:'city_riot',failure:'prison',reason:'The officers are listening as closely as Corvin.',effects:{flag:'corvin_doubt'}},stall:{type:'support',desc:'keep Corvin talking while someone reaches the seal',difficulty:8,recommended:'Influence',allowedSkills:['Influence','Stealth'],supportSkills:['Awareness','Agility'],success:'city_riot',failure:'prison',dangerous:true,reason:'One hero distracts while another moves unseen.',effects:{item:'black_seal'}},escape:{type:'team',desc:'escape the Gate chamber before it is sealed',memberDifficulty:7,teamSize:3,need:2,success:'city_riot',failure:'prison',dangerous:true,reason:'The company must reach separate exits under pressure.'}},
  prison:{locks:{type:'support',desc:'open the cells quietly',difficulty:6,recommended:'Craft',allowedSkills:['Craft','Stealth'],supportSkills:['Awareness','Knowledge'],success:'city_riot',failure:'city_riot',reason:'One hero handles the lock while another watches the corridor.'},guard:{type:'support',desc:'turn one guard against Corvin',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'city_riot',failure:'city_riot',reason:'The guard must believe the coup will destroy the city.',effects:{flag:'guard_help'}},wall:{type:'team',desc:'break through the old cell wall',memberDifficulty:6,teamSize:3,need:2,success:'city_riot',failure:'city_riot',reason:'The weak wall requires force, tools and someone listening for guards.'}},
  city_riot:{guild:{type:'instant',desc:'reach the Lantern Ward for guild help',success:'guild_choice'},watch:{type:'instant',desc:'reach Calder’s watch post',success:'watch_choice'},palace:{type:'support',desc:'move directly toward the palace through the fighting',difficulty:7,recommended:'Survival',allowedSkills:['Survival','Awareness'],supportSkills:['Stealth','Influence'],success:'secret_tunnel',failure:'watch_choice',dangerous:true,reason:'The safest route changes block by block.'}},
  guild_choice:{people:{type:'support',desc:'convince Rook to defend the people who cannot leave',difficulty:6,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'secret_tunnel',failure:'secret_tunnel',reason:'Rook needs a reason stronger than loyalty to the Crown.',effects:{ally:'guild'}},deal:{type:'support',desc:'promise the guild protection after the crisis',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Knowledge'],supportSkills:['Spirit','Awareness'],success:'secret_tunnel',failure:'secret_tunnel',reason:'The promise must sound enforceable, not sentimental.',effects:{ally:'guild'}},routes:{type:'instant',desc:'ask only for the hidden routes beneath the city',success:'secret_tunnel',effects:{item:'guild_token'}}},
  watch_choice:{bridge:{type:'team',desc:'hold the King’s Bridge while civilians cross',memberDifficulty:7,teamSize:3,need:2,success:'secret_tunnel',failure:'secret_tunnel',dangerous:true,reason:'The company must defend, direct civilians and keep an escape route open.',effects:{ally:'watch'}},route:{type:'support',desc:'find a route around Corvin’s soldiers',difficulty:6,recommended:'Survival',allowedSkills:['Survival','Awareness'],supportSkills:['Stealth','Knowledge'],success:'secret_tunnel',failure:'secret_tunnel',reason:'One hero scouts while another compares the changing barricades.'},orders:{type:'support',desc:'rally uncertain soldiers with the evidence',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Knowledge'],supportSkills:['Spirit','Awareness'],success:'secret_tunnel',failure:'secret_tunnel',reason:'The soldiers need proof and confidence.',effects:{ally:'watch'}}},
  secret_tunnel:{open:{type:'team',desc:'open the Queen’s Passage',memberDifficulty:6,teamSize:3,need:2,success:'coup_begins',failure:'coup_begins',reason:'The door combines mechanical, magical and physical locks.',teamRoles:[{name:'Work the mechanism',skills:['Craft','Knowledge']},{name:'Read the old wards',skills:['Spirit','Knowledge']},{name:'Free the jammed stone',skills:['Strength','Endurance']}]},force:{type:'support',desc:'force the old passage mechanism',difficulty:8,recommended:'Craft',allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'coup_begins',failure:'coup_begins',dangerous:true,reason:'The mechanism may break permanently.'}},
  coup_begins:{gate:{type:'instant',desc:'go to the West Gate',success:'west_gate'},palace:{type:'instant',desc:'go to the palace',success:'palace_siege'},arsenal:{type:'instant',desc:'secure the royal arsenal first',success:'arsenal'}},
  west_gate:{close:{type:'team',desc:'retake and close the West Gate',memberDifficulty:7,teamSize:3,need:2,success:'final_council',failure:'final_council',dangerous:true,reason:'The gatehouse demands fighting, machinery and coordination.',teamRoles:[{name:'Retake the stairs',skills:['Strength','Endurance']},{name:'Free the chain',skills:['Craft','Knowledge']},{name:'Protect the civilians',skills:['Influence','Awareness']}],effects:{ally:'gate_guard'}},collapse:{type:'support',desc:'collapse the old service bridge',difficulty:8,recommended:'Craft',allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'final_council',failure:'final_council',dangerous:true,reason:'The bridge can be dropped, but the timing must be exact.',effects:{flag:'west_gate_closed'}}},
  palace_siege:{stairs:{type:'team',desc:'take the palace stairs',memberDifficulty:7,teamSize:3,need:2,success:'final_council',failure:'final_council',dangerous:true,reason:'The company must break a defended position and reach the royal wing.',effects:{ally:'prince'}},passage:{type:'support',desc:'use the servants’ passages',difficulty:7,recommended:'Stealth',allowedSkills:['Stealth','Awareness'],supportSkills:['Survival','Agility'],success:'final_council',failure:'final_council',reason:'The passages are cramped, dark and partially blocked.',effects:{ally:'prince'}},roof:{type:'support',desc:'cross from the chapel roof to the eastern wing',difficulty:8,recommended:'Agility',allowedSkills:['Agility','Endurance'],supportSkills:['Craft','Awareness'],success:'final_council',failure:'final_council',dangerous:true,reason:'The height and fire make the route dangerous.',effects:{ally:'prince'}}},
  arsenal:{defend:{type:'team',desc:'defend the royal arsenal',memberDifficulty:7,teamSize:3,need:2,success:'final_council',failure:'final_council',dangerous:true,reason:'The doors, apprentices and powder stores all need attention.',effects:{ally:'arsenal'}},move:{type:'support',desc:'move the weapons through the old stores',difficulty:7,recommended:'Craft',allowedSkills:['Craft','Strength'],supportSkills:['Awareness','Survival'],success:'final_council',failure:'final_council',reason:'One hero organises the movement while another keeps the route safe.',effects:{ally:'arsenal'}},destroy:{type:'solo',desc:'destroy the powder stores rather than lose them',difficulty:8,recommended:'Craft',allowedSkills:['Craft','Knowledge'],success:'final_council',failure:'final_council',dangerous:true,reason:'The demolition requires exact timing.',effects:{flag:'arsenal_destroyed'}}},
  final_council:{unite:{type:'support',desc:'unite the city factions for one final assault',difficulty:7,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Knowledge','Awareness'],success:'gate_awakens',failure:'gate_awakens',reason:'Someone must persuade rivals to trust one another for one hour.',effects:{ally:'united_city'}},secret:{type:'support',desc:'use the undercity routes to reach the Gate first',difficulty:7,recommended:'Survival',allowedSkills:['Survival','Stealth'],supportSkills:['Knowledge','Awareness'],success:'gate_awakens',failure:'gate_awakens',reason:'One hero leads while another tracks which routes remain open.'},rush:{type:'instant',desc:'attack the old tower immediately',success:'gate_awakens'}},
  gate_awakens:{reason:{type:'support',desc:'make one final attempt to turn Corvin',difficulty:8,recommended:'Influence',allowedSkills:['Influence','Spirit'],supportSkills:['Knowledge','Awareness'],success:'final_crisis',failure:'final_crisis',dangerous:true,reason:'Corvin must be convinced in front of the officers who followed him.',effects:{ally:'corvin'}},seal:{type:'team',desc:'reach the Black Seal before the enemy formation crosses',memberDifficulty:7,teamSize:3,need:2,success:'final_crisis',failure:'final_crisis',dangerous:true,reason:'The chamber is breaking into several simultaneous fights.',effects:{item:'black_seal'}},gate:{type:'support',desc:'disrupt the Gate of Kings itself',difficulty:8,recommended:'Craft',allowedSkills:['Craft','Knowledge'],supportSkills:['Spirit','Strength'],success:'final_crisis',failure:'final_crisis',dangerous:true,reason:'The Gate is active and unstable.',effects:{flag:'gate_damaged'}}},
  final_crisis:{ring:{type:'team',desc:'hold the Gate chamber against incoming soldiers',memberDifficulty:7,teamSize:3,need:2,success:'black_seal',failure:'black_seal',dangerous:true,reason:'The company must hold the line while the Gate destabilises.',effects:{flag:'ring_saved'}},people:{type:'team',desc:'evacuate the western district above the collapsing tower',memberDifficulty:6,teamSize:3,need:2,success:'black_seal',failure:'black_seal',dangerous:true,reason:'The company must guide civilians through streets under attack.',effects:{flag:'people_saved'}},control:{type:'team',desc:'stabilise the Gate mechanism',memberDifficulty:7,teamSize:3,need:2,success:'black_seal',failure:'black_seal',dangerous:true,reason:'Several control stations must be managed at once.',effects:{flag:'gate_stable'}}},
  black_seal:{destroy:{type:'instant',desc:'destroy the Gate of Kings',success:'@final_destroy',effects:{finalChoice:'destroy'}},crown:{type:'instant',desc:'return the Black Seal and Gate to the Crown',success:'@final_crown',effects:{finalChoice:'crown'}},divide:{type:'instant',desc:'divide control of the Gate between the Crown, Watch and guilds',success:'@final_divide',effects:{finalChoice:'divide'}}}
};

// --- REMAKE EXPANSION: slower city travel, genuine investigation routes, split palace teams and multi-stage coup ---
Object.assign(actionMap,{
  city_crossroads:{
    lantern:{type:'instant',desc:'take the Lantern Ward investigation',success:'lantern_entry'},
    docks:{type:'instant',desc:'take the River Docks investigation',success:'dock_checkpoint'},
    split:{type:'split',desc:'divide the company between the Lantern Ward and River Docks',reason:'The two leads may reveal different parts of the same conspiracy.',routes:{a:{name:'Lantern Ward',scene:'lantern_entry',text:'Trace payments, runners and guild contacts through the underworld.'},b:{name:'River Docks',scene:'dock_checkpoint',text:'Trace weapons, barges and warehouse movements along the river.'}},soloScene:'lantern_entry'}
  },
  lantern_entry:{
    watch:{type:'solo',lowStakes:true,desc:'read the Lantern Ward street before entering',difficulty:6,allowedSkills:['Awareness','Influence'],success:'candle_market',failure:'candle_market',effects:{flag:'lantern_read'},outcomeText:'noticed which corners belonged to lookouts and which belonged to ordinary traders'},
    enter:{type:'instant',desc:'enter the Lantern Ward with the crowd',success:'candle_market'}
  },
  candle_market:{
    sense:{type:'solo',lowStakes:true,desc:'watch who reacts to the black-wax mark',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'rooftop_message',failure:'rooftop_message',effects:{flag:'guild_signal'},outcomeText:'noticed a chain of reactions leading toward the guild runners'},
    ask:{type:'support',desc:'ask carefully about black wax in the Candle Market',difficulty:6,allowedSkills:['Influence','Stealth'],supportSkills:['Awareness','Spirit'],success:'rooftop_message',failure:'rooftop_message',effects:{ally:'lysa'}}
  },
  rooftop_message:{
    follow:{type:'solo',desc:'follow the rooftop signal chain',difficulty:7,allowedSkills:['Agility','Awareness'],success:'guild_doors',failure:'guild_doors',dangerous:true},
    map:{type:'solo',lowStakes:true,desc:'work out where the rooftop signals are heading',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'guild_doors',failure:'guild_doors',effects:{flag:'guild_route'},outcomeText:'worked out the signal chain ends behind a cooper’s shop near the dye quarter'}
  },
  guild_doors:{
    talk:{type:'support',desc:'ask for Guildmaster Rook by name',difficulty:6,allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'rook_terms',failure:'rook_terms'},
    back:{type:'solo',desc:'find the rear entrance to the guild rooms',difficulty:6,allowedSkills:['Stealth','Awareness'],success:'rook_terms',failure:'rook_terms',effects:{flag:'guild_backdoor'}}
  },
  rook_terms:{
    truth:{type:'support',desc:'tell Rook enough of the truth to earn his cooperation',difficulty:7,allowedSkills:['Influence','Spirit'],supportSkills:['Knowledge','Awareness'],success:'hidden_ledger',failure:'hidden_ledger',effects:{ally:'guild'}},
    read:{type:'solo',lowStakes:true,desc:'read Rook’s room before answering',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'hidden_ledger',failure:'hidden_ledger',effects:{flag:'rook_fear'},outcomeText:'realised Rook is less afraid of the Watch than of someone inside the palace'},
    deal:{type:'instant',desc:'trade a future favour for Rook’s information',success:'hidden_ledger',effects:{ally:'guild',threat:1}}
  },
  hidden_ledger:{
    decode:{type:'support',desc:'decode the guild payment trail',difficulty:7,allowedSkills:['Knowledge','Craft'],supportSkills:['Awareness','Influence'],success:'@merge:city_investigation:palace_audience',failure:'@merge:city_investigation:palace_audience',effects:{flag:'palace_money'}},
    copy:{type:'instant',desc:'copy the useful ledger entries and leave',success:'@merge:city_investigation:palace_audience',effects:{flag:'palace_money'}}
  },

  dock_checkpoint:{
    sense:{type:'solo',lowStakes:true,desc:'watch how carts bypass the river checkpoint',difficulty:6,allowedSkills:['Awareness','Stealth'],success:'fish_market',failure:'fish_market',effects:{flag:'dock_bypass'},outcomeText:'noticed a side lane used by carts carrying uninspected cargo'},
    talk:{type:'support',desc:'pass the checkpoint using authority and confidence',difficulty:6,allowedSkills:['Influence','Knowledge'],supportSkills:['Spirit','Awareness'],success:'fish_market',failure:'fish_market'},
    wait:{type:'instant',desc:'wait with the ordinary river traffic',success:'fish_market'}
  },
  fish_market:{
    watch:{type:'solo',lowStakes:true,desc:'watch the dockers handling suspicious crates',difficulty:6,allowedSkills:['Awareness','Stealth'],success:'barge_row',failure:'barge_row',effects:{flag:'suspicious_crates'},outcomeText:'saw the crates move from an unmarked barge toward the Ropewalk'},
    follow:{type:'solo',desc:'follow the suspicious crates through the fish market',difficulty:6,allowedSkills:['Stealth','Awareness'],success:'barge_row',failure:'barge_row'}
  },
  barge_row:{
    inspect:{type:'solo',lowStakes:true,desc:'inspect the unmarked barge from the quay',difficulty:6,allowedSkills:['Craft','Awareness'],success:'ropewalk',failure:'ropewalk',effects:{flag:'barge_false_floor'},outcomeText:'noticed the barge sits high because a false deck hides heavier cargo below'},
    board:{type:'solo',desc:'board the unmarked barge while the crew is away',difficulty:7,allowedSkills:['Stealth','Agility'],success:'ropewalk',failure:'ropewalk',dangerous:true,effects:{item:'royal_cipher'}}
  },
  ropewalk:{
    trail:{type:'support',desc:'recover the cargo trail through the Ropewalk',difficulty:6,allowedSkills:['Awareness','Survival'],supportSkills:['Stealth','Agility'],success:'warehouse_watch',failure:'warehouse_watch'},
    wax:{type:'solo',lowStakes:true,desc:'study the black wax and fresh gate marks',difficulty:6,allowedSkills:['Knowledge','Craft'],success:'warehouse_watch',failure:'warehouse_watch',effects:{flag:'black_wax_source'},outcomeText:'matched the wax to sealing material used by royal logistics offices'}
  },
  warehouse_watch:{
    wait:{type:'solo',lowStakes:true,desc:'watch the warehouse long enough to identify the receiver',difficulty:7,allowedSkills:['Stealth','Awareness'],success:'canal_gate',failure:'canal_gate',effects:{flag:'corvin_suspect'},outcomeText:'saw a royal staff officer receive the cargo under military escort'},
    inside:{type:'support',desc:'slip into the warehouse side yard',difficulty:7,allowedSkills:['Stealth','Agility'],supportSkills:['Awareness','Craft'],success:'canal_gate',failure:'canal_gate',effects:{flag:'hidden_army'}}
  },
  canal_gate:{
    canal:{type:'support',desc:'open the dry canal gate and leave beneath the streets',difficulty:6,allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'@merge:city_investigation:palace_audience',failure:'@merge:city_investigation:palace_audience',effects:{flag:'dock_escape'}},
    street:{type:'support',desc:'take the crowded streets back toward Royal Hill',difficulty:6,allowedSkills:['Influence','Awareness'],supportSkills:['Spirit','Stealth'],success:'@merge:city_investigation:palace_audience',failure:'@merge:city_investigation:palace_audience'}
  },

  palace_route_choice:{
    court:{type:'instant',desc:'use the public court route through the masquerade',success:'court_gate'},
    service:{type:'instant',desc:'use the palace service passages',success:'service_gate'},
    split:{type:'split',desc:'divide the company between the court wing and service passages',reason:'Both routes can reveal different preparations for the attack on the Prince.',routes:{a:{name:'Court Wing',scene:'court_gate',text:'Move among masked guests, galleries and noble observers.'},b:{name:'Service Passages',scene:'service_gate',text:'Use kitchens, household stairs and hidden service routes.'}},soloScene:'court_gate'}
  },
  court_gate:{
    enter:{type:'support',desc:'present the masquerade invitation calmly',difficulty:6,allowedSkills:['Influence','Knowledge'],supportSkills:['Spirit','Awareness'],success:'mask_gallery',failure:'mask_gallery'},
    watch:{type:'solo',lowStakes:true,desc:'study the court gate checks before entering',difficulty:6,allowedSkills:['Awareness','Stealth'],success:'mask_gallery',failure:'mask_gallery',effects:{flag:'court_guard_pattern'},outcomeText:'noticed which guards actually read invitations and which only watch faces'}
  },
  mask_gallery:{
    sense:{type:'solo',lowStakes:true,desc:'read the masked crowd for trained behaviour',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'music_room',failure:'music_room',effects:{flag:'trained_guests'},outcomeText:'identified several guests who move like soldiers rather than courtiers'},
    follow:{type:'solo',desc:'follow one suspicious guest through the gallery',difficulty:7,allowedSkills:['Stealth','Awareness'],success:'music_room',failure:'music_room'}
  },
  music_room:{
    search:{type:'solo',lowStakes:true,desc:'search the empty music room without disturbing it',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'balcony_watch',failure:'balcony_watch',effects:{flag:'altered_seating'},outcomeText:'found a seating plan altered to move the Prince closer to a side door'},
    door:{type:'instant',desc:'follow the boot prints through the servant door',success:'balcony_watch'}
  },
  balcony_watch:{
    note:{type:'solo',desc:'track the note through the masquerade crowd',difficulty:7,allowedSkills:['Awareness','Stealth'],success:'royal_gallery',failure:'royal_gallery'},
    pattern:{type:'solo',lowStakes:true,desc:'watch the ballroom as a whole rather than one person',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'royal_gallery',failure:'royal_gallery',effects:{flag:'attack_positions'},outcomeText:'noticed several guests drifting into positions around the Prince’s route'}
  },
  royal_gallery:{
    prepare:{type:'team',desc:'cover the approaches to the Royal Gallery',memberDifficulty:6,teamSize:3,success:'court_merge',failure:'court_merge',reason:'Several entrances and the Prince’s movement must be watched at once.',teamRoles:[{name:'Watch the main doors',skills:['Awareness','Influence']},{name:'Cover the side passage',skills:['Agility','Stealth']},{name:'Read the crowd',skills:['Spirit','Knowledge']}]},
    hidden:{type:'solo',lowStakes:true,desc:'inspect the tapestry door before the Prince arrives',difficulty:6,allowedSkills:['Awareness','Craft'],success:'court_merge',failure:'court_merge',effects:{flag:'hidden_palace_door'},outcomeText:'found a concealed passage leading toward the Prince’s private corridor'}
  },
  court_merge:{arrive:{type:'instant',desc:'move from the court wing toward the Prince',success:'@merge:palace_routes:prince_attack'}},

  service_gate:{
    blend:{type:'support',desc:'blend in with workers and deliveries at the kitchen gate',difficulty:6,allowedSkills:['Stealth','Influence'],supportSkills:['Awareness','Knowledge'],success:'kitchen_pass',failure:'kitchen_pass'},
    observe:{type:'solo',lowStakes:true,desc:'watch which palace deliveries skip inspection',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'kitchen_pass',failure:'kitchen_pass',effects:{flag:'special_delivery'},outcomeText:'noticed military dispatch boxes bypassing the ordinary kitchen checks'}
  },
  kitchen_pass:{
    follow:{type:'solo',desc:'follow the messenger through the kitchen side door',difficulty:6,allowedSkills:['Stealth','Agility'],success:'linen_stairs',failure:'linen_stairs'},
    ask:{type:'support',desc:'quietly ask a kitchen worker about the locked side door',difficulty:6,allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Stealth'],success:'linen_stairs',failure:'linen_stairs'}
  },
  linen_stairs:{
    listen:{type:'solo',lowStakes:true,desc:'listen to the guard-roster conversation above',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'servant_archive',failure:'servant_archive',effects:{flag:'guard_roster_changed'},outcomeText:'heard that the Prince’s usual guards were reassigned for tonight only'},
    climb:{type:'solo',desc:'climb before the speakers leave the landing',difficulty:7,allowedSkills:['Agility','Stealth'],success:'servant_archive',failure:'servant_archive'}
  },
  servant_archive:{
    compare:{type:'support',desc:'compare the altered household schedules',difficulty:6,allowedSkills:['Knowledge','Craft'],supportSkills:['Awareness','Influence'],success:'hidden_landing',failure:'hidden_landing',effects:{flag:'schedule_forgery'}},
    keys:{type:'solo',lowStakes:true,desc:'inspect the household key board',difficulty:6,allowedSkills:['Awareness','Craft'],success:'hidden_landing',failure:'hidden_landing',effects:{flag:'missing_key'},outcomeText:'noticed a private-corridor key missing from a hook that should never be empty'}
  },
  hidden_landing:{
    open:{type:'support',desc:'open the sealed stair quietly',difficulty:7,allowedSkills:['Craft','Stealth'],supportSkills:['Knowledge','Awareness'],success:'service_merge',failure:'service_merge'},
    force:{type:'support',desc:'force the old stair door before time runs out',difficulty:7,allowedSkills:['Strength','Endurance'],supportSkills:['Craft','Spirit'],success:'service_merge',failure:'service_merge',dangerous:true}
  },
  service_merge:{arrive:{type:'instant',desc:'move from the service passage toward the Prince',success:'@merge:palace_routes:prince_attack'}},

  old_city_choice:{
    tower:{type:'instant',desc:'take the Bell Quarter route above the old city',success:'bell_street'},
    under:{type:'instant',desc:'take the Undercity aqueduct route',success:'aqueduct_entry'},
    split:{type:'split',desc:'divide the company between the Bell Quarter and Undercity',reason:'The same buried district can be approached from above and below.',routes:{a:{name:'Bell Quarter',scene:'bell_street',text:'Use towers, workshops and civic archives above the old foundations.'},b:{name:'Undercity',scene:'aqueduct_entry',text:'Use aqueducts, cisterns and smuggler passages below the streets.'}},soloScene:'bell_street'}
  },
  bell_street:{
    sense:{type:'solo',lowStakes:true,desc:'watch the patrol on Bell Street before approaching',difficulty:6,allowedSkills:['Awareness','Influence'],success:'clockmaker_lane',failure:'clockmaker_lane',effects:{flag:'bell_patrol'},outcomeText:'noticed the patrol checks people going toward the civic tower but ignores workers carrying tools'},
    pass:{type:'support',desc:'pass through the Bell Street checkpoint',difficulty:6,allowedSkills:['Influence','Knowledge'],supportSkills:['Craft','Spirit'],success:'clockmaker_lane',failure:'clockmaker_lane'}
  },
  clockmaker_lane:{
    talk:{type:'support',desc:'convince the retired clockmaker to help',difficulty:6,allowedSkills:['Influence','Spirit'],supportSkills:['Knowledge','Awareness'],success:'old_belfry',failure:'old_belfry',effects:{flag:'old_foundations'}},
    look:{type:'solo',lowStakes:true,desc:'inspect Clockmaker Lane for another way toward the tower',difficulty:6,allowedSkills:['Awareness','Craft'],success:'old_belfry',failure:'old_belfry',effects:{flag:'tower_backdoor'},outcomeText:'found an old builders’ stair between two workshops'}
  },
  old_belfry:{
    climb:{type:'support',desc:'climb the abandoned belfry safely',difficulty:6,allowedSkills:['Agility','Endurance'],supportSkills:['Craft','Awareness'],success:'roof_bridge',failure:'roof_bridge'},
    map:{type:'solo',lowStakes:true,desc:'map the old city foundations from the belfry',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'roof_bridge',failure:'roof_bridge',effects:{flag:'gate_location'},outcomeText:'identified a ring of foundations around the buried Gate district'}
  },
  roof_bridge:{
    cross:{type:'team',desc:'cross the old roof walkways to the archive block',memberDifficulty:6,teamSize:3,success:'tower_archive',failure:'tower_archive',dangerous:true,reason:'The walkways demand balance, reinforcement and careful route choice.',teamRoles:[{name:'Test the planks',skills:['Awareness','Craft']},{name:'Cross first',skills:['Agility','Endurance']},{name:'Stabilise the line',skills:['Strength','Spirit']}],failEffects:{threat:1}},
    street:{type:'support',desc:'return to street level and avoid the patrol',difficulty:7,allowedSkills:['Influence','Stealth'],supportSkills:['Awareness','Spirit'],success:'tower_archive',failure:'tower_archive'}
  },
  tower_archive:{
    read:{type:'solo',lowStakes:true,desc:'identify the safest descent on the civic survey map',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'@merge:oldcity_routes:gate_chamber',failure:'@merge:oldcity_routes:gate_chamber',effects:{flag:'safe_gate_descent'},outcomeText:'found the Royal Works stair leading directly toward the buried chamber'},
    descend:{type:'instant',desc:'take the Royal Works stair beneath the archive',success:'@merge:oldcity_routes:gate_chamber'}
  },

  aqueduct_entry:{
    sense:{type:'solo',lowStakes:true,desc:'read the recent marks at the dry aqueduct entrance',difficulty:6,allowedSkills:['Awareness','Survival'],success:'flood_steps',failure:'flood_steps',effects:{flag:'smuggler_marks'},outcomeText:'identified the signs smugglers use to mark safe undercity passages'},
    enter:{type:'instant',desc:'descend into the dry aqueduct',success:'flood_steps'}
  },
  flood_steps:{
    cross:{type:'support',desc:'cross the flooded steps using the old handrail',difficulty:6,allowedSkills:['Agility','Endurance'],supportSkills:['Craft','Spirit'],success:'cistern',failure:'cistern'},
    inspect:{type:'solo',lowStakes:true,desc:'check the submerged wall for side passages',difficulty:6,allowedSkills:['Awareness','Craft'],success:'cistern',failure:'cistern',effects:{flag:'cistern_shortcut'},outcomeText:'found a maintenance opening that bypasses part of the flooded channel'}
  },
  cistern:{
    soot:{type:'solo',lowStakes:true,desc:'study lantern soot and footprints in the Great Cistern',difficulty:6,allowedSkills:['Awareness','Survival'],success:'smuggler_chapel',failure:'smuggler_chapel',effects:{flag:'chapel_route'},outcomeText:'traced the freshest traffic toward a concealed chapel arch'},
    echo:{type:'solo',desc:'use echoes to identify the largest passage',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'smuggler_chapel',failure:'smuggler_chapel'}
  },
  smuggler_chapel:{
    talk:{type:'support',desc:'talk your way past the smugglers in the underground chapel',difficulty:6,allowedSkills:['Influence','Spirit'],supportSkills:['Stealth','Awareness'],success:'iron_door',failure:'iron_door'},
    token:{type:'instant',desc:'use your underworld connections to pass',success:'iron_door',requiresFlag:'guild_fear'}
  },
  iron_door:{
    open:{type:'support',desc:'open the Royal Works lock beneath the chapel',difficulty:7,allowedSkills:['Craft','Knowledge'],supportSkills:['Awareness','Strength'],success:'@merge:oldcity_routes:gate_chamber',failure:'@merge:oldcity_routes:gate_chamber'},
    force:{type:'support',desc:'force the iron hinges on the Royal Works door',difficulty:7,allowedSkills:['Strength','Endurance'],supportSkills:['Craft','Spirit'],success:'@merge:oldcity_routes:gate_chamber',failure:'@merge:oldcity_routes:gate_chamber',dangerous:true}
  },

  coup_wave:{hold:{type:'team',desc:'survive the first coordinated wave of the coup',memberDifficulty:7,teamSize:3,success:'coup_split',failure:'coup_split',dangerous:true,reason:'Crowds, soldiers and blocked streets create several simultaneous problems.',teamRoles:[{name:'Keep the company moving',skills:['Endurance','Agility']},{name:'Read the troop movement',skills:['Awareness','Knowledge']},{name:'Keep civilians from panicking',skills:['Influence','Spirit']}],failEffects:{threat:1}}},
  coup_split:{
    gate:{type:'instant',desc:'take the whole company to the West Gate',success:'gate_barricade'},
    arsenal:{type:'instant',desc:'take the whole company to the Royal Arsenal',success:'arsenal_yard'},
    split:{type:'split',desc:'divide the company between the West Gate and Royal Arsenal',reason:'Both fronts can change the balance of the coup before the final confrontation.',routes:{a:{name:'West Gate',scene:'gate_barricade',text:'Retake the gatehouse and stop Corvin’s reinforcements entering.'},b:{name:'Royal Arsenal',scene:'arsenal_yard',text:'Keep weapons and powder out of Corvin’s hands.'}},soloScene:'gate_barricade'}
  },
  gate_barricade:{push:{type:'team',desc:'push the loyal line through the West Gate barricade',memberDifficulty:7,teamSize:3,success:'gate_tower',failure:'gate_tower',dangerous:true,reason:'The street fight has several positions and frightened civilians between them.',teamRoles:[{name:'Break the barricade',skills:['Strength','Endurance']},{name:'Find the opening',skills:['Awareness','Agility']},{name:'Rally the Watch',skills:['Influence','Spirit']}],failEffects:{threat:1}}},
  gate_tower:{
    stop:{type:'team',desc:'stop the West Gate windlass before the doors open',memberDifficulty:7,teamSize:3,success:'gate_counterattack',failure:'gate_counterattack',dangerous:true,reason:'Machinery, attackers and the damaged lock all need attention.',teamRoles:[{name:'Control the windlass',skills:['Strength','Craft']},{name:'Repair the lock',skills:['Craft','Knowledge']},{name:'Hold the stair',skills:['Agility','Endurance']}],effects:{flag:'west_gate_closed'}},
    sense:{type:'solo',lowStakes:true,desc:'identify who is actually commanding the gate tower',difficulty:6,allowedSkills:['Awareness','Influence'],success:'gate_counterattack',failure:'gate_counterattack',effects:{flag:'gate_traitor_known'},outcomeText:'identified the officer directing the tower from behind the fighting'}
  },
  gate_counterattack:{hold:{type:'team',desc:'hold the West Gate through the counterattack',memberDifficulty:7,teamSize:3,success:'@merge:coup_fronts:palace_siege',failure:'west_gate',dangerous:true,reason:'The counterattack comes from several stairs at once.',teamRoles:[{name:'Hold the lower stair',skills:['Strength','Endurance']},{name:'Control the wall walk',skills:['Agility','Awareness']},{name:'Keep the Watch together',skills:['Influence','Spirit']}],effects:{ally:'gate_guard'},failEffects:{threat:1}}},

  arsenal_yard:{cross:{type:'team',desc:'cross the Royal Arsenal yard under cover',memberDifficulty:7,teamSize:3,success:'powder_room',failure:'powder_room',dangerous:true,reason:'The yard contains soldiers, carts and several lines of sight.',teamRoles:[{name:'Find cover',skills:['Awareness','Stealth']},{name:'Move between carts',skills:['Agility','Endurance']},{name:'Distract the loaders',skills:['Influence','Craft']}],failEffects:{threat:1}}},
  powder_room:{
    save:{type:'team',desc:'contain the fire in the arsenal powder room',memberDifficulty:7,teamSize:3,success:'arsenal_hold',failure:'arsenal_hold',dangerous:true,reason:'Water, powder barrels and panicked workers must all be managed at once.',teamRoles:[{name:'Smother the flame',skills:['Craft','Endurance']},{name:'Move the barrels',skills:['Strength','Agility']},{name:'Direct the workers',skills:['Influence','Awareness']}],effects:{ally:'arsenal'}},
    sense:{type:'solo',lowStakes:true,desc:'work out who started the powder-room fire',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'arsenal_hold',failure:'arsenal_hold',effects:{flag:'arsenal_saboteur'},outcomeText:'found signs the fire was deliberately started from inside the arsenal'}
  },
  arsenal_hold:{hold:{type:'team',desc:'hold the arsenal entrances until loyal help arrives',memberDifficulty:7,teamSize:3,success:'@merge:coup_fronts:palace_siege',failure:'arsenal',dangerous:true,reason:'Several entrances and the apprentices inside must be defended together.',teamRoles:[{name:'Hold the main doors',skills:['Strength','Endurance']},{name:'Watch the east entrance',skills:['Awareness','Agility']},{name:'Protect the workers',skills:['Influence','Spirit']}],effects:{ally:'arsenal'},failEffects:{threat:1}}}
});


// --- V3 STORY DEPTH PASS: longer route arcs ---
Object.assign(actionMap,{
  rooftop_message:{
    follow:{type:'solo',desc:'follow the rooftop signal chain',difficulty:7,allowedSkills:['Agility','Awareness'],success:'lantern_rope_bridge',failure:'lantern_rope_bridge',dangerous:true},
    map:{type:'solo',lowStakes:true,desc:'work out where the rooftop signals are heading',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'lantern_rope_bridge',failure:'lantern_rope_bridge',effects:{flag:'guild_route'},outcomeText:'the signal chain ends beyond the dyers’ quarter rather than at the obvious guild streets'}
  },
  lantern_rope_bridge:{
    cross:{type:'solo',desc:'cross the rope bridge after the messenger',difficulty:6,allowedSkills:['Agility','Endurance'],success:'dye_court',failure:'dye_court'},
    watch:{type:'solo',lowStakes:true,desc:'watch the far roof before committing',difficulty:6,allowedSkills:['Awareness','Stealth'],success:'dye_court',failure:'dye_court',effects:{flag:'lantern_tail'},outcomeText:'a second watcher is shadowing the messenger from the chimney line'}
  },
  dye_court:{
    read:{type:'solo',lowStakes:true,desc:'read the black-wax marks in the Dyers’ Court',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'old_shrine',failure:'old_shrine',effects:{flag:'fresh_guild_mark'},outcomeText:'which doorway carries the freshest guild mark'},
    ask:{type:'support',desc:'ask a dyer which stranger passed through',difficulty:6,allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'old_shrine',failure:'old_shrine'}
  },
  old_shrine:{
    stairs:{type:'instant',desc:'take the hidden stair beside the old shrine',success:'whisper_house'},
    inspect:{type:'solo',lowStakes:true,desc:'inspect the offerings beneath the defaced crest',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'whisper_house',failure:'whisper_house',effects:{flag:'old_rebel_crest'},outcomeText:'the crest belongs to a royal branch erased from newer histories'}
  },
  whisper_house:{
    listen:{type:'solo',lowStakes:true,desc:'listen before speaking in the Whisper House',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'guild_stair',failure:'guild_stair',effects:{flag:'rook_under_pressure'},outcomeText:'several customers are quietly asking whether Rook still controls the ward'},
    trade:{type:'support',desc:'trade a harmless truth for directions to Rook',difficulty:6,allowedSkills:['Influence','Knowledge'],supportSkills:['Spirit','Awareness'],success:'guild_stair',failure:'guild_stair'}
  },
  guild_stair:{
    lose:{type:'solo',desc:'lose the tail through the workshops',difficulty:7,allowedSkills:['Stealth','Agility'],success:'guild_doors',failure:'guild_doors',effects:{flag:'tail_lost'}},
    face:{type:'support',desc:'turn and confront the follower openly',difficulty:7,allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Strength'],success:'guild_doors',failure:'guild_doors',effects:{flag:'tail_identified'}}
  },

  ropewalk:{
    trail:{type:'support',desc:'recover the cargo trail through the Ropewalk',difficulty:6,allowedSkills:['Awareness','Survival'],supportSkills:['Stealth','Agility'],success:'ropeyard_watch',failure:'ropeyard_watch'},
    wax:{type:'solo',lowStakes:true,desc:'study the black wax and fresh gate marks',difficulty:6,allowedSkills:['Knowledge','Craft'],success:'ropeyard_watch',failure:'ropeyard_watch',effects:{flag:'black_wax_source'},outcomeText:'the wax matches sealing material used by royal logistics offices'}
  },
  ropeyard_watch:{
    sense:{type:'solo',lowStakes:true,desc:'study the ropeyard before moving on',difficulty:6,allowedSkills:['Awareness','Survival'],success:'chandlers_lane',failure:'chandlers_lane',effects:{flag:'military_disguise'},outcomeText:'one dockworker is wearing military boots and watching the wagon route'},
    trail:{type:'solo',desc:'follow the fresh wagon ruts',difficulty:6,allowedSkills:['Survival','Awareness'],success:'chandlers_lane',failure:'chandlers_lane'}
  },
  chandlers_lane:{
    buy:{type:'instant',desc:'buy the marked crate wood and ask where it came from',success:'night_ferry',effects:{flag:'royal_crate_mark'}},
    trace:{type:'solo',lowStakes:true,desc:'reconstruct the damaged royal inventory mark',difficulty:6,allowedSkills:['Knowledge','Craft'],success:'night_ferry',failure:'night_ferry',effects:{flag:'royal_crate_mark'},outcomeText:'the broken mark came from a Crown armoury shipment that should never have reached the docks'}
  },
  night_ferry:{
    cross:{type:'solo',desc:'take the night ferry quietly',difficulty:6,allowedSkills:['Stealth','Spirit'],success:'customs_tunnel',failure:'customs_tunnel'},
    watch:{type:'solo',lowStakes:true,desc:'watch the men waiting across the canal',difficulty:6,allowedSkills:['Awareness','Influence'],success:'customs_tunnel',failure:'customs_tunnel',effects:{flag:'dock_receiver'},outcomeText:'the waiting men are not smugglers; one carries a military dispatch case'}
  },
  customs_tunnel:{
    enter:{type:'instant',desc:'follow the abandoned customs tunnel',success:'warehouse_roof'},
    inspect:{type:'solo',lowStakes:true,desc:'inspect the drag marks and wall hooks',difficulty:6,allowedSkills:['Craft','Awareness'],success:'warehouse_roof',failure:'warehouse_roof',effects:{flag:'heavy_weapons'},outcomeText:'the cargo was far heavier than ordinary contraband and moved with organised equipment'}
  },
  warehouse_roof:{
    climb:{type:'solo',desc:'climb the warehouse roof for a better view',difficulty:7,allowedSkills:['Agility','Endurance'],success:'warehouse_watch',failure:'warehouse_watch',dangerous:true},
    wait:{type:'solo',lowStakes:true,desc:'watch the warehouse yard from below',difficulty:6,allowedSkills:['Stealth','Awareness'],success:'warehouse_watch',failure:'warehouse_watch',effects:{flag:'warehouse_shift'},outcomeText:'the guards change on a military-style rotation rather than a smuggler’s watch'}
  },

  music_room:{
    search:{type:'solo',lowStakes:true,desc:'search the empty music room without disturbing it',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'portrait_corridor',failure:'portrait_corridor',effects:{flag:'altered_seating'},outcomeText:'the seating plan was altered to move the Prince closer to a side door'},
    door:{type:'instant',desc:'follow the boot prints through the servant door',success:'portrait_corridor'}
  },
  portrait_corridor:{
    listen:{type:'solo',lowStakes:true,desc:'listen to the officers beneath the royal portraits',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'card_room',failure:'card_room',effects:{flag:'officer_route'},outcomeText:'the officers are discussing the Prince’s route rather than the celebration'},
    pass:{type:'solo',desc:'pass the officers without drawing notice',difficulty:6,allowedSkills:['Influence','Stealth'],success:'card_room',failure:'card_room'}
  },
  card_room:{
    observe:{type:'solo',lowStakes:true,desc:'watch the card table for signals',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'moon_balcony',failure:'moon_balcony',effects:{flag:'black_ring'},outcomeText:'the man with the black ring is receiving signals whenever palace doors open'},
    join:{type:'support',desc:'join one hand of cards to get closer',difficulty:7,allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Knowledge'],success:'moon_balcony',failure:'moon_balcony'}
  },
  moon_balcony:{
    follow:{type:'solo',desc:'shadow the servant carrying the folded note',difficulty:7,allowedSkills:['Stealth','Agility'],success:'chapel_antechamber',failure:'chapel_antechamber'},
    read:{type:'solo',lowStakes:true,desc:'read the exchange from across the balcony',difficulty:6,allowedSkills:['Awareness','Influence'],success:'chapel_antechamber',failure:'chapel_antechamber',effects:{flag:'royal_gallery_target'},outcomeText:'the servant was directed toward the Royal Gallery just before the Prince arrives'}
  },
  chapel_antechamber:{
    help:{type:'support',desc:'open the locked chapel side door',difficulty:6,allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'balcony_watch',failure:'balcony_watch'},
    question:{type:'solo',lowStakes:true,desc:'find out why the chapel door was locked',difficulty:6,allowedSkills:['Influence','Knowledge'],success:'balcony_watch',failure:'balcony_watch',effects:{flag:'palace_lock_changed'},outcomeText:'the lock was changed that afternoon on an order carrying Corvin’s office seal'}
  },

  linen_stairs:{
    listen:{type:'solo',lowStakes:true,desc:'listen to the guard-roster conversation above',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'pantry_crossing',failure:'pantry_crossing',effects:{flag:'guard_roster_changed'},outcomeText:'the Prince’s usual guards were reassigned for tonight only'},
    climb:{type:'solo',desc:'climb before the speakers leave the landing',difficulty:7,allowedSkills:['Agility','Stealth'],success:'pantry_crossing',failure:'pantry_crossing'}
  },
  pantry_crossing:{
    blend:{type:'solo',desc:'blend into the servants crossing the lower pantry',difficulty:6,allowedSkills:['Stealth','Influence'],success:'furnace_room',failure:'furnace_room'},
    read:{type:'solo',lowStakes:true,desc:'read the steward before approaching',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'furnace_room',failure:'furnace_room',effects:{flag:'steward_nervous'},outcomeText:'the steward is checking names because someone important has already entered using a false servant identity'}
  },
  furnace_room:{
    hatch:{type:'support',desc:'open the maintenance hatch beside the furnaces',difficulty:6,allowedSkills:['Craft','Knowledge'],supportSkills:['Strength','Awareness'],success:'laundry_court',failure:'laundry_court'},
    marks:{type:'solo',lowStakes:true,desc:'study the chalk arrows beside the hatch',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'laundry_court',failure:'laundry_court',effects:{flag:'messenger_marks'},outcomeText:'the arrows form a messenger shorthand pointing toward the royal apartments'}
  },
  laundry_court:{
    cross:{type:'solo',desc:'cross behind the hanging linen',difficulty:7,allowedSkills:['Stealth','Agility'],success:'page_passage',failure:'page_passage'},
    intervene:{type:'support',desc:'distract the guards searching the kitchen boy',difficulty:6,allowedSkills:['Influence','Spirit'],supportSkills:['Awareness','Stealth'],success:'page_passage',failure:'page_passage',effects:{ally:'palace_servants'}}
  },
  page_passage:{
    trust:{type:'instant',desc:'let the frightened page guide you',success:'servant_archive',effects:{ally:'page'}},
    verify:{type:'solo',lowStakes:true,desc:'check the page’s story before following',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'servant_archive',failure:'servant_archive',effects:{flag:'royal_messenger_route'},outcomeText:'his description matches a sealed royal messenger passage omitted from public palace plans'}
  },

  old_belfry:{
    climb:{type:'support',desc:'climb the abandoned belfry safely',difficulty:6,allowedSkills:['Agility','Endurance'],supportSkills:['Craft','Awareness'],success:'bell_loft',failure:'bell_loft'},
    map:{type:'solo',lowStakes:true,desc:'map the old city foundations from the belfry',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'bell_loft',failure:'bell_loft',effects:{flag:'gate_location'},outcomeText:'a ring of foundations surrounds the buried Gate district'}
  },
  bell_loft:{
    climb:{type:'solo',desc:'climb the bell loft toward the roof',difficulty:6,allowedSkills:['Agility','Endurance'],success:'tiled_roofs',failure:'tiled_roofs'},
    rope:{type:'solo',lowStakes:true,desc:'inspect the freshly cut bell rope',difficulty:6,allowedSkills:['Craft','Awareness'],success:'tiled_roofs',failure:'tiled_roofs',effects:{flag:'bell_sabotage'},outcomeText:'the rope was cut from above, recently, with a military utility blade'}
  },
  tiled_roofs:{
    cross:{type:'support',desc:'cross the rain-slick Bell Quarter roofs',difficulty:7,allowedSkills:['Agility','Endurance'],supportSkills:['Craft','Awareness'],success:'observatory',failure:'observatory',dangerous:true},
    route:{type:'solo',lowStakes:true,desc:'find the safest line across the rooftops',difficulty:6,allowedSkills:['Awareness','Craft'],success:'observatory',failure:'observatory',effects:{flag:'safe_roofline'},outcomeText:'an old maintenance walkway avoids the steepest tiled roofs'}
  },
  observatory:{
    study:{type:'solo',lowStakes:true,desc:'study the altered instrument in the observatory',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'rain_gallery',failure:'rain_gallery',effects:{flag:'western_army_seen'},outcomeText:'the instrument was moved to monitor the western road where Corvin’s hidden troops are gathering'},
    rest:{type:'instant',desc:'shelter briefly beneath the observatory dome',success:'rain_gallery'}
  },
  rain_gallery:{
    wait:{type:'solo',lowStakes:true,desc:'identify the voices approaching the rain gallery',difficulty:6,allowedSkills:['Awareness','Spirit'],success:'roof_bridge',failure:'roof_bridge',effects:{flag:'tower_patrol_known'},outcomeText:'the voices belong to civic guards, not Corvin’s soldiers'},
    move:{type:'solo',desc:'cross the gallery before the patrol arrives',difficulty:7,allowedSkills:['Agility','Stealth'],success:'roof_bridge',failure:'roof_bridge'}
  },

  cistern:{
    soot:{type:'solo',lowStakes:true,desc:'study lantern soot and footprints in the Great Cistern',difficulty:6,allowedSkills:['Awareness','Survival'],success:'drain_lock',failure:'drain_lock',effects:{flag:'chapel_route'},outcomeText:'the freshest traffic goes toward a drainage lock rather than the obvious chapel route'},
    echo:{type:'solo',desc:'use echoes to identify the largest passage',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'drain_lock',failure:'drain_lock'}
  },
  drain_lock:{
    open:{type:'support',desc:'work the rusted drain lock',difficulty:7,allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'drowned_street',failure:'drowned_street'},
    scratches:{type:'solo',lowStakes:true,desc:'read the fresh damage on the lock wheel',difficulty:6,allowedSkills:['Craft','Awareness'],success:'drowned_street',failure:'drowned_street',effects:{flag:'recent_undercity_party'},outcomeText:'someone forced the gate from the city side only hours ago'}
  },
  drowned_street:{
    follow:{type:'solo',desc:'follow the moving light through the drowned street',difficulty:7,allowedSkills:['Awareness','Stealth'],success:'salt_vault',failure:'salt_vault'},
    road:{type:'instant',desc:'stay on the drowned road',success:'salt_vault'}
  },
  salt_vault:{
    search:{type:'solo',lowStakes:true,desc:'search the recent camp in the salt vault',difficulty:6,allowedSkills:['Awareness','Survival'],success:'whisper_culvert',failure:'whisper_culvert',effects:{flag:'soldier_camp_below'},outcomeText:'the camp belonged to trained soldiers moving through the undercity, not ordinary smugglers'},
    pass:{type:'instant',desc:'leave the camp undisturbed',success:'whisper_culvert'}
  },
  whisper_culvert:{
    marks:{type:'solo',lowStakes:true,desc:'read the partly submerged smuggler marks',difficulty:6,allowedSkills:['Knowledge','Awareness'],success:'smuggler_chapel',failure:'smuggler_chapel',effects:{flag:'safe_culvert'},outcomeText:'one culvert is marked as a safe route toward the buried royal works'},
    air:{type:'solo',desc:'follow the strongest current of fresh air',difficulty:6,allowedSkills:['Survival','Spirit'],success:'smuggler_chapel',failure:'smuggler_chapel'}
  },

  gate_tower:{
    stop:{type:'team',desc:'stop the West Gate windlass before the doors open',memberDifficulty:7,teamSize:3,success:'wall_walk',failure:'wall_walk',dangerous:true,reason:'Machinery, attackers and the damaged lock all need attention.',teamRoles:[{name:'Control the windlass',skills:['Strength','Craft']},{name:'Repair the lock',skills:['Craft','Knowledge']},{name:'Hold the stair',skills:['Agility','Endurance']}],effects:{flag:'west_gate_closed'}},
    sense:{type:'solo',lowStakes:true,desc:'identify who is actually commanding the gate tower',difficulty:6,allowedSkills:['Awareness','Influence'],success:'wall_walk',failure:'wall_walk',effects:{flag:'gate_traitor_known'},outcomeText:'the officer directing the tower is giving orders from behind the fighting'}
  },
  wall_walk:{
    hold:{type:'team',desc:'hold the West Wall walk while the Watch regroups',memberDifficulty:7,teamSize:3,success:'chain_room',failure:'chain_room',dangerous:true,teamRoles:[{name:'Hold the stairhead',skills:['Strength','Endurance']},{name:'Watch the parapet',skills:['Awareness','Agility']},{name:'Keep the Watch moving',skills:['Influence','Spirit']}]},
    route:{type:'solo',lowStakes:true,desc:'find the fastest route to the chain room',difficulty:6,allowedSkills:['Awareness','Craft'],success:'chain_room',failure:'chain_room',effects:{flag:'gate_shortcut'},outcomeText:'a maintenance stair bypasses the exposed lower landing'}
  },
  chain_room:{
    repair:{type:'support',desc:'repair the sabotaged gate chain',difficulty:7,allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'outer_yard',failure:'outer_yard'},
    inspect:{type:'solo',lowStakes:true,desc:'find any other tampering in the chain room',difficulty:6,allowedSkills:['Craft','Knowledge'],success:'outer_yard',failure:'outer_yard',effects:{flag:'gate_second_sabotage'},outcomeText:'a second wedge was hidden beneath the counterweight brake'}
  },
  outer_yard:{
    prepare:{type:'team',desc:'prepare the outer yard for Corvin’s second wave',memberDifficulty:6,teamSize:3,success:'gate_counterattack',failure:'gate_counterattack',teamRoles:[{name:'Set the barricade',skills:['Strength','Craft']},{name:'Choose firing lanes',skills:['Awareness','Knowledge']},{name:'Rally the wounded',skills:['Influence','Spirit']}]},
    listen:{type:'solo',lowStakes:true,desc:'locate the approaching horns',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'gate_counterattack',failure:'gate_counterattack',effects:{flag:'counterattack_flank'},outcomeText:'the second wave is massing on the river-side stair rather than the main road'}
  },

  powder_room:{
    save:{type:'team',desc:'contain the fire in the arsenal powder room',memberDifficulty:7,teamSize:3,success:'forge_floor',failure:'forge_floor',dangerous:true,reason:'Water, powder barrels and panicked workers must all be managed at once.',teamRoles:[{name:'Smother the flame',skills:['Craft','Endurance']},{name:'Move the barrels',skills:['Strength','Agility']},{name:'Direct the workers',skills:['Influence','Awareness']}],effects:{ally:'arsenal'}},
    sense:{type:'solo',lowStakes:true,desc:'work out who started the powder-room fire',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'forge_floor',failure:'forge_floor',effects:{flag:'arsenal_saboteur'},outcomeText:'the fire was deliberately started from inside the arsenal'}
  },
  forge_floor:{
    organise:{type:'support',desc:'organise the forge workers and secure the floor',difficulty:6,allowedSkills:['Influence','Craft'],supportSkills:['Spirit','Awareness'],success:'cart_shed',failure:'cart_shed'},
    sense:{type:'solo',lowStakes:true,desc:'find the safest defensive position on the forge floor',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'cart_shed',failure:'cart_shed',effects:{flag:'forge_position'},outcomeText:'the raised quenching platform controls both side entrances'}
  },
  cart_shed:{
    lane:{type:'solo',desc:'scout the narrow service lane behind the cart shed',difficulty:7,allowedSkills:['Stealth','Awareness'],success:'armoury_gallery',failure:'armoury_gallery'},
    move:{type:'team',desc:'move the ammunition carts across the exposed yard',memberDifficulty:6,teamSize:3,success:'armoury_gallery',failure:'armoury_gallery',teamRoles:[{name:'Move the first cart',skills:['Strength','Endurance']},{name:'Watch the yard',skills:['Awareness','Agility']},{name:'Clear the route',skills:['Craft','Influence']}]}
  },
  armoury_gallery:{
    defend:{type:'team',desc:'prepare the Armoury Gallery for the final assault',memberDifficulty:7,teamSize:3,success:'arsenal_hold',failure:'arsenal_hold',dangerous:true,teamRoles:[{name:'Hold the gallery stairs',skills:['Strength','Endurance']},{name:'Cover the doors below',skills:['Awareness','Agility']},{name:'Keep the defenders steady',skills:['Influence','Spirit']}]},
    weak:{type:'solo',lowStakes:true,desc:'identify the attackers’ weakest approach',difficulty:6,allowedSkills:['Awareness','Knowledge'],success:'arsenal_hold',failure:'arsenal_hold',effects:{flag:'arsenal_weak_flank'},outcomeText:'the eastern stair is thinly held because Corvin expects the main defence at the doors'}
  }
});

actionMap.watch_house={crossroads:{type:'instant',desc:'take the investigation into Greyhaven',success:'city_crossroads'}};
actionMap.palace_audience={routes:{type:'instant',desc:'choose how to move through Royal Hill',success:'palace_route_choice'}};
actionMap.border_news={routes:{type:'instant',desc:'choose a route into Old Greyhaven',success:'old_city_choice'}};
actionMap.coup_begins={begin:{type:'instant',desc:'enter the first wave of the coup',success:'coup_wave'}};


// Split-front setback detours also rejoin at the palace siege.
actionMap.west_gate={close:{type:'team',desc:'retake and close the West Gate after the counterattack',memberDifficulty:7,teamSize:3,success:'@merge:coup_fronts:palace_siege',failure:'@merge:coup_fronts:palace_siege',dangerous:true,reason:'The damaged gatehouse still needs fighting, machinery and coordination.',teamRoles:[{name:'Retake the stairs',skills:['Strength','Endurance']},{name:'Free the chain',skills:['Craft','Knowledge']},{name:'Protect the Watch',skills:['Influence','Awareness']}],effects:{ally:'gate_guard'}},collapse:{type:'support',desc:'collapse the old service bridge behind the attackers',difficulty:8,allowedSkills:['Craft','Strength'],supportSkills:['Knowledge','Endurance'],success:'@merge:coup_fronts:palace_siege',failure:'@merge:coup_fronts:palace_siege',dangerous:true,effects:{flag:'west_gate_closed'}}};
actionMap.arsenal={defend:{type:'team',desc:'defend the arsenal after the line buckles',memberDifficulty:7,teamSize:3,success:'@merge:coup_fronts:palace_siege',failure:'@merge:coup_fronts:palace_siege',dangerous:true,reason:'The doors, workers and powder stores must be held together.',teamRoles:[{name:'Hold the doors',skills:['Strength','Endurance']},{name:'Secure the powder',skills:['Craft','Knowledge']},{name:'Protect the workers',skills:['Influence','Awareness']}],effects:{ally:'arsenal'}},move:{type:'support',desc:'move the weapons through the old stores before the attackers arrive',difficulty:7,allowedSkills:['Craft','Strength'],supportSkills:['Awareness','Survival'],success:'@merge:coup_fronts:palace_siege',failure:'@merge:coup_fronts:palace_siege',effects:{ally:'arsenal'}},destroy:{type:'solo',desc:'destroy the powder stores rather than lose them',difficulty:8,allowedSkills:['Craft','Knowledge'],success:'@merge:coup_fronts:palace_siege',failure:'@merge:coup_fronts:palace_siege',dangerous:true,effects:{flag:'arsenal_destroyed'}}};

io.on('connection', socket => {
  socket.on('createRoom', ({name,cls,background,portrait}) => {name=cleanName(name);if(!name||!classes.includes(cls))return socket.emit('errorMsg','Enter a hero name and class.');const room=newRoom(null);const p=newPlayer(socket,name,cls,room,background,portrait);room.hostId=p.id;room.players.push(p);rooms.set(room.code,room);attachSocket(room,p,socket);sendJoined(socket,room,p);emitRoom(room);});
  socket.on('joinRoom', ({roomCode:code,name,cls,background,portrait}) => {const c=String(code||'').toUpperCase().trim(),room=rooms.get(c);if(!room)return socket.emit('errorMsg','Room not found. Check the code and try again.');if(room.phase!=='lobby')return socket.emit('errorMsg','That expedition has already begun. Returning player? Use “Return to Existing Adventure” with your room code and 4-digit Return PIN.');if(room.players.length>=6)return socket.emit('errorMsg','That room already has six players.');name=cleanName(name);if(!name||!classes.includes(cls))return socket.emit('errorMsg','Enter a hero name and class.');const p=newPlayer(socket,name,cls,room,background,portrait);room.players.push(p);attachSocket(room,p,socket);sendJoined(socket,room,p);emitRoom(room);});
  socket.on('returnToRoom', ({roomCode:code,returnPin}) => {const c=String(code||'').toUpperCase().trim(),room=rooms.get(c);if(!room)return socket.emit('errorMsg','That adventure is not active yet. Ask the host to restore it first.');const pin=String(returnPin||'').replace(/\D/g,'').slice(0,4);const p=room.players.find(x=>x.returnPin===pin);if(!p)return socket.emit('errorMsg','Return PIN not recognised for that room.');attachSocket(room,p,socket);sendJoined(socket,room,p,'resumed');emitRoom(room);const g=groupForPlayer(room,p);if(room.phase==='playing'&&g)emitContextClues(room,g.scene,g.playerIds);});
  socket.on('leaveRoomView',()=>{const room=rooms.get(socket.data.roomCode),p=room&&socketPlayer(room,socket);if(p){p.connected=false;p.socketId=null;socket.leave(room.code);addLog(room,`${p.name} stepped away from the table.`);emitRoom(room);}socket.data.roomCode=null;socket.data.playerId=null;socket.emit('leftRoomView');});
  socket.on('resumeRoom',({roomCode:code,resumeToken})=>{const c=String(code||'').toUpperCase().trim(),room=rooms.get(c);if(!room)return socket.emit('resumeFailed',{reason:'room_missing'});const p=room.players.find(x=>x.resumeToken===resumeToken);if(!p)return socket.emit('resumeFailed',{reason:'player_missing'});attachSocket(room,p,socket);sendJoined(socket,room,p,'resumed');emitRoom(room);const g=groupForPlayer(room,p);if(room.phase==='playing'&&g)emitContextClues(room,g.scene,g.playerIds);});
  socket.on('restoreCampaign',({saveToken,resumeToken,asHost})=>{const data=decodeSave(saveToken);if(!data)return socket.emit('errorMsg','That campaign save could not be read.');const pData=resumeToken?data.players.find(p=>p.resumeToken===resumeToken):(asHost?data.players.find(p=>p.id===data.hostId):null);if(!pData)return socket.emit('errorMsg','That saved campaign could not identify your hero.');if(rooms.has(data.code)){const existing=rooms.get(data.code),p=existing.players.find(x=>x.id===pData.id);if(!p)return socket.emit('errorMsg','A room with that code is already active.');attachSocket(existing,p,socket);sendJoined(socket,existing,p,'resumed');emitRoom(existing);return;}const room=migrateRoom({...data,players:data.players.map(p=>({...p,socketId:null,connected:false})),log:Array.isArray(data.log)?data.log:[]});for(const rp of room.players)if(!rp.returnPin)rp.returnPin=makeReturnPin(room);if(!room.players.some(p=>p.id===room.hostId))room.hostId=pData.id;const p=room.players.find(x=>x.id===pData.id);attachSocket(room,p,socket);rooms.set(room.code,room);addLog(room,`Campaign restored at ${primaryScene(room)}.`);sendJoined(socket,room,p,'resumed');emitRoom(room);const g=groupForPlayer(room,p);if(room.phase==='playing'&&g)emitContextClues(room,g.scene,g.playerIds);});
  socket.on('requestCampaignSave',()=>{const room=rooms.get(socket.data.roomCode);if(!room||room.hostId!==socket.data.playerId)return;emitCampaignSave(room);});
  socket.on('setCharacter',({stats})=>{const room=rooms.get(socket.data.roomCode);if(!room||room.phase!=='lobby')return;const p=socketPlayer(room,socket);if(!p)return;const normalized=emptyStats();for(const s of skills)normalized[s]=Number(stats?.[s]||0);if(!validStats(normalized))return socket.emit('errorMsg','Allocate exactly 20 points, with no skill above 5.');p.stats=normalized;p.ready=true;emitRoom(room);});
  socket.on('allocateSkillPoint',({skill})=>{const room=rooms.get(socket.data.roomCode);const p=room&&socketPlayer(room,socket);if(!room||!p||!skills.includes(skill))return;if((p.skillPoints||0)<1)return socket.emit('errorMsg','You do not have an unspent Skill Point.');if((p.stats[skill]||0)>=7)return socket.emit('errorMsg','That skill has reached the campaign maximum of 7.');p.stats[skill]++;p.skillPoints--;addLog(room,`${p.name} improved ${skill} to ${p.stats[skill]}.`);emitRoom(room);});
  socket.on('chooseTalent',({talent})=>{const room=rooms.get(socket.data.roomCode);const p=room&&socketPlayer(room,socket);if(!room||!p||p.talent)return;const choices=talents[p.cls]||{};if(!choices[talent])return socket.emit('errorMsg','That talent is not available to your class.');if(!Object.values(p.stats||{}).some(v=>v>=6))return socket.emit('errorMsg','Reach 6 in any skill before choosing an advanced talent.');p.talent=talent;addLog(room,`${p.name} unlocked the ${talent} talent.`);io.to(p.socketId||'').emit('talentEarned',{talent,desc:choices[talent].desc});emitRoom(room);});
  socket.on('startGame',()=>{const room=rooms.get(socket.data.roomCode);if(!hostOnly(room,socket))return;if(!room.players.length||!room.players.every(p=>p.ready))return socket.emit('errorMsg','Every player must lock their character first.');room.phase='playing';room.chapter=1;room.activeIndex=0;initMainGroup(room,'arrival');addLog(room,'The adventure begins.');emitRoom(room);emitContextClues(room,'arrival',room.players.map(p=>p.id));});
  socket.on('useHealingDraught',({playerId})=>{const room=rooms.get(socket.data.roomCode);if(!room||!hasItem(room,'healing_draught'))return;const active=activePlayer(room);if(!active||active.id!==socket.data.playerId)return socket.emit('errorMsg','Use items on your turn.');const target=getPlayer(room,playerId)||active;if(target.wounds<=0)return socket.emit('errorMsg','That hero has no wound to heal.');target.wounds--;consumeItem(room,'healing_draught');const g=activeGroup(room);if(g)g.lastRoll={type:'item',name:'Healing Draught',text:`${target.name} removes one wound.`};emitRoom(room);});
  socket.on('hostSkipTurn',()=>{const room=rooms.get(socket.data.roomCode);if(!hostOnly(room,socket)||room.phase!=='playing')return;const g=activeGroup(room);if(g){g.pending=null;g.lastRoll=null;}nextTurn(room);emitRoom(room);});
  socket.on('hostResetChallenge',()=>{const room=rooms.get(socket.data.roomCode);if(!hostOnly(room,socket)||room.phase!=='playing')return;const g=activeGroup(room);if(g){g.pending=null;g.lastRoll=null;}emitRoom(room);});
  socket.on('hostRemovePlayer',({playerId})=>{const room=rooms.get(socket.data.roomCode);if(!hostOnly(room,socket))return;removeDisconnected(room,playerId);emitRoom(room);});

  socket.on('chooseAction',({action})=>{const room=rooms.get(socket.data.roomCode);if(!room||room.phase!=='playing')return;const active=activePlayer(room),group=activeGroup(room);if(!active||!group||active.id!==socket.data.playerId)return socket.emit('errorMsg','It is not your turn.');if(group.pending)return;const cfg=actionMap[group.scene]?.[action];if(!cfg)return;const unmet=requirementsMet(room,cfg);if(unmet)return socket.emit('errorMsg',unmet);
    if(cfg.type==='split'){if(group.playerIds.length<2){const target=cfg.soloScene||cfg.routes?.a?.scene;emitOutcome(room,outcomePayload(room,cfg,'instant',target,{},group),group);transition(room,target,group);nextTurn(room);emitRoom(room);return;}group.pending={...cfg,action,actingPlayerId:active.id,type:'split'};emitRoom(room);return;}
    if(cfg.type==='instant'){effect(room,cfg,true);const target=cfg.success;emitOutcome(room,outcomePayload(room,cfg,'instant',target,{},group),group);transition(room,target,group);addLog(room,`${active.name}: ${cfg.desc||action}.`);nextTurn(room);emitRoom(room);return;}
    const tr=threatRules(room),tp=cfg.type==='team'?teamProfile(cfg,room,group):null;group.pending={...cfg,teamRoles:Array.isArray(cfg.teamRoles)?cfg.teamRoles.map(r=>({...r,skills:(r.skills||[]).slice(0,2)})):cfg.teamRoles,allowedSkills:challengeSkills(cfg),supportSkills:supportSkillsFor(cfg),effectiveDifficulty:Number(cfg.difficulty||0)+(cfg.dangerous?tr.dangerPenalty:0),effectiveMemberDifficulty:Number(cfg.memberDifficulty||0)+(cfg.dangerous?tr.dangerPenalty:0),supportTarget:tr.supportTarget,threatLabel:tr.label,teamProfile:tp,action,actingPlayerId:active.id};emitRoom(room);
  });

  socket.on('resolveSplit',({assignments})=>{const room=rooms.get(socket.data.roomCode),active=room&&activePlayer(room),group=room&&activeGroup(room);if(!room||!active||!group||active.id!==socket.data.playerId||group.pending?.type!=='split')return;const cfg=group.pending,routes=cfg.routes||{};const ids=[...group.playerIds];const map=assignments||{};const a=ids.filter(id=>map[id]==='a'),b=ids.filter(id=>map[id]==='b');if(!a.length||!b.length)return socket.emit('errorMsg','Put at least one hero on each route.');const splitSet='split_'+crypto.randomBytes(4).toString('hex');const mk=(key,members)=>({id:splitSet+'_'+key,name:routes[key]?.name||`Group ${key.toUpperCase()}`,playerIds:members,scene:routes[key]?.scene,pending:null,lastRoll:null,trail:[routes[key]?.scene],splitSet,waitingMerge:null});const ga=mk('a',a),gb=mk('b',b);room.routeHistory=room.routeHistory||[];room.routeHistory.push({id:group.id,name:group.name,playerIds:[...group.playerIds],trail:[...(group.trail||[])],complete:true});room.groups=room.groups.filter(g=>g.id!==group.id);room.groups.push(ga,gb);for(const id of a){const p=getPlayer(room,id);if(p)p.groupId=ga.id;}for(const id of b){const p=getPlayer(room,id);if(p)p.groupId=gb.id;}recordScene(room,ga,ga.scene);recordScene(room,gb,gb.scene);emitContextClues(room,ga.scene,a);emitContextClues(room,gb.scene,b);addLog(room,`The company split: ${ga.name} and ${gb.name}.`);nextTurn(room);emitRoom(room);});

  socket.on('rollChallenge',({skill,supportPlayerId,supportSkill,team})=>{const room=rooms.get(socket.data.roomCode);if(!room)return;const group=activeGroup(room),cfg=group?.pending,active=activePlayer(room);if(!group||!cfg)return;if(!active||active.id!==socket.data.playerId||cfg.actingPlayerId!==socket.data.playerId)return socket.emit('errorMsg','Only the active hero can resolve this challenge.');let success=false,detail={type:cfg.type,desc:cfg.desc},participants=[];
    if(cfg.type==='team'){const profile=cfg.teamProfile||teamProfile(cfg,room,group),needed=profile.count;if(!Array.isArray(team)||team.length!==needed)return socket.emit('errorMsg',`Choose ${needed} different heroes.`);const ids=team.map(x=>x.playerId);if(new Set(ids).size!==ids.length)return socket.emit('errorMsg','Choose different heroes for each team slot.');if(ids.some(id=>!group.playerIds.includes(id)))return socket.emit('errorMsg','Team members must be with your current group.');const results=[];for(let i=0;i<team.length;i++){const pick=team[i],p=getPlayer(room,pick.playerId);if(!p||!skills.includes(pick.skill))return socket.emit('errorMsg','Invalid team selection.');const role=cfg.teamRoles?.[i];if(role&&!role.skills.includes(pick.skill))return socket.emit('errorMsg',`${role.name} needs one of its listed skills.`);let rollMode='normal',rolls=[];const mastery=Number(p.stats[pick.skill]||0)>=6,wounded=cfg.dangerous&&p.wounds>=2;if(mastery&&!wounded){rollMode='advantage';rolls=[rollD6(),rollD6()];}else if(wounded&&!mastery){rollMode='disadvantage';rolls=[rollD6(),rollD6()];}else rolls=[rollD6()];const die=rollMode==='advantage'?Math.max(...rolls):rollMode==='disadvantage'?Math.min(...rolls):rolls[0],bonus=skillBonus(p,pick.skill,cfg,true),total=die+bonus,ok=total>=(cfg.effectiveMemberDifficulty||cfg.memberDifficulty);if(!ok&&cfg.dangerous)p.wounds=Math.min(3,p.wounds+1);results.push({playerId:p.id,name:p.name,role:role?.name||null,skill:pick.skill,rolls,rollMode,die,bonus,total,ok});participants.push(p);}const successes=results.filter(r=>r.ok).length;const full=profile.full,partialAt=profile.partial;const grade=successes>=full?'success':(partialAt!=null&&successes>=partialAt?'partial':'setback');success=grade!=='setback';detail={...detail,results,successes,need:full,full,partialAt,grade,success,dangerous:!!cfg.dangerous};
    } else {const allowed=challengeSkills(cfg);if(!allowed.includes(skill))return socket.emit('errorMsg',`This challenge requires ${allowed.join(' or ')}.`);let rollMode='normal',dice=[];const mastery=Number(active.stats[skill]||0)>=6,wounded=cfg.dangerous&&active.wounds>=2;if(mastery&&!wounded){rollMode='advantage';dice=[rollD6(),rollD6()];}else if(wounded&&!mastery){rollMode='disadvantage';dice=[rollD6(),rollD6()];}else dice=Array.from({length:cfg.dice||1},rollD6);const base=rollMode==='advantage'?Math.max(...dice):rollMode==='disadvantage'?Math.min(...dice):dice.reduce((a,b)=>a+b,0),bonus=skillBonus(active,skill,cfg,false);let support=null,supportBonus=0;participants.push(active);if(cfg.type==='support'&&supportPlayerId){const sp=getPlayer(room,supportPlayerId);const supportAllowed=supportSkillsFor(cfg);if(!sp||sp.id===active.id||!group.playerIds.includes(sp.id)||!sp.supportReady||!supportAllowed.includes(supportSkill))return socket.emit('errorMsg',`Support here requires ${supportAllowed.join(' or ')}.`);const die=rollD6(),total=die+skillBonus(sp,supportSkill,cfg,false),ok=total>=(cfg.supportTarget||6);sp.supportReady=false;supportBonus=ok?(sp.talent==='Guardian'?3:2):0;support={playerId:sp.id,name:sp.name,skill:supportSkill,die,total,ok};participants.push(sp);}const total=base+bonus+supportBonus;success=total>=(cfg.effectiveDifficulty||cfg.difficulty);if(!success&&cfg.dangerous)active.wounds=Math.min(3,active.wounds+1);detail={...detail,dice,rollMode,skill,bonus,support,supportBonus,total,difficulty:(cfg.effectiveDifficulty||cfg.difficulty),success,dangerous:!!cfg.dangerous};}
    const low=!!cfg.lowStakes;if(!low)for(const p of participants)awardGrowth(room,p,1,'resolving a challenge');if(success){effect(room,cfg,true);if(cfg.type==='team'&&detail.grade==='partial')applyTeamPartialCost(room,detail);}else if(!low)room.threat=Math.min(6,room.threat+1);applyRollMoment(room,detail);if(low&&detail.complication){if(detail.complicationEffect==='Threat +1')room.threat=Math.max(0,room.threat-1);detail.complication=false;detail.complicationEffect=null;}group.lastRoll=detail;addLog(room,`${active.name}: ${cfg.desc} — ${success?(detail.grade==='partial'?'partial success':'success'):'setback'}.`);
    if(success){const graded=low?'sense':(cfg.type==='team'&&detail.grade==='partial'?'partial':'success');const target=cfg.success;emitOutcome(room,outcomePayload(room,cfg,graded,target,detail,group),group);transition(room,target,group);nextTurn(room);emitRoom(room);return;}
    if(low){const target=cfg.failure||cfg.success;emitOutcome(room,outcomePayload(room,cfg,'miss',target,detail,group),group);transition(room,target,group);nextTurn(room);emitRoom(room);return;}
    const interveners=groupPlayers(room,group).filter(p=>p.id!==active.id&&p.interventionReady);if(interveners.length){group.pending={...cfg,failed:true,lastDetail:detail,eligibleInterveners:interveners.map(p=>p.id)};emitRoom(room);return;}resolveFailure(room,cfg,group);emitRoom(room);
  });

  socket.on('spendHope',()=>{const room=rooms.get(socket.data.roomCode),group=room&&activeGroup(room);if(!room||!group?.pending?.failed)return;const active=activePlayer(room);if(!active||active.id!==socket.data.playerId)return socket.emit('errorMsg','Only the active hero can spend Hope here.');if(room.hope<2)return socket.emit('errorMsg','The company needs 2 Hope to soften this setback.');const cfg=group.pending,detail=cfg.lastDetail||group.lastRoll||{};room.hope-=2;detail.partialEffect='Hope -2';effect(room,cfg,true);emitOutcome(room,outcomePayload(room,cfg,'partial',cfg.success,detail,group),group);transition(room,cfg.success,group);nextTurn(room);emitRoom(room);});
  socket.on('intervene',()=>{const room=rooms.get(socket.data.roomCode),group=room&&activeGroup(room);if(!room||!group?.pending?.failed)return;const p=socketPlayer(room,socket);if(!p||!group.playerIds.includes(p.id)||!p.interventionReady||!group.pending.eligibleInterveners.includes(p.id))return;const skill={Knight:'Strength',Ranger:'Awareness',Thief:'Stealth',Mage:'Spirit',Monk:'Spirit',Engineer:'Craft'}[p.cls],die=rollD6(),total=die+skillBonus(p,skill,group.pending,false),ok=total>=(p.talent==='Healer'?6:7);p.interventionReady=false;awardGrowth(room,p,1,'a Heroic Intervention');group.lastRoll={type:'intervention',name:p.name,skill,die,total,success:ok};const cfg=group.pending;if(ok){effect(room,cfg,true);emitOutcome(room,outcomePayload(room,cfg,'partial',cfg.success,{heroicMoment:false,complication:false},group),group);transition(room,cfg.success,group);nextTurn(room);emitRoom(room);}else{const active=activePlayer(room),remaining=groupPlayers(room,group).filter(x=>x.id!==active?.id&&x.interventionReady&&cfg.eligibleInterveners.includes(x.id));if(!remaining.length){resolveFailure(room,cfg,group);emitRoom(room);}else emitRoom(room);}});
  socket.on('declineIntervention',()=>{const room=rooms.get(socket.data.roomCode),group=room&&activeGroup(room);if(!room||!group?.pending?.failed)return;const active=activePlayer(room);if(!active||active.id!==socket.data.playerId)return;resolveFailure(room,group.pending,group);emitRoom(room);});
  socket.on('disconnect',()=>{const room=rooms.get(socket.data.roomCode);if(!room)return;const p=socketPlayer(room,socket);if(p&&p.socketId===socket.id){p.connected=false;p.socketId=null;}emitRoom(room);if(!room.players.some(x=>x.connected))setTimeout(()=>{if(rooms.get(room.code)===room&&!room.players.some(x=>x.connected))rooms.delete(room.code);},4*60*60*1000);});
});

server.listen(PORT, () => console.log(`Black Seal RPG listening on ${PORT}`));
