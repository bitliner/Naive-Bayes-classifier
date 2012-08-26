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

var Review=this.get('Review')
,	TrainingDoc=this.get('TrainingDoc')
,	TrainingProcessedDoc=this.get('TrainingProcessedDoc')

var createTrainigSet=function(limit,skip,cb){
	Review.find({polarity:'pos'}).limit(limit).skip(skip).exec(function(err,posRevs){
		TrainingDoc.remove({},function(){
			posRevs.forEach(function(posRev){
				var t=new TrainingDoc(posRev).save(function(err,tdoc){
					console.log('in save pos',err);
				})
			})
			Review.find({polarity:'neg'}).limit(limit).skip(skip).exec(function(err,negRevs){
				negRevs.forEach(function(negRev){
					var t=new TrainingDoc(negRev).save(function(err,tdoc){
						console.log('in save neg',err);
					})
				})
				cb()
			})
		})
	})	
}

