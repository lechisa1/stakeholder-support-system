const express = require("express");
const router = express.Router();
const controller = require("../controllers/Issue/issueAssignmentController");
const {
  validateAssignIssue,
  validateUpdateAssignmentStatus,
  validateAssignmentId,
  validateIssueId,
  validateUserId,
  validateRemoveAssignment,
  validateRemoveAssignmentByAssignee,
} = require("../validators/issueAssignmentValidator");
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Issue Assignments
 *   description: Manage issue assignments, attachments, and assignment history
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueAssignment:
 *       type: object
 *       properties:
 *         assignment_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *         assignee_id:
 *           type: string
 *           format: uuid
 *         assigned_by:
 *           type: string
 *           format: uuid
 *         assigned_at:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, completed]
 *         remarks:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CreateAssignmentRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - assignee_id
 *         - assigned_by
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         assignee_id:
 *           type: string
 *           format: uuid
 *         assigned_by:
 *           type: string
 *           format: uuid
 *         remarks:
 *           type: string
 *         attachment_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *
 *     UpdateAssignmentStatusRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, completed]
 *         remarks:
 *           type: string
 */

/**
 * @swagger
 * /api/issue-assignments:
 *   post:
 *     summary: Assign an issue to a user
 *     tags: [Issue Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssignmentRequest'
 *     responses:
 *       201:
 *         description: Issue assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueAssignment'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", validateAssignIssue, controller.assignIssue);
/**
 * @swagger
 * /api/assignments/issue/{issue_id}/assignee/{assignee_id}:
 *   delete:
 *     summary: Remove assignment by issue and assignee
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *       - in: path
 *         name: assignee_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveAssignmentRequest'
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *       404:
 *         description: Assignment, issue, or user not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
  "/issue/:issue_id/assignee/:assignee_id",
  authenticateToken,
  validateRemoveAssignmentByAssignee,
  controller.removeAssignmentByAssigneeAndIssue
);
/**
 * @swagger
 * /api/issue-assignments/{assignment_id}:
 *   delete:
 *     summary: Remove an assignment
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: assignment_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveAssignmentRequest'
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
  "/:assignment_id",
  authenticateToken,
  validateAssignmentId,
  validateRemoveAssignment,
  controller.removeAssignment
);

/**
 * @swagger
 * /api/issue-assignments/issue/{issue_id}:
 *   get:
 *     summary: Get all assignments for an issue
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: List of assignments for the issue
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/issue/:issue_id",
  validateIssueId,
  controller.getAssignmentsByIssueId
);

/**
 * @swagger
 * /api/issue-assignments/{assignment_id}:
 *   put:
 *     summary: Update assignment status
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: assignment_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAssignmentStatusRequest'
 *     responses:
 *       200:
 *         description: Assignment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueAssignment'
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
  "/:assignment_id",
  validateAssignmentId,
  validateUpdateAssignmentStatus,
  controller.updateAssignmentStatus
);

/**
 * @swagger
 * /api/issue-assignments/{assignment_id}:
 *   get:
 *     summary: Get assignment details by ID
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: assignment_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/:assignment_id",
  validateAssignmentId,
  controller.getAssignmentById
);

/**
 * @swagger
 * /api/issue-assignments/latest/issue/{issue_id}:
 *   get:
 *     summary: Get latest assignment for an issue
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Latest assignment for the issue
 *       404:
 *         description: No assignment found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/latest/issue/:issue_id",
  validateIssueId,
  controller.getLatestAssignmentByIssueId
);

/**
 * @swagger
 * /api/issue-assignments/user/{user_id}:
 *   get:
 *     summary: Get all assignments for a user (as assignee)
 *     tags: [Issue Assignments]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: List of assignments for the user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/user/:user_id", validateUserId, controller.getAssignmentsByUserId);

module.exports = router;
