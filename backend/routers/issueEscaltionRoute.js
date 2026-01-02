const express = require("express");
const router = express.Router();
const controller = require("../controllers/Issue/issueEscalationController");
const {
  validateEscalateIssue,
} = require("../validators/issueEscalationValidator");

/**
 * @swagger
 * tags:
 *   name: Issue Escalations
 *   description: Manage issue escalations and history
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueEscalation:
 *       type: object
 *       properties:
 *         escalation_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *         from_tier:
 *           type: string
 *         to_tier:
 *           type: string
 *         reason:
 *           type: string
 *         escalated_by:
 *           type: string
 *           format: uuid
 *         escalated_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     IssueEscalationHistory:
 *       type: object
 *       properties:
 *         issue_escalation_history_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *         from_tier:
 *           type: string
 *         to_tier:
 *           type: string
 *         escalated_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     EscalationRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - from_tier
 *         - to_tier
 *         - escalated_by
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         from_tier:
 *           type: string
 *         to_tier:
 *           type: string
 *         reason:
 *           type: string
 *         escalated_by:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /api/issue-escalations:
 *   post:
 *     summary: Escalate an issue to a higher tier
 *     tags: [Issue Escalations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EscalationRequest'
 *     responses:
 *       201:
 *         description: Issue escalated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueEscalation'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Issue or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", validateEscalateIssue, controller.escalateIssue);

/**
 * @swagger
 * /api/issue-escalations/issue/{issue_id}:
 *   get:
 *     summary: Get all escalations for a specific issue
 *     tags: [Issue Escalations]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: List of escalations
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/issue/:issue_id", controller.getEscalationsByIssueId);

/**
 * @swagger
 * /api/issue-escalations/history/{issue_id}:
 *   get:
 *     summary: Get escalation history for a specific issue
 *     tags: [Issue Escalations]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Escalation history
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/history/:issue_id", controller.getEscalationHistoryByIssueId);

/**
 * @swagger
 * /api/issue-escalations/id/{escalation_id}:
 *   get:
 *     summary: Get escalation details by ID
 *     tags: [Issue Escalations]
 *     parameters:
 *       - in: path
 *         name: escalation_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Escalation details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/id/:escalation_id", controller.getEscalationById);

/**
 * @swagger
 * /api/issue-escalations/id/{escalation_id}:
 *   delete:
 *     summary: Delete escalation record
 *     tags: [Issue Escalations]
 *     parameters:
 *       - in: path
 *         name: escalation_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.delete("/id/:escalation_id", controller.deleteEscalation);

module.exports = router;
