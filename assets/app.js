// Dummy credentials for Stage One
const DEMO_EMAIL = "demo@demo";
const DEMO_PW = "letmein";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const pw = document.getElementById("password");
const msg = document.getElementById("authMsg");

// Toggle password show/hide
document.querySelectorAll(".eye").forEach(btn => {
  btn.addEventListener("click", () => {
    const inp = document.querySelector(btn.dataset.eye);
    inp.type = inp.type === "password" ? "text" : "password";
    btn.textContent = inp.type === "password" ? "Show" : "Hide";
  });
});

// Handle login
form.addEventListener("submit", e => {
  e.preventDefault(); msg.style.display = "none";
  const em = email.value.trim().toLowerCase();
  if ((em === DEMO_EMAIL || em.endsWith("@example.com")) && pw.value === DEMO_PW) {
    const session = { user: em, ts: Date.now() };
    localStorage.setItem("session", JSON.stringify(session));
    window.location.href = "home.html"; // redirect to home
  } else {
    msg.textContent = "Invalid login. Try demo@demo / letmein.";
    msg.style.display = "block";
  }
});

// Sign up + reset placeholders (Stage Two features)
document.getElementById("signup").addEventListener("click", () =>
  alert("Sign up coming in Stage Two")
);
document.getElementById("reset").addEventListener("click", e => {
  e.preventDefault();
  alert("Password reset coming in Stage Two");
});
