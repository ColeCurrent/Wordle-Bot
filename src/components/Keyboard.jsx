import React, { useEffect } from 'react';

const Keyboard = ({ onKeyPress }) => {
  useEffect(() => {
    // Handle on-screen keyboard clicks
    const keys = document.querySelectorAll('.keyboard-row button');
    const keyClickHandler = (event) => {
      onKeyPress(event.target.getAttribute("data-key"));
    };

    keys.forEach(key => {
      key.addEventListener('click', keyClickHandler);
    });

    // Handle physical keyboard presses
    const keydownHandler = (event) => {
      let key = event.key.toLowerCase();
      
      // Handle special keys
      if (key === 'enter') {
        onKeyPress('enter');
      } else if (key === 'backspace' || key === 'delete') {
        onKeyPress('del');
      } else if (key.length === 1 && key.match(/[a-z]/i)) {
        // Only handle single alphabetic characters
        onKeyPress(key);
      }
    };

    document.addEventListener('keydown', keydownHandler);

    // Cleanup function
    return () => {
      keys.forEach(key => {
        key.removeEventListener('click', keyClickHandler);
      });
      document.removeEventListener('keydown', keydownHandler);
    };
  }, [onKeyPress]);

  return (
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
  );
};

export default Keyboard; 