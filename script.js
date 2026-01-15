const toggle = document.getElementById("darkToggle");

toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});
