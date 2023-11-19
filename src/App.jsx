import React, { useState, useEffect } from "react";
import "./App.css";
import wordleSolver from "./wordleSolver"; // Adjust the path accordingly

const WordleGame = () => {
  const [wordList, setWordList] = useState([]);
  const [TARGET_WORD, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [userPreviousGuesses, setUserPreviousGuesses] = useState([]);
  const [botPreviousGuesses, setBotPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [botIsPlaying, setBotIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/five_letter_words.txt')
      .then(response => response.text())
      .then(text => {
        const wordsArray = text.split('\n').map(word => word.trim().toLowerCase());
        setWordList(wordsArray.filter(word => word.length === 5));
        const randomIndex = Math.floor(Math.random() * wordsArray.length);
        setTargetWord(wordsArray[randomIndex]);

        // Call the wordleSolver function here
        wordleSolver(wordsArray);
      })
      .catch(error => console.error(error));
  }, []);

  const handleInputChange = (event) => {
    if (gameOver || botIsPlaying) return;
    setGuess(event.target.value.trim().toLowerCase().substr(0, 5));
  };

  const handleGuess = () => {
    if (!wordList.includes(guess) || guess.length !== 5 || gameOver || botIsPlaying) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newMatchedLetters = checkMatchedLetters(guess, TARGET_WORD);

    setUserPreviousGuesses(prevGuesses => [...prevGuesses, { guess, feedback: newMatchedLetters }]);
    setGuess('');

    if (newMatchedLetters.every(matched => matched === 'green') || newAttempts === 6) {
      setGameOver(true);
    } else {
      setBotIsPlaying(true);
      setTimeout(handleBotGuess, 1000);
    }
  };

  const handleBotGuess = async () => {
    try {
      const response = await fetch('/api/perfect-guess');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      const perfectGuess = data.perfectGuess;

      setGuess(perfectGuess);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const newBotMatchedLetters = checkMatchedLetters(perfectGuess, TARGET_WORD);

      setBotPreviousGuesses(prevGuesses => [
        ...prevGuesses,
        { guess: perfectGuess, feedback: newBotMatchedLetters },
      ]);

      if (newBotMatchedLetters.every(matched => matched === 'green') || newAttempts === 6) {
        setGameOver(true);
      }

      setBotIsPlaying(false);
    } catch (error) {
      console.error('Error fetching perfect guess:', error);
      setBotIsPlaying(false);
    }
  };

  const checkMatchedLetters = (guessWord, targetWord) => {
    const newMatchedLetters = Array(5).fill(null);

    for (let i = 0; i < targetWord.length; i++) {
      if (guessWord[i] === targetWord[i]) {
        newMatchedLetters[i] = 'green';
      } else if (targetWord.includes(guessWord[i])) {
        newMatchedLetters[i] = 'yellow';
      } else {
        newMatchedLetters[i] = 'gray';
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
      <h1 className="wordle-header">CompetitiveWordle</h1>
      <div className="game-container">
        <div className="player-game">
          <h1>Player's Game</h1>
          {userPreviousGuesses.length > 0 && (
            <div>
              <p>
                {userPreviousGuesses.map((prevGuess, index) => (
                  <p key={index}>
                    <h1>
                      {prevGuess.guess.toUpperCase().split('').map((letter, idx) => (
                        <span
                          key={idx}
                          className={prevGuess.feedback[idx]} // Apply the class based on feedback color
                        >
                          {letter}
                        </span>
                      ))}
                    </h1>
                  </p>
                ))}
              </p>
            </div>
          )}
          <input
            type="text"
            maxLength={5}
            value={guess}
            onChange={handleInputChange}
            disabled={gameOver || botIsPlaying}
          />
          <p>Attempts: {attempts}</p>
          <button onClick={handleGuess} disabled={gameOver || botIsPlaying}>
            Guess
          </button>

          <button onClick={resetGame} disabled={gameOver || botIsPlaying} id="Reset_Button">
            Reset Game
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
          {botPreviousGuesses.length > 0 && (
            <div>
              <p>
                {botPreviousGuesses.map((prevGuess, index) => (
                  <p key={index}>
                    <h1>
                      {prevGuess.guess.toUpperCase().split('').map((letter, idx) => (
                        <span
                          key={idx}
                          className={prevGuess.feedback[idx]} // Apply the class based on feedback color
                        >
                          {letter}
                        </span>
                      ))}
                    </h1>
                  </p>
                ))}
              </p>
            </div>
          )}
          {/* Attempts, Game over message for bot */}
        </div>
      </div>
      {/* Reset Game button */}
    </div>
  );
};

export default WordleGame;
