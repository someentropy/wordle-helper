document.getElementById('submit-clue').addEventListener('click', async () => {
    const greens = [];
    for (let i = 0; i < 5; i++) {
      const val = document.getElementById(`green-${i}`).value.toLowerCase();
      greens[i] = val.match(/^[a-z]$/) ? val : null; // validate single letter
    }
  
    const yellows = [];
    document.querySelectorAll('.yellow-clue').forEach(clue => {
      const letterInput = clue.querySelector('.yellow-letter');
      if (!letterInput) return;
      const letter = letterInput.value.toLowerCase();
      if (!letter.match(/^[a-z]$/)) return;
  
      const notPositions = Array.from(clue.querySelectorAll('.yellow-position'))
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value)); // positions already 0-indexed
  
      yellows.push({ letter, notPositions });
    });
  
    const excludedInput = document.getElementById('excluded-letters').value.toLowerCase();
    const excluded = excludedInput
      .replace(/[^a-z]/g, '') // remove all non-letters
      .split('')              // turn string into array of characters
      .filter((c, i, arr) => arr.indexOf(c) === i); // optional: remove duplicates
    
  
    const res = await fetch('/words');
    const wordList = await res.json();
  
    const filtered = wordList.filter(({ word }) => {
        word = word.toLowerCase(); // ensure lowercase for comparison
      
        // Green letters
        for (let i = 0; i < 5; i++) {
          if (greens[i] && word[i] !== greens[i]) return false;
        }
      
        // Yellow letters
        for (const yellow of yellows) {
          if (!word.includes(yellow.letter)) return false;
          for (const pos of yellow.notPositions) {
            if (word[pos] === yellow.letter) return false;
          }
        }
      
        // Excluded letters
        for (const letter of excluded) {
          if (word.includes(letter)) return false;
        }
        console.log(word, {
            greens,
            yellows,
            excluded,
            matchedExcludedLetters: excluded.filter(l => word.includes(l))
          });
                
        return true;
      });
      
  
      
  
    const suggestionsEl = document.getElementById('suggestions');
    suggestionsEl.innerHTML = '';
  
    if (filtered.length === 0) {
      suggestionsEl.innerHTML = '<li>No matching words found.</li>';
    } else {
      filtered.slice(0, 20).forEach(({ word, score }) => {
        const li = document.createElement('li');
        li.textContent = word;
        suggestionsEl.appendChild(li);
      });
    }
  
    document.getElementById('suggestions-section').style.display = 'block';
  });
  