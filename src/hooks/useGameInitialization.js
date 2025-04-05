import { useEffect, useRef } from 'react';

export const useGameInitialization = (createUserSquares, createBotSquares) => {
    const hasRunEffect = useRef(false);

    useEffect(() => {
        /**
         *    Create user board, bot board, and key listeners
         */
        if (!hasRunEffect) {
            createUserSquares();
            createBotSquares();
            hasRunEffect.current = true;
        }
    }, [createUserSquares, createBotSquares, hasRunEffect]);
}; 