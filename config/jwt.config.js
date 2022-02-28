const jwt = require("jsonwebtoken");

function generateToken(user) {
  const { _id, name, email } = user;

  const signature = process.env.TOKEN_SIGN_SECRET;
  const expiration = "6h";

  // essa parte funciona para autenticar o usuario e saber que é a pessoa que está utulizando a aplicalçao neste momento
  // metodo para gerar o token
  return jwt.sign({ _id, name, email }, signature, {
    expiresIn: expiration,
  });
}

module.exports = generateToken;
