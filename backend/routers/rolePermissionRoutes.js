const express = require("express");
const router = express.Router();
const {
  assignPermissionsToRole,
  getRolePermissions,
  updateRolePermission,
  removePermissionFromRole,
} = require("../controllers/rolePermissionController");

router.post("/", assignPermissionsToRole);          // Assign permissions to role
router.get("/", getRolePermissions);                // Get all role-permissions
router.patch("/", updateRolePermission);            // Update a role-permission (e.g., is_active)
router.delete("/:role_permission_id", removePermissionFromRole); // Remove permission from role

module.exports = router;
