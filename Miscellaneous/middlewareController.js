// controllers/middlewareController.js
const jwt = require("jsonwebtoken");

const verifyJWT = (request, reply, done) => {
  const token = request.cookies.token;
  if (!token) {
    reply.status(401).send({ message: "No token provided" });
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      reply.status(403).send({ message: "Failed to authenticate token" });
      return;
    }
    request.user = decoded;
    done();
  });
};

module.exports = verifyJWT;
