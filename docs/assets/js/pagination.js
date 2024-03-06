//initPagination();

function initPagination() {
  // Prevent next link from being clicked when form is invalid
  const next = document.querySelector("footer nav span:nth-of-type(2) a");
  next.addEventListener("click", (e) => {
    const form = document.querySelector("form");
    if (!form.checkValidity()) {
      e.preventDefault();
    }
  });
}
