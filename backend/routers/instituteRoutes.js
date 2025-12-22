const express = require("express");
const router = express.Router();
const instituteController = require("../controllers/instituteController");
const {
  validateCreateInstitute,
  validateUpdateInstitute,
  validateInstituteId,
} = require("../validators/instituteValidator"); // Joi-based validators
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Institute:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         institute_id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the institute
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Name of the institute
 *         description:
 *           type: string
 *           description: Description of the institute
 *         has_branch:
 *           type: boolean
 *           default: false
 *           description: Whether the institute has branches
 *         is_active:
 *           type: boolean
 *           default: true
 *           description: Whether the institute is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         deleted_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/institutes:
 *   post:
 *     summary: Create a new institute
 *     tags: [Institutes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institute'
 *     responses:
 *       201:
 *         description: Institute created successfully
 *       400:
 *         description: Bad request - validation error or institute already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticateToken,
  validateCreateInstitute,
  instituteController.createInstitute
);

/**
 * @swagger
 * /api/institutes:
 *   get:
 *     summary: Get all institutes
 *     tags: [Institutes]
 *     responses:
 *       200:
 *         description: List of institutes
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateToken, instituteController.getInstitutes);

/**
 * @swagger
 * /api/institutes/{id}:
 *   get:
 *     summary: Get institute by ID
 *     tags: [Institutes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Institute details
 *       404:
 *         description: Institute not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticateToken,
  validateInstituteId,
  instituteController.getInstituteById
);

/**
 * @swagger
 * /api/institutes/{id}:
 *   put:
 *     summary: Update institute
 *     tags: [Institutes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institute'
 *     responses:
 *       200:
 *         description: Institute updated successfully
 *       404:
 *         description: Institute not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticateToken,
  validateUpdateInstitute,
  validateInstituteId,
  instituteController.updateInstitute
);

/**
 * @swagger
 * /api/institutes/{id}:
 *   delete:
 *     summary: Delete institute
 *     tags: [Institutes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Institute deleted successfully
 *       404:
 *         description: Institute not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticateToken,
  validateInstituteId,
  instituteController.deleteInstitute
);

module.exports = router;
