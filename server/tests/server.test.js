const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
    {
        _id: new ObjectID(),
        text: "the todo 1"
    },
    {
        _id: new ObjectID(),
        text: "the todo 2"
    }
];

beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
        Todo.insertMany(todos)
            .then(() => {
                done();
            });
    });
});

afterEach((done) => {
    Todo.deleteMany({}).then(() => {
        done();
    });
});

describe('server tests', () => {
    describe('post todos tests :', () => {
        it('should create a new todo ', (done) => {
            var text = 'text to do test';
            request(app)
                .post('/todos')
                .send({ text })
                .expect(200)
                .expect((res) => {
                    
                    expect(res.body.todo.text).toBe(text);
                }).end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.find({ text }).then((todos) => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    }).catch((err) => {
                        done(err);
                    });
                });
        });
        it('should not create a new todo ', (done) => {
            request(app)
                .post('/todos')
                .send({})
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.find().then((todos) => {
                        expect(todos.length).toBe(2);
                        done();
                    }).catch((err) => {
                        done(err);
                    });
                });
        });
    });

    describe('get todos tests', () => {
        it('should get the todos list ', (done) => {
            request(app)
                .get('/todos')
                .expect(200)
                .expect((res) => {
                    expect(res.body.todos.length).toBe(2);
                }).end(done);
        });
    });
    describe('get todos/:id test', () => {
        it('should get a specific todo ', (done) => {
            var id = todos[0]._id.toHexString();

            request(app)
                .get(`/todos/${id}`)
                .expect(200)
                .expect((res) => {

                    expect(res.body.todo.text).toBe(todos[0].text);
                }).end(done);
        });
        it('should return 404 if todo not found ', (done) => {
            var id = new ObjectID().toHexString();
            request(app)
                .get(`/todos/${id}`)
                .expect(404)
                .end(done);

        });


        it('should return 404 for invalid id ', (done) => {
            var id = 'invalidID';
            request(app)
                .get(`/todos/${id}`)
                .expect(404)
                .end(done);

        });
    });
    describe('delete todos/:id test', () => {
        it('should delete a specific todo ', (done) => {
            var id = todos[0]._id.toHexString();

            request(app)
                .delete(`/todos/${id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(todos[0].text);
                }).end((err, res) => {
                    if (err)
                        return done(err);
                    Todo.findById(id)
                    .then((todo)=>{
                        expect(todo).toBeNull();
                        done();
                    })
                    .catch((err)=>{
                        done(err);
                    });
                });
        });
        it('should return 404 if todo not found ', (done) => {
            var id = new ObjectID().toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .expect(404)
                .end(done);

        });


        it('should return 404 for invalid id ', (done) => {
            var id = 'invalidID';
            request(app)
                .delete(`/todos/${id}`)
                .expect(404)
                .end(done);

        });
    });

});