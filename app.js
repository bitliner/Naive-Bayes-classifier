
/**
 * Module dependencies.
 */
 var express = require('express')
 , routes = require('./routes')


/*

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
*/



/*
tokenization
- delete \n if there are during processing
feature extraction 
- handle negation: indiviuda la negazione, e prependi _NOT alle parole tra la negazione e la punteggiatura seguente (!?:.,-)
classification using some classifier*/

var	db=require('./database.js')
,	Review=db.get('Review')
,	TrainingDoc=db.get('Review')

var negations=/^not$|^didn't$|^doesn't$|^don't$/g
,	punctuation=/^.$|^:$|^,$|^;$|^?$|^!$/g

Review.find({polarity:'pos'}).limit(900).exec(function(err,posRevs){
	TrainingDoc.remove({},function(){
		posRevs.forEach(function(posRev){
			var t=new TrainingDoc(posRev).save(function(err,tdoc){
				console.log('in save',err);
			})
		})
		
	})
})

Review.find({},function(err,reviews){// dovrei limitare la query in modo da avere solo doc del training set, cioè 2/3
	console.log(err);
	reviews.forEach(function(review){

		/* tokenization */
		review=review.text.replace('\n',"")
		tokens=review.split(/ +/g)

		/* handle negation */
		// devo capire se i token modificati fanno parte dell'array oppure rimangono invariati (secondo me rimangono invariati)
		var inNegation=false
		tokens.forEach(function(token){
			if (inNegation && !token.match(punctuation) ){
				token='NOT_'+token
			}else if (inNegation && token.match(punctuation) ){
				inNegation=false
			}
			if ( token.match(negations) ){
				inNegation=true
			}
		})
		// qui dovrei salvare l'insieme dei token come nuovo documento, oppure lo considero come documento in memoria!!!
	})
	/* classification - learning */

	/* calcolo del prior */
	/* per ogni classe: num di documenti che appartengono alla classe / num totale di documenti */

	// potrei farlo con async, in modo che alla fine faccio il calcolo!!!
	var docsNum=1800
	,	posDocsNum=900
	,	negDocsNum=900
	,	posPrior=posDocsNum/docsNum
	,	negPrior=negDocsNum/docsNum



	/* calcolo della probabilità di Wk data Cj */
	/* rimozione dei duplicati all'interno di ogni documento */
	/* viene creato un singolo documento TEXTj che corrisponde alla concatenazione di tutti i documenti della classe j */
	/* per ogni w si calcola il numero di occorrenze in TEXTj */
	/* viene calcolata la probabilità: Nk+alfa / n+alfa|V| */
})