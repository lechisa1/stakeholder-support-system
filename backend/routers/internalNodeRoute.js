const express = require("express");
const router = express.Router();
const internalNodeController = require("../controllers/internalNodeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  validateCreateInternalNode,
  validateInternalNodeId,
  validateUpdateInternalNode,
} = require("../validators/internalNodeValidator");

/**
 * @swagger
 * components:
 *   schemas:
 *     InternalNode:
 *       type: object
 *       properties:
 *         internal_node_id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the internal node
 *         parent_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: UUID of the parent node (optional)
 *         name:
 *           type: string
 *           example: Department A
 *         description:
 *           type: string
 *           example: This is the internal node
 *         level:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           default: true
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
 * tags:
 *   - name: Internal Nodes
 *     description: API endpoints for managing internal nodes
 */

// Create a new internal node
router.post(
  "/",
  authenticateToken,
  validateCreateInternalNode,
  internalNodeController.createInternalNode
);

// Get all internal nodes
router.get("/", authenticateToken, internalNodeController.getInternalNodes);

// Get top-level (parent) internal nodes
router.get(
  "/parent-nodes",
  authenticateToken,
  internalNodeController.getParentInternalNodes
);

// Get internal nodes assigned to users for a specific project
router.get(
  "/project/:project_id/user-nodes",
  authenticateToken,
  internalNodeController.getUserInternalNodesByProject
);

// Get full internal tree
router.get("/tree", authenticateToken, internalNodeController.getInternalTree);

// Get internal node by ID
router.get(
  "/:id",
  authenticateToken,
  validateInternalNodeId,
  internalNodeController.getInternalNodeById
);

// Update internal node by ID
router.put(
  "/:id",
  authenticateToken,
  validateInternalNodeId,
  validateUpdateInternalNode,
  internalNodeController.updateInternalNode
);

// Delete internal node by ID
router.delete(
  "/:id",
  authenticateToken,
  validateInternalNodeId,
  internalNodeController.deleteInternalNode
);

module.exports = router;
