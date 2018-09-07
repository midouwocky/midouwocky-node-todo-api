const { MongoClient, ObjectID } = require('mongodb');

var url = "mongodb://localhost:27017/";
module.exports.getUsers = () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client)=>{
        var db = client.db('TodoApp');
        // db.collection('Todos').find().count()
        //     .then((count) => {
        //         console.log(JSON.stringify(count, undefined, 2));
        //     })
        //     .catch((err) => {
        //         console.log('unable to fetch todos ' + err);
        //     });
        db.collection('Users')
            .find()
            .toArray()
            .then((data) => {
                console.log(data);
                return data;
            })
            .catch((err) => {
                console.log(err);

            });

        client.close();
    });
};