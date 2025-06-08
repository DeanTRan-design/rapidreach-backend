const express = require("express");
const router = express.Router();
const Report = require("../models/Report"); // create this model
const jwt = require("jsonwebtoken");

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalid" });
    req.user = decoded;
    next();
  });
}

router.post("/", verifyToken, async (req, res) => {
  console.log("Decoded token:", req.user);
  try {
    const report = new Report({
      userId: req.user._id,
      location: req.body.location,
      category: req.body.category,
      message: req.body.message,
    });

    const saved = await report.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to save report:", err); 
    return res.status(500).json({ message: "Failed to save report", error: err });
  }
});

// GET - View only the current user's own reports (regardless of role)
router.get("/", verifyToken, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(reports);
  } catch (err) {
    console.error("Failed to fetch personal reports:", err);
    return res.status(500).json({ message: "Could not fetch reports", error: err });
  }
});

// GET - View all reports (Responders only)
router.get("/all", verifyToken, async (req, res) => {
  try {
    if (req.user.accessLevel !== 2) {
      // Deny access if the user is not a responder
      return res.status(403).json({ message: "Access denied: only responders can view all reports." });
    }

    const reports = await Report.find().sort({ createdAt: -1 });
    return res.json(reports);
  } catch (err) {
    console.error("Failed to fetch all reports:", err);
    return res.status(500).json({ message: "Could not fetch all reports", error: err });
  }
});

module.exports = router;