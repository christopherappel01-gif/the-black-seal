const socket = io();
const classes = ['Knight','Ranger','Thief','Mage','Monk','Engineer'];
const skills = ['Strength','Agility','Endurance','Awareness','Survival','Stealth','Knowledge','Craft','Influence','Spirit'];
const backgrounds={Noble:{edge:'Influence',text:'Raised around courts, duty and difficult conversations.'},Outlander:{edge:'Survival',text:'Comfortable far from roads, maps and civilisation.'},Scholar:{edge:'Knowledge',text:'Trained to recognise history, symbols and forgotten ideas.'},Sailor:{edge:'Endurance',text:'Used to storms, ropes, cramped quarters and hard work.'},Streetwise:{edge:'Stealth',text:'Quick at reading danger, locks and people who lie.'},Artisan:{edge:'Craft',text:'A practical maker who understands tools and how things fit together.'}};
const classInfo = {
  Knight:{icon:'⚔️',gift:'Guardian — excels at holding the line, protecting allies and forcing a path through danger.',fav:['Strength','Endurance','Influence'],build:{Strength:5,Agility:1,Endurance:4,Awareness:2,Survival:2,Stealth:0,Knowledge:1,Craft:1,Influence:3,Spirit:1}},
  Ranger:{icon:'🏹',gift:'Trailwise — gains +1 to Awareness or Survival checks outdoors.',fav:['Agility','Awareness','Survival'],build:{Strength:1,Agility:4,Endurance:2,Awareness:5,Survival:4,Stealth:2,Knowledge:0,Craft:0,Influence:1,Spirit:1}},
  Thief:{icon:'🗡️',gift:'Shadowstep — built for stealth, infiltration, traps and rapid improvisation.',fav:['Agility','Stealth','Awareness'],build:{Strength:1,Agility:5,Endurance:1,Awareness:4,Survival:2,Stealth:5,Knowledge:0,Craft:1,Influence:1,Spirit:0}},
  Mage:{icon:'✨',gift:'Arcane Sight — gains +1 to Knowledge or Spirit checks involving magic.',fav:['Knowledge','Spirit','Awareness'],build:{Strength:0,Agility:1,Endurance:1,Awareness:3,Survival:1,Stealth:0,Knowledge:5,Craft:2,Influence:2,Spirit:5}},
  Monk:{icon:'🕯️',gift:'Mend — resilient spiritual healer and the party’s calm centre in moments of fear.',fav:['Spirit','Endurance','Influence'],build:{Strength:1,Agility:1,Endurance:4,Awareness:2,Survival:2,Stealth:0,Knowledge:2,Craft:0,Influence:3,Spirit:5}},
  Engineer:{icon:'⚙️',gift:'Improviser — gains +1 to Craft checks; invaluable with mechanisms, repairs and construction.',fav:['Craft','Knowledge','Strength'],build:{Strength:3,Agility:1,Endurance:2,Awareness:2,Survival:1,Stealth:0,Knowledge:4,Craft:5,Influence:1,Spirit:1}}
};
const sceneArt={
 intro:['⛵','The golden light on the horizon'],storm:['⛈️','The Black Storm'],wave:['🌊','A wall of water rises'],wreck:['🏝️','A shore beneath unknown stars'],road:['🗿','The Broken Road'],troll:['👹','The Bridge of Roots'],
 green_gate:['🌿','The gates of the Green Ruins'],survivor_camp:['⛺','Voices among the wreckage'],whisper_ruins:['🏛️','Ruins that move when no one watches'],six_mural:['🜂','Six figures carved in stone'],night_camp:['🔥','A quiet fire beneath unknown stars'],
 goblin_border:['🛡️','Painted shields among the trees'],council:['👑','Lady Serayne’s council'],medicine_choice:['🌿','One medicine, two desperate needs'],broken_keep:['🏰','The armoury beneath the broken keep'],ash_sails:['⛵','Black sails on the western sea'],
 ash_coast:['⚫','The Order of Ash has landed'],vael_parley:['⚔️','Commander Vael asks to speak'],traitor_reveal:['🗝️','The silver key finally fits'],escape_coast:['🔥','The coast erupts into pursuit'],
 mountain_gate:['⛰️','The sealed road beneath the mountain'],vault_puzzle:['⚙️','Six stations around an ancient machine'],heart_chamber:['💠','The Heart of Aranor'],collapse:['🪨','The mountain begins to fall'],
 final_road:['🌄','The last road to the beacon'],allies_arrive:['📯','Old choices return as allies'],finale_crisis:['🔥','Three fires at once'],last_beacon:['✨','The Last Beacon']
};
const sceneImages={
 intro:'assets/title.jpg',storm:'assets/storm.jpg',wave:'assets/storm.jpg',wreck:'assets/consequence.jpg',road:'assets/green_ruins_bespoke.jpg',troll:'assets/troll.jpg',
 green_gate:'assets/green_ruins_bespoke.jpg',survivor_camp:'assets/green_ruins_bespoke.jpg',whisper_ruins:'assets/green_ruins_bespoke.jpg',six_mural:'assets/mural_six_bespoke.jpg',night_camp:'assets/lost_home.jpg',quiet_fire:'assets/green_ruins_bespoke.jpg',
 goblin_border:'assets/random.jpg',council:'assets/serayne_council_bespoke.jpg',medicine_choice:'assets/consequence.jpg',broken_keep:'assets/mountain_gate_bespoke.jpg',ash_sails:'assets/storm.jpg',
 ash_coast:'assets/order_landing_bespoke.jpg',vael_parley:'assets/order_landing_bespoke.jpg',traitor_reveal:'assets/chest.jpg',escape_coast:'assets/order_landing_bespoke.jpg',
 mountain_gate:'assets/mountain_gate_bespoke.jpg',vault_puzzle:'assets/dice.jpg',heart_chamber:'assets/heart_aranor_bespoke.jpg',collapse:'assets/storm.jpg',
 final_road:'assets/green_ruins_bespoke.jpg',allies_arrive:'assets/white_city_finale_bespoke.jpg',finale_crisis:'assets/consequence.jpg',last_beacon:'assets/white_city_finale_bespoke.jpg'
};
Object.assign(sceneImages,{smoke_shore:'assets/consequence.jpg',marsh_recovery:'assets/lost_home.jpg',wolf_pursuit:'assets/troll.jpg',spore_sick:'assets/green_ruins_bespoke.jpg',hunters_camp:'assets/lost_home.jpg',canyon_floor:'assets/mountain_gate_bespoke.jpg',hanging_platform:'assets/mountain_gate_bespoke.jpg',mirror_detour:'assets/heart_aranor_bespoke.jpg',burning_courtyard:'assets/white_city_finale_bespoke.jpg'});
const portraitImages={Knight:['assets/knight_1.jpg','assets/knight_2.jpg','assets/knight_3.jpg'],Ranger:['assets/ranger_1.jpg','assets/ranger_2.jpg','assets/ranger_3.jpg'],Thief:['assets/thief_1.jpg','assets/thief_2.jpg','assets/thief_3.jpg'],Mage:['assets/mage_1.jpg','assets/mage_2.jpg','assets/mage_3.jpg'],Monk:['assets/monk_1.jpg','assets/monk_2.jpg','assets/monk_3.jpg'],Engineer:['assets/engineer_1.jpg','assets/engineer_2.jpg','assets/engineer_3.jpg']};
const portraitChoice={create:1,join:1};
const portraitPath=(cls,n=1)=>portraitImages[cls]?.[Math.max(0,Math.min(2,Number(n||1)-1))]||portraitImages[cls]?.[0]||'assets/portraits.jpg';
const npcInfo={Veyra:{name:'Captain Veyra',img:'assets/npc_veyra.jpg',tag:'Expedition captain'},Nim:{name:'Nim',img:'assets/npc_nim.jpg',tag:'Goblin survivor'},Serayne:{name:'Lady Serayne',img:'assets/npc_serayne.jpg',tag:'Leader of the Green Court'},Thorne:{name:'Elias Thorne',img:'assets/npc_thorne.jpg',tag:'Scholar of Aranor'},Vael:{name:'Commander Vael',img:'assets/npc_vael.jpg',tag:'Commander of the Order of Ash'}};
let me=null,state=null,myStats=emptyStats(),roomCode='';
let audioOn=true,ambientOn=readJson('lostExpeditionAmbient')!==false,lastSceneSeen=null,lastRollSeen='',dismissedRollKey='',previousSnapshot=null,suppressNextSceneReveal=false,pendingStoryBridge=null;
let ambientScene=null,ambientMaster=null,ambientNodes=[],ambientTimer=null;
let voiceJoined=false,voiceMuted=false,localVoiceStream=null,voiceAnalyserFrame=null,localSpeaking=false;
const voicePeers=new Map(),voiceSpeaking=new Map();
const voiceRtcConfig={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};
let sessionInfo=readJson('lostExpeditionSession');
let campaignSave=readJson('lostExpeditionCampaign');
let privateClues=[];
let autoResumeTried=false;
function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function clearKey(key){try{localStorage.removeItem(key)}catch{}}
function clueStorageKey(code=roomCode,id=me){return code&&id?`lostExpeditionClues_${code}_${id}`:null}
function loadPrivateClues(code=roomCode,id=me){const key=clueStorageKey(code,id);privateClues=key?(readJson(key)||[]):[];return privateClues}
function savePrivateClues(){const key=clueStorageKey();if(key)writeJson(key,privateClues)}

const $=id=>document.getElementById(id);
function emptyStats(){return Object.fromEntries(skills.map(s=>[s,0]));}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function show(id){['home','lobby','game','ended'].forEach(x=>$(x).classList.toggle('hidden',x!==id));}
function showError(msg){const e=$('homeError');e.textContent=msg;e.classList.remove('hidden');clearTimeout(showError.t);showError.t=setTimeout(()=>e.classList.add('hidden'),4500);if(state&&state.phase!=='lobby'&&$('consequenceToast'))showConsequence('Something needs attention',msg,'bad');}
function used(){return skills.reduce((a,s)=>a+Number(myStats[s]||0),0);}
function player(){return state?.players.find(p=>p.id===me);}
function emitJoin(mode){const name=$(mode+'Name').value.trim(), cls=$(mode+'Class').value, background=$(mode+'Background').value,portrait=portraitChoice[mode]||1;if(!name)return showError('Enter a hero name first.');if(mode==='join'){const code=$('joinCode').value.trim().toUpperCase();if(code.length!==5)return showError('Enter the five-letter room code.');socket.emit('joinRoom',{roomCode:code,name,cls,background,portrait});}else socket.emit('createRoom',{name,cls,background,portrait});}
function refreshSavedCampaignUI(){
  const panel=$('savedCampaignPanel'),rejoin=$('rejoinPanel');campaignSave=readJson('lostExpeditionCampaign');sessionInfo=readJson('lostExpeditionSession');
  const available=!!(campaignSave?.saveToken&&sessionInfo?.resumeToken);if(panel)panel.classList.toggle('hidden',!available);
  if(available&&$('savedCampaignInfo')){const when=campaignSave.updatedAt?new Date(campaignSave.updatedAt).toLocaleString():'';$('savedCampaignInfo').textContent=`Saved at ${campaignSave.scene||'your adventure'}, round ${campaignSave.round||1}${when?' · '+when:''}.`; }
  const canRejoin=!!(sessionInfo?.roomCode&&sessionInfo?.resumeToken);if(rejoin)rejoin.classList.toggle('hidden',!canRejoin);if(canRejoin&&$('rejoinInfo'))$('rejoinInfo').textContent=`Last room: ${sessionInfo.roomCode}${sessionInfo.returnPin?' · Return PIN '+sessionInfo.returnPin:''}. Use this if you refreshed or briefly lost connection.`;
}
function storeSession(x){sessionInfo={roomCode:x.roomCode,resumeToken:x.resumeToken,playerId:x.playerId,returnPin:x.returnPin||sessionInfo?.returnPin||null};writeJson('lostExpeditionSession',sessionInfo);}

function setHomeTab(mode){
  const map={create:'createPanel',join:'joinPanel',return:'returnPanel'};
  const titles={create:['Create a new adventure','Create the room, build your hero, and invite the rest of the company.'],join:["Join a friend's adventure",'Enter the room code, choose your hero, and join the expedition.'],return:['Return to an existing adventure','Use your room code and Return PIN to rejoin a campaign already in progress.']};
  ['create','join','return'].forEach(k=>{
    const panel=$(map[k]),btn=$(k==='create'?'showCreateTab':k==='join'?'showJoinTab':'showReturnTab');
    if(panel) panel.classList.toggle('hidden',k!==mode);
    if(btn) btn.classList.toggle('active',k===mode);
  });
  if($('homeFlowTitle')) $('homeFlowTitle').textContent=titles[mode][0];
  if($('homeFlowText')) $('homeFlowText').textContent=titles[mode][1];
}
function openHomeFlow(mode='create'){
  $('homeFlow')?.classList.remove('hidden');
  setHomeTab(mode);
  requestAnimationFrame(()=>{$('homeFlow')?.scrollIntoView({behavior:'smooth',block:'start'});});
  const focusMap={create:'createName',join:'joinCode',return:'returnCode'};
  setTimeout(()=>$(focusMap[mode])?.focus(),120);
}
function closeHomeFlow(){ $('homeFlow')?.classList.add('hidden'); }
function copyText(text,button,label='Copied!'){if(!text)return;const done=()=>{if(button){const old=button.textContent;button.textContent=label;setTimeout(()=>button.textContent=old,1600);}};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done).catch(()=>{prompt('Copy this backup key:',text)});else prompt('Copy this backup key:',text);}
function renderPortraitPicker(mode){const cls=$(mode+'Class').value,box=$(mode+'Portraits');if(!box)return;box.innerHTML=portraitImages[cls].map((src,i)=>`<button type="button" class="portrait-choice ${portraitChoice[mode]===i+1?'selected':''}" data-p="${i+1}"><img src="${src}" alt="${cls} portrait ${i+1}"></button>`).join('');box.querySelectorAll('.portrait-choice').forEach(b=>b.onclick=()=>{portraitChoice[mode]=Number(b.dataset.p);renderPortraitPicker(mode);renderClassPreview(mode+'Class',mode+'ClassInfo',mode);});}
function renderClassPreview(selectId,boxId,mode=selectId.startsWith('create')?'create':'join'){const c=$(selectId).value,i=classInfo[c];$(boxId).innerHTML=`<img class="class-portrait" src="${portraitPath(c,portraitChoice[mode])}" alt="${c} portrait"><div><strong>${i.icon} ${c}</strong><br>${i.gift}</div>`;}
['createClass','joinClass'].forEach(id=>{$(id).innerHTML=classes.map(c=>`<option>${c}</option>`).join('');$(id).addEventListener('change',()=>{const mode=id.startsWith('create')?'create':'join';portraitChoice[mode]=1;renderClassPreview(id,id==='createClass'?'createClassInfo':'joinClassInfo',mode);renderPortraitPicker(mode);});});
renderClassPreview('createClass','createClassInfo','create');renderClassPreview('joinClass','joinClassInfo','join');renderPortraitPicker('create');renderPortraitPicker('join');
['createBackground','joinBackground'].forEach(id=>{if(!$(id))return;$(id).innerHTML=Object.entries(backgrounds).map(([k,v])=>`<option value="${k}">${k} — ${v.edge}</option>`).join('');});

document.addEventListener('pointerdown',()=>{
  try{const AC=window.AudioContext||window.webkitAudioContext;if(AC&&!playSound.ctx)playSound.ctx=new AC();if(playSound.ctx?.state==='suspended')playSound.ctx.resume();if(state?.phase==='playing'&&ambientOn)updateAmbience(state.scene,true);}catch{}
},{once:true});

$('createBtn').onclick=()=>emitJoin('create');$('joinBtn').onclick=()=>emitJoin('join');$('joinCode').addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''));
$('copyRoomBtn').onclick=async()=>{try{await navigator.clipboard.writeText(roomCode);$('copyRoomBtn').textContent='Copied!';setTimeout(()=>$('copyRoomBtn').textContent='Copy code',1400);}catch{$('copyRoomBtn').textContent=roomCode;}};
if($('soundToggle'))$('soundToggle').onclick=()=>{audioOn=!audioOn;$('soundToggle').textContent=audioOn?'🔊 SFX on':'🔇 SFX off';if(audioOn)playSound('success');};
if($('ambientToggle')){$('ambientToggle').textContent=ambientOn?'🌿 Ambience on':'🌿 Ambience off';$('ambientToggle').onclick=()=>{ambientOn=!ambientOn;writeJson('lostExpeditionAmbient',ambientOn);$('ambientToggle').textContent=ambientOn?'🌿 Ambience on':'🌿 Ambience off';if(ambientOn&&state?.phase==='playing')updateAmbience(state.scene,true);else stopAmbience();};}
if($('rejoinLastBtn'))$('rejoinLastBtn').onclick=()=>{sessionInfo=readJson('lostExpeditionSession');if(!sessionInfo?.roomCode||!sessionInfo?.resumeToken)return showError('No recent room was found.');socket.emit('resumeRoom',{roomCode:sessionInfo.roomCode,resumeToken:sessionInfo.resumeToken});};
if($('continueSavedBtn'))$('continueSavedBtn').onclick=()=>{campaignSave=readJson('lostExpeditionCampaign');sessionInfo=readJson('lostExpeditionSession');if(!campaignSave?.saveToken||!sessionInfo?.resumeToken)return showError('No saved campaign was found in this browser.');socket.emit('restoreCampaign',{saveToken:campaignSave.saveToken,resumeToken:sessionInfo.resumeToken});};
if($('copySaveHomeBtn'))$('copySaveHomeBtn').onclick=()=>copyText(readJson('lostExpeditionCampaign')?.saveToken,$('copySaveHomeBtn'));
if($('forgetSaveBtn'))$('forgetSaveBtn').onclick=()=>{if(confirm('Forget the saved campaign on this browser? This does not stop a room that is currently running.')){clearKey('lostExpeditionCampaign');clearKey('lostExpeditionSession');campaignSave=null;sessionInfo=null;refreshSavedCampaignUI();}};
if($('restoreBackupBtn'))$('restoreBackupBtn').onclick=()=>{const key=$('backupKeyInput').value.trim();if(!key)return showError('Paste the campaign backup key first.');socket.emit('restoreCampaign',{saveToken:key,asHost:true});};
refreshSavedCampaignUI();

if($('createAdventureCta')) $('createAdventureCta').onclick=()=>openHomeFlow('create');
if($('joinAdventureCta')) $('joinAdventureCta').onclick=()=>openHomeFlow('join');
if($('showCreateTab')) $('showCreateTab').onclick=()=>setHomeTab('create');
if($('showJoinTab')) $('showJoinTab').onclick=()=>setHomeTab('join');
if($('showReturnTab')) $('showReturnTab').onclick=()=>setHomeTab('return');
if($('homeFlowBack')) $('homeFlowBack').onclick=()=>closeHomeFlow();

if($('returnCode'))$('returnCode').addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''));
if($('returnPin'))$('returnPin').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,4));
if($('returnAdventureBtn'))$('returnAdventureBtn').onclick=()=>{const code=$('returnCode').value.trim().toUpperCase(),pin=$('returnPin').value.trim();if(code.length!==5)return showError('Enter the five-letter room code.');if(pin.length!==4)return showError('Enter your four-digit Return PIN.');socket.emit('returnToRoom',{roomCode:code,returnPin:pin});};
function returnToMainMenu(){
  if(voiceJoined)leaveVoice();stopAmbience();
  if(state&&me)socket.emit('leaveRoomView');
  me=null;state=null;roomCode='';lastSceneSeen=null;lastRollSeen='';dismissedRollKey='';pendingStoryBridge=null;previousSnapshot=null;show('home');refreshSavedCampaignUI();
}
document.querySelectorAll('.menuBtn').forEach(b=>b.addEventListener('click',()=>{if(confirm('Return to the main menu? Your hero and campaign progress will be kept.'))returnToMainMenu();}));
socket.on('leftRoomView',()=>{show('home');refreshSavedCampaignUI();});

socket.on('errorMsg',showError);
socket.on('connect',()=>{
  refreshSavedCampaignUI();
  if(!autoResumeTried&&sessionInfo?.roomCode&&sessionInfo?.resumeToken){autoResumeTried=true;socket.emit('resumeRoom',{roomCode:sessionInfo.roomCode,resumeToken:sessionInfo.resumeToken});}
});
socket.on('resumeFailed',()=>{me=null;state=null;show('home');refreshSavedCampaignUI();});
function acceptIdentity(x,resetStats=false){me=x.playerId;roomCode=x.roomCode;storeSession(x);loadPrivateClues(x.roomCode,x.playerId);$('roomCodeBig').textContent=x.roomCode;$('gameRoom').textContent=x.roomCode;if($('returnPinLobby'))$('returnPinLobby').textContent=x.returnPin||sessionInfo?.returnPin||'----';if($('returnPinGame'))$('returnPinGame').textContent=x.returnPin||sessionInfo?.returnPin||'----';if(resetStats)myStats=emptyStats();}
socket.on('joined',x=>{acceptIdentity(x,true);show('lobby');});
socket.on('resumed',x=>{acceptIdentity(x,false);setTimeout(()=>{if(state?.phase==='playing')showConsequence('Welcome back',`You rejoin the company at ${scenes[state.scene]?.title||'the current scene'}. Tap Recap for the last few events.`, 'good');},650);});
socket.on('campaignSave',x=>{campaignSave=x;writeJson('lostExpeditionCampaign',x);refreshSavedCampaignUI();if($('saveStatus'))$('saveStatus').textContent=`✓ Auto-saved · ${new Date(x.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;});
socket.on('secret',x=>{const box=$('secret');box.innerHTML=`<b>🔒 Private ${esc(x.title||'insight')}</b><br>${esc(x.text)}<div class="small muted" style="margin-top:6px">Only your character receives this clue. It has been saved in your Hero sheet.</div>`;box.classList.remove('hidden');const key=`${x.title||'insight'}|${x.text}`;if(!privateClues.some(c=>c.key===key)){privateClues.unshift({key,title:x.title||'Private insight',text:x.text,seenAt:Date.now()});privateClues=privateClues.slice(0,20);savePrivateClues();}clearTimeout(socket._secretTimer);socket._secretTimer=setTimeout(()=>box.classList.add('hidden'),16000);if($('heroSheetModal')&&!$('heroSheetModal').classList.contains('hidden'))renderHeroSheet();});
socket.on('state',s=>{
  const old=state; state=s;roomCode=s.code||roomCode;
  if(!me)return;
  const p=s.players.find(x=>x.id===me);if(p?.ready&&used()===0)myStats={...p.stats};
  if(old) handleAtmosphere(old,s);
  if(s.phase==='lobby')renderLobby();else if(s.phase==='playing')renderGame();else if(s.phase==='ended')renderEnding();renderVoiceUi();syncVoicePeers();if($('heroSheetModal')&&!$('heroSheetModal').classList.contains('hidden'))renderHeroSheet();
});

function renderLobby(){
  show('lobby'); const p=player(); if(!p)return;
  $('youLabel').textContent=`${classInfo[p.cls].icon} ${p.name} — ${p.cls}`;
  $('heroGift').innerHTML=`<b>${classInfo[p.cls].gift.split(' — ')[0]}</b> — ${esc(classInfo[p.cls].gift.split(' — ')[1]||'')}`;
  $('readyBadge').textContent=p.ready?'Ready':'Building';$('readyBadge').classList.toggle('ready',p.ready);
  $('stats').innerHTML='';
  skills.forEach(sk=>{const row=document.createElement('div');row.className='stat '+(classInfo[p.cls].fav.includes(sk)?'favored':'');row.innerHTML=`<span>${classInfo[p.cls].fav.includes(sk)?'<span class="fav-star">★</span> ':''}${sk}</span><button type="button" aria-label="Decrease ${sk}">−</button><strong>${myStats[sk]}</strong><button type="button" aria-label="Increase ${sk}">+</button>`;const bs=row.querySelectorAll('button');bs[0].onclick=()=>{if(!p.ready&&myStats[sk]>0){myStats[sk]--;renderLobby();}};bs[1].onclick=()=>{if(!p.ready&&myStats[sk]<5&&used()<20){myStats[sk]++;renderLobby();}};bs.forEach(b=>b.disabled=p.ready);$('stats').appendChild(row);});
  $('pointsUsed').textContent=used();$('pointsBar').style.width=Math.min(100,used()/20*100)+'%';
  $('recommendedBtn').disabled=p.ready;$('recommendedBtn').onclick=()=>{myStats={...classInfo[p.cls].build};renderLobby();};
  $('readyBtn').disabled=p.ready||used()!==20;$('readyBtn').textContent=p.ready?'✓ Character Locked':'Lock Character';$('readyBtn').onclick=()=>socket.emit('setCharacter',{stats:myStats});
  $('playerCount').textContent=`${state.players.length} / 6`;
  $('lobbyPlayers').innerHTML=state.players.map(x=>playerCard(x,false)).join('');
  const host=state.hostId===me, allReady=state.players.every(x=>x.ready);
  $('startBtn').classList.toggle('hidden',!host);$('startBtn').disabled=!allReady;$('startBtn').onclick=()=>socket.emit('startGame');
  $('lobbyHint').innerHTML=host?(allReady?'<b>Everyone is ready.</b> You can begin the expedition.':'You are the <b>host</b>. Start once every hero shows Ready.'):'Waiting for the host to begin. You can stay on this screen while everyone finishes their hero.';renderVoiceUi();syncVoicePeers();
}
function playerCard(p,inGame){const g=(state?.groups||[]).find(x=>(x.playerIds||[]).includes(p.id));const groupTag=state?.groups?.length>1?` · ${esc(g?.name||'Separated')}`:'';return `<div class="player-card ${p.id===me?'you':''} ${inGame&&state.players[state.activeIndex]?.id===p.id?'active':''}"><div class="player-ident"><img class="mini-portrait" src="${portraitPath(p.cls,p.portrait)}" alt="${p.cls}"><div><b>${esc(p.name)}</b><div class="small muted">${p.cls} · ${p.background||'Outlander'}${p.talent?' · '+p.talent:''}${groupTag}</div></div></div><div class="small ${p.connected?'ready':'muted'}">${p.connected?'● Online':'○ Away'}${p.ready?' · Ready':''}</div></div>`;}

const scenes={
 intro:{title:'The Resolute',mission:'Something has appeared beyond the edge of every reliable chart. Decide what matters before night closes in.',text:['For eighteen days the Resolute has sailed west in search of Aranor, a continent erased from maps eight centuries ago. Most sailors think you are chasing a legend; the expedition’s backers are no longer quite so certain.','Captain Veyra commands the ship: practical, controlled and openly suspicious of anything that cannot be measured. Elias Thorne, the expedition historian, is the opposite — brilliant, restless, and the man who persuaded everyone that Aranor could still be found.','Your company was brought because ordinary sailors and scholars may not be enough once the charts run out.','At sunset the sea becomes perfectly still. Conversation dies across the deck. Every compass aboard swings west at once.','Far ahead, beneath a bank of black cloud, a single golden light appears where no land is supposed to be.'],choices:[['light','Study the strange light','Support · Normal (6)'],['captain','Warn Captain Veyra and prepare the ship','Support · Normal (6)'],['inspect','Inspect the ship before nightfall','Solo · Hard (7)']]},
 storm:{title:'The Sky Breaks',mission:'Keep the Resolute alive through the impossible storm.',text:['At midnight the storm arrives without warning. Lightning turns the sea white and something enormous strikes the hull from beneath.','The mainmast cracks. Sailors tumble across the deck. Captain Veyra shouts three orders at once.','You cannot do everything.'],choices:[['mast','Save the mainmast','Support · Hard (7)'],['boats','Secure the lifeboats','Support · Hard (7)'],['crew','Help the injured crew','Solo · Normal (6)']]},
 wave:{title:'The Wave',mission:'Survive the wall of water racing toward the ship.',text:['A sailor points into the darkness. For one heartbeat nobody understands what they are seeing.','Then the horizon rises.','A wave taller than city walls races toward the Resolute.'],choices:[['face','Face the wave together','Team challenge · need 2 successes']]},
 undercliff_wreck:{title:'Beneath the Cliffs',mission:'Escape the flooded wreck before the tide returns.',text:['The wave throws the Resolute into a black wall of rock. You wake waist-deep in freezing water inside the shattered lower deck.','Daylight is visible through a split in the hull, but two companions are pinned behind drifting timber.','The tide is already rising again.'],choices:[['climb','Free everyone and climb out together','Team · Normal (6)'],['caves','Follow the cold air into the sea caves','No roll · uncertain route']]},
 sea_caves:{title:'The Blue Caves',mission:'Find daylight through tunnels beneath the island.',text:['Blue mineral light glows beneath the water. Ancient steps descend where no steps should exist.','For a moment the party hears a deep metallic pulse through the stone — the same rhythm as the golden beacon.','One tunnel smells of salt and daylight. Another bears carved arrows pointing inland.'],choices:[['light','Follow the carved route and investigate','Support · Normal (6) · possible discovery'],['rush','Follow the surf toward daylight','No roll · quickest exit']]},
 wreck:{title:'A Shore Beneath Unknown Stars',mission:'Regroup, recover what you can, and find a road inland.',text:['Dawn reveals a crescent beach, wreckage scattered for half a mile, and jungle climbing toward silver-clouded mountains.','Several survivors are missing. Something huge bellows deep inland.','Footprints lie beside your campfire. They are not human.'],choices:[['search','Search the wreck for survivors and equipment','Support · Normal (6)'],['tracks','Follow the mysterious tracks','Solo · Hard (7)'],['cliffs','Climb the cliffs and scout inland','Support · Hard (7) · dangerous']]},
 wreck_fire:{title:'Fire in the Wreckage',mission:'Choose what to save before the fire reaches the powder stores.',text:['A dropped lantern catches spilled oil beneath the broken cargo deck. Fire runs across the wet timber impossibly fast.','Shouts come from beneath a collapsed beam while crates of food and medical gear begin to burn.','There is no time for a tidy plan.'],choices:[['rescue','Split up and contain the disaster','Team · Normal (6)']]},
 lost_marsh:{title:'The Drowned Path',mission:'Recover the trail before the marsh swallows it.',text:['The tracks lead away from the beach and vanish into reeds taller than a man.','Within minutes the shore is gone behind mist. Water fills every footprint before you can study it.','Then faint blue lights begin moving between the trees.'],choices:[['high','Find high ground and recover your bearings','Support · Normal (6)'],['lights','Follow the blue lights','No roll · strange route']]},
 marsh_lights:{title:'Voices in the Reeds',mission:'Keep your mind while the marsh tries to separate the party.',text:['The lights become figures at the edge of vision. Each hero hears a familiar voice calling from a different direction.','The voices know names they should not know.','Ahead, the old road appears for only a few seconds at a time.'],choices:[['resist','Ignore the voices and reach the road','Solo · Hard (7) · dangerous']]},
 road:{title:'The Broken Road',mission:'Follow the first evidence of civilisation inland.',text:['An ancient paved road lies beneath the roots. Moss-covered statues depict kings, warriors and long-eared folk of an older age.','A horn sounds far inland. Three notes. A pause. Then three more.','For the first time, the party knows Aranor was not empty when it disappeared.'],choices:[['direct','Follow the road toward the horn','No roll'],['forest','Move through the forest beside the road','Support · Hard (7)'],['statues','Study the statues and inscriptions','Solo · Hard (7)']]},
 wolf_ring:{title:'The Silent Ring',mission:'Pass the shadow-wolves without turning the forest into a battlefield.',text:['Eyes appear one by one among the ferns. Black wolves form a loose circle around the company without making a sound.','None attack. They are waiting for something.','Behind you, branches crack beneath a much heavier creature.'],choices:[['stand','Break the ring without bloodshed','Support · Hard (7)']]},
 troll:{title:'The Bridge of Roots',mission:'Cross the ravine without abandoning the trapped child.',text:['A cave troll hauls itself from beneath a root bridge. An old spearhead is buried in its side.','It roars — but does not immediately attack.','Behind it, a small goblin child is trapped beneath fallen timber.'],choices:[['calm','Calm the wounded troll','Support · Hard (7) · may earn an ally'],['rescue','Distract it while others free the child','Team · Hard (7)'],['drive','Drive the troll away without killing it','Support · Very hard (8) · dangerous']]},
 troll_chase:{title:'The Ravine Run',mission:'Escape a frightened troll without losing anyone.',text:['The troll’s fear turns to fury. The bridge shakes as it charges.','The old road ends at a second root span no wider than a cart wheel.','If the party crosses, someone must remain long enough to sever the roots behind them.'],choices:[['bridge','Cross and cut the root bridge','Team · Normal (6) · dangerous']]},
 ravine_fall:{title:'Below the Old Road',mission:'Climb back to the road before darkness reaches the ravine.',text:['Stone gives way beneath the party and sends several heroes sliding into the ravine.','No one is killed, but packs scatter down the slope and the old road is now thirty feet above.','Something small watches from a crack in the cliff.'],choices:[['climb','Climb out together','Support · Hard (7)']]},
 green_gate:{title:'The Green Gate',mission:'Enter the first city and find the missing expedition members.',text:['The road ends at two immense doors almost swallowed by vines. A thin seam of gold runs through the stone.','Fresh expedition boot prints cross the moss.','Beyond the wall, something metallic turns once — then stops.'],choices:[['gate','Wake the ancient gate mechanism','Support · Hard (7)'],['scout','Find a hidden way around the wall','Solo · Hard (7)'],['road','Follow the survivors’ trail beneath the roots','No roll · alternate route']]},
 root_tunnels:{title:'Under the Green Wall',mission:'Cross the living tunnels beneath the ruined city.',text:['The trail disappears into a tunnel formed by roots thicker than ship masts.','Old masonry appears between them, as if the forest swallowed an entire lower city.','The tunnel tightens until packs must be passed hand to hand.'],choices:[['crawl','Cross the root tunnels together','Team · Normal (6)'],['light','Follow the faint green light','No roll']]},
 fungal_hall:{title:'The Spore Hall',mission:'Get through the buried hall without losing anyone to the spores.',text:['A buried avenue opens beneath the roots. Pale mushrooms cover the walls like stars.','The first breath of spores makes distance feel wrong and voices sound far away.','Somebody must lead before the party forgets which direction is forward.'],choices:[['spores','Cross the hall together','Support · Hard (7) · dangerous']]},
 survivor_camp:{title:'The Abandoned Camp',mission:'Choose what matters most before the ruins close in.',text:['A shattered expedition camp lies beneath leaning towers. Voices call from a collapsed cellar.','Sealed supply packs hang over a flooded courtyard.','Fresh footprints lead deeper into the city. There is time for one priority.'],choices:[['survivors','Free the trapped survivors','Support · Normal (6)'],['packs','Recover the sealed packs','Solo · Hard (7)'],['trail','Follow the fresh trail immediately','No roll']]},
 cellar_route:{title:'The Second Exit',mission:'Free the trapped expedition members through another route.',text:['The main cellar stair collapses under the first attempt.','A survivor shouts that there is another chamber behind the eastern wall.','The wall is old but thick, and the street above is beginning to sink.'],choices:[['dig','Break through the cellar wall','Team · Normal (6)']]},
 flooded_court:{title:'The Flooded Court',mission:'Recover what the water did not take.',text:['The supply line snaps and the sealed packs fall into black water.','One heavy case catches beneath a submerged arch.','The current is strengthening as another section of aqueduct breaks upstream.'],choices:[['dive','Dive for the case','Solo · Hard (7) · dangerous']]},
 whisper_ruins:{title:'The Whispering Ruins',mission:'Reach the inner city before the streets shift again.',text:['Streets that looked straight from above now bend into impossible angles. Doors appear where walls stood minutes ago.','Two expedition scouts are trapped beyond a buckling arch.','A half-collapsed map chamber glows pale blue. You cannot secure everything.'],choices:[['rescue','Save the trapped scouts','Team · Normal (6)'],['map','Risk the collapsing map chamber','Solo · Hard (7) · dangerous'],['lantern','Use the Moon Lantern to reveal the safe path','Item option · requires Moon Lantern','item','moon_lantern']]},
 buried_gallery:{title:'The Buried Gallery',mission:'Find another way through after the ruins close the obvious route.',text:['The arch collapses and seals the street. Dust fills the air.','Behind a cracked statue, a lower gallery appears — old enough that the shifting city seems not to control it.','A silver glint shows beneath a fallen slab.'],choices:[['lift','Open the buried gallery','Support · Hard (7) · possible relic']]},
 six_mural:{title:'The Mural of Six',mission:'Understand why the ruins seem to expect your party.',text:['In the central hall stands a mural untouched by moss: six figures circle a mountain — guardian, hunter, shadow, seer, healer and maker.','The resemblance to your roles is impossible to ignore.','At the centre is a six-pointed symbol identical to one seen elsewhere on the expedition.'],choices:[['study','Interpret the Mural of Six','Support · Hard (7)'],['touch','Touch the six-pointed seal','Solo · Hard (7) · dangerous'],['leave','Leave the mural untouched','No roll']]},
 echo_chamber:{title:'The Answering Stone',mission:'Escape the voices awakened beneath the mural.',text:['The mural cracks and a voice speaks each hero’s name from inside the stone.','It asks one question repeatedly: “Who will carry the cost?”','The chamber doors begin closing.'],choices:[['answer','Answer the voices and keep the door open','Support · Hard (7)']]},
 quiet_fire:{title:'Fire Under Broken Stars',mission:'Take one quiet night before entering the living kingdoms of Aranor.',text:['For the first time since the wreck, the company finds a defensible place to rest.','No monsters. No collapsing stone. Just firelight, tired faces and the distant beacon.','The road tomorrow crosses into inhabited territory.'],choices:[['talk','Talk honestly around the fire','Meaningful choice · Hope +1'],['study','Study the recovered relics','Solo · Normal (6)'],['rest','Rest and move at first light','No roll']]},
 goblin_border:{title:'Painted Shields',mission:'Cross a living border without starting a war.',text:['Small figures in lacquered masks appear among the ferns, bows already drawn.','Their shields carry a spiral mark you may have seen before.','A voice calls in broken Common Tongue: “Turn back, sea-people.”'],choices:[['token','Show the Goblin Bone Token','Item option','item','goblin_token'],['speak','Convince the sentries you mean no harm','Support · Hard (7)'],['bypass','Slip around the border unseen','Solo · Hard (7)']]},
 goblin_capture:{title:'Guests in a Cage',mission:'Turn capture into an opportunity — or escape.',text:['The goblins disarm the company but do not harm anyone.','You are locked inside a timber cage overlooking a village built through the tree canopy.','An elderly goblin watches from outside as if waiting to hear what you will say.'],choices:[['truth','Win over the elder from inside the cage','Support · Normal (6)'],['escape','Pick the lock after dark','Solo · Hard (7)']]},
 escape_cage:{title:'The River Culvert',mission:'Reach Serayne’s territory before the goblin hunters catch up.',text:['The cage opens into a storage platform above a fast underground stream.','A narrow culvert disappears beneath the roots toward the old city.','Behind you, alarm horns begin to sound.'],choices:[['river','Escape through the river culvert','No roll · raises Threat']]},
 hunter_trap:{title:'The Hunter’s Snare',mission:'Free the trapped hero before the patrol reaches you.',text:['A concealed wire snaps tight and jerks one hero off the ground.','Voices approach through the trees.','The trap is clever, not cruel — but it has done its job.'],choices:[['free','Free the trapped hero quietly','Support · Normal (6)']]},
 council:{title:'The Council of the Broken Kingdom',mission:'Decide what the expedition promises to Aranor’s people.',text:['Lady Serayne receives you in a roofless hall where trees grow between old thrones. She has not slept since the beacon woke.','“My grandfather taught me the sea beyond Aranor was a story told to frighten children,” she says. “Then your ship fell out of it.”','She tells you Aranor did not vanish. Its people chose to hide after a war over the Heart. She does not ask you to save her kingdom — only to decide what kind of outsiders you intend to be.'],choices:[['village','Promise to help Serayne protect her people','Earn Serayne’s trust'],['expedition','Put the expedition survivors first','Gain supplies'],['truth','Press Serayne for the truth of the old war','Support · Hard (7)']]},
 archive_night:{title:'The Forbidden Archive',mission:'Learn what Serayne’s ancestors chose to hide.',text:['Serayne allows the company one hour inside a sealed archive beneath the council hall.','The official histories end before the final war. A second account has been scratched into the backs of the stone tablets.','The writing names the Heart of Aranor for the first time.'],choices:[['read','Decode the forbidden account','Support · Hard (7)']]},
 medicine_choice:{title:'The Bitter Medicine',mission:'Choose between two genuine needs.',text:['A fever spreads through Serayne’s settlement. The expedition’s wounded are also worsening.','Only one case of moonleaf medicine remains.','There is no obvious right answer.'],choices:[['give','Leave the medicine with the settlement','Earn village allies'],['trade','Trade expedition equipment for a share','Lose supplies · gain Healing Draught'],['search','Search the marsh for another source','Support · Hard (7)']]},
 marsh_night:{title:'Moonleaf After Dark',mission:'Bring back medicine after the easy search fails.',text:['The moonleaf grows exactly where Serayne warned it would: beyond the safe paths.','Night comes before the party can return. Heavy shapes move in the reeds.','The company needs shelter, medicine and a route home at the same time.'],choices:[['shelter','Survive the marsh night and gather moonleaf','Team · Normal (6) · dangerous']]},
 broken_keep:{title:'The Armoury of Three',mission:'Choose one treasure before the keep collapses.',text:['Beneath a ruined keep you discover an intact Aranorian armoury. Three objects glow on stone pedestals.','The ceiling begins to split. You have time to take only one.','Every choice could matter later.'],choices:[['shield','Take the Sunsteel Shield','Item · cancels one dangerous setback'],['orb','Take the Glassfire Orb','Item · breaks one magical barrier'],['lens','Take the Architect’s Lens','Item · reveals an ancient mechanism']]},
 ash_sails:{title:'Black Sails',mission:'Prepare for outsiders who have found Aranor too.',text:['From the watchtower you see black sails on the western horizon.','The Order of Ash has reached Aranor.','Their ships are not damaged. They came here deliberately.'],choices:[['prepare','Prepare the settlement for their arrival','Support · Hard (7)'],['watch','Observe the fleet unnoticed','Solo · Hard (7)'],['wait','Wait for the Order to make its move','No roll']]},
 ash_coast:{title:'The Order of Ash',mission:'Learn why Commander Vael came to Aranor.',text:['Black-armoured soldiers establish a disciplined camp around the remains of the Resolute.','Their commander sends a white flag inland.','You can spy on them, cross their lines, or simply answer the invitation.'],choices:[['infiltrate','Infiltrate the beach camp','Support · Hard (7)'],['smoke','Use the Smoke Vial to cross unseen','Item option','item','smoke_vial'],['parley','Request parley openly','No roll']]},
 ash_prison:{title:'The Holding Pen',mission:'Escape before the Order moves you onto a ship.',text:['The infiltration fails cleanly enough that no one is killed — but the party wakes behind an iron fence under guard.','Other prisoners include two missing sailors from the Resolute.','A patrol change at dawn offers one chance.'],choices:[['escape','Break everyone out before dawn','Team · Normal (6) · dangerous']]},
 ash_archive:{title:'Orders in Black Wax',mission:'Decide whether to risk learning the Order’s plan.',text:['Inside a command tent, sealed field orders lie beneath a brass cipher disc.','Boots pass outside every few seconds.','The company can attempt the cipher or leave before the patrol returns.'],choices:[['cipher','Decode the sealed orders','Solo · Hard (7)'],['leave','Leave before the patrol returns','No roll']]},
 vael_parley:{title:'Commander Vael',mission:'Decide whether the enemy commander is lying — or simply dangerous.',text:['Commander Vael removes his sword before entering the ruined hall and pushes it across the floor toward you.','“I buried a son in a winter famine,” he says. “Do not tell me power is safer unused while children freeze beyond this island.” He believes the Heart could light cities, irrigate fields and end wars before they begin.','Then he makes the threat beneath the hope explicit: if Aranor refuses to share that power, the Order will take control of it. For the first time, the enemy has a face — and an argument.'],choices:[['listen','Hear Vael’s plan to the end','No roll'],['challenge','Challenge his account without starting a fight','Support · Hard (7)'],['shard','Study the beacon shard he carries','Solo · Hard (7)']]},
 order_duel:{title:'Ash Trial',mission:'Survive Vael’s attempt to test the company’s resolve.',text:['Vael refuses the accusation but offers an old Order custom: one champion, blunt steel, first yield.','He says he wants to know whether your convictions survive contact with consequence.','The ring closes around a single hero.'],choices:[['stand','Stand your ground in the trial','Solo · Very hard (8) · dangerous']]},
 traitor_reveal:{title:'The Silver Key',mission:'Discover who drew the Resolute into the storm.',text:['The evidence points back toward the expedition itself.','Elias Thorne has shared your fires, translated inscriptions and twice risked his life for expedition survivors. Now every clue bends toward him. When confronted, his hands begin to shake before his voice does.','“I did not mean to wreck us,” he says. “I only needed the beacon to answer.” His travelling case bears a tiny six-pointed lock. Whatever is inside may decide whether that confession is cowardice, obsession — or something worse.'],choices:[['key','Use the Silver Key','Item option','item','silver_key'],['confront','Confront Thorne with the evidence','Support · Hard (7)'],['search','Search his quarters before he returns','Solo · Hard (7)']]},
 thorne_flees:{title:'The Signal Ridge',mission:'Catch Thorne before he contacts the Order.',text:['Thorne sees the accusation forming and runs.','He is not heading for the beach. He is climbing toward an old signal ridge with a beacon mirror under his arm.','If he reaches it, Vael will know exactly where the mountain gate lies.'],choices:[['chase','Cut him off before the ridge','Support · Hard (7)']]},
 thorne_choice:{title:'The Man Who Found Aranor',mission:'Decide what to do with the person who caused the wreck.',text:['Thorne finally admits it. He activated an Aranorian device aboard the Resolute because he believed the world would never find Aranor otherwise.','He did not intend the deaths or the wreck. He did accept the risk.','He also knows more about the mountain than anyone else alive.'],choices:[['forgive','Keep Thorne with the expedition under guard','He may help later'],['banish','Send Thorne away','Gain Hope, lose his knowledge'],['question','Make him explain the storm device first','Support · Normal (6)']]},
 escape_coast:{title:'The Inland Escape',mission:'Reach the mountain before the Order closes every road.',text:['The coast erupts into movement. Order patrols push inland while Serayne’s scouts signal from the hills.','The mountain gate is only a day away if the company can break contact now.','An old lifeboat, a signal ridge and a dangerous inland road each offer possibilities.'],choices:[['boat','Use the lifeboat saved during the storm','Earlier-choice option','flag','boats'],['horn','Recover Captain Veyra’s Signal Horn','Gain a powerful later item'],['run','Break through the patrols','Team · Hard (7) · dangerous']]},
 ash_canyon:{title:'The Broken Span',mission:'Cross the canyon before the Order catches the company.',text:['The inland road ends at a bridge split down the centre.','Order horns answer behind you.','Old repair chains still hang beneath the stone.'],choices:[['bridge','Repair the bridge under pressure','Support · Hard (7)']]},
 mountain_gate:{title:'The Mountain Gate',mission:'Enter the sealed road beneath Aranor’s central mountain.',text:['The gate is not a door so much as a machine the size of a fortress.','Three empty channels run across its face. Beneath them, a manual counterweight is still accessible.','The air beyond the seal is warm.'],choices:[['maps','Align three Ancient Map Fragments','Item route · requires 3 fragments','count','map_fragment',3],['bypass','Bypass the ancient mechanism','Support · Very hard (8)'],['orb','Use the Glassfire Orb','Item route','item','glassfire_orb']]},
 undergate_chasm:{title:'The Road Under the Gate',mission:'Find the route the ancient engineers used when the gate failed.',text:['The bypass snaps and a section of floor drops into darkness.','Beneath the gate is an older maintenance road crossing a chasm on hanging stone platforms.','The route is still possible — just not easy.'],choices:[['cross','Cross the maintenance platforms','Team · Hard (7) · dangerous']]},
 vault_puzzle:{title:'The Vault of Six',mission:'Wake a mechanism designed for several different kinds of hero.',text:['Six stations circle an ancient machine, each shaped for a different task.','The central mechanism resets every few minutes.','This place was never meant to be operated by one specialist.'],choices:[['lens','Use the Architect’s Lens','Item route','item','architects_lens'],['six','Activate the stations together','Team · Normal (6)'],['force','Force the central mechanism','Support · Very hard (8) · dangerous']]},
 mirror_vault:{title:'The Mirror Vault',mission:'Escape a defence built to confuse intruders rather than kill them.',text:['The mechanism throws the party into a circular room whose walls reflect scenes that are not happening.','Every reflection shows a different door opening.','Only details noticed by different heroes reveal which room is real.'],choices:[['reflections','Compare what each hero sees','Team · Normal (6)']]},
 heart_chamber:{title:'The Heart of Aranor',mission:'Discover what the ancient kingdom hid beneath the mountain.',text:['The chamber is larger than a cathedral. At its centre floats a lattice of living golden light.','It is not a monster. It is power — vast, responsive and dangerously easy to command.','The beacons across Aranor are not simply hiding it. They are regulating it.'],choices:[['shield','Use the Sunsteel Shield to approach safely','Item route','item','sunsteel_shield'],['study','Understand what the Heart truly is','Support · Hard (7)'],['take','Take a controlled beacon shard','Solo · Very hard (8) · dangerous']]},
 heart_vision:{title:'Inside the Heart',mission:'Bring one of your own back from a vision that feels completely real.',text:['The failed contact does not throw the hero backward. It pulls their awareness inward.','They see Aranor before the fall — full of light, ships and towers — and a future in which every city in the world demands the Heart.','Outside the vision, their body has stopped responding.'],choices:[['anchor','Call them back to the present','Support · Hard (7)']]},
 heart_truth:{title:'The Heart Sigil',mission:'Decide whether to carry part of the Heart’s authority to the final beacon.',text:['The old controls confirm what the mural promised: the Last Beacon can change how the entire network works.','A small living-metal seal can carry the Heart’s authority through the collapsing mountain.','Making it will expose the party to the Heart one last time.'],choices:[['sigil','Bind a Heart Sigil','Support · Hard (7)'],['leave','Leave the Heart untouched','No roll']]},
 collapse:{title:'The Falling Mountain',mission:'Get everyone out alive.',text:['The moment the Heart fully wakes, the old vault begins failing around it.','Stone bridges tilt. Doors close out of sequence. Dust turns the air black.','The company must either run now or spend precious time stabilising the gate for those behind them.'],choices:[['escape','Escape the collapsing vault','Team · Hard (7) · dangerous'],['seal','Stabilise the gate before fleeing','Support · Very hard (8) · dangerous']]},
 buried_exit:{title:'No Way Back',mission:'Dig through the eastern exit before the air runs out.',text:['The route behind collapses completely.','A narrow eastern shaft is blocked by loose stone rather than solid rock.','The party has minutes, not hours.'],choices:[['dig','Dig and brace the exit together','Team · Normal (6)']]},
 final_road:{title:'The Last Road',mission:'Reach the Last Beacon before the Order does.',text:['The mountain opens onto a high road overlooking the ruined white city.','Behind you, smoke rises from the vault. Ahead, Order banners move through the valley.','Old choices are about to return.'],choices:[['horn','Sound Captain Veyra’s Signal Horn','Item route','item','signal_horn'],['march','March directly for the beacon','No roll'],['secret','Find the forgotten approach','Support · Hard (7)']]},
 night_assault:{title:'Night on the Last Road',mission:'Survive long enough for dawn — or for help to arrive.',text:['The hidden approach leads straight into an Order scouting column.','There is no room for a clean retreat.','The company must hold a ruined waystation through the night.'],choices:[['hold','Hold the waystation together','Team · Hard (7) · dangerous']]},
 allies_arrive:{title:'Those Who Remember',mission:'See which earlier choices have become real relationships.',text:['Footsteps answer from the forest and ruined roads. Who arrives depends on what the company did earlier.','Some faces are expected. Others are not.','For once, the party can see the weight of its earlier choices.'],choices:[['rally','Rally everyone for the final approach','Support · Normal (6)'],['rush','Do not wait — reach the city now','No roll']]},
 siege_gate:{title:'The Siege of the White City',mission:'Break through before the Last Beacon is captured.',text:['Order soldiers and Aranorian defenders collide beneath the white city gate.','Above them, the beacon pulses faster with every minute.','The party can feel the Heart answering from beneath the mountain.'],choices:[['open','Break the siege at the city gate','Team · Hard (7) · dangerous'],['secret','Use the Heart Sigil on the forgotten gate','Item route','item','heart_sigil']]},
 lower_city:{title:'The Burning Lower City',mission:'Reach the beacon tower after the gate route fails.',text:['The main gate becomes a wall of fighting. The only remaining route is across tiled roofs above the lower city.','Fire jumps between buildings as people flee below.','The beacon tower is visible three streets away.'],choices:[['roofs','Cross the rooftops and guide survivors out','Support · Hard (7) · dangerous']]},
 beacon_tower:{title:'The Beacon Tower',mission:'Reach the Heart controls before the tower tears itself apart.',text:['The tower hums with enough power to lift dust from the floor.','Vael stands on the final stair with his sword lowered, not raised. He says there is still time to put the Heart under one command.','Behind him, the stair begins collapsing.'],choices:[['vael','Try once more to bring Vael over','Support · Very hard (8)'],['climb','Force the way to the control chamber','Team · Hard (7) · dangerous']]},
 final_stand:{title:'The Last Stand',mission:'Hold the chamber long enough for the ancient controls to awaken.',text:['The control rings begin turning, but they need time. Below, the White City is burning in three places at once.','Order soldiers reach the stair. Stone splits beneath the tower. Somewhere below, Veyra’s horn answers a goblin war-call; Serayne’s people hold a street you crossed hours ago. Every friendship the company made is now being tested.','There is no single heroic job. The chamber survives only if different heroes trust one another with different responsibilities.'],choices:[['protect','Hold the chamber together','Team · Hard (7) · dangerous']]},
 finale_crisis:{title:'Three Fires at Once',mission:'Choose where the company itself will stand while the allies you earned handle the rest.',text:['The city shudders as the Heart wakes. Three cries reach the chamber almost together.','At the western gate, Captain Veyra is being overrun. Below the tower, families are trapped beneath a collapsing arcade. At the controls, the Heart is slipping beyond safe limits.','You can personally guarantee only one. The others will depend on the people you helped — or failed to help — on the road here.'],choices:[['gate','Hold the western gate with Veyra','Protect the city and buy time'],['people','Rescue the trapped families','Save lives before the tower falls'],['heart','Stay at the controls','Prevent the Heart from surging']]},
 last_beacon:{title:'The Last Beacon',mission:'Choose what Aranor becomes after tonight.',text:['The controls finally open. The Heart’s power flows through stable configurations — but the party only understands the choices it has earned.','Seal the island again, open the beacon roads to the outside world, or — if enough of Aranor trusted you — divide stewardship so no single ruler can command the Heart.','No choice is perfect. Every choice leaves a different world behind.'],choices:[['seal','Restore the ancient seal','Aranor remains hidden'],['open','Open Aranor to the world','Requires full understanding of the Heart','flag','heart_understood'],['steward','Entrust the Heart to Aranor’s peoples','Requires trust across rival peoples','flag','stewardship_unlocked']]},
 final_cost:{title:'Hold the Heart',mission:'Make the final choice survive the collapse of the old system.',text:['Choosing is not enough. The moment the controls move, the Heart surges through every beacon on the island.','The tower shakes. The golden lattice begins to tear.','The company must hold the system together long enough for the new configuration to become permanent.'],choices:[['commit','Finish what the company started','Final Team Challenge · Hard (7)']]},
 dawn:{title:'Dawn Over Aranor',mission:'Step outside and see what your choices have made.',text:['For several seconds after the final surge there is only silence.','Then dawn reaches the white city. Bells begin ringing somewhere below.','The road home still exists — but nobody in the company is the person who stepped aboard the Resolute.'],choices:[['finish','See the fate of Aranor and your heroes','Complete the campaign']]}
};

// --- SETBACK DETOURS: failures change the route before the story reconverges ---
Object.assign(scenes,{
  smoke_shore:{title:'Smoke Over the Shore',mission:'Regroup after the wreck fire and salvage what remains.',text:['The fire is out, but only because half the camp was dragged into the wet sand. Smoke hangs over the shoreline and several packs are ruined.','The inland road is still there, but the company cannot simply walk away as though nothing happened.'],choices:[['wounded','Help the exhausted survivors onto their feet','No roll · preserve Hope'],['salvage','Search the smoking wreckage one last time','Sense Check · Awareness or Craft']]},
  marsh_recovery:{title:'After the Voices',mission:'Find the road again after the marsh scatters the company.',text:['The voices fade only when the company reaches firmer ground. For several minutes nobody is certain everyone came out in the same place.','Boots are soaked, nerves are frayed, and the old road has to be found again before dark.'],choices:[['bearings','Recover your bearings from the slope and water flow','Sense Check · Survival or Awareness'],['move','Keep everyone together and push for the road','No roll']]},
  wolf_pursuit:{title:'The Running Hunt',mission:'Lose the shadow wolves before they drive you off the ridge.',text:['The wolves do not break when challenged. They fan out instead, forcing the company into a fast retreat through roots and low branches.','Ahead, the ground drops toward the ravine and the sound of rushing water grows louder.'],choices:[['turn','Choose a defensible point and turn on the pack','Team · Strength / Agility / Spirit'],['ravine','Use the ravine noise to cover your escape','Support · Survival or Stealth']]},
  spore_sick:{title:'Breathing Room',mission:'Get everyone steady after the fungal hall.',text:['The company reaches a dry gallery, but several heroes are coughing hard and seeing colours that are not there.','The survivors can be heard somewhere beyond the wall. Reaching them now means moving while the spores are still in your blood.'],choices:[['rest','Stop long enough to clear your heads','No roll · lose time but recover composure'],['press','Press on carefully toward the voices','Support · Endurance or Spirit']]},
  hunters_camp:{title:'Under Watch',mission:'Get free of the hunters without making Serayne’s people your enemies.',text:['The trap cannot be opened before the hunters arrive. Instead of a rescue, the company is escorted uphill at spearpoint.','Their camp overlooks Serayne’s valley. Nobody is attacking yet, but every answer is being judged.'],choices:[['parley','Explain why you crossed their hunting ground','Support · Influence or Spirit'],['observe','Watch the camp for signs of who commands them','Sense Check · Awareness or Knowledge']]},
  canyon_floor:{title:'Below the Broken Span',mission:'Find a way back to the mountain road.',text:['The repair fails with a crack like thunder. The company escapes the falling stone, but ends up below the road on the canyon floor.','Order horns sound above. The Mountain Gate is still ahead, but now the route runs through shadow and loose scree.'],choices:[['climb','Climb back toward the old road','Team · Agility / Endurance / Strength'],['floor','Follow the canyon floor until it rises again','No roll · longer but quieter']]},
  hanging_platform:{title:'The Lower Maintenance Shelf',mission:'Recover from the fall and find another way into the vault.',text:['One of the hanging platforms tears free. The party survives by catching an older maintenance shelf far below the intended crossing.','A narrow service door stands open in the rock, its mechanism still faintly warm.'],choices:[['service','Follow the service passage toward the vault','Support · Knowledge or Craft'],['climb','Climb back to the main crossing','Team · Agility / Strength / Endurance']]},
  mirror_detour:{title:'The False Gallery',mission:'Escape the route the Mirror Vault wanted you to choose.',text:['The wrong reflection opens and the company follows it before the illusion collapses. The door behind vanishes.','The false gallery is lined with broken mirrors and old warning marks. Somewhere beyond the wall, the Heart is pulsing like a distant drum.'],choices:[['marks','Read the warning marks before moving','Sense Check · Knowledge or Awareness'],['sound','Follow the pulse of the Heart through the false gallery','Support · Spirit or Awareness']]},
  burning_courtyard:{title:'The Courtyard Below',mission:'Get out of the burning lower city and regain the tower route.',text:['The rooftop route gives way beneath the company. Everyone reaches the ground alive, but the fall leaves you inside a courtyard filling with smoke.','The Beacon Tower is visible above the roofs. The direct stair is blocked by fire and frightened civilians are pressing toward a side gate.'],choices:[['gate','Open the side gate and move with the civilians','Team · Strength / Craft / Influence'],['stairs','Find another stair through the smoke','Support · Awareness or Agility']]}
});

// --- REMAKE EXPANSION: slower travel, genuine route arcs, exploration and multi-stage battles ---
const worldMapConfig={
  title:'Aranor — Explored Territory',
  baseSvg:`<path class="map-coast" d="M3,63 C8,54 7,43 13,34 C18,25 27,18 39,15 C54,11 66,13 78,8 C87,5 95,10 97,20 L97,69 L3,69 Z"/><path class="map-water" d="M14,59 C24,53 30,47 36,38 C45,28 54,32 61,26 C68,20 72,14 80,10"/><path class="map-road" d="M14,59 C25,49 35,45 45,39 C55,35 65,39 75,28 C82,22 88,19 93,17"/>`,
  terrain:[
    {type:'symbol',x:20,y:34,symbol:'♣'},{type:'symbol',x:27,y:30,symbol:'♣'},{type:'symbol',x:34,y:28,symbol:'♣'},{type:'symbol',x:43,y:31,symbol:'♣'},
    {type:'symbol',x:61,y:19,symbol:'▲'},{type:'symbol',x:66,y:16,symbol:'▲'},{type:'symbol',x:72,y:13,symbol:'▲'},{type:'symbol',x:78,y:12,symbol:'▲'},
    {type:'path',kind:'river',d:'M16,58 C24,51 25,45 31,41 C36,37 40,39 45,35'},
    {type:'path',kind:'road',d:'M24,51 C30,42 39,39 48,38 C58,37 62,31 69,27'}
  ],
  nodes:[
    {id:'wreck',title:'Wreck Coast',x:12,y:61,reveal:12,scenes:['intro','deck_pause','storm','wave','undercliff_wreck','sea_caves','wreck','wreck_fire','smoke_shore','shore_rest']},
    {id:'broken_road',title:'Broken Road',x:23,y:50,reveal:11,scenes:['lost_marsh','marsh_lights','marsh_recovery','road','wolf_ring','wolf_pursuit']},
    {id:'east_river',title:'River Valley',x:31,y:57,reveal:10,scenes:['east_river','east_reeds','old_ferry','cedar_hollow','east_camp','stone_ford']},
    {id:'west_ridge',title:'High Forest',x:30,y:39,reveal:10,scenes:['west_ridge','ruined_watch','high_forest','rain_shelf','wolf_sign','west_descent']},
    {id:'root_bridge',title:'Root Bridge',x:40,y:47,reveal:9,scenes:['troll','troll_chase','ravine_fall']},
    {id:'green_ruins',title:'Green Ruins',x:48,y:39,reveal:11,scenes:['green_gate','root_tunnels','fungal_hall','spore_sick','survivor_camp','cellar_route','flooded_court','whisper_ruins','buried_gallery','six_mural','echo_chamber','quiet_fire']},
    {id:'south_marsh',title:'Moon Marsh',x:51,y:53,reveal:9,scenes:['marsh_route','reed_islands','moon_pool','marsh_shelter','marsh_exit']},
    {id:'north_ridge',title:'Old Ridge',x:57,y:32,reveal:9,scenes:['ridge_route','stone_steps','eagle_ledge','ridge_shrine','ridge_descent']},
    {id:'broken_kingdom',title:'Broken Kingdom',x:63,y:42,reveal:11,scenes:['goblin_border','goblin_capture','escape_cage','hunter_trap','hunters_camp','council','archive_night','medicine_choice','marsh_night','broken_keep','ash_sails']},
    {id:'coast_route',title:'Sea Cliffs',x:69,y:53,reveal:9,scenes:['cliff_route','salt_steps','storm_shelf','sea_cave_watch','cliff_camp','black_beach']},
    {id:'quarry_route',title:'Old Quarry',x:70,y:36,reveal:9,scenes:['quarry_route','cut_stone','abandoned_crane','dust_camp','hidden_cartway','quarry_exit']},
    {id:'ash_coast',title:'Ash Coast',x:77,y:46,reveal:10,scenes:['ash_coast','ash_prison','ash_archive','vael_parley','order_duel','traitor_reveal','thorne_flees','thorne_choice','escape_coast']},
    {id:'high_pass',title:'High Pass',x:79,y:28,reveal:9,scenes:['high_pass','goat_track','ice_bridge','pass_camp','watch_peak','high_descent']},
    {id:'rootway',title:'Deep Rootway',x:73,y:28,reveal:9,scenes:['deep_rootway','root_chamber','underground_river','crystal_fissure','old_lift','rootway_exit']},
    {id:'canyon',title:'Ash Canyon',x:80,y:36,reveal:8,scenes:['ash_canyon','canyon_floor']},
    {id:'mountain',title:'Mountain Gate',x:84,y:23,reveal:11,scenes:['mountain_gate','undergate_chasm','hanging_platform','vault_puzzle','mirror_vault','mirror_detour','heart_chamber','heart_vision','heart_truth','collapse','buried_exit']},
    {id:'white_city',title:'White City',x:92,y:18,reveal:12,scenes:['final_road','night_assault','allies_arrive','siege_gate','siege_wave1','siege_choice','wall_push','wall_archers','wall_breach','lower_rescue','burning_lane','civic_hall','burning_courtyard','beacon_tower','final_stand','finale_crisis','last_beacon','final_cost','dawn']}
  ]
};
Object.assign(scenes,{
  waiting_reunion:{title:'At the Rendezvous',mission:'Wait for the separated company to reach the meeting point.',text:['Your group has reached the agreed rendezvous. The road behind is quiet.','Somewhere beyond sight, the other group is still making its way through its own dangers.'],choices:[]},

  east_river:{title:'The River Road',mission:'Follow the river inland without losing the old road.',text:['The eastern road descends into a broad river valley where the jungle closes over the sky.','The old paving stones appear and vanish beneath mud and roots. Travel here will take hours, not minutes.'],choices:[['read','Read the riverbank before moving on','Observation · Awareness or Survival'],['move','Follow the water upstream','Continue along the eastern route']]},
  east_reeds:{title:'Reeds Above the Water',mission:'Cross a flooded stretch without soaking the expedition pack.',text:['The river spills across the old road until the path becomes a chain of muddy islands.','Long reeds hide the far bank. Something large moved through them recently, but nothing follows.'],choices:[['cross','Pick a careful line through the flooded road','Support · Survival or Agility'],['wade','Wade straight through and keep moving','No roll · lose time and comfort']]},
  old_ferry:{title:'The Old Ferry',mission:'Decide whether the abandoned ferry station is worth exploring.',text:['A stone landing emerges from the trees. A ferry chain still disappears into the brown water, though the boat is gone.','A small keeper’s hut leans against the bank. The main road continues upstream.'],choices:[['search','Look through the ferry keeper’s hut','Observation · Awareness or Knowledge'],['continue','Leave the ferry behind','Continue']]},
  cedar_hollow:{title:'Cedar Hollow',mission:'Find a dry route through the trees before evening.',text:['Beyond the ferry the ground rises into enormous cedar trees whose roots form walls higher than a person.','The road splits repeatedly around them. The wrong turn could cost half a day.'],choices:[['markers','Look for old route markers','Observation · Awareness or Knowledge'],['navigate','Choose the best route through the hollow','Solo · Survival or Awareness']]},
  east_camp:{title:'Camp Beside the River',mission:'Make use of the last hour of daylight.',text:['By sunset the company has covered only a few miles. The river is quieter here and the ground finally dry enough for a fire.','There is time to rest, repair equipment, or inspect the strange marks found along the road.'],choices:[['repair','Repair packs and damaged gear','Observation · Craft or Knowledge'],['rest','Rest and keep the fire small','Recover before dawn']]},
  stone_ford:{title:'The Stone Ford',mission:'Cross the river and regain the ancient road.',text:['At dawn the road reaches a ford built from enormous flat stones. Half are submerged and the current is stronger than it looks.','Across the water, an ancient horn sounds once from deep in the forest.'],choices:[['cross','Cross the ford together','Team · Agility / Endurance / Strength'],['shortcut','Use the old ferry marker shortcut','Hidden route','flag','east_shortcut']]},

  west_ridge:{title:'The Western Ridge',mission:'Climb above the jungle and keep the ancient road in sight.',text:['The western branch rises immediately. Within an hour the sea is visible behind you through gaps in the trees.','The climb is slower than the mapless forest below, but from here you may be able to see what waits ahead.'],choices:[['survey','Survey the land from the ridge','Observation · Awareness or Survival'],['climb','Keep climbing before the light fades','Continue']]},
  ruined_watch:{title:'A Ruined Watchtower',mission:'Decide whether to spend time inside the old tower.',text:['A square tower stands beside the ridge path, roofless and wrapped in vines. The lower doorway is blocked by fallen stone.','Someone built a small fire here within the last week.'],choices:[['enter','Find a way into the tower','Support · Strength or Craft'],['tracks','Inspect the recent campsite','Observation · Awareness or Survival'],['pass','Keep to the ridge','Continue']]},
  high_forest:{title:'The High Forest',mission:'Travel beneath the canopy without losing the ridge.',text:['The forest changes above the valley. Trees grow farther apart, but fog drifts through them in long white bands.','Distances become difficult to judge. Every sound seems closer than it is.'],choices:[['sense','Stop and listen before choosing a direction','Observation · Awareness or Spirit'],['trail','Follow the ridge by the slope beneath your feet','Solo · Survival or Awareness']]},
  rain_shelf:{title:'Rain on the Stone Shelf',mission:'Shelter from a mountain storm without losing the afternoon.',text:['Rain reaches the ridge in a single grey wall. The path becomes slick and exposed.','A shallow rock shelf offers shelter, but waiting there means travelling after dark.'],choices:[['shelter','Wait beneath the shelf and inspect the stonework','Observation · Knowledge or Awareness'],['push','Push through the rain','Support · Endurance or Agility']]},
  wolf_sign:{title:'Signs in the Mud',mission:'Work out what has been following the company.',text:['Fresh prints cross the ridge trail: broad paws, several animals, moving in the same direction as the party.','They are close enough that the Ranger can smell wet fur when the wind changes.'],choices:[['study','Study the tracks without pursuing','Observation · Survival or Awareness'],['move','Keep the company together and descend','Continue']]},
  west_descent:{title:'The Long Descent',mission:'Reach the old road before night closes in.',text:['The ridge finally bends toward the interior. Far below, the paved road reappears beside a bridge made from living roots.','Getting there requires a steep descent through loose stone and hanging vines.'],choices:[['descend','Descend carefully as a group','Team · Agility / Endurance / Survival'],['trail','Use the animal trail you noticed earlier','Hidden route','flag','west_shortcut']]},

  marsh_route:{title:'The Moon Marsh Road',mission:'Cross the low country toward Serayne’s lands.',text:['South of the ruins, the road dissolves into open marsh. Pale flowers float on black water and insects hum in the reeds.','The route is slower, but the old stones suggest travellers once used it regularly.'],choices:[['sense','Look for the remains of the old causeway','Observation · Awareness or Knowledge'],['go','Follow the driest ground','Continue']]},
  reed_islands:{title:'The Reed Islands',mission:'Choose a line between dozens of small islands.',text:['The marsh becomes a maze of reed-covered hummocks separated by channels too deep to wade casually.','Birds rise in waves when the party approaches. Somewhere ahead, smoke curls above the reeds.'],choices:[['smoke','Approach the distant smoke carefully','Solo · Stealth or Awareness'],['route','Keep to the old causeway stones','Support · Survival or Awareness']]},
  moon_pool:{title:'The Moon Pool',mission:'Decide whether the strange pool is worth the delay.',text:['Near midday you find a perfectly circular pool surrounded by white flowers. The water is clear enough to see carved steps descending below the surface.','The road bends around it. Nothing forces you to stop.'],choices:[['inspect','Inspect the submerged steps','Observation · Knowledge or Spirit'],['leave','Leave the pool untouched','Continue']]},
  marsh_shelter:{title:'Shelter of Woven Reeds',mission:'Spend the evening safely in the marsh.',text:['An abandoned shelter stands on stilts above the water. Its roof is mostly intact and a clay jar still hangs from one beam.','The company can sleep dry for the first time since the ruins.'],choices:[['search','Search the shelter before settling in','Observation · Awareness or Craft'],['sleep','Post watches and rest','Continue at dawn']]},
  marsh_exit:{title:'The North Causeway',mission:'Reach solid ground before the weather turns.',text:['By morning the causeway rises from the water and the broken towers of Serayne’s country appear beyond the reeds.','A line of painted shields watches from the tree line ahead.'],choices:[['finish','Leave the marsh and approach the border','Continue']]},

  ridge_route:{title:'The Old King’s Ridge',mission:'Follow the high road toward the Broken Kingdom.',text:['North of the ruins, an older road climbs through open woodland toward a line of standing stones.','It is longer than the marsh route but gives clear views across the island.'],choices:[['look','Study the horizon before moving on','Observation · Awareness or Survival'],['go','Follow the ridge road','Continue']]},
  stone_steps:{title:'Seven Hundred Steps',mission:'Climb an ancient stair cut directly into the hillside.',text:['The road becomes a staircase, hundreds of shallow steps climbing through wind-bent trees.','Carved numbers appear every fifty steps, though several sections have fallen away.'],choices:[['climb','Climb steadily and conserve strength','Support · Endurance or Survival'],['marks','Study the numbered stones','Observation · Knowledge or Awareness']]},
  eagle_ledge:{title:'The Eagle Ledge',mission:'Cross a narrow ledge beneath nesting cliffs.',text:['The stair emerges onto a ledge no wider than a cart. Huge dark birds circle above the cliffs.','The drop to the valley floor is breathtaking and dangerous.'],choices:[['cross','Cross one at a time with a safety line','Team · Agility / Craft / Endurance'],['wait','Wait for the birds to settle','Observation · Survival or Awareness']]},
  ridge_shrine:{title:'Shrine Without a Roof',mission:'Decide whether to enter a roadside shrine.',text:['Near sunset you find four columns surrounding a weathered stone table. Offerings of feathers and polished bone are recent.','A side path descends toward the valley; the main ridge road continues east.'],choices:[['read','Examine the offerings and inscriptions','Observation · Knowledge or Spirit'],['camp','Camp beside the shrine','Continue after a quiet night']]},
  ridge_descent:{title:'Road into the Broken Kingdom',mission:'Descend from the ridge toward the painted shields below.',text:['The next morning the ridge road descends through old orchards and abandoned farm terraces.','Ahead, armed sentries wait beside the boundary stones.'],choices:[['finish','Approach the sentries openly','Continue']]},

  cliff_route:{title:'The Sea-Cliff Road',mission:'Move toward the Order landing while staying above the coast.',text:['From Serayne’s country, a narrow military road follows the cliffs east. Black sails are visible below, still several hours away.','The route offers excellent views and very little cover.'],choices:[['watch','Watch the fleet from above','Observation · Awareness or Knowledge'],['move','Keep to the cliff road','Continue']]},
  salt_steps:{title:'Salt Steps',mission:'Descend a stair carved into the cliff face.',text:['The road drops down a staircase white with salt. Spray reaches the steps even this high above the sea.','Old iron rings in the wall suggest soldiers once hauled cargo here.'],choices:[['rings','Inspect the cargo rings and worn grooves','Observation · Craft or Awareness'],['descend','Descend carefully','Support · Agility or Endurance']]},
  storm_shelf:{title:'The Storm Shelf',mission:'Cross an exposed section before the wind strengthens.',text:['A shelf of black stone runs beneath the cliff for nearly a mile. Waves explode against the rocks below.','The Order camp is now close enough to see individual tents.'],choices:[['cross','Cross while the wind is manageable','Team · Agility / Endurance / Survival'],['hide','Wait in a rock cleft and observe the camp','Observation · Awareness or Stealth']]},
  sea_cave_watch:{title:'Sea Cave Lookout',mission:'Use an old cave to learn how the Order patrols the beach.',text:['A shallow sea cave opens above the high-water mark. From its mouth, the entire landing beach is visible.','Patrols move in regular patterns. One route is oddly unguarded.'],choices:[['study','Study the patrol pattern','Observation · Awareness or Knowledge'],['leave','Move before the tide rises','Continue']]},
  cliff_camp:{title:'Camp Above Black Beach',mission:'Rest before approaching the Order.',text:['The company camps without a fire in a hollow above the beach. The black ships creak below in the darkness.','For several hours there is nothing to do but listen, repair gear, and wait.'],choices:[['prepare','Prepare equipment for infiltration','Observation · Craft or Stealth'],['rest','Rest until the moon sets','Continue']]},
  black_beach:{title:'The Black Beach',mission:'Reach the edge of the Order encampment unseen.',text:['Near dawn the cliff path descends onto black sand littered with driftwood. The first Order sentries are less than two hundred paces away.','Whatever comes next begins here.'],choices:[['finish','Move into position near the camp','Continue']]},

  quarry_route:{title:'The Old Quarry Road',mission:'Use the abandoned inland road to approach the Order from behind.',text:['An old cart road cuts east through low hills toward a vast abandoned quarry. The black sails disappear behind the ridgeline.','The road is quiet, but fresh wheel tracks cross it.'],choices:[['tracks','Study the fresh wheel tracks','Observation · Awareness or Survival'],['move','Follow the quarry road','Continue']]},
  cut_stone:{title:'Fields of Cut Stone',mission:'Cross the abandoned quarry without being seen from the ridge.',text:['Blocks the size of houses lie half-cut from the earth. Narrow lanes between them create a maze of stone.','Voices carry from somewhere ahead.'],choices:[['listen','Listen before entering the stone maze','Observation · Awareness or Stealth'],['cross','Move through the quarry lanes','Support · Stealth or Awareness']]},
  abandoned_crane:{title:'The Hanging Crane',mission:'Get past a collapsed crane blocking the cartway.',text:['A timber crane has fallen across the only broad path. Its counterweight still hangs from an ancient chain.','A narrow crawlspace runs beneath the wreckage.'],choices:[['repair','Raise the beam using the old counterweight','Support · Craft or Strength'],['crawl','Crawl beneath the crane','Solo · Agility or Endurance']]},
  dust_camp:{title:'A Camp in the Dust',mission:'Work out who used this abandoned quarry last night.',text:['Behind a cut-stone wall you find cold ashes, boot prints and three empty ration tins unlike anything from the Resolute.','Whoever camped here left in a hurry.'],choices:[['search','Search the campsite carefully','Observation · Awareness or Knowledge'],['leave','Keep moving toward the coast','Continue']]},
  hidden_cartway:{title:'The Hidden Cartway',mission:'Choose whether to trust a tunnel revealed by the quarry map.',text:['A carved channel behind the quarry wall slopes east beneath the ridge. Rusted rails disappear into darkness.','It may emerge near the Order camp — or somewhere worse.'],choices:[['tunnel','Take the hidden cartway','Support · Knowledge or Craft'],['road','Stay on the surface road','Continue']]},
  quarry_exit:{title:'Above the Ash Camp',mission:'Reach the coast without alerting the Order.',text:['The quarry road ends on a wooded bluff directly behind the landing camp. From here the black banners are almost level with you.','The party has arrived from a direction the Order does not appear to be watching.'],choices:[['finish','Move down toward the camp','Continue']]},

  high_pass:{title:'The High Pass',mission:'Take the mountain road while the Order searches the valleys.',text:['The high road climbs sharply into cold air. The path is obvious, but every mile costs effort.','Clouds gather around the peaks and the coast vanishes behind you.'],choices:[['read','Read the weather before committing','Observation · Survival or Awareness'],['go','Climb into the pass','Continue']]},
  goat_track:{title:'The Goat Track',mission:'Cross a narrow path above a ravine.',text:['The ancient road has collapsed. A goat track continues along the cliff, barely wide enough for one person at a time.','Loose stones fall for seconds before striking anything below.'],choices:[['cross','Cross with ropes and patience','Team · Agility / Craft / Endurance'],['seek','Look for signs of an older path','Observation · Awareness or Knowledge']]},
  ice_bridge:{title:'The Ice Bridge',mission:'Cross a frozen spillway beneath the peak.',text:['Meltwater has frozen across the road in a glassy sheet. Beneath it, black water still moves.','The shortest line is also the most exposed.'],choices:[['cross','Cross one at a time','Support · Agility or Endurance'],['anchor','Build an anchor line first','Support · Craft or Strength']]},
  pass_camp:{title:'Camp Above the Clouds',mission:'Survive a cold night in the pass.',text:['Night arrives early between the peaks. The company finds a shallow cave facing west.','Below, distant Order fires mark the valleys you avoided.'],choices:[['search','Inspect the cave before sleeping','Observation · Awareness or Knowledge'],['rest','Share warmth and rest','Continue']]},
  watch_peak:{title:'Watch Peak',mission:'Use the summit to understand the mountain approaches.',text:['At dawn a short climb reaches a peak overlooking the central mountain. Roads, ravines and ruined towers finally make sense from above.','One narrow descent appears to avoid the main gate patrols.'],choices:[['map','Commit the hidden descent to memory','Observation · Awareness or Survival'],['descend','Begin the descent','Continue']]},
  high_descent:{title:'The Hidden Descent',mission:'Reach the Mountain Gate from above.',text:['The path drops through scree and dwarf pines toward the monumental gate. The air grows warmer as you descend.','Another route seems to emerge from beneath the earth near the same destination.'],choices:[['arrive','Reach the Mountain Gate','Rejoin the company']]},

  deep_rootway:{title:'The Deep Rootway',mission:'Take an old maintenance road beneath the forest.',text:['A fracture in the hillside reveals carved stairs descending beneath enormous roots. Warm air rises from below.','Thorne claims the passage predates the visible roads by centuries.'],choices:[['sense','Listen to the stone before descending','Observation · Knowledge or Spirit'],['go','Descend into the Rootway','Continue']]},
  root_chamber:{title:'Chamber of Roots',mission:'Find the continuation of the buried road.',text:['Tree roots have broken through the ceiling and woven around old pillars. Three tunnels leave the chamber.','Only one carries a faint warm draft.'],choices:[['read','Read scratches and old maintenance marks','Observation · Awareness or Knowledge'],['draft','Follow the warm air','Solo · Survival or Awareness']]},
  underground_river:{title:'The Underground River',mission:'Cross a river flowing beneath the mountain.',text:['The tunnel ends at black water moving fast between stone banks. An ancient chain bridge lies collapsed along one side.','A maintenance platform remains fixed to the wall.'],choices:[['bridge','Rebuild enough of the chain crossing','Team · Craft / Strength / Agility'],['ledge','Use the maintenance ledge','Support · Agility or Endurance']]},
  crystal_fissure:{title:'The Crystal Fissure',mission:'Pass a crack filled with faint golden light.',text:['The stone splits open around a vein of translucent crystal. The same pulse as the Heart travels through it.','Touching the crystal is unnecessary — but it may reveal something useful.'],choices:[['sense','Study the pulse without touching it','Observation · Knowledge or Spirit'],['pass','Keep moving','Continue']]},
  old_lift:{title:'The Old Lift',mission:'Bring an ancient platform back to life.',text:['A vertical shaft descends beside the road. The lower tunnel continues only after a twenty-foot drop.','A rustless wheel and counterweight suggest the lift can still work.'],choices:[['repair','Repair the lift mechanism','Support · Craft or Knowledge'],['climb','Climb down the shaft','Team · Agility / Endurance / Strength']]},
  rootway_exit:{title:'Under the Mountain Gate',mission:'Emerge at the ancient gate complex.',text:['The buried road rises toward daylight through a narrow service arch. Beyond it stands the vast Mountain Gate.','Footprints from the high pass approach from above.'],choices:[['arrive','Reach the Mountain Gate','Rejoin the company']]},

  siege_wave1:{title:'The First Wave',mission:'Hold the approach while the city gate is opened.',text:['Order troops surge through the ruined avenue in disciplined ranks. Arrows strike the white stone around the company.','The battle cannot be settled in one exchange. The first task is simply to stop the line from collapsing.'],choices:[['hold','Hold the first wave together','Team · Strength / Awareness / Spirit']]},
  siege_choice:{title:'Two Fires',mission:'Choose how to break the siege.',text:['The first assault stalls, but two crises open at once. Order archers seize the western wall while civilians are trapped in the lower ward.','The company can stay together — or split and tackle both problems simultaneously.'],choices:[['wall','Take everyone to the western wall','Long route · suppress the archers'],['people','Take everyone into the lower ward','Long route · rescue the trapped civilians'],['split','Split the company between both crises','Two simultaneous mini-journeys']]},
  wall_push:{title:'Steps to the Wall',mission:'Reach the battlements under arrow fire.',text:['The stair to the western wall is exposed for nearly sixty paces. Broken shields and fallen masonry offer only fragments of cover.','The archers above are already turning toward you.'],choices:[['advance','Advance from cover to cover','Team · Agility / Endurance / Awareness']]},
  wall_archers:{title:'The Archer Line',mission:'Disrupt the Order archers before the next assault begins.',text:['At the battlements, half a dozen archers fire down into the city while two soldiers guard their flank.','The company has only moments before reinforcements reach the stairs.'],choices:[['fight','Break the archer line','Team · Strength / Agility / Spirit'],['sense','Spot the weakest point in their formation','Observation · Awareness or Knowledge']]},
  wall_breach:{title:'The Broken Parapet',mission:'Secure the wall and signal the defenders below.',text:['The last archers fall back through a breach in the parapet. From here the company can see the entire battle below.','A signal brazier stands cold beside the wall.'],choices:[['signal','Light the brazier and hold the wall','Support · Craft or Influence']]},
  lower_rescue:{title:'Into the Lower Ward',mission:'Reach the trapped families before the fire closes the street.',text:['Smoke fills the narrow lanes below the gate. People pound on a barred civic hall while fire spreads across the roofs.','Order soldiers are not the immediate danger. The street itself is becoming impassable.'],choices:[['enter','Push into the smoke together','Team · Endurance / Awareness / Spirit']]},
  burning_lane:{title:'The Burning Lane',mission:'Open a way through collapsing buildings.',text:['A burning cart blocks the only broad lane to the civic hall. Roof tiles crash into the street.','A narrow alley offers another route, but its upper floors are already leaning inward.'],choices:[['clear','Clear the burning cart','Support · Strength or Craft'],['alley','Use the narrow alley','Support · Agility or Awareness']]},
  civic_hall:{title:'The Civic Hall',mission:'Get the trapped civilians out before the roof fails.',text:['The hall doors are barred from the inside by fallen beams. Dozens of voices answer from beyond them.','Above, roof timbers crack under the heat.'],choices:[['rescue','Open the hall and organise the evacuation','Team · Craft / Strength / Influence']]}
});

// Slow down the main plot with real travel choices.
scenes.road={title:'The Broken Road',mission:'Choose how to travel deeper into Aranor.',text:['The ancient road divides where a river cuts through the jungle.','The eastern branch follows the river valley. The western branch climbs onto a forested ridge. Both eventually bend toward the horn sounding inland, but neither is a short walk.'],choices:[['east','Take the eastern river road','A lower, wetter route with old crossings and abandoned stations'],['west','Take the western ridge road','A higher route through fog, ruins and exposed ground']]};
scenes.quiet_fire={title:'The Morning After the Mural',mission:'Choose the next road into the Broken Kingdom.',text:['At first light the company leaves the Green Ruins. Two surviving roads run toward Serayne’s lands.','The southern causeway crosses open marsh. The northern road climbs the old King’s Ridge. Both will take most of a day.'],choices:[['marsh','Take the Moon Marsh causeway','Low ground, water and abandoned shelters'],['ridge','Take the Old King’s Ridge','High road, exposed ledges and old shrines']]};
scenes.ash_sails={title:'Black Sails',mission:'Choose how to approach the Order of Ash landing.',text:['Black sails fill the eastern horizon. The Order has not yet fully secured the coast.','A sea-cliff road approaches from above. An abandoned quarry road circles inland behind the landing. Either route will take hours and reveal different things.'],choices:[['cliffs','Take the sea-cliff road','Watch the fleet and approach above the beach'],['quarry','Take the old quarry road','Circle inland through abandoned workings']]};
scenes.escape_coast={title:'Roads to the Mountain',mission:'Reach the central mountain while the Order closes the valleys.',text:['Two difficult routes remain open. The High Pass is exposed but direct. The Deep Rootway disappears beneath the forest and may emerge under the gate.','The company may stay together, or divide and attempt both routes before reuniting at the Mountain Gate.'],choices:[['high','Take the High Pass together','Cold, exposed mountain travel'],['deep','Take the Deep Rootway together','Ancient underground maintenance roads'],['canyon','Risk the canyon shortcut','Much faster, but exposed to Order patrols'],['split','Split the company','Send one group high and one below']]};
scenes.siege_gate={title:'The Siege of the White City',mission:'Survive the opening phase of the siege.',text:['The White City gate is not a single fight. Order troops press through the ruined avenue while defenders struggle to close the inner doors.','Arrows fall from the western wall and smoke rises from the lower ward. The battle will turn through several moments, not one roll.'],choices:[['begin','Meet the first wave','Begin the battle']]};

function requirementSatisfied(choice){
  const type=choice[3],value=choice[4],n=choice[5];if(!type)return true;
  if(type==='item')return state.items?.includes(value);
  if(type==='flag')return !!state.flags?.[value];
  if(type==='count')return (state.items||[]).filter(x=>x===value).length>=(n||1);
  if(type==='notFlag')return !state.flags?.[value];
  return true;
}
function renderInventory(){
  const box=$('inventory');if(!box)return;const items=state.items||[];const counts={};items.forEach(id=>counts[id]=(counts[id]||0)+1);
  if(!items.length){box.innerHTML='<div class="small muted">No special items yet. Things found early may matter much later.</div>';return;}
  box.innerHTML=Object.entries(counts).map(([id,count])=>{const it=state.itemCatalog?.[id]||{name:id,icon:'🎒',desc:''};return `<div class="inventory-item"><span class="inventory-icon">${it.icon}</span><div><b>${esc(it.name)}${count>1?' ×'+count:''}</b><div class="small muted">${esc(it.desc)}</div></div></div>`;}).join('');
  if(items.includes('healing_draught')&&state.players[state.activeIndex]?.id===me){box.innerHTML+=`<button id="useHeal" class="btn btn-ghost btn-small full" style="margin-top:8px">Use Healing Draught</button>`;setTimeout(()=>{if($('useHeal'))$('useHeal').onclick=()=>{const wounded=state.players.filter(p=>p.wounds>0);if(!wounded.length)return showConsequence('No wound to heal','Save the draught for later.','good');const name=prompt('Who should drink it? '+wounded.map(x=>x.name).join(', '),wounded[0].name);const t=wounded.find(x=>x.name.toLowerCase()===String(name||'').toLowerCase())||wounded[0];socket.emit('useHealingDraught',{playerId:t.id});};},0);}
}

function sceneJourneyNode(scene){
  const map={
    intro:'wreck',storm:'wreck',wave:'wreck',undercliff_wreck:'wreck',sea_caves:'wreck',wreck:'wreck',wreck_fire:'wreck',lost_marsh:'wreck',marsh_lights:'wreck',road:'wreck',
    green_gate:'green_ruins',survivor_camp:'green_ruins',whisper_ruins:'green_ruins',six_mural:'green_ruins',night_camp:'green_ruins',
    goblin_border:'broken_kingdom',council:'broken_kingdom',medicine_choice:'broken_kingdom',broken_keep:'broken_kingdom',ash_sails:'broken_kingdom',
    ash_coast:'order_ash',vael_parley:'order_ash',order_duel:'order_ash',traitor_reveal:'order_ash',thorne_flees:'order_ash',thorne_choice:'order_ash',escape_coast:'order_ash',ash_canyon:'order_ash',
    mountain_gate:'mountain',undergate_chasm:'mountain',vault_puzzle:'mountain',mirror_vault:'mountain',heart_chamber:'mountain',heart_vision:'mountain',heart_truth:'mountain',collapse:'mountain',buried_exit:'mountain',
    final_road:'last_beacon',night_assault:'last_beacon',allies_arrive:'last_beacon',siege_gate:'last_beacon',lower_city:'last_beacon',finale_crisis:'last_beacon',last_beacon:'last_beacon',dawn:'last_beacon'
  };
  return map[scene]||'wreck';
}
function journeyNodes(){
  const cur=sceneJourneyNode(state.scene);
  const nodes=[
    {id:'wreck',title:'The Wreck',icon:'⚓',x:12,y:72},
    {id:'green_ruins',title:'Green Ruins',icon:'🏛️',x:28,y:47},
    {id:'broken_kingdom',title:'Broken Kingdom',icon:'👑',x:47,y:38},
    {id:'order_ash',title:'Ash Coast',icon:'⚫',x:63,y:56},
    {id:'mountain',title:'Mountain Gate',icon:'⛰️',x:76,y:24},
    {id:'last_beacon',title:'White City',icon:'✨',x:90,y:18}
  ];
  const currentIndex=Math.max(0,nodes.findIndex(n=>n.id===cur));
  return nodes.map((n,i)=>({...n,discovered:i<=currentIndex,current:i===currentIndex}));
}
function journeySummary(nodeId){
  const flags=state.flags||{}, items=state.items||[], allies=state.allies||{};
  if(nodeId==='wreck'){
    const bits=[];
    bits.push(flags.boats?'Lifeboats secured.':'The wreck split the expedition apart.');
    if(flags.mast)bits.push('The mast was saved in the storm.');
    if(flags.crew)bits.push('Crew survivors were protected.');
    return bits.slice(0,2).join(' ');
  }
  if(nodeId==='green_ruins'){
    if(flags.mural_found) return 'The mural of six hinted that your company has been expected.';
    if(items.includes('moon_lantern')) return 'Strange ruins yielded the Moon Lantern and other old secrets.';
    return 'The first ruins proved Aranor remembers more than the world above.';
  }
  if(nodeId==='broken_kingdom'){
    if(allies.goblin_clan&&allies.serayne) return 'You won the trust of both goblin and Aranorian allies.';
    if(allies.goblin_clan) return 'Goblin alliances changed the road ahead.';
    if(allies.serayne) return 'Lady Serayne’s court began to trust the expedition.';
    return 'Every alliance here had a cost.';
  }
  if(nodeId==='order_ash'){
    if(flags.thorne_truth||allies.thorne) return 'The truth about Thorne and the storm came into the light.';
    if(flags.order_warning) return 'The Order of Ash reached the island in force.';
    return 'Vael and the Order brought the outside world to Aranor’s shore.';
  }
  if(nodeId==='mountain'){
    if(items.includes('heart_sigil')||flags.heart_understood) return 'Within the mountain, the Heart of Aranor began to reveal itself.';
    return 'Ancient machines beneath the mountain tested every kind of hero.';
  }
  if(nodeId==='last_beacon'){
    if(state.phase==='ended') return 'Your choices decided the fate of Aranor.';
    return 'The final road is open, but the end of the journey is still unwritten.';
  }
  return '';
}
function mapNodeForScene(scene){
  const cfg=worldMapConfig||{};const direct=cfg.sceneToNode?.[scene];if(direct)return cfg.nodes.find(n=>n.id===direct)||null;
  return cfg.nodes?.find(n=>(n.scenes||[]).includes(scene))||null;
}
function routeCoords(trail=[]){const out=[];for(const s of trail){const n=mapNodeForScene(s);if(n&&(!out.length||out[out.length-1].id!==n.id))out.push(n);}return out;}
function renderJourney(){
  const box=$('journey');if(!box||!state)return;const cfg=worldMapConfig||{};const nodes=cfg.nodes||[];
  const visitedScenes=new Set(state.mapVisited||[]);for(const g of state.groups||[])for(const s of g.trail||[])visitedScenes.add(s);for(const h of state.routeHistory||[])for(const s of h.trail||[])visitedScenes.add(s);
  const visitedNodes=nodes.filter(n=>(n.scenes||[]).some(s=>visitedScenes.has(s))||[...(state.groups||[])].some(g=>routeCoords(g.trail).some(x=>x.id===n.id)));
  const holes=visitedNodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="${n.reveal||14}" fill="black"/>`).join('');
  const history=(state.routeHistory||[]).map((g,i)=>{const pts=routeCoords(g.trail);return pts.length>1?`<polyline class="map-route map-route--history" points="${pts.map(n=>`${n.x},${n.y}`).join(' ')}"/>`:'';}).join('');
  const current=(state.groups||[]).map((g,i)=>{const pts=routeCoords(g.trail);if(!pts.length)return '';const line=pts.length>1?`<polyline class="map-route map-route--${i%2?'b':'a'}" points="${pts.map(n=>`${n.x},${n.y}`).join(' ')}"/>`:'';const last=pts[pts.length-1];return `${line}<circle class="map-current map-current--${i%2?'b':'a'}" cx="${last.x}" cy="${last.y}" r="2.4"/><text class="map-group-label" x="${Math.min(94,last.x+3)}" y="${Math.max(7,last.y-3)}">${esc(g.name||'Company')}</text>`;}).join('');
  const labels=visitedNodes.map(n=>`<g class="map-place"><circle cx="${n.x}" cy="${n.y}" r="1.7"/><text x="${Math.min(92,n.x+2.5)}" y="${Math.max(6,n.y-2)}">${esc(n.title)}</text></g>`).join('');
  const terrain=(cfg.terrain||[]).map(x=>x.type==='path'?`<path class="map-terrain map-terrain--${x.kind||'ridge'}" d="${x.d}"/>`:`<text class="map-symbol" x="${x.x}" y="${x.y}">${x.symbol||'▲'}</text>`).join('');
  box.innerHTML=`<div class="world-map"><div class="world-map__title">${esc(cfg.title||'Journey So Far')}</div><svg viewBox="0 0 100 72" role="img" aria-label="Explored map"><defs><mask id="fogMask"><rect width="100" height="72" fill="white"/>${holes}</mask><filter id="fogBlur"><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect class="map-paper" width="100" height="72" rx="2"/>${cfg.baseSvg||''}${terrain}${history}${current}${labels}<rect class="map-fog" x="0" y="0" width="100" height="72" mask="url(#fogMask)" filter="url(#fogBlur)"/><rect class="map-edge" x=".7" y=".7" width="98.6" height="70.6" rx="2"/></svg><div class="world-map__legend">Explored ground is uncovered. The rest remains hidden in fog.${(state.groups||[]).length>1?' Your separated groups leave different trails.':''}</div></div>`;
}
function npcForScene(scene){
  if(['intro','storm','wave','wreck','wreck_fire','survivor_camp'].includes(scene))return 'Veyra';
  if(['troll','green_gate','goblin_border','goblin_capture','escape_cage'].includes(scene))return 'Nim';
  if(['council','archive_night','medicine_choice','broken_keep','ash_sails'].includes(scene))return 'Serayne';
  if(['ash_coast','vael_parley','order_duel','beacon_tower','final_stand'].includes(scene))return 'Vael';
  if(['traitor_reveal','thorne_flees','thorne_choice','mountain_gate','heart_chamber','heart_truth'].includes(scene))return 'Thorne';
  return null;
}
function npcMomentText(key,scene){
  const lines={
    Veyra: scene==='storm'?'“We face the storm together, or we do not face it at all.”':'“Stay close. We are an expedition before we are heroes.”',
    Nim:'“You keep finding the interesting places. I’m beginning to think that is dangerous.”',
    Serayne:'“Aranor is not a mystery to be solved. It is a people who must survive what comes next.”',
    Thorne: scene==='traitor_reveal'?'“I did not mean to wreck us. I only needed the beacon to answer.”':'“History does not stay buried simply because we wish it would.”',
    Vael:'“Power does not become harmless because good people are afraid to use it.”'
  };return lines[key]||'';
}
function renderNpcMoment(scene){const box=$('npcMoment'),key=npcForScene(scene);if(!box)return;if(!key){box.classList.add('hidden');box.innerHTML='';return;}const n=npcInfo[key],rel=state?.journal?.people?.[String(key).toLowerCase()]||null;const memory=rel?.status?`<div class="npc-memory"><b>They remember you:</b> ${esc(rel.status)}${rel.note?' — '+esc(rel.note):''}</div>`:'';box.innerHTML=`<img src="${n.img}" alt="${esc(n.name)}"><div><div class="eyebrow">${esc(n.tag)}</div><h3>${esc(n.name)}</h3><p>${esc(npcMomentText(key,scene))}</p>${memory}</div>`;box.classList.remove('hidden');}
function finaleCallbackCards(){const a=state.allies||{},f=state.flags||{},items=state.items||[],cards=[];
  if(a.nim||a.goblin_clan)cards.push(['🦴','Because you helped Nim','Goblin scouts know the old passages and answer your call.']);
  if(f.boats)cards.push(['🛶','Because you saved the lifeboats','Veyra’s surviving crew can reach the eastern shore.']);
  if(a.serayne)cards.push(['👑','Because Serayne trusts you','The Green Court commits defenders to the White City.']);
  if(a.thorne)cards.push(['📚','Because you kept Thorne close','His knowledge can steady the Heart when the old machines fail.']);
  if(f.vael_respect||a.vael)cards.push(['⚔️','Because Vael respects the company','Some Order soldiers hesitate when he is challenged.']);
  if(f.heart_understood)cards.push(['💠','Because you understood the Heart','The party knows the final choice is more than seal or destruction.']);
  if(items.includes('signal_horn')||a.final_reinforcements)cards.push(['📯','Because you carried Veyra’s horn','Old allies can still hear the expedition’s call.']);
  return cards.slice(0,6);
}
function renderFinaleCallbacks(scene){const box=$('callbackPanel');if(!box)return;const finale=['final_road','allies_arrive','siege_gate','lower_city','finale_crisis','beacon_tower','final_stand','last_beacon'];if(!finale.includes(scene)){box.classList.add('hidden');box.innerHTML='';return;}const cards=finaleCallbackCards();if(!cards.length){box.classList.add('hidden');return;}box.innerHTML=`<div class="eyebrow">THE JOURNEY REMEMBERS</div><div class="callback-grid">${cards.map(c=>`<div class="callback-card"><span>${c[0]}</span><div><b>${esc(c[1])}</b><p>${esc(c[2])}</p></div></div>`).join('')}</div>`;box.classList.remove('hidden');}


Object.assign(scenes,{deck_pause:{title:'One Minute Before the Weather Turns',mission:'Take in the people, the ship and the strange horizon before the night changes everything.',text:['The Resolute does not rush straight from discovery into disaster. For several minutes the ship simply drifts beneath the impossible golden light. Sailors lower their voices. Captain Veyra orders lamps trimmed and lines checked twice.','Elias Thorne has come up from below decks carrying three notebooks and none of his usual certainty. He keeps staring west as though he recognises something he cannot quite admit to recognising.','Your company has one brief chance to ask a question, take bearings, or simply watch how the expedition reacts before the weather closes in.'],choices:[['veyra','Ask Veyra what worries her most','Conversation · choose what matters'],['thorne','Ask Thorne what he thinks the light is','Conversation · one question'],['company','Stay with the company and study the horizon','Quiet observation · no roll']]}, shore_rest:{title:'The First Fire on Aranor',mission:'Decide whether to stop long enough to recover before following the inland road.',text:['By the time the worst of the wreckage is dragged above the tide line, the light is fading. The survivors are cold, cut and too tired to pretend otherwise.','The inland road can be followed now, but Aranor has already taught the company that rushing carries a cost. A small fire burns behind a wall of broken planks while Veyra counts the living.'],choices:[['rest','Eat, dry equipment and rest for an hour','Rest · Supplies -1 · Hope +1 · refresh Interventions'],['gear','Use the pause to repair damaged packs','Sense Check · Craft or Knowledge'],['move','Leave before darkness settles','Continue without resting']]},});
Object.assign(sceneImages,{deck_pause:'assets/lost_home.jpg',shore_rest:'assets/lost_home.jpg'});

function openingHeroDescription(p){
  const roles={
    Knight:'a steady protector who is at their best when someone has to hold the line',
    Ranger:'a watchful pathfinder who reads terrain, movement and danger before most people see it',
    Thief:'a quick, quiet problem-solver who notices doors, shadows and opportunities other people miss',
    Mage:'a scholar of strange forces who looks for patterns beneath what everyone else calls impossible',
    Monk:'a resilient healer and calm presence when fear begins to spread',
    Engineer:'a practical maker who sees mechanisms, weaknesses and solutions where others see obstacles'
  };
  const backgrounds={
    Noble:'with the instincts of someone raised around rank, obligation and difficult conversations',
    Outlander:'with the habits of someone comfortable beyond roads and settled country',
    Scholar:'with a scholar’s instinct to ask what happened here before deciding what happens next',
    Sailor:'with the balance and endurance of someone used to storms, ropes and long watches',
    Streetwise:'with a streetwise eye for danger, lies and the quickest way out',
    Artisan:'with a craftsperson’s habit of understanding how things fit together'
  };
  const top=Object.entries(p.stats||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${k} ${v}`);
  const role=roles[p.cls]||'an adventurer with a useful set of talents';
  const bg=backgrounds[p.background]||'';
  return `${role}${bg?'; '+bg:''}${top.length?`. Strongest abilities: ${top.join(' and ')}.`:'.'}`;
}
function openingCompanyHtml(){
  const people=(state?.players||[]);
  if(!people.length)return '';
  return `<div class="opening-company"><div class="eyebrow">YOUR COMPANY</div><h3>The people aboard the Resolute</h3><p class="opening-company__lead">Captain Veyra has spent eighteen days learning what each of you can do. Now the expedition may finally need all of it.</p><div class="opening-company__grid">${people.map(p=>`<div class="opening-hero"><img src="${portraitPath(p.cls,p.portrait)}" alt="${esc(p.name)}"><div><b>${esc(p.name)}</b><span>${esc(p.cls)} · ${esc(p.background||'Outlander')}</span><p>${esc(openingHeroDescription(p))}</p></div></div>`).join('')}</div></div>`;
}


function journalQuestions(){const f=state?.flags||{},q=[];if(!f.thorne_suspect)q.push('Why did Thorne recognise Aranor’s beacon so quickly?');if(!f.heart_understood)q.push('What are the beacons actually controlling?');if(!state?.allies?.serayne)q.push('Which of Aranor’s living peoples can the company trust?');if(!state?.finalChoice&&state?.chapter>=4)q.push('Who should be allowed to control the Heart, if anyone?');return q.slice(0,5);}
function battleState(scene){const f=state?.flags||{};const stages={siege_gate:1,siege_wave1:1,siege_choice:1,wall_push:2,wall_archers:2,wall_breach:2,lower_rescue:2,burning_lane:2,civic_hall:2,burning_courtyard:2,beacon_tower:3,final_stand:3,finale_crisis:4,last_beacon:4,final_cost:4};const stage=stages[scene];if(!stage)return null;return {title:`White City Battle · Phase ${stage}/4`,items:[['Outer Gate',f.saved_gate?'held':'contested'],['Civilians',f.saved_people?'evacuated':'at risk'],['Beacon',f.stabilised_heart?'stable':'unstable']]};}
const restScenes=new Set(['deck_pause','shore_rest','quiet_fire','east_camp','pass_camp','cliff_camp','dust_camp']);
function sceneKind(scene){if(restScenes.has(scene))return ['REST','rest'];if(battleState(scene))return ['BATTLE','battle'];if(/council|parley|audience|choice|warning|traitor|betrayal|guildhall|watch_house/.test(scene))return ['CONVERSATION','conversation'];if(/marsh|road|ridge|forest|cliff|docks|tunnel|ruins|tower|archive|ferry|route|gate/.test(scene))return ['EXPLORATION','exploration'];return ['STORY','story'];}
function passiveInsight(scene,p){if(!p)return '';const bg=p.background||'Outlander';if(scene==='intro'&&p.cls==='Ranger')return `${p.name} notices every seabird is flying toward the unseen land, not away from the storm.`;if(scene==='deck_pause'&&bg==='Sailor')return `${p.name}'s sailor instincts agree with Veyra: the sea is too still for the cloud bank ahead.`;if(scene==='wreck'&&p.cls==='Engineer')return `${p.name} can already tell which parts of the wreck can still be salvaged and which are about to shift with the tide.`;if(scene==='road'&&bg==='Outlander')return `${p.name} reads the road less as ruins than as a route: water, cover and elevation matter more than the paving stones.`;if(scene==='six_mural'&&bg==='Scholar')return `${p.name} recognises that the six figures are roles in a system, not portraits of six destined people.`;return '';}
function itemCallback(scene){const items=state?.items||[];const checks=[['whisper_ruins','moon_lantern','The Moon Lantern may reveal a route the ruins are hiding.'],['goblin_border','goblin_token','Nim’s token could change how the sentries receive you.'],['traitor_reveal','silver_key','The Silver Key has finally reached the lock it seems made for.'],['mountain_gate','map_fragment','Your Map Fragments may fit the gate markings.'],['heart_chamber','sunsteel_shield','The Sunsteel Shield may let someone approach the Heart safely.'],['final_road','signal_horn','Veyra’s Signal Horn could call people who still owe the company a debt.']];for(const [s,id,text] of checks)if(scene===s&&items.includes(id))return text;return '';}
function renderQualityPanels(scene){const [label,kind]=sceneKind(scene),badge=$('sceneKindBadge');if(badge){badge.textContent=label;badge.className=`scene-kind ${kind}`;}const pi=$('passiveInsight'),ins=passiveInsight(scene,player());if(pi){pi.classList.toggle('hidden',!ins);pi.innerHTML=ins?`<b>Character instinct:</b> ${esc(ins)}`:'';}const ic=$('itemCallback'),item=itemCallback(scene);if(ic){ic.classList.toggle('hidden',!item);ic.innerHTML=item?`<b>Something you carry may matter:</b> ${esc(item)}`:'';}const bs=$('battleState'),b=battleState(scene);if(bs){bs.classList.toggle('hidden',!b);bs.innerHTML=b?`<div class="battle-title">${esc(b.title)}</div><div class="battle-track">${b.items.map(x=>`<span><b>${esc(x[0])}</b>${esc(x[1])}</span>`).join('')}</div>`:'';}document.body.classList.toggle('threat-high',(state?.threat||0)>=5);document.body.classList.toggle('hope-low',(state?.hope||0)<=1);document.body.classList.toggle('supplies-empty',(state?.supplies||0)===0);}
function renderRecap(){const b=$('recapBody');if(!b||!state)return;const j=state.journal||{people:{},clues:[],decisions:[],conclusions:[]},qs=journalQuestions(),events=(state.log||[]).slice(-8).reverse();b.innerHTML=`<div class="recap-grid"><section><div class="eyebrow">WHERE YOU ARE</div><h3>${esc(scenes[state.scene]?.title||'Current scene')}</h3><p>${esc(scenes[state.scene]?.mission||'')}</p></section><section><div class="eyebrow">RECENTLY</div>${events.length?events.map(x=>`<div class="recap-event">${esc(x)}</div>`).join(''):'<p class="muted">The journey has only just begun.</p>'}</section><section><div class="eyebrow">UNANSWERED QUESTIONS</div>${qs.length?qs.map(x=>`<div class="recap-question">? ${esc(x)}</div>`).join(''):'<p class="muted">The biggest questions have been answered.</p>'}</section><section><div class="eyebrow">KEY DECISIONS</div>${(j.decisions||[]).slice(-5).map(x=>`<div class="recap-event"><b>${esc(x.title)}</b><br>${esc(x.text)}</div>`).join('')||'<p class="muted">No major decision has been recorded yet.</p>'}</section></div>`;}
function openRecap(){renderRecap();$('recapModal')?.classList.remove('hidden');}function closeRecap(){$('recapModal')?.classList.add('hidden');}if($('recapBtn'))$('recapBtn').onclick=openRecap;if($('sessionRecapBtn'))$('sessionRecapBtn').onclick=openRecap;if($('recapClose'))$('recapClose').onclick=closeRecap;if($('recapModal'))$('recapModal').addEventListener('click',e=>{if(e.target===$('recapModal'))closeRecap();});
function duckAmbience(){if(!ambientMaster)return;const anyone=localSpeaking||[...voiceSpeaking.values()].some(Boolean);try{const ctx=playSound.ctx;if(ctx)ambientMaster.gain.setTargetAtTime(anyone?.18:.62,ctx.currentTime,.08);else ambientMaster.gain.value=anyone?.18:.62;}catch{}}

function renderGame(){
  show('game');const sc=scenes[state.scene];if(!sc)return;updateAmbience(state.scene);renderVoiceUi();syncVoicePeers();
  $('sceneTitle').textContent=sc.title;$('sceneText').innerHTML=sc.text.map(x=>`<p>${x}</p>`).join('')+(state.scene==='intro'?openingCompanyHtml():'');$('mission').textContent=sc.mission;const bridge=$('storyBridge');if(bridge){if(pendingStoryBridge&&pendingStoryBridge.scene===state.scene){bridge.innerHTML=`<p>${esc(pendingStoryBridge.text)}</p>`;bridge.classList.remove('hidden');}else bridge.classList.add('hidden');}
  const art=sceneArt[state.scene]||['🧭',sc.title],image=sceneImages[state.scene]||'assets/lost_home.jpg';const [icon,caption]=art;$('sceneArt').className=`scene-art ${state.scene}`;$('sceneArt').style.backgroundImage=`linear-gradient(0deg,rgba(5,10,18,.76),rgba(5,10,18,.08)),url('${image}')`;$('sceneArt').querySelector('.scene-art__icon').textContent=icon;$('sceneArt').querySelector('.scene-art__caption').textContent=caption;renderNpcMoment(state.scene);renderFinaleCallbacks(state.scene);renderQualityPanels(state.scene);
  $('round').textContent=state.round;$('hope').textContent=state.hope;$('threat').textContent=state.threat;$('supplies').textContent=state.supplies;$('relics').textContent=state.relics;if($('pressureNote')){$('pressureNote').textContent=threatStatusText(state.threat);$('pressureNote').className='pressure-note '+(state.threat>=5?'high':state.threat>=3?'mid':'low');}
  const active=state.players[state.activeIndex],mine=active?.id===me,waiting=(state.groups||[]).find(g=>g.id===state.currentGroupId)?.waitingMerge;$('turnNotice').className='turn-notice'+(mine?' mine':'');$('turnNotice').innerHTML=waiting?`<b>${esc(state.currentGroupName||'Your group')} has reached the rendezvous.</b> The other group is still on its route.`:mine?`<b>Your turn, ${esc(active.name)}.</b> Choose what your hero does next.${state.groups?.length>1?` <span class="group-badge">${esc(state.currentGroupName)}</span>`:''}`:`Waiting for <b>${esc(active?.name||'')}</b>${state.groups?.length>1?` · ${esc((state.groups||[]).find(g=>(g.playerIds||[]).includes(active?.id))?.name||'another group')}`:''}.`;
  $('choices').innerHTML=''; if(!state.pending){sc.choices.forEach(choice=>{const [id,label,note]=choice,available=requirementSatisfied(choice);const b=document.createElement('button');b.className='choice';b.disabled=!mine||!available;b.innerHTML=`<b>${label}</b><span>${note}${available?'':' · NOT CURRENTLY AVAILABLE'}</span>`;b.onclick=()=>socket.emit('chooseAction',{action:id});$('choices').appendChild(b);});}
  renderChallenge(mine);renderHostTools();renderInventory();renderJourney();$('party').innerHTML=state.players.map(p=>playerCard(p,true)).join('');$('log').innerHTML=state.log.slice().reverse().map(x=>`<div class="log-item">• ${esc(x)}</div>`).join('');renderLastRoll();
}

function renderJournal(){const j=state?.journal||{people:{},clues:[],decisions:[],conclusions:[]},body=$('journalBody');if(!body)return;const people=Object.values(j.people||{}),clues=j.clues||[],decisions=j.decisions||[],conclusions=j.conclusions||[],questions=journalQuestions();body.innerHTML=`<div class="journal-grid"><section><div class="eyebrow">PEOPLE</div>${people.length?people.map(p=>`<div class="journal-entry"><b>${esc(p.name||p.id)}</b>${p.status?`<span class="journal-status">${esc(p.status)}</span>`:''}<p>${esc(p.note||'You have crossed paths.')}</p></div>`).join(''):'<p class="small muted">Important relationships will appear here.</p>'}</section><section><div class="eyebrow">CLUES & CONCLUSIONS</div>${conclusions.map(x=>`<div class="journal-entry conclusion"><b>✦ ${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join('')}${clues.length?clues.map(x=>`<div class="journal-entry"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join(''):'<p class="small muted">Useful information will be recorded here.</p>'}</section><section><div class="eyebrow">UNANSWERED QUESTIONS</div>${questions.length?questions.map(x=>`<div class="journal-entry question"><b>? ${esc(x)}</b></div>`).join(''):'<p class="small muted">Nothing obvious remains unanswered.</p>'}</section><section><div class="eyebrow">DECISIONS</div>${decisions.length?decisions.map(x=>`<div class="journal-entry"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join(''):'<p class="small muted">Major choices will be remembered here.</p>'}</section></div>`;}
function openJournal(){renderJournal();$('journalModal')?.classList.remove('hidden');}
function closeJournal(){$('journalModal')?.classList.add('hidden');}
if($('journalBtn'))$('journalBtn').onclick=openJournal;if($('journalClose'))$('journalClose').onclick=closeJournal;if($('journalModal'))$('journalModal').addEventListener('click',e=>{if(e.target===$('journalModal'))closeJournal();});

function renderHeroSheet(){
  const p=player(); if(!p)return;
  const body=$('heroSheetBody');
  const unspent=p.skillPoints||0;
  body.innerHTML=`
    <div class="hero-sheet-summary">
      <img class="hero-sheet-portrait" src="${portraitPath(p.cls,p.portrait)}" alt="${p.cls} portrait">
      <div><h3>${classInfo[p.cls].icon} ${esc(p.name)} — ${p.cls}</h3><p>${esc(classInfo[p.cls].gift)}</p><p class="small muted"><b>${esc(p.background||'Outlander')} background:</b> ${esc(backgrounds[p.background||'Outlander']?.text||'')} · Edge: +1 ${esc(backgrounds[p.background||'Outlander']?.edge||'Survival')}</p><div class="hero-sheet-chips"><span>Wounds ${p.wounds}/3</span><span>Growth ${p.growth}/5</span><span>${unspent} Skill Point${unspent===1?'':'s'} available</span>${p.talent?`<span>Talent: ${esc(p.talent)}</span>`:''}</div></div>
    </div>
    <div class="hero-sheet-section"><div class="section-heading"><div><div class="eyebrow">SKILLS</div><h3>Current abilities</h3></div><div class="small muted">Starting cap 5 · Campaign cap 7</div></div>
      <div class="hero-skill-grid">${skills.map(sk=>`<div class="hero-skill"><span>${classInfo[p.cls].fav.includes(sk)?'★ ':''}${sk}</span><strong>${p.stats[sk]}</strong>${unspent>0&&p.stats[sk]<7?`<button class="btn btn-primary btn-small grow-skill" data-skill="${sk}">+1</button>`:''}</div>`).join('')}</div>
      ${unspent?'<p class="growth-help">Choose where to spend your earned Skill Point. The choice is permanent for this campaign.</p>':'<p class="small muted">Participating in challenges earns Growth. Every 5 Growth becomes one Skill Point you can allocate here.</p>'}
    </div>
    ${!p.talent&&Object.values(p.stats||{}).some(v=>v>=6)?`<div class="hero-sheet-section talent-choice"><div class="eyebrow">ADVANCED PATH UNLOCKED</div><h3>Choose one permanent talent</h3><p class="small muted">Reaching 6 in a skill marks a turning point for your hero.</p><div id="talentChoices"></div></div>`:''}
    <div class="hero-sheet-section"><div class="eyebrow">EQUIPMENT & KNOWLEDGE</div><p><b>Class gear:</b> ${esc(p.gear||'None')}</p><p><b>Private insights discovered:</b> ${privateClues.length}</p><div class="clue-journal">${privateClues.length?privateClues.map(c=>`<div class="clue-entry"><b>${esc(c.title)}</b><span>${esc(c.text)}</span></div>`).join(''):'<div class="small muted">Any personal clues your hero notices will be saved here for later reference.</div>'}</div><p class="small muted" style="margin-top:10px"><b>Dice mastery:</b> Skills at 6+ roll with Advantage (2D6, keep the higher die). Two wounds on a dangerous check cause Disadvantage unless mastery cancels it.</p></div>`;
  body.querySelectorAll('.grow-skill').forEach(b=>b.onclick=()=>{const sk=b.dataset.skill;if(confirm(`Increase ${sk} from ${p.stats[sk]} to ${p.stats[sk]+1}?`))socket.emit('allocateSkillPoint',{skill:sk});});
  const tbox=body.querySelector('#talentChoices');if(tbox&&!p.talent){const opts=state.talentCatalog?.[p.cls]||{};tbox.innerHTML=Object.entries(opts).map(([name,v])=>`<button class="choice talent-btn" data-talent="${name}"><b>${name}</b><span>${esc(v.desc)}</span></button>`).join('');tbox.querySelectorAll('.talent-btn').forEach(b=>b.onclick=()=>{if(confirm(`Choose ${b.dataset.talent} as your permanent advanced talent?`))socket.emit('chooseTalent',{talent:b.dataset.talent});});}
}
function openHeroSheet(){renderHeroSheet();$('heroSheetModal').classList.remove('hidden');}
function closeHeroSheet(){$('heroSheetModal').classList.add('hidden');}
if($('heroSheetBtn'))$('heroSheetBtn').onclick=openHeroSheet;
if($('heroSheetClose'))$('heroSheetClose').onclick=closeHeroSheet;
if($('heroSheetModal'))$('heroSheetModal').addEventListener('click',e=>{if(e.target===$('heroSheetModal'))closeHeroSheet();});

function renderHostTools(){
  const box=$('hostTools');if(!box)return;const host=state?.hostId===me;box.classList.toggle('hidden',!host);if(!host)return;
  const saved=readJson('lostExpeditionCampaign');if($('saveStatus')&&saved?.updatedAt)$('saveStatus').textContent=`✓ Auto-saved · ${new Date(saved.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  $('copyCampaignBtn').onclick=()=>{socket.emit('requestCampaignSave');setTimeout(()=>copyText(readJson('lostExpeditionCampaign')?.saveToken,$('copyCampaignBtn')),180);};
  $('resetChallengeBtn').disabled=!state.pending;$('resetChallengeBtn').onclick=()=>{if(state.pending&&confirm('Reset this challenge and let the active hero choose again?'))socket.emit('hostResetChallenge');};
  $('skipTurnBtn').onclick=()=>{const active=state.players[state.activeIndex];if(confirm(`Skip ${active?.name||'the active hero'}'s turn?`))socket.emit('hostSkipTurn');};
  const disconnected=state.players.filter(p=>!p.connected&&p.id!==state.hostId),wrap=$('removePlayerWrap');wrap.classList.toggle('hidden',!disconnected.length);
  if(disconnected.length){$('disconnectedPlayer').innerHTML=disconnected.map(p=>`<option value="${p.id}">${esc(p.name)} — ${p.cls}</option>`).join('');$('removeDisconnectedBtn').onclick=()=>{const id=$('disconnectedPlayer').value;if(id&&confirm('Remove this disconnected player from the campaign?'))socket.emit('hostRemovePlayer',{playerId:id});};}
}
function skillOptions(selected='',allowed=skills,who=null){const list=Array.isArray(allowed)&&allowed.length?allowed:skills;const hero=who||player();return list.map(s=>`<option value="${s}" ${s===selected?'selected':''}>${s} — ${Number(hero?.stats?.[s]||0)}</option>`).join('');}
function relevantSkillSummary(hero,allowed){const list=Array.isArray(allowed)&&allowed.length?allowed:skills;return list.map(s=>`${s} ${Number(hero?.stats?.[s]||0)}`).join(' · ');}
function difficultyName(n){return n<=6?'Normal':n===7?'Hard':'Very hard';}
function threatStatusText(t){return t>=5?'HUNTED — dangerous challenges are +1 difficulty; Support needs 7+':t>=3?'PRESSURED — Support rolls need 7+':'CLEAR — no Threat penalty';}
function renderChallenge(mine){
  const box=$('challenge');if(!state.pending){box.classList.add('hidden');return;}box.classList.remove('hidden');const p=state.pending;
  const groupHeroes=state.players.filter(x=>(state.currentGroupPlayerIds||state.players.map(p=>p.id)).includes(x.id));
  if(p.type==='split'){if(!mine){box.innerHTML=`<div class="challenge-box split-challenge"><span class="mode">PARTY SPLIT</span><h3>${esc(p.desc||'The road divides')}</h3><p>${esc(state.players[state.activeIndex]?.name||'The active hero')} is assigning the company to two routes.</p></div>`;return;}const routes=p.routes||{};const heroes=groupHeroes;box.innerHTML=`<div class="challenge-box split-challenge"><span class="mode">PARTY SPLIT</span><h3>${esc(p.desc||'The road divides')}</h3><p>${esc(p.reason||'The company can cover two objectives at once. The groups will follow separate scenes until they reunite.')}</p><div class="split-route-grid"><div class="split-route"><b>${esc(routes.a?.name||'Route A')}</b><span>${esc(routes.a?.text||'')}</span></div><div class="split-route"><b>${esc(routes.b?.name||'Route B')}</b><span>${esc(routes.b?.text||'')}</span></div></div><div class="split-assignments">${heroes.map((h,i)=>`<label><span><b>${esc(h.name)}</b> · ${h.cls}</span><select class="splitPick" data-player="${h.id}"><option value="a" ${i%2===0?'selected':''}>${esc(routes.a?.name||'Route A')}</option><option value="b" ${i%2===1?'selected':''}>${esc(routes.b?.name||'Route B')}</option></select></label>`).join('')}</div><button id="resolveSplit" class="btn btn-primary full">Split the Company</button></div>`;$('resolveSplit').onclick=()=>{const assignments={};box.querySelectorAll('.splitPick').forEach(s=>assignments[s.dataset.player]=s.value);socket.emit('resolveSplit',{assignments});};return;}
  if(p.failed){const can=player()?.interventionReady&&p.eligibleInterveners?.includes(me),canHope=mine&&state.hope>=2;box.innerHTML=`<div class="challenge-box"><span class="mode">SETBACK</span><h3>The attempt failed</h3><p>The story will follow the consequence of this result.</p>${canHope?'<button id="spendHope" class="btn btn-success full">Spend 2 Hope — make it a Partial Success</button>':''}${can?'<button id="intervene" class="btn btn-primary full" style="margin-top:8px">Use My Heroic Intervention</button>':''}${mine?'<button id="decline" class="btn btn-ghost full" style="margin-top:8px">Accept the Setback</button>':''}</div>`;if($('spendHope'))$('spendHope').onclick=()=>socket.emit('spendHope');if($('intervene'))$('intervene').onclick=()=>socket.emit('intervene');if($('decline'))$('decline').onclick=()=>socket.emit('declineIntervention');return;}
  if(!mine){box.innerHTML=`<div class="challenge-box"><span class="mode">${p.type.toUpperCase()} CHALLENGE</span><h3>${esc(p.desc)}</h3><p>Waiting for ${esc(state.players[state.activeIndex].name)} to choose skills and roll.</p></div>`;return;}
  if(p.type==='team'){
    const count=p.teamProfile?.count||Math.min(p.teamSize,groupHeroes.length);
    const defaultHeroes=groupHeroes.slice(0,count);
    let rows='';
    for(let i=0;i<count;i++){
      const role=p.teamRoles?.[i],roleSkills=role?.skills||skills,chosenHero=defaultHeroes[i]||state.players[0];
      rows+=`<div class="team-role-card" data-team-index="${i}"><div class="team-role-card__title">${esc(role?.name||('Hero '+(i+1)))}</div><div class="team-role-card__desc small muted">${esc(role?.desc||'Choose the hero best suited to this part of the crisis.')}</div><div class="form-grid"><label>Hero<select class="teamHero">${groupHeroes.map((x,j)=>`<option value="${x.id}" ${j===i?'selected':''}>${esc(x.name)} — ${x.cls}</option>`).join('')}</select></label><label>Skill<select class="teamSkill">${skillOptions(roleSkills[0],roleSkills,chosenHero)}</select></label></div><div class="team-role-stats small muted">${chosenHero?`Relevant skills: ${esc(relevantSkillSummary(chosenHero,roleSkills))}`:''}</div></div>`;
    }
    box.innerHTML=`<div class="challenge-box"><span class="mode">TEAM CHALLENGE</span><h3>${esc(p.desc)}</h3><div class="challenge-explain"><b>Why together?</b> ${esc(p.reason||'This problem needs several heroes acting at the same time.')}</div><p>Assign ${count} different roles. Each selected hero rolls <b>1D6 + one listed skill</b> against ${p.effectiveMemberDifficulty||p.memberDifficulty} (${difficultyName(p.effectiveMemberDifficulty||p.memberDifficulty)}). ${count===1?'1 success = success.':count===2?'2 successes = full success · 1 = partial success · 0 = setback.':'3 successes = full success · 2 = partial success · 0–1 = setback.'}${p.knowledgeNote?` <span class="knowledge-help">📖 ${esc(p.knowledgeNote)}</span>`:''}${(p.effectiveMemberDifficulty||p.memberDifficulty)>p.memberDifficulty?' <span class="threat-warning">Threat has made this dangerous challenge harder.</span>':''}</p><div class="team-role-grid">${rows}</div><button id="teamRoll" class="btn btn-primary full">🎲 Resolve the Team Challenge</button></div>`;
    [...box.querySelectorAll('.team-role-card')].forEach((card,i)=>{
      const h=card.querySelector('.teamHero'),s=card.querySelector('.teamSkill'),stats=card.querySelector('.team-role-stats'),role=p.teamRoles?.[i],allowed=role?.skills||skills;
      const update=()=>{const hero=groupHeroes.find(x=>x.id===h.value)||groupHeroes[0];s.innerHTML=skillOptions(allowed[0],allowed,hero);stats.textContent=`Relevant skills: ${relevantSkillSummary(hero,allowed)}`;};
      h.onchange=update;
    });
    $('teamRoll').onclick=()=>{const hs=[...document.querySelectorAll('.teamHero')],ss=[...document.querySelectorAll('.teamSkill')];const team=hs.map((h,i)=>({playerId:h.value,skill:ss[i].value}));socket.emit('rollChallenge',{team});};return;
  }
  const supportEligible=groupHeroes.filter(x=>x.id!==me&&x.supportReady);const support=p.type==='support',meHero=player();const seasonedNote=Number(meHero?.stats?.[p.recommended]||0)>=6?`<div class="knowledge-help">✦ Seasoned: ${esc(p.recommended)} has become one of ${esc(meHero.name)}’s defining strengths. Choosing it rolls with Advantage.</div>`:'';
  const helperOptions=supportEligible.map(x=>`<option value="${x.id}">${esc(x.name)} — ${x.cls} · ${esc(relevantSkillSummary(x,p.supportSkills))}</option>`).join('');
  if(p.lowStakes){
    const allowed=p.allowedSkills||[p.recommended];
    const successText=p.outcomeText?`You discover that ${esc(p.outcomeText)}.`:'You notice something useful that may change the route ahead.';
    box.innerHTML=`<div class="challenge-box sense-box"><span class="mode">SENSE CHECK</span><h3>${esc(p.desc)}</h3><p class="sense-intro">Look carefully for anything useful before moving on.</p><div class="sense-summary"><div><span class="small muted">TARGET</span><strong>${p.effectiveDifficulty||p.difficulty}</strong></div><div><span class="small muted">USE</span><strong>${allowed.map(sk=>`${esc(sk)} — ${Number(meHero?.stats?.[sk]||0)}`).join(' or ')}</strong></div></div><div class="sense-outcomes"><div class="sense-good"><b>If you succeed</b><span>${successText}</span></div><div class="sense-neutral"><b>If you miss</b><span>You do not notice anything useful and the journey continues.</span></div></div><label>Choose skill<select id="mainSkill">${skillOptions(p.recommended,p.allowedSkills,meHero)}</select></label><button id="mainRoll" class="btn btn-primary full">🎲 Roll the Dice</button></div>`;
  } else {
    box.innerHTML=`<div class="challenge-box"><span class="mode">${support?'SUPPORT AVAILABLE':'SOLO CHALLENGE'}</span><h3>${esc(p.desc)}</h3>${p.reason?`<div class="challenge-explain">${esc(p.reason)}</div>`:''}${seasonedNote}<p><b>Target:</b> ${p.effectiveDifficulty||p.difficulty} (${difficultyName(p.effectiveDifficulty||p.difficulty)}). <b>Use:</b> ${(p.allowedSkills||[p.recommended]).join(' or ')}.${support?` A helper may Support; their roll needs <b>${p.supportTarget||6}</b>+ to add +2.`:''}${p.knowledgeNote?` <span class="knowledge-help">📖 ${esc(p.knowledgeNote)}</span>`:''}${(p.effectiveDifficulty||p.difficulty)>p.difficulty?' <span class="threat-warning">Threat has made this challenge harder.</span>':''}</p><div class="form-grid"><label>Your skill<select id="mainSkill">${skillOptions(p.recommended,p.allowedSkills,meHero)}</select></label>${support?`<label>Optional helper<select id="supportPlayer"><option value="">Roll alone</option>${helperOptions}</select></label>`:''}</div>${support?`<div id="supportSkillWrap" class="hidden"><label>Helper's skill<select id="supportSkill"></select></label><p id="supportSkillHint" class="small muted">Choose a helper to see their relevant skill ratings.</p></div>`:''}<button id="mainRoll" class="btn btn-primary full">🎲 Roll the Dice</button></div>`;
  }
  if(support&&$('supportPlayer'))$('supportPlayer').onchange=()=>{const id=$('supportPlayer').value,wrap=$('supportSkillWrap');wrap.classList.toggle('hidden',!id);if(id){const h=groupHeroes.find(x=>x.id===id);$('supportSkill').innerHTML=skillOptions((p.supportSkills||[])[0],p.supportSkills,h);$('supportSkillHint').textContent=`${h.name}: ${relevantSkillSummary(h,p.supportSkills)}. A total of ${p.supportTarget||6}+ adds +2 to the main roll.`;}};
  $('mainRoll').onclick=()=>socket.emit('rollChallenge',{skill:$('mainSkill').value,supportPlayerId:support&&$('supportPlayer').value||null,supportSkill:support&&$('supportSkill')?.value||null});
}
function renderLastRoll(){
  const r=state.lastRoll;if(!r){$('rollResult').innerHTML='';return;}
  const key=JSON.stringify(r);if(key===dismissedRollKey){$('rollResult').innerHTML='';return;}
  let html='';
  const heroicHtml=r.heroicMoment?`<div class="heroic-callout">✨ HEROIC MOMENT — ${esc(r.heroicEffect||'the exceptional roll creates an extra advantage.')}</div>`:'';
  const complicationHtml=r.complication?`<div class="complication-callout">⚠️ UNEXPECTED COMPLICATION — ${esc(r.complicationEffect||'something else goes wrong despite the main action.')}</div>`:'';
  if(r.type==='item'){
    html=`<div class="roll-card cinematic-result"><b>🎒 ${esc(r.name)}</b><p>${esc(r.text||'The item is used.')}</p></div>`;
  } else if(r.type==='intervention'){
    html=`<div class="roll-card cinematic-result"><b>Heroic Intervention</b><div class="dice-row"><span class="die rolling">${r.die}</span></div>${esc(r.name)} used ${esc(r.skill)}: <b>${r.total}</b> — <span class="${r.success?'result-success':'result-fail'}">${r.success?'SUCCESS':'FAILED'}</span></div>`;
  } else if(r.type==='team'){
    const graded=r.grade==='partial'?'PARTIAL SUCCESS':r.success?'TEAM SUCCESS':'SETBACK';
    html=`<div class="roll-card cinematic-result"><b>Team roll</b>${r.results.map(x=>`<p>${x.rollMode&&x.rollMode!=='normal'?`<span class="mode">${x.rollMode}</span> `:''}${(x.rolls||[x.die]).map(d=>`<span class="die rolling" style="display:inline-grid">${d}</span>`).join('')} ${esc(x.name)} · ${x.role?esc(x.role)+' · ':''}${esc(x.skill)} = <b>${x.total}</b> <span class="${x.ok?'result-success':'result-fail'}">${x.ok?'✓':'✕'}</span></p>`).join('')}<b>${r.successes}/${r.results.length} successes — <span class="${r.success?'result-success':'result-fail'}">${graded}</span></b>${heroicHtml}${complicationHtml}</div>`;
  } else {
    const mainDie=r.rollMode==='advantage'?Math.max(...r.dice):r.rollMode==='disadvantage'?Math.min(...r.dice):r.dice.reduce((a,b)=>a+b,0);
    html=`<div class="roll-card cinematic-result"><b>${esc(r.desc)}</b><div class="dice-row">${r.dice.map(d=>`<span class="die rolling">${d}</span>`).join('')}</div><p>Main roll: ${mainDie} + skill ${r.bonus}${r.supportBonus?` + support ${r.supportBonus}`:''} = <b>${r.total}</b> vs ${r.difficulty}</p>${r.support?`<p class="small">${esc(r.support.name)} supported with ${esc(r.support.skill)}: ${r.support.total} ${r.support.ok?'✓ +2':'✕ no bonus'}</p>`:''}${heroicHtml}${complicationHtml}<div class="result-banner ${r.success?'ok':'bad'}">${r.success?'SUCCESS!':'SETBACK'}</div>${!r.success?`<p class="small muted">${r.dangerous?'This was dangerous — the active hero may be wounded.':'No wound: this setback changes the situation instead.'}</p>`:''}</div>`;
  }
  $('rollResult').innerHTML=html;const card=$('rollResult').querySelector('.roll-card');if(card){card.classList.add('dismissible-result');card.setAttribute('title','Click to dismiss');card.insertAdjacentHTML('beforeend','<div class="dismiss-result-hint">Dismiss ×</div>');card.onclick=()=>{dismissedRollKey=key;$('rollResult').innerHTML='';};}
  if(key!==lastRollSeen){lastRollSeen=key;dismissedRollKey='';playSound(r.success===false?'fail':'dice');setTimeout(()=>playSound(r.success===false?'fail':'success'),480);}
}
function renderEnding(){
  show('ended');
  document.querySelector('#ended .eyebrow').textContent='THE LOST EXPEDITION — COMPLETE';
  document.querySelector('#ended h1').textContent='Dawn Over Aranor';
  $('endingArt').style.backgroundImage="linear-gradient(0deg,rgba(5,10,18,.72),rgba(5,10,18,.08)),url('assets/title.jpg')";
  const choices={
    seal:'The company restores the ancient seal. One by one, the distant beacons dim. Aranor slips from the world’s maps again — not because its people are forgotten, but because they have chosen time to heal before the world finds them.',
    open:'The company opens the beacon roads. Across the sea, compasses that have pointed nowhere for eight centuries turn toward Aranor. The island will face danger, trade, friendship and change — but it will face them by choice.',
    steward:'The company breaks the old pattern of kings and conquerors. The Heart remains awake, but its control is divided among Aranor’s surviving peoples. No single ruler, expedition or Order can command it alone.'
  };
  const allyKeys=Object.keys(state.allies||{}).filter(k=>state.allies[k]);
  const pretty={nim:'Nim',goblin_clan:'the goblin clans',serayne:'Lady Serayne',village:'Serayne’s people',survivors:'the Resolute survivors',scouts:'the expedition scouts',crew:'Captain Veyra’s crew',thorne:'Elias Thorne',vael:'Commander Vael',final_reinforcements:'the friends called by Veyra’s horn'};
  const allies=allyKeys.map(k=>pretty[k]||k.replaceAll('_',' '));
  const cost=state.flags?.scarred_finale?'The choice holds — but not cleanly. The tower is left broken, several heroes carry new wounds, and Aranor will remember that its future was bought at a cost.':'The company holds the Heart through the final surge. When the shaking stops, every hero is still standing. The choice is permanent.';
  const routeNames=(state.routeHistory||[]).filter(r=>r.complete).map(r=>r.name).filter(Boolean);const trusted=Object.values(state.journal?.people||{}).filter(p=>['ally','trusting','confiding','respectful','cooperating','turned','under guard'].includes(String(p.status||'').toLowerCase())).map(p=>p.name);const remainingItems=(state.items||[]).map(id=>state.itemCatalog?.[id]?.name||id.replaceAll('_',' '));
  const callbacks=[];
  if(state.flags?.heart_understood)callbacks.push('You understood the Heart before choosing its fate.');
  if(state.flags?.thorne_exposed)callbacks.push('The truth of the Resolute’s wreck was brought into the light.');
  if(state.flags?.old_war_truth)callbacks.push('The hidden account of Aranor’s old war survived with you.');
  if(state.flags?.gate_stable)callbacks.push('The mountain gate was left stable enough for others to escape.');
  if(state.flags?.saved_gate)callbacks.push('When three crises struck at once, the company chose to hold the western gate themselves.');
  if(state.flags?.saved_people)callbacks.push('When the city began to fall, the company chose people over position and pulled families from the ruins.');
  if(state.flags?.stabilised_heart)callbacks.push('At the worst moment, the company stayed with the Heart and kept its power from running wild.');
  if(state.flags?.gate_fell)callbacks.push('The western gate fell while the company was elsewhere; Aranor survived, but the cost is remembered.');
  if(state.flags?.people_lost)callbacks.push('Not everyone below the tower could be reached in time.');
  if(state.flags?.heart_scar)callbacks.push('The Heart surged uncontrolled for several minutes, leaving a permanent scar through the old beacon network.');
  if((state.items||[]).includes('goblin_token'))callbacks.push('Nim’s token remains among the company’s most unlikely treasures.');
  $('endingText').innerHTML=`
    <p class="finale-lead">${choices[state.finalChoice]||choices.steward}</p>
    <p>${cost}</p>
    ${allies.length?`<p><b>When the Last Beacon was surrounded, these allies answered:</b> ${allies.map(esc).join(', ')}.</p>`:'<p>The company reaches the end with few allies — but reaches it together.</p>'}
    ${callbacks.length?`<div class="ending-callbacks"><b>What your journey changed</b><ul>${callbacks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
    ${routeNames.length?`<p><b>Roads taken:</b> ${routeNames.map(esc).join(', ')}.</p>`:''}${trusted.length?`<p><b>Relationships carried to the end:</b> ${trusted.map(esc).join(', ')}.</p>`:''}${remainingItems.length?`<p><b>Still in the company’s pack:</b> ${remainingItems.map(esc).join(', ')}.</p>`:''}<h2>The Company at Journey’s End</h2>
    ${state.players.map(p=>`<div class="epilogue"><b>${classInfo[p.cls]?.icon||'✦'} ${esc(p.name)} — ${p.cls}</b><p>${heroEpilogue(p)}</p><span>Highest skill: ${strongestSkill(p)} · Wounds ${p.wounds}/3 · Unspent Skill Points ${p.skillPoints||0}</span></div>`).join('')}
    <p class="finale-close"><b>The Resolute came searching for a lost continent.</b><br>What returned was a company of friends who had become part of its history.</p>`;
  document.querySelector('.next-session').innerHTML='<div class="eyebrow">THE END</div><h2>Your version of Aranor is now part of the campaign record.</h2><p>Different choices, failures, allies and discoveries can produce a substantially different road to this same dawn.</p>';
  playSound('success');
}
function strongestSkill(p){const entries=Object.entries(p.stats||{});entries.sort((a,b)=>b[1]-a[1]);return `${entries[0]?.[0]||'—'} ${entries[0]?.[1]||0}`;}
function heroEpilogue(p){
  const best=Object.entries(p.stats||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  const byClass={
    Knight:`${p.name} became known as the one who stood between danger and the people who could not stand for themselves. In later years, Aranorian guards still taught a formation named after the company’s ${best.toLowerCase()}-minded Knight.`,
    Ranger:`${p.name} returned to roads no map had recorded for eight centuries. The first new charts of Aranor carried a small mark beside the hardest routes: “Found by ${p.name}. Trust the path.”`,
    Thief:`${p.name} learned that the greatest secret was not the Heart but knowing which truths should be exposed and which should be protected. More than one locked door in Aranor later opened because someone remembered the company’s Shadow.`,
    Mage:`${p.name} spent years recording what the beacons could do — and, more importantly, what no one should ever ask them to do. Scholars came to call those writings the Aranor Codex.`,
    Monk:`${p.name} became a familiar figure on roads between peoples who had spent generations fearing one another. The work was slow, ordinary and perhaps more important than anything done inside the Last Beacon.`,
    Engineer:`${p.name} stayed long enough to make impossible machinery useful again. Bridges moved, water flowed and old beacon mechanisms became tools instead of weapons.`
  };
  return byClass[p.cls]||`${p.name} carried the story of Aranor into the years that followed.`;
}

function renderVoiceUi(){
  const players=state?.players||[],joined=players.filter(p=>p.voiceJoined);
  const status=voiceJoined?`${joined.length} connected`:'Not connected';
  ['voiceLobbyStatus','voiceGameStatus'].forEach(id=>{const el=$(id);if(el)el.textContent=status;});
  document.querySelectorAll('.voiceJoinBtn').forEach(b=>b.classList.toggle('hidden',voiceJoined));
  document.querySelectorAll('.voiceMuteBtn').forEach(b=>{b.classList.toggle('hidden',!voiceJoined);b.textContent=voiceMuted?'Unmute':'Mute';});
  document.querySelectorAll('.voiceLeaveBtn').forEach(b=>b.classList.toggle('hidden',!voiceJoined));
  const html=joined.length?joined.map(p=>{const speaking=p.id===me?localSpeaking:voiceSpeaking.get(p.id);const icon=p.voiceMuted?'🔇':speaking?'🔊':'🎙';return `<div class="voice-person ${speaking&&!p.voiceMuted?'speaking':''}"><span>${icon}</span><b>${esc(p.name)}</b>${p.id===me?'<em>You</em>':''}</div>`;}).join(''):'<span class="muted">No one has joined voice yet.</span>';
  ['voiceLobbyList','voiceGameList'].forEach(id=>{const el=$(id);if(el)el.innerHTML=html;});
}
function bindVoiceButtons(){
  document.querySelectorAll('.voiceJoinBtn').forEach(b=>b.onclick=joinVoice);
  document.querySelectorAll('.voiceMuteBtn').forEach(b=>b.onclick=toggleVoiceMute);
  document.querySelectorAll('.voiceLeaveBtn').forEach(b=>b.onclick=leaveVoice);
}
bindVoiceButtons();
async function joinVoice(){
  if(voiceJoined||!me||!state)return;
  if(!navigator.mediaDevices?.getUserMedia)return showConsequence('Voice unavailable','This browser does not provide microphone access.','bad');
  try{
    localVoiceStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    voiceJoined=true;voiceMuted=false;socket.emit('voiceJoin');startLocalSpeakingDetector();renderVoiceUi();syncVoicePeers();
  }catch(e){voiceJoined=false;showConsequence('Microphone not connected','Allow microphone access to use optional voice chat.','bad');}
}
function toggleVoiceMute(){
  if(!voiceJoined||!localVoiceStream)return;voiceMuted=!voiceMuted;for(const t of localVoiceStream.getAudioTracks())t.enabled=!voiceMuted;socket.emit('voiceSetMuted',{muted:voiceMuted});if(voiceMuted)setLocalSpeaking(false);renderVoiceUi();
}
function leaveVoice(){
  if(voiceJoined)socket.emit('voiceLeave');voiceJoined=false;voiceMuted=false;setLocalSpeaking(false);stopLocalSpeakingDetector();
  if(localVoiceStream){localVoiceStream.getTracks().forEach(t=>t.stop());localVoiceStream=null;}
  for(const id of [...voicePeers.keys()])closeVoicePeer(id);renderVoiceUi();
}
function closeVoicePeer(id){const pc=voicePeers.get(id);if(pc){try{pc.close();}catch{}voicePeers.delete(id);}const a=document.getElementById(`voice-audio-${id}`);if(a)a.remove();voiceSpeaking.delete(id);}
function attachRemoteVoice(id,stream){let a=document.getElementById(`voice-audio-${id}`);if(!a){a=document.createElement('audio');a.id=`voice-audio-${id}`;a.autoplay=true;a.playsInline=true;a.className='remote-voice-audio';document.body.appendChild(a);}a.srcObject=stream;a.play?.().catch(()=>{});}
async function ensureVoicePeer(id,initiate=false){
  if(!voiceJoined||!localVoiceStream||id===me)return null;if(voicePeers.has(id))return voicePeers.get(id);
  const pc=new RTCPeerConnection(voiceRtcConfig);pc._queued=[];voicePeers.set(id,pc);
  for(const track of localVoiceStream.getTracks())pc.addTrack(track,localVoiceStream);
  pc.onicecandidate=e=>{if(e.candidate)socket.emit('voiceSignal',{targetPlayerId:id,candidate:e.candidate});};
  pc.ontrack=e=>attachRemoteVoice(id,e.streams[0]);
  pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState)&&pc.connectionState!=='disconnected')closeVoicePeer(id);renderVoiceUi();};
  if(initiate){try{const offer=await pc.createOffer();await pc.setLocalDescription(offer);socket.emit('voiceSignal',{targetPlayerId:id,description:pc.localDescription});}catch{}}
  return pc;
}
function syncVoicePeers(){
  if(!voiceJoined||!state)return;const ids=new Set((state.players||[]).filter(p=>p.voiceJoined&&p.id!==me).map(p=>p.id));
  for(const id of [...voicePeers.keys()])if(!ids.has(id))closeVoicePeer(id);
  for(const id of ids)ensureVoicePeer(id,String(me)<String(id));
}
socket.on('voiceSignal',async({fromPlayerId,description,candidate})=>{
  if(!voiceJoined||!localVoiceStream)return;const pc=await ensureVoicePeer(fromPlayerId,false);if(!pc)return;
  try{
    if(description){
      if(description.type==='offer'){if(pc.signalingState!=='stable')try{await pc.setLocalDescription({type:'rollback'});}catch{}await pc.setRemoteDescription(description);for(const c of pc._queued.splice(0))await pc.addIceCandidate(c);const ans=await pc.createAnswer();await pc.setLocalDescription(ans);socket.emit('voiceSignal',{targetPlayerId:fromPlayerId,description:pc.localDescription});}
      else if(description.type==='answer'&&pc.signalingState==='have-local-offer'){await pc.setRemoteDescription(description);for(const c of pc._queued.splice(0))await pc.addIceCandidate(c);}
    }else if(candidate){if(pc.remoteDescription)await pc.addIceCandidate(candidate);else pc._queued.push(candidate);}
  }catch{}
});
socket.on('voicePeerLeft',x=>{closeVoicePeer(x.playerId);renderVoiceUi();});
socket.on('voiceSpeaking',x=>{voiceSpeaking.set(x.playerId,!!x.speaking);renderVoiceUi();duckAmbience();});
socket.on('voiceMuted',x=>{voiceSpeaking.set(x.playerId,false);renderVoiceUi();});
function setLocalSpeaking(v){v=!!v&&!voiceMuted;if(localSpeaking===v)return;localSpeaking=v;if(voiceJoined)socket.emit('voiceSpeaking',{speaking:v});renderVoiceUi();duckAmbience();}
function startLocalSpeakingDetector(){
  stopLocalSpeakingDetector();if(!localVoiceStream)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=playSound.ctx||(playSound.ctx=new AC());const src=ctx.createMediaStreamSource(localVoiceStream),an=ctx.createAnalyser();an.fftSize=512;src.connect(an);const data=new Uint8Array(an.fftSize);let quiet=0;const tick=()=>{if(!voiceJoined||!localVoiceStream)return;an.getByteTimeDomainData(data);let sum=0;for(const x of data){const d=(x-128)/128;sum+=d*d;}const rms=Math.sqrt(sum/data.length);if(rms>.035&&!voiceMuted){quiet=0;setLocalSpeaking(true);}else if(++quiet>6)setLocalSpeaking(false);voiceAnalyserFrame=requestAnimationFrame(tick);};tick();}catch{}
}
function stopLocalSpeakingDetector(){if(voiceAnalyserFrame)cancelAnimationFrame(voiceAnalyserFrame);voiceAnalyserFrame=null;}

function ambientCategory(scene){
  if(['intro','deck_pause'].includes(scene))return 'sea';
  if(['storm','wave'].includes(scene))return 'storm';
  if(['wreck','wreck_fire','shore_rest','ash_coast','escape_coast','ash_sails','dawn'].includes(scene))return 'shore';
  if(['troll','troll_chase','flooded_court'].includes(scene))return 'river';
  if(['lost_marsh','marsh_lights','marsh_night'].includes(scene))return 'marsh';
  if(['road','wolf_ring','green_gate','survivor_camp','quiet_fire','goblin_border','hunter_trap','council','medicine_choice'].includes(scene))return 'forest';
  if(['undercliff_wreck','sea_caves','root_tunnels','fungal_hall','cellar_route','buried_gallery','echo_chamber','ash_prison','ash_archive','undergate_chasm','vault_puzzle','mirror_vault','heart_chamber','heart_vision','heart_truth','buried_exit'].includes(scene))return 'cave';
  if(['ravine_fall','mountain_gate','ash_canyon','collapse','final_road'].includes(scene))return 'wind';
  if(['night_assault','siege_gate','lower_city','beacon_tower','final_stand','finale_crisis','last_beacon','final_cost'].includes(scene))return 'battle';
  return 'forest';
}
function stopAmbience(){if(ambientTimer){clearInterval(ambientTimer);ambientTimer=null;}for(const n of ambientNodes){try{if(n.stop)n.stop();}catch{}try{n.disconnect();}catch{}}ambientNodes=[];if(ambientMaster){try{ambientMaster.disconnect();}catch{}ambientMaster=null;}ambientScene=null;}
function makeNoiseSource(ctx){const len=ctx.sampleRate*3,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;s.loop=true;return s;}
function ambientNoise(ctx,master,{gain=.02,low=0,high=0,type='lowpass'}={}){const src=makeNoiseSource(ctx),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type=type;f.frequency.value=high||low||900;g.gain.value=gain;src.connect(f);f.connect(g);g.connect(master);src.start();ambientNodes.push(src,f,g);return {src,f,g};}
function ambientTone(ctx,master,freq,gain=.006){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.value=gain;o.connect(g);g.connect(master);o.start();ambientNodes.push(o,g);return o;}
function birdChirp(ctx,master){if(!ambientOn||ambientCategory(state?.scene)!=='forest')return;const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type='sine';o.frequency.setValueAtTime(1650,now);o.frequency.exponentialRampToValueAtTime(2450,now+.12);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.012,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+.22);o.connect(g);g.connect(master);o.start(now);o.stop(now+.25);}
function updateAmbience(scene,force=false){
  if(!ambientOn||!scene){stopAmbience();return;}const cat=ambientCategory(scene);if(!force&&ambientScene===cat&&ambientMaster)return;stopAmbience();ambientScene=cat;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=playSound.ctx||(playSound.ctx=new AC());ambientMaster=ctx.createGain();ambientMaster.gain.value=.72;ambientMaster.connect(ctx.destination);ambientNodes.push(ambientMaster);
    if(cat==='sea'){const n=ambientNoise(ctx,ambientMaster,{gain:.022,high:700});const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=.09;lg.gain.value=.013;l.connect(lg);lg.connect(n.g.gain);l.start();ambientNodes.push(l,lg);ambientTone(ctx,ambientMaster,55,.003);}
    else if(cat==='shore'){const n=ambientNoise(ctx,ambientMaster,{gain:.028,high:950});const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=.16;lg.gain.value=.016;l.connect(lg);lg.connect(n.g.gain);l.start();ambientNodes.push(l,lg);}
    else if(cat==='river'){ambientNoise(ctx,ambientMaster,{gain:.035,high:1800});ambientNoise(ctx,ambientMaster,{gain:.012,high:420,type:'lowpass'});}
    else if(cat==='storm'){ambientNoise(ctx,ambientMaster,{gain:.05,high:1100});ambientTone(ctx,ambientMaster,43,.018);}
    else if(cat==='marsh'){ambientNoise(ctx,ambientMaster,{gain:.013,high:1200});ambientTone(ctx,ambientMaster,86,.004);}
    else if(cat==='forest'){ambientNoise(ctx,ambientMaster,{gain:.009,high:2200,type:'highpass'});ambientNoise(ctx,ambientMaster,{gain:.006,high:500});ambientTimer=setInterval(()=>birdChirp(ctx,ambientMaster),6500);setTimeout(()=>birdChirp(ctx,ambientMaster),800);}
    else if(cat==='cave'){ambientNoise(ctx,ambientMaster,{gain:.007,high:500});ambientTone(ctx,ambientMaster,63,.006);ambientTone(ctx,ambientMaster,94,.003);}
    else if(cat==='wind'){ambientNoise(ctx,ambientMaster,{gain:.025,high:800});ambientTone(ctx,ambientMaster,48,.004);}
    else if(cat==='battle'){ambientNoise(ctx,ambientMaster,{gain:.02,high:700});ambientTone(ctx,ambientMaster,52,.008);}
  }catch{}
}

function playSound(kind){
  if(!audioOn)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    const ctx=playSound.ctx||(playSound.ctx=new AC());
    const now=ctx.currentTime;
    const tone=(freq,dur,type='sine',gain=.05,delay=0)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now+delay);g.gain.setValueAtTime(0.0001,now+delay);g.gain.exponentialRampToValueAtTime(gain,now+delay+.02);g.gain.exponentialRampToValueAtTime(.0001,now+delay+dur);o.connect(g);g.connect(ctx.destination);o.start(now+delay);o.stop(now+delay+dur+.03);
    };
    if(kind==='dialogue'){tone(360,.10,'sine',.025);tone(520,.16,'sine',.02,.08);}
    else if(kind==='storm'){tone(80,.8,'sawtooth',.07);tone(42,1.1,'sine',.08,.08);}
    else if(kind==='troll'){tone(58,.55,'square',.055);tone(45,.7,'sawtooth',.05,.15);}
    else if(kind==='success'){tone(440,.18,'sine',.045);tone(660,.22,'sine',.05,.14);tone(880,.30,'sine',.05,.28);}
    else if(kind==='fail'){tone(220,.25,'triangle',.04);tone(155,.4,'triangle',.04,.18);}
    else {tone(240,.08,'square',.025);tone(330,.08,'square',.025,.09);tone(410,.08,'square',.025,.18);}
  }catch{}
}
function showSceneReveal(scene){
  const sc=scenes[scene]; if(!sc||scene===lastSceneSeen)return; lastSceneSeen=scene;
  if(scene==='storm'||scene==='wave')playSound('storm'); else if(scene==='troll')playSound('troll');
  const overlay=$('sceneReveal'); if(!overlay)return;const sk=sceneKind(scene)[1];if(sk==='battle')playSound('storm');else if(sk==='rest'||sk==='conversation')playSound('dialogue');
  overlay.style.backgroundImage=`linear-gradient(rgba(3,8,15,.2),rgba(3,8,15,.82)),url('${sceneImages[scene]||'assets/lost_home.jpg'}')`;
  $('revealKicker').textContent=scene==='troll'?'RANDOM EVENT':'THE LOST EXPEDITION';
  $('revealTitle').textContent=sc.title;
  $('revealText').textContent=scene==='troll'?'Something huge moves beneath the bridge.':scene==='storm'?'The calm is over. The sky breaks.':sc.mission;
  overlay.classList.remove('hidden');overlay.classList.add('show');
  clearTimeout(showSceneReveal.t);showSceneReveal.t=setTimeout(()=>{overlay.classList.remove('show');setTimeout(()=>overlay.classList.add('hidden'),350);},2200);
}
function showSpotlight(kicker,title,text,image='assets/portraits.jpg',ms=2500){
  const overlay=$('sceneReveal'); if(!overlay)return;
  overlay.style.backgroundImage=`linear-gradient(rgba(3,8,15,.22),rgba(3,8,15,.82)),url('${image}')`;
  $('revealKicker').textContent=kicker;
  $('revealTitle').textContent=title;
  $('revealText').textContent=text;
  overlay.classList.remove('hidden');overlay.classList.add('show');
  clearTimeout(showSpotlight.t);showSpotlight.t=setTimeout(()=>{overlay.classList.remove('show');setTimeout(()=>overlay.classList.add('hidden'),350);},ms);
}
function showConsequence(title,text,type='good'){
  const box=$('consequenceToast');if(!box)return;
  box.className=`consequence-toast ${type}`;box.innerHTML=`<b>${title}</b><span>${text}</span>`;box.classList.remove('hidden');
  clearTimeout(showConsequence.t);showConsequence.t=setTimeout(()=>box.classList.add('hidden'),4200);
}
function handleAtmosphere(oldS,newS){
  if(oldS.phase!=='playing'&&newS.phase==='playing')setTimeout(()=>showSceneReveal(newS.scene),120);
  else if(newS.phase==='playing'&&oldS.scene!==newS.scene){if(suppressNextSceneReveal)suppressNextSceneReveal=false;else setTimeout(()=>showSceneReveal(newS.scene),120);}
  if(oldS.supplies!==newS.supplies)showConsequence(newS.supplies>oldS.supplies?'Supplies gained':'Supplies lost',`${Math.abs(newS.supplies-oldS.supplies)} supply ${Math.abs(newS.supplies-oldS.supplies)===1?'point':'points'} ${newS.supplies>oldS.supplies?'added to':'removed from'} the expedition.`,newS.supplies>oldS.supplies?'good':'bad');
  else if((oldS.items||[]).length!==(newS.items||[]).length)showConsequence('Inventory updated','The party has gained or used a special item.','good');
  else if(oldS.hope!==newS.hope)showConsequence('Hope changes',`Party Hope is now ${newS.hope}/6.`,newS.hope>oldS.hope?'good':'bad');
}



let activeOutcome=null;
function actionGerund(desc=''){
  const s=String(desc||'').trim(); if(!s)return '';
  const m=s.match(/^([A-Za-z]+)(.*)$/); if(!m)return s;
  const v=m[1].toLowerCase(),rest=m[2]||'';
  const irregular={be:'being',break:'breaking',bring:'bringing',build:'building',choose:'choosing',come:'coming',cut:'cutting',dig:'digging',do:'doing',drive:'driving',fight:'fighting',find:'finding',flee:'fleeing',get:'getting',hold:'holding',keep:'keeping',lead:'leading',leave:'leaving',make:'making',read:'reading',ride:'riding',rise:'rising',run:'running',see:'seeing',send:'sending',stand:'standing',take:'taking',wake:'waking',write:'writing'};
  let g=irregular[v];
  if(!g){
    if(v.endsWith('ie'))g=v.slice(0,-2)+'ying';
    else if(v.endsWith('e')&&!v.endsWith('ee'))g=v.slice(0,-1)+'ing';
    else g=v+'ing';
  }
  return g+rest;
}
function outcomeNarrative(payload){
  const result=payload.label||'OUTCOME';
  const hero=payload.hero?`<b>${esc(payload.hero)}</b>`:'The company';
  const action=payload.desc?esc(actionGerund(payload.desc)):'';
  if(result==='NOTHING FOUND') return `${hero} took a careful look, but nothing useful stood out this time.`;
  if(result==='DISCOVERY') return payload.desc?`${hero} ${esc(payload.desc)}.`:`${hero} noticed something useful.`;
  if(result==='SETBACK') return payload.failureText?esc(payload.failureText):(payload.desc?`${hero} attempted to ${esc(payload.desc)}, but the plan did not work. The consequences now have to be faced.`:`${hero} tried, but the plan did not work.`);
  if(result==='PARTIAL SUCCESS') return action?`${hero} succeeded in ${action}, but success came at a cost.`:`${hero} succeeded, but not without a cost.`;
  if(result==='DECISION MADE'){let d=String(payload.desc||'');if(/^do not wait\s*[—-]\s*/i.test(d))d=d.replace(/^do not wait\s*[—-]\s*/i,'press on without waiting and ');return d?`The company chose to ${esc(d)}.`:`The choice was made.`;}
  return action?`${hero} succeeded in ${action}.`:`${hero} succeeded.`;
}
function actionPast(desc=''){
  const s=String(desc||'').trim();if(!s)return '';
  const m=s.match(/^([A-Za-z]+)(.*)$/);if(!m)return s;
  const v=m[1].toLowerCase(),rest=m[2]||'';
  const irregular={be:'was able to',break:'broke',bring:'brought',build:'built',choose:'chose',come:'came',cut:'cut',dig:'dug',do:'did',drive:'drove',fight:'fought',find:'found',flee:'fled',get:'got',hold:'held',keep:'kept',lead:'led',leave:'left',make:'made',read:'read',ride:'rode',rise:'rose',run:'ran',see:'saw',send:'sent',stand:'stood',take:'took',wake:'woke',write:'wrote'};
  let past=irregular[v];
  if(!past){if(v.endsWith('e'))past=v+'d';else if(v.endsWith('y')&&!/[aeiou]y$/.test(v))past=v.slice(0,-1)+'ied';else past=v+'ed';}
  return past+rest;
}
const destinationPhrases={
  deck_pause:'the quiet deck beneath the golden light',storm:'the open deck as the weather turns',wave:'the pitching deck as the great wave rises',wreck:'the wreck-strewn shore',road:'the broken inland road',troll:'the living-root bridge above the ravine',green_gate:'the vine-choked entrance to the Green Ruins',survivor_camp:'the shattered expedition camp inside the ruins',whisper_ruins:'the deeper streets of the Green Ruins',six_mural:'the buried hall of the six figures',quiet_fire:'a sheltered camp beyond the mural hall',goblin_border:'the border paths of the Broken Kingdom',council:'Lady Serayne’s open-air council',medicine_choice:'the crowded settlement below Serayne’s hall',broken_keep:'the ruined keep beyond the settlement',ash_coast:'the black-sailed Order encampment on the coast',vael_parley:'a roofless hall at the edge of the Order camp',traitor_reveal:'Thorne’s quarters beside the expedition camp',thorne_choice:'a guarded fire away from the rest of the company',escape_coast:'the inland roads as the Order closes in',mountain_gate:'the immense sealed gate beneath the mountain',vault_puzzle:'the ancient machinery beyond the gate',heart_chamber:'the cathedral-sized chamber around the Heart',heart_truth:'the old control dais beside the Heart',collapse:'the collapsing passages beneath the mountain',final_road:'the high road overlooking the White City',allies_arrive:'a ruined waystation on the last road',siege_gate:'the embattled outer gate of the White City',beacon_tower:'the lower levels of the Beacon Tower',final_stand:'the upper control chamber',finale_crisis:'the beacon chamber as the city begins to fail',last_beacon:'the opened controls of the Last Beacon',final_cost:'the unstable Heart controls',dawn:'the terraces above the White City',
  shore_rest:'the first fire above the wreck coast',smoke_shore:'the blackened edge of the wreck site',marsh_recovery:'a patch of firmer ground beyond the marsh voices',wolf_pursuit:'a narrow forest run above the ravine',spore_sick:'a dry gallery beyond the fungal hall',hunters_camp:'a rough hunter camp above Serayne’s valley',canyon_floor:'the shadowed floor of Ash Canyon',hanging_platform:'an old maintenance shelf beneath the Mountain Gate',mirror_detour:'a false gallery behind the Mirror Vault',burning_courtyard:'a smoke-filled courtyard below the Beacon Tower'
};
function scenePlace(sceneId){
  const sc=scenes[sceneId];
  if(destinationPhrases[sceneId]) return destinationPhrases[sceneId];
  if(!sc?.title) return 'the next stretch of the journey';
  return /^(the|a|an)\s/i.test(sc.title) ? sc.title : `the ${sc.title}`;
}
function routeClause(desc=''){
  const s=String(desc||'').toLowerCase();
  if(!s) return '';
  if(s.includes('road')) return ' along the road';
  if(s.includes('forest')) return ' through the forest';
  if(s.includes('ridge')) return ' along the ridge';
  if(s.includes('river')) return ' along the river';
  if(s.includes('bridge')) return ' over the bridge';
  if(s.includes('ledge')) return ' along the ledge';
  if(s.includes('causeway')) return ' by the causeway';
  if(s.includes('marsh')) return ' through the marsh';
  if(s.includes('stairs')) return ' by the stairs';
  if(s.includes('tunnel')||s.includes('culvert')) return ' through the tunnel';
  if(s.includes('gate')) return ' toward the gate';
  if(s.includes('dock')||s.includes('wharf')) return ' toward the docks';
  return '';
}
function groupLabel(payload){
  return payload.hero ? `${payload.hero} and the company` : 'The company';
}
function transitionBridge(payload){
  if(!payload?.nextScene) return null;
  const from=scenePlace(payload.fromScene);
  const to=scenePlace(payload.nextScene);
  const route=routeClause(payload.desc||'');
  const actor=groupLabel(payload);
  if(payload.label==='SETBACK'){
    const setback=payload.failureText || `${payload.hero||'The acting hero'} could not ${String(payload.desc||'complete the task')}.`;
    return `${setback} From ${from}, the company is forced onward${route} toward ${to}.`;
  }
  if(payload.label==='PARTIAL SUCCESS'){
    return `${actor} got the job done, but not cleanly. From ${from}, the company presses on${route} toward ${to}, carrying the cost of that result with them.`;
  }
  if(payload.label==='DISCOVERY'){
    return `${actor} noticed something important. From ${from}, the company moves on${route} toward ${to} with a clearer sense of the way ahead.`;
  }
  if(payload.label==='NOTHING FOUND'){
    return `Nothing useful revealed itself at ${from}, so the company keeps moving${route} toward ${to}.`;
  }
  if(payload.label==='DECISION MADE'){
    return `The company ${actionPast(payload.desc||'chose the next path')}. From ${from}, they set out${route} toward ${to}.`;
  }
  const past=actionPast(payload.desc||'pressed on');
  return `${payload.hero||'The company'} successfully ${past}. From ${from}, the company moves on${route} toward ${to}.`;
}
function dialoguePortrait(speaker=''){const hit=Object.values(npcInfo||{}).find(n=>n.name===speaker||speaker.includes(n.name.split(' ').slice(-1)[0]));return hit?.img||null;}
function renderOutcome(){
  const payload=activeOutcome;if(!payload)return;
  const result=payload.label||'OUTCOME';
  $('outcomeLabel').textContent=result;
  $('outcomeTitle').textContent=result==='SUCCESS'?'Success':result==='PARTIAL SUCCESS'?'Success — at a cost':result==='DISCOVERY'?'Discovery':result==='NOTHING FOUND'?'Nothing unusual':result==='SETBACK'?'Setback':'Decision made';
  $('outcomeBody').innerHTML=outcomeNarrative(payload);
  const moments=[];
  if(payload.heroicMoment)moments.push(`<div class="heroic-callout">✨ <b>HEROIC MOMENT</b> — ${esc(payload.heroicEffect||'The exceptional roll creates an extra advantage.')}</div>`);
  if(payload.complication)moments.push(`<div class="complication-callout">⚠️ <b>UNEXPECTED COMPLICATION</b> — ${esc(payload.complicationEffect||'Something else goes wrong despite the main action.')}</div>`);
  if(payload.successes!=null&&payload.teamSize)moments.push(`<div class="outcome-team-score"><b>${payload.successes}/${payload.teamSize}</b> team roles succeeded.</div>`);
  if(payload.partialEffect)moments.push(`<div class="outcome-team-score"><b>Cost:</b> ${esc(payload.partialEffect)}</div>`);
  if(payload.dialogue){const d=payload.dialogue,img=dialoguePortrait(d.speaker||'');moments.push(`<div class="dialogue-result ${img?'with-portrait':''}">${img?`<img class="dialogue-portrait" src="${img}" alt="${esc(d.speaker||'NPC')}">`:''}<div class="dialogue-copy">${d.speaker?`<div class="dialogue-speaker">${esc(d.speaker)}</div>`:''}<p>“${esc(d.text||'')}”</p>${d.extra?`<p class="dialogue-extra">${esc(d.extra)}</p>`:''}${d.clue?`<div class="dialogue-clue">📖 <b>Journal updated:</b> ${esc(d.clue.title)}</div>`:''}${d.relationship?`<div class="dialogue-clue">🤝 <b>${esc(d.relationship.name||d.relationship.id)}</b>: ${esc(d.relationship.status||'relationship changed')}</div>`:''}</div></div>`);setTimeout(()=>playSound('dialogue'),80);}
  if(result==='SETBACK'&&payload.consequenceText)moments.push(`<div class="outcome-team-score setback-cost"><b>Consequence:</b> ${esc(payload.consequenceText)}</div>`);
  $('outcomeMoments').innerHTML=moments.join('');
  $('outcomeNext').innerHTML='';
  $('outcomeContinue').textContent='Continue';
}
function showOutcome(payload){
  const modal=$('outcomeModal');if(!modal)return;
  suppressNextSceneReveal=true;activeOutcome=payload;renderOutcome();modal.classList.remove('hidden');playSound(payload.label==='SETBACK'?'fail':'success');
}
socket.on('outcome',showOutcome);
if($('outcomeContinue'))$('outcomeContinue').onclick=()=>{if(!$('outcomeModal'))return;const bridgeText=transitionBridge(activeOutcome);if(bridgeText&&activeOutcome?.nextScene)pendingStoryBridge={scene:activeOutcome.nextScene,text:bridgeText};$('outcomeModal').classList.add('hidden');activeOutcome=null;if(state?.phase==='playing')renderGame();};
socket.on('skillPointEarned',x=>{playSound('success');showSpotlight('HERO ADVANCEMENT','Skill Point Earned','Open My Hero to choose one skill to improve. Your hero is becoming something more.',portraitPath(player()?.cls,player()?.portrait),2800);showConsequence('Skill Point earned!','Open My Hero to improve one skill.','good');if($('heroSheetModal')&&!$('heroSheetModal').classList.contains('hidden'))renderHeroSheet();});
socket.on('talentEarned',x=>{playSound('success');showSpotlight('ADVANCED PATH UNLOCKED',x.talent,x.desc,portraitPath(player()?.cls,player()?.portrait),3200);showConsequence(`${x.talent} unlocked`,x.desc,'good');if(!$('heroSheetModal').classList.contains('hidden'))renderHeroSheet();});
socket.on('itemFound',it=>{playSound('success');const modal=document.createElement('div');modal.className='item-modal';modal.innerHTML=`<div class="item-modal__card"><div style="font-size:3rem">${it.icon||'🎒'}</div><div class="eyebrow">ITEM DISCOVERED</div><h2>${esc(it.name)}</h2><p>${esc(it.desc||'')}</p><button class="btn btn-success full">Add to the Expedition</button></div>`;document.body.appendChild(modal);modal.querySelector('button').onclick=()=>modal.remove();});

