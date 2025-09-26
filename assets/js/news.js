
(function(){
  const API = window.API_URL || "";
  const qs = s => document.querySelector(s);
  function timeago(ts){
    if(!ts) return "";
    const diff = Date.now() - ts;
    const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
    if (m < 1) return "এইমাত্র";
    if (m < 60) return m + " মিনিট আগে";
    if (h < 24) return h + " ঘন্টা আগে";
    if (d === 1) return "গতকাল";
    return new Date(ts).toLocaleString("bn-BD");
  }
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  fetch(API + (id? ("?id="+encodeURIComponent(id)) : ""))
    .then(r=>r.json())
    .then(d=>{
      const n = Array.isArray(d)? d[0] : d;
      if(!n || !n.title){ qs("#title").textContent="পাওয়া যায়নি"; return; }
      qs("#title").textContent = n.title;
      qs("#cat").textContent = n.category || "";
      qs("#time").textContent = timeago(n.timestamp||null);
      if(qs("#time").setAttribute) qs("#time").setAttribute("datetime", new Date(n.timestamp||Date.now()).toISOString());
      qs("#author").textContent = n.author || "";
      if(n.image){ const img=qs("#hero"); img.src=n.image; img.alt=n.title; }
      qs("#summary").textContent = n.summary || "";
      qs("#body").innerHTML = (n.body||"").replace(/\n/g,"<br>");
      // Schema extras
      const art = qs("#article");
      art.setAttribute("itemid", location.href);
      // Optional: could inject meta tags for SEO here if needed
    })
    .catch(_=>{ qs("#title").textContent="লোড করতে সমস্যা হয়েছে"; });

  const themeBtn = document.getElementById("toggleTheme");
  if(localStorage.getItem("somoy-theme")==="dark") document.body.classList.add("dark");
  themeBtn && themeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("somoy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
})();
