export const getFeedbackString = (feedback) => {
    /**
     *    Returns a string representation of the feedback colors
     *    worldle.py sends format "green", App.jsx expects format "g"
     */
    return feedback.map(color => {
      switch (color) {
        case 'green':
          return 'g';
        case 'yellow':
          return 'y';
        case 'gray':
          return 'b'; // Assuming 'b' represents gray in your string
        default:
          return '_'; // Handle other cases as needed
      }
    }).join('');
  };