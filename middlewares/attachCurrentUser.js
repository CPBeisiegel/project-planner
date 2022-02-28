const UserModel = require("../models/User.model");

// usamos o next para passar adiante a requisição, ele vai fazer o handoff da requisição
module.exports = async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const user = await UserModel.findOne(
      {
        _id: loggedInUser._id,
      },
      {
        passwordHash: 0,
      }
    );

    if (!user) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: JSON.stringify(error) });
  }
};
