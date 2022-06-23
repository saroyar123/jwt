require("dotenv").config();
require("./config/database").connect();
const User=require("./model/user");
const express = require("express");
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const app = express();

app.use(express.json());

app.post('/register',async(req,res)=>{
    try {
        const { first_name, last_name, email, password } = req.body;

        if(!(first_name&&last_name&&email&&password))
        {
           res.status(400).send("require all data");
        }

        const olduser=await User.findOne({email});
        if(olduser)
        {
           return res.status(509).send("user already exist");
        }

        const encryptedpassward=await bcrypt.hash(password,10);

        const user=await User.create({
            first_name,
            last_name,
            email:email.toLowerCase(),
            password:encryptedpassward,
        });


        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          // save user token
          user.token = token;

        res.status(201).json({
            success:true,
            user,
        })
    } catch (error) {
        console.log(`error occure in creating collection ${error}`);
    }
});

app.post("/login",async(req,res)=>{
    try {
        
        const {email,password}=req.body;
        if(!(email&&password))
          res.status(400).send("send all credential");

        const user=await User.findOne({email});

        if(user&&(await bcrypt.compare(password,user.password))){
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                  expiresIn: "2h",
                }
              );

              user.token=token;

              res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");

    } catch (error) {
        console.log(error);
    }
});

// Logic goes here

module.exports = app;