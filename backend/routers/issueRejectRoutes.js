const express = require("express");
const router = express.Router();
const controller = require("../controllers/Issue/issueRejectController");

const { validateRejectIssue } = require("../validators/issueRejectValidator");

/**
 * @swagger
 * tags:
 *   name: Issue Rejects
 *   description: Manage issue rejection operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueReject:
 *       type: object
 *       properties:
 *         reject_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *         rejected_by:
 *           type: string
 *           format: uuid
 *         rejected_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     CreateRejectRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - rejected_by
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *         rejected_by:
 *           type: string
 *           format: uuid
 *         attachment_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 */

/**
 * @swagger
 * /api/issue-rejects:
 *   post:
 *     summary: Reject an issue
 *     tags: [Issue Rejects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRejectRequest'
 *     responses:
 *       201:
 *         description: Issue rejected successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", validateRejectIssue, controller.rejectIssue);

/**
 * @swagger
 * /api/issue-rejects/issue/{issue_id}:
 *   get:
 *     summary: Get all rejects for an issue
 *     tags: [Issue Rejects]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of rejects
 *       500:
 *         description: Internal Error
 */
router.get("/issue/:issue_id", controller.getRejectsByIssueId);

/**
 * @swagger
 * /api/issue-rejects/id/{reject_id}:
 *   get:
 *     summary: Get reject details by ID
 *     tags: [Issue Rejects]
 *     parameters:
 *       - in: path
 *         name: reject_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reject details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/id/:reject_id", controller.getRejectById);

/**
 * @swagger
 * /api/issue-rejects/latest/{issue_id}:
 *   get:
 *     summary: Get latest reject for an issue
 *     tags: [Issue Rejects]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Latest reject
 *       404:
 *         description: No reject found
 *       500:
 *         description: Internal Error
 */
router.get("/latest/:issue_id", controller.getLatestRejectByIssueId);

/**
 * @swagger
 * /api/issue-rejects/id/{reject_id}:
 *   delete:
 *     summary: Delete a reject
 *     tags: [Issue Rejects]
 *     parameters:
 *       - in: path
 *         name: reject_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.delete("/id/:reject_id", controller.deleteReject);

module.exports = router;
