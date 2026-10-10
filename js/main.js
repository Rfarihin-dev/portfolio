(function () {
  "use strict";

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
    if (meta) {
      meta.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0a" : "#ffffff"
      );
    }

    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☾" : "☀";
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch (error) {}

  applyTheme(savedTheme === "light" ? "light" : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var nextTheme =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";

      applyTheme(nextTheme);
      try {
        localStorage.setItem("theme", nextTheme);
      } catch (error) {}
    });
  }

  /* Mobile navigation */
  function setNav(open) {
    if (!nav || !navToggle) return;

    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Close menu" : "Open menu"
    );
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNav(false);
    });
  }

  /* Smooth scrolling */
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetId = link.getAttribute("href");
      var target = targetId.length > 1
        ? document.querySelector(targetId)
        : null;

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      history.pushState(null, "", targetId);
    });
  });

  /* Active section navigation */
  if (nav && "IntersectionObserver" in window) {
    var sections = ["about", "experience", "education", "projects", "contact"]
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          nav.querySelectorAll("a").forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* Copy email, if this page has a copy button */
  if (copyBtn && copyStatus) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");

      if (!email || !navigator.clipboard) return;

      navigator.clipboard.writeText(email).then(
        function () {
          copyBtn.textContent = "Copied";
          copyStatus.textContent = "Email address copied to clipboard";

          window.setTimeout(function () {
            copyBtn.textContent = "Copy";
          }, 1600);
        },
        function () {
          copyStatus.textContent = "Copy failed";
        }
      );
    });
  }

  /* Reveal on scroll */
  root.classList.add("js");
  var revealElements = document.querySelectorAll(".hero, .entry, .card");
  revealElements.forEach(function (element) {
    element.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("visible");
    });
  }

  /* Close animation for expandable details */
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
      }, reduceMotion ? 1 : 240);
    }
  });

  /* Page fade-in */
  if (!reduceMotion) {
    document.querySelectorAll(
      ".site-header, main > section, main .entry, " +
      ".resume-toolbar, .resume-viewer, .resume-paper, .site-footer"
    ).forEach(function (element, index) {
      element.style.setProperty(
        "--pop-delay",
        Math.min(index, 12) * 55 + "ms"
      );
      element.classList.add("page-pop-in");
    });
  }
})();