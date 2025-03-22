// Just a small test list — we'll load a full dictionary later
const wordList = ['slate', 'crane', 'flame', 'glare', 'plate', 'brine', 'grape', 'blame'];

function matchesGreen(word, green) {
  return [...green].every((char, i) => char === '_' || word[i] === char.toLowerCase());
}

function matchesYellow(word, yellow) {
  return yellow.every(letter => word.includes(letter.toLowerCase()));
}

function excludesGrey(word, grey) {
  return ![...grey].some(letter => word.includes(letter.toLowerCase()));
}

document.getElementById('wordle-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const greenInput = document.getElementById('green').value.trim();
  const yellowInput = document.getElementById('yellow').value.trim().split(/\s+/);
  const greyInput = document.getElementById('grey').value.trim().split(/\s+/);

  const matches = wordList.filter(word =>
    matchesGreen(word, greenInput) &&
    matchesYellow(word, yellowInput) &&
    excludesGrey(word, greyInput)
  );

  const suggestionList = document.getElementById('suggestions');
  suggestionList.innerHTML = '';
  matches.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    suggestionList.appendChild(li);
  });
});
