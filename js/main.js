(function () {
  "use strict";
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  // Buang hash lama seperti #about semasa laman mula dibuka.
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }

  window.addEventListener("pageshow", function () {
    window.scrollTo(0, 0);
  });

  window.scrollTo(0, 0);

  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  var themeIcon = document.getElementById("theme-icon");
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  var copyBtn = document.getElementById("copy-email");
  var copyStatus = document.getElementById("copy-status");

  /* Theme switch */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#ffffff");
    themeIcon.textContent = theme === "dark" ? "☾" : "☀";
    themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }

  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(saved === "light" || saved === "dark" ? saved : "dark");

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* Mobile hamburger */
  function setNav(open) {
    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle.addEventListener("click", function () {
    setNav(!nav.classList.contains("open"));
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setNav(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* Smooth scrolling with hash update (respects reduced motion) */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  /* Active nav link on scroll */
  var sections = ["about", "experience", "education", "projects", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll("a").forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* Clipboard copy for email */
  function announce(msg) {
    copyBtn.textContent = msg;
    copyStatus.textContent = msg === "Copied" ? "Email address copied to clipboard" : "Copy failed";
    setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600);
  }

  copyBtn.addEventListener("click", function () {
    var email = copyBtn.getAttribute("data-email");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { announce("Copied"); }, function () { announce("Failed"); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = email;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { announce(document.execCommand("copy") ? "Copied" : "Failed"); } catch (e) { announce("Failed"); }
    document.body.removeChild(ta);
  });
  /* Fade-up on scroll */
  root.classList.add("js");
  var revealEls = document.querySelectorAll(".hero, .entry, .card");
  revealEls.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
      } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // Animasi penutupan untuk semua elemen <details>.
  document.addEventListener("click", function (event) {
    var summary = event.target.closest("summary");
    if (!summary) return;

    var details = summary.parentElement;
    if (!(details instanceof HTMLDetailsElement)) return;

    if (details.classList.contains("is-closing")) {
      event.preventDefault();
      return;
    }

    if (details.open) {
      event.preventDefault();
      details.classList.add("is-closing");

      window.setTimeout(function () {
        details.open = false;
        details.classList.remove("is-closing");
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 240);
    }
  });
})();