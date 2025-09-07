// Demo credentials
const DEMO_EMAIL = "demo@demo";
const DEMO_PW = "letmein";

const modal = document.getElementById("loginModal");
const openLogin = document.getElementById("openLogin");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const pw = document.getElementById("password");
const msg = document.getElementById("authMsg");
const joinUs = document.getElementById("joinUs");

// Modal controls
function showModal(){ modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); }
function hideModal(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); }

openLogin.addEventListener("click", showModal);
closeLogin.addEventListener("click", hideModal);
modal.addEventListener("click", (e)=>{ if(e.target===modal) hideModal(); });

// Join Us → demo direct access to home
joinUs.addEventListener("click", ()=>{
  localStorage.setItem("session", JSON.stringify({ user:"guest", ts:Date.now(), kind:"join" }));
  window.location.href="home.html";
});

// Password eye toggle
document.querySelectorAll(".eye").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const inp=document.querySelector(btn.dataset.eye);
    inp.type = inp.type==="password" ? "text" : "password";
    btn.textContent = inp.type==="password" ? "Show" : "Hide";
  });
});

// Login form
loginForm.addEventListener("submit", e=>{
  e.preventDefault(); msg.hidden=true;
  const em=email.value.trim().toLowerCase();
  if((em===DEMO_EMAIL || em.endsWith("@example.com")) && pw.value===DEMO_PW){
    localStorage.setItem("session", JSON.stringify({ user:em, ts:Date.now(), kind:"login" }));
    window.location.href="home.html";
  } else {
    msg.textContent="Invalid login. Use demo@demo / letmein.";
    msg.hidden=false;
  }
});

// Placeholders
document.getElementById("signup").addEventListener("click", ()=>alert("Sign up coming in Stage Two"));
document.getElementById("reset").addEventListener("click", ()=>alert("Password reset coming in Stage Two"));
