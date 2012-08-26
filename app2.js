console.log('\nNEW EXECUTION: '+process.argv[2]);
var startTime=new Date().getTime()

var	db=require('./database.js')
,	async=require('async')
,	Review=db.get('Review')
,	TrainingDoc=db.get('TrainingDoc')
,	TrainingProcessedDoc=db.get('TrainingProcessedDoc')
,	_und = require("underscore")

var negations=/^not$|^didn't$|^doesn't$|^don't$/g
,	punctuation=/^\.$|^:$|^,$|^;$|^\?$|^!$/g
,	tokenSeparator=/ +/g

var exit=function(){
	console.log('END!');
	process.kill(process.pid, 'SIGTERM')
}

var createTrainingSet=function(limit,skip,cb){
	Review.find({polarity:'pos'}).limit(limit).skip(skip).exec(function(err,posRevs){
		TrainingDoc.remove({},function(){
			posRevs.forEach(function(posRev){
				var t=new TrainingDoc(posRev).save(function(err,tdoc){})
			})
			Review.find({polarity:'neg'}).limit(limit).skip(skip).exec(function(err,negRevs){
				negRevs.forEach(function(negRev){
					var t=new TrainingDoc(negRev).save(function(err,tdoc){})
				})
				cb()
			})
		})
	})	
}

var tokenize=function(tdoc){
	var text=tdoc.text.replace(/\n/g,'')
	tokens=text.split(tokenSeparator)
	return new TrainingProcessedDoc({
		polarity: tdoc.polarity,
		text: tokens 
	})
}

var handleNegations=function(tdoc){
	var inNegation=false
	tdoc.text.forEach(function(token,i){
		if (inNegation && !token.match(punctuation) ){
			token='NOT_'+token
		}else if (inNegation && token.match(punctuation) ){
			inNegation=false
		}
		if ( token.match(negations) ){
			inNegation=true
		}
	})
}

var processDoc=function(tdocs){
	tdocs.forEach(function(tdoc,i){
		tdoc=tokenize(tdoc)
		handleNegations(tdoc)
		tdocs[i]=tdoc
	})
}

var getPriors=function(cb){
	TrainingDoc.find({polarity:'pos'}).count().exec(function(err,posNum){
		TrainingDoc.find({polarity:'neg'}).count().exec(function(err,negNum){
			TrainingDoc.find({}).count().exec(function(err,docsNum){
				console.log('docsNum,posNum,negNum: ',docsNum,posNum,negNum);
				cb(posNum/docsNum,negNum/docsNum)
			})
		})
	})
}

var removeDuplicates=function(tdocs){
	console.log('in remove duplicates');
	tdocs.forEach(function(tdoc,i){
		var tmp=[]
		tdoc.text.forEach(function(token,i){
			if ( tmp.indexOf(token)==-1 ){
				tmp.push(token)
			}
		})
		tdocs[i].text=tmp
	})
}

var calculateOccurences=function(w,corpus){
	return corpus.reduce(function(memo,token){
		if (w==token){
			return memo+1
		}else{
			return memo
		}
	},0)
}
var calculateTEXT=function(tdocs,polarity){
	var TEXT=tdocs.filter(function(tdoc){
		return tdoc.polarity==polarity
	}).reduce(function(memo,doc){
		console.log('creating TEXT',polarity);
		memo.splice(-1,0,doc.text)
		return memo
	},[])
	return _und.flatten(TEXT)
}

createTrainingSet(900,0,function(){
	TrainingDoc.find({},function(err,tdocs){
		processDoc(tdocs)
		getPriors(function(posPrior,negPrior){
			console.log(posPrior,negPrior);
			removeDuplicates(tdocs)
			
			async.parallel([
				function(cb){
					// calculateTEXT(tdocs,'pos')
					var TEXTpos=tdocs.filter(function(tdoc){
						return tdoc.polarity=='pos'
					}).reduce(function(memo,doc){
						console.log('in reduce TEXTpos');
						memo.splice(-1,0,doc.text)
						return memo
					},[])
					cb(null,_und.flatten(TEXTpos))
				},function(cb){
					var TEXTneg=tdocs.filter(function(tdoc){
						return tdoc.polarity=='neg'
					}).reduce(function(memo,doc){
						console.log('in reduce TEXTneg');
						memo.splice(-1,0,doc.text)
						return memo
					},[])
					cb(null, _und.flatten(TEXTneg) )
				},function(cb){
					console.log('in create vocabulary');
					var vocabulary=tdocs.reduce(function(memo,doc){
						doc.text.forEach(function(token){
							if (memo.indexOf(token)==-1 ){
								memo.push(token)
							}
						})
						return memo
					},[])
					cb(null,vocabulary)			
				}],function(err,arr){

					console.log(err,'end async.parallel')

					var TEXTpos=arr[0]
					,	TEXTneg=arr[1]
					,	vocabulary=arr[2]
					,	nPOS=TEXTpos.length 
					,	nNEG=TEXTneg.length

					vocabulary.forEach(function(w){
						async.parallel([function(cb){
							cb(null,calculateOccurences(w,TEXTpos) )
						},function(cb){
							cb(null,calculateOccurences(w,TEXTneg) )
						}],function(err,arr){
							/* viene calcolata la probabilità Wk/Ck : Nk+alfa / n+alfa|V| */
							var alfa=1
							,	p_W_POS=(arr[0]+alfa)/(nPOS+ (alfa*vocabulary.length) )
							,	p_W_NEG=(arr[1]+alfa)/(nNEG+ (alfa*vocabulary.length) )
							console.log(w,p_W_POS,p_W_NEG);
						})
					})
				})

exit()
})
})
})