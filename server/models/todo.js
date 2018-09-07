var { mongoose } = require('../db/mongoose');
const { Schema } = require('mongoose');

var todoSchema = new Schema({
    text: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number
    }
});

var Todo = mongoose.model('Todo',todoSchema);

module.exports={Todo};