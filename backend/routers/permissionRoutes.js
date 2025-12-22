const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

router.get("/", permissionController.getPermissions);
router.put(
  "/activate/:permission_id",
  permissionController.activatePermission
);
router.put(
  "/deactivate/:permission_id",
  permissionController.deactivatePermission
);
router.put("/toggle/:permission_id", permissionController.togglePermission);

module.exports = router;
