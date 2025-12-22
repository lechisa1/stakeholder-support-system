const express = require("express");
const router = express.Router();
const issueController = require("../controllers/Issue/issueController");
const {
  validateCreateIssue,
  validateUpdateIssue,
  validateGetIssuesQuery,
  validateIssueIdParam,
  validateHierarchyNodeIdParam,
} = require("../validators/issueValidator");
const { authenticateToken } = require("../middlewares/authMiddleware");
/**
 * @swagger
 * tags:
 *   name: Issues
 *   description: Issue management endpoints
 */

/**
 * @swagger
 * /api/issues:
 *   post:
 *     summary: Create a new issue
 *     tags: [Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project_id
 *               - issue_category_id
 *               - priority_id
 *               - reported_by
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               project_id:
 *                 type: string
 *                 format: uuid
 *               issue_category_id:
 *                 type: string
 *                 format: uuid
 *               priority_id:
 *                 type: string
 *                 format: uuid
 *               reported_by:
 *                 type: string
 *                 format: uuid
 *               current_tier:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  authenticateToken,
  validateCreateIssue,
  issueController.createIssue
);

router.post(
  "/accept",
  authenticateToken,

  issueController.acceptIssue
);

router.post(
  "/confirm",
  authenticateToken,

  issueController.confirmIssueResolved
);
/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Get all issues
 *     tags: [Issues]
 *     responses:
 *       200:
 *         description: List of issues
 */
router.get("/", validateGetIssuesQuery, issueController.getIssues);
router.get("/assigned/:user_id", issueController.getAssignedIssues);

router.get(
  "/user/:id",
  validateIssueIdParam,
  issueController.getIssuesByUserId
);

/**
 * @swagger
 * /api/issues/{id}:
 *   get:
 *     summary: Get issue by ID
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue data
 *       404:
 *         description: Issue not found
 */
router.get(
  "/:id",
  authenticateToken,
  validateIssueIdParam,
  issueController.getIssueById
);

// getIssueByTicketingNumber

router.get("/ticket/:ticket_number", issueController.getIssueByTicketingNumber);

/**
 * @swagger
 * /api/issues/{id}:
 *   put:
 *     summary: Update an issue
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               current_tier:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Issue updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Issue not found
 */
router.put(
  "/:id",
  authenticateToken,
  validateIssueIdParam,
  validateUpdateIssue,
  issueController.updateIssue
);

/**
 * @swagger
 * /api/issues/{id}:
 *   delete:
 *     summary: Delete an issue
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue deleted
 *       404:
 *         description: Issue not found
 */

/**
 * @swagger
 * /api/issues/by-hnode/{hierarchy_node_id}:
 *   get:
 *     summary: Get issues by hierarchy_node_id
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: hierarchy_node_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hierarchy Node ID
 *     responses:
 *       200:
 *         description: Issues for the given hierarchy node
 *       404:
 *         description: No issues found
 */

router.get(
  "/issues/hierarchy/:hierarchy_node_id/project/:project_id",
  validateHierarchyNodeIdParam,
  issueController.getIssuesByHierarchyNodeId
);
// Change from query to URL parameter
router.get(
  "/issues-by-pairs/:pairs/user/:user_id",
  issueController.getIssuesByMultipleHierarchyNodes
);

router.delete("/:id", validateIssueIdParam, issueController.deleteIssue);

/**
 * @swagger
 * /api/issues/escalated/null-tier:
 *   get:
 *     summary: Get all escalated issues where to_tier is null
 *     tags: [Issues]
 *     description: Returns issues that have been escalated but have no specified target tier (to_tier = null).
 *     responses:
 *       200:
 *         description: List of escalated issues with null to_tier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get(
  "/escalated/null-tier",
  authenticateToken,
  issueController.getEscalatedIssuesWithNullTier
);

module.exports = router;
