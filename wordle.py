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


# Send info
@app.route('/api/start', methods=['POST', 'OPTIONS'])
def start_wordle():
    global possible_words
    possible_words = read_words_from_file()

    # Process the initial request and return the suggested starting word
    # You can call your existing logic or functions here
    suggested_word = "irate" #in future use first word function bestWord(possible_words, letterFreq(possible_words))
    return jsonify({"suggestedWord": suggested_word})


# Recieve info 
@app.route('/api/guess', methods=['POST'])
def process_guess():
    # Use global version of possible_words to prevent decleration 
    global possible_words


    # Process the guess sent from the React app and return the next guess
    # You can call your existing logic or functions here
    current_guess = request.json.get('currentGuess')[0]['guess']   # sets guess as one word 5 letter string
    print("current_guess: ", current_guess)
    letter_colors = request.json.get('letterColors')
    print("letter_colors: ",letter_colors)



    # Update the global variable with the filtered list
    # print("possible words len: ", possible_words)
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
        if (i < len(guess)) and (isinstance(result[i], str)) and (result[i] == "b"):
            bad_letters.append(guess[i])
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
    global possible_words

    print("possible_words before: ", len(possible_words))

    """Returns the list of words with incorrect possibilities removed"""
    bad_letters = badLetters(result, guess)
    correct_letters = correctLetters(result, guess)
    # print("correct_letters: ", correct_letters)
    partial_letters = partialLetters(result, guess)
    # print("partial_letters: ", partial_letters)
    good_letters = []
    for g in correct_letters:
        good_letters.append(g[0])
    for p in partial_letters:
        good_letters.append(p[0])
    
    acceptable_words1 = []
    for w in possible_words:
        check = 0
        for b in bad_letters:
            # if isinstance(b, str) and b in w:
            if b in w:
                if b in good_letters:
                    pass
                else:
                    check = 1
                    break
        if check == 0:
            acceptable_words1.append(w)

    acceptable_words2 = []
    for w in acceptable_words1:
        check = 0
        for g in correct_letters:
            if w[g[1]] != g[0]:
                check = 1
                break
        if check == 0:
            acceptable_words2.append(w)
    #print(acceptable_words2)
    
    acceptable_words3 = []
    for w in acceptable_words2:
        check = 0
        for p in partial_letters:
            if w[p[1]] == p[0]:
                check = 1
                break
        if check == 0:
            acceptable_words3.append(w)
    #print(acceptable_words3)
    
    acceptable_words4 = []
    for w in acceptable_words3:
        check = 0
        for g in good_letters:
            # if isinstance(g, str) and g not in w:
            if g not in w:    
                check = 1
                break
        if check == 0:
            acceptable_words4.append(w)
    # print("acceptable words4: ", len(acceptable_words4))
            

    acceptable_words5 = []
    for w in acceptable_words4:
        check = 0
        for b in bad_letters:
            if b in good_letters:
                # if isinstance(b, str) and w.count(b) != good_letters.count(b):
                if w.count(b) != good_letters.count(b):    
                    check = 1
                    break
        if check == 0:
            acceptable_words5.append(w)


    print("acceptable words 5 length: ", len(acceptable_words5))

    # Update the global variable with the filtered list

    possible_words = acceptable_words5
    print("possible_words after length: ", len(possible_words))

    return acceptable_words5


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