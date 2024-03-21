document.body.setAttribute("data-js-enabled", true);

initPersistedData();
initErrorMessages();

/**
 * Initializes persisted data
 */
function initPersistedData() {
  const inputs = document.querySelectorAll("input,select,textarea");
  inputs.forEach((input) => {
    retrievePersistedData(input);
  });
}

/**
 * Initializes error messages for form validation
 */
function initErrorMessages() {
  const inputs = document.querySelectorAll("input,select,textarea");

  // Validate all inputs on submit
  const submitBtn = document.querySelector('[type="submit"]');
  submitBtn.addEventListener("click", () => {
    inputs.forEach((input) => {
      setFeedbackMessage(input);
    });
  });

  // Reset validation on reset
  const resetBtn = document.querySelector('[type="reset"]');
  resetBtn.addEventListener("click", () => {
    inputs.forEach((input) => {
      setPersistedData(input, true);
      setFeedbackMessage(input, true);
    });
  });

  inputs.forEach((input) => {
    // Add blur event listener for all inputs
    input.addEventListener("blur", (e) => {
      setFeedbackMessage(e.target);
      setPersistedData(e.target);
    });

    const type = input.getAttribute("type");

    // Set the dynamic max attributes for date inputs
    if (type == "date") {
      let today = new Date();
      const offset = today.getTimezoneOffset();
      today = new Date(today.getTime() - offset * 60 * 1000);
      today = today.toISOString().split("T")[0];

      if (input.getAttribute("data-min") === "today") {
        input.min = today;
      }
      if (input.getAttribute("data-max") === "today") {
        input.max = today;
      }
      if (input.getAttribute("data-value") === "today") {
        input.value = today;
        input.setAttribute("readonly", true);
        input.setAttribute("aria-readonly", true);
      }
    }

    // Add extra change event listener for inputs that require a selection
    if (
      type === "checkbox" ||
      type === "date" ||
      type === "file" ||
      input.tagName === "SELECT"
    ) {
      input.addEventListener("change", (e) => {
        setFeedbackMessage(e.target);
      });
    }

    // Add extra change event listener for radio inputs for persisted data
    if (type === "radio") {
      input.addEventListener("change", (e) => {
        setFeedbackMessage(e.target);
        setPersistedData(e.target);

        const counterparts = document.querySelectorAll(
          `[name=${e.target.getAttribute("name")}]:not(#${e.target.id})`
        );
        counterparts.forEach((el) => {
          setPersistedData(el);
        });
      });
    }
  });
}

/**
 * Sets a feedback message on target element
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} target The target element
 */
function setFeedbackMessage(target, reset = false) {
  const errorEl = document.getElementById(`${target.id}-desc`);
  if (errorEl) {
    const validationType = target.getAttribute("data-validate");
    if (validationType) {
      target.setCustomValidity("");
    }

    if (validationType === "bsn") {
      if (target.value && !validateBsn(target.value) && target.validity.valid) {
        target.setCustomValidity(
          "Dit is geen geldige bsn. Is er een typefout gemaakt?"
        );
      }
    }

    const valid = target.validity.valid;
    target.setAttribute("aria-invalid", !valid);
    const cssMsg = window.getComputedStyle(errorEl, "::before").content;

    // Set feedback message if CSS failed
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (cssMsg === "none" && valid && !reset) {
      const color = dark ? "#00ff00" : "green";
      target.style.border = `2px solid ${color}`;
      errorEl.style.color = color;
      errorEl.innerText = "✓";
    } else if (cssMsg === "none" && !reset) {
      const color = dark ? "#ff4242" : "#ad0000";
      target.style.border = `2px solid ${color}`;
      errorEl.style.color = color;
      errorEl.innerText = target.validationMessage
        ? target.validationMessage
        : errorEl.getAttribute("data-error-message");
    } else {
      target.style.border = "";
      errorEl.style.color = "";
      errorEl.innerText = "";
    }
  } else if (target.getAttribute("type") === "radio") {
    const fieldset = target.closest("fieldset");
    if (fieldset) {
      const valid = target.validity.valid;
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const color = dark ? "#ff4242" : "#ad0000";
      fieldset.style.border = valid || reset ? "" : `2px solid ${color}`;
    }
  } else if (target.getAttribute("type") === "checkbox") {
    const parent = target.parentElement;
    if (parent) {
      const valid = target.validity.valid;
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const color = dark ? "#ff4242" : "#ad0000";
      parent.style.border = valid || reset ? "" : `2px solid ${color}`;
    }
  }
}

/**
 * Checks if value is a valid bsn number
 * @param {string} bsn The value to check
 * @returns {boolean} Whether the value is a valid bsn number
 */
function validateBsn(bsn) {
  const bsnRegex = /^[0-9]{8,9}$/;
  if (!bsnRegex.test(bsn)) return false;
  const numbers = bsn.split("").map(Number);

  let sum = numbers[numbers.length - 1] * -1;
  let weight = numbers.length;
  for (let i = 0; i < numbers.length - 1; i++) {
    sum += numbers[i] * weight;
    weight--;
  }

  return sum % 11 === 0;
}

/**
 * Retrieves persisted data for the given element
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} el The element to retrieve data for
 */
function retrievePersistedData(el) {
  if (window.localStorage) {
    const type = el.getAttribute("type");
    const value = window.localStorage.getItem(el.id);
    if (value && type === "radio") {
      el.checked = value === "true";
      return;
    } else if (value && type !== "file") {
      el.value = value;
      return;
    }
  }
}

/**
 * Sets persisted data for the given element
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} el The element to set data for
 */
function setPersistedData(el, reset) {
  if (window.localStorage) {
    const type = el.getAttribute("type");
    const value = type === "radio" ? el.checked : el.value;
    window.localStorage.setItem(el.id, reset ? "" : value);
  }
}
