// routes/issueResponseTimeRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/issueResponseTimeController");

/**
 * @swagger
 * tags:
 *   name: Issue Response Times
 *   description: Manage issue response times (CRUD operations)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueResponseTime:
 *       type: object
 *       properties:
 *         response_time_id:
 *           type: string
 *           format: uuid
 *           example: "b6a2c1d0-1f34-4d8f-9a0e-0f1e3c2b7a1f"
 *         duration:
 *           type: integer
 *           example: 24
 *         unit:
 *           type: string
 *           enum: [hour, day, month]
 *           example: "hour"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/issue-response-times:
 *   post:
 *     summary: Create a new issue response time
 *     tags: [Issue Response Times]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *               - unit
 *             properties:
 *               duration:
 *                 type: integer
 *                 example: 24
 *               unit:
 *                 type: string
 *                 enum: [hour, day, month]
 *                 example: "hour"
 *     responses:
 *       201:
 *         description: Response time created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponseTime'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-response-times:
 *   get:
 *     summary: Get all issue response times
 *     tags: [Issue Response Times]
 *     responses:
 *       200:
 *         description: List of issue response times
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IssueResponseTime'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-response-times/{id}:
 *   get:
 *     summary: Get an issue response time by ID
 *     tags: [Issue Response Times]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The response time UUID
 *     responses:
 *       200:
 *         description: Response time details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponseTime'
 *       404:
 *         description: Response time not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-response-times/{id}:
 *   put:
 *     summary: Update an issue response time
 *     tags: [Issue Response Times]
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
 *               duration:
 *                 type: integer
 *                 example: 48
 *               unit:
 *                 type: string
 *                 enum: [hour, day, month]
 *                 example: "day"
 *     responses:
 *       200:
 *         description: Response time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponseTime'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Response time not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-response-times/{id}:
 *   delete:
 *     summary: Delete an issue response time
 *     tags: [Issue Response Times]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Response time deleted successfully
 *       404:
 *         description: Response time not found
 *       500:
 *         description: Internal Server Error
 */

router.post("/", controller.createResponseTime);
router.get("/", controller.getAllResponseTimes);
router.get("/:id", controller.getResponseTimeById);
router.put("/:id", controller.updateResponseTime);
router.delete("/:id", controller.deleteResponseTime);

module.exports = router;
