var mongoose= require('mongoose');

var url = "mongodb://localhost:27017/Todo";

mongoose.Promise = global.Promise;

mongoose.connect(url ,{ useNewUrlParser: true });

module.exports={mongoose};