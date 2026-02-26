const { getUser } = require("../service/auth");
const jwt = require("jsonwebtoken");
function checkForAuthentication(req, res, next) {
    req.user = null;

    // Check cookie first
    let token = req.cookies?.token;

    // Fall back to Authorization: Bearer <token>
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
    }

    if (!token) return next();

    const user = getUser(token);
    req.user = user;
    return next();
}
function restrictTo(roles = []) {
    return function (req, res, next) {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });


        if (!roles.includes(req.user.role)) return res.end("UnAuthorized");

        return next();
    }
}
module.exports = {
    checkForAuthentication,
    restrictTo
}