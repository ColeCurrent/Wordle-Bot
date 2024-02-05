import React, { useState, useEffect } from "react";
import "./thief.css";

const thief_wordle = () => {

    let guessedWords = [[]];
    let availableSpace = 1;

    let word = "dairy"
    let guessWordCount = 0;


    useEffect(() => {
        createSquares();
        attachKeyListeners();
    

        return () => removeKeyListeners();

    }, []);

    
    function getTileColor(letter, index) {
        const isCorrectLetter = word.includes(letter);

        if(!isCorrectLetter) {
            return "rbg(58, 58, 60)";
        }

        const letterInThatPosition = word.charAt(index);
        const isCorrectPosition = (letter === letterInThatPosition);

        if (isCorrectPosition) {
            return "rgb(83, 141, 78)";
        }

        return "rgb(181, 159, 59)"
};


    function handleSubmitWord(){
        const currentWordArr = getCurrentWordArr();
        if (currentWordArr.length !== 5) {
            window.alert("Not enough letters");
        }

        const currentWord = currentWordArr.join("")
        const firstLetterID = guessWordCount * 5 + 1;
        const interval = 300;

        currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
                const tileColor = getTileColor(letter, index);

                const letterID = firstLetterID + index;
                const letterEl = document.getElementById(letterID);
                letterEl.classList.add("animate__flipInX");
                letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
            }, interval * index);
        });

        guessWordCount += 1;

        if (currentWord === word) {
            window.alert("Congratuations!");
        }

        if (guessedWords.length === 6) {
            window.alert(`You lost :( The word is ${word}`);
        }

        guessedWords.push([])
    }


    function handleDeleteLetter() {
        const currentWordArr = getCurrentWordArr()
        const removedLetter = currentWordArr.pop()

        guessedWords[guessedWords.length - 1] = currentWordArr

        const lastLetterEl = document.getElementById(String(availableSpace))

        lastLetterEl.textContent = ''
        availableSpace = availableSpace - 1
    }


    function attachKeyListeners() {
        const keys = document.querySelectorAll('.keyboard-row button');
        for (let i = 0; i < keys.length; i++) {
            keys[i].onclick = (event) => {
                const letter = event.target.getAttribute("data-key");

                if (letter === 'enter') {
                    handleSubmitWord();
                    return;
                }

                if (letter === 'del'){
                    handleDeleteLetter();
                    return;
                }


                updateGuessedWords(letter)

                console.log(letter);
            };
        }
    }

    function removeKeyListeners() {
        const keys = document.querySelectorAll('.keyboard-row button');
        for (let i = 0; i < keys.length; i++) {
            keys[i].onclick = null; // Remove onclick listener
        }
    }

    function getCurrentWordArr() {
        const numberOfGuessedWords = guessedWords.length
        return guessedWords[numberOfGuessedWords - 1]
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArr()

        if (currentWordArr && currentWordArr.length < 5) {
            currentWordArr.push(letter)

            const availableSpaceEl = document.getElementById(String(availableSpace))
            availableSpace = availableSpace + 1

            availableSpaceEl.textContent = letter;
        }
    }



    function createSquares() {
        const gameBoard = document.getElementById("board");

        for (let index = 0; index < 15; index++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);

        }
    }




    return (
        <div id="game-container">

            <div id="board-container">
                <div id="board"></div>
            </div>

            <div id="keyboard-container">
                <div className="keyboard-row">
                    <button data-key="q">q</button>
                    <button data-key="w">w</button>
                    <button data-key="e">e</button>
                    <button data-key="r">r</button>
                    <button data-key="t">t</button>
                    <button data-key="y">y</button>
                    <button data-key="u">u</button>
                    <button data-key="i">i</button>
                    <button data-key="o">o</button>
                    <button data-key="p">p</button>
                </div>
                <div className="keyboard-row">
                    <div className="spacer-half"></div>
                    <button data-key="a">a</button>
                    <button data-key="s">s</button>
                    <button data-key="d">d</button>
                    <button data-key="f">f</button>
                    <button data-key="g">g</button>
                    <button data-key="h">h</button>
                    <button data-key="j">j</button>
                    <button data-key="k">k</button>
                    <button data-key="l">l</button>
                    <div className="spacer-half"></div>
                </div>
                <div className="keyboard-row">
                    <button data-key="enter" className="wide-button">Enter</button>
                    <button data-key="z">z</button>
                    <button data-key="x">x</button>
                    <button data-key="c">c</button>
                    <button data-key="v">v</button>
                    <button data-key="b">b</button>
                    <button data-key="n">n</button>
                    <button data-key="m">m</button>
                    <button data-key="del" className="wide-button">Del</button>
                </div>

            </div>


        </div>
    );
}

export default thief_wordle;