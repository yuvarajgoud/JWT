require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const app = express();
 

// Middle Wares
app.use(express.json())


// Database COnnection
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.error("Error connecting to MongoDB:", err.message);
});

// User Schema 
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
  
   
const User = mongoose.model('User', userSchema);

// API Endpoints 

app.get('/',(req,res)=>{
    res.send("This is my Server");
})

const secretKey = "vesuykhuAWHEOABASDBHLUIasua"
app.post('/register',async (req,res)=>{
    
    try{
        const {email,password} = req.body

        const existingUser = await User.findOne( {email} );
        console.log(existingUser)
        if(existingUser){
            res.send("User Already Exists !!! Please Login");
            return;
        }
        const newUser = new User({email,password})

        await newUser.save()
        res.status(201).json({ message: "User registered successfully" });
    } catch(err){
        console.log(err)
    }
})


app.post('/login' , async (req,res)=>{
    try{ 
        const {email,password} = req.body
        const existingUser = await User.findOne( {email} );

        if(!existingUser){
            res.status(301).json({message : "User Does Not Exist !!! Try another Email"});
            return;
        } else {
            if(existingUser.password === password){
                const token = jwt.sign({ email , password}, secretKey, {expiresIn: '1h' });
                console.log(token)
                res.status(201).json(token)
            } else {
                res.status(301).json({message : "Wrong Password !!! Try Again"});
                return;
            }
        }
    } catch(err){
        console.log(err)
    }
})

async function verifyUser(req,res,next){
    req.token = req.headers.authorization.split(" ")[1]
    // console.log(req.token)
    next()
}

app.get('/profile',verifyUser,(req,res)=>{
    jwt.verify(req.token,secretKey,(err,data)=>{
        if(err){
            res.status(400).json({"message" : "Token Mismatch"})
            return;
        }
        res.status(200).json(data)
    })
})


// App Listen

app.listen(process.env.PORT || 8000 , ()=>{
    console.log("Server Listening on port")
})




// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inl1dmFyYWpnb3VkMjBAZ21haWwuY29tIiwicGFzc3dvcmQiOiIxMjM0NTY3ODkiLCJpYXQiOjE3MTU5NDM3NjcsImV4cCI6MTcxNTk0NzM2N30.O2nLRx-dzTREu4LyXWtqzzG-CSwrXNzcQmGFMEb9TbI"