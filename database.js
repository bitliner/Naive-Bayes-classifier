var mongoose=require('mongoose')
,	Schema = mongoose.Schema
,	ObjectId = Schema.ObjectId
,	ObjectIdType = mongoose.Types.ObjectId
, 	T=this;

if (!this.db){
	this.db=db = mongoose.connect('mongodb://localhost/my-sentiment-analysis')
}

var ReviewSchema=new Schema({
	text: String,
	polarity: String
})


mongoose.model('Review', ReviewSchema)


exports.Review = function(db) {
	return this.db.model('Review')
}
exports.OID=function(id){
	return new ObjectIdType.fromString(id)
}