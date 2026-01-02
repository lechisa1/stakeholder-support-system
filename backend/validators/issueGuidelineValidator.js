const { body } = require("express-validator");

exports.createGuidelineValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long."),
  body("description")
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters."),
  body("severity_level")
    .notEmpty()
    .withMessage("Severity level is required.")
    .isIn(["Critical", "High", "Medium", "Low"])
    .withMessage("Invalid severity level."),
];
