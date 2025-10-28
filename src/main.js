// ====== GAME STATE (simple) ======
var playerNumber = null;    // 0..5
var playerParity = null;    // 'even' | 'odd'
var pScore = 0;
var cScore = 0;
var toWin = 3;
var gameOver = false;

// ====== DOM refs ======
var landing   = document.getElementById('landing');
var gameSec   = document.getElementById('game');
var startBtn  = document.getElementById('startBtn');
var rulesBtn  = document.getElementById('rulesBtn');
var rulesModal= document.getElementById('rulesModal');
var closeRules= document.getElementById('closeRules');
var backBtn   = document.getElementById('backBtn');

var pScoreEl = document.getElementById('pScore');
var cScoreEl = document.getElementById('cScore');
var toWinEl  = document.getElementById('toWin');
var numsEl   = document.getElementById('nums');
var infoEl   = document.getElementById('info');
var logEl    = document.getElementById('log');
var evenBtn  = document.getElementById('evenBtn');
var oddBtn   = document.getElementById('oddBtn');
var playBtn  = document.getElementById('playBtn');
var resetBtn = document.getElementById('resetBtn');

// ====== BUILD number buttons 0..5 ======
function buildNumberButtons() {
  var i;
  for (i = 0; i <= 5; i++) {
    (function(n){
      var b = document.createElement('button');
      b.textContent = n;
      b.onclick = function () {
        if (gameOver) return;
        playerNumber = n;
        updateInfo();
      };
      numsEl.appendChild(b);
    })(i);
  }
}

function updateInfo() {
  var numText = (playerNumber === null) ? '—' : playerNumber;
  var parText = playerParity ? (playerParity === 'even' ? 'Even' : 'Odd') : '—';
  infoEl.textContent = 'Your choice: Number = ' + numText + ', ' + parText;
}

function isEven(n) { return n % 2 === 0; }

function playRound() {
  if (gameOver) return;
  if (playerNumber === null || !playerParity) {
    infoEl.textContent = 'Please pick both a number and parity.';
    return;
  }

  var comp = Math.floor(Math.random() * 6); // 0..5
  var sum = playerNumber + comp;
  var sumEven = isEven(sum);
  var playerSaidEven = (playerParity === 'even');

  if ((sumEven && playerSaidEven) || (!sumEven && !playerSaidEven)) {
    pScore++;
    infoEl.textContent = 'You win this round! Sum = ' + sum + ' (' + (sumEven ? 'Even' : 'Odd') + ')';
    logEl.innerHTML = '<div>✅ You: ' + playerNumber + ', Comp: ' + comp + ', Sum ' + sum + '</div>' + logEl.innerHTML;
  } else {
    cScore++;
    infoEl.textContent = 'Computer wins this round. Sum = ' + sum + ' (' + (sumEven ? 'Even' : 'Odd') + ')';
    logEl.innerHTML = '<div>❌ You: ' + playerNumber + ', Comp: ' + comp + ', Sum ' + sum + '</div>' + logEl.innerHTML;
  }

  pScoreEl.textContent = pScore;
  cScoreEl.textContent = cScore;

  // ---- WIN / LOSE message ----
  var messageBox = document.createElement('div');
  messageBox.className = 'game-message';
  if (pScore >= toWin) {
    gameOver = true;
    messageBox.textContent = '🎉 Congratulations! You Win!';
    messageBox.classList.add('win');
  } else if (cScore >= toWin) {
    gameOver = true;
    messageBox.textContent = '😢 You Lose';
    messageBox.classList.add('lose');
  }

  if (gameOver) {
    document.body.appendChild(messageBox);
    setTimeout(function() {
      messageBox.classList.add('show');
    }, 100);
  }

  playerNumber = null;
  updateInfo();
}

function resetGame() {
  playerNumber = null;
  playerParity = null;
  pScore = 0;
  cScore = 0;
  gameOver = false;

  pScoreEl.textContent = '0';
  cScoreEl.textContent = '0';
  toWinEl.textContent = toWin;
  infoEl.textContent = 'Choose number + parity, then press Play.';
  logEl.innerHTML = '';
  updateInfo();

  // remove any message
  var msg = document.querySelector('.game-message');
  if (msg) msg.remove();
}


// ====== Start screen / modal / back ======
function showGame() {
  landing.classList.add('hidden');
  gameSec.classList.remove('hidden');
}

function showLanding() {
  gameSec.classList.add('hidden');
  landing.classList.remove('hidden');
}

function openRules() {
  rulesModal.classList.remove('hidden');
}

function closeRulesModal() {
  rulesModal.classList.add('hidden');
}

// ====== Event bindings ======
evenBtn.onclick = function(){ if (!gameOver) { playerParity = 'even'; updateInfo(); } };
oddBtn.onclick  = function(){ if (!gameOver) { playerParity = 'odd'; updateInfo(); } };
playBtn.onclick = playRound;
resetBtn.onclick= resetGame;

// change target buttons (3/5/7)
document.addEventListener('click', function(e){
  var t = e.target;
  if (t && t.matches('[data-target]')) {
    toWin = parseInt(t.getAttribute('data-target'), 10) || 3;
    toWinEl.textContent = toWin;
    // keep current scores, just change target
  }
});

// landing / modal / back
startBtn.onclick = showGame;
rulesBtn.onclick = openRules;
closeRules.onclick = closeRulesModal;
backBtn.onclick = function(){
  // optional: also reset when going back
  resetGame();
  showLanding();
};

// keyboard: Enter to start on landing, Esc to close rules
window.addEventListener('keydown', function(e){
  if (!gameSec || !landing) return;
  var onLanding = !landing.classList.contains('hidden');
  if (onLanding && e.key === 'Enter') showGame();
  if (!onLanding && e.key === 'Escape') closeRulesModal();
});

// ====== Init ======
buildNumberButtons();
resetGame();

