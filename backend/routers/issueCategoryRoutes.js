const express = require("express");
const router = express.Router();
const controller = require("../controllers/issueCategoryController");
/**
 * @swagger
 * tags:
 *   name: Issue Categories
 *   description: Manage issue categories (CRUD operations)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IssueCategory:
 *       type: object
 *       properties:
 *         category_id:
 *           type: string
 *           format: uuid
 *           example: "6d5a3cfa-6d5e-4d3b-8a2b-4b2e343f5a66"
 *         name:
 *           type: string
 *           example: "Network Issue"
 *         description:
 *           type: string
 *           example: "Issues related to network connectivity or configuration"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/issue-categories:
 *   post:
 *     summary: Create a new issue category
 *     tags: [Issue Categories]
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
 *                 example: "Database Issue"
 *               description:
 *                 type: string
 *                 example: "Problems related to database connection or queries"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueCategory'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-categories:
 *   get:
 *     summary: Get all issue categories
 *     tags: [Issue Categories]
 *     responses:
 *       200:
 *         description: List of issue categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IssueCategory'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-categories/{id}:
 *   get:
 *     summary: Get issue category by ID
 *     tags: [Issue Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category UUID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueCategory'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-categories/{id}:
 *   put:
 *     summary: Update issue category
 *     tags: [Issue Categories]
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
 *                 example: "Updated Category"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueCategory'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/issue-categories/{id}:
 *   delete:
 *     summary: Delete issue category
 *     tags: [Issue Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */

router.post("/", controller.createCategory);
router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);
router.put("/:id", controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

module.exports = router;