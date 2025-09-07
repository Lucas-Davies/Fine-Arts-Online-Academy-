// Stage One dummy credentials
const DEMO_EMAIL = "demo@demo";
const DEMO_PW = "letmein";

// Elements
const modal = document.getElementById("loginModal");
const openLogin = document.getElementById("openLogin");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const pw = document.getElementById("password");
const msg = document.getElementById("authMsg");
const joinFree = document.getElementById("joinFree");

// Modal controls
function showModal(){ modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); }
function hideModal(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); }

// Open/close modal
openLogin.addEventListener("click", showModal);
closeLogin.addEventListener("click", hideModal);
modal.addEventListener("click", (e)=>{ if(e.target===modal) hideModal(); });

// Password eye toggle
document.querySelectorAll(".eye").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const inp=document.querySelector(btn.dataset.eye);
    inp.type = inp.type==="password" ? "text" : "password";
    btn.textContent = inp.type==="password" ? "Show" : "Hide";
  });
});

// Join Free -> guest session -> home
joinFree.addEventListener("click", ()=>{
  localStorage.setItem("session", JSON.stringify({ user:"guest", ts:Date.now(), kind:"free" }));
  window.location.href="home.html";
});

// Login form
loginForm.addEventListener("submit", e=>{
  e.preventDefault(); msg.hidden = true;
  const em = email.value.trim().toLowerCase();
  if ((em === DEMO_EMAIL || em.endsWith("@example.com")) && pw.value === DEMO_PW) {
    localStorage.setItem("session", JSON.stringify({ user: em, ts: Date.now(), kind:"login" }));
    window.location.href="home.html";
  } else {
    msg.textContent = "Invalid login. Use demo@demo / letmein.";
    msg.hidden = false;
  }
});

// Placeholders for Stage Two features
document.getElementById("signup").addEventListener("click", ()=>alert("Sign up coming in Stage Two"));
document.getElementById("reset").addEventListener("click", ()=>alert("Password reset coming in Stage Two"));
