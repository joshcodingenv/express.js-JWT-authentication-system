// import required modules/packages
const express = require("express");
const User = require("../models/user");
const slugify = require("slugify");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authedUser = require("../middlewares/authedUser");

// router instance
const router = express.Router();

// app endpoints
router.get("/test", (req, res)=>{
    res.status(200).send("Test route handler working");
});

router.get("/users", authedUser, async (req, res)=>{
    // retrieve all users from the database
    const users = await User.find({});
    if(!users){
        return res.status(500).send("Failed to get users");
    };
    if(users.length == 0){
        return res.status(200).send("No users available");
    };

    res.status(200).json({ users });
});

router.get("/user/:username", authedUser, async (req, res)=>{
    // get the user based on requested Id
    const username = req.params.username;

    // get the user based on the requested Id
    const user = await User.findOne({ username });
    if(!user){
        return res.status(500).send("Failed to get user");
    };

    res.status(200).json({ user });
});

router.post("/new-user", async (req, res)=>{
    // perform object destructuring to get submitted data in the request body
    const { username, firstName, lastName, password } = req.body;

    // data validation
    if(!username || username.length === 0 || username == ""){
        return res.status(400).send("Username is required");
    };
    if(!firstName || firstName.length === 0 || firstName == ""){
        return res.status(400).send("First name is required");
    };
    if(!lastName || lastName.length === 0 || lastName == ""){
        return res.status(400).send("Last name is required");
    };

    // password validations
    if(!firstName || password == ""){
        return res.status(400).send("password is required");
    };

    if(password.length <=5){
        return res.status(400).send("Password must be at least 6 characters");
    };

    // check user existence
    const existingUser = await User.findOne({ username });
    if(existingUser){
        return res.status(403).send("Account with same username exists");
    }

    // make a full name based on the submitted names using slugify package
    const full_name = slugify(`${firstName} ${lastName}`, { lower: true});

    // make a password hash before saving to the database
    const salt_rounds = 13;
    const salt = await bcrypt.genSalt(salt_rounds);
    const hash = await bcrypt.hash(password, salt);

    // construct user data to be saved in the database
    const newUser = new User({
        username, 
        fullName: full_name,
        firstName, 
        lastName,
        passwordHash: hash
    });

    // console.log to preview the user data
    // console.log(newUser);

    // save the user to the database
    await newUser.save();

    res.status(201).send("New user created");

});

router.post("/login", async (req, res)=>{
    // perform object destructuring to get user submitted data in the request body
    const { username, password } = req.body;

    // data validation
    if(!username || username.length === 0 || username === ""){
        return res.status(400).send("Username is required");
    };
    if(!password || username === ""){
        return res.status(400).send("Password is required");
    };

    // check for user existence
    const existingUser = await User.findOne({ username });
    if(!existingUser){
        return res.status(401).send("Unauthorized");
    };

    // // compare password if user exists
    const validPassword = await bcrypt.compare(password, existingUser.passwordHash);
    if(!validPassword){
        return res.status(401).send("Incorrect username or password");
    };

    // create a token if password is valid
    const token = jwt.sign({
        user: existingUser._id,
    }, process.env.SECRET);

    // preview token before storing in cookie
    // console.log(token);
    res.cookie("token", token, {
        httpOnly: true
    }).send("Logged In");
});

router.get("/logout", authedUser, (req, res)=>{
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    }).send("Logged Out");
});

// export router instance
module.exports = router;