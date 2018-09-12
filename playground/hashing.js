var {SHA256}=require('crypto-js');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var password ='password1'

bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,(err,hash)=>{
        console.log(hash);
    });
});

var hash ='$2a$10$3UVU0FnwjSErAkLLeyZarOAZMOUdmM/s.V0xyCBpMlE5DUpi2ay1K';

bcrypt.compare(password,hash,(err,success)=>{
    console.log(success);
})



// var data= {
//     id:23
// };

// var token = jwt.sign(data,'midou162');
// console.log(token);


// var verification = jwt.verify(token,'midou162');

// console.log(verification);


