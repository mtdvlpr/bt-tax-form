/**
 * Map of controller names to their input elements
 * @type {Object<string, {parent?: string; inputs: HTMLInputElement[]}>}
 */
const inputMap = {};

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
    inputMap[controller] = {
      parent: document
        .querySelector(`[data-hide="${controller}"]`)
        ?.parentElement?.closest(`[data-hide]`)
        ?.getAttribute("data-hide"),
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

initValidation();
initErrorMessages();
setNextDisabled();

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

    // Set error message if CSS failed
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

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
