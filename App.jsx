import React, { useState } from "react";
import WordleGame from "./WordleGame";
import "./App.css";

const App = () => {
  const [mode, setMode] = useState(null);

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <div className="app">
      <h1>Wordle</h1>
      {!mode && (
        <div className="mode-selection">
          <button onClick={() => handleModeSelection("single-player")}>
            Single Player
          </button>
          <button onClick={() => handleModeSelection("multi-player")}>
            Multiplayer
          </button>
        </div>
      )}
      {mode === "single-player" && (
        <div className="game-container">
          <WordleGame />
          <WordleGame botMode />
        </div>
      )}
      {mode === "multi-player" && (
        <div className="game-container">
          <WordleGame />
          <WordleGame />
        </div>
      )}
    </div>
  );
};

export default App;
