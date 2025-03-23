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
  res.json(sortedWords);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
