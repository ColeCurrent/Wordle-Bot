import React, { useState, useEffect } from "react";
import "./App.css";


// Send info to Flask API
const sendRequest = async (endpoint, data) => {

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

  return response.json();
};



const WordleGame = () => {
  const [wordList, setWordList] = useState([]);
  const [TARGET_WORD, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [userPreviousGuesses, setUserPreviousGuesses] = useState([]);
  const [botPreviousGuesses, setBotPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [suggestedWord, setSuggestedWord] = useState("NA");
  
  const [data, setdata] = useState({
    name: "",
    age: 0,
    date: "",
    programming: "",
  });
  

  // Using useEffect for single rendering
  useEffect(() => {
      // Using fetch to fetch the api from 
      // flask server it will be redirected to proxy
      
      fetch("/api/data") 
          .then((res) => res.json()
          .then((data) => {
              console.log("Fetched data:", data);

              // Setting a data from api
              setdata({
                  name: data.Name,
                  age: data.Age,
                  date: data.Date,
                  programming: data.programming,
              });
          })
          .catch((error) => {
            console.error("Fetch error:", error);
        })
      );

      startWordle();
  }, []);

  
  
  // Sets random target word
  useEffect(() => {
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
  

  // User input
  const handleInputChange = (event) => {
    setGuess(event.target.value.trim().toLowerCase().substr(0, 5));
  };

  // Check User guess
  const handlePlayerGuess = () => {
    if (!wordList.includes(guess) || gameOver) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newMatchedLetters = checkMatchedLetters(guess);

    // Update previous guess with current guess + feedback
    setUserPreviousGuesses(prevGuesses => [...prevGuesses, { guess, feedback: newMatchedLetters }]);
    setGuess('');

    // Checks if user won
    if (newMatchedLetters.every(matched => matched === 'green') || newAttempts === 6) {
      setGameOver(true);
    } else {
      setTimeout(handleBotGuess, 1000);  // Does bot guess after 1 second delay
    }
  };


  // Makes Bot Guess
  const handleBotGuess = () => {
    if (gameOver) return;

    // Makes random guesss
    const botGuessIndex = Math.floor(Math.random() * wordList.length);
    const botGuessedWord = wordList[botGuessIndex];

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newBotMatchedLetters = checkMatchedLetters(botGuessedWord);

    // Update previous guess with current guess + feedback
    setBotPreviousGuesses(prevGuesses => [...prevGuesses, { guess: botGuessedWord, feedback: newBotMatchedLetters }]);

    // Checks if bot won
    if (newBotMatchedLetters.every(matched => matched === 'green') || newAttempts === 6) {
      setGameOver(true);
    }
  };


  // Returns array of guesses matching colors 
  const checkMatchedLetters = (guessWord) => {
    const newMatchedLetters = Array(5).fill(null);

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


  // Resets game
  const resetGame = () => {
    setGuess('');
    setAttempts(0);
    setGameOver(false);
    setUserPreviousGuesses([]);
    setBotPreviousGuesses([]);
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setTargetWord(wordList[randomIndex]);
  };


  //Linking With API


  const startWordle = async () => {
    try {
      // Send request to '/api/start/'
      const response = await sendRequest('/api/start', {});

      // const suggestedWord = response.suggestedWord;
      setSuggestedWord(response.suggestedWord);
      // Use suggestedWord in your React component

    } catch (error) {
      console.error('Error starting Wordle:', error);
    }
  };

  const processGuess = async (currentGuess) => {
    try {
      const response = await sendRequest('/api/guess', { currentGuess });
      const nextGuess = response.nextGuess;
      // Use nextGuess in your React component
    } catch (error) {
      console.error('Error processing guess:', error);
    }
  };



  // Displays UIs
  return (
    <div className="wordle-game-container">
      <h1 className="wordle-header">Competitive Wordle</h1>
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


      <div className="green">
        <header>
            <h1>React and flask</h1>
            <p>Suggested Word: {suggestedWord}</p>

            {/* Calling a data from setdata for showing */}
            <p>{data.name}</p>
            <p>{data.age}</p>
            <p>{data.date}</p>
            <p>{data.programming}</p>

        </header>
      </div>
    </div>



    
  );
};

export default WordleGame;