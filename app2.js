var	db=require('./database.js')
,	Review=db.get('Review')
,	TrainingDoc=db.get('Review')

var negations=/^not$|^didn't$|^doesn't$|^don't$/g
,	punctuation=/^\.$|^:$|^,$|^;$|^\?$|^!$/g
,	tokenSeparator=/ +/g

var exit=function(){
	process.kill(process.pid, 'SIGTERM')
}


var createTrainingSet=function(limit,skip,cb){
	// Review.find({polarity:'pos'}).limit(limit).skip(skip).exec(function(err,posRevs){
	// 	TrainingDoc.remove({},function(){
	// 		posRevs.forEach(function(posRev){
	// 			var t=new TrainingDoc(posRev).save(function(err,tdoc){
	// 				// console.log('in save pos',err);
	// 			})
	// 		})
			Review.find({polarity:'neg'}).limit(limit).skip(skip).exec(function(err,negRevs){
				console.log('ciao',err,negRevs.length);
				negRevs.forEach(function(negRev){
					var t=new TrainingDoc(negRev).save(function(err,tdoc){
						console.log('in save neg',err);
					})
				})
				cb()
			})
	// 	})
	// })	
}

var tokenize=function(tdoc){
	var text=tdoc.text
	text=tdoc.text.replace(/\n/g,'')
	tokens=text.split(tokenSeparator)
	return tokens
}

var handleNegations=function(tokens){
	var inNegation=false
	tokens.forEach(function(token,i){
		if (inNegation && !token.match(punctuation) ){
			token='NOT_'+token
		}else if (inNegation && token.match(punctuation) ){
			inNegation=false
		}
		if ( token.match(negations) ){
			inNegation=true
		}
	})
	return tokens
}

var processDoc=function(tdocs){
	var tokens
	tdocs.forEach(function(tdoc,i){
		tokens=tokenize(tdoc)
		tdocs[i]=handleNegations(tokens)
	})
	return tdocs
}

var getPriors=function(cb){
	TrainingDoc.find({polarity:'pos'}).count().exec(function(err,posNum){
		TrainingDoc.find({polarity:'neg'}).count().exec(function(err,negNum){
			console.log(err, negNum);
			TrainingDoc.find({}).count().exec(function(err,docsNum){
				console.log(docsNum,posNum,negNum);
				cb()
			})
		})
	})
}


createTrainingSet(900,0,function(){
	TrainingDoc.find({},function(err,tdocs){
		processDoc(tdocs)
		getPriors(exit)

	})
})