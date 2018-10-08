const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const {Role} = require('./../../models/role')
const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');


const date = new Date().getTime();
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const roleUserId = new ObjectID();
const roleAdminId = new ObjectID();
var users = [
    {
        _id:userOneId,
        email: 'email1@gmail.com',
        password: 'thepass1',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
            }
        ],
        roles:[
            {
                _id : roleAdminId,
                name:'ROLE_ADMIN'
            },
            {   
                _id :roleUserId,
                name:'ROLE_USER'
            }
        ]
    },
    {
        _id:userTwoId,
        email: 'email2@gmail.com',
        password: 'thepass2',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
            }
        ],
        roles:[
            {   
                _id :roleUserId,
                name:'ROLE_USER'
            }
        ]
    }
];
var todos = [
    {
        _id: new ObjectID(),
        text: "the todo 1",
        _creator:userOneId
    },
    {
        _id: new ObjectID(),
        text: "the todo 2",
        completedAt: date,
        completed:true,
        _creator:userTwoId
    }
];


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



module.exports = {date, todos, populate,users,populateUsers }


// afterEach((done) => {
//     Todo.deleteMany({}).then(() => {
//         done();
//     });
// });