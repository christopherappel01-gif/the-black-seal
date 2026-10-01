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
 arrival:['🏰','Greyhaven at festival dusk'],ambush:['⚔️','Steel in the North Gate'],courier:['🕯️','The courier’s last warning'],market_chase:['🏃','A shadow through the market'],rooftops:['🌆','Across the tiled roofs'],watch_house:['🛡️','The Crown Watch'],lantern_cellar:['🍺','The Lantern Cellar'],guildhall:['🗝️','The guild beneath the city'],customs_archive:['📜','Ledgers and sealed names'],palace_audience:['👑','A summons to the palace'],river_docks:['⚓','Fog on the King’s River'],warehouse:['📦','The warehouse with no owner'],masquerade:['🎭','Masks at Vane House'],prince_attack:['🗡️','The blade behind the music'],council:['🏛️','The emergency council'],old_tower:['🗼','The abandoned watchtower'],undercrypt:['🕳️','Stairs beneath the old city'],gate_chamber:['◈','The Gate of Kings'],betrayal:['♟️','The move no one expected'],coup_begins:['🔥','Bells over a city in revolt'],west_gate:['🚪','The seized West Gate'],palace_siege:['🏰','The palace under siege'],arsenal:['⚙️','The royal arsenal'],final_council:['👑','Who still stands with the Crown'],gate_awakens:['✨','The old gate wakes'],final_crisis:['🔥','Three battles, one city'],black_seal:['🜂','The Black Seal']
};
const sceneImages={
 arrival:'assets/title.jpg',ambush:'assets/consequence.jpg',courier:'assets/black_gate_ambush.jpg',market_chase:'assets/black_lantern_ward.jpg',rooftops:'assets/black_lantern_ward.jpg',watch_house:'assets/black_gate_ambush.jpg',lantern_cellar:'assets/black_lantern_ward.jpg',guildhall:'assets/black_lantern_ward.jpg',customs_archive:'assets/black_docks.jpg',palace_audience:'assets/serayne_council_bespoke.jpg',river_docks:'assets/storm.jpg',warehouse:'assets/black_docks.jpg',masquerade:'assets/black_masquerade.jpg',prince_attack:'assets/consequence.jpg',council:'assets/serayne_council_bespoke.jpg',old_tower:'assets/black_gate_kings.jpg',undercrypt:'assets/black_gate_kings.jpg',gate_chamber:'assets/black_gate_kings.jpg',betrayal:'assets/consequence.jpg',coup_begins:'assets/order_landing_bespoke.jpg',west_gate:'assets/storm.jpg',palace_siege:'assets/white_city_finale_bespoke.jpg',arsenal:'assets/black_city_siege.jpg',final_council:'assets/black_finale.jpg',gate_awakens:'assets/heart_aranor_bespoke.jpg',final_crisis:'assets/consequence.jpg',black_seal:'assets/white_city_finale_bespoke.jpg'
};
Object.assign(sceneImages,{
  arrival:'assets/black_home.jpg',ambush:'assets/black_gate_ambush.jpg',alley_detour:'assets/black_gate_ambush.jpg',courier:'assets/black_gate_ambush.jpg',market_chase:'assets/black_lantern_ward.jpg',rooftops:'assets/black_lantern_ward.jpg',watch_house:'assets/black_home.jpg',
  lantern_cellar:'assets/black_lantern_ward.jpg',guildhall:'assets/black_lantern_ward.jpg',customs_archive:'assets/black_lantern_ward.jpg',archive_alarm:'assets/black_lantern_ward.jpg',city_crossroads:'assets/black_home.jpg',lantern_entry:'assets/black_lantern_ward.jpg',candle_market:'assets/black_lantern_ward.jpg',rooftop_message:'assets/black_lantern_ward.jpg',guild_doors:'assets/black_lantern_ward.jpg',rook_terms:'assets/black_lantern_ward.jpg',hidden_ledger:'assets/black_lantern_ward.jpg',lantern_rope_bridge:'assets/black_lantern_ward.jpg',dye_court:'assets/black_lantern_ward.jpg',old_shrine:'assets/black_lantern_ward.jpg',whisper_house:'assets/black_lantern_ward.jpg',guild_stair:'assets/black_lantern_ward.jpg',
  river_docks:'assets/black_docks.jpg',warehouse:'assets/black_docks.jpg',canal_escape:'assets/black_docks.jpg',dock_checkpoint:'assets/black_docks.jpg',fish_market:'assets/black_docks.jpg',barge_row:'assets/black_docks.jpg',ropewalk:'assets/black_docks.jpg',warehouse_watch:'assets/black_docks.jpg',canal_gate:'assets/black_docks.jpg',ropeyard_watch:'assets/black_docks.jpg',chandlers_lane:'assets/black_docks.jpg',night_ferry:'assets/black_docks.jpg',customs_tunnel:'assets/black_docks.jpg',warehouse_roof:'assets/black_docks.jpg',
  palace_audience:'assets/black_masquerade.jpg',masquerade:'assets/black_masquerade.jpg',garden_meeting:'assets/black_masquerade.jpg',prince_attack:'assets/black_masquerade.jpg',council:'assets/black_masquerade.jpg',palace_route_choice:'assets/black_masquerade.jpg',court_gate:'assets/black_masquerade.jpg',mask_gallery:'assets/black_masquerade.jpg',music_room:'assets/black_masquerade.jpg',balcony_watch:'assets/black_masquerade.jpg',royal_gallery:'assets/black_masquerade.jpg',court_merge:'assets/black_masquerade.jpg',portrait_corridor:'assets/black_masquerade.jpg',card_room:'assets/black_masquerade.jpg',moon_balcony:'assets/black_masquerade.jpg',chapel_antechamber:'assets/black_masquerade.jpg',service_gate:'assets/black_masquerade.jpg',kitchen_pass:'assets/black_masquerade.jpg',linen_stairs:'assets/black_masquerade.jpg',servant_archive:'assets/black_masquerade.jpg',hidden_landing:'assets/black_masquerade.jpg',service_merge:'assets/black_masquerade.jpg',pantry_crossing:'assets/black_masquerade.jpg',furnace_room:'assets/black_gate_kings.jpg',laundry_court:'assets/black_masquerade.jpg',page_passage:'assets/black_masquerade.jpg',
  border_news:'assets/black_home.jpg',old_tower:'assets/black_gate_kings.jpg',undercrypt:'assets/black_gate_kings.jpg',gate_chamber:'assets/black_gate_kings.jpg',gate_guard:'assets/black_gate_kings.jpg',betrayal:'assets/black_gate_kings.jpg',prison:'assets/black_gate_kings.jpg',secret_tunnel:'assets/black_gate_kings.jpg',old_city_choice:'assets/black_gate_kings.jpg',bell_street:'assets/black_home.jpg',clockmaker_lane:'assets/black_home.jpg',old_belfry:'assets/black_gate_kings.jpg',roof_bridge:'assets/black_home.jpg',tower_archive:'assets/black_gate_kings.jpg',bell_loft:'assets/black_gate_kings.jpg',tiled_roofs:'assets/black_home.jpg',observatory:'assets/black_home.jpg',rain_gallery:'assets/black_gate_kings.jpg',aqueduct_entry:'assets/black_gate_kings.jpg',flood_steps:'assets/black_gate_kings.jpg',cistern:'assets/black_gate_kings.jpg',smuggler_chapel:'assets/black_gate_kings.jpg',iron_door:'assets/black_gate_kings.jpg',drain_lock:'assets/black_gate_kings.jpg',drowned_street:'assets/black_gate_kings.jpg',salt_vault:'assets/black_gate_kings.jpg',whisper_culvert:'assets/black_gate_kings.jpg',
  city_riot:'assets/black_city_siege.jpg',guild_choice:'assets/black_city_siege.jpg',watch_choice:'assets/black_city_siege.jpg',coup_begins:'assets/black_city_siege.jpg',coup_wave:'assets/black_city_siege.jpg',coup_split:'assets/black_city_siege.jpg',west_gate:'assets/black_gate_siege.jpg',gate_barricade:'assets/black_gate_siege.jpg',gate_tower:'assets/black_gate_siege.jpg',gate_counterattack:'assets/black_gate_siege.jpg',wall_walk:'assets/black_gate_siege.jpg',chain_room:'assets/black_gate_siege.jpg',outer_yard:'assets/black_gate_siege.jpg',arsenal:'assets/black_city_siege.jpg',arsenal_yard:'assets/black_city_siege.jpg',powder_room:'assets/black_city_siege.jpg',arsenal_hold:'assets/black_city_siege.jpg',forge_floor:'assets/black_city_siege.jpg',cart_shed:'assets/black_city_siege.jpg',armoury_gallery:'assets/black_city_siege.jpg',palace_siege:'assets/black_city_siege.jpg',final_council:'assets/black_finale.jpg',gate_awakens:'assets/black_gate_kings.jpg',final_crisis:'assets/black_city_siege.jpg',black_seal:'assets/black_finale.jpg',waiting_reunion:'assets/black_home.jpg'
});
const portraitImages={Knight:['assets/knight_1.jpg','assets/knight_2.jpg','assets/knight_3.jpg'],Ranger:['assets/ranger_1.jpg','assets/ranger_2.jpg','assets/ranger_3.jpg'],Thief:['assets/thief_1.jpg','assets/thief_2.jpg','assets/thief_3.jpg'],Mage:['assets/mage_1.jpg','assets/mage_2.jpg','assets/mage_3.jpg'],Monk:['assets/monk_1.jpg','assets/monk_2.jpg','assets/monk_3.jpg'],Engineer:['assets/engineer_1.jpg','assets/engineer_2.jpg','assets/engineer_3.jpg']};
const portraitChoice={create:1,join:1};
const portraitPath=(cls,n=1)=>portraitImages[cls]?.[Math.max(0,Math.min(2,Number(n||1)-1))]||portraitImages[cls]?.[0]||'assets/portraits.jpg';
const npcInfo={Calder:{name:'Captain Renn Calder',img:'assets/npc_calder.jpg',tag:'Captain of the Crown Watch'},Lysa:{name:'Lysa Quick',img:'assets/npc_lysa.jpg',tag:'Runner of the Lantern Ward'},Elira:{name:'Lady Elira Vane',img:'assets/npc_elira.jpg',tag:'Keeper of the King’s Secrets'},Cael:{name:'Brother Cael',img:'assets/npc_cael.jpg',tag:'Scholar of the old city'},Corvin:{name:'Lord Marshal Corvin Veyr',img:'assets/npc_corvin.jpg',tag:'Commander of Greyhaven’s armies'}};
let me=null,state=null,myStats=emptyStats(),roomCode='';
let audioOn=true,ambientOn=readJson('blackSealAmbient')!==false,lastSceneSeen=null,lastRollSeen='',dismissedRollKey='',previousSnapshot=null,suppressNextSceneReveal=false,pendingStoryBridge=null;
let ambientScene=null,ambientMaster=null,ambientNodes=[],ambientTimer=null;
let voiceJoined=false,voiceMuted=false,localVoiceStream=null,voiceAnalyserFrame=null,localSpeaking=false;
const voicePeers=new Map(),voiceSpeaking=new Map();
const voiceRtcConfig={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};
let sessionInfo=readJson('blackSealSession');
let campaignSave=readJson('blackSealCampaign');
let privateClues=[];
let autoResumeTried=false;
function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function clearKey(key){try{localStorage.removeItem(key)}catch{}}
function clueStorageKey(code=roomCode,id=me){return code&&id?`blackSealClues_${code}_${id}`:null}
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
  const panel=$('savedCampaignPanel'),rejoin=$('rejoinPanel');campaignSave=readJson('blackSealCampaign');sessionInfo=readJson('blackSealSession');
  const available=!!(campaignSave?.saveToken&&sessionInfo?.resumeToken);if(panel)panel.classList.toggle('hidden',!available);
  if(available&&$('savedCampaignInfo')){const when=campaignSave.updatedAt?new Date(campaignSave.updatedAt).toLocaleString():'';$('savedCampaignInfo').textContent=`Saved at ${campaignSave.scene||'your adventure'}, round ${campaignSave.round||1}${when?' · '+when:''}.`; }
  const canRejoin=!!(sessionInfo?.roomCode&&sessionInfo?.resumeToken);if(rejoin)rejoin.classList.toggle('hidden',!canRejoin);if(canRejoin&&$('rejoinInfo'))$('rejoinInfo').textContent=`Last room: ${sessionInfo.roomCode}${sessionInfo.returnPin?' · Return PIN '+sessionInfo.returnPin:''}. Use this if you refreshed or briefly lost connection.`;
}
function storeSession(x){sessionInfo={roomCode:x.roomCode,resumeToken:x.resumeToken,playerId:x.playerId,returnPin:x.returnPin||sessionInfo?.returnPin||null};writeJson('blackSealSession',sessionInfo);}

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
if($('ambientToggle')){$('ambientToggle').textContent=ambientOn?'🌿 Ambience on':'🌿 Ambience off';$('ambientToggle').onclick=()=>{ambientOn=!ambientOn;writeJson('blackSealAmbient',ambientOn);$('ambientToggle').textContent=ambientOn?'🌿 Ambience on':'🌿 Ambience off';if(ambientOn&&state?.phase==='playing')updateAmbience(state.scene,true);else stopAmbience();};}
if($('rejoinLastBtn'))$('rejoinLastBtn').onclick=()=>{sessionInfo=readJson('blackSealSession');if(!sessionInfo?.roomCode||!sessionInfo?.resumeToken)return showError('No recent room was found.');socket.emit('resumeRoom',{roomCode:sessionInfo.roomCode,resumeToken:sessionInfo.resumeToken});};
if($('continueSavedBtn'))$('continueSavedBtn').onclick=()=>{campaignSave=readJson('blackSealCampaign');sessionInfo=readJson('blackSealSession');if(!campaignSave?.saveToken||!sessionInfo?.resumeToken)return showError('No saved campaign was found in this browser.');socket.emit('restoreCampaign',{saveToken:campaignSave.saveToken,resumeToken:sessionInfo.resumeToken});};
if($('copySaveHomeBtn'))$('copySaveHomeBtn').onclick=()=>copyText(readJson('blackSealCampaign')?.saveToken,$('copySaveHomeBtn'));
if($('forgetSaveBtn'))$('forgetSaveBtn').onclick=()=>{if(confirm('Forget the saved campaign on this browser? This does not stop a room that is currently running.')){clearKey('blackSealCampaign');clearKey('blackSealSession');campaignSave=null;sessionInfo=null;refreshSavedCampaignUI();}};
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
  if(state&&me)socket.emit('leaveRoomView');
  if(voiceJoined)leaveVoice();
  stopAmbience();
  me=null;state=null;roomCode='';lastSceneSeen=null;lastRollSeen='';dismissedRollKey='';previousSnapshot=null;pendingStoryBridge=null;show('home');refreshSavedCampaignUI();
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
socket.on('resumed',x=>{acceptIdentity(x,false);});
socket.on('campaignSave',x=>{campaignSave=x;writeJson('blackSealCampaign',x);refreshSavedCampaignUI();if($('saveStatus'))$('saveStatus').textContent=`✓ Auto-saved · ${new Date(x.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;});
socket.on('secret',x=>{const box=$('secret');box.innerHTML=`<b>🔒 Private ${esc(x.title||'insight')}</b><br>${esc(x.text)}<div class="small muted" style="margin-top:6px">Only your character receives this clue. It has been saved in your Hero sheet.</div>`;box.classList.remove('hidden');const key=`${x.title||'insight'}|${x.text}`;if(!privateClues.some(c=>c.key===key)){privateClues.unshift({key,title:x.title||'Private insight',text:x.text,seenAt:Date.now()});privateClues=privateClues.slice(0,20);savePrivateClues();}clearTimeout(socket._secretTimer);socket._secretTimer=setTimeout(()=>box.classList.add('hidden'),16000);if($('heroSheetModal')&&!$('heroSheetModal').classList.contains('hidden'))renderHeroSheet();});
socket.on('state',s=>{
  const old=state; state=s;roomCode=s.code||roomCode;
  if(!me)return;
  const p=s.players.find(x=>x.id===me);if(p?.ready&&used()===0)myStats={...p.stats};
  if(old) handleAtmosphere(old,s);
  if(s.phase==='lobby')renderLobby();else if(s.phase==='playing')renderGame();else if(s.phase==='ended')renderEnding();if(voiceJoined)syncVoicePeers();if($('heroSheetModal')&&!$('heroSheetModal').classList.contains('hidden'))renderHeroSheet();
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
  $('lobbyHint').innerHTML=host?(allReady?'<b>Everyone is ready.</b> You can begin the expedition.':'You are the <b>host</b>. Start once every hero shows Ready.'):'Waiting for the host to begin. You can stay on this screen while everyone finishes their hero.';
  renderVoiceUi();
}
function playerCard(p,inGame){const g=(state?.groups||[]).find(x=>(x.playerIds||[]).includes(p.id));const groupTag=state?.groups?.length>1?` · ${esc(g?.name||'Separated')}`:'';return `<div class="player-card ${p.id===me?'you':''} ${inGame&&state.players[state.activeIndex]?.id===p.id?'active':''}"><div class="player-ident"><img class="mini-portrait" src="${portraitPath(p.cls,p.portrait)}" alt="${p.cls}"><div><b>${esc(p.name)}</b><div class="small muted">${p.cls} · ${p.background||'Outlander'}${p.talent?' · '+p.talent:''}${groupTag}</div></div></div><div class="small ${p.connected?'ready':'muted'}">${p.connected?'● Online':'○ Away'}${p.ready?' · Ready':''}</div></div>`;}

const scenes={
 arrival:{title:'Festival at Greyhaven',mission:'Escort a royal courier through the North Gate before the gates close.',text:['Greyhaven is already shining when your company reaches the walls. Banners hang from every tower for tomorrow’s Festival of Crowns.','Your travelling companion, royal courier Aldren Saye, has ridden the last two days without sleep. He carries a black leather satchel chained to his wrist.','At the gate he quietly says, “If anyone asks, you never saw me on the north road.”'],choices:[['ask','Press Aldren about the danger','Support · Normal (6)'],['watch','Watch the crowd around the gate','Solo · Normal (6)'],['enter','Get inside before the gates close','No roll']]},
 ambush:{title:'Steel at the North Gate',mission:'Keep Aldren alive and stop the attackers taking his satchel.',text:['A fruit cart overturns in front of the horses. Three figures in festival cloaks move before the apples stop rolling.','One goes for Aldren. One cuts the satchel chain. The third blocks the gatehouse stairs.','The attackers are too coordinated to be common thieves.'],choices:[['protect','Protect Aldren and hold the street','Team challenge'],['pursue','Chase the thief with the satchel','Support · Hard (7)'],['mark','Identify the attackers before they vanish','Solo · Hard (7)']]},
 alley_detour:{title:'The Alley of Bells',mission:'Find the stolen satchel after losing sight of the thief.',text:['The thief is gone, but a trail of black sealing wax dots the stones between festival stalls.','The alley ahead divides beneath a row of bronze prayer bells. One path climbs toward the rooftops. The other drops toward the old drains.'],choices:[['roofs','Take the rooftops','Support · Normal (6)'],['drain','Follow the wax toward the drains','Solo · Normal (6)']]},
 courier:{title:'Aldren’s Warning',mission:'Understand what the courier was carrying and why someone wanted it.',text:['Aldren is alive, barely. Captain Renn Calder of the Crown Watch kneels beside him while the gatehouse is sealed.','The courier grips your sleeve. “Not the papers,” he whispers. “The seal. Black wax. Lion with no crown. Find Vane before midnight.”','Calder looks sharply at you. “Lady Elira Vane serves inside the palace. You are coming with me.”'],choices:[['truth','Tell Calder everything Aldren said','No roll'],['inspect','Inspect the broken satchel chain and wax','Solo · Normal (6)'],['hide','Keep the words about the black seal to yourselves','Support · Hard (7)']]},
 market_chase:{title:'The Festival Market',mission:'Catch the satchel thief before the crowd swallows them.',text:['Fire-eaters, musicians and hundreds of festival-goers turn the market into a moving wall.','Ahead, the thief throws off a cloak and slips between two puppet stages.','A child points upward. “He went to the roofs.”'],choices:[['crowd','Cut through the crowd','Support · Normal (6)'],['roofs','Climb after the thief','Solo · Hard (7)'],['predict','Predict where the thief is heading','Solo · Normal (6)']]},
 rooftops:{title:'Across the Red Roofs',mission:'Corner the thief above the Lantern Ward.',text:['The chase crosses steep red tiles above music and torchlight. The thief never looks back.','At the edge of the Lantern Ward they throw the satchel to someone waiting on a balcony below.','You can catch the runner or follow the satchel, but not both.'],choices:[['runner','Take the runner alive','Support · Hard (7)'],['satchel','Follow the satchel into the Lantern Ward','Solo · Normal (6)']]},
 watch_house:{title:'The Crown Watch',mission:'Decide how much of the mystery to trust to Captain Calder.',text:['The North Watch House smells of wet cloaks, lamp oil and old stone. Calder clears the room before speaking.','He shows you a second piece of black wax found beside a murdered customs clerk three nights ago. Same lion. No crown.','“Someone is moving people and weapons through my city,” he says. “And someone above my rank is protecting them.”'],choices:[['help','Agree to investigate for Calder','No roll'],['records','Ask for the customs murder records','Solo · Normal (6)'],['lantern','Ask what he knows about the Lantern Ward','Support · Normal (6)']]},
 lantern_cellar:{title:'The Lantern Cellar',mission:'Find the person who received the stolen satchel.',text:['The Lantern Ward does not appear on official maps. Its alleys change names depending on who is asking.','Lysa Quick, a sharp-eyed street runner, meets you beneath a tavern sign with no lettering. She already knows about the satchel.','“The person who bought it works for someone with palace money,” she says. “I can take you lower, but the guild will want a reason not to rob you.”'],choices:[['token','Pay for an introduction','Item/resource route'],['talk','Convince Lysa you are worth the risk','Support · Normal (6)'],['follow','Follow her without being noticed','Solo · Hard (7)']]},
 guildhall:{title:'The House Below',mission:'Win the cooperation of Greyhaven’s thieves without becoming their next mark.',text:['Beneath a shuttered bathhouse is a hall full of quiet people who know exactly how much every purse in the room is worth.','Guildmaster Rook lays the courier’s empty satchel on the table. “We did not steal this,” he says. “Someone wants the Crown to think we did.”','He offers a trade: find who is using guild routes to move soldiers into the city, and the guild will tell you who bought the seal.'],choices:[['deal','Take Rook’s bargain','No roll'],['press','Press Rook for the buyer’s name now','Support · Hard (7)'],['read','Read the room for who is frightened','Solo · Normal (6)']]},
 customs_archive:{title:'The Customs Archive',mission:'Discover what has been smuggled through Greyhaven in the last month.',text:['The archive sits above the river customs house behind three locks and a clerk who never seems to sleep.','The missing entries all concern wagons marked as temple stone. Their declared destination is an abandoned watchtower inside the western wall.','Someone has changed the ink dates after the fact.'],choices:[['inside','Get into the sealed ledger room','Support · Hard (7)'],['clerk','Persuade the night clerk to help','Support · Normal (6)'],['forgery','Identify who altered the records','Solo · Hard (7)']]},
 archive_alarm:{title:'Lanterns on the Stairs',mission:'Escape the archive before the Watch patrol reaches the locked floor.',text:['A bell rings below. Not the city bell — a desk bell. Someone has noticed you.','Boots start up the stairs while the ledger room’s iron shutters begin to close.'],choices:[['window','Escape across the river roofline','Team challenge'],['hide','Hide until the patrol passes','Support · Hard (7)']]},
 palace_audience:{title:'The King’s House',mission:'Warn Lady Elira Vane before the stolen seal is used.',text:['The palace is full of festival guests and soldiers wearing polished armour. The King himself is not seen.','Lady Elira Vane receives you in a map room with no servants present. She listens without interruption.','When you describe the black seal, she closes the shutters. “That seal belonged to the king’s elder brother. He died twenty-three years ago.”'],choices:[['meaning','Ask what the seal can command','No roll'],['trust','Ask why she believes you','Support · Normal (6)'],['king','Ask where the King is','Support · Hard (7)']]},
 river_docks:{title:'Fog on the King’s River',mission:'Trace the false stone wagons to their source.',text:['At low tide, the river docks reveal cellar doors usually hidden by water.','A wagon marked TEMPLE STONE waits beside a barge with no flag. Four labourers unload crates that clink like armour.','The wagon driver is wearing a palace stable badge.'],choices:[['shadow','Shadow the wagon inland','Support · Normal (6)'],['barge','Search the barge','Solo · Hard (7)'],['driver','Take the driver quietly','Support · Hard (7)']]},
 warehouse:{title:'The Empty Warehouse',mission:'Learn who is supplying the hidden soldiers.',text:['The wagon stops at a warehouse that officially burned down six years ago. Inside are uniforms without insignia, crossbows, dried food and city maps.','One map has three places circled: the West Gate, the palace armoury, and an old watchtower.','A locked chest bears the same uncrowned lion pressed into black wax.'],choices:[['chest','Open the black-sealed chest','Support · Hard (7)'],['maps','Study the marked city maps','Solo · Normal (6)'],['wait','Hide and wait for whoever comes next','Support · Hard (7)']]},
 canal_escape:{title:'Under the River Wall',mission:'Escape through the old canal after the warehouse is compromised.',text:['A whistle sounds outside. Then another answers from the roof.','The warehouse doors are already blocked. Lysa kicks open a rotten hatch in the floor, revealing a dry maintenance canal beneath the river wall.','The tunnel slopes toward the old western quarter.'],choices:[['run','Reach the western quarter before pursuit closes in','Team challenge'],['mislead','Leave a false trail in the canals','Support · Normal (6)']]},
 masquerade:{title:'Masks at Vane House',mission:'Identify the court figure connected to the black seal.',text:['Lady Elira does not cancel her festival masquerade. She doubles the guards and invites exactly the same people.','Half the kingdom’s powerful families dance beneath silver masks while servants carry messages no one is supposed to notice.','Somewhere in the house is the person financing the hidden soldiers.'],choices:[['court','Work the room and draw out a suspect','Support · Hard (7)'],['servants','Slip into the servants’ passages','Solo · Hard (7)'],['ledgers','Search Elira’s guest correspondence','Support · Hard (7)']]},
 garden_meeting:{title:'The Winter Garden',mission:'Listen without being discovered.',text:['A masked noble leaves the ballroom and enters the glass winter garden. Another person is already waiting among the orange trees.','You hear only fragments: “tomorrow at the bells”… “the West Gate”… “Veyr has agreed.”','Then a floor tile shifts under someone’s boot.'],choices:[['stay','Stay hidden and hear the rest','Solo · Very hard (8)'],['take','Seize one conspirator before they leave','Team challenge']]},
 prince_attack:{title:'A Blade in the Music',mission:'Keep Prince Halren alive long enough to learn who ordered the attack.',text:['The orchestra stops because the violinist has fallen. A crossbow bolt meant for Prince Halren is buried in the chair beside him.','Three masked guests move toward separate exits at once. Palace guards reach for the wrong people.','Elira shouts, “Alive if you can!”'],choices:[['prince','Protect the Prince','Team challenge'],['assassin','Catch the assassin','Support · Hard (7)'],['bolt','Identify the weapon and firing angle','Solo · Hard (7)']]},
 council:{title:'The Closed Council',mission:'Decide who to trust before the Festival of Crowns begins.',text:['Before dawn, a small council meets beneath the palace chapel: Prince Halren, Elira, Calder, Brother Cael, and Lord Marshal Corvin Veyr.','Corvin argues for martial law. Calder objects. Elira says almost nothing.','Brother Cael places an ancient city plan on the table. Beneath the abandoned western watchtower is something labelled only: GATE OF KINGS.'],choices:[['corvin','Question Lord Marshal Corvin','Support · Hard (7)'],['cael','Ask Brother Cael about the Gate of Kings','No roll'],['plan','Compare the old map with the smugglers’ map','Solo · Normal (6)']]},
 border_news:{title:'Riders from the West',mission:'Understand why a hidden army inside the city matters now.',text:['A mud-covered rider reaches the palace just after sunrise. The western border forts have gone silent.','No invasion banner has been seen, but scouts report thousands of campfires beyond the hills.','Greyhaven may be facing an attack from outside at the exact moment someone is preparing a coup from within.'],choices:[['report','Interrogate the scout’s report for inconsistencies','Solo · Normal (6)'],['prepare','Help Calder prepare loyal districts quietly','Support · Hard (7)'],['tower','Go immediately to the old watchtower','No roll']]},
 old_tower:{title:'The Abandoned Watchtower',mission:'Find what the conspirators have built beneath the western wall.',text:['The watchtower has been empty since the old civil war, but its lower door is newly oiled.','Fresh boot marks lead down instead of up. A pulley carries heavy crates into darkness.','Someone has repaired a lift that predates the current city walls.'],choices:[['lift','Ride the ancient lift down','No roll'],['inspect','Inspect the lift and cargo marks first','Support · Normal (6)'],['stairs','Take the narrow service stairs unseen','Solo · Hard (7)']]},
 undercrypt:{title:'Beneath Old Greyhaven',mission:'Reach the chamber below the city before the conspirators know you are there.',text:['The passages below the tower are older than the kingdom. Royal tombs have been built around something much older.','Brother Cael identifies the symbols as waymarks used by the first kings.','Ahead, voices echo around a vast stone chamber.'],choices:[['quiet','Approach without being heard','Support · Hard (7)'],['runes','Read the royal waymarks','Solo · Hard (7)'],['direct','Walk in openly','No roll']]},
 gate_chamber:{title:'The Gate of Kings',mission:'Discover why the black seal was stolen.',text:['A ring of black stone stands upright in the centre of the chamber. There is no wall inside it — only darkness full of distant stars.','The stolen seal fits a socket beside the ring. Crates of weapons are stacked around the platform.','Brother Cael whispers, “This was how the first kings moved armies before there were roads.”'],choices:[['study','Understand how the Gate can be opened','Support · Hard (7)'],['disable','Disable the mechanism without destroying it','Support · Very hard (8)'],['seal','Take back the Black Seal','Solo · Hard (7)']]},
 gate_guard:{title:'Men Without Colours',mission:'Survive the hidden garrison guarding the Gate of Kings.',text:['A horn sounds in the passage behind you. Soldiers pour from side chambers wearing armour with every badge filed away.','They do not shout questions. They move to capture the seal and close the exits.'],choices:[['break','Break through the garrison','Team challenge'],['smoke','Use the service tunnels to escape','Support · Hard (7)']]},
 betrayal:{title:'The Marshal’s Move',mission:'Escape after discovering who controls the conspiracy.',text:['Lord Marshal Corvin Veyr steps into the chamber surrounded by officers of the city army.','He does not deny anything. “The King is dying. The border is already lost. Halren will inherit a realm that will not survive his coronation.”','Corvin intends to use the Gate to strike the enemy army first — and replace the Crown with military rule before anyone can stop him.'],choices:[['argue','Challenge Corvin’s plan','Support · Hard (7)'],['stall','Keep him talking while someone reaches the seal','Support · Very hard (8)'],['escape','Escape before the chamber is sealed','Team challenge']]},
 prison:{title:'The Marshal’s Cells',mission:'Get free before the coup begins above you.',text:['You wake behind iron bars inside the old tower. Your weapons are gone, but not every small tool was found.','From above comes the sound of festival bells. Twelve strikes.','A guard mutters, “At the thirteenth, the West Gate opens.”'],choices:[['locks','Open the cells quietly','Support · Normal (6)'],['guard','Turn one guard against Corvin','Support · Hard (7)'],['wall','Break through the old mortar into the next cell','Team challenge']]},
 city_riot:{title:'The Festival Breaks',mission:'Reach allies while Greyhaven turns against itself.',text:['The city above is no longer celebrating. Soldiers loyal to Corvin occupy crossroads while Crown Watch whistles answer from alleys.','Rumours move faster than orders: the King is dead; the Prince is dead; the thieves poisoned the wells; a foreign army is already inside the walls.','None of the rumours agree. All of them are useful to someone.'],choices:[['guild','Reach the Lantern Ward and ask Rook for help','No roll'],['watch','Reach Calder’s watch post','No roll'],['palace','Go directly toward the palace','Support · Hard (7)']]},
 guild_choice:{title:'The Guild’s Price',mission:'Convince Rook that Greyhaven is worth defending.',text:['Rook has every tunnel exit open and half the guild ready to leave the city.','Lysa refuses to go. “If Corvin wins, there won’t be a Lantern Ward left to come back to.”','Rook looks at your company. “Give me one reason this is our war.”'],choices:[['people','Appeal to the people who cannot leave','Support · Normal (6)'],['deal','Promise the guild protection after the crisis','Support · Hard (7)'],['routes','Ask only for the hidden routes beneath the city','No roll']]},
 watch_choice:{title:'Calder’s Last Watch',mission:'Help the loyal Watch hold enough of the city to reach the palace.',text:['Captain Calder has sixty watchmen, three barricades and no idea which army officers remain loyal.','He has held the King’s Bridge for an hour. He cannot hold it for another.','The palace is two districts away.'],choices:[['bridge','Help hold the bridge while civilians cross','Team challenge'],['route','Find a route around Corvin’s soldiers','Support · Normal (6)'],['orders','Use the evidence to rally uncertain soldiers','Support · Hard (7)']]},
 secret_tunnel:{title:'The Queen’s Passage',mission:'Enter the palace without crossing Corvin’s siege line.',text:['Elira’s old map reveals a sealed passage from the royal mint into the palace kitchens.','The door has not been opened in eighty years. The lock is mechanical, magical and extremely stubborn.','Behind you, fighting moves closer.'],choices:[['open','Open the Queen’s Passage','Team challenge'],['force','Force the old mechanism','Support · Very hard (8)']]},
 coup_begins:{title:'The Thirteenth Bell',mission:'Reach Prince Halren before Corvin takes the palace.',text:['A thirteenth bell rings across Greyhaven even though the city has only twelve bell towers.','At the same moment the West Gate opens. Soldiers in unmarked armour march in from hidden camps outside the wall.','The coup is no longer secret. It is a battle for the city.'],choices:[['gate','Go to the West Gate','Team route'],['palace','Go to the palace','Team route'],['arsenal','Secure the royal arsenal first','Support route']]},
 west_gate:{title:'The West Gate',mission:'Stop Corvin’s reinforcements entering Greyhaven.',text:['The outer portcullis is raised and its chain has been jammed. Columns of soldiers are already crossing the ditch.','Civilians are trapped in houses beneath the wall while loyal guards fight from the gatehouse stairs.','Closing the gate will require several jobs at once.'],choices:[['close','Retake and close the West Gate','Team challenge'],['collapse','Collapse the old service bridge instead','Support · Very hard (8)']]},
 palace_siege:{title:'The Palace Under Siege',mission:'Reach Prince Halren before Corvin’s officers do.',text:['Smoke fills the palace court. Guards fight guards beneath festival banners that have caught fire.','Prince Halren is somewhere in the eastern wing with Lady Elira.','The main stairs are held by Corvin’s men.'],choices:[['stairs','Take the main stairs','Team challenge'],['passage','Use the servants’ passages','Support · Hard (7)'],['roof','Cross the roof from the chapel tower','Support · Very hard (8)']]},
 arsenal:{title:'The Royal Arsenal',mission:'Keep the city’s weapons out of Corvin’s hands.',text:['The arsenal master has barricaded the doors from inside. Corvin’s soldiers are battering the hinges while terrified apprentices hold crossbows they barely know how to use.','If the arsenal falls, the loyal districts will not last until nightfall.'],choices:[['defend','Defend the arsenal doors','Team challenge'],['move','Move the weapons through the old stores','Support · Hard (7)'],['destroy','Destroy the powder stores rather than lose them','Solo · Very hard (8)']]},
 final_council:{title:'The Crown Without a King',mission:'Choose how Greyhaven will answer Corvin’s final move.',text:['The King is alive, but too ill to command. Prince Halren now speaks for the Crown.','Calder, Elira, Rook, Lysa and Brother Cael stand around a table that was carried into a cellar because the council chamber is burning.','Corvin has returned to the Gate of Kings with the Black Seal. If he opens it fully, an army can enter Greyhaven from the western frontier in minutes.'],choices:[['unite','Unite the city factions for one final assault','Support · Hard (7)'],['secret','Use the undercity routes to reach the Gate first','Support · Hard (7)'],['rush','Attack the old tower immediately','No roll']]},
 gate_awakens:{title:'The Gate Opens',mission:'Reach the Black Seal before the first enemy formation crosses through.',text:['The Gate of Kings is no longer dark. Through it you can see a field beneath a foreign sky and rows of soldiers waiting beyond the stone ring.','Corvin stands beside the seal socket with only a few loyal officers left.','He looks exhausted rather than triumphant. “If I close it now,” he says, “their invasion comes by road. Thousands die either way.”'],choices:[['reason','Make one final attempt to turn Corvin','Support · Very hard (8)'],['seal','Reach the Black Seal','Team challenge'],['gate','Disrupt the Gate itself','Support · Very hard (8)']]},
 final_crisis:{title:'The City at the Edge',mission:'Choose what must be saved first.',text:['The Gate destabilises. The tower foundations crack. Fighting erupts in the chamber and across the streets above.','Three crises demand attention at once: hold back the soldiers at the ring, evacuate the district above the collapsing tower, and control the Gate before it tears open wider.','Your company can personally guarantee only one. The rest depends on the allies you made.'],choices:[['ring','Hold the Gate chamber','Team challenge'],['people','Save the western district','Team challenge'],['control','Stabilise the Gate mechanism','Team challenge']]},
 black_seal:{title:'The Black Seal',mission:'Decide what Greyhaven does with the Gate of Kings.',text:['By dawn the coup is broken. The Black Seal lies on the stone between Prince Halren, Calder, Rook and your company.','The Gate can be destroyed forever. It can remain under the Crown. Or its keys can be divided so no single ruler, guild or army can ever open it alone.','Greyhaven survived the night. What it becomes next is no longer Corvin’s decision.'],choices:[['destroy','Destroy the Gate of Kings','Final choice'],['crown','Return the Black Seal to the Crown','Final choice'],['divide','Divide control between the Crown, Watch and city guilds','Final choice']]}
};


// --- REMAKE EXPANSION: slower city travel, investigative routes, split teams and multi-stage coup ---
const worldMapConfig={
  title:'Greyhaven — Explored Streets',
  baseSvg:`<path class="map-coast" d="M8,9 L88,9 Q96,10 96,19 L96,62 Q94,68 85,68 L12,68 Q5,66 5,58 L5,17 Q5,11 8,9 Z"/><path class="map-water" d="M3,48 C22,45 33,49 48,45 C63,41 72,47 98,42"/><path class="map-road" d="M9,19 L32,25 L48,31 L65,24 L88,18 M16,58 L33,47 L49,38 L70,49 L88,58 M48,12 L49,62"/><path class="map-ridge" d="M35,20 L68,20 L76,31 L70,52 L33,54 L23,39 Z"/>`,
  terrain:[
    {type:'symbol',x:16,y:21,symbol:'▦'},{type:'symbol',x:24,y:27,symbol:'▦'},{type:'symbol',x:30,y:35,symbol:'▦'},{type:'symbol',x:62,y:30,symbol:'▦'},{type:'symbol',x:78,y:24,symbol:'▦'},
    {type:'symbol',x:51,y:29,symbol:'♜'},{type:'symbol',x:54,y:34,symbol:'♜'},{type:'symbol',x:44,y:44,symbol:'⌂'},{type:'symbol',x:75,y:51,symbol:'⚓'},
    {type:'path',kind:'river',d:'M2,48 C22,45 33,49 48,45 C63,41 72,47 99,42'},
    {type:'path',kind:'road',d:'M12,17 L29,29 L49,35 L70,27 L90,19'},
    {type:'path',kind:'road',d:'M14,58 L33,46 L51,38 L70,49 L90,58'}
  ],
  nodes:[
    {id:'north_gate',title:'North Gate',x:13,y:17,reveal:10,scenes:['arrival','ambush','alley_detour','courier','market_chase','rooftops','watch_house']},
    {id:'crossroads',title:'Crown Square',x:30,y:29,reveal:9,scenes:['city_crossroads']},
    {id:'lantern',title:'Lantern Ward',x:20,y:40,reveal:10,scenes:['lantern_entry','candle_market','rooftop_message','lantern_rope_bridge','dye_court','old_shrine','whisper_house','guild_stair','guild_doors','rook_terms','hidden_ledger','lantern_cellar','guildhall','customs_archive','archive_alarm']},
    {id:'docks',title:'River Docks',x:32,y:55,reveal:10,scenes:['dock_checkpoint','fish_market','barge_row','ropewalk','ropeyard_watch','chandlers_lane','night_ferry','customs_tunnel','warehouse_roof','warehouse_watch','canal_gate','river_docks','warehouse','canal_escape']},
    {id:'palace',title:'Royal Hill',x:51,y:30,reveal:11,scenes:['palace_audience','palace_route_choice','masquerade','garden_meeting','prince_attack','council']},
    {id:'ballroom',title:'Court Wing',x:60,y:23,reveal:8,scenes:['court_gate','mask_gallery','music_room','portrait_corridor','card_room','moon_balcony','chapel_antechamber','balcony_watch','royal_gallery','court_merge']},
    {id:'service',title:'Service Quarter',x:46,y:38,reveal:8,scenes:['service_gate','kitchen_pass','linen_stairs','pantry_crossing','furnace_room','laundry_court','page_passage','servant_archive','hidden_landing','service_merge']},
    {id:'old_city',title:'Old City',x:65,y:42,reveal:10,scenes:['border_news','old_city_choice','old_tower','undercrypt','gate_guard']},
    {id:'tower_route',title:'Bell Quarter',x:76,y:33,reveal:8,scenes:['bell_street','clockmaker_lane','old_belfry','bell_loft','tiled_roofs','observatory','rain_gallery','roof_bridge','tower_archive']},
    {id:'under_route',title:'Undercity',x:66,y:55,reveal:9,scenes:['aqueduct_entry','flood_steps','cistern','drain_lock','drowned_street','salt_vault','whisper_culvert','smuggler_chapel','iron_door']},
    {id:'gate',title:'Gate of Kings',x:81,y:49,reveal:11,scenes:['gate_chamber','betrayal','prison','secret_tunnel','gate_awakens']},
    {id:'coup',title:'Coup Lines',x:48,y:50,reveal:12,scenes:['city_riot','guild_choice','watch_choice','coup_begins','coup_wave','coup_split']},
    {id:'west_gate',title:'West Gate',x:15,y:57,reveal:9,scenes:['west_gate','gate_barricade','gate_tower','wall_walk','chain_room','outer_yard','gate_counterattack']},
    {id:'arsenal',title:'Royal Arsenal',x:57,y:47,reveal:9,scenes:['arsenal','arsenal_yard','powder_room','forge_floor','cart_shed','armoury_gallery','arsenal_hold']},
    {id:'final',title:'Council Hall',x:51,y:34,reveal:10,scenes:['palace_siege','final_council','final_crisis','black_seal']}
  ]
};
Object.assign(scenes,{
  waiting_reunion:{title:'At the Rendezvous',mission:'Wait for the other half of the company.',text:['Your group has reached the agreed meeting place. Bells, shouts and cart wheels echo somewhere beyond the next street.','The other group is still moving through its own route across Greyhaven.'],choices:[]},
  city_crossroads:{title:'Crown Square',mission:'Choose where to investigate the Black Seal lead.',text:['Greyhaven is too large to cross in a single scene. From Crown Square, two useful leads pull in opposite directions.','The Lantern Ward may know who paid for the attack. The River Docks may reveal where the weapons entered the city. Both routes take time.'],choices:[['lantern','Go through the Lantern Ward','Six-scene underworld investigation'],['docks','Go through the River Docks','Six-scene smuggling investigation'],['split','Split the company and follow both leads','Two simultaneous investigations']]},

  lantern_entry:{title:'Lantern Ward Gate',mission:'Enter the ward without attracting the wrong attention.',text:['The Lantern Ward begins where respectable stone streets narrow into alleys hung with coloured lamps.','The district is busy even in daylight, and strangers are noticed immediately.'],choices:[['watch','Read the street before entering','Observation · Awareness or Influence'],['enter','Enter with the crowd','Continue']]},
  candle_market:{title:'The Candle Market',mission:'Find someone who recognises the Black Seal.',text:['Hundreds of candles burn beneath canvas awnings although the sun is still up. Traders sell locks, messages, charms and information beside ordinary bread and cloth.','A black-wax mark appears on one stall post, then vanishes under someone’s sleeve.'],choices:[['sense','Watch who reacts to the mark','Observation · Awareness or Spirit'],['ask','Ask carefully about black wax','Support · Influence or Stealth']]},
  rooftop_message:{title:'Message Across the Roofs',mission:'Follow a hand signal without losing the messenger.',text:['A boy on a roof flashes three fingers toward an alley, then runs. Another figure answers from a chimney two streets away.','The exchange may be guild business — or part of the conspiracy.'],choices:[['follow','Follow the rooftop signal chain','Solo · Agility or Awareness'],['map','Work out where the chain is heading','Observation · Knowledge or Awareness']]},
  guild_doors:{title:'The Door with No Sign',mission:'Reach the guild without starting a street fight.',text:['The signal trail ends at an unmarked cooper’s shop. Two people inside are obviously watching the door while pretending to play cards.','There is no reason they should trust armed strangers.'],choices:[['talk','Ask for Rook by name','Support · Influence or Spirit'],['back','Find the rear entrance','Solo · Stealth or Awareness']]},
  rook_terms:{title:'Rook’s Terms',mission:'Decide how much to reveal to the guildmaster.',text:['Guildmaster Rook receives you in a room above a dye shop, sleeves rolled up and a knife stuck into the table beside his ledger.','He knows about the Black Seal, but wants to know whether the Crown Watch is using you.'],choices:[['truth','Tell Rook enough of the truth to earn cooperation','Support · Influence or Spirit'],['read','Read the room before answering','Observation · Awareness or Knowledge'],['deal','Trade a future favour for information','No roll · gain guild trust at a cost']]},
  hidden_ledger:{title:'The Hidden Ledger',mission:'Trace the payment that bought the gate attackers.',text:['Rook produces a narrow ledger with half the names replaced by symbols. One payment is large enough to buy a company of mercenaries.','The final mark points toward Royal Hill.'],choices:[['decode','Decode the payment trail','Support · Knowledge or Craft'],['copy','Copy the useful entries and leave','Continue to the palace']]},

  dock_checkpoint:{title:'The River Checkpoint',mission:'Reach the working docks without being delayed by soldiers.',text:['The river district begins behind a temporary checkpoint. Wagons queue for inspection while guards compare cargo marks against a hurried list.','The company can wait, talk its way through, or notice how smugglers avoid the line.'],choices:[['sense','Watch how carts bypass the checkpoint','Observation · Awareness or Streetwise'],['talk','Use authority or confidence to pass','Support · Influence or Knowledge'],['wait','Wait with the ordinary traffic','Continue']]},
  fish_market:{title:'Fish Market',mission:'Find the trail of military cargo among ordinary trade.',text:['The smell reaches the party before the river does. Porters carry baskets through shouting traders while carts disappear toward warehouses.','One team of dockers handles crates far too carefully for salted fish.'],choices:[['watch','Watch the careful dockers','Observation · Awareness or Stealth'],['follow','Follow the suspicious crates','Solo · Stealth or Awareness']]},
  barge_row:{title:'Barge Row',mission:'Identify which vessel brought the hidden cargo.',text:['Dozens of barges are tied three deep along the quay. Most carry grain, timber or wine.','One unmarked barge sits too high in the water for the cargo listed on its board.'],choices:[['inspect','Inspect the unmarked barge from the quay','Observation · Craft or Awareness'],['board','Board it while the crew is away','Solo · Stealth or Agility']]},
  ropewalk:{title:'The Ropewalk',mission:'Keep the cargo trail through a crowded industrial lane.',text:['A quarter-mile ropewalk stretches beside the river, full of twisting hemp, shouting workers and carts. The suspicious crates vanish into the confusion.','A side gate bears fresh black wax on the hinge.'],choices:[['trail','Recover the cargo trail','Support · Awareness or Survival'],['wax','Study the wax and gate marks','Observation · Knowledge or Craft']]},
  warehouse_watch:{title:'Warehouse Watch',mission:'Learn who receives the smuggled weapons.',text:['The trail ends at a warehouse that should contain imported stone. The doors remain closed while armed men enter through a side yard.','Waiting may reveal the buyer, but every minute increases the chance of being noticed.'],choices:[['wait','Watch the warehouse from cover','Observation · Stealth or Awareness'],['inside','Slip into the side yard','Support · Stealth or Agility']]},
  canal_gate:{title:'Canal Gate',mission:'Leave the docks with evidence and avoid pursuit.',text:['A dry canal leads back toward Royal Hill beneath several streets. Behind you, someone has realised the warehouse was watched.','The canal gate is chained but old. The street route is open and exposed.'],choices:[['canal','Open the canal gate and use the hidden route','Support · Craft or Strength'],['street','Take the crowded streets uphill','Support · Influence or Awareness']]},

  palace_route_choice:{title:'Inside Royal Hill',mission:'Choose how to move through the palace before the masquerade.',text:['Lady Elira can put the company inside Royal Hill, but not everywhere at once.','The public route passes through the masquerade and noble galleries. The service route runs through kitchens, storerooms and servants’ stairs. Both may expose different parts of the conspiracy.'],choices:[['court','Use the public court route','Six scenes through the masquerade wing'],['service','Use the service passages','Six scenes behind the palace walls'],['split','Split the company inside the palace','Follow both routes at once']]},
  court_gate:{title:'The Court Gate',mission:'Enter the masquerade without drawing attention.',text:['Carriages crowd the court gate beneath hundreds of lanterns. Guests surrender weapons, present invitations and disappear behind masks.','Your forged access is good, but the guards are looking closely tonight.'],choices:[['enter','Present the invitation calmly','Support · Influence or Knowledge'],['watch','Study the guard checks first','Observation · Awareness or Stealth']]},
  mask_gallery:{title:'Gallery of Masks',mission:'Work out which guests are watching the Prince rather than the celebration.',text:['Music and conversation fill a gallery lined with portraits of dead kings. Masks make every glance harder to read.','Several guests keep drifting toward doors that lead away from the ballroom.'],choices:[['sense','Read the crowd for trained behaviour','Observation · Awareness or Spirit'],['follow','Follow one suspicious guest','Solo · Stealth or Awareness']]},
  music_room:{title:'The Music Room',mission:'Decide whether a quiet side room contains useful evidence.',text:['A side music room stands empty except for a half-finished drink and a folded seating plan.','Boot prints cross the polished floor toward a servant door.'],choices:[['search','Search the room without disturbing it','Observation · Awareness or Knowledge'],['door','Follow the boot prints','Continue']]},
  balcony_watch:{title:'Balcony Above the Ballroom',mission:'Watch the masquerade from above.',text:['A narrow balcony overlooks the ballroom. From here the Prince, Lord Marshal Corvin and the senior ministers are all visible at once.','A masked servant passes a note to someone behind a pillar.'],choices:[['note','Track the note through the crowd','Solo · Awareness or Stealth'],['pattern','Watch the room as a whole','Observation · Awareness or Knowledge']]},
  royal_gallery:{title:'The Royal Gallery',mission:'Reach the Prince before the suspicious movement becomes an attack.',text:['The note trail leads toward the Royal Gallery, where the Prince is due to greet foreign guests in minutes.','Two doors can be watched. A third is hidden behind a tapestry.'],choices:[['prepare','Cover the approaches to the gallery','Team · Awareness / Agility / Influence'],['hidden','Inspect the tapestry door','Observation · Awareness or Craft']]},
  court_merge:{title:'The Prince’s Corridor',mission:'Bring the public-route evidence back together.',text:['The court route ends outside the Prince’s private corridor. Footsteps approach from the service wing at the same time.','Whatever the company found, the next danger is close.'],choices:[['arrive','Move toward the Prince','Rejoin the company']]},

  service_gate:{title:'The Kitchen Gate',mission:'Enter the palace through the working entrance.',text:['The service gate is louder than the court gate: carts, cooks, guards, messengers and trays moving in every direction.','Nobody expects heroes here, which can be useful.'],choices:[['blend','Blend in with workers and deliveries','Support · Stealth or Influence'],['observe','Watch which deliveries skip inspection','Observation · Awareness or Knowledge']]},
  kitchen_pass:{title:'The Great Kitchen',mission:'Cross the kitchens without losing the hidden route.',text:['Heat, knives and shouted orders fill a hall large enough to feed a regiment.','A messenger carrying no food slips through a locked side door.'],choices:[['follow','Follow the messenger through the side door','Solo · Stealth or Agility'],['ask','Quietly ask a kitchen worker about the door','Support · Influence or Spirit']]},
  linen_stairs:{title:'The Linen Stairs',mission:'Climb into the private floors without being seen by household guards.',text:['A cramped stair rises between linen closets and heating shafts. Voices above discuss changing the Prince’s guard roster.','The conversation ends before you reach the landing.'],choices:[['listen','Listen before moving higher','Observation · Awareness or Spirit'],['climb','Climb quickly before the speakers leave','Solo · Agility or Stealth']]},
  servant_archive:{title:'Household Archive',mission:'Check whether palace schedules have been altered.',text:['A tiny office contains duty rosters, delivery books and household keys. Several pages have been replaced with nearly perfect copies.','The changes all affect the same hour tonight.'],choices:[['compare','Compare the altered schedules','Support · Knowledge or Craft'],['keys','Inspect the household key board','Observation · Awareness or Craft']]},
  hidden_landing:{title:'The Hidden Landing',mission:'Reach the Prince’s level through a disused stair.',text:['Behind the archive is an old stair sealed during renovations. Dust lies thick except for one recent boot print.','The landing above opens beside the Prince’s private corridor.'],choices:[['open','Open the sealed stair quietly','Support · Craft or Stealth'],['force','Force it before time runs out','Support · Strength or Endurance']]},
  service_merge:{title:'Behind the Prince’s Rooms',mission:'Bring the service-route evidence back together.',text:['The hidden stair emerges behind a panel near the Prince’s corridor. Voices from the public gallery approach from the other side.','The two routes have reached the same danger from different directions.'],choices:[['arrive','Move toward the Prince','Rejoin the company']]},

  old_city_choice:{title:'Roads into Old Greyhaven',mission:'Choose how to reach the old Gate district.',text:['The conspiracy points beneath the oldest part of Greyhaven, where streets have been rebuilt over streets for centuries.','The Bell Quarter offers roofs, towers and civic records. The Undercity offers aqueducts, forgotten chapels and smuggler routes.'],choices:[['tower','Take the Bell Quarter route','Five scenes above the old city'],['under','Take the Undercity route','Five scenes below the old city'],['split','Split the company above and below','Two simultaneous routes']]},
  bell_street:{title:'Bell Street',mission:'Cross the crowded old quarter toward the civic tower.',text:['Bellfounders, clockmakers and metalworkers fill the street. Every shop seems to have something hanging from its ceiling.','A patrol questions anyone heading toward the old tower.'],choices:[['sense','Watch the patrol before approaching','Observation · Awareness or Influence'],['pass','Pass through the checkpoint','Support · Influence or Knowledge']]},
  clockmaker_lane:{title:'Clockmaker Lane',mission:'Find the old survey records without alerting the patrol.',text:['A narrow lane of workshops bends behind Bell Street. One retired clockmaker remembers city tunnels better than most officials.','His shutters close when soldiers pass.'],choices:[['talk','Convince the clockmaker to help','Support · Influence or Spirit'],['look','Inspect the lane for another entrance','Observation · Awareness or Craft']]},
  old_belfry:{title:'The Old Belfry',mission:'Climb high enough to see the pattern of the old city.',text:['The civic tower has been abandoned for decades. Its stairs are dusty but sound.','From the belfry, rooflines reveal a ring of foundations around one buried point.'],choices:[['climb','Reach the highest safe platform','Support · Agility or Endurance'],['map','Map the old foundations from above','Observation · Awareness or Knowledge']]},
  roof_bridge:{title:'Bridge of Roofs',mission:'Cross to the archive block without returning to patrols below.',text:['Timber walkways connect several old roofs where builders once moved materials. Most are rotten.','The archive building is three rooftops away.'],choices:[['cross','Cross and reinforce the walkways','Team · Agility / Craft / Endurance'],['street','Return to street level and risk the patrol','Support · Influence or Stealth']]},
  tower_archive:{title:'Civic Archive Loft',mission:'Find where the old foundations meet beneath the city.',text:['Dusty survey rolls fill the loft. One map shows a sealed chamber directly under the oldest council hall.','A stair marked “Royal Works” descends behind a locked door.'],choices:[['read','Identify the safest descent on the survey map','Observation · Knowledge or Awareness'],['descend','Take the Royal Works stair','Rejoin at the old gate district']]},

  aqueduct_entry:{title:'The Dry Aqueduct',mission:'Enter the undercity without being followed.',text:['A stone channel behind a bathhouse descends below street level. It smells of damp brick and old smoke.','Scratches on the wall show that smugglers still use it.'],choices:[['sense','Read the recent marks before entering','Observation · Awareness or Survival'],['enter','Descend into the aqueduct','Continue']]},
  flood_steps:{title:'Flood Steps',mission:'Cross a section where river water has entered the old channel.',text:['Water covers the next stair to knee height and moves faster in the dark than expected.','An iron handrail continues beneath the surface.'],choices:[['cross','Cross using the old handrail','Support · Agility or Endurance'],['inspect','Check the submerged wall for side passages','Observation · Awareness or Craft']]},
  cistern:{title:'The Great Cistern',mission:'Find the correct tunnel among a dozen arches.',text:['The aqueduct opens into a vast brick cistern. Every sound returns several seconds later.','Fresh lantern soot marks only two arches.'],choices:[['soot','Study the soot and footprints','Observation · Awareness or Survival'],['echo','Use sound to identify the largest passage','Solo · Knowledge or Awareness']]},
  smuggler_chapel:{title:'The Smuggler Chapel',mission:'Pass through a hidden meeting place without causing a fight.',text:['One tunnel enters a tiny underground chapel lit by stolen candles. Four smugglers stop talking when the company appears.','Behind their altar is a royal stone door.'],choices:[['talk','Talk your way past the smugglers','Support · Influence or Spirit'],['token','Use underworld contacts if you have them','No roll · depends on earlier choices']]},
  iron_door:{title:'The Iron Door',mission:'Open the royal works passage beneath the old city.',text:['The stone door behind the chapel is reinforced with black iron and carries a faded crown mark.','Its lock is old, complicated and still functional.'],choices:[['open','Open the royal works lock','Support · Craft or Knowledge'],['force','Force the rusted hinges','Support · Strength or Endurance']]},

  coup_wave:{title:'The Coup Breaks Open',mission:'Survive the first coordinated assault across Greyhaven.',text:['The coup does not begin with one duel. Bells ring from three quarters, soldiers seize crossroads and smoke rises near the palace.','The company is caught between messengers, frightened crowds and armed units moving on prepared orders.'],choices:[['hold','Get through the first wave of chaos','Team · Awareness / Influence / Endurance']]},
  coup_split:{title:'Two Fronts',mission:'Choose where the company can change the battle.',text:['Captain Calder reports two immediate crises. The West Gate is being opened from inside. At the Royal Arsenal, Corvin’s men are arming another company.','Either front could decide the next hour. The company can stay together or split.'],choices:[['gate','Take everyone to the West Gate','Four-scene battle arc'],['arsenal','Take everyone to the Royal Arsenal','Four-scene battle arc'],['split','Split the company between both fronts','Two simultaneous battle arcs']]},
  gate_barricade:{title:'Barricade at West Gate',mission:'Reach the gatehouse through a street battle.',text:['Carts and overturned market stalls block the avenue. Loyal watchmen hold one side while soldiers in royal colours attack from the other.','The gatehouse doors are visible beyond the barricade.'],choices:[['push','Push the loyal line forward','Team · Strength / Influence / Awareness']]},
  gate_tower:{title:'Inside the Gate Tower',mission:'Stop the mechanism before the outer doors open.',text:['The gate tower is full of gears, shouting soldiers and wounded watchmen. Someone has cut the locking rope.','The main windlass is already turning.'],choices:[['stop','Stop the windlass and restore the lock','Team · Craft / Strength / Agility'],['sense','Spot who is actually commanding the tower','Observation · Awareness or Influence']]},
  gate_counterattack:{title:'Counterattack at the Gate',mission:'Hold the gatehouse until loyal reinforcements arrive.',text:['The mechanism stops, but Corvin’s soldiers counterattack from the wall stairs.','The fight surges from landing to landing before the bells change again.'],choices:[['hold','Hold the gatehouse through the counterattack','Team · Strength / Endurance / Spirit']]},
  arsenal_yard:{title:'The Arsenal Yard',mission:'Cross the yard before the next weapon carts leave.',text:['The arsenal yard is full of armour racks, horses and soldiers loading carts. Nobody expects an attack from inside the city.','A bell rings once from the powder building.'],choices:[['cross','Cross the yard under cover','Team · Stealth / Agility / Awareness']]},
  powder_room:{title:'The Powder Room',mission:'Prevent the arsenal from becoming a disaster.',text:['Someone has knocked over lamps inside the powder store. Whether by accident or design, flame crawls toward spilled powder.','Soldiers on both sides hesitate.'],choices:[['save','Contain the fire before fighting anyone','Team · Craft / Endurance / Awareness'],['sense','Work out who started it','Observation · Awareness or Knowledge']]},
  arsenal_hold:{title:'Hold the Arsenal',mission:'Keep weapons out of Corvin’s hands until help arrives.',text:['The fire is contained, but another squad enters through the east doors. The company must hold several entrances at once.','Outside, fighting moves closer to the palace.'],choices:[['hold','Hold the arsenal entrances','Team · Strength / Agility / Influence']]}
});

scenes.watch_house={title:'The Watch House',mission:'Choose which part of Greyhaven to investigate first.',text:['Captain Calder gives the company a small room, a city map and what little authority he can spare.','The Black Seal trail points in two directions: underworld payments in the Lantern Ward and suspicious cargo at the River Docks. Neither is a quick errand across town.'],choices:[['crossroads','Take the investigation into the city','Continue to Crown Square']]};
scenes.palace_audience={title:'Lady Elira’s Audience',mission:'Choose how to move through Royal Hill.',text:['Lady Elira believes the conspiracy reaches inside the palace. Tonight’s masquerade provides cover, but servants’ routes may reveal what the noble rooms hide.','The company can remain together or divide inside Royal Hill.'],choices:[['routes','Choose a palace route','Continue']]};
scenes.border_news={title:'News from the Border',mission:'Reach the oldest part of Greyhaven before the conspiracy moves again.',text:['Reports from the frontier confirm troops have been moved under false orders. The trail now points beneath Old Greyhaven.','Above ground, the Bell Quarter holds civic records and towers. Below, aqueducts and forgotten passages lead toward the same buried district.'],choices:[['routes','Choose a route into Old Greyhaven','Continue']]};
scenes.coup_begins={title:'The Coup Begins',mission:'Survive the first phase of the coup.',text:['Greyhaven erupts in coordinated violence. Gates, armouries and palace corridors are attacked within minutes of one another.','This is not one battle and it cannot be solved with one roll. The company must survive the first wave before choosing where to intervene.'],choices:[['begin','Enter the first wave of the coup','Begin the battle']]};


// --- V3 STORY DEPTH PASS: longer route arcs and slower traversal ---
Object.assign(scenes,{
  lantern_rope_bridge:{title:'The Rope Bridge',mission:'Cross above the Lantern Ward without losing the signal trail.',text:['The messenger leaves the roofline and takes a swaying footbridge stretched between two leaning tenements. Below, the alley is full of dyers, porters and children carrying trays of lamp oil.','The bridge is quicker, but every board announces your weight.'],choices:[['cross','Cross with the messenger','Solo · Agility or Endurance'],['watch','Watch the far roof before committing','Sense Check · Awareness or Stealth']]},
  dye_court:{title:'The Dyers’ Court',mission:'Recover the trail through a courtyard designed to confuse outsiders.',text:['Blue and crimson cloth hangs from every balcony, turning the courtyard into a moving maze. The messenger is gone.','Three doorways show the same black-wax thumbprint, but only one is fresh.'],choices:[['read','Read the marks before choosing a door','Sense Check · Awareness or Knowledge'],['ask','Ask a dyer which stranger passed through','Support · Influence or Spirit']]},
  old_shrine:{title:'The Shrine Behind the Wall',mission:'Decide whether an old side passage is worth the delay.',text:['Behind a loose curtain of drying cloth is a tiny stone shrine built into the original city wall. Someone has recently left fresh candles beneath a defaced royal crest.','A narrow stair descends beside it, away from the obvious guild route.'],choices:[['stairs','Take the hidden stair','Continue · slower but discreet'],['inspect','Inspect the offerings and crest','Sense Check · Knowledge or Awareness']]},
  whisper_house:{title:'The Whisper House',mission:'Pass a room where information is bought by the sentence.',text:['The hidden stair opens into a tea room where nobody raises their voice. Every table is separated by hanging screens.','Lysa warns that questions here cost either coin, favour, or information of equal value.'],choices:[['listen','Listen before speaking','Sense Check · Awareness or Spirit'],['trade','Trade a harmless truth for directions','Support · Influence or Knowledge']]},
  guild_stair:{title:'The Guild Stair',mission:'Reach the unmarked guild entrance without bringing a tail.',text:['A narrow stair climbs behind shuttered workshops. Halfway up, Lysa stops and looks back.','Someone has followed you from the market, but it is not clear whether they belong to the Watch, the guild, or Corvin’s people.'],choices:[['lose','Lose the tail through the workshops','Solo · Stealth or Agility'],['face','Turn and confront them openly','Support · Influence or Spirit']]},

  ropeyard_watch:{title:'The Ropeyard Watch',mission:'Follow the cargo route beyond the public docks.',text:['The Ropewalk ends in a long yard where tarred cable hangs from timber frames. The suspicious crates are gone, but deep wheel ruts continue east.','A watchman pretends not to notice the military boots beneath a dockworker’s coat.'],choices:[['sense','Study the yard before moving','Sense Check · Awareness or Survival'],['trail','Follow the fresh wagon ruts','Solo · Survival or Awareness']]},
  chandlers_lane:{title:'Chandler’s Lane',mission:'Find where the military wagons disappear from the riverside road.',text:['Candle makers and lamp merchants crowd a lane that smells of hot wax and smoke. The wagon tracks vanish where hundreds of carts have crossed them.','A child is selling scraps of broken crate wood stamped with half a royal inventory mark.'],choices:[['buy','Buy the marked wood and ask where it came from','Continue'],['trace','Reconstruct the route from the damaged mark','Sense Check · Knowledge or Craft']]},
  night_ferry:{title:'The Night Ferry',mission:'Cross a side canal without using the guarded bridge.',text:['The shortest route requires a narrow ferry worked by a woman who asks no questions and keeps one hand beneath her cloak.','Across the canal, two men are waiting beside an unlit cart.'],choices:[['cross','Take the ferry quietly','Solo · Stealth or Spirit'],['watch','Wait and watch the men across the water','Sense Check · Awareness or Influence']]},
  customs_tunnel:{title:'The Customs Tunnel',mission:'Use an abandoned inspection tunnel beneath the quay.',text:['A bricked arch beneath the quay has been reopened from the inside. Old hooks and measuring chains still hang from the ceiling.','Fresh mud shows that heavy cargo passed through here tonight.'],choices:[['enter','Follow the cargo tunnel','Continue'],['inspect','Inspect the walls and drag marks','Sense Check · Craft or Awareness']]},
  warehouse_roof:{title:'Above the Warehouse',mission:'Get eyes on the receiver before entering the yard.',text:['The tunnel rises behind a row of warehouses. A stack of timber offers a route onto the roofline.','From above, you may be able to see who receives the next shipment without exposing the company.'],choices:[['climb','Climb for a better view','Solo · Agility or Endurance'],['wait','Stay hidden and watch the yard from below','Sense Check · Stealth or Awareness']]},

  portrait_corridor:{title:'The Portrait Corridor',mission:'Move through the court wing without becoming part of its gossip.',text:['The music room opens onto a corridor lined with kings, queens and disgraced cousins. Masked guests slow down here to whisper where servants cannot easily hear.','Two officers in ceremonial dress are studying the Prince’s route through the palace.'],choices:[['listen','Catch the shape of their conversation','Sense Check · Awareness or Spirit'],['pass','Pass without drawing notice','Solo · Influence or Stealth']]},
  card_room:{title:'The Card Room',mission:'Cross a room where half the court is pretending not to gamble.',text:['Gold changes hands beside crystal glasses. Nobody looks surprised to see armed guests; everyone looks interested.','A nervous noble keeps losing deliberately to a man wearing a plain black ring.'],choices:[['observe','Watch the table for signals','Sense Check · Awareness or Knowledge'],['join','Join one hand to get closer','Support · Influence or Spirit']]},
  moon_balcony:{title:'The Moon Balcony',mission:'Follow the court conspiracy without being seen following it.',text:['A side door leads to an open balcony high above Greyhaven. Voices drift from behind stone columns.','One of the trained guests passes a folded note to a palace servant and points toward the Royal Gallery.'],choices:[['follow','Shadow the servant back inside','Solo · Stealth or Agility'],['read','Read the exchange from a distance','Sense Check · Awareness or Influence']]},
  chapel_antechamber:{title:'The Chapel Antechamber',mission:'Reach the Prince’s route before the conspirators do.',text:['The servant disappears through a candlelit antechamber beside the royal chapel. A priest is arguing with two guards about a locked side door.','The Prince is due to pass this corridor within minutes.'],choices:[['help','Help open the side door','Support · Craft or Strength'],['question','Find out why the door was locked','Sense Check · Influence or Knowledge']]},

  pantry_crossing:{title:'The Lower Pantry',mission:'Cross the service quarter without being challenged.',text:['The kitchen passage opens into a pantry crowded with barrels, hanging herbs and servants carrying trays toward the masquerade.','A household steward is checking names against a slate.'],choices:[['blend','Blend into the servants moving upstairs','Solo · Stealth or Influence'],['read','Read the steward before approaching','Sense Check · Awareness or Spirit']]},
  furnace_room:{title:'The Furnace Room',mission:'Find the warm passage beneath the royal apartments.',text:['Beyond the pantry, furnaces heat water for the upper palace. Pipes and service shafts disappear into the walls.','Someone has chalked three small arrows beside a locked maintenance hatch.'],choices:[['hatch','Open the maintenance hatch','Support · Craft or Knowledge'],['marks','Study the chalk arrows','Sense Check · Awareness or Knowledge']]},
  laundry_court:{title:'The Laundry Court',mission:'Cross an exposed service courtyard unseen.',text:['Sheets snap in the night wind between the laundry buildings. Beyond them, a covered stair rises toward the royal apartments.','Two guards have stopped a kitchen boy and are searching his basket.'],choices:[['cross','Cross behind the hanging linen','Solo · Stealth or Agility'],['intervene','Distract the guards from the boy','Support · Influence or Spirit']]},
  page_passage:{title:'The Pages’ Passage',mission:'Choose whether to trust a young palace page.',text:['A frightened page appears from a narrow door and whispers that soldiers have been using a passage normally reserved for royal messengers.','He can show you the way, but doing so may place him in danger.'],choices:[['trust','Let the page guide you','Continue'],['verify','Check his story before following','Sense Check · Awareness or Spirit']]},

  bell_loft:{title:'The Bell Loft',mission:'Climb through the old belfry while the city bells are being secured.',text:['The belfry is full of ropes thick as wrists and bronze bells blackened by centuries of smoke.','A maintenance ladder leads toward the roof, but one rope has been freshly cut.'],choices:[['climb','Climb toward the roof','Solo · Agility or Endurance'],['rope','Inspect the cut rope','Sense Check · Craft or Awareness']]},
  tiled_roofs:{title:'The Tiled Roofs',mission:'Cross the Bell Quarter above the patrols.',text:['Rain has made the roofs slick. Chimneys and narrow gutters break the route into short dangerous stretches.','Below, Corvin’s men question anyone heading toward the old tower.'],choices:[['cross','Cross the rooftops carefully','Support · Agility or Endurance'],['route','Find the safest line before moving','Sense Check · Awareness or Craft']]},
  observatory:{title:'The Abandoned Observatory',mission:'Use the old tower instruments to understand the city below.',text:['A copper dome stands open to the rain. Inside, cracked lenses still point toward Greyhaven’s walls and river approaches.','One instrument has recently been moved to face the western road.'],choices:[['study','Study the altered instrument','Sense Check · Knowledge or Awareness'],['rest','Take a brief shelter before continuing','Continue']]},
  rain_gallery:{title:'The Rain Gallery',mission:'Reach the tower archive through an exposed stone gallery.',text:['The route continues along a narrow exterior gallery where rain blows sideways through broken arches.','Halfway across, voices echo from the stair ahead.'],choices:[['wait','Wait and identify the voices','Sense Check · Awareness or Spirit'],['move','Move before the patrol reaches the gallery','Solo · Agility or Stealth']]},

  drain_lock:{title:'The Drain Lock',mission:'Open a rusted flood gate beneath the city.',text:['The Great Cistern narrows into a drainage channel blocked by an iron lock gate. The mechanism has not been maintained in decades.','Fresh scratches on the wheel suggest someone forced it recently.'],choices:[['open','Work the old lock gate','Support · Craft or Strength'],['scratches','Read the fresh damage first','Sense Check · Craft or Awareness']]},
  drowned_street:{title:'The Drowned Street',mission:'Cross the remains of a street buried beneath later Greyhaven.',text:['Beyond the drain is an older road, now knee-deep in black water. Doorways stand on either side like empty mouths.','A faint light moves behind one of them, then disappears.'],choices:[['follow','Follow the moving light','Solo · Awareness or Stealth'],['road','Stay on the drowned road','Continue']]},
  salt_vault:{title:'The Salt Vault',mission:'Pass a forgotten storehouse without alerting whoever is inside.',text:['White salt crusts the walls of a vaulted chamber. Old royal barrels lie split open, but recent footprints cross the dust.','Someone has been sleeping here.'],choices:[['search','Search the recent camp','Sense Check · Awareness or Survival'],['pass','Leave it undisturbed','Continue']]},
  whisper_culvert:{title:'The Whisper Culvert',mission:'Find the correct branch in a tunnel where sound lies.',text:['Three culverts meet beneath a low stone arch. Water carries voices from places far away, making direction almost impossible to judge.','The old smuggler marks are partly submerged.'],choices:[['marks','Use the smuggler marks','Sense Check · Knowledge or Awareness'],['air','Follow the strongest current of fresh air','Solo · Survival or Spirit']]},

  wall_walk:{title:'The West Wall Walk',mission:'Keep the gatehouse from being surrounded.',text:['The windlass is stopped, but Corvin’s soldiers are already climbing the inner wall stairs. Loyal Watchmen are spread too thin to cover every approach.','The company has minutes before the gate tower is cut off.'],choices:[['hold','Hold the wall walk','Team challenge'],['route','Find a faster route to the chain room','Sense Check · Awareness or Craft']]},
  chain_room:{title:'The Chain Room',mission:'Secure the gate chains before the next assault.',text:['Great counterweight chains descend through slots in the floor. One has been sabotaged with a wedge that will fail under strain.','The next attempt to open the gate could tear the mechanism apart.'],choices:[['repair','Repair the sabotaged chain','Support · Craft or Strength'],['inspect','Find any other tampering','Sense Check · Craft or Knowledge']]},
  outer_yard:{title:'The Outer Yard',mission:'Survive the lull before the counterattack.',text:['For a few minutes the fighting pulls away from the gatehouse. Wounded soldiers are dragged behind carts and the courtyard fills with smoke.','Then horns sound beyond the wall. Corvin’s second wave is forming.'],choices:[['prepare','Prepare the yard for the next wave','Team challenge'],['listen','Listen for where the horns are coming from','Sense Check · Awareness or Knowledge']]},

  forge_floor:{title:'The Arsenal Forge',mission:'Keep the forge from becoming another weapon against the defenders.',text:['The powder-room fire is contained, but the forge floor is chaos. Hot metal lies abandoned in channels and frightened apprentices are trying to move weapons without orders.','A group of Corvin’s soldiers is testing a side door.'],choices:[['organise','Organise the workers and secure the forge','Support · Influence or Craft'],['sense','Find the safest defensive position','Sense Check · Awareness or Knowledge']]},
  cart_shed:{title:'The Cart Shed',mission:'Move weapons before the side yard is lost.',text:['Heavy ammunition carts stand beneath a timber shed. The main courtyard is exposed, but a narrow service lane may lead behind the attackers.','Nobody knows whether the lane is still open.'],choices:[['lane','Scout the service lane','Solo · Stealth or Awareness'],['move','Move the carts through the main yard','Team challenge']]},
  armoury_gallery:{title:'The Armoury Gallery',mission:'Hold the last interior line until loyal troops arrive.',text:['Rows of old shields and ceremonial armour line a long gallery above the main arsenal doors. Below, attackers are forcing the hinges.','The gallery offers height, cover and one final chance to shape the defence.'],choices:[['defend','Prepare the gallery defence','Team challenge'],['weak','Identify the attackers’ weakest approach','Sense Check · Awareness or Knowledge']]}
});

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
  const map={arrival:'north_gate',ambush:'north_gate',alley_detour:'north_gate',courier:'north_gate',market_chase:'north_gate',rooftops:'north_gate',watch_house:'north_gate',lantern_cellar:'lantern',guildhall:'lantern',customs_archive:'lantern',archive_alarm:'lantern',palace_audience:'palace',river_docks:'river',warehouse:'river',canal_escape:'river',masquerade:'palace',garden_meeting:'palace',prince_attack:'palace',council:'palace',border_news:'palace',old_tower:'old_tower',undercrypt:'old_tower',gate_chamber:'old_tower',gate_guard:'old_tower',betrayal:'old_tower',prison:'old_tower',city_riot:'coup',guild_choice:'coup',watch_choice:'coup',secret_tunnel:'coup',coup_begins:'coup',west_gate:'coup',palace_siege:'coup',arsenal:'coup',final_council:'finale',gate_awakens:'finale',final_crisis:'finale',black_seal:'finale'};
  return map[scene]||'north_gate';
}
function journeyNodes(){
  const cur=sceneJourneyNode(state.scene);
  const nodes=[
    {id:'north_gate',title:'North Gate',icon:'🏰',x:12,y:68},
    {id:'lantern',title:'Lantern Ward',icon:'🗝️',x:30,y:52},
    {id:'river',title:'King’s River',icon:'⚓',x:48,y:70},
    {id:'palace',title:'Royal Hill',icon:'👑',x:56,y:36},
    {id:'old_tower',title:'Old Watchtower',icon:'🗼',x:75,y:50},
    {id:'coup',title:'Greyhaven at War',icon:'🔥',x:84,y:30},
    {id:'finale',title:'Gate of Kings',icon:'◈',x:92,y:18}
  ];
  const currentIndex=Math.max(0,nodes.findIndex(n=>n.id===cur));
  return nodes.map((n,i)=>({...n,discovered:i<=currentIndex,current:i===currentIndex}));
}
function journeySummary(nodeId){
  const flags=state.flags||{},allies=state.allies||{};
  if(nodeId==='north_gate')return 'A royal courier was attacked and the Black Seal vanished into Greyhaven.';
  if(nodeId==='lantern')return allies.guild?'The Lantern Ward became an unlikely source of allies.':'The undercity revealed that someone was using guild routes for a larger plot.';
  if(nodeId==='river')return flags.hidden_army?'Smuggled weapons and unmarked soldiers pointed toward a coup.':'The river ledgers exposed a hidden supply network.';
  if(nodeId==='palace')return flags.corvin_suspect?'Court intrigue narrowed toward the city’s own military command.':'The palace learned the threat was larger than a stolen seal.';
  if(nodeId==='old_tower')return flags.gate_known?'Beneath the old tower, the Gate of Kings changed the meaning of the conspiracy.':'The oldest foundations of Greyhaven hid something built for armies.';
  if(nodeId==='coup')return 'The Festival of Crowns became a battle for Greyhaven.';
  if(nodeId==='finale')return state.phase==='ended'?'The fate of the Gate and the city was decided.':'The Black Seal and the Gate of Kings remain the centre of the final struggle.';
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
  if(['courier','watch_house','watch_choice'].includes(scene))return 'Calder';
  if(['lantern_cellar','guildhall','city_riot','guild_choice'].includes(scene))return 'Lysa';
  if(['palace_audience','masquerade','prince_attack','council','final_council'].includes(scene))return 'Elira';
  if(['council','old_tower','undercrypt','gate_chamber','final_council'].includes(scene))return 'Cael';
  if(['betrayal','gate_awakens','black_seal'].includes(scene))return 'Corvin';
  return null;
}
function npcMomentText(key,scene){
  const lines={
    Calder: scene==='courier'?'“Someone planned this before Aldren reached the gate. That makes it my problem — and apparently yours.”':'“I do not need perfect odds. I need one route that still works.”',
    Lysa: scene==='lantern_cellar'?'“Greyhaven has two maps: the one nobles hang on walls, and the one people actually use.”':'“The guild can leave. The people upstairs cannot.”',
    Elira: scene==='palace_audience'?'“The Black Seal was buried with a dead prince. If it is back, someone has been preparing this for years.”':'“Court secrets are only useful until the city starts burning.”',
    Cael:'“The first kings built roads beneath the roads. Some were meant for messengers. One was meant for armies.”',
    Corvin: scene==='betrayal'?'“I am not trying to destroy the kingdom. I am trying to keep it alive long enough to have one.”':'“If you close the Gate, the war still comes. You are choosing where people die, not whether they do.”'
  };return lines[key]||'';
}
function renderNpcMoment(scene){const box=$('npcMoment'),key=npcForScene(scene);if(!box)return;if(!key){box.classList.add('hidden');box.innerHTML='';return;}const n=npcInfo[key];box.innerHTML=`<img src="${n.img}" alt="${esc(n.name)}"><div><div class="eyebrow">${esc(n.tag)}</div><h3>${esc(n.name)}</h3><p>${esc(npcMomentText(key,scene))}</p></div>`;box.classList.remove('hidden');}
function finaleCallbackCards(){const a=state.allies||{},f=state.flags||{},items=state.items||[],cards=[];
  if(a.guild)cards.push(['🗝️','Because the guild chose Greyhaven','Lantern Ward runners open routes Corvin’s soldiers never knew existed.']);
  if(a.watch||a.calder)cards.push(['🛡️','Because Calder trusted you','Loyal Watch companies hold key crossings across the city.']);
  if(a.elira)cards.push(['👑','Because Elira trusted the company','The Crown’s remaining agents expose false orders before they spread.']);
  if(a.prince)cards.push(['💍','Because Prince Halren survived','Royal authority still means something when the city begins choosing sides.']);
  if(f.corvin_doubt||a.corvin)cards.push(['⚔️','Because Corvin was challenged','Some of the Marshal’s officers hesitate when the final order comes.']);
  if(f.gate_known)cards.push(['◈','Because you understood the Gate','The company knows the old weapon has more than one possible fate.']);
  if(items.includes('ledger'))cards.push(['📚','Because you kept the smugglers’ ledger','Names and payments expose parts of the conspiracy before dawn.']);
  return cards.slice(0,6);
}
function renderFinaleCallbacks(scene){const box=$('callbackPanel');if(!box)return;const finale=['coup_begins','west_gate','palace_siege','arsenal','final_council','gate_awakens','final_crisis','black_seal'];if(!finale.includes(scene)){box.classList.add('hidden');box.innerHTML='';return;}const cards=finaleCallbackCards();if(!cards.length){box.classList.add('hidden');return;}box.innerHTML=`<div class="eyebrow">THE CITY REMEMBERS</div><div class="callback-grid">${cards.map(c=>`<div class="callback-card"><span>${c[0]}</span><div><b>${esc(c[1])}</b><p>${esc(c[2])}</p></div></div>`).join('')}</div>`;box.classList.remove('hidden');}
function renderGame(){
  show('game');const sc=scenes[state.scene];if(!sc)return;
  $('sceneTitle').textContent=sc.title;$('sceneText').innerHTML=sc.text.map(x=>`<p>${x}</p>`).join('');$('mission').textContent=sc.mission;const bridge=$('storyBridge');if(bridge){if(pendingStoryBridge&&pendingStoryBridge.scene===state.scene){bridge.innerHTML=`<p>${esc(pendingStoryBridge.text)}</p>`;bridge.classList.remove('hidden');}else bridge.classList.add('hidden');}
  const art=sceneArt[state.scene]||['🧭',sc.title],image=sceneImages[state.scene]||'assets/black_home.jpg';const [icon,caption]=art;$('sceneArt').className=`scene-art ${state.scene}`;$('sceneArt').style.backgroundImage=`linear-gradient(0deg,rgba(5,10,18,.76),rgba(5,10,18,.08)),url('${image}')`;$('sceneArt').querySelector('.scene-art__icon').textContent=icon;$('sceneArt').querySelector('.scene-art__caption').textContent=caption;renderNpcMoment(state.scene);renderFinaleCallbacks(state.scene);
  $('round').textContent=state.round;$('hope').textContent=state.hope;$('threat').textContent=state.threat;$('supplies').textContent=state.supplies;$('relics').textContent=state.relics;if($('pressureNote')){$('pressureNote').textContent=threatStatusText(state.threat);$('pressureNote').className='pressure-note '+(state.threat>=5?'high':state.threat>=3?'mid':'low');}
  const active=state.players[state.activeIndex],mine=active?.id===me,waiting=(state.groups||[]).find(g=>g.id===state.currentGroupId)?.waitingMerge;$('turnNotice').className='turn-notice'+(mine?' mine':'');$('turnNotice').innerHTML=waiting?`<b>${esc(state.currentGroupName||'Your group')} has reached the rendezvous.</b> The other group is still on its route.`:mine?`<b>Your turn, ${esc(active.name)}.</b> Choose what your hero does next.${state.groups?.length>1?` <span class="group-badge">${esc(state.currentGroupName)}</span>`:''}`:`Waiting for <b>${esc(active?.name||'')}</b>${state.groups?.length>1?` · ${esc((state.groups||[]).find(g=>(g.playerIds||[]).includes(active?.id))?.name||'another group')}`:''}.`;
  $('choices').innerHTML=''; if(!state.pending){sc.choices.forEach(choice=>{const [id,label,note]=choice,available=requirementSatisfied(choice);const b=document.createElement('button');b.className='choice';b.disabled=!mine||!available;b.innerHTML=`<b>${label}</b><span>${note}${available?'':' · NOT CURRENTLY AVAILABLE'}</span>`;b.onclick=()=>socket.emit('chooseAction',{action:id});$('choices').appendChild(b);});}
  renderChallenge(mine);renderHostTools();renderInventory();renderJourney();renderVoiceUi();$('party').innerHTML=state.players.map(p=>playerCard(p,true)).join('');$('log').innerHTML=state.log.slice().reverse().map(x=>`<div class="log-item">• ${esc(x)}</div>`).join('');renderLastRoll();
}

function renderJournal(){const j=state?.journal||{people:{},clues:[],decisions:[],conclusions:[]},body=$('journalBody');if(!body)return;const people=Object.values(j.people||{}),clues=j.clues||[],decisions=j.decisions||[],conclusions=j.conclusions||[];body.innerHTML=`<div class="journal-grid"><section><div class="eyebrow">PEOPLE</div>${people.length?people.map(p=>`<div class="journal-entry"><b>${esc(p.name||p.id)}</b>${p.status?`<span class="journal-status">${esc(p.status)}</span>`:''}<p>${esc(p.note||'You have crossed paths.')}</p></div>`).join(''):'<p class="small muted">Important relationships will appear here.</p>'}</section><section><div class="eyebrow">CLUES & CONCLUSIONS</div>${conclusions.map(x=>`<div class="journal-entry conclusion"><b>✦ ${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join('')}${clues.length?clues.map(x=>`<div class="journal-entry"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join(''):'<p class="small muted">Useful information will be recorded here.</p>'}</section><section><div class="eyebrow">DECISIONS</div>${decisions.length?decisions.map(x=>`<div class="journal-entry"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join(''):'<p class="small muted">Major choices will be remembered here.</p>'}</section></div>`;}
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
  const saved=readJson('blackSealCampaign');if($('saveStatus')&&saved?.updatedAt)$('saveStatus').textContent=`✓ Auto-saved · ${new Date(saved.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  $('copyCampaignBtn').onclick=()=>{socket.emit('requestCampaignSave');setTimeout(()=>copyText(readJson('blackSealCampaign')?.saveToken,$('copyCampaignBtn')),180);};
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
  const supportEligible=groupHeroes.filter(x=>x.id!==me&&x.supportReady);const support=p.type==='support',meHero=player();
  const helperOptions=supportEligible.map(x=>`<option value="${x.id}">${esc(x.name)} — ${x.cls} · ${esc(relevantSkillSummary(x,p.supportSkills))}</option>`).join('');
  if(p.lowStakes){
    const allowed=p.allowedSkills||[p.recommended];
    const successText=p.outcomeText?`You discover that ${esc(p.outcomeText)}.`:'You notice something useful that may change the route ahead.';
    box.innerHTML=`<div class="challenge-box sense-box"><span class="mode">SENSE CHECK</span><h3>${esc(p.desc)}</h3><p class="sense-intro">Look carefully for anything useful before moving on.</p><div class="sense-summary"><div><span class="small muted">TARGET</span><strong>${p.effectiveDifficulty||p.difficulty}</strong></div><div><span class="small muted">USE</span><strong>${allowed.map(sk=>`${esc(sk)} — ${Number(meHero?.stats?.[sk]||0)}`).join(' or ')}</strong></div></div><div class="sense-outcomes"><div class="sense-good"><b>If you succeed</b><span>${successText}</span></div><div class="sense-neutral"><b>If you miss</b><span>You do not notice anything useful and the journey continues.</span></div></div><label>Choose skill<select id="mainSkill">${skillOptions(p.recommended,p.allowedSkills,meHero)}</select></label><button id="mainRoll" class="btn btn-primary full">🎲 Roll the Dice</button></div>`;
  } else {
    box.innerHTML=`<div class="challenge-box"><span class="mode">${support?'SUPPORT AVAILABLE':'SOLO CHALLENGE'}</span><h3>${esc(p.desc)}</h3>${p.reason?`<div class="challenge-explain">${esc(p.reason)}</div>`:''}<p><b>Target:</b> ${p.effectiveDifficulty||p.difficulty} (${difficultyName(p.effectiveDifficulty||p.difficulty)}). <b>Use:</b> ${(p.allowedSkills||[p.recommended]).join(' or ')}.${support?` A helper may Support; their roll needs <b>${p.supportTarget||6}</b>+ to add +2.`:''}${p.knowledgeNote?` <span class="knowledge-help">📖 ${esc(p.knowledgeNote)}</span>`:''}${(p.effectiveDifficulty||p.difficulty)>p.difficulty?' <span class="threat-warning">Threat has made this challenge harder.</span>':''}</p><div class="form-grid"><label>Your skill<select id="mainSkill">${skillOptions(p.recommended,p.allowedSkills,meHero)}</select></label>${support?`<label>Optional helper<select id="supportPlayer"><option value="">Roll alone</option>${helperOptions}</select></label>`:''}</div>${support?`<div id="supportSkillWrap" class="hidden"><label>Helper's skill<select id="supportSkill"></select></label><p id="supportSkillHint" class="small muted">Choose a helper to see their relevant skill ratings.</p></div>`:''}<button id="mainRoll" class="btn btn-primary full">🎲 Roll the Dice</button></div>`;
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
  document.querySelector('#ended .eyebrow').textContent='THE BLACK SEAL — COMPLETE';
  document.querySelector('#ended h1').textContent='Dawn Over Greyhaven';
  $('endingArt').style.backgroundImage="linear-gradient(0deg,rgba(5,10,18,.72),rgba(5,10,18,.08)),url('assets/white_city_finale_bespoke.jpg')";
  const choices={
    destroy:'The Black Seal is broken and the Gate of Kings is brought down with it. No ruler will ever send an army through the old road again. Greyhaven loses a weapon, an escape route and a temptation all at once.',
    crown:'The Black Seal returns to Prince Halren under new law and public record. The Gate remains a royal instrument, but never again a secret one. The Crown keeps its power — and accepts witnesses to it.',
    divide:'The company refuses to let any one faction inherit Corvin’s mistake. The Gate’s control is divided between Crown, Watch and city guilds. It can be opened again only when rivals agree that the need is greater than their mistrust.'
  };
  const allyKeys=Object.keys(state.allies||{}).filter(k=>state.allies[k]);
  const pretty={calder:'Captain Calder',watch:'the loyal Crown Watch',guild:'the Lantern Ward guilds',lysa:'Lysa Quick',elira:'Lady Elira Vane',prince:'Prince Halren',cael:'Brother Cael',arsenal:'the royal arsenal defenders',gate_guard:'the loyal West Gate guard',united_city:'the united city factions',corvin:'Corvin’s wavering officers'};
  const allies=allyKeys.map(k=>pretty[k]||k.replaceAll('_',' '));
  const callbacks=[];
  if(state.flags?.hidden_army)callbacks.push('The smuggling network was exposed before it could disappear back into the city.');
  if(state.flags?.corvin_suspect)callbacks.push('The company recognised the shape of the coup before Corvin openly moved.');
  if(state.flags?.west_gate_closed)callbacks.push('The West Gate was closed before the hidden army could fully enter Greyhaven.');
  if(state.flags?.people_saved)callbacks.push('Families from the western district survived because the company chose them over the stronger tactical position.');
  if(state.flags?.gate_stable)callbacks.push('The Gate survived the crisis intact and can be governed rather than merely feared.');
  if(state.flags?.gate_damaged)callbacks.push('The Gate was badly damaged in the final struggle. Whatever its future, it will never again be easy to use.');
  $('endingText').innerHTML=`
    <p class="finale-lead">${choices[state.finalChoice]||choices.divide}</p>
    ${allies.length?`<p><b>When Greyhaven fractured, these allies still answered:</b> ${allies.map(esc).join(', ')}.</p>`:'<p>The company reached the end with few institutions behind them — and still changed the city.</p>'}
    ${callbacks.length?`<div class="ending-callbacks"><b>What your journey changed</b><ul>${callbacks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
    <h2>The Company at Journey’s End</h2>
    ${state.players.map(p=>`<div class="epilogue"><b>${classInfo[p.cls]?.icon||'✦'} ${esc(p.name)} — ${p.cls}</b><p>${heroEpilogue(p)}</p><span>Highest skill: ${strongestSkill(p)} · Wounds ${p.wounds}/3 · Unspent Skill Points ${p.skillPoints||0}</span></div>`).join('')}
    <p class="finale-close"><b>You entered Greyhaven escorting a courier.</b><br>By dawn, the city knew your names for entirely different reasons.</p>`;
  document.querySelector('.next-session').innerHTML='<div class="eyebrow">THE END</div><h2>Your version of Greyhaven is now part of the campaign record.</h2><p>Different alliances, failures and discoveries can produce a very different road through the same conspiracy.</p>';
  playSound('success');
}
function strongestSkill(p){const entries=Object.entries(p.stats||{});entries.sort((a,b)=>b[1]-a[1]);return `${entries[0]?.[0]||'—'} ${entries[0]?.[1]||0}`;}
function heroEpilogue(p){
  const best=Object.entries(p.stats||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  const byClass={
    Knight:`${p.name} became known in Greyhaven as the person who could hold a line without losing sight of the people behind it. Later Watch captains still told recruits about the company’s ${best.toLowerCase()}-minded Knight.`,
    Ranger:`${p.name} mapped the hidden ways around Greyhaven and the western roads beyond it. During the war that followed, more than one patrol survived because a route carried ${p.name}’s mark.`,
    Thief:`${p.name} left the crisis with access to doors in both palace and undercity. The city never quite agreed whether that made them dangerous, useful, or both.`,
    Mage:`${p.name} became one of the few living people who understood the Gate of Kings well enough to fear it intelligently. Their notes were sealed, copied, and argued over for years.`,
    Monk:`${p.name} spent the months after the coup moving between Watch posts, guild halls and noble houses that had nearly become enemies. Greyhaven’s peace was built in rooms like those.`,
    Engineer:`${p.name} knew exactly which pieces of the old city should be repaired and which should remain broken. The Gate was not the only machine Greyhaven inherited from its past.`
  };
  return byClass[p.cls]||`${p.name} carried the story of Greyhaven into the years that followed.`;
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
socket.on('voiceSpeaking',x=>{voiceSpeaking.set(x.playerId,!!x.speaking);renderVoiceUi();});
socket.on('voiceMuted',x=>{voiceSpeaking.set(x.playerId,false);renderVoiceUi();});
function setLocalSpeaking(v){v=!!v&&!voiceMuted;if(localSpeaking===v)return;localSpeaking=v;if(voiceJoined)socket.emit('voiceSpeaking',{speaking:v});renderVoiceUi();}
function startLocalSpeakingDetector(){
  stopLocalSpeakingDetector();if(!localVoiceStream)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=playSound.ctx||(playSound.ctx=new AC());const src=ctx.createMediaStreamSource(localVoiceStream),an=ctx.createAnalyser();an.fftSize=512;src.connect(an);const data=new Uint8Array(an.fftSize);let quiet=0;const tick=()=>{if(!voiceJoined||!localVoiceStream)return;an.getByteTimeDomainData(data);let sum=0;for(const x of data){const d=(x-128)/128;sum+=d*d;}const rms=Math.sqrt(sum/data.length);if(rms>.035&&!voiceMuted){quiet=0;setLocalSpeaking(true);}else if(++quiet>6)setLocalSpeaking(false);voiceAnalyserFrame=requestAnimationFrame(tick);};tick();}catch{}
}
function stopLocalSpeakingDetector(){if(voiceAnalyserFrame)cancelAnimationFrame(voiceAnalyserFrame);voiceAnalyserFrame=null;}

function ambientCategory(scene){
  if(['arrival','ambush','courier','watch_house','city_crossroads','waiting_reunion','market_chase'].includes(scene))return 'city';
  if(['rooftops','lantern_cellar','guildhall','customs_archive','archive_alarm','lantern_entry','candle_market','rooftop_message','guild_doors','rook_terms','hidden_ledger','lantern_rope_bridge','dye_court','old_shrine','whisper_house','guild_stair','bell_street','clockmaker_lane','tiled_roofs'].includes(scene))return 'streets';
  if(['river_docks','warehouse','canal_escape','dock_checkpoint','fish_market','barge_row','ropewalk','warehouse_watch','canal_gate','ropeyard_watch','chandlers_lane','night_ferry','customs_tunnel','warehouse_roof','drowned_street'].includes(scene))return 'shore';
  if(['palace_audience','masquerade','garden_meeting','prince_attack','council','palace_route_choice','court_gate','mask_gallery','music_room','balcony_watch','royal_gallery','court_merge','portrait_corridor','card_room','moon_balcony','chapel_antechamber','service_gate','kitchen_pass','linen_stairs','servant_archive','hidden_landing','service_merge','pantry_crossing','laundry_court','page_passage'].includes(scene))return 'hall';
  if(['old_tower','undercrypt','gate_chamber','gate_guard','betrayal','prison','secret_tunnel','old_city_choice','old_belfry','tower_archive','bell_loft','observatory','rain_gallery','aqueduct_entry','flood_steps','cistern','smuggler_chapel','iron_door','drain_lock','salt_vault','whisper_culvert','furnace_room'].includes(scene))return 'cave';
  if(['city_riot','guild_choice','watch_choice','coup_begins','coup_wave','coup_split','west_gate','gate_barricade','gate_tower','gate_counterattack','wall_walk','chain_room','outer_yard','arsenal','arsenal_yard','powder_room','arsenal_hold','forge_floor','cart_shed','armoury_gallery','palace_siege','final_council','gate_awakens','final_crisis','black_seal'].includes(scene))return 'battle';
  return 'streets';
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
  const overlay=$('sceneReveal'); if(!overlay)return;
  overlay.style.backgroundImage=`linear-gradient(rgba(3,8,15,.2),rgba(3,8,15,.82)),url('${sceneImages[scene]||'assets/black_home.jpg'}')`;
  $('revealKicker').textContent=scene==='troll'?'RANDOM EVENT':'THE BLACK SEAL';
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
  if(newS.phase==='playing'&&ambientOn)updateAmbience(newS.scene,oldS.scene!==newS.scene);
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
  if(result==='SETBACK') return payload.desc?`${hero} attempted to ${esc(payload.desc)}, but the plan did not work. The consequences now have to be faced.`:`${hero} tried, but the plan did not work.`;
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
const destinationPhrases={arrival:'Greyhaven at festival dusk',ambush:'the North Gate under sudden attack',courier:'the sealed watch house at the gate',market_chase:'the crowded festival market',rooftops:'the red roofs above Lantern Ward',watch_house:'the Crown Watch post',lantern_cellar:'the hidden cellars of the Lantern Ward',guildhall:'the guild beneath the city',customs_archive:'the customs ledgers by the river',river_docks:'the foggy King’s River docks',warehouse:'the warehouse with no owner',masquerade:'Vane House at the masquerade',prince_attack:'the palace halls under attack',council:'the closed council beneath the chapel',old_tower:'the abandoned western watchtower',undercrypt:'the roads beneath the old city',gate_chamber:'the chamber of the Gate of Kings',betrayal:'the heart of the conspiracy',city_riot:'the streets of Greyhaven in revolt',west_gate:'the embattled West Gate',palace_siege:'the palace under siege',arsenal:'the royal arsenal in crisis',final_council:'the last council before dawn',gate_awakens:'the waking Gate of Kings',final_crisis:'the final struggle across Greyhaven',black_seal:'the last decision over the Black Seal'};
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

