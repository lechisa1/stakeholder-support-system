
const express = require('express');
const router = express.Router();
const {
  validateCreateRole,
  validateUpdateRole,
} = require("../validators/roleValidator");
const {authenticateToken}=require('../middlewares/authMiddleware')
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getSubRolesByRole,
  getPermissionsByRoleSubRole
} = require('../controllers/roleController');

// Role CRUD routes
router.post('/',authenticateToken,validateCreateRole, createRole);
router.get('/',authenticateToken, getRoles);
router.get('/:id',authenticateToken, getRoleById);
router.put("/:id", authenticateToken, validateUpdateRole,updateRole);
router.delete('/:id',authenticateToken, deleteRole);

// Additional role-related routes
router.get("/:id/sub-roles", authenticateToken,getSubRolesByRole);
router.get(
  "/:roleId/sub-roles/:subRoleId/permissions",
  authenticateToken,getPermissionsByRoleSubRole
);
/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management including sub-roles and permissions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         role_id:
 *           type: string
 *           format: uuid
 *           example: "a8f1d1a2-93e0-4f4a-bc6e-213a5f6f77f3"
 *         name:
 *           type: string
 *           example: "Project Manager"
 *         description:
 *           type: string
 *           example: "Manages project activities and oversees team performance"
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     SubRole:
 *       type: object
 *       properties:
 *         sub_role_id:
 *           type: string
 *           format: uuid
 *           example: "bd45c090-6c35-4d1a-b7f5-5dc6a91e6af3"
 *         name:
 *           type: string
 *           example: "Frontend Developer"
 *         description:
 *           type: string
 *           example: "Responsible for user interface and client-side logic"
 *     Permission:
 *       type: object
 *       properties:
 *         permission_id:
 *           type: string
 *           format: uuid
 *           example: "f52b58b5-1989-4aab-8dc9-5b9c0cf4f8b3"
 *         resource:
 *           type: string
 *           example: "project"
 *         action:
 *           type: string
 *           example: "create"
 *     RoleCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Administrator"
 *         description:
 *           type: string
 *           example: "Full system access and management rights"
 *         sub_roles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sub_role_id:
 *                 type: string
 *                 format: uuid
 *                 example: "bd45c090-6c35-4d1a-b7f5-5dc6a91e6af3"
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                   example: "f52b58b5-1989-4aab-8dc9-5b9c0cf4f8b3"
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role with sub-roles and permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCreateRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error or role already exists
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get all roles with sub-roles and permissions
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of roles
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get a specific role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Successfully retrieved role
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update a specific role, sub-roles, and permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCreateRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Validation error or name conflict
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Soft delete a specific role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Role is in use and cannot be deleted
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/roles/{id}/sub-roles:
 *   get:
 *     summary: Get all sub-roles for a specific role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of sub-roles for the given role
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/roles/{roleId}/sub-roles/{subRoleId}/permissions:
 *   get:
 *     summary: Get all permissions for a specific role-subrole combination
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Role ID
 *       - in: path
 *         name: subRoleId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Sub-role ID
 *     responses:
 *       200:
 *         description: List of permissions for the role-subrole pair
 *       404:
 *         description: Role or sub-role not found
 *       500:
 *         description: Server error
 */

module.exports = router;