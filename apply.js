// Paste your Formspree endpoint here (https://formspree.io → New form → copy the URL).
// Each submission is emailed to you, with a link to view it in your Formspree dashboard.
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

// Scoped in a block so names don't clash with script.js
{
  const form = document.getElementById("apply-form");
  const note = form.querySelector(".form-note");
  const submitBtn = form.querySelector('button[type="submit"]');
  const emailOk = (v) => /^\S+@\S+\.\S+$/.test(v);

  function showError(msg, el) {
    note.style.color = "#e0475b";
    note.textContent = msg;
    el?.focus();
  }

  function validate() {
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    let firstBad = null;
    form.querySelectorAll("input[required], select[required]").forEach((el) => {
      if (el.type === "checkbox") return;
      const bad = !el.value.trim() || (el.type === "email" && !emailOk(el.value.trim()));
      if (bad) {
        el.classList.add("invalid");
        firstBad ??= el;
      }
    });
    if (firstBad) return showError("Please fill in the highlighted fields.", firstBad), false;

    const rolesGroup = document.getElementById("roles-group");
    if (!form.querySelector('input[name="roles"]:checked')) {
      rolesGroup.classList.add("invalid");
      rolesGroup.scrollIntoView({ block: "center" });
      return showError("Pick at least one role you're interested in."), false;
    }
    if (!form.consent.checked) return showError("Please agree to be contacted so we can follow up.", form.consent), false;
    return true;
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "roles") document.getElementById("roles-group").classList.remove("invalid");
    e.target.classList?.remove("invalid");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData(form);
    // Join multi-select checkboxes into one readable line each
    ["roles", "help_with"].forEach((k) => {
      const vals = data.getAll(k);
      data.delete(k);
      data.set(k, vals.join(", ") || "—");
    });
    const fullName = `${data.get("first_name")} ${data.get("last_name")}`.trim();
    data.set("_subject", `New Nurse2Tech profile: ${fullName} — ${data.get("roles")}`);
    data.set("_replyto", data.get("email"));

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    note.textContent = "";

    try {
      if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) throw new Error("Form endpoint not set up yet.");
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).errors?.[0]?.message || "Submission failed.");

      document.getElementById("success-name").textContent = data.get("first_name");
      form.hidden = true;
      document.querySelector(".apply-side").hidden = true;
      document.getElementById("success").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showError(`Sorry, something went wrong: ${err.message} Please try again in a moment.`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit my profile <svg class="ico-sm"><use href="#i-arrow"/></svg>';
    }
  });
}
