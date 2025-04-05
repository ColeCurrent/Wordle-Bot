import { useEffect } from 'react';

export const useRandomTargetWord = (wordList, setTargetWord, setAvailability) => {
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        setTargetWord(wordList[randomIndex]);
        setAvailability(true); 
   
    }, [wordList, setTargetWord, setAvailability]);  // This effect runs only when wordList is updated
}; 