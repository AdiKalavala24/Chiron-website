/* ==========================================================================
   Chiron landing page interactions
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */

  var navToggle = document.querySelector("[data-nav-toggle]");
  var navPanel = document.querySelector("[data-nav-panel]");

  function setNav(open) {
    if (!navToggle || !navPanel) return;
    navPanel.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
    document.querySelectorAll("[data-nav-icon]").forEach(function (icon) {
      icon.classList.toggle("hidden", icon.dataset.navIcon === (open ? "open" : "close"));
    });
  }

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", function () {
      setNav(navPanel.hidden);
    });

    navPanel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !navPanel.hidden) {
        setNav(false);
        navToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Header lifts off the page once the hero starts scrolling away
     --------------------------------------------------------------------- */

  var header = document.querySelector("[data-header]");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("py-1", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Teaching-style tabs
     --------------------------------------------------------------------- */

  var tabList = document.querySelector("[data-tablist]");

  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll("[role='tab']"));

    var selectTab = function (tab, moveFocus) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        var panel = document.getElementById(item.getAttribute("aria-controls"));

        item.setAttribute("aria-selected", String(selected));
        item.setAttribute("tabindex", selected ? "0" : "-1");
        item.classList.toggle("bg-ink", selected);
        item.classList.toggle("text-cream", selected);
        item.classList.toggle("bg-cream", !selected);
        item.classList.toggle("text-ink", !selected);
        item.classList.toggle("shadow-hard", selected);
        item.classList.toggle("shadow-hard-sm", !selected);

        if (panel) panel.hidden = !selected;
      });

      if (moveFocus) tab.focus();
    };

    tabList.addEventListener("click", function (event) {
      var tab = event.target.closest("[role='tab']");
      if (tab) selectTab(tab, false);
    });

    tabList.addEventListener("keydown", function (event) {
      var index = tabs.indexOf(document.activeElement);
      if (index === -1) return;

      var next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];

      if (next) {
        event.preventDefault();
        selectTab(next, true);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
