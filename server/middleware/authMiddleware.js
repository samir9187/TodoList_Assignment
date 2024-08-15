import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authorization header missing or invalid format.");
    return res
      .status(401)
      .json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log("User not found.");
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
export default authMiddleware;
