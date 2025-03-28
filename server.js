const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve frontend files from /public
app.use(express.static('public'));
app.use("/data", express.static("data"));

// Paths to word list files
const listFolder = path.join(__dirname, 'data', 'wordleOfficialWord5List');
const sourcePath = path.join(listFolder, 'source.txt');
const sortedPath = path.join(listFolder, 'sorted.json');

// Util: Frequency map
function getLetterFrequency(words) {
  const freq = {};
  for (const word of words) {
    const letters = new Set(word);
    for (const letter of letters) {
      freq[letter] = (freq[letter] || 0) + 1;
    }
  }
  return freq;
}

// Score each word
function scoreWord(word, freqMap) {
  const letters = new Set(word);
  return Array.from(letters).reduce((sum, letter) => sum + (freqMap[letter] || 0), 0);
}

// Load or build sorted list
function loadSortedWordList() {
  if (fs.existsSync(sortedPath)) {
    console.log('✅ Loaded precomputed sorted list.');
    return JSON.parse(fs.readFileSync(sortedPath, 'utf8'));
  }

  console.log('⚙️  Building sorted list...');
  const words = fs.readFileSync(sourcePath, 'utf8')
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === 5);

  const freqMap = getLetterFrequency(words);
  const sorted = words
    .map(word => ({ word, score: scoreWord(word, freqMap) }))
    .sort((a, b) => b.score - a.score);

  fs.writeFileSync(sortedPath, JSON.stringify(sorted, null, 2), 'utf8');
  return sorted;
}

// Load once when server starts
const sortedWords = loadSortedWordList();

// API endpoint
app.get('/words', (req, res) => {
    try {
      const correct = req.query.correct || '-----';
      const misplaced = JSON.parse(req.query.misplaced || '{}');
      const excluded = req.query.excluded ? req.query.excluded.split('') : [];
  
      console.log('🟩 correct:', correct);
      console.log('🟨 misplaced:', misplaced);
      console.log('⬛ excluded:', excluded);
  
      const filtered = sortedWords.filter(({ word }) => {
        // ✅ Green letters
        for (let i = 0; i < 5; i++) {
          if (correct[i] !== '-' && word[i] !== correct[i]) return false;
        }
  
        // 🟡 Yellow letters
        for (const [letter, badPositions] of Object.entries(misplaced)) {
          if (!word.includes(letter)) return false;
          for (const pos of badPositions) {
            const i = parseInt(pos); // fix: ensure number
            if (word[i] === letter) return false;
          }
        }
  
        // ⬛ Excluded letters
        for (const letter of excluded) {
          if (word.includes(letter)) return false;
        }
  
        return true;
      });
  
      res.json(filtered);
    } catch (err) {
      console.error('💥 Error in /words:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.get('/ads.txt', (req, res) => {
    res.sendFile(__dirname + '/ads.txt');
  });
  
  app.get('/manifest.json', (req, res) => {
    res.sendFile(__dirname + '/manifest.json');
  });
  
  app.get('/og-image.png', (req, res) => {
    res.sendFile(__dirname + '/og-image.png');
  });
  