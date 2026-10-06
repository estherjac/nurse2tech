// Nurse2Tech role quiz: each answer adds points to the roles it suits; top two roles are shown.
{
  const ROLES = {
    informatics: { name: "Clinical Informatics", cat: "informatics", text: "You love making systems work for clinicians: EHR workflows, order sets and training. Informatics turns your frustration with bad tools into better ones." },
    product: { name: "Clinical Product", cat: "product", text: "You see what's broken and imagine how it should work. Clinical product roles shape what gets built so it truly fits clinical reality." },
    implementation: { name: "Clinical Implementation", cat: "implementation", text: "You're the go-to super-user who helps everyone adopt something new. Implementation brings technology into hospitals and makes it stick." },
    ai: { name: "Clinical AI", cat: "ai", text: "You care about accuracy and safety. Clinical AI roles bring your judgment into developing, testing and validating AI tools." },
    data: { name: "Data & Analytics", cat: "data", text: "You notice patterns and like evidence. Clinical data roles use healthcare data to measure outcomes and guide decisions." },
    operations: { name: "Clinical Operations", cat: "operations", text: "You keep many moving parts running smoothly. Clinical operations builds the processes behind healthcare products and studies." },
  };
  const QUESTIONS = [
   { q: "What part of your shift do you enjoy most?", a: [
    ["Teaching patients or new staff", ["implementation", "product"]],
    ["Spotting patterns in charts and numbers", ["data", "ai"]],
    ["Fixing workflows that don't work", ["informatics", "operations"]],
    ["Keeping the whole unit running smoothly", ["operations", "implementation"]],
   ]},
   { q: "When a new tool rolls out on your unit, you…", a: [
    ["Become the super-user who helps everyone", ["implementation", "informatics"]],
    ["Have strong opinions on how it should have been designed", ["product", "ai"]],
    ["Check whether it actually helps patients", ["ai", "data"]],
    ["Figure out how it fits into charting and orders", ["informatics", "product"]],
   ]},
   { q: "Which sounds most like you?", a: [
    ["I double-check everything", ["ai", "informatics"]],
    ["I like seeing the numbers behind a problem", ["data", "operations"]],
    ["I'm the one who organises everyone", ["operations", "implementation"]],
    ["I always have ideas for doing things better", ["product", "data"]],
   ]},
   { q: "Your ideal workday looks like…", a: [
    ["Out with hospitals and clinical teams", ["implementation", "operations"]],
    ["Focused time on detailed problems", ["data", "ai"]],
    ["Brainstorming and building with a team", ["product", "ai"]],
    ["Improving how systems and records work", ["informatics", "data"]],
   ]},
   { q: "What motivates you most?", a: [
    ["Making clinicians' lives easier", ["informatics", "implementation"]],
    ["Creating something new", ["product", "operations"]],
    ["Patient safety and getting it right", ["ai", "informatics"]],
    ["Turning information into better decisions", ["operations", "data"]],
   ]},
   { q: "How do you like to work?", a: [
    ["With lots of different people", ["implementation", "operations"]],
    ["Deep in the details", ["data", "informatics"]],
    ["Testing and questioning", ["ai", "product"]],
    ["Planning and keeping things on track", ["operations", "data"]],
   ]},
  ];

  const $ = (id) => document.getElementById(id);
  const answers = [];
  let step = 0;

  function render() {
    const item = QUESTIONS[step];
    $("quiz-count").textContent = `Question ${step + 1} of ${QUESTIONS.length}`;
    $("quiz-bar").style.width = `${(step / QUESTIONS.length) * 100}%`;
    $("quiz-q").textContent = item.q;
    $("quiz-options").innerHTML = item.a.map(([label], i) => `<button type="button" class="quiz-opt" data-i="${i}">${label}</button>`).join("");
    $("quiz-back").hidden = step === 0;
  }

  function finish() {
    const score = Object.fromEntries(Object.keys(ROLES).map((k) => [k, 0]));
    answers.forEach((ai, qi) => QUESTIONS[qi].a[ai][1].forEach((r, idx) => { score[r] += idx === 0 ? 2 : 1; }));
    // Ties: the role picked as the first choice more often wins, then the one favoured most recently
    const firsts = Object.fromEntries(Object.keys(ROLES).map((k) => [k, 0]));
    const lastPick = { ...firsts };
    answers.forEach((ai, qi) => { const r = QUESTIONS[qi].a[ai][1][0]; firsts[r]++; lastPick[r] = qi + 1; });
    const top = Object.keys(ROLES).sort((a, b) => score[b] - score[a] || firsts[b] - firsts[a] || lastPick[b] - lastPick[a]).slice(0, 2);
    $("quiz-matches").innerHTML = top.map((k, i) => `
      <article class="quiz-match${i === 0 ? " is-top" : ""}">
        <span class="tag">${i === 0 ? "Best match" : "Also a great fit"}</span>
        <h3>${ROLES[k].name}</h3>
        <p>${ROLES[k].text}</p>
      </article>`).join("");
    const jobsBtn = $("quiz-jobs");
    jobsBtn.href = "jobs.html";
    jobsBtn.textContent = "See open roles";
    fetch("jobs.json", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      if ((d.jobs || []).some((j) => !j.closed && j.category === ROLES[top[0]].cat)) {
        jobsBtn.href = `jobs.html?cat=${ROLES[top[0]].cat}`;
        jobsBtn.textContent = "See matching jobs";
      }
    }).catch(() => {});
    const url = encodeURIComponent("https://nurse2tech.com/roles.html");
    $("quiz-share").href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    $("quiz").hidden = true;
    $("quiz-result").hidden = false;
    $("quiz-result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("quiz-options").addEventListener("click", (e) => {
    const b = e.target.closest(".quiz-opt");
    if (!b) return;
    answers[step] = +b.dataset.i;
    step++;
    step < QUESTIONS.length ? render() : finish();
  });
  $("quiz-back").addEventListener("click", () => { if (step > 0) { step--; render(); } });
  $("quiz-restart").addEventListener("click", () => {
    answers.length = 0; step = 0;
    $("quiz-result").hidden = true; $("quiz").hidden = false; render();
  });
  render();
}
