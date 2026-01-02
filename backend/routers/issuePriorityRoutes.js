const express = require("express");
const router = express.Router();
const controller = require("../controllers/issuePriorityController");
/**
 * @swagger
 * tags:
 *   name: Issue Priorities
 *   description: Manage issue priorities (CRUD operations)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssuePriority:
 *       type: object
 *       properties:
 *         priority_id:
 *           type: string
 *           format: uuid
 *           example: "3b4f98cd-4d8e-4f93-a132-445a0b0d834b"
 *         name:
 *           type: string
 *           example: "High"
 *         description:
 *           type: string
 *           example: "Issues that require immediate attention and quick resolution"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/issue-priorities:
 *   post:
 *     summary: Create a new issue priority
 *     tags: [Issue Priorities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Critical"
 *               description:
 *                 type: string
 *                 example: "System-wide issues that must be addressed immediately"
 *     responses:
 *       201:
 *         description: Priority created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssuePriority'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-priorities:
 *   get:
 *     summary: Get all issue priorities
 *     tags: [Issue Priorities]
 *     responses:
 *       200:
 *         description: List of issue priorities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IssuePriority'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-priorities/{id}:
 *   get:
 *     summary: Get issue priority by ID
 *     tags: [Issue Priorities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The priority UUID
 *     responses:
 *       200:
 *         description: Priority details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssuePriority'
 *       404:
 *         description: Priority not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-priorities/{id}:
 *   put:
 *     summary: Update issue priority
 *     tags: [Issue Priorities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Priority"
 *               description:
 *                 type: string
 *                 example: "Updated description for this priority level"
 *     responses:
 *       200:
 *         description: Priority updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssuePriority'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Priority not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-priorities/{id}:
 *   delete:
 *     summary: Delete issue priority
 *     tags: [Issue Priorities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Priority deleted successfully
 *       404:
 *         description: Priority not found
 *       500:
 *         description: Internal Server Error
 */

router.post("/", controller.createPriority);
router.get("/", controller.getAllPriorities);
router.get("/:id", controller.getPriorityById);
router.put("/:id", controller.updatePriority);
router.delete("/:id", controller.deletePriority);

module.exports = router;