const router = require("express").Router();
const bcrypt = require("bcrypt");

const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const UserModel = require("../models/User.model");

// saltos criados para a senha
const saltRounds = 10;

// registrando o usuario no site
router.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/
      )
    ) {
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }
    // delimitando os saltos para a senha
    const salt = await bcrypt.genSalt(saltRounds);
    // criptografando a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    // deletando a senha hash para que ela não apareça na nossa requisição http e seja mostrada ao usuario
    delete createdUser._doc.passwordHash;

    return res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

// fazer o usuario logar na conta
router.post("/login", async (req, res) => {
  try {
    // desistruturando o req.body, neste momento não precisamos seguir o schema apenas nos basear nele
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ msg: "Wrong password or email" });
    }

    // fazer a comparação com a senha passada pelo usuario no login e com a senha cadastrada criptografada no banco de dados
    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;

      const token = generateToken(user);

      return res.status(200).json({
        user: {
          ...user._doc,
        },
        // devolvemos o token para o client e o front vai tratar isso
        token: token,
      });
    } else {
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: JSON.stringify(error) });
  }
});

// fazendo a autenticação recebendo o token do usuario
// construimos um middle depois da leitura do caminho da rota e antes da callback
router.get("/profile", isAuth, attachCurrentUser, (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    console.log(loggedInUser);
    if (loggedInUser) {
      console.log(loggedInUser);
      return res.status(200).json(loggedInUser);
    } else {
      console.log(loggedInUser);
      return res.status(404).json({ msg: "User not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: JSON.stringify(error) });
  }
});

router.patch("/profile/update", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    /*
    Exemplo de como travar para não fazer o update de todos os campos
    if (req.body.CPF) {
        return res.status(400).json({msg: "TA MUDANDO PORQUE? TADEVENDOO?"})
      } */

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: loggedInUser._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: JSON.stringify(error) });
  }
});

router.delete(
  "/disable-account",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    // o attachCurrentUser colocou o loggedInUser
    try {
      const loggedInUser = req.currentUser;

      await UserModel.findOneAndUpdate(
        {
          _id: loggedInUser._id,
        },
        {
          isDisable: true,
          disableAt: Date.now(),
        }
      );

      return res.status(200).json({ msg: "Deletado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: JSON.stringify(error) });
    }
  }
);

module.exports = router;
