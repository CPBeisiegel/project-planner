// Deveria ser um middleware!

function isOwner(owenerId, userId) {
  if (!owenerId === userId) {
    return res.status(401).json({ msg: "Você não tem acesso a essa meta." });
  }
}

module.exports = isOwner;
