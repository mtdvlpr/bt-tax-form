/**
 * Map of controller names to their input elements
 * @type {Object<string, {parent?: string; inputs: (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]}>}
 */
const inputMap = {};

initToggle();

/**
 * Initializes the form validation
 */
function initToggle() {
  const hiddenElements = document.querySelectorAll("[data-hide]");
  /**
   * List of all controllers
   * @type {string[]}
   */
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
    const inputTypes = ["input", "select", "textarea"];
    const query = inputTypes.map(
      (type) =>
        `[data-hide="${controller}"] > ${type}, [data-hide="${controller}"] :not([data-hide]) > ${type}`
    );
    const hiddenInputs = document.querySelectorAll(`${query.join(", ")}`);
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

    const reverseToggle = controller.startsWith("!");
    const controllerId = reverseToggle ? controller.slice(1) : controller;
    const controllerEl = document.getElementById(controllerId);

    // Toggle the section based on the initial state of the controller
    toggleSection(controller, controllerEl.checked === reverseToggle);

    // Controller is checked, so toggle the section
    if (controllerEl) {
      controllerEl.addEventListener("change", (e) => {
        toggleSection(controller, e.target.checked === reverseToggle);
      });
    }

    // Counterpart is checked, so toggle the section
    const counterparts = document.querySelectorAll(
      `[name=${controllerEl.getAttribute("name")}]:not(#${controllerId})`
    );
    counterparts.forEach((el) => {
      el.addEventListener("change", (e) => {
        toggleSection(controller, e.target.checked !== reverseToggle);
      });
    });
  });
}

/**
 * Toggles a section of inputs on or off
 * @param {string} controller The controller name
 * @param {boolean} show Whether to show or hide the section
 */
function toggleSection(controller, show = false) {
  const containerEls = document.querySelectorAll(`[data-hide="${controller}"]`);
  containerEls.forEach((containerEl) => {
    containerEl.style.display = show ? "" : "none";
  });
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
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} el The element to set the required attribute on
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
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} el The element to set the disabled attribute on
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
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} el The element to reset the value of
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

  // Replace selects
  replaceSelects();

  // Replace signature
  replaceSignatures();

  // Replace number inputs
  replaceNumberInputs();

  // Change submit link text
  const submitLink = document.querySelector('a[href$="#submit"]');
  if (submitLink) {
    submitLink.innerText = "Ga verder met de volgende vraag.";
  }
});

// Reverse print transformation after print dialog is closed
window.addEventListener("afterprint", () => {
  // Hide sections that were hidden before
  initToggle();

  // Revert date inputs
  replaceDateInputs(true);

  // Revert selects
  replaceSelects(true);

  // Revert signature
  replaceSignatures(true);

  // Revert number inputs
  replaceNumberInputs(true);

  // Revert submit link text
  const submitLink = document.querySelector('a[href$="#submit"]');
  if (submitLink) {
    submitLink.innerText =
      "Verstuur dit formulier en ga verder met de volgende stap.";
  }
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

/**
 * Replaces selects with text inputs
 * @param {boolean} reverse Wether to reverse the transformation (text inputs to select)
 */
function replaceSelects(reverse = false) {
  const selects = document.querySelectorAll("select");
  selects.forEach((input) => {
    if (reverse) {
      // Show select and remove the text input
      input.style.display = "";
      input.parentElement.removeChild(input.parentElement.querySelector("div"));
    } else {
      // Hide select and create text input
      input.style.display = "none";
      const div = document.createElement("div");
      const textInput = document.createElement("input");

      const max = input.getAttribute("data-max");
      if (max) {
        try {
          textInput.style.width = `${25 * parseInt(max)}px`;
        } catch (e) {
          console.debug(e);
        }
      }

      // Extract select value and set it to the new input
      const selection = input.value;
      if (selection) {
        textInput.value = selection;
      }

      // Add text input to the div and insert it before the select
      div.appendChild(textInput);
      input.parentElement.insertBefore(div, input);
    }
  });
}

/**
 * Replaces signature inputs with textareas
 * @param {boolean} reverse Wether to reverse the transformation (textarea to signature input)
 */
function replaceSignatures(reverse = false) {
  const inputs = document.querySelectorAll("[data-signature]");
  inputs.forEach((input) => {
    if (reverse) {
      // Show signature and remove the textarea
      input.style.display = "";
      input.parentElement.removeChild(input.parentElement.querySelector("div"));
      input.parentElement.removeChild(
        input.parentElement.querySelector("textarea")
      );
    } else {
      // Hide signature and create label and textarea
      input.style.display = "none";
      const div = document.createElement("div");
      const label = document.createElement("label");
      const textarea = document.createElement("textarea");

      label.innerText = input.getAttribute("data-signature");

      // Add label to the div and insert it and textarea before the signature input
      div.appendChild(label);
      input.parentElement.insertBefore(div, input);
      input.parentElement.insertBefore(textarea, input);
    }
  });
}

/**
 * Replaces number with text inputs
 * @param {boolean} reverse Wether to reverse the transformation (text to number)
 */
function replaceNumberInputs(reverse = false) {
  const inputs = document.querySelectorAll("input[type=number]");
  inputs.forEach((input) => {
    if (reverse) {
      // Show number and remove the text input
      input.style.display = "";
      input.parentElement.removeChild(input.parentElement.querySelector("div"));
    } else {
      // Hide number and create text input
      input.style.display = "none";
      const div = document.createElement("div");
      const textInput = document.createElement("input");

      const max = input.getAttribute("data-max");
      if (max) {
        try {
          textInput.style.width = `${25 * parseInt(max)}px`;
        } catch (e) {
          console.debug(e);
        }
      }

      // Extract number value and set it to the new input
      textInput.value = input.value;

      // Add text input to the div and insert it before the select
      div.appendChild(textInput);
      input.parentElement.insertBefore(div, input);
    }
  });
}
