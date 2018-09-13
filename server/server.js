require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
var bcrypt = require('bcryptjs');;

var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();

var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    todo.save()
        .then((todo) => {
            res.status(200).send({ todo });
        })
        .catch((err) => {
            res.status(400).send(err);
        });

});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id })
        .then((todos) => {
            res.send({ todos });
        })
        .catch((err) => {
            res.status(400)
                .send(err);
        });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Todo.findById(id)
        .then((todo) => {
            if (todo._creator.toHexString() !== req.user._id.toHexString()) {
                return res.status(401).send();
            }
            if (todo) {
                res.send({ todo });
            } else {
                res.status(404).send();
            }
        })
        .catch((err) => {
            res.status(404).send();
        });

});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Todo.findByIdAndDelete(id)
        .then((todo) => {
            if (todo._creator.toHexString() !== req.user._id.toHexString()) {
                return res.status(401).send();
            }
            if (todo) {
                res.send({ todo });
            } else {
                res.status(404).send();
            }
        })
        .catch((err) => {
            res.status(404).send();
        });

});

app.patch('/todos/:id',authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
        .then((todo) => {
            if(todo._creator.toHexString()!==req.user._id.toHexString()){
                return res.status(401).send();
            }
            if (todo) {
                res.send({ todo });
            } else {
                res.status(404).send();
            }
        })
        .catch((err) => {
            res.status(404).send();
        });
});
//user controller

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = User(body);
    user.save()
        .then(() => {
            return user.generateAuthToken()
                .then((token) => {
                    res.status(200).header('x-auth', token).send(user);
                });
        })
        .catch((err) => {
            res.status(400).send(err);
        });

});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var email = body.email;
    var password = body.password;

    User.findByCredentials(email, password)
        .then((user) => {
            return user.generateAuthToken()
                .then((token) => {
                    res.status(200).header('x-auth', token).send(user);
                });
        })
        .catch((err) => {
            res
                .status(400)
                .send(err);

        })

});

app.delete('/users/me/token', authenticate, (req, res) => {
    var token = req.headers['x-auth'];
    req.user.removeAuthToken(token)
        .then(() => {
            res.status(200).send();
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

app.listen(port, () => {
    console.log(`started on port ${port}`);
});

module.exports = { app };
