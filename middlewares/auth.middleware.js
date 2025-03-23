import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const TOKEN_NAME = process.env.TOKEN_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleWare(req, res, next) {
  const cookies = req.cookies;
  const token = cookies[TOKEN_NAME] || "";

  try {
    if (!token) {
      return res.status(401).json({
        // info : Don't send res twice to client ek baar  hi  request accepted karega
        message: "Unauthorized Access",
        success: false,
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized Access",
      success: false,
    });
  }
}

export default authMiddleWare;
