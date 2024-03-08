/**
 * Map of controller names to their input elements
 * @type {Object<string, {parent?: string; inputs: HTMLInputElement[]}>}
 */
const inputMap = {};

initValidation();

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

    // No is checked, so hide the section
    if (controllerEl) {
      controllerEl.addEventListener("change", (e) => {
        toggleSection(controller, !e.target.value);
      });
    }

    // Yes is checked, so show the section
    const counterpart = document.getElementById(
      `${controller.replace("-no", "-yes")}`
    );
    if (counterpart) {
      counterpart.addEventListener("change", (e) => {
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
 * Sets the required attribute on the given element
 * @param {HTMLInputElement} el The element to set the required attribute on
 * @param {boolean} required Whether the element should be required or not
 */
function setRequired(el, required = false) {
  if (el) {
    el.toggleAttribute("required", required);
    el.setAttribute("aria-required", required);
  }
}

/**
 * Sets the disabled attribute on the given element
 * @param {HTMLInputElement} el The element to set the disabled attribute on
 * @param {boolean} required Whether the element should be disabled or not
 */
function setDisabled(el, disabled = false) {
  if (el) {
    el.toggleAttribute("disabled", disabled);
    el.toggleAttribute("aria-disabled", disabled);
  }
}

/**
 * Resets the elements value to its default
 * @param {HTMLInputElement} el The element to reset the value of
 */
function resetValue(el) {
  if (el) {
    const type = el.getAttribute("type");
    if (type === "radio") {
      el.checked = el.id.includes("-no");
    } else {
      el.value = "";
    }
  }
}

// Print transformation before showing print dialog
window.addEventListener("beforeprint", () => {
  // Show all hidden sections
  Object.keys(inputMap).forEach((controller) => {
    toggleSection(controller, true);
  });

  // Replace date inputs
  replaceDateInputs();

  // Change submit link text
  const submitLink = document.querySelector('a[href$="#submit"]');
  submitLink.innerText = "Ga verder met de volgende vraag.";
});

// Reverse print transformation after print dialog is closed
window.addEventListener("afterprint", () => {
  // Hide sections that were hidden before
  initValidation();

  // Revert date inputs
  replaceDateInputs(true);

  // Revert submit link text
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
