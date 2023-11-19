import React, { useState, useEffect } from "react";
import "./App.css";

const WordleGame = () => {
  const [wordList, setWordList] = useState([]);
  const [TARGET_WORD, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [matchedLetters, setMatchedLetters] = useState([]);
  const [previousGuesses, setPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch('/five_letter_words.txt')
      .then(response => response.text())
      .then(text => {
        const wordsArray = text.split('\n').map(word => word.trim().toLowerCase());
        setWordList(wordsArray.filter(word => word.length === 5));
        const randomIndex = Math.floor(Math.random() * wordsArray.length);
        setTargetWord(wordsArray[randomIndex]);
        setMatchedLetters(Array(5).fill(null));
      })
      .catch(error => console.error(error));
  }, []);

  const handleInputChange = (event) => {
    setGuess(event.target.value.trim().toLowerCase().substr(0, 5));
  };

  const handleGuess = () => {
    if (!wordList.includes(guess) || guess.length !== 5 || gameOver) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newMatchedLetters = [...matchedLetters];
    let allLettersMatch = true;

    for (let i = 0; i < TARGET_WORD.length; i++) {
      if (guess[i] === TARGET_WORD[i]) {
        newMatchedLetters[i] = 'green';
      } else if (TARGET_WORD.includes(guess[i])) {
        newMatchedLetters[i] = 'yellow';
        allLettersMatch = false; // To prevent immediate game over if any letter is in the wrong position
      } else {
        newMatchedLetters[i] = null;
        allLettersMatch = false;
      }
    }

    setMatchedLetters(newMatchedLetters);

    setPreviousGuesses(prevGuesses => [...prevGuesses, { guess, feedback: newMatchedLetters }]);

    if (allLettersMatch || newAttempts === 6) {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setGuess('');
    setAttempts(0);
    setGameOver(false);
    setMatchedLetters(Array(5).fill(null));
    setPreviousGuesses([]);
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setTargetWord(wordList[randomIndex]);
  };

  const renderWord = () => {
    return (
      <div className="word-display">
        {TARGET_WORD &&
          TARGET_WORD.split('').map((letter, index) => {
            const highlight = matchedLetters[index];

            return (
              <span key={index} className={`letter ${highlight}`}>
                {highlight === 'green' || highlight === 'yellow' ? letter.toUpperCase() : '_'}
              </span>
            );
          })}
      </div>
    );
  };

  return (
    <div className="wordle-game">
      <h1>Wordle Game</h1>
      <p>Guess the word (5-letter word for this example)</p>
      {renderWord()}
      <input
        type="text"
        maxLength={5}
        value={guess}
        onChange={handleInputChange}
        disabled={gameOver}
      />
      <button onClick={handleGuess} disabled={gameOver}>
        Guess
      </button>
      <button onClick={resetGame}>
        Reset Game
      </button>
      <p>Attempts: {attempts}</p>
      {previousGuesses.length > 0 && (
        <div>
          <h2>Previous Guesses:</h2>
          <ul>
            {previousGuesses.map((prevGuess, index) => (
              <li key={index}>
                {prevGuess.guess.toUpperCase()} - {prevGuess.feedback.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
      {gameOver && (
        <p className="game-over">
          {matchedLetters.every(matched => matched === 'green')
            ? 'You guessed the word!'
            : 'You lost!'} The word was: {TARGET_WORD.toUpperCase()}
        </p>
      )}
    </div>
  );
};

export default WordleGame;
