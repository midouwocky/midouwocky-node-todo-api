var { mongoose } = require('../db/mongoose');
const { Schema } = require('mongoose');

var roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    }
});


var Role = mongoose.model('Role',roleSchema);



module.exports={Role,roleSchema};