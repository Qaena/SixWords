let answer;
let possibleWords;
let legalWords;
const keys = "QWERTYUIOPASDFGHJKLZXCVBNM";

function init() {
  loadWords();
  createVirtualKeyboard(document.querySelector(".keyboard"));
  createWords(document.querySelector(".wordsContainer"));
}

function createWords(containingElement) {
  for (let i = 0; i < 6; i++) {
    let wordEl = document.createElement("div");
    wordEl.classList.add("word");
    if (i == 0) wordEl.classList.add("active");

    for (let j = 0; j < 5; j++) {
      let letterEl = document.createElement("div");
      letterEl.classList.add("letter");
      if (i ==0 && j == 0) letterEl.classList.add("active");

      wordEl.appendChild(letterEl);
    }

    containingElement.appendChild(wordEl);
  }
}

function loadWords() {
  fetch("words.json")
    .then(response => response.json())
    .then(function(json) {
      possibleWords = json.answers;
      legalWords = json.legalWords;
      chooseAnswer();
    });
}

function chooseAnswer() {
  answer = possibleWords[Math.floor(Math.random() * possibleWords.length)].toUpperCase();
}

function handleKeyPress(e) {
  let activeEl = document.querySelector(".active.letter");

  e.preventDefault();

  this.classList.add("shaded");
  setTimeout(() => this.classList.remove("shaded"), 130);

  if (activeEl == null) return;
  let letterPlace = Array.from(activeEl.parentNode.children).indexOf(activeEl);

  activeEl.innerHTML = this.innerHTML;
  clearEnterError();
  
  activeEl.classList.remove("active");
  if (letterPlace < 4) document.querySelectorAll(".active.word .letter")[letterPlace + 1].classList.add("active");
}

function handleBackspace(e) {
  let activeEl = document.querySelector(".active.letter");

  e.preventDefault();

  this.classList.add("shaded");
  setTimeout(() => this.classList.remove("shaded"), 130);

  let letterPlace;
  if (activeEl == null) {
    letterPlace = 4;
  } else {
    letterPlace = Array.from(activeEl.parentNode.children).indexOf(activeEl);

    if (letterPlace == 0) return;
    activeEl.classList.remove("active");
    letterPlace--;
  }

  activeEl = document.querySelectorAll(".active.word .letter")[letterPlace];
  activeEl.innerHTML = "";
  activeEl.classList.add("active");

  clearEnterError();
}

function handleEnter(e) {
  e.preventDefault();

  this.classList.add("shaded");
  setTimeout(() => this.classList.remove("shaded"), 130);

  //ensure 5 letters entered
  if (document.querySelector(".active.letter") != null) {
    enterError();
    return;
  }

  //ensure legal word
  let checkWord = "";
  document.querySelectorAll(".active.word .letter").forEach(letterEl => checkWord += letterEl.innerHTML);
  if (legalWords.indexOf(checkWord.toLowerCase()) == -1) {
    enterError();
    return;
  }

  //do the letter coloring
  let remainingLetters = [];
  for (let i = 0; i < 5; i++) {
    let checkEl = document.querySelectorAll(".active.word .letter")[i];
    
    if (checkEl.innerHTML == answer[i]) {
      checkEl.classList.add("green");
      colorKeyboardLetter(checkEl.innerHTML, "green");
    } else {
      remainingLetters.push(answer[i]);
    }
  }

  if (remainingLetters.length == 0) {
    document.querySelector(".active.word").classList.remove("active");
    end(true);
    return;
  }

  document.querySelectorAll(".active.word .letter:not(.green)").forEach(checkEl => {
    let letterPos = remainingLetters.indexOf(checkEl.innerHTML);
    if (letterPos > -1) {
      checkEl.classList.add("yellow");
      colorKeyboardLetter(checkEl.innerHTML, "yellow");
      remainingLetters.splice(letterPos, 1);
    } else {
      checkEl.classList.add("gray");
      colorKeyboardLetter(checkEl.innerHTML, "gray");
    }
  });

  //advance to the next word
  let activeWord = document.querySelector(".active.word");
  let wordPlace = Array.from(activeWord.parentNode.children).indexOf(activeWord);

  activeWord.classList.remove("active");
  if (wordPlace < 5) {
    activeWord = document.querySelectorAll(".word")[wordPlace + 1];
    activeWord.classList.add("active");
    activeWord.querySelectorAll(".letter")[0].classList.add("active");
  } else {
    end(false);
  }
}

//color is "green", "yellow", or "gray"
function colorKeyboardLetter(letter, color) {
  document.querySelectorAll(".key")[keys.indexOf(letter)].classList.add(color);
}

function end(win) {
  let overlayEl = document.createElement("div");
  overlayEl.classList.add("overlay");
  document.querySelector("body").appendChild(overlayEl);

  let endCardEl = document.createElement("div");
  endCardEl.classList.add("endCard");
  endCardEl.classList.add(win ? "win" : "lose");

  let endTitleEl = document.createElement("p");
  endTitleEl.classList.add("endTitle");
  endTitleEl.innerHTML = "You " + (win ? "WON!" : "Lost");
  endCardEl.appendChild(endTitleEl);

  if (!win) {
    let solutionTextEl = document.createElement("p");
    solutionTextEl.classList.add("endText");
    solutionTextEl.innerHTML = "The word was '" + answer.toUpperCase() + "'";
    endCardEl.appendChild(solutionTextEl);
  }

  let playAgainEl = document.createElement("div");
  playAgainEl.classList.add("playAgainButton");
  playAgainEl.innerHTML = "Play Again"
  playAgainEl.addEventListener('touchstart', handlePlayAgainPress)
  playAgainEl.addEventListener('click', handlePlayAgainPress)
  endCardEl.appendChild(playAgainEl);

  overlayEl.appendChild(endCardEl);
}

function handlePlayAgainPress() {
  document.querySelector(".overlay").remove();
  document.querySelectorAll(".key").forEach(key => {
    key.classList.remove("green");
    key.classList.remove("yellow");
    key.classList.remove("gray");
  });
  document.querySelectorAll(".letter").forEach(letter => {
    letter.innerHTML = "";

    letter.classList.remove("green");
    letter.classList.remove("yellow");
    letter.classList.remove("gray");
  });
  document.querySelectorAll(".word")[0].classList.add("active");
  document.querySelectorAll(".word.active .letter")[0].classList.add("active");

  chooseAnswer();
}

function enterError() {
  document.querySelector(".word.active").classList.add("error");
}

function clearEnterError() {
  document.querySelector(".word.active").classList.remove("error");
}

function createVirtualKeyboard(containingElement) {
  for (let i = 0; i < 26; i++) {
    let key = keys.substring(i, i + 1);

    let keyEl = document.createElement("div");
    keyEl.innerHTML = key;
    keyEl.classList.add("key");
    keyEl.addEventListener('touchstart', handleKeyPress)
    keyEl.addEventListener('click', handleKeyPress)

    containingElement.appendChild(keyEl);

    if (key == "L") {
      let halfKeyEl = document.createElement("div");
      halfKeyEl.classList.add("halfKey");
      containingElement.appendChild(halfKeyEl);
    }

    if (key == "P" || key == "L") {
      let breakEl = document.createElement("div");
      breakEl.classList.add("break");
      containingElement.appendChild(breakEl);
    }

    if (key == "P") {
      let halfKeyEl = document.createElement("div");
      halfKeyEl.classList.add("halfKey");
      containingElement.appendChild(halfKeyEl);      
    }

    if (key == "L") {
      let preZKeyEl = document.createElement("div");
      preZKeyEl.classList.add("preZKey");
      containingElement.appendChild(preZKeyEl);
    }
  }

  let quarterKeyEl = document.createElement("div");
  quarterKeyEl.classList.add("quarterKey");
  containingElement.appendChild(quarterKeyEl);

  let backspaceEl = document.createElement("div");
  backspaceEl.classList.add("backspace");
  backspaceEl.classList.add("key");
  backspaceEl.innerHTML = "&#171;"
  backspaceEl.addEventListener('touchstart', handleBackspace)
  backspaceEl.addEventListener('click', handleBackspace)
  containingElement.appendChild(backspaceEl);

  let breakEl = document.createElement("div");
  breakEl.classList.add("break");
  containingElement.appendChild(breakEl);
  breakEl = document.createElement("div");
  breakEl.classList.add("break");
  containingElement.appendChild(breakEl);

  let enterEl = document.createElement("div");
  enterEl.classList.add("enter");
  enterEl.classList.add("key");
  enterEl.innerHTML = "Enter"
  enterEl.addEventListener('touchstart', handleEnter)
  enterEl.addEventListener('click', handleEnter)
  containingElement.appendChild(enterEl);
}