const {getUser} = require("../service/auth");
const jwt = require("jsonwebtoken");
function checkForAuthentication(req,res,next) {
    const tokenCookie = req.cookies?.token;
    req.user = null;
    if(!tokenCookie) return next();
     
    const token = tokenCookie;
    const user = getUser(token);

    req.user = user;
    return next();
}
function restrictTo(roles = []) {
    return function (req, res, next) {
       if (!req.user) return res.status(401).json({ error: "Unauthorized" });


        if(!roles.includes(req.user.role)) return res.end("UnAuthorized");

        return next();
    } 
}
module.exports={
    checkForAuthentication,
    restrictTo
}