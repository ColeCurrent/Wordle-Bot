const sendRequest = async (endpoint, data, callback = null) => {
    /**
     *    Send info to Flask API
     */
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

export const startWordle = async () => {
    /**
     *    Grab bots starter guess from backend
     */

    try {
      // Makes POST call to backend
      const response = await fetch("http://localhost:5173/api/start", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Set data to Flask output
      const data = await response.json();
            
      return data.suggestedWord;

    } catch (error) {
      console.error('Error starting Wordle:', error);
      return ""; // Return an empty string or handle the error appropriately
    }
  };

export const processBotGuess = async (currentGuess, letterColors) => {
  /**
   *    Grab bots calculated guess from backend using callback
   */
  try {
    const response = await sendRequest('/api/guess', { currentGuess, letterColors });
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  } catch (error) {
    console.error('Error processing guess:', error);
    throw error;
  }
}; 