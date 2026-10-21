/* =========================================================
   سجل البطولات — Interactions
   ========================================================= */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Intro splash ---------- */
  const intro = $("#intro");
  const introEnter = $("#introEnter");
  if (intro && introEnter) {
    document.body.classList.add("is-locked");
    let entered = false;
    const enterSite = () => {
      if (entered) return;
      entered = true;
      intro.classList.add("is-hidden");
      document.body.classList.remove("is-locked");
      window.setTimeout(() => { intro.style.display = "none"; }, 850);
      const firstLink = $(".nav__links a");
      if (firstLink) firstLink.focus({ preventScroll: true });
    };
    introEnter.addEventListener("click", enterSite);
  }

  /* ---------- Nav state + scroll progress + back to top ---------- */
  const nav      = $("#nav");
  const progress = $("#progress");
  const toTop    = $("#toTop");

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > 700);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(y / max, 1) : 0;
    progress.style.transform = `scaleX(${p})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
  );

  /* ---------- Mobile menu ---------- */
  const navToggle = $("#navToggle");
  const navLinks  = $("#navLinks");

  const closeMenu = () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "فتح القائمة");
    document.body.style.overflow = "";
  };

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    document.body.style.overflow = open ? "hidden" : "";
  });

  $$("a", navLinks).forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Floating gold particles in hero ---------- */
  const particles = $("#particles");
  if (particles && !prefersReduced) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("i");
      const size = (Math.random() * 2.2 + 1.2).toFixed(1);
      p.style.width = p.style.height = size + "px";
      p.style.insetInlineStart = (Math.random() * 100).toFixed(2) + "%";
      p.style.top = (55 + Math.random() * 45).toFixed(2) + "%";
      p.style.animationDuration = (9 + Math.random() * 12).toFixed(1) + "s";
      p.style.animationDelay = (Math.random() * 10).toFixed(1) + "s";
      p.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
      frag.appendChild(p);
    }
    particles.appendChild(frag);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  revealEls.forEach((el) => {
    const delay = el.dataset.delay;
    if (delay) el.style.setProperty("--d", delay + "ms");
  });

  if ("IntersectionObserver" in window && !prefersReduced) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Scroll spy ---------- */
  const sectionLinks = $$(".nav__links a");
  const sections = sectionLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          sectionLinks.forEach((a) =>
            a.classList.toggle("is-active", a.getAttribute("href") === id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && !prefersReduced) {
    const counterObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => counterObs.observe(c));
  }

  /* ---------- Equipment filter tabs ---------- */
  const tabs = $$(".tab");
  const eqCards = $$(".eq-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const filter = tab.dataset.filter;
      eqCards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("is-in");
      });
    });
  });

  /* ---------- Gallery lightbox ---------- */
  const galleryItems = $$(".gal");
  const lightbox = $("#lightbox");
  const lbImg    = $("#lbImg");
  const lbCap    = $("#lbCap");
  const lbClose  = $("#lbClose");
  const lbPrev   = $("#lbPrev");
  const lbNext   = $("#lbNext");

  let current = 0;
  let lastFocus = null;
  let closeTimer = null;

  const renderSlide = (index) => {
    current = (index + galleryItems.length) % galleryItems.length;
    const btn = galleryItems[current];
    const img = $("img", btn);
    lbImg.src = btn.dataset.full || img.src;
    lbImg.alt = img.alt || "";
    lbCap.textContent = btn.dataset.caption || "";
  };

  const openLightbox = (index) => {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    renderSlide(index);

    lightbox.hidden = false;
    // force a frame so the transition runs
    void lightbox.offsetWidth;
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    closeTimer = setTimeout(() => {
      lightbox.hidden = true;
      lbImg.src = "";
    }, 350);
    if (lastFocus) lastFocus.focus();
  };

  galleryItems.forEach((item, i) => {
    item.addEventListener("click", () => openLightbox(i));
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => renderSlide(current - 1));
  lbNext.addEventListener("click", () => renderSlide(current + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") renderSlide(current - 1);
    if (e.key === "ArrowLeft") renderSlide(current + 1);
  });

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Pause hero Ken-Burns when tab is hidden ---------- */
  const heroImg = $(".hero__bg img");
  if (heroImg) {
    document.addEventListener("visibilitychange", () => {
      heroImg.style.animationPlayState = document.hidden ? "paused" : "running";
    });
  }
})();
