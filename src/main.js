// pages
var homePage = document.getElementById("homePage");
var rulesPage = document.getElementById("rulesPage");
var gamePage  = document.getElementById("gamePage");

// menu buttons
var startBtn       = document.getElementById("startBtn");
var rulesBtn       = document.getElementById("rulesBtn");
var backFromRules  = document.getElementById("backFromRules");
var backFromGame   = document.getElementById("backFromGame");

// game elements
var numberBtnsBox  = document.getElementById("numberBtns");
var evenBtn        = document.getElementById("evenBtn");
var oddBtn         = document.getElementById("oddBtn");
var playBtn        = document.getElementById("playBtn");
var resetBtn       = document.getElementById("resetBtn");
var infoEl         = document.getElementById("info");
var logEl          = document.getElementById("log");
var playerScoreEl  = document.getElementById("playerScore");
var compScoreEl    = document.getElementById("compScore");
var resultMessageEl = document.getElementById("resultMessage");

// game state
var playerNumber = null;
var playerParity = null;
var pScore = 0;
var cScore = 0;
var gameOver = false;
var numberButtons = [];

// show page
function showPage(name){
    homePage.classList.remove("active");
    rulesPage.classList.remove("active");
    gamePage.classList.remove("active");

    if(name === "home")  homePage.classList.add("active");
    if(name === "rules") rulesPage.classList.add("active");
    if(name === "game")  gamePage.classList.add("active");
}

// initial page
showPage("home");

// menu events
startBtn.addEventListener("click", function(){
    showPage("game");
});

rulesBtn.addEventListener("click", function(){
    showPage("rules");
});

backFromRules.addEventListener("click", function(){
    showPage("home");
});

backFromGame.addEventListener("click", function(){
    showPage("home");
});

// create number buttons (0–5)
for (var i = 0; i <= 5; i++){
    var b = document.createElement("button");
    b.className = "btn";
    b.textContent = i;

    (function(value, btn){
        btn.addEventListener("click", function(){
            selectNumber(value);
        });
    })(i, b);

    numberBtnsBox.appendChild(b);
    numberButtons.push(b);
}

// select number
function selectNumber(n){
    if(gameOver) return;

    playerNumber = n;

    for (var i = 0; i < numberButtons.length; i++){
        if (i === n){
            numberButtons[i].classList.add("selected");
        }else{
            numberButtons[i].classList.remove("selected");
        }
    }

    infoEl.textContent = "You selected number " + n + ". Now choose Even or Odd.";
}

// select parity
function selectParity(parity){
    if(gameOver) return;

    playerParity = parity;

    if (parity === "even"){
        evenBtn.classList.add("selected");
        oddBtn.classList.remove("selected");
    }else{
        oddBtn.classList.add("selected");
        evenBtn.classList.remove("selected");
    }

    if(playerNumber === null){
        infoEl.textContent = "You chose " + parity.toUpperCase() + ". Now pick a number.";
    }else{
        infoEl.textContent =
            "Number: " + playerNumber +
            ", Choice: " + parity.toUpperCase() +
            ". Press Play Round.";
    }
}

evenBtn.addEventListener("click", function(){
    selectParity("even");
});

oddBtn.addEventListener("click", function(){
    selectParity("odd");
});

// helper functions
function isEven(n){
    return n % 2 === 0;
}

function updateScores(){
    playerScoreEl.textContent = pScore;
    compScoreEl.textContent   = cScore;
}

// play one round
function playRound(){
    if(gameOver) return;

    if(playerNumber === null || !playerParity){
        infoEl.textContent = "Please choose both a number and Even/Odd.";
        return;
    }

    var comp = Math.floor(Math.random() * 6); // 0..5
    var sum  = playerNumber + comp;
    var sumEven = isEven(sum);
    var playerPickedEven = (playerParity === "even");

    if ((sumEven && playerPickedEven) || (!sumEven && !playerPickedEven)){
        pScore++;
        infoEl.textContent =
            "You win this round! Sum = " + sum +
            " (" + (sumEven ? "Even" : "Odd") + ")";
        logEl.innerHTML =
            "<div>✅ You: " + playerNumber +
            ", Computer: " + comp +
            ", Sum " + sum + "</div>" + logEl.innerHTML;
    } else {
        cScore++;
        infoEl.textContent =
            "Computer wins this round. Sum = " + sum +
            " (" + (sumEven ? "Even" : "Odd") + ")";
        logEl.innerHTML =
            "<div>❌ You: " + playerNumber +
            ", Computer: " + comp +
            ", Sum " + sum + "</div>" + logEl.innerHTML;
    }

    updateScores();

    // check game over (first to 5)
    if (pScore >= 5 || cScore >= 5){
        gameOver = true;

        // clear old classes
        resultMessageEl.classList.remove("result-win", "result-lose");

        if (pScore > cScore){
            // player wins
            resultMessageEl.textContent = "Congratulations! You win!";
            resultMessageEl.classList.add("result-win");
        } else {
            // computer wins
            resultMessageEl.textContent = "LOSE";
            resultMessageEl.classList.add("result-lose");
        }

        infoEl.textContent += "  Game Over! Press Reset to play again.";
    }
}

playBtn.addEventListener("click", playRound);

// reset game
function resetGame(){
    playerNumber = null;
    playerParity = null;
    pScore = 0;
    cScore = 0;
    gameOver = false;

    for (var i = 0; i < numberButtons.length; i++){
        numberButtons[i].classList.remove("selected");
    }
    evenBtn.classList.remove("selected");
    oddBtn.classList.remove("selected");

    logEl.innerHTML = "";
    updateScores();

    // clear result message
    resultMessageEl.textContent = "";
    resultMessageEl.classList.remove("result-win", "result-lose");

    infoEl.textContent =
        "Game reset! Pick a number, choose Even/Odd, then press Play Round.";
}

resetBtn.addEventListener("click", resetGame);
