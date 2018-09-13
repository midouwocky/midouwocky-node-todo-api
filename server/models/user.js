const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{value} is not an email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

userSchema.methods.generateAuthToken = function () {
    var user = this;

    var access = 'auth';

    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'the secrete').toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {
        return token;
    });
}

userSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, 'the secrete');
    } catch (error) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })

}

userSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({ email })
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }
            return new Promise((resolve, reject) => { 
                bcrypt.compare(password, user.password, (err, success) => {
                    if (err) {
                        return reject(err);
                    }
                    if (success) {
                        resolve(user);
                    } else {
                        reject();
                    }
    
                })
            });
        })
        .catch((err)=>{
            return Promise.reject();
        })

}
userSchema.pre('save', function (next) {
    var user = this;
    var password = user.password;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return next();
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    return next();
                }
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }

});

var User = mongoose.model('User', userSchema);

module.exports = { User };