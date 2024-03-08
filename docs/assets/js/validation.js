/**
 * Map of controller names to their input elements
 * @type {Object<string, {parent?: string; inputs: HTMLInputElement[]}>}
 */
const inputMap = {};

initPersistedData();
initValidation();
initErrorMessages();
setNextDisabled();

/**
 * Initializes the form validation
 */
function initValidation() {
  const hiddenElements = document.querySelectorAll("[data-hide]");
  const controllers = [];

  // Fetch all controllers
  hiddenElements.forEach((el) => {
    const controller = el.getAttribute("data-hide");
    if (!controllers.includes(controller)) {
      controllers.push(controller);
    }
  });

  controllers.forEach((controller) => {
    // Fetch all inputs for each controller
    const hiddenInputs = document.querySelectorAll(
      `[data-hide="${controller}"] > input, [data-hide="${controller}"] :not([data-hide]) > input`
    );
    const container = document.querySelector(`[data-hide="${controller}"]`);
    const containerParent = container ? container.parentElement : null;
    const ancestorContainer = containerParent
      ? containerParent.closest(`[data-hide]`)
      : null;
    inputMap[controller] = {
      parent: ancestorContainer
        ? ancestorContainer.getAttribute("data-hide")
        : null,
      inputs: hiddenInputs,
    };

    const controllerEl = document.getElementById(controller);

    // Toggle the section based on the initial state of the controller
    toggleSection(controller, !controllerEl.checked);

    // Add event listeners to each controller
    const alternativeEl = document.getElementById(
      `${controller.replace("-no", "-yes")}`
    );

    // No is checked, so hide the section
    if (controllerEl) {
      controllerEl.addEventListener("change", (e) => {
        toggleSection(controller, !e.target.value);
      });
    }

    // Yes is checked, so show the section
    if (alternativeEl) {
      alternativeEl.addEventListener("change", (e) => {
        toggleSection(controller, !!e.target.value);
      });
    }
  });
}

/**
 * Toggles a section of inputs on or off
 * @param {string} controller The controller name
 * @param {boolean} show Whether to show or hide the section
 */
function toggleSection(controller, show = false) {
  const containerEl = document.querySelector(`[data-hide=${controller}]`);
  containerEl.style.display = show ? "" : "none";
  const inputs = inputMap[controller].inputs;
  if (inputs) {
    inputs.forEach((input) => {
      setDisabled(input, !show);
      if (input.hasAttribute("data-required")) {
        setRequired(input, show);
      }
      if (!show) resetValue(input);
    });
  }

  const children = Object.keys(inputMap).filter(
    (key) => inputMap[key].parent === controller
  );
  children.forEach((child) => {
    const childEl = document.getElementById(child);
    toggleSection(child, show && !childEl.checked);
  });
}

/**
 * Sets the required attribute on the given input element
 * @param {HTMLInputElement} el The input element to set the required attribute on
 * @param {boolean} required Whether the input should be required or not
 */
function setRequired(el, required = false) {
  if (el) {
    el.toggleAttribute("required", required);
    el.setAttribute("aria-required", required);
  }
}

/**
 * Sets the disabled attribute on the given input element
 * @param {HTMLInputElement} el The input element to set the disabled attribute on
 * @param {boolean} required Whether the input should be disabled or not
 */
function setDisabled(el, disabled = false) {
  if (el) {
    el.toggleAttribute("disabled", disabled);
    el.toggleAttribute("aria-disabled", disabled);
  }
}

/**
 * Resets the input value to its default
 * @param {HTMLInputElement} el The element to reset the value of
 */
function resetValue(el) {
  const type = el.getAttribute("type");
  if (type === "radio") {
    el.checked = el.id.includes("-no");
  } else {
    el.value = "";
  }
}

/**
 * Sets the state of the next button based on form validity
 */
function setNextDisabled() {
  // TODO: Fix next button disabled after submitting
  return;
  const form = document.querySelector("form");
  const next = document.querySelector("footer nav span:nth-of-type(2) a");
  const disable = !form.checkValidity();
  setDisabled(next, disable);
  next.href = disable ? "" : next.getAttribute("data-href");
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
      setNextDisabled();
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
        setNextDisabled();
      });
    }

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
    const dark = prefersDark();
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
 * Returns whether the user prefers dark mode
 * @returns {boolean} wether the user prefers dark mode
 */
function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function initPersistedData() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    retrievePersistedData(input);
  });
}

/**
 * Retrieves persisted data for the given input
 * @param {HTMLInputElement} el The input element to retrieve data for
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
 * Sets persisted data for the given input
 * @param {HTMLInputElement} el The input element to set data for
 */
function setPersistedData(el) {
  if (window.localStorage) {
    const type = el.getAttribute("type");
    const value = type === "radio" ? el.checked : el.value;
    window.localStorage.setItem(el.id, value);
  }
}

// Print transformation before showing print dialog
window.addEventListener("beforeprint", () => {
  Object.keys(inputMap).forEach((controller) => {
    toggleSection(controller, true);
  });
  replaceDateInputs();
  const submitLink = document.querySelector('a[href$="#submit"]');
  submitLink.innerText = "Ga verder met de volgende vraag.";
});

// Reverse print transformation after print dialog is closed
window.addEventListener("afterprint", () => {
  initValidation();
  replaceDateInputs(true);
  const submitLink = document.querySelector('a[href$="#submit"]');
  submitLink.innerText =
    "Verstuur dit formulier en ga verder met de volgende stap.";
});

/**
 * Replaces date inputs with three separate text inputs for day, month and year
 * @param {boolean} reverse Wether to reverse the transformation (text to date inputs)
 */
function replaceDateInputs(reverse = false) {
  const dateInputs = document.querySelectorAll("input[type=date]");
  dateInputs.forEach((input) => {
    if (reverse) {
      // Show date input and remove the three separate text inputs
      input.style.display = "";
      input.parentElement.removeChild(input.parentElement.querySelector("div"));
    } else {
      // Hide date input and create three separate text inputs
      input.style.display = "none";
      const div = document.createElement("div");
      const day = document.createElement("input");
      const month = document.createElement("input");
      const year = document.createElement("input");
      const separator = document.createElement("span");
      separator.innerText = " - ";

      // Set attributes for each input
      day.style.width = "50px";
      month.style.width = "50px";
      year.style.width = "100px";
      separator.style.margin = "0 5px";

      // Extract date value and set them to the new inputs
      const date = input.value;
      if (date) {
        const [y, m, d] = date.split("-");
        day.value = d;
        month.value = m;
        year.value = y;
      }

      // Add inputs to the div and insert it before the date input
      div.appendChild(day);
      div.appendChild(separator);
      div.appendChild(month);
      div.appendChild(separator.cloneNode(true));
      div.appendChild(year);
      input.parentElement.insertBefore(div, input);
    }
  });
}
