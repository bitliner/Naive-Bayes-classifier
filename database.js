var mongoose=require('mongoose')
,	Schema = mongoose.Schema
,	ObjectId = Schema.ObjectId
,	ObjectIdType = mongoose.Types.ObjectId
, 	T=this;

if (!this.db){
	this.db=db = mongoose.connect('mongodb://localhost/my-sentiment-analysis')
}

exports.OID=function(id){
	return new ObjectIdType.fromString(id)
}

module.exports.define=function(name,schema){
	var s=new Schema(schema)
	mongoose.model(name,s)
}

module.exports.get=function(name){
	return this.db.model(name)
}

this.define('Review',{
	text: String,
	polarity: String
})
this.define('TrainingDoc',{
	text: String,
	polarity: String
})
this.define('TrainingProcessedDoc',{
	text: [String],
	polarity: String
})
this.define('ProcessedDoc',{
	text: [String],
	polarity: String
})
this.define('ProbabilityOfWordGivenClass',{
	word: String,
	probabilityGivenPositiveClass: Number,
	probabilityGivenNegativeClass: Number,
})


