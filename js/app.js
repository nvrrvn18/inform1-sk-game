import { startAnonymousSession, signOut } from './auth/auth.js';
import { getStudent, createStudentProfile } from './database/student.js';
import { loadProgress, saveMissionProgress, saveActivityResult, saveFinalResult } from './database/progress.js';
import { MISSIONS, DEVICES } from './game/missions.js';
import { shuffle } from './game/interactions.js';
import { scoreFrom } from './game/scoring.js';

const state = {
  user:null, student:null, progress:[], currentMission:null, currentScore:0,
  sound:true, offline:false
};

const $ = id => document.getElementById(id);
const views = ['loadingView','welcomeView','profileView','mapView','missionView','resultView'];
function show(id){ views.forEach(v=>$(v).classList.toggle('hidden',v!==id)); window.scrollTo({top:0,behavior:'instant'}); }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

async function boot(){
  try{
    if(!window.supabaseClient || window.supabaseClient.supabaseUrl?.includes('MASUKKAN')) throw new Error('Konfigurasi Supabase belum diisi.');
    state.user = await startAnonymousSession();
    state.student = await getStudent(state.user.id);
    if(state.student){
      state.progress = await loadProgress(state.user.id);
      $('studentBadge').textContent=`${state.student.nama} • ${state.student.kelas}`;
      $('studentBadge').classList.remove('hidden'); $('logoutBtn').classList.remove('hidden');
      renderMap(); show('mapView');
    } else show('welcomeView');
  }catch(e){
    console.error(e); toast(e.message || 'Koneksi Supabase belum siap.'); show('welcomeView');
  }
}

$('startBtn').onclick=()=>show('profileView');
$('profileStartBtn').onclick=async()=>{
  const nama=$('nameInput').value.trim(), kelas=$('classInput').value;
  if(nama.length<2){toast('Masukkan nama terlebih dahulu.');return;}
  if(!kelas){toast('Pilih kelas terlebih dahulu.');return;}
  try{
    $('profileStartBtn').disabled=true; $('profileStartBtn').textContent='Menyiapkan...';
    state.user=await startAnonymousSession();
    state.student=await createStudentProfile(state.user.id,nama,kelas);
    state.progress=await loadProgress(state.user.id);
    $('studentBadge').textContent=`${state.student.nama} • ${state.student.kelas}`;
    $('studentBadge').classList.remove('hidden'); $('logoutBtn').classList.remove('hidden');
    renderMap(); show('mapView'); toast('Profil tersimpan. Selamat belajar!');
  }catch(e){console.error(e);toast(e.message||'Gagal menyimpan profil.');}
  finally{$('profileStartBtn').disabled=false;$('profileStartBtn').textContent='Masuk ke Perjalanan →';}
};

$('backMapBtn').onclick=()=>{renderMap();show('mapView');};
$('resultMapBtn').onclick=()=>{renderMap();show('mapView');};
$('logoutBtn').onclick=async()=>{
  if(!confirm('Ganti pengguna? Session anonim saat ini akan ditutup.')) return;
  await signOut(); location.reload();
};
$('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'🔊':'🔇';};

function isDone(id){return state.progress.some(p=>p.mission_id===id && p.completed);}
function canOpen(index){return index===0 || isDone(MISSIONS[index-1].id);}
function renderMap(){
  $('welcomeName').textContent=`Halo, ${state.student?.nama||'Pembelajar'}!`;
  const completed=MISSIONS.filter(m=>m.id!=='final' && isDone(m.id)).length;
  const finalDone=isDone('final'); const pct=Math.round(((completed+(finalDone?1:0))/5)*100);
  $('progressPercent').textContent=`${pct}%`;
  $('progress-ring');
  const ring=$('progressPercent').parentElement; ring.style.background=`conic-gradient(var(--blue) ${pct*3.6}deg,#dfeaf5 0deg)`;
  $('missionMap').innerHTML=MISSIONS.map((m,i)=>{
    const done=isDone(m.id), open=canOpen(i), cls=done?'done':open?'active':'locked';
    return `<article class="mission-card ${cls}" data-mission="${m.id}" ${open?'':'aria-disabled="true"'}>
      <div class="mission-num">${done?'✓':m.number}</div><span class="mission-state">${done?'✓':open?'●':'🔒'}</span>
      <h3>${esc(m.title)}</h3><p>${esc(m.short)}</p>
    </article>`;
  }).join('');
  document.querySelectorAll('.mission-card:not(.locked)').forEach(c=>c.onclick=()=>openMission(c.dataset.mission));
}

function setConcept(text){$('conceptBar').textContent=text;}
function openMission(id){
  const m=MISSIONS.find(x=>x.id===id); if(!m)return;
  const idx=MISSIONS.indexOf(m); if(!canOpen(idx))return;
  state.currentMission=m;state.currentScore=0;$('missionScore').textContent='0';$('missionNumber').textContent=`MISI ${m.number}`;$('missionTitle').textContent=m.title;setConcept(m.concept);show('missionView');
  renderMission(m);
}

function finishMission(id,score){
  state.currentScore=score;$('missionScore').textContent=score;
  saveMissionProgress(state.user.id,id,score,true).then(row=>{
    const old=state.progress.find(p=>p.mission_id===id); if(old)Object.assign(old,row); else state.progress.push(row);
  }).catch(e=>{console.error(e);toast('Skor lokal belum tersinkron. Coba lagi saat internet tersedia.');});
}
function feedback(el,text,good=false){el.className=`feedback ${good?'good':'warn'}`;el.innerHTML=text;}

function renderMission(m){
  if(m.id==='misi1') renderMission1();
  if(m.id==='misi2') renderMission2();
  if(m.id==='misi3') renderMission3();
  if(m.id==='misi4') renderMission4();
  if(m.id==='final') renderFinal();
}

function renderMission1(){
  const cards=shuffle(DEVICES.filter(d=>['keyboard','monitor','browser','student','printer','windows'].includes(d.id)));
  $('missionContent').innerHTML=`
  <div class="activity-card"><span class="objective">TARGET 1 • AMATI</span><h2>Siapa saja yang bekerja?</h2><p>Bayangkan seorang siswa sedang membuat tugas. Pilih benda, program, dan manusia yang ikut bekerja dalam sistem komputer.</p>
    <div class="cards-grid" id="m1select">${cards.map(d=>deviceCardHtml(d)).join('')}</div><div id="m1feedback" class="feedback">Pilih minimal satu hardware, satu software, dan satu brainware.</div></div>
  <div class="activity-card"><span class="objective">TARGET 2 • KELOMPOKKAN</span><h2>Susun tiga unsur sistem</h2><p>Pilih kartu lalu pilih kategori yang sesuai.</p>
    <div class="cards-grid" id="m1cards">${shuffle(DEVICES.filter(d=>['keyboard','monitor','windows','browser','student','teacher'].includes(d.id))).map(d=>deviceCardHtml(d)).join('')}</div>
    <div class="zones"><div class="zone" data-cat="hardware"><h4>🧩 Hardware</h4><div class="drop-list" id="zone-hardware"></div></div><div class="zone" data-cat="software"><h4>⚙️ Software</h4><div class="drop-list" id="zone-software"></div></div><div class="zone" data-cat="brainware"><h4>👤 Brainware</h4><div class="drop-list" id="zone-brainware"></div></div></div>
    <div id="m1sortFeedback" class="feedback">Semua kategori harus terisi dengan tepat.</div>
  </div>
  <div class="activity-card"><span class="objective">KESIMPULAN</span><h2>Lihat hubungan ketiganya</h2><div class="flow"><span class="flow-node">👤 Brainware</span><span class="flow-arrow">→</span><span class="flow-node">⚙️ Software</span><span class="flow-arrow">→</span><span class="flow-node">🧩 Hardware</span></div><button id="m1finish" class="primary-btn full" type="button" disabled>Selesaikan Misi</button><div id="m1done" class="success-banner hidden"><h3>✓ Tantangan berhasil</h3><p>Hardware, software, dan brainware saling bekerja sama membentuk sistem komputer.</p></div></div>`;

  let chosen=new Set(); document.querySelectorAll('#m1select .device-card').forEach(b=>b.onclick=()=>{b.classList.toggle('selected');b.classList.contains('selected')?chosen.add(b.dataset.device):chosen.delete(b.dataset.device);const types=[...chosen].map(id=>DEVICES.find(d=>d.id===id)?.type);const ok=types.includes('hardware')&&types.includes('software')&&types.includes('brainware');feedback($('m1feedback'),ok?'✓ Kamu sudah menemukan tiga unsur utama. Sekarang kelompokkan kartu pada aktivitas berikut.':'Cari setidaknya satu contoh hardware, software, dan brainware.',ok);});
  let placed={hardware:new Set(),software:new Set(),brainware:new Set()};
  document.querySelectorAll('#m1cards .device-card').forEach(b=>b.onclick=()=>{
    const d=DEVICES.find(x=>x.id===b.dataset.device); const target=d.type; if(placed[target].has(d.id))return;
    Object.keys(placed).forEach(k=>placed[k].delete(d.id)); placed[target].add(d.id); b.classList.add('selected'); renderPlaced();
  });
  function renderPlaced(){Object.keys(placed).forEach(k=>{$(`zone-${k}`).innerHTML=[...placed[k]].map(id=>{const d=DEVICES.find(x=>x.id===id);return `<span class="mini-chip">${d.icon} ${d.name}</span>`}).join('');});const total=Object.values(placed).reduce((a,s)=>a+s.size,0);const wrong=[...Object.values(placed).flatMap(s=>[...s])].filter(id=>{const d=DEVICES.find(x=>x.id===id);return !d});const ok=total===6;feedback($('m1sortFeedback'),ok?'✓ Semua kartu sudah dikelompokkan berdasarkan jenisnya.':'Teruskan. Setiap kartu akan masuk ke kategori berdasarkan jenisnya.',ok);if(ok){$('m1finish').disabled=false;}}
  $('m1finish').onclick=async()=>{finishMission('misi1',100);$('m1finish').disabled=true;$('m1done').classList.remove('hidden');await saveActivityResult(state.user.id,'misi1','klasifikasi',100,6,6).catch(()=>{});toast('Misi 1 selesai!');setTimeout(()=>{renderMap();show('mapView')},1000)};
}
function deviceCardHtml(d){return `<button class="device-card" data-device="${d.id}"><span class="device-icon">${d.icon}</span><b>${d.name}</b></button>`}

function renderMission2(){
  const pool=shuffle(DEVICES.filter(d=>d.function && ['keyboard','mouse','mic','cpu','monitor','speaker','printer','ssd'].includes(d.id)));
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • KLASIFIKASI</span><h2>Di mana perangkat ini bekerja?</h2><p>Pilih kartu perangkat. Kartu akan masuk ke fungsi yang sesuai.</p><div class="cards-grid" id="m2cards">${pool.map(deviceCardHtml).join('')}</div><div class="zones"><div class="zone"><h4>⌨️ INPUT</h4><div id="zinput" class="drop-list"></div></div><div class="zone"><h4>🧠 PROCESS</h4><div id="zprocess" class="drop-list"></div></div><div class="zone"><h4>🖥️ OUTPUT</h4><div id="zoutput" class="drop-list"></div></div><div class="zone"><h4>💾 STORAGE</h4><div id="zstorage" class="drop-list"></div></div></div><div id="m2feedback" class="feedback">Kelompokkan 8 perangkat.</div></div>
  <div class="activity-card"><span class="objective">REPAIR THE SYSTEM</span><h2>Perbaiki komputer yang salah</h2><p>Perhatikan susunan berikut. Pilih jawaban yang tepat untuk memperbaiki bagian yang salah.</p><div class="flow"><span class="flow-node">⌨️ Keyboard</span><span class="flow-arrow">→</span><span class="flow-node">🖥️ Monitor</span><span class="flow-arrow">→</span><span class="flow-node">💾 SSD</span></div><div class="tap-grid" id="m2repair"><button class="choice" data-answer="keyboard">Keyboard = Input</button><button class="choice" data-answer="monitor">Monitor = Output</button><button class="choice" data-answer="ssd">SSD = Storage</button><button class="choice" data-answer="cpu">CPU = Process</button></div><div id="m2repairFeedback" class="feedback">Pilih pernyataan yang benar untuk memperbaiki sistem.</div><button id="m2finish" class="primary-btn full" type="button" disabled>Selesaikan Misi</button></div>`;
  const placed={input:new Set(),process:new Set(),output:new Set(),storage:new Set()}; const all=pool.length;
  document.querySelectorAll('#m2cards .device-card').forEach(b=>b.onclick=()=>{const d=DEVICES.find(x=>x.id===b.dataset.device);placed[d.function].add(d.id);b.disabled=true;b.classList.add('selected');render();});
  function render(){Object.entries(placed).forEach(([k,s])=>{$('z'+k).innerHTML=[...s].map(id=>{const d=DEVICES.find(x=>x.id===id);return `<span class="mini-chip">${d.icon} ${d.name}</span>`}).join('');});const count=Object.values(placed).reduce((a,s)=>a+s.size,0);const ok=count===all;feedback($('m2feedback'),ok?'✓ Semua perangkat sudah berada pada fungsi yang tepat.':'Masih ada perangkat yang belum ditempatkan.',ok);checkFinish();}
  let repair=0;document.querySelectorAll('#m2repair .choice').forEach(b=>b.onclick=()=>{if(b.dataset.answer==='monitor'||b.dataset.answer==='ssd'||b.dataset.answer==='keyboard'||b.dataset.answer==='cpu'){b.classList.add('correct');repair++;feedback($('m2repairFeedback'),'✓ Tepat. Fungsi perangkat tersebut sesuai dengan perannya.',true);checkFinish();}});
  function checkFinish(){const count=Object.values(placed).reduce((a,s)=>a+s.size,0);if(count===all&&repair>=4)$('m2finish').disabled=false;}
  $('m2finish').onclick=async()=>{finishMission('misi2',100);$('m2finish').disabled=true;await saveActivityResult(state.user.id,'misi2','fungsi_perangkat',100,8,8).catch(()=>{});toast('Misi 2 selesai!');setTimeout(()=>{renderMap();show('mapView')},900)};
}

function renderMission3(){
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • SUSUN ALUR</span><h2>Bangun perjalanan data</h2><p>Susun konsep kerja komputer dari masukan sampai penyimpanan.</p><div class="tap-grid" id="m3choices"><button class="choice" data-val="input">⌨️ Input</button><button class="choice" data-val="process">🧠 Process</button><button class="choice" data-val="output">🖥️ Output</button><button class="choice" data-val="storage">💾 Storage</button></div><div id="m3sequence" class="flow"></div><div id="m3feedback" class="feedback">Pilih urutan: Input → Process → Output → Storage.</div></div>
  <div class="activity-card"><span class="objective">DATA JOURNEY</span><h2>Ikuti huruf “A”</h2><p>Tekan tombol untuk melihat bagaimana data bergerak melewati sistem.</p><div class="data-stage"><div id="token" class="data-token">A</div><div class="stage-labels"><span>⌨️ Input</span><span>🧠 Process</span><span>🖥️ Output</span><span>💾 Storage</span></div></div><button id="runData" class="primary-btn full" type="button">Jalankan Data</button><div id="m3dataFeedback" class="feedback">Data belum dijalankan.</div></div>
  <div class="activity-card"><span class="objective">WHAT HAPPENS IF?</span><h2>Jika monitor dilepas?</h2><div class="tap-grid" id="m3what"><button class="choice" data-correct="false">Komputer pasti mati.</button><button class="choice" data-correct="true">Hasil visual tidak terlihat.</button><button class="choice" data-correct="false">Keyboard menjadi storage.</button><button class="choice" data-correct="false">Software berubah menjadi hardware.</button></div><div id="m3whatFeedback" class="feedback">Pilih dampak yang paling tepat.</div><button id="m3finish" class="primary-btn full" type="button" disabled>Selesaikan Misi</button></div>`;
  const seq=[];const correct=['input','process','output','storage'];document.querySelectorAll('#m3choices .choice').forEach(b=>b.onclick=()=>{if(seq.includes(b.dataset.val))return;seq.push(b.dataset.val);b.classList.add('selected');$('m3sequence').innerHTML=seq.map((v,i)=>`<span class="flow-node">${v.toUpperCase()}</span>${i<seq.length-1?'<span class="flow-arrow">→</span>':''}`).join('');const ok=seq.length===4&&seq.every((v,i)=>v===correct[i]);feedback($('m3feedback'),ok?'✓ Urutan tepat. Jalankan data untuk melihat prosesnya.':'Urutan belum tepat. Perhatikan perjalanan dari masukan hingga penyimpanan.',ok);check();});
  let dataRun=false,what=false; $('runData').onclick=()=>{dataRun=true;const t=$('token');t.className='data-token';setTimeout(()=>t.classList.add('go1'),50);setTimeout(()=>t.classList.add('go2'),1050);setTimeout(()=>t.classList.add('go3'),2050);setTimeout(()=>feedback($('m3dataFeedback'),'✓ Huruf masuk melalui input, diproses, ditampilkan, lalu dapat disimpan.',true),3100);check();};
  document.querySelectorAll('#m3what .choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('#m3what .choice').forEach(x=>x.classList.remove('correct','wrong'));if(b.dataset.correct==='true'){b.classList.add('correct');what=true;feedback($('m3whatFeedback'),'✓ Monitor adalah perangkat output visual. Tanpa monitor, hasil visual tidak terlihat.',true)}else{b.classList.add('wrong');feedback($('m3whatFeedback'),'Coba pikirkan fungsi monitor: apakah menerima input atau menampilkan output?')}});
  function check(){if(seq.join(',')===correct.join(',')&&dataRun&&what)$('m3finish').disabled=false}
  $('m3finish').onclick=async()=>{finishMission('misi3',100);await saveActivityResult(state.user.id,'misi3','data_journey',100,3,3).catch(()=>{});toast('Misi 3 selesai!');setTimeout(()=>{renderMap();show('mapView')},900)};
}

function renderMission4(){
  const os=shuffle([{id:'windows',name:'Windows',icon:'🪟',device:'Komputer/Laptop'},{id:'linux',name:'Linux',icon:'🐧',device:'Komputer/Laptop'},{id:'android',name:'Android',icon:'🤖',device:'Smartphone/Tablet'},{id:'ios',name:'iOS',icon:'📱',device:'iPhone/iPad'}]);
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">TARGET • KENALI OS</span><h2>Pasangkan sistem operasi</h2><p>Pilih kartu sistem operasi. Lihat perangkat yang cocok.</p><div class="os-board" id="osBoard">${os.map(o=>`<button class="os-card" data-os="${o.id}"><span class="device-icon">${o.icon}</span><b>${o.name}</b><p>${o.device}</p></button>`).join('')}</div><div id="osFeedback" class="feedback">Sistem operasi adalah perangkat lunak utama.</div></div>
  <div class="activity-card"><span class="objective">SIMULASI</span><h2>Apa yang terjadi tanpa sistem operasi?</h2><div class="flow"><span class="flow-node">🖥️ Hardware</span><span class="flow-arrow">→</span><span class="flow-node" id="osMiddle">❓</span><span class="flow-arrow">→</span><span class="flow-node">👤 Pengguna</span></div><div class="action-row"><button id="withoutOs" class="secondary-btn">Coba tanpa OS</button><button id="withOs" class="primary-btn" style="margin-top:0">Pasang OS</button></div><div id="osSimFeedback" class="feedback">Komputer memiliki perangkat keras, tetapi sistem belum siap digunakan seperti biasa.</div></div>
  <div class="activity-card"><span class="objective">FUNGSI</span><h2>Apa yang dibantu sistem operasi?</h2><div class="tap-grid" id="osFunctions"><button class="choice" data-ok="1">Mengatur perangkat keras</button><button class="choice" data-ok="1">Membantu menjalankan aplikasi</button><button class="choice" data-ok="1">Mengelola file dan interaksi pengguna</button><button class="choice" data-ok="0">Mengubah laptop menjadi printer</button></div><div id="osFuncFeedback" class="feedback">Pilih tiga fungsi yang benar.</div><button id="m4finish" class="primary-btn full" type="button" disabled>Selesaikan Misi</button></div>`;
  let selectedOs=false,sim=false,funcs=new Set();document.querySelectorAll('#osBoard .os-card').forEach(b=>b.onclick=()=>{selectedOs=true;document.querySelectorAll('#osBoard .os-card').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');feedback($('osFeedback'),`✓ ${b.querySelector('b').textContent} adalah contoh sistem operasi.`,true);check();});
  $('withoutOs').onclick=()=>{feedback($('osSimFeedback'),'Tanpa sistem operasi, perangkat keras tidak menyediakan lingkungan penggunaan komputer seperti biasa. Pasang OS untuk melanjutkan.');};$('withOs').onclick=()=>{sim=true;$('osMiddle').textContent='⚙️ Sistem Operasi';feedback($('osSimFeedback'),'✓ Sistem operasi membantu menjadi penghubung antara pengguna, aplikasi, dan perangkat keras.',true);check();};
  document.querySelectorAll('#osFunctions .choice').forEach(b=>b.onclick=()=>{if(b.dataset.ok==='1'){b.classList.add('correct');funcs.add(b.textContent)}else{b.classList.add('wrong');}feedback($('osFuncFeedback'),funcs.size===3?'✓ Tiga fungsi utama sudah dipilih.':'Pilih fungsi yang berkaitan dengan mengatur perangkat, menjalankan aplikasi, dan mengelola interaksi.',funcs.size===3);check();});
  function check(){if(selectedOs&&sim&&funcs.size===3)$('m4finish').disabled=false}
  $('m4finish').onclick=async()=>{finishMission('misi4',100);await saveActivityResult(state.user.id,'misi4','sistem_operasi',100,5,5).catch(()=>{});toast('Misi 4 selesai!');setTimeout(()=>{renderMap();show('mapView')},900)};
}

function renderFinal(){
  const questions=[
    {q:'Keyboard termasuk...',opts:['Hardware / Input','Software','Brainware'],a:0},
    {q:'Windows termasuk...',opts:['Brainware','Sistem Operasi','Storage'],a:1},
    {q:'Urutan sederhana yang tepat...',opts:['Output → Input → Process','Input → Process → Output → Storage','Storage → Output → Input'],a:1},
    {q:'Siapa yang menggunakan atau mengelola sistem komputer?',opts:['Brainware','Storage','Processor'],a:0},
    {q:'SSD digunakan terutama untuk...',opts:['Memasukkan suara','Memproses instruksi','Menyimpan data'],a:2},
    {q:'Fungsi utama sistem operasi adalah...',opts:['Menjadi penghubung dan mengelola sumber daya komputer','Mencetak dokumen tanpa printer','Mengubah manusia menjadi program'],a:0}
  ];
  $('missionContent').innerHTML=`<div class="activity-card"><span class="objective">FINAL MISSION</span><h2>Pulihkan Sistem Komputer</h2><p>Gabungkan semua yang sudah kamu temukan. Jawab setiap tantangan untuk menyelesaikan perjalanan.</p><div id="finalQuestions"></div><button id="finalSubmit" class="primary-btn full" type="button" disabled>Selesaikan Uji Pemahaman</button></div>`;
  let answers=Array(questions.length).fill(null);const wrap=$('finalQuestions');questions.forEach((q,i)=>{wrap.innerHTML+=`<div class="question-block"><h3>${i+1}. ${q.q}</h3><div class="tap-grid">${q.opts.map((o,j)=>`<button class="choice" data-q="${i}" data-a="${j}">${o}</button>`).join('')}</div></div>`});
  document.querySelectorAll('#finalQuestions .choice').forEach(b=>b.onclick=()=>{const q=+b.dataset.q;answers[q]=+b.dataset.a;document.querySelectorAll(`#finalQuestions .choice[data-q="${q}"]`).forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('finalSubmit').disabled=answers.some(x=>x===null);});
  $('finalSubmit').onclick=async()=>{const correct=questions.reduce((n,q,i)=>n+(answers[i]===q.a?1:0),0);const score=scoreFrom(correct,questions.length);await saveFinalResult(state.user.id,score,correct,questions.length).catch(()=>{});finishMission('final',score);showResult(score,correct,questions.length);};
}
function showResult(score,correct,total){$('finalScore').textContent=score;$('finalMessage').textContent=score>=80?'Kamu sudah menguasai hubungan antarbagian sistem komputer.':'Kamu sudah menyelesaikan perjalanan. Gunakan peta untuk mengulang misi yang masih ingin dipahami.';$('resultSummary').innerHTML=`<div class="summary-row"><span>Jawaban benar</span><b>${correct}/${total}</b></div><div class="summary-row"><span>Skor akhir</span><b>${score}</b></div><div class="summary-row"><span>Peserta</span><b>${esc(state.student.nama)}</b></div>`;show('resultView');}

window.addEventListener('online',()=>{state.offline=false;toast('Koneksi kembali.');});window.addEventListener('offline',()=>{state.offline=true;toast('Koneksi terputus. Progress lokal tetap tersedia untuk sesi ini.');});
boot();
