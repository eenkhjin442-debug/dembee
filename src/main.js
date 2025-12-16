import "./style.css";

const canvas = document.getElementById("canvas");
const btn = document.getElementById("absenceBtn");

const STORAGE_KEY = "absenceDays";
const days = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function drawSquare() {
  const sq = document.createElement("div");
  sq.className = "square";

  // хэд дэх квадрат вэ?
  const index = canvas.children.length + 1;

  // 7 дахь бүрийн дараа жижиг завсар өгнө
  if (index % 7 === 0) {
    sq.classList.add("week-gap");
  }

  canvas.appendChild(sq);
}


// өмнөх 기록 сэргээж зурна
days.forEach(drawSquare);

btn.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];

  // өдөрт 1 удаа л
  if (days.includes(today)) return;

  days.push(today);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  drawSquare();
});



