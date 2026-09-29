// Where contact form submissions go.
const CONTACT_EMAIL = "esther.jacob@guardoc.health";

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");

// Sticky nav shadow
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav-links a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  })
);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

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
