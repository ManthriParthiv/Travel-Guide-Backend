const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// 📌 Register a New User
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("name", "Name must be at least 5 characters").isLength({ min: 5 }),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, location } = req.body;

    try {
      // 🚫 Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }

      // 🔐 Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.create({ name, email, password: hashedPassword, location });

      res.json({ success: true, message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// 🔑 Login a User
router.post(
  "/loginuser",
  [
    body("email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ success: false, message: "Invalid credentials" });

      // 🔐 Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ success: false, message: "Invalid credentials" });

      // 🪪 Generate JWT token
      const payload = { userId: user._id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      res.json({ success: true, token, user: { name: user.name, email: user.email, location: user.location } });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

module.exports = router;
