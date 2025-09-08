/* Fundamentals Core — shared by all CourseX.html
 * Features:
 * - Loads course JSON (title, modules[10], questions, tips)
 * - Hash routing: #/m/0 ... #/m/9
 * - Read-only preview for future modules
 * - Badge per module: reveal all answers -> badge true
 * - Points per module (course.default or module override)
 * - Updates profile.points and header pill
 * - Persists state in localStorage
 */

(function (global) {
  const Fundamentals = {};
  const SEL = {
    courseTitle:  "#courseTitle",
    lockedBanner: "#lockedBanner",
    video:        "#video",
    playerWrap:   "#playerWrap",
    moduleTitle:  "#moduleTitle",
    summary:      "#summary",
    tipsWrap:     "#tipsWrap",
    qaWrap:       "#qaWrap",
    chips:        "#progressChips",
    btnPrev:      "#btnPrev",
    btnNext:      "#btnNext",
    pointsPill:   "#pointsPill"
  };

  /* ---------- Storage helpers ---------- */
  const LS = {
    get(k, f) { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };

  function ensureProfile() {
    let p = LS.get("profile", null);
    if (!p) {
      p = { name: "Artist", avatarUrl: "", points: 0, badges: [], portfolio: [] };
      LS.set("profile", p);
    }
    return p;
  }

  function saveProfile(patch) {
    const p = Object.assign(ensureProfile(), patch || {});
    LS.set("profile", p);
    return p;
  }

  /* ---------- State ---------- */
  const S = {
    courseId: "",
    dataUrl: "",
    data: null,          // loaded JSON
    progress: null,      // localStorage course:<id>
    currentIdx: 0,       // active module index
    readOnly: false      // if viewing a future module
  };

  /* ---------- Init ---------- */
  Fundamentals.init = async function ({ courseId, dataUrl }) {
    S.courseId = courseId;
    S.dataUrl = dataUrl;

    // load data
    S.data = await fetch(dataUrl).then(r => {
      if (!r.ok) throw new Error("Failed to load course JSON");
      return r.json();
    });

    // ensure 10 modules
    if (!Array.isArray(S.data.modules) || S.data.modules.length !== 10) {
      console.warn("Expected exactly 10 modules for fundamentals courses.");
    }

    // load or seed progress
    S.progress = LS.get("course:" + courseId, null);
    if (!S.progress) {
      S.progress = {
        modules: Array.from({ length: S.data.modules.length }, () => ({ badge: false, pointsAwarded: false })),
        courseBadge: false
      };
      LS.set("course:" + courseId, S.progress);
    }

    // header points pill
    updatePointsPill();

    // first render
    window.addEventListener("hashchange", render);
    window.addEventListener("beforeunload", () => persist());
    render();
  };

  /* ---------- Render ---------- */
  function render() {
    const { title, modules, pointsPerModule } = S.data;
    q(SEL.courseTitle).textContent = title || "Course";

    // which module?
    const idx = parseInt((location.hash || "").replace("#/m/", ""), 10);
    S.currentIdx = Number.isFinite(idx) ? Math.max(0, Math.min(modules.length - 1, idx)) : 0;

    // gating: determine furthest unlocked
    const furthestUnlocked = maxUnlockedIndex();

    // read-only if trying to jump beyond furthest
    S.readOnly = S.currentIdx > furthestUnlocked;

    // locked banner
    const banner = q(SEL.lockedBanner);
    if (S.readOnly) {
      banner.textContent = "Preview only — complete earlier exercises to unlock this module.";
      banner.classList.add("locked");
    } else {
      banner.textContent = "";
      banner.classList.remove("locked");
    }

    // module content
    const mod = modules[S.currentIdx] || {};
    q(SEL.moduleTitle).textContent = mod.title || `Exercise ${S.currentIdx + 1}`;
    q(SEL.summary).textContent = mod.summary || "";
    q(SEL.tipsWrap).textContent = mod.tips || "";

    // video
    const video = q(SEL.video);
    video.src = mod.video || "";
    video.currentTime = 0;
    video.onended = () => q(SEL.playerWrap)?.classList.add("minimised");

    // QA render
    const qaWrap = q(SEL.qaWrap);
    qaWrap.innerHTML = "";
    const questions = Array.isArray(mod.questions) ? mod.questions : [];
    questions.forEach((qa, i) => {
      const item = document.createElement("div");
      item.className = "q";
      item.innerHTML = `
        <div>${escapeHTML(qa.q || `Question ${i + 1}`)}</div>
        <button ${S.readOnly ? "disabled" : ""}>Reveal</button>
        <div class="a">${escapeHTML(qa.a || "Answer")}</div>
      `;
      const btn = item.querySelector("button");
      btn.addEventListener("click", () => {
        item.classList.add("revealed");
        maybeEarnBadge(questions.length);
      });
      qaWrap.appendChild(item);
    });

    // progress chips
    const chips = q(SEL.chips);
    chips.innerHTML = "";
    modules.forEach((m, i) => {
      const chip = document.createElement("div");
      const earned = !!S.progress.modules[i]?.badge;
      chip.className = "chip" + (earned ? " earned" : "");
      chip.textContent = i + 1;
      chip.title = earned ? "Badge earned" : (i <= furthestUnlocked ? "Go to module" : "Locked (preview only)");
      chip.addEventListener("click", () => {
        // allow preview click into future, but it will be read-only
        location.hash = "#/m/" + i;
      });
      chips.appendChild(chip);
    });

    // prev/next
    const prev = q(SEL.btnPrev);
    const next = q(SEL.btnNext);
    prev.disabled = S.currentIdx === 0;
    prev.onclick = () => {
      if (S.currentIdx > 0) location.hash = "#/m/" + (S.currentIdx - 1);
    };

    // Next rules:
    // - if not last module: require badge to proceed
    // - if last and badge earned: go to certificate
    next.onclick = () => {
      const isLast = S.currentIdx >= modules.length - 1;
      if (!S.progress.modules[S.currentIdx]?.badge) {
        alert("Reveal all answers to earn this exercise badge before proceeding.");
        return;
      }
      if (isLast) {
        const url = `certificate.html?courseId=${encodeURIComponent(S.courseId)}&courseTitle=${encodeURIComponent(title)}`;
        location.href = url;
      } else {
        location.hash = "#/m/" + (S.currentIdx + 1);
      }
    };
    // Style next button enabled/disabled visually
    next.disabled = !S.progress.modules[S.currentIdx]?.badge;

    // ensure UI reflects current points
    updatePointsPill();
  }

  /* ---------- Logic ---------- */
  function maybeEarnBadge(totalQs) {
    if (S.readOnly) return; // no earning in preview
    const revealed = document.querySelectorAll(".q.revealed").length;
    if (revealed < totalQs) return;

    // award badge if not already
    const modState = S.progress.modules[S.currentIdx] || { badge: false, pointsAwarded: false };
    if (!modState.badge) {
      modState.badge = true;

      // award points once
      const pts = modulePoints(S.currentIdx);
      if (!modState.pointsAwarded && pts > 0) {
        modState.pointsAwarded = true;
        const p = ensureProfile();
        p.points = (p.points || 0) + pts;
        LS.set("profile", p);
        updatePointsPill();
      }

      S.progress.modules[S.currentIdx] = modState;
      persist();
      // re-render chips & next button
      render();
      toast(`Badge earned! +${modulePoints(S.currentIdx)} pts`);
    }
  }

  function modulePoints(i) {
    const def = Number(S.data.pointsPerModule || 0);
    const per = Number(S.data.modules?.[i]?.points ?? NaN);
    return Number.isFinite(per) ? per : def;
  }

  function maxUnlockedIndex() {
    // unlocked = last index whose badge is true, else 0
    // allow next module (current gate) to be interactable; future = read-only
    let furthest = 0;
    for (let i = 0; i < S.progress.modules.length; i++) {
      if (S.progress.modules[i]?.badge) furthest = i + 1; // next after last earned
      else break;
    }
    return Math.min(furthest, S.data.modules.length - 1);
  }

  function persist() {
    LS.set("course:" + S.courseId, S.progress);
  }

  function updatePointsPill() {
    const pill = q(SEL.pointsPill);
    if (!pill) return;
    const p = ensureProfile();
    pill.textContent = `Points: ${p.points || 0}`;
  }

  /* ---------- Utils ---------- */
  function q(sel) { return document.querySelector(sel); }

  function escapeHTML(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function toast(msg) {
    // very lightweight toast using alert for now (no external CSS dependency)
    // replace with custom UI toast if you like
    console.log("[toast]", msg);
  }

  // expose
  global.Fundamentals = Fundamentals;
})(window);