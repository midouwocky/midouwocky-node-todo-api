require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
var bcrypt = require('bcryptjs');;

var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { Role } = require('./models/role');

var { authenticate } = require('./middleware/authenticate');

var app = express();

var port = process.env.PORT;

app.use(bodyParser.json());
var authenticateUser = authenticate('ROLE_USER');
var authenticateADMIN = authenticate('ROLE_ADMIN');

app.post('/todos', authenticateUser, async (req, res) => {
    var todo = Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    try {
        await todo.save();
        res.status(200).send({ todo });
    } catch (error) {
        res.status(400).send(error);
    }

});

app.get('/todos', authenticateUser, async (req, res) => {

    try {
        var todos = await Todo.find({ _creator: req.user._id });
        res.send({ todos });
    } catch (error) {
        res.status(400)
            .send(error);
    }
});

app.get('/todos/:id', authenticateUser, async (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    try {
        var todo = await Todo.findById(id);
        if (todo._creator.toHexString() !== req.user._id.toHexString()) {
            return res.status(401).send();
        }
        if (todo) {
            res.send({ todo });
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(404).send();
    }

});

app.delete('/todos/:id', authenticateUser, async (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    try {
        var todo = await Todo.findByIdAndDelete(id);
        if (todo._creator.toHexString() !== req.user._id.toHexString()) {
            return res.status(401).send();
        }
        if (todo) {
            res.send({ todo });
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(404).send();
    }
});

app.patch('/todos/:id', authenticateUser, async (req, res) => {
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
    try {
        var todo = await Todo.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (todo._creator.toHexString() !== req.user._id.toHexString()) {
            return res.status(401).send();
        }
        if (todo) {
            res.send({ todo });
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(404).send();
    }
});
//user controller

app.post('/users', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = User(body);
    user.roles = user.roles.concat([{_id:"5ba4ffd30beaa26ba6e744d6",name:"ROLE_USER"}]);
    try {
        await user.save();
        var token = await user.generateAuthToken();
        res.status(200).header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/users/me', authenticateUser, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var email = body.email;
    var password = body.password;
    try {
        var user = await User.findByCredentials(email, password);
        var token = await user.generateAuthToken();
        res.status(200).header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/users/me/token', authenticateUser, async (req, res) => {
    try {
        await req.user.removeAuthToken(req.token);
        res.status(200).send();
    } catch (error) {
        res.status(400).send(err);
    }
});

app.get('/users', authenticateADMIN, async (req, res) => {
    var admin = false;
    try {
        var users = await User.find();
        res.send({ users });
    } catch (error) {
        res.status(400)
            .send(error);
    }
});

app.listen(port, () => {
    console.log(`started on port ${port}`);
});

module.exports = { app };
