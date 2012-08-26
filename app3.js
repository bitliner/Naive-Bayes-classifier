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

var calculateProbabilityOfWordGivenClass=function(vocabulary, TEXTpos, TEXTneg){
	var nPOS=TEXTpos.length 
	,	nNEG=TEXTneg.length
	vocabulary.forEach(function(w){
		async.parallel([function(cb){
			cb(null, TextManipulator.calculateOccurences(w,TEXTpos))
		},function(cb){
			// console.log('calculating occurences in TEXTneg');
			cb(null, TextManipulator.calculateOccurences(w,TEXTneg))
		}],function(err,arr){
			// console.log('calculate probability');
			/* viene calcolata la probabilità Wk/Ck : Nk+alfa / n+alfa|V| */
			var alfa=1
			,	p_W_POS=(arr[0]+alfa)/(nPOS+ (alfa*vocabulary.length) )
			,	p_W_NEG=(arr[1]+alfa)/(nNEG+ (alfa*vocabulary.length) )
			console.log(w,p_W_POS,p_W_NEG);
		})
	})
}

var extractVocabulary=function(tdocs){
	var v = tdocs.reduce(function(memo,doc){
		doc.text.forEach(function(token){
			if (memo.indexOf(token)==-1 ){
				memo.push(token)
			}
		})
		return memo
	},[])
	return v
}

// calculate corpus text of class (docs, filter, corpus-text attributes)
var calculateTEXT=function(tdocs,polarity){
	//console.log('creating TEXT',polarity);
	var TEXT=tdocs.filter(function(tdoc){
		return tdoc.polarity==polarity
	}).reduce(function(memo,doc){
		memo.splice(-1,0,doc.text)
		return memo
	},[])
	return _und.flatten(TEXT)
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
			cb(null,calculateTEXT(processedDocs,'pos') )
		},function(cb){
			cb(null, calculateTEXT(processedDocs,'neg')  )
		},function(cb){
			console.log('in create vocabulary',(new Date()).getTime() - startTime);
			cb(null, extractVocabulary(processedDocs) )			
		}],function(err,arr){
			console.log(err,'END calculate of TEXTj and vocabulary',(new Date()).getTime() - startTime)

			var TEXTpos=arr[0]
			,	TEXTneg=arr[1]
			,	vocabulary=arr[2]

			var p=calculateProbabilityOfWordGivenClass(vocabulary, TEXTpos, TEXTneg)
		})
	exit()

})
