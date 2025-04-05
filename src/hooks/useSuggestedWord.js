import { useEffect, useRef } from 'react';

export const useSuggestedWord = (suggestedWord, makeBotGuess, animateBotGuess) => {
    const prevSuggestedWord = useRef(suggestedWord);

    useEffect(() => {
        /** 
         *  Runs function everytime 'suggestWord' is updated, makes bot guess and animates bots word
         */
        if (suggestedWord && suggestedWord !== prevSuggestedWord.current) {
            makeBotGuess(suggestedWord);
            animateBotGuess(suggestedWord);
            prevSuggestedWord.current = suggestedWord;
        }
    }, [suggestedWord, makeBotGuess, animateBotGuess]);
}; 