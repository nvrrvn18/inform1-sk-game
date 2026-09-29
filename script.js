const STORAGE_KEY = 'computerSystemLearningProgressV1';

const missions = [
  { id: 1, title: 'Kenali Sistem Komputer', subtitle: 'Hardware, software, brainware', concept: 'HARDWARE + SOFTWARE + BRAINWARE' },
  { id: 2, title: 'Temukan Fungsi Perangkat', subtitle: 'Input, process, output, storage', concept: 'INPUT → PROCESS → OUTPUT → STORAGE' },
  { id: 3, title: 'Bangun Sistem Komputer', subtitle: 'Pasangkan komponen ke fungsinya', concept: 'INPUT → PROCESS → OUTPUT → STORAGE' },
  { id: 4, title: 'Ikuti Perjalanan Data', subtitle: 'Susun urutan proses', concept: 'DATA JOURNEY' },
  { id: 5, title: 'Hardware & Software', subtitle: 'Temukan hubungan keduanya', concept: 'HARDWARE ↔ SOFTWARE' },
  { id: 6, title: 'Kenali Brainware', subtitle: 'Siapa yang mengendalikan sistem?', concept: 'BRAINWARE = MANUSIA' },
  { id: 7, title: 'Rakit Sesuai Kebutuhan', subtitle: 'Pilih komponen yang relevan', concept: 'KEBUTUHAN → KOMPONEN' },
  { id: 8, title: 'Final Mission', subtitle: 'Pulihkan sistem komputer', concept: 'SYSTEM RECOVERY' },
];

const items = [
  {name:'Keyboard', emoji:'⌨️', type:'hardware', fn:'input'},
  {name:'Mouse', emoji:'🖱️', type:'hardware', fn:'input'},
  {name:'Monitor', emoji:'🖥️', type:'hardware', fn:'output'},
  {name:'Speaker', emoji:'🔊', type:'hardware', fn:'output'},
  {name:'Processor', emoji:'🧠', type:'hardware', fn:'process'},
  {name:'SSD', emoji:'💾', type:'hardware', fn:'storage'},
  {name:'Browser', emoji:'🌐', type:'software', fn:'software'},
  {name:'Sistem Operasi', emoji:'⚙️', type:'software', fn:'software'},
  {name:'Pengolah Kata', emoji:'📝', type:'software', fn:'software'},
  {name:'Pengguna', emoji:'👤', type:'brainware', fn:'brainware'},
  {name:'Programmer', emoji:'🧑‍💻', type:'brainware', fn:'brainware'},
  {name:'Operator', emoji:'🧑‍🔧', type:'brainware', fn:'brainware'},
];

let state = loadState();
let activeMission = null;

function defaultState(){
  return { completed: [], scores: {}, attempts: {}, finalScore: null, lastPlayed: null };
}
function loadState(){
  try { return { ...defaultState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) }; }
  catch { return defaultState(); }
}
function saveState(){
  state.lastPlayed = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showToast('✓ Progress tersimpan');
}
function showToast(text){
  const t = document.getElementById('toast');
  t.textContent = text; t.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer = setTimeout(()=>t.classList.remove('show'), 1300);
}
function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
function isUnlocked(id){ return id === 1 || state.completed.includes(id - 1); }
function renderHome(){
  activeMission = null;
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.append(document.getElementById('homeTemplate').content.cloneNode(true));
  const map = document.getElementById('missionMap');
  missions.forEach(m => {
    const done = state.completed.includes(m.id);
    const unlocked = isUnlocked(m.id);
    const btn = document.createElement('button');
    btn.className = `mission-card ${done ? 'done' : unlocked ? 'active' : 'locked'}`;
    btn.disabled = !unlocked;
    btn.innerHTML = `<span class="mission-icon">${done ? '✓' : unlocked ? '●' : '🔒'}</span><span><span class="mission-title">Misi ${m.id}: ${m.title}</span><span class="mission-sub">${m.subtitle}</span></span><span>${done ? (state.scores[m.id] || 100) + '%' : '›'}</span>`;
    btn.onclick = () => renderMission(m.id);
    map.append(btn);
  });
  const doneCount = state.completed.length;
  document.getElementById('progressLabel').textContent = `${doneCount}/${missions.length} selesai`;
  const avg = Object.values(state.scores).length ? Math.round(Object.values(state.scores).reduce((a,b)=>a+b,0)/Object.values(state.scores).length) : 0;
  document.getElementById('summaryGrid').innerHTML = `
    <div class="stat"><strong>${doneCount}</strong><span>Misi selesai</span></div>
    <div class="stat"><strong>${avg}%</strong><span>Rata-rata skor</span></div>
    <div class="stat"><strong>${state.finalScore ?? '-'}</strong><span>Skor akhir</span></div>
    <div class="stat"><strong>${state.lastPlayed ? new Date(state.lastPlayed).toLocaleDateString('id-ID') : '-'}</strong><span>Terakhir belajar</span></div>`;
  document.getElementById('exportBtn').onclick = exportResults;
}

function missionShell(mission, inner){
  return `<section class="card">
    <div class="section-heading"><div><p class="eyebrow">Misi ${mission.id}</p><h2>${mission.title}</h2></div><button class="ghost-btn" id="backBtn">← Peta</button></div>
    <div class="concept-bar">${mission.concept}</div>
    ${inner}
  </section>`;
}

function renderMission(id){
  activeMission = id;
  const m = missions.find(x=>x.id===id);
  const app = document.getElementById('app');
  if (id===1) return renderClassifyMission(m, 'type', ['hardware','software','brainware'], 'Kelompokkan setiap kartu sebagai hardware, software, atau brainware.');
  if (id===2) return renderClassifyMission(m, 'fn', ['input','process','output','storage'], 'Kelompokkan perangkat berdasarkan fungsinya.');
  if (id===3) return renderBuildMission(m);
  if (id===4) return renderSequenceMission(m);
  if (id===5) return renderRelationshipMission(m);
  if (id===6) return renderBrainwareMission(m);
  if (id===7) return renderNeedsMission(m);
  return renderFinalMission(m);
}

function wireBack(){ document.getElementById('backBtn').onclick = renderHome; }
function completeMission(id, score, conclusion){
  if (!state.completed.includes(id)) state.completed.push(id);
  state.scores[id] = Math.max(state.scores[id] || 0, score);
  if (id===8) state.finalScore = score;
  saveState();
  const fb = document.getElementById('feedback');
  fb.className = 'feedback success';
  fb.innerHTML = `<strong>✓ Tantangan berhasil</strong><br>${conclusion}`;
  document.getElementById('continueBtn').classList.remove('hidden');
}
function continueHandler(id){
  const btn = document.getElementById('continueBtn');
  btn.onclick = () => id < missions.length ? renderMission(id+1) : renderHome();
}

function renderClassifyMission(m, prop, categories, objective){
  const app = document.getElementById('app');
  let pool = prop==='type' ? items.filter(x=>['hardware','software','brainware'].includes(x.type)).slice(0,9) : items.filter(x=>['input','process','output','storage'].includes(x.fn)).slice(0,6);
  pool = shuffle(pool);
  let selected = {};
  app.innerHTML = missionShell(m, `
    <p class="objective"><strong>TARGET MISI</strong><br>${objective}</p>
    <div id="cards" class="choice-grid"></div>
    <div class="activity-grid"><div id="categoryButtons" class="choice-grid"></div></div>
    <div id="feedback" class="feedback">Tap sebuah kartu, lalu tap kategorinya.</div>
    <div class="row-actions"><button id="checkBtn" class="primary-btn">Periksa</button><button id="continueBtn" class="secondary-btn hidden">Lanjut</button></div>`);
  wireBack();
  const cards = document.getElementById('cards');
  pool.forEach((it,i)=>{
    const b=document.createElement('button'); b.className='choice-card'; b.dataset.i=i;
    b.innerHTML=`<span class="emoji">${it.emoji}</span><strong>${it.name}</strong><div class="small-note" id="label-${i}">Belum dipilih</div>`;
    b.onclick=()=>{ document.querySelectorAll('#cards .choice-card').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); selected.current=i; };
    cards.append(b);
  });
  const labels={hardware:'Hardware',software:'Software',brainware:'Brainware',input:'Input',process:'Process',output:'Output',storage:'Storage'};
  categories.forEach(cat=>{
    const b=document.createElement('button'); b.className='choice-card'; b.innerHTML=`<strong>${labels[cat]}</strong>`;
    b.onclick=()=>{ if(selected.current===undefined) return; selected[selected.current]=cat; document.getElementById(`label-${selected.current}`).textContent=labels[cat]; document.querySelectorAll('#cards .choice-card').forEach(x=>x.classList.remove('selected')); selected.current=undefined; };
    document.getElementById('categoryButtons').append(b);
  });
  document.getElementById('checkBtn').onclick=()=>{
    let correct=0; pool.forEach((it,i)=>{ const card=document.querySelector(`#cards [data-i="${i}"]`); card.classList.remove('correct','wrong'); if(selected[i]===it[prop]){correct++; card.classList.add('correct')} else card.classList.add('wrong'); });
    const score=Math.round(correct/pool.length*100); state.attempts[m.id]=(state.attempts[m.id]||0)+1;
    document.getElementById('feedback').textContent=`${correct} dari ${pool.length} kartu sudah tepat.`;
    if(correct===pool.length){
      completeMission(m.id,score, prop==='type' ? 'Sistem komputer terdiri dari hardware, software, dan brainware yang saling bekerja sama.' : 'Perangkat keras memiliki fungsi input, process, output, dan storage.');
    } else if(state.attempts[m.id]>=2){ document.getElementById('feedback').className='feedback warn'; document.getElementById('feedback').textContent+=' Petunjuk: pikirkan apakah perangkat menerima data, mengolah, menampilkan, atau menyimpan.'; }
  };
  continueHandler(m.id);
}

function renderBuildMission(m){
  const app=document.getElementById('app');
  const set=shuffle(items.filter(x=>['input','process','output','storage'].includes(x.fn)).slice(0,6));
  let chosen={}; let current;
  app.innerHTML=missionShell(m,`<p class="objective"><strong>TARGET MISI</strong><br>Bangun sistem yang dapat menerima data, memproses, menampilkan hasil, dan menyimpan.</p><div id="cards" class="choice-grid"></div><div id="zones" class="choice-grid"></div><div class="flow-view"><div class="flow-node">⌨️ Input</div><span>→</span><div class="flow-node">🧠 Process</div><span>→</span><div class="flow-node">🖥️ Output</div><span>→</span><div class="flow-node">💾 Storage</div></div><div id="feedback" class="feedback">Pilih perangkat lalu pilih slot fungsi.</div><div class="row-actions"><button id="checkBtn" class="primary-btn">Jalankan Sistem</button><button id="continueBtn" class="secondary-btn hidden">Lanjut</button></div>`);
  wireBack();
  set.forEach((it,i)=>{ const b=document.createElement('button'); b.className='choice-card'; b.dataset.i=i; b.innerHTML=`<span class="emoji">${it.emoji}</span><strong>${it.name}</strong><div id="label-${i}" class="small-note">Belum dipasang</div>`; b.onclick=()=>{document.querySelectorAll('#cards .choice-card').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');current=i;}; document.getElementById('cards').append(b);});
  ['input','process','output','storage'].forEach(z=>{ const b=document.createElement('button');b.className='choice-card';b.innerHTML=`<strong>${z.toUpperCase()}</strong>`;b.onclick=()=>{if(current===undefined)return;chosen[current]=z;document.getElementById(`label-${current}`).textContent=z.toUpperCase();current=undefined;document.querySelectorAll('#cards .choice-card').forEach(x=>x.classList.remove('selected'));};document.getElementById('zones').append(b);});
  document.getElementById('checkBtn').onclick=()=>{ const ok=set.every((it,i)=>chosen[i]===it.fn); if(!ok){document.getElementById('feedback').className='feedback warn';document.getElementById('feedback').textContent='Sistem belum tepat. Cek fungsi tiap perangkat.';return;} document.querySelectorAll('.flow-node').forEach((n,i)=>setTimeout(()=>n.classList.add('pulse'),i*350)); setTimeout(()=>document.querySelectorAll('.flow-node').forEach(n=>n.classList.remove('pulse')),1800); completeMission(m.id,100,'Data dapat masuk, diproses, menghasilkan output, lalu disimpan.'); };
  continueHandler(m.id);
}

function renderSequenceMission(m){
  const app=document.getElementById('app');
  const seq=['Keyboard','Processor','Monitor']; const shuffled=shuffle(seq); let picked=[];
  app.innerHTML=missionShell(m,`<p class="objective"><strong>TARGET MISI</strong><br>Susun perjalanan data ketika pengguna mengetik huruf A.</p><div id="seqChoices" class="sequence"></div><div id="picked" class="flow-view"></div><div id="feedback" class="feedback">Tap kartu sesuai urutan.</div><div class="row-actions"><button id="resetSeq" class="ghost-btn">Ulang Urutan</button><button id="checkBtn" class="primary-btn">Periksa</button><button id="continueBtn" class="secondary-btn hidden">Lanjut</button></div>`);
  wireBack();
  shuffled.forEach(name=>{const b=document.createElement('button');b.textContent=name;b.onclick=()=>{if(picked.includes(name))return;picked.push(name);b.classList.add('picked');document.getElementById('picked').innerHTML=picked.map((x,i)=>`${i?'<span>→</span>':''}<div class="flow-node">${x}</div>`).join('');};document.getElementById('seqChoices').append(b);});
  document.getElementById('resetSeq').onclick=()=>{picked=[];document.getElementById('picked').innerHTML='';document.querySelectorAll('#seqChoices button').forEach(b=>b.classList.remove('picked'));};
  document.getElementById('checkBtn').onclick=()=>{if(JSON.stringify(picked)===JSON.stringify(seq)){document.querySelectorAll('.flow-node').forEach((n,i)=>setTimeout(()=>n.classList.add('pulse'),i*300));completeMission(m.id,100,'Ketika mengetik, data masuk melalui keyboard, diproses, lalu hasil visual muncul di monitor.');}else{document.getElementById('feedback').className='feedback warn';document.getElementById('feedback').textContent='Urutan belum tepat. Mulai dari perangkat yang menerima tindakan pengguna.';}};
  continueHandler(m.id);
}

function renderRelationshipMission(m){
  renderSimpleQuestionMission(m, 'Komputer memiliki keyboard, monitor, processor, dan SSD. Apa yang masih dibutuhkan agar pengguna dapat mengetik dokumen?', [
    ['Aplikasi pengolah kata','software'],['Printer','hardware'],['Mouse tambahan','hardware'],['Speaker','hardware']
  ], 'software', 'Hardware menyediakan perangkat fisik, sedangkan software memberikan instruksi agar tugas dapat dijalankan.');
}
function renderBrainwareMission(m){
  renderSimpleQuestionMission(m, 'Dalam aktivitas mengetik dokumen, manakah yang termasuk brainware?', [
    ['Pengguna','brainware'],['Keyboard','hardware'],['Pengolah Kata','software'],['Monitor','hardware']
  ], 'brainware', 'Brainware adalah manusia yang menggunakan atau mengelola sistem komputer.');
}
function renderNeedsMission(m){
  const app=document.getElementById('app');
  const required=['Webcam','Microphone','Monitor','Speaker','Browser'];
  const opts=shuffle(['Webcam','Microphone','Monitor','Speaker','Browser','Printer','Scanner','Kalkulator']); let picked=new Set();
  app.innerHTML=missionShell(m,`<p class="objective"><strong>TARGET MISI</strong><br>Pilih komponen yang relevan untuk mengikuti kelas online.</p><div id="needs" class="choice-grid"></div><div id="feedback" class="feedback">Pilih semua yang menurutmu diperlukan.</div><div class="row-actions"><button id="checkBtn" class="primary-btn">Periksa</button><button id="continueBtn" class="secondary-btn hidden">Lanjut</button></div>`);
  wireBack();
  opts.forEach(name=>{const b=document.createElement('button');b.className='choice-card';b.innerHTML=`<strong>${name}</strong>`;b.onclick=()=>{picked.has(name)?picked.delete(name):picked.add(name);b.classList.toggle('selected');};document.getElementById('needs').append(b);});
  document.getElementById('checkBtn').onclick=()=>{const hit=required.filter(x=>picked.has(x)).length;const wrong=[...picked].filter(x=>!required.includes(x)).length;const score=Math.max(0,Math.round((hit-wrong)/required.length*100));if(hit===required.length&&wrong===0){completeMission(m.id,score,'Pemilihan komponen harus mengikuti kebutuhan pengguna dan fungsi sistem.');}else{document.getElementById('feedback').className='feedback warn';document.getElementById('feedback').textContent='Belum tepat. Pikirkan perangkat untuk video, suara, tampilan, dan software untuk mengakses kelas.';}};
  continueHandler(m.id);
}
function renderFinalMission(m){
  const app=document.getElementById('app');
  const questions=[
    {q:'Keyboard seharusnya berada pada fungsi...',a:'input',opts:['input','output','storage','software']},
    {q:'Komponen yang memproses instruksi adalah...',a:'Processor',opts:['Monitor','Processor','SSD','Keyboard']},
    {q:'Yang termasuk software adalah...',a:'Sistem Operasi',opts:['Sistem Operasi','Monitor','Pengguna','SSD']},
    {q:'Urutan mengetik huruf yang paling tepat adalah...',a:'Keyboard → Processor → Monitor',opts:['Monitor → Keyboard → Processor','Keyboard → Processor → Monitor','SSD → Monitor → Keyboard','Processor → SSD → Speaker']},
  ];
  let index=0,correct=0;
  app.innerHTML=missionShell(m,`<p class="objective"><strong>FINAL MISSION</strong><br>Pulihkan sistem komputer dengan menjawab empat tahap terakhir.</p><div id="finalBox"></div><div id="feedback" class="feedback"></div><div class="row-actions"><button id="continueBtn" class="secondary-btn hidden">Kembali ke Peta</button></div>`);
  wireBack();
  function draw(){const q=questions[index];document.getElementById('finalBox').innerHTML=`<h3>Tahap ${index+1} dari ${questions.length}</h3><p>${q.q}</p><div id="finalOpts" class="choice-grid"></div>`;shuffle(q.opts).forEach(o=>{const b=document.createElement('button');b.className='choice-card';b.textContent=o;b.onclick=()=>{if(o===q.a)correct++;index++;if(index<questions.length)draw();else{const score=Math.round(correct/questions.length*100);completeMission(m.id,score,'Hardware, software, dan brainware bekerja bersama dalam alur input, process, output, dan storage.');document.getElementById('continueBtn').textContent='Kembali ke Peta';}};document.getElementById('finalOpts').append(b);});}
  draw(); continueHandler(m.id);
}
function renderSimpleQuestionMission(m,q,opts,answer,conclusion){
  const app=document.getElementById('app');
  app.innerHTML=missionShell(m,`<p class="objective"><strong>TARGET MISI</strong><br>${q}</p><div id="simpleOpts" class="choice-grid"></div><div id="feedback" class="feedback">Pilih jawaban berdasarkan fungsi komponennya.</div><div class="row-actions"><button id="continueBtn" class="secondary-btn hidden">Lanjut</button></div>`);
  wireBack();
  shuffle(opts).forEach(([label,val])=>{const b=document.createElement('button');b.className='choice-card';b.textContent=label;b.onclick=()=>{document.querySelectorAll('#simpleOpts .choice-card').forEach(x=>x.classList.remove('correct','wrong'));if(val===answer){b.classList.add('correct');completeMission(m.id,100,conclusion);}else{b.classList.add('wrong');document.getElementById('feedback').className='feedback warn';document.getElementById('feedback').textContent='Belum tepat. Perhatikan apakah pilihan itu perangkat fisik, program, atau manusia.';}};document.getElementById('simpleOpts').append(b);});
  continueHandler(m.id);
}
function exportResults(){
  const lines=[
    'HASIL BELAJAR - SISTEM KOMPUTER KELAS VII',
    `Tanggal ekspor: ${new Date().toLocaleString('id-ID')}`,
    '',
    ...missions.map(m=>`Misi ${m.id} - ${m.title}: ${state.completed.includes(m.id)?'Selesai':'Belum selesai'} | Skor: ${state.scores[m.id] ?? '-'}`),
    '',`Skor akhir: ${state.finalScore ?? '-'}`
  ];
  const blob=new Blob([lines.join('\n')],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download='hasil-belajar-sistem-komputer.txt';a.click();URL.revokeObjectURL(url);
}
function openResetModal(){
  const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal card"><h2>Reset perjalanan?</h2><p class="small-note">Semua progress, skor, dan misi yang selesai pada browser ini akan dihapus.</p><div class="row-actions"><button id="cancelReset" class="ghost-btn">Batal</button><button id="confirmReset" class="primary-btn">Reset</button></div></div>`;document.body.append(wrap);document.getElementById('cancelReset').onclick=()=>wrap.remove();document.getElementById('confirmReset').onclick=()=>{localStorage.removeItem(STORAGE_KEY);state=defaultState();wrap.remove();renderHome();showToast('Progress direset');};
}
document.getElementById('resetBtn').onclick=openResetModal;
renderHome();
