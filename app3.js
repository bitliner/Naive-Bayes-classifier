console.log('\nNEW EXECUTION: '+process.argv[2]);
var startTime=new Date().getTime()

var	db=require('./database.js')
,	async=require('async')
,	Review=db.get('Review')
,	TrainingDoc=db.get('TrainingDoc')
,	ProcessedDoc=db.get('ProcessedDoc')
,	_und = require("underscore")
,	importer=require('./importer')
,	TextManipulator=require('./TextManipulator')
,	NaiveBayesClassifier=require('./NaiveBayesClassifier')



var exit=function(){
	console.log('END!');
	process.kill(process.pid, 'SIGTERM')
}

var processDocs=function(trainingDocs){
	var processedDocs=[]
	trainingDocs.forEach(function(doc,i){
		var tokenSet=TextManipulator.tokenize(doc.text)
		featuresExtractedtokenSet = TextManipulator.handleNegations( tokenSet )
		var pd=new ProcessedDoc({
			text: tokenSet,
			polarity: doc.polarity,
		})
		processedDocs.push(pd)
	})
	return processedDocs
}






async.parallel([function(cb){
	var path='/home/bitliner/bitliner.dataset/review_polarity/txt_sentoken/pos/'
	importer.importFromFolder(path,function(data){
		return new Review({
			polarity: 'pos',
			text: data
		})
	},function(models){
		cb(null,models)
	})	
},function(cb){
	var path='/home/bitliner/bitliner.dataset/review_polarity/txt_sentoken/pos/'
	importer.importFromFolder(path,function(data){
		return new Review({
			polarity: 'neg',
			text: data
		})
	},function(models){
		cb(null,models)
	})
}],function(err,arr){
	console.log('END import of file',(new Date()).getTime()-startTime);
	var positiveReviews=arr[0]
	,	negativeReviews=arr[1]

	var positiveTrainingSet=_und.first(positiveReviews,900)
	,	negativeTrainingSet=_und.first(negativeReviews,900)
	,	trainingSet=_und.union(positiveTrainingSet,negativeTrainingSet)

	var processedDocs=processDocs(trainingSet)
	,	positivePrior=(positiveTrainingSet.length/trainingSet.length)
	,	negativePrior=(negativeTrainingSet.length/trainingSet.length)

	/* remove duplicates in every document */
	processedDocs.forEach(function(tdoc,i){
		tdoc.text=TextManipulator.removeDuplicates(tdoc.text)
	})

	async.parallel([
		function(cb){
			cb(null,NaiveBayesClassifier.calculateCorpusOfClass(processedDocs,'pos') )
		},function(cb){
			cb(null, NaiveBayesClassifier.calculateCorpusOfClass(processedDocs,'neg')  )
		},function(cb){
			console.log('in create vocabulary',(new Date()).getTime() - startTime);
			cb(null, NaiveBayesClassifier.extractVocabulary(processedDocs) )			
		}],function(err,arr){
			console.log(err,'END calculate of TEXTj and vocabulary',(new Date()).getTime() - startTime)

			var TEXTpos=arr[0]
			,	TEXTneg=arr[1]
			,	vocabulary=arr[2]

			var p=NaiveBayesClassifier.calculateProbabilityOfWordGivenClass(vocabulary, TEXTpos, TEXTneg)
		})
	exit()

})


/* TODO: insert method learning and classify for NaiveBayesClassifier */
/* TODO: change name of NaiveBayesClassifier in BinarizedMultinomialNaiveBayesClassifier  */
/* TODO: put remove duplicates processing in processDocs method */