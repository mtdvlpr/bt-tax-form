initPersistedData();
initErrorMessages();

/**
 * Initializes persisted data
 */
function initPersistedData() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    retrievePersistedData(input);
  });
}

/**
 * Initializes error messages for form validation
 */
function initErrorMessages() {
  const inputs = document.querySelectorAll("input");
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
      input.max = today.toISOString().split("T")[0];
    }

    // Add extra change event listener for date and file inputs
    if (type === "date" || type === "file") {
      input.addEventListener("change", (e) => {
        setFeedbackMessage(e.target);
      });
    }

    // Add extra change event listener for radio inputs for persisted data
    if (type === "radio") {
      input.addEventListener("change", (e) => {
        setPersistedData(e.target);
        const id = e.target.id;
        if (id.includes("-no")) {
          const counterpart = document.getElementById(
            id.replace("-no", "-yes")
          );
          setPersistedData(counterpart);
        } else if (id.includes("-yes")) {
          const counterpart = document.getElementById(
            id.replace("-yes", "-no")
          );
          setPersistedData(counterpart);
        }
      });
    }
  });
}

/**
 * Sets a feedback message on target element
 * @param {HTMLInputElement} target The target element
 */
function setFeedbackMessage(target) {
  const errorEl = document.getElementById(`${target.id}-desc`);
  if (errorEl) {
    const valid = target.validity.valid;
    const cssMsg = window.getComputedStyle(errorEl, "::before").content;

    // Set feedback message if CSS failed
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (cssMsg === "none" && valid) {
      const color = dark ? "#00ff00" : "green";
      target.style.border = `2px solid ${color}`;
      errorEl.style.color = color;
      errorEl.innerText = "✓";
    } else if (cssMsg === "none") {
      const color = dark ? "#ff4242" : "#ad0000";
      target.style.border = `2px solid ${color}`;
      errorEl.style.color = color;
      errorEl.innerText = errorEl.getAttribute("data-error-message");
    } else {
      target.style.border = "";
      errorEl.style.color = "";
      errorEl.innerText = "";
    }
  }
}

/**
 * Retrieves persisted data for the given element
 * @param {HTMLInputElement} el The element to retrieve data for
 */
function retrievePersistedData(el) {
  if (window.localStorage) {
    const type = el.getAttribute("type");
    const value = localStorage.getItem(el.id);
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
 * @param {HTMLInputElement} el The element to set data for
 */
function setPersistedData(el) {
  if (window.localStorage) {
    const type = el.getAttribute("type");
    const value = type === "radio" ? el.checked : el.value;
    window.localStorage.setItem(el.id, value);
  }
}
