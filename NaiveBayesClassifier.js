var NaiveBayesClassifier={

    calculateProbabilityOfWordGivenClass:function(vocabulary, TEXTpos, TEXTneg){
        var nPOS=TEXTpos.length 
        ,   nNEG=TEXTneg.length
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
            ,   p_W_POS=(arr[0]+alfa)/(nPOS+ (alfa*vocabulary.length) )
            ,   p_W_NEG=(arr[1]+alfa)/(nNEG+ (alfa*vocabulary.length) )
            console.log(w,p_W_POS,p_W_NEG);
        })
        })
    },
    extractVocabulary:function(tdocs){
        var v = tdocs.reduce(function(memo,doc){
            doc.text.forEach(function(token){
                if (memo.indexOf(token)==-1 ){
                    memo.push(token)
                }
            })
            return memo
        },[])
        return v
    },
    var calculateCorpusOfClass:function(tdocs,polarity){
        var TEXT=tdocs.filter(function(tdoc){
            return tdoc.polarity==polarity
        }).reduce(function(memo,doc){
            memo.splice(-1,0,doc.text)
            return memo
        },[])
        return _und.flatten(TEXT)
    },

}

module.exports.calculateProbabilityOfWordGivenClass=NaiveBayesClassifier.calculateProbabilityOfWordGivenClass
module.exports.extractVocabulary=NaiveBayesClassifier.extractVocabulary
module.exports.calculateCorpusOfClass=NaiveBayesClassifier.calculateCorpusOfClass