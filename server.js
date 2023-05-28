// import requires modules/packages
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// dotenv configuration
dotenv.config();

// connection to Database
mongoose.set("strictQuery", false);
if(process.env.MODE !=="productions"){
    console.log(`MODE: ${process.env.MODE}`);
    mongoose.connect(process.env.MONGODB_URI).then(()=>{
        console.log("Connected to Database");
    }).catch(err=>{
        console.error("Failed to connect to Database", err);
    });
}else{
    console.log(`MODE: ${process.env.MODE}`);
    mongoose.connect(process.env.MONGODB_URI_PROD).then(()=>{
        console.log("Connected to Database");
    }).catch(err=>{
        console.error("Failed to connect to Database", err);
    });
}

// app instance
const app = express();

// app configurations
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// routes configurations
app.use("/", appRoutes);

// server instance
const server = http.createServer(app);

server.listen(process.env.PORT, ()=>{
    console.log(`Server up and running on port: ${process.env.PORT}`);
});