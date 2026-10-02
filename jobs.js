// Job posts from employers are emailed here via FormSubmit (same inbox as the join form).
const JOB_POST_ENDPOINT = "https://formsubmit.co/ajax/connect@nurse2tech.com";

// Scoped in a block so names don't clash with script.js
{
  const CATEGORY_LABELS = {
    informatics: "Clinical Informatics",
    product: "Product Management",
    ux: "UX Research / Design",
    implementation: "Clinical Implementation",
    success: "Clinical Success",
    ai: "Clinical AI / Content",
    sales: "Sales / Solutions",
    data: "Data & Analytics",
    operations: "Clinical Operations",
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Featured jobs from jobs.json
  const list = document.getElementById("job-list");
  const empty = document.getElementById("job-empty");
  const chips = document.querySelectorAll("[data-jfilter]");
  let jobs = [];
  let cat = "all";
  let where = "all";
  const WHERE = {
    israel: (j) => /israel/i.test(j.location || ""),
    remote: (j) => /remote/i.test((j.work_setting || "") + " " + (j.location || "")),
    hybrid: (j) => /hybrid/i.test(j.work_setting || ""),
    onsite: (j) => /on-?site/i.test(j.work_setting || ""),
  };
  const whereChips = document.querySelectorAll("[data-where]");

  const isNew = (d) => (Date.now() - new Date(d + "T00:00:00")) / 86400000 <= 7;

  function daysAgo(dateStr) {
    const d = Math.floor((Date.now() - new Date(dateStr + "T00:00:00")) / 86400000);
    if (isNaN(d)) return "";
    return d <= 0 ? "Today" : d === 1 ? "1 day ago" : d < 30 ? `${d} days ago` : new Date(dateStr).toLocaleDateString();
  }

  const card = (j, closed) => `
      <article class="job${closed ? " job-closed" : ""}">
        <div class="job-main">
          <div class="res-tags">
            ${closed ? `<span class="tag tag-closed">No longer accepting applicants</span>` : isNew(j.posted) ? `<span class="tag tag-new">New</span>` : ""}
            <span class="tag">${esc(CATEGORY_LABELS[j.category] || j.category)}</span>
            ${j.work_setting ? `<span class="tag tag-paid">${esc(j.work_setting)}</span>` : ""}
          </div>
          <h3>${esc(j.title)}</h3>
          <p class="job-co">${esc(j.company)} · <svg><use href="#i-pin"/></svg> ${esc(j.location)}</p>
          ${j.description ? `<p class="job-desc">${esc(j.description)}</p>` : ""}
        </div>
        <div class="job-side">
          <span class="job-date">${closed ? (j.closed_date ? "Closed " + esc(new Date(j.closed_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })) : "Closed") : esc(daysAgo(j.posted))}</span>
          ${closed ? "" : `<a class="btn btn-sm" href="${esc(j.url)}" target="_blank" rel="noopener">Apply <svg class="ico-sm"><use href="#i-ext"/></svg></a>`}
        </div>
      </article>`;

  function renderJobs() {
    const inCat = jobs.filter((j) => (cat === "all" || j.category === cat) && (where === "all" || WHERE[where](j)));
    const open = inCat.filter((j) => !j.closed);
    const closed = inCat.filter((j) => j.closed);
    list.innerHTML = open.map((j) => card(j, false)).join("");
    const closedWrap = document.getElementById("closed-wrap");
    document.getElementById("closed-list").innerHTML = closed.map((j) => card(j, true)).join("");
    closedWrap.hidden = closed.length === 0;
    empty.hidden = open.length > 0;
    if (!open.length) {
      empty.querySelector("h3").textContent = jobs.length ? "No open roles in this category right now" : "New featured roles are on the way";
    }
  }


  whereChips.forEach((c) => c.addEventListener("click", () => {
    where = c.dataset.where;
    whereChips.forEach((x) => x.classList.toggle("active", x === c));
    renderJobs();
  }));

  chips.forEach((c) => c.addEventListener("click", () => {
    cat = c.dataset.jfilter;
    renderJobs();
  }));

  fetch("jobs.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      jobs = (d.jobs || []).sort((a, b) => String(b.posted).localeCompare(String(a.posted)));
      document.getElementById("job-filters").hidden = jobs.length === 0;
      // only show filters that have at least one job
      chips.forEach((c) => {
        const f = c.dataset.jfilter;
        if (f !== "all" && !jobs.some((x) => x.category === f)) c.hidden = true;
      });
      whereChips.forEach((c) => {
        const w = c.dataset.where;
        if (w !== "all" && !jobs.some((x) => !x.closed && WHERE[w](x))) c.hidden = true;
      });
      document.getElementById("where-filters").hidden = jobs.length === 0;
      const want = new URLSearchParams(location.search).get("cat");
      const chip = want && [...chips].find((c) => c.dataset.jfilter === want && !c.hidden);
      if (chip) {
        cat = want;
        chips.forEach((c) => c.classList.toggle("active", c === chip));
      }
      renderJobs();
    })
    .catch(() => {
      document.getElementById("job-filters").hidden = true;
      renderJobs();
    });

  // Employer "post a job" form
  const form = document.getElementById("post-form");
  const note = form.querySelector(".form-note");
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener("input", (e) => e.target.classList?.remove("invalid"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let firstBad = null;
    form.querySelectorAll("[required]").forEach((el) => {
      const v = el.value.trim();
      const bad = !v || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) || (el.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v));
      el.classList.toggle("invalid", bad);
      if (bad) firstBad ??= el;
    });
    if (firstBad) {
      note.style.color = "#e0475b";
      note.textContent = "Please fill in the highlighted fields.";
      firstBad.focus();
      return;
    }

    const data = new FormData(form);
    data.set("category", CATEGORY_LABELS[data.get("category")] || data.get("category"));
    data.set("_subject", `New job post: ${data.get("job_title")} at ${data.get("company")}`);
    data.set("_replyto", data.get("email"));
    data.set("_template", "table");
    data.set("_captcha", "false");

    btn.disabled = true;
    btn.textContent = "Submitting…";
    note.textContent = "";
    try {
      const res = await fetch(JOB_POST_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "Submission failed.");
      form.hidden = true;
      document.getElementById("post-success").hidden = false;
    } catch (err) {
      note.style.color = "#e0475b";
      note.textContent = `Sorry, something went wrong: ${err.message} Please try again in a moment.`;
      btn.disabled = false;
      btn.innerHTML = 'Submit job <svg class="ico-sm"><use href="#i-arrow"/></svg>';
    }
  });
}
