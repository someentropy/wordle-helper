document.getElementById('submit-clue').addEventListener('click', async () => {
    const greens = [...Array(5).keys()].map(i => document.getElementById(`green-${i}`).value.trim().toLowerCase() || null);
    const yellows = [...Array(5).keys()].map(i => document.getElementById(`yellow-${i}`).value.trim().toLowerCase() || null);
    const excluded = document.getElementById('excluded-letters').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
    const res = await fetch('/words');
    const data = await res.json(); // full sorted list from backend
  
    const filtered = data.filter(entry => {
      const word = entry.word;
  
      // Check green letters
      for (let i = 0; i < 5; i++) {
        if (greens[i] && word[i] !== greens[i]) return false;
      }
  
      // Check yellow letters (must be in word, but not at that position)
      for (let i = 0; i < 5; i++) {
        if (yellows[i]) {
          if (!word.includes(yellows[i]) || word[i] === yellows[i]) return false;
        }
      }
  
      // Check excluded letters (must not be anywhere)
      for (let x of excluded) {
        if (word.includes(x)) return false;
      }
  
      return true;
    });
  
    // Show top 10 suggestions
    const list = document.getElementById('suggestions');
    list.innerHTML = '';
    filtered.slice(0, 10).forEach(entry => {
      const li = document.createElement('li');
      li.textContent = entry.word;
      list.appendChild(li);
    });
  });
  