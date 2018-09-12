require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();

var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = Todo({
        text: req.body.text
    });
    todo.save()
        .then((todo) => {
            res.status(200).send({ todo });
        })
        .catch((err) => {
            res.status(400).send(err);
        });

});

app.get('/todos', (req, res) => {
    Todo.find()
        .then((todos) => {
            res.send({ todos });
        })
        .catch((err) => {
            res.status(400)
                .send(err);
        });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Todo.findById(id)
        .then((todo) => {
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

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Todo.findByIdAndDelete(id)
        .then((todo) => {
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

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body,['text','completed']);
    
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    if(_.isBoolean(body.completed)&&body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completed = false;
        body.completedAt =null;
    }
    
    Todo.findByIdAndUpdate(id,{$set : body},{new:true})
        .then((todo) => {
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


app.listen(port, () => {
    console.log(`started on port ${port}`);
});

module.exports = { app };
