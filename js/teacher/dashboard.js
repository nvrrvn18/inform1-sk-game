const client = window.supabaseClient;
let allStudents = [], allProgress = [], allFinal = [];
let teacherCode = sessionStorage.getItem("teacher_dashboard_code") || "";

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("loginForm").addEventListener("submit", login);
  $("logoutBtn").addEventListener("click", logout);
  $("refreshBtn").addEventListener("click", loadData);
  $("searchInput").addEventListener("input", render);
  $("classFilter").addEventListener("change", render);
  $("exportBtn").addEventListener("click", exportCSV);

  if (teacherCode) loadData();
});

async function login(e){
  e.preventDefault();
  const code = $("teacherCode").value.trim();
  if(!code) return;

  const { data, error } = await client.rpc("get_teacher_dashboard", { p_code: code });

  if(error){
    showError("Kode guru tidak valid atau fungsi dashboard belum dipasang.");
    console.error(error);
    return;
  }

  if(!data || data.valid !== true){
    showError("Kode guru salah.");
    return;
  }

  teacherCode = code;
  sessionStorage.setItem("teacher_dashboard_code", code);
  showDashboard();
  applyData(data);
}

async function loadData(){
  if(!teacherCode) return;
  showDashboard();
  setStatus("Memuat data siswa...");

  const { data, error } = await client.rpc("get_teacher_dashboard", { p_code: teacherCode });

  if(error){
    logout();
    showError("Sesi dashboard tidak valid. Masukkan kembali kode guru.");
    console.error(error);
    return;
  }

  if(!data || data.valid !== true){
    logout();
    showError("Kode guru tidak valid.");
    return;
  }

  applyData(data);
}

function applyData(data){
  allStudents = data.students || [];
  allProgress = data.progress || [];
  allFinal = data.final_results || [];

  populateClasses();
  renderStats();
  render();
  setStatus("");
  $("lastUpdated").textContent = new Date().toLocaleString("id-ID");
}

function showDashboard(){
  $("loginPanel").classList.add("hidden");
  $("dashboardPanel").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");
}

function logout(){
  teacherCode = "";
  sessionStorage.removeItem("teacher_dashboard_code");
  $("dashboardPanel").classList.add("hidden");
  $("loginPanel").classList.remove("hidden");
  $("logoutBtn").classList.add("hidden");
  $("teacherCode").value = "";
}

function populateClasses(){
  const select = $("classFilter");
  const current = select.value;
  const classes = [...new Set(allStudents.map(s=>s.kelas).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"id"));
  select.innerHTML = '<option value="">Semua kelas</option>';
  classes.forEach(k=>{
    const o=document.createElement("option"); o.value=k; o.textContent=k; select.appendChild(o);
  });
  select.value=current;
}

function renderStats(){
  const active = new Set(allProgress.map(p=>p.user_id)).size;
  const completed = allProgress.filter(p=>p.completed).length;
  const scores = [
    ...allProgress.filter(p=>p.completed).map(p=>Number(p.best_score ?? p.score ?? 0)),
    ...allFinal.map(f=>Number(f.final_score ?? 0))
  ];
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  $("totalStudents").textContent=allStudents.length;
  $("activeStudents").textContent=active;
  $("completedMissions").textContent=completed;
  $("averageScore").textContent=avg;
}

function render(){
  const search=$("searchInput").value.trim().toLowerCase();
  const cls=$("classFilter").value;
  const list=allStudents.filter(s=>
    (!search || String(s.nama).toLowerCase().includes(search)) &&
    (!cls || s.kelas===cls)
  );
  const body=$("progressBody");
  body.innerHTML="";
  $("rowCount").textContent=`${list.length} siswa`;
  $("emptyState").classList.toggle("hidden", list.length!==0);

  list.forEach(s=>{
    const p=Object.fromEntries(allProgress.filter(x=>x.user_id===s.user_id).map(x=>[x.mission_id,x]));
    const f=allFinal.find(x=>x.user_id===s.user_id);
    const vals=["misi1","misi2","misi3","misi4"].map(id=>p[id]?.best_score ?? null);
    const final=f?.final_score ?? null;
    const nums=[...vals,final].filter(v=>v!==null).map(Number);
    const avg=nums.length?Math.round(nums.reduce((a,b)=>a+b,0)/nums.length):null;
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${esc(s.nama)}</td><td>${esc(s.kelas||"-")}</td>
      ${vals.map(v=>`<td>${v===null?'<span class="not-started">-</span>':`<span class="score done">${v}</span>`}</td>`).join("")}
      <td>${final===null?'<span class="not-started">-</span>':`<span class="score done">${final}</span>`}</td>
      <td>${avg===null?'<span class="not-started">-</span>':`<span class="avg">${avg}</span>`}</td>`;
    body.appendChild(tr);
  });
}

function exportCSV(){
  const search=$("searchInput").value.trim().toLowerCase(), cls=$("classFilter").value;
  const list=allStudents.filter(s=>(!search||s.nama.toLowerCase().includes(search))&&(!cls||s.kelas===cls));
  const rows=[["Nama","Kelas","Misi 1","Misi 2","Misi 3","Misi 4","Final","Rata-rata"]];
  list.forEach(s=>{
    const p=Object.fromEntries(allProgress.filter(x=>x.user_id===s.user_id).map(x=>[x.mission_id,x]));
    const f=allFinal.find(x=>x.user_id===s.user_id);
    const vals=["misi1","misi2","misi3","misi4"].map(id=>p[id]?.best_score??"");
    const fin=f?.final_score??"";
    const nums=[...vals,fin].filter(v=>v!=="").map(Number);
    const avg=nums.length?Math.round(nums.reduce((a,b)=>a+b,0)/nums.length):"";
    rows.push([s.nama,s.kelas,...vals,fin,avg]);
  });
  const csv="\ufeff"+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  a.download=`progress-sistem-komputer-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function showError(msg){ $("loginError").textContent=msg; }
function setStatus(msg){ $("statusMessage").textContent=msg||""; $("statusMessage").classList.toggle("hidden",!msg); }
function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
