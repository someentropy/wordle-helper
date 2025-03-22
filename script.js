// Load the word list
let wordList = [];

fetch('officialWordList.txt')
  .then(response => response.text())
  .then(text => {
    wordList = text
      .split('\n')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length === 5);
  });

function buildClue() {
  const clue = {
    correct: {},
    present: {},
    not_present: []
  };

  for (let i = 0; i < 5; i++) {
    const green = document.getElementById(`green-${i}`).value.trim().toLowerCase();
    const yellow = document.getElementById(`yellow-${i}`).value.trim().toLowerCase();

    if (green) {
      if (!clue.correct[green]) clue.correct[green] = { positions: [] };
      clue.correct[green].positions.push(i);
    }

    if (yellow) {
      if (!clue.present[yellow]) clue.present[yellow] = { not_positions: [] };
      clue.present[yellow].not_positions.push(i);
    }
  }

  const excluded = document.getElementById("excluded-letters").value.trim().toLowerCase();
  clue.not_present = excluded.split(/\s*/).filter(c => c);

  return clue;
}

function matchesClue(word, clue) {
  const letters = word.split("");

  // 1. Match greens
  for (const [letter, { positions }] of Object.entries(clue.correct)) {
    for (const pos of positions) {
      if (letters[pos] !== letter) return false;
    }
  }

  // 2. Match yellows
  for (const [letter, { not_positions }] of Object.entries(clue.present)) {
    if (!word.includes(letter)) return false;
    for (const pos of not_positions) {
      if (letters[pos] === letter) return false;
    }
  }

  // 3. Exclude greys — only if they are not marked as green/yellow
  const ignoreList = new Set([...Object.keys(clue.correct), ...Object.keys(clue.present)]);
  for (const letter of clue.not_present) {
    if (!ignoreList.has(letter) && word.includes(letter)) return false;
  }

  return true;
}

function suggestWords() {
  const clue = buildClue();
  const matches = wordList.filter(word => matchesClue(word, clue));
  const list = document.getElementById("suggestions");
  list.innerHTML = "";

  if (matches.length === 0) {
    list.innerHTML = "<li>No matches found.</li>";
  } else {
    for (const word of matches) {
      const li = document.createElement("li");
      li.textContent = word;
      list.appendChild(li);
    }
  }
}

// Hook up the button
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submit-clue").addEventListener("click", suggestWords);
});
