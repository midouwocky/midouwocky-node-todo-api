var mongoose= require('mongoose');

var url = process.env.MONGODB_URI;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

mongoose.connect(url ,{ useNewUrlParser: true });

module.exports={mongoose};