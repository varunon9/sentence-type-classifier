// dependency
var pos = require("pos");

function SentenceTypeClassifier() {
}

// Classifier classifies given sentence into following types
var SENTENCE_TYPE = {
	ASSERTIVE: "assertive",
	NEGATIVE: "negative",
	INTERROGATIVE: "interrogative",
	IMPERATIVE: "imperative",
	EXCLAMATORY: "exclamatory"
};

// list of negative words
var negativeWords = [
    "no", "not", "never", "neither", "nobody", "none", "nor",
    "nothing", "nowhere", "few", "hardly", "little", "rarely",
    "scarcely", "seldom", "hadn’t", "don’t", "doesn’t",
    "didn’t", "couldn’t", "can’t", "wouldn’t", "haven’t", "aren’t",
    "hasn’t", "won’t", "shouldn’t", "isn’t", "wasn’t", "weren’t"
];

/**
 * classify the given sentence into types e.g interrogative
 * @param {String} sentence
 * @return {String} type
 */
SentenceTypeClassifier.prototype.classify = function(sentence) {
	if (!sentence) {
		throw new Error("Require sentence to classify");
	}
	var taggedWords = posTag(sentence);
	var checkEndMark = true;

	/**
	 * First check for period or ? or ! marks.
	 * If it is present then no need for further processing except for !
	 */
	if (checkEndMark) {
		var endMark = taggedWords[taggedWords.length - 1][0];
		if (endMark == '.' || endMark == '?' || endMark == '!') {
			if (endMark == '?') {
				return SENTENCE_TYPE.INTERROGATIVE;
			} else if (endMark == '!') {

				/**
				 * Sentence ending with ! might be imperative
				 * e.g. Have fun at the fair!, Come to the fair with me!
				 */
				if (isImperative(taggedWords)) {
					return SENTENCE_TYPE.IMPERATIVE;
				} else {
					return SENTENCE_TYPE.EXCLAMATORY;
				}
			} else {
				if (isImperative(taggedWords)) {
					return SENTENCE_TYPE.IMPERATIVE;
				}

				/**
				 * sentence is declarative
				 * check for assertive or negative
				 */
				if (isNegative(taggedWords)) {
					return SENTENCE_TYPE.NEGATIVE;
				} else {
					return SENTENCE_TYPE.ASSERTIVE;
				}
			}
		}
	}

	/**
	 * No end mark punctuation detected. Need to classify based on grammar
	 * assuming default type to be assertive
	 */
	var type = SENTENCE_TYPE.ASSERTIVE;

	if (isInterrogative(taggedWords)) {
		type = SENTENCE_TYPE.INTERROGATIVE;
	} else if (isImperative(taggedWords)) {
		type = SENTENCE_TYPE.IMPERATIVE;
	} else if (isExclamatory(taggedWords)) {
		type = SENTENCE_TYPE.EXCLAMATORY;
	} else if (isNegative(taggedWords)) {
		type = SENTENCE_TYPE.NEGATIVE;
	}
	return type;
}

/**
 * tags parts of speech to given sentence
 * @param {String} sentence
 * @return {N * 2 array where N is no of words in sentence}
 */
function posTag(sentence) {
	var words = new pos.Lexer().lex(sentence);
	var tagger = new pos.Tagger();
	var taggedWords = tagger.tag(words);
	return taggedWords;
}

/**
 * utility function to check if sentence contains no/never/not/don't/doesn't/didn't
 * @param {N * 2 array, N: no of words in sentence} POS tagged words
 * @return true for negative otherwise false
 */
function isNegative(taggedWords) {
	for (var i in taggedWords) {
		var word = taggedWords[i][0].toLowerCase();
		for (var j in negativeWords) {
			if (word == negativeWords[j]) {
				return true;
			}
		}

		/**
		 * Sometimes tagger split apostrophe s ('s) e.g doesn't = doesn ' t
		 * when it is not curly
		 */
		if (word == "don" || word == "doesn" || word == "didn") {
			if (taggedWords[i + 1]) {
				var nextWord = taggedWords[i + 1][0];
				if (nextWord == "'") {
					return true;
				}
			}
		}
	}
	return false;
}

/**
 * utility function to check if sentence is imperative
 * @param {N * 2 array, N: no of words in sentence} POS tagged words
 * @return true if sentence is imperative, false otherwise
 */
function isImperative(taggedWords) {

	/**
	 * Special condition: check for first word if it is 'have'
	 * e.g. "Have(VBP) you ever been to a county fair?" is interrogative and not imperative
	 */
	var firstWord = getWord(taggedWords, 0);
	if (firstWord) {
		if (firstWord == "have") {

			// check for 2nd tag, must not be NN/PRP to be imperative
			var secondTag = getTag(taggedWords, 1);
			if (secondTag) {
				if (secondTag == "PRP" || secondTag == "NN") {
					return false;
				}
			}
		}
	}

	/**
	 * Regex rule:
	 * [VB/VBP + *] or [NN + "," + VB/VBP + *] or [RB + VB/VBP + *]
	 * or [NN + "," + RB + VB/VBP + *]
	 */
	var firstRegexRule = [
	    ["VB", "VBP"]
	];
	var secondRegexRule = [
	    ["NN"],
	    [","],
	    ["VB", "VBP"]
	];
	var thirdRegexRule = [
	    ["RB"],
	    ["VB", "VBP"]
	];
	var fourthRegexRule = [
	    ["NN"],
	    [","],
	    ["RB"],
	    ["VB", "VBP"]
	];
	var imperative = false;
	if (isMatchingRegex(firstRegexRule, taggedWords)) {
		imperative = true;
	} else if (isMatchingRegex(secondRegexRule, taggedWords)) {
		imperative = true;
	} else if (isMatchingRegex(thirdRegexRule, taggedWords)) {
		imperative = true;
	} else if (isMatchingRegex(fourthRegexRule, taggedWords)) {
		imperative = true;
	}
	return imperative;
}

/**
 * utility function to check if sentence is interrogative based on grammar rules
 * @param {N * 2 array, N: no of words in sentence} POS tagged words
 * @return true if interrogative otherwise false
 */
function isInterrogative(taggedWords) {

	/**
	 * Regex Rule:
	 * [MD/VBP/VBZ/VBD + PRP/NN/NNP/NNPS/NNS/VBG + *] or [WRB/WP + MD/VBP/VBZ/VBD + *]
	 * or [MD/VBP/VBZ/VBD + DT + PRP/NN/NNP/NNPS/NNS/VBG + *]
	 */
	var firstRegexRule = [
	    ["MD", "VBP", "VBZ", "VBD"],
	    ["PRP", "NN", "NNP", "NNS", "VBG"]
	];
	var secondRegexRule = [
	    ["WRB", "WP"],
	    ["MD", "VBP", "VBZ", "VBD"]
	];
	var thirdRegexRule = [
	    ["MD", "VBP", "VBZ", "VBD"],
	    ["DT"],
	    ["PRP", "NN", "NNP", "NNS", "VBG"]
	];
	var interrogative = false;
	if (isMatchingRegex(firstRegexRule, taggedWords)) {
		interrogative = true;
	} else if (isMatchingRegex(secondRegexRule, taggedWords)) {
		interrogative = true;
	} else if (isMatchingRegex(thirdRegexRule, taggedWords)) {
		interrogative = true;
	}
	return interrogative;
}

/**
 * utility function to check if sentence is exclamatory based on grammar rules
 * @param {N * 2 array, N: no of words in sentence} POS tagged words
 * @return true if exclamatory otherwise false
 */
function isExclamatory(taggedWords) {

	/**
	 * Regex Rule:
	 * [UH + *]
	 */
	var firstRegexRule = [
	    ["UH"]
	];
	var exclamatory = false;
	if (isMatchingRegex(firstRegexRule, taggedWords)) {
		exclamatory = true;
	}
	return exclamatory;
}

/**
 * utility function to return a tag at specified position (position starts with 0)
 * @param {N * 2 array where N is no of words in sentence, integer} POS tagged words, position
 * @return tag if it exists else undefined
 */
function getTag(taggedWords, position) {
	var tag = undefined;
    if (taggedWords[position]) {
    	tag = taggedWords[position][1];
    }
    return tag;
}

/**
 * utility function to return word at specified position (position starts with 0)
 * @param {N * 2 array where N is no of words in sentence, integer} POS tagged words, position
 * @return word if it exists else undefined
 */
function getWord(taggedWords, position) {
	var word = undefined;
    if (taggedWords[position]) {
    	word = taggedWords[position][0].toLowerCase();
    }
    return word;
}

/**
 * utility function to match regex (only consecutive starting tags and no wildcards)
 * @param {array of array as regex pattern} and {POS tagged words}
 * @return true if match pattern, false otherwise
 */
function isMatchingRegex(regexArray, taggedWords) {
	var match = true;
	for (var position in regexArray) {
		var innerArray = regexArray[position];
		var tag = getTag(taggedWords, position);

		// end of sentence, no need to further match regex pattern rule
		if (!tag) {
			break;
		}

		var innerMatch = false;
		for (var i in innerArray) {
			var expectedTag = innerArray[i];
			if (tag == expectedTag) {
				innerMatch = true;
				break;
			}
		}

		if (!innerMatch) {
			match = false;
			break;
		}
	}
	return match;
}

module.exports = SentenceTypeClassifier;

/**
 *  Tags:
    https://github.com/dariusk/pos-js

    CC Coord Conjuncn           and,but,or
	CD Cardinal number          one,two
	DT Determiner               the,some
	EX Existential there        there
	FW Foreign Word             mon dieu
	IN Preposition              of,in,by
	JJ Adjective                big
	JJR Adj., comparative       bigger
	JJS Adj., superlative       biggest
	LS List item marker         1,One
	MD Modal                    can,should
	NN Noun, sing. or mass      dog
	NNP Proper noun, sing.      Edinburgh
	NNPS Proper noun, plural    Smiths
	NNS Noun, plural            dogs
	POS Possessive ending       Õs
	PDT Predeterminer           all, both
	PP$ Possessive pronoun      my,oneÕs
	PRP Personal pronoun        I,you,she
	RB Adverb                   quickly
	RBR Adverb, comparative     faster
	RBS Adverb, superlative     fastest
	RP Article                  up,off
	SYM Symbol                  +,%,&
	TO ÒtoÓ                     to
	UH Interjection             oh, oops
	VB verb, base form          eat
	VBD verb, past tense        ate
	VBG verb, gerund            eating
	VBN verb, past part         eaten
	VBP Verb, present           eat
	VBZ Verb, present           eats
	WDT Wh-determiner           which,that
	WP Wh pronoun               who,what
	WP$ Possessive-Wh           whose
	WRB Wh-adverb               how,where
	, Comma                     ,
	. Sent-final punct          . ! ?
	: Mid-sent punct.           : ; Ñ
	$ Dollar sign               $
	# Pound sign                #
	" quote                     "
	( Left paren                (
	) Right paren               )
 */