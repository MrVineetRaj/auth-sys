import User from "../models/User.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendVerificationMail from "../utils/sendMail.js";
import verificationEmailTemplate from "../emails/verificatio.email.js";

const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = process.env.TOKEN_NAME;

export const registerUser = async (req, res) => {
  // get name
  const { name, email, password } = req.body;

  // validate
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }
  try {
    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (!!existingUser) {
      return res.status(400).json({
        message: "User already exist",
        success: false,
      });
    }

    // create user in db
    const newUser = await User.create({
      name,
      email,
      password,
    });

    if (!!newUser === false) {
      res.status(400).json({
        message: "User not registered",
        success: false,
      });
    }

    // create a verification token
    const verificationToken = crypto.randomBytes(64).toString("hex");
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    // save token in DB
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = verificationTokenExpires;

    await newUser.save();

    const url = `${BASE_URL}:${PORT}/api/v1/users/verify/${verificationToken}`;

    //  send token as email to user
    const emailResp = await sendVerificationMail(
      "unknownbug team",
      "Verification URL",
      verificationEmailTemplate(url),
      email
    );

    console.log(emailResp);

    res.status(201).json({
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const resendToken = async (req, res) => {
  // get name
  const { name, email, password } = req.body;

  // validate
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!!user === false) {
      res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    // create a verification token
    const verificationToken = crypto.randomBytes(64).toString("hex");
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    // save token in DB
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    const url = `${BASE_URL}:${PORT}/api/v1/users/verify/${verificationToken}`;

    //  send token as email to user
    const emailResp = await sendVerificationMail(
      "unknownbug team",
      "Verification URL",
      verificationEmailTemplate(url),
      email
    );

    console.log(emailResp);

    res.status(200).json({
      message: "Verification token sent",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const verifyToken = async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({
      message: "Invalid Token",
      success: false,
    });
  }
  try {
    const user = await User.findOne({
      verificationToken: verificationToken,
    });

    if (!!user == false) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    const timeDiff =
      new Date(user?.verificationTokenExpires).getTime() - Date.now();

    if (timeDiff <= 0) {
      return res.status(400).send({
        message: "Token Expired",
        success: false,
      });
    }

    user.isVerified = true;
    user.verificationTokenExpires = "";
    user.verificationToken = "";

    await user.save();
    res.json({
      message: "Token Verified",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill all the required field",
    });
  }

  try {
    const user = await User.findOne({ email: email }).select("+password");

    if (!!!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password); // info : for compare in bcrypt.js first arg is normal password , second arg is hashed password

    if (!isPasswordMatching) {
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    user.sessionTokens.push({
      sessionToken: token,
    });

    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 1000,
    };
    res.cookie(TOKEN_NAME, token, cookieOptions);
    res.send({
      message: "Logged In",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user?.id,
      "sessionTokens.sessionToken": req.token,
    }).select(" -sessionTokens");

    if (!!!user) {
      res.status(200).json({ message: "Unauthorized Access", success: false });
    }
    res.status(200).json({
      message: "Profile Fetched",
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      "sessionTokens.sessionToken": req.token,
    });

    user.sessionTokens = user.sessionTokens.filter((item) => {
      return item.sessionTokens === req.token;
    });

    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 1000,
    };

    res.cookie(TOKEN_NAME, "", cookieOptions);

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const logoutAll = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      "sessionTokens.sessionToken": req.token,
    });

    user.sessionTokens = [];

    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 1000,
    };

    res.cookie(TOKEN_NAME, "", cookieOptions);

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    // create a verification token
    const verificationToken = crypto.randomBytes(64).toString("hex");
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    const user = await User.findOne({ email });

    // save token in DB
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    const url = `${BASE_URL}:${PORT}/api/v1/users/reset-password/${verificationToken}`;

    //  send token as email to user
    await sendVerificationMail(
      "unknownbug team",
      "Reset Password URL",
      verificationEmailTemplate(url),
      email
    );

    res.status(200).json({
      message: "Rest password mail sent",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { verificationToken } = req.params;
    if (!password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    user.password = password;

    user.verificationToken = undefined; // info : jab undefined use karte h to db se hat jata so storage used descrease ho jata h
    user.verificationTokenExpires = undefined;
    await user.save();

    // todo : send mail that password is changed

    res.status(200).json({
      message: "Password Changed",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


