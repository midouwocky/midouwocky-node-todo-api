var express = require('express');
var bodyParser = require('body-parser');

var {Todo}=require('./models/todo');
var {User}=require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
    var todo = Todo({
        text : req.body.text
    });
    todo.save()
    .then((doc)=>{
        res.status(201).send(doc);
    })
    .catch((err)=>{
        res.status(400).send(err);
    });
    
});

app.listen(3000,()=>{
    console.log('started on port 3000');
    
})