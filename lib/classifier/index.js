// dependency
var natural = require("natural");

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
	//console.log(taggedWords);
	var type = SENTENCE_TYPE.ASSERTIVE;
	return type;
}

/**
 * tokenize the given sentence
 * @param {String} sentence
 * @return {array of tokens (words)}
 */
function tokenize(sentence) {
	var tokenizer = new natural.WordTokenizer();
	return tokenizer.tokenize(sentence);
}

/**
 * tags parts of speech to given sentence
 * @param {String} sentence
 * @return {N * 2 array where N is no of words in sentence}
 */
function posTag(sentence) {
	var path = require("path");

	var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
	var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
	var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
	var defaultCategory = 'NN';

	var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
	var rules = new natural.RuleSet(rulesFilename);
	var tagger = new natural.BrillPOSTagger(lexicon, rules);

	sentence = tokenize(sentence);
	//console.log(JSON.stringify(tagger.tag(sentence)));
	return tagger.tag(sentence);
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
	RP Particle                 up,off
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

 /**
  * Types of sentence with examples:-
  * https://www.englishgrammar.org/kinds-sentences-3/
  * http://englishsentences.com/types-of-sentences/
  * 
  * 1. Please leave your footwear outside. (Imperative sentence)
  * 2. Will you wait here? (Interrogative sentence)
  * 3. Where have you been all this while? (Interrogative sentence)
  * 4. We will not tolerate this. (Declarative sentence)
  * 5. I am your friend. (Declarative sentence)
  * 6. My sister lives in Mexico. (Declarative sentence)
  * 7. What did you do then? (Interrogative sentence)
  * 8. Do be a bit more careful. (Imperative sentence)
  * 9. Never speak to me like that again. (Imperative sentence)
  * 10. Always remember what I told you. (Imperative sentence)
  * 11. The ball rolled slowly into the goal. (Declarative sentence)
  * 12. The dog went to the county fair. (Declarative sentence)
  * 13. She saw the dog eat popcorn. (Declarative sentence)
  * 14. Dogs don’t usually eat popcorn. (Declarative sentence)
  * 15. The popcorn was hot. (Declarative sentence)
  * 16. I like popcorn. (Declarative sentence)
  * 17. Why is the dog going to the county fair? (Interrogative sentence)
  * 18. Have you ever been to a county fair? (Interrogative sentence)
  * 19. What is your favorite snack? (Interrogative sentence)
  * 20. How do you make popcorn? (Interrogative sentence)
  * 21. Who cooks fresh popcorn around here? (Interrogative sentence)
  * 22. Where can I buy fresh popcorn? (Interrogative sentence)
  * 23. What is the best flavor of popcorn? (Interrogative sentence)
  * 24. When do you usually eat popcorn? (Interrogative sentence)
  * 25. Why do you let your dog eat popcorn? (Interrogative sentence)
  * 26. How is it? (Interrogative sentence)
  * 27. Is the popcorn delicious? (Interrogative sentence)
  * 28. Have fun at the fair! (Imperative sentence)
  * 29. Come to the fair with me! (Imperative sentence)
  * 30. Feed the dog once per day. (Imperative sentence)
  * 31. Please don’t give the dog popcorn. (Imperative sentence)
  * 32. Stop feeding the dog! (Imperative sentence)
  * 33. I can’t believe how fast the dog ran to the county fair! (Exclamatory Sentence)
  * 34. Wow, he must really love popcorn! (Exclamatory Sentence)
  * 35. That popcorn isn’t for dogs! (Exclamatory Sentence)
  */

  /**
   * Regex Rule 
   * 1. Declarative: Subject + Verb
   * 2. Interrogative: Adverb/Auxiliary Verb + Subject or Wh + Auxiliary Verb + Subject
   * 3. Ends with exclamation
   * 4. Verb + Subject or Noun + Verb + Subject
   */