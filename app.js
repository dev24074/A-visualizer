// app.js - A* visualizer (25x25)
// grid-based canvas, supports diagonal moves and Manhattan heuristic.
// Controls: click to place start/goal, draw obstacles by dragging,
// Enter to run, R to reset.

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 25;
const COLS = 25;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const cellW = WIDTH / COLS;
const cellH = HEIGHT / ROWS;

let start = null;
let goal = null;
let obstacles = new Set();
let mode = 'start'; // 'start' | 'goal' | 'obstacle'
let mouseDown = false;
let running = false;

// UI buttons
document.getElementById('mode-start').onclick = () => { mode = 'start'; updateButtons(); };
document.getElementById('mode-goal').onclick = () => { mode = 'goal'; updateButtons(); };
document.getElementById('mode-obstacle').onclick = () => { mode = 'obstacle'; updateButtons(); };
document.getElementById('run').onclick = () => runAStar();
document.getElementById('reset').onclick = () => resetAll();

function updateButtons(){
  document.querySelectorAll('.controls button').forEach(b => b.style.opacity = 1);
  if(mode === 'start') document.getElementById('mode-start').style.opacity = 0.7;
  if(mode === 'goal') document.getElementById('mode-goal').style.opacity = 0.7;
  if(mode === 'obstacle') document.getElementById('mode-obstacle').style.opacity = 0.7;
}
updateButtons();

function cellFromCoords(x,y){
  const col = Math.min(COLS-1, Math.max(0, Math.floor(x / cellW)));
  const row = Math.min(ROWS-1, Math.max(0, Math.floor(y / cellH)));
  return [row, col];
}

function key(idRowCol){ return `${idRowCol[0]},${idRowCol[1]}`; }

canvas.addEventListener('mousedown', (e)=>{
  if(running) return;
  mouseDown = true;
  const rect = canvas.getBoundingClientRect();
  const [r,c] = cellFromCoords(e.clientX - rect.left, e.clientY - rect.top);
  handleCellAction(r,c);
});
canvas.addEventListener('mousemove', (e)=>{
  if(running) return;
  if(!mouseDown) return;
  if(mode !== 'obstacle') return;
  const rect = canvas.getBoundingClientRect();
  const [r,c] = cellFromCoords(e.clientX - rect.left, e.clientY - rect.top);
  obstacles.add(key([r,c]));
  render();
});
canvas.addEventListener('mouseup', ()=>{ mouseDown = false; });

canvas.addEventListener('click', (e)=>{
  if(running) return;
  const rect = canvas.getBoundingClientRect();
  const [r,c] = cellFromCoords(e.clientX - rect.left, e.clientY - rect.top);
  handleCellAction(r,c);
});

function handleCellAction(r,c){
  const id = key([r,c]);
  if(mode === 'start'){
    if(goal && goal[0] === r && goal[1] === c) return;
    start = [r,c];
    obstacles.delete(id);
  } else if(mode === 'goal'){
    if(start && start[0] === r && start[1] === c) return;
    goal = [r,c];
    obstacles.delete(id);
  } else if(mode === 'obstacle'){
    // toggle obstacle
    if(start && start[0] === r && start[1] === c) return;
    if(goal && goal[0] === r && goal[1] === c) return;
    if(obstacles.has(id)) obstacles.delete(id);
    else obstacles.add(id);
  }
  render();
}

// keyboard
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') runAStar();
  if(e.key === 'r' || e.key === 'R') resetAll();
});

function resetAll(){
  start = null;
  goal = null;
  obstacles.clear();
  running = false;
  render();
}

// rendering
function clearCanvas(){ ctx.clearRect(0,0,WIDTH,HEIGHT); }
function drawGrid(){
  ctx.strokeStyle = '#e2e2e2';
  ctx.lineWidth = 1;
  for(let i=0;i<=COLS;i++){
    ctx.beginPath();
    ctx.moveTo(i*cellW,0);
    ctx.lineTo(i*cellW,HEIGHT);
    ctx.stroke();
  }
  for(let j=0;j<=ROWS;j++){
    ctx.beginPath();
    ctx.moveTo(0,j*cellH);
    ctx.lineTo(WIDTH,j*cellH);
    ctx.stroke();
  }
}
function fillCell(r,c, color){
  ctx.fillStyle = color;
  ctx.fillRect(c*cellW+1, r*cellH+1, cellW-2, cellH-2);
}
function render(openSet = new Set(), closedSet = new Set(), path = []){
  clearCanvas();
  // background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,WIDTH,HEIGHT);

  // obstacles
  obstacles.forEach(k=>{
    const [r,c] = k.split(',').map(Number);
    fillCell(r,c,'#000');
  });

  // open set
  openSet.forEach(k=>{
    const [r,c] = k.split(',').map(Number);
    fillCell(r,c,'#90caf9');
  });

  // closed set
  closedSet.forEach(k=>{
    const [r,c] = k.split(',').map(Number);
    fillCell(r,c,'#b3e5fc');
  });

  // path
  path.forEach(([r,c])=>{
    fillCell(r,c,'gold');
  });

  if(start) fillCell(start[0], start[1], 'green');
  if(goal) fillCell(goal[0], goal[1], 'red');

  drawGrid();
}

// A* algorithm (8-neighbors)
function heuristic(a,b){
  // Manhattan distance (works fine with diagonals but heuristic is admissible if cost diagonal = 1 here same as orth)
  return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);
}
function neighbors(node){
  const [r,c] = node;
  const list = [];
  for(let dr=-1; dr<=1; dr++){
    for(let dc=-1; dc<=1; dc++){
      if(dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if(nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS){
        if(!obstacles.has(key([nr,nc]))) list.push([nr,nc]);
      }
    }
  }
  return list;
}

async function runAStar(){
  if(running) return;
  if(!start || !goal){ alert('Please set both start and goal.'); return; }
  running = true;

  // Initialize
  const open = new Set([key(start)]);
  const gScore = Array.from({length:ROWS}, ()=>Array(COLS).fill(Infinity));
  const fScore = Array.from({length:ROWS}, ()=>Array(COLS).fill(Infinity));
  const cameFrom = new Map();

  gScore[start[0]][start[1]] = 0;
  fScore[start[0]][start[1]] = heuristic(start, goal);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  while(open.size > 0){
    // pick node in open with lowest fScore
    let currentKey = null;
    let bestF = Infinity;
    open.forEach(k=>{
      const [r,c] = k.split(',').map(Number);
      if(fScore[r][c] < bestF){ bestF = fScore[r][c]; currentKey = k; }
    });
    const [cr,cc] = currentKey.split(',').map(Number);
    if(cr === goal[0] && cc === goal[1]){
      // reconstruct path
      const path = [];
      let cur = currentKey;
      while(cameFrom.has(cur)){
        const parts = cur.split(',').map(Number);
        path.push(parts);
        cur = cameFrom.get(cur);
      }
      path.push([start[0],start[1]]);
      path.reverse();
      render(open, new Set(), path);
      running = false;
      return;
    }

    open.delete(currentKey);
    // visualize
    const openCopy = new Set(open);
    const closedSet = new Set();
    // we'll approximate closed set by collecting nodes not in open and not start/goal/obs; but simpler: mark visited via cameFrom and gScore finite and not start
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        if(gScore[r][c] !== Infinity && !(r===start[0] && c===start[1]) && !(r===goal[0] && c===goal[1])){
          closedSet.add(key([r,c]));
        }
      }
    }
    render(openCopy, closedSet, []);

    // Explore neighbors
    const nbrs = neighbors([cr,cc]);
    for(const nb of nbrs){
      const [nr,nc] = nb;
      const tentative_g = gScore[cr][cc] + 1; // uniform cost
      if(tentative_g < gScore[nr][nc]){
        cameFrom.set(key([nr,nc]), currentKey);
        gScore[nr][nc] = tentative_g;
        fScore[nr][nc] = tentative_g + heuristic([nr,nc], goal);
        open.add(key([nr,nc]));
      }
    }

    // small delay so user sees progress
    await delay(20);
  }

  alert('No path found.');
  running = false;
}

// initial draw
render();
