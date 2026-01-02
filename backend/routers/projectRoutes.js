const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
} = require("../validators/projectValidator");

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         project_id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the project
 *         name:
 *           type: string
 *           example: Project A
 *         description:
 *           type: string
 *           example: Description of project
 *         is_active:
 *           type: boolean
 *           default: true
 *         institutes:
 *           type: array
 *           items:
 *             type: object
 *         hierarchies:
 *           type: array
 *           items:
 *             type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     AssignUserToProject:
 *       type: object
 *       required:
 *         - project_id
 *         - user_id
 *         - role_id
 *       properties:
 *         project_id:
 *           type: string
 *           format: uuid
 *           example: "1d9a8217-7e63-4a9d-b62f-0b82f20f5456"
 *         user_id:
 *           type: string
 *           format: uuid
 *           example: "5b0f7b23-67c3-40d4-b3e5-47b1e3b7a90d"
 *         role_id:
 *           type: string
 *           format: uuid
 *           example: "38b4a1a0-f7f9-45b1-bc90-d3b6ef7c9f81"
 *         sub_role_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "7b2c9d28-6c87-4c81-9f3a-c2b0df67d91a"
 */

/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: API endpoints for managing projects
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authenticateToken,
  validateCreateProject,
  projectController.createProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", authenticateToken, projectController.getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get(
  "/:id",
  authenticateToken,
  validateProjectId,
  projectController.getProjectById
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 */
router.put(
  "/:id",
  authenticateToken,
  validateProjectId,
  validateUpdateProject,
  projectController.updateProject
);

router.put(
  "/projects/:project_id/maintenance",
  projectController.updateProjectMaintenance
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/assign-user:
 *   post:
 *     summary: Assign a user to a project with a role (and optional sub-role)
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - user_id
 *               - role_id
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the project
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to assign
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 description: Role ID for the user in the project
 *               sub_role_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional sub-role ID
 *     responses:
 *       201:
 *         description: User assigned successfully
 *       400:
 *         description: Validation error or user already assigned
 *       404:
 *         description: Project, user, or role not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/assign-user",
  authenticateToken,
  projectController.assignUserToProject
);

/**
 * @swagger
 * /api/projects/assign-internal-user:
 *   post:
 *     summary: Assign an internal user to a project with a role and optional internal node
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - user_id
 *               - role_id
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *                 description: The project ID
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: The user ID
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 description: The role ID
 *               internal_node_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Optional internal node ID
 *     responses:
 *       201:
 *         description: Internal user assigned successfully
 *       400:
 *         description: Validation or duplicate assignment error
 *       404:
 *         description: Project, user, or role not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/assign-internal-user",
  authenticateToken,
  projectController.assignInternalUsersToProject
);

router.delete(
  "/:id",
  authenticateToken,
  validateProjectId,
  projectController.deleteProject
);

/**
 * @swagger
 * /api/projects/assign-user:
 *   post:
 *     summary: Assign a user to a project with a role (and optional sub-role)
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignUserToProject'
 *     responses:
 *       201:
 *         description: User assigned to project successfully
 *       400:
 *         description: Validation or duplicate assignment error
 *       404:
 *         description: Project, user, or role not found
 */
router.post(
  "/assign-user",
  authenticateToken,
  projectController.assignUserToProject
);

// ------------------------ REMOVE USER FROM PROJECT ------------------------
/**
 * @swagger
 * /api/projects/remove-user:
 *   post:
 *     summary: Remove a user from a project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_id, user_id]
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User removed successfully
 *       404:
 *         description: User not assigned to project
 */
router.post(
  "/remove-user",
  authenticateToken,
  projectController.removeUserFromProject
);

// ==========================================================================
// ✅ NEW ENDPOINT — GET ALL PROJECTS A USER IS ASSIGNED TO
// ==========================================================================
/**
 * @swagger
 * /api/projects/user/{user_id}:
 *   get:
 *     summary: Get all projects the user is assigned to
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to lookup assigned projects
 *     responses:
 *       200:
 *         description: List of projects assigned to the user
 *       404:
 *         description: No projects found for user
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:user_id",
  authenticateToken,
  projectController.getProjectsAssignedToUser
);

// ==========================================================================
// ✅ NEW ENDPOINT — GET PROJECTS BY INSTITUTE ID
// ==========================================================================

/**
 * @swagger
 * /api/projects/institute/{institute_id}:
 *   get:
 *     summary: Get all projects that belong to an institute
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: institute_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Institute ID
 *     responses:
 *       200:
 *         description: List of projects for the given institute
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       404:
 *         description: No projects found for this institute
 *       500:
 *         description: Internal server error
 */
router.get(
  "/institute/:institute_id",
  authenticateToken,
  projectController.getProjectByInstituteId
);

module.exports = router;
