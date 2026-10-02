import { startAnonymousSession, signOut } from './auth/auth.js';
import { getStudent, createStudentProfile } from './database/student.js';
import { loadProgress, saveMissionProgress, saveActivityResult, saveFinalResult } from './database/progress.js';
import { MISSIONS, DEVICES, PEOPLE, SOFTWARE } from './game/missions.js';
import { shuffle } from './game/interactions.js';
import { scoreFrom } from './game/scoring.js';

const state={user:null,student:null,progress:[],currentMission:null,currentScore:0,sound:true,offline:false};
const $=id=>document.getElementById(id);
const views=['loadingView','welcomeView','profileView','mapView','missionView','resultView'];
const FUNCTION_LABELS={input:'INPUT',process:'PROCESS',output:'OUTPUT',storage:'STORAGE'};

function show(id){views.forEach(v=>$(v).classList.toggle('hidden',v!==id));window.scrollTo({top:0,behavior:'instant'});}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function imageHtml(item,cls='asset-image'){return `<img class="${cls} asset-lazy" data-asset-src="${item.image}" alt="${esc(item.name)}" decoding="async">`;}

let assetObserver=null;
let assetMutationObserver=null;
function loadAssetImage(img){
  if(!img||img.dataset.loaded==='true')return;
  const src=img.dataset.assetSrc;
  if(!src)return;
  img.dataset.loaded='true';
  img.src=src;
  img.addEventListener('load',()=>img.classList.add('asset-loaded'),{once:true});
  img.addEventListener('error',()=>{img.classList.add('asset-error');img.alt=`Gambar ${img.alt||'objek'} tidak ditemukan`;},{once:true});
}
function observeAssets(root=document){
  const imgs=root.querySelectorAll?.('[data-asset-src]')||[];
  imgs.forEach(img=>assetObserver?.observe(img));
}
function initAssetLoader(){
  if('IntersectionObserver' in window){
    assetObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          loadAssetImage(entry.target);
          assetObserver.unobserve(entry.target);
        }
      });
    },{root:null,rootMargin:'240px 0px',threshold:0.01});
  }
  assetMutationObserver=new MutationObserver(mutations=>{
    mutations.forEach(m=>m.addedNodes.forEach(node=>{
      if(node.nodeType===1){
        if(node.matches?.('[data-asset-src]')){
          assetObserver?assetObserver.observe(node):loadAssetImage(node);
        }
        observeAssets(node);
      }
    }));
  });
  assetMutationObserver.observe(document.body,{childList:true,subtree:true});
  observeAssets(document);
}

function allItems(){return [...DEVICES,...PEOPLE,...SOFTWARE];}
function findItem(id){return allItems().find(x=>x.id===id);}

function ensureModal(){
  if($('objectModal')) return;
  document.body.insertAdjacentHTML('beforeend',`<div id="objectModal" class="object-modal hidden" role="dialog" aria-modal="true" aria-labelledby="objectModalTitle"><div class="modal-backdrop" data-close-modal></div><div class="modal-card"><button class="modal-close" id="modalClose" type="button" aria-label="Tutup">×</button><div id="modalBody"></div></div></div>`);
  $('modalClose').onclick=closeModal;
  document.querySelector('[data-close-modal]').onclick=closeModal;
}
function closeModal(){if($('objectModal'))$('objectModal').classList.add('hidden');}
function showObjectModal(item,question,options,onChoose){
  ensureModal();
  const opts=options.map(o=>`<button class="modal-option" data-value="${o.value}"><span>${o.icon||''}</span><b>${o.label}</b></button>`).join('');
  $('modalBody').innerHTML=`<div class="modal-image">${imageHtml(item)}</div><span class="eyebrow">AMATI OBJEK</span><h2 id="objectModalTitle">${esc(item.name)}</h2><p>${esc(question)}</p><div class="modal-options">${opts}</div><p class="modal-hint">Tap salah satu pilihan. Di PC, objek juga bisa diseret ke zona.</p>`;
  $('objectModal').classList.remove('hidden');
  document.querySelectorAll('.modal-option').forEach(b=>b.onclick=()=>{const value=b.dataset.value;closeModal();onChoose(value);});
}

async function boot(){
  try{
    if(!window.supabaseClient||window.supabaseClient.supabaseUrl?.includes('MASUKKAN')) throw new Error('Konfigurasi Supabase belum diisi.');
    state.user=await startAnonymousSession();state.student=await getStudent(state.user.id);
    if(state.student){state.progress=await loadProgress(state.user.id);setStudentBadge();renderMap();show('mapView');}
    else show('welcomeView');
  }catch(e){console.error(e);toast(e.message||'Koneksi Supabase belum siap.');show('welcomeView');}
}
function setStudentBadge(){if(!state.student)return;$('studentBadge').textContent=`${state.student.nama} • ${state.student.kelas}`;$('studentBadge').classList.remove('hidden');$('logoutBtn').classList.remove('hidden');}
$('startBtn').onclick=()=>show('profileView');
$('profileStartBtn').onclick=async()=>{const nama=$('nameInput').value.trim(),kelas=$('classInput').value;if(nama.length<2){toast('Masukkan nama terlebih dahulu.');return;}if(!kelas){toast('Pilih kelas terlebih dahulu.');return;}try{$('profileStartBtn').disabled=true;$('profileStartBtn').textContent='Menyiapkan...';state.user=await startAnonymousSession();state.student=await createStudentProfile(state.user.id,nama,kelas);state.progress=await loadProgress(state.user.id);setStudentBadge();renderMap();show('mapView');toast('Profil tersimpan. Selamat belajar!');}catch(e){console.error(e);toast(e.message||'Gagal menyimpan profil.');}finally{$('profileStartBtn').disabled=false;$('profileStartBtn').textContent='Masuk ke Perjalanan →';}};
$('backMapBtn').onclick=()=>{renderMap();show('mapView')};$('resultMapBtn').onclick=()=>{renderMap();show('mapView')};
$('logoutBtn').onclick=async()=>{if(!confirm('Ganti pengguna? Session anonim saat ini akan ditutup.'))return;await signOut();location.reload()};
$('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'🔊':'🔇'};

function isDone(id){return state.progress.some(p=>p.mission_id===id&&p.completed)}
function canOpen(index){return index===0||isDone(MISSIONS[index-1].id)}
function renderMap(){
  $('welcomeName').textContent=`Halo, ${state.student?.nama||'Pembelajar'}!`;
  const completed=MISSIONS.filter(m=>m.id!=='final'&&isDone(m.id)).length;const finalDone=isDone('final');const pct=Math.round(((completed+(finalDone?1:0))/5)*100);$('progressPercent').textContent=`${pct}%`;
  const ring=$('progressPercent').parentElement;ring.style.background=`conic-gradient(var(--blue) ${pct*3.6}deg,#dfeaf5 0deg)`;
  $('missionMap').innerHTML=MISSIONS.map((m,i)=>{const done=isDone(m.id),open=canOpen(i),cls=done?'done':open?'active':'locked';return `<article class="mission-card ${cls}" data-mission="${m.id}" ${open?'':'aria-disabled="true"'}><div class="mission-num">${done?'✓':m.number}</div><span class="mission-state">${done?'✓':open?'●':'🔒'}</span><h3>${esc(m.title)}</h3><p>${esc(m.short)}</p></article>`}).join('');
  document.querySelectorAll('.mission-card:not(.locked)').forEach(c=>c.onclick=()=>openMission(c.dataset.mission));
}
function setConcept(text){$('conceptBar').textContent=text}
function openMission(id){const m=MISSIONS.find(x=>x.id===id);if(!m)return;const idx=MISSIONS.indexOf(m);if(!canOpen(idx))return;state.currentMission=m;state.currentScore=0;$('missionScore').textContent='0';$('missionNumber').textContent=`MISI ${m.number}`;$('missionTitle').textContent=m.title;setConcept(m.concept);show('missionView');renderMission(m)}

async function finishMission(id,score,activityId,correct,total){
  state.currentScore=score;$('missionScore').textContent=score;
  try{
    const row=await saveMissionProgress(state.user.id,id,score,true);const old=state.progress.find(p=>p.mission_id===id);if(old)Object.assign(old,row);else state.progress.push(row);
    if(activityId) await saveActivityResult(state.user.id,id,activityId,score,correct,total);
    return true;
  }catch(e){console.error(e);toast('Skor belum tersimpan. Periksa koneksi lalu coba lagi.');return false;}
}
function feedback(el,text,good=false){el.className=`feedback ${good?'good':'warn'}`;el.innerHTML=text}
function markCard(card,good){card.classList.remove('correct','wrong','selected');card.classList.add(good?'correct':'wrong');}
function makeDropZone(id,label,icon){return `<div class="zone drop-zone" data-zone="${id}"><h4>${icon} ${label}</h4><div class="drop-list" id="zone-${id}"></div><small>Seret ke sini atau tap kartu</small></div>`}
function renderImageCard(item,group=''){return `<button class="device-card image-card" data-device="${item.id}" data-group="${group}" draggable="true" type="button"><span class="asset-frame">${imageHtml(item)}</span><b>${esc(item.name)}</b></button>`}

function bindCategorize(cardsSelector,zones,items,onPlaced,question){
  const placed=new Map();
  const place=(id,target,sourceCard)=>{
    const item=items.find(x=>x.id===id);if(!item)return;
    const correct=item[question.correctKey];
    if(target!==correct){markCard(sourceCard||document.querySelector(`[data-device="${id}"]`),false);feedback($(question.feedbackId),`Belum tepat. ${esc(item.name)} lebih cocok sebagai <b>${esc(question.labels[correct]||correct)}</b>. Coba lagi.`,false);setTimeout(()=>sourceCard?.classList.remove('wrong'),500);return;}
    placed.set(id,target);const card=sourceCard||document.querySelector(`[data-device="${id}"]`);if(card)markCard(card,true);
    $(question.feedbackId).className='feedback good';$(question.feedbackId).innerHTML=`✓ ${esc(item.name)} sudah ditempatkan pada ${esc(question.labels[target])}.`;
    renderPlaced();onPlaced?.(placed);
  };
  function renderPlaced(){Object.keys(zones).forEach(zone=>{$(`zone-${zone}`).innerHTML=[...placed.entries()].filter(([id,t])=>t===zone).map(([id])=>{const x=items.find(i=>i.id===id);return `<button class="mini-asset" type="button" data-mini="${id}">${imageHtml(x,'mini-image')}<span>${esc(x.name)}</span></button>`}).join('');});const total=placed.size;question.countEl.textContent=`${total}/${items.length}`;}
  document.querySelectorAll(cardsSelector).forEach(card=>{
    const id=card.dataset.device;const item=items.find(x=>x.id===id);
    card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',id);card.classList.add('dragging')});card.addEventListener('dragend',()=>card.classList.remove('dragging'));
    card.addEventListener('click',()=>{if(placed.has(id))return;showObjectModal(item,question.modalQuestion,Object.entries(zones).map(([value,label])=>({value,label,icon:'↳'})),value=>place(id,value,card));});
  });
  Object.keys(zones).forEach(zone=>{const el=document.querySelector(`[data-zone="${zone}"]`);el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('drag-over')});el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('drag-over');const id=e.dataTransfer.getData('text/plain');place(id,zone,document.querySelector(`[data-device="${id}"]`))});});
  renderPlaced();
  return placed;
}

function renderMission(m){if(m.id==='misi1')renderMission1();if(m.id==='misi2')renderMission2();if(m.id==='misi3')renderMission3();if(m.id==='misi4')renderMission4();if(m.id==='final')renderFinal()}

function renderMission1(){
  const items=shuffle([DEVICES.find(x=>x.id==='keyboard'),DEVICES.find(x=>x.id==='monitor'),SOFTWARE.find(x=>x.id==='chrome'),SOFTWARE.find(x=>x.id==='word'),PEOPLE.find(x=>x.id==='brainware'),PEOPLE.find(x=>x.id==='user1')]);
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • AMATI & KELOMPOKKAN</span><h2>Siapa yang menjadi bagian dari sistem?</h2><p>Seret gambar ke kategori yang tepat. Di HP, cukup tap gambar lalu pilih kategorinya.</p><div class="task-counter" id="m1count">0/6 benar</div><div class="cards-grid" id="m1cards">${items.map(x=>renderImageCard(x,'m1')).join('')}</div><div class="zones three-zones">${makeDropZone('hardware','Hardware','🧩')}${makeDropZone('software','Software','⚙️')}${makeDropZone('brainware','Brainware','👤')}</div><div id="m1feedback" class="feedback">Mulai dengan mengamati bentuk dan fungsi objek.</div></div>
  <div class="activity-card"><span class="objective">TEMUKAN POLA</span><h2>Bagaimana ketiganya bekerja?</h2><div class="concept-model"><div class="model-node"><img src="${PEOPLE[0].image}" alt="Brainware"><b>Brainware</b><small>menggunakan</small></div><span>→</span><div class="model-node"><img src="${SOFTWARE[0].image}" alt="Software"><b>Software</b><small>mengatur</small></div><span>→</span><div class="model-node"><img src="${DEVICES.find(x=>x.id==='cpu').image}" alt="Hardware"><b>Hardware</b><small>menjalankan</small></div></div><div id="m1summary" class="feedback">Selesaikan pengelompokan untuk melihat kesimpulannya.</div><button id="m1finish" class="primary-btn full" disabled>Selesaikan Misi</button></div>`;
  const countEl=$('m1count');const placed=bindCategorize('#m1cards .device-card',{hardware:'Hardware',software:'Software',brainware:'Brainware'},items,null,{correctKey:'type',labels:{hardware:'Hardware',software:'Software',brainware:'Brainware'},feedbackId:'m1feedback',countEl,modalQuestion:'Menurutmu gambar ini termasuk unsur apa?',countEl});
  const check=setInterval(()=>{if(placed.size===items.length){clearInterval(check);feedback($('m1summary'),'✓ Hardware menyediakan perangkat, software memberi instruksi, dan brainware menggunakan atau mengelola sistem. Ketiganya saling berhubungan.',true);$('m1finish').disabled=false;}},150);
  $('m1finish').onclick=async()=>{if(await finishMission('misi1',100,'unsur_sistem',6,6)){toast('Misi 1 selesai!');setTimeout(()=>{renderMap();show('mapView')},700)}};
}

function renderMission2(){
  const items=shuffle(['keyboard','mouse','mic','barcode','cpu','graphic-card','monitor','speaker','ssd','flashdisk'].map(id=>DEVICES.find(x=>x.id===id)));
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • KLASIFIKASI</span><h2>Tempatkan setiap perangkat</h2><p>Gunakan fungsi perangkat sebagai petunjuk. Seret atau tap gambar untuk memilih tujuan.</p><div class="task-counter" id="m2count">0/10 benar</div><div class="cards-grid" id="m2cards">${items.map(x=>renderImageCard(x,'m2')).join('')}</div><div class="zones four-zones">${makeDropZone('input','Input','⌨️')}${makeDropZone('process','Process','🧠')}${makeDropZone('output','Output','🖥️')}${makeDropZone('storage','Storage','💾')}</div><div id="m2feedback" class="feedback">Perhatikan apa yang dilakukan perangkat terhadap data.</div></div>
  <div class="activity-card"><span class="objective">MINI CHALLENGE</span><h2>Perangkat mana yang kamu butuhkan?</h2><p>Pilih gambar yang paling tepat untuk setiap kebutuhan.</p><div id="m2scenarios" class="scenario-list"></div><div id="m2scenarioFeedback" class="feedback">Selesaikan tiga situasi.</div><button id="m2finish" class="primary-btn full" disabled>Selesaikan Misi</button></div>`;
  const countEl=$('m2count');const placed=bindCategorize('#m2cards .device-card',{input:'Input',process:'Process',output:'Output',storage:'Storage'},items,null,{correctKey:'function',labels:{input:'Input',process:'Process',output:'Output',storage:'Storage'},feedbackId:'m2feedback',countEl,modalQuestion:'Fungsi mana yang paling sesuai untuk perangkat ini?'});
  const scenarios=[{q:'Kamu ingin memasukkan suara ke komputer.',answer:'mic',options:['mic','keyboard','monitor']},{q:'Kamu ingin melihat hasil visual.',answer:'monitor',options:['speaker','monitor','ssd']},{q:'Kamu ingin membawa file ke komputer lain.',answer:'flashdisk',options:['flashdisk','cpu','barcode']}];
  let solved=0;const wrap=$('m2scenarios');scenarios.forEach((s,i)=>{const opts=s.options.map(id=>DEVICES.find(x=>x.id===id));wrap.insertAdjacentHTML('beforeend',`<div class="scenario-card"><b>${i+1}. ${s.q}</b><div class="scenario-options">${opts.map(x=>`<button class="scenario-option" data-scenario="${i}" data-answer="${x.id}">${imageHtml(x,'scenario-image')}<span>${esc(x.name)}</span></button>`).join('')}</div></div>`)});
  document.querySelectorAll('.scenario-option').forEach(btn=>btn.onclick=()=>{const i=+btn.dataset.scenario;const s=scenarios[i];document.querySelectorAll(`[data-scenario="${i}"]`).forEach(x=>x.classList.remove('correct','wrong'));if(btn.dataset.answer===s.answer){btn.classList.add('correct');solved=Math.max(solved,[...new Set([...document.querySelectorAll('.scenario-option.correct')].map(x=>x.dataset.scenario))].length);}else{btn.classList.add('wrong');}feedback($('m2scenarioFeedback'),solved===3?'✓ Semua kebutuhan sudah dipasangkan dengan tepat.':'Pilih perangkat berdasarkan fungsi yang dibutuhkan.',solved===3);if(placed.size===items.length&&solved===3)$('m2finish').disabled=false;});
  const check=setInterval(()=>{if(placed.size===items.length&&solved===3){$('m2finish').disabled=false;clearInterval(check)}},150);
  $('m2finish').onclick=async()=>{if(await finishMission('misi2',100,'fungsi_perangkat',13,13)){toast('Misi 2 selesai!');setTimeout(()=>{renderMap();show('mapView')},700)}};
}

function renderMission3(){
  const stages=[{id:'input',name:'Input',image:DEVICES.find(x=>x.id==='keyboard').image,desc:'Data masuk melalui perangkat input.'},{id:'process',name:'Process',image:DEVICES.find(x=>x.id==='cpu').image,desc:'CPU mengolah data.'},{id:'output',name:'Output',image:DEVICES.find(x=>x.id==='monitor').image,desc:'Hasil dapat ditampilkan.'},{id:'storage',name:'Storage',image:DEVICES.find(x=>x.id==='ssd').image,desc:'Data dapat disimpan.'}];
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • SUSUN URUTAN</span><h2>Bangun perjalanan data</h2><p>Seret kartu untuk menyusun urutan. Di HP, tap kartu secara berurutan.</p><div class="sequence-pool" id="m3pool">${shuffle(stages).map(x=>`<button class="sequence-card" draggable="true" data-stage="${x.id}">${imageHtml(x,'sequence-image')}<b>${x.name}</b></button>`).join('')}</div><div id="m3sequence" class="sequence-board"><span class="sequence-placeholder">Tempatkan kartu di sini</span></div><div id="m3feedback" class="feedback">Urutan yang dicari: Input → Process → Output → Storage.</div></div>
  <div class="activity-card"><span class="objective">ANIMASI MODEL</span><h2>Lihat data bergerak</h2><p>Tekan tombol. Perhatikan bahwa setiap tahap memiliki peran berbeda.</p><div class="data-journey-stage" id="m3journey"><div class="journey-step"><img src="${DEVICES.find(x=>x.id==='keyboard').image}" alt="Input"><small>Input</small></div><div class="journey-step"><img src="${DEVICES.find(x=>x.id==='cpu').image}" alt="Process"><small>Process</small></div><div class="journey-step"><img src="${DEVICES.find(x=>x.id==='monitor').image}" alt="Output"><small>Output</small></div><div class="journey-step"><img src="${DEVICES.find(x=>x.id==='ssd').image}" alt="Storage"><small>Storage</small></div><div id="dataToken" class="image-token">A</div></div><button id="runData" class="primary-btn full">Jalankan Data</button><div id="m3dataFeedback" class="feedback">Data belum dijalankan.</div></div>
  <div class="activity-card"><span class="objective">WHAT HAPPENS IF?</span><h2>Monitor dilepas dari sistem</h2><div class="tap-grid" id="m3what"><button class="choice" data-correct="false">Komputer pasti mati.</button><button class="choice" data-correct="true">Hasil visual tidak terlihat.</button><button class="choice" data-correct="false">Keyboard menjadi storage.</button><button class="choice" data-correct="false">Software berubah menjadi hardware.</button></div><div id="m3whatFeedback" class="feedback">Pilih dampak yang paling tepat.</div><button id="m3finish" class="primary-btn full" disabled>Selesaikan Misi</button></div>`;
  const sequence=[];const correct=['input','process','output','storage'];
  document.querySelectorAll('.sequence-card').forEach(card=>{card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',card.dataset.stage)});card.onclick=()=>addStage(card.dataset.stage);});
  const board=$('m3sequence');board.addEventListener('dragover',e=>e.preventDefault());board.addEventListener('drop',e=>{e.preventDefault();addStage(e.dataTransfer.getData('text/plain'))});
  function addStage(id){if(!id||sequence.includes(id))return;sequence.push(id);renderSequence();}
  function renderSequence(){board.innerHTML=sequence.map((id,i)=>{const s=stages.find(x=>x.id===id);return `<button class="placed-sequence" data-remove="${id}">${imageHtml(s,'placed-sequence-image')}<b>${s.name}</b><small>tap untuk keluarkan</small></button>`}).join('')||'<span class="sequence-placeholder">Tempatkan kartu di sini</span>';document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{sequence.splice(sequence.indexOf(b.dataset.remove),1);renderSequence()});const ok=sequence.join(',')===correct.join(',');feedback($('m3feedback'),ok?'✓ Urutan tepat. Sekarang jalankan model data.':'Susun dari data masuk, diproses, ditampilkan, lalu disimpan.',ok);check();}
  let ran=false,what=false; $('runData').onclick=()=>{ran=true;const token=$('dataToken');token.classList.remove('animate');void token.offsetWidth;token.classList.add('animate');setTimeout(()=>feedback($('m3dataFeedback'),'✓ Data A bergerak dari input, diproses, ditampilkan, lalu dapat disimpan.',true),2200);check();};
  document.querySelectorAll('#m3what .choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('#m3what .choice').forEach(x=>x.classList.remove('correct','wrong'));if(b.dataset.correct==='true'){b.classList.add('correct');what=true;feedback($('m3whatFeedback'),'✓ Monitor termasuk output. Tanpa monitor, hasil visual tidak terlihat.',true)}else{b.classList.add('wrong');feedback($('m3whatFeedback'),'Pikirkan kembali fungsi monitor: monitor menampilkan hasil.',false)}check();});
  function check(){if(sequence.join(',')===correct.join(',')&&ran&&what)$('m3finish').disabled=false}
  $('m3finish').onclick=async()=>{if(await finishMission('misi3',100,'perjalanan_data',6,6)){toast('Misi 3 selesai!');setTimeout(()=>{renderMap();show('mapView')},700)}};
}

function renderMission4(){
  const os=shuffle([SOFTWARE.find(x=>x.id==='windows'),SOFTWARE.find(x=>x.id==='linux'),SOFTWARE.find(x=>x.id==='android'),SOFTWARE.find(x=>x.id==='ios')]);
  const apps=shuffle([SOFTWARE.find(x=>x.id==='chrome'),SOFTWARE.find(x=>x.id==='word'),SOFTWARE.find(x=>x.id==='calculator'),SOFTWARE.find(x=>x.id==='media'),SOFTWARE.find(x=>x.id==='youtube'),SOFTWARE.find(x=>x.id==='instagram')]);
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • PASANGKAN OS</span><h2>OS mana yang cocok?</h2><p>Seret sistem operasi ke perangkat yang sesuai. Di HP, tap kartu untuk memilih tujuan.</p><div class="os-board" id="osBoard">${os.map(x=>`<button class="os-card" data-os="${x.id}" draggable="true">${imageHtml(x,'os-image')}<b>${esc(x.name)}</b></button>`).join('')}</div><div class="zones os-zones"><div class="zone drop-zone" data-zone="computer"><h4>💻 Komputer / Laptop</h4><div id="zone-computer" class="drop-list"></div></div><div class="zone drop-zone" data-zone="mobile"><h4>📱 Smartphone / Tablet</h4><div id="zone-mobile" class="drop-list"></div></div></div><div id="osFeedback" class="feedback">Windows dan Linux digunakan pada komputer. Android dan iOS digunakan pada perangkat mobile.</div></div>
  <div class="activity-card"><span class="objective">EKSPLORASI APLIKASI</span><h2>Aplikasi membutuhkan sistem operasi</h2><p>Kelompokkan contoh aplikasi sebagai software yang berjalan di atas sistem komputer.</p><div class="cards-grid app-grid" id="appCards">${apps.map(x=>renderImageCard(x,'apps')).join('')}</div><div class="zones two-zones"><div class="zone"><h4>🧩 Aplikasi</h4><div id="app-zone" class="drop-list"></div></div><div class="zone"><h4>💡 Petunjuk</h4><p class="zone-note">Browser, pengolah kata, kalkulator, media player, dan layanan video/sosial adalah software aplikasi.</p></div></div><div id="appFeedback" class="feedback">Pindahkan minimal 4 aplikasi dengan benar.</div></div>
  <div class="activity-card"><span class="objective">SIMULASI</span><h2>Apa peran sistem operasi?</h2><div class="os-simulation"><div class="sim-node"><img src="${PEOPLE[0].image}" alt="Brainware"><b>Pengguna</b></div><span>→</span><div class="sim-node" id="simOS"><span class="sim-question">?</span><b>Sistem Operasi</b></div><span>→</span><div class="sim-node"><img src="${DEVICES.find(x=>x.id==='cpu').image}" alt="Hardware"><b>Hardware</b></div></div><div class="action-row"><button id="withoutOs" class="secondary-btn">Coba tanpa OS</button><button id="withOs" class="primary-btn" style="margin-top:0">Pasang OS</button></div><div id="osSimFeedback" class="feedback">Bandingkan keadaan sebelum dan sesudah sistem operasi dipasang.</div><button id="m4finish" class="primary-btn full" disabled>Selesaikan Misi</button></div>`;
  const osPlaced=new Map();let appSolved=0,sim=false;
  const placeOS=(id,target,card)=>{const item=SOFTWARE.find(x=>x.id===id);const correct=(id==='windows'||id==='linux')?'computer':'mobile';if(target!==correct){markCard(card,false);feedback($('osFeedback'),`${item.name} lebih cocok untuk ${correct==='computer'?'komputer/laptop':'smartphone/tablet'}.`,false);return;}osPlaced.set(id,target);markCard(card,true);renderOS();check();};
  function renderOS(){['computer','mobile'].forEach(z=>{$(`zone-${z}`).innerHTML=[...osPlaced.entries()].filter(([id,t])=>t===z).map(([id])=>{const x=SOFTWARE.find(a=>a.id===id);return `<span class="mini-asset">${imageHtml(x,'mini-image')}<span>${esc(x.name)}</span></span>`}).join('')});feedback($('osFeedback'),osPlaced.size===4?'✓ Semua sistem operasi sudah dipasangkan.':'Lanjutkan sampai keempat OS terpasang.',osPlaced.size===4)}
  document.querySelectorAll('#osBoard .os-card').forEach(card=>{const id=card.dataset.os;card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',id));card.onclick=()=>showObjectModal(SOFTWARE.find(x=>x.id===id),'Pilih perangkat yang cocok untuk sistem operasi ini.',[{value:'computer',label:'Komputer / Laptop',icon:'💻'},{value:'mobile',label:'Smartphone / Tablet',icon:'📱'}],v=>placeOS(id,v,card));});
  document.querySelectorAll('#osBoard + .os-zones .drop-zone').forEach(zone=>{zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over')});zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag-over');const id=e.dataTransfer.getData('text/plain');placeOS(id,zone.dataset.zone,document.querySelector(`[data-os="${id}"]`))})});
  document.querySelectorAll('#appCards .device-card').forEach(card=>card.onclick=()=>{const x=SOFTWARE.find(a=>a.id===card.dataset.device);if(card.classList.contains('correct'))return;showObjectModal(x,'Apakah ini software aplikasi yang digunakan manusia untuk melakukan tugas?', [{value:'yes',label:'Ya, ini aplikasi',icon:'✓'},{value:'no',label:'Bukan aplikasi',icon:'?'}],v=>{if(v==='yes'){card.classList.add('correct');appSolved++;$('app-zone').insertAdjacentHTML('beforeend',`<span class="mini-asset">${imageHtml(x,'mini-image')}<span>${esc(x.name)}</span></span>`);feedback($('appFeedback'),`✓ ${x.name} termasuk software aplikasi. ${appSolved}/4 target tercapai.`,appSolved>=4);check();}else{markCard(card,false);feedback($('appFeedback'),'Perhatikan apakah objek tersebut merupakan program yang digunakan untuk melakukan tugas.',false)}})});
  $('withoutOs').onclick=()=>feedback($('osSimFeedback'),'Tanpa OS, perangkat keras belum memiliki lingkungan sistem yang mengatur penggunaan aplikasi dan perangkat.',false);
  $('withOs').onclick=()=>{sim=true;$('simOS').classList.add('active');$('simOS').querySelector('.sim-question').textContent='⚙️';feedback($('osSimFeedback'),'✓ Sistem operasi menjadi penghubung yang membantu pengguna dan aplikasi berinteraksi dengan perangkat keras.',true);check()};
  function check(){if(osPlaced.size===4&&appSolved>=4&&sim)$('m4finish').disabled=false}
  $('m4finish').onclick=async()=>{if(await finishMission('misi4',100,'sistem_operasi',9,9)){toast('Misi 4 selesai!');setTimeout(()=>{renderMap();show('mapView')},700)}};
}

function renderFinal(){
  const questions=[
    {q:'Manakah yang termasuk hardware?',items:['keyboard','chrome','brainware'],a:'keyboard'},
    {q:'Manakah yang termasuk software sistem operasi?',items:['windows','monitor','speaker'],a:'windows'},
    {q:'Perangkat yang menerima suara termasuk fungsi...',items:['mic','monitor','ssd'],a:'mic'},
    {q:'Komponen yang mengolah instruksi adalah...',items:['cpu','printer','flashdisk'],a:'cpu'},
    {q:'Perangkat yang menyimpan data secara permanen adalah...',items:['ssd','webcam','speaker'],a:'ssd'},
    {q:'Manakah contoh brainware?',items:['user1','cpu','android'],a:'user1'}
  ];
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">FINAL MISSION • IDENTIFIKASI</span><h2>Pulihkan Sistem Komputer</h2><p>Untuk setiap situasi, pilih gambar yang paling tepat. Tap gambar untuk konfirmasi.</p><div id="finalQuestions"></div><button id="finalSubmit" class="primary-btn full" disabled>Selesaikan Uji Pemahaman</button></div>`;
  const wrap=$('finalQuestions');const answers={};questions.forEach((q,i)=>{const items=q.items.map(id=>findItem(id));wrap.insertAdjacentHTML('beforeend',`<div class="question-block"><h3>${i+1}. ${q.q}</h3><div class="final-options">${items.map(x=>`<button class="final-option" data-q="${i}" data-answer="${x.id}">${imageHtml(x,'final-image')}<b>${esc(x.name)}</b></button>`).join('')}</div><div id="final-fb-${i}" class="feedback">Pilih satu gambar.</div></div>`)});
  document.querySelectorAll('.final-option').forEach(btn=>btn.onclick=()=>{const q=+btn.dataset.q;const obj=findItem(btn.dataset.answer);showObjectModal(obj,'Apakah gambar ini yang paling tepat untuk situasi tersebut?', [{value:'choose',label:'Pilih gambar ini',icon:'✓'},{value:'cancel',label:'Lihat lagi',icon:'↩'}],v=>{if(v==='choose'){answers[q]=obj.id;document.querySelectorAll(`[data-q="${q}"]`).forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');const correct=questions[q].a===obj.id;feedback($(`final-fb-${q}`),correct?'✓ Tepat. Lanjut ke tantangan berikutnya.':'Belum tepat. Coba amati kembali fungsi gambar tersebut.',correct);$('finalSubmit').disabled=Object.keys(answers).length!==questions.length;}})});
  $('finalSubmit').onclick=async()=>{const correct=questions.reduce((n,q,i)=>n+(answers[i]===q.a?1:0),0);const score=scoreFrom(correct,questions.length);const saved=await saveFinalResult(state.user.id,score,correct,questions.length).catch(()=>null);if(saved===null){toast('Hasil akhir belum tersimpan.');return;}const ok=await finishMission('final',score,'final_identifikasi',correct,questions.length);if(ok)showResult(score,correct,questions.length)};
}
function showResult(score,correct,total){$('finalScore').textContent=score;$('finalMessage').textContent=score>=80?'Kamu berhasil menghubungkan konsep sistem komputer dengan contoh nyata.':'Perjalanan selesai. Gunakan kembali misi yang masih ingin kamu pahami.';$('resultSummary').innerHTML=`<div class="summary-row"><span>Jawaban benar</span><b>${correct}/${total}</b></div><div class="summary-row"><span>Skor akhir</span><b>${score}</b></div><div class="summary-row"><span>Peserta</span><b>${esc(state.student.nama)}</b></div>`;show('resultView')}
window.addEventListener('online',()=>{state.offline=false;toast('Koneksi kembali.')});window.addEventListener('offline',()=>{state.offline=true;toast('Koneksi terputus. Selesaikan aktivitas setelah koneksi kembali agar skor tersimpan.')});
initAssetLoader();ensureModal();boot();
