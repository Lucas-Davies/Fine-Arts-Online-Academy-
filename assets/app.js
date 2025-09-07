// ---------- Config (Stage One dummy) ----------
const DEMO_EMAIL = "demo@demo";
const DEMO_PW = "letmein";

// ---------- Elements ----------
const modal = document.getElementById("loginModal");
const openLogin = document.getElementById("openLogin");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const pw = document.getElementById("password");
const msg = document.getElementById("authMsg");

const ctaForm = document.getElementById("ctaForm");
const ctaEmail = document.getElementById("ctaEmail");

// ---------- Helpers ----------
function showModal() { modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); }
function hideModal() { modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); }
function gotoHome() { window.location.href = "home.html"; }

// ---------- Top-right Sign in -> open modal ----------
openLogin.addEventListener("click", showModal);
document.getElementById("closeLogin").addEventListener("click", hideModal);
modal.addEventListener("click", (e)=>{ if(e.target===modal) hideModal(); });

// ---------- Password eye toggle ----------
document.querySelectorAll(".eye").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const inp = document.querySelector(btn.dataset.eye);
    inp.type = inp.type === "password" ? "text" : "password";
    btn.textContent = inp.type === "password" ? "Show" : "Hide";
  });
});

// ---------- CTA Get started (demo) ----------
ctaForm.addEventListener("submit", e=>{
  e.preventDefault();
  const em = ctaEmail.value.trim().toLowerCase();
  if(!em) return;
  // Demo behaviour: treat CTA as soft sign-in, then to home
  localStorage.setItem("session", JSON.stringify({ user: em, ts: Date.now(), kind: "cta" }));
  gotoHome();
});

// ---------- Real login (dummy check) ----------
loginForm.addEventListener("submit", e=>{
  e.preventDefault(); msg.hidden = true;
  const em = email.value.trim().toLowerCase();
  if ((em === DEMO_EMAIL || em.endsWith("@example.com")) && pw.value === DEMO_PW) {
    localStorage.setItem("session", JSON.stringify({ user: em, ts: Date.now(), kind: "login" }));
    gotoHome();
  } else {
    msg.textContent = "Invalid login. Use demo@demo / letmein.";
    msg.hidden = false;
  }
});

// ---------- Stage One placeholders ----------
document.getElementById("signup").addEventListener("click", ()=>alert("Sign up coming in Stage Two"));
document.getElementById("reset").addEventListener("click", ()=>alert("Password reset coming in Stage Two"));
