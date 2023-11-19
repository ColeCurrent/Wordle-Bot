import React, { useState, useEffect } from "react";
import "./App.css";

const WordleGame = () => {
  const [wordList, setWordList] = useState([]);
  const [TARGET_WORD, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [userPreviousGuesses, setUserPreviousGuesses] = useState([]);
  const [botPreviousGuesses, setBotPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch('/five_letter_words.txt')
      .then(response => response.text())
      .then(text => {
        const wordsArray = text.split('\n').map(word => word.trim().toLowerCase());
        setWordList(wordsArray.filter(word => word.length === 5));
        const randomIndex = Math.floor(Math.random() * wordsArray.length);
        setTargetWord(wordsArray[randomIndex]);
      })
      .catch(error => console.error(error));
  }, []);

  // lowercase
  const handleInputChange = (event) => {
    setGuess(event.target.value.trim().toLowerCase().substr(0, 5));
  };
  
  const handleGuess = () => {
    if (!wordList.includes(guess) || guess.length !== 5 || gameOver) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newMatchedLetters = checkMatchedLetters(guess, TARGET_WORD);

    setUserPreviousGuesses(prevGuesses => [...prevGuesses, { guess, feedback: newMatchedLetters }]);

    if (newMatchedLetters.every(matched => matched === 'green') || newAttempts === 6) {
      setGameOver(true);
    } else {
      setTimeout(handleBotGuess, 1000);
    }
  };

  const handleBotGuess = () => {
    if (gameOver) return;

    const botGuessIndex = Math.floor(Math.random() * wordList.length);
    const botGuessedWord = wordList[botGuessIndex];

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newBotMatchedLetters = checkMatchedLetters(botGuessedWord, TARGET_WORD);

    setBotPreviousGuesses(prevGuesses => [...prevGuesses, { guess: botGuessedWord, feedback: newBotMatchedLetters }]);

    if (newBotMatchedLetters.every(matched => matched === 'green') || newAttempts === 6) {
      setGameOver(true);
    }
  };

  const checkMatchedLetters = (guessWord, targetWord) => {
    const newMatchedLetters = Array(5).fill(null);

    for (let i = 0; i < targetWord.length; i++) {
      if (guessWord[i] === targetWord[i]) {
        newMatchedLetters[i] = 'green';
      } else if (targetWord.includes(guessWord[i])) {
        newMatchedLetters[i] = 'yellow';
      }
    }

    return newMatchedLetters;
  };

  const resetGame = () => {
    setGuess('');
    setAttempts(0);
    setGameOver(false);
    setUserPreviousGuesses([]);
    setBotPreviousGuesses([]);
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setTargetWord(wordList[randomIndex]);
  };

  return (
    <div className="wordle-game-container">
      <div className="player-game">
        <h1>Wordle</h1>
        <p>Attempts: {attempts}</p>
        {userPreviousGuesses.length > 0 && (
          <div>
            <h2>Your Previous Guesses:</h2>
            <ul>
              {userPreviousGuesses.map((prevGuess, index) => (
                <li key={index}>
                  {prevGuess.guess.toUpperCase()} - {prevGuess.feedback.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
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
        {gameOver && (
          <p className="game-over">
            {userPreviousGuesses[userPreviousGuesses.length - 1].feedback.every(matched => matched === 'green')
              ? 'You guessed the word!'
              : 'You lost!'} The word was: {TARGET_WORD.toUpperCase()}
          </p>
        )}
      </div>
      <div className="bot-game">
        <h1>Bot's Game</h1>
        <p>Attempts: {attempts}</p>
        {botPreviousGuesses.length > 0 && (
          <div>
            <h2>Bot's Previous Guesses:</h2>
            <ul>
              {botPreviousGuesses.map((prevGuess, index) => (
                <li key={index}>
                  {prevGuess.guess.toUpperCase()} - {prevGuess.feedback.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
        {gameOver && (
          <p className="game-over">
            {botPreviousGuesses[botPreviousGuesses.length - 1].feedback.every(matched => matched === 'green')
              ? 'Bot guessed the word!'
              : 'Bot lost!'} The word was: {TARGET_WORD.toUpperCase()}
          </p>
        )}
      </div>
      <button onClick={resetGame} className="reset-button">
        Reset Game
      </button>
    </div>
  );
};

export default WordleGame;
