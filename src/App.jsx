import React, { useState, useEffect } from "react";
import "./App.css";


// Send info to Flask API
const sendRequest = async (endpoint, data, callback = null) => {
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

// Returns a string representation of the feedback colors
const getFeedbackString = (feedback) => {
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
  
  const [data, setdata] = useState({
    name: "",
    age: 0,
    date: "",
    programming: "",
  });
  
  // I deleted this and it didnt change much in the actualy wordle so might not be important
  // Grab info from flask
  useEffect(() => {



      // Fetch from flask
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

      // startWordle();
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
      // setTimeout(handleBotGuess, 1000);  // Does bot guess after 1 second delay
    }
  };



  // Makes Bot Guess
  const handleBotGuess = async () => {
    if (gameOver) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    console.log("newAttempts: ", newAttempts)

    if (newAttempts === 1) {
      console.log("START WORDLE");
      
      const suggestedWord = await startWordle(); // Await the suggested word
      makeBotGuess(suggestedWord);

    } else {
      console.log("PROCESS GUESS")
      
      // console.log("botPreviousGuesses: ", botPreviousGuesses)

      processBotGuess(botPreviousGuesses, botColor, () => {});




      console.log("Suggested Word Processed: ", suggestedWord)
    }

  };

  const makeBotGuess = (botGuessedWord) => {
    // Check matched letters for the bot's guess
    const newBotMatchedLetters = checkMatchedLetters(botGuessedWord);
    
    console.log("makeBotGuess is running")


    // Log the current guess information
    console.log('Bot Guess:', {
      guess: botGuessedWord,
      feedback: newBotMatchedLetters
    });
  
    // Update previous guesses with the current guess and feedback
    setTimeout(setBotPreviousGuesses(prevGuesses => [...prevGuesses, { guess: botGuessedWord, feedback: newBotMatchedLetters }]), 2000);

    console.log("botPreviousGuesses is updated: ", botPreviousGuesses)

    // Check if the bot has won or if the game is over due to maximum attempts reached
    if (newBotMatchedLetters.every(matched => matched === 'green') || attempts >= 6) {
      setGameOver(true);
      // Additional logic if needed when the game is over
      console.log('Game Over. Bot guessed the word or max attempts reached.');
    } else {
      // Prepare for the next turn
      setBotColor(getFeedbackString(newBotMatchedLetters));
      // Any additional logic for setting up the next turn
    }
  };

  // Runs whenever suggestedWord changes
  useEffect(() => {
    if (suggestedWord) {
      makeBotGuess(suggestedWord);
    }
  }, [suggestedWord]); 

  // Grab bots starter guess from backend
  const startWordle = async () => {
    try {
      console.log("/api/start");
      const response = await fetch("http://localhost:5173/api/start", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return data.suggestedWord; // Return the suggested word from the response
    } catch (error) {
      console.error('Error starting Wordle:', error);
      return ""; // Return an empty string or handle the error appropriately
    }
  };
  

  // Grab bots calculated guess from backend
  const processBotGuess = async (currentGuess, letterColors) => {
    try {

      console.log("/api/guess")

      sendRequest('/api/guess', { currentGuess, letterColors }, (response) => {
        
        // Grabs return of optimal word from process_guess()
        setSuggestedWord(response.nextGuess);
        
      });
    } catch (error) {
      console.error('Error processing guess:', error);
    }
  };
  


  // Handle Enter key press
  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      handlePlayerGuess();
    }
  };

  // Handle Enter key press
  useEffect(() => {
    document.addEventListener('keydown', handleEnterKey);
    return () => {
      document.removeEventListener('keydown', handleEnterKey);
    };
  }, [handlePlayerGuess]);


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



  // Displays UIs
  return (
    <div className="wordle-game-container">
      <h1 className="wordle-header">Competitive Wordle</h1>

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
                <div key={index}> {/* Change this from <p> to <div> */}
                  <h1> {/* This is fine as it's directly inside a <div> */}
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

          <h2 className="player-game">ANSWER: {TARGET_WORD}</h2>

          {botPreviousGuesses.length > 0 && (
            <div>
              {botPreviousGuesses.map((prevGuess, index) => (
                <div key={index}> {/* Change this from <p> to <div> */}
                  <h1> {/* This is fine as it's directly inside a <div> */}
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
          {/* Attempts, Game over message for bot */}

        </div>


      </div>
      {/* Reset Game button */}

      <div className="gray"> COLOR PATTERN
        <p>{botColor}</p>
      </div>



      <p>BOT GUESS BELOW</p>
      {botPreviousGuesses.map((guessObj, index) => (
        <p key={index}>{guessObj.guess}</p>
      ))}


      {/* Tester */}
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