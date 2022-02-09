let keyboardKeys = ["qwertyuiop","asdfghjkl","zxcvbnm"];
let cells ;
const maxWords = 6;
let targetWord  = "" ;
let guessedWord = "" ;
let currentWordIndex = 0 ;
let letter = 0;
let meaning = "" ;

window.onload = () => {
    generateKeyboard();
    resetGame();
    Swal.fire({
        title: 'Rules',
        html : `<div style="text-align:center;color:var(--n300)">
        Guess the <b style="color:var(--p)">SECRET WORD</b><br/>
        Press <kbd style="display:inline-block;padding:0.25rem 0.5rem">Enter</kbd> to check<br/>
        If a letter is in the secret word it will be <b style="color:var(--yellow)">YELLOW</b><br/>
        If a letter is in right place then it will be <b style="color:var(--green)">GREEN</b>
        </div>`,
        confirmButtonText : "Start",
        confirmButtonColor:"var(--p)",
        color : "#fff",
        background : "var(--n800)",
        showConfirmButton: true
    })
};

async function resetGame(){
    generateGameBoard();
    loadCells();
    targetWord = pickNewWord();
    meaning = await getMeaning(targetWord);
    currentWordIndex = 0;
    letter = 0;
    guessedWord = "" ;
    // console.log(targetWord,meaning);
    
    if(!targetWord){
        Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            confirmButtonText : "Reset Game",
            confirmButtonColor:"var(--p)",
            color : "#fff",
            background : "var(--n800)",
            showConfirmButton: true
        }).then(()=>{
            resetGame();
        })
    }
}

function generateKeyboard(){
    const keyboard = document.querySelector(".keyboard");
    keyboard.innerHTML += keyboardKeys.map(row => (
        `<div class="row">${row.split("").map(key => `<kbd onclick="press('${key}')">${key}</kbd>`).join('')}</div>`
    )).join("");
}

function generateGameBoard(){
    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = (new Array(maxWords).fill(0).map(()=>(
        `<div class="row">${(new Array(5).fill(0).map(()=>`<div class="cell"></div>`)).join("")}</div>`
    ))).join("")
}

function press(key){
    if(letter>4) return ;
    cells[currentWordIndex][letter].innerHTML = `<div class="filled">${key}</div>` ;
    guessedWord += key.toLowerCase() ;
    letter++;
}

function erase(){
    if(letter == 0) return ;
    letter--;
    cells[currentWordIndex][letter].innerHTML = "" ;
    guessedWord = guessedWord.slice(0,guessedWord.length-1)
}

function enter(e){
    if(guessedWord.length != 5) {
        shakeElement(e.target);
        return;
    }

    if(guessedWord === targetWord){
        markMatchingLetters([2,2,2,2,2]);
        Swal.fire({
            title: 'You Won',
            html: `<div style="text-align:center">
                The word was <b style="color:var(--green);">${targetWord}</b><br/>
                <b>Meaning</b><br/>
                ${meaning}
            </div>`,
            icon: 'success',
            confirmButtonText: 'Play Again',
            confirmButtonColor:"var(--p)",
            color : "#fff",
            background : "var(--n800)",
            backdrop : false
        }).then((result) => {
            if (result.isConfirmed) {
                resetGame();
            }
        })
        return ;
    }

    if(isValidWord(guessedWord)){
        markMatchingLetters(
            getMatchingLetters(guessedWord)
        );
        currentWordIndex++;
        letter = 0;
        guessedWord="";
        console.log(currentWordIndex)
    } else {
        shakeElement(cells[currentWordIndex].row);
    }

    if(currentWordIndex == maxWords){
        Swal.fire({
            title: 'You Lost',
            html: `<div style="text-align:center">
                The word was <b style="color:var(--green);">${targetWord}</b><br/>
                <b>Meaning</b><br/>
                ${meaning}
            </div>`,
            icon: 'error',
            confirmButtonText: 'Try again',
            confirmButtonColor:"var(--p)",
            color : "#fff",
            background : "var(--n800)",
            backdrop : false
        }).then(() => {
            resetGame();
        })
    }
}

function shakeElement(elm){
    elm.classList.add("shake");
    setTimeout(()=>{elm.classList.remove("shake");},820);
}

function isValidWord(word){
    return dictionary.includes(word) ;
}

function getMatchingLetters(word){
    let match = word.split("").map(ch => targetWord.includes(ch)?1:0) ;
    return match.map((mat,i)=>(word[i]==targetWord[i])?2:mat)
}

function markMatchingLetters(match){
    // console.log(match)
    const classNames = ["no-match","included","match"]
    for(var i=0;i<5;i++){
        cells[currentWordIndex][i].classList.add(classNames[match[i]])
    }
}

function loadCells(){
    let rows = [...document.querySelectorAll(".game-board .row")];
    cells = new Array(maxWords).fill([]);
    rows.forEach((r,i) => {
        cells[i] = [...r.querySelectorAll(".cell")] ;
        cells[i].row = r ;
    });
}

function pickNewWord(){
    if(!dictionary) {
        console.error("DICT NOT FOUND");
        return false ;
    }
    return dictionary[Math.floor(Math.random()*5757)];
}

async function getMeaning(word){
    let res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    let data = await res.json()
    return data[0].meanings[0].definitions[0].definition;
}