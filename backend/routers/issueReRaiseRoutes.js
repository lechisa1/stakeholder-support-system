const express = require("express");
const router = express.Router();
const controller = require("../controllers/Issue/issueReRaiseController");

const { validateReRaiseIssue } = require("../validators/issueReRaiseValidator");

/**
 * @swagger
 * tags:
 *   name: Issue Re-Raises
 *   description: Manage issue re-raise operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueReRaise:
 *       type: object
 *       properties:
 *         re_raise_id:
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
 *
 *     CreateReRaiseRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - re_raised_by
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *         re_raised_by:
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
 * /api/issue-re-raises:
 *   post:
 *     summary: Re-raise an issue
 *     tags: [Issue Re-Raises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReRaiseRequest'
 *     responses:
 *       201:
 *         description: Issue re-raised successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", validateReRaiseIssue, controller.reRaiseIssue);

/**
 * @swagger
 * /api/issue-re-raises/issue/{issue_id}:
 *   get:
 *     summary: Get all re-raises for an issue
 *     tags: [Issue Re-Raises]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of re-raises
 *       500:
 *         description: Internal Error
 */
router.get("/issue/:issue_id", controller.getReRaisesByIssueId);

/**
 * @swagger
 * /api/issue-re-raises/id/{re_raise_id}:
 *   get:
 *     summary: Get re-raise details by ID
 *     tags: [Issue Re-Raises]
 *     parameters:
 *       - in: path
 *         name: re_raise_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Re-raise details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Error
 */
router.get("/id/:re_raise_id", controller.getReRaiseById);

/**
 * @swagger
 * /api/issue-re-raises/latest/{issue_id}:
 *   get:
 *     summary: Get latest re-raise for an issue
 *     tags: [Issue Re-Raises]
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Latest re-raise
 *       404:
 *         description: No re-raise found
 *       500:
 *         description: Internal Error
 */
router.get("/latest/:issue_id", controller.getLatestReRaiseByIssueId);

/**
 * @swagger
 * /api/issue-re-raises/id/{re_raise_id}:
 *   delete:
 *     summary: Delete a re-raise
 *     tags: [Issue Re-Raises]
 *     parameters:
 *       - in: path
 *         name: re_raise_id
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
router.delete("/id/:re_raise_id", controller.deleteReRaise);

module.exports = router;
