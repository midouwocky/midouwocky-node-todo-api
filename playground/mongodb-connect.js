const MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/";

MongoClient.connect(url,{ useNewUrlParser: true }, function (err, client) {
    if (err) {
        return console.log('unable to connect to server');
    };
    var db = client.db('TodoApp');

    db.collection('Users').insertOne({
        name: 'salim',
        age: 26,
        location: 'sidi seliman tissemsilt'
    }, (err, result) => {
        if (err)
            return console.log('unable to insert user ', err);
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 3));
    });
    
    client.close();
});