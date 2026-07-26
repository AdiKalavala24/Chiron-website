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
      if (event.target.closest("a, [data-open]")) setNav(false);
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
     Grade selector — swaps the sample content in all four subject cards
     --------------------------------------------------------------------- */

  var GRADES = {
    k: {
      writing: { node: "Letter shapes A–F", trace: "Aa" },
      speaking: { node: "First sounds", word: "sun", tip: "“Great! Now say it slowly: s — u — n.”" },
      math: { node: "Counting to 10", filled: 5, prompt: 'Count the blocks: 3 + <span class="rounded bg-mint-soft px-1">?</span> = 5' },
      reading: { node: "Sight words", words: ["The", "cat", "sat."], wpm: 18 },
    },
    g1: {
      writing: { node: "Lowercase word building", trace: "cat" },
      speaking: { node: "Digraph sounds", word: "ship", tip: "“Nice! Stretch the sh a little longer.”" },
      math: { node: "Adding within 10", filled: 6, prompt: 'Build the pattern: 6 + <span class="rounded bg-mint-soft px-1">?</span> = 10' },
      reading: { node: "Short vowels", words: ["The", "fox", "ran", "fast."], wpm: 30 },
    },
    g2: {
      writing: { node: "Blends & whole words", trace: "house" },
      speaking: { node: "Two-syllable words", word: "thunder", tip: "“Two beats: THUN — der. Punch the first one.”" },
      math: { node: "Addition within 20", filled: 3, prompt: 'Build the pattern: 3 + <span class="rounded bg-mint-soft px-1">?</span> = 8' },
      reading: { node: "Fluency & expression", words: ["The", "brave", "fox", "found", "home."], wpm: 42 },
    },
    g3: {
      writing: { node: "Full sentences", trace: "The dog barked." },
      speaking: { node: "Three-syllable words", word: "delicious", tip: "“Three beats: de — LI — cious. Land on the middle.”" },
      math: { node: "Multiplication arrays", filled: 6, prompt: 'Make the array: 4 × <span class="rounded bg-mint-soft px-1">?</span> = 24' },
      reading: { node: "Comprehension", words: ["The", "clever", "fox", "outsmarted", "everyone."], wpm: 78 },
    },
    g4: {
      writing: { node: "Paragraph structure", trace: "Once upon a time," },
      speaking: { node: "Presentation & pacing", word: "extraordinary", tip: "“Five beats: ex — tra — OR — di — nary. Slow down.”" },
      math: { node: "Fractions & division", filled: 6, prompt: 'Shade the fraction: 3/4 of 8 = <span class="rounded bg-mint-soft px-1">?</span>' },
      reading: { node: "Inference & vocabulary", words: ["Curiosity", "carried", "her", "farther", "still."], wpm: 110 },
    },
  };

  var BLOCK_COLORS = ["bg-mint", "bg-sun", "bg-brand", "bg-pop"];

  function slot(name) {
    return document.querySelector('[data-slot="' + name + '"]');
  }

  // Grade targets range from "Aa" to a full sentence, so measure the rendered
  // text and scale it to fill the tracing box instead of hardcoding sizes.
  var TRACE_BOX = 196;
  var TRACE_MAX = 46;

  function fitWritingText() {
    var guide = slot("writing-guide");
    var trace = slot("writing-trace");
    if (!guide || !trace.getComputedTextLength) return;

    guide.setAttribute("font-size", String(TRACE_MAX));
    var width = guide.getComputedTextLength();
    var size = width > 0 ? Math.min(TRACE_MAX, (TRACE_MAX * TRACE_BOX) / width) : TRACE_MAX;
    var stroke = Math.max(1, size / 18).toFixed(2);

    [guide, trace].forEach(function (el) {
      el.setAttribute("font-size", size.toFixed(1));
      el.setAttribute("stroke-width", stroke);
    });
  }

  // Web fonts land after first paint and change the measurement.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitWritingText);
  }

  function renderGrade(key) {
    var data = GRADES[key];
    if (!data) return;

    // Writing — grey guide plus the violet tracing layer on top.
    slot("writing-node").textContent = data.writing.node;
    ["writing-guide", "writing-trace"].forEach(function (id) {
      slot(id).textContent = data.writing.trace;
    });
    fitWritingText();

    // Speaking
    slot("speaking-node").textContent = data.speaking.node;
    slot("speaking-word").textContent = data.speaking.word;
    slot("speaking-tip").textContent = data.speaking.tip;

    // Math — eight cells, the first `filled` solid and the rest dashed.
    slot("math-node").textContent = data.math.node;
    slot("math-prompt").innerHTML = data.math.prompt;
    var blocks = slot("math-blocks");
    blocks.textContent = "";
    for (var i = 0; i < 8; i++) {
      var cell = document.createElement("span");
      cell.className =
        i < data.math.filled
          ? "aspect-square rounded-lg border-2 border-ink " + BLOCK_COLORS[i % BLOCK_COLORS.length]
          : "aspect-square rounded-lg border-2 border-dashed border-ink bg-white";
      blocks.appendChild(cell);
    }

    // Reading — rebuild the words so the highlight stagger matches the count.
    slot("reading-node").textContent = data.reading.node;
    slot("reading-wpm").textContent = String(data.reading.wpm);
    var line = slot("reading-line");
    line.textContent = "";
    data.reading.words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "read-word";
      span.textContent = word;
      span.style.animationDelay = (i * 0.8).toFixed(1) + "s";
      line.appendChild(span);
      line.appendChild(document.createTextNode(" "));
    });
  }

  var gradeGroup = document.querySelector("[data-grades]");

  if (gradeGroup) {
    var gradeButtons = Array.prototype.slice.call(gradeGroup.querySelectorAll("[role='radio']"));

    var selectGrade = function (button, moveFocus) {
      gradeButtons.forEach(function (item) {
        var selected = item === button;
        item.setAttribute("aria-checked", String(selected));
        item.setAttribute("tabindex", selected ? "0" : "-1");
        item.classList.toggle("bg-ink", selected);
        item.classList.toggle("text-cream", selected);
        item.classList.toggle("bg-cream", !selected);
        item.classList.toggle("text-ink", !selected);
      });

      renderGrade(button.dataset.grade);
      if (moveFocus) button.focus();
    };

    gradeGroup.addEventListener("click", function (event) {
      var button = event.target.closest("[role='radio']");
      if (button) selectGrade(button, false);
    });

    gradeGroup.addEventListener("keydown", function (event) {
      var index = gradeButtons.indexOf(document.activeElement);
      if (index === -1) return;

      var next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = gradeButtons[(index + 1) % gradeButtons.length];
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = gradeButtons[(index - 1 + gradeButtons.length) % gradeButtons.length];
      if (event.key === "Home") next = gradeButtons[0];
      if (event.key === "End") next = gradeButtons[gradeButtons.length - 1];

      if (next) {
        event.preventDefault();
        selectGrade(next, true);
      }
    });

    renderGrade("k");
  }

  /* ---------------------------------------------------------------------
     Modals
     --------------------------------------------------------------------- */

  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var openModalEl = null;
  var lastFocused = null;

  function focusableIn(modal) {
    return Array.prototype.slice.call(modal.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function closeModal() {
    if (!openModalEl) return;
    openModalEl.hidden = true;
    openModalEl = null;
    document.body.classList.remove("modal-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function openModal(name) {
    var modal = document.querySelector('[data-modal="' + name + '"]');
    if (!modal) return;

    if (openModalEl) {
      openModalEl.hidden = true;
    } else {
      lastFocused = document.activeElement;
    }

    modal.hidden = false;
    openModalEl = modal;
    document.body.classList.add("modal-open");

    var targets = focusableIn(modal);
    if (targets.length) targets[0].focus();
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-open]");
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.open);
      return;
    }
    if (event.target.closest("[data-modal-close]")) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (!openModalEl) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    // Keep focus inside the dialog.
    var targets = focusableIn(openModalEl);
    if (!targets.length) return;

    var first = targets[0];
    var last = targets[targets.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------------------------------------------------------------------
     Waitlist form (pricing page)

     Chiron is in closed beta, so this collects interest rather than creating
     an account. TODO: point WAITLIST_ENDPOINT at the real list. Until it is
     set the form validates but sends nothing, and says so on screen.
     --------------------------------------------------------------------- */

  var WAITLIST_ENDPOINT = null;

  var signupForm = document.querySelector("[data-signup-form]");

  if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = signupForm.elements.email;
      var error = document.querySelector("[data-signup-error]");
      var value = email.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error.textContent = "Please enter a valid email address.";
        error.classList.remove("hidden");
        email.setAttribute("aria-invalid", "true");
        email.focus();
        return;
      }

      error.classList.add("hidden");
      email.removeAttribute("aria-invalid");

      var grade = signupForm.elements.grade;
      var gradeLabel = grade.options[grade.selectedIndex].textContent;

      var title = document.querySelector("[data-signup-title]");
      var message = document.querySelector("[data-signup-message]");
      var icon = document.querySelector("[data-signup-icon]");

      if (WAITLIST_ENDPOINT) {
        fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value, grade: grade.value }),
        }).catch(function () {});

        title.textContent = "You're on the list!";
        message.textContent =
          "We'll email " + value + " as soon as a " + gradeLabel + " spot opens in the beta.";
        icon.classList.remove("bg-sun");
        icon.classList.add("bg-mint");
      } else {
        // Never tell a real parent they joined when nothing was recorded.
        console.warn("Chiron: WAITLIST_ENDPOINT is not set — the waitlist form is not submitting anywhere yet.");
        title.textContent = "Form not connected yet";
        message.textContent =
          "Nothing was submitted. Set WAITLIST_ENDPOINT in assets/js/main.js to start collecting signups.";
        icon.classList.remove("bg-mint");
        icon.classList.add("bg-sun");
      }

      signupForm.hidden = true;
      document.querySelector("[data-signup-success]").hidden = false;
    });
  }

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
