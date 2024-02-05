import React, { useState, useEffect } from "react";
import "./App.css";



const sendRequest = async (endpoint, data, callback = null) => {
  /**
   *    Send info to Flask API
   */

  try {
    const response = await fetch(`http://localhost:5173${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    if (callback && typeof callback === 'function') {
      callback(responseData);
    }
    return responseData;
  } catch (error) {
    console.error('Error in sendRequest:', error);
    throw error; // rethrow the error for further handling if needed
  }
};


const getFeedbackString = (feedback) => {
  /**
   *    Returns a string representation of the feedback colors
   */
  return feedback.map(color => {
    switch (color) {
      case 'green':
        return 'g';
      case 'yellow':
        return 'y';
      case 'gray':
        return 'b'; // Assuming 'b' represents gray in your string
      default:
        return '_'; // Handle other cases as needed
    }
  }).join('');
};


const WordleGame = () => {
  const [wordList, setWordList] = useState([]);
  const [TARGET_WORD, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [userPreviousGuesses, setUserPreviousGuesses] = useState([]);
  const [botPreviousGuesses, setBotPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [suggestedWord, setSuggestedWord] = useState("");
  const [botColor, setBotColor] = useState("bbbbb");
  


  useEffect(() => {
    /**
     *  Sets random targert word
     */

    fetch('/five_letter_words.txt') 
    .then(response => response.text()) // Converts txt file to string

    .then(text => {
      // Split text into array of lowercase words
      const wordsArray = text.split('\n').map(word => word.trim().toLowerCase());

      setWordList(wordsArray.filter(word => word.length === 5)); // Finds all 5 letter words
      const randomIndex = Math.floor(Math.random() * wordsArray.length);
      setTargetWord(wordsArray[randomIndex]);
    })

    .catch(error => console.error("Error fetching word list:", error));
  }, []);


  const handleInputChange = (event) => {
    /**
     *   Handles user input
     */

    setGuess(event.target.value.trim().toLowerCase().substr(0, 5));
  };


  const handlePlayerGuess = () => {
    /**
     *    Checks user guess
     *    Updates previousUserGuesses array
     *    Checks if user won
     */

    // Checks if over
    if (!wordList.includes(guess) || gameOver) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Apply colors
    const newMatchedLetters = checkMatchedLetters(guess);

    // Update previous guess with current guess + feedback
    setUserPreviousGuesses(prevGuesses => [...prevGuesses, { guess, feedback: newMatchedLetters }]);
    setGuess('');

    // Checks if user won
    if ((newMatchedLetters.every(matched => matched === 'green')) || (newAttempts === 6)) {
      setGameOver(true);
    } else {
      handleBotGuess();
    }
  };


  const handleBotGuess = async () => {
    /**
     *    Directs API calls to makeBotGuess() regarding the bots guesses   
     * 
     *    Calls startWordle() first iteration - processBotGuess() after
     *       - Calls makeBotGuess
     */

    if (gameOver) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // First iteration
    if (newAttempts === 1) {
      
      const suggestedWord = await startWordle(); // Await the suggested word
      makeBotGuess(suggestedWord);

    } else {   // Every non-first Iteration

      // pulls last string out of botPreviousGuesses array
      const lastGuess = botPreviousGuesses[botPreviousGuesses.length - 1].guess;

      const suggestedWord = await processBotGuess(lastGuess, botColor, () => {});

      makeBotGuess(suggestedWord);

    }
  };


  const makeBotGuess = (botGuessedWord) => {
    /**
     *    Update bots previous guesses
     *    Check bot win status
     */

    const newBotMatchedLetters = checkMatchedLetters(botGuessedWord);
  
    // Update previous guesses with the current guess and feedback
    setTimeout(setBotPreviousGuesses(prevGuesses => [...prevGuesses, { guess: botGuessedWord, feedback: newBotMatchedLetters }]), 2000);

    // Check if the bot has won or if the game is over due to maximum attempts reached
    if (newBotMatchedLetters.every(matched => matched === 'green') || attempts >= 6) {
      setGameOver(true);
      // Additional logic if needed when the game is over
      console.log('Game Over. Bot guessed the word or max attempts reached.');
    } else {
      // Prepare for the next turn
      setBotColor(getFeedbackString(newBotMatchedLetters));
    }
  };


  useEffect(() => {
    /**
     *    Makes bot guess whenever suggestWord is updated in API calls
     */
    if (suggestedWord) {
      makeBotGuess(suggestedWord);
    }
  }, [suggestedWord]); 


  const startWordle = async () => {
    /**
     *    Grab bots starter guess from backend
     */

    try {
      // Makes POST call to backend
      const response = await fetch("http://localhost:5173/api/start", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Set data to Flask output
      const data = await response.json();
      return data.suggestedWord;

    } catch (error) {
      console.error('Error starting Wordle:', error);
      return ""; // Return an empty string or handle the error appropriately
    }
  };
  

  const processBotGuess = async (currentGuess, letterColors) => {
    /**
     *    Grab bots calculated guess from backend using callback
     */

    try {

      sendRequest('/api/guess', { currentGuess, letterColors }, (response) => {

        // Grabs return of optimal word from process_guess()
        setSuggestedWord(response.nextGuess);

      });
    } catch (error) {
      console.error('Error processing guess:', error);
    }
  };


  const handleEnterKey = (event) => {
    /**
     *    Handle Enter key press
     */

    if (event.key === 'Enter') {
      handlePlayerGuess();
    }
  };


  useEffect(() => {
    /**
     *    Handle Enter key press
     */

    document.addEventListener('keydown', handleEnterKey);
    return () => {
      document.removeEventListener('keydown', handleEnterKey);
    };
  }, [handlePlayerGuess]);


  const checkMatchedLetters = (guessWord) => {
    /**
     *    Returns array of guesses matching colors 
     */

    const newMatchedLetters = Array(5).fill(null);

    // Loops through every letter in wordle word
    for (let i = 0; i < TARGET_WORD.length; i++) {
      if (guessWord[i] === TARGET_WORD[i]) {
        newMatchedLetters[i] = 'green';
      } else if (TARGET_WORD.includes(guessWord[i])) {
        newMatchedLetters[i] = 'yellow';
      }
      else{
        newMatchedLetters[i] = 'gray';
      }
    }

    return newMatchedLetters;
  };


  const resetGame = () => {
    /**
     *    Resets game
     */
    setGuess('');
    setAttempts(0);
    setGameOver(false);
    setUserPreviousGuesses([]);
    setBotPreviousGuesses([]);
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setTargetWord(wordList[randomIndex]);
  };


  // Displays UIs
  return (
    <div className="wordle-game-container">

      <div className="game-container">


        <div className="player-game">
          <h1>Player's Game</h1>

          {/* TEMP */}
          <button onClick={() => { setGuess('slate'); handlePlayerGuess(); }} disabled={gameOver}>
            slate
          </button>


          {userPreviousGuesses.length > 0 && (
            <div>
              {userPreviousGuesses.map((prevGuess, index) => (
                <div key={index}>
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
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            maxLength={5}
            value={guess}
            onChange={handleInputChange}
            disabled={gameOver}
          />

          <p>Attempts: {attempts}</p>
          <button onClick={handlePlayerGuess} disabled={gameOver}>
            Guess
          </button>

          <button onClick={resetGame} disabled={gameOver} id="Reset_Button">
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
              {botPreviousGuesses.map((prevGuess, index) => (
                <div key={index}>
                  <h1> 
                    {prevGuess.guess.toUpperCase().split('').map((letter, idx) => (
                      <span
                        key={idx}
                        className={`${prevGuess.feedback[idx]} ${gameOver ? 'reveal-text' : ''}`} // Add 'reveal-text' if the game is over
                        // className={prevGuess.feedback[idx]} // Apply the class based on feedback color
                      >
                        {letter}
                      </span>
                    ))}
                  </h1>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>


  );
};

export default WordleGame;