const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");

/**
 * MIDDLEWARE
 * CHECK TOKEN
 */

const checkToken = (req, res, next) => {
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];

  const token = req.cookies.access_token;

  if (token == null) return res.status(403).redirect("/login");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tokenInfo) => {
    if (err) {
      return res.status(401).redirect("/login");
    }

    req.tokenInfo = tokenInfo;
    next();
  });
};

module.exports = checkToken;
