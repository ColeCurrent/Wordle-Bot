import random
from flask import Flask, request, jsonify
from flask_cors import CORS

 
# Initializing flask app
app = Flask(__name__)
CORS(app)


# Input all possible words from file  (extracted from wordle website)
def read_words_from_file():
    with open('public/five_letter_words.txt', 'r') as file:
        words_array = [line.strip() for line in file]

    return words_array

possible_words = read_words_from_file()


# Send info
@app.route('/api/start', methods=['POST', 'OPTIONS'])
def start_wordle():
    """
    Initializes games buy calculating mathematically best starter word

    :route /api/start: From startWordle() on front-end
    :returns: A JSON object containing calculated starter word
    """
    global possible_words
    possible_words = read_words_from_file()

    # Calculates mathematically best starter word
    suggested_word = bestWord(possible_words, letterFreq(possible_words))

    return jsonify({"suggestedWord": suggested_word})


# Recieve info 
@app.route('/api/guess', methods=['POST'])
def process_guess():
    """
    Calculates best guess given previous guess and color data

    :route /api/guess: From proccessBotGuess on front-end
    :returns: A JSON object containing next best guess
    """

    # Use global version of possible_words to prevent decleration 
    global possible_words

    # Process the guess sent from the React app and return the next guess
    current_guess = request.json.get('currentGuess')  
    letter_colors = request.json.get('letterColors')

    # Update the global variable with the filtered list
    possible_words = word_remover(letter_colors, current_guess)
    
    suggestion = bestWord(possible_words, letterFreq(possible_words))

    possible_words.remove(suggestion)

    return jsonify({"nextGuess": suggestion})

"""
API ABOVE 

WORDLE ALGORITHM BELOW
"""

def badLetters(result, guess):
    """
    Finds incorrect letters in word

    :param result: Color feedback in the form "bbybg"
    :param guess: Previous guess
    :return: List of all letters associated with "b"
    """
    bad_letters = []
    for i in range(0, 5):
        if result[i] == "b":
            bad_letters.append(guess[i])
    return bad_letters


def partialLetters(result, guess):
    """
    Finds correct letters that are misplaced in word

    :param result: Color feedback in the form "bbybg"
    :param guess: Previous guess
    :return: List of all letters associated with "y"
    """
    partial_letters = []
    for i in range(0, 5):
        if result[i] == "y":
            partial_letters.append([guess[i], i])
    return partial_letters


def correctLetters(result, guess):
    """
    Finds fully correct letters in word

    :param result: Color feedback in the form "bbybg"
    :param guess: Previous guess
    :return: List of all letters associated with "g"
    """
    correct_letters = []
    for i in range(0, 5):
        if result[i] == "g":
            correct_letters.append([guess[i], i])  
    return correct_letters


def word_remover(result, guess):
    """
    Returns a list of words that don't allign with result or guess
    
    :param result: letters in word or in correct position in format "bbybg"
    :param guess: Last guessed word that resulted in param result
    :return: array of filtered words that could be possibility of param result
    """

    # Use global version of possible_words to prevent decleration 
    global possible_words

    bad_letters = badLetters(result, guess)  # list
    partial_letters = partialLetters(result, guess)  # tuple (letter, position)
    correct_letters = correctLetters(result, guess)  # tuple (letter, position)

    # Make list of yellow and green letters
    good_letters = []
    for letter in correct_letters:
        good_letters.append(letter[0])
    for letter in partial_letters:
        good_letters.append(letter[0])

    # Update bad letters
    for letter in bad_letters:
        if letter in good_letters:
            bad_letters.remove(letter)


    no_bad_letters = []
    # Removes words that contain a letter marked "b" in result
    for word in possible_words:
        acceptable_word = True

        for bad_letter in bad_letters:
            if bad_letter in word:
                acceptable_word = False
                break
         
        if acceptable_word is True:
            no_bad_letters.append(word)

    
    contains_green = []
    # Ensures word has the correct letter in position that aligns with "g" from result
    for word in no_bad_letters:
        acceptable_word = True

        for tup in correct_letters:
            letter = tup[0]
            position = tup[1]

            # Check if the word has the correct letter and index as the "g" from result
            if word[position] != letter:
                acceptable_word = False
                break

        if acceptable_word is True: 
            contains_green.append(word)


    filtered_yellow = []
    # Ensures word does not contain a correct letter in position marked "y"
    for word in contains_green:
        acceptable_word = True

        for tup in partial_letters:
            letter = tup[0]
            position = tup[1]

            if word[position] == letter:
                acceptable_word = False
                break

        if acceptable_word is True:
            filtered_yellow.append(word)


    contains_yellow = []
    # Ensures word has letter marked "y" in it somewhere
    for word in filtered_yellow:
        acceptable_word = True

        for letter in good_letters:
            if letter not in word:
                acceptable_word = False
                break
        
        if acceptable_word is True:
            contains_yellow.append(word)
    
        
    
    correct_frequency = []
    for word in contains_yellow:
        acceptable_word = True

        for letter in bad_letters:
            if letter in good_letters:
                if word.count(letter) != good_letters.count(letter):
                    acceptable_word = False
                    break

        if acceptable_word is True:
            correct_frequency.append(word)
        

    return correct_frequency


def letterFreq(possible_words):
    """
    Finds frequencies of letters in each position

    :param possible_words: List of all possible words
    :return: Dictionary of each letter and its associated frequency in possible words
    """

    alphabet = "abcdefghijklmnopqrstuvwxyz"
    arr = {}
    for c in alphabet:
        freq = [0, 0, 0, 0, 0]
        for i in range(0, 5):
            for w in possible_words:
                if w[i] == c:
                    freq[i] += 1
        arr.update({c: freq})
    return arr


def wordScore(possible_words, frequencies):
    """
    Computes a score based off letter frequencies

    :param possible_words: List of all possible words
    :param frequencies: Dictionary of each letter and its associated frequency in possible words 
    :return: Score based of letter frequencies
    """
    words = {}
    max_freq = [0, 0, 0, 0, 0]

    for c in frequencies:
        for i in range(0, 5):
            if max_freq[i] < frequencies[c][i]:
                max_freq[i] = frequencies[c][i]

    for w in possible_words:
        score = 1
        for i in range(0, 5):
            c = w[i]
            score *= 1 + (frequencies[c][i] - max_freq[i]) ** 2
        words.update({w: score})

        score += random.uniform(0, 1)
        
    return words


def bestWord(possible_words, frequencies):
    """
    Finds the best word
    
    :param possible_words: List of all possible words
    :param frequencies: Dictionary of each letter and its associated frequency in possible words 
    :return: best calculated word
    """
    max_score = 1000000000000000000     # start with a ridiculous score
    best_word = "words"     # start with a random word
    scores = wordScore(possible_words, frequencies)
    for w in possible_words:
        if scores[w] < max_score:
            max_score = scores[w]
            best_word = w
    return best_word


# Running app
if __name__ == '__main__':
    app.run(debug=True)