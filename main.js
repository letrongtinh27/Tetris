const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

moves = {
  [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
  [KEY.UP]: (p) => board.rotate(p),
  [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
};

let requestId = null;
let board = null;
// next block
const canvasNext = document.getElementById("next");
const ctxNext = canvasNext.getContext("2d");

ctxNext.canvas.width = 4 * BLOCK_SIZE;
ctxNext.canvas.height = 4 * BLOCK_SIZE;
ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);

const highScoreString = localStorage.getItem(HIGH_SCORES);
const highScroes = JSON.parse(highScoreString) || [];

console.log(highScoreString);
console.log(highScroes);

const modeName = { mode: "basic" };

let accountValues = {
  score: 0,
  lines: 0,
  level: 0,
};
let time = { start: 0, elapsed: 0, level: LEVEL[0] };
// Proxy account
let account = new Proxy(accountValues, {
  set: (target, key, value) => {
    target[key] = value;
    updateAccount(key, value);
    return true;
  },
});

function saveHighScore(score, highScores) {
  const name = prompt("You got a highscore! Enter name: ");

  mode = modeName.mode;

  const newScore = { score, name, mode };

  highScores.push(newScore);

  highScores.sort((a, b) => b.score - a.score);

  highScores.splice(NO_OF_HIGH_SCORES);

  localStorage.setItem(HIGH_SCORES, JSON.stringify(highScores));
}

function showHighScores() {
  const highscore = JSON.parse(localStorage.getItem(HIGH_SCORES)) || [];

  const highScoreList = document.getElementById(HIGH_SCORES);

  highScoreList.innerHTML = highscore
    .map(
      (score) => `<li>${score.score} - ${score.name} </br> mode: ${score.mode}`
    )
    .join("");
}

showHighScores();

function checkHighScore(score) {
  const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES)) || [];

  const lowestScore = highScores[NO_OF_HIGH_SCORES - 1]?.score ?? 0;

  if (score > lowestScore) {
    saveHighScore(score, highScores);
    showHighScores();
  }
}

function handleKeyPress(event) {
  event.preventDefault();

  if (moves[event.keyCode]) {
    let p = moves[event.keyCode](board.piece);

    if (event.keyCode === KEY.SPACE) {
      while (board.valid(p)) {
        board.piece.move(p);
        account.score += POINTS.HARD_DROP;
        p = moves[KEY.SPACE](board.piece);
      }
    }

    if (board.valid(p)) {
      board.piece.move(p);
      if (event.keyCode === KEY.DOWN) {
        account.score += POINTS.SOFT_DROP;
      }
    }
  }
}

function addEventListener() {
  document.removeEventListener("keydown", handleKeyPress);
  document.addEventListener("keydown", handleKeyPress);
}

function play() {
  board = new Board(ctx, ctxNext);
  addEventListener();

  // Nếu có 1 trận đang chơi thì dừng mọi hoạt động trận đó
  if (requestId) {
    cancelAnimationFrame(requestId);
  }
  time.start = performance.now();
  animate();
  resetGame();
}

function draw() {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  board.draw();
  board.piece.draw();
}

function drop() {
  let p = moves[KEY.DOWN](board.piece);
  if (board.valid(p)) {
    board.piece.move(p);
  }
}

function animate(now = 0) {
  // Cập nhật thời gian
  time.elapsed = now - time.start;

  // Nếu thời gian vượt qua level hiện tại
  if (time.elapsed > time.level) {
    // Thiết lập lại thời gian
    time.start = now;

    if (!board.drop()) {
      gameOver();
      return;
    }
  }

  draw();
  requestId = requestAnimationFrame(animate);
}

function gameOver() {
  cancelAnimationFrame(requestId);
  ctx.fillStyle = "black";
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = "1px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("GAME OVER", 1.8, 4);

  checkHighScore(account.score);
}

function resetGame() {
  account.score = 0;
  account.level = 0;
  account.lines = 0;

  board = new Board(ctx, ctxNext);
  time = time;
}

function updateAccount(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}

let intervalIds = [];

function modeOne() {
  cancelAnimationFrame(requestId);
  board = new Board(ctx, ctxNext);
  time = { start: 0, elapsed: 0, level: LEVEL[0] };
  this.moves = {
    [KEY.LEFT]: (p) => ({ ...p, x: p.x + 1 }),
    [KEY.RIGHT]: (p) => ({ ...p, x: p.x - 1 }),
    [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => board.rotate(p),
    [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  };
}

function modeTwo() {
  cancelAnimationFrame(requestId);
  board = new Board(ctx, ctxNext);
  time.level = 350;
  moves = {
    [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => board.rotate(p),
    [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  };
}

function modeThree() {
  cancelAnimationFrame(requestId);
  board = new Board(ctx, ctxNext);
  time.level = 300;
  this.moves = {
    [KEY.LEFT]: (p) => ({ ...p, x: p.x + 1 }),
    [KEY.RIGHT]: (p) => ({ ...p, x: p.x - 1 }),
    [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => board.rotate(p),
    [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  };
}

function modeFour() {
  cancelAnimationFrame(requestId);
  board = new Board(ctx, ctxNext);
  time.level = 200;
  moves = {
    [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => board.rotate(p),
    [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  };
  let intervalKeyDown = setInterval(function () {
    // Gọi hàm rotate() trong 1 giây
    let event = new KeyboardEvent("keydown", { keyCode: 38 });
    // Gọi phương thức dispatchEvent để kích hoạt sự kiện
    document.dispatchEvent(event);
  }, 1000);
  intervalIds.push(intervalKeyDown);
}

function modeZero() {
  cancelAnimationFrame(requestId);
  board = new Board(ctx, ctxNext);
  time = { start: 0, elapsed: 0, level: LEVEL[0] };
  moves = {
    [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => board.rotate(p),
    [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  };
}

function clearAllIntervals() {
  // Duyệt qua tất cả các intervalIds và xóa chúng
  intervalIds.forEach(function (id) {
    clearInterval(id);
  });
  // Xóa tất cả các intervalIds khỏi mảng
  intervalIds = [];
}

var radios = document.getElementsByName("mode");

for (var i = 0, length = radios.length; i < length; i++) {
  radios[i].onclick = function () {
    radio = document.querySelectorAll("input[name=mode]:checked");
    for (j = 0; j < radio.length; j++) {
      if (radio[j].value == 1) {
        clearAllIntervals();
        modeOne();
        modeName.mode = "Easy";
      } else if (radio[j].value == 2) {
        clearAllIntervals();
        modeTwo();
        modeName.mode = "Normal";
      } else if (radio[j].value == 3) {
        clearAllIntervals();
        modeThree();
        modeName.mode = "Hard";
      } else if (radio[j].value == 4) {
        modeFour();
        modeName.mode = "Impossible";
      } else {
        clearAllIntervals();
        modeZero();
        modeName.mode = "Basic";
      }
    }
  };
}
function resetLocalStrong() {
  localStorage.clear();
  showHighScores();
}

function keyUp() {
  let event = new KeyboardEvent("keydown", { keyCode: 38 });
  // Gọi phương thức dispatchEvent để kích hoạt sự kiện
  document.dispatchEvent(event);
}

function keyDown() {
  let event = new KeyboardEvent("keydown", { keyCode: 40 });
  // Gọi phương thức dispatchEvent để kích hoạt sự kiện
  document.dispatchEvent(event);
}

function keyLeft() {
  let event = new KeyboardEvent("keydown", { keyCode: 37 });
  // Gọi phương thức dispatchEvent để kích hoạt sự kiện
  document.dispatchEvent(event);
}

function keyRight() {
  let event = new KeyboardEvent("keydown", { keyCode: 39 });
  // Gọi phương thức dispatchEvent để kích hoạt sự kiện
  document.dispatchEvent(event);
}

function keySpace() {
  let event = new KeyboardEvent("keydown", { keyCode: 32 });
  // Gọi phương thức dispatchEvent để kích hoạt sự kiện
  document.dispatchEvent(event);
}
if (/Mobi/.test(navigator.userAgent)) {
  let gamepad = document.getElementById("gamepad");
  gamepad.style.display = "block";
} else {
  let gamepad = document.getElementById("gamepad");
  gamepad.style.display = "none";
}
