const { MongoClient, ObjectID } = require('mongodb');

var url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    var db = client.db('TodoApp');
     db.collection('Users')
    // .deleteMany({
    //     name :'salim'
    // })
    // .then((result)=>{
    //     console.log('delete element');
    //     console.log(result);
        
    // });
    .findOneAndUpdate({
        name : 'salim'
    },{
        $inc : {
            age: 1
        }
    },{
        returnOriginal:false
    })
    .then((result)=>{
        console.log('update element');
        console.log(result);
    });
    client.close();
});