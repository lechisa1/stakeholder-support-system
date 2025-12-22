const express = require("express");
const router = express.Router();

const {
  getIssues,
  escalateIssue,
  resolveIssue,
  acceptIssue,
  getIssuesByHierarchy,
  getMyAssignedIssues,
  getMyCreatedIssues,
} = require("../controllers/issueFlowController");
const { authenticateToken } = require("../middlewares/authMiddleware");
/**
 * @swagger
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       properties:
 *         issue_id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, escalated, resolved, assigned_committee]
 *         created_by:
 *           type: string
 *         assigned_to:
 *           type: string
 *         hierarchy_node_id:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: IssueFlow
 *   description: Issue flow management (created, assigned, hierarchy-based)
 */

/**
 * @swagger
 * /api/issue-flow/my-created:
 *   get:
 *     summary: Get issues created by the logged-in user
 *     tags: [IssueFlow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of issues created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Issue'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issue-flow/my-assigned:
 *   get:
 *     summary: Get issues assigned to the logged-in user
 *     tags: [IssueFlow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned issues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Issue'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issue-flow/hierarchy/{node_id}:
 *   get:
 *     summary: Get issues under a hierarchy node (including child tiers)
 *     tags: [IssueFlow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: node_id
 *         required: true
 *         description: ID of the hierarchy node
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Issues under the hierarchy node
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Issue'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hierarchy node not found
 *       500:
 *         description: Internal server error
 */

router.get("/my-created", authenticateToken, getMyCreatedIssues);

router.get("/my-assigned", authenticateToken, getMyAssignedIssues);

router.get("/hierarchy/:node_id", authenticateToken, getIssuesByHierarchy);
/**
 * @swagger
 * tags:
 *   name: IssueFlow
 *   description: Endpoints for issue handling, assignment, escalation, hierarchy filtering
 */

module.exports = router;
