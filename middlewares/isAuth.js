const expressJWT = require("express-jwt");

function extractTokenFromHeaders(req, res) {
  if (!req.headers.authorization) {
    console.error("Missing Auth Header");
    return res.status(400).json({ msg: "Missing Auth Header" });
  }

  // extraindo da requisição o token
  return req.headers.authorization.split(" ")[1];
}

module.exports = expressJWT({
  secret: process.env.TOKEN_SIGN_SECRET,
  userProperty: "user",
  getToken: extractTokenFromHeaders,
  algorithms: ["HS256"],
});
