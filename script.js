// WhatsApp community invite link (https://chat.whatsapp.com/…). WhatsApp links stay hidden until this is set.
const WHATSAPP_URL = "";
document.querySelectorAll("[data-whatsapp]").forEach((a) => { if (WHATSAPP_URL) a.href = WHATSAPP_URL; });
document.querySelectorAll("[data-whatsapp-block]").forEach((el) => { el.hidden = !WHATSAPP_URL; });

// Where contact form submissions go.
const CONTACT_EMAIL = "esther.jacob@guardoc.health";

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");

// Sticky nav shadow
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menu (three-line button)
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
toggle.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(!nav.classList.contains("open"));
});
document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (e) => { if (!e.target.closest(".nav-links")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// Role filters
const chips = document.querySelectorAll(".chip");
const roles = document.querySelectorAll(".role");
chips.forEach((chip) =>
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    roles.forEach((r) => r.classList.toggle("hidden", f !== "all" && r.dataset.cat !== f));
  })
);

// Contact form → opens the visitor's email client
const form = document.getElementById("contact-form");
const note = form?.querySelector(".form-note");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  form.name.classList.toggle("invalid", !name);
  form.email.classList.toggle("invalid", !/^\S+@\S+\.\S+$/.test(email));
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    note.style.color = "#e0475b";
    note.textContent = "Please add your name and a valid email.";
    return;
  }
  const subject = `Nurse2Tech: ${form.interest.value}`;
  const body = `Name: ${name}\nEmail: ${email}\nInterest: ${form.interest.value}\n\n${form.message.value}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.style.color = "";
  note.textContent = `Thanks, ${name.split(" ")[0]}! Your email app should open now.`;
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Generic FormSubmit handler: <form data-formsubmit data-subject="… {field} …" data-success="#id">
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/esther.jacob@guardoc.health";
document.querySelectorAll("form[data-formsubmit]").forEach((f) => {
  const status = f.querySelector(".form-note");
  const btn = f.querySelector('button[type="submit"]');
  const btnHtml = btn.innerHTML;
  const fail = (msg, el) => {
    status.style.color = "#e0475b";
    status.textContent = msg;
    el?.focus();
  };

  f.addEventListener("input", (e) => e.target.classList?.remove("invalid"));
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    let firstBad = null;
    f.querySelectorAll("[required]").forEach((el) => {
      const v = el.type === "checkbox" ? (el.checked ? "y" : "") : el.value.trim();
      const bad = !v || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(v));
      el.classList.toggle("invalid", bad);
      if (bad) firstBad ??= el;
    });
    if (firstBad) return fail("Please fill in the highlighted fields.", firstBad);

    const data = new FormData(f);
    const subject = (f.dataset.subject || "New Nurse2Tech message").replace(/\{(\w+)\}/g, (_, k) => data.get(k) || "");
    data.set("_subject", subject);
    if (data.get("email")) data.set("_replyto", data.get("email"));
    data.set("_template", "table");
    data.set("_captcha", "false");

    btn.disabled = true;
    btn.textContent = "Sending…";
    status.textContent = "";
    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "Submission failed.");
      f.hidden = true;
      const ok = document.querySelector(f.dataset.success);
      if (ok) ok.hidden = false;
    } catch (err) {
      fail(`Sorry, something went wrong: ${err.message} Please try again in a moment.`);
      btn.disabled = false;
      btn.innerHTML = btnHtml;
    }
  });
});

// Home: newest three jobs from the job board
const latestJobs = document.getElementById("latest-jobs");
if (latestJobs) {
  const LABELS = { informatics: "Clinical Informatics", product: "Product Management", ux: "UX Research / Design", implementation: "Clinical Implementation", success: "Clinical Success", ai: "Clinical AI", sales: "Sales / Solutions", data: "Data & Analytics", operations: "Clinical Operations" };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  fetch("jobs.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      const jobs = (d.jobs || []).sort((a, b) => String(b.posted).localeCompare(String(a.posted))).slice(0, 3);
      if (!jobs.length) { document.getElementById("latest").hidden = true; return; }
      const statRoles = document.getElementById("stat-roles");
      if (statRoles) statRoles.textContent = (d.jobs || []).length;
      const companies = [...new Set((d.jobs || []).map((j) => j.company))];
      const strip = document.getElementById("latest-companies");
      if (strip && companies.length) {
        strip.innerHTML = `<span>Roles we've shared from</span>` + companies.map((c) => `<b>${esc(c)}</b>`).join("<i></i>");
        strip.hidden = false;
      }
      latestJobs.innerHTML = jobs.map((j) => `
        <a class="lj" href="${esc(j.url)}" target="_blank" rel="noopener">
          <span class="lj-tags">${(Date.now() - new Date(j.posted + "T00:00:00")) / 86400000 <= 7 ? `<span class="lj-tag lj-new">New</span>` : ""}<span class="lj-tag">${esc(LABELS[j.category] || j.category)}</span></span>
          <b>${esc(j.title)}</b>
          <span class="lj-co">${esc(j.company)} · ${esc(j.location)}</span>
          <span class="lj-go">View role →</span>
        </a>`).join("");
    })
    .catch(() => { document.getElementById("latest").hidden = true; });
}

// Contact page: preselect the topic from a link like contact.html?topic=nominate
const topicSel = document.getElementById("c-topic");
if (topicSel) {
  const want = new URLSearchParams(location.search).get("topic");
  const map = { nominate: "Nominate a nurse for N2T Spotlight" };
  if (want && map[want]) topicSel.value = map[want];
}

// Statistics: count up from 0 when the strip scrolls into view
const statNums = document.querySelectorAll(".stats-nums b");
if (statNums.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const run = (el) => {
    const m = el.textContent.trim().match(/^(\d+)(\D*)$/);
    if (!m) return;                       // e.g. "1:1" stays as it is
    const end = +m[1], suffix = m[2], t0 = performance.now(), dur = 1200;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { io.unobserve(e.target); setTimeout(() => run(e.target), 150); }
  }), { threshold: 0.6 });
  statNums.forEach((el) => io.observe(el));
}

// "Next event" banner: shows on every page only when an upcoming event exists
fetch("events.json", { cache: "no-store" })
  .then((r) => r.json())
  .then((d) => {
    const today = new Date().toISOString().slice(0, 10);
    const next = (d.events || []).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    if (!next) return;
    try { if (sessionStorage.getItem("n2t-hide-event") === next.title) return; } catch (e) {}
    const when = new Date(next.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const bar = document.createElement("div");
    bar.className = "event-bar";
    const safe = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    bar.innerHTML = `<div class="container event-bar-inner"><span><b>Next event:</b> ${safe(next.title)} · ${when}${next.time ? " · " + safe(next.time) : ""}</span><a href="${safe(next.url || "events.html")}"${next.url ? ' target="_blank" rel="noopener"' : ""}>Register →</a><button type="button" aria-label="Hide event banner">×</button></div>`;
    bar.querySelector("button").addEventListener("click", () => {
      bar.remove();
      try { sessionStorage.setItem("n2t-hide-event", next.title); } catch (e) {}
    });
    document.body.prepend(bar);
  })
  .catch(() => {});
