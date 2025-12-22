const express = require("express");
const router = express.Router();
const {
  createGuideline,
  getAllGuidelines,
  updateGuideline,
  deleteGuideline,
} = require("../controllers/issueReportingGuidelineController");
const {
  createGuidelineValidator,
} = require("../validators/issueGuidelineValidator");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Routes
router.post("/",authenticateToken, createGuidelineValidator, createGuideline);
router.get("/", authenticateToken,getAllGuidelines);
router.put("/:id", authenticateToken,createGuidelineValidator, updateGuideline);
router.delete("/:id", authenticateToken,deleteGuideline);

module.exports = router;
