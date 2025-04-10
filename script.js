const fs = require('fs');
const path = require('path');

// Setup paths
const listFolder = path.join(__dirname, 'data', 'wordleOfficialWord5List');
const sourcePath = path.join(listFolder, 'source.txt');
const sortedPath = path.join(listFolder, 'sorted.json');

// Get frequency of letters across word list
function getLetterFrequency(words) {
  const freq = {};
  for (const word of words) {
    const uniqueLetters = new Set(word);
    for (const letter of uniqueLetters) {
      freq[letter] = (freq[letter] || 0) + 1;
    }
  }
  return freq;
}

// Score a word based on letter frequency
function scoreWord(word, freqMap) {
  const uniqueLetters = new Set(word);
  let score = 0;
  for (const letter of uniqueLetters) {
    score += freqMap[letter] || 0;
  }
  return score;
}

// Main loader
function loadSortedWordList() {
  if (fs.existsSync(sortedPath)) {
    console.log('✅ Loaded precomputed sorted list.');
    return JSON.parse(fs.readFileSync(sortedPath, 'utf8'));
  }

  console.log('⚙️  Building sorted list from source...');
  const words = fs.readFileSync(sourcePath, 'utf8')
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === 5);

  const freqMap = getLetterFrequency(words);
  const sorted = words
    .map(word => ({ word, score: scoreWord(word, freqMap) }))
    .sort((a, b) => b.score - a.score);

  fs.writeFileSync(sortedPath, JSON.stringify(sorted, null, 2), 'utf8');
  console.log('✅ Saved sorted list to cache.');
  return sorted;
}

// Run it
const sortedWords = loadSortedWordList();
console.log('🔟 Top 10 suggestions:', sortedWords.slice(0, 10).map(w => w.word));
