
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

var calculateProbabilityOfWordGivenClass=function(word, class){
	var countWordWithClass;
	var countClass;
	var vocabolary;
	var result=(countWordWithClass+1)/(countClass+vocabolary);
}

var binarized=function(){
	// estrazione vocabolario dal training
	// il prior corrisponde al num di documenti appartenenti alla classe j diviso il num totale di documenti
}