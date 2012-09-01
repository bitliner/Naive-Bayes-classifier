var _und=require('underscore')
,   async=require('async')
,   TextManipulator=require('./TextManipulator')
,   db=require('./database')
,   ProbabilityOfWordGivenClass=db.get('ProbabilityOfWordGivenClass')

/*
    learn(processedDocs)
        calculatePrior()
        parallel:
            [
                _extract_vocabulary 
                _calculateCorpusOfClass
            ]
        _calculateProbabilityOfClass
            save word and corresponding probability in database

    classify(processedDoc)
        values=[{ class, values }]
        parallel 
            [
                var prodPOS=reduce (words_of_doc, 0, memo + prob_of_word_given_class)
                cb(null, prodPOS),
                idem for negative
            ]
            max ( prior*arr[0], prior*arr[1] )
            return pos or neg
*/

var NaiveBayesClassifier={

    calculateProbabilityOfWordGivenClass:function(vocabulary, TEXTpos, TEXTneg){
        var nPOS=TEXTpos.length 
        ,   nNEG=TEXTneg.length
        vocabulary.forEach(function(w){
            async.parallel([function(cb){
                cb(null, TextManipulator.calculateOccurences(w,TEXTpos))
            },function(cb){
                cb(null, TextManipulator.calculateOccurences(w,TEXTneg))
            }],function(err,arr){
                var alfa=1
                ,   p_W_POS=(arr[0]+alfa)/(nPOS+ (alfa*vocabulary.length) )
                ,   p_W_NEG=(arr[1]+alfa)/(nNEG+ (alfa*vocabulary.length) )
                console.log( p_W_POS, p_W_NEG );
                var probabilityGivenClass=new ProbabilityOfWordGivenClass({
                    word: w,
                    probabilityGivenPositiveClass: p_W_POS,
                    probabilityGivenNegativeClass: p_W_NEG,
                }).save(function(err,doc){
                    if (err){
                        throw err
                    }else{
                        console.log('probability of word given class',doc);
                    }
                })
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
    calculateCorpusOfClass:function(tdocs,polarity){
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