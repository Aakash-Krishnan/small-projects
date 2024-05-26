const parent = document.querySelector(".stars");
const rating = document.getElementById("rating");
const body = document.body;

let prevColor = "";

const renderStars = (id) => {
  let color = "";
  for (let i = 1; i <= 5; i++) {
    const currEl = document.getElementById(i);

    if (id === 5) {
      color = "gold";
    } else if (id > 2 && id < 5) {
      color = "yellow";
    } else {
      color = "tomato";
    }

    if (prevColor) {
      currEl.classList.remove(prevColor);
    }

    if (i <= id) {
      currEl.classList.add(color);

      currEl.innerHTML = "&bigstar;";
    } else {
      currEl.classList.remove(color);
      currEl.innerHTML = "&star;";
    }
  }
  prevColor = color;
};

let prevRatings = rating.innerText ? Number(rating.innerText) : 0;

parent.addEventListener("click", (e) => {
  const id = Number(e.target.id);
  if (id) {
    renderStars(id);
    rating.innerText = `${id}/5`;
    prevRatings = id;
  }
});

parent.addEventListener("mouseover", (e) => {
  const id = Number(e.target.id);
  if (id) {
    renderStars(id);
  } else {
    renderStars(prevRatings);
  }
});
