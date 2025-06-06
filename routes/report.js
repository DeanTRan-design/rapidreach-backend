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

// GET - View reports (based on user role)
router.get("/", verifyToken, async (req, res) => {
  try {
    let reports;

    if (req.user.accessLevel === "2") {
      // Responders see all reports
      reports = await Report.find().sort({ createdAt: -1 });
    } else {
      // Patients see only their own reports
      reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    return res.json(reports);
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    return res.status(500).json({ message: "Could not fetch reports", error: err });
  }
});

// GET - Get all reports for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    // Only get reports created by this user
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(reports);
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    return res.status(500).json({ message: "Could not fetch reports", error: err });
  }
});

module.exports = router;