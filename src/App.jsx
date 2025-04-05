import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Keyboard from './components/Keyboard';
import { startWordle, processBotGuess } from './services/wordleApi';
import { getFeedbackString } from './utils/gameUtils';

// Hooks
import { useBotTurn } from './hooks/useBotTurn';
import { useTargetWord } from './hooks/useTargetWord';
import { useSuggestedWord } from './hooks/useSuggestedWord';
import { useRandomTargetWord } from './hooks/useRandomTargetWord';
import { useGameInitialization } from './hooks/useGameInitialization';


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
  const [isBotTurn, setIsBotTurn] = useState(false); 
  const [isBotGuessing, setIsBotGuessing] = useState(false);
  const [isAvailable, setAvailability] = useState(false);
  const [message, setMessage] = useState("");
  const [guessedWords, setGuessedWords] = useState([[]]);
  const [availableSpace, setAvailableSpace] = useState(1);
  const [guessWordCount, setGuessWordCount] = useState(0);
  let hasRunEffect = false;
  

  function handleKeyInput(key) {
      // Prevent any input if game is over
      if (gameOver || isBotGuessing) {
          return;
      }

      if (key === 'enter') {
          handleUserWord();
      } else if (key === 'del') {
          handleDeleteLetter();
      } else {
          updateGuessedWords(key);
      }
  }


  function getTileColor(letter, index) {
    /**
     * Returns the color of a given tile 
     * 
     * @param char letter: letter contained in given tile
     * @param int index: index of letter in word 
     * @return array [(string of rgb value of given index), (letter char in form "g", "y", "b")]
    */  

    const isCorrectLetter = TARGET_WORD.includes(letter);

    if(!isCorrectLetter) {
        return ["rgb(58, 58, 60)", "b"];
    }

    const letterInThatPosition = TARGET_WORD.charAt(index);
    const isCorrectPosition = (letter === letterInThatPosition);

    if (isCorrectPosition) {
        return ["rgb(83, 141, 78)", "g"];
    }

    return ["rgb(181, 159, 59)", "y"];
  };


   const handleUserWord = () => {
      /**
       *  When user hits enter, grabs current word, animates row, push current word to guessedWords
       */

      const currentWordArr = getCurrentWordArr();
      const currentWord = currentWordArr.join("");
      
      if (currentWordArr.length !== 5) {
          setMessage("Not enough letters");
          setTimeout(() => {
            setMessage("");
          }, 3000);
          return;
      }

      // Check if the word is valid
      if (!wordList.includes(currentWord.toLowerCase())) {
          setMessage("Not in word list");
          setTimeout(() => {
            setMessage("");
          }, 3000);
          return;
      }

      setGuess(currentWord);

      // Apply colors
      const newMatchedLetters = checkMatchedLetters(currentWord);

      // Update previous guess with current guess + feedback
      setUserPreviousGuesses(prevGuesses => [...prevGuesses, { guess: currentWord, feedback: newMatchedLetters }]);

      const firstLetterID = guessWordCount * 5 + 1;
      const interval = 400;
    
      let currentColors = []

      // Loop through each letter in user word array
      currentWordArr.forEach((letter, index) => {
          setTimeout(() => {
              const tileArr = getTileColor(letter, index);
              const tileColorRGB = tileArr[0];  // in form "rgb(83, 141, 78)"
              const tileColorChar = tileArr[1]; // in form "g"

              currentColors.push(tileColorChar);

              const letterID = firstLetterID + index;
              const letterEl = document.getElementById(letterID);
              if (letterEl) {
                  letterEl.classList.add("animate__flipInX");
                  letterEl.style = `background-color:${tileColorRGB};border-color:${tileColorRGB}`;
              }
          }, interval * index);
      });

      setGuessWordCount(prevCount => prevCount + 1);

      if (currentWord === TARGET_WORD) {
          setMessage("Congratulations!");
          setGameOver(true);
      }

      if (guessedWords.length === 6) {
          setMessage(`Game Over! The word was ${TARGET_WORD}`);
          setGameOver(true);
      }

      setGuessedWords([...guessedWords, []]);
        
      // Wait for all the setTimeouts to complete before joining arrays
      setTimeout(() => {
          setIsBotTurn(true);  // Set bot's turn after the user makes a guess
      }, interval * currentWordArr.length);
  };


  function handleDeleteLetter() {
      // Prevent deleting letters if game is over
      if (gameOver) {
          return;
      }

      const currentWordArr = getCurrentWordArr();
      
      // Only allow deletion if we're on the current line and there are letters to delete
      if (currentWordArr && currentWordArr.length > 0 && availableSpace > guessWordCount * 5 + 1) {
          currentWordArr.pop();

          const newGuessedWords = [...guessedWords];
          newGuessedWords[newGuessedWords.length - 1] = currentWordArr;
          setGuessedWords(newGuessedWords);

          const lastLetterEl = document.getElementById(String(availableSpace - 1));
          if (lastLetterEl) {
              lastLetterEl.textContent = '';
              setAvailableSpace(availableSpace - 1);
          }
      }
  }


  function getCurrentWordArr() {
      const numberOfGuessedWords = guessedWords.length
      return guessedWords[numberOfGuessedWords - 1]
  }


  function updateGuessedWords(letter) {
      // Prevent adding letters if game is over
      if (gameOver) {
          return;
      }

      const currentWordArr = getCurrentWordArr();

      // Only allow adding letters if we're on the current line and haven't filled all 5 spaces
      if (currentWordArr && 
          currentWordArr.length < 5 && 
          availableSpace <= (guessWordCount + 1) * 5) {
          
          const newGuessedWords = [...guessedWords];
          currentWordArr.push(letter);
          newGuessedWords[newGuessedWords.length - 1] = currentWordArr;
          setGuessedWords(newGuessedWords);

          const availableSpaceEl = document.getElementById(String(availableSpace));
          if (availableSpaceEl) {
              availableSpaceEl.textContent = letter;
              setAvailableSpace(availableSpace + 1);
          }
      }
  }


  function createUserSquares() {
      const gameBoard = document.getElementById("board");
      for (let index = 0; index < 30; index++) {
          let square = document.createElement("div");
          square.classList.add("square");
          square.classList.add("animate__animated");
          // let idStr = (index + 1).toString() + "_userID";
          square.setAttribute("id", index + 1);
          gameBoard.appendChild(square);

      }
  }


  function createBotSquares() {
    const gameBoard = document.getElementById("bot-board");

    for (let index = 0; index < 30; index++) {
        let square = document.createElement("div");
        square.classList.add("square");
        square.classList.add("animate__animated");
        let idStr = (index + 1).toString() + "_botID";
        square.setAttribute("id", idStr);
        gameBoard.appendChild(square);

    }
  }

 
  const handleBotGuess = async () => {
    /**
     *    Directs API calls to makeBotGuess() regarding the bots guesses   
     * 
     *    Calls startWordle() first iteration - processBotGuess() after
     *       - Calls makeBotGuess
     */
    if (gameOver) return;
        
    setIsBotGuessing(true);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    

    // First iteration
    if (newAttempts === 1) {
        const suggestedWord = await startWordle(); // Await the suggested word
    
        // Animate first guess manually
        const firstLetterID = ((newAttempts - 1) * 5) + 1;  // Calculate based on attempts
        const interval = 300;
        let currentColors = [];
    
        const currentWordArr = suggestedWord.split('');
        currentWordArr.forEach((letter, index) => {
          setTimeout(() => {
            const tileArr = getTileColor(letter, index);
            const tileColorRGB = tileArr[0];  // in form "rgb(83, 141, 78)"
            const tileColorChar = tileArr[1]; // in form "g"

          currentColors.push(tileColorChar);

          const letterID = (firstLetterID + index).toString() + "_botID";
          const letterEl = document.getElementById(letterID);
          letterEl.classList.add("animate__flipInX");
          letterEl.style = `background-color:${tileColorRGB};border-color:${tileColorRGB}`;
        }, interval * index);
      });

      // makeBotGuess(suggestedWord);
      setTimeout(() => {
        makeBotGuess(suggestedWord);
        setIsBotGuessing(false);
      }, interval * currentWordArr.length);

    } else {
        const lastGuess = botPreviousGuesses[botPreviousGuesses.length - 1].guess;
        const response = await processBotGuess(lastGuess, botColor);
        if (response && response.nextGuess) {
            setSuggestedWord(response.nextGuess);
        }
        setIsBotGuessing(false);
    }

  };


  const animateBotGuess = (suggestedWord) => {
    if(gameOver){ return } 
    
    const firstLetterID = ((attempts - 1) * 5) + 1;  // Calculate based on attempts
    const interval = 300;
    let currentColors = [];
    
    const currentWordArr = suggestedWord.split('');
    currentWordArr.forEach((letter, index) => {
        setTimeout(() => {
            const tileArr = getTileColor(letter, index);
            const tileColorRGB = tileArr[0];  // in form "rgb(83, 141, 78)"
            const tileColorChar = tileArr[1]; // in form "g"

            currentColors.push(tileColorChar);

            const letterID = (firstLetterID + index).toString() + "_botID";
            const letterEl = document.getElementById(letterID);
            letterEl.classList.add("animate__flipInX");
            letterEl.style = `background-color:${tileColorRGB};border-color:${tileColorRGB}`;
        }, interval * index);
    });
  };


  const makeBotGuess = (botGuessedWord) => {
    /**
     *    Update bots previous guesses
     *    Check bot win status
     */

    const newBotMatchedLetters = checkMatchedLetters(botGuessedWord);
  
    // Update previous guesses immediately instead of using setTimeout
    setBotPreviousGuesses(prevGuesses => [...prevGuesses, { guess: botGuessedWord, feedback: newBotMatchedLetters }]);

    const interval = 300; // Same interval as used in animations
    const animationDelay = interval * 5; // Total animation time for 5 letters

    // Check if the bot has won or if the game is over due to maximum attempts reached
    if (newBotMatchedLetters.every(matched => matched === 'green')) {
      setTimeout(() => {
        setGameOver(true);
        setMessage(`Bot won! The word was ${botGuessedWord.toUpperCase()}`);
        revealAllBotGuesses(botGuessedWord);
      }, animationDelay);
    } else if (attempts >= 6) {
      setTimeout(() => {
        setGameOver(true);
        setMessage(`Game Over! Neither player found the word: ${TARGET_WORD.toUpperCase()}`);
        revealAllBotGuesses(botGuessedWord);
      }, animationDelay);
    } else {
      // Prepare for the next turn
      setBotColor(getFeedbackString(newBotMatchedLetters));
    }
  };


  const revealAllBotGuesses = (finalGuess = null) => {
    // Get all bot's previous guesses and animate them
    const allGuesses = finalGuess 
      ? [...botPreviousGuesses, { guess: finalGuess, feedback: checkMatchedLetters(finalGuess) }]
      : botPreviousGuesses;

    allGuesses.forEach((guess, guessIndex) => {
      const word = guess.guess;
      const firstLetterID = guessIndex * 5 + 1;
      
      // Animate each letter in the word
      word.split('').forEach((letter, letterIndex) => {
        const tileArr = getTileColor(letter, letterIndex);
        const tileColorRGB = tileArr[0];
        
        const letterID = (firstLetterID + letterIndex).toString() + "_botID";
        const letterEl = document.getElementById(letterID);
        if (letterEl) {
          letterEl.textContent = letter.toUpperCase();
          letterEl.style = `background-color:${tileColorRGB};border-color:${tileColorRGB}`;
        }
      });
    });
  };


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

  // Hooks
  useBotTurn(isBotTurn, setIsBotTurn, handleBotGuess);
  useTargetWord(wordList, setWordList, setTargetWord);
  useSuggestedWord(suggestedWord, makeBotGuess, animateBotGuess);
  useRandomTargetWord(wordList, setTargetWord, setAvailability);
  // useGameInitialization(createUserSquares, createBotSquares);

  useEffect(() => {
    /**
     *    Create user board, bot board, and key listeners
     */
    if (!hasRunEffect) {
        createUserSquares();
        createBotSquares();
        hasRunEffect = true;
    }
  }, []);


  // Displays UI
  return (
    <div className="App">
      <div className="game-container">
        <div className="message-container">
          <h3>{message}</h3>
        </div>
        <div className="boards-container">
          <div className="tile-container">
            <div id="board"></div>
          </div>
          <div className="tile-container">
            <div id="bot-board"></div>
          </div>
        </div>
        <Keyboard onKeyPress={handleKeyInput} />
      </div>
    </div>
  );
};

export default WordleGame;