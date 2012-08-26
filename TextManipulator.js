var TextProcessor={
	tokenize:function(text){
		var symbolsToBeDeleted=/\n/g
		,	tokenSeparator=/ +/g
		text=text.replace(symbolsToBeDeleted,'')
		return text.split(tokenSeparator)
	},	
	handleNegations:function(tokenSet){
		var negations=/^not$|^didn't$|^doesn't$|^don't$/g
		,	punctuation=/^\.$|^:$|^,$|^;$|^\?$|^!$/g
		,	inNegation=false
		tokenSet.forEach(function(token,i){
			if (inNegation && !token.match(punctuation) ){
				token='NOT_'+token
			}else if (inNegation && token.match(punctuation) ){
				inNegation=false
			}
			if ( token.match(negations) ){
				inNegation=true
			}
		})
		return tokenSet
	},
	removeDuplicates:function(tokenSet){
		var tmp=[]
		tokenSet.forEach(function(token,i){
			if ( tmp.indexOf(token)==-1 ){
				tmp.push(token)
			}
		})
		return tmp
	},
	calculateOccurences:function(w,corpus){
		return corpus.reduce(function(memo,token){
			if (w==token){
				return memo+1
			}else{
				return memo
			}
		},0)
	}
}

module.exports.tokenize=TextProcessor.tokenize
module.exports.handleNegations=TextProcessor.handleNegations
module.exports.removeDuplicates=TextProcessor.removeDuplicates
module.exports.calculateOccurences=TextProcessor.calculateOccurences
