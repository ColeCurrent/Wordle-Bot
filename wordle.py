import random
from flask import Flask, request, jsonify, make_response
import datetime
from flask_cors import CORS
 
x = datetime.datetime.now()
 
# Initializing flask app
app = Flask(__name__)
CORS(app)

 
# Route for seeing a data  TEST
@app.route('/api/data')
def get_time():
    # Returning an api for showing in  reactjs
    return {
        'Name':"geek", 
        "Age":"22",
        "Date":x, 
        "programming":"python"
        }


# Input all possible words from file  (extracted from wordle website)
def read_words_from_file():
    with open('public/five_letter_words.txt', 'r') as file:
        words_array = [line.strip() for line in file]

    return words_array



# puts possible words text file into array
possible_words = read_words_from_file()

counter = 0

# Send info
@app.route('/api/start', methods=['POST', 'OPTIONS'])
def start_wordle():
    global possible_words
    possible_words = read_words_from_file()
    # print("POSSIBLE WORDS LEN: ", len(possible_words))

    # Process the initial request and return the suggested starting word
    # You can call your existing logic or functions here
    suggested_word = "irate" #in future use first word function bestWord(possible_words, letterFreq(possible_words))
    print("Returned suggested_word: ", suggested_word)
    return jsonify({"suggestedWord": suggested_word})


# Recieve info 
@app.route('/api/guess', methods=['POST'])
def process_guess():
    # Use global version of possible_words to prevent decleration 
    global possible_words

    print("POSSIBLE WORDS LEN: ", len(possible_words))


    # Process the guess sent from the React app and return the next guess
    # You can call your existing logic or functions here
    current_guess = request.json.get('currentGuess')   # sets guess as one word 5 letter string
    print("current_guess: ", current_guess)
    letter_colors = request.json.get('letterColors')

    # Update the global variable with the filtered list
    # print("possible words len: ", possible_words)
    print("letter colors: ", letter_colors)
    print("current guess: ", current_guess)
    possible_words = word_remover(letter_colors, current_guess)
    

    suggestion = bestWord(possible_words, letterFreq(possible_words))

    #print("The suggested word is:", suggestion)
    #print("Enter your next guess:")

    print("possible words: ", possible_words)
    print("suggestion: ", suggestion)
    possible_words.remove(suggestion)
    # print("possible words: ", possible_words)

    return jsonify({"nextGuess": suggestion})





"""
API ABOVE 

WORDLE ALGORITHM BELOW
"""




def badLetters(result, guess):
    """Finds incorrect letters in word"""
    bad_letters = []
    for i in range(0, 5):
        if result[i] == "b":
            bad_letters.append(guess[i])  # Maybe an error? guess[i], i <--  
            # Partial and correct both have guess[i], i
    return bad_letters


def partialLetters(result, guess):
    """Finds correct letters that are misplaced in word"""
    partial_letters = []
    for i in range(0, 5):
        if result[i] == "y":
            partial_letters.append([guess[i], i])
    return partial_letters


def correctLetters(result, guess):
    """Finds fully correct letters in word"""
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

    print("p words in function: ", possible_words)

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


    print("bad letters: ", bad_letters)
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
    
    print("no_bad_letters: ", no_bad_letters)

    
    contains_green = []
    print("correct letters: ", correct_letters)
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
    
    print("contains_green: ", contains_green)


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
    print("filtered_yellow: ", filtered_yellow)


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
    
    print("contains_yellow: ", contains_yellow)
        
    
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
    print("correct_frequency: ", correct_frequency)
        
    
    return correct_frequency



def letterFreq(possible_words):
    """Finds frequencies of letters in each position"""
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
    """Computes a score based off letter frequencies"""
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
    """Finds the best word"""
    max_score = 1000000000000000000     # start with a ridiculous score
    best_word = "words"     # start with a random word
    scores = wordScore(possible_words, frequencies)
    for w in possible_words:
        if scores[w] < max_score:
            max_score = scores[w]
            best_word = w
    return best_word


def testWordleSolver(guess):

    while result != "ggggg" and counter < 6:
        possible_words = word_remover(result, guess, possible_words)
        #print(possible_words)
        if len(possible_words) == 0:
            break
        suggestion = bestWord(possible_words, letterFreq(possible_words))
        print("The suggested word is:", suggestion)
        #print("Enter your next guess:")
        guess = suggestion
        possible_words.remove(guess)
        print("Enter your new result:")
        result = input()
        counter += 1
    if len(possible_words) == 0:
        print("Oh no! You made a mistake entering one of your results. Please try again.")
    elif counter == 6 and result != "ggggg":
        print("Number of guesses exceeded, sorry we failed!")
    else:
        print("Congratulations! We solved today's Wordle in", counter, "guesses.")



        
# Examples:
guess = "slate"    # a 5 letter word must be the input
result = "yywww"   # y - correct letter, wrong place; g - fully correct; w - wrong


#wordleSolver(possible_words)

# Running app
if __name__ == '__main__':
    app.run(debug=True)