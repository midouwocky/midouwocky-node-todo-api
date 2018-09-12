const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

var todos = [
    {
        _id: new ObjectID(),
        text: "the todo 1"
    },
    {
        _id: new ObjectID(),
        text: "the todo 2",
        completedAt: 254212
    }
];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
var users = [
    {
        _id:userOneId,
        email: 'email1@gmail.com',
        password: 'thepass1',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneId, access: 'auth' }, 'the secrete').toString()
            }
        ]
    },
    {
        _id:userTwoId,
        email: 'email2@gmail.com',
        password: 'thepass2'
    }
]

const populate = (done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos)
    }).then(()=>done());
};

const populateUsers = (done) => {
    User.deleteMany({}).then(() => {
        var user1 = new User(users[0]).save();
        var user2 = new User(users[1]).save();

        return Promise.all([user1, user2]);
    }).then(()=>done());;
}



module.exports = { todos, populate,users,populateUsers }


// afterEach((done) => {
//     Todo.deleteMany({}).then(() => {
//         done();
//     });
// });