var fs=require('fs')
,	async=require('async')
,	db=require('./database.js')
,	Review=db.get('Review')
,	pathPos='/home/bitliner/bitliner.dataset/review_polarity/txt_sentoken/pos/'
,	pathNeg='/home/bitliner/bitliner.dataset/review_polarity/txt_sentoken/neg/'



var doImport=function(path,polarity){
	fs.readdir(path,function(err,files){
		if (err) console.log(err);
		else{
			var i=0
			async.forEach(files,function(file,cb){
				fs.readFile(path+file, 'utf8',function(err,data){
					if (err) 
						throw err
					else{
						var r=new Review({
							polarity: polarity,
							text: data
						}).save(function(err,rev){
							if (err) throw err
								i++
							console.log(polarity,i,file);
							cb()
						})
					}
				})
			},function(err){
				if (err) throw err
				else
					console.log('END!');
					process.kill(process.pid, 'SIGTERM');
			})
		}
	})
}
doImport(pathNeg,'neg')
//doImport(pathNeg,'neg')
/*fs.readdir(pathPos,function(err,files){
	if (err) console.log(err);
	else{
		var i=0
		async.forEach(files,function(file){
			fs.readFile(pathPos+file, 'utf8',function(err,data){
				if (err) 
					throw err
				else
					{var r=new Review({
						polarity: 'pos',
						text: data
					}).save(function(err,rev){
						if (err) throw err
							i++
						console.log('POS',i,file);
					})}
				})
		},function(err){
			if (err) throw err
				console.log('END!');
		})
	}
})

fs.readdir(pathNeg,function(err,files){
	if (err) console.log(err);
	else{
		var i=0
		async.forEach(files,function(file){
			fs.readFile(pathNeg+file, 'utf8',function(err,data){
				if (err) 
					{console.log(err);
						throw err}
						else{
							var r=new Review({
								polarity: 'neg',
								text: data
							}).save(function(err,rev){
								if (err) throw err
									i++
								console.log('NEG', i,file);
							})}
						})
		},function(err){
			if (err) throw err
				console.log('END!');
		})
	}
})*/