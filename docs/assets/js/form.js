initTooltips();

/**
 * Initializes the tooltips
 */
function initTooltips() {
  const tooltips = document.querySelectorAll("[data-tooltip]");
  tooltips.forEach((tooltip) => {
    const msgBox = tooltip.querySelector("span");
    msgBox.innerHTML = "";

    // Create the button to toggle the tooltip
    const btn = document.createElement("button");
    btn.type = "button";
    btn.ariaLabel = "Meer info";
    btn.innerText = "i";
    tooltip.insertBefore(btn, msgBox);

    // Toggle the tooltip on click
    btn.addEventListener("click", (e) => {
      if (msgBox.innerHTML) {
        msgBox.innerHTML = "";
      } else {
        msgBox.appendChild(createTooltip(tooltip.getAttribute("data-tooltip")));
      }
    });
  });
}

/**
 * Creates the tooltip element with specified message
 * @param {string} msg The message to display in the tooltip (HTML)
 * @returns The tooltip element
 */
function createTooltip(msg) {
  const div = document.createElement("div");
  div.innerHTML = msg;
  return div;
}
