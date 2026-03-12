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