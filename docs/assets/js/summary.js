initSummary();

/**
 * Retrieves persisted data for the given element
 */
function initSummary() {
  const summary = document.querySelector("[data-summary]");
  if (window.localStorage) {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      const value = window.localStorage.getItem(key);

      const li = document.createElement("li");
      li.innerHTML = `<b>${key}</b>: ${value}`;
      summary.appendChild(li);
    }
  }
}
