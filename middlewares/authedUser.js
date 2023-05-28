// import required module/packages 
const jwt = require("jsonwebtoken");

// function to verify the user is authenticated by verifying token existence and validity
let authedUser = async (req, res, next) =>{
    try {
        // obtain cookie from request cookie property
        const token = req.cookies.token;

        // verify token
        if(!token){
            return res.status(401).send("Must be Logged In");
        };

        // verify token validity if existing
        const validToken = await jwt.verify(token, process.env.SECRET);
        if(!validToken){
            return res.status(403).send("Must be Logged In");
        };

        // assign values to request object if token is valid
        req.user = validToken.user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(403).send("Unauthorized");
    }

}

// export middleware
module.exports = authedUser;