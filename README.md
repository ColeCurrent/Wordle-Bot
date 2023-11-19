# Wordle Solver Bot
<p align="center">
  <img width="400" src="https://github.com/ColeCurrent/Wordle-Bot/blob/main/wordleBot.png">
</p>

####Could you beat the Wordle bot? Compete against a bot specialized to complete the wordle as optimally as possible. Are you better than

## Get Playing!

## How It Works
* Part-1: Find a good starter word
  - Analyze a dataset of all possible 5-letter words used by Wordle
  - Record how many times each letter is used in the dataset
  - Pick the top 5 most used letters
  - Create a list of words containing all 5 of those words
  - Pick a random word from the filtered list  
(*wordle returns a list of complete match (green), and partial match(yellow)*)
* Part-2: Calculate the most optimal next guess
  - Create a filtered list of words containing green letters and yellow letters based off of the wordle game feedback
    - Remove all words that don't contain the complete match letters in the exact indeces
    - Remove all words that don't contain the partial matches at all
  - Calculate the most used letters in the new list (repetition of part 1) and find a word containing the top 5 letters
  - Repeat for every attempts and narrow down the possible word choices




## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


### Credits
[@SAADMAN-N](https://github.com/SAADMAN-N)  
[@ColeCurrent](https://github.com/ColeCurrent)  
[@amoitra1](https://github.com/amoitra1)  
[@SARRAF-5757](https://github.com/SARRAF-5757)  

