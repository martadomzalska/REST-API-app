const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../service/schemas/user");
require("dotenv").config();
const secret = process.env.SECRET;

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }

  try {
    const newUser = new User({ username, email });
    newUser.setPassword(password);
    // newUser.validPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        message: "Registration successful",
        user: {
          email,
          username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Incorrect login or password",
      data: "Bad request",
    });
  }

  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "12h" });
  res.json({
    status: "success",
    code: 200,
    data: {
      token,
      user: {
        email,
      },
    },
  });
};

const logout = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Clear the token in the user model
    user.token = null;
    await user.save();

    res.status(204).send(); // Logout success response
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const listUser = async (req, res, next) => {
  const { email, subscription } = req.user;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful: user: ${email} , subscription: ${subscription}`,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  auth,
  listUser
};

