(function() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const msgEl = document.getElementById('msg');
  const restartBtn = document.getElementById('restart');

  const cols = 16, rows = 16;
  let cell = canvas.width / cols;

  let snake, dir, nextDir, food, score, best, running, loopId;

  function loadBest() {
    try { return parseInt(localStorage.getItem('snake_best') || '0', 10); }
    catch(e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem('snake_best', String(v)); } catch(e) {}
  }

  function init() {
    snake = [{x: 8, y: 8}, {x: 7, y: 8}, {x: 6, y: 8}];
    dir = {x: 1, y: 0};
    nextDir = {x: 1, y: 0};
    score = 0;
    best = loadBest();
    running = true;
    placeFood();
    scoreEl.textContent = score;
    bestEl.textContent = best;
    msgEl.textContent = 'Swipe or use arrow keys / buttons to move';
    restartBtn.style.display = 'none';
    if (loopId) clearInterval(loopId);
    loopId = setInterval(tick, 160);
  }

  function placeFood() {
    let ok = false;
    while (!ok) {
      food = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
      ok = !snake.some(s => s.x === food.x && s.y === food.y);
    }
  }

  function tick() {
    if (!running) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    running = false;
    clearInterval(loopId);
    if (score > best) { best = score; saveBest(best); bestEl.textContent = best; }
    msgEl.textContent = 'Game Over! Score: ' + score;
    restartBtn.style.display = 'inline-block';
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // food
    ctx.fillStyle = '#f97316';
    roundRect(food.x*cell+2, food.y*cell+2, cell-4, cell-4, 6);
    // snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
      roundRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2, 5);
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function setDir(nx, ny) {
    if (dir.x === -nx && dir.y === -ny) return; // no reverse
    nextDir = { x: nx, y: ny };
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') setDir(0, -1);
    else if (e.key === 'ArrowDown') setDir(0, 1);
    else if (e.key === 'ArrowLeft') setDir(-1, 0);
    else if (e.key === 'ArrowRight') setDir(1, 0);
  });

  document.querySelector('.up').addEventListener('click', () => setDir(0, -1));
  document.querySelector('.down').addEventListener('click', () => setDir(0, 1));
  document.querySelector('.left').addEventListener('click', () => setDir(-1, 0));
  document.querySelector('.right').addEventListener('click', () => setDir(1, 0));
  restartBtn.addEventListener('click', init);

  // swipe controls
  let touchStartX = 0, touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX; touchStartY = t.clientY;
  }, {passive: true});
  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 20) setDir(dx > 0 ? 1 : -1, 0);
    } else {
      if (Math.abs(dy) > 20) setDir(0, dy > 0 ? 1 : -1);
    }
  }, {passive: true});

  init();
  draw();
})();