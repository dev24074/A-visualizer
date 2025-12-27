const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");

const rows = 20;
const cols = 20;
const size = canvas.width / cols;

let mode = null;
let start = null;
let goal = null;
let walls = new Set();

class Node {
  constructor(r, c, g = Infinity, h = 0, parent = null) {
    this.r = r;
    this.c = c;
    this.g = g;
    this.h = h;
    this.f = g + h;
    this.parent = parent;
  }
}

function heuristic(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); // Manhattan distance
}

function drawCell(r, c, color) {
  ctx.fillStyle = color;
  ctx.fillRect(c * size, r * size, size, size);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.strokeStyle = "#ddd";
      ctx.strokeRect(c * size, r * size, size, size);

      const key = `${r},${c}`;
      if (walls.has(key)) drawCell(r, c, "black");
    }
  }

  if (start) drawCell(start.r, start.c, "green");
  if (goal) drawCell(goal.r, goal.c, "red");
}

canvas.addEventListener("click", e => {
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
    alert("Set Start and Goal first");
    return;
  }
  aStar();
};

function aStar() {
  let open = [];
  let closed = new Set();

  const startNode = new Node(start.r, start.c, 0, heuristic(start, goal));
  open.push(startNode);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();

    const key = `${current.r},${current.c}`;
    if (closed.has(key)) continue;
    closed.add(key);

    drawCell(current.r, current.c, "#93c5fd");

    if (current.r === goal.r && current.c === goal.c) {
      drawPath(current);
      return;
    }

    const neighbors = [
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ];

    for (let [dr, dc] of neighbors) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      const nkey = `${nr},${nc}`;

      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (walls.has(nkey) || closed.has(nkey)) continue;

      const g = current.g + 1;
      const h = heuristic({ r: nr, c: nc }, goal);
      open.push(new Node(nr, nc, g, h, current));
    }
  }

  alert("No path found");
}

function drawPath(node) {
  while (node.parent) {
    drawCell(node.r, node.c, "gold");
    node = node.parent;
  }
}
drawGrid();
