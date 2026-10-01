// Nurse2Tech role quiz: each answer adds points to the roles it suits; top two roles are shown.
{
  const ROLES = {
    informatics: { name: "Clinical Informatics", cat: "informatics", text: "You love making systems work for clinicians: EHR workflows, order sets and training. Informatics turns your frustration with bad tools into better ones." },
    product: { name: "Clinical Product", cat: "product", text: "You see what's broken and imagine how it should work. Clinical product roles shape what gets built so it truly fits clinical reality." },
    ux: { name: "UX Research", cat: "ux", text: "You're curious about people's experiences. UX researchers interview clinicians and patients so tools are actually usable at 3 a.m." },
    implementation: { name: "Clinical Implementation", cat: "implementation", text: "You're the go-to super-user who helps everyone adopt something new. Implementation brings technology into hospitals and makes it stick." },
    success: { name: "Clinical / Customer Success", cat: "success", text: "You build trust and love helping teams succeed. Success roles partner with health systems and turn feedback into improvements." },
    ai: { name: "Clinical AI", cat: "ai", text: "You care about accuracy and safety. Clinical AI roles bring your judgment into developing, testing and validating AI tools." },
    data: { name: "Data & Analytics", cat: "data", text: "You notice patterns and like evidence. Clinical data roles use healthcare data to measure outcomes and guide decisions." },
    operations: { name: "Clinical Operations", cat: "operations", text: "You keep many moving parts running smoothly. Clinical operations builds the processes behind healthcare products and studies." },
  };
  const QUESTIONS = [
    { q: "What part of your shift do you enjoy most?", a: [
      ["Teaching patients or new staff", ["implementation", "success"]],
      ["Spotting patterns in charts and numbers", ["data", "ai"]],
      ["Fixing workflows that don't work", ["informatics", "operations"]],
      ["Hearing what patients actually experience", ["ux", "success"]],
    ]},
    { q: "People or data?", a: [
      ["People, all day", ["success", "implementation", "ux"]],
      ["Data and details", ["data", "ai", "informatics"]],
      ["A mix of both", ["product", "operations"]],
    ]},
    { q: "When a new tool rolls out on your unit, you…", a: [
      ["Become the super-user who helps everyone", ["implementation", "informatics"]],
      ["Have strong opinions on how it should have been designed", ["product", "ux"]],
      ["Check whether it actually improves care", ["ai", "data"]],
      ["Make sure the processes around it run smoothly", ["operations", "success"]],
    ]},
    { q: "Your ideal workday looks like…", a: [
      ["On site with hospitals and clinical teams", ["implementation", "success"]],
      ["Focused work on detailed problems", ["ai", "data"]],
      ["Brainstorming and building with a team", ["product", "ux"]],
      ["Coordinating projects and people", ["operations", "informatics"]],
    ]},
    { q: "What motivates you most?", a: [
      ["Making clinicians' lives easier", ["informatics", "implementation"]],
      ["Creating something new", ["product", "ux"]],
      ["Patient safety and getting it right", ["ai", "operations"]],
      ["Seeing the people I support succeed", ["success", "data"]],
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
    const top = Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    $("quiz-matches").innerHTML = top.map((k, i) => `
      <article class="quiz-match${i === 0 ? " is-top" : ""}">
        <span class="tag">${i === 0 ? "Best match" : "Also a great fit"}</span>
        <h3>${ROLES[k].name}</h3>
        <p>${ROLES[k].text}</p>
      </article>`).join("");
    $("quiz-jobs").href = `jobs.html?cat=${ROLES[top[0]].cat}`;
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
