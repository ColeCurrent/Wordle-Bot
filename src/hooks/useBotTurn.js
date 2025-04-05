import { useEffect } from 'react';

export const useBotTurn = (isBotTurn, setIsBotTurn, handleBotGuess) => {
    useEffect(() => {
        /**
         * Runs handleBotGuess() once the user makes their guess
         *
         * Used to align attempt states due to setTimeout() 
         */
        if (isBotTurn) {
            handleBotGuess();
            // setAttempts(prevAttempt => prevAttempt + 1);
            setIsBotTurn(false);  // Reset after the bot makes its guess
        }
    }, [isBotTurn, setIsBotTurn, handleBotGuess]);  // Trigger only when it's the bot's turn
};