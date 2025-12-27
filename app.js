/* ========= Canvas & Grid Setup ========= */
const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const speed = document.getElementById("speed");

const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols;

let mode = null;
let start = null;
let goal = null;
let walls = new Set();
let running = false;

/* ========= Node Class ========= */
class Node {
  constructor(r, c, g, h, parent = null) {
    this.r = r;
    this.c = c;
    this.g = g;
    this.h = h;
    this.f = g + h;
    this.parent = parent;
  }
}

/* ========= Utility Functions ========= */
function heuristic(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); // Manhattan distance
}

function delay() {
  return new Promise(res => setTimeout(res, 210 - speed.value));
}

function cellKey(r, c) {
  return `${r},${c}`;
}

function drawCell(r, c, color) {
  ctx.fillStyle = color;
  ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
}

/* ========= Draw Grid ========= */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.strokeStyle = "#ddd";
      ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);

      if (walls.has(cellKey(r, c))) {
        drawCell(r, c, "#111827"); // obstacle
      }
    }
  }

  if (start) drawCell(start.r, start.c, "#22c55e");
  if (goal) drawCell(goal.r, goal.c, "#ef4444");
}

/* ========= Canvas Click Handling ========= */
canvas.addEventListener("click", e => {
  if (running) return;

  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / cellSize);
  const r = Math.floor((e.clientY - rect.top) / cellSize);
  const key = cellKey(r, c);

  if (mode === "start") start = { r, c };
  if (mode === "goal") goal = { r, c };
  if (mode === "wall") walls.add(key);

  drawGrid();
});

/* ========= Button Events ========= */
document.getElementById("setStart").onclick = () => mode = "start";
document.getElementById("setGoal").onclick = () => mode = "goal";
document.getElementById("setWall").onclick = () => mode = "wall";

document.getElementById("reset").onclick = () => {
  if (running) return;
  start = null;
  goal = null;
  walls.clear();
  mode = null;
  drawGrid();
};

document.getElementById("run").onclick = async () => {
  if (!start || !goal) {
    alert("Please set Start and Goal first");
    return;
  }
  if (!running) {
    running = true;
    await aStar();
    running = false;
  }
};

/* ========= A* Algorithm (Animated) ========= */
async function aStar() {
  let openSet = [];
  let closedSet = new Set();

  openSet.push(new Node(
    start.r,
    start.c,
    0,
    heuristic(start, goal)
  ));

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const key = cellKey(current.r, current.c);

    if (closedSet.has(key)) continue;
    closedSet.add(key);

    drawCell(current.r, current.c, "#93c5fd"); // open set
    await delay();

    if (current.r === goal.r && current.c === goal.c) {
      await drawPath(current);
      return;
    }

    const directions = [[1,0],[-1,0],[0,1],[0,-1]];
    for (let [dr, dc] of directions) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      const nkey = cellKey(nr, nc);

      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (walls.has(nkey) || closedSet.has(nkey)) continue;

      const g = current.g + 1;
      const h = heuristic({ r: nr, c: nc }, goal);
      openSet.push(new Node(nr, nc, g, h, current));
    }

    drawCell(current.r, current.c, "#bfdbfe"); // closed set
  }

  alert("No path found");
}

/* ========= Draw Final Path ========= */
async function drawPath(node) {
  while (node.parent) {
    drawCell(node.r, node.c, "#facc15");
    node = node.parent;
    await delay();
  }
}

/* ========= Initial Draw ========= */
drawGrid();
