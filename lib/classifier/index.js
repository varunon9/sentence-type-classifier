function SentenceTypeClassifier() {
}

SentenceTypeClassifier.prototype.classify = function(sentence) {
	if (!sentence) {
		throw new Error("Require sentence to classify");
	}
	var type = "assertive";
	return type;
}

module.exports = function() {
	return new SentenceTypeClassifier();
}