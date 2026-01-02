const express = require("express");
const router = express.Router();
const {
  linkAttachmentToIssue,
  getAttachmentsForIssue,
  deleteIssueAttachment,
} = require("../controllers/Issue/issueAttachmentController");
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/issue-attachments:
 *   post:
 *     summary: Link an attachment to an issue
 *     description: Link an uploaded attachment to a specific issue using their IDs.
 *     tags:
 *       - Issue Attachments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - issue_id
 *               - attachment_id
 *             properties:
 *               issue_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the issue
 *               attachment_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the attachment
 *     responses:
 *       201:
 *         description: Attachment linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 issue_attachment:
 *                   type: object
 *                   properties:
 *                     issue_attachment_id:
 *                       type: string
 *                     issue_id:
 *                       type: string
 *                     attachment_id:
 *                       type: string
 *       400:
 *         description: Missing issue_id or attachment_id
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, linkAttachmentToIssue);

/**
 * @swagger
 * /api/issue-attachments/{issue_id}:
 *   get:
 *     summary: Get all attachments for an issue
 *     description: Retrieve all attachments linked to a specific issue
 *     tags:
 *       - Issue Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: issue_id
 *         in: path
 *         required: true
 *         description: ID of the issue
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of attachments linked to the issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 attachments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       issue_attachment_id:
 *                         type: string
 *                       attachment:
 *                         type: object
 *                         properties:
 *                           attachment_id:
 *                             type: string
 *                           file_name:
 *                             type: string
 *                           file_path:
 *                             type: string
 *                           uploaded_by:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Missing or invalid issue_id
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:issue_id", authenticateToken, getAttachmentsForIssue);

/**
 * @swagger
 * /api/issue-attachments/{issue_attachment_id}:
 *   delete:
 *     summary: Delete a linked attachment from an issue
 *     description: Delete a specific attachment linked to an issue using `issue_attachment_id`.
 *     tags:
 *       - Issue Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: issue_attachment_id
 *         in: path
 *         required: true
 *         description: ID of the issue-attachment link
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Issue attachment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing or invalid issue_attachment_id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: IssueAttachment not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:issue_attachment_id",
  authenticateToken,
  deleteIssueAttachment
);

module.exports = router;
