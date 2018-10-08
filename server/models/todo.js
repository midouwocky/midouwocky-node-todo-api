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
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
    completedAt: {
        type: Number
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    category: {
        type: String,
        enum: ['Sport', 'Shopping','Learning','Cooking','Work','Other'],
        default:'Other'
    }
});

var Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo };