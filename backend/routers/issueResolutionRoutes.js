const express = require("express");
const router = express.Router();
const controller = require("../controllers/Issue/issueResolutionController");
const {
  validateResolveIssue,
} = require("../validators/issueResolutionValidator");

/**
 * @swagger
 * tags:
 *   name: Issue Resolutions
 *   description: Manage issue resolutions, attachments, and resolution history
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueResolution:
 *       type: object
 *       properties:
 *         resolution_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *         resolved_by:
 *           type: string
 *           format: uuid
 *         resolved_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CreateResolutionRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - resolved_by
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *         resolved_by:
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
 * /api/issue-resolutions:
 *   post:
 *     summary: Resolve an issue
 *     tags: [Issue Resolutions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResolutionRequest'
 *     responses:
 *       201:
 *         description: Issue resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResolution'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", validateResolveIssue, controller.resolveIssue);

/**
 * @swagger
 * /api/issue-resolutions/issue/{issue_id}:
 *   get:
 *     summary: Get all resolutions for an issue
 *     tags: [Issue Resolutions]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: List of resolutions
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/issue/:issue_id", controller.getResolutionsByIssueId);

/**
 * @swagger
 * /api/issue-resolutions/id/{resolution_id}:
 *   get:
 *     summary: Get resolution details by ID
 *     tags: [Issue Resolutions]
 *     parameters:
 *       - in: path
 *         name: resolution_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Resolution details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/id/:resolution_id", controller.getResolutionById);

/**
 * @swagger
 * /api/issue-resolutions/latest/{issue_id}:
 *   get:
 *     summary: Get latest resolution for an issue
 *     tags: [Issue Resolutions]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Latest resolution
 *       404:
 *         description: No resolution found
 *       500:
 *         description: Internal Error
 */
router.get("/latest/:issue_id", controller.getLatestResolutionByIssueId);

/**
 * @swagger
 * /api/issue-resolutions/id/{resolution_id}:
 *   delete:
 *     summary: Delete a resolution
 *     tags: [Issue Resolutions]
 *     parameters:
 *       - in: path
 *         name: resolution_id
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
router.delete("/id/:resolution_id", controller.deleteResolution);

module.exports = router;
