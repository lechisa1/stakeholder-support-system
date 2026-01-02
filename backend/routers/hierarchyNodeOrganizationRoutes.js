const express = require("express");
const router = express.Router();
const hierarchyNodeOrganizationController = require("../controllers/hierarchyNodeOrganizationController");
const {
  validateHierarchyNodeOrganization,
  validateHierarchyNodeOrganizationId,
} = require("../validators/hierarchyNodeOrganizationValidator");

/**
 * @swagger
 * components:
 *   schemas:
 *     HierarchyNodeOrganization:
 *       type: object
 *       required:
 *         - hierarchy_node_id
 *         - institute_id
 *       properties:
 *         hierarchy_node_organization_id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the hierarchy node organization association
 *         hierarchy_node_id:
 *           type: string
 *           format: uuid
 *           description: ID of the hierarchy node
 *         institute_id:
 *           type: string
 *           format: uuid
 *           description: ID of the institute
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
 *           nullable: true
 *         hierarchyNode:
 *           $ref: '#/components/schemas/HierarchyNode'
 *         institute:
 *           $ref: '#/components/schemas/Institute'
 */

/**
 * @swagger
 * tags:
 *   - name: HierarchyNodeOrganizations
 *     description: API endpoints for managing hierarchy node - institute associations
 */

/**
 * @swagger
 * /api/hierarchy-node-organizations:
 *   post:
 *     summary: Create a new hierarchy node organization association
 *     tags: [HierarchyNodeOrganizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HierarchyNodeOrganization'
 *     responses:
 *       201:
 *         description: Hierarchy node organization association created successfully
 *       400:
 *         description: Validation error or duplicate association
 *       404:
 *         description: Hierarchy node or institute not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  validateHierarchyNodeOrganization,
  hierarchyNodeOrganizationController.createHierarchyNodeOrganization
);

/**
 * @swagger
 * /api/hierarchy-node-organizations:
 *   get:
 *     summary: Get all hierarchy node organization associations
 *     tags: [HierarchyNodeOrganizations]
 *     responses:
 *       200:
 *         description: List of hierarchy node organization associations
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  hierarchyNodeOrganizationController.getHierarchyNodeOrganizations
);

/**
 * @swagger
 * /api/hierarchy-node-organizations/{id}:
 *   get:
 *     summary: Get a hierarchy node organization association by ID
 *     tags: [HierarchyNodeOrganizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hierarchy node organization association ID
 *     responses:
 *       200:
 *         description: Hierarchy node organization association details
 *       404:
 *         description: Association not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  validateHierarchyNodeOrganizationId,
  hierarchyNodeOrganizationController.getHierarchyNodeOrganizationById
);

/**
 * @swagger
 * /api/hierarchy-node-organizations/{id}:
 *   put:
 *     summary: Update a hierarchy node organization association
 *     tags: [HierarchyNodeOrganizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hierarchy node organization association ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HierarchyNodeOrganization'
 *     responses:
 *       200:
 *         description: Hierarchy node organization association updated successfully
 *       400:
 *         description: Validation error or duplicate association
 *       404:
 *         description: Association, hierarchy node, or institute not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  validateHierarchyNodeOrganizationId,
  validateHierarchyNodeOrganization,
  hierarchyNodeOrganizationController.updateHierarchyNodeOrganization
);

/**
 * @swagger
 * /api/hierarchy-node-organizations/{id}:
 *   delete:
 *     summary: Delete a hierarchy node organization association
 *     tags: [HierarchyNodeOrganizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hierarchy node organization association ID
 *     responses:
 *       200:
 *         description: Hierarchy node organization association deleted successfully
 *       404:
 *         description: Association not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  validateHierarchyNodeOrganizationId,
  hierarchyNodeOrganizationController.deleteHierarchyNodeOrganization
);

module.exports = router;
