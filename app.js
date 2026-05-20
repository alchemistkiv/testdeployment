const btn = document.getElementById("btn");
const count = document.getElementById("count");

let clicks = 0;

btn.addEventListener("click", () => {
  clicks += 1;
  count.textContent = `${clicks} kez tıkladın.`;
});
