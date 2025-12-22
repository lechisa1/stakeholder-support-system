const express = require("express");
const router = express.Router();
const instituteProjectController = require("../controllers/instituteProjectController");
const {
  validateInstituteProject,
  validateInstituteProjectId,
} = require("../validators/instituteProjectValidator");

/**
 * @swagger
 * components:
 *   schemas:
 *     InstituteProject:
 *       type: object
 *       required:
 *         - institute_id
 *         - project_id
 *       properties:
 *         institute_project_id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the institute-project association
 *         institute_id:
 *           type: string
 *           format: uuid
 *           description: ID of the associated institute
 *         project_id:
 *           type: string
 *           format: uuid
 *           description: ID of the associated project
 *         is_active:
 *           type: boolean
 *           default: true
 *           description: Whether the association is active
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
 * /api/institute-projects:
 *   post:
 *     summary: Create a new institute-project association
 *     description: Creates an association between an institute and a project
 *     tags: [Institute Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstituteProject'
 *     responses:
 *       201:
 *         description: Association created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstituteProject'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Institute or project not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  validateInstituteProject,
  instituteProjectController.createInstituteProject
);

/**
 * @swagger
 * /api/institute-projects:
 *   get:
 *     summary: Get all institute-project associations
 *     description: Retrieves all institute-project associations
 *     tags: [Institute Projects]
 *     responses:
 *       200:
 *         description: List of institute-project associations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InstituteProject'
 *       500:
 *         description: Internal server error
 */
router.get("/", instituteProjectController.getInstituteProjects);

/**
 * @swagger
 * /api/institute-projects/{id}:
 *   get:
 *     summary: Get institute-project association by ID
 *     description: Retrieves a specific institute-project association by its ID
 *     tags: [Institute Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Institute-Project association ID
 *     responses:
 *       200:
 *         description: Association details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstituteProject'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Association not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  validateInstituteProjectId,
  instituteProjectController.getInstituteProjectById
);

/**
 * @swagger
 * /api/institute-projects/{id}:
 *   put:
 *     summary: Update institute-project association
 *     description: Updates an existing institute-project association
 *     tags: [Institute Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Institute-Project association ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstituteProject'
 *     responses:
 *       200:
 *         description: Association updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstituteProject'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Association not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  validateInstituteProjectId,
  validateInstituteProject,
  instituteProjectController.updateInstituteProject
);

/**
 * @swagger
 * /api/institute-projects/{id}:
 *   delete:
 *     summary: Delete institute-project association
 *     description: Deletes an institute-project association (soft delete)
 *     tags: [Institute Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Institute-Project association ID
 *     responses:
 *       200:
 *         description: Association deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Association not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  validateInstituteProjectId,
  instituteProjectController.deleteInstituteProject
);

module.exports = router;
