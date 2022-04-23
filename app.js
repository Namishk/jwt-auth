require("dotenv").config();
require("./config/database").connect();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("./model/user");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json());


app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});


// Register
app.post("/register", async (req, res) => {
    
    try {

        const {firstName, lastName, email, password} = req.body;

        if(!(email && password && lastName && firstName)){
            return res.status(400).send("enter all inputs");
        }

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(409).send("User already exists");
        }

        encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        const token = jwt.sign(
            {user_id: user._id, email},
            process.env.TOKEN_KEY
        );

        user.token = token;

        return res.status(200).json(user);



    } catch (error) {
        console.log(error);       
    }
});

// Login
app.post("/login", async (req, res) => {


    try {
       const {email, password} = req.body;
       
       if(!(email && password)){
           return res.status(400).send("enter all inputs");
       }

       const user = await User.findOne({email});

       if(user && (await bcrypt.compare(password, user.password))){
            const token = jwt.sign(
                {user_id : user._id, email },
                process.env.TOKEN_KEY
            )
            user.token = token;
     
            return res.status(200).json(user);
       }

       return res.status(400).send("Invalid crediantials");


    } catch (error) {
       console.log(error);
    }

});

module.exports = app;