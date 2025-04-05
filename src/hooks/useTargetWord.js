import { useEffect } from 'react';

export const useTargetWord = (wordList, setWordList, setTargetWord) => {
    useEffect(() => {
        /**
         *  Sets random target word
         */

        fetch('/all_possible_five_letter_words.txt') 
        .then(response => response.text()) 
        .then(text => {
            // Split text into array of lowercase words
            const wordsArray = text.split('\n')
                .map(word => word.trim().toLowerCase())
                .filter(word => word.length === 5); 
            
            setWordList(wordsArray);
            if (wordsArray.length > 0) {
                setTargetWord(wordsArray[Math.floor(Math.random() * wordsArray.length)]);
            }
        })
        .catch(error => console.error("Error fetching word list:", error));
    }, []); 
};

