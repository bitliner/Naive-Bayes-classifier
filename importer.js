/*var importReviews=function(data){
	return new Review({
		polarity: polarity,
		text: data
	})
}*/

/* create every model per file in path folder  */
module.exports.importFromFolder=function(path,modelConstructor,cb){

	fs.readdir(path,function(err,files){
		if (err) 
			throw err
		var models=[]
		files.forEach(function(file){
			fs.readFile(path+file, 'utf8',function(err,data){
				if (err) 
					throw err
				else{
					var m=modelConstructor(data)
					models.push(m)
				}
			})
		})
		cb(models)
	})

}