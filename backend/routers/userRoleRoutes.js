// routes/userRoleRoutes.js
const express = require("express");
const router = express.Router();
const { assignRolesToUser, removeRoleFromUser } = require("../controllers/userRolesController");

router.post("/assign", assignRolesToUser);
router.post("/remove", removeRoleFromUser);

module.exports = router;
