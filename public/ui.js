document.getElementById('submit-clue').addEventListener('click', async () => {
    // ✅ Green letters
    const greens = [];
    for (let i = 0; i < 5; i++) {
      const val = document.getElementById(`green-${i}`).value.toLowerCase();
      greens[i] = val.match(/^[a-z]$/) ? val : '-';
    }
    const correct = greens.join('');
  
    // 🟡 Yellow letters
    const yellows = [];
    document.querySelectorAll('.yellow-clue').forEach(clue => {
      const letterInput = clue.querySelector('.yellow-letter');
      const letter = letterInput.value.toLowerCase();
  
      if (!letter.match(/^[a-z]$/)) return;
  
      const notPositions = Array.from(clue.querySelectorAll('.position-toggle.active'))
        .map(btn => parseInt(btn.dataset.value));
  
      if (notPositions.length > 0) {
        yellows.push({ letter, notPositions });
      }
    });
  
    const misplaced = {};
    yellows.forEach(({ letter, notPositions }) => {
      misplaced[letter] = notPositions;
    });
  
    // ⬛ Excluded letters
    const excludedInput = document.getElementById('excluded-letters').value.toLowerCase();
    const excluded = excludedInput
      .replace(/[^a-z]/g, '')
      .split('')
      .filter((c, i, arr) => arr.indexOf(c) === i);
  
    // 🌐 Send to backend
    const url = new URL('/words', window.location.origin);
    url.searchParams.set('correct', correct);
    url.searchParams.set('misplaced', JSON.stringify(misplaced));
    url.searchParams.set('excluded', excluded.join(''));
  
    try {
      const res = await fetch(url);
      const filtered = await res.json();
  
      // 🧠 Show results
      const suggestionsEl = document.getElementById('suggestions');
      suggestionsEl.innerHTML = '';
  
      if (filtered.length === 0) {
        suggestionsEl.innerHTML = '<li>No matching words found.</li>';
      } else {
        filtered.slice(0, 20).forEach(({ word }) => {
          const li = document.createElement('li');
          li.textContent = word;
          suggestionsEl.appendChild(li);
        });
      }
  
      document.getElementById('suggestions-section').style.display = 'block';
    } catch (err) {
      console.error('Error fetching filtered words:', err);
    }
  });
  