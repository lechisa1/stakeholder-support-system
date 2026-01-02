const express = require("express");
const router = express.Router();
const projectController = require("../controllers/getAssignedProjectController");
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSummary:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         full_name:
 *           type: string
 *         email:
 *           type: string
 *         position:
 *           type: string
 *         phone_number:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *         sub_role:
 *           type: string
 *           nullable: true
 *         hierarchy_node:
 *           type: object
 *           nullable: true
 *           properties:
 *             name:
 *               type: string
 *             level:
 *               type: integer
 *
 *     HierarchyNode:
 *       type: object
 *       properties:
 *         node_id:
 *           type: integer
 *         node_name:
 *           type: string
 *         node_description:
 *           type: string
 *         level:
 *           type: integer
 *         hierarchy:
 *           type: object
 *           nullable: true
 *           properties:
 *             hierarchy_id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         parent:
 *           type: object
 *           nullable: true
 *           properties:
 *             node_id:
 *               type: integer
 *             name:
 *               type: string
 *             level:
 *               type: integer
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HierarchyNodeChild'
 *
 *     HierarchyNodeChild:
 *       type: object
 *       properties:
 *         node_id:
 *           type: integer
 *         name:
 *           type: string
 *         level:
 *           type: integer
 *         assigned_users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserSummary'
 *
 *     HierarchyStructure:
 *       type: object
 *       properties:
 *         node_id:
 *           type: integer
 *         node_name:
 *           type: string
 *         node_description:
 *           type: string
 *         level:
 *           type: integer
 *         hierarchy:
 *           type: object
 *           nullable: true
 *           properties:
 *             hierarchy_id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         parent:
 *           type: object
 *           nullable: true
 *           properties:
 *             node_id:
 *               type: integer
 *             name:
 *               type: string
 *             level:
 *               type: integer
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HierarchyNodeChild'
 *
 *     ProjectAssignment:
 *       type: object
 *       properties:
 *         assignment_id:
 *           type: integer
 *         project:
 *           type: object
 *           properties:
 *             project_id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             is_active:
 *               type: boolean
 *             created_at:
 *               type: string
 *               format: date-time
 *             updated_at:
 *               type: string
 *               format: date-time
 *             institute:
 *               type: object
 *               nullable: true
 *               properties:
 *                 institute_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *             hierarchies:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hierarchy_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *                   nodes:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/HierarchyNode'
 *         role:
 *           type: object
 *           properties:
 *             role_id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         sub_role:
 *           type: object
 *           nullable: true
 *           properties:
 *             sub_role_id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         hierarchy_structure:
 *           $ref: '#/components/schemas/HierarchyStructure'
 *         assignment_details:
 *           type: object
 *           properties:
 *             is_active:
 *               type: boolean
 *             created_at:
 *               type: string
 *               format: date-time
 *             updated_at:
 *               type: string
 *               format: date-time
 *         project_team:
 *           type: object
 *           properties:
 *             total_members:
 *               type: integer
 *             members:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSummary'
 */

/**
 * @swagger
 * /api/flow/my-projects:
 *   get:
 *     summary: Get all projects assigned to the logged-in user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectAssignment'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: No projects assigned
 *       500:
 *         description: Internal server error
 */
router.get(
  "/my-projects",
  authenticateToken,
  projectController.getMyAssignedProjects
);

/**
 * @swagger
 * /api/flow/my-projects/{project_id}:
 *   get:
 *     summary: Get detailed information for a specific project assigned to the user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectAssignment'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Project not found or user not assigned
 *       500:
 *         description: Internal server error
 */
router.get(
  "/my-projects/:project_id",
  authenticateToken,
  projectController.getMyAssignedProjectDetail
);

/**
 * @swagger
 * /api/flow/my-projects/{project_id}/hierarchy:
 *   get:
 *     summary: Get user's hierarchy within a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Project hierarchy structure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: User not assigned to a hierarchy node in this project
 *       500:
 *         description: Internal server error
 */
router.get(
  "/my-projects/:project_id/hierarchy",
  authenticateToken,
  projectController.getMyProjectHierarchy
);

module.exports = router;
