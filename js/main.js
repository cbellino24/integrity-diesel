const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
const siteHeader = document.getElementById("siteHeader");
const yearEl = document.getElementById("year");

const quoteForm = document.getElementById("quoteForm");
const formStatus = document.getElementById("formStatus");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = mainNav.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

window.addEventListener("scroll", () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("scrolled", window.scrollY > 12);
});

function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);

  if (input) {
    input.classList.add("input-error");
    input.setAttribute("aria-invalid", "true");
  }

  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);

  if (input) {
    input.classList.remove("input-error");
    input.removeAttribute("aria-invalid");
  }

  if (errorEl) errorEl.textContent = "";
}

function clearAllFieldErrors() {
  ["name", "phone", "email", "city", "service", "message"].forEach(clearFieldError);
}

function showFormStatus(type, message) {
  if (!formStatus) return;
  formStatus.className = `form-status show ${type}`;
  formStatus.textContent = message;
}

function clearFormStatus() {
  if (!formStatus) return;
  formStatus.className = "form-status";
  formStatus.textContent = "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function countPhoneDigits(value) {
  return (value || "").replace(/\D/g, "").length;
}

function parseFormStatusFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const formResult = params.get("form");
  const fields = (params.get("fields") || "").split(",").filter(Boolean);

  if (!formResult || window.location.hash !== "#contact") return;

  if (formResult === "success") {
    showFormStatus("success", "Thanks — your request was sent successfully. We’ll reach out as soon as we can.");
  }

  if (formResult === "error") {
    showFormStatus("error", "Please correct the highlighted fields and try again.");

    const errorMessages = {
      name: "Please enter your full name.",
      phone: "Please enter a valid phone number.",
      email: "Please enter a valid email address.",
      city: "Please enter your city or service area.",
      service: "Please choose what needs repair.",
      message: "Please give a short description of the problem."
    };

    fields.forEach((field) => {
      if (errorMessages[field]) {
        setFieldError(field, errorMessages[field]);
      }
    });
  }
}

if (quoteForm) {
  quoteForm.addEventListener("submit", (event) => {
    clearAllFieldErrors();
    clearFormStatus();

    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const city = document.getElementById("city")?.value.trim() || "";
    const service = document.getElementById("service")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";
    const honeypot = document.getElementById("website")?.value.trim() || "";

    let isValid = true;

    if (honeypot) {
      event.preventDefault();
      return;
    }

    if (name.length < 2) {
      setFieldError("name", "Please enter your full name.");
      isValid = false;
    }

    if (countPhoneDigits(phone) < 10) {
      setFieldError("phone", "Please enter a valid phone number.");
      isValid = false;
    }

    if (email && !isValidEmail(email)) {
      setFieldError("email", "Please enter a valid email address.");
      isValid = false;
    }

    if (city.length < 2) {
      setFieldError("city", "Please enter your city or service area.");
      isValid = false;
    }

    if (!service) {
      setFieldError("service", "Please choose what needs repair.");
      isValid = false;
    }

    if (message.length < 10) {
      setFieldError("message", "Please describe the repair issue in a little more detail.");
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
      showFormStatus("error", "Please correct the highlighted fields and try again.");

      const firstError = quoteForm.querySelector(".input-error");
      if (firstError) firstError.focus();
    }
  });

  ["name", "phone", "email", "city", "service", "message"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const clearErrors = () => {
      clearFieldError(fieldId);
      if (formStatus && formStatus.classList.contains("error")) {
        clearFormStatus();
      }
    };

    field.addEventListener("input", clearErrors);
    field.addEventListener("change", clearErrors);
  });
}

parseFormStatusFromUrl();

/* =========================
   SHOP WORK PAGE
========================= */

const shopWorkPage = document.querySelector("[data-shop-work-page]");
const shopFilters = document.querySelectorAll(".shop-work-filter");
const shopCards = document.querySelectorAll(".shop-work-card");
const shopTrack = document.querySelector(".shop-work-track");
const shopTrackWrap = document.querySelector(".shop-work-track-wrap");
const shopPrev = document.querySelector(".shop-work-arrow.prev");
const shopNext = document.querySelector(".shop-work-arrow.next");

const shopLightbox = document.getElementById("shopLightbox");
const shopLightboxImage = document.getElementById("shopLightboxImage");
const shopLightboxLabel = document.getElementById("shopLightboxLabel");
const shopLightboxTitle = document.getElementById("shopLightboxTitle");
const shopLightboxDescription = document.getElementById("shopLightboxDescription");
const shopLightboxMeta1 = document.getElementById("shopLightboxMeta1");
const shopLightboxMeta2 = document.getElementById("shopLightboxMeta2");
const shopLightboxClose = document.getElementById("shopLightboxClose");

if (shopWorkPage) {
  let isDragging = false;
  let hasDragged = false;
  let startX = 0;
  let scrollLeft = 0;

  function applyShopFilter(filterValue) {
    shopCards.forEach((card) => {
      const category = card.dataset.category || "";
      const show = filterValue === "all" || category.includes(filterValue);
      card.classList.toggle("is-hidden", !show);
    });
  }

  shopFilters.forEach((button) => {
    button.addEventListener("click", () => {
      shopFilters.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      applyShopFilter(button.dataset.filter || "all");
    });
  });

  if (shopPrev && shopTrack) {
    shopPrev.addEventListener("click", () => {
      shopTrack.scrollBy({ left: -420, behavior: "smooth" });
    });
  }

  if (shopNext && shopTrack) {
    shopNext.addEventListener("click", () => {
      shopTrack.scrollBy({ left: 420, behavior: "smooth" });
    });
  }

  if (shopTrack && shopTrackWrap) {
    const startDrag = (clientX) => {
      isDragging = true;
      hasDragged = false;
      startX = clientX;
      scrollLeft = shopTrack.scrollLeft;
      shopTrackWrap.classList.add("is-dragging");
    };

    const dragMove = (clientX) => {
      if (!isDragging) return;
      const walk = clientX - startX;
      if (Math.abs(walk) > 6) hasDragged = true;
      shopTrack.scrollLeft = scrollLeft - walk;
    };

    const endDrag = () => {
      isDragging = false;
      shopTrackWrap.classList.remove("is-dragging");
      setTimeout(() => {
        hasDragged = false;
      }, 0);
    };

    shopTrackWrap.addEventListener("mousedown", (e) => startDrag(e.pageX));
    window.addEventListener("mousemove", (e) => dragMove(e.pageX));
    window.addEventListener("mouseup", endDrag);

    shopTrackWrap.addEventListener("touchstart", (e) => {
      if (!e.touches[0]) return;
      startDrag(e.touches[0].clientX);
    }, { passive: true });

    shopTrackWrap.addEventListener("touchmove", (e) => {
      if (!e.touches[0]) return;
      dragMove(e.touches[0].clientX);
    }, { passive: true });

    shopTrackWrap.addEventListener("touchend", endDrag);
  }

  function openShopLightbox(card) {
    if (!shopLightbox) return;

    const img = card.querySelector("img");
    const title = card.dataset.title || card.querySelector("h3")?.textContent || "Shop Work";
    const description = card.dataset.description || card.querySelector("p")?.textContent || "";
    const label = card.dataset.label || "Work";
    const meta1 = card.dataset.meta1 || "Integrity Diesel Truck & Auto Repair";
    const meta2 = card.dataset.meta2 || "Where country kindness and prices meet big city expertise.";

    if (shopLightboxImage && img) {
      shopLightboxImage.src = img.src;
      shopLightboxImage.alt = img.alt || title;
    }

    if (shopLightboxLabel) shopLightboxLabel.textContent = label;
    if (shopLightboxTitle) shopLightboxTitle.textContent = title;
    if (shopLightboxDescription) shopLightboxDescription.textContent = description;
    if (shopLightboxMeta1) shopLightboxMeta1.textContent = meta1;
    if (shopLightboxMeta2) shopLightboxMeta2.textContent = meta2;

    shopLightbox.classList.add("is-open");
    shopLightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeShopLightbox() {
    if (!shopLightbox) return;
    shopLightbox.classList.remove("is-open");
    shopLightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  shopCards.forEach((card) => {
    const button = card.querySelector(".shop-work-card-button");

    if (button) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasDragged) return;
        openShopLightbox(card);
      });
    }

    card.addEventListener("click", () => {
      if (hasDragged) return;
      openShopLightbox(card);
    });
  });

  if (shopLightboxClose) {
    shopLightboxClose.addEventListener("click", closeShopLightbox);
  }

  if (shopLightbox) {
    shopLightbox.addEventListener("click", (e) => {
      if (e.target === shopLightbox) {
        closeShopLightbox();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && shopLightbox?.classList.contains("is-open")) {
      closeShopLightbox();
    }
  });

  applyShopFilter("all");
}
