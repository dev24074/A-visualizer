const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");

const rows = 20;
const cols = 20;
const size = canvas.width / cols;

let mode = null;
let start = null;
let goal = null;
let walls = new Set();

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.strokeStyle = "#ddd";
      ctx.strokeRect(c * size, r * size, size, size);

      const key = `${r},${c}`;

      if (start && start.r === r && start.c === c) {
        ctx.fillStyle = "green";
        ctx.fillRect(c * size, r * size, size, size);
      }

      if (goal && goal.r === r && goal.c === c) {
        ctx.fillStyle = "red";
        ctx.fillRect(c * size, r * size, size, size);
      }

      if (walls.has(key)) {
        ctx.fillStyle = "black";
        ctx.fillRect(c * size, r * size, size, size);
      }
    }
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / size);
  const r = Math.floor((e.clientY - rect.top) / size);
  const key = `${r},${c}`;

  if (mode === "start") start = { r, c };
  if (mode === "goal") goal = { r, c };
  if (mode === "wall") walls.add(key);

  drawGrid();
});

document.getElementById("setStart").onclick = () => mode = "start";
document.getElementById("setGoal").onclick = () => mode = "goal";
document.getElementById("setWall").onclick = () => mode = "wall";

document.getElementById("reset").onclick = () => {
  start = null;
  goal = null;
  walls.clear();
  mode = null;
  drawGrid();
};

document.getElementById("run").onclick = () => {
  if (!start || !goal) {
    alert("Please set Start and Goal");
    return;
  }
  alert("A* algorithm runs here (logic can be added)");
};

drawGrid();
