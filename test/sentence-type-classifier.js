var expect = require("chai").expect;

var SentenceTypeClassifier = require("../index.js");
var classifier = new SentenceTypeClassifier();

var examples = require("../sentence-type-example.json");

describe("Sentence type classifier", function() {
    it("classify the sentence into suitable type", function() {
        for (i in examples) {
        	var sentence = examples[i].sentence;
        	var type = examples[i].type.toLowerCase();
        	var classifiedType = classifier.classify(sentence);
        	expect(classifiedType).to.equal(type);
        }
    });
});