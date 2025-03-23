document.getElementById('submit-clue').addEventListener('click', async () => {
    // Read green tile inputs
    const greens = [...Array(5).keys()].map(i =>
      document.getElementById(`green-${i}`).value.trim().toLowerCase() || null
    );
  
    // Read yellow tile inputs
    const yellows = [...Array(25).keys()].map(i =>
      document.getElementById(`yellow-${i}`).value.trim().toLowerCase() || null
    );
  
    // Read excluded letters
    const excluded = document
      .getElementById('excluded-letters')
      .value.trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
  
    // Read suggestion limit
    const suggestionLimit = 10;

  
    // Fetch full ranked word list
    const res = await fetch("/data/wordleOfficialWord5List/sorted.json");

    const data = await res.json();
  
    // Filter words based on input clues
    const filtered = data.filter(entry => {
      const word = entry.word;
  
      // Check greens (correct letters)
      for (let i = 0; i < 5; i++) {
        if (greens[i] && word[i] !== greens[i]) return false;
      }
  
      // Check yellows (wrong position but must exist)
      for (let i = 0; i < 5; i++) {
        if (yellows[i]) {
          if (!word.includes(yellows[i]) || word[i] === yellows[i]) return false;
        }
      }
  
      // Check excluded (must not exist anywhere)
      for (let x of excluded) {
        if (word.includes(x)) return false;
      }
  
      return true;
    });
  
    // Get UI elements
    const suggestionsSection = document.getElementById('suggestions-section');
    const list = document.getElementById('suggestions');
  
    // No results? Hide the section
    if (filtered.length === 0) {
      suggestionsSection.style.display = 'none';
      list.innerHTML = '';
      return;
    }
  
    // Show section and display top N suggestions
    suggestionsSection.style.display = 'block';
    list.innerHTML = '';
  
    filtered.slice(0, suggestionLimit).forEach(entry => {
      const li = document.createElement('li');
      li.textContent = entry.word;
      list.appendChild(li);
    });
  });
  