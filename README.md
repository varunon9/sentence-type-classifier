# Sentence-type-classifier
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