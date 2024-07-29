export function getCompleteSentences(buffer) {
  const sentences = [];
  let currentSentence = '';
  const sentenceEndings = ['.', '!', '?'];
  let inQuotes = false;
  let bracketDepth = 0;

  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    currentSentence += char;

    // Handle quotes
    if (char === '"') {
      inQuotes = !inQuotes;
    }

    // Handle brackets
    if (char === '(' || char === '[' || char === '{') {
      bracketDepth++;
    } else if (char === ')' || char === ']' || char === '}') {
      bracketDepth = Math.max(0, bracketDepth - 1);
    }

    // Check for sentence end
    if (sentenceEndings.includes(char) && 
        !inQuotes && 
        bracketDepth === 0 &&
        (i === buffer.length - 1 || /\s/.test(buffer[i + 1]))) {
      sentences.push(currentSentence.trim());
      currentSentence = '';
    }
  }

  return sentences;
}