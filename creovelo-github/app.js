const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".header");
const nav = document.querySelector("#navigation");
const menu = document.querySelector(".menu-toggle");
const progress = document.querySelector(".progress");
const dialog = document.querySelector("#contact-dialog");
const form = document.querySelector("#contact-form");
const chapter = document.querySelector(".chapter");

if ("IntersectionObserver" in window && !reduced.matches) {
  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".section-head, .method-grid article, .fit-grid article, .offer-card, .process-steps li").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

function closeMenu() {
  nav.classList.remove("open");
  document.documentElement.classList.remove("nav-open");
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
}

menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  document.documentElement.classList.toggle("nav-open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});

nav.querySelectorAll("a").forEach((el) => el.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

header.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || !nav.classList.contains("open")) return;
  const items = [...nav.querySelectorAll("a, button")];
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (active === menu) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    menu.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    menu.focus();
  }
});

let ticking = false;
function updateChrome() {
  const y = window.scrollY;
  header.classList.toggle("has-scrolled", y > 12);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (chapter && !reduced.matches) {
    const rect = chapter.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) {
      const scene = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
      chapter.style.setProperty("--scene-offset", `${((scene - 0.5) * 36).toFixed(2)}px`);
    }
  }
  ticking = false;
}

addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateChrome);
  }
}, { passive: true });
addEventListener("resize", () => {
  if (innerWidth > 820) closeMenu();
  updateChrome();
});
updateChrome();

let trigger;
document.querySelectorAll("[data-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    trigger = button;
    closeMenu();
    form.elements.service.value = button.dataset.contact || "Let’s find the right fit";
    document.querySelector("#form-status").textContent = "";
    dialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
    dialog.close();
  }
});
dialog.addEventListener("close", () => trigger?.focus());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.querySelector("#form-status");
  const button = form.querySelector("[type=submit]");
  const data = new FormData(form);
  status.textContent = "";
  status.className = "";
  button.disabled = true;
  button.setAttribute("aria-busy", "true");

  const fallback = () => {
    const subject = `Creovelo inquiry — ${data.get("service")}`;
    const body = `Hello Creovelo,\n\nI'm ${data.get("name")} from ${data.get("brand")}.\n\nI'm interested in: ${data.get("service")}\n\nWhat we're looking to test:\n${data.get("goals") || "I would love to discuss the right creative direction."}\n\nThanks,\n${data.get("name")}\n${data.get("email") || ""}`;
    return `mailto:hello@creovelo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  try {
    if (data.get("company_website")) {
      form.reset();
      status.className = "is-success";
      status.textContent = "Sent. We’ll reply from hello@creovelo.com.";
      return;
    }

    const response = await fetch("https://formsubmit.co/ajax/creovelo719@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Name: data.get("name"),
        Email: data.get("email"),
        Brand: data.get("brand"),
        Interest: data.get("service"),
        "What they want to test": data.get("goals") || "I would love to discuss the right creative direction.",
        _replyto: data.get("email"),
        _subject: `Creovelo inquiry — ${data.get("service")}`,
        _template: "box",
        _captcha: "false",
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false || result.success === "false") {
      throw new Error(result.message || "Could not send your inquiry.");
    }
    form.reset();
    status.className = "is-success";
    status.textContent = "Sent. We’ll reply from hello@creovelo.com.";
    status.scrollIntoView({ block: "nearest" });
  } catch (error) {
    status.className = "is-error";
    status.textContent = `${error.message} You can also email hello@creovelo.com.`;
    const link = document.createElement("a");
    link.href = fallback();
    link.textContent = "Open a draft instead";
    status.append(" ");
    status.append(link);
    status.append(".");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

const conceptGroup = document.querySelector(".concept-group");
const conceptTrack = document.querySelector(".concept-track");
if (conceptGroup && conceptTrack && !reduced.matches) {
  if (conceptTrack.querySelectorAll(".concept-group").length < 2) {
    const clone = conceptGroup.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => {
      link.tabIndex = -1;
      link.setAttribute("aria-hidden", "true");
    });
    conceptTrack.append(clone);
  }
} else {
  document.querySelector(".concept-marquee")?.classList.add("is-static");
}

const projects = {
  serein: {
    image: "studio-concept.webp",
    alt: "Serein fictional skincare concept in warm sunlight",
    brand: "serein",
    headline: "A little<br><em>less rush.</em>",
    type: "01 / Skincare · Lifestyle angle",
    statement: "Sell the moment.<br><em>Not just the bottle.</em>",
    insight: "An everyday routine can be a small moment of calm. The product becomes part of something more personal.",
    direction: "Warm light, tactile materials, and a quiet invitation. Lead with the ritual, then let the product make it tangible.",
    question: "Does an emotional ritual angle create more interest than a product-first message?"
  },
  mora: {
    image: "mora-concept.webp",
    alt: "Mora fictional cherry beverage campaign in vivid red",
    brand: "mora",
    headline: "Your usual.<br><em>Unusual.</em>",
    type: "02 / Beverage · Discovery angle",
    statement: "Make familiar<br><em>feel unexpected.</em>",
    insight: "A familiar daily choice is an opportunity for a small discovery. Curiosity can give someone a reason to try something new.",
    direction: "Confident colour, tactile condensation, and a playful contrast in the headline. Let the visual create appetite before the copy asks for attention.",
    question: "Does a playful discovery angle generate more interest than a straightforward flavour message?"
  },
  onda: {
    image: "onda-concept.webp",
    alt: "Onda fictional silver headphones campaign on an icy blue background",
    brand: "onda",
    headline: "Find your<br><em>frequency.</em>",
    type: "03 / Audio · Identity angle",
    statement: "Beyond the product.<br><em>Into their world.</em>",
    insight: "Personal audio belongs to personal moments. The product can express how someone wants to feel, not only what they want to hear.",
    direction: "Sculptural metal, open space, and fluid light. Position the product as a considered part of the listener’s everyday environment.",
    question: "Does an identity-led message create more interest than a product-design message?"
  }
};

const projectKeys = Object.keys(projects);
const projectTabs = [...document.querySelectorAll("[data-project]")];
const panel = document.querySelector("#project-panel");
let activeProject = 0;

function selectProject(key, focusTab = false) {
  const data = projects[key];
  if (!data) return;
  activeProject = projectKeys.indexOf(key);
  projectTabs.forEach((tab) => {
    const selected = tab.dataset.project === key;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focusTab) tab.focus();
  });
  panel.className = `project-panel theme-${key}`;
  panel.setAttribute("aria-labelledby", `project-${key}`);
  const img = document.querySelector("#project-image");
  img.src = data.image;
  img.alt = data.alt;
  if (!reduced.matches) {
    img.animate(
      [{ opacity: 0.45, transform: "scale(1.03)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 620, easing: "cubic-bezier(.2,.7,.2,1)" }
    );
  }
  document.querySelector("#project-brand").textContent = data.brand;
  document.querySelector("#project-headline").innerHTML = data.headline;
  document.querySelector("#project-statement").innerHTML = data.statement;
  for (const field of ["type", "insight", "direction", "question"]) {
    document.querySelector(`#project-${field}`).textContent = data[field];
  }
  document.querySelector("#project-count").textContent = `${String(activeProject + 1).padStart(2, "0")} / 03`;
}

projectTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectProject(tab.dataset.project));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % 3;
    else if (event.key === "ArrowLeft") next = (index + 2) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault();
    selectProject(projectKeys[next], true);
  });
});

document.querySelector(".project-prev").addEventListener("click", () => {
  selectProject(projectKeys[(activeProject + 2) % 3]);
});
document.querySelector(".project-next").addEventListener("click", () => {
  selectProject(projectKeys[(activeProject + 1) % 3]);
});
document.querySelectorAll("[data-select]").forEach((link) => {
  link.addEventListener("click", () => selectProject(link.dataset.select));
});

const faqs = [...document.querySelectorAll(".faq-list details")];
faqs.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqs.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});
