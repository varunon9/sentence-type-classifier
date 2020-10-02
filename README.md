# Sentence-type-classifier
There are a variety of ways to classify sentences. 
Sentences can be classified by type as well as classified according to the sentence structure. 
Young students often start learning about the different types of sentences in the first or second grade. 
The terms start off simple and easy for young children to remember and only later do they learn the true classification of the types of sentences.
As they get older they begin to learn about classifying sentences in other ways such as according to the structure of the sentence.

Classify English sentences into assertive, negative, interrogative, imperative and exclamatory based on grammar.

## How to install

`$ npm install sentence-type-classifier`

## Usage:

```javascript
var SentenceTypeClassifier = require("sentence-type-classifier");

var classifier = new SentenceTypeClassifier();

var type = classifier.classify("I am a Javascript Developer.");
console.log(type);
```
