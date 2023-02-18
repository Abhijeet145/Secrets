//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/userDB');` if your database has auth enabled
}

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

console.log(process.env.API_KEY);

userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});
const User = mongoose.model('User',userSchema);

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function(err){
        if(err)
            res.send(err);
        else{
            res.render("secrets");
        }        
    });
});
app.post("/login",function(req,res){
    
    const username = req.body.username;
    const password = req.body.password;
    
    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        } else {
            if(foundUser.password === password){
                console.log("User exists");
                res.render("secrets");
            }else{
                console.log("User does not exists");
            }
        }
    })
    
});

app.listen(3000,function(){
    console.log("server started on port 3000");
})