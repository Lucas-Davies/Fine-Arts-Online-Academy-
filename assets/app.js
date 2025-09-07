// Stage One dummy credentials
const DEMO_EMAIL = "demo@demo";
const DEMO_PW = "letmein";

// Helpers
const q = id => document.getElementById(id);
const on = (el, evt, fn) => el && el.addEventListener(evt, fn);

// Landing elements (optional on other pages)
const modal     = q("loginModal");
const openLogin = q("openLogin");
const closeLogin= q("closeLogin");
const loginForm = q("loginForm");
const email     = q("email");
const pw        = q("password");
const msg       = q("authMsg");
const joinFree  = q("joinFree");

// Modal controls
function showModal(){ if(modal){ modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); } }
function hideModal(){ if(modal){ modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); } }
on(openLogin, "click", showModal);
on(closeLogin,"click", hideModal);
if (modal) modal.addEventListener("click", (e)=>{ if(e.target===modal) hideModal(); });

// Password eye toggle (works if .eye exists)
document.querySelectorAll(".eye").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const inp = document.querySelector(btn.dataset.eye);
    if(!inp) return;
    inp.type = inp.type === "password" ? "text" : "password";
    btn.textContent = inp.type === "password" ? "Show" : "Hide";
  });
});

// Join Free -> guest session -> home
on(joinFree, "click", ()=>{
  localStorage.setItem("session", JSON.stringify({ user:"guest", ts:Date.now(), kind:"free" }));
  window.location.href="home.html";
});

// Login form
on(loginForm, "submit", e=>{
  e.preventDefault(); if (msg) msg.hidden = true;
  const em = (email?.value || "").trim().toLowerCase();
  if ((em === DEMO_EMAIL || em.endsWith("@example.com")) && (pw?.value === DEMO_PW)) {
    localStorage.setItem("session", JSON.stringify({ user: em, ts: Date.now(), kind:"login" }));
    window.location.href="home.html";
  } else if (msg) {
    msg.textContent = "Invalid login. Use demo@demo / letmein.";
    msg.hidden = false;
  }
});

// Stage Two placeholders
on(q("signup"), "click", ()=>alert("Sign up coming in Stage Two"));
on(q("reset"),  "click", ()=>alert("Password reset coming in Stage Two"));

// Home: Sign Out
on(q("logoutBtn"), "click", ()=>{
  try { localStorage.removeItem("session"); } catch(e) {}
  window.location.href = "index.html";
});
