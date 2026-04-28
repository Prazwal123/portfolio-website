(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const typingEl = $("#typing-text");
  const yearEl = $("#year");
  const toTopBtn = $("#to-top");
  const navToggle = $(".nav__toggle");
  const navMenu = $("#nav-menu");
  const navLinks = $$(".nav__menu a[href^=\"#\"]");
  const navCta = $(".nav__cta");
  const revealEls = $$("[data-reveal]");

  const contactForm = $("#contact-form");
  const formStatus = $("#form-status");

  const phrases = ["IT Student", "Networking Learner", "Front‑End Developer"];
  const typing = {
    phraseIndex: 0,
    charIndex: 0,
    deleting: false,
    typeMs: 46,
    deleteMs: 30,
    pauseMs: 1000,
    betweenMs: 280,
  };

  function setStatus(message, type = "neutral") {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error");
    if (type === "success") formStatus.classList.add("is-success");
    if (type === "error") formStatus.classList.add("is-error");
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function encodeMailtoValue(v) {
    return encodeURIComponent(String(v).replace(/\r\n/g, "\n"));
  }

  function isValidEmail(value) {
    const v = String(value || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
  }

  function setFieldError(field, message) {
    if (!field) return;
    const name = field.getAttribute("name") || field.id;
    const err = document.querySelector(`[data-error-for="${CSS.escape(name)}"]`);

    field.classList.toggle("is-invalid", Boolean(message));
    if (err) err.textContent = message || "";
  }

  function validateForm(values) {
    const errors = {};

    const name = values.name.trim();
    const email = values.email.trim();
    const subject = values.subject.trim();
    const message = values.message.trim();

    if (name.length < 2) errors.name = "Please enter your full name (at least 2 characters).";
    if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
    if (subject.length < 4) errors.subject = "Please enter a subject (at least 4 characters).";
    if (message.length < 20) errors.message = "Please write a message (at least 20 characters).";

    return errors;
  }

  function getFormValues(form) {
    const fd = new FormData(form);
    return {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
    };
  }

  function openMailClient(values) {
    const to = "prazwal.bhusal357@gmail.com";
    const subject = `[Portfolio] ${values.subject}`.trim();
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      "",
      values.message,
      "",
      "— Sent from prazwalbhusal.com.np contact form",
    ].join("\n");

    const href = `mailto:${to}?subject=${encodeMailtoValue(subject)}&body=${encodeMailtoValue(body)}`;
    window.location.href = href;
  }

  function closeMobileMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function initMobileMenu() {
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((a) => a.addEventListener("click", closeMobileMenu));
    navCta?.addEventListener("click", closeMobileMenu);

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (navMenu.contains(t) || navToggle.contains(t)) return;
      closeMobileMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  function initTyping() {
    if (!typingEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      typingEl.textContent = phrases[0] || "";
      return;
    }

    const tick = () => {
      const current = phrases[typing.phraseIndex] || "";
      const maxChars = current.length;

      if (!typing.deleting) {
        typing.charIndex = clamp(typing.charIndex + 1, 0, maxChars);
      } else {
        typing.charIndex = clamp(typing.charIndex - 1, 0, maxChars);
      }

      typingEl.textContent = current.slice(0, typing.charIndex);

      const baseMs = typing.deleting ? typing.deleteMs : typing.typeMs;
      let nextDelay = baseMs;

      if (!typing.deleting && typing.charIndex === maxChars) {
        typing.deleting = true;
        nextDelay = typing.pauseMs;
      } else if (typing.deleting && typing.charIndex === 0) {
        typing.deleting = false;
        typing.phraseIndex = (typing.phraseIndex + 1) % phrases.length;
        nextDelay = typing.betweenMs;
      }

      window.setTimeout(tick, nextDelay);
    };

    tick();
  }

  function initReveal() {
    if (revealEls.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: null, threshold: 0.14 }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  function initScrollToTop() {
    if (!toTopBtn) return;

    const onScroll = () => {
      const show = window.scrollY > 450;
      toTopBtn.classList.toggle("is-visible", show);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initActiveNav() {
    const sections = ["about", "skills", "projects", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0 || navLinks.length === 0) return;

    const linkById = new Map();
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      if (id) linkById.set(id, a);
    });

    const setActive = (id) => {
      navLinks.forEach((a) => a.classList.remove("is-active"));
      const link = linkById.get(id);
      if (link) link.classList.add("is-active");
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        root: null,
        rootMargin: `-${72}px 0px -55% 0px`,
        threshold: [0.12, 0.2, 0.3, 0.4],
      }
    );

    sections.forEach((s) => io.observe(s));
  }

  function initForm() {
    if (!contactForm) return;

    const fields = {
      name: $("#name", contactForm),
      email: $("#email", contactForm),
      subject: $("#subject", contactForm),
      message: $("#message", contactForm),
    };

    const validateAndPaint = () => {
      const values = getFormValues(contactForm);
      const errors = validateForm(values);
      setStatus("", "neutral");

      setFieldError(fields.name, errors.name);
      setFieldError(fields.email, errors.email);
      setFieldError(fields.subject, errors.subject);
      setFieldError(fields.message, errors.message);

      return { values, errors };
    };

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => validateAndPaint());
      field.addEventListener("blur", () => validateAndPaint());
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const { values, errors } = validateAndPaint();

      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) {
        setStatus("Please fix the highlighted fields and try again.", "error");
        const firstInvalid = Object.values(fields).find((f) => f?.classList.contains("is-invalid"));
        firstInvalid?.focus?.();
        return;
      }

      setStatus("Opening your email app…", "success");
      openMailClient(values);
      contactForm.reset();
      Object.values(fields).forEach((f) => setFieldError(f, ""));
      window.setTimeout(() => {
        setStatus(
          "If your email app did not open, you can still email me directly at prazwal.bhusal357@gmail.com.",
          "success"
        );
      }, 800);
    });
  }

  function initYear() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  initYear();
  initMobileMenu();
  initTyping();
  initReveal();
  initScrollToTop();
  initActiveNav();
  initForm();
})();
