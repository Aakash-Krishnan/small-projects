const count = document.getElementById("count");
const btns = document.querySelectorAll(".btn");

btns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const value = Number(count.innerText);
    if (e.target.id === "inc") {
      count.innerText = value + 1;
    } else if (e.target.id === "dec") {
      count.innerText = value - 1;
    } else if (e.target.id === "reset") {
      count.innerText = 0;
    }
  });
});
