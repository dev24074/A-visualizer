A* Pathfinding Algorithm Visualizer

A web-based visualization tool that demonstrates how the A* (A-star) pathfinding algorithm works in real time. The project allows users to place start and goal nodes, draw obstacles, and visually observe how the algorithm finds the shortest path using heuristic-based search.
🚀 Live Demo
👉 https://dev24074.github.io/A-visualizer/
🛠️ Tech Stack
HTML5 – Structure
CSS3 – Styling and layout
JavaScript (ES6) – Algorithm logic and visualization
Canvas API – Grid rendering and animation

✨ Features
Interactive grid-based visualization
Set Start and Goal nodes dynamically
Draw obstacles to simulate real-world constraints
Real-time visualization of:
Open set
Closed set
Final shortest path
Clear and simple UI for easy understanding
Runs entirely in the browser (no backend)

🧠 How A* Algorithm Works
The A* algorithm finds the shortest path by minimizing the function:
f(n) = g(n) + h(n)
g(n) → Cost from start node to current node
h(n) → Heuristic estimate (Manhattan distance) from current node to goal
This ensures optimal and efficient pathfinding.

📌 Real-World Applications
GPS navigation systems
Game AI pathfinding
Robotics and autonomous navigation
Network routing
Maze and grid-based problem solving

📂 Project Structure
A-visualizer/
│── index.html
│── styles.css
│── app.js
│── README.md
▶️ How to Run Locally
Clone the repository:
Copy code
Bash
git clone https://github.com/dev24074/A-visualizer.git
Open index.html in your browser
Start interacting with the grid

👨‍💻 Author
Devanand B
GitHub: https://github.com/dev24074
LinkedIn: https://www.linkedin.com/in/devanand-boopalan-125312324

📜 License
This project is open-source and available under the MIT License.
