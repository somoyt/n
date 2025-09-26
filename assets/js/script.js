
(function(){
  const API = window.API_URL || "";
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Font + Dark
  const root = document.documentElement;
  function setFS(delta){
    const now = parseFloat(getComputedStyle(root).getPropertyValue("--fs"));
    root.style.setProperty("--fs", Math.min(22, Math.max(14, now + delta)) + "px");
  }
  const fMinus = qs("#fontMinus"), fPlus = qs("#fontPlus");
  fMinus && fMinus.addEventListener("click", ()=>setFS(-1));
  fPlus && fPlus.addEventListener("click", ()=>setFS(+1));
  const themeBtn = qs("#toggleTheme");
  if(localStorage.getItem("somoy-theme")==="dark") document.body.classList.add("dark");
  themeBtn && themeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("somoy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  function timeago(ts){
    if(!ts) return "";
    const diff = Date.now()-ts;
    const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
    if (m < 1) return "এইমাত্র";
    if (m < 60) return m + " মিনিট আগে";
    if (h < 24) return h + " ঘন্টা আগে";
    if (d === 1) return "গতকাল";
    return new Date(ts).toLocaleString("bn-BD");
  }
  function imgTag(n, w, h){
    const src = n.image ? n.image : "";
    const alt = n.title || "";
    const attrs = ['loading="lazy"'];
    if(w&&h) attrs.push(`width="${w}" height="${h}"`);
    return src ? `<img src="${src}" alt="${alt}" ${attrs.join(" ")}>` : "";
  }

  function rowItem(n){
    return `<a class="row" href="news.html?id=${n.id}">${imgTag(n,160,100)}<div><div class="meta"><span class="badge">${n.category||""}</span> · ${timeago(n.timestamp)}</div><h4>${n.title}</h4><div class="meta">${n.summary||""}</div></div></a>`;
  }
  function plainItem(n){
    return `<a href="news.html?id=${n.id}"><span class="meta"><span class="badge">${n.category||""}</span> · ${timeago(n.timestamp)}</span><br>${n.title}</a>`;
  }

  async function fetchList(limit=60){
    const res = await fetch(API + "?limit=" + limit);
    return await res.json();
  }

  function buildTicker(list){
    const track = list.slice(0,8).map(n=>`<span>• ${n.title}</span>`).join("");
    const ticker = qs("#breaking");
    if(ticker) ticker.innerHTML = `<span class="track">${track}&nbsp;&nbsp;&nbsp;${track}</span>`;
  }

  function buildHero(list){
    const big = qs("#heroBig");
    const small = qs("#heroList");
    if(!big || !small) return;
    const top = list[0];
    const next4 = list.slice(1,5);
    if(top){
      big.innerHTML = `<a href="news.html?id=${top.id}">${imgTag(top)}<h2 class="item-title">${top.title}</h2><div class="meta">${top.summary||""}</div></a>`;
    }
    if(next4.length){
      small.innerHTML = `<div class="mini">` + next4.map(n=>`<a href="news.html?id=${n.id}">${imgTag(n,120,70)}<div><div class="meta">${timeago(n.timestamp)}</div><strong>${n.title}</strong></div></a>`).join("") + `</div>`;
    }
  }

  function buildTrending(list){
    const el = qs("#trending");
    if(!el) return;
    el.innerHTML = list.slice(0,8).map(plainItem).join("");
  }

  function buildCategories(list){
    const wrap = qs("#categories");
    if(!wrap) return;
    const cats = ["জাতীয়","আন্তর্জাতিক","খেলা","অর্থনীতি","বিনোদন","মতামত","প্রযুক্তি"];
    wrap.innerHTML = "";
    cats.forEach(cat=>{
      const items = list.filter(n=>(n.category||"").trim()===cat).slice(0,6);
      if(!items.length) return;
      const html = `<section><h2 class="section-title">${cat}</h2><div class="list-rows">`+items.map(rowItem).join("")+`</div></section>`;
      wrap.insertAdjacentHTML("beforeend", html);
    });
  }

  async function init(){
    let list = await fetchList(80);
    if(!Array.isArray(list)) list = [];
    buildTicker(list);
    buildHero(list);
    buildTrending(list);

    // Latest with pagination
    const latest = qs("#latest");
    let page = 1, per = 10;
    const render = ()=>{
      const slice = list.slice((page-1)*per, page*per);
      latest.insertAdjacentHTML("beforeend", slice.map(rowItem).join(""));
    };
    render();
    const btn = qs("#loadMore");
    btn && btn.addEventListener("click", ()=>{ page++; render(); if(page*per >= list.length) btn.remove(); });

    buildCategories(list);

    // Search
    const si = qs("#searchInput");
    if(si){
      si.addEventListener("input", ()=>{
        const q = si.value.trim().toLowerCase();
        const filtered = list.filter(n =>
          (n.title||"").toLowerCase().includes(q) ||
          (n.summary||"").toLowerCase().includes(q) ||
          (n.body||"").toLowerCase().includes(q));
        latest.innerHTML = filtered.slice(0,30).map(rowItem).join("");
      });
    }

    // Category filter from header
    qsa(".nav a[data-cat]").forEach(a=>{
      a.addEventListener("click",(e)=>{
        e.preventDefault();
        qsa(".nav a").forEach(x=>x.classList.remove("active"));
        a.classList.add("active");
        const cat = a.dataset.cat;
        let filtered = list;
        if(cat && cat!=="all") filtered = list.filter(n => (n.category||"").trim()===cat);
        latest.innerHTML = filtered.slice(0,20).map(rowItem).join("");
      });
    });
  }
  init();
})();

// Animate brand logo watch hands
function animateBrandWatch(){
  const h=document.querySelector('.hand.hour'),m=document.querySelector('.hand.minute'),s=document.querySelector('.hand.second');
  if(!h||!m||!s) return;
  function tick(){
    const now=new Date();const sec=now.getSeconds();const min=now.getMinutes()+sec/60;const hr=(now.getHours()%12)+min/60;
    h.style.transform=`translate(-50%,-100%) rotate(${hr*30}deg)`;
    m.style.transform=`translate(-50%,-100%) rotate(${min*6}deg)`;
    s.style.transform=`translate(-50%,-100%) rotate(${sec*6}deg)`;
  }
  tick();setInterval(tick,1000);
}
animateBrandWatch();


// === Mobile Menu Toggle ===
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navbar = document.querySelector(".navbar");
  if (toggleBtn && navbar) {
    toggleBtn.addEventListener("click", () => {
      navbar.classList.toggle("show");
    });
  }
});
