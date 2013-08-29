module.exports = function(mongoose){

	mongoose.connect('mongodb://kimchi:croshluison@ds029658.mongolab.com:29658/kimchi');
	var db = mongoose.connection;

	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {
	  console.log("Database Connection Established.");
	});

	return db;
}