const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middlewares/authMiddleware");

const {
  createProjectMetric,
  getProjectMetrics,
  getProjectMetricById,
  updateProjectMetric,
  deleteProjectMetric,
  assignMetricsToUser,
  assignMetricsToProject,
  removeMetricsFromUser,
  removeMetricsFromProject,
  getUserMetrics,
  getProjectProjectMetrics,
  updateUserMetricValue,
  getUsersByMetricId,
} = require("../controllers/projectMetricController");

const {
  validateCreateProjectMetric,
  validateUpdateProjectMetric,
  validateAssignMetricsToUser,
  validateAssignMetricsToProject,
  validateRemoveMetrics,
  validateUpdateUserMetricValue,
  validateUUIDParam,
  validateUserIDParam,
  validateProjectIDParam,
  validateUserMetricParams,
} = require("../validators/projectMetricValidator");

// CRUD routes for project metrics
router.post(
  "/",
  authenticateToken,
  validateCreateProjectMetric,
  createProjectMetric
);

router.get("/", authenticateToken, getProjectMetrics);

router.get("/:id", authenticateToken, validateUUIDParam, getProjectMetricById);

router.put(
  "/:id",
  authenticateToken,
  validateUUIDParam,
  validateUpdateProjectMetric,
  updateProjectMetric
);

router.delete(
  "/:id",
  authenticateToken,
  validateUUIDParam,
  deleteProjectMetric
);

// User metric assignment routes
router.post(
  "/users/:user_id/assign-metrics",
  authenticateToken,
  validateUserIDParam,
  validateAssignMetricsToUser,
  assignMetricsToUser
);

router.delete(
  "/users/:user_id/remove-metrics",
  authenticateToken,
  validateUserIDParam,
  validateRemoveMetrics,
  removeMetricsFromUser
);

router.get(
  "/users/:user_id/metrics",
  authenticateToken,
  validateUserIDParam,
  getUserMetrics
);
// project-metrics/users/50027b46-6d93-4ace-8162-a1e553ca5a3e/metrics
// getUsersByMetricId
router.get(
  "/metrics/:metric_id",
  authenticateToken,
  getUsersByMetricId
);


// Project metric assignment routes
router.post(
  "/projects/:project_id/assign-metrics",
  authenticateToken,
  validateProjectIDParam,
  validateAssignMetricsToProject,
  assignMetricsToProject
);

router.delete(
  "/projects/:project_id/remove-metrics",
  authenticateToken,
  validateProjectIDParam,
  validateRemoveMetrics,
  removeMetricsFromProject
);

router.get(
  "/projects/:project_id/metrics",
  authenticateToken,
  validateProjectIDParam,
  getProjectProjectMetrics
);

// User metric value management
router.patch(
  "/users/:user_id/metrics/:metric_id/value",
  authenticateToken,
  validateUserMetricParams,
  validateUpdateUserMetricValue,
  updateUserMetricValue
);

module.exports = router;
