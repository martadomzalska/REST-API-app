const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../service/schemas/user");
require("dotenv").config();
const secret = process.env.SECRET;
const jimp = require("jimp");
const path = require("path");
const multer = require("multer");
const fs = require("fs").promises;
const Joi = require("joi");
const gravatar = require("gravatar");
const nodemailer = require("nodemailer");
const uuid = require("uuid");

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const tmpFolder = path.join(__dirname, "..", "tmp");
const avatarsFolder = path.join(__dirname, "..", "public", "avatars");

fs.mkdir(tmpFolder, { recursive: true });

const avatarStorage = multer.memoryStorage();
const avatarUpload = multer({ storage: avatarStorage });


const register = async (req, res, next) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Registration validation error",
        data: error.details[0].message,
      });
    }

    const { email, username, password } = req.body;
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }

    const avatarURL = gravatar.url(
      email,
      { s: "250", r: "pg", d: "identicon" },
      true
    );

    const verificationToken = uuid.v4();

    const newUser = new User({ username, email, avatarURL, verificationToken });
    newUser.setPassword(password);
    await newUser.save();

    const verificationLink = `http://localhost:3000/api/users/verify/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "domzalskam4@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "domzalskam4@gmail.com",
      to: email,
      subject: "Email Verification",
      text: `Click the following link to verify your email: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          status: "fail",
          code: 500,
          message: "Failed to send verification email",
          data: "Internal Server Error",
        });
      }

      return res.status(201).json({
        status: "success",
        code: 201,
        data: {
          message: `Registration successful. Verification email sent: ${verificationLink}`,
          user: {
            email,
            username,
          },
        },
      });
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Login validation error",
        data: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.validPassword(password)) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Email or password is wrong",
        data: "Unauthorized",
      });
    }

    if (!user.verify) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message:
          "Email not verified. Please verify your email before logging in.",
        data: "Unauthorized",
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
  } catch (error) {
    next(error);
  }
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

    user.token = null;
    await user.save();

    res.status(204).send();
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

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = req.user;
    const imageBuffer = req.file.buffer;

    const processedImage = await jimp.read(imageBuffer);
    await processedImage.resize(250, 250);

    const uniqueFileName = `${user._id}_${Date.now()}.png`;

    const tmpFilePath = path.join(tmpFolder, uniqueFileName);

    await processedImage.writeAsync(tmpFilePath);

    const avatarPath = path.join(avatarsFolder, uniqueFileName);

    await fs.rename(tmpFilePath, avatarPath);

    user.avatarURL = `/avatars/${uniqueFileName}`;
    await user.save();

    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
      });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Missing required field email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.verify) {
      return res.status(400).json({
        message: "Verification has already been passed",
      });
    }

    const verificationToken = uuid.v4();

    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `http://localhost:3000/api/users/verify/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "domzalskam4@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "domzalskam4@gmail.com",
      to: email,
      subject: "Email Verification",
      text: `Click the following link to verify your email: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          status: "fail",
          code: 500,
          message: "Failed to resend verification email",
          data: "Internal Server Error",
        });
      }

      return res.status(200).json({
        message: `Verification email sent: ${verificationLink}` ,
      });
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  auth,
  listUser,
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
};
