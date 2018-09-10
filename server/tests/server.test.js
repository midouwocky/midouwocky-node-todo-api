const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
    {
        text: "the todo 1"
    },
    {
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

describe('server tests', () => {
    describe('post todos tests :', () => {
        it('should create a new todo ', (done) => {
            var text = 'text to do test';
            request(app)
                .post('/todos')
                .send({ text })
                .expect(200)
                .expect((res) => {
                    expect(res.body.text).toBe(text);
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
    });


    it('should not create a new todo ', (done) => {
        var text = 'text to do test';
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

    describe('get todos tests', () => {
        it('should get the todos list ', (done) => {
            request(app)
                .get('/todos')
                .expect(200)
                .expect((res) => {
                    expect(res.todos.length).toBe(2);
                    expect(res.todos).toBe(todos);
                }).end(()=>done());
        });
    });
});