const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');

const { todos, populate, populateUsers, users } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populate);

// afterEach((done) => {
//     Todo.deleteMany({}).then(() => {
//         done();
//     });
// });

describe('server tests', () => {
    describe('post todos tests :', () => {
        it('should create a new todo ', (done) => {
            var text = 'text to do test';
            request(app)
                .post('/todos')
                .send({ text })
                .set('x-auth',users[0].tokens[0].token)
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
                .set('x-auth',users[0].tokens[0].token)
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
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todos.length).toBe(1);
                }).end(done);
        });
    });
    describe('get todos/:id test', () => {
        it('should get a specific todo ', (done) => {
            var id = todos[0]._id.toHexString();

            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {

                    expect(res.body.todo.text).toBe(todos[0].text);
                }).end(done);
        });
        it('should return 401 for todo created by another user', (done) => {
            var id = todos[0]._id.toHexString();
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(401)
                .end(done);

        });

        it('should return 404 if todo not found ', (done) => {
            var id = new ObjectID().toHexString();
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .end(done);

        });


        it('should return 404 for invalid id ', (done) => {
            var id = 'invalidID';
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .end(done);

        });

        
    });
    describe('delete todos/:id test', () => {
        it('should delete a specific todo ', (done) => {
            var id = todos[0]._id.toHexString();

            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(todos[0].text);
                }).end((err, res) => {
                    if (err)
                        return done(err);
                    Todo.findById(id)
                        .then((todo) => {
                            expect(todo).toBeNull();
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
        });

        it('should return 401 for todo created by another user', (done) => {
            var id = todos[0]._id.toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(401)
                .end(done);

        });

        it('should return 404 if todo not found ', (done) => {
            var id = new ObjectID().toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .end(done);

        });


        it('should return 404 for invalid id ', (done) => {
            var id = 'invalidID';
            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .end(done);

        });
    });

    describe('update todos/:id test', () => {
        it('should update a specific todo ', (done) => {
            var id = todos[0]._id.toHexString();

            var body = {
                text: "this is the text updated",
                completed: true
            }

            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .send(body)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(body.text);
                    expect(res.body.todo.completed).toBe(true);
                    expect(typeof res.body.todo.completedAt).toBe('number');
                }).end((err, res) => {
                    if (err)
                        return done(err);
                    Todo.findById(id)
                        .then((todo) => {
                            expect(todo.text).toBe(body.text);
                            expect(todo.completed).toBe(true);
                            expect(typeof todo.completedAt).toBe('number');
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
        });

        it('should clear the completed value when completed is false ', (done) => {
            var id = todos[1]._id.toHexString();

            var body = {
                text: "this is the text updated 2",
                completed: false
            }

            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .send(body)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(body.text);
                    expect(res.body.todo.completed).toBe(false);
                    expect(res.body.todo.completedAt).toBeNull();
                }).end((err, res) => {
                    if (err)
                        return done(err);
                    Todo.findById(id)
                        .then((todo) => {
                            expect(todo.text).toBe(body.text);
                            expect(todo.completed).toBe(false);
                            expect(todo.completedAt).toBeNull();
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
        });

        it('should return 401 for todo created by another user', (done) => {
            var id = todos[0]._id.toHexString();
            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(401)
                .end(done);

        });

        it('should return 404 if todo not found ', (done) => {
            var id = new ObjectID().toHexString();
            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .end(done);

        });

        it('should return 404 for invalid id ', (done) => {
            var id = 'invalidID';
            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .end(done);
        });
    });

    describe('get users/me test', () => {
        it('should return user if authenticated', (done) => {
            request(app)
                .get('/users/me')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBe(users[0]._id.toHexString());
                    expect(res.body.email).toBe(users[0].email)
                })
                .end(done);
        });

        it('should return 401 if not authenticated', (done) => {
            request(app)
                .get('/users/me')
                .expect(401)
                .expect({})
                .end(done);
        });

    });
    describe('post /users', () => {
        it('should create user', (done) => {
            var email = 'example@example.com';
            var password = 'password123';

            request(app)
                .post('/users')
                .send({ email, password })
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.headers['x-auth']).toBeDefined();
                    expect(res.body.email).toBe(email);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.find({ email })
                        .then((users) => {
                            expect(users.length).toBe(1);
                            expect(users[0].email).toBe(email);
                            expect(users[0].password).not.toBe(password);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });

        });
        it('should return validation error when request not valid', (done) => {
            var email = 'example';
            var password = 'password123';
            request(app)
                .post('/users')
                .send({ email, password })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.find()
                        .then((users) => {
                            expect(users.length).toBe(2);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
        });
        it('should return error if email already used', (done) => {
            var email = users[0].email;
            var password = 'password123';
            request(app)
                .post('/users')
                .send({ email, password })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.find()
                        .then((users) => {
                            expect(users.length).toBe(2);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
        });
    });

    describe('Post /users/login test', () => {

        it('should return an error if credentials are wrong', (done) => {
            var email = users[1].email;
            var password = users[1].password;

            request(app)
                .post('/users/login')
                .send({ email, password })
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.headers['x-auth']).toBeDefined();
                    expect(res.body.email).toBe(email);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.findById(users[1]._id)
                        .then((user) => {
                            expect(user.tokens[1]).toMatchObject({
                                access: 'auth',
                                token: res.headers['x-auth']
                            });
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        })
                });
        });
        it('should login user and return token', (done) => {

            var email = 'try@gmail.com';
            var password = 'falsePass123';

            request(app)
                .post('/users/login')
                .send({ email, password })
                .expect(400)
                .expect((res) => {
                    expect(res.headers['x-auth']).toBeUndefined();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.findById(users[1]._id)
                        .then((user) => {
                            expect(user.tokens.length).toBe(1);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        })
                });
        });
    });

    describe('delete /users/me/token', () => {
        it('should delete token from user', (done) => {
            request(app)
                .delete('/users/me/token')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.findById(users[0]._id)
                        .then((user) => {
                            expect(user.tokens.length).toBe(0);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        })
                });
        });
    });

    describe('get /users', () => {
        it('should return users list for admin', (done) => {
            request(app)
                .get('/users')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .expect((res)=>{
                    expect(res.body.users).toBeTruthy();
                    expect(res.body.users.length).toBe(2);
                })
                .end(done);
        });
        it('should return 401 for a non admin user', (done) => {
            request(app)
                .get('/users')
                .set('x-auth', users[1].tokens[0].token)
                .expect(401)
                .expect((res)=>{
                    expect(res.body.users).toBeFalsy();
                })
                .end(done);
        });
    });

});
