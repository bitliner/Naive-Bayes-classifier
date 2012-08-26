var fs=require('fs')

/* create every model per file in path folder  */
module.exports.importFromFolder=function(path,modelConstructor,cb){

	fs.readdir(path,function(err,files){
		var models=[]
		if (err) 
			throw err
		files.forEach(function(file){
			var data=fs.readFileSync(path+file, 'utf8')
			var m=modelConstructor(data)
			models.push(m)
		})
		cb(models)	
	})

}