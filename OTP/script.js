const inputs = document.querySelectorAll(".input");

inputs.forEach((input) => {
  input.addEventListener("keydown", (e) => {
    e.preventDefault();
    const nextEl = e.target.nextElementSibling;
    const prevEl = e.target.previousElementSibling;
    const value = parseInt(e.key);
    if (value) {
      input.value = value;
      if (nextEl) {
        nextEl.focus();
      }
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (e.target.value) {
        e.target.value = "";
      } else {
        prevEl && prevEl.focus();
      }
    }
  });
});
